import { useState } from 'react';
import { Volume2, VolumeX, Trash2, Moon, Sun, Zap, Focus } from 'lucide-react';
import { useSystemStore } from '../store/system';

export function QuickActionsPanel() {
  const [isMuted, setIsMuted] = useState(false);
  const [isNightMode, setIsNightMode] = useState(true);
  const [isClearing, setIsClearing] = useState(false);
  const { zenMode, setZenMode } = useSystemStore();

  const handleClearCache = () => {
    if (isClearing) return;
    setIsClearing(true);
    setTimeout(() => setIsClearing(false), 1500);
  };

  return (
    <div className="glass-panel p-6 relative overflow-hidden group border border-white/5">
      <div className="absolute top-0 right-0 w-32 h-32 bg-[#F59E0B]/5 blur-3xl rounded-full"></div>
      
      <div className="relative z-10 w-full flex flex-col h-full">
        <h2 className="text-[10px] font-mono tracking-widest text-[#F59E0B] uppercase mb-4 flex items-center gap-2">
          <Zap size={12} /> OS Quick Actions
        </h2>
        
        <div className="flex-1 grid grid-cols-2 gap-3 justify-center">
          <button 
            onClick={() => setIsMuted(!isMuted)}
            className={`flex items-center justify-between p-3 rounded-lg border transition-all ${isMuted ? 'bg-[#FF3B3B]/10 border-[#FF3B3B]/30 text-[#FF3B3B]' : 'bg-black/50 border-white/10 text-gray-300 hover:bg-white/5'}`}
          >
            <span className="text-xs font-mono font-bold truncate mr-2">{isMuted ? 'UNMUTE' : 'MUTE'}</span>
            <Volume2 size={16} className={isMuted ? 'hidden' : 'block flex-shrink-0'} />
            <VolumeX size={16} className={isMuted ? 'block flex-shrink-0' : 'hidden'} />
          </button>

          <button 
            onClick={handleClearCache}
            disabled={isClearing}
            className={`flex items-center justify-between p-3 rounded-lg border transition-all ${isClearing ? 'bg-[#00FF9D]/10 border-[#00FF9D]/30 text-[#00FF9D]' : 'bg-black/50 border-white/10 text-gray-300 hover:bg-white/5'}`}
          >
            <span className="text-xs font-mono font-bold truncate mr-2">{isClearing ? 'CLEARING...' : 'CLEAR CACHE'}</span>
            <Trash2 size={16} className={isClearing ? "animate-pulse flex-shrink-0" : "flex-shrink-0"} />
          </button>

          <button 
            onClick={() => setIsNightMode(!isNightMode)}
            className={`flex items-center justify-between p-3 rounded-lg border transition-all ${isNightMode ? 'bg-[#A78BFA]/10 border-[#A78BFA]/30 text-[#A78BFA]' : 'bg-yellow-500/10 border-yellow-500/30 text-yellow-500'}`}
          >
            <span className="text-xs font-mono font-bold truncate mr-2">{isNightMode ? 'DAY MODE' : 'NIGHT MODE'}</span>
            <Moon size={16} className={isNightMode ? 'hidden' : 'block flex-shrink-0'} />
            <Sun size={16} className={isNightMode ? 'block flex-shrink-0' : 'hidden'} />
          </button>

          <button 
            onClick={() => setZenMode(!zenMode)}
            className={`flex items-center justify-between p-3 rounded-lg border transition-all ${zenMode ? 'bg-[#00E5FF]/20 border-[#00E5FF]/50 text-[#00E5FF]' : 'bg-black/50 border-white/10 text-gray-300 hover:bg-white/5'}`}
          >
            <span className="text-xs font-mono font-bold truncate mr-2">{zenMode ? 'EXIT ZEN' : 'ZEN MODE'}</span>
            <Focus size={16} className="flex-shrink-0" />
          </button>
        </div>
      </div>
    </div>
  );
}
