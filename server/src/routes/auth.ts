if (process.env.NODE_ENV !== "production") {
    require('dotenv').config();
}
import catchAsync from '../methods/catchAsync';
import express, { Response, NextFunction } from 'express';
import User from '../models/user';
import { RequestWithUser } from '../types/apiTypes';
import { firebaseAdmin } from '../methods/firebase';

const AuthRouter = express.Router();

AuthRouter.post('/google-signup', catchAsync(async (req: RequestWithUser, res: Response, next: NextFunction) => {
    const { firebaseUID, firebaseJWT } = req.body;    
    const oldUser = await User.findOne({ firebaseUID });
    if (oldUser) {
        return res.status(200).send({ message: 'Account already exists' });
    }
    var decodedToken = null
    try {
        decodedToken = await firebaseAdmin.auth().verifyIdToken(firebaseJWT);
    } catch (error) {
        return res.status(400).send({ message: 'Invalid Firebase UID' });
    }
    console.log(decodedToken)
    if (decodedToken.uid !== firebaseUID) {
        return res.status(400).send({ message: 'Invalid Firebase UID' });
    }
    const usersInfo = {firebaseUID: firebaseUID, email: decodedToken.email || '', name: decodedToken.name || ''}
    const newUser = new User(usersInfo);
    await newUser.save();
    res.status(200).send({ message: 'Account Created' });
}));

export default AuthRouter;