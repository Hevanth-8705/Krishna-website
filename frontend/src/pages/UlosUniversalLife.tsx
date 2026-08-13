import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Hexagon, 
  BrainCircuit, 
  Activity, 
  Eye, 
  Workflow, 
  Zap, 
  Cpu, 
  Focus, 
  RadioReceiver, 
  Thermometer, 
  HeartPulse, 
  Sparkles,
  Command,
  Target,
  Globe2,
  Lock,
  ChevronRight,
  ShieldCheck,
  TrendingUp,
  Network
} from 'lucide-react';
import { cn } from '../lib/utils';

export default function UlosUniversalLife() {
  const [activeSegment, setActiveSegment] = useState<'overview' | 'context' | 'agents'>('overview');
  const [reactorPulse, setReactorPulse] = useState(false);
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const int = setInterval(() => setReactorPulse(p => !p), 2000);
    const tmr = setInterval(() => setTime(new Date()), 1000);
    return () => { clearInterval(int); clearInterval(tmr); };
  }, []);

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-12 relative min-h-screen font-sans">
      
      {/* Decorative Cybernetic Background Lines */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-20 hidden md:block">
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <path d="M 0 100 Q 200 150 400 100 T 800 100 T 1200 100" fill="none" stroke="#00E5FF" strokeWidth="0.5" className="animate-pulse" />
          <path d="M 200 0 L 200 800" fill="none" stroke="#A78BFA" strokeWidth="0.5" strokeDasharray="4 4" opacity="0.3" />
          <path d="M 600 0 L 600 800" fill="none" stroke="#00FF9D" strokeWidth="0.5" strokeDasharray="4 4" opacity="0.3" />
        </svg>
      </div>

      {/* Header Section */}
      <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b border-[#00E5FF]/20 pb-6">
        <div>
          <div className="flex items-center gap-3">
            <motion.div 
              animate={{ rotate: 360 }} 
              transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
              className="relative p-2"
            >
              <Hexagon className="w-8 h-8 text-[#00E5FF]" />
              <motion.div 
                animate={{ scale: reactorPulse ? 1.2 : 0.8, opacity: reactorPulse ? 0 : 1 }}
                transition={{ duration: 1 }}
                className="absolute inset-0 border border-[#00E5FF] rounded-full"
              />
            </motion.div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white via-[#00E5FF] to-[#A78BFA] tracking-tight">
              UNIVERSAL LIFE OS
            </h1>
          </div>
          <p className="text-sm text-[#00E5FF]/70 font-mono mt-2 tracking-widest uppercase flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#00FF9D] animate-pulse"></span>
            Predictive Ambient Intelligence Engine • Active
          </p>
        </div>

        {/* Global Nav / Active Status */}
        <div className="flex items-center gap-4 bg-black/40 p-2 border border-white/5 rounded-xl backdrop-blur-md">
          {['overview', 'context', 'agents'].map((seg) => (
            <button
              key={seg}
              onClick={() => setActiveSegment(seg as any)}
              className={cn(
                "px-4 py-2 rounded-lg text-xs font-mono uppercase tracking-wider font-bold transition-all",
                activeSegment === seg 
                  ? "bg-[#00E5FF]/20 text-[#00E5FF] border border-[#00E5FF]/30 shadow-[0_0_15px_rgba(0,229,255,0.2)]"
                  : "text-gray-400 hover:text-white hover:bg-white/5 border border-transparent"
              )}
            >
              {seg}
            </button>
          ))}
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={activeSegment}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="relative z-10"
        >
          {activeSegment === 'overview' && <OverviewPanel time={time} />}
          {activeSegment === 'context' && <ContextEnginePanel />}
          {activeSegment === 'agents' && <AgentsPanel />}
        </motion.div>
      </AnimatePresence>

    </div>
  );
}

function OverviewPanel({ time }: { time: Date }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
      
      {/* Central AI Reactor Core (Holographic HUD) */}
      <div className="col-span-1 md:col-span-12 lg:col-span-6 bg-[#0B1120]/80 border border-[#00E5FF]/30 rounded-3xl p-8 relative overflow-hidden backdrop-blur-xl shadow-[0_0_50px_rgba(0,229,255,0.05)]">
        <div className="absolute top-0 right-0 p-4">
          <div className="text-[10px] font-mono text-gray-500 text-right uppercase leading-tight">
            CORE_TEMP_NOMINAL <br/>
            NEURAL_LINK_STABLE <br/>
            {time.toISOString()}
          </div>
        </div>

        <div className="flex flex-col items-center justify-center min-h-[300px] relative">
           {/* Reactor Visuals */}
           <div className="relative w-48 h-48 flex items-center justify-center">
             <motion.div 
               animate={{ rotate: -360 }} 
               transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
               className="absolute inset-0 rounded-full border-2 border-dashed border-[#00E5FF]/20"
             />
             <motion.div 
               animate={{ rotate: 360 }} 
               transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
               className="absolute inset-2 rounded-full border-t-2 border-l-2 border-[#A78BFA]/40"
             />
             <motion.div 
               animate={{ scale: [1, 1.05, 1], opacity: [0.8, 1, 0.8] }}
               transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
               className="absolute inset-8 rounded-full bg-gradient-to-tr from-[#00E5FF]/10 to-[#A78BFA]/10 blur-xl"
             />
             <BrainCircuit className="w-16 h-16 text-[#00E5FF] relative z-10" />
           </div>

           <div className="mt-8 text-center space-y-2 relative z-10">
             <h2 className="text-xl font-bold text-white tracking-widest uppercase">Krishna Global Engine</h2>
             <p className="text-xs text-[#00E5FF] font-mono font-bold tracking-widest bg-[#00E5FF]/10 px-3 py-1 rounded-full border border-[#00E5FF]/20 inline-block">
               SYS.AUTONOMY: ON
             </p>
           </div>
        </div>

        {/* Floating Data Points */}
        <div className="grid grid-cols-3 gap-2 mt-6">
           <HUDMetric icon={Zap} label="Cognitive Load" value="28.4%" color="#00E5FF" />
           <HUDMetric icon={Activity} label="Pred. Accuracy" value="99.2%" color="#00FF9D" />
           <HUDMetric icon={Workflow} label="Active Threads" value="1,024" color="#A78BFA" />
        </div>
      </div>

      {/* Right Column (Tasks & Health) */}
      <div className="col-span-1 md:col-span-12 lg:col-span-6 space-y-6 flex flex-col">
        {/* Predictive Life Assistance */}
        <div className="bg-[#0B1120]/80 border border-white/10 rounded-3xl p-6 relative overflow-hidden backdrop-blur-xl flex-1">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-sm font-bold text-white uppercase flex items-center gap-2 tracking-wider">
              <Compass className="w-5 h-5 text-[#00FF9D]" /> Predictive Decisions
            </h3>
            <span className="text-[9px] px-2 py-1 bg-white/5 rounded border border-white/10 font-mono text-gray-400">NEXT 4 HRS</span>
          </div>

          <div className="space-y-4">
            <PredictiveCard 
              time="14:00" 
              title="Initiating Focus Mode" 
              desc="Based on historical productivity peaks."
              icon={Focus}
              color="emerald"
            />
            <PredictiveCard 
              time="16:30" 
              title="Career Optimization" 
              desc="Found 3 matches for Senior Engineer. Auto-apply queued."
              icon={Target}
              color="indigo"
            />
            <PredictiveCard 
              time="18:00" 
              title="Learning Session" 
              desc="System Design revision scheduled. Resources cached."
              icon={BrainCircuit}
              color="cyan"
            />
          </div>
        </div>

        {/* Ambient Wellbeing Tracker */}
        <div className="bg-[#0B1120]/80 border border-white/10 rounded-3xl p-6 relative overflow-hidden backdrop-blur-xl">
           <div className="flex items-center gap-3 mb-4">
             <HeartPulse className="w-5 h-5 text-rose-400" />
             <h3 className="text-sm font-bold text-white uppercase tracking-wider">Bio-Rhythm & Health</h3>
           </div>
           
           <div className="flex items-center gap-4">
             <div className="flex-1 space-y-1">
               <div className="flex justify-between text-xs font-mono text-gray-400 mb-1">
                 <span>Screen Fatigue</span>
                 <span>62%</span>
               </div>
               <div className="h-1.5 w-full bg-black rounded-full overflow-hidden border border-white/5">
                 <div className="h-full bg-gradient-to-r from-emerald-400 to-amber-500 w-[62%]" />
               </div>
             </div>
             <div className="flex-1 space-y-1">
               <div className="flex justify-between text-xs font-mono text-gray-400 mb-1">
                 <span>Focus Sustain</span>
                 <span className="text-emerald-400">High</span>
               </div>
               <div className="h-1.5 w-full bg-black rounded-full overflow-hidden border border-white/5">
                 <div className="h-full bg-emerald-500 w-[85%]" />
               </div>
             </div>
           </div>
        </div>
      </div>
    </div>
  );
}

