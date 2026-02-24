import React, { useState, useCallback, memo } from 'react';
import { useProgressContext } from '../../context/ProgressContext';

export const ProgressCard = memo(({ update, currentUser }) => {
    const { toggleLike } = useProgressContext();
    const [isImageOpen, setIsImageOpen] = useState(false);

    // Optimistic UI for likes
    const isLikedInit = update.likes?.includes(currentUser?.id);
    const [isLiked, setIsLiked] = useState(isLikedInit);
    const [likesCount, setLikesCount] = useState(update.likes?.length || 0);
    const [animatingLike, setAnimatingLike] = useState(false);

    // Sync with server state
    React.useEffect(() => {
        setIsLiked(update.likes?.includes(currentUser?.id));
        setLikesCount(update.likes?.length || 0);
    }, [update.likes, currentUser?.id]);

    const handleLike = useCallback(async () => {
        const newLikeState = !isLiked;
        setIsLiked(newLikeState);
        setLikesCount(prev => newLikeState ? prev + 1 : prev - 1);

        setAnimatingLike(true);
        setTimeout(() => setAnimatingLike(false), 300);

        try {
            await toggleLike(update.id, newLikeState);
        } catch (error) {
            setIsLiked(!newLikeState);
            setLikesCount(prev => !newLikeState ? prev + 1 : prev - 1);
            console.error("Like failed", error);
        }
    }, [isLiked, update.id, toggleLike]);

    return (
        <div className="glass-card p-6 mb-6 glass-card-hover overflow-hidden relative group">
            {/* Subtle top glow based on hover */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[var(--neon-purple)] to-[var(--neon-pink)] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

            <div className="flex items-start justify-between mb-5">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-[var(--neon-purple)] to-[var(--neon-blue)] flex items-center justify-center font-bold text-white border-2 border-[var(--neon-purple)]/30 shadow-lg">
                        {update.authorName?.[0] || 'U'}
                    </div>
                    <div>
                        <h4 className="font-semibold text-white group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-[var(--neon-purple)] group-hover:to-[var(--neon-pink)] transition-colors">{update.authorName || 'Anonymous Student'}</h4>
                        <div className="flex items-center gap-2 text-xs font-medium text-slate-500 mt-0.5">
                            <span>{update.createdAt?.toDate ? new Date(update.createdAt.toDate()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Just now'}</span>
                            <span className="w-1 h-1 rounded-full bg-white/20"></span>
                            <span>{update.createdAt?.toDate ? new Date(update.createdAt.toDate()).toLocaleDateString() : 'Today'}</span>
                        </div>
                    </div>
                </div>
                {update.courseTag && (
                    <span className="px-3 py-1 bg-[var(--neon-purple)]/10 text-[var(--neon-purple)] text-[11px] rounded-full font-bold border border-[var(--neon-purple)]/20 shadow-sm uppercase tracking-widest">
                        {update.courseTag}
                    </span>
                )}
            </div>

            <p className="text-slate-300 text-[15px] mb-6 leading-relaxed whitespace-pre-wrap">
                {update.content}
            </p>

            {update.mediaUrl && (
                <div className="mb-6 relative group/img">
                    <div
                        className="rounded-2xl overflow-hidden cursor-zoom-in border border-white/10 focus-within:ring-2 focus-within:ring-[var(--neon-purple)] focus-within:ring-offset-2 focus-within:ring-offset-[#14151a] shadow-lg transition-all"
                        onClick={() => setIsImageOpen(true)}
                        tabIndex={0}
                        onKeyDown={(e) => e.key === 'Enter' && setIsImageOpen(true)}
                    >
                        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover/img:opacity-100 transition-opacity z-10 pointers-events-none"></div>
                        <img
                            src={update.mediaUrl}
                            alt="Progress Screenshot"
                            className="w-full max-h-96 object-cover object-top hover:scale-[1.02] transition-transform duration-700 ease-out"
                        />
                        <div className="absolute bottom-4 right-4 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-lg text-xs font-medium text-white opacity-0 group-hover/img:opacity-100 transition-opacity z-20 flex items-center gap-2 border border-white/10">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607zM10.5 7.5v6m3-3h-6" />
                            </svg>
                            Expand Note
                        </div>
                    </div>

                    {isImageOpen && (
                        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/90 backdrop-blur-lg p-4 cursor-zoom-out animate-fade-in" onClick={() => setIsImageOpen(false)}>
                            <img
                                src={update.mediaUrl}
                                alt="Expanded"
                                className="max-w-full max-h-full rounded-2xl shadow-2xl ring-1 ring-white/10 object-contain"
                                onClick={e => e.stopPropagation()}
                            />
                            <button
                                className="absolute top-8 right-8 p-3 rounded-full bg-white/5 hover:bg-white/10 backdrop-blur-md border border-white/10 text-white transition-all hover:scale-110"
                                onClick={() => setIsImageOpen(false)}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                    )}
                </div>
            )}

            <div className="flex flex-wrap items-center justify-between pt-4 border-t border-white/5 gap-y-4 mt-2">
                <div className="flex gap-6">
                    <button
                        onClick={handleLike}
                        className={`group/btn flex items-center gap-2 transition-colors text-sm font-medium ${isLiked ? 'text-[var(--neon-pink)]' : 'text-slate-400 hover:text-[var(--neon-pink)]'
                            } ${animatingLike ? 'scale-125' : 'scale-100'}`}
                    >
                        <svg
                            className={`w-5 h-5 flex-shrink-0 transition-transform duration-300 ${isLiked ? 'fill-current' : 'group-hover/btn:scale-110 group-hover/btn:-rotate-12'}`}
                            fill={isLiked ? "currentColor" : "none"}
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={isLiked ? 1.5 : 2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                        </svg>
                        <span>
                            {likesCount} <span className="hidden sm:inline opacity-80 pl-0.5">{likesCount === 1 ? 'Like' : 'Likes'}</span>
                        </span>
                    </button>

                    <button className="flex items-center gap-2 text-slate-400 hover:text-[var(--neon-blue)] transition-colors text-sm font-medium">
                        <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                        Comment
                    </button>

                    <button className="flex items-center gap-2 text-slate-400 hover:text-[var(--neon-purple)] transition-colors text-sm font-medium">
                        <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                        </svg>
                        <span className="hidden sm:block">Share</span>
                    </button>
                </div>
            </div>
        </div>
    );
});
