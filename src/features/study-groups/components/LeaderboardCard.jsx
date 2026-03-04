import React from 'react';
import { Trophy } from 'lucide-react';

const MOCK_LEADERBOARD = [
    { rank: 1, name: 'Alex D.', points: 200, avatar: 'https://picsum.photos/seed/alex/100/100' },
    { rank: 2, name: 'Nia F.', points: 100, avatar: 'https://picsum.photos/seed/nia/100/100' },
    { rank: 3, name: 'Chris G.', points: 20, avatar: 'https://picsum.photos/seed/chris/100/100' },
];

const getRankIcon = (rank) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return <span className="text-sm font-bold text-[var(--text-secondary)]">{rank}</span>;
}

const LeaderboardCard = () => {
    return (
        <div className="card">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-[var(--text-primary)]">Leaderboard</h3>
                <Trophy size={18} className="text-[var(--accent-primary)] shrink-0" />
            </div>
            <div className="space-y-2">
                {MOCK_LEADERBOARD.map((user) => (
                    <div key={user.name} className="flex items-center gap-3 w-full py-2">
                        <div className="w-6 text-center shrink-0">
                            {getRankIcon(user.rank)}
                        </div>
                        <img
                            src={user.avatar}
                            alt={user.name}
                            className="avatar w-8 h-8 rounded-full border border-[var(--glass)]"
                            referrerPolicy="no-referrer"
                            loading="lazy"
                        />
                        <span className="text-sm font-medium text-[var(--text-primary)] truncate">{user.name}</span>
                        <div className="flex-1"></div>
                        <span className="text-sm font-semibold text-[var(--accent-primary)] whitespace-nowrap">{user.points} pts</span>
                    </div>
                ))}
            </div>
            <button className="w-full mt-4 py-2 text-xs font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">
                View full rankings
            </button>
        </div>
    );
};

export default LeaderboardCard;
