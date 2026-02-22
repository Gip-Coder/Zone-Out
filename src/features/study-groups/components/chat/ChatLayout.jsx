import React, { useRef, useEffect } from 'react';
import { useRealtimeChat } from '../../hooks/useRealtimeChat';
import { useStudyGroup } from '../../context/StudyGroupContext';
import { MessageBubble } from './MessageBubble';
import { ChatInput } from './ChatInput';

export const ChatLayout = ({ currentUser }) => {
    const { group } = useStudyGroup();
    const { messages, sendMessage } = useRealtimeChat(group.id, currentUser.id);
    const endRef = useRef(null);

    useEffect(() => {
        endRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    return (
        <div className="sg-view-container">
            <div className="sg-scrollable">
                {messages.length === 0 ? (
                    <div className="sg-empty">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" width={48} height={48}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
                        </svg>
                        <p>No messages yet. Start the conversation!</p>
                    </div>
                ) : (
                    messages.map((msg) => (
                        <MessageBubble
                            key={msg.id}
                            message={msg}
                            isMe={msg.senderId === currentUser.id}
                        />
                    ))
                )}
                <div ref={endRef} />
            </div>
            <ChatInput onSendMessage={sendMessage} />
        </div>
    );
};
