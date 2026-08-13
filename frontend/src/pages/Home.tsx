import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Cpu, 
  Brain, 
  Terminal, 
  Zap, 
  ShieldCheck, 
  Activity, 
  Mic, 
  Orbit, 
  Flame, 
  ArrowRight, 
  Compass, 
  Radio,
  LogIn,
  UserPlus,
  User,
  CheckCircle2,
  RefreshCw
} from 'lucide-react';
import { cn } from '../lib/utils';
import { useAuth } from '../context/AuthContext';

export default function Home() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [reactorSpeed, setReactorSpeed] = useState(1);
  const [temperature, setTemperature] = useState(38.2);
  const [outputPower, setOutputPower] = useState(984.5);
  const [systemLoad, setSystemLoad] = useState(14.8);
  const [hasVoiceTriggered, setHasVoiceTriggered] = useState(false);
  const [interactiveGlow, setInteractiveGlow] = useState({ x: 0, y: 0 });
  const [reactorState, setReactorState] = useState<'idle' | 'calibrating' | 'supercharged'>('idle');
  const [speechStatus, setSpeechStatus] = useState('VOICE STANDBY — Say "Hey Krishna, initialize operating system"');
  
  // Futuristic Entrance Animation state
  const [introPhase, setIntroPhase] = useState<'booting' | 'branding' | 'telemetry' | 'ready'>('booting');
  const [introStepText, setIntroStepText] = useState('SYS_INIT: Bootstrapping quantum core...');
  const [bootProgress, setBootProgress] = useState(0);

  const [logText, setLogText] = useState<string[]>([
    "SYS_INIT: Bootstrapping cosmic neural matrix...",
    "COGNITIVE_CORE: Virtual synapses active at 98.4%",
    "MODULE: Neural soundscapes armed with synthesizer core.",
    "SECURITY: SHIELD active defense initialized securely."
  ]);

  // Entrance Sequence Handler
  useEffect(() => {
    let progressInterval: any;
    
    // Step 1: Booting initial core
    playReactorHum(220, 'sine', 0.4);
    
    const t1 = setTimeout(() => {
      setIntroPhase('branding');
      playReactorHum(440, 'triangle', 0.6);
      setIntroStepText('BRAND_ENGAGE: Synchronizing KRISHNA WEB OS Neural Matrix...');
    }, 1200);

    const t2 = setTimeout(() => {
      setIntroPhase('telemetry');
      playReactorHum(660, 'sine', 0.8);
      setIntroStepText('GATEWAY_VERIFY: Calibrating Operator Credentials & Security Protocols...');
    }, 2800);

    const t3 = setTimeout(() => {
      setIntroPhase('ready');
      playReactorHum(880, 'sine', 1.2);
      setIntroStepText('SYSTEM READY: Security Gateway Armed.');
    }, 4500);

    // Boot progress bar driver
    let currentProg = 0;
    progressInterval = setInterval(() => {
      currentProg += Math.floor(Math.random() * 8) + 3;
      if (currentProg >= 100) {
        currentProg = 100;
        clearInterval(progressInterval);
      }
      setBootProgress(currentProg);
    }, 100);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearInterval(progressInterval);
    };
  }, []);

  const replayEntrance = () => {
    setIntroPhase('booting');
    setBootProgress(0);
    setIntroStepText('SYS_INIT: Re-triggering quantum boot sequence...');
    playReactorHum(300, 'triangle', 0.5);

    setTimeout(() => {
      setIntroPhase('branding');
      playReactorHum(520, 'sine', 0.6);
    }, 1000);

    setTimeout(() => {
      setIntroPhase('telemetry');
      playReactorHum(740, 'sine', 0.8);
    }, 2400);

    setTimeout(() => {
      setIntroPhase('ready');
      playReactorHum(960, 'sine', 1.2);
    }, 3800);
  };

  // Update dynamic telemetries
  useEffect(() => {
    const timer = setInterval(() => {
      // Dynamic fluctuating status
      setTemperature(prev => {
        const delta = (Math.random() - 0.5) * 1.2;
        const target = reactorState === 'supercharged' ? 84.4 : reactorState === 'calibrating' ? 55.1 : 38.2;
        return parseFloat((prev + (target - prev) * 0.1 + delta).toFixed(1));
      });
      setOutputPower(prev => {
        const delta = (Math.random() - 0.4) * 8;
        const target = reactorState === 'supercharged' ? 2450.0 : reactorState === 'calibrating' ? 1200.0 : 984.5;
        return parseFloat((prev + (target - prev) * 0.15 + delta).toFixed(1));
      });
      setSystemLoad(prev => {
        const delta = (Math.random() - 0.5) * 1.5;
        const target = reactorState === 'supercharged' ? 88.2 : reactorState === 'calibrating' ? 42.0 : 14.8;
        return parseFloat((prev + (target - prev) * 0.2 + delta).toFixed(1));
      });
    }, 1200);
    return () => clearInterval(timer);
  }, [reactorState]);

  // Mouse Reactive Glow
  const handleMouseMove = (e: React.MouseEvent) => {
    const { clientX, clientY, currentTarget } = e;
    const { left, top, width, height } = currentTarget.getBoundingClientRect();
    const x = ((clientX - left) / width) * 100;
    const y = ((clientY - top) / height) * 100;
    setInteractiveGlow({ x, y });
  };

  // Sound synthesis on reactor trigger
  const playReactorHum = (freq: number, type: OscillatorType = 'triangle', dur: number = 0.4) => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(freq * 1.5, ctx.currentTime + dur);

      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + dur);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + dur);
    } catch (_) {}
  };

  const calibrateMatrix = () => {
    if (reactorState === 'calibrating') return;
    setReactorState('calibrating');
    playReactorHum(440, 'triangle', 0.6);
    addLog("SYS: Initializing hyperdimensional quantum calibrations...");
    
    setTimeout(() => {
      setReactorState('supercharged');
      playReactorHum(720, 'sine', 1.0);
      addLog("SYS: Quantum core supercharged. Reactor synchronization successful.");
    }, 2200);
  };

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogText(prev => [`[${timestamp}] ${message}`, ...prev.slice(0, 5)]);
  };

  // Simulated Web Speech implementation for Homepage Wake Word
  useEffect(() => {
    // @ts-ignore
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognizer = new SpeechRecognition();
      recognizer.continuous = true;
      recognizer.interimResults = true;
      recognizer.lang = 'en-US';

      recognizer.onstart = () => {
        addLog("VOICE: Continuous Speech Wake Listener activated.");
      };

      recognizer.onresult = (event: any) => {
        const transcript = Array.from(event.results)
          .map((res: any) => res[0].transcript)
          .join('')
          .toLowerCase();

        if (transcript.includes('hey krishna') || transcript.includes('initialize operating system') || transcript.includes('launch dashboard') || transcript.includes('activate OS')) {
          setHasVoiceTriggered(true);
          setSpeechStatus('ACCESS GRANTED — Core wake phrase matched. Re-routing...');
          addLog("VOICE COMMAND MATCH: Hey Krishna - OS Activation Triggered.");
          playReactorHum(880, 'sine', 1.5);
          setTimeout(() => {
            navigate('/dashboard');
          }, 1500);
        } else {
          setSpeechStatus(`LISTENING: "${transcript.slice(-45)}..."`);
        }
      };

      try {
        recognizer.start();
      } catch (_) {}

      return () => {
        try {
          recognizer.stop();
        } catch (_) {}
      };
    }
  }, [navigate]);

  return (
    <div 
      onMouseMove={handleMouseMove}
      className={cn(
        "min-h-screen w-full bg-[#02040A] text-white flex flex-col items-center justify-center p-4 sm:p-8 overflow-x-hidden relative transition-all duration-700 select-none pb-12",
        reactorState === 'supercharged' && "bg-[#020b16]",
        hasVoiceTriggered && "scale-[0.98] blur-sm transition-all"
      )}
      style={{
        backgroundImage: 'radial-gradient(rgba(0, 229, 255, 0.03) 1px, transparent 1px)',
        backgroundSize: '30px 30px'
      }}
    >
      {/* FUTURISTIC ENTRANCE OVERLAY & ANIMATION */}
      <AnimatePresence>
        {introPhase !== 'ready' && (
          <motion.div
            key="entrance-overlay"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            transition={{ duration: 0.8, ease: "easeInOut" }}
            className="fixed inset-0 z-50 bg-black/95 backdrop-blur-2xl flex flex-col items-center justify-center p-6 text-center overflow-hidden"
          >
            {/* Ambient Animated Cyber BG Grid */}
            <div 
              className="absolute inset-0 opacity-20 pointer-events-none"
              style={{
                backgroundImage: 'radial-gradient(#00E5FF 1px, transparent 1px), linear-gradient(to right, rgba(0,229,255,0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(0,229,255,0.05) 1px, transparent 1px)',
                backgroundSize: '40px 40px, 20px 20px, 20px 20px'
              }}
            />

            {/* Glowing Orb Backdrop */}
            <div className="absolute w-[500px] h-[500px] bg-[#00E5FF]/10 rounded-full blur-[120px] pointer-events-none animate-pulse" />

            <div className="relative z-10 max-w-lg w-full space-y-8">
              {/* Rotating Holographic Reactor Emblem */}
              <div className="relative w-28 h-28 mx-auto flex items-center justify-center">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
                  className="absolute inset-0 rounded-full border border-dashed border-[#00E5FF]/40 shadow-[0_0_20px_rgba(0,229,255,0.3)]"
                />
                <motion.div
                  animate={{ rotate: -360 }}
                  transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                  className="absolute inset-2 rounded-full border border-t-[#00FF9D] border-b-transparent border-l-transparent border-r-transparent"
                />
                <div className="w-16 h-16 rounded-full bg-black/80 border border-[#00E5FF] flex items-center justify-center shadow-[0_0_25px_rgba(0,229,255,0.5)]">
                  <Cpu className="text-[#00E5FF] animate-pulse" size={32} />
                </div>
              </div>

              {/* KRISHNA WEB OS BRANDING TYPOGRAPHY */}
              <div className="space-y-2">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
                >
                  <span className="px-3 py-1 bg-[#00E5FF]/10 border border-[#00E5FF]/30 text-[#00E5FF] text-[10px] font-mono tracking-widest rounded-full uppercase">
                    QUANTUM NEURAL OPERATING SYSTEM v4.12
                  </span>
                </motion.div>

                <motion.h1
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                  className="text-3xl sm:text-5xl font-black font-mono tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-white via-[#00E5FF] to-[#00FF9D] drop-shadow-[0_0_25px_rgba(0,229,255,0.6)]"
                >
                  KRISHNA WEB OS
                </motion.h1>

                <p className="text-xs text-gray-400 font-mono tracking-wide max-w-sm mx-auto">
                  {introStepText}
                </p>
              </div>

              {/* Progress Bar & Telemetry Indicator */}
              <div className="space-y-2 max-w-xs mx-auto">
                <div className="flex justify-between text-[10px] font-mono text-gray-400">
                  <span>BOOT MATRIX</span>
                  <span className="text-[#00E5FF] font-bold">{bootProgress}%</span>
                </div>
                <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden p-0.5 border border-white/10">
                  <motion.div
                    className="h-full bg-gradient-to-r from-[#00E5FF] to-[#00FF9D] rounded-full shadow-[0_0_10px_#00E5FF]"
                    style={{ width: `${bootProgress}%` }}
                  />
                </div>
              </div>

              {/* Skip Entrance Overlay CTA */}
              <div>
                <button
                  onClick={() => setIntroPhase('ready')}
                  className="px-4 py-1.5 bg-white/5 hover:bg-white/10 border border-white/15 text-gray-400 hover:text-white rounded-full text-[11px] font-mono transition-all cursor-pointer"
                >
                  Skip Boot Sequence →
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Absolute Cinematic Glowing Accents */}
      <div 
        className="absolute inset-0 z-0 pointer-events-none transition-all duration-500 ease-out"
        style={{
          background: `radial-gradient(600px circle at ${interactiveGlow.x}% ${interactiveGlow.y}%, rgba(0, 229, 255, 0.08) 0%, transparent 80%)`
        }}
      />

      {/* Top Banner Indicator */}
      <div className="absolute top-6 left-6 right-6 flex flex-col sm:flex-row items-center justify-between gap-4 z-20 border-b border-white/5 pb-4">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Cpu className="w-8 h-8 text-[#00E5FF] animate-pulse" />
            <div className="absolute inset-0 bg-[#00E5FF] blur-md opacity-40 rounded-full"></div>
          </div>
          <div>
            <span className="font-mono text-sm font-black tracking-widest text-[#00E5FF] block">KRISHNA OS v4.12</span>
            <span className="text-[9px] font-mono text-gray-500 uppercase tracking-widest block">Quantum Neural Intelligence Core</span>
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs font-mono">
          <div className="hidden sm:flex items-center gap-1.5 text-gray-400">
            <Radio size={12} className="text-[#00FF9D] animate-pulse" />
            <span>REACTOR HARMONY: <span className="text-[#00FF9D] font-bold">STABLE</span></span>
          </div>
          
          <div className="w-px h-4 bg-white/10 hidden sm:block"></div>

          {/* Auth Action Buttons */}
          {user ? (
            <Link
              to="/login"
              className="flex items-center gap-2 px-3 py-1.5 bg-[#00E5FF]/10 hover:bg-[#00E5FF]/20 border border-[#00E5FF]/40 rounded-full text-xs font-mono text-[#00E5FF] transition-all"
            >
              <User size={13} />
              <span>{user.displayName || user.email || 'Operator Profile'}</span>
            </Link>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                to="/login"
                className="px-3.5 py-1.5 bg-[#00E5FF] hover:bg-[#00E5FF]/90 text-black font-semibold rounded-full text-xs flex items-center gap-1.5 transition-all shadow-[0_0_15px_rgba(0,229,255,0.4)] cursor-pointer"
              >
                <LogIn size={13} />
                <span>Sign In</span>
              </Link>
              <Link
                to="/register"
                className="px-3.5 py-1.5 bg-white/5 hover:bg-white/10 border border-white/20 text-gray-200 hover:text-white font-medium rounded-full text-xs flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <UserPlus size={13} />
                <span>Register</span>
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Space grid content container */}
      <div className="max-w-6xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-center z-10 mt-16 sm:mt-8">
        
        {/* LEFT COLUMN: Floating Holographic Command Information Panel */}
        <div className="lg:col-span-4 space-y-4 order-2 lg:order-1 flex flex-col justify-center">
          
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="p-5 rounded-2xl bg-black/50 border border-white/5 backdrop-blur-md relative overflow-hidden group"
          >
            <div className="absolute -inset-1 bg-gradient-to-r from-[#00E5FF]/20 to-transparent blur-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
            <h3 className="text-xs font-mono text-[#00E5FF] font-bold uppercase tracking-widest flex items-center gap-2 mb-3">
              <Activity size={14} /> SYSTEM ENVIRONMENT
            </h3>
            <div className="space-y-2 font-mono text-[10px]">
              <div className="flex justify-between border-b border-white/5 pb-1">
                <span className="text-gray-500 uppercase">Operating Mode</span>
                <span className="text-[#00FF9D] font-bold uppercase">{reactorState} MODE</span>
              </div>
              <div className="flex justify-between border-b border-white/5 pb-1">
                <span className="text-gray-500 uppercase">Core Calibrations</span>
                <span className="text-gray-300">Synchronized (98.6%)</span>
              </div>
              <div className="flex justify-between border-b border-white/5 pb-1">
                <span className="text-gray-500 uppercase">CO_OPS Latency</span>
                <span className="text-[#00E5FF]">3.4 ms realtime</span>
              </div>
              <div className="flex justify-between pb-1">
                <span className="text-gray-500 uppercase">Ambient Sound</span>
                <span className="text-gray-400">Synthesizer Core Engine</span>
              </div>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="p-5 rounded-2xl bg-black/50 border border-white/5 backdrop-blur-md relative"
          >
            <h3 className="text-xs font-mono text-cyan-400 font-bold uppercase tracking-widest flex items-center gap-2 mb-3">
              <Flame size={14} className="text-amber-500" /> COR SUBSYSTEM ENERGY
            </h3>
            <div className="grid grid-cols-3 gap-2 text-center text-xs font-mono">
              <div className="bg-white/5 p-2 rounded-lg border border-white/5">
                <span className="text-[8px] text-gray-500 block mb-1">CPU HEAT</span>
                <span className="text-white font-bold">{temperature}°C</span>
              </div>
              <div className="bg-white/5 p-2 rounded-lg border border-white/5">
                <span className="text-[8px] text-gray-500 block mb-1">MASS VOLTS</span>
                <span className="text-white font-bold">{outputPower}W</span>
              </div>
              <div className="bg-white/5 p-2 rounded-lg border border-white/5">
                <span className="text-[8px] text-gray-500 block mb-1">LOAD INDEX</span>
                <span className="text-white font-bold">{systemLoad}%</span>
              </div>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="p-4 rounded-2xl bg-[#00FF9D]/5 border border-[#00FF9D]/15 backdrop-blur-md text-[10px] font-mono leading-relaxed text-[#00FF9D]/90 flex items-start gap-2.5"
          >
            <ShieldCheck size={16} className="text-[#00FF9D] shrink-0 mt-0.5" />
            <div>
              <span className="font-bold uppercase block tracking-wider mb-0.5">SHIELD PROTOCOL OPERATIONAL</span>
              All active networks and automated peripheral tasks are verified secure under encrypted localized firewalls.
            </div>
          </motion.div>

        </div>

        {/* MIDDLE COLUMN: Reactor Core Visualization Center */}
        <div className="lg:col-span-4 flex flex-col items-center justify-center order-1 lg:order-2 py-4">
          
          {/* Concentric Rotating Outer Circles */}
          <div className="relative w-72 h-72 sm:w-80 sm:h-80 flex items-center justify-center pointer-events-auto">
            
            {/* outer orbital particle trail */}
            <motion.div 
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 40, ease: 'linear' }}
              className="absolute inset-0 rounded-full border border-dashed border-[#00E5FF]/20 flex items-center justify-center"
            >
              <div className="absolute w-2.5 h-2.5 bg-[#00E5FF] rounded-full top-0 shadow-[0_0_12px_#00E5FF]"></div>
            </motion.div>

            {/* glowing secondary orbit ring */}
            <motion.div 
              animate={{ rotate: -360 }}
              transition={{ repeat: Infinity, duration: 24, ease: 'linear' }}
              className="absolute w-[82%] h-[82%] rounded-full border border-[#00FF9D]/10 flex items-center justify-center"
            >
              <div className="absolute w-1.5 h-1.5 bg-[#00FF9D] rounded-full bottom-0 shadow-[0_0_10px_#00FF9D]"></div>
            </motion.div>

            {/* main speed dependent glowing circle */}
            <motion.div 
              animate={{ rotate: 360 }}
              transition={{ 
                repeat: Infinity, 
                duration: reactorState === 'supercharged' ? 3 : reactorState === 'calibrating' ? 6 : 15, 
                ease: 'linear' 
              }}
              className="absolute w-[66%] h-[66%] rounded-full border border-t-[#00E5FF] border-r-[#00E5FF]/40 border-l-[#00E5FF]/20 border-b-transparent flex items-center justify-center"
            />

            {/* Animated glowing central matrix core */}
            <motion.button 
              onClick={calibrateMatrix}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={cn(
                "absolute w-[45%] h-[45%] rounded-full bg-black/95 border-2 flex flex-col items-center justify-center cursor-pointer shadow-inner relative focus:outline-none focus:ring-2 focus:ring-[#00E5FF]",
                reactorState === 'supercharged' ? "border-[#00FF9D] shadow-[0_0_40px_rgba(0,255,157,0.45)]" : "border-[#00E5FF]/40 shadow-[0_0_30px_rgba(0,229,255,0.3)]",
                "transition-all duration-500"
              )}
            >
              <Brain 
                size={34} 
                className={cn(
                  "mb-1.5 transition-colors duration-500",
                  reactorState === 'supercharged' ? "text-[#00FF9D]" : "text-[#00E5FF] animate-pulse"
                )} 
              />
              <span className="text-[9px] font-mono font-black tracking-widest text-[#00E5FF] uppercase block">
                {reactorState === 'supercharged' ? 'ACTIVE' : reactorState === 'calibrating' ? 'CALIBRATING' : 'STANDBY'}
              </span>
              <span className="text-[7px] font-mono text-gray-500 uppercase tracking-widest block px-1 mt-0.5">
                Tap to Calibrate
              </span>

              {/* internal scanning core bar */}
              <div className="absolute w-full h-0.5 bg-cyan-400/20 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded animate-bounce"></div>
            </motion.button>
          </div>

          <div className="text-center mt-3 space-y-4">
            <h2 className="text-2xl font-light font-mono tracking-widest leading-none text-white">
              KRISHNA<span className="text-[#00E5FF] font-bold">OS</span>_REACTOR
            </h2>
            <p className="text-xs text-gray-400 font-sans max-w-xs leading-normal mx-auto">
              A conscious, responsive cybernetic command intelligence linking multi-agent systems and diagnostics.
            </p>

            {/* Futuristic Entrance & Auth Gateway Options */}
            <motion.div 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="p-5 bg-black/60 border border-[#00E5FF]/30 rounded-2xl backdrop-blur-xl space-y-3.5 max-w-sm mx-auto relative overflow-hidden shadow-[0_0_30px_rgba(0,229,255,0.15)]"
            >
              <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#00E5FF] to-transparent" />
              
              <div className="flex items-center justify-between text-[10px] font-mono border-b border-white/10 pb-2">
                <span className="text-[#00E5FF] font-bold uppercase tracking-wider flex items-center gap-1.5">
                  <ShieldCheck size={12} /> OS ENTRANCE GATEWAY
                </span>
                <span className="text-gray-500">{user ? 'OPERATOR ACTIVE' : 'AUTH REQUIRED'}</span>
              </div>

              {user ? (
                <div className="space-y-2.5">
                  <p className="text-xs font-mono text-emerald-400 flex items-center justify-center gap-1.5">
                    <CheckCircle2 size={14} />
                    <span>Welcome back, {user.displayName || user.email}</span>
                  </p>
                  <button
                    onClick={() => {
                      playReactorHum(880, 'sine', 0.8);
                      navigate('/dashboard');
                    }}
                    className="w-full py-2.5 bg-[#00E5FF] hover:bg-[#00E5FF]/90 text-black font-semibold rounded-xl text-xs font-mono flex items-center justify-center gap-2 transition-all shadow-[0_0_15px_rgba(0,229,255,0.4)] cursor-pointer"
                  >
                    <span>LAUNCH OS COMMAND HUD</span>
                    <ArrowRight size={14} />
                  </button>
                </div>
              ) : (
                <div className="space-y-2.5">
                  <p className="text-[11px] text-gray-300 font-mono">
                    Select your access pathway to enter Krishna Web OS:
                  </p>

                  <div className="grid grid-cols-2 gap-2.5">
                    <Link
                      to="/login"
                      className="py-2.5 px-3 bg-[#00E5FF] hover:bg-[#00E5FF]/90 text-black font-semibold rounded-xl text-xs font-mono flex items-center justify-center gap-1.5 transition-all shadow-[0_0_15px_rgba(0,229,255,0.35)] cursor-pointer"
                    >
                      <LogIn size={13} />
                      <span>Sign In</span>
                    </Link>

                    <Link
                      to="/register"
                      className="py-2.5 px-3 bg-white/5 hover:bg-white/10 border border-white/20 text-white font-medium rounded-xl text-xs font-mono flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                    >
                      <UserPlus size={13} />
                      <span>Register</span>
                    </Link>
                  </div>
                </div>
              )}

              <div className="pt-1 flex items-center justify-between border-t border-white/10 text-[9px] font-mono text-gray-500">
                <span>BOOT VER: 4.12.0</span>
                <button
                  type="button"
                  onClick={replayEntrance}
                  className="text-[#00E5FF] hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <RefreshCw size={10} />
                  <span>Replay Entrance Animation</span>
                </button>
              </div>
            </motion.div>
          </div>

        </div>

        {/* RIGHT COLUMN: Interactive Terminal Operations Logs */}
        <div className="lg:col-span-4 space-y-4 order-3 flex flex-col justify-center">

          <motion.div 
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="p-5 rounded-2xl bg-black/50 border border-white/5 backdrop-blur-md relative h-48 flex flex-col"
          >
            <h3 className="text-xs font-mono text-[#A78BFA] font-bold uppercase tracking-widest flex items-center gap-2 mb-3 pb-2 border-b border-white/5">
              <Terminal size={14} /> LIVE REACTION JOURNAL
            </h3>
            <div className="flex-1 overflow-y-auto space-y-2.5 font-mono text-[8.5px] text-gray-300 pr-1 scrollbar-thin">
              {logText.map((l, idx) => (
                <div key={idx} className="leading-normal flex gap-1.5 border-l border-white/10 pl-1.5">
                  <span className="text-gray-600 font-bold">»</span>
                  <span>{l}</span>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="p-5 rounded-2xl bg-gradient-to-br from-black/80 to-cyan-950/20 border border-cyan-500/10 backdrop-blur-md relative overflow-hidden group"
          >
            <div className="absolute top-2 right-2 flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00FF9D] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#00FF9D]"></span>
            </div>
            
            <h3 className="text-xs font-mono text-[#00FF9D] font-bold uppercase tracking-widest flex items-center gap-1.5 mb-2.5">
              <Mic size={14} className="text-[#00FF9D] animate-pulse" />
              VOICE INTEGRATION BRIDGE
            </h3>
            <p className="text-[10px] font-mono text-gray-400 leading-normal mb-2">
              Say <span className="text-[#00E5FF] font-bold">"Hey Krishna"</span> or <span className="text-[#00E5FF] font-bold">"Initialize operating system"</span> out loud to auto-nav.
            </p>
            <div className="bg-black/40 border border-white/5 rounded-lg p-2.5 text-[9px] font-mono text-[#00FF9D] select-all truncate">
              {speechStatus}
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="p-4 rounded-2xl bg-[#00E5FF]/5 border border-[#00E5FF]/15 backdrop-blur-md text-[10px] font-mono leading-relaxed text-gray-400 flex items-start gap-2.5"
          >
            <Compass size={16} className="text-[#00E5FF] shrink-0 mt-0.5" />
            <div>
              <span className="font-bold uppercase block tracking-wider mb-0.5 text-gray-300">SYSTEM ARCHITECTURE</span>
              Built on hierarchical microservices syncing multi-agent AI vectors, telemetry streams, and WebRTC protocols.
            </div>
          </motion.div>

        </div>

      </div>

      {/* Decorative Outer Cyber Rings & Coordinate Telemetries */}
      <div className="absolute bottom-6 left-6 font-mono text-[9px] text-gray-600 select-none hidden sm:block">
        CORE_COORDINATE: 43.125°N // 142.008°E
      </div>
      <div className="absolute bottom-6 right-6 font-mono text-[9px] text-gray-600 select-none hidden sm:block">
        RUNTIME_STATUS: LOCALIZED_CONTAINER_SANDBOX // PORT: 3000
      </div>

    </div>
  );
}
