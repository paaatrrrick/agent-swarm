'use client';
import React, { useEffect, useState } from 'react'
import Icon from '../ui/icon'
import clsx from 'clsx'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { StringAgentUndefined } from '@/types/user';
import Videoplayer from './Videoplayer';
import { Loader } from '../Loader';

interface HomeInterface {
    isSidebarOpen: boolean;
    isRightSidebarOpen: boolean;
    toggleSidebar: () => void;
    toggleRightSidebar: () => void;
    agent: StringAgentUndefined | undefined;
    promptRunning: boolean;
    sendMessage: (message: Object) => void;
    currentAgentIndex: number | undefined;
    stopAgent: () => void;
    workspaceConnection: boolean;
}

export default function Home({ isSidebarOpen, isRightSidebarOpen, toggleSidebar, toggleRightSidebar, agent, promptRunning, workspaceConnection, sendMessage, currentAgentIndex, stopAgent }: HomeInterface) {



    // (isRightSidebarOpen || isSidebarOpen) && 'w-[75%]', (isRightSidebarOpen && isSidebarOpen) && 'w-[95%]', !(isRightSidebarOpen || isSidebarOpen) && 'w-[65%]')
    var screenWidth = 'w-[65%]'
    if (isRightSidebarOpen || isSidebarOpen) {
        screenWidth = 'w-[75%]'
    }
    if (isRightSidebarOpen && isSidebarOpen) {
        screenWidth = 'w-[95%]'
    }


    return (
        <>
            {/* Button to toggle sidebar from the main content area */}
            <div className={clsx(isSidebarOpen && 'hidden', 'absolute top-4 left-4 z-10 duration-200')}>
                <Icon type="hamburger" onClick={toggleSidebar} hideBorder={true} />
                {/* {(agent && typeof agent !== "string") && <p className='font-mono text-2xl text-red-500'>We have agent {JSON.stringify(agent)}</p>} */}
            </div>
            <div className={clsx(isRightSidebarOpen && 'hidden', 'absolute top-4 right-4 z-10 duration-200')}>
                <Icon type="EnvelopeOpenIcon" onClick={toggleRightSidebar} hideBorder={true} />
                {/* {(agent && typeof agent !== "string") && <p className='font-mono text-2xl text-red-500'>We have agent {JSON.stringify(agent)}</p>} */}
            </div>
            <div className={`flex-1 min-h-screen transition-margin duration-300 ease-in-out bg-primary-foreground ${isSidebarOpen ? "ml-64" : "ml-0"} ${isRightSidebarOpen ? "mr-96" : "mr-0"}`}>
                <div className='w-full h-full flex flex-col items-center justify-start'>
                    <div className='w-full h-full flex flex-col items-center justify-start'>
                        <div className={clsx('w-[90%] max-w-[130vh] flex flex-col items-center justify-start')}>
                            <h1 className='font-mono text-4xl mt-8 font-bold 2xl:text-6xl'>Agent Livestream</h1>
                            <Agent agent={workspaceConnection ? agent : undefined} />
                            <MessageInput sendMessage={sendMessage} promptRunning={promptRunning} workspaceConnection={workspaceConnection} currentAgentIndex={currentAgentIndex} stopAgent={stopAgent} />
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

function Agent({ agent }: { agent: StringAgentUndefined | undefined }) {
    // const agentIndex = selectedAgent === "Demo" ? 0 : 1; // Assuming "Demo" is index 0 and "Untitled" is index 1

    return (
        <div className={clsx('w-full mt-8 aspect-video', agent === undefined && 'border-2 border-primary rounded-md')}>
            {typeof agent === 'string' && <p className='font-mono text-2xl text-red-500'>{agent}</p>}
            {typeof agent === 'object' && (
                <>
                    <Videoplayer path={agent.streamingLink} />
                    {/* <p className='font-mono mt-2'>Agent Index: {agentIndex}</p> */}
                </>
            )}
            {agent === undefined && (
                <Loader text="Fetching agent details" className='w-full h-full flex items-center justify-center' />
            )}
        </div>
    )
}

interface MessageInputInterface {
    sendMessage: (message: Object) => void;
    promptRunning: boolean;
    currentAgentIndex: number | undefined;
    stopAgent: () => void;
    workspaceConnection: boolean;
}

function MessageInput({ sendMessage, promptRunning, currentAgentIndex, stopAgent, workspaceConnection }: MessageInputInterface) {
    const [prompt, setPrompt] = useState<string>("");
    const sendMessageWrapper = () => {
        sendMessage({ message: prompt });
        setPrompt("");
    }


    useEffect(() => {
        setPrompt("");
    }, [currentAgentIndex])

    if (!workspaceConnection) return <></>
    return (
        <div className='flex flex-row items-start justify-start mt-8 w-full'>
            <Input type="text" value={prompt} onChange={(e) => { setPrompt(e.target.value) }} placeholder="Prompt interpreter" className='w-full bg-secondary border-border border-2 text-md font-mono placeholder:font-mono h-12 dark:border-white' />
            {!promptRunning && <Button type="submit" className='ml-3 font-mono w-24 h-12 text-lg bg-purple-500 dark:text-white hover:bg-purple-600' onClick={sendMessageWrapper}>Submit</Button>}
            {promptRunning && <Button type="submit" className='ml-3 font-mono w-24 bg-red-400 text-white h-12' onClick={stopAgent}>Stop</Button>}
        </div>
    )
}