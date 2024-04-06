'use client'
import Home from '@/components/home/Home';
import Sidebar from '@/components/home/Sidebar';
import React, { useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { fireBaseAuth, getAuthToken } from '@/helpers/firebase'
import { UserOrBool, StringAgentUndefined } from '@/types/user';
import constants from '@/helpers/constants';
import { useError } from '@/context/ErrorContext';

const ScreenComponent = () => {
    const { setError } = useError();
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [profile, setProfile] = useState<UserOrBool>(false);
    const [currentAgentIndex, setCurrentAgentIndex] = useState<number | undefined>(undefined);
    const [agents, setAgents] = useState<StringAgentUndefined[]>([]);
    const [promptRunning, setPromptRunning] = useState<boolean>(false);
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
                //reverse order of data.agents
                data.agents.reverse();
                setAgents(data.agents);
                setCurrentAgentIndex(0);
                setupWebsocket(data.agents[0].agentID);
                return
            }
        } catch (error) {
        }
    }

    const setupWebsocket = async (agentID: string) => {
        const newWS = new WebSocket(constants.websocketUrl);

        const onOpen = () => { newWS.send(JSON.stringify({ type: 'config', agentID, connectionType: 'client' })); }


        const handleMessage = (event: MessageEvent) => {
            const data = JSON.parse(event.data);
            console.log('');
            console.log('incoming webscoket message');
            console.log(data)
            if (data.type === 'config') handleConfig(data);
            if (data.type === 'message') handleInformation(data);
            if (data.type === 'error') handleError(data);
        }


        const handleConfig = (data: any) => {
            const { workspaceConnection } = data;
            if (!workspaceConnection) setError({ primaryMessage: `Your Agent's Workspace is currently not running`, secondaryMessage: 'Conact gautamsharda001@gmail.com to get it back up. Sorry our infra dev was sick today!', timeout: 15000 })
            setPromptRunning(data.promptRunning || !workspaceConnection);
        }

        const handleInformation = (data: any) => {
            setPromptRunning(false);
        }

        const handleError = (data: any) => {
            setError({ primaryMessage: data.message, secondaryMessage: data.secondaryMessage || '', timeout: 5000 });
        }

        newWS.onopen = onOpen;
        newWS.onmessage = handleMessage;
        setWS(newWS);
        return () => newWS.close();
    }

    const sendMessage = (message: Object): void => {
        if (ws) {
            ws.send(JSON.stringify({ type: 'prompt', ...message }));
        }
    }

    const stopAgent = (): void => {
        if (ws) {
            ws.send(JSON.stringify({ type: 'terminate' }));
        }
    }

    useEffect(() => {
        getAgent();
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

    console.log('');
    console.log('rendering');
    console.log(promptRunning);
    return (
        <div className="relative min-h-screen bg-background">
            <Sidebar isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar} profile={profile} agents={agents} currentAgentIndex={currentAgentIndex} setCurrentAgentIndex={setCurrentAgentIndexWrapper} addAgent={addAgent} />
            <Home isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar} agent={(agents.length === 0 || currentAgentIndex === undefined) ? undefined : agents[currentAgentIndex]} promptRunning={promptRunning} sendMessage={sendMessage} currentAgentIndex={currentAgentIndex} stopAgent={stopAgent} />
        </div>
    );
};

export default ScreenComponent;
