import { Activity, Flame, Sparkles } from 'lucide-react';
import { useState } from 'react';
import { useSystemStore, Habit } from '../store/system';

export function NeuralHabits() {
  const { habits, toggleHabitToday } = useSystemStore();
  const [celebratingId, setCelebratingId] = useState<number | null>(null);

  const handleToggle = (habit: Habit, isToday: boolean, wasCompleted: boolean) => {
    if (!isToday) return;
    
    const newStreak = wasCompleted ? Math.max(0, habit.streak - 1) : habit.streak + 1;
    if (!wasCompleted && newStreak > 0 && newStreak % 7 === 0) {
      setCelebratingId(habit.id);
      setTimeout(() => setCelebratingId(null), 1500); // the animation takes 1s, keeping state a bit longer is fine
    }
    
    toggleHabitToday(habit.id);
  };

  return (
    <div className="glass-panel p-6 relative overflow-hidden group border border-white/5 flex flex-col h-full">
      <div className="absolute inset-0 bg-gradient-to-br from-[#00FF9D]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      
      <div className="flex items-center justify-between mb-6 relative z-10">
        <h3 className="text-[10px] font-mono tracking-wider text-gray-400 uppercase flex items-center gap-2">
          <Activity size={14} className="text-[#00FF9D]" />
          Neural Habits
        </h3>
        <span className="text-[9px] font-mono text-gray-500 bg-white/5 px-2 py-0.5 rounded border border-white/10 uppercase">
          28-Day Vector
        </span>
      </div>

      <div className="flex-1 flex flex-col gap-5 relative z-10 justify-center">
        {habits.map((habit) => {
          const isCelebrating = celebratingId === habit.id;
          return (
            <div key={habit.id} className="flex flex-col gap-2.5">
              <div className="flex justify-between items-center relative">
                <span className="text-xs text-white/90 font-sans tracking-tight">{habit.name}</span>
                <span className={`text-[10px] font-mono flex items-center gap-1 px-1.5 py-0.5 rounded border ${
                    isCelebrating 
                      ? 'text-[#00FF9D] bg-[#00FF9D]/20 border-[#00FF9D] animate-habit-celebration' 
                      : 'text-[#F472B6] bg-[#F472B6]/10 border-[#F472B6]/20'
                  } transition-all duration-300 z-10`}
                >
                  {isCelebrating ? <Sparkles size={10} /> : <Flame size={10} />}
                  {habit.streak} STREAK
                </span>
                
                {/* Floating particle effect for celebration */}
                {isCelebrating && (
                  <div className="absolute right-0 top-0 w-full h-full pointer-events-none flex justify-end">
                     <span className="animate-ping absolute right-2 inline-flex h-full w-4 rounded-full bg-[#00FF9D] opacity-40"></span>
                  </div>
                )}
              </div>
              <div className="flex gap-1">
                {habit.history.map((completed, index) => {
                  const isToday = index === habit.history.length - 1;
                  return (
                    <button
                      key={index}
                      disabled={!isToday}
                      onClick={() => handleToggle(habit, isToday, completed)}
                      title={isToday ? "Toggle Today" : ""}
                      className={`h-2 flex-1 rounded-[1px] transition-all duration-300 ${
                        completed 
                          ? 'bg-[#00FF9D] shadow-[0_0_8px_rgba(0,255,157,0.4)]' 
                          : 'bg-white/5'
                      } ${
                        isToday 
                          ? 'border border-[#00FFF0] cursor-pointer hover:bg-[#00FF9D]/50 target-square' 
                          : 'opacity-75 cursor-default'
                      }`}
                    />
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
