import React from 'react';
import { Image, Code, Smile, Send } from 'lucide-react';

const CreatePost = () => {
    return (
        <div className="bg-[var(--bg-secondary)] border border-[rgba(255,255,255,0.08)] rounded-[var(--radius-md)] p-4 shadow-lg mb-6">
            <div className="flex gap-4">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[var(--neon-purple)]/20 to-[var(--neon-blue)]/20 flex items-center justify-center border border-[var(--glass)] shrink-0">
                    <span className="font-bold text-[var(--accent-primary)] text-sm">U</span>
                </div>

                <div className="flex-1 flex flex-col gap-3">
                    <textarea
                        className="w-full bg-[var(--bg-tertiary)] border border-transparent hover:border-[rgba(255,255,255,0.1)] focus:border-[var(--accent-primary)] rounded-[var(--radius-md)] p-3 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-secondary)] resize-none transition-all outline-none"
                        placeholder="Share a resource, ask a question, or post a study update..."
                        rows={2}
                    />

                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <button className="p-2 text-[var(--text-secondary)] hover:text-[var(--accent-primary)] hover:bg-[var(--glass)] rounded-[var(--radius-md)] transition-all flex items-center justify-center">
                                <Image size={18} />
                            </button>
                            <button className="p-2 text-[var(--text-secondary)] hover:text-[var(--accent-primary)] hover:bg-[var(--glass)] rounded-[var(--radius-md)] transition-all flex items-center justify-center">
                                <Code size={18} />
                            </button>
                            <button className="p-2 text-[var(--text-secondary)] hover:text-[var(--accent-primary)] hover:bg-[var(--glass)] rounded-[var(--radius-md)] transition-all flex items-center justify-center hidden sm:flex">
                                <Smile size={18} />
                            </button>
                        </div>

                        <button className="bg-[var(--btn-primary-bg)] text-[var(--btn-primary-text)] px-4 py-2 rounded-[var(--radius-md)] text-sm font-bold flex items-center gap-2 hover:opacity-90 transition-all shadow-md shadow-[var(--neon-purple)]/20">
                            Post
                            <Send size={14} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CreatePost;
