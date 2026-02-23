import React from 'react';
import { useStudyGroup } from '../../context/StudyGroupContext';

export const SidebarPresence = () => {
    const { group, membersPresence, loading } = useStudyGroup();

    if (loading) return <div className="p-4 text-gray-500 text-sm">Loading Members...</div>;

    // In a real app we'd map these IDs to a user collection to grab display names/avatars.
    // For now we'll mock display functionality using the IDs.
    const getStatusInfo = (presence) => {
        if (presence?.state === 'online') {
            return { color: 'bg-emerald-500', text: 'Online' };
        }

        if (presence?.last_changed) {
            const diff = Date.now() - presence.last_changed;
            if (diff < 3600000) return { color: 'bg-amber-500', text: 'Away' };
        }
        return { color: 'bg-gray-600', text: 'Offline' };
    };

    // Sort: Online first
    const sortedMembers = [...(group?.members || [])].sort((a, b) => {
        const aOnline = membersPresence[a]?.state === 'online';
        const bOnline = membersPresence[b]?.state === 'online';
        return aOnline === bOnline ? 0 : aOnline ? -1 : 1;
    });

    return (
        <div className="flex flex-col h-full bg-[#14151a] py-6 flex-1 min-h-0">
            <div className="px-6 mb-4">
                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Group Activity</h3>
                <div className="mt-1 text-sm text-gray-400">
                    {Object.values(membersPresence).filter(p => p.state === 'online').length} Members Online
                </div>
            </div>

            <div className="flex-1 overflow-y-auto px-4 mt-2">
                <div className="space-y-1">
                    {sortedMembers.map(memberId => {
                        const status = getStatusInfo(membersPresence[memberId]);
                        // Basic mock for name and avatar extraction based on ID 
                        const name = `Student ${memberId.slice(-3)}`;

                        return (
                            <div key={memberId} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-800/50 transition-colors cursor-pointer group">
                                <div className="relative">
                                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-gray-700 to-gray-600 flex items-center justify-center text-xs font-bold text-white shadow-sm ring-1 ring-white/10 group-hover:ring-indigo-500 transition-all">
                                        {name[8]} {/* Initial letter mock */}
                                    </div>
                                    <div className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-[#14151a] ${status.color}`} />
                                </div>

                                <div className="flex-1 min-w-0">
                                    <div className="text-sm font-medium text-gray-200 truncate group-hover:text-indigo-400 transition-colors">{name}</div>
                                    <div className="text-[10px] text-gray-500 font-medium truncate">{status.text}</div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            <div className="px-6 mt-4 pt-4 border-t border-gray-800/50">
                <button className="w-full py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-sm font-medium text-gray-300 transition-colors flex items-center justify-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m3.75 9v6m3-3H9m1.5-12H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                    </svg>
                    Invite Link
                </button>
            </div>
        </div>
    );
};
