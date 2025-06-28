import { 
  signInWithRedirect, 
  signOut, 
  GoogleAuthProvider, 
  getRedirectResult,
  onAuthStateChanged,
  User as FirebaseUser
} from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { auth, db } from "./firebase";
import { User, insertUserSchema } from "@shared/schema";

const googleProvider = new GoogleAuthProvider();

export const signInWithGoogle = () => {
  return signInWithRedirect(auth, googleProvider);
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
  const userRef = doc(db, "users", firebaseUser.uid);
  const userSnap = await getDoc(userRef);

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
    await setDoc(userRef, {
      ...userData,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  } else {
    // Update existing user
    await setDoc(userRef, {
      ...userSnap.data(),
      ...userData,
      updatedAt: new Date(),
    }, { merge: true });
  }

  return userData;
};

export const getCurrentUser = async (): Promise<User | null> => {
  const firebaseUser = auth.currentUser;
  if (!firebaseUser) return null;

  const userRef = doc(db, "users", firebaseUser.uid);
  const userSnap = await getDoc(userRef);

  if (userSnap.exists()) {
    const data = userSnap.data();
    return {
      id: data.id,
      email: data.email,
      name: data.name,
      initials: data.initials,
      createdAt: data.createdAt?.toDate() || new Date(),
      updatedAt: data.updatedAt?.toDate() || new Date(),
    };
  }

  return null;
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
