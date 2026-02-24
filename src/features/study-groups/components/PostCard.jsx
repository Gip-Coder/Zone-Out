import React, { useState, useCallback, memo } from 'react';
import { Heart, MessageCircle, Share2, MoreHorizontal, Bookmark } from 'lucide-react';
import { useThreadContext } from '../context/ThreadContext';

// Using React.memo directly on export as instructed in performace requirements
export const PostCard = memo(({ thread, currentUser }) => {
    const { toggleUpvote } = useThreadContext();

    // Initialize optimistic state
    const isUpvotedInit = thread.upvotes?.includes(currentUser?.id);
    const [isUpvoted, setIsUpvoted] = useState(isUpvotedInit);
    const [upvoteCount, setUpvoteCount] = useState(thread.upvotes?.length || 0);

    // Sync with server state if changed by others
    React.useEffect(() => {
        setIsUpvoted(thread.upvotes?.includes(currentUser?.id));
        setUpvoteCount(thread.upvotes?.length || 0);
    }, [thread.upvotes, currentUser?.id]);

    const handleLike = useCallback(async () => {
        if (!currentUser) return;

        // Optimistic UI update
        const newUpvoteState = !isUpvoted;
        setIsUpvoted(newUpvoteState);
        setUpvoteCount(prev => newUpvoteState ? prev + 1 : prev - 1);

        try {
            await toggleUpvote(thread.id, currentUser.id, newUpvoteState);
        } catch (err) {
            // Revert on failure
            setIsUpvoted(!newUpvoteState);
            setUpvoteCount(prev => !newUpvoteState ? prev + 1 : prev - 1);
            console.error("Upvote failed", err);
        }
    }, [isUpvoted, thread.id, currentUser, toggleUpvote]);

    // Format time roughly
    const timeAgo = thread.createdAt?.toDate
        ? new Date(thread.createdAt.toDate()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        : 'Just now';

    return (
        <div className="glass-card p-6 mb-6 glass-card-hover">
            <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full border-2 border-[var(--neon-purple)]/30 bg-gradient-to-tr from-[var(--neon-blue)] to-[var(--neon-purple)] text-white font-bold flex items-center justify-center shrink-0 object-cover">
                        {thread.authorName?.[0] || 'U'}
                    </div>
                    <div>
                        <h4 className="font-semibold text-white">{thread.authorName || 'Anonymous'}</h4>
                        <p className="text-xs text-slate-500">{timeAgo}</p>
                    </div>
                </div>
                <button className="text-slate-500 hover:text-white transition-colors">
                    <MoreHorizontal size={20} />
                </button>
            </div>

            <div className="text-slate-300 mb-6 leading-relaxed whitespace-pre-wrap">
                {thread.body}
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-white/5">
                <div className="flex gap-6">
                    <button
                        onClick={handleLike}
                        className={`flex items-center gap-2 transition-colors group ${isUpvoted ? 'text-[var(--neon-pink)]' : 'text-slate-400 hover:text-[var(--neon-pink)]'}`}
                    >
                        <Heart size={18} className={isUpvoted ? "fill-[var(--neon-pink)]" : "group-hover:fill-[var(--neon-pink)]"} />
                        <span className="text-sm font-medium">{upvoteCount}</span>
                    </button>
                    <button className="flex items-center gap-2 text-slate-400 hover:text-[var(--neon-blue)] transition-colors">
                        <MessageCircle size={18} />
                        <span className="text-sm font-medium">{thread.commentsCount || 0}</span>
                    </button>
                    <button className="flex items-center gap-2 text-slate-400 hover:text-[var(--neon-purple)] transition-colors hidden sm:flex">
                        <Share2 size={18} />
                        <span className="text-sm font-medium">Share</span>
                    </button>
                </div>
                <button className="text-slate-400 hover:text-white transition-colors">
                    <Bookmark size={18} />
                </button>
            </div>
        </div>
    );
});

export default PostCard;
