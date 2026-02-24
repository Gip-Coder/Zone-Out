import React, { useState } from 'react';
import { useThreadContext } from '../../context/ThreadContext';
import { useStudyGroup } from '../../context/StudyGroupContext';
import { ThreadCard } from './ThreadCard';
import { CreateThreadModal } from './CreateThreadModal';

export const ThreadFeed = ({ currentUser }) => {
    const { threads, createThread } = useThreadContext();
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleCreate = (title, body) => {
        createThread(title, body);
        setIsModalOpen(false);
    };

    return (
        <div className="flex flex-col h-full bg-transparent relative overflow-hidden p-6">
            {/* Ambient Background Glow */}
            <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[var(--neon-blue)]/5 rounded-full blur-[140px] pointer-events-none -z-10" />
            <div className="absolute bottom-[-20%] left-[-10%] w-[500px] h-[500px] bg-[var(--neon-purple)]/5 rounded-full blur-[120px] pointer-events-none -z-10" />

            {/* Header */}
            <div className="glass-card mb-6 h-20 flex items-center justify-between px-6 z-10 shrink-0">
                <div>
                    <h2 className="text-2xl font-bold text-white tracking-tight">Discussion Board</h2>
                    <p className="text-xs text-slate-400 mt-1 font-medium">Ask questions, share resources, and collaborate.</p>
                </div>

                <button
                    onClick={() => setIsModalOpen(true)}
                    className="group flex items-center gap-2 bg-gradient-to-r from-[var(--neon-purple)] to-[var(--neon-pink)] text-white px-5 py-2.5 rounded-xl font-semibold transition-all shadow-lg shadow-[var(--neon-purple)]/20 hover:scale-105"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4 transition-transform group-hover:rotate-90">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                    </svg>
                    New Post
                </button>
            </div>

            {/* Feed Content */}
            <div className="flex-1 overflow-y-auto px-2 py-4 scroll-smooth z-10 custom-scrollbar">
                <div className="max-w-3xl mx-auto flex flex-col gap-5">
                    {threads.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-32 text-slate-400 text-center animate-fade-in-up">
                            <div className="relative mb-6">
                                <div className="absolute inset-0 bg-[var(--neon-purple)]/20 rounded-full blur-xl animate-pulse"></div>
                                <div className="relative bg-white/5 p-6 rounded-full border border-white/10 shadow-xl">
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor" className="w-12 h-12 text-[var(--neon-purple)] opacity-80">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
                                    </svg>
                                </div>
                            </div>
                            <h3 className="text-xl font-semibold text-white mb-2">No discussions yet</h3>
                            <p className="text-slate-400 max-w-sm">Be the first to start a conversation, ask a question, or share an interesting resource with the group!</p>

                            <button
                                onClick={() => setIsModalOpen(true)}
                                className="mt-8 px-6 py-2.5 rounded-full border border-white/10 text-slate-300 hover:bg-white/10 hover:text-white transition-colors text-sm font-medium"
                            >
                                Start a discussion
                            </button>
                        </div>
                    ) : (
                        threads.map((thread, index) => (
                            <div key={thread.id} className="animate-fade-in-up" style={{ animationDelay: `${index * 50}ms`, animationFillMode: 'both' }}>
                                <ThreadCard
                                    thread={thread}
                                    currentUser={currentUser}
                                />
                            </div>
                        ))
                    )}
                </div>
            </div>

            <CreateThreadModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSubmit={handleCreate}
            />
        </div>
    );
};
