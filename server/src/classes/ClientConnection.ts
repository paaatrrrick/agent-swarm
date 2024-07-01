import WebSocket from "ws";
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
        console.log('')
        console.log('handle message in client connection');
        if (type === 'prompt') return await this.handlePromptMessage(data);
        if (type === 'terminate') return await this.handleTerminate();
    }

    async handleTerminate() : Promise<void> {
        const workspace = this.parent.getWorkspaceConnection(this.agentID);
        if (!workspace) return;
        workspace.handleMessage({"sender": "client", "payload" : [{ "role": "stop", start: true, end: true}]})
        return await workspace.handleTerminate();
    }

    async sendMessage(type: string, message : any) : Promise<void> {
        try {
            this.ws.send(JSON.stringify({...message, type: type}));
        } catch (error) {
        }
    }

    async handleClose() {
        this.parent.closeConnection(this.uniqueID);
    }

    //websocket message handlers
    async handlePromptMessage(data : any) : Promise<void> {
        const message : string = data.message;
        const workspace : WorkspaceConnection | undefined = this.parent.getWorkspaceConnection(this.agentID);
        if (!workspace) {
            this.sendMessage('error', {message: 'There is no workspace connection found', secondaryMessage: 'Please contact gautamsharda001@gmail.com'});
            return;
        }

        const promptRunning = workspace.getPromptRunning();

        if (promptRunning === "true") {
            this.sendMessage('error',  {message:'You already have a prompt running for this agent'});
            return;
        }

        workspace.setPromptRunning("true");
        this.parent.getWorkspaceConnection(this.agentID)?.handleMessage({"sender": "client", 
        "payload" : [
            { "role": "user", "type": "message", start: true },
            { "role": "user", "type": "message", "content": message },
            { "role": "user", "type": "message", end: true },
        ]})
        console.log('from client connection, we have sent a message to workspace connection ' + message)
        //const response = await this.parent.getWorkspaceConnection(this.agentID)?.talkToagent(message);    
        this.parent.getWorkspaceConnection(this.agentID)?.talkToagent(message);    
        //console.log('we have gotten a response from talk to agent in hadnle message');
        
        //Add this back if we have the done endpoint
        //workspace.setPromptRunning(false);
    }
}


export default ClientConnection;