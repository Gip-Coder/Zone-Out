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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0E1015]/80 backdrop-blur-md animate-fade-in">
            <div className="bg-[#14151a] border border-gray-800 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden animate-fade-in-up">

                {/* Header with gradient line */}
                <div className="relative p-6 px-8 border-b border-gray-800/60 flex items-center justify-between bg-[#1a1c23]/50">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 to-indigo-500 opacity-50"></div>
                    <div>
                        <h2 className="text-xl font-bold text-gray-100">Share Progress</h2>
                        <p className="text-xs text-gray-500 font-medium mt-1">Update your group on what you're studying</p>
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
                        {/* Course Tag Input */}
                        <div>
                            <label htmlFor="courseTag" className="block text-sm font-semibold text-gray-300 mb-2">
                                Course / Topic Tag <span className="text-gray-600 font-normal">(Optional)</span>
                            </label>
                            <input
                                id="courseTag"
                                type="text"
                                className="w-full bg-[#1c1e26] border border-gray-800 text-gray-100 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all font-medium placeholder-gray-600"
                                placeholder="e.g., #Calc101, React Module 3"
                                value={courseTag}
                                onChange={(e) => setCourseTag(e.target.value)}
                            />
                        </div>

                        {/* Content Input */}
                        <div>
                            <label htmlFor="content" className="block text-sm font-semibold text-gray-300 mb-2">
                                Update Details
                            </label>
                            <textarea
                                id="content"
                                rows={4}
                                autoFocus
                                className="w-full bg-[#1c1e26] border border-gray-800 text-gray-100 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all font-medium placeholder-gray-600 resize-none"
                                placeholder="What did you achieve today? Share your code, notes, or milestones..."
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                            />
                        </div>

                        {/* Notice */}
                        <div className="flex items-start gap-3 bg-indigo-500/10 text-indigo-400 p-4 rounded-xl border border-indigo-500/20">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 flex-shrink-0 mt-0.5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
                            </svg>
                            <p className="text-sm font-medium leading-relaxed">Pictures and screenshot attachments are coming in a future update!</p>
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
                            disabled={!content.trim()}
                            className="px-6 py-2.5 rounded-xl font-semibold bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-lg shadow-purple-500/25 disabled:opacity-50 disabled:shadow-none disabled:cursor-not-allowed transition-all hover:-translate-y-0.5"
                        >
                            Post Update
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
