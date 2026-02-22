import React from 'react';

export const ThreadPost = ({ post }) => {
    const time = post.createdAt?.toDate ? post.createdAt.toDate().toLocaleDateString() : '';

    return (
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow mb-4">
            <div className="flex items-start gap-4">
                {/* Upvote Section */}
                <div className="flex flex-col items-center bg-slate-50 p-2 rounded-lg min-w-[3rem]">
                    <button className="text-slate-400 hover:text-indigo-600 transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 15.75l7.5-7.5 7.5 7.5" />
                        </svg>
                    </button>
                    <span className="font-bold text-sm text-slate-700 my-1">{post.upvotes?.length || 0}</span>
                    <button className="text-slate-400 hover:text-rose-600 transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                        </svg>
                    </button>
                </div>

                {/* Post Content */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <span className="text-[10px] uppercase tracking-wider font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded-md">Discussion</span>
                        <span className="text-xs font-medium text-slate-500">Posted by {post.authorName || 'Student'} • {time}</span>
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 mb-2 leading-tight">{post.title}</h3>
                    <p className="text-slate-600 text-sm line-clamp-3 leading-relaxed">{post.body}</p>

                    <div className="mt-4 flex items-center gap-4 text-slate-500 text-sm font-medium">
                        <button className="flex items-center gap-1.5 hover:bg-slate-50 px-2 py-1 rounded transition-colors">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 20.25c4.97 0 9-3.694 9-8.25s-4.03-8.25-9-8.25S3 7.444 3 12c0 2.104.859 4.023 2.273 5.48.432.447.74 1.04.586 1.641a4.483 4.483 0 01-.923 1.785A5.969 5.969 0 006 21c1.282 0 2.47-.402 3.445-1.087.81.22 1.668.337 2.555.337z" />
                            </svg>
                            {post.commentsCount || 0} Comments
                        </button>
                        <button className="flex items-center gap-1.5 hover:bg-slate-50 px-2 py-1 rounded transition-colors">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186l9.566-5.314m-9.566 7.5l9.566 5.314m0 0a2.25 2.25 0 103.935 2.186 2.25 2.25 0 00-3.935-2.186zm0-12.814a2.25 2.25 0 103.933-2.185 2.25 2.25 0 00-3.933 2.185z" />
                            </svg>
                            Share
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
