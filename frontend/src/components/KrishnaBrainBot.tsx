import { useState, useRef, useEffect, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  motion, 
  AnimatePresence 
} from 'motion/react';
import { 
  X, 
  Brain, 
  Send, 
  Sparkles, 
  Bot, 
  User, 
  Activity, 
  Trash2, 
  Volume2, 
  VolumeX, 
  Mic,
  Ear,
  ShieldCheck,
  Clock,
  Terminal
} from 'lucide-react';
import { cn } from '../lib/utils';
import { useSystemStore } from '../store/system';
import { useClapDetection } from '../hooks/useClapDetection';
import { useKrishnaVoice } from '../hooks/useKrishnaVoice';
import { MatrixRain } from './MatrixRain';
import { TypewriterText } from './TypewriterText';

interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  emotion?: string;
  timestamp: string;
}

export default function KrishnaBrainBot() {
  const navigate = useNavigate();
  const { securityIntegrity, setSystemMetrics, clapSensitivity, clapCooldown, clapPulseMode } = useSystemStore();
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [currentSystemLoad, setCurrentSystemLoad] = useState('0.14');
  const [clapPulse, setClapPulse] = useState(false);
  const [integrityHistory, setIntegrityHistory] = useState<number[]>(Array(60).fill(100));
  const [matrixMode, setMatrixMode] = useState(false);

  // Unified voice hook integration
  const {
    isListening: isVoiceListening,
    transcript: voiceTranscript,
    response: voiceResponse,
    startListening: startVoiceListening,
    stopListening: stopVoiceListening
  } = useKrishnaVoice(navigate);

  // Sync voice transcript into input
  useEffect(() => {
    if (voiceTranscript && isVoiceListening) {
      setInput(voiceTranscript);
    }
  }, [voiceTranscript, isVoiceListening]);

  // When voice produces a response, append to chat feed
  useEffect(() => {
    if (voiceResponse) {
      setMessages(prev => [
        ...prev,
        {
          role: 'model',
          text: voiceResponse,
          emotion: 'Voice Directive',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    }
  }, [voiceResponse]);

  useEffect(() => {
    const interval = setInterval(() => {
      setIntegrityHistory(prev => {
        const jitter = (Math.random() * 2 - 1);
        const val = Math.max(0, Math.min(100, securityIntegrity === 100 ? 100 - Math.abs(jitter) : securityIntegrity + jitter));
        return [...prev.slice(1), val];
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [securityIntegrity]);

  const { isListening: isClapListening, startListening: startClapDetection, stopListening: stopClapDetection, getAudioData } = useClapDetection(() => {
    setClapPulse(true);
    setTimeout(() => setClapPulse(false), 800);

    setIsOpen(true);
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance("Welcome, sir!");
      utterance.volume = 1.0;
      utterance.pitch = 0.8;
      utterance.rate = 0.9;
      window.speechSynthesis.speak(utterance);
    }
    
    setMessages(prev => [...prev, {
      role: 'model',
      text: "⚡ [CLAP DETECTED] Welcome, sir!",
      emotion: 'Alert',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }]);
  });

  useEffect(() => {
    setSystemMetrics({ isClapDetectionActive: isClapListening });
  }, [isClapListening, setSystemMetrics]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const waveformCanvasRef = useRef<HTMLCanvasElement>(null);
  const signalRef = useRef<HTMLSpanElement>(null);

  // Audio Visualization Loop
  useEffect(() => {
    let animationFrameId: number;

    const renderWaveform = () => {
      if (!isOpen) return;

      const canvas = waveformCanvasRef.current;
      if (!canvas) {
        animationFrameId = requestAnimationFrame(renderWaveform);
        return;
      }

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        animationFrameId = requestAnimationFrame(renderWaveform);
        return;
      }

      const audioData = getAudioData();
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (isClapListening && audioData) {
        ctx.lineWidth = 2;
        ctx.strokeStyle = 'rgba(0, 255, 157, 0.4)';
        
        let sum = 0;
        for (let i = 0; i < audioData.length; i++) {
          sum += audioData[i];
        }
        const average = sum / audioData.length;
        if (signalRef.current) {
          const db = -100 + (average / 255) * 70;
          signalRef.current.textContent = `${db.toFixed(1)} dB`;
        }

        const sliceWidth = canvas.width / (audioData.length / 2);
        let x = 0;
        const centerY = canvas.height / 2;

        for (let i = 0; i < audioData.length / 2; i++) {
          const v = audioData[i] / 255.0;
          const amplitude = v * (canvas.height / 2.5);
          
          if (amplitude > 1) {
            ctx.beginPath();
            ctx.moveTo(x, centerY - amplitude);
            ctx.lineTo(x, centerY + amplitude);
            ctx.stroke();
          }

          x += sliceWidth;
        }
      }

      animationFrameId = requestAnimationFrame(renderWaveform);
    };

    if (isOpen) {
      renderWaveform();
    }

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [getAudioData, isClapListening, isOpen]);

  const toggleListening = () => {
    if (isVoiceListening) {
      stopVoiceListening();
    } else {
      startVoiceListening();
    }
  };

  // Initialize with greeting
  useEffect(() => {
    const greetingMsg: ChatMessage = {
      role: 'model',
      text: "Greetings, Operator. I am the KRISHNA OS Intelligence Advisor - the conscious core of this virtual machine. I monitor live system telemetry, neural soundscapes, vector archives, and memory vaults.\n\nHow may I optimize your system parameters today?",
      emotion: 'Conscious',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    
    const savedLogs = localStorage.getItem('krishna_brain_support_logs');
    if (savedLogs) {
      try {
        setMessages(JSON.parse(savedLogs));
      } catch (e) {
        setMessages([greetingMsg]);
      }
    } else {
      setMessages([greetingMsg]);
    }
  }, []);

  // Save chat logs when updated
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem('krishna_brain_support_logs', JSON.stringify(messages));
    }
  }, [messages]);

  const speakSystemResponse = (text: string) => {
    if (!('speechSynthesis' in window)) return;
    const cleanText = text.replace(/[*_~`\[\]#]/g, '').trim();
    if (!cleanText) return;
    
    window.speechSynthesis.cancel();
    
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.volume = 1.0;
    utterance.pitch = 0.9;
    utterance.rate = 1.0;
    
    const voices = window.speechSynthesis.getVoices();
    const naturalVoice = voices.find(v => v.lang.includes('en') && (v.name.includes('Female') || v.name.includes('Google') || v.name.includes('Samantha')));
    if (naturalVoice) utterance.voice = naturalVoice;

    window.speechSynthesis.speak(utterance);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const playFeedbackSound = (frequency: number, type: OscillatorType = 'sine', duration: number = 0.08) => {
    if (!soundEnabled) return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = type;
      osc.frequency.setValueAtTime(frequency, ctx.currentTime);
      
      gain.gain.setValueAtTime(0.04, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch (e) {
      console.warn("Audio Context init disabled.");
    }
  };

  const handleToggle = () => {
    const nextState = !isOpen;
    setIsOpen(nextState);
    if (nextState) {
      playFeedbackSound(600, 'triangle', 0.12);
    } else {
      playFeedbackSound(400, 'sine', 0.08);
    }
  };

  const suggestionPrompts = [
    { label: "🔒 System Threat Audit", text: "Perform an intelligence threat logging analysis of the active system core." },
    { label: "🔋 Power Strategy", text: "Evaluate power conservation profiles and recommend an optimal duty cycle pattern." },
    { label: "🗺️ Heatmap Diagnostic Guide", text: "Explain how to interpret the system diagnostics and network spectrum heatmap grid." },
    { label: "🧠 How Vector Archives Work", text: "Explain the architectural flow of KRISHNA's memory vectors and neural encryption keys." }
  ];

  const handleSuggestionClick = (text: string) => {
    playFeedbackSound(750, 'triangle', 0.05);
    setInput(text);
    submitQuery(text);
  };

  const clearLogs = () => {
    const initialGreeting: ChatMessage = {
      role: 'model',
      text: "Memory pathways flushed. System consciousness rebooted to absolute zero. Ready for high-priority commands, Operator.",
      emotion: 'Calibrated',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    
    setMessages([initialGreeting]);
    localStorage.removeItem('krishna_brain_support_logs');
    playFeedbackSound(300, 'sawtooth', 0.25);
  };

  const submitQuery = async (queryText: string) => {
    if (!queryText.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      role: 'user',
      text: queryText.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    playFeedbackSound(880, 'sine', 0.06);

    const lowerQuery = queryText.toLowerCase().trim();
    const openMatch = lowerQuery.match(/^open\s+(.+)$/i);
    const closeMatch = lowerQuery.match(/^(close|exit|quit)\s+(.+)$/i);
    const callMatch = lowerQuery.match(/^(call|dial)\s+(.+)$/i);
    const isSlashCmd = lowerQuery.startsWith('/');

    if (openMatch || closeMatch || callMatch || isSlashCmd) {
      setTimeout(() => {
        let replyText = "";
        let commandAction = "";

        if (lowerQuery === '/clear') {
          clearLogs();
          setIsLoading(false);
          return;
        } else if (lowerQuery === '/matrix') {
          setMatrixMode(prev => !prev);
          replyText = "Matrix visual interface toggled.";
          commandAction = "[SYSTEM ACTION]: Adjusting environmental optics parameters.";
        } else if (lowerQuery === '/scan') {
          replyText = "Deep spectrum diagnostic sequence complete. No anomalies detected.";
          commandAction = "SYSTEM SCAN: Nodes [ACTIVE], Firewalls [OK], Hex-Cipher [STABLE]\nScanning Subnets...\nIP: 192.168.1.104 ~ SECURE\nIP: 10.0.0.52 ~ SECURE\n0xA4F2B9D... INTEGRITY CONFIRMED.";
        } else if (lowerQuery === '/trace') {
          replyText = "Trace route established. Target ping < 4ms.";
          commandAction = "TRACING UPLINK... \nHop 1: KRISHNA_GATEWAY [127.0.0.1]\nHop 2: SAT_COM_LINK_7 [45.X.X.X]\nHop 3: CENTRAL_MAINFRAME [OK]";
        } else if (openMatch) {
          const appName = openMatch[1];
          replyText = `Opening ${appName} application now, sir.`;
          commandAction = `[SYSTEM ACTION]: Booting application payload for ${appName.toUpperCase()}`;
        } else if (closeMatch) {
          const appName = closeMatch[2];
          replyText = `Closing ${appName} application and terminating its process.`;
          commandAction = `[SYSTEM ACTION]: Terminating process for ${appName.toUpperCase()}`;
        } else if (callMatch) {
          const personName = callMatch[2];
          replyText = `Initiating direct secure line to ${personName}.`;
          commandAction = `[SYSTEM ACTION]: Dialing frequency for contact: ${personName.toUpperCase()}`;
          setTimeout(() => {
            window.location.href = `tel:${personName.replace(/[^0-9+]/g, '') || '5550199'}`;
          }, 1500);
        } else if (isSlashCmd) {
          replyText = "Command not recognized. Valid commands: /matrix, /scan, /trace, /clear";
          commandAction = "[SYSTEM ALERT]: Invalid terminal syntax.";
        }

        setMessages(prev => [...prev, {
          role: 'model',
          text: `${commandAction}\n\n${replyText}`,
          emotion: 'Command Executed',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }]);
        
        playFeedbackSound(950, 'triangle', 0.1);
        speakSystemResponse(replyText);
        setIsLoading(false);
      }, 800);
      return; 
    }

    try {
      const formattedHistory = [...messages, userMsg].map(m => ({
        role: m.role,
        parts: [{ text: m.text }]
      }));

      const systemContext = `You are KRISHNA OS Intelligence Advisor - a deeply intelligent, futuristic assistant designed and developed by B. Hevanth Kumar.
If the user asks who created you, who is your owner, who developed/built/made you or who B. Hevanth Kumar is: B. Hevanth Kumar is your founder, futuristic operating system creator, and systems architect. Generate a natural, dynamic, professional, inspirational, and intelligent reply. Encourage them to check out the "About Creator" section in the primary sidebar navigation to see his vision, technical skills, roadmap, and contact channels.
If the user asks what you are or your mission: you are a futuristic AI Operating System committed to ambient computing, autonomous workflow orchestration, real-world accessibility problem-solving, and personalized learning.`;

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: formattedHistory,
          systemInstruction: systemContext
        })
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || "Brain synapsing timed out.");
      }

      setMessages(prev => [...prev, {
        role: 'model',
        text: result.text,
        emotion: result.emotion || 'Optimal',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);

      playFeedbackSound(950, 'triangle', 0.1);
      speakSystemResponse(result.text);

    } catch (err: any) {
      console.error("Bot Query Error:", err);
      const errorMsg = `[RECOVERY FAILSAFE]: ${err.message || "Failed to contact neural logic board."}. System is running in client deterministic mode.`;
      setMessages(prev => [...prev, {
        role: 'model',
        text: errorMsg,
        emotion: 'Warning Alert',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
      playFeedbackSound(220, 'sawtooth', 0.18);
      speakSystemResponse("System failure. Client deterministic mode engaged.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleFormSubmit = (e: FormEvent) => {
    e.preventDefault();
    submitQuery(input);
  };

  useEffect(() => {
    const interval = setInterval(() => {
      const load = (Math.random() * 0.4 + 0.05).toFixed(2);
      setCurrentSystemLoad(load);
    }, 4500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div 
      ref={containerRef} 
      className={cn(
        "fixed bottom-6 right-6 z-50 font-sans transition-all duration-300",
        clapPulse && clapPulseMode === 'SUBTLE' && "animate-container-clap-pulse",
        clapPulse && clapPulseMode === 'INTENSE' && "animate-container-clap-pulse-intense"
      )} 
      id="krishna-intelligence-support"
    >
      {/* Floating Glowing Cybernetic Brain Orb Button */}
      {!isOpen && (
        <div className="relative">
          {isClapListening && (
            <div className="absolute -top-8 -right-2 whitespace-nowrap bg-[#00FF9D]/10 text-[#00FF9D] border border-[#00FF9D]/30 px-2 py-1 rounded shadow-[0_0_15px_rgba(0,255,157,0.2)] text-[9px] font-mono flex items-center gap-1.5 z-10 pointer-events-none">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00FF9D] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#00FF9D]"></span>
              </span>
              LISTENING FOR CLAP
            </div>
          )}
          <button
            onClick={handleToggle}
            className="relative group w-14 h-14 rounded-full bg-gradient-to-br from-[#02040a] via-[#051c31] to-[#004e76] border border-[#00E5FF]/40 flex items-center justify-center cursor-pointer shadow-[0_0_30px_rgba(0,229,255,0.45)] hover:shadow-[0_0_45px_rgba(0,229,255,0.7)] transition-all duration-300 hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-[#00E5FF]"
            title="Query KRISHNA OS Neural Help Brain"
          >
            <div className="absolute inset-0 rounded-full border border-cyan-500/30 animate-ping opacity-60"></div>
            <div className="absolute w-12 h-0.5 bg-cyan-400/40 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded animate-bounce"></div>
            
            <div className="relative text-cyan-400 group-hover:text-cyan-200 transition-colors">
              <Brain className="w-6 h-6 animate-pulse" />
            </div>

            <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00FF9D] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-[#00FF9D]"></span>
            </span>

            <div className="absolute bottom-16 right-0 scale-0 group-hover:scale-100 origin-bottom-right transition-all duration-200 bg-black/90 border border-[#00E5FF]/30 px-3 py-1.5 rounded-lg text-[10px] font-mono whitespace-nowrap text-[#00E5FF] tracking-wide pointer-events-none shadow-xl">
                 🧠 INITIALIZE OS INTELLIGENCE BRAIN
            </div>
          </button>
        </div>
      )}

      {/* Expanded Interactive Brain Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 350 }}
            className="w-[360px] sm:w-[400px] h-[580px] bg-black/95 backdrop-blur-xl border border-cyan-500/30 rounded-2xl flex flex-col justify-between overflow-hidden shadow-[0_0_60px_rgba(0,0,0,0.8),0_0_40px_rgba(0,229,255,0.15)] filter-drop"
          >
            {/* Cyber Header */}
            <div className="p-3 border-b border-cyan-500/20 bg-gradient-to-r from-cyan-950/40 to-black flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-cyan-500/10 border border-cyan-500/30 shadow-[0_0_15px_rgba(0,229,255,0.2)]">
                  <Brain size={18} className="text-[#00E5FF] animate-pulse" />
                </div>
                <div>
                  <h3 className="text-xs font-mono font-black text-[#00E5FF] tracking-wider uppercase flex items-center gap-1.5">
                    KRISHNA Intelligence Support 
                    {isClapListening && (
                      <span className="ml-2 bg-[#00FF9D]/20 text-[#00FF9D] text-[8px] px-1.5 py-0.5 rounded flex items-center gap-1 animate-pulse border border-[#00FF9D]/40">
                        <Ear size={8} /> LISTENING
                      </span>
                    )}
                  </h3>
                  <div className="flex items-center gap-2 text-[9px] font-mono text-gray-400 mt-0.5">
                    <span className="inline-flex relative h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00FF9D] opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-[#00FF9D]"></span>
                    </span>
                    <span>ONLINE SYNAPSE</span>
                    <span className="text-cyan-500">•</span>
                    <span>LOAD: {currentSystemLoad} %</span>
                  </div>
                </div>
              </div>

              {/* Utility Operations */}
              <div className="flex items-center gap-1">
                <button
                  onClick={() => {
                    if (isClapListening) stopClapDetection();
                    else startClapDetection();
                  }}
                  className={cn(
                    "p-1.5 rounded bg-white/5 border border-white/10 hover:border-cyan-500/30 hover:bg-cyan-500/10 text-gray-400 hover:text-white transition-colors cursor-pointer",
                    isClapListening && "text-[#00FF9D] bg-[#00FF9D]/10 border-[#00FF9D]/30 shadow-[0_0_10px_rgba(0,255,157,0.2)]"
                  )}
                  title={isClapListening ? "Disable Clap Wakeword" : "Enable Clap Wakeword"}
                >
                  <Ear size={12} className={isClapListening ? "animate-pulse" : ""} />
                </button>

                <button
                  onClick={() => {
                    setSoundEnabled(!soundEnabled);
                    if (!soundEnabled) {
                      setTimeout(() => playFeedbackSound(700, 'sine', 0.1), 50);
                    }
                  }}
                  className={cn(
                    "p-1.5 rounded bg-white/5 border border-white/10 hover:border-white/20 hover:bg-white/10 text-gray-400 hover:text-white transition-colors cursor-pointer",
                    soundEnabled && "text-cyan-400 bg-cyan-500/10 border-cyan-500/35"
                  )}
                  title={soundEnabled ? "Disable Synthesizer Chimes" : "Enable Feedback Chimes"}
                >
                  {soundEnabled ? <Volume2 size={12} /> : <VolumeX size={12} />}
                </button>

                <button
                  onClick={clearLogs}
                  className="p-1.5 rounded bg-white/5 border border-white/10 hover:border-red-500/30 hover:bg-red-500/10 text-gray-400 hover:text-red-400 transition-colors cursor-pointer"
                  title="Flush Brain Memory Pathlogs"
                >
                  <Trash2 size={12} />
                </button>

                <button
                  onClick={handleToggle}
                  className="p-1.5 rounded bg-white/5 border border-white/10 hover:border-cyan-500/30 hover:bg-cyan-500/10 text-gray-400 hover:text-[#00E5FF] transition-colors cursor-pointer"
                  title="Minimize Advisor"
                >
                  <X size={12} />
                </button>
              </div>
            </div>

            {/* Neural System Security Gauge */}
            <div className="p-4 bg-cyan-500/5 border-b border-cyan-500/10 flex flex-col items-center justify-center relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-t from-cyan-900/10 to-transparent"></div>
              
              <div className="relative flex items-center justify-center gap-6 z-10 w-full px-2">
                <div className="relative w-28 h-28 flex items-center justify-center shrink-0">
                  <canvas ref={waveformCanvasRef} width={112} height={112} className="absolute inset-0 w-full h-full rounded-full mix-blend-screen opacity-50 pointer-events-none" />
                  <svg className="w-full h-full transform -rotate-90">
                    <circle
                      cx="56"
                      cy="56"
                      r="48"
                      stroke="currentColor"
                      strokeWidth="7"
                      fill="transparent"
                      className="text-gray-800"
                    />
                    <circle
                      cx="56"
                      cy="56"
                      r="48"
                      stroke="currentColor"
                      strokeWidth="7"
                      fill="transparent"
                      strokeDasharray={2 * Math.PI * 48}
                      strokeDashoffset={2 * Math.PI * 48 * (1 - securityIntegrity / 100)}
                      className={cn(
                        "transition-all duration-1000 ease-out",
                        securityIntegrity > 80 ? "text-[#00FF9D]" : securityIntegrity > 50 ? "text-yellow-400" : "text-red-500"
                      )}
                    />
                  </svg>
                  <div className="absolute flex flex-col items-center justify-center mt-2">
                    <span className={cn(
                      "text-xl font-mono font-bold tracking-tighter drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]",
                      securityIntegrity > 80 ? "text-[#00FF9D]" : securityIntegrity > 50 ? "text-yellow-400" : "text-red-500"
                    )}>
                      {securityIntegrity}%
                    </span>
                    <span className="text-[7px] font-mono text-cyan-400/80 uppercase tracking-widest mt-0.5">Integrity</span>
                    {isClapListening && (
                      <span ref={signalRef} className="text-[8px] font-mono font-bold text-[#00FF9D] mt-1 tracking-wider bg-[#00FF9D]/10 px-1 py-0.5 rounded border border-[#00FF9D]/30 min-w-[45px] text-center">
                        -100.0 dB
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex-1 max-w-[120px] h-14 flex flex-col justify-end relative">
                  <span className="text-[7px] font-mono text-cyan-400/70 absolute -top-4 right-0 uppercase tracking-widest">60s Trend</span>
                  <div className="w-full h-full border-b border-l border-cyan-800/40 relative">
                     <div className="absolute w-full h-[1px] top-0 border-t border-dashed border-cyan-900/30"></div>
                     <div className="absolute w-full h-[1px] top-1/2 border-t border-dashed border-cyan-900/30"></div>
                     <svg className="w-full h-full overflow-visible" viewBox="0 0 60 30" preserveAspectRatio="none">
                       <polyline
                         fill="none"
                         stroke={securityIntegrity > 80 ? "#00FF9D" : securityIntegrity > 50 ? "#FBBF24" : "#EF4444"}
                         strokeWidth="1.5"
                         strokeLinecap="round"
                         strokeLinejoin="round"
                         points={integrityHistory.map((val, i) => `${i},${30 - (val / 100) * 30}`).join(' ')}
                         className="drop-shadow-[0_0_2px_rgba(0,255,157,0.5)] transition-all duration-300"
                       />
                     </svg>
                  </div>
                </div>
              </div>

              <div className="w-full flex justify-between items-center text-[8px] font-mono text-cyan-400/60 mt-4 px-2">
                <div className="flex items-center gap-1">
                  <ShieldCheck size={9} className={securityIntegrity > 50 ? "text-[#00FF9D]" : "text-red-500"} />
                  <span>GRID STATUS: {securityIntegrity > 80 ? 'SECURE' : securityIntegrity > 50 ? 'WARNING' : 'CRITICAL'}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock size={9} />
                  <span>UPTIME: 99.98%</span>
                </div>
              </div>
            </div>

            {/* Clap Detection Configuration Panel */}
            <div className={cn(
              "overflow-hidden transition-all duration-300 ease-in-out border-b border-cyan-500/10",
              isClapListening ? "max-h-72 py-3 opacity-100 bg-cyan-500/5" : "max-h-0 py-0 opacity-0 bg-transparent border-none"
            )}>
              <div className="px-4 flex flex-col gap-3">
                <div className="flex items-center justify-between text-[9px] font-mono text-cyan-400">
                  <span className="uppercase tracking-wider font-bold">Acoustic Clap Settings</span>
                  <span className="uppercase text-[#00FF9D] animate-pulse">Monitoring</span>
                </div>
                
                <div className="space-y-3">
                  <div className="flex flex-col gap-1.5">
                    <div className="flex justify-between text-[8px] font-mono text-cyan-300">
                      <span>VISUAL PULSE FEEDBACK</span>
                      <span className="text-white">{clapPulseMode}</span>
                    </div>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => setSystemMetrics({ clapPulseMode: 'DISABLED' })}
                        className={cn("flex-1 py-1 text-[8px] font-mono rounded border transition-colors", clapPulseMode === 'DISABLED' ? "bg-cyan-500/20 border-cyan-500 text-cyan-300" : "bg-white/5 border-white/10 text-gray-500 hover:text-gray-300")}
                      >
                        OFF
                      </button>
                      <button 
                        onClick={() => setSystemMetrics({ clapPulseMode: 'SUBTLE' })}
                        className={cn("flex-1 py-1 text-[8px] font-mono rounded border transition-colors", clapPulseMode === 'SUBTLE' ? "bg-cyan-500/20 border-cyan-500 text-cyan-300" : "bg-white/5 border-white/10 text-gray-500 hover:text-gray-300")}
                      >
                        SUBTLE
                      </button>
                      <button 
                        onClick={() => setSystemMetrics({ clapPulseMode: 'INTENSE' })}
                        className={cn("flex-1 py-1 text-[8px] font-mono rounded border transition-colors", clapPulseMode === 'INTENSE' ? "bg-cyan-500/20 border-cyan-500 text-cyan-300" : "bg-white/5 border-white/10 text-gray-500 hover:text-gray-300")}
                      >
                        INTENSE
                      </button>
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <div className="flex justify-between text-[8px] font-mono text-cyan-300">
                      <span>THRESHOLD (LOWER = MORE SENSITIVE)</span>
                      <span>{clapSensitivity}</span>
                    </div>
                    <input 
                      type="range" 
                      min="50" 
                      max="250" 
                      value={clapSensitivity} 
                      onChange={(e) => setSystemMetrics({ clapSensitivity: parseInt(e.target.value) })}
                      className="w-full h-1.5 bg-cyan-950 rounded-lg appearance-none cursor-pointer accent-[#00FF9D] hover:accent-[#00E5FF] transition-all"
                    />
                  </div>
                  
                  <div className="flex flex-col gap-1.5">
                    <div className="flex justify-between text-[8px] font-mono text-cyan-300">
                      <span>ACOUSTIC COOLDOWN (MS)</span>
                      <span>{clapCooldown}ms</span>
                    </div>
                    <input 
                      type="range" 
                      min="500" 
                      max="5000" 
                      step="100"
                      value={clapCooldown} 
                      onChange={(e) => setSystemMetrics({ clapCooldown: parseInt(e.target.value) })}
                      className="w-full h-1.5 bg-cyan-950 rounded-lg appearance-none cursor-pointer accent-[#00FF9D] hover:accent-[#00E5FF] transition-all"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Chat Dialog Grid Feed */}
            <div className="flex-1 overflow-y-auto p-4 bg-gradient-to-b from-[#020409] to-[#040916] scrollbar-thin scrollbar-thumb-cyan-500/20 scrollbar-track-transparent relative z-0">
              {matrixMode && <MatrixRain />}
              <div className="relative z-10 space-y-4 flex flex-col">
               <AnimatePresence initial={false}>
                {messages.map((message, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.25 }}
                    className={cn(
                      "flex gap-2 max-w-[90%]",
                      message.role === 'user' ? "ml-auto flex-row-reverse" : ""
                    )}
                  >
                    <div className={cn(
                      "w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 border text-[10px] shadow-md",
                      message.role === 'user' 
                        ? "bg-white/5 border-white/10 text-gray-300"
                        : "bg-cyan-500/10 border-cyan-500/32 text-[#00E5FF] neural-glow animate-pulse"
                    )}>
                      {message.role === 'user' ? <User size={12} /> : <Bot size={12} />}
                    </div>

                    <div className="space-y-1.5 flex flex-col items-start w-full">
                      <div className={cn(
                        "px-3.5 py-2.5 rounded-xl text-xs leading-relaxed whitespace-pre-wrap font-sans transition-all backdrop-blur-md",
                        message.role === 'user'
                          ? "bg-gradient-to-r from-cyan-950/80 to-blue-950/80 text-white border border-cyan-400/30 rounded-tr-none shadow-md"
                          : "bg-black/50 text-gray-200 border border-white/10 rounded-tl-none hover:bg-black/60 shadow-md"
                      )}>
                        {message.role === 'model' && index === messages.length - 1 ? (
                          <TypewriterText text={message.text} onComplete={scrollToBottom} />
                        ) : (
                          message.text
                        )}

                        {message.role === 'model' && message.emotion && (
                          <div className="mt-2.5 flex items-center">
                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded border border-cyan-500/30 bg-cyan-500/10 text-[8px] font-mono font-bold text-[#00E5FF] tracking-widest uppercase">
                              <Activity className="w-2.5 h-2.5" />
                              SYNAPSE: {message.emotion}
                            </span>
                          </div>
                        )}
                      </div>

                      <span className={cn(
                        "text-[7px] font-mono text-gray-500 px-1 self-end",
                        message.role === 'user' ? "self-end" : "self-start"
                      )}>
                        {message.timestamp}
                      </span>
                    </div>
                  </motion.div>
                ))}
               </AnimatePresence>

               {isLoading && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-2">
                  <div className="w-7 h-7 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center flex-shrink-0 mt-0.5 shadow-md">
                    <Bot size={12} className="text-[#00E5FF]" />
                  </div>
                  <div className="bg-black/50 border border-white/10 rounded-xl rounded-tl-none px-3.5 py-3 flex items-center gap-1 text-xs font-mono text-cyan-400 backdrop-blur-md">
                    <div className="w-1.5 h-1.5 bg-[#00E5FF] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-1.5 h-1.5 bg-[#00E5FF] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-1.5 h-1.5 bg-[#00E5FF] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    <span className="ml-1 text-[9px] uppercase tracking-wider text-cyan-400/70 select-none">Synapsing core...</span>
                  </div>
                </motion.div>
               )}
               <div ref={messagesEndRef} />
              </div>
            </div>

            {messages.length <= 2 && (
              <div className="p-3 bg-[#030610] border-t border-cyan-500/15">
                <p className="text-[8.5px] font-mono text-[#00E5FF]/70 uppercase tracking-wider mb-2 select-none flex items-center gap-1">
                  <Sparkles size={10} className="text-[#00E5FF]" />
                  Recommended Core Signals
                </p>
                <div className="grid grid-cols-2 gap-1.5">
                  {suggestionPrompts.map((s, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSuggestionClick(s.text)}
                      className="p-1 px-2 text-[9px] text-left border border-white/5 hover:border-cyan-500/30 bg-white/[0.02] hover:bg-cyan-500/5 rounded text-gray-300 hover:text-[#00E5FF] transition-all truncate cursor-pointer font-sans"
                      title={s.text}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Futuristic Input Form Bar */}
            <div className="p-3 border-t border-cyan-500/20 bg-black relative">
               <AnimatePresence>
                 {input.startsWith('/') && !isLoading && (
                   <motion.div
                     initial={{ opacity: 0, y: 10, scale: 0.95 }}
                     animate={{ opacity: 1, y: 0, scale: 1 }}
                     exit={{ opacity: 0, y: 5 }}
                     className="absolute bottom-full mb-2 left-3 right-3 bg-black/90 backdrop-blur-xl border border-[#00FF9D]/30 rounded-xl overflow-hidden shadow-[0_0_20px_rgba(0,255,157,0.15)] z-20 flex flex-col"
                   >
                     <div className="text-[9px] font-mono text-[#00FF9D] uppercase tracking-wider px-3 py-1.5 border-b border-[#00FF9D]/20 bg-[#00FF9D]/10">
                       Available Execution Sequences
                     </div>
                     <div className="p-1">
                       {[
                         { cmd: '/matrix', desc: 'Toggle environmental logic visualization' },
                         { cmd: '/scan', desc: 'Execute diagnostic network sweep' },
                         { cmd: '/trace', desc: 'Attempt packet link routing' },
                         { cmd: '/clear', desc: 'Flush active memory cache' }
                       ].filter(o => o.cmd.startsWith(input.toLowerCase())).map(o => (
                         <button 
                           key={o.cmd}
                           type="button" 
                           onClick={() => { setInput(o.cmd); document.getElementById('brain-input')?.focus() }} 
                           className="w-full text-left px-2 py-1.5 rounded-lg hover:bg-white/5 flex items-center justify-between group transition-colors cursor-pointer"
                         >
                           <span className="font-mono text-[#00E5FF] text-[10px] group-hover:text-[#00FF9D]">{o.cmd}</span>
                           <span className="text-[8px] font-mono text-gray-500 group-hover:text-gray-300 truncate ml-2">{o.desc}</span>
                         </button>
                       ))}
                     </div>
                   </motion.div>
                 )}
               </AnimatePresence>
               <form 
                 onSubmit={handleFormSubmit} 
                 className={cn(
                   "relative flex items-center gap-1.5 pl-2.5 pr-1 border rounded-xl bg-white/[0.02] transition-colors duration-300",
                   isVoiceListening 
                     ? "border-[#00E5FF] shadow-[0_0_10px_rgba(0,229,255,0.15)] hover:border-[#00E5FF]" 
                     : "border-white/10 hover:border-cyan-500/40"
                 )}
               >
                <Terminal className="text-[#00E5FF]/50 w-3.5 h-3.5 shrink-0" />
                <button
                  type="button"
                  onClick={toggleListening}
                  className={cn(
                    "w-6 h-6 flex-shrink-0 flex items-center justify-center rounded-md transition-all cursor-pointer focus:outline-none z-10",
                    isVoiceListening
                      ? "bg-[#00E5FF]/20 text-[#00E5FF] border border-[#00E5FF]/45 animate-pulse"
                      : "hover:bg-white/5 text-gray-500 hover:text-white"
                  )}
                  title={isVoiceListening ? "Mute live voice feed" : "Transmit speech command"}
                >
                  <Mic size={11} className={isVoiceListening ? "text-[#00E5FF] animate-pulse" : ""} />
                </button>
                <input
                  id="brain-input"
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder={isVoiceListening ? "Acoustic line open. Speak..." : "Initialize logic sequence..."}
                  className="w-full bg-transparent border-none text-white text-xs placeholder:text-gray-600 outline-none focus:ring-0 py-2.5 focus:outline-none"
                  disabled={isLoading}
                  autoComplete="off"
                />
                <button
                  type="submit"
                  disabled={!input.trim() || isLoading}
                  className="w-7 h-7 flex-shrink-0 flex items-center justify-center bg-cyan-500/10 border border-cyan-500/35 hover:bg-cyan-500/30 text-[#00E5FF] rounded-lg transition-all active:scale-90 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer focus:outline-none"
                  title="Transmit Code Sequence"
                >
                  <Send size={11} />
                </button>
              </form>
              <div className="flex justify-between items-center mt-2 px-1 text-[8px] font-mono text-gray-600 select-none">
                <span>COM_SYS CONNECTED SECURELY</span>
                <span>CTRL + ENTER TO SEND</span>
              </div>
            </div>

          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
