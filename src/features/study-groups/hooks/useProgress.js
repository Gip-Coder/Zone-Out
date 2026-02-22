import { useState, useEffect } from 'react';
import { db, serverTimestamp } from '../../../services/firebaseDb';

export const useProgress = (groupId) => {
    const [updates, setUpdates] = useState([]);

    useEffect(() => {
        if (!groupId || !db) return;
        const progressRef = db.collection('group_progress')
            .doc(groupId).collection('updates')
            .orderBy('createdAt', 'desc');

        const unsubscribe = progressRef.onSnapshot((snapshot) => {
            setUpdates(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        });
        return () => unsubscribe();
    }, [groupId]);

    const postUpdate = async (userId, courseTag, content, mediaUrl = null) => {
        await db.collection('group_progress').doc(groupId).collection('updates').add({
            authorId: userId,
            courseTag,
            content,
            mediaUrl,
            likes: [],
            createdAt: serverTimestamp()
        });
    };

    return { updates, postUpdate };
};
