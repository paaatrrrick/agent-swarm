import AgentMessage from "@/types/websocket";

const handleIncomingWorkspaceStatus = (incoming : AgentMessage, current : AgentMessage[]) : AgentMessage[] => {
    if (incoming.start) {
        //delete start from incoming
        delete incoming.start
        incoming.content = "";
        current.push(incoming)
    } else if (current.length === 0 || current[current.length - 1].completed) {
        current.push(incoming);
    } else if (incoming.content) {
        current[current.length - 1].content += incoming.content;
    }   
    if (incoming.end) {
        current[current.length - 1].completed = true;
    }


    return JSON.parse(JSON.stringify(current));
}


export { handleIncomingWorkspaceStatus }