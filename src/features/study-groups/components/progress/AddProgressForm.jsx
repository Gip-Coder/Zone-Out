import React, { useState } from 'react';

export const AddProgressForm = ({ isOpen, onClose, onSubmit }) => {
    const [content, setContent] = useState('');
    const [courseTag, setCourseTag] = useState('');

    if (!isOpen) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!content.trim()) return;
        onSubmit(content, courseTag);
        setContent('');
        setCourseTag('');
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fade-in">
            <div className="glass-card w-full max-w-lg overflow-hidden animate-fade-in-up border-none">

                {/* Header with gradient line */}
                <div className="relative p-6 px-8 border-b border-white/5 flex items-center justify-between bg-black/20">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[var(--neon-purple)] to-[var(--neon-pink)] opacity-80"></div>
                    <div>
                        <h2 className="text-xl font-bold text-white">Share Progress</h2>
                        <p className="text-xs text-slate-400 font-medium mt-1">Update your group on what you're studying</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 text-slate-500 hover:text-white hover:bg-white/10 rounded-xl transition-colors"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-8">
                    <div className="space-y-6">
                        {/* Course Tag Input */}
                        <div>
                            <label htmlFor="courseTag" className="block text-sm font-semibold text-slate-300 mb-2">
                                Course / Topic Tag <span className="text-slate-500 font-normal">(Optional)</span>
                            </label>
                            <input
                                id="courseTag"
                                type="text"
                                className="w-full bg-black/30 border border-white/10 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-[var(--neon-purple)]/50 transition-colors font-medium placeholder-slate-600 shadow-inner"
                                placeholder="e.g., #Calc101, React Module 3"
                                value={courseTag}
                                onChange={(e) => setCourseTag(e.target.value)}
                            />
                        </div>

                        {/* Content Input */}
                        <div>
                            <label htmlFor="content" className="block text-sm font-semibold text-slate-300 mb-2">
                                Update Details
                            </label>
                            <textarea
                                id="content"
                                rows={4}
                                autoFocus
                                className="w-full bg-black/30 border border-white/10 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-[var(--neon-purple)]/50 transition-colors font-medium placeholder-slate-600 resize-none shadow-inner"
                                placeholder="What did you achieve today? Share your code, notes, or milestones..."
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                            />
                        </div>

                        {/* Notice */}
                        <div className="flex items-start gap-3 bg-[var(--neon-purple)]/10 text-[var(--neon-purple)] p-4 rounded-xl border border-[var(--neon-purple)]/20">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 flex-shrink-0 mt-0.5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
                            </svg>
                            <p className="text-sm font-medium leading-relaxed text-white/80">Pictures and screenshot attachments are coming in a future update!</p>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-end gap-3 mt-8 pt-6 border-t border-white/5">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-5 py-2.5 rounded-xl font-medium text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={!content.trim()}
                            className="px-6 py-2.5 rounded-xl font-semibold bg-gradient-to-r from-[var(--neon-purple)] to-[var(--neon-pink)] text-white shadow-lg shadow-[var(--neon-purple)]/20 hover:scale-105 disabled:opacity-50 disabled:shadow-none disabled:cursor-not-allowed transition-all focus:outline-none"
                        >
                            Post Update
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
