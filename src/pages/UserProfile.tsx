import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  User,
  Mail,
  Shield,
  ShieldCheck,
  ShieldAlert,
  KeyRound,
  Bell,
  Sparkles,
  Sliders,
  LogOut,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Camera,
  Save,
  Clock,
  Cpu,
  Smartphone,
  Globe,
  RefreshCw,
  Check,
  FileText,
  Send,
  Inbox,
  BellRing
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { updateProfile, sendEmailVerification, sendPasswordResetEmail } from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { KrishnaFluteHero } from '../components/KrishnaFluteHero';

interface EmailSettings {
  securityAlerts: boolean;
  weeklySummary: boolean;
  taskReminders: boolean;
  systemUpdates: boolean;
  aiInsights: boolean;
}

interface UserPreferences {
  aiModel: string;
  themeMode: string;
  soundEffects: boolean;
  emailNotifications: boolean;
  emailSettings: EmailSettings;
  voiceSpeed: number;
  autoSaveCanvas: boolean;
  twoFactorHint: boolean;
}

export default function UserProfile() {
  const navigate = useNavigate();
  const { user, isEmailVerified, signOut } = useAuth();
  const { theme, toggleTheme } = useTheme();

  // Profile Form States
  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [photoURL, setPhotoURL] = useState(user?.photoURL || '');
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileMsg, setProfileMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Email Verification & Password Actions
  const [sendingVerification, setSendingVerification] = useState(false);
  const [verificationMsg, setVerificationMsg] = useState<string | null>(null);
  const [sendingReset, setSendingReset] = useState(false);
  const [resetMsg, setResetMsg] = useState<string | null>(null);

  // Preferences State
  const [preferences, setPreferences] = useState<UserPreferences>({
    aiModel: 'llama-3.3-70b-versatile',
    themeMode: theme || 'dark',
    soundEffects: true,
    emailNotifications: true,
    emailSettings: {
      securityAlerts: true,
      weeklySummary: true,
      taskReminders: true,
      systemUpdates: false,
      aiInsights: true,
    },
    voiceSpeed: 1.0,
    autoSaveCanvas: true,
    twoFactorHint: false,
  });
  const [loadingPrefs, setLoadingPrefs] = useState(true);
  const [savingPrefs, setSavingPrefs] = useState(false);
  const [prefsMsg, setPrefsMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [testingDispatch, setTestingDispatch] = useState(false);
  const [dispatchMsg, setDispatchMsg] = useState<string | null>(null);

  // Load Preferences from Firestore
  useEffect(() => {
    async function loadUserPrefs() {
      if (!user) return;
      try {
        const prefRef = doc(db, 'users', user.uid);
        const docSnap = await getDoc(prefRef);
        if (docSnap.exists() && docSnap.data()?.preferences) {
          const loadedData = docSnap.data()?.preferences;
          setPreferences((prev) => ({
            ...prev,
            ...loadedData,
            emailSettings: {
              ...prev.emailSettings,
              ...(loadedData.emailSettings || {})
            }
          }));
        }
      } catch (err) {
        console.warn('Could not load preferences from Firestore:', err);
      } finally {
        setLoadingPrefs(false);
      }
    }
    loadUserPrefs();
  }, [user]);

  // Update Profile Info in Firebase Auth + Firestore
  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSavingProfile(true);
    setProfileMsg(null);

    try {
      await updateProfile(user, {
        displayName: displayName.trim(),
        photoURL: photoURL.trim() || null,
      });

      // Update in Firestore user document
      const userRef = doc(db, 'users', user.uid);
      await setDoc(
        userRef,
        {
          displayName: displayName.trim(),
          photoURL: photoURL.trim() || '',
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );

      setProfileMsg({ type: 'success', text: 'Operator profile details updated successfully!' });
    } catch (err: any) {
      console.error('Update profile error:', err);
      setProfileMsg({ type: 'error', text: err.message || 'Failed to update profile.' });
    } finally {
      setSavingProfile(false);
    }
  };

  // Save Preferences to Firestore
  const handleSavePreferences = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSavingPrefs(true);
    setPrefsMsg(null);

    try {
      const userRef = doc(db, 'users', user.uid);
      await setDoc(
        userRef,
        {
          preferences,
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );

      setPrefsMsg({ type: 'success', text: 'User preferences saved to neural node!' });
    } catch (err: any) {
      console.error('Save preferences error:', err);
      setPrefsMsg({ type: 'error', text: err.message || 'Failed to save preferences.' });
    } finally {
      setSavingPrefs(false);
    }
  };

  // Send Email Verification
  const handleSendVerification = async () => {
    if (!user) return;
    setSendingVerification(true);
    setVerificationMsg(null);
    try {
      await sendEmailVerification(user);
      setVerificationMsg(`Verification link dispatched to ${user.email}. Please check your inbox.`);
    } catch (err: any) {
      setVerificationMsg(`Verification error: ${err.message || 'Failed to send.'}`);
    } finally {
      setSendingVerification(false);
    }
  };

  // Dispatch Password Reset
  const handleSendPasswordReset = async () => {
    if (!user || !user.email) return;
    setSendingReset(true);
    setResetMsg(null);
    try {
      await sendPasswordResetEmail(auth, user.email);
      setResetMsg(`Password reset email sent to ${user.email}.`);
    } catch (err: any) {
      setResetMsg(`Password reset failed: ${err.message || 'Failed to send.'}`);
    } finally {
      setSendingReset(false);
    }
  };

  // If unauthenticated, present CTA
  if (!user) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center p-6 text-center">
        <div className="max-w-md bg-black/70 border border-white/10 rounded-2xl p-8 backdrop-blur-xl space-y-5">
          <div className="w-14 h-14 mx-auto rounded-full bg-[#00E5FF]/10 border border-[#00E5FF]/30 flex items-center justify-center text-[#00E5FF]">
            <User size={28} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Operator Unauthenticated</h2>
            <p className="text-xs text-gray-400 font-mono mt-1">
              Please sign in to view account metrics, manage neural preferences & edit operator metadata.
            </p>
          </div>
          <div className="flex gap-3 justify-center pt-2">
            <Link
              to="/login"
              className="px-5 py-2.5 bg-[#00E5FF] hover:bg-[#00E5FF]/90 text-black font-semibold rounded-xl text-xs transition-all shadow-[0_0_15px_rgba(0,229,255,0.3)]"
            >
              Sign In
            </Link>
            <Link
              to="/register"
              className="px-5 py-2.5 bg-white/5 hover:bg-white/10 border border-white/15 text-white font-medium rounded-xl text-xs transition-all"
            >
              Register
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const providerId = user.providerData[0]?.providerId || 'password';
  const isGoogleUser = providerId === 'google.com';

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12">
      {/* Top Header Banner */}
      <div className="relative p-6 md:p-8 bg-black/60 border border-white/10 rounded-2xl backdrop-blur-xl overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#00E5FF] to-transparent" />
        <div className="absolute -right-12 -top-12 w-64 h-64 bg-[#00E5FF]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-gradient-to-tr from-[#00E5FF] to-blue-600 p-[2px] shadow-[0_0_20px_rgba(0,229,255,0.2)]">
                <div className="w-full h-full bg-black rounded-[14px] overflow-hidden flex items-center justify-center">
                  {user.photoURL ? (
                    <img src={user.photoURL} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <User className="w-8 h-8 text-[#00E5FF]" />
                  )}
                </div>
              </div>
              <div
                className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 border-black flex items-center justify-center ${
                  isEmailVerified ? 'bg-emerald-500' : 'bg-amber-500'
                }`}
                title={isEmailVerified ? 'Verified Operator' : 'Unverified Email'}
              >
                {isEmailVerified ? <Check size={10} className="text-black stroke-[3]" /> : <AlertCircle size={10} className="text-black" />}
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h1 className="text-xl md:text-2xl font-bold text-white font-sans">
                  {user.displayName || 'Krishna Operator'}
                </h1>
                <span className="px-2 py-0.5 bg-[#00E5FF]/10 border border-[#00E5FF]/30 text-[#00E5FF] text-[10px] font-mono rounded-full uppercase tracking-wider">
                  {isGoogleUser ? 'Google SSO' : 'Email Auth'}
                </span>
              </div>
              <p className="text-xs text-gray-400 font-mono">{user.email}</p>
              <p className="text-[10px] text-gray-500 font-mono">
                UID: <span className="text-gray-400">{user.uid}</span>
              </p>
            </div>
          </div>

          <button
            onClick={() => signOut()}
            className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 hover:text-red-300 rounded-xl text-xs font-mono flex items-center gap-2 transition-all cursor-pointer self-stretch md:self-auto justify-center"
          >
            <LogOut size={14} />
            <span>Sign Out Session</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Account Details & Security */}
        <div className="lg:col-span-1 space-y-6">
          {/* Operator Profile Metadata Card */}
          <div className="bg-black/60 border border-white/10 rounded-2xl p-6 backdrop-blur-xl space-y-4">
            <div className="flex items-center gap-2 text-[#00E5FF] pb-2 border-b border-white/10">
              <User size={18} />
              <h2 className="text-sm font-semibold text-white tracking-wide">Account Profile</h2>
            </div>

            {profileMsg && (
              <div
                className={`p-3 rounded-xl text-xs font-mono flex items-start gap-2 ${
                  profileMsg.type === 'success'
                    ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400'
                    : 'bg-red-500/10 border border-red-500/30 text-red-400'
                }`}
              >
                {profileMsg.type === 'success' ? <CheckCircle2 size={14} className="mt-0.5 flex-shrink-0" /> : <AlertCircle size={14} className="mt-0.5 flex-shrink-0" />}
                <span>{profileMsg.text}</span>
              </div>
            )}

            <form onSubmit={handleUpdateProfile} className="space-y-3.5">
              <div className="space-y-1">
                <label className="text-[11px] font-mono text-gray-400 uppercase">Display Name</label>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="e.g. Krishna Dev"
                  className="w-full px-3.5 py-2 bg-black/50 border border-white/10 rounded-xl text-xs text-white placeholder-gray-600 focus:outline-none focus:border-[#00E5FF] font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-mono text-gray-400 uppercase">Avatar Photo URL</label>
                <div className="relative">
                  <Camera className="absolute left-3 top-2.5 text-gray-500" size={14} />
                  <input
                    type="url"
                    value={photoURL}
                    onChange={(e) => setPhotoURL(e.target.value)}
                    placeholder="https://images.unsplash.com/..."
                    className="w-full pl-9 pr-3.5 py-2 bg-black/50 border border-white/10 rounded-xl text-xs text-white placeholder-gray-600 focus:outline-none focus:border-[#00E5FF] font-mono"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={savingProfile}
                className="w-full py-2.5 bg-[#00E5FF] hover:bg-[#00E5FF]/90 text-black font-semibold rounded-xl text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-[0_0_12px_rgba(0,229,255,0.25)] disabled:opacity-50"
              >
                {savingProfile ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Save size={14} />
                    <span>Update Account</span>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Security & Verification Card */}
          <div className="bg-black/60 border border-white/10 rounded-2xl p-6 backdrop-blur-xl space-y-4">
            <div className="flex items-center gap-2 text-[#00E5FF] pb-2 border-b border-white/10">
              <ShieldCheck size={18} />
              <h2 className="text-sm font-semibold text-white tracking-wide">Security Protocols</h2>
            </div>

            {/* Email Verification Status */}
            <div className="p-3 bg-white/5 border border-white/10 rounded-xl space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-400 font-mono">Email Verification</span>
                {isEmailVerified ? (
                  <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 font-mono text-[10px] rounded border border-emerald-500/30">
                    VERIFIED
                  </span>
                ) : (
                  <span className="px-2 py-0.5 bg-amber-500/10 text-amber-400 font-mono text-[10px] rounded border border-amber-500/30">
                    UNVERIFIED
                  </span>
                )}
              </div>

              {!isEmailVerified && (
                <div className="pt-1">
                  <button
                    onClick={handleSendVerification}
                    disabled={sendingVerification}
                    className="w-full py-1.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 rounded-lg text-[11px] font-mono transition-all cursor-pointer disabled:opacity-50"
                  >
                    {sendingVerification ? 'Dispatching Email...' : 'Send Verification Email'}
                  </button>
                </div>
              )}

              {verificationMsg && (
                <p className="text-[10px] font-mono text-[#00E5FF] pt-1">{verificationMsg}</p>
              )}
            </div>

            {/* Password Reset Dispatch */}
            <div className="p-3 bg-white/5 border border-white/10 rounded-xl space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-400 font-mono">Security Key / Password</span>
                <span className="text-gray-500 text-[10px] font-mono">
                  {isGoogleUser ? 'Google Managed' : 'Firebase Managed'}
                </span>
              </div>

              <button
                onClick={handleSendPasswordReset}
                disabled={sendingReset}
                className="w-full py-1.5 bg-white/10 hover:bg-white/15 text-white rounded-lg text-[11px] font-mono flex items-center justify-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
              >
                <KeyRound size={12} />
                <span>Dispatch Password Reset Link</span>
              </button>

              {resetMsg && <p className="text-[10px] font-mono text-[#00E5FF] pt-1">{resetMsg}</p>}
            </div>
          </div>
        </div>

        {/* Right Column: User Preferences & Neural Matrix Settings */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-black/60 border border-white/10 rounded-2xl p-6 md:p-8 backdrop-blur-xl space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2 text-[#00E5FF]">
                <Sliders size={20} />
                <h2 className="text-base font-semibold text-white tracking-wide">Neural & OS Preferences</h2>
              </div>
              <span className="text-[10px] font-mono text-gray-500 uppercase">PERSISTED TO FIRESTORE</span>
            </div>

            {prefsMsg && (
              <div
                className={`p-3.5 rounded-xl text-xs font-mono flex items-start gap-2 ${
                  prefsMsg.type === 'success'
                    ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400'
                    : 'bg-red-500/10 border border-red-500/30 text-red-400'
                }`}
              >
                {prefsMsg.type === 'success' ? <CheckCircle2 size={16} className="mt-0.5 flex-shrink-0" /> : <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />}
                <span>{prefsMsg.text}</span>
              </div>
            )}

            <form onSubmit={handleSavePreferences} className="space-y-6">
              {/* AI Intelligence Model Selector */}
              <div className="space-y-2">
                <label className="text-xs font-mono text-gray-300 uppercase flex items-center gap-1.5">
                  <Sparkles size={14} className="text-[#00E5FF]" />
                  <span>Default AI Reasoning Engine</span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[
                    { id: 'llama-3.3-70b-versatile', name: 'Groq LLaMA 3.3 70B', desc: 'Ultra-fast, high-intelligence reasoning & coding' },
                    { id: 'llama3-8b-8192', name: 'Groq LLaMA 3 8B', desc: 'Ultra-low latency & instant lightweight response' },
                  ].map((model) => (
                    <button
                      key={model.id}
                      type="button"
                      onClick={() => setPreferences({ ...preferences, aiModel: model.id })}
                      className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                        preferences.aiModel === model.id
                          ? 'bg-[#00E5FF]/10 border-[#00E5FF] text-white shadow-[0_0_15px_rgba(0,229,255,0.15)]'
                          : 'bg-black/40 border-white/10 text-gray-400 hover:border-white/20'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-semibold font-mono text-white">{model.name}</span>
                        {preferences.aiModel === model.id && <CheckCircle2 size={14} className="text-[#00E5FF]" />}
                      </div>
                      <p className="text-[10px] text-gray-400">{model.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Toggles Group */}
              <div className="space-y-3 pt-2 border-t border-white/10">
                <h3 className="text-xs font-mono text-gray-400 uppercase tracking-wider">System Toggles</h3>

                {/* Sound Effects */}
                <div className="flex items-center justify-between p-3.5 bg-black/40 border border-white/10 rounded-xl">
                  <div>
                    <p className="text-xs font-medium text-white font-sans">Synthesizer & Audio Feedback</p>
                    <p className="text-[10px] text-gray-500 font-mono">Plays audio chimes on voice commands and reactor interactions.</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={preferences.soundEffects}
                    onChange={(e) => setPreferences({ ...preferences, soundEffects: e.target.checked })}
                    className="w-4 h-4 rounded border-white/20 bg-black text-[#00E5FF] focus:ring-0 cursor-pointer"
                  />
                </div>

                {/* Auto Save Canvas */}
                <div className="flex items-center justify-between p-3.5 bg-black/40 border border-white/10 rounded-xl">
                  <div>
                    <p className="text-xs font-medium text-white font-sans">Auto-Save Neural Canvas</p>
                    <p className="text-[10px] text-gray-500 font-mono">Automatically syncs diagram changes to local memory storage.</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={preferences.autoSaveCanvas}
                    onChange={(e) => setPreferences({ ...preferences, autoSaveCanvas: e.target.checked })}
                    className="w-4 h-4 rounded border-white/20 bg-black text-[#00E5FF] focus:ring-0 cursor-pointer"
                  />
                </div>

                {/* Email Notifications Master & Granular Alerts Section */}
                <div className="space-y-4 pt-4 border-t border-white/10">
                  <div className="flex items-center justify-between pb-2">
                    <div className="flex items-center gap-2">
                      <Mail className="text-[#00E5FF]" size={18} />
                      <div>
                        <h3 className="text-xs font-semibold text-white font-sans uppercase tracking-wider">
                          Email Notifications & Subscriptions
                        </h3>
                        <p className="text-[10px] text-gray-400 font-mono">
                          Configured alerts dispatched directly to <span className="text-[#00E5FF]">{user.email}</span>
                        </p>
                      </div>
                    </div>
                    <label className="flex items-center gap-2 cursor-pointer bg-white/5 hover:bg-white/10 border border-white/10 px-3 py-1.5 rounded-xl transition-all">
                      <span className="text-[11px] font-mono text-gray-300">Master Dispatch:</span>
                      <input
                        type="checkbox"
                        checked={preferences.emailNotifications}
                        onChange={(e) => setPreferences({ ...preferences, emailNotifications: e.target.checked })}
                        className="w-4 h-4 rounded border-white/20 bg-black text-[#00E5FF] focus:ring-0 cursor-pointer"
                      />
                    </label>
                  </div>

                  {/* Granular Subscriptions Grid */}
                  <div className={`grid grid-cols-1 md:grid-cols-2 gap-3 transition-all ${!preferences.emailNotifications ? 'opacity-40 pointer-events-none' : ''}`}>
                    {/* Security Alerts */}
                    <div className="p-3.5 bg-black/40 border border-white/10 rounded-xl space-y-2 flex flex-col justify-between hover:border-[#00E5FF]/30 transition-all">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <ShieldAlert size={16} className="text-red-400 flex-shrink-0" />
                          <span className="text-xs font-medium text-white font-sans">Security Alerts</span>
                        </div>
                        <input
                          type="checkbox"
                          checked={preferences.emailSettings.securityAlerts}
                          onChange={(e) =>
                            setPreferences({
                              ...preferences,
                              emailSettings: {
                                ...preferences.emailSettings,
                                securityAlerts: e.target.checked
                              }
                            })
                          }
                          className="w-4 h-4 rounded border-white/20 bg-black text-[#00E5FF] focus:ring-0 cursor-pointer mt-0.5"
                        />
                      </div>
                      <p className="text-[10px] text-gray-400 font-mono leading-relaxed">
                        Instant warnings on unusual sign-in attempts, password resets, and key changes.
                      </p>
                    </div>

                    {/* Weekly Summary */}
                    <div className="p-3.5 bg-black/40 border border-white/10 rounded-xl space-y-2 flex flex-col justify-between hover:border-[#00E5FF]/30 transition-all">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <FileText size={16} className="text-[#00E5FF] flex-shrink-0" />
                          <span className="text-xs font-medium text-white font-sans">Weekly Summary</span>
                        </div>
                        <input
                          type="checkbox"
                          checked={preferences.emailSettings.weeklySummary}
                          onChange={(e) =>
                            setPreferences({
                              ...preferences,
                              emailSettings: {
                                ...preferences.emailSettings,
                                weeklySummary: e.target.checked
                              }
                            })
                          }
                          className="w-4 h-4 rounded border-white/20 bg-black text-[#00E5FF] focus:ring-0 cursor-pointer mt-0.5"
                        />
                      </div>
                      <p className="text-[10px] text-gray-400 font-mono leading-relaxed">
                        Weekly performance digest including reactor uptime and task progress metrics.
                      </p>
                    </div>

                    {/* Task Reminders */}
                    <div className="p-3.5 bg-black/40 border border-white/10 rounded-xl space-y-2 flex flex-col justify-between hover:border-[#00E5FF]/30 transition-all">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <BellRing size={16} className="text-amber-400 flex-shrink-0" />
                          <span className="text-xs font-medium text-white font-sans">Task Reminders</span>
                        </div>
                        <input
                          type="checkbox"
                          checked={preferences.emailSettings.taskReminders}
                          onChange={(e) =>
                            setPreferences({
                              ...preferences,
                              emailSettings: {
                                ...preferences.emailSettings,
                                taskReminders: e.target.checked
                              }
                            })
                          }
                          className="w-4 h-4 rounded border-white/20 bg-black text-[#00E5FF] focus:ring-0 cursor-pointer mt-0.5"
                        />
                      </div>
                      <p className="text-[10px] text-gray-400 font-mono leading-relaxed">
                        Alerts for due dates, high-priority tasks, and pending workflow assignments.
                      </p>
                    </div>

                    {/* System Updates */}
                    <div className="p-3.5 bg-black/40 border border-white/10 rounded-xl space-y-2 flex flex-col justify-between hover:border-[#00E5FF]/30 transition-all">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <Globe size={16} className="text-emerald-400 flex-shrink-0" />
                          <span className="text-xs font-medium text-white font-sans">System & OS Updates</span>
                        </div>
                        <input
                          type="checkbox"
                          checked={preferences.emailSettings.systemUpdates}
                          onChange={(e) =>
                            setPreferences({
                              ...preferences,
                              emailSettings: {
                                ...preferences.emailSettings,
                                systemUpdates: e.target.checked
                              }
                            })
                          }
                          className="w-4 h-4 rounded border-white/20 bg-black text-[#00E5FF] focus:ring-0 cursor-pointer mt-0.5"
                        />
                      </div>
                      <p className="text-[10px] text-gray-400 font-mono leading-relaxed">
                        Notifications when new Krishna Web OS features, updates, or patches are deployed.
                      </p>
                    </div>

                    {/* AI Neural Insights */}
                    <div className="p-3.5 bg-black/40 border border-white/10 rounded-xl space-y-2 flex flex-col justify-between hover:border-[#00E5FF]/30 transition-all md:col-span-2">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <Sparkles size={16} className="text-purple-400 flex-shrink-0" />
                          <span className="text-xs font-medium text-white font-sans">AI & Neural Insights</span>
                        </div>
                        <input
                          type="checkbox"
                          checked={preferences.emailSettings.aiInsights}
                          onChange={(e) =>
                            setPreferences({
                              ...preferences,
                              emailSettings: {
                                ...preferences.emailSettings,
                                aiInsights: e.target.checked
                              }
                            })
                          }
                          className="w-4 h-4 rounded border-white/20 bg-black text-[#00E5FF] focus:ring-0 cursor-pointer mt-0.5"
                        />
                      </div>
                      <p className="text-[10px] text-gray-400 font-mono leading-relaxed">
                        Automated AI recommendations, workflow optimizations, and daily agent activity summaries.
                      </p>
                    </div>
                  </div>

                  {/* Test Dispatch Simulated Email Button */}
                  <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white/5 p-3 rounded-xl border border-white/10">
                    <div className="text-xs font-mono text-gray-400">
                      <span>Test Dispatch Pipeline:</span>
                      <p className="text-[10px] text-gray-500">
                        {preferences.emailNotifications
                          ? `Simulates sending active alerts to ${user.email}`
                          : 'Master notifications disabled'}
                      </p>
                    </div>

                    <button
                      type="button"
                      disabled={testingDispatch || !preferences.emailNotifications}
                      onClick={async () => {
                        setTestingDispatch(true);
                        setDispatchMsg(null);
                        await new Promise((resolve) => setTimeout(resolve, 800));
                        setDispatchMsg(`Test notification dispatched successfully to ${user.email}!`);
                        setTestingDispatch(false);
                      }}
                      className="px-3.5 py-1.5 bg-[#00E5FF]/10 hover:bg-[#00E5FF]/20 border border-[#00E5FF]/40 text-[#00E5FF] rounded-lg text-xs font-mono flex items-center justify-center gap-1.5 transition-all cursor-pointer disabled:opacity-40"
                    >
                      {testingDispatch ? (
                        <>
                          <Loader2 size={13} className="animate-spin" />
                          <span>Dispatching Test...</span>
                        </>
                      ) : (
                        <>
                          <Send size={13} />
                          <span>Dispatch Test Email</span>
                        </>
                      )}
                    </button>
                  </div>

                  {dispatchMsg && (
                    <p className="text-[11px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 p-2.5 rounded-xl flex items-center gap-1.5">
                      <CheckCircle2 size={14} className="flex-shrink-0" />
                      <span>{dispatchMsg}</span>
                    </p>
                  )}
                </div>
              </div>

              {/* Voice Speed Slider */}
              <div className="space-y-2 pt-2 border-t border-white/10">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-gray-300 uppercase">Voice Assistant Playback Rate</span>
                  <span className="text-[#00E5FF] font-bold">{preferences.voiceSpeed.toFixed(1)}x</span>
                </div>
                <input
                  type="range"
                  min="0.5"
                  max="2.0"
                  step="0.1"
                  value={preferences.voiceSpeed}
                  onChange={(e) => setPreferences({ ...preferences, voiceSpeed: parseFloat(e.target.value) })}
                  className="w-full accent-[#00E5FF] cursor-pointer"
                />
              </div>

              {/* Submit Preferences Button */}
              <div className="pt-4 border-t border-white/10 flex justify-end">
                <button
                  type="submit"
                  disabled={savingPrefs}
                  className="px-6 py-2.5 bg-[#00E5FF] hover:bg-[#00E5FF]/90 text-black font-semibold rounded-xl text-xs flex items-center gap-2 transition-all cursor-pointer shadow-[0_0_15px_rgba(0,229,255,0.3)] disabled:opacity-50"
                >
                  {savingPrefs ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      <span>Saving Preferences...</span>
                    </>
                  ) : (
                    <>
                      <Save size={16} />
                      <span>Save All Preferences</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
