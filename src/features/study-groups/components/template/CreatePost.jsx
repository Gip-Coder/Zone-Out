import React from 'react';
import { Type, Code, Paperclip, Send } from 'lucide-react';
import { motion } from 'framer-motion';

export default function CreatePost() {
    return (
        <div className="glass-card p-6 mb-8">
            <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-4">Create Post</h3>
            <div className="relative">
                <textarea
                    placeholder="Add your image here..."
                    className="w-full h-32 bg-[var(--overlay-bg)] border border-[var(--glass)] rounded-xl p-4 text-[var(--text-secondary)] placeholder:text-[var(--text-secondary)] focus:outline-none focus:border-[var(--neon-purple)]/50 transition-colors resize-none"
                />
            </div>

            <div className="flex items-center justify-between mt-4">
                <div className="flex gap-2">
                    <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[var(--glass)] text-[var(--text-secondary)] hover:bg-[var(--glass)] transition-colors border border-[var(--glass)]">
                        <Type size={18} className="text-[var(--neon-purple)]" />
                        <span className="text-sm font-medium">Add Text</span>
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[var(--glass)] text-[var(--text-secondary)] hover:bg-[var(--glass)] transition-colors border border-[var(--glass)]">
                        <Code size={18} className="text-[var(--neon-blue)]" />
                        <span className="text-sm font-medium">Insert Code Snippet</span>
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[var(--glass)] text-[var(--text-secondary)] hover:bg-[var(--glass)] transition-colors border border-[var(--glass)]">
                        <Paperclip size={18} className="text-[var(--neon-pink)]" />
                        <span className="text-sm font-medium">Attach Resource</span>
                    </button>
                </div>

                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="btn-primary px-8 py-2 rounded-lg font-semibold shadow-lg shadow-[var(--neon-purple)]/20 flex items-center gap-2"
                >
                    <span>Post</span>
                    <Send size={16} />
                </motion.button>
            </div>
        </div>
    );
}
