import React, { useCallback, memo } from 'react';
import { Heart, MessageCircle, Share2, MoreHorizontal, Bookmark } from 'lucide-react';

export const PostCard = memo(({ thread, currentUser, toggleUpvote }) => {
    // 1. Derive state strictly from props. No side-effect loops.
    const isUpvoted = thread.upvotes?.includes(currentUser?.id) || false;
    const upvoteCount = thread.upvotes?.length || 0;

    const handleLike = useCallback(async () => {
        if (!currentUser) return;
        const newUpvoteState = !isUpvoted;

        try {
            await toggleUpvote(thread.id, currentUser.id, newUpvoteState);
        } catch (err) {
            console.error("Upvote failed", err);
        }
    }, [isUpvoted, thread.id, currentUser, toggleUpvote]);

    const timeAgo = thread.createdAt?.toDate
        ? new Date(thread.createdAt.toDate()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        : 'Just now';

    return (
        <div className="card mb-4 transition-all hover:bg-[var(--glass)] hover:border-white/10 group/card">
            <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                    <div className="avatar btn-primary flex items-center justify-center shrink-0 font-bold">
                        {thread.authorName?.[0] || 'U'}
                    </div>
                    <div>
                        <h4 className="font-semibold text-[var(--text-primary)] leading-tight">{thread.authorName || 'Anonymous'}</h4>
                        <p className="text-xs text-[var(--text-secondary)] mt-0.5">{timeAgo}</p>
                    </div>
                </div>
                <button className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors opacity-0 group-hover/card:opacity-100">
                    <MoreHorizontal size={20} />
                </button>
            </div>

            <div className="text-[var(--text-secondary)] mb-4 text-sm leading-relaxed whitespace-pre-wrap">
                {thread.body}
            </div>

            <div className="flex items-center gap-2 pt-3 border-t border-[var(--glass)]/50 mt-4">
                <button
                    onClick={handleLike}
                    className={`btn btn-secondary btn-sm group ${isUpvoted ? 'text-[var(--neon-pink)]' : 'text-[var(--text-secondary)] hover:text-[var(--neon-pink)]'}`}
                >
                    <Heart size={16} className={isUpvoted ? "fill-[var(--neon-pink)]" : "group-hover:fill-[var(--neon-pink)]"} />
                    <span>{upvoteCount}</span>
                </button>
                <button className="btn btn-secondary btn-sm text-[var(--text-secondary)] hover:text-[var(--neon-blue)]">
                    <MessageCircle size={16} />
                    <span>{thread.commentsCount || 0}</span>
                </button>
                <button className="btn btn-secondary btn-sm text-[var(--text-secondary)] hover:text-[var(--neon-purple)]">
                    <Share2 size={16} />
                </button>
                <div className="flex-1"></div>
                <button className="btn btn-secondary btn-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)]">
                    <Bookmark size={16} />
                </button>
            </div>
        </div>
    );
});

export default PostCard;
