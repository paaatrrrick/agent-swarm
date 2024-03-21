import { createWorkspace, deleteWorkspace } from "../methods/aws";
import Agent from "../models/Agent";
import { AgentType } from "../types/models";
import { Types } from "mongoose";

const AVAILABLE_AGENT_STACK_SIZE = 2;

class AgentManager {
    availableAgentIDsStack: string[];

    constructor() {
        this.availableAgentIDsStack = [];
    }

    async init() : Promise<void> {
        console.log('💪 Initializing agent manager')
        const agents = await Agent.find({inUse: false});
        for (const agent of agents) {
            this.availableAgentIDsStack.push(agent._id.toString());
        }

        /* while availableAgentIDsStack.length < AVAILABLE_AGENT_STACK_SIZE, create new agent */
        while (this.availableAgentIDsStack.length < AVAILABLE_AGENT_STACK_SIZE) {
            const agentID = await this.createAgent();
            if (agentID === '') {
                break;
            }
            this.availableAgentIDsStack.push(agentID);
        }
        console.log('🤖 There are ', this.availableAgentIDsStack.length.toString(), ' Available Agents');
        return
    }

    async createAgent() : Promise<string> {
        const agent = new Agent();
        await agent.save();
        try {
            const { workspaceId, streamingLink } = await createWorkspace();
            agent.workspaceId = workspaceId;
            agent.streamingLink = streamingLink;
            await agent.save();
        } catch (error) {
            //findByIdAndDelete
            await Agent.findByIdAndDelete(agent._id);
            return '';
        }
        return agent._id.toString();
    }

    async getAgent() : Promise<AgentType & {_id : Types.ObjectId}> {
        if (this.availableAgentIDsStack.length === 0) {
            const agentID = await this.createAgent();
            if (agentID === '') {
                throw new Error('Unable to get an agent');
            }
            this.availableAgentIDsStack.push(agentID);
        }

        const finalAgentID = this.availableAgentIDsStack.pop();
        const agent = await Agent.findById(finalAgentID);
        agent.inUse = true;
        await agent.save();

        return agent;
    }
}



export default AgentManager;