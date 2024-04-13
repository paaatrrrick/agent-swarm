'use client'
import React, { useEffect, useState } from 'react'
import { SignUpWithGooglePopUp, fireBaseAuth } from '@/helpers/firebase'
import { UserOrBool } from '@/types/user';
import { onAuthStateChanged } from 'firebase/auth';
import { Button } from '@/components/ui/button';
import constants from '@/helpers/constants';
import { BackgroundBeams } from '@/components/ui/background-beams';
export default function Page() {
  const [profile, setProfile] = useState<UserOrBool>(false);


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
    <div className='w-full h-full bg-primary dark:bg-primary-foreground'>
      <div className='hidden lg:flex'>
        <BackgroundBeams />
      </div>

      {/*absolutely position to center a div */}
      <div
        className="absolute top-1/3 left-1/2 transform -translate-x-1/2 -translate-y-1/3 flex flex-col items-start justify-start gap-8 w-[95vw] lg:w-[1000px]"
      >
        <h1 className='font-extrabold	text-white text-4xl lg:text-6xl'>Benchmark Multimodal AI Agents</h1>
        <p className='text-white text-lg font-mono'>Assign Open-Ended tasks to VLM-Agents running locally on Virtual Desktops</p>
        <div className="flex flex-col items-start gap-4 lg:flex-row lg:gap-0">
          <a
            href="https://twitter.com/gautam_sharda_"
            target="_blank"
            rel="noopener noreferrer"
            className="relative inline-flex h-12 overflow-hidden rounded-full p-[1px] focus:outline-none"
          >
            <span className="absolute inset-[-1000%] animate-[spin_2s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#E2CBFF_0%,#393BB2_50%,#E2CBFF_100%)]" />
            <span className="inline-flex h-full w-full cursor-pointer items-center justify-center rounded-full bg-primary dark:bg-primary-foreground px-8 py-1 text-md font-lg text-white backdrop-blur-3xl font-mono">
              Get in touch
            </span>
          </a>
          <button className="bg-primary dark:bg-primary-foreground border border-border rounded-full h-12 lg:ml-4 px-3 w-sm flex items-center justify-start hover:cursor-pointer hover:bg-background" onClick={() => { SignUpWithGooglePopUp(() => { window.location.href = constants.routes.dashboard }) }}>
            <img src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTgiIGhlaWdodD0iMTgiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGcgZmlsbD0ibm9uZSIgZmlsbC1ydWxlPSJldmVub2RkIj48cGF0aCBkPSJNMTcuNiA5LjJsLS4xLTEuOEg5djMuNGg0LjhDMTMuNiAxMiAxMyAxMyAxMiAxMy42djIuMmgzYTguOCA4LjggMCAwIDAgMi42LTYuNnoiIGZpbGw9IiM0Mjg1RjQiIGZpbGwtcnVsZT0ibm9uemVybyIvPjxwYXRoIGQ9Ik05IDE4YzIuNCAwIDQuNS0uOCA2LTIuMmwtMy0yLjJhNS40IDUuNCAwIDAgMS04LTIuOUgxVjEzYTkgOSAwIDAgMCA4IDV6IiBmaWxsPSIjMzRBODUzIiBmaWxsLXJ1bGU9Im5vbnplcm8iLz48cGF0aCBkPSJNNCAxMC43YTUuNCA1LjQgMCAwIDEgMC0zLjRWNUgxYTkgOSAwIDAgMCAwIDhsMy0yLjN6IiBmaWxsPSIjRkJCQzA1IiBmaWxsLXJ1bGU9Im5vbnplcm8iLz48cGF0aCBkPSJNOSAzLjZjMS4zIDAgMi41LjQgMy40IDEuM0wxNSAyLjNBOSA5IDAgMCAwIDEgNWwzIDIuNGE1LjQgNS40IDAgMCAxIDUtMy43eiIgZmlsbD0iI0VBNDMzNSIgZmlsbC1ydWxlPSJub256ZXJvIi8+PHBhdGggZD0iTTAgMGgxOHYxOEgweiIvPjwvZz48L3N2Zz4=" />
            <p className='text-sm ml-2 font-mono'>Join with Google</p>
          </button>
        </div>
      </div>


      {/* <div className='flex justify-center items-center h-full flex-col gap-4'>
        <h1 className='text-4xl font-bold text-center'>
          Radah
        </h1>
        <Button onClick={() => { window.location.href = constants.routes.dashboard }}>Go To Agent Screen (Radah is under construction! If you're here, you should probably DM me on Twitter @gautam_sharda_.</Button>

        {typeof profile === "object" &&
          <div className='w-sm flex items-center rounded-sm border-border border mt-2 mb-2 px-4 py-2 hover:cursor-pointer'>
            <div className="flex items-center justify-center">
              <img src={profile.profilePicture} alt="Profile Picture" className="h-10 w-10 rounded-full" />
            </div>
            <div className='ml-4'>
              <p className='font-mono text-sm'>{profile.name}</p>
              <p className='font-mono text-xs'>{profile.email.slice(0, 18)}...</p>
            </div>
          </div>
        }


        {!profile &&
          <button className="bg-secondary border border-border rounded-md h-12 px-3 w-sm flex items-center justify-start mt-4 hover:cursor-pointer hover:bg-background" onClick={() => { SignUpWithGooglePopUp(() => { }) }}>
            <img src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTgiIGhlaWdodD0iMTgiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGcgZmlsbD0ibm9uZSIgZmlsbC1ydWxlPSJldmVub2RkIj48cGF0aCBkPSJNMTcuNiA5LjJsLS4xLTEuOEg5djMuNGg0LjhDMTMuNiAxMiAxMyAxMyAxMiAxMy42djIuMmgzYTguOCA4LjggMCAwIDAgMi42LTYuNnoiIGZpbGw9IiM0Mjg1RjQiIGZpbGwtcnVsZT0ibm9uemVybyIvPjxwYXRoIGQ9Ik05IDE4YzIuNCAwIDQuNS0uOCA2LTIuMmwtMy0yLjJhNS40IDUuNCAwIDAgMS04LTIuOUgxVjEzYTkgOSAwIDAgMCA4IDV6IiBmaWxsPSIjMzRBODUzIiBmaWxsLXJ1bGU9Im5vbnplcm8iLz48cGF0aCBkPSJNNCAxMC43YTUuNCA1LjQgMCAwIDEgMC0zLjRWNUgxYTkgOSAwIDAgMCAwIDhsMy0yLjN6IiBmaWxsPSIjRkJCQzA1IiBmaWxsLXJ1bGU9Im5vbnplcm8iLz48cGF0aCBkPSJNOSAzLjZjMS4zIDAgMi41LjQgMy40IDEuM0wxNSAyLjNBOSA5IDAgMCAwIDEgNWwzIDIuNGE1LjQgNS40IDAgMCAxIDUtMy43eiIgZmlsbD0iI0VBNDMzNSIgZmlsbC1ydWxlPSJub256ZXJvIi8+PHBhdGggZD0iTTAgMGgxOHYxOEgweiIvPjwvZz48L3N2Zz4=" />
            <p className='text-sm ml-2'>Join with Google</p>
          </button>
        }
      </div> */}
    </div>
  )
}
