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
        <div className="group relative bg-[#14151a]/80 backdrop-blur-sm border border-gray-800/60 rounded-3xl p-7 mb-6 overflow-hidden shadow-xl shadow-black/20 transition-all duration-300 hover:border-purple-500/30 hover:bg-[#1a1b23]/90 hover:-translate-y-1">
            {/* Subtle top glow based on hover */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 to-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

            <div className="flex items-start justify-between mb-5">
                <div className="flex items-center gap-4">
                    <div className="relative">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-purple-500/30">
                            {update.authorName?.[0] || 'U'}
                        </div>
                        <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-green-500 border-2 border-[#14151a] shadow-sm"></div>
                    </div>
                    <div>
                        <div className="font-bold text-gray-100 text-[15px] group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-purple-400 group-hover:to-indigo-400 transition-colors">{update.authorName || 'Anonymous Student'}</div>
                        <div className="flex items-center gap-2 text-xs font-medium text-gray-500 mt-1">
                            <span className="flex items-center gap-1">
                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                {update.createdAt?.toDate ? new Date(update.createdAt.toDate()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Just now'}
                            </span>
                            <span className="w-1 h-1 rounded-full bg-gray-700"></span>
                            <span>{update.createdAt?.toDate ? new Date(update.createdAt.toDate()).toLocaleDateString() : 'Today'}</span>
                        </div>
                    </div>
                </div>
                {update.courseTag && (
                    <span className="px-4 py-1.5 bg-[#1c1e26] text-purple-400 hover:text-purple-300 text-[11px] rounded-xl font-bold border border-purple-500/20 shadow-sm transition-colors cursor-pointer uppercase tracking-widest">
                        {update.courseTag}
                    </span>
                )}
            </div>

            <p className="text-gray-300 text-[15px] mb-6 leading-relaxed whitespace-pre-wrap">
                {update.content}
            </p>

            {update.mediaUrl && (
                <div className="mb-6 relative group/img">
                    <div
                        className="rounded-2xl overflow-hidden cursor-zoom-in border border-gray-800 focus-within:ring-2 focus-within:ring-purple-500 focus-within:ring-offset-2 focus-within:ring-offset-[#14151a] shadow-lg transition-all"
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
                        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-[#0E1015]/95 backdrop-blur-lg p-4 cursor-zoom-out animate-fade-in" onClick={() => setIsImageOpen(false)}>
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

            <div className="flex items-center justify-between border-t border-gray-800/80 pt-5 mt-2">
                <div className="flex items-center gap-4">
                    <button
                        onClick={handleLike}
                        className={`group/btn flex items-center gap-2 transition-all font-semibold text-sm px-4 py-2 rounded-xl border ${isLiked
                                ? 'text-pink-400 bg-pink-500/10 border-pink-500/20 shadow-inner shadow-pink-500/10'
                                : 'text-gray-400 hover:text-gray-200 bg-gray-800/40 hover:bg-gray-800 border-gray-800/60'
                            }`}
                    >
                        <svg
                            className={`w-5 h-5 transition-transform duration-300 ${isLiked ? 'fill-current' : 'group-hover/btn:scale-110 group-hover/btn:-rotate-12'} ${animatingLike ? 'scale-125' : ''}`}
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={isLiked ? 1.5 : 2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                        </svg>
                        {likesCount > 0 ? (
                            <span>
                                {likesCount} <span className="hidden sm:inline font-medium opacity-80 pl-1">{likesCount === 1 ? 'Like' : 'Likes'}</span>
                            </span>
                        ) : 'Like'}
                    </button>

                    <button className="flex items-center gap-2 text-gray-400 hover:text-gray-200 bg-gray-800/40 hover:bg-gray-800 border border-gray-800/60 transition-all font-semibold text-sm px-4 py-2 rounded-xl">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
                        </svg>
                        Comment
                    </button>
                </div>

                <button className="p-2 text-gray-500 hover:text-gray-300 hover:bg-gray-800 rounded-xl transition-colors">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186l9.566-5.314m-9.566 7.5l9.566 5.314m0 0a2.25 2.25 0 103.935 2.186 2.25 2.25 0 00-3.935-2.186zm0-12.814a2.25 2.25 0 103.933-2.185 2.25 2.25 0 00-3.933 2.185z" />
                    </svg>
                </button>
            </div>
        </div>
    );
});
