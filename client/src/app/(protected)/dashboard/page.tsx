'use client'
import Home from '@/components/home/Home';
import Sidebar from '@/components/home/Sidebar';
import React, { useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { fireBaseAuth, getAuthToken } from '@/helpers/firebase'
import { Agent, UserOrBool, StringAgentUndefined } from '@/types/user';
import constants from '@/helpers/constants';
import { set } from 'firebase/database';


const ScreenComponent = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [profile, setProfile] = useState<UserOrBool>(false);
    const [agent, setAgent] = useState<StringAgentUndefined>(undefined);
    const [promptRunning, setPromptRunning] = useState<boolean>(true);
    const [ws, setWS] = useState<WebSocket | null>(null);
    const [selectedAgent, setSelectedAgent] = useState<string>("Demo");

    const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);


    const getAgent = async (): Promise<void> => {
        if (agent !== undefined) return;
        try {
            const token = await getAuthToken();
            const response = await fetch(constants.serverUrl + constants.endpoints.getUsersAgent, {
                headers: {
                    'Content-Type': 'application/json',
                    'authorization': `Bearer ${token}`,
                },
            });
            if (response.ok) {
                const data = await response.json();
                const { agentID, streamingLink } = data;
                console.log('agent', agentID, streamingLink)
                setAgent({ agentID, streamingLink });
                setupWebsocket(agentID);
                return
            }
            setAgent('Error fetching agent details');
        } catch (error) {
            setAgent('Error fetching agent details');
        }
    }

    const setupWebsocket = async (agentID: string) => {
        console.log('trying to connect to websocket');
        const newWS = new WebSocket(constants.websocketUrl);
        newWS.onopen = () => {
            newWS.send(JSON.stringify({ type: 'config', agentID }));
        };
        newWS.onmessage = (event) => {
            const data = JSON.parse(event.data);
            const { type } = data;
            console.log('received message', data);
            if (type === 'config') {
                const { promptRunning } = data;
                setPromptRunning(promptRunning);
            } else if (type === 'message') {
                console.log('message received', data);
                setPromptRunning(false);
            }
        };
        setWS(newWS);
        return () => newWS.close();
    }

    const sendMessage = (message: Object): void => {
        if (ws) {
            console.log('sending message', message)
            console.log(JSON.stringify({ type: 'message', ...message }))
            ws.send(JSON.stringify({ type: 'message', ...message }));
            setPromptRunning(true);
        }
    }

    useEffect(() => {
        getAgent();
    }, []);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(fireBaseAuth, (user) => {
            if (user) {
                setProfile({ profilePicture: user.photoURL || '', name: user.displayName || '', email: user.email ? user.email.split('@')[0] + ' ...' : '' });
                return
            }
            setProfile(false);
        });
        return () => { unsubscribe(); }
    }, []);

    return (
        <div className="relative min-h-screen bg-background">
            <Sidebar isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar} profile={profile}   selectedAgent={selectedAgent} setSelectedAgent={setSelectedAgent} />
            <Home isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar} agent={agent} promptRunning={promptRunning} sendMessage={sendMessage} selectedAgent={selectedAgent} />
        </div>
    );
};

export default ScreenComponent;
