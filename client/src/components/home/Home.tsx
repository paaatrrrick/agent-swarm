'use client';
import React from 'react'
import Icon from '../ui/icon'
import clsx from 'clsx'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { StringAgentUndefined } from '@/types/user';
import { Loader } from '../Loader';

export default function Home({ isSidebarOpen, toggleSidebar, agent }: { isSidebarOpen: boolean, toggleSidebar: () => void, agent: StringAgentUndefined }) {
    return (
        <>
            {/* Button to toggle sidebar from the main content area */}
            <div className={clsx(isSidebarOpen && 'hidden', 'absolute top-4 left-4 z-10 duration-200')}>
                <Icon type="hamburger" onClick={toggleSidebar} hideBorder={true} />
            </div>
            <div className={`flex-1 min-h-screen transition-margin duration-300 ease-in-out ${isSidebarOpen ? "ml-64" : "ml-0"}`}>
                <div className='w-full h-full flex flex-col items-center justify-start'>
                    <div className='w-full h-full flex flex-col items-center justify-start max-w-[1200px]'>
                        <h1 className='font-mono text-4xl mt-8 font-bold'>Agent Livestream</h1>
                        <Agent agent={agent} />
                        <div className='flex flex-row items-start justify-start mt-8'>
                            <Input type="text" placeholder="Message" className='w-[700px] border-border placeholder:font-mono' />
                            <Button type="submit" className='ml-3 font-mono'>Submit</Button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

function Agent({ agent }: { agent: StringAgentUndefined }) {
    return (
        <div className='w-[70%] mt-8 aspect-video'>

            {
                typeof agent === 'string' && <p className='font-mono text-2xl text-red-500'>{agent}</p>
            }

            {
                typeof agent === 'object' && (
                    <div className='flex flex-col items-start justify-start'>
                        <p className='font-mono text-2xl'>Workspace ID: {agent.workspaceId}</p>
                        <p className='font-mono text-2xl'>Streaming Link: {agent.streamingLink}</p>
                    </div>
                )
            }

            {
                agent === undefined && (
                    <Loader text="Fetching agent details" className='w-full h-full' />
                )
            }
        </div>
    )
}
