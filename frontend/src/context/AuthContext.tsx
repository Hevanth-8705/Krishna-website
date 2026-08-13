import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, onAuthStateChanged, signOut as firebaseSignOut } from 'firebase/auth';
import { auth } from '../lib/firebase';
import { sendVerificationEmail, EmailVerificationResult } from '../services/emailVerificationService';

export interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: Error | null;
  isEmailVerified: boolean;
  signOut: () => Promise<void>;
  setError: (error: Error | null) => void;
  sendUserVerificationEmail: () => Promise<EmailVerificationResult>;
  reloadUser: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  error: null,
  isEmailVerified: false,
  signOut: async () => {},
  setError: () => {},
  sendUserVerificationEmail: async () => ({ success: false, message: 'AuthContext not initialized' }),
  reloadUser: async () => false,
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(
      auth,
      (currentUser) => {
        setUser(currentUser);
        setLoading(false);
      },
      (err) => {
        console.error('Firebase Auth State Change Error:', err);
        setError(err);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
      setUser(null);
    } catch (err) {
      const authErr = err instanceof Error ? err : new Error('Failed to sign out');
      setError(authErr);
      throw authErr;
    }
  };

  const sendUserVerificationEmail = async (): Promise<EmailVerificationResult> => {
    if (!user) {
      return { success: false, message: 'No active user found' };
    }
    return await sendVerificationEmail(user);
  };

  const reloadUser = async (): Promise<boolean> => {
    if (!user) return false;
    try {
      await user.reload();
      setUser(auth.currentUser);
      return auth.currentUser?.emailVerified ?? false;
    } catch (err) {
      console.error('Failed to reload user:', err);
      return false;
    }
  };

  const isEmailVerified = Boolean(user?.emailVerified);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        isEmailVerified,
        signOut,
        setError,
        sendUserVerificationEmail,
        reloadUser,
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
