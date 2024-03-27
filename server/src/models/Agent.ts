import mongoose from 'mongoose';
import { AgentType } from '../types/models';

const Schema = mongoose.Schema;
const AgentSchema = new Schema<AgentType>({
    dateCreate: { type: Date, default: Date.now },
    workspaceId: { type: String, optional: true },
    userId: { type: String, optional: true },
    streamingLink: { type: String, optional: true },
    directoryId: { type: String, optional: true },
    imageId: { type: String, optional: true },
    inUse: { type: Boolean, default: false },
    complete: { type: Boolean, default: false },
});

export default mongoose.model('Agent', AgentSchema);