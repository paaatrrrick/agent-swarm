import { Document, Types } from "mongoose";
import Agent from "../models/Agent";
import { AgentType } from "../types/models";
import request from 'axios';

interface AgentTypeNew {
    workspaceId?: string,
    userId?: string,
    streamingLink?: string,
    directoryId?: string,
    bundleId?: string,
    id?: string,
    completed: boolean,
}

type manualProcessRes = Document<unknown, {}, AgentType> & AgentType & {_id: Types.ObjectId;}

async function manualProcess(params : AgentTypeNew) : Promise<manualProcessRes> {
    const { workspaceId, userId, streamingLink, directoryId, bundleId, id, completed } = params;
    if (id) {
        const agent = await Agent.findById(id);
        if (!agent) throw new Error('Agent not found');
        agent.workspaceId = workspaceId || agent.workspaceId;
        agent.userId = userId || agent.userId;
        agent.streamingLink = streamingLink || agent.streamingLink;
        agent.directoryId = directoryId || agent.directoryId;
        agent.bundleId = bundleId || agent.bundleId;
        agent.complete = completed || agent.complete;
        await agent.save();
        console.log('🤖 Agent updated');
        console.log(agent);
        return agent;
    }
    const agent = new Agent();
    agent.workspaceId = workspaceId || '';
    agent.userId = userId || '';
    agent.streamingLink = streamingLink || '';
    agent.directoryId = directoryId || '';
    agent.bundleId = bundleId || '';
    agent.complete = completed || false;
    await agent.save();
    console.log('🤖 New agent created');
    console.log(agent);
    return agent;
}


async function hitLogin(ipAddress : string, userName: string, password : string) : Promise<void> {
    console.log('🤖', ipAddress, 'hit the login endpoint');
    try {
        const res = await request.get(`${ipAddress}/login`);
        console.log('🤖 Login endpoint hit');
    } catch (error) {
        console.error('🤖 Error hitting login endpoint');
        console.error(error);
    }
    return;
}

export { manualProcess, hitLogin };
