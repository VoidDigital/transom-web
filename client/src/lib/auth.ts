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
    
    // Check Firebase auth token details
    try {
      const token = await firebaseUser.getIdToken();
      const tokenResult = await firebaseUser.getIdTokenResult();
      console.log("🔍 Firebase auth token claims:", tokenResult.claims);
      console.log("🔍 Token email:", tokenResult.claims.email);
    } catch (tokenError) {
      console.log("🔍 Could not get token details:", tokenError);
    }
    
    // Use email-based path matching iOS app format
    const emailKey = firebaseUser.email?.replace(/\./g, '▦') || '';
    console.log("🔍 Using email key for data path:", emailKey);
    
    // Test database connectivity - try different email variations
    try {
      // Try current email
      const notesRef = ref(db, `${emailKey}/notes`);
      const notesSnap = await get(notesRef);
      console.log("🔍 Notes data exists for current email:", notesSnap.exists());
      
      // Try main email without +replit
      const mainEmail = firebaseUser.email?.replace('+replit', '').replace(/\./g, '▦') || '';
      if (mainEmail !== emailKey) {
        const mainNotesRef = ref(db, `${mainEmail}/notes`);
        const mainNotesSnap = await get(mainNotesRef);
        console.log("🔍 Notes data exists for main email:", mainEmail, mainNotesSnap.exists());
        if (mainNotesSnap.exists()) {
          console.log("🔍 Found iOS notes under main email:", Object.keys(mainNotesSnap.val()));
        }
      }
      
      // Comprehensive database exploration
      const rootRef = ref(db, '/');
      const rootSnap = await get(rootRef);
      if (rootSnap.exists()) {
        const rootData = rootSnap.val();
        console.log("🔍 Root database keys:", Object.keys(rootData));
        
        // Look for email patterns in the keys
        Object.keys(rootData).forEach(key => {
          if (key.includes('chris') || key.includes('▦')) {
            console.log("🔍 Found potential user data path:", key);
            if (typeof rootData[key] === 'object' && rootData[key] !== null) {
              console.log("🔍 Sub-keys for", key + ":", Object.keys(rootData[key]));
            }
          }
        });
        
        // Test different potential paths
        const testPaths = [
          `${emailKey}`,
          `${emailKey}/thoughts`, 
          `${emailKey}/notes`,
          `thoughts/${firebaseUser.uid}`,
          `notes/${firebaseUser.uid}`,
          `thoughts`,
          `notes`
        ];
        
        for (const path of testPaths) {
          const testRef = ref(db, path);
          const testSnap = await get(testRef);
          if (testSnap.exists()) {
            console.log(`🔍 Data found at path "${path}":`, testSnap.exists());
            const data = testSnap.val();
            if (typeof data === 'object' && data !== null) {
              console.log(`🔍 Keys at "${path}":`, Object.keys(data).slice(0, 10));
            }
          }
        }
      }
    } catch (testError) {
      console.error("🚨 Database read test failed:", testError);
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
