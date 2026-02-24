import React from 'react';
import { Type, Code, Paperclip, Send } from 'lucide-react';
import { motion } from 'framer-motion';

export default function CreatePost() {
    return (
        <div className="glass-card p-6 mb-8">
            <h3 className="text-lg font-semibold text-white mb-4">Create Post</h3>
            <div className="relative">
                <textarea
                    placeholder="Add your image here..."
                    className="w-full h-32 bg-black/30 border border-white/10 rounded-xl p-4 text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-[var(--neon-purple)]/50 transition-colors resize-none"
                />
            </div>

            <div className="flex items-center justify-between mt-4">
                <div className="flex gap-2">
                    <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 text-slate-300 hover:bg-white/10 transition-colors border border-white/5">
                        <Type size={18} className="text-[var(--neon-purple)]" />
                        <span className="text-sm font-medium">Add Text</span>
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 text-slate-300 hover:bg-white/10 transition-colors border border-white/5">
                        <Code size={18} className="text-[var(--neon-blue)]" />
                        <span className="text-sm font-medium">Insert Code Snippet</span>
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 text-slate-300 hover:bg-white/10 transition-colors border border-white/5">
                        <Paperclip size={18} className="text-[var(--neon-pink)]" />
                        <span className="text-sm font-medium">Attach Resource</span>
                    </button>
                </div>

                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="bg-gradient-to-r from-[var(--neon-purple)] to-[var(--neon-pink)] text-white px-8 py-2 rounded-lg font-semibold shadow-lg shadow-[var(--neon-purple)]/20 flex items-center gap-2"
                >
                    <span>Post</span>
                    <Send size={16} />
                </motion.button>
            </div>
        </div>
    );
}
