import React from 'react';
import { Type, Code, Paperclip, Send } from 'lucide-react';
import { motion } from 'framer-motion';
import { useThreadContext } from '../context/ThreadContext';

const CreatePostCard = () => {
    const { createThread } = useThreadContext();
    const [body, setBody] = React.useState('');

    const handleSubmit = async () => {
        if (!body.trim()) return;
        // The layout template doesn't have a specific title input, so we generate a short one from the body 
        // to maintain compatibility with the ThreadContext backend which expects a title.
        const title = body.split('\n')[0].substring(0, 50) + (body.length > 50 ? '...' : '');
        await createThread(title, body);
        setBody('');
    };

    return (
        <div className="glass-card p-6 mb-8 mt-2">
            <h3 className="text-lg font-semibold text-white mb-4">Create Post</h3>
            <div className="relative">
                <textarea
                    placeholder="Share your thoughts, resources, or ask a question..."
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                    className="w-full h-32 bg-black/30 border border-white/10 rounded-xl p-4 text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-[var(--neon-purple)]/50 transition-colors resize-none custom-scrollbar"
                />
            </div>

            <div className="flex flex-wrap items-center justify-between mt-4 gap-4">
                <div className="flex flex-wrap gap-2">
                    <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 text-slate-300 hover:bg-white/10 transition-colors border border-white/5">
                        <Type size={18} className="text-[var(--neon-purple)]" />
                        <span className="text-sm font-medium">Add Text</span>
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 text-slate-300 hover:bg-white/10 transition-colors border border-white/5">
                        <Code size={18} className="text-[var(--neon-blue)]" />
                        <span className="text-sm font-medium">Code Snippet</span>
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 text-slate-300 hover:bg-white/10 transition-colors border border-white/5">
                        <Paperclip size={18} className="text-[var(--neon-pink)]" />
                        <span className="text-sm font-medium">Attach</span>
                    </button>
                </div>

                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleSubmit}
                    disabled={!body.trim()}
                    className="bg-gradient-to-r from-[var(--neon-purple)] to-[var(--neon-pink)] disabled:opacity-50 disabled:cursor-not-allowed text-white px-8 py-2 rounded-lg font-semibold shadow-lg shadow-[var(--neon-purple)]/20 flex items-center gap-2"
                >
                    <span>Post</span>
                    <Send size={16} />
                </motion.button>
            </div>
        </div>
    );
};

export default CreatePostCard;
