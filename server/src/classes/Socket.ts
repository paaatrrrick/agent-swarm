import WebSocket, { RawData, WebSocketServer } from "ws";
import Agent from "../models/Agent";
import WorkspaceConnection from "./WorkspaceConnection";
import ClientConnection from "./ClientConnection";

type connectionType =  "client" | "workspace";

// type role = 'user' | 'assistant' | 'computer';
// type type = "message" | "code" | "console";
// type format = 'python' | "output" | "active_line" | string;


interface AgentMessage {
    role?: string;
    type?: string;
    format?: string;
    content?: string;
    start? : string
    end? : string
    completed? : boolean
}


interface uniqueIDMetadata {
    type: connectionType;
    //if type is client then class is ClientConnection else WorkspaceConnection
    connectionManager: ClientConnection | WorkspaceConnection;
}

interface threeWayHandshake {
    clientUniqueID: string[];
    workspaceUniqueID?: string;
    promptRunning: boolean;
    messageStack: AgentMessage | undefined;
}



class WebSocketObject {
    wss: WebSocketServer;
    agentIDMap: Map<string, threeWayHandshake> = new Map();
    uniqueIDMap: Map<string, uniqueIDMetadata> = new Map();

    constructor(server: any) {
        this.wss = new WebSocketServer({ server });
        this.agentIDMap = new Map();
        this.uniqueIDMap = new Map();
    }

    init() {
        this.wss.on('connection', ws => {
            console.log('new connection');
            const uniqueID = Math.random().toString(36).substring(7);
            ws.on('message', (message) => {this.handleMessage(message, ws, uniqueID)});
            ws.on('close', () => {this.handleClose(uniqueID)});
        });
    }



    async addToMessageStack(agentID : string, incoming : AgentMessage) : Promise<void> {
        const agent = this.agentIDMap.get(agentID);
        if (!agent) return;
        // console.log('\n adding to messages stack\n incoming:')
        // console.log(incoming)
        // console.log('current message stack: ');
        // console.log(agent.messageStack);
        if (incoming.start) {
            if (agent.messageStack !== undefined) await Agent.findByIdAndUpdate(agentID, {$push: {messages: agent.messageStack}});
            //delete start from incoming
            delete incoming.start
            incoming.content = "";
            agent.messageStack = incoming;
            // console.log('\nnew message stack s\n');

        } else if (agent.messageStack === undefined && !incoming.end) {
            agent.messageStack = incoming;
            // console.log('\nnew message stack 2\n');

        } else if (incoming.content) {
            agent.messageStack.content += incoming.content;
            // console.log('\nnew message stack 3\n');
        }

        if (incoming.end) {
            await Agent.findByIdAndUpdate(agentID, {$push: {messages: agent.messageStack}});
            agent.messageStack = undefined;
        }
        console.log(agent.messageStack)
    }

    async handleMessage(message : RawData, ws : WebSocket, uniqueID : string) : Promise<void> {
        try {
            const data = JSON.parse(message.toString());
            console.log('\nincoming message\n'); 
            console.log(data.content);
    
            if (data.type === 'config') {
                const agent = await Agent.findById(data.agentID);
                if (!agent) {
                    ws.send(JSON.stringify({type: 'error', message: 'agent not found'}));
                    return;
                }
                if (!this.agentIDMap.get(data.agentID)) this.agentIDMap.set(data.agentID, {clientUniqueID: [], promptRunning: false, messageStack: undefined});
                if (data.connectionType === "client") this.addClientConnection(data.agentID, ws, uniqueID);
                if (data.connectionType === "workspace") this.addWorkspaceConnection(data.agentID, ws, uniqueID);
                return;
            }
            this.uniqueIDMap.get(uniqueID)?.connectionManager?.handleMessage(data);
        } catch (error) {
            console.log('error in handle message in socket.ts');
        }
    }

    addWorkspaceConnection(agentID : string, ws : WebSocket, uniqueID : string) {
        const workspaceConnection = new WorkspaceConnection(ws, agentID, uniqueID, this);
        this.uniqueIDMap.set(uniqueID, {type: "workspace", connectionManager: workspaceConnection});
        this.agentIDMap.get(agentID).workspaceUniqueID = uniqueID;
        workspaceConnection.init();
    }


    addClientConnection(agentID : string, ws : WebSocket, uniqueID : string) {
        const clientConnection = new ClientConnection(ws, agentID, uniqueID, this);
        this.uniqueIDMap.set(uniqueID, {type: "client", connectionManager: clientConnection});
        this.agentIDMap.get(agentID).clientUniqueID.push(uniqueID);
        const workspaceConnection = this.getWorkspaceConnection(agentID);
        if (!workspaceConnection) {
            clientConnection.sendMessage("config", {promptRunning: false, workspaceConnection: false});
            return;
        }
        const promptRunning = workspaceConnection.getPromptRunning() || false;
        clientConnection.sendMessage("config", {promptRunning: promptRunning, workspaceConnection: true});
    }


    getClientConnections(agentID: string) : ClientConnection[] {
        return this.agentIDMap.get(agentID)?.clientUniqueID.map(uniqueID => {
            return this.uniqueIDMap.get(uniqueID)?.connectionManager as ClientConnection;
        });
    }

    getWorkspaceConnection(agentID: string) : WorkspaceConnection | undefined { 
        return this.agentIDMap.get(agentID)?.workspaceUniqueID ? this.uniqueIDMap.get(this.agentIDMap.get(agentID)?.workspaceUniqueID as string)?.connectionManager as WorkspaceConnection : undefined;
    }

    sendMessageToAllNeighborClients(agentID : string, type : string, message : any) {
        const clientConnections = this.getClientConnections(agentID) || [];
        clientConnections.forEach(clientConnection => {
            //message get unwrapped in sendMessage
            clientConnection.sendMessage(type, message);
        });
}

    async handleClose(uniqueID : string) : Promise<void> {
        console.log('closing out a connection: ' + uniqueID);
        this.uniqueIDMap.get(uniqueID)?.connectionManager?.handleClose();
    }


    getPromptRunning(agentID : string) : boolean {
        return this.agentIDMap.get(agentID)?.promptRunning;
    }

    setPromptRunning(agentID : string, promptRunning : boolean) : void {
        if (this.getPromptRunning(agentID) === promptRunning) return;
        const agent = this.agentIDMap.get(agentID);
        if (agent) agent.promptRunning = promptRunning;
    }

    setPromptRunningThroughChild(agentID : string, promptRunning : boolean) : void {
        const workspace = this.getWorkspaceConnection(agentID);
        if (!workspace) return;
        workspace.setPromptRunning(promptRunning);
    }

    async closeConnection(uniqueID : string) : Promise<void> {
        const connectionManager = this.uniqueIDMap.get(uniqueID)?.connectionManager;
        if (!connectionManager) return;

        const agentID = connectionManager.agentID;

        // if (!this.agentIDMap.get(agentID)?.workspaceUniqueID) return;
        if (!this.agentIDMap.get(agentID)) return;

        if (connectionManager instanceof ClientConnection) {
            const agent = this.agentIDMap.get(agentID);
            if (agent?.clientUniqueID) agent.clientUniqueID = agent.clientUniqueID.filter(id => id !== uniqueID);
        } else if (connectionManager instanceof WorkspaceConnection) {
            this.agentIDMap.get(agentID).workspaceUniqueID = undefined;
        }

        this.uniqueIDMap.delete(uniqueID);
    }

}






export default WebSocketObject;