import { useState, useEffect } from 'react';
import { Activity, Cpu, Network, Database, BrainCircuit } from 'lucide-react';
import { useSystemStore } from '../store/system';

export function SystemHealthVisualizer() {
  const { cpuUsage, memoryUsage } = useSystemStore();
  const [neuralLinkState, setNeuralLinkState] = useState(85);
  const [encryptionStatus, setEncryptionStatus] = useState(100);

  useEffect(() => {
    // Simulate real-time background processes
    const interval = setInterval(() => {
      setNeuralLinkState(prev => Math.min(100, Math.max(0, prev + (Math.random() * 10 - 5))));
      setEncryptionStatus(prev => Math.min(100, Math.max(90, prev + (Math.random() * 4 - 2))));
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="glass-panel p-6 relative overflow-hidden group border border-white/5">
      <div className="absolute top-0 left-0 w-32 h-32 bg-[#00E5FF]/5 blur-3xl rounded-full"></div>
      
      <div className="relative z-10 w-full">
        <h2 className="text-[10px] font-mono tracking-widest text-[#00E5FF] uppercase mb-4 flex items-center gap-2">
          <Activity size={12} /> Live System Health
        </h2>
        
        <div className="space-y-5">
          <ProgressBar 
            label="Neural Link Status" 
            value={neuralLinkState} 
            color="bg-[#00E5FF]" 
            icon={BrainCircuit} 
          />
          <ProgressBar 
            label="Memory Allocation" 
            value={memoryUsage} 
            color="bg-[#00FF9D]" 
            icon={Database} 
          />
          <ProgressBar 
            label="CPU Core Load" 
            value={cpuUsage} 
            color="bg-[#A78BFA]" 
            icon={Cpu} 
          />
          <ProgressBar 
            label="Encryption Integrity" 
            value={encryptionStatus} 
            color="bg-white" 
            icon={Network} 
          />
        </div>
      </div>
    </div>
  );
}

function ProgressBar({ label, value, color, icon: Icon }: { label: string; value: number; color: string; icon: any }) {
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between items-center text-xs font-mono text-gray-300">
        <span className="flex items-center gap-1.5"><Icon size={12} className="opacity-70" /> {label}</span>
        <span>{value.toFixed(1)}%</span>
      </div>
      <div className="h-1.5 w-full bg-black/50 rounded-full overflow-hidden border border-white/5">
        <div 
          className={`h-full ${color} transition-all duration-1000 ease-out`} 
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}
