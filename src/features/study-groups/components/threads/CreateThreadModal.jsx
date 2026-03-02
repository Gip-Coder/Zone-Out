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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[var(--overlay-bg)] backdrop-blur-md animate-fade-in">
            <div className="glass-card w-full max-w-xl overflow-hidden animate-fade-in-up border-none">

                {/* Header with gradient line */}
                <div className="relative p-6 px-8 border-b border-[var(--glass)] flex items-center justify-between bg-[var(--overlay-bg)]">
                    <div className="absolute top-0 left-0 w-full h-1 btn-primary opacity-80"></div>
                    <div>
                        <h2 className="text-xl font-bold text-[var(--text-primary)]">Create New Discussion</h2>
                        <p className="text-xs text-[var(--text-secondary)] font-medium mt-1">Start a new thread to get help or share knowledge</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--glass)] rounded-xl transition-colors"
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
                            <label htmlFor="title" className="block text-sm font-semibold text-[var(--text-secondary)] mb-2">
                                Thread Title
                            </label>
                            <input
                                id="title"
                                type="text"
                                autoFocus
                                className="w-full bg-[var(--overlay-bg)] border border-[var(--glass)] text-[var(--text-primary)] rounded-xl px-4 py-3 focus:outline-none focus:border-[var(--neon-purple)]/50 transition-colors font-medium placeholder-slate-600 shadow-inner"
                                placeholder="What's your question or topic?"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                            />
                        </div>

                        {/* Body Input */}
                        <div>
                            <label htmlFor="body" className="block text-sm font-semibold text-[var(--text-secondary)] mb-2">
                                Details
                            </label>
                            <div className="relative">
                                <textarea
                                    id="body"
                                    rows={6}
                                    className="w-full bg-[var(--overlay-bg)] border border-[var(--glass)] text-[var(--text-primary)] rounded-xl px-4 py-3 focus:outline-none focus:border-[var(--neon-purple)]/50 transition-colors font-medium placeholder-slate-600 resize-none shadow-inner leading-relaxed"
                                    placeholder="Provide more context, share code snippets, or detail your working process..."
                                    value={body}
                                    onChange={(e) => setBody(e.target.value)}
                                />
                                {/* Markdown helper hint (aesthetic only right now) */}
                                <div className="absolute bottom-3 right-3 text-[10px] text-[var(--text-secondary)] font-medium bg-[var(--overlay-bg)] px-2 py-1 rounded border border-[var(--glass)] flex items-center gap-1">
                                    <svg viewBox="0 0 16 16" fill="currentColor" className="w-3 h-3">
                                        <path d="M14.85 3H1.15C.52 3 0 3.52 0 4.15v7.69C0 12.48.52 13 1.15 13h13.69c.64 0 1.15-.52 1.15-1.15v-7.7C16 3.52 15.48 3 14.85 3zM9 11H7V8L5.5 9.92 4 8v3H2V5h2l1.5 2L7 5h2v6zm2.99.5L9.5 8H11V5h2v3h1.5l-2.51 3.5z" />
                                    </svg>
                                    Markdown supported
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-end gap-3 mt-8 pt-6 border-t border-[var(--glass)]">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-5 py-2.5 rounded-xl font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--glass)] transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={!title.trim() || !body.trim()}
                            className="px-6 py-2.5 rounded-xl font-semibold btn-primary shadow-lg shadow-[var(--neon-purple)]/20 hover:scale-105 disabled:opacity-50 disabled:shadow-none disabled:cursor-not-allowed transition-all focus:outline-none"
                        >
                            Post Thread
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
