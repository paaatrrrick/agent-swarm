import { WorkSpacesClient, CreateWorkspacesCommand, TerminateWorkspacesCommand, DescribeWorkspacesCommand, DescribeWorkspacesCommandOutput } from "@aws-sdk/client-workspaces";
if (process.env.NODE_ENV !== "production") {
    require('dotenv').config();
}

const config = {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION
}

const client = new WorkSpacesClient(config);

interface CreateWorkspace {
    workspaceId: string;
    streamingLink: string;
}



async function createWorkspace () : Promise<CreateWorkspace>  {

    const params = {
        DirectoryId: 'd-9067fd42a0',
        UserName: 'Guest',
        BundleId: 'wsb-wfgx5b3m9',
        Tags: []
    };

    console.log('about to send');
    const command = new CreateWorkspacesCommand({Workspaces: [params]});
    const result = await client.send(command);
    console.log('we are back');
    console.log(result);

    if (result.FailedRequests && result.FailedRequests.length > 0) {
        throw new Error('Failed to create workspace');
    }

    const id : string = result.PendingRequests[0].WorkspaceId;


    //loop until workspace is available
    let workspaceState = '';
    let finalWorkspace : DescribeWorkspacesCommandOutput;
    while (workspaceState !== 'AVAILABLE') {
        const workspace = await client.send(new DescribeWorkspacesCommand({WorkspaceIds: [id]}));
        workspaceState = workspace.Workspaces[0].State;
        if (workspaceState === 'ERROR') {
            throw new Error('Workspace creation failed');
        }
        console.log('workspaceState', workspaceState);
        finalWorkspace = workspace;
        await new Promise(r => setTimeout(r, 10000));
    }

    const ipAddress = finalWorkspace.Workspaces[0].IpAddress;

    return {workspaceId: "id", streamingLink: 'your-streaming-link'}; 
}

async function deleteWorkspace (workspaceId: string) : Promise<void> {

    const params = {TerminateWorkspaceRequests: [{WorkspaceId: workspaceId}]};
    // Delete the WorkSpace
    const command = new TerminateWorkspacesCommand(params);
    const result = await client.send(command);

    console.log(result);
    return;
}

export { createWorkspace, deleteWorkspace };



// import AWS from 'aws-sdk';



// interface CreateWorkspace {
//     workspaceId: string;
//     streamingLink: string;
// }

// // async function createWorkspace () {
// async function createWorkspace () : Promise<CreateWorkspace>  {    
//         // Configure AWS SDK with your credentials and region
//         AWS.config.update({
//             accessKeyId: process.env.AWS_ACCESS_KEY_ID,
//             secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
//             region: process.env.AWS_REGION
//         });

//         // Create an instance of the WorkSpaces service
//         const workspaces = new AWS.WorkSpaces();

//         // Set up the parameters for creating a WorkSpace


//         console.log('we are here')
//         const params = {
//             DirectoryId: 'd-9067fd42a0',
//             UserName: 'Guest',
//             BundleId: 'wsb-wfgx5b3m9',
//             Tags: []
//         };

//         // Create the WorkSpace
//         const result = await workspaces.createWorkspaces({Workspaces: [params]}).promise();
//         console.log(result);

//         if (result.FailedRequests && result.FailedRequests.length > 0) {
//             console.log('Failed to create workspace');
//             console.log(result.FailedRequests);
//             return {workspaceId: '', streamingLink: ''};
//         }

//         //wsb-wfgx5b3m9

        

//         const id : string = result.PendingRequests[0].WorkspaceId;


//         // const id = 'ws-3b1kkkph7';
        

//         //loop until workspace is available
//         let workspaceState = '';
//         while (workspaceState !== 'AVAILABLE') {
//             const workspace = await workspaces.describeWorkspaces({WorkspaceIds: [id]}).promise();
//             workspaceState = workspace.Workspaces[0].State;
//             if (workspaceState === 'ERROR') {
//                 throw new Error('Workspace creation failed');
//             }
//             console.log('workspaceState', workspaceState);
//             await new Promise(r => setTimeout(r, 10000));
//         }

//         //

//         //run bs stuff on workspace to configure it.
//         return {workspaceId: id, streamingLink: 'your-streaming-link'};
// }

// async function deleteWorkspace (workspaceId: string) : Promise<void> {
//         // Configure AWS SDK with your credentials and region
//         AWS.config.update({
//             accessKeyId: process.env.AWS_ACCESS_KEY_ID,
//             secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
//             region: process.env.AWS_REGION
//         });

//         // Create an instance of the WorkSpaces service
//         const workspaces = new AWS.WorkSpaces();

//         // Set up the parameters for deleting a WorkSpace
//         const params = {TerminateWorkspaceRequests: [{WorkspaceId: workspaceId}]};

//         // Delete the WorkSpace
//         const result = await workspaces.terminateWorkspaces(params).promise();
//         return;
// }


