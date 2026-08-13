import { useState, useEffect } from 'react';

export function TypewriterText({ text, speed = 15, onComplete }: { text: string; speed?: number, onComplete?: () => void }) {
  const [displayedText, setDisplayedText] = useState("");

  useEffect(() => {
    setDisplayedText(""); // Reset when text changes
    let currentIndex = 0;
    
    // Quick burst for the first word to feel responsive
    const initialBurst = Math.min(10, text.length);
    setDisplayedText(text.substring(0, initialBurst));
    currentIndex = initialBurst;

    const interval = setInterval(() => {
      if (currentIndex >= text.length) {
        clearInterval(interval);
        if (onComplete) onComplete();
        return;
      }
      
      // Add chunk
      const chunkSize = Math.max(1, Math.floor(Math.random() * 3)); // 1 to 3 chars
      currentIndex += chunkSize;
      setDisplayedText(text.substring(0, currentIndex));
      
    }, speed + (Math.random() * 10 - 5)); // Slight randomization

    return () => clearInterval(interval);
  }, [text, speed]);

  return <span>{displayedText}{displayedText.length < text.length && <span className="inline-block w-1.5 h-3 ml-0.5 bg-[#00E5FF] animate-pulse align-middle opacity-70"></span>}</span>;
}
