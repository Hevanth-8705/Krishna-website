import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mic, ShieldAlert, Cpu, Zap, Brain, Timer, CheckCircle2, Activity, Sparkles, Sliders, Trash2, X, Volume2, VolumeX, Radio } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import { useKrishnaVoice } from '../hooks/useKrishnaVoice';

export default function VoiceAssistant() {
  const navigate = useNavigate();
  const {
    isListening,
    isWakeWordActive,
    transcript,
    response,
    lastIntent,
    lastConfidence,
    isSpeaking,
    isProcessing,
    isCalibrating,
    audioBars,
    acousticProfile,
    startListening,
    stopListening,
    toggleWakeWord,
    stopSpeaking,
    calibrateAcoustics
  } = useKrishnaVoice(navigate);

  const [showAcousticDetails, setShowAcousticDetails] = useState(false);

  const handleDeleteProfile = () => {
    localStorage.removeItem('krishna_voice_profile');
    window.location.reload();
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-8rem)] pb-12">
      
      {/* Title Header */}
      <div className="text-center mb-8 relative">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-[#00E5FF] rounded-full blur-[120px] opacity-10 pointer-events-none"></div>
        <h1 className="text-4xl font-light tracking-widest mb-2 font-mono">KRISHNA<span className="text-[#00E5FF] font-bold">VOICE</span></h1>
        <p className="text-sm text-gray-400 mb-4">Complete Personal Voice Assistant & Action Engine</p>
        
        {/* Controls Bar */}
        <div className="flex flex-col items-center gap-3">
          <div className="flex flex-wrap items-center justify-center gap-3">
            
            {/* Wake Word Status Pill */}
            <button
              onClick={toggleWakeWord}
              className={cn(
                "inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-mono font-semibold transition-all cursor-pointer border",
                isWakeWordActive
                  ? "bg-[#00FF9D]/15 border-[#00FF9D]/40 text-[#00FF9D] shadow-[0_0_12px_rgba(0,255,157,0.2)]"
                  : "bg-white/5 border-white/10 text-gray-400 hover:text-white"
              )}
            >
              <Radio className={cn("w-3.5 h-3.5", isWakeWordActive && "animate-pulse text-[#00FF9D]")} />
              <span>Wake Word ("Hey Krishna"): {isWakeWordActive ? "ACTIVE" : "OFF"}</span>
            </button>

            {/* Acoustic Profile Pill */}
            <button
              onClick={() => setShowAcousticDetails(!showAcousticDetails)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#00E5FF]/10 border border-[#00E5FF]/30 hover:bg-[#00E5FF]/20 text-[#00E5FF] rounded-full text-xs font-mono transition-all cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#00E5FF]" />
              <span>Acoustic Profile ({acousticProfile.clarityScore}% Clarity)</span>
            </button>

            {/* Calibrate Button */}
            <button
              onClick={calibrateAcoustics}
              disabled={isCalibrating}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 text-gray-200 rounded-full text-xs font-mono font-medium transition-all cursor-pointer disabled:opacity-50"
            >
              <Sliders className="w-3.5 h-3.5 text-[#00E5FF]" />
              <span>{isCalibrating ? "Calibrating..." : "Calibrate Acoustics"}</span>
            </button>

            {/* Reset Profile */}
            <button
              onClick={handleDeleteProfile}
              title="Reset Voice Profile"
              className="inline-flex items-center justify-center w-8 h-8 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 rounded-full text-xs font-mono transition-all cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Expanded Acoustic Matrix Specs */}
          <AnimatePresence>
            {showAcousticDetails && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95, height: 0 }}
                animate={{ opacity: 1, scale: 1, height: 'auto' }}
                exit={{ opacity: 0, scale: 0.95, height: 0 }}
                transition={{ duration: 0.2 }}
                className="w-full max-w-md overflow-hidden bg-black/80 border border-white/10 rounded-xl p-4 text-left font-mono mt-2 z-20"
              >
                <div className="border-b border-white/10 pb-2 mb-2 flex items-center justify-between text-xs">
                  <span className="text-gray-400 font-bold uppercase tracking-wider">Acoustic Calibration Profile</span>
                  <span className="bg-[#00FF9D]/10 text-[#00FF9D] border border-[#00FF9D]/20 px-2 py-0.5 rounded font-mono font-bold text-[10px]">VERIFIED SECURE</span>
                </div>
                
                <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs text-gray-300">
                  <div className="flex items-center justify-between py-1 border-b border-white/5">
                    <span>Gain Boost:</span>
                    <span className="text-white font-medium">+{acousticProfile.gainDb} dB</span>
                  </div>
                  <div className="flex items-center justify-between py-1 border-b border-white/5">
                    <span>Noise Floor:</span>
                    <span className="text-white font-medium">{acousticProfile.noiseFloor} dB</span>
                  </div>
                  <div className="flex items-center justify-between py-1 border-b border-white/5">
                    <span>Clarity Index:</span>
                    <span className="text-[#00FF9D] font-medium">{acousticProfile.clarityScore}%</span>
                  </div>
                  <div className="flex items-center justify-between py-1 border-b border-white/5">
                    <span>Biometric Lock:</span>
                    <span className="text-[#00E5FF] font-medium">{acousticProfile.trustedUserSignature ? "ACTIVE" : "INACTIVE"}</span>
                  </div>
                </div>
                
                <div className="bg-[#00E5FF]/5 border border-[#00E5FF]/10 rounded p-2.5 mt-3 text-[11px] text-gray-300 leading-normal flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#00E5FF] flex-shrink-0" />
                  <span>Calibrated on {acousticProfile.calibratedAt}. Provides enhanced accuracy for command routing.</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Primary Voice Waveform Workspace */}
      <div className="flex flex-col items-center justify-center w-full max-w-2xl min-h-[220px] glass-panel border-[#00E5FF]/20 relative overflow-hidden p-8 mb-8 z-10">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#00E5FF] to-transparent opacity-50"></div>
        
        {/* Real-time Waveform Bars */}
        <div className="flex items-end justify-center gap-1.5 h-20 mb-8 absolute top-8 w-full">
          {audioBars.map((height, i) => (
            <motion.div
              key={i}
              animate={{ height: Math.max(10, height) }}
              className={cn(
                "w-2 rounded-full transition-all duration-75",
                isSpeaking ? "bg-[#00FF9D] neural-glow-green" :
                isListening ? "bg-[#00E5FF] neural-glow" : 
                isProcessing ? "bg-[#A78BFA] shadow-[0_0_15px_#A78BFA]" :
                "bg-white/10"
              )}
            />
          ))}
        </div>

        {/* Live Transcript & Speech Display */}
        <div className="mt-20 w-full flex flex-col items-center text-center">
          <p className="text-lg text-white/90 font-mono min-h-[32px] max-w-xl mx-auto leading-relaxed">
            {isListening ? (
              <span className="text-[#00E5FF]">{transcript || "Listening... Speak your command..."}</span>
            ) : isProcessing ? (
              <span className="text-[#A78BFA] animate-pulse">Resolving Intent & Executing Directives...</span>
            ) : response ? (
              <span className="text-[#00FF9D]">{response}</span>
            ) : (
              <span className="text-gray-500 font-sans">"Hey Krishna, send a WhatsApp message to Rahul saying I'll be late..."</span>
            )}
          </p>

          {/* Active Speaking Indicator with Mute/Stop Button */}
          {isSpeaking && (
            <button
              onClick={stopSpeaking}
              className="mt-4 inline-flex items-center gap-2 px-3 py-1 bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500/20 rounded-full text-xs font-mono transition-all cursor-pointer"
            >
              <VolumeX className="w-3.5 h-3.5" />
              <span>Stop Speaking</span>
            </button>
          )}
        </div>

        {/* Telemetry and Intent Card */}
        <AnimatePresence>
          {(isProcessing || response) && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="mt-8 w-full border-t border-white/5 pt-6 overflow-hidden"
            >
              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Cpu className={cn("w-4 h-4 text-[#A78BFA]", isProcessing && "animate-spin")} />
                    <span className="text-xs font-mono font-bold uppercase tracking-wider text-gray-400">
                      Smart Command Routing Telemetry
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="relative flex h-2 w-2">
                      <span className={cn(
                        "animate-ping absolute inline-flex h-full w-full rounded-full opacity-75",
                        isProcessing ? "bg-[#A78BFA]" : "bg-[#00FF9D]"
                      )}></span>
                      <span className={cn(
                        "relative inline-flex rounded-full h-2 w-2",
                        isProcessing ? "bg-[#A78BFA]" : "bg-[#00FF9D]"
                      )}></span>
                    </span>
                    <span className={cn(
                      "text-[10px] font-mono uppercase font-semibold tracking-wider",
                      isProcessing ? "text-[#A78BFA]" : "text-[#00FF9D]"
                    )}>
                      {isProcessing ? "Routing Intent" : "Action Executed"}
                    </span>
                  </div>
                </div>

                {/* Intent Stage */}
                <div className="flex items-center justify-between text-xs font-mono text-gray-300 bg-white/[0.02] border border-white/5 px-3 py-2 rounded-md">
                  <div className="flex items-center gap-2">
                    <Activity className="w-4 h-4 text-[#00E5FF]" />
                    <span className="uppercase text-[10px] text-gray-500 font-bold">Matched Intent:</span>
                  </div>
                  <span className="font-bold text-[#00FF9D]">{lastIntent || "System Directive"}</span>
                </div>

                {/* Metrics */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  <div className="bg-black/40 border border-white/5 p-3 rounded-lg flex flex-col justify-between">
                    <div className="flex items-center justify-between text-[10px] font-mono text-gray-400 mb-1">
                      <span>Match Confidence</span>
                      <Zap className="w-3.5 h-3.5 text-[#00FF9D]" />
                    </div>
                    <span className="text-lg font-mono font-bold text-white">{lastConfidence}%</span>
                  </div>

                  <div className="bg-black/40 border border-white/5 p-3 rounded-lg flex flex-col justify-between">
                    <div className="flex items-center justify-between text-[10px] font-mono text-gray-400 mb-1">
                      <span>Acoustic Sync</span>
                      <Brain className="w-3.5 h-3.5 text-[#00E5FF]" />
                    </div>
                    <span className="text-lg font-mono font-bold text-[#00E5FF]">{acousticProfile.clarityScore}%</span>
                  </div>

                  <div className="bg-black/40 border border-white/5 p-3 rounded-lg flex flex-col justify-between col-span-2 md:col-span-1">
                    <div className="flex items-center justify-between text-[10px] font-mono text-gray-400 mb-1">
                      <span>Authorization</span>
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#00FF9D]" />
                    </div>
                    <span className="text-lg font-mono font-bold text-[#00FF9D]">VERIFIED</span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Main Microphone Action Button */}
      <button
        onClick={() => {
          if (isListening) {
            stopListening();
          } else {
            startListening();
          }
        }}
        className={cn(
          "relative w-24 h-24 rounded-full flex items-center justify-center transition-all duration-300 z-20 cursor-pointer",
          isListening 
            ? "bg-[#00E5FF] hover:bg-[#00E5FF]/80 text-black shadow-[0_0_40px_rgba(0,229,255,0.6)] scale-110" 
            : isSpeaking
            ? "bg-[#00FF9D] text-black shadow-[0_0_40px_rgba(0,255,157,0.4)] scale-105"
            : "glass-panel text-white hover:border-[#00E5FF]/50 hover:text-[#00E5FF] shadow-[0_0_15px_rgba(0,0,0,0.5)]"
        )}
      >
        {(isListening || isSpeaking) && (
          <>
            <span className={cn("absolute inset-0 rounded-full border animate-ping opacity-50", isSpeaking ? "border-[#00FF9D]" : "border-[#00E5FF]")}></span>
            <span className={cn("absolute -inset-4 rounded-full border animate-ping opacity-30", isSpeaking ? "border-[#00FF9D]/30" : "border-[#00E5FF]/30")} style={{ animationDelay: '200ms' }}></span>
          </>
        )}
        <Mic className="w-8 h-8" />
      </button>

      {/* Notice Footer */}
      <div className="mt-12 w-full max-w-xl text-center space-y-4">
        <div className="glass-panel p-4 flex items-start gap-3 border-[#00E5FF]/20 bg-[#00E5FF]/5 mx-auto text-left">
           <ShieldAlert className="w-5 h-5 flex-shrink-0 mt-0.5 text-[#00E5FF]" />
           <p className="text-xs text-white/80 leading-relaxed font-mono">
              <strong className="text-[#00E5FF]">KRISHNA VOICE ARCHITECTURE:</strong> All voice commands pass through natural intent classification, executing real OS directives (WhatsApp dispatch, YouTube media, phone calling, device toggles, task creation, theme switching, security sweeps) with natural speech synthesis feedback.
           </p>
        </div>
      </div>
    </div>
  );
}
