import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  User, 
  signOut as firebaseSignOut, 
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup
} from 'firebase/auth';
import { auth, db } from '../config/firebase';
import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  serverTimestamp 
} from 'firebase/firestore';

interface AuthContextType {
  currentUser: User | null;
  loading: boolean;
  signOut: () => Promise<void>;
  login: (email: string, password: string) => Promise<User>;
  signInWithGoogle: () => Promise<User>;
}

const AuthContext = createContext<AuthContextType>({
  currentUser: null,
  loading: true,
  signOut: async () => {},
  login: async () => { throw new Error('Not implemented'); },
  signInWithGoogle: async () => { throw new Error('Not implemented'); },
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(user => {
      setCurrentUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const signInWithGoogle = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      
      // Check if user exists in our database
      const userDoc = await getDoc(doc(db, 'users', result.user.uid));
      
      if (!userDoc.exists()) {
        // Create new user document if it doesn't exist
        await setDoc(doc(db, 'users', result.user.uid), {
          email: result.user.email,
          createdAt: serverTimestamp(),
          lastLogin: serverTimestamp(),
          displayName: result.user.displayName,
          photoURL: result.user.photoURL,
          stats: {
            totalChats: 0,
            totalMessages: 0,
            characterStats: {}
          }
        });
      } else {
        // Update last login
        await updateDoc(doc(db, 'users', result.user.uid), {
          lastLogin: serverTimestamp()
        });
        
        // Check if user is banned
        const userData = userDoc.data();
        if (userData?.isBanned) {
          await firebaseSignOut(auth);
          throw new Error(`Your account has been banned. Reason: ${userData.banReason || 'No reason provided'}`);
        }
      }
      
      return result.user;
    } catch (error: any) {
      if (error.code === 'auth/popup-closed-by-user') {
        throw new Error('Sign in cancelled');
      }
      throw new Error(error.message || 'An error occurred during Google sign in');
    }
  };

  const login = async (email: string, password: string) => {
    try {
      // Clear any existing theme preferences from local storage
      localStorage.removeItem('theme');
      localStorage.removeItem('fontSize');
      
      // First attempt to sign in
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      
      // Check if user is banned
      const userDoc = await getDoc(doc(db, 'users', userCredential.user.uid));
      const userData = userDoc.data();
      
      if (userData?.isBanned) {
        // Sign out immediately if user is banned
        await firebaseSignOut(auth);
        throw new Error(`Your account has been banned. Reason: ${userData.banReason || 'No reason provided'}`);
      }
      
      return userCredential.user;
    } catch (error: any) {
      // Handle different types of errors
      if (error.message?.includes('Your account has been banned')) {
        // This is our custom ban error, pass it through
        throw error;
      } else if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
        throw new Error('Invalid email or password');
      } else {
        // For any other errors, throw the original message
        throw new Error(error.message || 'An error occurred during login');
      }
    }
  };

  const signOut = async () => {
    await firebaseSignOut(auth);
  };

  const value = {
    currentUser,
    loading,
    signOut,
    login,
    signInWithGoogle,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
