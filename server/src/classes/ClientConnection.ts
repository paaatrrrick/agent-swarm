import WebSocket from "ws";
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


    async handleMessage(data : any) : Promise<void> {
        const { type } = data;
        if (type === 'prompt') return await this.handlePromptMessage(data);
        if (type === 'terminate') return await this.parent.getWorkspaceConnection(this.agentID)?.handleTerminate();
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

    //websocket message handlers
    async handlePromptMessage(data : any) : Promise<void> {
        const { message } = data;
        const workspace : WorkspaceConnection | undefined = this.parent.getWorkspaceConnection(this.agentID);
        if (!workspace) {
            this.sendMessage('error', {message: 'There is no workspace connection found', secondaryMessage: 'Please contact gautamsharda001@gmail.com'});
            return;
        }

        const promptRunning = workspace.getPromptRunning();

        if (promptRunning) {
            this.sendMessage('error',  {message:'You already have a prompt running for this agent'});
            return;
        }

        workspace.setPromptRunning(true);

        const res = await this.parent.getWorkspaceConnection(this.agentID)?.talkToagent(message);    
        
        if (workspace.getPromptRunning() === false) return;

        workspace.setPromptRunning(false);

        this.parent.sendMessageToAllNeighborClients(this.agentID, 'message', {response: res});
    }
}


export default ClientConnection;