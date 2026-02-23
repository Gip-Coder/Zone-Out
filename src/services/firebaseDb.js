import firebase from 'firebase/compat/app';
import 'firebase/compat/firestore';
import 'firebase/compat/auth';
import 'firebase/compat/database';
// Validate that environment variables exist before initializing
const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID
};

// Check if credentials have been populated
const isConfigured = firebaseConfig.apiKey && firebaseConfig.apiKey !== "YOUR_API_KEY_HERE";

if (isConfigured && !firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
} else if (!isConfigured) {
    console.warn("⚠️ Firebase is not configured! Please update your .env file with your Firebase credentials.");
}

export const db = isConfigured ? firebase.firestore() : null;
export const rtdb = isConfigured ? firebase.database() : null;
export const auth = isConfigured ? firebase.auth() : null;
export const googleProvider = isConfigured ? new firebase.auth.GoogleAuthProvider() : null;
export const serverTimestamp = isConfigured ? firebase.firestore.FieldValue.serverTimestamp : () => new Date();
export default firebase;
