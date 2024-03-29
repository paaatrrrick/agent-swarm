export interface User {
    profilePicture: string;
    name: string;
    email: string;
}

export type UserOrBool = boolean | User;


export interface Agent {
    workspaceId: string;
    streamingLink: string;
}

export type StringAgentUndefined = string | Agent | undefined;

