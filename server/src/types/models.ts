export interface UserType {
    dateCreate: Date,
    profilePicture?: string,
    firebaseUID: string,
    email: string,
    name: string,
    agentIDs: string[],
}


export interface AgentType {
    dateCreate: Date,
    workspaceId?: string,
    userId?: string,
    streamingLink?: string,
    directoryId?: string,
    bundleId?: string,
    inUse: boolean,
    complete: boolean,
}