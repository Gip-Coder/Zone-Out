import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { db, serverTimestamp } from '../../../services/firebaseDb';
import firebase from 'firebase/compat/app';

const ThreadContext = createContext();

export const ThreadProvider = ({ groupId, currentUser, children }) => {
    const [threads, setThreads] = useState([]);

    useEffect(() => {
        if (!groupId || !db) return;

        const q = db.collection('group_threads')
            .doc(groupId)
            .collection('posts')
            .orderBy('createdAt', 'desc')
            .limit(50); // Pagination ready

        const unsubscribe = q.onSnapshot((snapshot) => {
            const fetchedThreads = [];
            snapshot.forEach((doc) => {
                fetchedThreads.push({ id: doc.id, ...doc.data() });
            });
            setThreads(fetchedThreads);
        });

        return () => unsubscribe();
    }, [groupId]);

    const createThread = useCallback(async (title, body) => {
        if (!db || !groupId || !currentUser) return;

        await db.collection('group_threads').doc(groupId).collection('posts').add({
            authorId: currentUser.id,
            authorName: currentUser.name || 'User',
            title,
            body,
            upvotes: [],
            createdAt: serverTimestamp(),
            commentsCount: 0
        });
    }, [groupId, currentUser]);

    const toggleUpvote = useCallback(async (threadId, userId, isUpvoting) => {
        if (!db || !groupId) return;

        const threadRef = db.collection('group_threads').doc(groupId).collection('posts').doc(threadId);

        if (isUpvoting) {
            await threadRef.update({
                upvotes: firebase.firestore.FieldValue.arrayUnion(userId)
            });
        } else {
            await threadRef.update({
                upvotes: firebase.firestore.FieldValue.arrayRemove(userId)
            });
        }
    }, [groupId]);

    const value = useMemo(() => ({
        threads,
        createThread,
        toggleUpvote
    }), [threads, createThread, toggleUpvote]);

    return (
        <ThreadContext.Provider value={value}>
            {children}
        </ThreadContext.Provider>
    );
};

export const useThreadContext = () => useContext(ThreadContext);
