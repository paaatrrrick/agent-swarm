import WebSocket from "ws";
import WebSocketObject from "./Socket";
import axios from 'axios';
import Agent from "../models/Agent";

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

    init() {
        this.parent.sendMessageToAllNeighborClients(this.agentID, 'config', {promptRunning: false, workspaceConnection : true, successAlert: true});   
    }

    getPromptRunning() : boolean {
        return this.promptrunning;
    }

    setPromptRunning(promptrunning : boolean) : void {
        if (promptrunning === this.promptrunning) return;
        this.parent.sendMessageToAllNeighborClients(this.agentID, 'config', {promptRunning: promptrunning, workspaceConnection : true});
        this.promptrunning = promptrunning;
    }

    async handleMessage(message : any) : Promise<void> {
        const agent = await Agent.findById(this.agentID);
        if (message.sender && message.sender === 'client') {
            this.parent.sendMessageToAllNeighborClients(this.agentID, 'workspaceStatus', {payload : message.payload});

            //concat message.payload to agent.messages
            if (agent) {
                agent.messages = agent.messages.concat(message.payload);
                await agent.save();
            }

            return;
        }
        this.parent.sendMessageToAllNeighborClients(this.agentID, 'workspaceStatus', {payload : [message]});
        if (agent) {
            agent.messages = agent.messages.concat([message]);
            await agent.save();
        }

    }

    async handleClose() {
        this.parent.sendMessageToAllNeighborClients(this.agentID, 'config', {promptRunning: this.promptrunning, workspaceConnection : false});
        this.parent.closeConnection(this.uniqueID);
    }


    async handleTerminate() : Promise<void> {
        try {
            console.log('terminating in workspace connection');
            const agent = await Agent.findById(this.agentID);
            if (!agent) return;
            console.log(this.agentID);
    
            const url : string = `${agent.ipAddress}/stop`;
            this.setPromptRunning(false);
            const res = await axios.get(url, {headers: {'Content-Type': 'application/json'}});
            
            if (res.status !== 200) return;
            return res.data;

        } catch (error) {
            console.log(error);
            console.log('internal error at workspace connection on terminate');
            return;
        }
    }

    async talkToagent(message : string) : Promise<string> {
        console.log('talking to agent in workspace connection top')
        try {
            console.log('talking to agent in workspace connection');
            console.log(message);
            const agent = await Agent.findById(this.agentID);
            if (!agent) return "agent not found";
    
            const url : string = `${agent.ipAddress}/message`;
            const data = {message: message, first: 0}
            console.log(message);
            console.log(url);
            const res = await axios.post(url, data, {headers: {'Content-Type': 'application/json'}});
            this.setPromptRunning(false);
            if (res.status !== 200) return "error";
            return res.data;

        } catch (error) {
            console.log(error);
            console.log('internal error at workspace connection on talk to agent');
            return " internal error at";
        }
    }
}

export default WorkspaceConnection;