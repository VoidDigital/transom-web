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
  const userRef = ref(db, `users/${firebaseUser.uid}`);
  const userSnap = await get(userRef);

  const userData = {
    id: firebaseUser.uid,
    email: firebaseUser.email || "",
    name: firebaseUser.displayName || "",
    initials: getInitials(firebaseUser.displayName || firebaseUser.email || ""),
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  if (!userSnap.exists()) {
    // Create new user
    await set(userRef, {
      ...userData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  } else {
    // Update existing user
    const existingData = userSnap.val();
    await set(userRef, {
      ...existingData,
      ...userData,
      updatedAt: new Date().toISOString(),
    });
  }

  return userData;
};

export const getCurrentUser = async (): Promise<User | null> => {
  const firebaseUser = auth.currentUser;
  if (!firebaseUser) return null;

  const userRef = ref(db, `users/${firebaseUser.uid}`);
  const userSnap = await get(userRef);

  if (userSnap.exists()) {
    const data = userSnap.val();
    return {
      id: data.id,
      email: data.email,
      name: data.name,
      initials: data.initials,
      createdAt: data.createdAt ? new Date(data.createdAt) : new Date(),
      updatedAt: data.updatedAt ? new Date(data.updatedAt) : new Date(),
    };
  }

  // User document doesn't exist, create it
  return await createOrUpdateUser(firebaseUser);
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
