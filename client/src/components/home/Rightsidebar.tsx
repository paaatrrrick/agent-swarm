'use client';
import React from 'react'
import Icon from '../ui/icon';
import AgentMessage from '@/types/websocket';
import { CodeBlock, dracula, googlecode } from "react-code-blocks";
import clsx from 'clsx';



// type role = 'user' | 'assistant' | 'computer';
// type type = "message" | "code" | "console";
// type format = 'python' | "output" | "active_line" | string;


// interface AgentMessage {
//     role: string;
//     type: string;
//     format?: string;
//     content: string;
// }



interface SidebarInterface {
    isSidebarOpen: boolean,
    toggleSidebar: () => void,
    agentMessages: AgentMessage[]
}



const typeToComponent = {
    "user": UserMessage,
    "assistant": AssistantMessage,
    "computer": ComputerMessage
}

export default function Rightsidebar({ isSidebarOpen, toggleSidebar, agentMessages }: SidebarInterface) {

    //remove all agentMessges where the role is not user, assistant, or computer
    const reducedMessages = agentMessages.filter((message) => { return message.role === "user" || message.role === "assistant" || message.role === "computer" })


    return (
        <div className={`fixed inset-y-0 right-0 flex flex-col items-start justify-between
        w-72 bg-secondary z-20 transition-transform duration-300 ease-in-out p-4
        transform ${isSidebarOpen ? "translate-x-0" : "translate-x-full"}
        `}>

            {/* top */}
            <div className='flex flex-col justify-start items-start w-full mb-4'>
                <div className='w-full flex justify-between items-center'>
                    <div className="flex items-center">
                        <h3 className='font-mono text-lg'>Messages</h3>
                        <h3 className='font-mono text-2xl ml-3'>🤖</h3>
                    </div>
                    <Icon type="Cross1Icon" onClick={toggleSidebar} />
                </div>
            </div>


            <div className='flex-1 w-full gap-4 flex items-start flex-col justify-start overflow-y-scroll hideScrollBar pb-16 pt-8'>
                {reducedMessages.map((message, index) => {
                    // @ts-ignore
                    const Component = typeToComponent[message.role]
                    return <Component key={index} {...message} />
                })}
            </div>
        </div>
    )
}


const messageClassnames = 'flex flex-col items-start justify-start w-full rounded-sm bg-background border border-primary'
const textClassnames = 'text-primary py-1 px-2 text-sm'

function UserMessage({ role, type, format, content }: AgentMessage) {
    return (
        <div className={clsx(messageClassnames)}>
            <p className={clsx(textClassnames)}>{content}</p>
        </div>
    )
}


function AssistantMessage({ role, type, format, content }: AgentMessage) {
    if (format === "python" || format === "javascript") {
        return (
            <div className='flex flex-col items-start justify-start text-sm font-mono border border-primary rounded-sm w-full'>
                <div className='w-full text-sm font-mono hidden dark:flex dark:flex-col dark:items-start dark:justify-start'>
                    <CodeBlock
                        text={content}
                        language={format}
                        showLineNumbers={false}
                        wrapLongLines={true}
                        theme={dracula}
                    />
                </div>
                <div className='flex flex-col items-start justify-start text-sm font-mono dark:hidden w-full'>
                    <CodeBlock
                        text={content}
                        language={format}
                        showLineNumbers={false}
                        wrapLongLines={true}
                        theme={googlecode}
                    />
                </div>
            </div>
        )
    }
    return (
        <div className={clsx(messageClassnames)}>
            <p className={clsx(textClassnames)}>{content}</p>
        </div>
    )
}

function ComputerMessage({ role, type, format, content }: AgentMessage) {
    return (
        <div className={clsx(messageClassnames)}>
            <p className={clsx(textClassnames)}>{content}</p>
        </div>
    )
}