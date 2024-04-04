import WebSocket, { RawData, WebSocketServer } from "ws";
import axios from 'axios';
import Agent from "../models/Agent";
import WorkspaceConnection from "./WorkspaceConnection";
import ClientConnection from "./ClientConnection";

type connectionType =  "client" | "workspace";

interface uniqueIDMetadata {
    type: connectionType;
    //if type is client then class is ClientConnection else WorkspaceConnection
    connectionManager: ClientConnection | WorkspaceConnection;
}

interface threeWayHandshake {
    clientUniqueID: string[];
    workspaceUniqueID?: string;
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
                const connectionType : connectionType = data.connectionType;
                const { agentID } = data;

                const agent = await Agent.findById(agentID);

                if (!agent) {
                    ws.send(JSON.stringify({type: 'error', message: 'agent not found'}));
                    return;
                }

                if (!this.agentIDMap.get(agentID)){
                    this.agentIDMap.set(agentID, {clientUniqueID: []});
                }

                if (connectionType === "client") {
                    const clientConnection : ClientConnection = new ClientConnection(ws, agentID, uniqueID, this);
                    this.uniqueIDMap.set(uniqueID, {type: connectionType, connectionManager: clientConnection});
                    this.agentIDMap.get(agentID).clientUniqueID.push(uniqueID);
                    //@ts-ignore
                    const promptRunning = this.uniqueIDMap.get(this.agentIDMap.get(agentID)?.workspaceUniqueID)?.connectionManager?.getPromptRunning() || false;
                    clientConnection.sendMessage("config", {promptRunning: promptRunning});

                } else if (connectionType === "workspace") {
                    const { promptRunning } = data;
                    const workspaceConnection = new WorkspaceConnection(ws, agentID, uniqueID, promptRunning, this);
                    this.uniqueIDMap.set(uniqueID, {type: connectionType, connectionManager: workspaceConnection});
                    this.agentIDMap.get(agentID).workspaceUniqueID = uniqueID;
                }
                return;
            }
            this.uniqueIDMap.get(uniqueID)?.connectionManager?.handleMessage(data);
        } catch (error) {
            console.log(error);
        }
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
        this.uniqueIDMap.get(uniqueID)?.connectionManager?.handleClose();
    }

    async closeConnection(uniqueID : string) : Promise<void> {
        const connectionManager = this.uniqueIDMap.get(uniqueID)?.connectionManager;
        if (!connectionManager) return;

        const agentID = connectionManager.agentID;
        if (!this.agentIDMap.get(agentID).workspaceUniqueID) return;
        

        if (connectionManager instanceof ClientConnection) {
            const clientUniqueID = this.agentIDMap.get(agentID)?.clientUniqueID;
            if (clientUniqueID) {
                this.agentIDMap.set(agentID, {clientUniqueID: clientUniqueID.filter(id => id !== uniqueID)});
            }
        } else if (connectionManager instanceof WorkspaceConnection) {
            this.agentIDMap.get(agentID).workspaceUniqueID = undefined;

        }

        //if workspaceUniqueID is undefined and clientUniqueID is empty then delete agentID from agentIDMap
        if (!this.agentIDMap.get(agentID).workspaceUniqueID && this.agentIDMap.get(agentID).clientUniqueID.length === 0) {
            this.agentIDMap.delete(agentID);
        }
        //remove from uniqueIDMap
        this.uniqueIDMap.delete(uniqueID);

    }
}






export default WebSocketObject;