import React from 'react'
import Icon from '../ui/icon'
import clsx from 'clsx'
import windows from '@/images/windows.png'
import Image from 'next/image'
import { Button } from '../ui/button'
import { Input } from '../ui/input'

export default function Home({ isSidebarOpen, toggleSidebar }: { isSidebarOpen: boolean, toggleSidebar: () => void }) {
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
                        <Image src={windows} alt="windows" className='w-[70%] mt-8' />
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
