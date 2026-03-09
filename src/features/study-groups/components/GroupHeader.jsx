import React from 'react';
import { Search, Settings, Share2, Bell } from 'lucide-react';

const GroupHeader = () => {
    return (
        <div className="bg-[var(--bg-secondary)] border border-[rgba(255,255,255,0.08)] rounded-[var(--radius-md)] p-6 shadow-lg relative overflow-hidden flex flex-col sm:flex-row gap-6 justify-between items-start sm:items-center">

            {/* Ambient background effect */}
            <div className="absolute -top-20 -right-20 w-64 h-64 bg-[var(--neon-purple)] opacity-20 blur-[80px] rounded-full pointer-events-none"></div>

            <div className="relative z-10">
                <div className="flex items-center gap-3 mb-2">
                    <h1 className="text-2xl font-bold text-[var(--text-primary)] m-0">
                        Study Group Feed
                    </h1>
                    <span className="bg-[var(--accent-tertiary)] text-white text-[10px] uppercase font-bold px-2 py-0.5 rounded-full tracking-wider shadow-[0_0_10px_rgba(168,85,247,0.4)]">
                        Active
                    </span>
                </div>
                <p className="text-[var(--text-secondary)] text-sm m-0 max-w-lg">
                    Welcome to the central hub for all your study group activities. Share resources, ask questions, and collaborate.
                </p>
            </div>

            <div className="flex items-center gap-3 relative z-10 w-full sm:w-auto">
                <div className="relative flex-1 sm:w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]" size={16} />
                    <input
                        type="text"
                        placeholder="Search posts..."
                        className="w-full bg-[var(--bg-tertiary)] border border-[rgba(255,255,255,0.1)] rounded-[var(--radius-md)] py-2 pl-9 pr-4 text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-primary)] transition-colors placeholder:text-[var(--text-secondary)]"
                    />
                </div>

                <button className="flex items-center justify-center p-2.5 rounded-[var(--radius-md)] bg-[var(--bg-tertiary)] border border-[rgba(255,255,255,0.1)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--accent-primary)] transition-all shrink-0 relative">
                    <Bell size={18} />
                    <span className="absolute top-2 right-2 w-2 h-2 bg-[var(--neon-pink)] rounded-full border border-[var(--bg-tertiary)]"></span>
                </button>

                <button className="flex items-center justify-center p-2.5 rounded-[var(--radius-md)] bg-[var(--bg-tertiary)] border border-[rgba(255,255,255,0.1)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--accent-primary)] transition-all shrink-0">
                    <Settings size={18} />
                </button>
            </div>
        </div>
    );
};

export default GroupHeader;
