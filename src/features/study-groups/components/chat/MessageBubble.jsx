import React from 'react';

export const MessageBubble = ({ message, isMe }) => {
    const time = message.timestamp?.toDate ? message.timestamp.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '';

    return (
        <div className={`sg-chat-message ${isMe ? 'me' : ''}`}>
            <div className={`sg-bubble ${isMe ? 'me' : 'them'}`}>
                {!isMe && <div style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--accent-primary)', marginBottom: '4px' }}>{message.senderName || 'Anonymous'}</div>}
                <div>{message.text}</div>
                <div style={{ fontSize: '10px', marginTop: '6px', textAlign: 'right', opacity: 0.7 }}>
                    {time}
                </div>
            </div>
        </div>
    );
};
