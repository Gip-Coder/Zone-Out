import React, { createContext, useContext, useState, useEffect } from 'react';
import { db } from '../../../services/firebaseDb';

const StudyGroupContext = createContext();

export const StudyGroupProvider = ({ groupId, children }) => {
    const [group, setGroup] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!groupId) {
            setLoading(false);
            return;
        }

        if (!db) {
            setError(new Error('Firebase DB is not configured. Please add your credentials to the .env file.'));
            setLoading(false);
            return;
        }

        const unsubscribe = db.collection('groups').doc(groupId)
            .onSnapshot(
                (doc) => {
                    if (doc.exists) {
                        setGroup({ id: doc.id, ...doc.data() });
                        setLoading(false);
                    } else {
                        // Fallback to local mock immediately to circumvent Firebase permission errors
                        setGroup({
                            id: groupId,
                            name: 'Advanced React Study Group (New Database)',
                            description: 'Your Firebase is connected but empty. This is mock data rendered locally.',
                            privacy: 'public',
                            members: ['user_123'],
                            createdAt: new Date()
                        });
                        setLoading(false);
                    }
                },
                (err) => {
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

    return (
        <StudyGroupContext.Provider value={{ group, loading, error }}>
            {loading ? (
                <div className="flex justify-center items-center h-full min-h-[400px]">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                </div>
            ) : error ? (
                <div className="text-red-500 text-center p-4">Error loading group: {error.message}</div>
            ) : (
                children
            )}
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
