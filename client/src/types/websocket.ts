type role = 'user' | 'assistant' | 'computer';
type type = "message" | "code" | "console";
type format = 'python' | "output" | "active_line" | string;


interface AgentMessage {
    role: string;
    type: string;
    format?: string;
    content: string;
    start? : string
    end? : string
    completed? : boolean
}

export default AgentMessage;

