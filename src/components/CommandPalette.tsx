import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSystemStore } from '../store/system';
import { useTheme } from '../context/ThemeContext';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Search, 
  LayoutDashboard, 
  BrainCircuit, 
  Sparkles, 
  Mic, 
  History, 
  Workflow, 
  Database, 
  Briefcase, 
  BookOpen, 
  ShieldAlert, 
  Hexagon, 
  Moon, 
  Sun, 
  Command, 
  Cpu, 
  Flame, 
  Trash2, 
  Clock, 
  EyeOff, 
  Sparkle,
  Zap,
  ChevronRight,
  ShieldCheck,
  VolumeX,
  Volume2,
  Smartphone
} from 'lucide-react';

interface CommandItem {
  id: string;
  category: 'NAVIGATION' | 'SYSTEM_ACTION';
  title: string;
  subtitle: string;
  icon: React.ElementType;
  shortcut?: string;
  color: string;
  action?: () => void;
  route?: string;
}

export function CommandPalette() {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [paletteNotice, setPaletteNotice] = useState<string | null>(null);
  const [executingId, setExecutingId] = useState<string | null>(null);

  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  
  const { 
    setSystemMetrics, 
    setZenMode, 
    setFocusState, 
    focusState, 
    zenMode, 
    activeModules,
    tasks,
    setTasks
  } = useSystemStore();

  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Trigger notification within the palette briefly
  const triggerPaletteNotice = (msg: string) => {
    setPaletteNotice(msg);
    setTimeout(() => {
      setPaletteNotice(null);
    }, 3000);
  };

  // Pre-compiled list of all navigational modules & interactive quick actions
  const commandItems: CommandItem[] = useMemo(() => [
    // --- Navigation ---
    {
      id: 'nav-dashboard',
      category: 'NAVIGATION',
      title: 'Dashboard Overview',
      subtitle: 'Analyze grid metrics, active load percentages, and real-time logs diagnostics.',
      icon: LayoutDashboard,
      route: '/dashboard',
      color: 'text-[#00E5FF]',
    },
    {
      id: 'nav-core',
      category: 'NAVIGATION',
      title: 'Krishna AI Core',
      subtitle: 'Tune core weights, prompt rulesets, model aliases, and generative weights.',
      icon: BrainCircuit,
      route: '/core',
      color: 'text-[#00FF9D]',
    },
    {
      id: 'nav-canvas',
      category: 'NAVIGATION',
      title: 'Neural Canvas Designer',
      subtitle: 'Vibe check active creative graphics buffers, live drawing, and vector assets.',
      icon: Sparkles,
      route: '/canvas',
      color: 'text-[#A78BFA]',
    },
    {
      id: 'nav-voice',
      category: 'NAVIGATION',
      title: 'Voice Command Assistant',
      subtitle: 'Trigger continuous auditory voice decoding and vocal biometrics capture.',
      icon: Mic,
      route: '/voice',
      color: 'text-pink-400',
    },
    {
      id: 'nav-learn',
      category: 'NAVIGATION',
      title: 'Adaptive Learning Center',
      subtitle: 'Resume personalized milestone logs, active educational tracks, and quizzes.',
      icon: BookOpen,
      route: '/learn',
      color: 'text-emerald-400',
    },
    {
      id: 'nav-guardian',
      category: 'NAVIGATION',
      title: 'OS Guardian Firewall',
      subtitle: 'Review clearance levels, active kernel threat scans, and sandbox sweeps.',
      icon: ShieldAlert,
      route: '/guardian',
      color: 'text-[#FF3B3B]',
    },
    {
      id: 'nav-ulos',
      category: 'NAVIGATION',
      title: 'Universal Life OS',
      subtitle: 'Coordinate autonomous AI agent routines, daily metrics, and life routines.',
      icon: Hexagon,
      route: '/ulos',
      color: 'text-rose-400',
    },

    // --- Interactive Actions ---
    {
      id: 'act-theme',
      category: 'SYSTEM_ACTION',
      title: 'Toggle Desktop Theme',
      subtitle: `Transition active design between Deep Space midnight and bright Cyber-Light presets.`,
      icon: theme === 'deep-space' ? Sun : Moon,
      shortcut: 'T',
      color: 'text-[#F59E0B]',
      action: () => {
        toggleTheme();
        triggerPaletteNotice(`Switched theme configuration to ${theme === 'deep-space' ? 'Cyber-Light' : 'Deep Space'}`);
      }
    },
    {
      id: 'act-zen',
      category: 'SYSTEM_ACTION',
      title: zenMode ? 'Deactivate Zen Focus Mode' : 'Activate Absolute Zen Workspace',
      subtitle: 'Hides standard navigation panels and diagnostic indicators for raw focused space.',
      icon: EyeOff,
      shortcut: 'Z',
      color: 'text-[#A78BFA]',
      action: () => {
        setZenMode(prev => !prev);
        triggerPaletteNotice(!zenMode ? 'Absolute Zen Workspace ENGAGED' : 'Zen Workspace DISENGAGED');
      }
    },
    {
      id: 'act-sweep',
      category: 'SYSTEM_ACTION',
      title: 'Launch Local Firewall Threat-Scan',
      subtitle: 'Flush system processes, search port leaks, and scale core security integrity weight to 100%.',
      icon: ShieldCheck,
      shortcut: 'S',
      color: 'text-[#FF3B3B]',
      action: () => {
        setExecutingId('act-sweep');
        setTimeout(() => {
          setSystemMetrics({
            threatLevel: 'LOW',
            securityIntegrity: 100,
            activeModules: activeModules + 1
          });
          setExecutingId(null);
          triggerPaletteNotice('OS firewall deep scan complete. Internal security clearance SECURED 100%');
        }, 1500);
      }
    },
    {
      id: 'act-optimize',
      category: 'SYSTEM_ACTION',
      title: 'Trigger Core CPU Thermal Calibration',
      subtitle: 'Purge dynamic browser cache counters, down-throttle CPU registers, and optimize memory.',
      icon: Cpu,
      shortcut: 'O',
      color: 'text-[#00FF9D]',
      action: () => {
        setExecutingId('act-optimize');
        setTimeout(() => {
          setSystemMetrics({
            cpuUsage: 8,
            memoryUsage: 36
          });
          setExecutingId(null);
          triggerPaletteNotice('CPU thermals recalibrated: core throttle optimized.');
        }, 1200);
      }
    },
    {
      id: 'act-timer',
      category: 'SYSTEM_ACTION',
      title: focusState === 'running' ? 'Pause Deep Focus Countdown' : 'Engage 25m Focus Countdown',
      subtitle: 'Toggle active Pomodoro intervals globally with real-time status tracking.',
      icon: Clock,
      shortcut: 'P',
      color: 'text-[#00E5FF]',
      action: () => {
        if (focusState === 'running') {
          setFocusState('paused');
          triggerPaletteNotice('Linguistic focus timeline PAUSED.');
        } else {
          setFocusState('running');
          triggerPaletteNotice('Linguistic focus timeline COMMENCED (25M).');
        }
      }
    },
    {
      id: 'act-add-task',
      category: 'SYSTEM_ACTION',
      title: 'Inject System Maintenance Tick',
      subtitle: 'Creates a routine task backup in system scheduler directly.',
      icon: Zap,
      shortcut: 'K',
      color: 'text-[#00FF9D]',
      action: () => {
        const newTaskText = `System security audit partition tick ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
        setTasks(prev => [
          {
            id: Date.now(),
            text: newTaskText,
            urgency: 'medium',
            tag: 'Maintenance',
            status: 'pending'
          },
          ...prev
        ]);
        triggerPaletteNotice('Routine audit scheduling injected successfully.');
      }
    },
    {
      id: 'act-affirmation',
      category: 'SYSTEM_ACTION',
      title: 'Download Dynamic Core Affirmation',
      subtitle: 'Pull custom motivational logic to stabilize human workspace integration.',
      icon: Sparkle,
      shortcut: 'A',
      color: 'text-pink-400',
      action: () => {
        const statements = [
          "The core is highly tuned. Your creative drive operates at optimum bandwidth.",
          "Network status: STABLE. Remember to take a cognitive buffer pause.",
          "Complex algorithms compile cleanly. Success is an iterative sequence of loops.",
          "Security bounds verified active. Your workspace remains insulated and progressive."
        ];
        const randomAff = statements[Math.floor(Math.random() * statements.length)];
        triggerPaletteNotice(`Core affirmation: "${randomAff}"`);
      }
    }
  ], [theme, toggleTheme, setSystemMetrics, setZenMode, setFocusState, focusState, zenMode, activeModules, setTasks]);

  // Handle live search calculations
  const filteredItems = useMemo(() => {
    if (!searchQuery.trim()) return commandItems;
    const query = searchQuery.toLowerCase();
    return commandItems.filter(
      item => 
        item.title.toLowerCase().includes(query) || 
        item.subtitle.toLowerCase().includes(query) || 
        item.category.toLowerCase().includes(query)
    );
  }, [searchQuery, commandItems]);

  // Keep selectedIndex in bounds when list changes
  useEffect(() => {
    setSelectedIndex(0);
  }, [searchQuery]);

  // Keyboard binding for Ctrl+K and custom trigger events
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      // Toggle palette on Ctrl+K or Cmd+K
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsOpen(prev => !prev);
      }
      
      // Close on Escape
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };

    const handleCustomTrigger = () => {
      setIsOpen(true);
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    window.addEventListener('open-command-palette', handleCustomTrigger);
    return () => {
      window.removeEventListener('keydown', handleGlobalKeyDown);
      window.removeEventListener('open-command-palette', handleCustomTrigger);
    };
  }, [isOpen]);

  // Dynamic list item auto-scroll
  useEffect(() => {
    if (isOpen && listRef.current) {
      const activeElement = listRef.current.children[selectedIndex] as HTMLElement;
      if (activeElement) {
        activeElement.scrollIntoView({
          behavior: 'smooth',
          block: 'nearest',
        });
      }
    }
  }, [selectedIndex, isOpen]);

  // Input auto-focus when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
      setSearchQuery('');
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const handleSelectAndExecute = (item: CommandItem) => {
    if (item.category === 'NAVIGATION' && item.route) {
      navigate(item.route);
      setIsOpen(false);
    } else if (item.category === 'SYSTEM_ACTION' && item.action) {
      item.action();
      // Keep open or closed based on user comfort, let's keep it open so they see the result, but enable simple dismisses.
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev + 1) % filteredItems.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev - 1 + filteredItems.length) % filteredItems.length);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredItems[selectedIndex]) {
        handleSelectAndExecute(filteredItems[selectedIndex]);
      }
    }
  };

  return (
    <>
      {/* Floating mini quick access toggle launcher at the bottom-right corner */}
      <div className="fixed bottom-6 right-6 z-40 hidden md:flex items-center">
        <button
          onClick={() => setIsOpen(true)}
          className="bg-black/80 hover:bg-black border border-[#00E5FF]/30 hover:border-[#00E5FF] p-3 rounded-full text-[#00E5FF] shadow-[0_0_20px_rgba(0,229,255,0.2)] hover:shadow-[0_0_25px_rgba(0,229,255,0.4)] transition-all flex items-center gap-2 group cursor-pointer"
          title="Open Command Center (Ctrl+K)"
        >
          <Command size={16} className="group-hover:rotate-12 transition-transform duration-300" />
          <span className="text-[10px] font-mono tracking-wider font-bold pr-1">LAUNCH SHELL</span>
          <span className="text-[9px] px-1.5 py-0.5 bg-white/10 rounded font-mono text-white select-none">⌘K</span>
        </button>
      </div>

      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 flex items-start justify-center pt-[10vh] px-4 overflow-hidden">
            {/* Dark blur backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="absolute inset-0 bg-black/75 backdrop-blur-md cursor-pointer"
            />

            {/* Main Command Palette Dialog Container */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -20 }}
              className="relative w-full max-w-xl bg-[#03060E]/95 border border-[#00E5FF]/20 rounded-xl shadow-[0_0_60px_rgba(0,229,255,0.25)] flex flex-col overflow-hidden z-10"
            >
              {/* Subtle visual color glow lines */}
              <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-[#00E5FF] to-transparent" />
              
              {/* Search Bar Input Block */}
              <div className="flex items-center gap-3 px-4 py-3.5 border-b border-white/5 bg-black/45 relative">
                <Search size={16} className="text-[#00E5FF] flex-shrink-0 animate-pulse" />
                <input
                  ref={inputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Type an OS module or quick core command (e.g. Zen)..."
                  className="bg-transparent text-white placeholder-gray-500 text-sm font-sans outline-none border-none w-full pr-12 focus:ring-0"
                />
                <div className="absolute right-4 flex items-center gap-1.5">
                  <span className="text-[9px] font-mono text-gray-500 bg-white/5 border border-white/10 px-1.5 py-0.5 rounded uppercase">
                    ESC
                  </span>
                </div>
              </div>

              {/* Status Notice Relay within palette */}
              <AnimatePresence>
                {paletteNotice && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="bg-[#00FF9D]/10 border-b border-[#00FF9D]/20 text-[#00FF9D] text-[11px] font-mono px-4 py-2 flex items-center gap-2"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-[#00FF9D] animate-ping" />
                    <span>{paletteNotice}</span>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Command List Segment */}
              <div 
                ref={listRef} 
                className="max-h-[360px] overflow-y-auto py-2 divide-y divide-white/[0.02]"
              >
                {filteredItems.length === 0 ? (
                  <div className="py-12 text-center flex flex-col items-center justify-center gap-2">
                    <Database size={24} className="text-gray-600" />
                    <p className="text-xs font-mono text-gray-500">NO SECURE SYSTEM CORRELATIONS FOUND</p>
                    <p className="text-[10px] text-gray-600 max-w-xs px-4">Try searching general terms like "Theme", "Learn", "Core" or click ESC to dismiss.</p>
                  </div>
                ) : (
                  filteredItems.map((item, idx) => {
                    const isSelected = idx === selectedIndex;
                    const isExecutingTask = executingId === item.id;
                    const Icon = item.icon;

                    return (
                      <div
                        key={item.id}
                        onClick={() => handleSelectAndExecute(item)}
                        className={`px-4 py-3 transition-all duration-150 flex items-center justify-between gap-3 cursor-pointer relative group ${
                          isSelected 
                            ? 'bg-gradient-to-r from-[#00E5FF]/15 to-transparent border-l-2 border-[#00E5FF]' 
                            : 'hover:bg-white/[0.01] border-l-2 border-transparent'
                        }`}
                      >
                        <div className="flex items-start gap-3 min-w-0">
                          <div className={`mt-0.5 p-1.5 rounded bg-black/40 border border-white/5 transition-all text-xs flex-shrink-0 ${item.color} ${isSelected ? 'scale-110 shadow-[0_0_10px_rgba(0,229,255,0.15)] border-[#00E5FF]/25' : ''}`}>
                            {isExecutingTask ? (
                              <svg className="animate-spin h-4.5 w-4.5 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                              </svg>
                            ) : (
                              <Icon size={15} />
                            )}
                          </div>

                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <span className={`text-xs font-bold font-sans transition-all ${isSelected ? 'text-white' : 'text-gray-300 group-hover:text-white'}`}>
                                {item.title}
                              </span>
                              <span className="text-[8px] font-mono font-bold tracking-widest text-gray-500 bg-white/5 border border-white/10 px-1.5 py-0.2 rounded-full uppercase">
                                {item.category}
                              </span>
                            </div>
                            <p className="text-[10.5px] text-gray-400 font-sans mt-0.5 leading-snug truncate md:max-w-[340px]">
                              {item.subtitle}
                            </p>
                          </div>
                        </div>

                        {/* Interactive suffix indicators */}
                        <div className="flex items-center gap-2 flex-shrink-0 select-none">
                          {item.shortcut && (
                            <span className="text-[9px] font-mono text-[#00E5FF] bg-[#00E5FF]/10 border border-[#00E5FF]/20 px-1.5 py-0.2 rounded">
                              {item.shortcut}
                            </span>
                          )}
                          {isSelected && (
                            <ChevronRight size={13} className="text-[#00E5FF] animate-pulse hidden sm:block" />
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Status Bar Footer */}
              <div className="px-4 py-2.5 bg-[#010307] border-t border-white/5 flex items-center justify-between text-[10px] font-mono text-gray-500 select-none">
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1">
                    <span className="text-gray-400">↑↓</span> to navigate
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="text-gray-400">↵</span> to execute
                  </span>
                </div>
                <div>
                  Active connections: <span className="text-[#00FF9D] font-bold">MUTEX_STABLE</span>
                </div>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
