import { useState, useRef, useEffect } from 'react';
import { Play, Square, Volume2, Shield, Activity, Sparkles, Sliders, Music, Disc, Pause, Headphones } from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';
import { useSystemStore } from '../store/system';

interface Preset {
  name: string;
  description: string;
  carrier: number;
  beat: number;
  color: string;
  glowColor: string;
}

const PRESETS: Preset[] = [
  {
    name: 'Deep Space',
    description: 'Deep spatial frequency for profound immersion and blocking distractions.',
    carrier: 90,
    beat: 2.5,
    color: '#A78BFA',
    glowColor: 'rgba(167, 139, 250, 0.2)',
  },
  {
    name: 'Digital Rain',
    description: 'Algorithmic synthetic cascade for fast-paced coding and processing.',
    carrier: 528,
    beat: 14,
    color: '#00FF9D',
    glowColor: 'rgba(0, 255, 157, 0.2)',
  },
  {
    name: 'Cognitive Alpha',
    description: 'Alpha waves (10Hz) for relaxed concentration, learning, and creative flow.',
    carrier: 432,
    beat: 10,
    color: '#00E5FF',
    glowColor: 'rgba(0, 229, 255, 0.2)',
  },
  {
    name: 'Neural Gamma',
    description: 'High Gamma peak frequency (40Hz) for intensive analysis and information retention.',
    carrier: 220,
    beat: 40,
    color: '#F472B6',
    glowColor: 'rgba(244, 114, 182, 0.2)',
  },
];

