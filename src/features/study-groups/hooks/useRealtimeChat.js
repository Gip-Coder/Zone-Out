import { useState, useEffect } from 'react';
import { db, serverTimestamp } from '../../../services/firebaseDb';

export const useRealtimeChat = (groupId, userId) => {
    const [messages, setMessages] = useState([]);

    useEffect(() => {
        if (!groupId || !db) return;
        const messagesRef = db.collection('group_chats')
            .doc(groupId).collection('messages')
            .orderBy('timestamp', 'asc');

        const unsubscribe = messagesRef.onSnapshot((snapshot) => {
            setMessages(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        });
        return () => unsubscribe();
    }, [groupId]);

    const sendMessage = async (text) => {
        await db.collection('group_chats').doc(groupId).collection('messages').add({
            senderId: userId,
            text,
            timestamp: serverTimestamp(),
            readReceipts: { [userId]: serverTimestamp() },
            isOffTopic: false
        });
    };

    return { messages, sendMessage };
};
