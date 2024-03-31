import WebSocket, { RawData, WebSocketServer } from "ws";
import axios from 'axios';
import Agent from "../models/Agent";


interface agentIDMetadata {
    uniqueIDs: string[];
    promptRunning: boolean;
}

interface uniqueIDMetadata {
    agentID: string;
    ws: WebSocket;
}

class WebSocketObject {
    wss: WebSocketServer;
    agentIDMap: Map<string, agentIDMetadata> = new Map();
    uniqueIDMap: Map<string, uniqueIDMetadata> = new Map();

    constructor(server: any) {
        this.wss = new WebSocketServer({ server });
        this.agentIDMap = new Map();
        this.uniqueIDMap = new Map();
    }

    init() {
        this.wss.on('connection', ws => {
            console.log('connection');
            const uniqueID = Math.random().toString(36).substring(7);
            ws.on('message', (message) => {this.handleMessage(message, ws, uniqueID)});
            ws.on('close', () => {this.handleClose(uniqueID)});
        });
    }

    async handleMessage(message : RawData, ws : WebSocket, uniqueID : string) : Promise<void> {
        try {
            const data = JSON.parse(message.toString());
            const type = data.type;
    
            if (type === 'config') {
                const agentID = data.agentID;
                this.uniqueIDMap.set(uniqueID, {agentID, ws});
                if (this.agentIDMap.has(agentID)) {
                    this.agentIDMap.get(agentID).uniqueIDs.push(uniqueID);
                } else {
                    this.agentIDMap.set(agentID, {uniqueIDs: [uniqueID], promptRunning: false});
                }
                this.sendMessageWithUniqueID(uniqueID, JSON.stringify({type: "config", ...this.agentIDMap.get(agentID)}));
    
            } else if (type === 'message') {
                
                const { message } = data;
                const { agentID } = this.uniqueIDMap.get(uniqueID);
    
                this.agentIDMap.get(agentID).promptRunning = true;
                this.sendMessageWithagentID(agentID, JSON.stringify({type: "config", ...this.agentIDMap.get(agentID)}));
    
                const res = await this.talkToagent(agentID, message)
    
                //set promptRunning to false
                this.agentIDMap.get(agentID).promptRunning = false;
                this.sendMessageWithagentID(agentID, JSON.stringify({type: "message", response: res}));
            }
        } catch (error) {
            console.log(error);
        }
    }

    async handleClose(uniqueID : string) : Promise<void> {
        try {
            const { agentID } = this.uniqueIDMap.get(uniqueID);
            this.uniqueIDMap.delete(uniqueID);
            const agent = this.agentIDMap.get(agentID);
            agent.uniqueIDs = agent.uniqueIDs.filter(id => id !== uniqueID);
            if (agent.uniqueIDs.length === 0) {
                this.agentIDMap.delete(agentID);
            }
        } catch (error) {
            console.log(error);
        }
    }

    async sendMessageWithagentID(agentID : string, message : string) : Promise<void> {
        try {
            const agent = this.agentIDMap.get(agentID);
            if (agent) {
                agent.uniqueIDs.forEach(id => {
                    this.uniqueIDMap.get(id).ws.send(message);
                });
            }
        } catch (error) {
            console.log(error);
        }

    }

    async sendMessageWithUniqueID(uniqueID : string, message : string) : Promise<void> {
        try {
            const ws = this.uniqueIDMap.get(uniqueID).ws;
            ws.send(message);
        } catch (error) {
        }
    }

    async talkToagent(agentID : string, message : string) : Promise<string> {
        try {
            console.log(message);
            const agent = await Agent.findById(agentID);
            if (!agent) return "agent not found";
    
            const url : string = `${agent.ipAddress}/message`;
            const data = {message: message, first: 1}
            console.log(message);
            const res = await axios.post(url, data, {headers: {'Content-Type': 'application/json'}});
            if (res.status !== 200) return "error";
            return res.data;

        } catch (error) {
            return " internal error";
        }

    }
}


export default WebSocketObject;