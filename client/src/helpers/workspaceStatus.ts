import AgentMessage from "@/types/websocket";

const handleIncomingWorkspaceStatus = (incoming : AgentMessage, current : AgentMessage[]) : AgentMessage[] => {
    if (incoming.start) {
        //delete start from incoming
        delete incoming.start
        incoming.content = "";
        current.push(incoming)
    } else if (!incoming.end && incoming.content) {
        current[current.length - 1].content += incoming.content;
    }


    return JSON.parse(JSON.stringify(current));
}


export { handleIncomingWorkspaceStatus }