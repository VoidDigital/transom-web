import { useState, useEffect, createContext, useContext } from "react";
import { User as FirebaseUser } from "firebase/auth";
import { User } from "@shared/schema";
import { 
  signInWithGoogle, 
  signInWithEmail,
  signUpWithEmail,
  signOutUser, 
  handleRedirectResult, 
  onAuthStateChange, 
  getCurrentUser 
} from "@/lib/auth";

interface AuthContextType {
  user: User | null;
  firebaseUser: FirebaseUser | null;
  loading: boolean;
  signIn: () => Promise<void>;
  signInWithEmailAndPassword: (email: string, password: string) => Promise<void>;
  signUpWithEmailAndPassword: (email: string, password: string, name: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChange(async (firebaseUser) => {
      console.log("🔍 Auth state change - User:", firebaseUser?.uid, firebaseUser?.email);
      setFirebaseUser(firebaseUser);
      
      if (firebaseUser) {
        try {
          const userData = await getCurrentUser();
          console.log("🔍 User data retrieved:", userData);
          setUser(userData);
        } catch (error) {
          console.error("Error getting user data:", error);
          setUser(null);
        }
      } else {
        setUser(null);
      }
      
      setLoading(false);
    });

    // Handle redirect result on app load
    handleRedirectResult().catch(console.error);

    return unsubscribe;
  }, []);

  const signIn = async () => {
    try {
      await signInWithGoogle();
    } catch (error) {
      console.error("Error signing in:", error);
      throw error;
    }
  };

  const signInWithEmailAndPassword = async (email: string, password: string) => {
    try {
      await signInWithEmail(email, password);
    } catch (error) {
      console.error("Error signing in with email:", error);
      throw error;
    }
  };

  const signUpWithEmailAndPassword = async (email: string, password: string, name: string) => {
    try {
      await signUpWithEmail(email, password, name);
    } catch (error) {
      console.error("Error signing up with email:", error);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      await signOutUser();
      setUser(null);
      setFirebaseUser(null);
    } catch (error) {
      console.error("Error signing out:", error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      firebaseUser, 
      loading, 
      signIn, 
      signInWithEmailAndPassword,
      signUpWithEmailAndPassword,
      signOut 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
