import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Fingerprint, Lock, Unlock, ShieldCheck } from 'lucide-react';
import { cn } from '../lib/utils';

interface BiometricLockProps {
  onLockComplete?: () => void;
  onScanAttempt?: (outcome: 'success' | 'failed' | 'aborted') => void;
  playSfx?: (freq: number, type: OscillatorType, duration: number) => void;
}

export function BiometricLock({ onLockComplete, onScanAttempt, playSfx }: BiometricLockProps) {
  const [locked, setLocked] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);

  const startScan = () => {
    if (locked) {
      setLocked(false);
      if (playSfx) playSfx(880, 'sine', 0.15); // Unlock sound
      return;
    }

    setScanning(true);
    setScanProgress(0);
    
    // Haptic feedback if supported
    if ('vibrate' in navigator) {
      navigator.vibrate([50, 50, 50]);
    }

    if (playSfx) playSfx(220, 'square', 0.1); 

    let progress = 0;
    const interval = setInterval(() => {
      progress += 10;
      setScanProgress(progress);
      
      // Ongoing scanning sound
      if (progress % 30 === 0 && playSfx) {
         playSfx(440 + progress * 2, 'sawtooth', 0.05);
      }

      if (progress >= 100) {
        clearInterval(interval);
        setScanning(false);
        setLocked(true);
        if ('vibrate' in navigator) {
          navigator.vibrate([100, 50, 100]);
        }
        if (playSfx) playSfx(1200, 'sine', 0.2); // Success sound
        if (onLockComplete) onLockComplete();
        if (onScanAttempt) onScanAttempt('success');
      }
    }, 150);
  };

  const cancelScan = () => {
    if (scanning && scanProgress < 100) {
      setScanning(false);
      setScanProgress(0);
      if (onScanAttempt) onScanAttempt('aborted');
      if (playSfx) playSfx(100, 'sawtooth', 0.2); // Failure sound
    }
  };

  return (
    <div className="glass-panel p-6 flex flex-col items-center justify-center relative overflow-hidden group w-full">
      <div className={cn(
        "absolute inset-0 bg-gradient-to-t opacity-10 transition-colors duration-500 rounded-xl",
        locked ? "from-[#00FF9D] to-transparent" : scanning ? "from-cyan-500 to-transparent" : "from-gray-800 to-transparent"
      )} />
      
      <div className="z-10 flex flex-col items-center gap-6">
        <h3 className="text-sm font-mono tracking-widest text-cyan-400 font-bold uppercase">
          {locked ? 'Guardian Locked' : scanning ? 'Biometric Sequence' : 'System Access'}
        </h3>

        <div className="relative">
          <button
            onPointerDown={startScan}
            onPointerUp={cancelScan}
            onPointerLeave={cancelScan}
            className={cn(
              "w-28 h-28 rounded-full border-2 flex items-center justify-center transition-all cursor-pointer relative",
              locked 
                ? "border-[#00FF9D] bg-[#00FF9D]/10 text-[#00FF9D] shadow-[0_0_30px_rgba(0,255,157,0.3)]" 
                : scanning
                  ? "border-cyan-500 text-cyan-400 bg-cyan-500/10 shadow-[0_0_20px_rgba(0,229,255,0.4)]"
                  : "border-gray-600 text-gray-500 hover:border-cyan-500/50 hover:text-cyan-500 bg-black/50"
            )}
          >
            <AnimatePresence mode="wait">
              {locked ? (
                <motion.div
                  key="locked"
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  exit={{ scale: 0 }}
                  className="flex flex-col items-center gap-1"
                >
                  <Lock size={36} />
                </motion.div>
              ) : (
                <motion.div
                  key="unlocked"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                  className="relative"
                >
                  <Fingerprint size={48} className={cn(scanning && "animate-pulse")} />
                  {/* Scan line overlay */}
                  {scanning && (
                    <motion.div
                      className="absolute inset-0 border-t-2 border-cyan-400 w-full"
                      animate={{ y: [0, 48, 0] }}
                      transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                      style={{ height: '2px', top: 0, 
                        boxShadow: '0 0 10px rgba(0,229,255,0.8), 0 0 20px rgba(0,229,255,0.4)' 
                      }}
                    />
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Circular progress SVG */}
            {scanning && !locked && (
              <svg className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none">
                <circle
                  cx="56"
                  cy="56"
                  r="54"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="text-gray-800"
                />
                <circle
                  cx="56"
                  cy="56"
                  r="54"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeDasharray={`${2 * Math.PI * 54}`}
                  strokeDashoffset={`${2 * Math.PI * 54 * (1 - scanProgress / 100)}`}
                  className="text-cyan-400 drop-shadow-[0_0_10px_rgba(0,229,255,0.8)] transition-all duration-150 ease-linear"
                />
              </svg>
            )}
          </button>
        </div>

        <div className="flex flex-col items-center gap-1 text-center min-h-[40px]">
          <p className={cn(
            "text-xs font-mono tracking-wider transition-colors",
            locked ? "text-[#00FF9D]" : scanning ? "text-cyan-400" : "text-gray-500"
          )}>
            {locked ? 'SYSTEM SECURED' : scanning ? `VERIFYING DNA... ${scanProgress}%` : 'HOLD TO LOCK TERMINAL'}
          </p>
          <div className="flex items-center gap-2 text-[9px] text-gray-500 font-sans">
            <ShieldCheck size={10} />
            AES-256 ENCRYPTION
          </div>
        </div>
      </div>
    </div>
  );
}
