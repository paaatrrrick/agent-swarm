'use client';
import React, { useState } from 'react'
import { SignUpWithGooglePopUp, fireBaseAuth, getAuthToken } from '@/helpers/firebase'
import { signOut } from "firebase/auth";
import Icon from '@/components/ui/icon';
import { ModeToggle } from '../ui/ModeToggle';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogClose,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import constants from '@/helpers/constants';
import { UserOrBool, StringAgentUndefined } from '@/types/user';
import { Button } from '../ui/button';
import clsx from 'clsx';
import { Textarea } from '../ui/textarea';
import { useError } from '@/context/ErrorContext';

interface SidebarInterface {
    isSidebarOpen: boolean,
    toggleSidebar: () => void,
    profile: UserOrBool,
    agents: StringAgentUndefined[],
    currentAgentIndex: number | undefined,
    setCurrentAgentIndex: (index: number) => void,
    addAgent: () => void,
}

export default function Sidebar({ isSidebarOpen, toggleSidebar, profile, agents, currentAgentIndex, setCurrentAgentIndex, addAgent }: SidebarInterface) {
    const [requestAgentTextArea, setRequestAgentTextAre] = useState<string>("")
    const { setError } = useError();

    const submitRequestAgent = async () => {
        const token = await getAuthToken();
        const response = await fetch(constants.serverUrl + constants.endpoints.requestAgent, {
            method: "POST",
            headers: {
                'Content-Type': 'application/json',
                'authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({ reason: requestAgentTextArea })
        });
        setRequestAgentTextAre("")
        if (!response.ok) {
            setError({ primaryMessage: "Failed to send request", secondaryMessage: "Please try again later", type: "error" })
            return;
        }
        setError({ primaryMessage: "You've successfully requested another agent", secondaryMessage: "We will get back to you within 48 hours", type: "success" })
    }

    return (
        <div className={`fixed inset-y-0 left-0 flex flex-col items-start justify-between
        w-64 bg-secondary z-20 transition-transform duration-300 ease-in-out p-4
        transform ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}
        `}>
            {/* top */}
            <div className='flex flex-col justify-start items-start w-full'>
                <div className='w-full flex justify-between items-center'>
                    <h3 className='font-mono text-xl'>Radah.ai</h3>
                    <Icon type="hamburger" onClick={toggleSidebar} />
                </div>
                <hr className='w-full border-primary border-1 mt-4' />
                <div className='mt-4 w-full gap-4 flex flex-col items-start justify-start'>
                    {agents.map((agent, index) => (
                        <Button className={clsx('w-full', currentAgentIndex === index && 'bg-purple-500 text-white hover:bg-purple-600')} onClick={() => { setCurrentAgentIndex(index) }} key={index}>
                            <p className='mr-2'>Agent</p>#{index + 1}
                        </Button>
                    ))}
                    <Dialog>
                        <DialogTrigger asChild>
                            <Button className='w-full border-2 hover:bg-transparent text-primary font-semibold border-primary bg-offbackground'>
                                Requent Another Agent +
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[425px]">
                            <DialogHeader>
                                <DialogTitle>Request Another Agent</DialogTitle>
                                <DialogDescription>
                                    Share why you are looking for another agent. We should be able to get back to you within 48 hours.
                                </DialogDescription>
                            </DialogHeader>
                            <div className="grid w-full gap-1.5 py-4">
                                <Label htmlFor="request">
                                    Reason for request
                                </Label>
                                <Textarea id="request" placeholder="looking to benchmark open interpreter..." value={requestAgentTextArea}
                                    onChange={(e) => { setRequestAgentTextAre(e.target.value) }}
                                />
                            </div>
                            <DialogFooter>
                                <DialogClose asChild>
                                    <Button type="submit" className='bg-purple-500 hover:bg-purple-600 text-white' onClick={submitRequestAgent}
                                        disabled={requestAgentTextArea.length <= 10}
                                    >Submit</Button>
                                </DialogClose>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
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
                                <div className="flex items-center justify-center m-0">
                                    <img src={profile.profilePicture} alt="Profile Picture" className="h-10 w-10 rounded-full" />
                                </div>
                                <div className='ml-4'>
                                    <p className='font-mono text-sm'>{profile.name}</p>
                                    <p className='font-mono text-xs'>{profile.email.slice(0, 14)}...</p>
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