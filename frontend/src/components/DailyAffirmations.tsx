import { useState, useEffect } from 'react';
import { Sparkles, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export function DailyAffirmations() {
  const [affirmation, setAffirmation] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchAffirmation = async () => {
      try {
        const res = await fetch('/api/chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            messages: [{ role: 'user', parts: [{ text: 'Generate a short, uplifting, and tech-forward daily affirmation for a system operator. Maximum 2 sentences.' }] }],
            systemInstruction: "You are the KRISHNA OS Wellness Core. Provide a single, futuristic, calming, and highly motivating daily affirmation for the system operator. Keep it brief, poetic, and focused on clarity, progress, or mindfulness."
          }),
        });

        if (!res.ok) {
          throw new Error('Failed to fetch affirmation');
        }

        const data = await res.json();
        setAffirmation(data.text);
      } catch (err) {
        console.error('Affirmation error:', err);
        setError(true);
        // Fallback affirmation if API fails or is not available
        setAffirmation("Your operational clarity dictates the system's harmony. Breathe deeply, process efficiently, and navigate today with precision.");
      } finally {
        setLoading(false);
      }
    };

    fetchAffirmation();
  }, []);

  return (
    <div className="glass-panel p-6 relative overflow-hidden group border border-white/5">
      <div className="absolute top-0 right-0 w-32 h-32 bg-[#00FF9D]/5 blur-3xl rounded-full"></div>
      
      <div className="flex flex-col relative z-10 w-full">
        <h2 className="text-[10px] font-mono tracking-widest text-[#00FF9D] uppercase mb-4 flex items-center gap-2">
          <Sparkles size={12} /> Daily Neural Affirmation
        </h2>
        
        <div className="min-h-[60px] flex items-center">
          <AnimatePresence mode="wait">
            {loading ? (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center gap-2 text-sm text-gray-400 font-mono"
              >
                <Loader2 size={16} className="animate-spin" /> Synthesizing affirmation...
              </motion.div>
            ) : (
              <motion.div
                key="content"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-lg font-sans tracking-wide text-white/90 leading-relaxed font-light italic"
              >
                "{affirmation}"
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
