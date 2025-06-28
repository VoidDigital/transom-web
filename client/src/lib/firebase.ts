import { initializeApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyC3salqjFfL8O6mTzA_F6vvUFLfpOZncKc",
  authDomain: "transom-4d8f2.firebaseapp.com",
  databaseURL: "https://transom-4d8f2.firebaseio.com",
  projectId: "transom-4d8f2",
  storageBucket: "transom-4d8f2.appspot.com",
  messagingSenderId: "820620979894",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:820620979894:web:31216cfc8be07f49f5c017",
  measurementId: "G-7JRBVG16RC"
};

// Initialize Firebase app only if it hasn't been initialized already
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

export const auth = getAuth(app);
export const db = getFirestore(app);

export default app;
