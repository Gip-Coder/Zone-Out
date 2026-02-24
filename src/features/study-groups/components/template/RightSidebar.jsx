import React from 'react';
import { ChevronRight, Trophy } from 'lucide-react';

const focusGroups = [
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

const leaderboard = [
    { rank: 1, name: 'Alex D.', points: 200, avatar: 'https://picsum.photos/seed/alex/100/100' },
    { rank: 2, name: 'Nia F.', points: 100, avatar: 'https://picsum.photos/seed/nia/100/100' },
    { rank: 3, name: 'Chris G.', points: 20, avatar: 'https://picsum.photos/seed/chris/100/100' },
];

export default function RightSidebar() {
    return (
        <aside className="w-80 h-screen sticky top-0 flex flex-col p-6 gap-8 overflow-y-auto custom-scrollbar">
            {/* Active Focus Groups */}
            <div className="glass-card p-5">
                <h3 className="text-lg font-semibold text-white mb-4">Active Focus Groups</h3>
                <div className="space-y-4">
                    {focusGroups.map((group) => (
                        <div key={group.title} className="flex items-center gap-3 p-2 rounded-xl hover:bg-white/5 transition-colors cursor-pointer group">
                            <img
                                src={group.image}
                                alt={group.title}
                                className="w-12 h-12 rounded-lg object-cover border border-white/10"
                                referrerPolicy="no-referrer"
                            />
                            <div className="flex-1 min-w-0">
                                <h4 className="text-sm font-medium text-white truncate">{group.title}</h4>
                                <p className="text-[10px] text-slate-500 truncate">{group.stats}</p>
                            </div>
                            <ChevronRight size={16} className="text-slate-600 group-hover:text-white transition-colors" />
                        </div>
                    ))}
                </div>
                <button className="w-full mt-4 py-2 text-xs font-medium text-slate-500 hover:text-white transition-colors">
                    View more
                </button>
            </div>

            {/* Leaderboard */}
            <div className="glass-card p-5">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-white">Leaderboard</h3>
                    <Trophy size={18} className="text-yellow-500" />
                </div>
                <div className="space-y-4">
                    {leaderboard.map((user) => (
                        <div key={user.name} className="flex items-center gap-3">
                            <span className="text-sm font-bold text-slate-500 w-4">{user.rank}</span>
                            <img
                                src={user.avatar}
                                alt={user.name}
                                className="w-10 h-10 rounded-full border border-white/10 object-cover"
                                referrerPolicy="no-referrer"
                            />
                            <div className="flex-1">
                                <h4 className="text-sm font-medium text-white">{user.name}</h4>
                            </div>
                            <span className="text-xs font-semibold text-[var(--neon-purple)]">{user.points} pts</span>
                        </div>
                    ))}
                </div>
            </div>
        </aside>
    );
}
