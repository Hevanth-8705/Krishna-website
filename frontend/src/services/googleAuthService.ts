import { 
  GoogleAuthProvider, 
  signInWithPopup, 
  signInWithRedirect, 
  getRedirectResult, 
  User 
} from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';

export interface GoogleAuthResult {
  success: boolean;
  user?: User;
  message: string;
  isNewUser?: boolean;
}

/**
 * Synchronize user details with Firestore collection 'users'
 */
export async function syncUserProfileToFirestore(user: User, provider = 'google.com'): Promise<void> {
  try {
    const userRef = doc(db, 'users', user.uid);
    await setDoc(
      userRef,
      {
        uid: user.uid,
        displayName: user.displayName || 'Krishna Operator',
        email: user.email,
        photoURL: user.photoURL || '',
        emailVerified: user.emailVerified,
        authProvider: provider,
        lastLoginAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );
  } catch (err) {
    console.warn('Firestore profile sync warning:', err);
  }
}

/**
 * Sign in with Google using Popup
 */
export async function signInWithGooglePopup(): Promise<GoogleAuthResult> {
  try {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({
      prompt: 'select_account'
    });

    const result = await signInWithPopup(auth, provider);
    const user = result.user;

    // Sync to Firestore
    await syncUserProfileToFirestore(user, 'google.com');

    return {
      success: true,
      user,
      message: `Signed in successfully with Google as ${user.displayName || user.email}`
    };
  } catch (err: any) {
    console.error('Google Popup Auth error:', err);
    let msg = err.message || 'Google Authentication failed.';

    if (err.code === 'auth/popup-closed-by-user') {
      msg = 'Sign-in cancelled. Google popup was closed before completion.';
    } else if (err.code === 'auth/popup-blocked') {
      msg = 'Pop-up was blocked by browser. Please allow popups or use redirect mode.';
    } else if (err.code === 'auth/cancelled-popup-request') {
      msg = 'Multiple popup requests detected. Please try again.';
    } else if (err.code === 'auth/account-exists-with-different-credential') {
      msg = 'An account already exists with the same email using a different login method.';
    }

    return {
      success: false,
      message: msg
    };
  }
}

/**
 * Sign in with Google using Redirect mode (Fallback for blocked popups or webviews)
 */
export async function signInWithGoogleRedirect(): Promise<void> {
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({
    prompt: 'select_account'
  });
  await signInWithRedirect(auth, provider);
}

/**
 * Process redirect result after page reloads
 */
export async function handleGoogleRedirectResult(): Promise<GoogleAuthResult | null> {
  try {
    const result = await getRedirectResult(auth);
    if (result && result.user) {
      await syncUserProfileToFirestore(result.user, 'google.com');
      return {
        success: true,
        user: result.user,
        message: `Authenticated via Google Redirect as ${result.user.displayName || result.user.email}`
      };
    }
    return null;
  } catch (err: any) {
    console.error('Google Redirect Result Error:', err);
    return {
      success: false,
      message: err.message || 'Failed to complete Google authentication redirect.'
    };
  }
}
