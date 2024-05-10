if (process.env.NODE_ENV !== "production") {
    require('dotenv').config();
}
import catchAsync from '../methods/catchAsync';
import express, { Response, NextFunction, Request } from 'express';
import { websockObject } from '../app';

const WorkspaceRouter = express.Router();


WorkspaceRouter.get('/promptComplete/:agentID',  catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    console.log('we have reached the promptComplete route');
    const agentID = req.params.agentID;
    console.log(agentID);

    if (!websockObject) return res.status(400).send({ message: 'Websocket not initialized' });

    websockObject.setPromptRunningThroughChild(agentID, false);

    res.status(200).send({ message: 'Account Created' });
}));

export default WorkspaceRouter;