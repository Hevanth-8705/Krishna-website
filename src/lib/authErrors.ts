/**
 * Centralized Firebase Authentication error handler.
 * Maps Firebase error codes to user-friendly messages.
 * All auth pages should use this instead of inline error mapping.
 */

const FIREBASE_AUTH_ERROR_MESSAGES: Record<string, string> = {
  // Email/password errors
  'auth/invalid-email': 'Please enter a valid email address.',
  'auth/invalid-credential': 'Email or password is incorrect.',
  'auth/wrong-password': 'Email or password is incorrect.',
  'auth/user-not-found': 'No account was found with this email.',
  'auth/email-already-in-use': 'An account already exists with this email.',
  'auth/weak-password': 'Please choose a stronger password (at least 6 characters).',
  'auth/user-disabled': 'This account has been disabled. Please contact the administrator.',
  'auth/missing-password': 'Please enter your password.',

  // Rate limiting
  'auth/too-many-requests': 'Too many attempts. Please try again later.',

  // Network & config
  'auth/network-request-failed': 'Network error. Check your internet connection.',
  'auth/operation-not-allowed': 'This sign-in method is not enabled. Please enable it in Firebase Console or try a different method.',
  'auth/api-key-not-valid.-please-pass-a-valid-api-key.': 'Firebase configuration is invalid. Please contact the administrator.',
  'auth/configuration-not-found': 'Firebase configuration error. Please contact the administrator.',
  'auth/internal-error': 'An internal error occurred. Please try again.',
  'auth/unauthorized-domain': 'This application domain is not authorized in Firebase. Add it in Firebase Console → Authentication → Settings → Authorized domains.',
  'auth/missing-android-pkg-name': 'Android package name is missing from the configuration.',
  'auth/requires-recent-login': 'This operation requires a recent login. Please sign out and sign in again.',

  // Google/Popup errors
  'auth/popup-closed-by-user': 'Sign-in cancelled. The popup was closed before completion.',
  'auth/popup-blocked': 'Popup blocked by your browser. Please allow popups or use redirect mode.',
  'auth/cancelled-popup-request': 'Multiple popup requests detected. Please try again.',
  'auth/account-exists-with-different-credential': 'An account already exists with the same email using a different login method.',

  // Redirect errors
  'auth/redirect-cancelled-by-user': 'Redirect sign-in was cancelled.',
  'auth/redirect-operation-pending': 'A redirect sign-in is already in progress.',

  // Password reset
  'auth/expired-action-code': 'This password reset link has expired. Please request a new one.',
  'auth/invalid-action-code': 'This password reset link is invalid or has already been used.',
  'auth/missing-email': 'Please enter an email address.',
};

/**
 * Converts a Firebase Auth error into a human-readable message.
 * Never exposes raw stack traces or internal error details to the user.
 */
export function getFirebaseAuthErrorMessage(error: unknown, fallback = 'An unexpected authentication error occurred.'): string {
  if (!error) return fallback;

  // Extract error code from Firebase error object
  const code = (error as any)?.code as string | undefined;

  if (code && FIREBASE_AUTH_ERROR_MESSAGES[code]) {
    return FIREBASE_AUTH_ERROR_MESSAGES[code];
  }

  // Fallback: use the error message if it's a string and not a raw object dump
  const message = (error as any)?.message;
  if (typeof message === 'string' && message.trim() && !message.includes('[object Object]')) {
    // Strip the "Firebase: " prefix that Firebase sometimes prepends
    return message.replace(/^Firebase:\s*/i, '').trim();
  }

  return fallback;
}
