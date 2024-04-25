if (process.env.NODE_ENV !== "production") {
    require('dotenv').config();
}
import catchAsync from '../methods/catchAsync';
import express, { Response, NextFunction, Request } from 'express';
import { RequestWithUser } from '../types/apiTypes';
import { AgentManagerClass } from '../app';
import { Authenticate } from '../methods/middleware';
import Agent from '../models/Agent';
import { sendEmail } from '../methods/helpers';
const AgentRouter = express.Router();

AgentRouter.get('/getAgent', catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { workspaceId, streamingLink } = await AgentManagerClass.getAgent();
    res.status(200).send({ workspaceId, streamingLink });
}));


AgentRouter.get('/getUsersAgent', Authenticate, catchAsync(async (req: RequestWithUser, res: Response, next: NextFunction) => {
    const user = req.user;

    if (user.agentIDs.length === 0) {
        const { streamingLink, _id } = await AgentManagerClass.getAgent();
        user.agentIDs.push(_id.toString());
        await user.save();

        //set the agent userID to the user by using findByIdAndUpdate
        const agent = await Agent.findByIdAndUpdate(_id, { userId: user._id });
        await agent.save();

        res.status(200).send({agents: [{ agentID: _id.toString(), streamingLink }]});
        return;
    }
    const agents = []
    for (let id of user.agentIDs) {
        const agent = await Agent.findById(id);
        agents.push({agentID: id, streamingLink: agent.streamingLink})
    }
    res.status(200).send({ agents });
}));

AgentRouter.get('/addAgent', Authenticate, catchAsync(async (req: RequestWithUser, res: Response, next: NextFunction) => {
    const user = req.user;

    //for each agentID in user.agentIDs make an array of agents with their agentID and streamingLink
    const agents = []
    for (let id of user.agentIDs) {
        const agent = await Agent.findById(id);
        agents.push({agentID: id, streamingLink: agent.streamingLink})
    }

    var streamingLink = undefined;
    var _id = undefined;
    try {
        const res = await AgentManagerClass.getAgent();
        streamingLink = res.streamingLink;
        _id = res._id;
    } catch (error) {
        res.status(400).send({ message: "No available agents" });
        return;
    }
    user.agentIDs.push(_id.toString());
    await user.save();

    //set the agent userID to the user by using findByIdAndUpdate
    const agent = await Agent.findByIdAndUpdate(_id, { userId: user._id });
    await agent.save();

    agents.push({ agentID: _id.toString(), streamingLink });
    res.status(200).send({ agents });
}));


AgentRouter.post('/requestAgent', Authenticate, catchAsync(async (req: RequestWithUser, res: Response, next: NextFunction) => {
    const { reason } = req.body;
    if (!reason) {
        res.status(400).send({ message: "Reason is required" });
        return;
    }
    const user = req.user;
    console.log('')
    console.log('🔮 Requesting agent 🔮');
    console.log(reason);
    console.log(user.email);
    console.log(user._id);
    const contactMessage = `User: ${user.email} with ID: ${user._id.toString()} has requested an agent for the following reason: "${reason}"`;
    sendEmail(process.env.MY_EMAIL, 'Radah Agent Request', contactMessage, process.env.MY_EMAIL, process.env.MY_PASSWORD);
    sendEmail("gautamsharda001@gmail.com", 'Radah Agent Request', contactMessage, process.env.MY_EMAIL, process.env.MY_PASSWORD);
    res.status(200).send({ message: "Request sent" });
}));


//get endpoint with id in query param. Get all messages from the agent and return them
AgentRouter.get('/getMessages', Authenticate, catchAsync(async (req: RequestWithUser, res: Response, next: NextFunction) => {
    const { agentID } = req.query;
    if (!agentID) {
        res.status(400).send({ message: "Agent ID is required" });
        return;
    }
    //todo: make sure the agentID belongs to the user
    const agent = await Agent.findById(agentID);
    if (!agent) {
        res.status(400).send({ message: "Agent not found" });
        return;
    }
    res.status(200).send({ messages: agent.messages || [] });
}));


export default AgentRouter;