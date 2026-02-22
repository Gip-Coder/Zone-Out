import React, { useState } from 'react';

export const ChatInput = ({ onSendMessage }) => {
    const [input, setInput] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!input.trim()) return;
        onSendMessage(input);
        setInput('');
    };

    return (
        <form onSubmit={handleSubmit} className="sg-chat-input-area">
            <input
                autoFocus
                className="sg-input"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type a message..."
            />
            <button
                type="submit"
                className="sg-btn-primary"
                disabled={!input.trim()}
                aria-label="Send message"
            >
                Send
            </button>
        </form>
    );
};
