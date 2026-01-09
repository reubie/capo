// Firebase Configuration
// Firebase project: Jiome (New Account)
// Get these values from: Firebase Console > Project Settings > Your apps > Web app

import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

// Your Firebase configuration object
// Using environment variables for security, with fallback to actual values
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyABjdz71juFISYWWwEFhjyWkV1jVa63psw",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "jiome-f9f77.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "jiome-f9f77",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "jiome-f9f77.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "21306379382",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:21306379382:web:d074f1131a73eb85122357",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-5116RR4J5Z"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

// Export app instance if needed elsewhere
export default app;

