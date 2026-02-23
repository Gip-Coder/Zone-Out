import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { db, rtdb, serverTimestamp } from '../../../services/firebaseDb';
import firebase from 'firebase/compat/app';

const ChatContext = createContext();

export const ChatProvider = ({ groupId, currentUser, children }) => {
    const [messages, setMessages] = useState([]);
    const [typingUsers, setTypingUsers] = useState({});

    // 1. Messages Listener
    useEffect(() => {
        if (!groupId || !db) return;

        const q = db.collection('group_chats')
            .doc(groupId)
            .collection('messages')
            .orderBy('timestamp', 'desc')
            .limit(200);

        const unsubscribe = q.onSnapshot((snapshot) => {
            const fetchedMessages = [];
            snapshot.forEach((doc) => {
                fetchedMessages.push({ id: doc.id, ...doc.data() });
            });
            setMessages(fetchedMessages.reverse()); // Reverse to chronological
        });

        return () => unsubscribe();
    }, [groupId]);

    // 2. Typing Indicators Listener
    useEffect(() => {
        if (!groupId || !rtdb) return;

        const typingRef = rtdb.ref(`/typing/${groupId}`);
        const callback = typingRef.on('value', (snapshot) => {
            setTypingUsers(snapshot.val() || {});
        });

        return () => typingRef.off('value', callback);
    }, [groupId]);

    const sendMessage = useCallback(async (text) => {
        if (!db || !groupId || !currentUser) return;

        await db.collection('group_chats').doc(groupId).collection('messages').add({
            senderId: currentUser.id,
            authorDetails: { name: currentUser.name || 'User' },
            text,
            timestamp: serverTimestamp(),
            readBy: [currentUser.id]
        });
    }, [groupId, currentUser]);

    const setTypingStatus = useCallback((isTyping) => {
        if (!rtdb || !groupId || !currentUser) return;
        rtdb.ref(`/typing/${groupId}/${currentUser.id}`).set(isTyping);
        // Clear offline automatically
        if (isTyping) {
            rtdb.ref(`/typing/${groupId}/${currentUser.id}`).onDisconnect().remove();
        }
    }, [groupId, currentUser]);

    const value = useMemo(() => ({
        messages,
        typingUsers,
        sendMessage,
        setTypingStatus
    }), [messages, typingUsers, sendMessage, setTypingStatus]);

    return (
        <ChatContext.Provider value={value}>
            {children}
        </ChatContext.Provider>
    );
};

export const useChatContext = () => useContext(ChatContext);
