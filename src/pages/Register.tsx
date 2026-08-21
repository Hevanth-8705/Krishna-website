import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Mail,
  Lock,
  User,
  Eye,
  EyeOff,
  ArrowRight,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  UserPlus,
  Loader2,
  Check,
  LogIn,
  Shield,
  Smartphone,
  ExternalLink
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import {
  createUserWithEmailAndPassword,
  updateProfile,
  sendEmailVerification
} from 'firebase/auth';
import { auth } from '../lib/firebase';
import { getFirebaseAuthErrorMessage } from '../lib/authErrors';
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

export default function Register() {
  const navigate = useNavigate();
  const { user, firebaseReady, configErrors } = useAuth();

  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Password strength checks
  const hasMinLength = password.length >= 8;
  const hasUppercase = /[A-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[^A-Za-z0-9]/.test(password);
  const isPasswordMatch = password.length > 0 && password === confirmPassword;

  const strengthScore = [hasMinLength, hasUppercase, hasNumber, hasSpecial].filter(Boolean).length;

  // Check for Google Auth redirect completion on mount
  useEffect(() => {
    async function checkRedirect() {
      const res = await handleGoogleRedirectResult();
      if (res) {
        if (res.success) {
          setSuccessMsg(res.message);
          setTimeout(() => navigate('/dashboard'), 1000);
        } else {
          setErrorMsg(res.message);
        }
      }
    }
    checkRedirect();
  }, [navigate]);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!displayName.trim()) {
      setErrorMsg('Please enter your full operator name.');
      return;
    }
    if (!email.trim() || !password) {
      setErrorMsg('Please fill in all required fields.');
      return;
    }
    if (password !== confirmPassword) {
      setErrorMsg('Passwords do not match. Please verify your entries.');
      return;
    }
    if (password.length < 6) {
      setErrorMsg('Password must be at least 6 characters long.');
      return;
    }
    if (!termsAccepted) {
      setErrorMsg('You must agree to the KRISHNA_OS Terms & Neural Data Protocols.');
      return;
    }

    setSubmitting(true);
    try {
      // 1. Create User
      const userCredential = await createUserWithEmailAndPassword(auth, email.trim(), password);
      
      // 2. Set Display Name
      if (displayName.trim()) {
        await updateProfile(userCredential.user, { displayName: displayName.trim() });
      }

      // 3. Sync to Firestore
      await syncUserProfileToFirestore(userCredential.user, 'password');

      // 4. Dispatch Email Verification
      let verifyMsg = '';
      try {
        await sendEmailVerification(userCredential.user);
        verifyMsg = 'Verification email dispatched to ' + email.trim() + '! Please confirm your inbox.';
      } catch (verifyErr) {
        console.warn('Verification email failed:', verifyErr);
        verifyMsg = 'Account created successfully.';
      }

      setSuccessMsg(`Operator account created! ${verifyMsg}`);

      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);
    } catch (err: any) {
      console.error('Registration error:', err);
      setErrorMsg(getFirebaseAuthErrorMessage(err, 'Registration failed.'));
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
      setSuccessMsg(`Registered & authenticated via Google as ${res.user?.displayName || res.user?.email}`);
      setTimeout(() => {
        navigate('/dashboard');
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

  return (
    <div className="min-h-[85vh] flex flex-col items-center justify-center py-6 px-4 relative">
      {/* Background Radial Glow */}
      <div className="absolute inset-0 z-0 bg-[radial-gradient(circle_at_top_center,rgba(0,229,255,0.08)_0%,transparent_70%)] pointer-events-none" />

      <div className="w-full max-w-md z-10 space-y-6">
        {/* Header Title with Metallic Flute Icon */}
        <div className="text-center space-y-2">
          <div className="flex justify-center mb-3">
            <KrishnaFluteHero className="scale-90" />
          </div>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#00E5FF]/10 border border-[#00E5FF]/20 rounded-full text-[10px] font-mono text-[#00E5FF] tracking-widest uppercase">
            <Sparkles size={12} className="animate-spin" />
            <span>OPERATOR PROVISIONING MATRIX</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white font-sans">
            Create Account
          </h1>
          <p className="text-xs text-gray-400 max-w-xs mx-auto font-mono">
            Provision your new operator credential for KRISHNA_OS ecosystem.
          </p>
        </div>

        {/* Registration Form Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-black/70 border border-white/10 rounded-2xl p-6 md:p-8 backdrop-blur-2xl shadow-[0_0_30px_rgba(0,0,0,0.8)] relative overflow-hidden"
        >
          {/* Top Cyan Glowing Line */}
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#00E5FF] to-transparent" />

          {/* Firebase Configuration Error Banner */}
          {!firebaseReady && (
            <div className="mb-4 p-4 bg-amber-500/10 border border-amber-500/40 rounded-xl text-amber-300 text-xs font-mono space-y-2">
              <div className="flex items-start gap-2">
                <AlertCircle size={16} className="mt-0.5 flex-shrink-0 text-amber-400" />
                <div className="space-y-1">
                  <p className="font-semibold text-amber-200 text-[11px] tracking-wide uppercase">Firebase Configuration Required</p>
                  {configErrors.map((err, i) => (
                    <p key={i} className="text-[10px] leading-relaxed text-amber-300/80">• {err}</p>
                  ))}
                  <p className="text-[10px] text-amber-400/70 pt-1">
                    Set the correct values in your <span className="text-amber-200">.env</span> file from{' '}
                    <span className="text-amber-200">Firebase Console → Project Settings → Your Apps</span>.
                  </p>
                </div>
              </div>
            </div>
          )}

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
                    <span>Sign Up with Google Now</span>
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

          <form onSubmit={handleRegister} className="space-y-4">
            {/* Operator Full Name */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-mono text-gray-300 tracking-wider uppercase">
                Operator Full Name
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-3 text-gray-500" size={16} />
                <input
                  type="text"
                  required
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Krishna Dev"
                  className="w-full pl-10 pr-4 py-2.5 bg-black/50 border border-white/10 rounded-xl text-xs text-white placeholder-gray-600 focus:outline-none focus:border-[#00E5FF] focus:ring-1 focus:ring-[#00E5FF]/50 transition-all font-mono"
                />
              </div>
            </div>

            {/* Email Address */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-mono text-gray-300 tracking-wider uppercase">
                Operator Email
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

            {/* Password Field */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-mono text-gray-300 tracking-wider uppercase">
                Security Key (Password)
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3 text-gray-500" size={16} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min 6 characters"
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

            {/* Confirm Password Field */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-mono text-gray-300 tracking-wider uppercase">
                Confirm Security Key
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3 text-gray-500" size={16} />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  required
                  minLength={6}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter security key"
                  className="w-full pl-10 pr-10 py-2.5 bg-black/50 border border-white/10 rounded-xl text-xs text-white placeholder-gray-600 focus:outline-none focus:border-[#00E5FF] focus:ring-1 focus:ring-[#00E5FF]/50 transition-all font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
                  className="absolute right-3.5 top-3 text-gray-400 hover:text-white cursor-pointer transition-colors"
                >
                  {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Password Strength Checklist */}
            {password.length > 0 && (
              <div className="p-2.5 bg-black/40 border border-white/5 rounded-xl space-y-1.5">
                <div className="flex items-center justify-between text-[10px] font-mono text-gray-400">
                  <span>KEY COMPLEXITY SCORE</span>
                  <span className={strengthScore >= 3 ? 'text-emerald-400 font-bold' : 'text-amber-400 font-bold'}>
                    {strengthScore}/4 {strengthScore >= 3 ? 'STRONG' : 'MODERATE'}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-1.5 text-[10px] font-mono text-gray-400 pt-1">
                  <div className={`flex items-center gap-1 ${hasMinLength ? 'text-emerald-400' : ''}`}>
                    <Check size={10} className={hasMinLength ? 'opacity-100' : 'opacity-30'} />
                    <span>8+ characters</span>
                  </div>
                  <div className={`flex items-center gap-1 ${hasUppercase ? 'text-emerald-400' : ''}`}>
                    <Check size={10} className={hasUppercase ? 'opacity-100' : 'opacity-30'} />
                    <span>Uppercase letter</span>
                  </div>
                  <div className={`flex items-center gap-1 ${hasNumber ? 'text-emerald-400' : ''}`}>
                    <Check size={10} className={hasNumber ? 'opacity-100' : 'opacity-30'} />
                    <span>Number (0-9)</span>
                  </div>
                  <div className={`flex items-center gap-1 ${isPasswordMatch ? 'text-emerald-400' : ''}`}>
                    <Check size={10} className={isPasswordMatch ? 'opacity-100' : 'opacity-30'} />
                    <span>Keys match</span>
                  </div>
                </div>
              </div>
            )}

            {/* Terms & Conditions Checkbox */}
            <div className="pt-1">
              <label className="flex items-start gap-2.5 cursor-pointer text-gray-400 hover:text-gray-200">
                <input
                  type="checkbox"
                  required
                  checked={termsAccepted}
                  onChange={(e) => setTermsAccepted(e.target.checked)}
                  className="mt-0.5 rounded border-white/20 bg-black/50 text-[#00E5FF] focus:ring-0 focus:ring-offset-0"
                />
                <span className="text-[11px] font-mono leading-snug">
                  I accept the <span className="text-[#00E5FF]">KRISHNA_OS Protocols</span>, Neural Data Handling & Email Verification Terms.
                </span>
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
                  <span>Provisioning Account...</span>
                </>
              ) : (
                <>
                  <UserPlus size={16} />
                  <span>Register Operator Profile</span>
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-5">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/10" />
            </div>
            <div className="relative flex justify-center text-[10px] uppercase font-mono">
              <span className="bg-[#080D1A] px-3 text-gray-500">Or Quick Register</span>
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
              <span>Sign Up with Google</span>
            </button>

            <button
              type="button"
              onClick={handleGoogleRedirectSSO}
              disabled={submitting}
              className="w-full py-1.5 bg-transparent hover:bg-white/5 rounded-lg text-[10px] font-mono text-gray-400 hover:text-[#00E5FF] flex items-center justify-center gap-1 transition-all cursor-pointer"
            >
              <ExternalLink size={11} />
              <span>Having popup issues? Use Google Redirect Sign-Up</span>
            </button>
          </div>

          {/* Link to Login */}
          <div className="mt-6 pt-4 border-t border-white/10 text-center text-xs text-gray-400">
            <span>Already have an operator account? </span>
            <Link
              to="/login"
              className="text-[#00E5FF] hover:underline font-mono font-semibold ml-1 inline-flex items-center gap-1"
            >
              <span>Sign In</span>
              <LogIn size={12} />
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
