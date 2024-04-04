'use client'
import Home from '@/components/home/Home';
import Sidebar from '@/components/home/Sidebar';
import React, { useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { fireBaseAuth, getAuthToken } from '@/helpers/firebase'
import { UserOrBool, StringAgentUndefined } from '@/types/user';
import constants from '@/helpers/constants';

const ScreenComponent = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [profile, setProfile] = useState<UserOrBool>(false);
    const [currentAgentIndex, setCurrentAgentIndex] = useState<number | undefined>(undefined);
    const [agents, setAgents] = useState<StringAgentUndefined[]>([]);
    const [promptRunning, setPromptRunning] = useState<boolean>(true);
    const [ws, setWS] = useState<WebSocket | null>(null);

    const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);


    const getAgent = async (): Promise<void> => {
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
                setAgents([data.agents[0]]);
                setCurrentAgentIndex(0);
                setupWebsocket(data.agents[0].agentID);
                return
            }
        } catch (error) {
        }
    }

    const setupWebsocket = async (agentID: string) => {
        const newWS = new WebSocket(constants.websocketUrl);
        newWS.onopen = () => {
            newWS.send(JSON.stringify({ type: 'config', agentID }));
        };
        newWS.onmessage = (event) => {
            const data = JSON.parse(event.data);
            const { type } = data;
            if (type === 'config') {
                const { promptRunning } = data;
                console.log('message with config information');
                console.log(data);
                setPromptRunning(promptRunning);
            } else if (type === 'message') {
                setPromptRunning(false);
            }
        };
        setWS(newWS);
        return () => newWS.close();
    }

    const sendMessage = (message: Object): void => {
        if (ws) {
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

    const setCurrentAgentIndexWrapper = (index: number): void => {
        if (currentAgentIndex === index) return
        ws?.close()
        setPromptRunning(true)
        setWS(null)
        setCurrentAgentIndex(index)
        setupWebsocket(agents[index].agentID);
    }

    const addAgent = async () => {
    }

    return (
        <div className="relative min-h-screen bg-background">
            <Sidebar isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar} profile={profile} agents={agents} currentAgentIndex={currentAgentIndex} setCurrentAgentIndex={setCurrentAgentIndexWrapper} addAgent={addAgent} />
            <Home isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar} agent={(agents.length === 0 || currentAgentIndex === undefined) ? undefined : agents[currentAgentIndex]} promptRunning={promptRunning} sendMessage={sendMessage} currentAgentIndex={currentAgentIndex} />
        </div>
    );
};

export default ScreenComponent;
