import WebSocket, { RawData, WebSocketServer } from "ws";
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
            console.log('new connection');
            const uniqueID = Math.random().toString(36).substring(7);
            ws.on('message', (message) => {this.handleMessage(message, ws, uniqueID)});
            ws.on('close', () => {this.handleClose(uniqueID)});
        });
    }


    // {

    //     type: 'config',
        
    //     promptRunning: false,
        
    //     agentID: '6629abd1a6b28d6493390ba8',
        
    //     connectionType: 'workspace'
        
    // }


    // {

    //     type: 'config',
        
    //     promptRunning: false,
        
    //     agentID: '66039df5a8738d00a5260365',
        
    //     connectionType: 'workspace'
        
    //     }

    async handleMessage(message : RawData, ws : WebSocket, uniqueID : string) : Promise<void> {
        try {
            const data = JSON.parse(message.toString());
            const type = data.type;
            console.log('');
            console.log('incoming message');
            console.log(data);
    
            if (type === 'config') {
                const connectionType : connectionType = data.connectionType;
                const { agentID } = data;

                const agent = await Agent.findById(agentID);

                if (!agent) {
                    ws.send(JSON.stringify({type: 'error', message: 'agent not found'}));
                    console.log(this.agentIDMap);
                    return;
                }

                if (!this.agentIDMap.get(agentID)){
                    this.agentIDMap.set(agentID, {clientUniqueID: []});
                }

                if (connectionType === "client") {
                    console.log(this.agentIDMap)
                    const clientConnection : ClientConnection = new ClientConnection(ws, agentID, uniqueID, this);
                    this.uniqueIDMap.set(uniqueID, {type: connectionType, connectionManager: clientConnection});
                    this.agentIDMap.get(agentID).clientUniqueID.push(uniqueID);
                    console.log('find workspace');
                    console.log(this.agentIDMap.get(agentID))
                    console.log(this.agentIDMap.get(agentID).workspaceUniqueID);
                    console.log('');
                    //@ts-ignore
                    const workspaceConnection : WorkspaceConnection | undefined = this.uniqueIDMap.get(this.agentIDMap.get(agentID)?.workspaceUniqueID)?.connectionManager;
                    console.log('workspace connection');
                    if (!workspaceConnection) {
                        console.log('wamp wamp')
                        clientConnection.sendMessage("config", {promptRunning: false, workspaceConnection: false});
                        console.log(this.agentIDMap);
                        return;
                    }
                    const promptRunning = workspaceConnection.getPromptRunning() || false;
                    console.log('prompt running');
                    console.log(promptRunning);
                    clientConnection.sendMessage("config", {promptRunning: promptRunning, workspaceConnection: true});

                } else if (connectionType === "workspace") {
                    const { promptRunning } = data;
                    const workspaceConnection = new WorkspaceConnection(ws, agentID, uniqueID, promptRunning, this);
                    this.uniqueIDMap.set(uniqueID, {type: connectionType, connectionManager: workspaceConnection});
                    this.agentIDMap.get(agentID).workspaceUniqueID = uniqueID;
                    workspaceConnection.init();
                }
                console.log(this.agentIDMap);
                return;
            }
            console.log('socket non normal thing');
            console.log(uniqueID);
            this.uniqueIDMap.get(uniqueID)?.connectionManager?.handleMessage(data);
        } catch (error) {
            console.log(error);
            console.log(this.agentIDMap);
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
        if (!this.agentIDMap.get(agentID)?.workspaceUniqueID) return;
        if (connectionManager instanceof ClientConnection) {
            const { clientUniqueID, workspaceUniqueID } = this.agentIDMap.get(agentID);
            if (clientUniqueID) {
                this.agentIDMap.set(agentID, {clientUniqueID: clientUniqueID.filter(id => id !== uniqueID), workspaceUniqueID});
            }
        } else if (connectionManager instanceof WorkspaceConnection) {
            this.agentIDMap.get(agentID).workspaceUniqueID = undefined;

        }

        //if workspaceUniqueID is undefined and clientUniqueID is empty then delete agentID from agentIDMap
        console.log(this.agentIDMap);
        if (!this.agentIDMap.get(agentID)?.workspaceUniqueID && this.agentIDMap.get(agentID)?.clientUniqueID?.length === 0) {
            this.agentIDMap.delete(agentID);
        }
        //remove from uniqueIDMap
        this.uniqueIDMap.delete(uniqueID);
    }
}






export default WebSocketObject;