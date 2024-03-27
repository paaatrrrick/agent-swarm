import { createWorkspace, deleteWorkspace } from "../methods/aws";
import Agent from "../models/Agent";
import { AgentType } from "../types/models";
import { Types } from "mongoose";

class AgentManager {
    availableAgentSet: Set<string>;

    constructor() {
        this.availableAgentSet = new Set();
    }

    async init() : Promise<void> {
        const agents = await Agent.find({inUse: false, complete: true});
        for (const agent of agents) {
            this.availableAgentSet.add(agent._id.toString());
        }
        console.log('🤖 There are', this.availableAgentSet.size.toString(), 'Available Agents');
        return
    }

    async getAgent() : Promise<AgentType & {_id : Types.ObjectId}> {
        if (this.availableAgentSet.size === 0) {
                await this.init();
                if (this.availableAgentSet.size === 0) {
                    throw new Error('No available agents');
                }
        }
        
        const finalAgentID = this.availableAgentSet.values().next().value;
        this.availableAgentSet.delete(finalAgentID);
        const agent = await Agent.findById(finalAgentID);
        agent.inUse = true;
        await agent.save();

        return agent;
    }
}



export default AgentManager;