import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Configure Firebase
const firebaseConfig = {
  apiKey: "AIzaSyDlykvUIw2LzldUNhsRv4Oy7rLA1d8fmQI",
  authDomain: "walletman-794f4.firebaseapp.com",
  projectId: "walletman-794f4",
  storageBucket: "walletman-794f4.appspot.com",
  messagingSenderId: "382588159921",
  appId: "1:382588159921:web:30d104a4890293da1c9f90",
  measurementId: "G-PZQEEJMLEF"
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