function ContextEnginePanel() {
  return (
    <div className="space-y-6">
       <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         {/* Environmental Input */}
         <div className="glass-panel p-6 border-[#00FF9D]/20 hover:border-[#00FF9D]/40 transition-colors">
            <h3 className="text-xs font-bold text-white uppercase tracking-widest flex items-center gap-2 mb-6">
              <Globe2 className="w-4 h-4 text-[#00FF9D]" /> World Model State
            </h3>
            <ul className="space-y-4 font-mono text-xs">
              <li className="flex justify-between border-b border-white/5 pb-2">
                <span className="text-gray-500">Location</span>
                <span className="text-white text-right">Office / Desk</span>
              </li>
              <li className="flex justify-between border-b border-white/5 pb-2">
                <span className="text-gray-500">Time Context</span>
                <span className="text-white text-right">Deep Work Phase</span>
              </li>
              <li className="flex justify-between border-b border-white/5 pb-2">
                <span className="text-gray-500">Device Posture</span>
                <span className="text-white text-right">Stationary (Docked)</span>
              </li>
              <li className="flex justify-between">
                <span className="text-gray-500">Ambient Noise</span>
                <span className="text-[#00FF9D] text-right">Quiet (42dB)</span>
              </li>
            </ul>
         </div>

         {/* Screen & Vision */}
         <div className="glass-panel p-6 border-[#00E5FF]/20 hover:border-[#00E5FF]/40 transition-colors">
            <h3 className="text-xs font-bold text-white uppercase tracking-widest flex items-center gap-2 mb-6">
              <Eye className="w-4 h-4 text-[#00E5FF]" /> Active Screen Parsing
            </h3>
            <div className="space-y-3">
              <div className="bg-black/40 border border-white/5 rounded-lg p-3 relative overflow-hidden">
                <motion.div 
                  className="absolute inset-0 bg-[#00E5FF]/5" 
                  animate={{ y: ["-100%", "100%"] }} 
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                />
                <p className="text-[10px] font-mono leading-relaxed text-gray-300">
                  <span className="text-[#00E5FF] font-bold">DETECTED:</span> Code Editor (VS Code)<br/>
                  <span className="text-gray-500">Language:</span> TypeScript<br/>
                  <span className="text-gray-500">Current Task:</span> API Integration<br/>
                  <span className="text-[#A78BFA] font-bold line-clamp-1 mt-1">{`>> Proposing syntax completion...`}</span>
                </p>
              </div>
            </div>
         </div>

         {/* Memory Engine */}
         <div className="glass-panel p-6 border-[#A78BFA]/20 hover:border-[#A78BFA]/40 transition-colors">
            <h3 className="text-xs font-bold text-white uppercase tracking-widest flex items-center gap-2 mb-6">
              <Database className="w-4 h-4 text-[#A78BFA]" /> Semantic Memory
            </h3>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-[#A78BFA] mt-1.5 shadow-[0_0_8px_#A78BFA]" />
                <div>
                  <p className="text-xs text-white">Recall: Career Goal</p>
                  <p className="text-[10px] text-gray-500 font-mono mt-0.5">Targeting "Lead AI Engineer" by Q4.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 shadow-[0_0_8px_#34d399]" />
                <div>
                  <p className="text-xs text-white">Recall: User Preference</p>
                  <p className="text-[10px] text-gray-500 font-mono mt-0.5">Prefers concise, technical explanations.</p>
                </div>
              </div>
            </div>
         </div>
       </div>

       {/* Visual Knowledge Graph mock */}
       <div className="glass-panel p-6 border-white/5 h-64 flex flex-col items-center justify-center relative overflow-hidden">
         <Network className="absolute inset-x-auto w-48 h-48 text-white/5 opacity-20" />
         <TerminalLines />
         <div className="z-10 text-center">
             <h2 className="text-lg font-bold text-white tracking-widest uppercase">Global Convergence Layer</h2>
             <p className="text-xs text-gray-400 font-mono mt-2 max-w-lg mx-auto leading-relaxed">
               Fusing temporal data arrays, spatial environment metrics, and real-time biometric telemetry into a unified predictive substrate.
             </p>
         </div>
       </div>
    </div>
  );
}

function AgentsPanel() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
       <AgentCard 
         title="Planner Agent" 
         icon={Workflow} 
         status="active" 
         color="#00E5FF" 
         tasks={['Schedule defrag', 'Email triaging', 'Meeting prep']} 
       />
       <AgentCard 
         title="Learning Agent" 
         icon={BrainCircuit} 
         status="active" 
         color="#A78BFA" 
         tasks={['Curate ML papers', 'Flashcard gen', 'Video summary']} 
       />
       <AgentCard 
         title="Career Agent" 
         icon={TrendingUp} 
         status="dormant" 
         color="#F59E0B" 
         tasks={['Resume sync', 'LinkedIn scan', 'Interview mock']} 
       />
       <AgentCard 
         title="Security Agent" 
         icon={ShieldCheck} 
         status="active" 
         color="#FF3B3B" 
         tasks={['Phishing scan', 'Network anomaly', 'Identity vault']} 
       />
    </div>
  );
}

