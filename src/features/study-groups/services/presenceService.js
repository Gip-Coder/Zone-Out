import firebase, { rtdb } from '../../../services/firebaseDb';

export const presenceService = {
    trackUserPresence: (groupId, userId) => {
        if (!rtdb) return () => { };

        const userStatusRef = rtdb.ref(`/status/${groupId}/${userId}`);
        const connectedRef = rtdb.ref('.info/connected');

        const callback = connectedRef.on('value', (snapshot) => {
            if (snapshot.val() === false) return;

            // When I disconnect, update to offline and log time
            userStatusRef.onDisconnect().set({
                state: 'offline',
                last_changed: firebase.database.ServerValue.TIMESTAMP,
            }).then(() => {
                // When I connect, set online
                userStatusRef.set({
                    state: 'online',
                    last_changed: firebase.database.ServerValue.TIMESTAMP,
                });
            });
        });

        // Return cleanup function
        return () => {
            connectedRef.off('value', callback);
            userStatusRef.set({
                state: 'offline',
                last_changed: firebase.database.ServerValue.TIMESTAMP,
            });
        };
    },

    listenToGroupPresence: (groupId, onUpdate) => {
        if (!rtdb) return () => { };

        const groupStatusRef = rtdb.ref(`/status/${groupId}`);
        const callback = groupStatusRef.on('value', (snapshot) => {
            onUpdate(snapshot.val() || {});
        });

        return () => {
            groupStatusRef.off('value', callback);
        };
    }
};
