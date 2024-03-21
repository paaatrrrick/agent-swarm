import { Request } from 'express';
import { UserType } from '../types/models';
import { Document, Types } from 'mongoose';

export interface RequestWithUser extends Request {
    user?:  Document<unknown, {}, UserType> & UserType & {_id: Types.ObjectId;};
}
