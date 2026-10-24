import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { db } from '../../../services/firebaseDb';
import { presenceService } from '../services/presenceService';

const StudyGroupContext = createContext();

export const StudyGroupProvider = ({ groupId, currentUser, children }) => {
    const [group, setGroup] = useState(null);
    const [membersPresence, setMembersPresence] = useState({});
    // Nothing to load without a group or a configured Firebase
    const [loading, setLoading] = useState(Boolean(groupId && db));

    // 1. Core Group Details Listener
    useEffect(() => {
        if (!groupId || !db) return;

        const unsubscribe = db.collection('groups').doc(groupId).onSnapshot(
            (doc) => {
                if (doc.exists) {
                    setGroup({ id: doc.id, ...doc.data() });
                } else {
                    // Fallback to local mock immediately to circumvent Firebase permission errors
                    setGroup({
                        id: groupId,
                        name: 'Advanced React Study Group',
                        description: 'Your Firebase is connected but empty. This is mock data rendered locally.',
                        privacy: 'public',
                        members: ['user_123'],
                        createdAt: new Date()
                    });
                }
                setLoading(false);
            },
            (err) => {
                console.warn('Firebase error, using mock data:', err.message);
                setGroup({
                    id: groupId,
                    name: 'Firebase Permissions Blocked (Mock View)',
                    description: `Error: ${err.message}. Showing local mock data instead.`,
                    privacy: 'public',
                    members: ['user_123'],
                    createdAt: new Date()
                });
                setLoading(false);
            }
        );

        return () => unsubscribe();
    }, [groupId]);

    // 2. Presence Tracking (RTDB)
    useEffect(() => {
        if (!groupId || !currentUser?.id) return;

        // Track self
        const cleanupPresence = presenceService.trackUserPresence(groupId, currentUser.id);

        // Listen to others
        const unsubscribePresence = presenceService.listenToGroupPresence(groupId, (presenceData) => {
            setMembersPresence(presenceData);
        });

        return () => {
            cleanupPresence();
            unsubscribePresence();
        };
    }, [groupId, currentUser]);

    const contextValue = useMemo(() => ({
        group,
        membersPresence,
        loading
    }), [group, membersPresence, loading]);

    return (
        <StudyGroupContext.Provider value={contextValue}>
            {children}
        </StudyGroupContext.Provider>
    );
};

export const useStudyGroup = () => {
    const context = useContext(StudyGroupContext);
    if (!context) {
        throw new Error("useStudyGroup must be used within a StudyGroupProvider");
    }
    return context;
};
