import { useState, useEffect } from 'react';
import { db, serverTimestamp } from '../../../services/firebaseDb';

export const useThreads = (groupId) => {
    const [threads, setThreads] = useState([]);

    useEffect(() => {
        if (!groupId || !db) return;
        const threadsRef = db.collection('group_threads')
            .doc(groupId).collection('posts')
            .orderBy('createdAt', 'desc');

        const unsubscribe = threadsRef.onSnapshot((snapshot) => {
            setThreads(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        });
        return () => unsubscribe();
    }, [groupId]);

    const createThread = async (userId, title, body) => {
        await db.collection('group_threads').doc(groupId).collection('posts').add({
            authorId: userId,
            title,
            body,
            upvotes: [],
            createdAt: serverTimestamp(),
            commentsCount: 0
        });
    };

    return { threads, createThread };
};
