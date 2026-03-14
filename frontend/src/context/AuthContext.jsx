import { createContext, useState, useContext, useEffect } from 'react';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
} from 'firebase/auth';
import { auth, googleProvider, db } from '../config/firebase';
import { doc, setDoc, getDoc } from 'firebase/firestore';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [idToken, setIdToken] = useState(null);

  // Monitor auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          // Get user data from Firestore
          const userDocRef = doc(db, 'users', firebaseUser.uid);
          const userDocSnap = await getDoc(userDocRef);

          let userData = {
            id: firebaseUser.uid,
            email: firebaseUser.email,
            name: firebaseUser.displayName || 'User',
            photoURL: firebaseUser.photoURL || null,
          };

          if (userDocSnap.exists()) {
            userData = { ...userData, ...userDocSnap.data() };
          }

          setUser(userData);
          const token = await firebaseUser.getIdToken();
          setIdToken(token);
          localStorage.setItem('user', JSON.stringify(userData));
          localStorage.setItem('idToken', token);
        } catch (error) {
          console.warn('Error fetching user data from Firestore:', error);
          // Still set user even if Firestore is temporarily unavailable
          const userData = {
            id: firebaseUser.uid,
            email: firebaseUser.email,
            name: firebaseUser.displayName || 'User',
            photoURL: firebaseUser.photoURL || null,
          };
          setUser(userData);
          const token = await firebaseUser.getIdToken();
          setIdToken(token);
          localStorage.setItem('user', JSON.stringify(userData));
          localStorage.setItem('idToken', token);
        }
      } else {
        setUser(null);
        setIdToken(null);
        localStorage.removeItem('user');
        localStorage.removeItem('idToken');
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const signup = async (email, password, name) => {
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);
      const firebaseUser = result.user;

      // Create user document in Firestore
      await setDoc(doc(db, 'users', firebaseUser.uid), {
        email: firebaseUser.email,
        name: name || 'User',
        createdAt: new Date(),
        analysisCount: 0,
      });

      const token = await firebaseUser.getIdToken();
      setIdToken(token);

      return { success: true };
    } catch (error) {
      let message = 'Signup failed';
      
      if (error.code === 'auth/email-already-in-use') {
        message = 'This email is already registered. Please log in instead.';
      } else if (error.code === 'auth/weak-password') {
        message = 'Password should be at least 6 characters.';
      } else if (error.code === 'auth/invalid-email') {
        message = 'Invalid email address.';
      }
      
      return {
        success: false,
        message,
      };
    }
  };

  const login = async (email, password) => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      const token = await auth.currentUser.getIdToken();
      setIdToken(token);
      return { success: true };
    } catch (error) {
      let message = 'Login failed';
      
      if (error.code === 'auth/user-not-found') {
        message = 'User not found. Please sign up first.';
      } else if (error.code === 'auth/wrong-password') {
        message = 'Incorrect password. Please try again.';
      } else if (error.code === 'auth/invalid-email') {
        message = 'Invalid email address.';
      } else if (error.code === 'auth/too-many-requests') {
        message = 'Too many login attempts. Please try again later.';
      }
      
      return {
        success: false,
        message,
      };
    }
  };

  const loginWithGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const firebaseUser = result.user;

      // Check if user document exists in Firestore
      const userDocRef = doc(db, 'users', firebaseUser.uid);
      const userDocSnap = await getDoc(userDocRef);

      // Only allow login if user document exists (i.e., they signed up first)
      if (!userDocSnap.exists()) {
        // User exists in Firebase Auth but not in Firestore - they didn't sign up properly
        await auth.currentUser.delete();
        return {
          success: false,
          message: 'This Google account is not registered. Please sign up first.',
        };
      }

      const token = await firebaseUser.getIdToken();
      setIdToken(token);

      return { success: true };
    } catch (error) {
      let message = 'Google sign-in failed';
      
      if (error.code === 'auth/popup-closed-by-user') {
        message = 'The sign-in window was closed. Please try again.';
      } else if (error.code === 'auth/cancelled-popup-request') {
        message = 'Sign-in was cancelled. Please try again.';
      } else if (error.code === 'auth/popup-blocked') {
        message = 'Pop-up was blocked by your browser. Please enable pop-ups and try again.';
      } else if (error.code === 'auth/network-request-failed') {
        message = 'Network error. Please check your internet connection.';
      } else if (error.code === 'auth/internal-error') {
        message = 'An internal error occurred. Please try again.';
      }
      
      return {
        success: false,
        message,
      };
    }
  };

  const signupWithGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const firebaseUser = result.user;

      // Create user document in Firestore for new Google signup
      const userDocRef = doc(db, 'users', firebaseUser.uid);
      const userDocSnap = await getDoc(userDocRef);

      if (!userDocSnap.exists()) {
        await setDoc(userDocRef, {
          email: firebaseUser.email,
          name: firebaseUser.displayName || 'User',
          photoURL: firebaseUser.photoURL || null,
          createdAt: new Date(),
          analysisCount: 0,
        });
      }

      const token = await firebaseUser.getIdToken();
      setIdToken(token);

      return { success: true };
    } catch (error) {
      let message = 'Google sign-up failed';
      
      if (error.code === 'auth/popup-closed-by-user') {
        message = 'The sign-up window was closed. Please try again.';
      } else if (error.code === 'auth/cancelled-popup-request') {
        message = 'Sign-up was cancelled. Please try again.';
      } else if (error.code === 'auth/popup-blocked') {
        message = 'Pop-up was blocked by your browser. Please enable pop-ups and try again.';
      } else if (error.code === 'auth/network-request-failed') {
        message = 'Network error. Please check your internet connection.';
      } else if (error.code === 'auth/internal-error') {
        message = 'An internal error occurred. Please try again.';
      }
      
      return {
        success: false,
        message,
      };
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      setUser(null);
      setIdToken(null);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        message: error.message || 'Logout failed',
      };
    }
  };

  const isAuthenticated = () => {
    return !!idToken && !!user;
  };

  // Always returns a fresh, valid token — use this for API calls instead of idToken
  const getToken = async () => {
    if (!auth.currentUser) return null;
    return await auth.currentUser.getIdToken();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        idToken,
        loading,
        signup,
        signupWithGoogle,
        login,
        loginWithGoogle,
        logout,
        isAuthenticated,
        getToken,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
