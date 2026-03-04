import React from 'react';
import { Search, Plus } from 'lucide-react';

const StudyGroupsHeader = () => {
    return (
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
            <div>
                <h1 className="page-title text-[var(--text-primary)]">Study Groups</h1>
                <p className="page-subtitle">Collaborate with peers and share study progress</p>
            </div>

            <div className="flex items-center gap-4">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]" size={18} />
                    <input
                        type="text"
                        placeholder="Search groups..."
                        className="bg-[var(--bg-tertiary,var(--bg-secondary))] border border-[var(--glass)] rounded-xl py-2 pl-10 pr-4 text-sm text-[var(--text-secondary)] focus:outline-none focus:border-[var(--neon-purple)]/50 w-full sm:w-64 transition-all"
                    />
                </div>
                <button className="btn btn-primary shadow-lg shadow-[var(--neon-purple)]/20 whitespace-nowrap shrink-0">
                    <Plus size={18} />
                    <span>Create Group</span>
                </button>
            </div>
        </header>
    );
};

export default StudyGroupsHeader;
