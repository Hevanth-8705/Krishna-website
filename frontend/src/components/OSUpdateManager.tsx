import { useState, useEffect } from 'react';
import { ShieldCheck, DownloadCloud, AlertTriangle, Loader2 } from 'lucide-react';
import { motion } from 'motion/react';

export function OSUpdateManager() {
  const [updateStatus, setUpdateStatus] = useState<'up_to_date' | 'checking' | 'update_available' | 'patching'>('up_to_date');
  const [patchProgress, setPatchProgress] = useState(0);

  // Simulated periodic integrity check
  useEffect(() => {
    if (updateStatus === 'up_to_date') {
      const timer = setTimeout(() => {
        setUpdateStatus('update_available');
      }, Math.random() * 20000 + 10000); // 10-30 seconds
      return () => clearTimeout(timer);
    }
  }, [updateStatus]);

  const handlePatch = () => {
    if (updateStatus !== 'update_available') return;
    setUpdateStatus('patching');
    setPatchProgress(0);

    const interval = setInterval(() => {
      setPatchProgress(prev => {
        const next = prev + Math.random() * 15;
        if (next >= 100) {
          clearInterval(interval);
          setTimeout(() => setUpdateStatus('up_to_date'), 500);
          return 100;
        }
        return next;
      });
    }, 400);
  };

  const handleCheckNow = () => {
    if (updateStatus !== 'up_to_date' && updateStatus !== 'update_available') return;
    setUpdateStatus('checking');
    setTimeout(() => {
      setUpdateStatus('update_available');
    }, 2000);
  };

  return (
    <div className="glass-panel p-6 relative overflow-hidden group border border-white/5 flex flex-col h-full">
      <div className="absolute inset-0 bg-gradient-to-br from-[#A78BFA]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      
      <div className="flex items-center justify-between mb-4 relative z-10">
        <h3 className="text-[10px] font-mono tracking-wider text-gray-400 uppercase flex items-center gap-2">
          <ShieldCheck size={14} className="text-[#A78BFA]" />
          OS Update
        </h3>
        {updateStatus === 'up_to_date' && (
          <span className="text-[9px] font-mono text-[#00FF9D] bg-[#00FF9D]/10 px-1.5 py-0.5 rounded border border-[#00FF9D]/20 uppercase">
            Secured
          </span>
        )}
        {updateStatus === 'checking' && (
          <span className="text-[9px] font-mono text-gray-400 bg-white/5 px-1.5 py-0.5 rounded border border-white/10 uppercase flex items-center gap-1">
             <Loader2 size={10} className="animate-spin" /> Verifying
          </span>
        )}
        {updateStatus === 'update_available' && (
          <span className="text-[9px] font-mono text-[#F59E0B] bg-[#F59E0B]/10 px-1.5 py-0.5 rounded border border-[#F59E0B]/20 uppercase animate-pulse">
            Available
          </span>
        )}
        {updateStatus === 'patching' && (
          <span className="text-[9px] font-mono text-[#A78BFA] bg-[#A78BFA]/10 px-1.5 py-0.5 rounded border border-[#A78BFA]/20 uppercase flex items-center gap-1">
             <Loader2 size={10} className="animate-spin" /> Patching
          </span>
        )}
      </div>

      <div className="flex-1 flex flex-col items-center justify-center gap-4 relative z-10 mt-2">
        {updateStatus === 'up_to_date' && (
          <>
            <motion.div 
               initial={{ scale: 0.8, opacity: 0 }} 
               animate={{ scale: 1, opacity: 1 }} 
               className="p-4 rounded-full bg-[#00FF9D]/5 border border-[#00FF9D]/20 text-[#00FF9D]"
            >
              <ShieldCheck size={28} />
            </motion.div>
            <p className="text-xs text-gray-400 font-mono text-center">
              Core integrity verified.<br/>No patches required.
            </p>
            <button
               onClick={handleCheckNow}
               className="mt-1 text-[10px] uppercase tracking-wider font-mono px-3 py-1.5 bg-white/5 hover:bg-white/10 text-white/70 border border-white/10 rounded transition-colors cursor-pointer"
            >
              Check Integrity
            </button>
          </>
        )}

        {updateStatus === 'checking' && (
          <>
             <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                className="w-14 h-14 rounded-full border-2 border-white/10 border-t-[#A78BFA] flex items-center justify-center"
             >
                <div className="w-8 h-8 rounded-full border border-[rgba(167,139,250,0.2)] animate-pulse" />
             </motion.div>
             <p className="text-[10px] text-[#A78BFA] font-mono animate-pulse text-center mt-2">Comparing neural<br/>checksums...</p>
          </>
        )}

        {updateStatus === 'update_available' && (
          <>
             <motion.div 
               initial={{ y: -5, opacity: 0 }} 
               animate={{ y: 0, opacity: 1 }} 
               className="p-3 rounded-full bg-[#F59E0B]/10 border border-[#F59E0B]/30 text-[#F59E0B] shadow-[0_0_15px_rgba(245,158,11,0.2)]"
             >
               <AlertTriangle size={24} />
             </motion.div>
             <div className="text-center">
                <h4 className="text-[11px] font-sans font-bold text-white mb-1">Security Patch v4.2.9</h4>
                <p className="text-[9px] text-gray-500 font-mono tracking-widest leading-tight">CRITICAL KERNEL FIX</p>
             </div>
             
             <button
               onClick={handlePatch}
               className="w-full mt-1 flex items-center justify-center gap-2 py-2 bg-[#A78BFA]/10 hover:bg-[#A78BFA]/20 border border-[#A78BFA]/30 rounded-lg text-[10px] font-mono font-bold text-[#A78BFA] transition-all cursor-pointer"
             >
               <DownloadCloud size={12} /> INITIALIZE PATCH
             </button>
          </>
        )}

        {updateStatus === 'patching' && (
          <div className="w-full flex justify-center flex-col gap-3 mt-4">
             <div className="flex justify-between items-end mb-1">
                <span className="text-[9px] font-mono text-[#A78BFA]">Patching pathways...</span>
                <span className="text-[9px] font-mono text-gray-400">{Math.round(patchProgress)}%</span>
             </div>
             
             <div className="w-full h-1 bg-black/50 rounded-full overflow-hidden border border-white/5 relative">
                <motion.div 
                   className="absolute top-0 left-0 h-full bg-[#A78BFA]"
                   initial={{ width: 0 }}
                   animate={{ width: `${patchProgress}%` }}
                   transition={{ ease: "linear", duration: 0.4 }}
                />
             </div>
             
             <div className="text-[9px] font-mono text-gray-500 uppercase flex gap-2">
                <div className="flex-1 flex gap-1 items-center">
                   <div className="w-1.5 h-1.5 rounded-full bg-[#00FF9D] animate-pulse" /> Block {Math.floor(patchProgress / 5)} compiled
                </div>
             </div>
          </div>
        )}
      </div>
    </div>
  );
}
