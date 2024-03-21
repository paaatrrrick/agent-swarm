let isLocal = false;
try {
  isLocal = window.location.href.includes('localhost');
} catch (e) {}
  
interface Constants {
    serverUrl: string;
    isLocal: boolean;
    errorTimeout: number;
    routes: Routes;
    endpoints: Endpoints;
    githubUrl: string;
    twitterUrl: string;
}

interface Routes {
  defaultAuthenticatedRoute: string;
  login: string;
  signup: string;
  home: string;
  profile: string;
}

interface Endpoints {
  getProfile: string;
  emailSignUp: string;
  googleSignUp: string;
  getAgent: string;
  getUsersAgent: string;
}


//TODO_UPDATE_THIS: Update the serverUrl to your server url
const constants : Constants = {
  serverUrl: isLocal ? "http://localhost:4500" : "https://boilerplate.up.railway.app",
  githubUrl: "https://github.com/paaatrrrick/agent-swarm",
  twitterUrl: "https://twitter.com/gautam_sharda_",
  isLocal: isLocal,
  errorTimeout: 7500,
  routes: {
    defaultAuthenticatedRoute: "/profile",
    login: "/login",
    signup: "/signup",
    home: "/",
    profile: "/profile",
  },
  endpoints: {
    getProfile: "/profile/get",
    emailSignUp: "/auth/email-signup",
    googleSignUp: "/auth/google-signup",
    getAgent: "/agent/getAgent",
    getUsersAgent: "/agent/getUsersAgent",
  }
};

export default constants;


