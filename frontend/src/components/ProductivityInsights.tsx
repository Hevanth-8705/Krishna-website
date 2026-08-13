import { Target, Play, Pause, Square } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useSystemStore } from '../store/system';
import { useEffect } from 'react';

export function ProductivityInsights() {
  const data = useSystemStore(state => state.productivityData);
  const { focusState, focusTimeRemaining, setFocusState, setFocusTimeRemaining, completeFocusSession } = useSystemStore();

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (focusState === 'running' && focusTimeRemaining > 0) {
      interval = setInterval(() => {
        setFocusTimeRemaining((prev) => {
          if (prev <= 1) {
            completeFocusSession();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [focusState, focusTimeRemaining, setFocusTimeRemaining, completeFocusSession]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const handleStart = () => {
    if (focusState === 'idle') setFocusTimeRemaining(25 * 60);
    setFocusState('running');
  };

  return (
    <div className="glass-panel p-6 relative overflow-hidden group border border-white/5 flex flex-col h-full">
      <div className="absolute top-0 right-0 w-32 h-32 bg-[#A78BFA]/5 blur-3xl rounded-full"></div>
      
      <div className="relative z-10 w-full flex flex-col flex-1">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-[10px] font-mono tracking-widest text-[#A78BFA] uppercase flex items-center gap-2">
            <Target size={12} /> Productivity Insights
          </h2>
          
          <div className="flex items-center gap-3">
            <div className={`font-mono text-xs ${focusState === 'running' ? 'text-[#00FF9D]' : 'text-gray-400'}`}>
              DEEP FOCUS: {formatTime(focusTimeRemaining)}
            </div>
            <div className="flex gap-1">
              {focusState !== 'running' ? (
                <button onClick={handleStart} className="p-1 rounded bg-[#00FF9D]/10 hover:bg-[#00FF9D]/20 text-[#00FF9D] transition-colors border border-[#00FF9D]/20">
                  <Play size={12} fill="currentColor" />
                </button>
              ) : (
                <button onClick={() => setFocusState('paused')} className="p-1 rounded bg-[#F59E0B]/10 hover:bg-[#F59E0B]/20 text-[#F59E0B] transition-colors border border-[#F59E0B]/20">
                  <Pause size={12} fill="currentColor" />
                </button>
              )}
              <button 
                onClick={() => { setFocusState('idle'); setFocusTimeRemaining(25 * 60); }} 
                className="p-1 rounded bg-white/5 hover:bg-white/10 text-gray-400 transition-colors border border-white/5"
                disabled={focusState === 'idle'}
              >
                <Square size={12} fill="currentColor" />
              </button>
            </div>
          </div>
        </div>
        
        <div className="flex-1 w-full min-h-[150px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
              <XAxis dataKey="name" stroke="#666" tick={{ fill: '#888', fontSize: 10 }} tickLine={false} axisLine={false} />
              <YAxis stroke="#666" tick={{ fill: '#888', fontSize: 10 }} tickLine={false} axisLine={false} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#000', border: '1px solid #333', borderRadius: '8px', fontSize: '12px' }}
                itemStyle={{ color: '#A78BFA' }}
              />
              <Line type="monotone" dataKey="tasks" stroke="#A78BFA" strokeWidth={2} dot={{ r: 3, fill: '#A78BFA' }} activeDot={{ r: 5 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
