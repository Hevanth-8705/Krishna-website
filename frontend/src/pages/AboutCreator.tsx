import { motion } from 'motion/react';
import { 
  User, 
  Sparkles, 
  Terminal, 
  Linkedin, 
  Github, 
  Code, 
  Database, 
  Cpu, 
  Radio, 
  Globe, 
  Compass, 
  Milestone, 
  Layers, 
  Maximize2,
  BookmarkCheck,
  Brain,
  Volume2
} from 'lucide-react';

export default function AboutCreator() {
  const creatorSkills = [
    { name: 'AI Systems Architecture', icon: Brain, level: 'Advanced' },
    { name: 'Android Development', icon: Code, level: 'Expert' },
    { name: 'Voice & Accessibility Automation', icon: Radio, level: 'Advanced' },
    { name: 'Multi-Agent Orchestration', icon: Layers, level: 'Advanced' },
    { name: 'Ambient Computing Solutions', icon: Cpu, level: 'Advanced' },
    { name: 'Educational AI Tech', icon: Database, level: 'Intermediate' }
  ];

  const developmentRoadmap = [
    { year: 'Phase 1', title: 'Conceptual Genesis', desc: 'Designing the ambient OS core & speech intent synthesis protocols.' },
    { year: 'Phase 2', title: 'Neural Soundscapes & Multi-Agents', desc: 'Deploying deep generative frequency engines and modular cognitive pipelines.' },
    { year: 'Phase 3', title: 'Adaptive Control Hub Sync', desc: 'Empowering real-time mesh networking and bulk predictive health analytics.' },
    { year: 'Phase 4', title: 'Fully Autonomous Ambient Computing', desc: 'Bridging sensory networks with local LLM execution and zero-latency pipelines.' }
  ];

  const handleSpeakIntro = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const text = "Greetings. I am happy to introduce my creator, B. Hevanth Kumar. He is the founder and AI systems architect of Krishna AI. He built me to be a futuristic AI operating system capable of intelligent automation, personalized learning, accessibility assistance, real-world problem solving, and ambient computing. Feel free to explore his roadmap and vision.";
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.pitch = 1.05;
      utterance.rate = 1.0;
      window.speechSynthesis.speak(utterance);
    } else {
      alert("TTS Not supported on this environment");
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12">
      {/* Decorative Glow Grid */}
      <div className="absolute top-0 right-0 w-[450px] h-[450px] bg-cyan-500/10 rounded-full blur-[120px] pointer-events-none z-0"></div>
      <div className="absolute bottom-20 left-20 w-[400px] h-[400px] bg-blue-500/10 rounded-full blur-[100px] pointer-events-none z-0"></div>

      {/* Intro Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-[#00E5FF]/15 pb-6">
        <div>
          <h1 className="text-3xl font-mono font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-white via-gray-100 to-[#00E5FF] flex items-center gap-3">
            <User className="text-[#00E5FF] w-8 h-8 font-normal" /> CREATOR IDENTITY
          </h1>
          <p className="text-xs text-gray-400 font-mono mt-2 uppercase tracking-widest">
            Identity Authorization Core / B. Hevanth Kumar Project Portfolio
          </p>
        </div>
        <button
          onClick={handleSpeakIntro}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-mono font-bold uppercase tracking-wider text-[#00E5FF] bg-[#00E5FF]/10 border border-[#00E5FF]/30 hover:bg-[#00E5FF]/20 active:scale-95 transition-all select-none cursor-pointer"
        >
          <Volume2 className="w-4 h-4 animate-pulse" />
          Play Voice Introduction
        </button>
      </div>

      {/* Grid Cards Container */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative z-10">
        
        {/* Profile Card Left Panel (Col span 5) */}
        <div className="lg:col-span-5 space-y-6">
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative overflow-hidden rounded-2xl border border-cyan-500/30 bg-black/80 p-6 shadow-[0_0_40px_rgba(0,229,255,0.15)] flex flex-col items-center text-center group"
          >
            {/* Holographic scanner active line */}
            <div className="absolute inset-x-0 h-[2px] bg-cyan-400/50 -translate-y-1/2 animate-bounce top-1/2 rounded pointer-events-none"></div>
            
            {/* Visual Avatar Element */}
            <div className="relative w-32 h-32 rounded-2xl bg-gradient-to-br from-cyan-950 via-gray-900 to-blue-900 border-2 border-[#00E5FF]/40 p-1 mb-5 flex items-center justify-center shadow-[0_0_20px_rgba(0,229,255,0.25)] group-hover:border-[#00E5FF] transition-all">
              <span className="absolute inset-0 bg-[#00E5FF] blur-xl opacity-20 rounded-full animate-pulse"></span>
              <Terminal className="w-16 h-16 text-[#00E5FF] animate-pulse" />
              <div className="absolute bottom-2 right-2 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00FF9D] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-[#00FF9D]"></span>
              </div>
            </div>

            {/* Author Metadata */}
            <h2 className="text-2xl font-mono font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-[#00E5FF] tracking-wider uppercase">
              B. Hevanth Kumar
            </h2>
            <p className="text-xs text-[#00FF9D] font-mono tracking-widest uppercase font-extrabold mt-1">
              Founder & Systems Architect
            </p>

            <span className="mt-4 px-3 py-1 text-[9px] font-mono font-bold uppercase tracking-widest text-[#00E5FF] bg-[#00E5FF]/10 rounded-full border border-[#00E5FF]/20">
              ⚡ Futuristic OS Creator
            </span>

            {/* Paragraph Bio */}
            <p className="text-sm text-gray-300 leading-relaxed font-sans mt-5 px-2">
              B. Hevanth Kumar is an ambitious Android developer, AI systems engineer, and student visionary. He built Krishna AI to pioneer next-generation voice automation, accessibility systems, learning environments, and ambient computing workflows that seamlessly solve real-world problems.
            </p>

            {/* Micro Coordinates/Status Log */}
            <div className="w-full border-t border-white/5 pt-4 mt-6 flex justify-between text-[9px] font-mono text-gray-500">
              <span>REF_KEY: B_HK_7792</span>
              <span>COGNITIVE CORE INTEL</span>
            </div>
          </motion.div>

          {/* Social Links Panel */}
          <div className="rounded-xl border border-white/10 bg-black/50 p-4 space-y-3.5">
            <h3 className="text-xs font-mono font-extrabold text-[#00E5FF] uppercase tracking-wider">
              AUTHOR CONNECTION CHANNELS
            </h3>
            
            <div className="grid grid-cols-2 gap-2">
              <a 
                href="https://github.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-3 py-2.5 rounded-lg border border-white/5 bg-white/[0.02] hover:bg-white/[0.08] hover:border-[#00E5FF]/30 text-gray-300 hover:text-white transition-all text-xs font-mono"
              >
                <Github size={13} className="text-cyan-400" /> Github Source
              </a>
              <a 
                href="https://linkedin.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-3 py-2.5 rounded-lg border border-white/5 bg-white/[0.02] hover:bg-white/[0.08] hover:border-[#00E5FF]/30 text-gray-300 hover:text-white transition-all text-xs font-mono"
              >
                <Linkedin size={13} className="text-cyan-400" /> LinkedIn Profiler
              </a>
              <a 
                href="https://google.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-3 py-2.5 rounded-lg border border-white/5 bg-white/[0.02] hover:bg-white/[0.08] hover:border-[#00E5FF]/30 text-gray-300 hover:text-white transition-all text-xs font-mono cols-span-2"
              >
                <Globe size={13} className="text-cyan-400" /> Digital Hub
              </a>
              <a 
                href="https://google.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-3 py-2.5 rounded-lg border border-white/5 bg-white/[0.02] hover:bg-white/[0.08] hover:border-[#00E5FF]/30 text-gray-300 hover:text-white transition-all text-xs font-mono"
              >
                <Compass size={13} className="text-cyan-400" /> Academic Ops
              </a>
            </div>
          </div>
        </div>

        {/* Vision, Milestones & Skills Right Panel (Col span 7) */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Creator Vision Statement Section */}
          <div className="rounded-2xl border border-white/5 bg-gradient-to-br from-cyan-950/10 via-black to-black p-6 space-y-4">
            <h3 className="text-sm font-mono font-bold text-[#00E5FF] tracking-wider uppercase flex items-center gap-2">
              <Sparkles size={16} className="text-[#00FF9D]" /> Creator Vision
            </h3>
            <blockquote className="border-l-2 border-[#00E5FF] pl-4 italic text-sm text-gray-200">
              "B. Hevanth Kumar is building Krishna AI with the vision of creating a futuristic AI operating system capable of intelligent automation, personalized learning, accessibility assistance, real-world problem solving, and ambient AI interaction. Each module is crafted to push the envelope of voice control and telemetry response."
            </blockquote>
          </div>

          {/* Core Technical Alignment */}
          <div className="rounded-2xl border border-white/15 bg-black/60 p-6 space-y-4">
            <h3 className="text-sm font-mono font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Milestone className="text-[#00E5FF] w-4 h-4" /> Core Technical Focus & Skills
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {creatorSkills.map((v, i) => (
                <div key={i} className="flex gap-3 p-3 bg-white/[0.02] hover:bg-cyan-500/5 rounded-xl border border-white/5 transition-colors">
                  <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400 h-9 w-9 flex items-center justify-center shrink-0">
                    <v.icon size={16} />
                  </div>
                  <div>
                    <h4 className="text-xs font-mono font-bold text-gray-200 uppercase">{v.name}</h4>
                    <span className="text-[9px] font-mono uppercase bg-[#00FF9D]/10 text-[#00FF9D] font-bold px-1.5 py-0.5 rounded border border-[#00FF9D]/20 block w-max mt-1">
                      {v.level}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Development Roadmap Section */}
          <div className="rounded-2xl border border-white/10 bg-black/60 p-6 space-y-5">
            <h3 className="text-sm font-mono font-bold text-[#00E5FF] tracking-wider uppercase flex items-center gap-2">
              <Layers size={16} /> Krishna AI Development Roadmap
            </h3>
            
            <div className="space-y-4 relative before:absolute before:left-3.5 before:top-2 before:bottom-2 before:w-[1px] before:bg-cyan-500/20">
              {developmentRoadmap.map((item, index) => (
                <div key={index} className="flex gap-4 relative">
                  <div className="w-7 h-7 rounded-full bg-black border border-cyan-400/40 flex items-center justify-center text-[9px] font-bold text-[#00FF9D] z-10 shrink-0 select-none">
                    {index + 1}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono text-[#00E5FF] font-black uppercase tracking-widest">{item.year}</span>
                      <span className="text-xs font-mono text-gray-400">•</span>
                      <h4 className="text-xs font-bold text-white uppercase">{item.title}</h4>
                    </div>
                    <p className="text-xs text-gray-400 leading-relaxed mt-1">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
