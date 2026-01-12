// Firebase Configuration
// Firebase project: Jiome (Blaze Account)
// Get these values from: Firebase Console > Project Settings > Your apps > Web app

import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

// Firebase configuration using environment variables only
// Note: Firebase API keys are client-side keys (meant to be public), but we use env vars
// for better security and to avoid secret scanning alerts
// Get these values from: Firebase Console > Project Settings > Your apps > Web app
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

// Validate that required environment variables are set
if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
  throw new Error(
    'Missing required Firebase configuration. Please set the following environment variables in your .env file:\n' +
    '- VITE_FIREBASE_API_KEY\n' +
    '- VITE_FIREBASE_AUTH_DOMAIN\n' +
    '- VITE_FIREBASE_PROJECT_ID\n' +
    '- VITE_FIREBASE_STORAGE_BUCKET\n' +
    '- VITE_FIREBASE_MESSAGING_SENDER_ID\n' +
    '- VITE_FIREBASE_APP_ID\n' +
    'See README.md for setup instructions.'
  );
}

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

// Export app instance if needed elsewhere
export default app;

