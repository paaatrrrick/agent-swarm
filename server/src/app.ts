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
import WorkspaceRouter from './routes/workspace';


const AgentManagerClass : AgentManager = new AgentManager();


let websockObject : WebSocketObject | null = null;


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
            // 54.145.117.213	https://stream4.radah.ai
            // manualProcess({streamingLink: "https://stream4.radah.ai/hls.teststream.m3u8", ipAddress: "http://54.145.117.213:8000", completed: true});
            // // 52.0.175.119	https://stream5.radah.ai
            // manualProcess({streamingLink: "https://stream5.radah.ai/hls.teststream.m3u8", ipAddress: "http://52.0.175.119:8000", completed: true});
            // // 54.225.198.211	https://stream6.radah.ai
            // manualProcess({streamingLink: "https://stream6.radah.ai/hls.teststream.m3u8", ipAddress: "http://54.225.198.211:8000", completed: true});
            // // 34.225.162.161	https://stream7.radah.ai
            // manualProcess({streamingLink: "https://stream7.radah.ai/hls.teststream.m3u8", ipAddress: "http://34.225.162.161:8000", completed: true});
            // // 44.223.205.96	https://stream8.radah.ai
            // manualProcess({streamingLink: "https://stream8.radah.ai/hls.teststream.m3u8", ipAddress: "http://44.223.205.96:8000", completed: true});
            // // 100.27.138.164	https://stream9.radah.ai
            // manualProcess({streamingLink: "https://stream9.radah.ai/hls.teststream.m3u8", ipAddress: "http://100.27.138.164:8000", completed: true});
            // // 172.16.0.87	https://stream10.radah.ai
            // manualProcess({streamingLink: "https://stream10.radah.ai/hls.teststream.m3u8", ipAddress: "http://172.16.0.87:8000", completed: true});
            // // 34.206.19.33	https://stream11.radah.ai
            // manualProcess({streamingLink: "https://stream11.radah.ai/hls.teststream.m3u8", ipAddress: "http://34.206.19.33:8000", completed: true});
            // // 18.204.239.49	https://stream12.radah.ai
            // manualProcess({streamingLink: "https://stream12.radah.ai/hls.teststream.m3u8", ipAddress: "http://18.204.239.49:8000", completed: true});

            AgentManagerClass.init();
        });

        const app = express();
        app.use(bodyParser.json(), bodyParser.urlencoded({ extended: false }))
        app.use(cors({credentials: true, origin: '*'}));
        app.use(cookieParser());
        app.use(`/auth`, AuthRouter);
        app.use(`/agent`, AgentRouter);
        app.use('/workspace', WorkspaceRouter);
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
