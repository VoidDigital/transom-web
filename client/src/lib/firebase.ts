import { initializeApp, getApps, deleteApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Use your iOS Firebase project configuration directly
const firebaseConfig = {
  apiKey: "AIzaSyC3salqjFfL8O6mTzA_F6vvUFLfpOZncKc",
  authDomain: "transom-4d8f2.firebaseapp.com",
  databaseURL: "https://transom-4d8f2.firebaseio.com",
  projectId: "transom-4d8f2",
  storageBucket: "transom-4d8f2.appspot.com",
  messagingSenderId: "820620979894",
  appId: "1:820620979894:web:31216cfc8be07f49f5c017",
  measurementId: "G-7JRBVG16RC"
};

console.log("🔍 Firebase Config (iOS Project):", {
  projectId: firebaseConfig.projectId,
  apiKey: firebaseConfig.apiKey.substring(0, 20) + "...",
  appId: firebaseConfig.appId.substring(0, 20) + "..."
});

// Clear any existing Firebase apps and reinitialize with iOS config
if (getApps().length > 0) {
  getApps().forEach(app => deleteApp(app));
}

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);

// Clear any cached authentication to force fresh login with iOS project
auth.signOut().catch(() => {
  // Ignore errors from signing out non-existent users
});

export default app;
