import React, { useState, useRef, useEffect } from 'react';

export const ChatInput = ({ onSend, setTypingStatus }) => {
    const [text, setText] = useState('');
    const typingTimeoutRef = useRef(null);

    const handleSend = (e) => {
        e.preventDefault();
        if (!text.trim()) return;

        onSend(text.trim());
        setText('');

        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
        setTypingStatus(false);
    };

    const handleChange = (e) => {
        setText(e.target.value);
        setTypingStatus(true);

        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = setTimeout(() => {
            setTypingStatus(false);
        }, 1500);
    };

    useEffect(() => {
        return () => {
            if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
            setTypingStatus(false);
        };
    }, [setTypingStatus]);

    return (
        <div className="p-4 bg-[#14151a]/90 backdrop-blur-xl border-t border-gray-800/60 shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.5)] z-20">
            <form
                onSubmit={handleSend}
                className="max-w-4xl mx-auto flex items-end gap-3 bg-[#1c1e26] rounded-2xl p-2 pl-4 focus-within:ring-2 focus-within:ring-indigo-500/50 transition-all border border-gray-800 shadow-inner"
            >
                <div className="flex-1 py-1">
                    <textarea
                        value={text}
                        onChange={handleChange}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                handleSend(e);
                            }
                        }}
                        placeholder="Type a message..."
                        rows={1}
                        className="w-full bg-transparent text-sm text-gray-100 placeholder-gray-500 outline-none resize-none max-h-32 min-h-[24px] overflow-hidden"
                        style={{ height: 'auto' }}
                    />
                </div>

                <div className="flex items-center gap-2 pb-0.5">
                    <button
                        type="button"
                        className="p-2 text-gray-400 hover:text-gray-200 transition-colors rounded-xl hover:bg-gray-800"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.182 15.182a4.5 4.5 0 01-6.364 0M21 12a9 9 0 11-18 0 9 9 0 0118 0zM9.75 9.75c0 .414-.168.75-.375.75S9 10.164 9 9.75 9.168 9 9.375 9s.375.336.375.75zm3.625 0c0 .414-.168.75-.375.75s-.375-.336-.375-.75.168-.75.375-.75.375.336.375.75z" />
                        </svg>
                    </button>

                    <button
                        type="submit"
                        disabled={!text.trim()}
                        className="p-2.5 rounded-xl bg-indigo-600 text-white shadow-lg shadow-indigo-500/30 hover:bg-indigo-500 hover:scale-105 disabled:opacity-40 disabled:hover:scale-100 disabled:shadow-none transition-all duration-200"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 -rotate-45 relative translate-x-0.5 -translate-y-0.5">
                            <path d="M3.478 2.404a.75.75 0 00-.926.941l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.404z" />
                        </svg>
                    </button>
                </div>
            </form>
        </div>
    );
};
