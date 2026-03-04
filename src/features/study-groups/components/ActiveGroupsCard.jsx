import React from 'react';
import { Plus } from 'lucide-react';

const MOCK_GROUPS = [
    {
        title: 'Data Science Sprint',
        stats: '24 members',
        image: 'https://picsum.photos/seed/ds/100/100',
    },
    {
        title: 'Cyberpunk Coding',
        stats: '15 members',
        image: 'https://picsum.photos/seed/cyber/100/100',
    },
    {
        title: 'Neerito Data',
        stats: '12 active',
        image: 'https://picsum.photos/seed/data/100/100',
    },
];

const ActiveGroupsCard = () => {
    return (
        <div className="card">
            <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-4">Active Focus Groups</h3>
            <div className="space-y-2">
                {MOCK_GROUPS.map((group) => (
                    <div key={group.title} className="flex items-center gap-3 w-full border-b border-[var(--glass)] last:border-b-0 pb-3 mb-1 pt-1">
                        <div className="relative shrink-0">
                            <img
                                src={group.image}
                                alt={group.title}
                                className="avatar w-10 h-10 rounded-full border border-[var(--glass)]"
                                referrerPolicy="no-referrer"
                                loading="lazy"
                            />
                            <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-[var(--bg-secondary)]"></div>
                        </div>
                        <span className="text-sm font-medium text-[var(--text-primary)] truncate max-w-[130px]">{group.title}</span>
                        <span className="text-xs font-medium text-[var(--text-secondary)] bg-[var(--glass)] px-2.5 py-1 rounded-full whitespace-nowrap">{group.stats}</span>
                        <div className="flex-1"></div>
                        <button className="btn btn-primary btn-sm shrink-0 px-4">
                            Join
                        </button>
                    </div>
                ))}
            </div>
            <button className="btn btn-secondary btn-sm w-full mt-4">
                Explore all groups
            </button>
        </div>
    );
};

export default ActiveGroupsCard;
