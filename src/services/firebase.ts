import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAnalytics, isSupported } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyD0JVm8EnjvrnQKy-e62xpV8M9y8mJDYy4",
  authDomain: "agenthon-82ff7.firebaseapp.com",
  projectId: "agenthon-82ff7",
  storageBucket: "agenthon-82ff7.firebasestorage.app",
  messagingSenderId: "601390068704",
  appId: "1:601390068704:web:35f1a573f46ddf74cbf185",
  measurementId: "G-BWFK7K2EQL"
};

// Initialize Firebase App
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// Analytics runs safely in browser environments that support it
export let analytics: ReturnType<typeof getAnalytics> | null = null;
isSupported().then((supported) => {
  if (supported) {
    analytics = getAnalytics(app);
  }
});

export default app;
