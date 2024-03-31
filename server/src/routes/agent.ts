if (process.env.NODE_ENV !== "production") {
    require('dotenv').config();
}
import catchAsync from '../methods/catchAsync';
import express, { Response, NextFunction, Request } from 'express';
import { RequestWithUser } from '../types/apiTypes';
import { AgentManagerClass } from '../app';
import { Authenticate } from '../methods/middleware';
import Agent from '../models/Agent';
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



export default AgentRouter;