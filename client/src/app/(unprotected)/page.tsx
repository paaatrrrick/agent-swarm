'use client'
import React, { useEffect, useState } from 'react'
import { SignUpWithGooglePopUp, fireBaseAuth } from '@/helpers/firebase'
import { UserOrBool } from '@/types/user';
import { onAuthStateChanged } from 'firebase/auth';
import { Button } from '@/components/ui/button';
import constants from '@/helpers/constants';
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
    <div className='w-full h-full'>
      <div className='flex justify-center items-center h-full flex-col gap-4'>
        <div className='text-4xl font-bold text-center'>
          Welcome to Home
        </div>
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
      </div>
    </div>
  )
}
