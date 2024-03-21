if (process.env.NODE_ENV !== "production") {
    require('dotenv').config();
}
import AWS from 'aws-sdk';



interface CreateWorkspace {
    workspaceId: string;
    streamingLink: string;
}

// async function createWorkspace () {
async function createWorkspace () : Promise<CreateWorkspace>  {    
        // Configure AWS SDK with your credentials and region
        AWS.config.update({
            accessKeyId: process.env.AWS_ACCESS_KEY_ID,
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
            region: process.env.AWS_REGION
        });

        // Create an instance of the WorkSpaces service
        const workspaces = new AWS.WorkSpaces();

        // Set up the parameters for creating a WorkSpace
        const params = {
            DirectoryId: 'd-9067fa7ce9',
            UserName: 'gautam-admin',
            BundleId: 'your-bundle-id',
            Tags: []
        };

        // Create the WorkSpace
        const result = await workspaces.createWorkspaces({Workspaces: [params]}).promise();
        const id = '';
        //run bs stuff on workspace to configure it.
        return {workspaceId: id, streamingLink: 'your-streaming-link'};
}

async function deleteWorkspace (workspaceId: string) : Promise<void> {
        // Configure AWS SDK with your credentials and region
        AWS.config.update({
            accessKeyId: process.env.AWS_ACCESS_KEY_ID,
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
            region: process.env.AWS_REGION
        });

        // Create an instance of the WorkSpaces service
        const workspaces = new AWS.WorkSpaces();

        // Set up the parameters for deleting a WorkSpace
        const params = {TerminateWorkspaceRequests: [{WorkspaceId: workspaceId}]};

        // Delete the WorkSpace
        const result = await workspaces.terminateWorkspaces(params).promise();
        return;
}

export { createWorkspace, deleteWorkspace };
