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
    var reducedMessages = agentMessages.filter((message) => { return message.role === "user" || message.role === "assistant" || message.role === "computer" })


    //remove all messages where message.content is undefined or an empty string
    reducedMessages = reducedMessages.filter((message) => { return message.content !== undefined && message.content !== "" })


    return (
        <div className={`fixed inset-y-0 right-0 flex flex-col items-start justify-between
        w-96 bg-secondary z-20 transition-transform duration-300 ease-in-out px-4 pt-4
        transform ${isSidebarOpen ? "translate-x-0" : "translate-x-full"}
        `}>

            {/* top */}
            <div className='flex flex-col justify-start items-start w-full mb-4'>
                <div className='w-full flex justify-between items-center'>
                    <div className="flex items-center">
                        <h3 className='font-mono text-xl'>Messages</h3>
                        <h3 className='font-mono text-2xl ml-3'>🤖</h3>
                    </div>
                    <Icon type="Cross1Icon" onClick={toggleSidebar} />
                </div>
                <hr className='w-full border-primary border-1 mt-4' />
            </div>


            {reducedMessages.length === 0 &&
                <p className='font-mono'>Run a prompt to see messages appear</p>
            }

            <div className='flex-1 w-full gap-4 flex items-start flex-col justify-start overflow-y-scroll hideScrollBar pb-16'>

                {reducedMessages.map((message, index) => {
                    // @ts-ignore
                    const Component = typeToComponent[message.role]
                    return <Component key={index} {...message} />
                })}
            </div>
        </div>
    )
}


const messageClassnames = 'flex flex-col items-start justify-start w-full rounded-sm bg-background border py-2 px-2 gap-2 border-2'
const textClassnames = 'text-xs font-mono'
const h6Classnames = 'text-sm font-mono'
const defaultCodeStyles = 'text-xs font-mono border border-primary rounded-sm w-full border-2'


function UserMessage({ role, type, format, content }: AgentMessage) {
    return (
        <div className={clsx(messageClassnames, 'border-green-500')}>
            <h6 className={clsx(h6Classnames)}>User Message: 🤨</h6>
            <p className={clsx(textClassnames)}>{content}</p>
        </div>
    )
}


function AssistantMessage({ role, type, format, content }: AgentMessage) {
    if (format === "python" || format === "javascript" || type === "code") {
        return (
            <>
                <div className={clsx(defaultCodeStyles, 'hidden dark:flex dark:flex-col dark:items-start dark:justify-start bg-[#282b36]')}>
                    <p className='italic ml-2 mt-2'>{format}</p>
                    <CodeBlock
                        text={content}
                        language={format}
                        showLineNumbers={false}
                        wrapLongLines={true}
                        theme={dracula}
                    />
                </div>
                <div className={clsx(defaultCodeStyles, 'flex flex-col items-start justify-start dark:hidden bg-white')}>
                    <p className='italic ml-2 mt-2'>{format}</p>
                    <CodeBlock
                        text={content}
                        language={format}
                        showLineNumbers={false}
                        wrapLongLines={true}
                        theme={googlecode}
                    />
                </div>
            </>
        )
    }
    return (
        <div className={clsx(messageClassnames, 'border-blue-500')}>
            <h6 className={clsx(h6Classnames)}>Assistant: 🔧</h6>
            <p className={clsx(textClassnames)}>{content}</p>
        </div>
    )
}

function ComputerMessage({ role, type, format, content }: AgentMessage) {
    return (
        <div className={clsx(messageClassnames, 'border-purple-500')}>
            <h6 className={clsx(h6Classnames)}>Computer: 🖥</h6>
            <p className={clsx(textClassnames)}>{content}</p>
        </div>
    )
}