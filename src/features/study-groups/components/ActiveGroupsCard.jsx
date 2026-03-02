import React from 'react';
import { ChevronRight } from 'lucide-react';

const MOCK_GROUPS = [
    {
        title: 'Data Science Sprint',
        stats: '24 members for 75 groups',
        image: 'https://picsum.photos/seed/ds/100/100',
    },
    {
        title: 'Cyberpunk Coding',
        stats: '35 minutes left for 15 sessions',
        image: 'https://picsum.photos/seed/cyber/100/100',
    },
    {
        title: 'Neerito Data',
        stats: '12 active for 75 groups',
        image: 'https://picsum.photos/seed/data/100/100',
    },
];

const ActiveGroupsCard = () => {
    return (
        <div className="glass-card p-5">
            <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-4">Active Focus Groups</h3>
            <div className="space-y-4">
                {MOCK_GROUPS.map((group) => (
                    <div key={group.title} className="flex items-center gap-3 p-2 rounded-xl hover:bg-[var(--glass)] transition-colors cursor-pointer group">
                        <img
                            src={group.image}
                            alt={group.title}
                            className="w-12 h-12 rounded-lg object-cover border border-[var(--glass)] shrink-0"
                            referrerPolicy="no-referrer"
                        />
                        <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-medium text-[var(--text-primary)] truncate">{group.title}</h4>
                            <p className="text-[10px] text-[var(--text-secondary)] truncate">{group.stats}</p>
                        </div>
                        <ChevronRight size={16} className="text-[var(--text-secondary)] group-hover:text-[var(--text-primary)] transition-colors shrink-0" />
                    </div>
                ))}
            </div>
            <button className="w-full mt-4 py-2 text-xs font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">
                View more
            </button>
        </div>
    );
};

export default ActiveGroupsCard;
