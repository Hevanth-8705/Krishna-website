import { useState, useEffect } from 'react';
import { ShieldCheck, ShieldAlert, Cpu, Terminal, RefreshCw, Zap, Sliders, Check, AlertCircle, Shield, Activity, Wrench, ActivitySquare } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import { useSystemStore } from '../store/system';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

interface CommandNode {
  id: string;
  name: string;
  status: 'secured' | 'warning' | 'compromised';
  health: number;
  targetFreq: number;
  currentFreq: number;
}

export function NeuralDefender() {
  const { setSystemMetrics, cpuUsage, memoryUsage } = useSystemStore();
  const [nodes, setNodes] = useState<CommandNode[]>([
    { id: 'firewall', name: 'Neural Firewall', status: 'secured', health: 100, targetFreq: 415, currentFreq: 415 },
    { id: 'database', name: 'Core Registry DB', status: 'warning', health: 76, targetFreq: 512, currentFreq: 490 },
    { id: 'interface', name: 'User OS Overlay', status: 'secured', health: 100, targetFreq: 256, currentFreq: 256 },
    { id: 'voice', name: 'Acoustic Voice Bridge', status: 'secured', health: 100, targetFreq: 440, currentFreq: 440 },
    { id: 'agent', name: 'Krishna Agent Engine', status: 'secured', health: 100, targetFreq: 128, currentFreq: 128 },
    { id: 'wireless', name: 'Wireless Peripheral Grid', status: 'compromised', health: 32, targetFreq: 330, currentFreq: 120 },
    { id: 'kernel', name: 'Kernel Schedulers', status: 'secured', health: 100, targetFreq: 192, currentFreq: 192 },
    { id: 'threat', name: 'AI Threat Assessor', status: 'secured', health: 100, targetFreq: 528, currentFreq: 528 },
    { id: 'vision', name: 'Krishna Vision Stream', status: 'secured', health: 100, targetFreq: 360, currentFreq: 360 },
  ]);

  const [selectedNodeId, setSelectedNodeId] = useState<string>('wireless');
  const [terminalLogs, setTerminalLogs] = useState<string[]>([
    'INIT: Neural Defense sub-kernel online.',
    'WARNING: Unauthorized port perturbation detected on localized wireless gateway.',
    'SUGGESTION: Match system carrier oscillation loops to suppress noise signatures.'
  ]);

  const selectedNode = nodes.find(n => n.id === selectedNodeId) || nodes[0];
  const [tuningVal, setTuningVal] = useState<number>(selectedNode.currentFreq);

  const [activeTab, setActiveTab] = useState<'grid' | 'patch' | 'health'>('grid');
  const [isAutoPatchEnabled, setIsAutoPatchEnabled] = useState<boolean>(false);
  const [autoPatchCount, setAutoPatchCount] = useState<number>(0);
  const [healthHistory, setHealthHistory] = useState<any[]>([]);
  const [activeAlerts, setActiveAlerts] = useState<string[]>([]);

  // Micro Web Audio tone synthesizer
  const playSfx = (frequency: number, type: OscillatorType = 'sine', duration: number = 0.08) => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(frequency, ctx.currentTime);
      gain.gain.setValueAtTime(0.04, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.00001, ctx.currentTime + duration);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch (e) {
      // Gracefully bypass sandbox constraints
    }
  };

  const addLog = (msg: string) => {
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    setTerminalLogs(prev => [`[${time}] ${msg}`, ...prev.slice(0, 10)]);
  };

  // Real-time Smart Auto-Patch Engine (neutralizes drift automatically without user interaction)
  useEffect(() => {
    if (!isAutoPatchEnabled) return;

    // Check if any nodes are currently drifting
    const hasDriftingNodes = nodes.some(n => n.status !== 'secured');
    if (!hasDriftingNodes) return;

    const timer = setTimeout(() => {
      setNodes(prev => {
        let count = 0;
        const mapped = prev.map(n => {
          if (n.status !== 'secured') {
            count++;
            return {
              ...n,
              currentFreq: n.targetFreq,
              health: 100,
              status: 'secured' as const
            };
          }
          return n;
        });

        if (count > 0) {
          addLog(`AUTO_PATCH_SEC: Neutralized noise threat. Automatic alignment hot-patched ${count} drift node(s).`);
          setAutoPatchCount(c => c + count);
          playSfx(880, 'sine', 0.12);
        }
        return mapped;
      });
    }, 1000);

    return () => clearTimeout(timer);
  }, [nodes, isAutoPatchEnabled]);

  // Keep slider matched to node selection and frequency auto-restorations
  useEffect(() => {
    setTuningVal(selectedNode.currentFreq);
  }, [selectedNodeId, selectedNode.currentFreq]);

  // Handle stabilizing/tuning slider input
  const handleTune = (val: number) => {
    setTuningVal(val);
    
    // Update active node's live frequency
    setNodes(prev => prev.map(n => {
      if (n.id === selectedNodeId) {
        const diff = Math.abs(n.targetFreq - val);
        const isMatched = diff <= 3;
        const newHealth = isMatched ? 100 : Math.max(10, Math.round(100 - (diff / n.targetFreq) * 150));
        const newStatus = isMatched ? 'secured' : (newHealth < 40 ? 'compromised' : 'warning');
        
        return {
          ...n,
          currentFreq: val,
          health: newHealth,
          status: newStatus as any
        };
      }
      return n;
    }));
  };

  // Trigger check whenever nodes state changes. If all secured, threat level drops!
  useEffect(() => {
    const activeSecuredCount = nodes.filter(n => n.status === 'secured').length;
    const globalIntegrity = Math.round((nodes.reduce((acc, n) => acc + n.health, 0) / 900) * 100);
    
    // Dynamically adjust store states to respond to user gaming repairs!
    setSystemMetrics({
      threatLevel: globalIntegrity > 90 ? 'LOW' : (globalIntegrity > 60 ? 'MEDIUM' : 'HIGH'),
      cpuUsage: Math.max(8, Math.min(99, Math.round(100 - globalIntegrity + cpuUsage * 0.1))),
      securityIntegrity: globalIntegrity,
    });
  }, [nodes]);

  // Periodically perturb node states lightly to simulate real cybersecurity threat injects!
  useEffect(() => {
    const interval = setInterval(() => {
      const idx = Math.floor(Math.random() * nodes.length);
      const targetNode = nodes[idx];
      
      if (targetNode.status === 'secured' && Math.random() > 0.6) {
        // Drop node
        setNodes(prev => prev.map((n, i) => {
          if (i === idx) {
            const pertOffset = Math.random() > 0.5 ? 40 : -40;
            const newFreq = Math.round(n.targetFreq + pertOffset);
            addLog(`THREAT_ALERT: Anomalous packets found on ${n.name}. Frequency drifting.`);
            return {
              ...n,
              currentFreq: newFreq,
              health: 64,
              status: 'warning'
            };
          }
          return n;
        }));
      }
    }, 15000);

    return () => clearInterval(interval);
  }, [nodes]);

  const handleManualInfect = () => {
    // Simulate inject vector alert
    setNodes(prev => prev.map(n => {
      if (Math.random() > 0.4) {
        const offset = Math.round((Math.random() - 0.5) * 80);
        return {
          ...n,
          currentFreq: Math.round(n.targetFreq + (offset === 0 ? 30 : offset)),
          health: Math.floor(Math.random() * 40 + 20),
          status: Math.random() > 0.5 ? 'compromised' : 'warning'
        };
      }
      return n;
    }));
    addLog('RED_TEAM_INJECT: Sector firewall breached! Restabilize all offset nodes immediately.');
  };

  const handleStabilizeQuick = () => {
    // Synchronize current node to target Freq exactly
    handleTune(selectedNode.targetFreq);
    addLog(`REPAIR_BURST: Active tuning pulses calibrated at standard ${selectedNode.targetFreq} Hz for ${selectedNode.name}.`);
  };

  const handleForceReboot = (nodeId: string) => {
    setNodes(prev => prev.map(n => {
      if (n.id === nodeId) {
        addLog(`FORCE_REBOOT: Recalibrated system node ${n.name} directly. Frequencies aligned, health restored.`);
        playSfx(1200, 'sine', 0.25);
        return {
          ...n,
          currentFreq: n.targetFreq,
          health: 100,
          status: 'secured' as const
        };
      }
      return n;
    }));
  };

  const overallIntegrity = Math.round((nodes.reduce((acc, n) => acc + n.health, 0) / 900) * 100);

  const [isCharging, setIsCharging] = useState(false);

  useEffect(() => {
    if (typeof navigator !== 'undefined' && 'getBattery' in navigator) {
      (navigator as any).getBattery().then((battery: any) => {
        setIsCharging(battery.charging);
        battery.addEventListener('chargingchange', () => {
          setIsCharging(battery.charging);
        });
      });
    }
  }, []);

  // Health History Tracking & Alerts
  useEffect(() => {
    const interval = setInterval(() => {
      setHealthHistory(prev => {
        const time = new Date().toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
        const snapshot: any = { time, timestamp: Date.now() };
        let totalHealth = 0;
        nodes.forEach(n => { 
          snapshot[n.id] = n.health; 
          totalHealth += n.health;
        });
        snapshot.average = Math.round(totalHealth / nodes.length);
        const newHist = [...prev, snapshot];
        if (newHist.length > 20) newHist.shift(); // Keep last 20 ticks
        return newHist;
      });
    }, 2000);
    return () => clearInterval(interval);
  }, [nodes]);

  useEffect(() => {
    nodes.forEach(n => {
      if (n.health < 50) {
        if (!activeAlerts.includes(n.id)) {
           addLog(`CRITICAL ALERT: Health of ${n.name} has dropped below 50% (${n.health}%). Network instability detected.`);
           playSfx(150, 'sawtooth', 0.5);
           setActiveAlerts(prev => [...prev, n.id]);
        }
      } else {
        if (activeAlerts.includes(n.id)) {
           addLog(`RECOVERY: Health of ${n.name} has restabilized above 50% (${n.health}%). Alert cleared.`);
           playSfx(880, 'sine', 0.2);
           setActiveAlerts(prev => prev.filter(id => id !== n.id));
        }
      }
    });
  }, [nodes, activeAlerts]);

  return (
    <div className={cn("glass-panel p-6 flex flex-col relative overflow-hidden h-full", isCharging && "animate-panel-charging-pulse")}>
      <div className="flex items-center justify-between mb-4 z-10">
        <div className="flex items-center gap-2">
          <Cpu className={cn("w-5 h-5", overallIntegrity > 90 ? "text-[#00FF9D]" : "text-[#FF3B3B]")} />
          <h2 className="text-lg font-semibold tracking-tight text-white/90 font-sans">Neural Grid Defense</h2>
        </div>
        <div className="flex items-center gap-2">
          <span className={cn(
            "text-[10px] uppercase font-mono px-2 py-0.5 rounded border border-white/5",
            overallIntegrity > 90 ? "bg-[#00FF9D]/15 text-[#00FF9D]" : "bg-[#FF3B3B]/15 text-[#FF3B3B] animate-pulse"
          )}>
            Core integrity: {overallIntegrity}%
          </span>
        </div>
      </div>

      <p className="text-xs text-gray-400 leading-normal mb-4 z-10 text-left">
        A futuristic cybersecurity sandbox tracker. Calibrate the operating frequencies of drifting system blocks to shield the OS container from localized neural noise.
      </p>

      {/* Segmented Sub-Tabs Selector */}
      <div className="flex border border-white/5 mb-5 z-10 w-full p-0.5 bg-black/40 rounded-lg shrink-0">
        <button
          onClick={() => { setActiveTab('grid'); playSfx(440, 'sine', 0.05); }}
          className={cn(
            "flex-1 py-1.5 text-[10px] font-mono font-bold uppercase tracking-wider rounded-md transition-all cursor-pointer text-center",
            activeTab === 'grid' 
              ? "bg-[#00E5FF]/10 text-[#00E5FF] border border-[#00E5FF]/20 shadow-inner font-extrabold" 
              : "text-gray-400 hover:text-white border border-transparent"
          )}
        >
          Calibration Core
        </button>
        <button
          onClick={() => { setActiveTab('patch'); playSfx(480, 'sine', 0.05); }}
          className={cn(
            "flex-1 py-1.5 text-[10px] font-mono font-bold uppercase tracking-wider rounded-md transition-all cursor-pointer text-center relative flex items-center justify-center gap-1.5",
            activeTab === 'patch' 
              ? "bg-purple-500/15 text-purple-400 border border-purple-500/20 shadow-inner font-extrabold" 
              : "text-gray-400 hover:text-white border border-transparent"
          )}
        >
          {isAutoPatchEnabled && (
            <span className="w-1.5 h-1.5 bg-[#00FF9D] rounded-full animate-pulse shrink-0" />
          )}
          Patch Management
        </button>
        <button
          onClick={() => { setActiveTab('health'); playSfx(520, 'sine', 0.05); }}
          className={cn(
            "flex-1 py-1.5 text-[10px] font-mono font-bold uppercase tracking-wider rounded-md transition-all cursor-pointer text-center relative flex items-center justify-center gap-1.5",
            activeTab === 'health' 
              ? "bg-red-500/15 text-red-400 border border-red-500/20 shadow-inner font-extrabold" 
              : "text-gray-400 hover:text-white border border-transparent"
          )}
        >
          {activeAlerts.length > 0 && (
            <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse shrink-0" />
          )}
          Health Monitor
        </button>
      </div>

      {activeTab === 'grid' ? (
        <>
          {/* Grid of 3x3 Nodes */}
          <div className="grid grid-cols-3 gap-2.5 mb-5 z-10">
            {nodes.map((node) => {
              const isSelected = node.id === selectedNodeId;
              return (
                <div
                  key={node.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => setSelectedNodeId(node.id)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      setSelectedNodeId(node.id);
                    }
                  }}
                  className={cn(
                    "p-2.5 rounded-lg border text-left transition-all duration-300 relative flex flex-col justify-between h-16 cursor-pointer focus:outline-none",
                    isSelected ? "bg-white/5 scale-[1.02] border-[#00E5FF]/40 shadow-[0_0_10px_rgba(0,229,255,0.15)]" : "bg-black/30 border-white/5 hover:bg-white/[0.02]"
                  )}
                >
                  <div className="flex items-center justify-between w-full mb-1 gap-1">
                    <span className="text-[10px] font-bold font-mono truncate max-w-[60%] text-gray-300">
                      {node.name.replace('Neural ', '').replace('Core ', '').replace('Acoustic ', '').replace('Secure ', '').replace('AI ', '')}
                    </span>
                    <div className="flex items-center gap-1.5 shrink-0">
                      {node.status !== 'secured' && (
                        <button
                          title="Force Reboot Node"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleForceReboot(node.id);
                          }}
                          className="px-1 py-0.5 rounded text-[8px] font-mono uppercase bg-[#FF3B3B]/15 hover:bg-[#00FF9D]/20 border border-[#FF3B3B]/30 hover:border-[#00FF9D]/40 text-[#FF3B3B] hover:text-[#00FF9D] transition-all cursor-pointer flex items-center gap-0.5 shadow-sm"
                        >
                          <RefreshCw size={7} className="animate-spin-slow" /> Reboot
                        </button>
                      )}
                      <span className={cn(
                        "w-1.5 h-1.5 rounded-full shrink-0",
                        node.status === 'secured' ? "bg-[#00FF9D]" : (node.status === 'warning' ? "bg-yellow-400" : "bg-[#FF3B3B] animate-ping")
                      )}></span>
                    </div>
                  </div>
                  
                  <div className="w-full">
                    <div className="flex justify-between items-center text-[8px] font-mono text-gray-500 mb-0.5">
                      <span>health</span>
                      <span>{node.health}%</span>
                    </div>
                    <div className="w-full bg-white/5 rounded-full h-1 overflow-hidden">
                      <div 
                        className={cn(
                          "h-full rounded-full transition-all duration-500",
                          node.status === 'secured' ? 'bg-[#00FF9D]' : (node.status === 'warning' ? 'bg-yellow-400' : 'bg-[#FF3B3B]')
                        )} 
                        style={{ width: `${node.health}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Tuner Interface */}
          <div className="p-4 rounded-xl border border-white/5 bg-black/40 mb-4 z-10 text-left">
            <div className="flex items-center justify-between mb-3 border-b border-white/5 pb-1.5">
              <div className="flex items-center gap-1.5">
                <Sliders size={12} className="text-[#00E5FF]" />
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-gray-400">{selectedNode.name} Calibration</span>
              </div>
              <span className="text-[9px] font-mono text-gray-500 uppercase h-fit">
                carrier: {selectedNode.targetFreq}hz
              </span>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between text-xs font-mono text-gray-400">
                <span>Tuning frequency</span>
                <span className={cn("font-bold", selectedNode.status === 'secured' ? "text-[#00FF9D]" : "text-[#00E5FF]")}>
                  {tuningVal} Hz
                </span>
              </div>

              <input
                type="range"
                min={Math.max(40, selectedNode.targetFreq - 150)}
                max={selectedNode.targetFreq + 150}
                step="1"
                value={tuningVal}
                onChange={(e) => handleTune(Number(e.target.value))}
                className="w-full accent-krishna-cyan bg-white/5 rounded-lg appearance-none h-1 cursor-pointer"
              />

              <div className="flex items-center justify-between gap-3 mt-1.5">
                <span className="text-[9px] font-mono text-gray-500 flex items-center gap-1">
                  {selectedNode.status === 'secured' ? (
                    <>
                      <Check size={11} className="text-[#00FF9D]" /> Status: Fully Stabilized
                    </>
                  ) : (
                    <>
                      <AlertCircle size={11} className="text-yellow-400 animate-pulse" /> Alignment drift: {Math.abs(selectedNode.targetFreq - tuningVal)} Hz
                    </>
                  )}
                </span>

                {selectedNode.status !== 'secured' && (
                  <button
                    onClick={handleStabilizeQuick}
                    className="text-[9px] font-mono font-bold text-[#00E5FF] hover:text-[#00FF9D] uppercase border border-[#00E5FF]/20 hover:border-[#00FF9D]/30 px-2 py-0.5 rounded bg-[#00E5FF]/5 cursor-pointer focus:outline-none"
                  >
                    Pulse Calibrator
                  </button>
                )}
              </div>
            </div>
          </div>
        </>
      ) : activeTab === 'patch' ? (
        <div className="space-y-4 mb-4 z-10 text-left flex-1 flex flex-col justify-between">
          {/* Smart Auto-Patch Control Card */}
          <div className="p-4 rounded-xl border border-white/5 bg-black/40 flex items-center justify-between">
            <div className="flex flex-col gap-1 pr-3">
              <div className="flex items-center gap-2">
                <ShieldCheck size={14} className={isAutoPatchEnabled ? "text-[#00FF9D] animate-pulse" : "text-purple-400"} />
                <span className="text-[12px] font-mono font-bold text-white uppercase tracking-wider">Smart Auto-Patch Core</span>
                {isAutoPatchEnabled && (
                  <span className="text-[9px] font-mono text-[#00FF9D] bg-[#00FF9D]/10 px-2 py-0.5 rounded border border-[#00FF9D]/20 animate-pulse font-bold tracking-widest">
                    AUTONOMOUS
                  </span>
                )}
              </div>
              <p className="text-[10px] text-gray-400 leading-relaxed font-sans max-w-sm">
                Leverage real-time frequency stabilization to automatically tune drifting nodes back to baseline values, neutralizing threat vectors instantly without human intervention.
              </p>
            </div>

            <button
              onClick={() => {
                setIsAutoPatchEnabled(!isAutoPatchEnabled);
                playSfx(isAutoPatchEnabled ? 220 : 660, 'sine', 0.1);
                addLog(isAutoPatchEnabled 
                  ? 'PATCH_SYS: Auto-Patch standby. Shifting back to manual calibration contexts.'
                  : 'PATCH_SYS: Smart Auto-Patch initialized. Vulnerability remediation automated.'
                );
              }}
              className={cn(
                "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none",
                isAutoPatchEnabled ? "bg-[#00FF9D]" : "bg-white/10"
              )}
            >
              <span
                className={cn(
                  "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-black shadow ring-0 transition duration-200 ease-in-out",
                  isAutoPatchEnabled ? "translate-x-5" : "translate-x-0"
                )}
              />
            </button>
          </div>

          {/* Stats Bento Deck */}
          <div className="grid grid-cols-2 gap-3 shrink-0">
            <div className="p-3 rounded-xl border border-white/5 bg-black/20 flex flex-col justify-between">
              <span className="text-[8px] font-mono text-gray-500 uppercase tracking-widest block">Patches Applied</span>
              <div className="flex items-baseline gap-1 mt-2 mb-1">
                <span className={cn("text-lg font-bold font-mono tracking-tight", autoPatchCount > 0 ? "text-[#00FF9D]" : "text-gray-400")}>
                  {autoPatchCount}
                </span>
                <span className="text-[8px] font-mono text-gray-500">Events</span>
              </div>
              <span className="text-[8px] font-mono text-gray-500 block">Proactive interventions</span>
            </div>

            <div className="p-3 rounded-xl border border-white/5 bg-black/20 flex flex-col justify-between">
              <span className="text-[8px] font-mono text-gray-500 uppercase tracking-widest block">Mitigation Latency</span>
              <div className="flex items-baseline gap-1 mt-2 mb-1">
                <span className="text-base font-bold font-mono tracking-tight text-[#00E5FF]">
                  &lt; 1.0s
                </span>
                <span className="text-[8px] font-mono text-gray-500">Secs</span>
              </div>
              <span className="text-[8px] font-mono text-gray-500 block">Immediate resolution cycle</span>
            </div>
          </div>

          {/* Real-time drift registry list */}
          <div className="p-3.5 rounded-xl border border-white/5 bg-black/40 space-y-2 flex-1 flex flex-col justify-between min-h-[140px]">
            <div className="flex items-center justify-between border-b border-white/5 pb-1.5 shrink-0">
              <span className="text-[9px] font-mono text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                <Activity size={10} className="text-purple-400" /> Active System Sync Matrix
              </span>
              <span className="text-[8px] font-mono text-gray-500">Target baseline Hz</span>
            </div>
            <div className="overflow-y-auto pr-1 space-y-2 font-mono text-[9.5px] max-h-[120px]">
              {nodes.map(node => {
                const drift = node.currentFreq - node.targetFreq;
                return (
                  <div key={node.id} className="flex items-center justify-between py-1 border-b border-white/[0.02]">
                    <span className="text-gray-300 font-medium text-xs font-mono">{node.name}</span>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-gray-500 text-[10px]">({node.targetFreq} Hz)</span>
                      {drift !== 0 && (
                        <button
                          title="Force Reboot Node"
                          onClick={() => handleForceReboot(node.id)}
                          className="px-1.5 py-0.5 rounded text-[8px] font-mono uppercase bg-[#FF3B3B]/10 hover:bg-[#00FF9D]/20 border border-[#FF3B3B]/25 hover:border-[#00FF9D]/40 text-[#FF3B3B] hover:text-[#00FF9D] transition-all cursor-pointer flex items-center gap-0.5"
                        >
                          <RefreshCw size={7} /> Reboot
                        </button>
                      )}
                      <span className={cn(
                        "font-bold py-0.5 px-1.5 rounded text-[8px] uppercase font-mono",
                        drift === 0 
                          ? "bg-[#00FF9D]/10 text-[#00FF9D] border border-[#00FF9D]/15" 
                          : (Math.abs(drift) > 20 
                              ? "bg-[#FF3B3B]/10 text-[#FF3B3B] border border-[#FF3B3B]/15 animate-pulse" 
                              : "bg-yellow-400/10 text-yellow-400 border border-yellow-400/15")
                      )}>
                        {drift === 0 ? "STABLE" : `${drift > 0 ? "+" : ""}${drift} Hz`}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      ) : activeTab === 'health' ? (
        <div className="flex flex-col gap-4 mb-4 z-10 flex-1">
          <div className="flex flex-col gap-1 pr-3">
            <div className="flex items-center gap-2">
              <ActivitySquare size={14} className="text-[#00E5FF]" />
              <span className="text-[12px] font-mono font-bold text-white uppercase tracking-wider">Health Monitor Analytics</span>
            </div>
            <p className="text-[10px] text-gray-400 leading-relaxed font-sans max-w-sm">
              Real-time structural integrity trends of the neural grid. Algorithms trigger critical recovery events if conditions drop below 50% baseline threshold.
            </p>
          </div>
          
          <div className="flex-1 min-h-[160px] p-2 bg-black/40 border border-white/5 rounded-xl pb-6">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={healthHistory} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
                <XAxis dataKey="time" stroke="#666" fontSize={9} tickMargin={10} tick={{fill: '#666'}} />
                <YAxis domain={[0, 100]} stroke="#666" fontSize={9} tick={{fill: '#666'}} tickFormatter={(val) => `${val}%`} />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', fontSize: '10px' }}
                  itemStyle={{ fontSize: '10px' }}
                />
                <Line type="stepAfter" dataKey="average" name="Aggr Integrity" stroke="#00E5FF" strokeWidth={2} dot={false} activeDot={{ r: 4, fill: '#00E5FF' }} />
                {nodes.map((node, i) => (
                  <Line 
                    key={node.id} 
                    type="monotone" 
                    dataKey={node.id} 
                    name={node.name} 
                    stroke={['#FF3B3B', '#00FF9D', '#FFB800', '#A78BFA', '#F472B6', '#38BDF8', '#4ADE80', '#FBBF24', '#FB923C'][i % 9]} 
                    strokeWidth={1.5} 
                    dot={false}
                    opacity={0.4}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      ) : null}

      {/* Terminal Logs inside Defender */}
      <div className="flex-1 min-h-[72px] border border-white/5 rounded-xl bg-black/80 font-mono text-[9px] p-3 text-gray-400 overflow-y-auto space-y-1.5">
        <div className="flex items-center justify-between text-gray-500 uppercase tracking-widest border-b border-white/5 pb-1 mb-1">
          <span className="flex items-center gap-1.5"><Terminal size={10} /> Sector Audit Feed</span>
          <span className="text-[8px]">Secured Cores</span>
        </div>
        {terminalLogs.map((log, index) => (
          <div key={index} className="truncate leading-relaxed flex gap-1.5">
            <span className="text-[#00E5FF]/70">&gt;</span>
            <span className={cn(
              log.includes('THREAT_ALERT') ? 'text-[#FF3B3B]' : 
              log.includes('REPAIR') ? 'text-[#00FF9D]' : 'text-gray-400'
            )}>{log}</span>
          </div>
        ))}
      </div>

      {/* Action triggers */}
      <div className="flex items-center gap-3 border-t border-white/5 pt-4 mt-4 z-10 justify-between">
        <button
          onClick={handleManualInfect}
          className="text-[10px] border border-[#FF3B3B]/20 hover:border-[#FF3B3B]/40 hover:bg-[#FF3B3B]/10 font-mono font-bold text-[#FF3B3B] px-3.5 py-1.5 rounded-lg transition-colors cursor-pointer focus:outline-none uppercase"
        >
          Inject Noise Challenge
        </button>
        <button
          onClick={() => {
            setNodes(prev => prev.map(n => ({ ...n, currentFreq: n.targetFreq, health: 100, status: 'secured' })));
            addLog('SYS_RESET: Full neurological network diagnostics matched at 100% security state.');
          }}
          className="text-[10px] border border-white/5 hover:border-white/10 hover:bg-white/5 font-mono font-bold text-gray-400 hover:text-white px-3.5 py-1.5 rounded-lg transition-colors cursor-pointer focus:outline-none uppercase flex items-center gap-1"
        >
          <RefreshCw size={10} /> Reset Security Grid
        </button>
      </div>
    </div>
  );
}
