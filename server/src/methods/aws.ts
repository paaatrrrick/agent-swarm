if (process.env.NODE_ENV !== "production") {
    require('dotenv').config();
}

import { firebaseAdmin } from "./firebase";
import { Request, NextFunction, Response } from 'express';
import { UserType } from '../types/models';
import User from '../models/user';
import AWS from 'aws-sdk';

const createDesktop = async function (req: Request, res: Response, next: NextFunction) {
    try {
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
            DirectoryId: 'your-directory-id',
            UserName: 'user-name',
            BundleId: 'your-bundle-id',
            Tags: [
                {
                    Key: 'TagKey',
                    Value: 'TagValue'
                }
            ]
        };

        // Create the WorkSpace
        const result = await workspaces.createWorkspaces({
            Workspaces: [params]
        }).promise();

        console.log('WorkSpace created:', result.FailedRequests[0].ErrorMessage);
        res.status(200).json({ message: 'WorkSpace created successfully' });
    } catch (error) {
        console.error('Error creating WorkSpace:', error);
        next(error);
    }
};

const deleteDesktop = async function (req: Request, res: Response, next: NextFunction) {
    try {
        // Configure AWS SDK with your credentials and region
        AWS.config.update({
            accessKeyId: process.env.AWS_ACCESS_KEY_ID,
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
            region: process.env.AWS_REGION
        });

        // Create an instance of the WorkSpaces service
        const workspaces = new AWS.WorkSpaces();

        // Set up the parameters for deleting a WorkSpace
        const params = {
            TerminateWorkspaceRequests: [
                {
                    WorkspaceId: 'your-workspace-id'
                }
            ]
        };

        // Delete the WorkSpace
        const result = await workspaces.terminateWorkspaces(params).promise();

        console.log('WorkSpace deleted:', result);
        res.status(200).json({ message: 'WorkSpace deleted successfully' });
    } catch (error) {
        console.error('Error deleting WorkSpace:', error);
        next(error);
    }
}

export { createDesktop, deleteDesktop };
