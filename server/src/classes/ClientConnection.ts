import WebSocket, { RawData, WebSocketServer } from "ws";
import axios from 'axios';
import Agent from "../models/Agent";
import WebSocketObject from "./Socket";
import WorkspaceConnection from "./WorkspaceConnection";

class ClientConnection {
    ws: WebSocket;
    agentID: string;
    uniqueID: string;
    parent : WebSocketObject;

    constructor(ws: WebSocket, agentID: string, uniqueID : string, parent : WebSocketObject) {
        this.ws = ws;
        this.agentID = agentID;
        this.uniqueID = uniqueID;
        this.parent = parent;
    }

    async talkToagent(message : string) : Promise<string> {
        try {
            console.log(message);
            const agent = await Agent.findById(this.agentID);
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

    async handleMessage(data : any) : Promise<void> {
        const { type } = data;
        if (type === 'message') {
            const { message } = data;
            const workspace : WorkspaceConnection | undefined = this.parent.getWorkspaceConnection(this.agentID);
            if (!workspace) {
                this.sendMessage('error', {message: 'workspace not found'});
                return;
            }

            const promptRunning = workspace.getPromptRunning();

            if (promptRunning) {
                this.sendMessage('error',  {message:'prompt already running'});
                return;
            }

            workspace.setPromptRunning(true);
    
            const res = await this.talkToagent(message);    
            
            workspace.setPromptRunning(false);

            this.parent.sendMessageToAllNeighborClients(this.agentID, 'message', {response: res});
        }
    }

    async sendMessage(type: string, message : any) : Promise<void> {
        try {
            this.ws.send(JSON.stringify({type: type, ...message}));
        } catch (error) {
        }
    }

    async handleClose() {
        this.parent.closeConnection(this.uniqueID);
    }
}


export default ClientConnection;