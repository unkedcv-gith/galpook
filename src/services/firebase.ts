import { initializeApp, getApps, getApp } from 'firebase/app';
import { initializeFirestore, getFirestore, setLogLevel } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

// Your web app's Firebase configuration from Firebase Console (unkewebs)
const firebaseConfig = {
  apiKey: "AIzaSyCWxH5d89qd2P1kP3hYC4CXejcJRJt0b50",
  authDomain: "unkewebs.firebaseapp.com",
  projectId: "unkewebs",
  storageBucket: "unkewebs.firebasestorage.app",
  messagingSenderId: "468701849844",
  appId: "1:468701849844:web:e205a9e205130a1dd656a1",
  measurementId: "G-L2DMEWV3GJ"
};

// Silence internal connection retry and offline notices from Firestore logger
try {
  setLogLevel('silent');
} catch {
  // Ignore if already configured
}

// Initialize Firebase safely
export const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

let firestoreInstance;
try {
  firestoreInstance = initializeFirestore(app, {
    experimentalAutoDetectLongPolling: true,
    ignoreUndefinedProperties: true,
  });
} catch {
  firestoreInstance = getFirestore(app);
}

export const db = firestoreInstance;
export const auth = getAuth(app);
