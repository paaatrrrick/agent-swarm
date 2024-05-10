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
    promptRunning: boolean;
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
                    return;
                }

                if (!this.agentIDMap.get(agentID)){
                    this.agentIDMap.set(agentID, {clientUniqueID: [], promptRunning: false});
                }

                if (connectionType === "client") {

                    
                    //setup client connection
                    const clientConnection : ClientConnection = new ClientConnection(ws, agentID, uniqueID, this);
                    this.uniqueIDMap.set(uniqueID, {type: connectionType, connectionManager: clientConnection});
                    this.agentIDMap.get(agentID).clientUniqueID.push(uniqueID);
                    //@ts-ignore
                    const workspaceConnection : WorkspaceConnection | undefined = this.uniqueIDMap.get(this.agentIDMap.get(agentID)?.workspaceUniqueID)?.connectionManager;
                    if (!workspaceConnection) {
                        clientConnection.sendMessage("config", {promptRunning: false, workspaceConnection: false});
                        return;
                    }
                    const promptRunning = workspaceConnection.getPromptRunning() || false;
                    clientConnection.sendMessage("config", {promptRunning: promptRunning, workspaceConnection: true});

                } else if (connectionType === "workspace") {

                    //setup workspace connection
                    const workspaceConnection = new WorkspaceConnection(ws, agentID, uniqueID, this);
                    this.uniqueIDMap.set(uniqueID, {type: connectionType, connectionManager: workspaceConnection});
                    this.agentIDMap.get(agentID).workspaceUniqueID = uniqueID;
                    workspaceConnection.init();
                }
                return;
            }
            this.uniqueIDMap.get(uniqueID)?.connectionManager?.handleMessage(data);
        } catch (error) {
            console.log('error in handle message in socket.ts');
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
        console.log('closing out a connection');
        this.uniqueIDMap.get(uniqueID)?.connectionManager?.handleClose();
    }


    getPromptRunning(agentID : string) : boolean {

        console.log('')
        console.log('the current state is')
        console.log(this.agentIDMap.get(agentID))
        console.log(this.agentIDMap.get(agentID)?.promptRunning)
        console.log('-----')

        return this.agentIDMap.get(agentID)?.promptRunning;
    }

    setPromptRunning(agentID : string, promptRunning : boolean) : void {
        if (this.getPromptRunning(agentID) === promptRunning) return;
        this.agentIDMap.set(agentID, {clientUniqueID: this.agentIDMap.get(agentID)?.clientUniqueID || [], workspaceUniqueID: this.agentIDMap.get(agentID)?.workspaceUniqueID, promptRunning});
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
            const { clientUniqueID, workspaceUniqueID, promptRunning } = this.agentIDMap.get(agentID);
            if (clientUniqueID) this.agentIDMap.set(agentID, {clientUniqueID: clientUniqueID.filter(id => id !== uniqueID), workspaceUniqueID, promptRunning });

        } else if (connectionManager instanceof WorkspaceConnection) {
            this.agentIDMap.get(agentID).workspaceUniqueID = undefined;
        }

        this.uniqueIDMap.delete(uniqueID);
    }
}






export default WebSocketObject;