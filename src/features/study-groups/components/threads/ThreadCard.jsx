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
        <div className="group bg-[#14151a]/80 backdrop-blur-sm rounded-2xl p-6 mb-5 border border-gray-800/60 hover:border-indigo-500/30 hover:bg-[#1a1b23]/90 transition-all duration-300 shadow-xl shadow-black/20 relative overflow-hidden">
            {/* Subtle left border indicator on hover */}
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-indigo-500/0 group-hover:bg-indigo-500/80 transition-colors duration-300"></div>

            <div className="flex items-start gap-5">
                {/* Voting Column */}
                <div className="flex flex-col items-center gap-1 mt-1 bg-[#0E1015]/50 group-hover:bg-[#0E1015] p-2 rounded-xl border border-gray-800/40 transition-colors">
                    <button
                        onClick={handleUpvote}
                        className={`p-2 rounded-lg transition-all duration-300 ${isUpvoted
                            ? 'text-indigo-400 bg-indigo-500/15 shadow-inner shadow-indigo-500/20'
                            : 'text-gray-500 hover:bg-gray-800 hover:text-gray-300'
                            } ${animating ? 'scale-125' : 'scale-100 hover:scale-110'}`}
                    >
                        <svg className="w-5 h-5" fill={isUpvoted ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24" strokeWidth={isUpvoted ? 2 : 2.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 15.75l7.5-7.5 7.5 7.5" />
                        </svg>
                    </button>
                    <span className={`font-bold text-sm ${isUpvoted ? 'text-indigo-400' : 'text-gray-400 group-hover:text-gray-300'} transition-colors`}>
                        {upvoteCount}
                    </span>
                </div>

                {/* Content Column */}
                <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-bold text-gray-100 mb-2 truncate group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-indigo-400 group-hover:to-purple-400 transition-all duration-300">{thread.title}</h3>
                    <p className="text-gray-400 text-sm leading-relaxed mb-4">{thread.body}</p>

                    <div className="flex items-center gap-x-4 gap-y-2 flex-wrap text-xs font-medium text-gray-500">
                        <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-800/40 hover:bg-gray-800 hover:text-gray-300 cursor-pointer transition-colors border border-gray-800/60">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                            </svg>
                            {thread.commentsCount || 0} Replies
                        </span>

                        <div className="flex items-center gap-2">
                            <div className="flex -space-x-2">
                                {/* Pseudocode for avatars (would map real commenters in prod) */}
                                {[1, 2].map((_, i) => (
                                    <div key={i} className={`w-6 h-6 rounded-full border-2 border-[#14151a] flex items-center justify-center text-[8px] text-white font-bold shadow-sm ${i === 0 ? 'bg-indigo-500' : 'bg-purple-500 z-10'}`}>
                                        U
                                    </div>
                                ))}
                            </div>
                        </div>

                        <span className="h-4 w-px bg-gray-700"></span>

                        <span className="flex items-center gap-2">
                            <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-gray-600 to-gray-700 flex items-center justify-center text-[10px] text-white font-bold">
                                {thread.authorName?.[0] || 'U'}
                            </div>
                            Posted by <span className="text-gray-300">{thread.authorName || 'Student'}</span>
                        </span>

                        <span className="h-4 w-px bg-gray-700"></span>

                        <span className="text-gray-500">
                            {thread.createdAt?.toDate ? new Date(thread.createdAt.toDate()).toLocaleDateString() : 'Just now'}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
});
