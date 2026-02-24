import React, { useEffect, useRef, useMemo } from 'react';
import { useStudyGroup } from '../../context/StudyGroupContext';
import { useChatContext } from '../../context/ChatContext';
import { ChatInput } from './ChatInput';

const MessageGroup = React.memo(({ messages, isMe, author }) => {
    return (
        <div className={`flex flex-col mb-6 ${isMe ? 'items-end' : 'items-start'}`}>
            {!isMe && (
                <div className="flex items-center gap-2 mb-1.5 ml-1">
                    <div className="w-5 h-5 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-[10px] text-white font-bold shadow-sm shadow-indigo-500/20">
                        {author?.name?.[0] || 'U'}
                    </div>
                    <span className="text-xs font-medium text-gray-400">{author?.name || 'User'}</span>
                    <span className="text-[10px] text-gray-600">
                        {messages[0]?.timestamp?.toDate ? new Date(messages[0].timestamp.toDate()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Now'}
                    </span>
                </div>
            )}

            {messages.map((msg, idx) => {
                const isFirst = idx === 0;
                const isLast = idx === messages.length - 1;

                return (
                    <div
                        key={msg.id}
                        className={`group relative max-w-[75%] px-4 py-2.5 mb-1 text-[15px] leading-relaxed shadow-sm transition-all duration-200 ${isMe
                            ? 'bg-gradient-to-br from-indigo-600 to-indigo-700 text-white hover:shadow-indigo-500/20'
                            : 'bg-[#1c1e26] text-gray-100 hover:bg-[#23252f] border border-gray-800/60 shadow-black/20'
                            }`}
                        style={{
                            borderRadius: '16px',
                            borderTopRightRadius: isMe && !isFirst ? '4px' : '16px',
                            borderBottomRightRadius: isMe && !isLast ? '4px' : (isMe ? '2px' : '16px'),
                            borderTopLeftRadius: !isMe && !isFirst ? '4px' : '16px',
                            borderBottomLeftRadius: !isMe && !isLast ? '4px' : (!isMe ? '2px' : '16px')
                        }}
                    >
                        {msg.text}

                        {/* Status indicators */}
                        {isMe && isLast && (
                            <div className="absolute -bottom-4 right-1 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <span className="text-[10px] text-gray-500 font-medium">
                                    {msg.readBy?.length > 0 ? 'Read' : 'Delivered'}
                                </span>
                                {msg.readBy?.length > 0 && (
                                    <svg className="w-3 h-3 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                                    </svg>
                                )}
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
});

export const ChatContainer = ({ currentUser }) => {
    const { group } = useStudyGroup();
    const { messages, sendMessage, typingUsers, setTypingStatus } = useChatContext();
    const scrollRef = useRef(null);

    // Auto-scroll logic
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, typingUsers]);

    // Grouping
    const groupedMessages = useMemo(() => {
        const groups = [];
        let currentGroup = null;

        messages.forEach(msg => {
            const msgTime = msg.timestamp?.toMillis ? msg.timestamp.toMillis() : Date.now();
            if (!currentGroup ||
                currentGroup.senderId !== msg.senderId ||
                (msgTime - currentGroup.lastTime > 60000)) { // Reduced to 1 min for tighter grouping

                if (currentGroup) groups.push(currentGroup);
                currentGroup = {
                    senderId: msg.senderId,
                    authorDetails: msg.authorDetails,
                    messages: [msg],
                    lastTime: msgTime
                };
            } else {
                currentGroup.messages.push(msg);
                currentGroup.lastTime = msgTime;
            }
        });
        if (currentGroup) groups.push(currentGroup);
        return groups;
    }, [messages]);

    const activeTypers = Object.entries(typingUsers || {})
        .filter(([id, isTyping]) => isTyping && id !== currentUser?.id)
        .map(([id]) => id);

    return (
        <div className="flex flex-col h-full bg-transparent relative overflow-hidden p-6">
            {/* Ambient Background Glow (Optional, keeping it for extra depth) */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-600/5 rounded-full blur-[120px] pointer-events-none -z-10" />
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-600/5 rounded-full blur-[120px] pointer-events-none -z-10" />

            {/* Chat header */}
            <div className="glass-card mb-6 h-16 flex items-center px-6 z-10 shrink-0">
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[var(--neon-blue)] to-[var(--neon-purple)] flex items-center justify-center font-bold text-white shadow-lg neon-glow-purple">
                        #
                    </div>
                    <div>
                        <h2 className="font-semibold text-white text-lg leading-tight">Live Discussion</h2>
                        <p className="text-xs text-slate-400 font-medium tracking-wide">{group?.members?.length || 42} <span className="text-slate-500">members online</span></p>
                    </div>
                </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto px-2 py-4 scroll-smooth z-10 custom-scrollbar glass-card mb-6 flex flex-col" ref={scrollRef}>
                {messages.length === 0 && (
                    <div className="flex flex-col items-center justify-center h-full text-slate-400 animate-fade-in-up flex-1">
                        <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-4 border border-white/10 shadow-inner">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor" className="w-10 h-10 text-[var(--neon-purple)] opacity-50">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.76c0 1.6 1.123 2.994 2.707 3.227 1.087.16 2.185.283 3.293.369V21l4.076-4.076a1.526 1.526 0 011.037-.443 48.282 48.282 0 005.68-.494c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
                            </svg>
                        </div>
                        <h3 className="text-white font-medium text-lg mb-1">Start the Conversation</h3>
                        <p className="text-sm">Be the first to say hello to the group!</p>
                    </div>
                )}

                <div className="w-full flex-1">
                    {groupedMessages.map((groupData, i) => (
                        <MessageGroup
                            key={i}
                            messages={groupData.messages}
                            isMe={groupData.senderId === currentUser?.id}
                            author={groupData.authorDetails}
                        />
                    ))}

                    {/* Typing Indicator */}
                    {activeTypers.length > 0 && (
                        <div className="flex items-center gap-3 text-gray-400 mb-2 ml-1 animate-pulse">
                            <div className="flex gap-1 items-center bg-[#1c1e26] px-3 py-2 rounded-2xl border border-gray-800/60 rounded-bl-sm">
                                <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-bounce" style={{ animationDelay: '0ms' }}></div>
                                <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-bounce" style={{ animationDelay: '150ms' }}></div>
                                <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-bounce" style={{ animationDelay: '300ms' }}></div>
                            </div>
                            <span className="text-xs font-medium">
                                {activeTypers.length === 1 ? 'Someone is typing...' : 'Multiple people are typing...'}
                            </span>
                        </div>
                    )}
                </div>
            </div>

            <div className="z-10">
                <ChatInput onSend={sendMessage} setTypingStatus={setTypingStatus} />
            </div>
        </div>
    );
};

