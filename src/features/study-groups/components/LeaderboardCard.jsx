import React from 'react';
import { Trophy } from 'lucide-react';

const MOCK_LEADERBOARD = [
    { rank: 1, name: 'Alex D.', points: 200, avatar: 'https://picsum.photos/seed/alex/100/100' },
    { rank: 2, name: 'Nia F.', points: 100, avatar: 'https://picsum.photos/seed/nia/100/100' },
    { rank: 3, name: 'Chris G.', points: 20, avatar: 'https://picsum.photos/seed/chris/100/100' },
];

const LeaderboardCard = () => {
    return (
        <div className="glass-card p-5">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">Leaderboard</h3>
                <Trophy size={18} className="text-yellow-500 shrink-0" />
            </div>
            <div className="space-y-4">
                {MOCK_LEADERBOARD.map((user) => (
                    <div key={user.name} className="flex items-center gap-3">
                        <span className="text-sm font-bold text-slate-500 w-4 text-center shrink-0">{user.rank}</span>
                        <img
                            src={user.avatar}
                            alt={user.name}
                            className="w-10 h-10 rounded-full border border-white/10 object-cover shrink-0"
                            referrerPolicy="no-referrer"
                        />
                        <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-medium text-white truncate">{user.name}</h4>
                        </div>
                        <span className="text-xs font-semibold text-[var(--neon-purple)] whitespace-nowrap">{user.points} pts</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default LeaderboardCard;
