import React from 'react';
import { Plus, Users, Hash } from 'lucide-react';

const GroupSidebar = () => {
    // Placeholder mock data based on existing ui pattern
    const joinedGroups = [
        { id: 'math101', name: 'Calculus Study Group', members: 120 },
        { id: 'cs50', name: 'CS50 Discussion', members: 450 },
        { id: 'bio', name: 'Biology 101', members: 89 },
    ];

    return (
        <aside className="hidden md:flex flex-col gap-4 h-full overflow-y-auto custom-scrollbar pr-2 pb-20">
            <div className="flex items-center justify-between px-2 mb-2">
                <h3 className="text-[var(--text-secondary)] font-semibold text-xs tracking-wider uppercase">Your Groups</h3>
                <button className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">
                    <Plus size={16} />
                </button>
            </div>

            <div className="flex flex-col gap-2">
                {joinedGroups.map(group => (
                    <div
                        key={group.id}
                        className="flex items-center gap-3 p-3 rounded-[var(--radius-md)] hover:bg-[var(--glass)] cursor-pointer transition-all border border-transparent hover:border-[var(--glass)]"
                    >
                        <div className="w-10 h-10 rounded-[var(--radius-md)] bg-gradient-to-br from-[var(--neon-purple)]/20 to-[var(--neon-blue)]/20 flex items-center justify-center border border-[var(--glass)] shrink-0">
                            <span className="font-bold text-[var(--accent-primary)] text-lg">
                                {group.name.charAt(0)}
                            </span>
                        </div>
                        <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-semibold text-[var(--text-primary)] truncate">
                                {group.name}
                            </h4>
                            <div className="flex items-center gap-1 text-[11px] text-[var(--text-secondary)]">
                                <Users size={10} />
                                <span>{group.members} members</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <button className="mt-4 flex items-center justify-center gap-2 w-full py-3 rounded-[var(--radius-md)] border border-dashed border-[var(--text-secondary)] text-[var(--text-secondary)] hover:bg-[var(--glass)] hover:text-[var(--text-primary)] transition-all text-sm font-semibold">
                <Plus size={16} />
                Create New Group
            </button>
        </aside>
    );
};

export default GroupSidebar;