function AgentCard({ title, icon: Icon, status, color, tasks }: any) {
  const isActive = status === 'active';
  return (
    <div className="glass-panel p-5 border-t-2 relative overflow-hidden group hover:bg-white/[0.02] transition-colors" style={{ borderTopColor: color }}>
      {isActive && (
        <div className="absolute top-0 right-0 w-16 h-16 opacity-10 pointer-events-none" style={{ background: `radial-gradient(circle at top right, ${color}, transparent)` }} />
      )}
      <div className="flex items-center justify-between mb-4">
        <div className="p-2 rounded-xl bg-black/40 border border-white/5" style={{ color }}>
          <Icon className="w-5 h-5" />
        </div>
        <span className={cn(
          "text-[9px] font-mono uppercase tracking-widest px-2 py-0.5 rounded border",
          isActive ? "bg-black/50 border-white/10" : "bg-black/20 text-gray-600 border-white/5"
        )} style={isActive ? { color } : {}}>
          {status}
        </span>
      </div>
      <h3 className="text-sm font-bold text-white mb-3">{title}</h3>
      <div className="space-y-2">
        {tasks.map((task: string, i: number) => (
           <div key={i} className="flex items-center gap-2 text-xs font-mono text-gray-400">
             <ChevronRight className="w-3 h-3" style={{ color: isActive ? color : 'inherit' }} />
             {task}
           </div>
        ))}
      </div>
    </div>
  );
}


