import React from 'react';

const StudyGroupsLayout = ({ sidebar, feed, rightPanel }) => {
    return (
        <div className="flex h-screen bg-[#0E1015] text-gray-200 font-sans overflow-hidden">
            {/* Ambient Background Glow (matching previous styling) */}
            <div className="absolute top-1/4 left-[-10%] w-[500px] h-[500px] bg-[var(--neon-pink)]/5 rounded-full blur-[140px] pointer-events-none -z-10" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-[var(--neon-purple)]/5 rounded-full blur-[150px] pointer-events-none -z-10" />

            {/* CSS Grid for Structural Requirements */}
            {/* Grid structure: Sidebar (240px) | Main Feed (flexible) | Right Panel (320px) */}
            <div className="w-full max-w-[1600px] mx-auto grid grid-cols-1 md:grid-cols-[64px_1fr] lg:grid-cols-[240px_1fr] xl:grid-cols-[240px_1fr_320px] gap-6 p-4 h-full relative">

                {/* 1. Sidebar Column */}
                <aside className="hidden md:flex flex-col h-full bg-[#14151a]/80 backdrop-blur-md border border-white/5 rounded-2xl overflow-hidden self-start sticky top-4">
                    {sidebar}
                </aside>

                {/* 2. Main Feed Column */}
                <main className="flex flex-col h-full overflow-y-auto custom-scrollbar min-w-0 pb-20">
                    {feed}
                </main>

                {/* 3. Right Panel Column */}
                <aside className="hidden xl:flex flex-col h-full gap-6 overflow-y-auto custom-scrollbar pt-2 pb-20 sticky top-4">
                    {rightPanel}
                </aside>

            </div>
        </div>
    );
};

export default StudyGroupsLayout;
