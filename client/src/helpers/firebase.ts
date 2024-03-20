import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import constants from './constants';

interface FirebaseConfig {
    apiKey: string;
    authDomain: string;
    projectId: string;
    storageBucket: string;
    messagingSenderId: string;
    appId: string;
}

//TODO_UPDATE_THIS: Update the firebaseConfig to your firebase config
const firebaseConfig : FirebaseConfig = {
    apiKey: "AIzaSyC1ylIdJ8KAi36FokeQjAXRF016lsD8pIQ",
    authDomain: "agent-swarm-ai.firebaseapp.com",
    projectId: "agent-swarm-ai",
    storageBucket: "agent-swarm-ai.appspot.com",
    messagingSenderId: "73098641529",
    appId: "1:73098641529:web:4f07f0a2b1fd8c662e94a8",
};

initializeApp(firebaseConfig);
const fireBaseAuth = getAuth();
const GoogleProvider = new GoogleAuthProvider();


const getAuthToken = async () : Promise<String> => {
    while (true) {
        const token = await fireBaseAuth.currentUser?.getIdToken(true);
        if (token) return token;
        await new Promise(resolve => setTimeout(resolve, 50));
    }
}


const SignUpWithGooglePopUp = async (setError : (msg : string) => void) => {
    try {
        const result = await signInWithPopup(fireBaseAuth, GoogleProvider);
        const user = result.user;
        if (!user?.uid) {
            throw new Error();
        }
        const jwt = await user.getIdToken();
        const response = await fetch(`${constants.serverUrl}${constants.endpoints.googleSignUp}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ firebaseUID: user.uid, firebaseJWT: jwt}),
        });
        if (!response.ok) {
            throw new Error('Error authenticating with Google');
        }
    } catch (error) {
        setError(`Error authenticating with Google`)
    }
};


export { GoogleProvider, fireBaseAuth, SignUpWithGooglePopUp, getAuthToken };