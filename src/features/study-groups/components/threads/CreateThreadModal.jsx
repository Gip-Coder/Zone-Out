import React, { useState } from 'react';

export const CreateThreadModal = ({ isOpen, onClose, onSubmit }) => {
    const [title, setTitle] = useState('');
    const [body, setBody] = useState('');

    if (!isOpen) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!title.trim() || !body.trim()) return;
        onSubmit(title, body);
        setTitle('');
        setBody('');
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0E1015]/80 backdrop-blur-md animate-fade-in">
            <div className="bg-[#14151a] border border-gray-800 rounded-3xl w-full max-w-xl shadow-2xl overflow-hidden animate-fade-in-up">

                {/* Header with gradient line */}
                <div className="relative p-6 px-8 border-b border-gray-800/60 flex items-center justify-between bg-[#1a1c23]/50">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 to-blue-500 opacity-50"></div>
                    <div>
                        <h2 className="text-xl font-bold text-gray-100">Create New Discussion</h2>
                        <p className="text-xs text-gray-500 font-medium mt-1">Start a new thread to get help or share knowledge</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 text-gray-500 hover:text-gray-300 hover:bg-gray-800 rounded-xl transition-colors"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-8">
                    <div className="space-y-6">
                        {/* Title Input */}
                        <div>
                            <label htmlFor="title" className="block text-sm font-semibold text-gray-300 mb-2">
                                Thread Title
                            </label>
                            <input
                                id="title"
                                type="text"
                                autoFocus
                                className="w-full bg-[#1c1e26] border border-gray-800 text-gray-100 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all font-medium placeholder-gray-600 shadow-inner"
                                placeholder="What's your question or topic?"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                            />
                        </div>

                        {/* Body Input */}
                        <div>
                            <label htmlFor="body" className="block text-sm font-semibold text-gray-300 mb-2">
                                Details
                            </label>
                            <div className="relative">
                                <textarea
                                    id="body"
                                    rows={6}
                                    className="w-full bg-[#1c1e26] border border-gray-800 text-gray-100 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all font-medium placeholder-gray-600 resize-none shadow-inner leading-relaxed"
                                    placeholder="Provide more context, share code snippets, or detail your working process..."
                                    value={body}
                                    onChange={(e) => setBody(e.target.value)}
                                />
                                {/* Markdown helper hint (aesthetic only right now) */}
                                <div className="absolute bottom-3 right-3 text-[10px] text-gray-600 font-medium bg-[#14151a] px-2 py-1 rounded border border-gray-800 flex items-center gap-1">
                                    <svg viewBox="0 0 16 16" fill="currentColor" className="w-3 h-3">
                                        <path d="M14.85 3H1.15C.52 3 0 3.52 0 4.15v7.69C0 12.48.52 13 1.15 13h13.69c.64 0 1.15-.52 1.15-1.15v-7.7C16 3.52 15.48 3 14.85 3zM9 11H7V8L5.5 9.92 4 8v3H2V5h2l1.5 2L7 5h2v6zm2.99.5L9.5 8H11V5h2v3h1.5l-2.51 3.5z" />
                                    </svg>
                                    Markdown supported
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-end gap-3 mt-8 pt-6 border-t border-gray-800/60">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-5 py-2.5 rounded-xl font-medium text-gray-400 hover:text-gray-200 hover:bg-gray-800 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={!title.trim() || !body.trim()}
                            className="px-6 py-2.5 rounded-xl font-semibold bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white shadow-lg shadow-indigo-500/25 disabled:opacity-50 disabled:shadow-none disabled:cursor-not-allowed transition-all hover:-translate-y-0.5"
                        >
                            Post Thread
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
