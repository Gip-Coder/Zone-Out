import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { db, serverTimestamp } from '../../../services/firebaseDb';
import firebase from 'firebase/compat/app';

const ProgressContext = createContext();

export const ProgressProvider = ({ groupId, currentUser, children }) => {
    const [updates, setUpdates] = useState([]);

    useEffect(() => {
        if (!groupId || !db) return;

        const q = db.collection('group_progress')
            .doc(groupId)
            .collection('updates')
            .orderBy('createdAt', 'desc')
            .limit(50); // Pagination ready

        const unsubscribe = q.onSnapshot((snapshot) => {
            const fetchedUpdates = [];
            snapshot.forEach((doc) => {
                fetchedUpdates.push({ id: doc.id, ...doc.data() });
            });
            setUpdates(fetchedUpdates);
        });

        return () => unsubscribe();
    }, [groupId]);

    const postUpdate = useCallback(async (courseTag, content, mediaUrl = null) => {
        if (!db || !groupId || !currentUser) return;

        await db.collection('group_progress').doc(groupId).collection('updates').add({
            authorId: currentUser.id,
            authorName: currentUser.name || 'User',
            courseTag,
            content,
            mediaUrl,
            likes: [],
            createdAt: serverTimestamp()
        });
    }, [groupId, currentUser]);

    const toggleLike = useCallback(async (updateId, isLiking) => {
        if (!db || !groupId || !currentUser) return;

        const updateRef = db.collection('group_progress').doc(groupId).collection('updates').doc(updateId);

        if (isLiking) {
            await updateRef.update({
                likes: firebase.firestore.FieldValue.arrayUnion(currentUser.id)
            });
        } else {
            await updateRef.update({
                likes: firebase.firestore.FieldValue.arrayRemove(currentUser.id)
            });
        }
    }, [groupId, currentUser]);

    const value = useMemo(() => ({
        updates,
        postUpdate,
        toggleLike
    }), [updates, postUpdate, toggleLike]);

    return (
        <ProgressContext.Provider value={value}>
            {children}
        </ProgressContext.Provider>
    );
};

export const useProgressContext = () => useContext(ProgressContext);
