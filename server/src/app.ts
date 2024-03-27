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
import { createWorkspace } from './methods/aws';
import { Server as WebSocketServer } from 'ws'; // Import WebSocketServer
import { manualProcess } from './methods/manualProcess';


const AgentManagerClass : AgentManager = new AgentManager();


let sendMessageFunction = null;


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
            //AgentManagerClass.init();
        });

        // createWorkspace();
        const app = express();
        app.use(bodyParser.json(), bodyParser.urlencoded({ extended: false }))
        app.use(cors({credentials: true, origin: this.clientUrl}));
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
            //manualProcess({id: '66039df5a8738d00a5260365', ipAddress: "172.16.0.93"});
        });

        const wss = new WebSocketServer({ server });

        // WebSocket server setup
    
        wss.on('connection', ws => {
            console.log('WebSocket client connected');

            sendMessageFunction = (message : string) => {
                console.log('at new and improved sendMessageFunction');
                ws.send(message);
            }

            ws.on('message', message => {
                console.log(`Received message => ${message}`);
                ws.send(`Hello, you sent -> ${message}`);
            });
            ws.on('close', () => {
                console.log('WebSocket client disconnected');
            });
        });
    }
}


export { AgentManagerClass, sendMessageFunction };
