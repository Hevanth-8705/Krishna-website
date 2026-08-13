import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSystemStore } from '../store/system';
import { Activity, Bell, Settings, Moon, Sun, Ear, Search, LogIn, UserPlus, User } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'motion/react';
import { AdminDiagnostics } from './AdminDiagnostics';

export function Header() {
  const navigate = useNavigate();
  const { isCoreOnline, threatLevel, isClapDetectionActive } = useSystemStore();
  const { theme, toggleTheme } = useTheme();
  const { user, isEmailVerified } = useAuth();
  const [showSettingsModal, setShowSettingsModal] = useState(false);

  return (
    <header className="h-16 border-b border-[#00E5FF]/10 glass-panel border-x-0 border-t-0 rounded-none px-4 md:px-8 flex items-center justify-between z-20">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${isCoreOnline ? 'bg-[#00FF9D] neural-glow-green' : 'bg-red-500'} animate-pulse`}></div>
          <span className="text-xs font-mono text-gray-400 tracking-wider">
            {isCoreOnline ? 'CORE_ONLINE' : 'CORE_OFFLINE'}
          </span>
        </div>
        
        <div className="hidden md:flex items-center gap-2 ml-4">
          <Activity className="w-4 h-4 text-[#00E5FF]/60" />
          <span className="text-xs font-mono text-gray-400">PULSE: STABLE</span>
        </div>

        {isClapDetectionActive && (
          <div className="hidden sm:flex items-center gap-2 ml-4 bg-[#00FF9D]/10 border border-[#00FF9D]/30 px-3 py-1 rounded-full animate-pulse shadow-[0_0_10px_rgba(0,255,157,0.2)]">
            <Ear className="w-3.5 h-3.5 text-[#00FF9D]" />
            <span className="text-[10px] font-mono text-[#00FF9D] font-bold tracking-wider uppercase">Listening Mode</span>
          </div>
        )}

        <button 
          onClick={() => window.dispatchEvent(new CustomEvent('open-command-palette'))}
          className="hidden lg:flex items-center gap-2.5 ml-4 bg-white/5 hover:bg-white/10 border border-white/10 px-3.5 py-1.5 rounded-full text-[10px] font-mono text-gray-400 hover:text-white transition-all cursor-pointer"
        >
          <Search size={12} className="text-[#00E5FF] animate-pulse" />
          <span className="opacity-70">SYSTEM CORE SEARCH:</span>
          <span className="bg-black/45 border border-white/10 px-1.5 py-0.5 rounded text-white/95 text-[9px]">Ctrl+K</span>
        </button>
      </div>

      <div className="flex items-center gap-4">
        {threatLevel !== 'LOW' && (
          <div className="bg-[#FF3B3B]/10 text-[#FF3B3B] px-3 py-1 rounded-full text-xs font-bold font-mono border border-[#FF3B3B]/30 animate-pulse">
            THREAT: {threatLevel}
          </div>
        )}
        
        {/* Premium Core Visibility Switcher */}
        <div className="flex items-center bg-black/40 border border-white/10 rounded-full p-0.5 relative select-none">
          <button
            onClick={() => { if (theme !== 'deep-space') toggleTheme(); }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] uppercase font-bold tracking-wider transition-all duration-300 relative z-10 ${
              theme === 'deep-space' ? 'text-[#00E5FF]' : 'text-gray-400 hover:text-white'
            }`}
            title="Deep Space Theme (Implicit Ambient Midnight)"
          >
            <Moon className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Deep Space</span>
            {theme === 'deep-space' && (
              <motion.div
                layoutId="active-theme-bg"
                className="absolute inset-0 bg-[#00E5FF]/10 border border-[#00E5FF]/20 rounded-full -z-10 shadow-[0_0_12px_rgba(0,229,255,0.2)]"
                transition={{ type: "spring", stiffness: 380, damping: 30 }}
              />
            )}
          </button>
          
          <button
            onClick={() => { if (theme !== 'cyber-light') toggleTheme(); }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] uppercase font-bold tracking-wider transition-all duration-300 relative z-10 ${
              theme === 'cyber-light' ? 'text-amber-400' : 'text-gray-400 hover:text-white'
            }`}
            title="Cyber-Light Theme (High-Contrast Visibility)"
          >
            <Sun className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Cyber-Light</span>
            {theme === 'cyber-light' && (
              <motion.div
                layoutId="active-theme-bg"
                className="absolute inset-0 bg-amber-400/10 border border-amber-400/20 rounded-full -z-10 shadow-[0_0_12px_rgba(245,158,11,0.25)]"
                transition={{ type: "spring", stiffness: 380, damping: 30 }}
              />
            )}
          </button>
        </div>

        <button className="relative p-2 text-gray-400 hover:text-white transition-colors">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#00E5FF] rounded-full neural-glow"></span>
        </button>
        
        <button 
          onClick={() => setShowSettingsModal(true)}
          className="p-2 text-gray-400 hover:text-white transition-colors cursor-pointer"
          title="Open KRISHNA_OS Admin & SMTP Settings"
        >
          <Settings className="w-5 h-5" />
        </button>

        {/* User Profile / Auth State CTA */}
        {user ? (
          <Link
            to="/profile"
            className="flex items-center gap-2 pl-2 pr-3 py-1 bg-white/5 hover:bg-white/10 border border-[#00E5FF]/30 rounded-full transition-all group"
            title="User Profile & Auth Options"
          >
            <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-[#00E5FF] to-blue-600 p-[1px]">
              <div className="w-full h-full bg-krishna-bg rounded-full flex items-center justify-center overflow-hidden">
                {user.photoURL ? (
                  <img src={user.photoURL} alt="User Avatar" className="w-full h-full object-cover" />
                ) : (
                  <User size={14} className="text-[#00E5FF]" />
                )}
              </div>
            </div>
            <div className="hidden sm:flex flex-col text-left leading-tight">
              <span className="text-[11px] font-semibold text-white font-sans max-w-[100px] truncate">
                {user.displayName || 'Operator'}
              </span>
              <span className="text-[9px] font-mono text-[#00E5FF]">
                {isEmailVerified ? 'VERIFIED' : 'UNVERIFIED'}
              </span>
            </div>
          </Link>
        ) : (
          <div className="flex items-center gap-2">
            <Link
              to="/login"
              className="px-3.5 py-1.5 bg-[#00E5FF] hover:bg-[#00E5FF]/90 text-black font-semibold rounded-full text-xs flex items-center gap-1.5 transition-all shadow-[0_0_12px_rgba(0,229,255,0.3)] cursor-pointer"
            >
              <LogIn size={13} />
              <span>Sign In</span>
            </Link>
            <Link
              to="/register"
              className="hidden sm:flex px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/15 text-gray-200 hover:text-white font-medium rounded-full text-xs items-center gap-1.5 transition-all cursor-pointer"
            >
              <UserPlus size={13} />
              <span>Register</span>
            </Link>
          </div>
        )}
      </div>

      {/* Admin Settings & SMTP Diagnostic Modal */}
      <AnimatePresence>
        {showSettingsModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-hidden">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/80 backdrop-blur-md"
              onClick={() => setShowSettingsModal(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative w-full max-w-3xl z-10"
            >
              <AdminDiagnostics onClose={() => setShowSettingsModal(false)} />
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </header>
  );
}
