import React from 'react';
import { Circle } from 'lucide-react';

const MOCK_FRIENDS = [
    { name: 'Sarah J.', status: 'Coding React', avatar: 'https://picsum.photos/seed/sarah/100/100' },
    { name: 'Marcus T.', status: 'In Focus Session', avatar: 'https://picsum.photos/seed/marcus/100/100' },
    { name: 'Elena R.', status: 'Reviewing PRs', avatar: 'https://picsum.photos/seed/elena/100/100' },
];

const OnlineFriendsCard = () => {
    return (
        <div className="card">
            <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-4">Online Friends</h3>
            <div className="space-y-4">
                {MOCK_FRIENDS.map((friend) => (
                    <div key={friend.name} className="flex items-center gap-3 w-full">
                        <div className="relative shrink-0">
                            <img
                                src={friend.avatar}
                                alt={friend.name}
                                className="avatar border border-[var(--glass)]"
                                referrerPolicy="no-referrer"
                                loading="lazy"
                            />
                            <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-[var(--bg-secondary)]"></div>
                        </div>
                        <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-medium text-[var(--text-primary)] truncate">{friend.name}</h4>
                            <p className="text-xs text-[var(--text-secondary)] truncate">{friend.status}</p>
                        </div>
                    </div>
                ))}
            </div>
            <button className="w-full mt-4 py-2 text-xs font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">
                View all friends
            </button>
        </div>
    );
};

export default OnlineFriendsCard;
