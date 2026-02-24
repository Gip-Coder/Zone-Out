import React, { useState, useCallback, memo } from 'react';
import { useThreadContext } from '../../context/ThreadContext';

export const ThreadCard = memo(({ thread, currentUser }) => {
    const { toggleUpvote } = useThreadContext();
    const isUpvotedInit = thread.upvotes?.includes(currentUser?.id);

    // Optimistic state
    const [isUpvoted, setIsUpvoted] = useState(isUpvotedInit);
    const [upvoteCount, setUpvoteCount] = useState(thread.upvotes?.length || 0);
    const [animating, setAnimating] = useState(false);

    // Sync with server state if changed by others
    React.useEffect(() => {
        setIsUpvoted(thread.upvotes?.includes(currentUser?.id));
        setUpvoteCount(thread.upvotes?.length || 0);
    }, [thread.upvotes, currentUser?.id]);

    const handleUpvote = useCallback(async () => {
        // Optimistic UI update
        const newUpvoteState = !isUpvoted;
        setIsUpvoted(newUpvoteState);
        setUpvoteCount(prev => newUpvoteState ? prev + 1 : prev - 1);
        setAnimating(true);
        setTimeout(() => setAnimating(false), 300); // animation duration

        try {
            await toggleUpvote(thread.id, currentUser.id, newUpvoteState);
        } catch (err) {
            // Revert on failure
            setIsUpvoted(!newUpvoteState);
            setUpvoteCount(prev => !newUpvoteState ? prev + 1 : prev - 1);
            console.error("Upvote failed", err);
        }
    }, [isUpvoted, thread.id, currentUser?.id, toggleUpvote]);

    return (
        <div className="glass-card p-6 mb-6 glass-card-hover overflow-hidden relative group">
            <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-[var(--neon-blue)] to-[var(--neon-purple)] flex items-center justify-center font-bold text-white border-2 border-[var(--neon-purple)]/30 shadow-lg">
                        {thread.authorName?.[0] || 'U'}
                    </div>
                    <div>
                        <h4 className="font-semibold text-white">{thread.authorName || 'Student'}</h4>
                        <p className="text-xs text-slate-500">
                            {thread.createdAt?.toDate ? new Date(thread.createdAt.toDate()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Just now'}
                        </p>
                    </div>
                </div>
            </div>

            <div className="text-slate-300 mb-6 leading-relaxed">
                <h3 className="text-xl font-bold text-white mb-2 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-[var(--neon-purple)] group-hover:to-[var(--neon-pink)] transition-all duration-300">{thread.title}</h3>
                <p className="text-sm">{thread.body}</p>
            </div>

            <div className="flex flex-wrap items-center justify-between pt-4 border-t border-white/5 gap-y-4">
                <div className="flex gap-6">
                    <button
                        onClick={handleUpvote}
                        className={`flex flex-col sm:flex-row items-center gap-2 transition-colors ${isUpvoted ? 'text-[var(--neon-pink)]' : 'text-slate-400 hover:text-[var(--neon-pink)]'
                            } ${animating ? 'scale-125' : 'scale-100'}`}
                    >
                        <svg className="w-5 h-5 flex-shrink-0" fill={isUpvoted ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24" strokeWidth={isUpvoted ? 2 : 2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                        </svg>
                        <span className="text-sm font-medium">{upvoteCount} {upvoteCount === 1 ? 'Like' : 'Likes'}</span>
                    </button>

                    <button className="flex flex-col sm:flex-row items-center gap-2 text-slate-400 hover:text-[var(--neon-blue)] transition-colors">
                        <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                        <span className="text-sm font-medium">{thread.commentsCount || 0} Replies</span>
                    </button>

                    <button className="flex flex-col sm:flex-row items-center gap-2 text-slate-400 hover:text-[var(--neon-purple)] transition-colors">
                        <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                        </svg>
                        <span className="text-sm font-medium hidden sm:block">Share</span>
                    </button>
                </div>
            </div>
        </div>
    );
});
