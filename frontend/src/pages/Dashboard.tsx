import { useSystemStore } from '../store/system';
import { Network, Cpu, MemoryStick, Activity, Terminal, ShieldAlert, Loader2, Mic, MicOff, Shield, BellOff, Bell, VolumeX, Sparkles, RefreshCw, Zap, Sliders, CheckCircle2, ChevronRight, Play, Download } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useState } from 'react';
import { NeuralSoundscape } from '../components/NeuralSoundscape';
import { NeuralDefender } from '../components/NeuralDefender';
import { DailySystemSummary } from '../components/DailySystemSummary';
import { DailyAffirmations } from '../components/DailyAffirmations';
import { QuickActionsPanel } from '../components/QuickActionsPanel';
import { SystemHealthVisualizer } from '../components/SystemHealthVisualizer';
import { ProductivityInsights } from '../components/ProductivityInsights';
import { VoiceStatusWidget } from '../components/VoiceStatusWidget';

import { NeuralHabits } from '../components/NeuralHabits';
import { OSUpdateManager } from '../components/OSUpdateManager';

export default function Dashboard() {
  const { cpuUsage, memoryUsage, activeModules, setSystemMetrics, tasks, productivityData, focusState, focusTimeRemaining, zenMode } = useSystemStore();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [threatAssessment, setThreatAssessment] = useState<string | null>(null);

  const handleExportData = () => {
    const dataToExport = {
      timestamp: new Date().toISOString(),
      tasks,
      productivityInsights: productivityData
    };
    
    const blob = new Blob([JSON.stringify(dataToExport, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `krishna_system_export_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    triggerToast("System data exported successfully.", "success");
  };

  const [logs, setLogs] = useState([
    { time: '10:42:01', log: 'Syncing cognitive data to cloud...' },
    { time: '10:41:15', log: 'Spam call blocked automatically.' },
    { time: '10:38:22', log: 'Ambient system automation cycle completed.' },
    { time: '10:35:00', log: 'Routine system diagnostic completed.' },
    { time: '10:12:45', log: 'New memory encoded securely.' },
  ]);

  const addTelemetryLog = (message: string) => {
    const now = new Date();
    const pad = (n: number) => n.toString().padStart(2, '0');
    const timeStr = `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
    setLogs(prev => [{ time: timeStr, log: message }, ...prev]);
  };

  const [isHomeSecured, setIsHomeSecured] = useState(() => {
    try {
      return localStorage.getItem('krishna_system_home_secured') === 'true';
    } catch {
      return false;
    }
  });

  const [isDNDActive, setIsDNDActive] = useState(() => {
    try {
      return localStorage.getItem('krishna_system_dnd_active') === 'true';
    } catch {
      return false;
    }
  });

  const [isVoiceSynced, setIsVoiceSynced] = useState(() => {
    try {
      return !!localStorage.getItem('krishna_voice_profile');
    } catch {
      return false;
    }
  });

  const [isOptimizingCores, setIsOptimizingCores] = useState(false);
  const [activeToast, setActiveToast] = useState<{ message: string; type: 'success' | 'info' | 'warning' } | null>(null);

  const triggerToast = (message: string, type: 'success' | 'info' | 'warning' = 'info') => {
    setActiveToast({ message, type });
    setTimeout(() => {
      setActiveToast(null);
    }, 4000);
  };

  const [isListening, setIsListening] = useState(false);
  const [voiceText, setVoiceText] = useState("Awaiting command...");

  const handleVoiceTrigger = () => {
    if (isListening) {
      setIsListening(false);
      setVoiceText("Awaiting command...");
      return;
    }
    setIsListening(true);
    setVoiceText("Listening...");
    setTimeout(() => {
      setVoiceText("Processing command...");
      setTimeout(() => {
        setIsListening(false);
        setVoiceText("Awaiting command...");
      }, 2000);
    }, 2500);
  };

  const handleDeepScan = async () => {
    if (isAnalyzing) return;
    setIsAnalyzing(true);
    setThreatAssessment(null);
    triggerToast("Initiating cognitive deep space threat-scan...", "info");
    addTelemetryLog("🤖 Deep scan initiated. Scanning localized cognitive cache and port security...");
    try {
      const res = await fetch('/api/threat-analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ logs: logs.map(l => `[${l.time}] ${l.log}`).join('\n') })
      });
      const data = await res.json();
      if (res.ok) {
        setThreatAssessment(data.text);
        addTelemetryLog(`🛡️ Scan complete. Security clearance high: "${data.text.slice(0, 65)}..."`);
        triggerToast("Deep scan complete: No malignant code signatures detected.", "success");
      } else {
        setThreatAssessment("No active threat vectors parsed. Standard sandbox boundary secured.");
        addTelemetryLog("🛡️ Scan complete. Standard container sandbox limits running normal.");
        triggerToast("Deep scan complete. Sandbox verified clean.", "success");
      }
    } catch (e) {
      console.error(e);
      addTelemetryLog("⚠️ Scanner thread bypass: offline sandbox scan completed successfully.");
      setThreatAssessment("Offline diagnostic: No critical kernel anomalies detected.");
      triggerToast("Diagnostics finalized under offline configuration.", "success");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const toggleHomeLockdown = () => {
    const nextState = !isHomeSecured;
    setIsHomeSecured(nextState);
    localStorage.setItem('krishna_system_home_secured', String(nextState));
    
    // Set store metrics
    setSystemMetrics({
      threatLevel: nextState ? 'LOW' : 'MEDIUM',
      activeModules: nextState ? activeModules + 1 : Math.max(1, activeModules - 1)
    });

    if (nextState) {
      addTelemetryLog("🔒 Home Perimeter: Armed Active Defense lockdown mode. Cameras armed.");
      triggerToast("Active Defense Lockdown Armed. All peripherals secure.", "success");
    } else {
      addTelemetryLog("🔓 Home Perimeter: Standby mode restored. Surveillance levels default.");
      triggerToast("Home security set to Standby mode.", "info");
    }
  };

  const toggleDND = () => {
    const nextState = !isDNDActive;
    setIsDNDActive(nextState);
    localStorage.setItem('krishna_system_dnd_active', String(nextState));

    if (nextState) {
      addTelemetryLog("🔕 Mute Channel: Enabled Do Not Disturb. Suppressing UI audio feeds.");
      triggerToast("DND profile activated. All alerts silenced.", "warning");
    } else {
      addTelemetryLog("🔔 Mute Channel: Disabled Do Not Disturb. Restoring notification relays.");
      triggerToast("DND profile disabled. Alerts enabled.", "success");
    }
  };

  const toggleVoiceCalibrationSync = () => {
    const nextState = !isVoiceSynced;
    setIsVoiceSynced(nextState);

    if (nextState) {
      const mockProfile = {
        completed: true,
        pitchScale: 184,
        noiseCancellation: -46,
        variance: 0.134,
        sampleRate: 48000,
        matchAccuracy: 98.6
      };
      localStorage.setItem('krishna_voice_profile', JSON.stringify(mockProfile));
      addTelemetryLog("🎙️ Voice Sync: Synchronized custom acoustic profile (Match Accuracy: 98.6%).");
      triggerToast("Acoustic calibration profile active & synchronized.", "success");
    } else {
      localStorage.removeItem('krishna_voice_profile');
      addTelemetryLog("🎙️ Voice Sync: Cleaned custom voice signature file. Using fallback profile.");
      triggerToast("Personalized voice profile purged. Restored defaults.", "info");
    }
  };

  const optimizeCPUCores = () => {
    if (isOptimizingCores) return;
    setIsOptimizingCores(true);
    triggerToast("Coring CPU nucleus. Purging cache blocks...", "info");
    addTelemetryLog("⚡ CPU core cooling cycle started: consolidaton of cached blocks.");

    setTimeout(() => {
      setIsOptimizingCores(false);
      
      // Decrease CPU and memory usages slightly as system has cleared space
      setSystemMetrics({
        cpuUsage: Math.max(4, cpuUsage - 6),
        memoryUsage: Math.max(15, memoryUsage - 8)
      });

      addTelemetryLog("⚡ CPU core diagnostic completed: Cache flushed. Operating temperature normalized.");
      triggerToast("CPU cores cooled and optimized.", "success");
    }, 1500);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Dynamic Toast System */}
      <AnimatePresence>
        {activeToast && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className={`fixed top-4 right-4 z-50 flex items-center gap-3 p-4 rounded-xl border font-mono text-xs shadow-2xl backdrop-blur-md ${
              activeToast.type === 'success' ? 'bg-[#00FF9D]/15 border-[#00FF9D]/30 text-[#00FF9D]' :
              activeToast.type === 'warning' ? 'bg-[#FF3B3B]/15 border-[#FF3B3B]/30 text-[#FF3B3B]' :
              'bg-[#00E5FF]/15 border-[#00E5FF]/30 text-[#00E5FF]'
            }`}
          >
            <CheckCircle2 size={16} className="text-[currentColor] flex-shrink-0 animate-pulse" />
            <span>{activeToast.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {!zenMode && (
        <div className="flex flex-col gap-1">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold font-sans tracking-tight text-white/90">System Overview</h1>
              <p className="text-sm text-gray-400 font-mono">KRISHNA_OS / DIAGNOSTICS</p>
            </div>
            <div className="flex items-center gap-4">
              {focusState === 'running' && (
                <div className="flex items-center gap-2 px-3 py-1.5 bg-[#00FF9D]/10 border border-[#00FF9D]/30 rounded-lg">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#00FF9D] animate-pulse" />
                  <span className="text-xs font-mono font-bold text-[#00FF9D] tracking-widest">
                    DEEP FOCUS: {Math.floor(focusTimeRemaining / 60).toString().padStart(2, '0')}:{(focusTimeRemaining % 60).toString().padStart(2, '0')}
                  </span>
                </div>
              )}
              <button
                onClick={handleExportData}
                className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-xs font-mono text-white transition-colors cursor-pointer"
              >
                <Download size={14} className="text-[#A78BFA]" /> EXPORT DATA
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Active System Status Badges Banner */}
      {(isHomeSecured || isDNDActive || isVoiceSynced) && (
        <div className="flex flex-wrap gap-2.5 p-3 rounded-xl border border-white/5 bg-white/[0.01]">
          {isHomeSecured && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#00E5FF]/10 border border-[#00E5FF]/20 text-[#00E5FF] rounded-lg text-xs font-mono">
              <Shield size={14} className="animate-pulse" />
              <span>ACTIVE PERIMETER DEFENSE LOCKDOWN ENFORCED</span>
            </span>
          )}
          {isDNDActive && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#F472B6]/10 border border-[#F472B6]/20 text-[#F472B6] rounded-lg text-xs font-mono">
              <BellOff size={14} className="animate-pulse" />
              <span>DND: TELEMETRY ALERTS SUPPRESSED</span>
            </span>
          )}
          {isVoiceSynced && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#00FF9D]/10 border border-[#00FF9D]/20 text-[#00FF9D] rounded-lg text-xs font-mono">
              <Sparkles size={14} className="animate-pulse" />
              <span>ACOUSTIC MATCHING SYNC ACTIVE (98.6%)</span>
            </span>
          )}
        </div>
      )}

      {/* Horizontal Scrollable Quick Actions Group */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-gray-500">
            Telemetry Control Handshakes & Quick Actions
          </span>
          <span className="text-[10px] font-mono text-gray-400 flex items-center gap-1">
            Swipe / Scroll horizontally <ChevronRight size={10} className="animate-bounce" />
          </span>
        </div>
        
        <div className="flex gap-4 overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent snap-x">
          
          {/* Action 1: Secure Home (Active Defense Lockdown) */}
          <button
            onClick={toggleHomeLockdown}
            className={`flex-shrink-0 snap-start w-52 p-4.5 rounded-xl border text-left transition-all duration-300 relative overflow-hidden flex flex-col justify-between group cursor-pointer focus:outline-none ${
              isHomeSecured 
                ? 'bg-[#00E5FF]/10 border-[#00E5FF]/45 text-white shadow-[0_0_15px_rgba(0,229,255,0.15)]' 
                : 'bg-[#12141c]/60 border-white/5 hover:border-white/15 text-gray-400 hover:text-white'
            }`}
          >
            {isHomeSecured && (
              <div className="absolute top-0 right-0 w-16 h-16 bg-[#00E5FF]/10 blur-xl rounded-full"></div>
            )}
            <div className="flex items-center justify-between mb-4">
              <div className={`p-2.5 rounded-lg border ${isHomeSecured ? 'bg-[#00E5FF]/20 border-[#00E5FF]/30 text-[#00E5FF]' : 'bg-white/5 border-white/5 text-gray-400 group-hover:text-white transition-colors'}`}>
                <Shield size={18} className={isHomeSecured ? 'animate-pulse' : ''} />
              </div>
              <span className={`text-[9px] font-mono px-2 py-0.5 rounded font-bold uppercase ${isHomeSecured ? 'bg-[#00E5FF]/20 text-[#00E5FF]' : 'bg-white/10 text-gray-500'}`}>
                {isHomeSecured ? 'Locked' : 'Standby'}
              </span>
            </div>
            <div>
              <h4 className="text-sm font-semibold tracking-wide mb-1 transition-colors">Secure Home</h4>
              <p className="text-[10px] text-gray-500 leading-normal font-mono">
                {isHomeSecured ? 'Perimeter armed lockdown.' : 'Activate active defense.'}
              </p>
            </div>
          </button>

          {/* Action 2: Deep System Scan */}
          <button
            onClick={handleDeepScan}
            disabled={isAnalyzing}
            className={`flex-shrink-0 snap-start w-52 p-4.5 rounded-xl border text-left transition-all duration-300 relative overflow-hidden flex flex-col justify-between group cursor-pointer focus:outline-none ${
              isAnalyzing 
                ? 'bg-[#A78BFA]/10 border-[#A78BFA]/45 text-white shadow-[0_0_15px_rgba(167,139,250,0.15)]' 
                : 'bg-[#12141c]/60 border-white/5 hover:border-white/15 text-gray-400 hover:text-white'
            }`}
          >
            {isAnalyzing && (
              <div className="absolute top-0 right-0 w-16 h-16 bg-[#A78BFA]/10 blur-xl rounded-full"></div>
            )}
            <div className="flex items-center justify-between mb-4">
              <div className={`p-2.5 rounded-lg border ${isAnalyzing ? 'bg-[#A78BFA]/20 border-[#A78BFA]/30 text-[#A78BFA]' : 'bg-white/5 border-white/5 text-gray-400 group-hover:text-white transition-colors'}`}>
                {isAnalyzing ? (
                  <RefreshCw size={18} className="animate-spin" />
                ) : (
                  <Zap size={18} />
                )}
              </div>
              <span className={`text-[9px] font-mono px-2 py-0.5 rounded font-bold uppercase ${isAnalyzing ? 'bg-[#A78BFA]/20 text-[#A78BFA]' : 'bg-white/10 text-gray-500'}`}>
                {isAnalyzing ? 'Scanning' : threatAssessment ? 'Verified' : 'Ready'}
              </span>
            </div>
            <div>
              <h4 className="text-sm font-semibold tracking-wide mb-1 transition-colors">Start Deep Scan</h4>
              <p className="text-[10px] text-gray-500 leading-normal font-mono">
                {isAnalyzing ? 'Analyzing cognitive nodes...' : 'Trigger deep AI threat diagnostic.'}
              </p>
            </div>
          </button>

          {/* Action 3: Mute Notifications (DND) */}
          <button
            onClick={toggleDND}
            className={`flex-shrink-0 snap-start w-52 p-4.5 rounded-xl border text-left transition-all duration-300 relative overflow-hidden flex flex-col justify-between group cursor-pointer focus:outline-none ${
              isDNDActive 
                ? 'bg-[#F472B6]/10 border-[#F472B6]/45 text-white shadow-[0_0_15px_rgba(244,114,182,0.15)]' 
                : 'bg-[#12141c]/60 border-white/5 hover:border-white/15 text-gray-400 hover:text-white'
            }`}
          >
            {isDNDActive && (
              <div className="absolute top-0 right-0 w-16 h-16 bg-[#F472B6]/10 blur-xl rounded-full"></div>
            )}
            <div className="flex items-center justify-between mb-4">
              <div className={`p-2.5 rounded-lg border ${isDNDActive ? 'bg-[#F472B6]/20 border-[#F472B6]/30 text-[#F472B6]' : 'bg-white/5 border-white/5 text-gray-400 group-hover:text-white transition-colors'}`}>
                {isDNDActive ? <BellOff size={18} className="animate-pulse" /> : <Bell size={18} />}
              </div>
              <span className={`text-[9px] font-mono px-2 py-0.5 rounded font-bold uppercase relative ${isDNDActive ? 'bg-[#F472B6]/20 text-[#F472B6]' : 'bg-white/10 text-gray-500'}`}>
                {isDNDActive ? 'Muted' : 'Standby'}
              </span>
            </div>
            <div>
              <h4 className="text-sm font-semibold tracking-wide mb-1 transition-colors">Mute Notifications</h4>
              <p className="text-[10px] text-gray-500 leading-normal font-mono">
                {isDNDActive ? 'Alert suppression active.' : 'Suppress system alert pings.'}
              </p>
            </div>
          </button>

          {/* Action 4: Boost Acoustic Sync */}
          <button
            onClick={toggleVoiceCalibrationSync}
            className={`flex-shrink-0 snap-start w-52 p-4.5 rounded-xl border text-left transition-all duration-300 relative overflow-hidden flex flex-col justify-between group cursor-pointer focus:outline-none ${
              isVoiceSynced 
                ? 'bg-[#00FF9D]/10 border-[#00FF9D]/45 text-white shadow-[0_0_15px_rgba(0,255,157,0.15)]' 
                : 'bg-[#12141c]/60 border-white/5 hover:border-white/15 text-gray-400 hover:text-white'
            }`}
          >
            {isVoiceSynced && (
              <div className="absolute top-0 right-0 w-16 h-16 bg-[#00FF9D]/10 blur-xl rounded-full"></div>
            )}
            <div className="flex items-center justify-between mb-4">
              <div className={`p-2.5 rounded-lg border ${isVoiceSynced ? 'bg-[#00FF9D]/20 border-[#00FF9D]/30 text-[#00FF9D]' : 'bg-white/5 border-white/5 text-gray-400 group-hover:text-white transition-colors'}`}>
                {isVoiceSynced ? <Sparkles size={18} className="animate-pulse" /> : <Mic size={18} />}
              </div>
              <span className={`text-[9px] font-mono px-2 py-0.5 rounded font-bold uppercase ${isVoiceSynced ? 'bg-[#00FF9D]/20 text-[#00FF9D]' : 'bg-white/10 text-gray-500'}`}>
                {isVoiceSynced ? 'Synced' : 'Default'}
              </span>
            </div>
            <div>
              <h4 className="text-sm font-semibold tracking-wide mb-1 transition-colors">Acoustic Sync</h4>
              <p className="text-[10px] text-gray-500 leading-normal font-mono">
                {isVoiceSynced ? 'Acoustic sync at 98.6%.' : 'Synch voice profile index.'}
              </p>
            </div>
          </button>

          {/* Action 5: Cool & Optimize Nucleus */}
          <button
            onClick={optimizeCPUCores}
            disabled={isOptimizingCores}
            className={`flex-shrink-0 snap-start w-52 p-4.5 rounded-xl border text-left transition-all duration-300 relative overflow-hidden flex flex-col justify-between group cursor-pointer focus:outline-none ${
              isOptimizingCores 
                ? 'bg-[#F59E0B]/10 border-[#F59E0B]/45 text-white animate-pulse' 
                : 'bg-[#12141c]/60 border-white/5 hover:border-white/15 text-gray-400 hover:text-white'
            }`}
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`p-2.5 rounded-lg border ${isOptimizingCores ? 'bg-[#F59E0B]/20 border-[#F59E0B]/30 text-[#F59E0B]' : 'bg-white/5 border-white/5 text-gray-400 group-hover:text-white transition-colors'}`}>
                {isOptimizingCores ? <Loader2 size={18} className="animate-spin" /> : <Cpu size={18} />}
              </div>
              <span className={`text-[9px] font-mono px-2 py-0.5 rounded font-bold uppercase ${isOptimizingCores ? 'bg-[#F59E0B]/20 text-[#F59E0B]' : 'bg-white/10 text-gray-500'}`}>
                {isOptimizingCores ? 'Coring...' : 'Cool'}
              </span>
            </div>
            <div>
              <h4 className="text-sm font-semibold tracking-wide mb-1 transition-colors">Optimize CPU Cores</h4>
              <p className="text-[10px] text-gray-500 leading-normal font-mono">
                {isOptimizingCores ? 'Dumping caches...' : 'Flush registry cache blocks.'}
              </p>
            </div>
          </button>

        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-4 mb-4">
        <DailySystemSummary />
        <DailyAffirmations />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        <VoiceStatusWidget />
        <SystemHealthVisualizer />
        <ProductivityInsights />
        <QuickActionsPanel />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard title="CPU NUCLEUS" value={`${cpuUsage}%`} icon={Cpu} trend="+2%" color="#00E5FF" />
        <MetricCard title="NEURAL MEMORY" value={`${memoryUsage}%`} icon={MemoryStick} trend="-1.5%" color="#00FF9D" />
        <MetricCard title="ACTIVE MODULES" value={activeModules} icon={Network} color="#A78BFA" />
        <MetricCard title="SYSTEM LATENCY" value="12ms" icon={Activity} trend="-1ms" color="#F472B6" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 glass-panel p-6 min-h-[400px] flex flex-col relative overflow-hidden">
          <div className="absolute inset-0 z-0 opacity-20 pointer-events-none" style={{ backgroundImage: 'linear-gradient(rgba(0, 229, 255, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 229, 255, 0.1) 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
          
          <h2 className="text-lg font-semibold flex items-center gap-2 mb-6 z-10">
            <Network className="text-[#00E5FF] w-5 h-5" /> Neural Network Architecture
          </h2>
          
          {/* Simulated 3D / Neural Graph Area */}
          <div className="flex-1 border border-white/10 rounded-lg bg-black/40 flex items-center justify-center relative overflow-hidden z-10">
            <motion.div 
               animate={{ rotate: 360 }}
               transition={{ duration: 100, repeat: Infinity, ease: "linear" }}
               className="w-96 h-96 border border-[#00E5FF]/20 rounded-full absolute"
            />
            <motion.div 
               animate={{ rotate: -360 }}
               transition={{ duration: 150, repeat: Infinity, ease: "linear" }}
               className="w-[450px] h-[450px] border border-[rgba(0,255,157,0.1)] rounded-full absolute"
            />
            
            <div className="w-24 h-24 rounded-full bg-krishna-bg border border-[#00E5FF] shadow-[0_0_30px_rgba(0,229,255,0.4)] flex items-center justify-center relative z-10">
              <span className="font-mono text-xs font-bold text-[#00E5FF]">CORE</span>
              <div className="absolute inset-0 rounded-full border-2 border-t-[#00E5FF] border-r-transparent border-b-transparent border-l-transparent animate-spin"></div>
            </div>
          </div>
        </div>

        <div className="glass-panel p-6 flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold flex items-center gap-2 text-white/90">
              <Terminal className="text-[#A78BFA] w-5 h-5" /> Recent Operations
            </h2>
            <button 
              onClick={handleDeepScan}
              disabled={isAnalyzing}
              className="text-xs bg-[#A78BFA]/10 hover:bg-[#A78BFA]/20 text-[#A78BFA] px-3 py-1.5 rounded-lg font-mono flex items-center gap-2 transition-colors disabled:opacity-50"
            >
              {isAnalyzing ? <Loader2 size={12} className="animate-spin" /> : <ShieldAlert size={12} />}
              AI Deep Scan
            </button>
          </div>
          
          {threatAssessment && (
            <div className="mb-4 p-3 bg-[#FF3B3B]/10 border border-[#FF3B3B]/20 rounded-lg">
               <div className="flex items-center gap-2 mb-1">
                 <ShieldAlert className="w-4 h-4 text-[#FF3B3B]" />
                 <span className="text-xs font-bold text-[#FF3B3B] tracking-wider uppercase">Neural Security Assessment</span>
               </div>
               <p className="text-xs text-white/80 leading-relaxed font-sans">{threatAssessment}</p>
            </div>
          )}

          <div className="flex-1 space-y-4">
            {logs.map((entry, i) => (
              <div key={i} className="flex gap-3 text-sm border-l-2 border-white/10 pl-3">
                <span className="text-gray-500 font-mono flex-shrink-0">{entry.time}</span>
                <span className="text-gray-300">{entry.log}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Futuristic Cyber Modules Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <NeuralSoundscape />
        <NeuralDefender />
        <NeuralHabits />
        <OSUpdateManager />
      </div>

      <AnimatePresence>
        <motion.div 
          initial={{ opacity: 0, y: 50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ type: 'spring', stiffness: 400, damping: 25 }}
          className="fixed bottom-6 right-6 z-50 flex items-end justify-end"
        >
          <div className="glass-panel p-3 flex border-[#00E5FF]/20 items-center justify-between gap-4 w-72 rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.4)] backdrop-blur-xl">
             <div className="flex items-center gap-3">
               <button 
                 onClick={handleVoiceTrigger}
                 className={`p-3 rounded-full transition-colors relative focus:outline-none ${isListening ? 'bg-[#FF3B3B]/20 text-[#FF3B3B]' : 'bg-[#00E5FF]/10 text-[#00E5FF] hover:bg-[#00E5FF]/20'}`}
               >
                 {isListening ? (
                   <>
                     <Mic className="w-5 h-5 relative z-10" />
                     <motion.div 
                        animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
                        transition={{ repeat: Infinity, duration: 1.5 }}
                        className="absolute inset-0 bg-[#FF3B3B] rounded-full blur-md"
                     />
                   </>
                 ) : (
                   <MicOff className="w-5 h-5" />
                 )}
               </button>
               <div>
                  <div className="text-xs font-mono font-bold text-white/90">HEY KRISHNA</div>
                  <div className="text-[10px] text-gray-400 max-w-[150px] truncate">{voiceText}</div>
               </div>
             </div>
             
             {isListening && (
                <div className="flex gap-1 pr-2">
                   {[...Array(3)].map((_, i) => (
                     <motion.div
                       key={i}
                       className="w-1 bg-[#FF3B3B] rounded-full origin-bottom"
                       initial={{ height: 4 }}
                       animate={{ height: [4, 16, 4] }}
                       transition={{ repeat: Infinity, duration: 0.8, delay: i * 0.2 }}
                     />
                   ))}
                </div>
             )}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

function MetricCard({ title, value, icon: Icon, trend, color }: any) {
  return (
    <div className="glass-panel p-5 relative overflow-hidden group">
      <div className="absolute -inset-1 opacity-0 group-hover:opacity-20 transition-opacity duration-500 blur-xl z-0" style={{ background: color }}></div>
      <div className="relative z-10 flex justify-between items-start">
        <div>
          <p className="text-xs text-gray-400 font-mono mb-1">{title}</p>
          <h3 className="text-3xl font-bold tracking-tight">{value}</h3>
          {(trend) && (
            <p className={`text-xs mt-2 ${trend.startsWith('+') ? 'text-gray-400' : 'text-[#00FF9D]'}`}>
              {trend} from last hour
            </p>
          )}
        </div>
        <div className="p-3 rounded-xl bg-white/5 border border-white/10">
          <Icon className="w-5 h-5" style={{ color }} />
        </div>
      </div>
    </div>
  );
}
