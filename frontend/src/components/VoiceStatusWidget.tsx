import { Mic, MicOff, Volume2, VolumeX, Cpu, Radio, ChevronRight } from 'lucide-react';
import { motion, Transition } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { cn } from '../lib/utils';
import { useKrishnaVoice } from '../hooks/useKrishnaVoice';

export function VoiceStatusWidget() {
  const navigate = useNavigate();
  const {
    isListening,
    isProcessing,
    isSpeaking,
    isWakeWordActive,
    transcript,
    response,
    audioBars,
    startListening,
    stopListening,
    stopSpeaking,
    toggleWakeWord
  } = useKrishnaVoice(navigate);

  // Determine current high-level state
  const currentState: 'Idle' | 'Listening' | 'Thinking' | 'Speaking' = isSpeaking
    ? 'Speaking'
    : isProcessing
    ? 'Thinking'
    : isListening
    ? 'Listening'
    : 'Idle';

  const stateConfig = {
    Idle: {
      label: 'IDLE',
      color: 'text-gray-400',
      bgColor: 'bg-gray-500/10',
      borderColor: 'border-white/10',
      glowColor: 'shadow-[0_0_10px_rgba(255,255,255,0.05)]',
      badge: 'STANDBY',
      description: 'Awaiting wake word or manual trigger'
    },
    Listening: {
      label: 'LISTENING',
      color: 'text-[#00E5FF]',
      bgColor: 'bg-[#00E5FF]/10',
      borderColor: 'border-[#00E5FF]/40',
      glowColor: 'shadow-[0_0_20px_rgba(0,229,255,0.25)]',
      badge: 'RECORDING',
      description: transcript || 'Capturing acoustic feed...'
    },
    Thinking: {
      label: 'THINKING',
      color: 'text-[#A78BFA]',
      bgColor: 'bg-[#A78BFA]/10',
      borderColor: 'border-[#A78BFA]/40',
      glowColor: 'shadow-[0_0_20px_rgba(167,139,250,0.25)]',
      badge: 'ROUTING INTENT',
      description: 'Processing natural language command...'
    },
    Speaking: {
      label: 'SPEAKING',
      color: 'text-[#00FF9D]',
      bgColor: 'bg-[#00FF9D]/10',
      borderColor: 'border-[#00FF9D]/40',
      glowColor: 'shadow-[0_0_20px_rgba(0,255,157,0.25)]',
      badge: 'TTS FEEDBACK',
      description: response || 'Synthesizing audio output...'
    }
  };

  const currentCfg = stateConfig[currentState];

  // Generate Framer Motion animation keyframes per bar depending on state
  const getBarAnimation = (index: number): { animate: { height: number[] }; transition: Transition } => {
    const rawBar = audioBars[index % audioBars.length] || 12;
    const staggeredDelay = (index % 5) * 0.12;

    switch (currentState) {
      case 'Listening':
        return {
          animate: {
            height: [
              Math.max(8, rawBar),
              Math.max(12, rawBar * 1.35),
              Math.max(8, rawBar * 0.8)
            ]
          },
          transition: {
            duration: 0.25,
            repeat: Infinity,
            repeatType: 'reverse',
            delay: staggeredDelay * 0.5
          }
        };

      case 'Thinking':
        return {
          animate: {
            height: [10, 36, 14, 28, 10]
          },
          transition: {
            duration: 1.1,
            repeat: Infinity,
            repeatType: 'loop',
            ease: 'easeInOut',
            delay: staggeredDelay
          }
        };

      case 'Speaking':
        return {
          animate: {
            height: [12, 42, 18, 38, 12]
          },
          transition: {
            duration: 0.8,
            repeat: Infinity,
            repeatType: 'mirror',
            ease: 'easeInOut',
            delay: (index % 4) * 0.1
          }
        };

      case 'Idle':
      default:
        return {
          animate: {
            height: [10, 18, 10]
          },
          transition: {
            duration: 2.2,
            repeat: Infinity,
            repeatType: 'mirror',
            ease: 'easeInOut',
            delay: index * 0.08
          }
        };
    }
  };

  return (
    <div className={cn(
      "glass-panel p-5 relative overflow-hidden transition-all duration-300 border flex flex-col justify-between min-h-[220px]",
      currentCfg.borderColor,
      currentCfg.glowColor
    )}>
      {/* Background ambient glow */}
      <div className={cn(
        "absolute -top-10 -right-10 w-32 h-32 rounded-full blur-3xl opacity-20 pointer-events-none transition-colors duration-500",
        currentState === 'Listening' && "bg-[#00E5FF]",
        currentState === 'Thinking' && "bg-[#A78BFA]",
        currentState === 'Speaking' && "bg-[#00FF9D]",
        currentState === 'Idle' && "bg-white/10"
      )} />

      {/* Widget Header */}
      <div className="flex items-center justify-between mb-3 z-10">
        <div className="flex items-center gap-2.5">
          <div className={cn(
            "p-2 rounded-lg border transition-all duration-300",
            currentCfg.bgColor,
            currentCfg.borderColor,
            currentCfg.color
          )}>
            {currentState === 'Thinking' ? (
              <Cpu className="w-4 h-4 animate-spin" />
            ) : currentState === 'Speaking' ? (
              <Volume2 className="w-4 h-4 animate-pulse" />
            ) : currentState === 'Listening' ? (
              <Mic className="w-4 h-4 animate-pulse" />
            ) : (
              <MicOff className="w-4 h-4" />
            )}
          </div>
          <div>
            <h3 className="text-xs font-mono font-bold tracking-wider text-white uppercase flex items-center gap-1.5">
              Voice Status Engine
            </h3>
            <p className="text-[10px] font-mono text-gray-400">KRISHNA_VOICE / TELEMETRY</p>
          </div>
        </div>

        {/* State Badge */}
        <span className={cn(
          "px-2.5 py-1 rounded-full text-[9px] font-mono font-bold tracking-wider border flex items-center gap-1.5",
          currentCfg.bgColor,
          currentCfg.borderColor,
          currentCfg.color
        )}>
          <span className="relative flex h-1.5 w-1.5">
            <span className={cn("animate-ping absolute inline-flex h-full w-full rounded-full opacity-75", currentState !== 'Idle' && "bg-current")} />
            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-current" />
          </span>
          {currentState.toUpperCase()}
        </span>
      </div>

      {/* Framer Motion Animated Waveform Display */}
      <div className="my-2 py-3 bg-black/40 border border-white/5 rounded-xl px-4 flex flex-col items-center justify-center relative overflow-hidden min-h-[64px]">
        <div className="flex items-end justify-center gap-1.5 h-10 w-full">
          {Array.from({ length: 16 }).map((_, i) => {
            const barAnim = getBarAnimation(i);
            return (
              <motion.div
                key={`${currentState}-${i}`}
                animate={barAnim.animate}
                transition={barAnim.transition}
                className={cn(
                  "w-1.5 rounded-full transition-colors duration-300",
                  currentState === 'Listening' && "bg-[#00E5FF] shadow-[0_0_8px_#00E5FF]",
                  currentState === 'Thinking' && "bg-[#A78BFA] shadow-[0_0_8px_#A78BFA]",
                  currentState === 'Speaking' && "bg-[#00FF9D] shadow-[0_0_8px_#00FF9D]",
                  currentState === 'Idle' && "bg-white/20"
                )}
              />
            );
          })}
        </div>

        {/* Live Audio Descriptor */}
        <p className="text-[11px] font-mono mt-2 text-center text-gray-300 truncate w-full max-w-[280px]">
          {currentCfg.description}
        </p>
      </div>

      {/* Control Actions & Wake Word Status Footer */}
      <div className="flex items-center justify-between pt-2 border-t border-white/5 gap-2 text-xs font-mono z-10">
        {/* Toggle Listening Button */}
        {currentState === 'Speaking' ? (
          <button
            onClick={stopSpeaking}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 rounded-lg text-[10px] font-bold transition-all cursor-pointer"
          >
            <VolumeX size={12} />
            <span>MUTE TTS</span>
          </button>
        ) : (
          <button
            onClick={() => {
              if (isListening) {
                stopListening();
              } else {
                startListening();
              }
            }}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold border transition-all cursor-pointer",
              isListening
                ? "bg-[#00E5FF]/20 border-[#00E5FF] text-[#00E5FF] shadow-[0_0_12px_rgba(0,229,255,0.3)]"
                : "bg-white/5 hover:bg-white/10 border-white/10 text-gray-300 hover:text-white"
            )}
          >
            <Mic size={12} className={isListening ? "animate-pulse text-[#00E5FF]" : ""} />
            <span>{isListening ? "STOP MIC" : "START MIC"}</span>
          </button>
        )}

        {/* Wake-Word Quick Toggle */}
        <button
          onClick={toggleWakeWord}
          title="Toggle 'Hey Krishna' wake-word detection"
          className={cn(
            "flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[10px] font-bold border transition-all cursor-pointer",
            isWakeWordActive
              ? "bg-[#00FF9D]/10 border-[#00FF9D]/30 text-[#00FF9D]"
              : "bg-white/5 border-white/10 text-gray-500 hover:text-gray-300"
          )}
        >
          <Radio size={11} className={isWakeWordActive ? "animate-pulse" : ""} />
          <span>WAKE: {isWakeWordActive ? "ON" : "OFF"}</span>
        </button>

        {/* Open Voice Assistant Page */}
        <button
          onClick={() => navigate('/voice')}
          className="p-1.5 bg-white/5 hover:bg-white/10 border border-white/10 text-gray-400 hover:text-[#00E5FF] rounded-lg transition-colors cursor-pointer"
          title="Open Voice Assistant Dashboard"
        >
          <ChevronRight size={14} />
        </button>
      </div>
    </div>
  );
}
