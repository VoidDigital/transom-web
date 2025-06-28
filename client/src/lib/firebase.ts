import { initializeApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyChUOBO3_5SZPnKW3Fp8PQHUMCxXFEpeps",
  authDomain: `${import.meta.env.VITE_FIREBASE_PROJECT_ID || "transom-4d8f2"}.firebaseapp.com`,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "transom-4d8f2",
  storageBucket: `${import.meta.env.VITE_FIREBASE_PROJECT_ID || "transom-4d8f2"}.firebasestorage.app`,
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:820620979894:web:31216cfc8be07f49f5c017",
};

// Initialize Firebase app only if it hasn't been initialized already
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

export const auth = getAuth(app);
export const db = getFirestore(app);

export default app;
