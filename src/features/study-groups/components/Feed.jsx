import React from 'react';
import { Search, Bell } from 'lucide-react';
import CreatePostCard from './CreatePostCard';
import PostCard from './PostCard';
import { useThreadContext } from '../context/ThreadContext';

const Feed = ({ currentUser }) => {
    const { threads, toggleUpvote } = useThreadContext();

    return (
        <div className="flex flex-col feed-column">

            <CreatePostCard />

            <div className="space-y-4 pb-8">
                {threads && threads.length > 0 ? (
                    threads.map(thread => (
                        <PostCard
                            key={thread.id}
                            thread={thread}
                            currentUser={currentUser}
                            toggleUpvote={toggleUpvote}
                        />
                    ))
                ) : (
                    <div className="card empty-state flex flex-col items-center justify-center py-16 text-center">
                        <div className="w-16 h-16 bg-[var(--glass)] rounded-full flex items-center justify-center mb-5 border border-[var(--glass)] shadow-lg shadow-[var(--neon-purple)]/10">
                            <Search className="text-[var(--text-secondary)]" size={28} />
                        </div>
                        <h3 className="text-xl font-semibold text-[var(--text-primary)] mb-3">No posts yet</h3>
                        <p className="text-[var(--text-secondary)] max-w-sm mx-auto leading-relaxed">Be the first to share notes, resources, or study progress with your group.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Feed;
