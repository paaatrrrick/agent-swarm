import mongoose from 'mongoose';
import { UserType } from '../types/models';

const Schema = mongoose.Schema;
const UserSchema = new Schema<UserType>({
    dateCreate: { type: Date, default: Date.now },
    profilePicture: { type: String, optional: true },
    firebaseUID: { type: String, optional: false },
    email: { type: String, default: ''},
    name: { type: String, default: ''},
});

export default mongoose.model('User', UserSchema);