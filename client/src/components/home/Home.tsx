'use client';
import React, { useState } from 'react'
import Icon from '../ui/icon'
import clsx from 'clsx'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { StringAgentUndefined } from '@/types/user';
import Videoplayer from './Videoplayer';
import { Loader } from '../Loader';


interface HomeInterface {
    isSidebarOpen: boolean;
    toggleSidebar: () => void;
    agent: StringAgentUndefined;
    promptRunning: boolean;
    sendMessage: (message: Object) => void;
}

export default function Home({ isSidebarOpen, toggleSidebar, agent, promptRunning, sendMessage }: HomeInterface) {

    const sendMessageWrapper = (text: string) => {
        console.log('at send message wrapper');
        console.log(text);
        sendMessage({ message: text });
    }

    return (
        <>
            {/* Button to toggle sidebar from the main content area */}
            <div className={clsx(isSidebarOpen && 'hidden', 'absolute top-4 left-4 z-10 duration-200')}>
                <Icon type="hamburger" onClick={toggleSidebar} hideBorder={true} />
            </div>
            <div className={`flex-1 min-h-screen transition-margin duration-300 ease-in-out ${isSidebarOpen ? "ml-64" : "ml-0"}`}>
                <div className='w-full h-full flex flex-col items-center justify-start'>
                    <div className='w-full h-full flex flex-col items-center justify-start'>
                        <div className='h-full flex flex-col items-center justify-start w-[70%] max-w-[1200px]'>
                            <h1 className='font-mono text-5xl mt-8 font-bold 2xl:text-6xl'>Agent Livestream</h1>
                            <Agent agent={agent} />
                            <MessageInput sendMessage={sendMessageWrapper} promptRunning={promptRunning} />
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

function Agent({ agent }: { agent: StringAgentUndefined }) {
    return (
        <div className={clsx('w-full mt-8 aspect-video', typeof agent !== 'object' && 'border-2 border-primary rounded-md')}>
            {typeof agent === 'string' &&
                <div className='w-full h-full flex items-center justify-center'>
                    <p className='font-mono text-2xl text-destructive'>{agent}</p>
                </div>
            }

            {typeof agent === 'object' && (
                <Videoplayer path={agent.streamingLink} />
            )}

            {agent === undefined && (
                <Loader text="Fetching agent details" className='w-full h-full flex items-center justify-center' />
            )}
        </ div>
    )
}

function MessageInput({ sendMessage, promptRunning }: { sendMessage: (message: string) => void, promptRunning: boolean }) {
    const [prompt, setPrompt] = useState<string>("");
    return (
        <div className='flex flex-row items-start justify-start mt-8 w-full'>
            <Input type="text" value={prompt} onChange={(e) => { setPrompt(e.target.value) }} placeholder="Message" className='w-full border-border placeholder:font-mono font-mono text-md' />
            <Button type="submit" className='ml-3 font-mono' disabled={promptRunning} onClick={() => { sendMessage(prompt) }}>Submit</Button>
        </div>
    )
}