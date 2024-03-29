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

        res.status(200).send({ agentID: _id.toString(), streamingLink });
        return;
    }

    const agentID = user.agentIDs[0];
    const agent = await Agent.findById(agentID);
    res.status(200).send({ agentID : agent._id.toString(), streamingLink : agent.streamingLink });
}));



export default AgentRouter;