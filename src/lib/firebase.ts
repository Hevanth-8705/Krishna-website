import { initializeApp, getApps, getApp } from "firebase/app";
import { getAnalytics, isSupported as isAnalyticsSupported } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Krishna Web OS Firebase Configuration
export const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "",
  authDomain: "krishna-web-os.firebaseapp.com",
  projectId: "krishna-web-os",
  storageBucket: "krishna-web-os.firebasestorage.app",
  messagingSenderId: "448489243298",
  appId: "1:448489243298:web:84811c480b688a58f58dfb",
  measurementId: "G-METXLNCQGW"
};

// Initialize Firebase App
export const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Initialize Services
export const auth = getAuth(app);
export const db = getFirestore(app);

// Analytics safely initialized in client environment
export const initAnalytics = async () => {
  if (typeof window !== "undefined" && await isAnalyticsSupported()) {
    return getAnalytics(app);
  }
  return null;
};

// Initialize Analytics immediately if supported
initAnalytics().catch((err) => console.warn("Firebase Analytics initialization warning:", err));
