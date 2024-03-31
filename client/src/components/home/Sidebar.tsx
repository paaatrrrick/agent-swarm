'use client';
import React, { useState } from 'react'
import { SignUpWithGooglePopUp, fireBaseAuth } from '@/helpers/firebase'
import { signOut } from "firebase/auth";
import Icon from '@/components/ui/icon';
import { ModeToggle } from '../ui/ModeToggle';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import constants from '@/helpers/constants';
import { UserOrBool } from '@/types/user';

export default function Sidebar({ isSidebarOpen, toggleSidebar, profile, selectedAgent, setSelectedAgent }: { isSidebarOpen: boolean, toggleSidebar: () => void, profile: UserOrBool, selectedAgent: string, setSelectedAgent: (agentName: string) => void }) {
    const [agents, setAgents] = useState<string[]>(["Demo"]);

    const addNewAgent = () => {
        setAgents([...agents, "Untitled"]);
    }

    return (
        <div className={`fixed inset-y-0 left-0 flex flex-col items-start justify-between
        w-64 bg-secondary z-20 transition-transform duration-300 ease-in-out p-2
        transform ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}
        `}>
            {/* top */}
            <div className='flex flex-col justify-start items-start w-full'>
                <div className='w-full flex justify-between items-center'>
                    <h3 className='font-mono text-xl'>Agent Swarm 🐝</h3>
                    <Icon type="hamburger" onClick={toggleSidebar} />
                </div>
                <div className='mt-4'>
                    {agents.map((agent, index) => (
                        <div
                            key={index}
                            className={`p-2 rounded-md cursor-pointer font-mono ${selectedAgent === agent ? 'bg-primary text-white' : 'bg-background hover:bg-gray-100'}`}
                            onClick={() => setSelectedAgent(agent)}
                        >
                            {agent} ({index})
                        </div>
                    ))}
                    <button
                        className='bg-primary text-white p-2 rounded-md mt-2 w-full font-mono'
                        onClick={addNewAgent}
                    >
                        New Agent
                    </button>
                </div>
            </div>

            {/* bottom */}
            <div className='w-full'>
                <div className='w-full flex flex-row items-center justify-center gap-2'>
                    <ModeToggle />
                    <Icon type='github' onClick={() => { window.open(constants.githubUrl, "_blank"); }} />
                    <Icon type='twitter' onClick={() => { window.open(constants.twitterUrl, "_blank"); }} />
                </div>
                {
                    typeof profile === "object" &&

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild className='hover:cursor-pointer bg-secondary hover:bg-background'>
                            <div className='w-full flex items-center rounded-sm border-border border mt-2 mb-2 px-4 h-16 hover:cursor-pointer'>
                                <div className="flex items-center justify-center">
                                    <img src={profile.profilePicture} alt="Profile Picture" className="h-10 w-10 rounded-full" />
                                </div>
                                <div className='ml-4'>
                                    <p className='font-mono text-sm'>{profile.name}</p>
                                    <p className='font-mono text-xs'>{profile.email.slice(0, 18)}...</p>
                                </div>
                            </div>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => { signOut(fireBaseAuth) }} className='hover:cursor-pointer'>
                                <p>Logout</p>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>

                }

                {
                    !profile &&
                    <button className="h-16 bg-secondary border border-border rounded-md px-3 w-full flex items-center justify-start mt-4 hover:cursor-pointer hover:bg-background" onClick={() => { SignUpWithGooglePopUp(() => { }) }}>
                        <img src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTgiIGhlaWdodD0iMTgiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGcgZmlsbD0ibm9uZSIgZmlsbC1ydWxlPSJldmVub2RkIj48cGF0aCBkPSJNMTcuNiA5LjJsLS4xLTEuOEg5djMuNGg0LjhDMTMuNiAxMiAxMyAxMyAxMiAxMy42djIuMmgzYTguOCA4LjggMCAwIDAgMi42LTYuNnoiIGZpbGw9IiM0Mjg1RjQiIGZpbGwtcnVsZT0ibm9uemVybyIvPjxwYXRoIGQ9Ik05IDE4YzIuNCAwIDQuNS0uOCA2LTIuMmwtMy0yLjJhNS40IDUuNCAwIDAgMS04LTIuOUgxVjEzYTkgOSAwIDAgMCA4IDV6IiBmaWxsPSIjMzRBODUzIiBmaWxsLXJ1bGU9Im5vbnplcm8iLz48cGF0aCBkPSJNNCAxMC43YTUuNCA1LjQgMCAwIDEgMC0zLjRWNUgxYTkgOSAwIDAgMCAwIDhsMy0yLjN6IiBmaWxsPSIjRkJCQzA1IiBmaWxsLXJ1bGU9Im5vbnplcm8iLz48cGF0aCBkPSJNOSAzLjZjMS4zIDAgMi41LjQgMy40IDEuM0wxNSAyLjNBOSA5IDAgMCAwIDEgNWwzIDIuNGE1LjQgNS40IDAgMCAxIDUtMy43eiIgZmlsbD0iI0VBNDMzNSIgZmlsbC1ydWxlPSJub256ZXJvIi8+PHBhdGggZD0iTTAgMGgxOHYxOEgweiIvPjwvZz48L3N2Zz4=" />
                        <p className='text-sm ml-4 font-mono'>Join with Google</p>
                    </button>
                }
            </div>
        </div>
    )
}