import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, setDoc, doc } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyCWxH5d89qd2P1kP3hYC4CXejcJRJt0b50",
  authDomain: "unkewebs.firebaseapp.com",
  projectId: "unkewebs",
  storageBucket: "unkewebs.firebasestorage.app",
  messagingSenderId: "468701849844",
  appId: "1:468701849844:web:e205a9e205130a1dd656a1",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function test() {
  try {
    const snap = await getDocs(collection(db, 'bookings'));
    console.log('Bookings in Firestore:', snap.size);
    snap.forEach(doc => {
      console.log(doc.id, doc.data().childName);
    });
  } catch (err) {
    console.error('Error reading Firestore:', err.message);
  }
  process.exit(0);
}
test();
