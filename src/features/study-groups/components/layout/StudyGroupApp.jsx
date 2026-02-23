import React, { useState } from 'react';
import { StudyGroupProvider } from '../../context/StudyGroupContext';
import { ChatProvider } from '../../context/ChatContext';
import { ThreadProvider } from '../../context/ThreadContext';
import { ProgressProvider } from '../../context/ProgressContext';

import { ChatContainer } from '../chat/ChatContainer';
import { ThreadFeed } from '../threads/ThreadFeed';
import { ProgressFeed } from '../progress/ProgressFeed';
import { SidebarPresence } from './SidebarPresence';

const NavigationMenu = ({ activeTab, setActiveTab }) => {
    const tabs = [
        { id: 'chat', label: 'Live Chat', icon: 'M8.625 9.75a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375m-13.5 3.01c0 1.6 1.123 2.994 2.707 3.227 1.087.16 2.185.283 3.293.369V21l4.184-4.183a1.14 1.14 0 01.778-.332 48.294 48.294 0 005.83-.498c1.585-.233 2.708-1.626 2.708-3.228V6.741c0-1.602-1.123-2.995-2.708-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z' },
        { id: 'threads', label: 'Discussion', icon: 'M12 20.25c4.97 0 9-3.694 9-8.25s-4.03-8.25-9-8.25S3 7.444 3 12c0 2.104.859 4.023 2.273 5.48.432.447.74 1.04.586 1.641a4.483 4.483 0 01-.923 1.785A5.969 5.969 0 006 21c1.282 0 2.47-.402 3.445-1.087.81.22 1.668.337 2.555.337z' },
        { id: 'progress', label: 'Updates', icon: 'M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z' }
    ];

    return (
        <div className="flex flex-col gap-2 p-4">
            {tabs.map(tab => (
                <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-3 w-full p-3 rounded-lg font-medium transition-all ${activeTab === tab.id
                            ? 'bg-indigo-600/10 text-indigo-400'
                            : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800'
                        }`}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={activeTab === tab.id ? 2 : 1.5} stroke="currentColor" className="w-6 h-6">
                        <path strokeLinecap="round" strokeLinejoin="round" d={tab.icon} />
                    </svg>
                    <span className="hidden lg:block">{tab.label}</span>
                </button>
            ))}
        </div>
    );
};

export const StudyGroupApp = ({ groupId, currentUser }) => {
    const [activeTab, setActiveTab] = useState('chat');

    return (
        <StudyGroupProvider groupId={groupId} currentUser={currentUser}>
            <ChatProvider groupId={groupId} currentUser={currentUser}>
                <ThreadProvider groupId={groupId} currentUser={currentUser}>
                    <ProgressProvider groupId={groupId} currentUser={currentUser}>

                        <div className="flex h-full min-h-screen bg-[#0E1015] text-gray-200 font-sans overflow-hidden border border-gray-800 shadow-2xl rounded-xl">
                            {/* Left Navigation */}
                            <aside className="w-16 lg:w-64 bg-[#14151a] border-r border-gray-800 flex flex-col pt-6">
                                <div className="px-4 lg:px-6 mb-8 text-center lg:text-left">
                                    <div className="w-8 h-8 lg:w-10 lg:h-10 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold mb-3 mx-auto lg:mx-0 shadow-lg shadow-indigo-500/30">
                                        SG
                                    </div>
                                    <h1 className="hidden lg:block font-bold text-lg text-gray-100 truncate">Advanced React</h1>
                                    <p className="hidden lg:block text-xs font-semibold text-gray-500 tracking-wider">STUDY GROUP</p>
                                </div>

                                <NavigationMenu activeTab={activeTab} setActiveTab={setActiveTab} />

                                <div className="mt-auto p-4 border-t border-gray-800 mt-6 hidden lg:block">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-gray-700 font-bold flex items-center justify-center text-white">
                                            {currentUser?.name?.[0] || 'U'}
                                        </div>
                                        <div className="overflow-hidden">
                                            <div className="text-sm font-semibold text-gray-200 truncate">{currentUser?.name || 'You'}</div>
                                            <div className="text-xs text-gray-500 truncate">Settings</div>
                                        </div>
                                    </div>
                                </div>
                            </aside>

                            {/* Main Active Panel */}
                            <main className="flex-1 flex flex-col min-w-0 bg-[#0E1015]">
                                {activeTab === 'chat' && <ChatContainer currentUser={currentUser} />}
                                {activeTab === 'threads' && <ThreadFeed currentUser={currentUser} />}
                                {activeTab === 'progress' && <ProgressFeed currentUser={currentUser} />}
                            </main>

                            {/* Right Presence Sidebar (Hidden on tablets/mobile) */}
                            <aside className="w-72 bg-[#14151a] border-l border-gray-800 hidden xl:flex flex-col">
                                <SidebarPresence />
                            </aside>
                        </div>

                    </ProgressProvider>
                </ThreadProvider>
            </ChatProvider>
        </StudyGroupProvider>
    );
};

export default StudyGroupApp;
