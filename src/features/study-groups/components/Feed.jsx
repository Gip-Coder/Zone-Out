import React from 'react';
import { Search, Bell } from 'lucide-react';
import CreatePostCard from './CreatePostCard';
import PostCard from './PostCard';
import { useThreadContext } from '../context/ThreadContext';

const Feed = ({ currentUser }) => {
    const { threads } = useThreadContext();

    return (
        <div className="flex flex-col w-full px-2 lg:px-6">
            {/* Header */}
            <header className="flex flex-wrap sm:flex-nowrap items-center justify-between mb-8 gap-4 pt-4 lg:pt-8 bg-[#0E1015]/80 backdrop-blur-md sticky top-0 z-10 pb-4">
                <h2 className="text-2xl lg:text-3xl font-bold text-white">Study Group Feed</h2>
                <div className="flex items-center gap-4">
                    <div className="relative hidden sm:block">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                        <input
                            type="text"
                            placeholder="Search groups..."
                            className="bg-white/5 border border-white/10 rounded-full py-2 pl-10 pr-4 text-sm text-slate-200 focus:outline-none focus:border-[var(--neon-purple)]/50 w-48 lg:w-64 transition-all"
                        />
                    </div>
                    <button className="p-2 rounded-full bg-white/5 border border-white/10 text-slate-400 hover:text-white transition-all relative shrink-0">
                        <Bell size={20} />
                        <span className="absolute top-2 right-2 w-2 h-2 bg-[var(--neon-pink)] rounded-full border border-black/20"></span>
                    </button>
                    <div className="w-10 h-10 rounded-full border-2 border-[var(--neon-purple)] bg-[var(--bg-tertiary)] flex items-center justify-center text-white shrink-0 overflow-hidden text-sm font-bold">
                        {currentUser?.name?.[0] || 'U'}
                    </div>
                </div>
            </header>

            <CreatePostCard />

            <div className="space-y-2 pb-8">
                {threads && threads.length > 0 ? (
                    threads.map(thread => (
                        <PostCard key={thread.id} thread={thread} currentUser={currentUser} />
                    ))
                ) : (
                    <div className="text-center py-20">
                        <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4 border border-white/10 shadow-lg shadow-[var(--neon-purple)]/10">
                            <Search className="text-slate-500" size={32} />
                        </div>
                        <h3 className="text-xl font-semibold text-white mb-2">No posts yet</h3>
                        <p className="text-slate-400 max-w-sm mx-auto">Be the first to share an update, codebase snippet or resource with the group!</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Feed;
