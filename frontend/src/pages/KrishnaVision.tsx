import { useState, useRef, useCallback, useEffect } from 'react';
import { Eye, Upload, Camera, Image as ImageIcon, Sparkles, Search, Bug, BookOpen, Compass, FileText, GitCompare, X, Loader2, Copy, Check, History, ChevronDown, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import { useAgentStore, type VisionAnalysis } from '../store/agent';

const VISION_MODES = [
  { id: 'UNDERSTAND', label: 'Understand', icon: Eye, description: 'Explain what is shown', color: '#00E5FF' },
  { id: 'EXTRACT', label: 'Extract', icon: FileText, description: 'Extract key information', color: '#A78BFA' },
  { id: 'ANALYZE', label: 'Analyze', icon: Search, description: 'Deep analysis', color: '#00FF9D' },
  { id: 'DEBUG', label: 'Debug', icon: Bug, description: 'Find the problem', color: '#FF3B3B' },
  { id: 'GUIDE', label: 'Guide', icon: Compass, description: 'What to do next', color: '#FBBF24' },
  { id: 'READ', label: 'Read', icon: BookOpen, description: 'Read & summarize', color: '#F472B6' },
  { id: 'COMPARE', label: 'Compare', icon: GitCompare, description: 'Compare images', color: '#60A5FA' },
];

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const SUPPORTED_TYPES = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/gif'];

export default function KrishnaVision() {
  const [selectedMode, setSelectedMode] = useState('UNDERSTAND');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageInfo, setImageInfo] = useState<{ name: string; size: string; type: string } | null>(null);
  const [userPrompt, setUserPrompt] = useState('');
  const [copied, setCopied] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const {
    currentVisionAnalysis,
    isAnalyzingVision,
    visionError,
    visionHistory,
    setCurrentVisionAnalysis,
    setIsAnalyzingVision,
    setVisionError,
    addVisionToHistory,
    clearVision,
  } = useAgentStore();

  // Clipboard paste handler
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;

      for (const item of Array.from(items)) {
        if (item.type.startsWith('image/')) {
          e.preventDefault();
          const file = item.getAsFile();
          if (file) processFile(file);
          break;
        }
      }
    };

    document.addEventListener('paste', handlePaste);
    return () => document.removeEventListener('paste', handlePaste);
  }, []);

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const processFile = useCallback((file: File) => {
    setVisionError(null);
    clearVision();

    if (!SUPPORTED_TYPES.includes(file.type)) {
      setVisionError('Unsupported file type. Please use PNG, JPEG, WebP, or GIF.');
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      setVisionError(`File is too large (${formatFileSize(file.size)}). Maximum size is 10MB.`);
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const base64 = e.target?.result as string;
      setImagePreview(base64);
      setImageInfo({
        name: file.name,
        size: formatFileSize(file.size),
        type: file.type.split('/')[1].toUpperCase()
      });
    };
    reader.onerror = () => setVisionError('Failed to read the image file.');
    reader.readAsDataURL(file);
  }, [setVisionError, clearVision]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
    if (e.target) e.target.value = '';
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) processFile(file);
  };

  const handleAnalyze = async () => {
    if (!imagePreview) return;

    setIsAnalyzingVision(true);
    setVisionError(null);
    setCurrentVisionAnalysis(null);

    try {
      const res = await fetch('/api/vision/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: imagePreview,
          mode: selectedMode,
          prompt: userPrompt.trim() || undefined
        })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || `Analysis failed (${res.status})`);
      }

      const analysis: VisionAnalysis = {
        imagePreview: imagePreview,
        analysis: data.analysis,
        mode: data.mode,
        model: data.model,
        confidence: data.confidence,
        timestamp: new Date().toISOString()
      };

      setCurrentVisionAnalysis(analysis);
      addVisionToHistory(analysis);
    } catch (err: any) {
      setVisionError(err.message || 'Krishna Vision encountered an error. Please try again.');
    } finally {
      setIsAnalyzingVision(false);
    }
  };

  const handleCopy = () => {
    if (currentVisionAnalysis?.analysis) {
      navigator.clipboard.writeText(currentVisionAnalysis.analysis);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const clearImage = () => {
    setImagePreview(null);
    setImageInfo(null);
    clearVision();
    setUserPrompt('');
  };

  const modeConfig = VISION_MODES.find(m => m.id === selectedMode) || VISION_MODES[0];

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#00E5FF]/20 to-[#A78BFA]/20 border border-[#00E5FF]/30 flex items-center justify-center">
              <Eye className="w-7 h-7 text-[#00E5FF]" />
            </div>
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-[#00FF9D] rounded-full animate-pulse" />
          </div>
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-[#00E5FF] to-[#A78BFA] bg-clip-text text-transparent">
              KRISHNA VISION
            </h1>
            <p className="text-sm text-gray-400 font-mono tracking-wide">VISUAL INTELLIGENCE ENGINE</p>
          </div>
        </div>

        <button
          onClick={() => setShowHistory(!showHistory)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-colors text-sm text-gray-300"
        >
          <History className="w-4 h-4" />
          History ({visionHistory.length})
        </button>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column — Input */}
        <div className="space-y-4">
          {/* Mode Selector */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="glass-panel p-4"
          >
            <h3 className="text-xs font-mono text-gray-400 uppercase tracking-widest mb-3">Vision Mode</h3>
            <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
              {VISION_MODES.map((mode) => (
                <button
                  key={mode.id}
                  onClick={() => setSelectedMode(mode.id)}
                  className={cn(
                    'flex flex-col items-center gap-1.5 p-2.5 rounded-xl border transition-all duration-300 text-center',
                    selectedMode === mode.id
                      ? 'border-current bg-current/10 shadow-lg shadow-current/10'
                      : 'border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20'
                  )}
                  style={{ color: selectedMode === mode.id ? mode.color : undefined }}
                >
                  <mode.icon className="w-4 h-4" />
                  <span className="text-[10px] font-mono font-medium leading-tight">{mode.label}</span>
                </button>
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-2 text-center font-mono">{modeConfig.description}</p>
          </motion.div>

          {/* Image Upload Area */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            {!imagePreview ? (
              <div
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={cn(
                  'glass-panel p-8 border-2 border-dashed cursor-pointer transition-all duration-300 flex flex-col items-center justify-center min-h-[280px] gap-4',
                  dragOver
                    ? 'border-[#00E5FF] bg-[#00E5FF]/5 scale-[1.02]'
                    : 'border-white/20 hover:border-[#00E5FF]/50 hover:bg-white/5'
                )}
              >
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#00E5FF]/10 to-[#A78BFA]/10 border border-[#00E5FF]/20 flex items-center justify-center">
                  <Upload className="w-8 h-8 text-[#00E5FF]/70" />
                </div>
                <div className="text-center">
                  <p className="text-white font-medium">Drop an image here or click to browse</p>
                  <p className="text-xs text-gray-500 mt-1 font-mono">PNG, JPEG, WebP, GIF • Max 10MB</p>
                  <p className="text-xs text-gray-600 mt-2">You can also paste from clipboard (Ctrl+V)</p>
                </div>

                <div className="flex gap-3 mt-2">
                  <button
                    onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#00E5FF]/10 border border-[#00E5FF]/30 text-[#00E5FF] text-sm hover:bg-[#00E5FF]/20 transition-colors"
                  >
                    <ImageIcon className="w-4 h-4" /> Browse
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); cameraInputRef.current?.click(); }}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#A78BFA]/10 border border-[#A78BFA]/30 text-[#A78BFA] text-sm hover:bg-[#A78BFA]/20 transition-colors"
                  >
                    <Camera className="w-4 h-4" /> Camera
                  </button>
                </div>
              </div>
            ) : (
              <div className="glass-panel p-4 relative">
                <button
                  onClick={clearImage}
                  className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full bg-black/60 border border-white/20 flex items-center justify-center hover:bg-red-500/30 hover:border-red-500/50 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-full max-h-[300px] object-contain rounded-xl bg-black/30"
                />
                {imageInfo && (
                  <div className="flex items-center gap-3 mt-3 text-xs text-gray-400 font-mono">
                    <span className="px-2 py-1 rounded bg-white/5 border border-white/10">{imageInfo.type}</span>
                    <span>{imageInfo.size}</span>
                    <span className="truncate max-w-[200px]">{imageInfo.name}</span>
                  </div>
                )}
              </div>
            )}

            <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileSelect} className="hidden" />
            <input ref={cameraInputRef} type="file" accept="image/*" capture="environment" onChange={handleFileSelect} className="hidden" />
          </motion.div>

          {/* Prompt Input */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="glass-panel p-4"
          >
            <label className="text-xs font-mono text-gray-400 uppercase tracking-widest mb-2 block">
              Ask a specific question (optional)
            </label>
            <textarea
              value={userPrompt}
              onChange={(e) => setUserPrompt(e.target.value)}
              placeholder="e.g., What error is shown? / What text can you read? / What should I do?"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 text-sm focus:outline-none focus:border-[#00E5FF]/50 resize-none h-20 font-mono"
            />

            <button
              onClick={handleAnalyze}
              disabled={!imagePreview || isAnalyzingVision}
              className={cn(
                'w-full mt-3 py-3.5 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all duration-300',
                imagePreview && !isAnalyzingVision
                  ? 'bg-gradient-to-r from-[#00E5FF] to-[#A78BFA] text-black hover:shadow-lg hover:shadow-[#00E5FF]/20 hover:scale-[1.02] active:scale-[0.98]'
                  : 'bg-white/10 text-gray-500 cursor-not-allowed'
              )}
            >
              {isAnalyzingVision ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  Analyze with Krishna Vision
                </>
              )}
            </button>
          </motion.div>
        </div>

        {/* Right Column — Results */}
        <div className="space-y-4">
          {/* Error Display */}
          <AnimatePresence>
            {visionError && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="glass-panel p-4 border-[#FF3B3B]/30 bg-[#FF3B3B]/5"
              >
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-[#FF3B3B] flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-semibold text-[#FF3B3B]">Vision Error</h4>
                    <p className="text-xs text-[#FF3B3B]/80 mt-1">{visionError}</p>
                  </div>
                  <button onClick={() => setVisionError(null)} className="ml-auto text-gray-500 hover:text-white">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Analysis Loading */}
          <AnimatePresence>
            {isAnalyzingVision && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="glass-panel p-8 flex flex-col items-center justify-center min-h-[300px]"
              >
                <div className="relative">
                  <div className="w-20 h-20 rounded-full border-2 border-[#00E5FF]/20 border-t-[#00E5FF] animate-spin" />
                  <Eye className="absolute inset-0 m-auto text-[#00E5FF] animate-pulse" size={28} />
                </div>
                <p className="text-sm font-mono text-[#00E5FF] mt-6 tracking-widest uppercase">
                  Krishna Vision Processing...
                </p>
                <p className="text-xs text-gray-500 mt-2">
                  Mode: {modeConfig.label} • Model: Vision AI
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Analysis Result */}
          <AnimatePresence>
            {currentVisionAnalysis && !isAnalyzingVision && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-panel p-5 border-[#00E5FF]/20"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${modeConfig.color}15`, border: `1px solid ${modeConfig.color}30` }}>
                      <modeConfig.icon className="w-4 h-4" style={{ color: modeConfig.color }} />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-white">{modeConfig.label} Analysis</h3>
                      <p className="text-[10px] font-mono text-gray-500">
                        {currentVisionAnalysis.model} • {currentVisionAnalysis.confidence}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={handleCopy}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-[#00FF9D]" /> : <Copy className="w-3.5 h-3.5" />}
                    {copied ? 'Copied' : 'Copy'}
                  </button>
                </div>

                <div className="prose prose-invert prose-sm max-w-none">
                  <div className="text-sm text-gray-200 leading-relaxed whitespace-pre-wrap bg-black/20 rounded-xl p-4 border border-white/5 max-h-[400px] overflow-y-auto">
                    {currentVisionAnalysis.analysis}
                  </div>
                </div>

                <div className="flex items-center gap-2 mt-4 pt-3 border-t border-white/5">
                  <span className="text-[10px] font-mono text-gray-600">
                    {new Date(currentVisionAnalysis.timestamp).toLocaleString()}
                  </span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Empty State */}
          {!currentVisionAnalysis && !isAnalyzingVision && !visionError && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="glass-panel p-8 flex flex-col items-center justify-center min-h-[300px] text-center"
            >
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#00E5FF]/5 to-[#A78BFA]/5 border border-white/10 flex items-center justify-center mb-4">
                <Eye className="w-8 h-8 text-gray-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-400">Upload an Image to Begin</h3>
              <p className="text-xs text-gray-600 mt-2 max-w-sm">
                Krishna Vision can understand screenshots, documents, diagrams, code, error messages, and more.
              </p>
              <div className="flex flex-wrap justify-center gap-2 mt-4">
                {['Screenshots', 'Error Logs', 'Documents', 'Diagrams', 'Code', 'Charts'].map(tag => (
                  <span key={tag} className="px-2.5 py-1 rounded-full text-[10px] font-mono bg-white/5 border border-white/10 text-gray-500">{tag}</span>
                ))}
              </div>
            </motion.div>
          )}

          {/* History Panel */}
          <AnimatePresence>
            {showHistory && visionHistory.length > 0 && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="glass-panel p-4"
              >
                <h3 className="text-xs font-mono text-gray-400 uppercase tracking-widest mb-3">Recent Analyses</h3>
                <div className="space-y-2 max-h-[300px] overflow-y-auto">
                  {visionHistory.slice(0, 10).map((item, i) => (
                    <button
                      key={i}
                      onClick={() => setCurrentVisionAnalysis(item)}
                      className="w-full flex items-center gap-3 p-3 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-colors text-left"
                    >
                      <img src={item.imagePreview} alt="" className="w-10 h-10 rounded-lg object-cover bg-black/20 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-white truncate">{item.analysis.substring(0, 60)}...</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[10px] font-mono text-[#00E5FF]">{item.mode}</span>
                          <span className="text-[10px] text-gray-600">
                            {new Date(item.timestamp).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Platform Notice */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="text-center"
      >
        <p className="text-[10px] font-mono text-gray-700">
          KRISHNA VISION • Image analysis via Groq Vision AI • No real-time screen capture (web platform limitation) • Images are processed securely server-side
        </p>
      </motion.div>
    </div>
  );
}
