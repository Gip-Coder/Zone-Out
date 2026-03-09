import React from 'react';
import { Circle } from 'lucide-react';

const OnlineMembers = () => {
    // Mock robust members list
    const members = [
        { id: '1', name: 'Alex Developer', status: 'online', role: 'Admin' },
        { id: '2', name: 'Sarah K.', status: 'online', role: 'Member' },
        { id: '3', name: 'Devon B.', status: 'idle', role: 'Member' },
        { id: '4', name: 'Maria L.', status: 'dnd', role: 'Moderator' },
        { id: '5', name: 'James T.', status: 'offline', role: 'Member' },
        { id: '6', name: 'Emma W.', status: 'online', role: 'Member' },
        { id: '7', name: 'Noah R.', status: 'offline', role: 'Member' },
    ];

    const getStatusColor = (status) => {
        switch (status) {
            case 'online': return 'text-green-500 fill-green-500';
            case 'idle': return 'text-yellow-500 fill-yellow-500';
            case 'dnd': return 'text-red-500 fill-red-500';
            default: return 'text-gray-500 fill-gray-500';
        }
    };

    const StatusIcon = ({ status }) => (
        <div className="absolute -bottom-0.5 -right-0.5 bg-[var(--bg-secondary)] rounded-full p-0.5">
            <Circle size={10} className={getStatusColor(status)} />
        </div>
    );

    // Grouping by status conceptually, showing online first
    const onlineMembers = members.filter(m => m.status !== 'offline');
    const offlineMembers = members.filter(m => m.status === 'offline');

    return (
        <aside className="hidden lg:flex flex-col gap-6 h-full overflow-y-auto custom-scrollbar pl-2 pb-20">

            <div className="flex flex-col gap-3">
                <h3 className="text-[var(--text-secondary)] font-semibold text-xs tracking-wider uppercase px-2">
                    Online — {onlineMembers.length}
                </h3>

                <div className="flex flex-col gap-1">
                    {onlineMembers.map(member => (
                        <div
                            key={member.id}
                            className="flex items-center gap-3 p-2 rounded-[var(--radius-md)] hover:bg-[var(--glass)] cursor-pointer transition-all border border-transparent hover:border-[var(--glass)] group"
                        >
                            <div className="relative">
                                <div className="w-8 h-8 rounded-full bg-[var(--bg-tertiary)] flex items-center justify-center border border-[var(--glass)] shrink-0 overflow-hidden">
                                    <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${member.name}`} alt={member.name} className="w-full h-full object-cover" />
                                </div>
                                <StatusIcon status={member.status} />
                            </div>

                            <div className="flex-1 min-w-0 flex flex-col">
                                <span className={`text-sm font-medium truncate ${member.role === 'Admin' ? 'text-[var(--accent-primary)]' : 'text-[var(--text-primary)]'}`}>
                                    {member.name}
                                </span>
                                {member.role !== 'Member' && (
                                    <span className="text-[10px] text-[var(--text-secondary)] uppercase tracking-wide group-hover:text-[var(--accent-primary)] transition-colors">
                                        {member.role}
                                    </span>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="flex flex-col gap-3 opacity-60">
                <h3 className="text-[var(--text-secondary)] font-semibold text-xs tracking-wider uppercase px-2">
                    Offline — {offlineMembers.length}
                </h3>

                <div className="flex flex-col gap-1">
                    {offlineMembers.map(member => (
                        <div
                            key={member.id}
                            className="flex items-center gap-3 p-2 rounded-[var(--radius-md)] hover:bg-[var(--glass)] cursor-pointer transition-all border border-transparent hover:border-[var(--glass)]"
                        >
                            <div className="relative grayscale opacity-70">
                                <div className="w-8 h-8 rounded-full bg-[var(--bg-tertiary)] flex items-center justify-center border border-[var(--glass)] shrink-0 overflow-hidden">
                                    <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${member.name}`} alt={member.name} className="w-full h-full object-cover" />
                                </div>
                                <StatusIcon status={member.status} />
                            </div>

                            <div className="flex-1 min-w-0">
                                <span className="text-sm font-medium text-[var(--text-secondary)] truncate">
                                    {member.name}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

        </aside>
    );
};

export default OnlineMembers;
