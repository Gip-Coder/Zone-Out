import React from 'react';
import { Image, Code, Link as LinkIcon, Send } from 'lucide-react';
import { motion } from 'framer-motion';
import { useThreadContext } from '../context/ThreadContext';

const CreatePostCard = () => {
    const { createThread, currentUser } = useThreadContext();
    const [body, setBody] = React.useState('');

    const handleSubmit = async () => {
        if (!body.trim()) return;
        const title = body.split('\n')[0].substring(0, 50) + (body.length > 50 ? '...' : '');
        await createThread(title, body);
        setBody('');
    };

    return (
        <div className="card mb-6">
            <div className="flex items-start gap-4 mb-2">
                <div className="avatar btn-primary flex items-center justify-center shrink-0 shadow-lg text-lg font-bold">
                    {currentUser?.name?.[0] || 'U'}
                </div>
                <textarea
                    placeholder="Write a post, share snippet, or ask a question..."
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                    style={{
                        width: '100%',
                        minHeight: '80px',
                        background: 'transparent',
                        border: 'none',
                        resize: 'none',
                        color: 'var(--text-primary)',
                        fontSize: '14px'
                    }}
                    className="pt-2 placeholder:text-[var(--text-secondary)] focus:outline-none custom-scrollbar"
                />
            </div>

            <div className="flex justify-between items-center pt-3 mt-1 border-t border-[var(--glass)]">
                <div className="flex flex-wrap items-center gap-2">
                    <button className="btn btn-secondary btn-sm text-[var(--text-secondary)]">
                        <Image size={16} className="text-[var(--neon-pink)]" />
                        <span>Attach</span>
                    </button>
                    <button className="btn btn-secondary btn-sm text-[var(--text-secondary)]">
                        <Code size={16} className="text-[var(--neon-blue)]" />
                        <span>Snippet</span>
                    </button>
                    <button className="btn btn-secondary btn-sm text-[var(--text-secondary)]">
                        <LinkIcon size={16} className="text-[var(--neon-purple)]" />
                        <span>Resource</span>
                    </button>
                </div>

                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleSubmit}
                    disabled={!body.trim()}
                    className="btn btn-primary shadow-lg"
                >
                    <span>Post</span>
                    <Send size={16} />
                </motion.button>
            </div>
        </div>
    );
};

export default CreatePostCard;
