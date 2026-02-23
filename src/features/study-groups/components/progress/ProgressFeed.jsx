import React, { useState } from 'react';
import { useProgressContext } from '../../context/ProgressContext';
import { useStudyGroup } from '../../context/StudyGroupContext';
import { ProgressCard } from './ProgressCard';
import { AddProgressForm } from './AddProgressForm';

export const ProgressFeed = ({ currentUser }) => {
    const { updates, postUpdate } = useProgressContext();
    const [isFormOpen, setIsFormOpen] = useState(false);

    const handleSubmit = (content, courseTag, mediaUrl) => {
        postUpdate(courseTag, content, mediaUrl);
        setIsFormOpen(false);
    };

    return (
        <div className="flex flex-col h-full bg-[#0E1015] relative overflow-hidden">
            {/* Ambient Background Glow */}
            <div className="absolute top-1/4 left-[-10%] w-[500px] h-[500px] bg-pink-600/5 rounded-full blur-[140px] pointer-events-none -z-10" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-purple-600/5 rounded-full blur-[150px] pointer-events-none -z-10" />

            {/* Header */}
            <div className="h-20 border-b border-gray-800/60 bg-[#14151a]/80 backdrop-blur-md flex items-center justify-between px-8 z-10 shadow-sm sticky top-0">
                <div>
                    <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-100 to-gray-400 bg-clip-text text-transparent tracking-tight">Study Progress</h2>
                    <p className="text-xs text-gray-500 mt-1 font-medium">Share your wins, screenshots, and daily updates.</p>
                </div>

                <button
                    onClick={() => setIsFormOpen(true)}
                    className="group flex items-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white px-5 py-2.5 rounded-xl font-medium transition-all shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 hover:-translate-y-0.5"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4 transition-transform group-hover:rotate-90">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                    </svg>
                    Share Update
                </button>
            </div>

            {/* Feed Content */}
            <div className="flex-1 overflow-y-auto p-8 scroll-smooth z-10 custom-scrollbar">
                <div className="max-w-2xl mx-auto flex flex-col gap-6">
                    {updates.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-32 text-gray-500 text-center animate-fade-in-up">
                            <div className="relative mb-6">
                                <div className="absolute inset-0 bg-purple-500/20 rounded-full blur-xl animate-pulse"></div>
                                <div className="relative bg-[#1c1e26] p-6 rounded-full border border-gray-800 shadow-xl">
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor" className="w-12 h-12 text-purple-400">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
                                    </svg>
                                </div>
                            </div>
                            <h3 className="text-xl font-semibold text-gray-200 mb-2">No progress shared yet</h3>
                            <p className="text-gray-500 max-w-sm">Inspire your group! Be the first to share your recent wins or study screenshots.</p>

                            <button
                                onClick={() => setIsFormOpen(true)}
                                className="mt-8 px-6 py-2.5 rounded-full border border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white transition-colors text-sm font-medium"
                            >
                                Post your first update
                            </button>
                        </div>
                    ) : (
                        updates.map((update, index) => (
                            <div key={update.id} className="animate-fade-in-up" style={{ animationDelay: `${index * 50}ms`, animationFillMode: 'both' }}>
                                <ProgressCard
                                    update={update}
                                    currentUser={currentUser}
                                />
                            </div>
                        ))
                    )}
                </div>
            </div>

            <AddProgressForm
                isOpen={isFormOpen}
                onClose={() => setIsFormOpen(false)}
                onSubmit={handleSubmit}
            />
        </div>
    );
};
