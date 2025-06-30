import { 
  signInWithRedirect, 
  signOut, 
  GoogleAuthProvider, 
  getRedirectResult,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  User as FirebaseUser
} from "firebase/auth";
import { ref, set, get, child } from "firebase/database";
import { auth, db } from "./firebase";
import { User, insertUserSchema } from "@shared/schema";

const googleProvider = new GoogleAuthProvider();

export const signInWithGoogle = () => {
  return signInWithRedirect(auth, googleProvider);
};

export const signInWithEmail = async (email: string, password: string) => {
  return signInWithEmailAndPassword(auth, email, password);
};

export const signUpWithEmail = async (email: string, password: string, name: string) => {
  const result = await createUserWithEmailAndPassword(auth, email, password);
  await createOrUpdateUser(result.user);
  return result;
};

export const signOutUser = () => {
  return signOut(auth);
};

export const handleRedirectResult = async () => {
  try {
    const result = await getRedirectResult(auth);
    if (result?.user) {
      await createOrUpdateUser(result.user);
    }
    return result;
  } catch (error) {
    console.error("Error handling redirect result:", error);
    throw error;
  }
};

export const createOrUpdateUser = async (firebaseUser: FirebaseUser): Promise<User> => {
  try {
    console.log("🔍 Creating/updating user:", firebaseUser.uid, firebaseUser.email);
    // Use email-based path matching iOS app format
    const emailKey = firebaseUser.email?.replace(/\./g, '▦') || '';
    const userRef = ref(db, `${emailKey}/user`);
    const userSnap = await get(userRef);

    const userData = {
      id: firebaseUser.uid,
      email: firebaseUser.email || "",
      name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || "",
      initials: getInitials(firebaseUser.displayName || firebaseUser.email?.split('@')[0] || ""),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    if (!userSnap.exists()) {
      console.log("🔍 Creating new user document");
      // Create new user
      await set(userRef, {
        ...userData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    } else {
      console.log("🔍 Updating existing user document");
      // Update existing user
      const existingData = userSnap.val();
      await set(userRef, {
        ...existingData,
        ...userData,
        updatedAt: new Date().toISOString(),
      });
    }

    console.log("🔍 User created/updated successfully:", userData);
    return userData;
  } catch (error) {
    console.error("🚨 Error in createOrUpdateUser:", error);
    throw error;
  }
};

export const getCurrentUser = async (): Promise<User | null> => {
  try {
    const firebaseUser = auth.currentUser;
    if (!firebaseUser) {
      console.log("🔍 No Firebase user found");
      return null;
    }

    console.log("🔍 Getting user data for:", firebaseUser.uid, firebaseUser.email);
    
    // Use email-based path matching iOS app format
    const emailKey = firebaseUser.email?.replace(/\./g, '▦') || '';
    console.log("🔍 Using email key for data path:", emailKey);
    
    // Test database connectivity first - try reading iOS notes data
    try {
      const notesRef = ref(db, `${emailKey}/notes`);
      const notesSnap = await get(notesRef);
      console.log("🔍 Notes data exists:", notesSnap.exists());
      if (notesSnap.exists()) {
        console.log("🔍 Found iOS notes:", Object.keys(notesSnap.val()));
      }
    } catch (testError) {
      console.error("🚨 Notes read test failed:", testError);
    }
    
    const userRef = ref(db, `${emailKey}/user`);
    console.log("🔍 Database reference created:", userRef.toString());
    const userSnap = await get(userRef);
    console.log("🔍 Database snapshot received:", userSnap.exists(), userSnap.val());

    if (userSnap.exists()) {
      const data = userSnap.val();
      console.log("🔍 User data found:", data);
      return {
        id: data.id,
        email: data.email,
        name: data.name,
        initials: data.initials,
        createdAt: data.createdAt ? new Date(data.createdAt) : new Date(),
        updatedAt: data.updatedAt ? new Date(data.updatedAt) : new Date(),
      };
    }

    console.log("🔍 User document doesn't exist, creating new user");
    // User document doesn't exist, create it
    return await createOrUpdateUser(firebaseUser);
  } catch (error) {
    console.error("🚨 Error in getCurrentUser:", error);
    throw error;
  }
};

export const onAuthStateChange = (callback: (user: FirebaseUser | null) => void) => {
  return onAuthStateChanged(auth, callback);
};

const getInitials = (name: string): string => {
  const parts = name.split(" ");
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return name.substring(0, 2).toUpperCase();
};