const SECONDARY_TRACKS = [
  { id: 'lofi-1', title: 'Cyber-Chill Lo-Fi', type: 'lofi', src: 'https://cdn.pixabay.com/audio/2022/05/27/18-08-00-164_source.mp3' },
  { id: 'lofi-2', title: 'Neon Rain Ambient', type: 'lofi', src: 'https://cdn.pixabay.com/audio/2022/11/22/16-56-32-506_source.mp3' },
  { id: 'binaural-1', title: 'Deep Work Binaural', type: 'binaural', src: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3' },
];

export function NeuralSoundscape() {
  const { focusState } = useSystemStore();
  const [isPlaying, setIsPlaying] = useState(false);
  const [activePreset, setActivePreset] = useState<Preset>(PRESETS[0]);
  const [carrierFreq, setCarrierFreq] = useState(432);
  const [beatFreq, setBeatFreq] = useState(10);
  const [volume, setVolume] = useState(0.5);

  const [activeTrack, setActiveTrack] = useState(SECONDARY_TRACKS[0]);
  const [isTrackPlaying, setIsTrackPlaying] = useState(false);
  const [trackVolume, setTrackVolume] = useState(0.4);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const audioCtxRef = useRef<AudioContext | null>(null);
  const leftOscRef = useRef<OscillatorNode | null>(null);
  const rightOscRef = useRef<OscillatorNode | null>(null);
  const masterGainRef = useRef<GainNode | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Synchronize manual sliders to preset change
  const selectPreset = (preset: Preset) => {
    setActivePreset(preset);
    setCarrierFreq(preset.carrier);
    setBeatFreq(preset.beat);
    
    if (isPlaying) {
      updateFrequencies(preset.carrier, preset.beat);
    }
  };

  const updateFrequencies = (carrier: number, beat: number) => {
    if (leftOscRef.current && rightOscRef.current) {
      const leftF = carrier - beat / 2;
      const rightF = carrier + beat / 2;
      leftOscRef.current.frequency.setValueAtTime(leftF, audioCtxRef.current?.currentTime || 0);
      rightOscRef.current.frequency.setValueAtTime(rightF, audioCtxRef.current?.currentTime || 0);
    }
  };

  const [isCharging, setIsCharging] = useState(false);

  useEffect(() => {
    if (typeof navigator !== 'undefined' && 'getBattery' in navigator) {
      (navigator as any).getBattery().then((battery: any) => {
        setIsCharging(battery.charging);
        battery.addEventListener('chargingchange', () => {
          setIsCharging(battery.charging);
        });
      });
    }
  }, []);

  useEffect(() => {
    if (isPlaying) {
      updateFrequencies(carrierFreq, beatFreq);
    }
  }, [carrierFreq, beatFreq]);

  useEffect(() => {
    if (masterGainRef.current && isPlaying) {
      masterGainRef.current.gain.setValueAtTime(volume, audioCtxRef.current?.currentTime || 0);
    }
  }, [volume]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = trackVolume;
    }
  }, [trackVolume]);

  // Integrate with focus timer
  useEffect(() => {
    if (focusState === 'running') {
      if (!isPlaying) startAcousticSynth();
      if (!isTrackPlaying && audioRef.current) {
        audioRef.current.play().catch(console.error);
        setIsTrackPlaying(true);
      }
    } else if (focusState === 'paused' || focusState === 'idle') {
      if (isPlaying) stopAcousticSynth();
      if (isTrackPlaying && audioRef.current) {
        audioRef.current.pause();
        setIsTrackPlaying(false);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [focusState]);

  const toggleTrack = () => {
    if (!audioRef.current) return;
    if (isTrackPlaying) {
      audioRef.current.pause();
      setIsTrackPlaying(false);
    } else {
      audioRef.current.play().catch(console.error);
      setIsTrackPlaying(true);
    }
  };

  const startAcousticSynth = () => {
    try {
      // Create audio context
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) {
        alert('Web Audio API is not supported in this browser.');
        return;
      }

      const ctx = new AudioContextClass();
      audioCtxRef.current = ctx;

      // Master Gain Node
      const masterGain = ctx.createGain();
      masterGain.gain.setValueAtTime(volume, ctx.currentTime);
      masterGainRef.current = masterGain;

      // Analyser Node for visualizer
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 256;
      analyserRef.current = analyser;
      masterGain.connect(analyser);
      analyser.connect(ctx.destination);

      // Left Channel Oscillator and Panner
      const leftOsc = ctx.createOscillator();
      leftOsc.type = 'sine';
      leftOsc.frequency.setValueAtTime(carrierFreq - beatFreq / 2, ctx.currentTime);
      leftOscRef.current = leftOsc;

      const pannerLeft = ctx.createStereoPanner();
      pannerLeft.pan.setValueAtTime(-1, ctx.currentTime);
      leftOsc.connect(pannerLeft);
      pannerLeft.connect(masterGain);

      // Right Channel Oscillator and Panner
      const rightOsc = ctx.createOscillator();
      rightOsc.type = 'sine';
      rightOsc.frequency.setValueAtTime(carrierFreq + beatFreq / 2, ctx.currentTime);
      rightOscRef.current = rightOsc;

      const pannerRight = ctx.createStereoPanner();
      pannerRight.pan.setValueAtTime(1, ctx.currentTime);
      rightOsc.connect(pannerRight);
      pannerRight.connect(masterGain);

      // Start oscillators
      leftOsc.start();
      rightOsc.start();

      setIsPlaying(true);
      startVisualizer();
    } catch (e) {
      console.error('Failed to initialize binaural acoustic synth:', e);
    }
  };

  const stopAcousticSynth = () => {
    try {
      if (leftOscRef.current) {
        leftOscRef.current.stop();
        leftOscRef.current.disconnect();
        leftOscRef.current = null;
      }
      if (rightOscRef.current) {
        rightOscRef.current.stop();
        rightOscRef.current.disconnect();
        rightOscRef.current = null;
      }
      if (masterGainRef.current) {
        masterGainRef.current.disconnect();
        masterGainRef.current = null;
      }
      if (audioCtxRef.current) {
        audioCtxRef.current.close().catch(console.error);
        audioCtxRef.current = null;
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
      setIsPlaying(false);
      clearCanvas();
    } catch (e) {
      console.error('Error stopping acoustic synthesis channel:', e);
    }
  };

  const startVisualizer = () => {
    if (!canvasRef.current || !analyserRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const analyser = analyserRef.current;
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const draw = () => {
      if (!isPlaying) return;
      animationFrameRef.current = requestAnimationFrame(draw);
      analyser.getByteTimeDomainData(dataArray);

      ctx.fillStyle = 'rgba(2, 4, 10, 0.4)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.lineWidth = 1.5;
      ctx.strokeStyle = activePreset.color;
      ctx.beginPath();

      const sliceWidth = canvas.width / bufferLength;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        const v = dataArray[i] / 128.0;
        const y = (v * canvas.height) / 2;

        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }

        x += sliceWidth;
      }

      ctx.lineTo(canvas.width, canvas.height / 2);
      ctx.stroke();

      // Add a secondary subtle echo wave for aesthetic effect
      ctx.lineWidth = 0.5;
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
      ctx.beginPath();
      x = 0;
      for (let i = 0; i < bufferLength; i++) {
        const v = dataArray[(i + 4) % bufferLength] / 128.0;
        const y = (v * canvas.height) / 2 + Math.sin(i * 0.1) * 4;
        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
        x += sliceWidth;
      }
      ctx.stroke();
    };

    draw();
  };

  const clearCanvas = () => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.fillStyle = '#02040A';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.lineWidth = 1;
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
      ctx.beginPath();
      ctx.moveTo(0, canvas.height / 2);
      ctx.lineTo(canvas.width, canvas.height / 2);
      ctx.stroke();
    }
  };

  useEffect(() => {
    clearCanvas();
    return () => {
      if (leftOscRef.current || rightOscRef.current) {
        stopAcousticSynth();
      }
    };
  }, []);

  return (
    <div className={cn(
      "glass-panel p-6 flex flex-col relative overflow-hidden h-full",
      isCharging && "animate-panel-charging-pulse"
    )}>
      <div className="absolute top-0 right-0 w-32 h-32 opacity-15 blur-2xl rounded-full" style={{ background: activePreset.color }}></div>

      <div className="flex items-center justify-between mb-4 z-10">
        <div className="flex items-center gap-2">
          <Disc className="w-5 h-5 text-gray-400 animate-spin-slow" style={{ color: activePreset.color }} />
          <h2 className="text-[10px] font-mono tracking-widest text-[#00FF9D] uppercase">Neural Soundscape</h2>
        </div>
        <div className="flex items-center gap-2">
          {focusState === 'running' && (
            <span className="text-[9px] font-mono text-[#F59E0B] bg-[#F59E0B]/10 px-1.5 py-0.5 rounded border border-[#F59E0B]/20 uppercase animate-pulse flex items-center gap-1">
              <Activity size={10} /> Focus Sync
            </span>
          )}
          <span className="text-[9px] uppercase font-mono px-2 py-0.5 rounded border border-white/5 bg-white/5 text-gray-400">
            Acoustic Synth
          </span>
        </div>
      </div>

      <p className="text-xs text-gray-400 leading-normal mb-6 z-10">
        Generate organic binaural acoustic beats in real-time. Connect a stereo headset to activate localized neurological frequency alignment.
      </p>

      {/* Preset Grid */}
      <div className="grid grid-cols-2 gap-3 mb-6 z-10">
        {PRESETS.map((preset) => (
          <button
            key={preset.name}
            onClick={() => selectPreset(preset)}
            className={cn(
              "p-3 rounded-xl border text-left transition-all duration-300 flex flex-col justify-between group focus:outline-none cursor-pointer",
              activePreset.name === preset.name
                ? "bg-white/[0.03] text-white"
                : "bg-black/25 border-white/5 text-gray-400 hover:border-white/10 hover:text-white"
            )}
            style={{
              borderColor: activePreset.name === preset.name ? preset.color : 'rgba(255, 255, 255, 0.05)',
              boxShadow: activePreset.name === preset.name ? `0 0 15px ${preset.glowColor}` : 'none'
            }}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-bold leading-none" style={{ color: preset.color }}>{preset.name.split(' (')[0]}</span>
              <Music size={12} className="opacity-40 group-hover:opacity-100 transition-opacity" style={{ color: preset.color }} />
            </div>
            <p className="text-[9px] text-gray-500 leading-normal line-clamp-2">{preset.description}</p>
          </button>
        ))}
      </div>

      {/* Audio Player for Secondary Tracks */}
      <div className="mb-6 z-10 border border-white/5 bg-white/[0.02] rounded-xl p-3 flex flex-col gap-3">
        <div className="flex justify-between items-center">
          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-gray-500 flex items-center gap-1">
            <Headphones size={12} /> External Resonance Tracks
          </span>
          <select 
            className="bg-black/50 border border-white/10 text-[9px] font-mono text-gray-400 p-1 rounded focus:outline-none focus:border-[#A78BFA]"
            value={activeTrack.id}
            onChange={(e) => {
              const track = SECONDARY_TRACKS.find(t => t.id === e.target.value);
              if (track) {
                setActiveTrack(track);
                if (isTrackPlaying && audioRef.current) {
                  audioRef.current.src = track.src;
                  audioRef.current.play().catch(console.error);
                }
              }
            }}
          >
            {SECONDARY_TRACKS.map(t => <option key={t.id} value={t.id}>{t.title}</option>)}
          </select>
        </div>
        
        <audio ref={audioRef} src={activeTrack.src} loop className="hidden" onEnded={() => setIsTrackPlaying(false)} />
        
        <div className="flex gap-3 items-center">
          <button 
            onClick={toggleTrack}
            className={cn(
              "p-2 rounded-lg border transition-all cursor-pointer flex-shrink-0",
              isTrackPlaying ? "bg-[#A78BFA]/20 border-[#A78BFA]/40 text-[#A78BFA]" : "bg-white/5 border-white/10 text-gray-400 hover:text-white"
            )}
          >
            {isTrackPlaying ? <Pause size={14} fill="currentColor" /> : <Play size={14} fill="currentColor" />}
          </button>
          
          <div className="flex-1 flex items-center gap-2">
            <Volume2 size={12} className="text-gray-500 flex-shrink-0" />
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={trackVolume}
              onChange={(e) => setTrackVolume(parseFloat(e.target.value))}
              className="w-full accent-gray-400 bg-white/5 rounded-lg appearance-none h-1 cursor-pointer"
            />
          </div>
        </div>
      </div>

      {/* Manual Fine Tuning Accordion */}
      <div className="space-y-4 mb-4 z-10 flex-1">
        <div className="flex justify-between items-center border-b border-white/5 pb-2">
          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-gray-500">Manual Frequency Modulation</span>
          <span className="text-[10px] font-mono text-gray-400 flex items-center gap-1">
            <Sliders size={10} /> Active Synth Tuning
          </span>
        </div>

        <div className="space-y-3.5">
          {/* Carrier slider */}
          <div>
            <div className="flex justify-between text-[10px] font-mono text-gray-400 mb-1">
              <span>Carrier Sine Tone (Pitch)</span>
              <span className="text-white font-bold">{carrierFreq} Hz</span>
            </div>
            <input
              type="range"
              min="80"
              max="600"
              step="1"
              value={carrierFreq}
              onChange={(e) => {
                setCarrierFreq(Number(e.target.value));
                setActivePreset({ ...activePreset, name: 'Custom Dynamic Profile' });
              }}
              className="w-full accent-krishna-cyan bg-white/5 rounded-lg appearance-none h-1 cursor-pointer"
            />
          </div>

          {/* Beat split slider */}
          <div>
            <div className="flex justify-between text-[10px] font-mono text-gray-400 mb-1">
              <span>Binaural Beat Offset (Neurological Sync Rate)</span>
              <span className="text-white font-bold">{beatFreq} Hz ({beatFreq >= 30 ? 'Gamma' : beatFreq >= 13 ? 'Beta' : beatFreq >= 8 ? 'Alpha' : beatFreq >= 4 ? 'Theta' : 'Delta'})</span>
            </div>
            <input
              type="range"
              min="1"
              max="50"
              step="0.5"
              value={beatFreq}
              onChange={(e) => {
                setBeatFreq(Number(e.target.value));
                setActivePreset({ ...activePreset, name: 'Custom Dynamic Profile' });
              }}
              className="w-full accent-krishna-cyan bg-white/5 rounded-lg appearance-none h-1 cursor-pointer"
            />
          </div>
        </div>
      </div>

      {/* Visualizer Area */}
      <div className="relative border border-white/5 rounded-xl bg-black/60 h-16 mb-4 flex items-center justify-center overflow-hidden z-10 shrink-0">
        <canvas ref={canvasRef} width={400} height={64} className="w-full h-full" />
        <div className="absolute font-mono text-[9px] text-gray-500 right-2 top-2 flex items-center gap-1.5 bg-black/40 px-1.5 py-0.5 rounded border border-white/5">
          <Activity size={10} className={isPlaying ? 'animate-pulse text-green-400' : 'text-gray-500'} />
          <span>{isPlaying ? 'AUDIO_GENERATIVE_STREAM' : 'STREAM_MUTED'}</span>
        </div>
      </div>

      {/* Controls Bar */}
      <div className="flex items-center justify-between gap-4 mt-auto border-t border-white/5 pt-4 z-10">
        <div className="flex items-center gap-2 flex-1">
          <Volume2 size={14} className="text-gray-500 flex-shrink-0" />
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={volume}
            onChange={(e) => setVolume(parseFloat(e.target.value))}
            className="w-full accent-gray-400 bg-white/5 rounded-lg appearance-none h-1 cursor-pointer"
          />
          <span className="font-mono text-[10px] text-gray-400 w-8 text-right font-bold">{Math.round(volume * 100)}%</span>
        </div>

        {isPlaying ? (
          <button
            onClick={stopAcousticSynth}
            className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-all font-mono text-[10px] font-bold flex items-center gap-2 cursor-pointer focus:outline-none uppercase"
          >
            <Square size={12} className="fill-white" />
            <span>Mute Synth</span>
          </button>
        ) : (
          <button
            onClick={startAcousticSynth}
            className="px-4 py-2 rounded-xl transition-all font-mono text-[10px] font-bold flex items-center gap-2 cursor-pointer focus:outline-none hover:shadow-lg text-black uppercase"
            style={{
              backgroundColor: activePreset.color,
              boxShadow: `0 4px 15px ${activePreset.glowColor}`
            }}
          >
            <Play size={12} className="fill-black" />
            <span>Init Resonance</span>
          </button>
        )}
      </div>
    </div>
  );
}
