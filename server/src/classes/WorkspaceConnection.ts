import WebSocket, { RawData, WebSocketServer } from "ws";
import axios from 'axios';
import Agent from "../models/Agent";
import WebSocketObject from "./Socket";

class WorkspaceConnection {
    ws: WebSocket;
    agentID: string;
    uniqueID: string;
    promptrunning: boolean;
    parent: WebSocketObject;

    constructor(ws: WebSocket, agentID: string, uniqueID: string, promptrunning : boolean, parent : WebSocketObject) {
        this.ws = ws;
        this.agentID = agentID;
        this.uniqueID = uniqueID;
        this.parent = parent;
        this.promptrunning = promptrunning;
    }

    getPromptRunning() : boolean {
        return this.promptrunning;
    }

    setPromptRunning(promptrunning : boolean) : void {
        this.parent.sendMessageToAllNeighborClients(this.agentID, 'config', {promptRunning: promptrunning});
        this.promptrunning = promptrunning;
    }

    async handleMessage(message : any) : Promise<void> {
        this.parent.sendMessageToAllNeighborClients(this.agentID, 'workspaceStatus', message);
    }

    async handleClose() {
        this.parent.closeConnection(this.agentID);
    }
}

export default WorkspaceConnection;