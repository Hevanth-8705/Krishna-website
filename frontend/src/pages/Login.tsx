import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  LogIn,
  Loader2,
  KeyRound,
  UserPlus,
  ShieldCheck,
  Smartphone,
  ExternalLink
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import {
  signInWithEmailAndPassword,
  sendPasswordResetEmail
} from 'firebase/auth';
import { auth } from '../lib/firebase';
import { useAuth } from '../context/AuthContext';
import { KrishnaFluteHero } from '../components/KrishnaFluteHero';
import {
  signInWithGooglePopup,
  signInWithGoogleRedirect,
  handleGoogleRedirectResult,
  syncUserProfileToFirestore
} from '../services/googleAuthService';

function GoogleIcon() {
  return (
    <svg className="w-4 h-4" viewBox="0 0 24 24">
      <path
        fill="#EA4335"
        d="M12 5c1.6 0 3 .6 4.1 1.6l3.1-3.1C17.3 1.7 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.2 9 5 12 5z"
      />
      <path
        fill="#4285F4"
        d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.8z"
      />
      <path
        fill="#FBBC05"
        d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.3s.2-1.6.4-2.3L1.9 7.3C.7 9.7 0 10.8 0 12.5s.7 2.8 1.9 5.2l3.7-2.9z"
      />
      <path
        fill="#34A853"
        d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.2-6.4-5.2L1.9 16C3.7 19.7 7.5 23 12 23z"
      />
    </svg>
  );
}

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isEmailVerified, signOut } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Forgot password inline state
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetSubmitting, setResetSubmitting] = useState(false);
  const [resetStatus, setResetStatus] = useState<string | null>(null);

  const fromPath = (location.state as any)?.from || '/dashboard';

  // Check for redirected auth requirement message or Google Auth redirect completion
  useEffect(() => {
    if ((location.state as any)?.message) {
      setErrorMsg((location.state as any).message);
    }

    async function checkRedirect() {
      const res = await handleGoogleRedirectResult();
      if (res) {
        if (res.success) {
          setSuccessMsg(res.message);
          setTimeout(() => navigate(fromPath), 1000);
        } else {
          setErrorMsg(res.message);
        }
      }
    }
    checkRedirect();
  }, [navigate, fromPath]);

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!email || !password) {
      setErrorMsg('Please enter both email and password.');
      return;
    }

    setSubmitting(true);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email.trim(), password);
      // Sync profile to Firestore
      await syncUserProfileToFirestore(userCredential.user, 'password');

      setSuccessMsg(`Welcome back, ${userCredential.user.displayName || userCredential.user.email}!`);
      setTimeout(() => {
        navigate(fromPath);
      }, 1000);
    } catch (err: any) {
      console.error('Login error:', err);
      let msg = err.message || 'Authentication failed.';
      if (err.code === 'auth/operation-not-allowed') {
        msg = 'Email/Password authentication is not enabled for this Firebase project. Please enable Email/Password in Firebase Console or sign in using Google below.';
      } else if (err.code === 'auth/invalid-credential' || err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
        msg = 'Incorrect email or password.';
      } else if (err.code === 'auth/invalid-email') {
        msg = 'Please enter a valid email address.';
      } else if (err.code === 'auth/too-many-requests') {
        msg = 'Access disabled due to many failed attempts. Try again later or reset password.';
      }
      setErrorMsg(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogleSSO = async () => {
    setErrorMsg(null);
    setSuccessMsg(null);
    setSubmitting(true);

    const res = await signInWithGooglePopup();
    if (res.success) {
      setSuccessMsg(res.message);
      setTimeout(() => {
        navigate(fromPath);
      }, 1000);
    } else {
      setErrorMsg(res.message);
    }
    setSubmitting(false);
  };

  const handleGoogleRedirectSSO = async () => {
    setErrorMsg(null);
    setSuccessMsg('Redirecting to Google Authentication...');
    setSubmitting(true);
    try {
      await signInWithGoogleRedirect();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to initiate Google Redirect');
      setSubmitting(false);
    }
  };

  const handleSendResetEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetEmail) return;
    setResetSubmitting(true);
    setResetStatus(null);
    try {
      await sendPasswordResetEmail(auth, resetEmail.trim());
      setResetStatus(`Password reset link dispatched to ${resetEmail}. Check your inbox!`);
    } catch (err: any) {
      setResetStatus(`Reset failed: ${err.message || 'Failed to send reset link.'}`);
    } finally {
      setResetSubmitting(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex flex-col items-center justify-center py-6 px-4 relative">
      {/* Background Neural Accent */}
      <div className="absolute inset-0 z-0 bg-[radial-gradient(circle_at_top_center,rgba(0,229,255,0.08)_0%,transparent_70%)] pointer-events-none" />

      <div className="w-full max-w-md z-10 space-y-6">
        {/* Header Title with Metallic Flute Icon */}
        <div className="text-center space-y-2">
          <div className="flex justify-center mb-3">
            <KrishnaFluteHero className="scale-90" />
          </div>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#00E5FF]/10 border border-[#00E5FF]/20 rounded-full text-[10px] font-mono text-[#00E5FF] tracking-widest uppercase">
            <Sparkles size={12} className="animate-spin" />
            <span>KRISHNA_OS AUTH MATRIX</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white font-sans">
            Welcome Back
          </h1>
          <p className="text-xs text-gray-400 max-w-xs mx-auto font-mono">
            Access your secure neural interface, memory vault & OS modules.
          </p>
        </div>

        {/* If user is already logged in */}
        {user ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-5 bg-black/60 border border-[#00E5FF]/30 rounded-2xl backdrop-blur-xl text-center space-y-4"
          >
            <div className="w-12 h-12 mx-auto rounded-full bg-[#00E5FF]/20 border border-[#00E5FF]/40 flex items-center justify-center text-[#00E5FF]">
              <ShieldCheck size={24} />
            </div>
            <div>
              <p className="text-xs text-gray-400 font-mono">CURRENTLY AUTHENTICATED AS</p>
              <p className="text-sm font-semibold text-white mt-0.5">{user.displayName || 'Krishna Operator'}</p>
              <p className="text-xs text-[#00E5FF] font-mono">{user.email}</p>
              <p className="text-[10px] font-mono mt-1 text-gray-400">
                Status:{' '}
                {isEmailVerified ? (
                  <span className="text-emerald-400 font-semibold">EMAIL VERIFIED</span>
                ) : (
                  <span className="text-amber-400 font-semibold">EMAIL UNVERIFIED</span>
                )}
              </p>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => navigate('/dashboard')}
                className="flex-1 py-2.5 bg-[#00E5FF] hover:bg-[#00E5FF]/90 text-black font-semibold rounded-xl text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-[0_0_15px_rgba(0,229,255,0.3)]"
              >
                <span>Go to Dashboard</span>
                <ArrowRight size={14} />
              </button>
              <button
                onClick={() => signOut()}
                className="px-4 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 hover:text-white rounded-xl text-xs transition-all cursor-pointer"
              >
                Sign Out
              </button>
            </div>
          </motion.div>
        ) : (
          /* Login Form Container */
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-black/70 border border-white/10 rounded-2xl p-6 md:p-8 backdrop-blur-2xl shadow-[0_0_30px_rgba(0,0,0,0.8)] relative overflow-hidden"
          >
            {/* Top Cyan Glowing Stripe */}
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#00E5FF] to-transparent" />

            {/* Error / Success Alerts */}
            <AnimatePresence mode="wait">
              {errorMsg && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mb-4 p-3.5 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-xs flex flex-col gap-2.5 font-mono"
                >
                  <div className="flex items-start gap-2">
                    <AlertCircle size={15} className="mt-0.5 flex-shrink-0 text-red-400" />
                    <span className="flex-1 leading-relaxed">{errorMsg}</span>
                  </div>
                  {errorMsg.includes('Google') && (
                    <button
                      type="button"
                      onClick={handleGoogleSSO}
                      className="w-full py-2 bg-[#00E5FF] hover:bg-[#00E5FF]/90 text-black font-semibold rounded-lg text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-[0_0_12px_rgba(0,229,255,0.4)]"
                    >
                      <GoogleIcon />
                      <span>Sign In with Google Now</span>
                    </button>
                  )}
                </motion.div>
              )}
              {successMsg && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mb-4 p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400 text-xs flex items-start gap-2 font-mono"
                >
                  <CheckCircle2 size={14} className="mt-0.5 flex-shrink-0" />
                  <span className="flex-1">{successMsg}</span>
                </motion.div>
              )}
            </AnimatePresence>

            <form onSubmit={handleEmailLogin} className="space-y-4">
              {/* Email Input */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-mono text-gray-300 tracking-wider uppercase flex justify-between">
                  <span>Operator Email</span>
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-3 text-gray-500" size={16} />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="operator@krishna-os.ai"
                    className="w-full pl-10 pr-4 py-2.5 bg-black/50 border border-white/10 rounded-xl text-xs text-white placeholder-gray-600 focus:outline-none focus:border-[#00E5FF] focus:ring-1 focus:ring-[#00E5FF]/50 transition-all font-mono"
                  />
                </div>
              </div>

              {/* Password Input */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center text-[11px] font-mono">
                  <label className="text-gray-300 tracking-wider uppercase">Security Key</label>
                  <button
                    type="button"
                    onClick={() => {
                      setResetEmail(email);
                      setShowForgotModal(true);
                    }}
                    className="text-[#00E5FF] hover:underline cursor-pointer text-[10px]"
                  >
                    Forgot Key?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-3 text-gray-500" size={16} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full pl-10 pr-10 py-2.5 bg-black/50 border border-white/10 rounded-xl text-xs text-white placeholder-gray-600 focus:outline-none focus:border-[#00E5FF] focus:ring-1 focus:ring-[#00E5FF]/50 transition-all font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    className="absolute right-3.5 top-3 text-gray-400 hover:text-white cursor-pointer transition-colors"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* Remember Me & Quick Android Mode */}
              <div className="flex items-center justify-between text-xs pt-1">
                <label className="flex items-center gap-2 cursor-pointer text-gray-400 hover:text-gray-200">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="rounded border-white/20 bg-black/50 text-[#00E5FF] focus:ring-0 focus:ring-offset-0"
                  />
                  <span className="font-mono text-[11px]">Remember Session</span>
                </label>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3 bg-[#00E5FF] hover:bg-[#00E5FF]/90 text-black font-semibold rounded-xl text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-[0_0_20px_rgba(0,229,255,0.3)] disabled:opacity-50 mt-2"
              >
                {submitting ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    <span>Verifying Credentials...</span>
                  </>
                ) : (
                  <>
                    <LogIn size={16} />
                    <span>Sign In to KRISHNA_OS</span>
                  </>
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/10" />
              </div>
              <div className="relative flex justify-center text-[10px] uppercase font-mono">
                <span className="bg-[#080D1A] px-3 text-gray-500">Or SSO Authenticate</span>
              </div>
            </div>

            {/* Google SSO Buttons */}
            <div className="space-y-2">
              <button
                type="button"
                onClick={handleGoogleSSO}
                disabled={submitting}
                className="w-full py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-xs text-white font-medium flex items-center justify-center gap-2.5 transition-all cursor-pointer hover:border-white/20 hover:border-[#00E5FF]/40 disabled:opacity-50"
              >
                <GoogleIcon />
                <span>Continue with Google</span>
              </button>

              <button
                type="button"
                onClick={handleGoogleRedirectSSO}
                disabled={submitting}
                className="w-full py-1.5 bg-transparent hover:bg-white/5 rounded-lg text-[10px] font-mono text-gray-400 hover:text-[#00E5FF] flex items-center justify-center gap-1 transition-all cursor-pointer"
              >
                <ExternalLink size={11} />
                <span>Having popup issues? Use Google Redirect Login</span>
              </button>
            </div>

            {/* Link to Register */}
            <div className="mt-6 pt-4 border-t border-white/10 text-center text-xs text-gray-400">
              <span>Don't have an operator profile? </span>
              <Link
                to="/register"
                className="text-[#00E5FF] hover:underline font-mono font-semibold ml-1 inline-flex items-center gap-1"
              >
                <span>Register Account</span>
                <UserPlus size={12} />
              </Link>
            </div>
          </motion.div>
        )}
      </div>

      {/* Forgot Password Modal */}
      <AnimatePresence>
        {showForgotModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/80 backdrop-blur-md"
              onClick={() => setShowForgotModal(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-sm bg-black/90 border border-white/20 rounded-2xl p-6 z-10 space-y-4"
            >
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div className="flex items-center gap-2 text-[#00E5FF]">
                  <KeyRound size={18} />
                  <h3 className="text-sm font-semibold text-white">Reset Security Key</h3>
                </div>
                <button
                  onClick={() => setShowForgotModal(false)}
                  className="text-gray-400 hover:text-white text-xs cursor-pointer font-mono"
                >
                  ✕
                </button>
              </div>

              <p className="text-xs text-gray-400 font-mono">
                Enter your registered operator email to receive an instant password reset link.
              </p>

              <form onSubmit={handleSendResetEmail} className="space-y-3">
                <input
                  type="email"
                  required
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  placeholder="operator@krishna-os.ai"
                  className="w-full px-3.5 py-2 bg-black/60 border border-white/20 rounded-xl text-xs text-white placeholder-gray-600 focus:outline-none focus:border-[#00E5FF] font-mono"
                />

                {resetStatus && (
                  <p className="text-[11px] font-mono text-[#00E5FF] bg-[#00E5FF]/10 p-2 rounded-lg border border-[#00E5FF]/20">
                    {resetStatus}
                  </p>
                )}

                <div className="flex gap-2 pt-1">
                  <button
                    type="submit"
                    disabled={resetSubmitting}
                    className="flex-1 py-2 bg-[#00E5FF] hover:bg-[#00E5FF]/90 text-black font-semibold rounded-xl text-xs transition-all cursor-pointer disabled:opacity-50"
                  >
                    {resetSubmitting ? 'Sending...' : 'Dispatch Reset Email'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowForgotModal(false)}
                    className="px-3 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs transition-all cursor-pointer"
                  >
                    Close
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
