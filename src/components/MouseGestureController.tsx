import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSystemStore } from '../store/system';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Command, 
  LayoutDashboard, 
  EyeOff, 
  Plus, 
  X, 
  Cpu, 
  Sparkles, 
  HelpCircle,
  ChevronRight,
  MousePointer,
  RotateCcw,
  Zap,
  CheckCircle,
  Eye
} from 'lucide-react';

interface RadialOption {
  id: string;
  name: string;
  sub: string;
  icon: React.ElementType;
  color: string;
  action: () => void;
  angle: number; // Center angle in degrees
}

export function MouseGestureController() {
  const navigate = useNavigate();
  const { zenMode, setZenMode } = useSystemStore();

  // Settings
  const [gesturesEnabled, setGesturesEnabled] = useState(true);
  const [showTutorial, setShowTutorial] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

  // Swipe gesture tracking states
  const [dragStart, setDragStart] = useState<{ x: number; y: number; edge: 'left' | 'right' | 'top' | 'none' } | null>(null);
  const [dragCurrent, setDragCurrent] = useState<{ x: number; y: number } | null>(null);
  const [activeSwipeIndicator, setActiveSwipeIndicator] = useState<{
    edge: 'left' | 'right' | 'top';
    percentage: number;
    actionName: string;
  } | null>(null);

  // Long-press tracking states
  const longPressTimer = useRef<NodeJS.Timeout | null>(null);
  const isDraggingAfterLongPress = useRef(false);
  const [hudPosition, setHudPosition] = useState<{ x: number; y: number } | null>(null);
  const [hoveredSector, setHoveredSector] = useState<string | null>(null);

  // Temporary system notification toast specific to gesture success
  const [gestureNotice, setGestureNotice] = useState<string | null>(null);

  const triggerGestureNotice = (msg: string) => {
    setGestureNotice(msg);
    setTimeout(() => {
      setGestureNotice(null);
    }, 3000);
  };

  // Radial options
  const radialOptions: RadialOption[] = [
    {
      id: 'palette',
      name: 'Launch CLI Shell',
      sub: 'Open Command Palette (Ctrl+K)',
      icon: Command,
      color: 'from-[#00D4FF] to-[#005F73]',
      angle: 270, // Top
      action: () => {
        window.dispatchEvent(new CustomEvent('open-command-palette'));
        triggerGestureNotice('SYSTEM CORE SEARCH Shell Loaded');
      }
    },
    {
      id: 'zen',
      name: zenMode ? 'Deactivate Zen Mode' : 'Activate Zen Focus',
      sub: 'Toggle dashboard layouts',
      icon: zenMode ? Eye : EyeOff,
      color: 'from-[#7C3AED] to-[#4C1D95]',
      angle: 0, // Right
      action: () => {
        setZenMode(!zenMode);
        triggerGestureNotice(!zenMode ? 'Zen Focus Mode ENGAGED' : 'Zen Focus Mode DISENGAGED');
      }
    },
    {
      id: 'task',
      name: 'Create Core Ticket',
      sub: 'Open Quick Task Modal',
      icon: Plus,
      color: 'from-[#F59E0B] to-[#78350F]',
      angle: 90, // Bottom
      action: () => {
        window.dispatchEvent(new CustomEvent('open-quick-task-modal'));
        triggerGestureNotice('Memory Vault Ticket Active');
      }
    },
    {
      id: 'dashboard',
      name: 'Dashboard Overview',
      sub: 'Navigate to real-time grid',
      icon: LayoutDashboard,
      color: 'from-[#00FF9D] to-[#047857]',
      angle: 180, // Left
      action: () => {
        navigate('/dashboard');
        triggerGestureNotice('Redirected to Main Grid Dashboard');
      }
    }
  ];

  useEffect(() => {
    if (!gesturesEnabled) return;

    const handleMouseDown = (e: MouseEvent) => {
      // Ignore if user clicked on interactive elements like inputs, buttons, links, scrollbars
      const target = e.target as HTMLElement;
      if (
        target.closest('button') || 
        target.closest('input') || 
        target.closest('select') || 
        target.closest('textarea') || 
        target.closest('a') ||
        target.closest('.interactive-no-gesture') ||
        e.button !== 0 // Left click only
      ) {
        return;
      }

      const clientX = e.clientX;
      const clientY = e.clientY;
      const threshold = 50; // Edge capture pixels

      let startEdge: 'left' | 'right' | 'top' | 'none' = 'none';
      if (clientX < threshold) {
        startEdge = 'left';
      } else if (clientX > window.innerWidth - threshold) {
        startEdge = 'right';
      } else if (clientY < threshold) {
        startEdge = 'top';
      }

      setDragStart({ x: clientX, y: clientY, edge: startEdge });
      setDragCurrent({ x: clientX, y: clientY });

      // Start long-press timer ONLY if the user is not swiping from an edge
      if (startEdge === 'none') {
        longPressTimer.current = setTimeout(() => {
          // Open radial menu at coordinates
          setHudPosition({ x: clientX, y: clientY });
          triggerGestureNotice('OS Radial Ring Menu Initialized');
        }, 700);
      }
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!dragStart) return;
      
      const dx = e.clientX - dragStart.x;
      const dy = e.clientY - dragStart.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      // If user moved the mouse significantly, cancel long-press
      if (dist > 12 && longPressTimer.current) {
        clearTimeout(longPressTimer.current);
        longPressTimer.current = null;
      }

      setDragCurrent({ x: e.clientX, y: e.clientY });

      // Calculate edge swipe visual indicators
      if (dragStart.edge !== 'none') {
        let percent = 0;
        let actionStr = '';

        if (dragStart.edge === 'left' && dx > 0) {
          percent = Math.min((dx / 180) * 100, 100);
          actionStr = 'SWIPE TO OPEN COMMAND PALETTE';
        } else if (dragStart.edge === 'right' && dx < 0) {
          percent = Math.min((Math.abs(dx) / 180) * 100, 100);
          actionStr = 'SWIPE TO TOGGLE ZEN FOCUS';
        } else if (dragStart.edge === 'top' && dy > 0) {
          percent = Math.min((dy / 180) * 100, 100);
          actionStr = 'SWIPE TO GO TO DASHBOARD';
        }

        if (percent > 10) {
          setActiveSwipeIndicator({
            edge: dragStart.edge,
            percentage: percent,
            actionName: actionStr
          });
        } else {
          setActiveSwipeIndicator(null);
        }
      }
    };

    const handleMouseUp = (e: MouseEvent) => {
      if (longPressTimer.current) {
        clearTimeout(longPressTimer.current);
        longPressTimer.current = null;
      }

      if (dragStart && dragCurrent) {
        const dx = dragCurrent.x - dragStart.x;
        const dy = dragCurrent.y - dragStart.y;
        const swipeThresholdDist = 140;

        if (dragStart.edge === 'left' && dx > swipeThresholdDist) {
          // Trigger Left Edge Action: Command center
          window.dispatchEvent(new CustomEvent('open-command-palette'));
          triggerGestureNotice('Edge Swipe Detected: Command Palette loaded.');
        } else if (dragStart.edge === 'right' && Math.abs(dx) > swipeThresholdDist) {
          // Trigger Right Edge Action: Toggle Zen
          setZenMode(prev => !prev);
          triggerGestureNotice(`Edge Swipe Detected: Zen Focus ${!zenMode ? 'ENGAGED' : 'DISENGAGED'}`);
        } else if (dragStart.edge === 'top' && dy > swipeThresholdDist) {
          // Trigger Top Edge Action: Navigate to Dashboard
          navigate('/dashboard');
          triggerGestureNotice('Edge Swipe Detected: Returned to Grid Dashboard.');
        }
      }

      setDragStart(null);
      setDragCurrent(null);
      setActiveSwipeIndicator(null);
    };

    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      if (longPressTimer.current) {
        clearTimeout(longPressTimer.current);
      }
    };
  }, [dragStart, dragCurrent, gesturesEnabled, zenMode, navigate]);

  return (
    <>
      {/* Floating Mini Tutorial / Control Dock on Bottom-Left */}
      <div className="fixed bottom-6 left-6 z-40 hidden md:flex items-center gap-2">
        <button
          onClick={() => setSettingsOpen(prev => !prev)}
          className={`bg-black/85 hover:bg-black border p-2.5 rounded-full text-xs font-mono tracking-wider transition-all flex items-center justify-center cursor-pointer group hover:scale-105 ${
            settingsOpen 
              ? 'border-[#00D4FF] text-[#00D4FF] shadow-[0_0_15px_rgba(0,212,255,0.3)]' 
              : 'border-white/10 text-gray-400 hover:text-white hover:border-[#7C3AED]'
          }`}
          title="Krishna OS Gesture Settings"
        >
          <MousePointer size={14} className="group-hover:rotate-12 transition-transform duration-300" />
        </button>

        <AnimatePresence>
          {settingsOpen && (
            <motion.div
              initial={{ opacity: 0, x: -15, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: -15, scale: 0.95 }}
              className="w-72 bg-[#040812]/95 border border-[#7C3AED]/20 hover:border-[#7C3AED]/40 rounded-xl p-4 shadow-[0_0_35px_rgba(0,0,0,0.6)] backdrop-blur-md text-xs font-sans relative"
            >
              <div className="flex items-center justify-between border-b border-white/5 pb-2 mb-3">
                <span className="font-mono text-[10px] uppercase font-bold text-[#7C3AED] tracking-widest flex items-center gap-1.5">
                  <Cpu size={12} className="text-[#00D4FF] animate-pulse" />
                  MOUSE CORE NAVIGATION
                </span>
                <button 
                  onClick={() => setSettingsOpen(false)}
                  className="text-gray-500 hover:text-white cursor-pointer"
                >
                  <X size={12} />
                </button>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400 text-[11px]">Gesture Recognizer</span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={gesturesEnabled}
                      onChange={(e) => setGesturesEnabled(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-8 h-4 bg-gray-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-gray-400 after:border-gray-300 after:border after:rounded-full after:h-3 after:w-3.5 after:transition-all peer-checked:bg-[#00D4FF] peer-checked:after:bg-black"></div>
                  </label>
                </div>

                <div className="p-2 border border-white/5 rounded bg-black/40 space-y-2">
                  <div className="flex items-start gap-1 text-[10.5px]">
                    <span className="text-[#00D4FF] font-mono font-bold">1. Edge Swipes:</span>
                    <span className="text-gray-400">Click and drag from any screen boundary.</span>
                  </div>
                  <div className="flex items-start gap-1 text-[10.5px]">
                    <span className="text-[#7C3AED] font-mono font-bold">2. Long Press:</span>
                    <span className="text-gray-400">Press and hold inside empty workspace backdrops for 700ms to open Radial HUD.</span>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setShowTutorial(true);
                    setSettingsOpen(false);
                  }}
                  className="w-full py-1.5 bg-[#7C3AED]/10 hover:bg-[#7C3AED]/20 text-[#7C3AED] border border-[#7C3AED]/30 hover:border-[#7C3AED] rounded-md font-mono text-[10px] font-bold transition-all text-center cursor-pointer uppercase tracking-wider"
                >
                  RUN INTERACTIVE TUTORIAL
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Edge Swipe Holographic Indicator Lines */}
      <AnimatePresence>
        {activeSwipeIndicator && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 pointer-events-none z-50 overflow-hidden"
          >
            {/* Visual Edge Overlay representing signal activation */}
            {activeSwipeIndicator.edge === 'left' && (
              <div 
                className="absolute left-0 top-0 bottom-0 bg-gradient-to-r from-[#00D4FF]/25 to-transparent transition-all border-l-4 border-[#00D4FF] flex items-center pl-16"
                style={{ width: `${activeSwipeIndicator.percentage * 2.5}px` }}
              >
                <div className="flex flex-col gap-1 font-mono text-xs text-[#00D4FF] animate-pulse">
                  <ChevronRight size={24} className="animate-bounce" />
                  <span className="font-bold tracking-widest bg-black/50 px-2 py-1 rounded border border-[#00D4FF]/20 text-[10px] whitespace-nowrap">
                    {activeSwipeIndicator.actionName} ({Math.round(activeSwipeIndicator.percentage)}%)
                  </span>
                </div>
              </div>
            )}

            {activeSwipeIndicator.edge === 'right' && (
              <div 
                className="absolute right-0 top-0 bottom-0 bg-gradient-to-l from-[#7C3AED]/25 to-transparent transition-all border-r-4 border-[#7C3AED] flex items-center justify-end pr-16"
                style={{ width: `${activeSwipeIndicator.percentage * 2.5}px` }}
              >
                <div className="flex flex-col items-end gap-1 font-mono text-xs text-[#7C3AED] animate-pulse">
                  <ChevronRight size={24} className="rotate-180 animate-bounce" />
                  <span className="font-bold tracking-widest bg-black/50 px-2 py-1 rounded border border-[#7C3AED]/20 text-[10px] whitespace-nowrap">
                    {activeSwipeIndicator.actionName} ({Math.round(activeSwipeIndicator.percentage)}%)
                  </span>
                </div>
              </div>
            )}

            {activeSwipeIndicator.edge === 'top' && (
              <div 
                className="absolute top-0 left-0 right-0 bg-gradient-to-b from-[#00FF9D]/20 to-transparent transition-all border-t-4 border-[#00FF9D] flex justify-center pt-16"
                style={{ height: `${activeSwipeIndicator.percentage * 2}px` }}
              >
                <div className="flex flex-col items-center gap-1 font-mono text-xs text-[#00FF9D] animate-pulse">
                  <svg className="w-5 h-5 animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 13l-7 7-7-7m14-6l-7 7-7-7" />
                  </svg>
                  <span className="font-bold tracking-widest bg-black/50 px-2 py-1 rounded border border-[#00FF9D]/20 text-[10px] whitespace-nowrap">
                    {activeSwipeIndicator.actionName} ({Math.round(activeSwipeIndicator.percentage)}%)
                  </span>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Radial Ring HUD Menu Dialog */}
      <AnimatePresence>
        {hudPosition && (
          <div className="fixed inset-0 z-50 pointer-events-auto">
            {/* Backdrop to close */}
            <div 
              className="absolute inset-0 bg-black/35 backdrop-blur-[2px] cursor-crosshair"
              onClick={() => setHudPosition(null)}
            />

            {/* Radial Core Container */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ type: 'spring', damping: 20 }}
              style={{
                left: hudPosition.x,
                top: hudPosition.y,
                transform: 'translate(-50%, -50%)'
              }}
              className="absolute pointer-events-auto"
            >
              {/* Spinning Sci-Fi vector backdrop vector circles */}
              <div className="absolute -inset-24 border border-dashed border-[#00D4FF]/10 rounded-full animate-spin-slow pointer-events-none" />
              <div className="absolute -inset-16 border border-double border-[#7C3AED]/15 rounded-full animate-reverse-spin pointer-events-none" />
              <div className="absolute -inset-8 border border-white/5 rounded-full pointer-events-none" />

              {/* Radial options */}
              {radialOptions.map((opt) => {
                const angleRad = (opt.angle * Math.PI) / 180;
                const radius = 88; // Distance from center
                const x = Math.cos(angleRad) * radius;
                const y = Math.sin(angleRad) * radius;
                const isHovered = hoveredSector === opt.id;
                const Icon = opt.icon;

                return (
                  <motion.button
                    key={opt.id}
                    onMouseEnter={() => setHoveredSector(opt.id)}
                    onMouseLeave={() => setHoveredSector(null)}
                    onClick={() => {
                      opt.action();
                      setHudPosition(null);
                    }}
                    style={{
                      left: `${x}px`,
                      top: `${y}px`,
                      transform: 'translate(-50%, -50%)'
                    }}
                    className={`absolute w-14 h-14 rounded-full bg-black/90 p-3 flex flex-col items-center justify-center border transition-all text-white shadow-2xl cursor-pointer select-none z-10 ${
                      isHovered 
                        ? 'border-[#00D4FF] scale-110 shadow-[0_0_20px_rgba(0,212,255,0.4)] bg-gradient-to-tr ' + opt.color 
                        : 'border-[#7C3AED]/40 hover:border-white'
                    }`}
                  >
                    <Icon size={18} className={isHovered ? 'animate-pulse text-white' : 'text-[#00D4FF]'} />
                  </motion.button>
                );
              })}

              {/* Center Core Button */}
              <button
                onClick={() => setHudPosition(null)}
                className="absolute w-10 h-10 -translate-x-1/2 -translate-y-1/2 rounded-full bg-black border border-red-500/50 hover:border-red-500 text-red-500 flex items-center justify-center cursor-pointer bg-gradient-to-b from-black to-red-950/20 active:scale-95 z-20"
                title="Dismiss Central Node"
              >
                <X size={14} />
              </button>

              {/* Central Micro-Terminal HUD Display directly underneath */}
              <div className="absolute top-20 left-1/2 -translate-x-1/2 w-48 text-center bg-black/90 border border-[#00D4FF]/20 rounded p-1.5 font-mono pointer-events-none shadow-2xl select-none">
                <div className="text-[7.5px] text-gray-500 tracking-wider">SECURE HUD ROUTING</div>
                <div className="text-[10px] text-[#00D4FF] font-bold mt-0.5 uppercase truncate">
                  {hoveredSector 
                    ? radialOptions.find(o => o.id === hoveredSector)?.name 
                    : 'System Status: STABLE'
                  }
                </div>
                <div className="text-[8px] text-gray-400 mt-0.5 leading-snug truncate">
                  {hoveredSector 
                    ? radialOptions.find(o => o.id === hoveredSector)?.sub 
                    : 'Awaiting direction select'
                  }
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Onboarding Interactive Training Classroom / Tutorial Modal */}
      <AnimatePresence>
        {showTutorial && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowTutorial(false)}
              className="absolute inset-0 bg-black/85 backdrop-blur-md"
            />

            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 15 }}
              className="relative w-full max-w-2xl bg-[#050915] border border-[#00D4FF]/30 rounded-2xl overflow-hidden shadow-[0_0_80px_rgba(0,212,255,0.25)] flex flex-col z-10"
            >
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#00D4FF] to-transparent" />

              <div className="p-5 border-b border-white/5 flex items-center gap-2 bg-black/40">
                <Sparkles size={16} className="text-[#00D4FF]" />
                <h3 className="text-sm font-mono text-white/90 uppercase tracking-widest font-bold">
                  Interactive Mouse Gestures Training Center
                </h3>
                <button
                  onClick={() => setShowTutorial(false)}
                  className="ml-auto p-1 text-gray-500 hover:text-white transition-colors cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="p-6 overflow-y-auto space-y-6 max-h-[80vh] text-sm text-gray-300 font-sans">
                <p className="text-xs text-gray-400 leading-relaxed">
                  Welcome to the Krishna OS premium interaction protocol. We've compiled live instruction models so you can practice triggering edge swipes and hold functions directly with your pointer.
                </p>

                {/* Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  
                  {/* Long-Press Simulator */}
                  <div className="p-4 bg-black/45 border border-white/5 rounded-xl space-y-3">
                    <span className="text-[10px] font-mono uppercase text-[#7C3AED] font-bold tracking-wider block">
                      Exercise A: Radial Ring Activation
                    </span>
                    <p className="text-xs text-gray-400 leading-normal">
                      Press and hold the button below for 700ms without dragging. Watch the radial HUD open.
                    </p>

                    <div className="flex items-center justify-center py-4">
                      <button
                        onMouseDown={(e) => {
                          const clientX = e.clientX;
                          const clientY = e.clientY;
                          longPressTimer.current = setTimeout(() => {
                            setHudPosition({ x: clientX, y: clientY });
                            triggerGestureNotice('Tutorial HUD Ring Engaged!');
                            setShowTutorial(false);
                          }, 700);
                        }}
                        onMouseUp={() => {
                          if (longPressTimer.current) {
                            clearTimeout(longPressTimer.current);
                          }
                        }}
                        onMouseLeave={() => {
                          if (longPressTimer.current) {
                            clearTimeout(longPressTimer.current);
                          }
                        }}
                        className="px-6 py-3 bg-gradient-to-r from-[#7C3AED] to-[#00D4FF] hover:opacity-90 active:scale-95 text-xs text-white uppercase tracking-wider font-mono font-bold rounded-lg border border-white/20 shadow-lg cursor-pointer transition-all"
                      >
                        PRESS & HOLD FOR Radial HUD
                      </button>
                    </div>
                  </div>

                  {/* Swipe Simulator */}
                  <div className="p-4 bg-black/45 border border-white/5 rounded-xl space-y-3">
                    <span className="text-[10px] font-mono uppercase text-[#00D4FF] font-bold tracking-wider block">
                      Exercise B: Boundary Drag Simulation
                    </span>
                    <p className="text-xs text-gray-400 leading-normal">
                      Drag the key card from left to right inside the box below to simulate an edge-swipe gesture!
                    </p>

                    <div className="border border-dashed border-white/10 rounded-xl p-4 bg-black/20 flex flex-col items-center justify-center gap-2 relative overflow-hidden h-28">
                      {/* Interactive Drag Bar */}
                      <motion.div
                        drag="x"
                        dragConstraints={{ left: 0, right: 160 }}
                        onDragEnd={(event, info) => {
                          if (info.offset.x > 120) {
                            triggerGestureNotice('Swipe boundary simulated successfully!');
                            window.dispatchEvent(new CustomEvent('open-command-palette'));
                            setShowTutorial(false);
                          }
                        }}
                        className="px-4 py-2 bg-[#00D4FF]/20 hover:bg-[#00D4FF]/30 border border-[#00D4FF]/40 text-[#00D4FF] text-[10px] font-mono font-bold rounded-lg cursor-grab active:cursor-grabbing shadow-inner flex items-center gap-1"
                      >
                        <MousePointer size={12} className="animate-pulse" />
                        DRAG RIGHT --&gt;
                      </motion.div>
                      <span className="text-[9px] font-mono text-gray-600 block mt-1 uppercase">DRAG ME ALL THE WAY</span>
                    </div>
                  </div>

                </div>

                <div className="flex items-center gap-3 p-3.5 bg-black/60 border border-[#00FF9D]/20 rounded-xl">
                  <CheckCircle size={18} className="text-[#00FF9D]" />
                  <p className="text-[11px] font-mono text-gray-400 leading-normal">
                    Ready to operate gestures globally? Just close this dialog. Swipes are registered permanently around screen edges, and hold operations work whenever clicking the backdrop grid.
                  </p>
                </div>
              </div>

              <div className="p-4 border-t border-white/5 flex justify-end bg-black/20">
                <button
                  onClick={() => setShowTutorial(false)}
                  className="px-5 py-2 bg-white/5 hover:bg-white/10 text-white border border-white/10 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer"
                >
                  DISMISS CLASSROOM
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Dynamic Mini Global Alert feedback for gestures success */}
      <AnimatePresence>
        {gestureNotice && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2.5 px-4 py-2.5 rounded-full border border-[#00D4FF]/45 bg-black/95 text-[#00D4FF] font-mono text-2xs shadow-2xl backdrop-blur-md whitespace-nowrap"
          >
            <Zap size={12} className="text-[#00D4FF] animate-bounce" />
            <span className="font-bold tracking-widest">{gestureNotice}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
