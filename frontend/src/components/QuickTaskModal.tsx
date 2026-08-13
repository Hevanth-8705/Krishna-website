import React, { useState, useEffect, useRef } from 'react';
import { useSystemStore } from '../store/system';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Database, Tag as TagIcon, Zap } from 'lucide-react';

export function QuickTaskModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [taskText, setTaskText] = useState('');
  const [urgency, setUrgency] = useState<'low' | 'medium' | 'high'>('medium');
  const [tag, setTag] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  
  const { setTasks } = useSystemStore();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd+K on Mac, Ctrl+K on Windows
      if ((e.metaKey || e.ctrlKey) && e.key === 'k' && e.shiftKey) { // Or keep previous if desired, but we'll add the custom event
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
      
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };

    const handleCustomTrigger = () => {
      setIsOpen(true);
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('open-quick-task-modal', handleCustomTrigger);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('open-quick-task-modal', handleCustomTrigger);
    };
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      // Small timeout to ensure the modal is rendered before focusing
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
    } else {
      setTaskText('');
      setUrgency('medium');
      setTag('');
    }
  }, [isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskText.trim()) return;

    setTasks((prev) => [
      {
        id: Date.now(),
        text: taskText.trim(),
        status: 'pending',
        urgency,
        tag: tag.trim() || 'General'
      },
      ...prev
    ]);
    
    setIsOpen(false);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm"
          />
          <div className="fixed inset-0 z-[101] flex items-center justify-center p-4 pointer-events-none">
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 10 }}
              className="w-full max-w-lg bg-[#0A0D14] border border-white/10 rounded-2xl shadow-2xl overflow-hidden pointer-events-auto"
            >
              <div className="p-4 border-b border-white/5 flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-[#00E5FF]/10 text-[#00E5FF]">
                  <Database size={16} />
                </div>
                <h3 className="text-sm font-mono text-white/90">Add to Memory Vault</h3>
                <div className="ml-auto flex items-center gap-1.5">
                  <span className="text-[10px] font-mono text-gray-500 bg-white/5 px-1.5 py-0.5 rounded border border-white/10 shadow-[inset_0_-1px_0_rgba(255,255,255,0.1)]">esc</span>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="p-5 flex flex-col gap-4">
                <div>
                  <input
                    ref={inputRef}
                    type="text"
                    value={taskText}
                    onChange={(e) => setTaskText(e.target.value)}
                    placeholder="What do you need to remember?..."
                    className="w-full bg-transparent text-white/90 font-sans text-lg placeholder:text-gray-600 focus:outline-none border-b border-transparent focus:border-[#00E5FF]/30 pb-2 transition-colors"
                  />
                </div>

                <div className="flex flex-wrap gap-4 mt-2">
                  <div className="flex items-center gap-2">
                    <Zap size={14} className="text-gray-500" />
                    <select
                      value={urgency}
                      onChange={(e) => setUrgency(e.target.value as any)}
                      className="bg-black/50 border border-white/10 text-xs font-mono text-gray-400 py-1.5 rounded-lg focus:outline-none focus:border-[#00E5FF]/50 px-2 appearance-none"
                    >
                      <option value="low">Low Priority</option>
                      <option value="medium">Medium Priority</option>
                      <option value="high">High Priority</option>
                    </select>
                  </div>

                  <div className="flex items-center gap-2 flex-1">
                    <TagIcon size={14} className="text-gray-500" />
                    <input
                      type="text"
                      value={tag}
                      onChange={(e) => setTag(e.target.value)}
                      placeholder="Tag (e.g. Project Alpha)"
                      className="w-full bg-black/50 border border-white/10 text-xs font-mono text-gray-300 px-3 py-1.5 rounded-lg focus:outline-none focus:border-[#00E5FF]/50"
                    />
                  </div>
                </div>

                <div className="flex justify-end mt-2 pt-4 border-t border-white/5">
                  <button
                    type="submit"
                    disabled={!taskText.trim()}
                    className="flex items-center gap-2 px-6 py-2 bg-[#00E5FF]/10 text-[#00E5FF] hover:bg-[#00E5FF]/20 border border-[#00E5FF]/30 rounded-lg text-xs font-mono font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Plus size={14} /> ADD ENTRY
                    <span className="text-[9px] font-mono opacity-60 ml-2 bg-black/20 px-1 py-0.5 rounded border border-[#00E5FF]/20">↵ Enter</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
