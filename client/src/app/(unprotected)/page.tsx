'use client'
import Home from '@/components/home/Home';
import Sidebar from '@/components/home/Sidebar';
import React, { useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { fireBaseAuth, getAuthToken } from '@/helpers/firebase'
import { Agent, UserOrBool, StringAgentUndefined } from '@/types/user';
import constants from '@/helpers/constants';


const ScreenComponent = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [profile, setProfile] = useState<UserOrBool>(false);
  const [agent, setAgent] = useState<StringAgentUndefined>(undefined);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);


  const getAgent = async (authenticatedRequest: boolean): Promise<void> => {
    if (agent !== undefined) return;
    try {
      if (!authenticatedRequest) {
        const response = await fetch(constants.serverUrl + constants.endpoints.getAgent);
        if (response.ok) {
          const data = await response.json();
          const { workspaceId, streamingLink } = data;
          setAgent({ workspaceId, streamingLink });
          return
        }
        setAgent('Error fetching agent details');
        return
      }
      const token = await getAuthToken();
      const response = await fetch(constants.serverUrl + constants.endpoints.getUsersAgent, {
        headers: {
          'Content-Type': 'application/json',
          'authorization': `Bearer ${token}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        const { workspaceId, streamingLink } = data;
        setAgent({ workspaceId, streamingLink });
        return
      }
      setAgent('Error fetching agent details');
    } catch (error) {
      setAgent('Error fetching agent details');
    }
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(fireBaseAuth, (user) => {
      if (user) {
        setProfile({ profilePicture: user.photoURL || '', name: user.displayName || '', email: user.email ? user.email.split('@')[0] + ' ...' : '' });
        getAgent(true);
      } else {
        setProfile(false);
        getAgent(false);
      }
      return
    });
    return () => { unsubscribe(); }
  }, []);

  return (
    <div className="relative min-h-screen bg-background">
      <Sidebar isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar} profile={profile} />
      <Home isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar} agent={agent} />
    </div>
  );
};

export default ScreenComponent;
