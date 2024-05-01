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
        console.log('at handle message in workspace')
        console.log(this.agentID);
        console.log(message);
        const agent = await Agent.findById(this.agentID);
        console.log('made it passed this')
        if (message.sender && message.sender === 'client') {
            this.parent.sendMessageToAllNeighborClients(this.agentID, 'workspaceStatus', {payload : message.payload});

            //concat message.payload to agent.messages
            if (agent) await agent.updateOne({$push: {messages: message}});
            return;
        }

        if (message.type && message.type === 'done') {
            console.log('done message')
            this.setPromptRunning(false);
            return
        }

        this.parent.sendMessageToAllNeighborClients(this.agentID, 'workspaceStatus', {payload : [message]});
        if (agent) {
            //agent.messages = agent.messages.concat([message]);
            await agent.updateOne({$push: {messages: message}});
        }

    }

    async handleClose() {
        this.parent.sendMessageToAllNeighborClients(this.agentID, 'config', {promptRunning: this.promptrunning, workspaceConnection : false});
        this.parent.closeConnection(this.uniqueID);
    }


    async handleTerminate() : Promise<void> {
        try {
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
        try {
            const agent = await Agent.findById(this.agentID);
            if (!agent) return "agent not found";
    
            const url : string = `${agent.ipAddress}/message`;
            const data = {message: message, first: 0}
            await axios.post(url, data, {headers: {'Content-Type': 'application/json'}});
            return
            // this.setPromptRunning(false);
            // if (res.status !== 200) return "error";
            // return res.data;

        } catch (error) {
            console.log(error);
            console.log('internal error at workspace connection on talk to agent');
            return " internal error at";
        }
    }
}

export default WorkspaceConnection;