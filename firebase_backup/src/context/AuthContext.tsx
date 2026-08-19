import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, onAuthStateChanged, signOut as firebaseSignOut } from 'firebase/auth';
import { auth, firebaseConfigValid, firebaseConfigErrors } from '../lib/firebase';
import { sendVerificationEmail, EmailVerificationResult } from '../services/emailVerificationService';

export interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: Error | null;
  isEmailVerified: boolean;
  /** True when Firebase config is valid and auth operations can succeed */
  firebaseReady: boolean;
  /** Human-readable config error messages (empty when config is valid) */
  configErrors: string[];
  signOut: () => Promise<void>;
  setError: (error: Error | null) => void;
  sendUserVerificationEmail: () => Promise<EmailVerificationResult>;
  reloadUser: () => Promise<boolean>;
  loginAsGuest: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  error: null,
  isEmailVerified: false,
  firebaseReady: false,
  configErrors: [],
  signOut: async () => {},
  setError: () => {},
  sendUserVerificationEmail: async () => ({ success: false, message: 'AuthContext not initialized' }),
  reloadUser: async () => false,
  loginAsGuest: () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    try {
      if (typeof window !== 'undefined' && localStorage.getItem('krishna_guest_operator') === 'true') {
        return {
          uid: 'guest-neural-operator-01',
          email: 'operator@krishna-os.local',
          displayName: 'Krishna Neural Operator',
          photoURL: null,
          emailVerified: true,
          reload: async () => {},
        } as unknown as User;
      }
    } catch {
      // ignore
    }
    return null;
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    // If Firebase config is invalid, skip the auth listener entirely —
    // there's no point subscribing to auth state when Firebase can't work.
    if (!firebaseConfigValid) {
      setLoading(false);
      return;
    }

    try {
      const unsubscribe = onAuthStateChanged(
        auth,
        (currentUser) => {
          if (currentUser) {
            setUser(currentUser);
            try { localStorage.removeItem('krishna_guest_operator'); } catch {}
          } else {
            try {
              if (localStorage.getItem('krishna_guest_operator') === 'true') {
                setUser({
                  uid: 'guest-neural-operator-01',
                  email: 'operator@krishna-os.local',
                  displayName: 'Krishna Neural Operator',
                  photoURL: null,
                  emailVerified: true,
                  reload: async () => {},
                } as unknown as User);
              } else {
                setUser(null);
              }
            } catch {
              setUser(null);
            }
          }
          setLoading(false);
        },
        (err) => {
          console.warn('Firebase Auth State Change Warning:', err);
          setError(err);
          setLoading(false);
        }
      );

      return () => unsubscribe();
    } catch (err: any) {
      console.warn('Firebase Auth Listener initialization warning:', err);
      setLoading(false);
    }
  }, []);

  const loginAsGuest = () => {
    const mockUser: any = {
      uid: 'guest-neural-operator-01',
      email: 'operator@krishna-os.local',
      displayName: 'Krishna Neural Operator',
      photoURL: null,
      emailVerified: true,
      reload: async () => {},
    };
    try { localStorage.setItem('krishna_guest_operator', 'true'); } catch {}
    setUser(mockUser);
  };

  const signOut = async () => {
    try {
      try { localStorage.removeItem('krishna_guest_operator'); } catch {}
      await firebaseSignOut(auth);
      setUser(null);
    } catch (err) {
      setUser(null);
      const authErr = err instanceof Error ? err : new Error('Failed to sign out');
      setError(authErr);
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
      if (typeof user.reload === 'function') {
        await user.reload();
      }
      setUser(auth.currentUser || user);
      return (auth.currentUser?.emailVerified ?? user.emailVerified) ?? false;
    } catch (err) {
      console.warn('Failed to reload user:', err);
      return user.emailVerified || false;
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
        firebaseReady: firebaseConfigValid,
        configErrors: firebaseConfigErrors,
        signOut,
        setError,
        sendUserVerificationEmail,
        reloadUser,
        loginAsGuest,
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
