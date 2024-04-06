if (process.env.NODE_ENV !== "production") {
    require('dotenv').config();
}
import express, { Request, Response, NextFunction, ErrorRequestHandler } from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import cookieParser from "cookie-parser";
import mongoose from 'mongoose';
import AuthRouter from './routes/auth';
import AgentManager from './classes/AgentManager';
import AgentRouter from './routes/agent';

import WebSocketObject from './classes/Socket';
import { manualProcess } from './methods/manualProcess';


const AgentManagerClass : AgentManager = new AgentManager();


let websockObject = null;


export default class Api {
    private port: number;
    private dbUrl: string;
    private clientUrl: string;
    constructor(port: number, dbUrl: string, clientUrl: string) {
        this.port = port;
        this.dbUrl = dbUrl;
        this.clientUrl = clientUrl;
    }


    error(): ErrorRequestHandler {
        return (err: Error, req: Request, res: Response, next: NextFunction) => {
            console.log('---at error handler---');
            //Hit up Splunk or some other logging service here 💥
            console.error(err);
            res.status(500).send({ error: err.message });
        }
    }


    start(): void {
        mongoose.set('strictQuery', true);
        mongoose.connect(this.dbUrl, {
            //@ts-ignore
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });

        const db = mongoose.connection;
        db.on("error", console.error.bind(console, "connection error:"));
        db.once("open", () => {
            console.log("🍌 Mongo connection successful");
            //GAUTAM DO THE FOLLOWING HERE (the id is correct but the streaming link and ip address are not correct)
            //manualProcess({streamingLink: "http://66.175.210.176/hls/teststream.m3u8", ipAddress: "http://35.175.17.101:8000", completed: true, workspaceId: "THIS_IS_A_TEST_AGENT"});
            //put the streaming link and ip address in that format

            AgentManagerClass.init();
        });

        const app = express();
        app.use(bodyParser.json(), bodyParser.urlencoded({ extended: false }))
        app.use(cors({credentials: true, origin: '*'}));
        app.use(cookieParser());
        app.use(`/auth`, AuthRouter);
        app.use(`/agent`, AgentRouter);
        app.use(this.error());

        let PORT: number | string = process.env.PORT;
        if (PORT == null || PORT == "") {
            PORT = this.port;
        }
        const server = app.listen(PORT, () => {
            console.log(`🥑 We're live on port ${PORT}`);
        });

        websockObject = new WebSocketObject(server);
        websockObject.init();
    }
}


export { AgentManagerClass, websockObject };
