import { User, sendEmailVerification as firebaseSendEmailVerification } from 'firebase/auth';

export interface EmailVerificationResult {
  success: boolean;
  message: string;
  error?: Error;
}

/**
 * Sends a verification email to the currently registered/authenticated Firebase user.
 */
export async function sendVerificationEmail(
  user: User,
  actionCodeSettings?: import('firebase/auth').ActionCodeSettings
): Promise<EmailVerificationResult> {
  if (!user) {
    return {
      success: false,
      message: 'No active user session found to send verification email.',
    };
  }

  if (user.emailVerified) {
    return {
      success: true,
      message: 'Email is already verified.',
    };
  }

  try {
    if (actionCodeSettings) {
      await firebaseSendEmailVerification(user, actionCodeSettings);
    } else {
      await firebaseSendEmailVerification(user);
    }
    return {
      success: true,
      message: `Verification email sent successfully to ${user.email}. Please check your inbox and confirm.`,
    };
  } catch (error: any) {
    console.error('Error sending verification email:', error);
    let errorMsg = error.message || 'Failed to send verification email.';
    if (error.code === 'auth/too-many-requests') {
      errorMsg = 'Too many requests. Please wait a moment before requesting another verification email.';
    }
    return {
      success: false,
      message: errorMsg,
      error,
    };
  }
}

/**
 * Reloads the user's Firebase Auth state to check if the email has been verified.
 */
export async function checkEmailVerificationStatus(user: User): Promise<{
  isVerified: boolean;
  user: User;
}> {
  if (!user) {
    throw new Error('User is not authenticated.');
  }

  await user.reload();
  return {
    isVerified: user.emailVerified,
    user,
  };
}
