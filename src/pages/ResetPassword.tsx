import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { KeyRound, ShieldCheck, AlertCircle, ArrowLeft, CheckCircle2, Loader2, Lock, Eye, EyeOff } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');

  const [verifyingToken, setVerifyingToken] = useState(true);
  const [tokenValid, setTokenValid] = useState(false);
  const [associatedEmail, setAssociatedEmail] = useState<string | null>(null);
  const [tokenError, setTokenError] = useState<string | null>(null);

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [resetCompleted, setResetCompleted] = useState(false);

  useEffect(() => {
    if (!token) {
      setVerifyingToken(false);
      setTokenValid(false);
      setTokenError('No password reset token was provided in the link.');
      return;
    }

    async function validateToken() {
      try {
        setVerifyingToken(true);
        setTokenError(null);
        const res = await fetch('/api/auth/verify-reset-token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token }),
        });
        const data = await res.json();

        if (data.valid) {
          setTokenValid(true);
          setAssociatedEmail(data.email || null);
        } else {
          setTokenValid(false);
          setTokenError(data.message || 'Invalid or expired password reset token.');
        }
      } catch (err: any) {
        setTokenValid(false);
        setTokenError('Network error verifying password reset link.');
      } finally {
        setVerifyingToken(false);
      }
    }

    validateToken();
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword || newPassword.length < 6) {
      setSubmitError('New password must be at least 6 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setSubmitError('Passwords do not match. Please verify your typing.');
      return;
    }

    try {
      setSubmitting(true);
      setSubmitError(null);

      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, newPassword }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setResetCompleted(true);
      } else {
        setSubmitError(data.message || 'Failed to reset password.');
      }
    } catch (err: any) {
      setSubmitError('Server error while completing password reset.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-[#090d16]/90 border border-[#00E5FF]/30 rounded-2xl p-6 sm:p-8 backdrop-blur-xl shadow-[0_0_40px_rgba(0,229,255,0.12)] relative overflow-hidden"
      >
        {/* Glow accent */}
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-[#00E5FF]/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-[#7C3AED]/10 rounded-full blur-3xl pointer-events-none"></div>

        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-xl bg-[#00E5FF]/10 border border-[#00E5FF]/30 mx-auto flex items-center justify-center text-[#00E5FF] mb-3 shadow-[0_0_15px_rgba(0,229,255,0.2)]">
            <KeyRound size={22} />
          </div>
          <span className="text-[9px] font-mono text-[#00E5FF] uppercase tracking-widest font-bold block">
            KRISHNA_OS SECURITY CORE
          </span>
          <h2 className="text-xl font-bold text-white font-mono mt-1">
            Password Reset Protocol
          </h2>
          {associatedEmail && (
            <p className="text-xs text-gray-400 font-mono mt-1 truncate">
              Account: <span className="text-[#00E5FF]">{associatedEmail}</span>
            </p>
          )}
        </div>

        {/* Verifying Spinner State */}
        {verifyingToken && (
          <div className="py-12 text-center space-y-3">
            <Loader2 className="animate-spin text-[#00E5FF] mx-auto" size={32} />
            <p className="text-xs font-mono text-gray-300">
              Verifying cryptographic reset token...
            </p>
          </div>
        )}

        {/* Error State (Invalid/Expired Token) */}
        {!verifyingToken && !tokenValid && !resetCompleted && (
          <div className="space-y-4 text-center py-2">
            <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl space-y-2 text-left">
              <div className="flex items-center gap-2 text-red-400 font-mono text-xs font-bold">
                <AlertCircle size={16} />
                <span>Verification Failed</span>
              </div>
              <p className="text-xs text-gray-300 font-mono leading-relaxed">
                {tokenError || 'This password reset link is invalid or has expired.'}
              </p>
            </div>

            <button
              onClick={() => navigate('/login')}
              type="button"
              className="w-full py-3 bg-[#00E5FF]/10 hover:bg-[#00E5FF]/20 border border-[#00E5FF]/40 text-[#00E5FF] font-mono text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(0,229,255,0.15)]"
            >
              <ArrowLeft size={16} />
              <span>RETURN TO AUTH & REQUEST NEW LINK</span>
            </button>
          </div>
        )}

        {/* Success Reset Completed State */}
        {resetCompleted && (
          <motion.div 
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="space-y-5 text-center py-2"
          >
            <div className="p-4 bg-[#00FF9D]/10 border border-[#00FF9D]/30 rounded-xl space-y-2">
              <div className="flex items-center justify-center gap-2 text-[#00FF9D] font-mono text-sm font-bold">
                <CheckCircle2 size={18} />
                <span>Password Reset Successful</span>
              </div>
              <p className="text-xs text-gray-300 font-mono leading-relaxed">
                Your password has been updated. Old security credentials have been revoked.
              </p>
            </div>

            <button
              onClick={() => navigate('/login')}
              type="button"
              className="w-full py-3 bg-[#00FF9D] text-black font-mono text-xs font-bold rounded-xl transition-all hover:bg-[#00FF9D]/90 cursor-pointer shadow-[0_0_20px_rgba(0,255,157,0.3)]"
            >
              LOG IN WITH NEW PASSWORD
            </button>
          </motion.div>
        )}

        {/* Active Reset Form */}
        {!verifyingToken && tokenValid && !resetCompleted && (
          <form onSubmit={handleSubmit} className="space-y-4">
            {submitError && (
              <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-xs text-red-300 font-mono flex items-center gap-2">
                <AlertCircle size={14} className="shrink-0" />
                <span>{submitError}</span>
              </div>
            )}

            <div className="space-y-1.5 text-left">
              <label className="text-[10px] font-mono text-gray-400 uppercase tracking-wider block">
                New Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3 text-gray-500" size={14} />
                <input
                  type={showNewPassword ? 'text' : 'password'}
                  required
                  minLength={6}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Min 6 characters"
                  className="w-full pl-9 pr-10 py-2.5 bg-black/40 border border-white/10 rounded-xl text-xs text-white placeholder-gray-600 focus:outline-none focus:border-[#00E5FF] transition-all font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  aria-label={showNewPassword ? 'Hide password' : 'Show password'}
                  className="absolute right-3.5 top-3 text-gray-400 hover:text-white cursor-pointer"
                >
                  {showNewPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>

            <div className="space-y-1.5 text-left">
              <label className="text-[10px] font-mono text-gray-400 uppercase tracking-wider block">
                Confirm New Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3 text-gray-500" size={14} />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  required
                  minLength={6}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter new password"
                  className="w-full pl-9 pr-10 py-2.5 bg-black/40 border border-white/10 rounded-xl text-xs text-white placeholder-gray-600 focus:outline-none focus:border-[#00E5FF] transition-all font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
                  className="absolute right-3.5 top-3 text-gray-400 hover:text-white cursor-pointer"
                >
                  {showConfirmPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full mt-2 py-3 bg-[#00E5FF] text-black font-mono text-xs font-bold rounded-xl transition-all hover:bg-[#00E5FF]/90 cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(0,229,255,0.25)]"
            >
              {submitting ? (
                <>
                  <Loader2 className="animate-spin" size={14} />
                  <span>UPDATING CREDENTIALS...</span>
                </>
              ) : (
                <>
                  <ShieldCheck size={14} />
                  <span>COMPLETE PASSWORD RESET</span>
                </>
              )}
            </button>
          </form>
        )}
      </motion.div>
    </div>
  );
}