// Shared HUD Sub-components

function HUDMetric({ icon: Icon, label, value, color }: any) {
  return (
    <div className="flex flex-col items-center justify-center p-3 bg-black/40 border border-white/5 rounded-xl text-center">
      <Icon className="w-4 h-4 mb-2" style={{ color }} />
      <span className="text-lg font-bold font-mono tracking-tight text-white mb-0.5">{value}</span>
      <span className="text-[8px] uppercase tracking-widest text-gray-500">{label}</span>
    </div>
  );
}

function PredictiveCard({ time, title, desc, icon: Icon, color }: any) {
  const colorMap: Record<string, string> = {
    emerald: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20",
    indigo: "text-indigo-400 bg-indigo-400/10 border-indigo-400/20",
    cyan: "text-cyan-400 bg-cyan-400/10 border-cyan-400/20",
  };
  
  return (
    <motion.div 
      whileHover={{ scale: 1.02 }}
      className="flex items-start gap-4 p-3 rounded-xl border border-white/5 bg-black/20 hover:bg-black/40 transition-all cursor-crosshair"
    >
      <div className="w-12 text-center shrink-0 border-r border-white/10 pr-3">
        <span className="text-[10px] text-gray-500 font-mono font-bold block">{time}</span>
      </div>
      <div className="flex-1">
        <h4 className="text-sm font-bold text-white leading-none mb-1 flex items-center gap-2">
          {title}
        </h4>
        <p className="text-[10px] text-gray-400 leading-tight pr-4">{desc}</p>
      </div>
      <div className={cn("p-2 rounded-lg shrink-0 border", colorMap[color])}>
        <Icon className="w-4 h-4" />
      </div>
    </motion.div>
  );
}

function TerminalLines() {
  return (
    <div className="absolute inset-0 pointer-events-none opacity-10 flex flex-col justify-end p-4 font-mono text-[8px] leading-tight text-[#00E5FF]">
      <p>{`> INIT CORE... OK`}</p>
      <p>{`> SYNC NEURAL NODES... 1024 CONNECTED`}</p>
      <p>{`> AMBIENT MODE... LISTENING`}</p>
      <p className="animate-pulse">{`> PREDICTIVE MATRIX STANDBY _`}</p>
    </div>
  );
}

// Stub for Compass icon if missed in imports
function Compass(props: any) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/>
      <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/>
    </svg>
  );
}

// Stub for Database icon if missed in imports
function Database(props: any) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <ellipse cx="12" cy="5" rx="9" ry="3"></ellipse>
      <path d="M3 5V19A9 3 0 0 0 21 19V5"></path>
      <path d="M3 12A9 3 0 0 0 21 12"></path>
    </svg>
  );
}
