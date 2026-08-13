import { useEffect, useRef, useState } from 'react';
import { useSystemStore } from '../store/system';

export function useClapDetection(onClap: () => void) {
  const [isListening, setIsListening] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const microphoneRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const dataArrayRef = useRef<Uint8Array | null>(null);
  const animationFrameRef = useRef<number>(0);
  const lastClapTimeRef = useRef<number>(0);

  const startListening = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      analyserRef.current = audioContextRef.current.createAnalyser();
      analyserRef.current.fftSize = 256;
      
      microphoneRef.current = audioContextRef.current.createMediaStreamSource(stream);
      microphoneRef.current.connect(analyserRef.current);
      
      dataArrayRef.current = new Uint8Array(analyserRef.current.frequencyBinCount);
      setIsListening(true);
      
      const detectClap = () => {
        if (!analyserRef.current || !dataArrayRef.current) return;
        
        analyserRef.current.getByteFrequencyData(dataArrayRef.current);
        
        let sum = 0;
        for (let i = 0; i < dataArrayRef.current.length; i++) {
          sum += dataArrayRef.current[i];
        }
        
        const average = sum / dataArrayRef.current.length;
        
        const state = useSystemStore.getState();
        const CLAP_THRESHOLD = state.clapSensitivity;
        const COOLDOWN = state.clapCooldown;

        const now = Date.now();
        
        if (average > CLAP_THRESHOLD && now - lastClapTimeRef.current > COOLDOWN) {
          lastClapTimeRef.current = now;
          onClap();
        }
        
        animationFrameRef.current = requestAnimationFrame(detectClap);
      };
      
      detectClap();
    } catch (err) {
      console.error("Clap detection microphone access error:", err);
    }
  };

  const stopListening = () => {
    if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    if (microphoneRef.current) microphoneRef.current.disconnect();
    if (audioContextRef.current) audioContextRef.current.close();
    setIsListening(false);
  };

  useEffect(() => {
    return () => {
      stopListening();
    };
  }, []);

  const getAudioData = () => {
    if (!analyserRef.current || !dataArrayRef.current) return null;
    return dataArrayRef.current;
  };

  return { isListening, startListening, stopListening, getAudioData };
}
