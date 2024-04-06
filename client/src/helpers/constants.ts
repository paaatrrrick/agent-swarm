let isLocal = false;
try {
  isLocal = window.location.href.includes('localhost');
} catch (e) {}
  
interface Constants {
    serverUrl: string;
    websocketUrl: string;
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
  dashboard: string;
}

interface Endpoints {
  getProfile: string;
  emailSignUp: string;
  googleSignUp: string;
  getAgent: string;
  getUsersAgent: string;
  getAllAgents: string;
  addAgent: string;
}


//TODO_UPDATE_THIS: Update the serverUrl to your server url
const constants : Constants = {
  serverUrl: isLocal ? "http://localhost:4500" : "https://agent-swarm-production.up.railway.app",
  // serverUrl:"https://agent-swarm-production.up.railway.app",
  websocketUrl: isLocal ? "ws://localhost:4500" : "wss://agent-swarm-production.up.railway.app",
  // websocketUrl: "wss://agent-swarm-production.up.railway.app",
  githubUrl: "https://github.com/paaatrrrick/agent-swarm",
  twitterUrl: "https://twitter.com/gautam_sharda_",
  isLocal: isLocal,
  errorTimeout: 7500,
  routes: {
    defaultAuthenticatedRoute: "/dashboard",
    login: "/login",
    signup: "/signup",
    home: "/",
    dashboard: "/dashboard",
  },
  endpoints: {
    getProfile: "/profile/get",
    emailSignUp: "/auth/email-signup",
    googleSignUp: "/auth/google-signup",
    getAgent: "/agent/getAgent",
    getUsersAgent: "/agent/getUsersAgent",
    getAllAgents: "/agent/getAllAgents",
    addAgent: "/agent/addAgent",
  }
};

export default constants;


