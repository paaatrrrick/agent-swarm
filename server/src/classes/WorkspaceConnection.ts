import WebSocket from "ws";
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
        console.log('');
        console.log('setting prompt running');
        console.log(promptrunning);
        this.parent.sendMessageToAllNeighborClients(this.agentID, 'config', {promptRunning: promptrunning});
        this.promptrunning = promptrunning;
    }

    async handleMessage(message : any) : Promise<void> {
        console.log('workpsace is sending message');
        console.log(message);
        this.parent.sendMessageToAllNeighborClients(this.agentID, 'workspaceStatus', message);
    }

    async handleClose() {
        this.parent.closeConnection(this.agentID);
    }
}

export default WorkspaceConnection;