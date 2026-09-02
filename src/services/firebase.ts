import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
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

// Initialize Firebase safely
export const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
