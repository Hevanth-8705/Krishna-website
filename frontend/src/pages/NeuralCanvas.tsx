import React, { useState, useEffect, useRef } from 'react';
import { 
  Sparkles, 
  Image as ImageIcon, 
  Video as VideoIcon, 
  RefreshCw, 
  Download, 
  Edit3, 
  Upload, 
  Trash2, 
  Copy, 
  Plus, 
  FileImage, 
  Terminal, 
  AlertTriangle,
  Play,
  Sliders,
  CheckCircle2,
  Info,
  Clock
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';

interface GeneratedAsset {
  id: string;
  type: 'image' | 'video';
  prompt: string;
  url: string;
  timestamp: string;
  aspectRatio: string;
  engine?: 'imagen' | 'dalle' | 'veo' | 'edit';
  modelVersion?: string;
}

interface QueueItem {
  id: string;
  prompt: string;
  engine: 'imagen' | 'dalle';
  aspectRatio: string;
  quality?: 'standard' | 'hd';
  style?: 'vivid' | 'natural';
  status: 'pending' | 'processing' | 'completed' | 'failed';
  error?: string;
  resultUrl?: string;
}

const ASPECT_RATIOS = [
  { label: 'Square (1:1)', value: '1:1', width: 'aspect-square' },
  { label: 'Landscape (16:9)', value: '16:9', width: 'aspect-video' },
  { label: 'Portrait (9:16)', value: '9:16', width: 'aspect-[9/16]' },
  { label: 'Standard (4:3)', value: '4:3', width: 'aspect-[4/3]' },
  { label: 'Classic (3:4)', value: '3:4', width: 'aspect-[3/4]' }
];

// Helpers to read engine name and clean up potential legacy prompts safely
const getAssetEngine = (asset: GeneratedAsset): { label: string; color: string; rawEngine: 'imagen' | 'dalle' | 'veo' | 'edit' } => {
  if (asset.engine) {
    if (asset.engine === 'dalle') return { label: 'DALL-E 3', color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/15', rawEngine: 'dalle' };
    if (asset.engine === 'imagen') return { label: 'Imagen 3', color: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/15', rawEngine: 'imagen' };
    if (asset.engine === 'veo') return { label: 'Veo Motion', color: 'text-green-400 bg-green-500/10 border-green-500/15', rawEngine: 'veo' };
    if (asset.engine === 'edit') return { label: 'Frame Edit', color: 'text-purple-400 bg-purple-500/10 border-purple-500/15', rawEngine: 'edit' };
  }
  
  // Retroactive backward compatibility layer for assets created in previous revisions
  if (asset.prompt.startsWith('[DALL-E 3]')) {
    return { label: 'DALL-E 3', color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/15', rawEngine: 'dalle' };
  }
  if (asset.prompt.startsWith('[Edit]')) {
    return { label: 'Frame Edit', color: 'text-purple-400 bg-purple-500/10 border-purple-500/15', rawEngine: 'edit' };
  }
  if (asset.type === 'video') {
    return { label: 'Veo Motion', color: 'text-green-400 bg-green-500/10 border-green-500/15', rawEngine: 'veo' };
  }
  return { label: 'Imagen 3', color: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/15', rawEngine: 'imagen' };
};

const getCleanPrompt = (asset: GeneratedAsset): string => {
  let p = asset.prompt;
  if (p.startsWith('[DALL-E 3] ')) p = p.substring(11);
  if (p.startsWith('[Edit] ')) p = p.substring(7);
  return p;
};

export default function NeuralCanvas() {
  const [activeTab, setActiveTab] = useState<'generate' | 'edit' | 'video'>('generate');
  const [prompt, setPrompt] = useState('');
  const [aspectRatio, setAspectRatio] = useState('1:1');
  const [resolution, setResolution] = useState('720p');
  const [imageEngine, setImageEngine] = useState<'imagen' | 'dalle'>('imagen');
  const [dalleQuality, setDalleQuality] = useState<'standard' | 'hd'>('standard');
  const [dalleStyle, setDalleStyle] = useState<'vivid' | 'natural'>('vivid');
  
  // Detail Modal & Replay Actions
  const [selectedAsset, setSelectedAsset] = useState<GeneratedAsset | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // States for Image Generator
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [generatedImg, setGeneratedImg] = useState<string | null>(null);
  
  // States for Image Editor
  const [editPrompt, setEditPrompt] = useState('');
  const [sourceImage, setSourceImage] = useState<string | null>(null);
  const [sourceImageMime, setSourceImageMime] = useState<string | null>(null);
  const [isEditingImage, setIsEditingImage] = useState(false);
  const [editedImg, setEditedImg] = useState<string | null>(null);

  // States for Video Suite
  const [videoPrompt, setVideoPrompt] = useState('');
  const [isGeneratingVideo, setIsGeneratingVideo] = useState(false);
  const [videoSourceImage, setVideoSourceImage] = useState<string | null>(null);
  const [videoSourceMime, setVideoSourceMime] = useState<string | null>(null);
  const [videoOperation, setVideoOperation] = useState<string | null>(null);
  const [videoStatusText, setVideoStatusText] = useState('');
  const [generatedVideoUrl, setGeneratedVideoUrl] = useState<string | null>(null);

  // Error captures
  const [errorText, setErrorText] = useState<string | null>(null);

  // Local Gallery Persistence (Session base)
  const [gallery, setGallery] = useState<GeneratedAsset[]>([]);

  // States for Sequenced Prompt Queueing
  const [generationQueue, setGenerationQueue] = useState<QueueItem[]>([]);
  const [isProcessingQueue, setIsProcessingQueue] = useState(false);

  // Derived Queue computations for header status indicator
  const pendingQueueCount = generationQueue.filter(q => q.status === 'pending').length;
  const processingQueueCount = generationQueue.filter(q => q.status === 'processing').length;
  const activeQueueCount = pendingQueueCount + processingQueueCount;

  // Estimate completion time of all pending and currently processing items.
  // Imagen 3 takes around 5 seconds, DALL-E 3 takes around 10 seconds.
  const estimatedQueueTimeSeconds = generationQueue
    .filter(q => q.status === 'pending' || q.status === 'processing')
    .reduce((acc, q) => acc + (q.engine === 'dalle' ? 10 : 5), 0);

  const formatEstimatedTime = (seconds: number) => {
    if (seconds <= 0) return '0s';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
  };

  // File Upload refs
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoImgInputRef = useRef<HTMLInputElement>(null);

  // Sequenced Queue Processing State Machine
  useEffect(() => {
    // 1. Check if there is an item currently under synthesis (active)
    const activeProcessingItem = generationQueue.find(item => item.status === 'processing');
    if (activeProcessingItem) {
      // Already executing sequence. Wait for completion/failure state transition.
      return;
    }

    // 2. Locate first queued pending item in line
    const nextPendingItem = generationQueue.find(item => item.status === 'pending');
    if (!nextPendingItem) {
      // All pending tasks exhausted elements
      if (isProcessingQueue) {
        setIsProcessingQueue(false);
      }
      return;
    }

    // 3. Auto-start execution cycle
    const processQueueItem = async (itemToProcess: QueueItem) => {
      setIsProcessingQueue(true);
      
      // Upgrade status to processing
      setGenerationQueue(prev => prev.map(q => q.id === itemToProcess.id ? { ...q, status: 'processing' as const } : q));

      try {
        const endpoint = itemToProcess.engine === 'dalle' ? '/api/generate-dalle' : '/api/generate-image';
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            prompt: itemToProcess.prompt, 
            aspectRatio: itemToProcess.aspectRatio,
            quality: itemToProcess.engine === 'dalle' ? itemToProcess.quality : undefined,
            style: itemToProcess.engine === 'dalle' ? itemToProcess.style : undefined
          })
        });

        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.error || "Synthesis engine rejected request.");
        }

        // Set main visual monitor as active preview
        setGeneratedImg(data.imageUrl);

        // Mark item as completed
        setGenerationQueue(prev => prev.map(q => q.id === itemToProcess.id ? { ...q, status: 'completed' as const, resultUrl: data.imageUrl } : q));

        // Save into global historical gallery
        const displayPrompt = itemToProcess.engine === 'dalle' ? `[DALL-E 3] ${itemToProcess.prompt}` : itemToProcess.prompt;
        const modelVer = itemToProcess.engine === 'dalle'
          ? `dall-e-3 (Quality: ${itemToProcess.quality}, Style: ${itemToProcess.style})`
          : 'krishna-neural-studio';
        saveToGallery('image', data.imageUrl, displayPrompt, itemToProcess.aspectRatio, itemToProcess.engine, modelVer);

      } catch (err: any) {
        console.error("Queue process cycle error:", err);
        setGenerationQueue(prev => prev.map(q => q.id === itemToProcess.id ? { ...q, status: 'failed' as const, error: err.message || "Synthesis failed." } : q));
      }
    };

    processQueueItem(nextPendingItem);
  }, [generationQueue, isProcessingQueue]);

  // Retrieve gallery from localStorage on mount
  useEffect(() => {
    try {
      const savedGallery = localStorage.getItem('krishna_neural_gallery');
      if (savedGallery) {
        setGallery(JSON.parse(savedGallery));
      }
    } catch (e) {
      console.error("Failed to load gallery:", e);
    }
  }, []);

  // Save gallery to localStorage
  const saveToGallery = (type: 'image' | 'video', url: string, promptText: string, ratio: string, engine?: 'imagen' | 'dalle' | 'veo' | 'edit', modelVersion?: string) => {
    const newItem: GeneratedAsset = {
      id: crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2, 9),
      type,
      prompt: promptText,
      url,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' ' + new Date().toLocaleDateString(),
      aspectRatio: ratio,
      engine,
      modelVersion
    };
    
    setGallery((prev) => {
      const updated = [newItem, ...prev];
      try {
        localStorage.setItem('krishna_neural_gallery', JSON.stringify(updated));
      } catch (e) {
        console.error("Failed to save gallery to localStorage:", e);
      }
      return updated;
    });
  };

  const clearGallery = () => {
    setGallery([]);
    localStorage.removeItem('krishna_neural_gallery');
  };

  const handleCopyPromptText = (asset: GeneratedAsset, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const cleanPromptText = getCleanPrompt(asset);
    navigator.clipboard.writeText(cleanPromptText);
    setCopiedId(asset.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleReuseAssetSettings = (asset: GeneratedAsset) => {
    const cleanPromptText = getCleanPrompt(asset);
    const engineInfo = getAssetEngine(asset);
    
    if (asset.type === 'video') {
      setActiveTab('video');
      setVideoPrompt(cleanPromptText);
    } else {
      if (engineInfo.rawEngine === 'edit') {
        setActiveTab('edit');
        setEditPrompt(cleanPromptText);
        setSourceImage(asset.url);
        setSourceImageMime('image/png');
      } else {
        setActiveTab('generate');
        setPrompt(cleanPromptText);
        setImageEngine(engineInfo.rawEngine === 'dalle' ? 'dalle' : 'imagen');
        if (engineInfo.rawEngine === 'dalle' && asset.modelVersion) {
          if (asset.modelVersion.includes('Quality: hd')) setDalleQuality('hd');
          else if (asset.modelVersion.includes('Quality: standard')) setDalleQuality('standard');

          if (asset.modelVersion.includes('Style: natural')) setDalleStyle('natural');
          else if (asset.modelVersion.includes('Style: vivid')) setDalleStyle('vivid');
        }
      }
    }
    
    if (asset.aspectRatio) {
      setAspectRatio(asset.aspectRatio);
    }

    setSuccessToast(`Synchronized settings for corresponding ${asset.type === 'video' ? 'Video' : 'Image'} generator.`);
    setTimeout(() => setSuccessToast(null), 3500);
    
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleAddToQueue = () => {
    if (!prompt.trim()) {
      setErrorText("Input prompt context required to add to queue.");
      return;
    }

    const newItem: QueueItem = {
      id: crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2, 9),
      prompt: prompt.trim(),
      engine: imageEngine,
      aspectRatio: aspectRatio,
      quality: imageEngine === 'dalle' ? dalleQuality : undefined,
      style: imageEngine === 'dalle' ? dalleStyle : undefined,
      status: 'pending'
    };

    setGenerationQueue(prev => [...prev, newItem]);
    setPrompt(''); // clear input so user can type next prompt quickly
    setSuccessToast(`Enqueued prompt to sequence.`);
    setTimeout(() => setSuccessToast(null), 2500);
  };

  const handleRemoveFromQueue = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setGenerationQueue(prev => prev.filter(item => item.id !== id));
  };

  const handleClearQueue = () => {
    setGenerationQueue([]);
    setSuccessToast("Cleared the sequence queue.");
    setTimeout(() => setSuccessToast(null), 2500);
  };

  const handleClearCompleted = () => {
    setGenerationQueue(prev => prev.filter(item => item.status !== 'completed'));
    setSuccessToast("Cleared all completed tasks.");
    setTimeout(() => setSuccessToast(null), 2500);
  };

  // Helper to read and process base64 files
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, target: 'edit' | 'video') => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrorText("Transgression: Only image file sources are accepted.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const resultStr = reader.result as string;
      if (target === 'edit') {
        setSourceImage(resultStr);
        setSourceImageMime(file.type);
      } else {
        setVideoSourceImage(resultStr);
        setVideoSourceMime(file.type);
      }
      setErrorText(null);
    };
    reader.readAsDataURL(file);
  };

  // Trigger Image Generation
  const handleGenerateImage = async () => {
    if (!prompt.trim()) {
      setErrorText("Input prompt context required to trigger generation logic.");
      return;
    }

    setIsGeneratingImage(true);
    setGeneratedImg(null);
    setErrorText(null);

    try {
      const endpoint = imageEngine === 'dalle' ? '/api/generate-dalle' : '/api/generate-image';
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          prompt, 
          aspectRatio,
          quality: imageEngine === 'dalle' ? dalleQuality : undefined,
          style: imageEngine === 'dalle' ? dalleStyle : undefined
        })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "An error occurred during pixel synthesis.");
      }

      setGeneratedImg(data.imageUrl);
      const displayPrompt = imageEngine === 'dalle' ? `[DALL-E 3] ${prompt}` : prompt;
      const modelVer = imageEngine === 'dalle'
        ? (data.modelVersion || `dall-e-3 (Quality: ${dalleQuality}, Style: ${dalleStyle})`)
        : 'krishna-neural-studio';
      saveToGallery('image', data.imageUrl, displayPrompt, aspectRatio, imageEngine, modelVer);
    } catch (err: any) {
      console.error(err);
      setErrorText(err.message || 'Error occurred during image generation.');
    } finally {
      setIsGeneratingImage(false);
    }
  };

  // Trigger Image Editing
  const handleEditImage = async () => {
    if (!editPrompt.trim()) {
      setErrorText("Instruction prompt required to execute dynamic image edits.");
      return;
    }
    if (!sourceImage) {
      setErrorText("Base source image frame must be uploaded before editing.");
      return;
    }

    setIsEditingImage(true);
    setEditedImg(null);
    setErrorText(null);

    try {
      const response = await fetch('/api/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: editPrompt,
          sourceImage: sourceImage,
          mimeType: sourceImageMime
        })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Image Editor synthesis sequence failed.");
      }

      setEditedImg(data.imageUrl);
      saveToGallery('image', data.imageUrl, `[Edit] ${editPrompt}`, '1:1', 'edit');
    } catch (err: any) {
      console.error(err);
      setErrorText(err.message || 'Failed to apply image correction/editing.');
    } finally {
      setIsEditingImage(false);
    }
  };

  // Trigger Video Generation & Polling
  const handleGenerateVideo = async () => {
    if (!videoPrompt.trim()) {
      setErrorText("Vocalize or type a system prompt to describe the target video dynamic.");
      return;
    }

    setIsGeneratingVideo(true);
    setGeneratedVideoUrl(null);
    setVideoOperation(null);
    setErrorText(null);
    
    const messages = [
      "Initializing AI neural video context...",
      "Synthesizing baseline temporal layers...",
      "Calibrating optical frame projection...",
      "Generating high-fidelity pixel clusters...",
      "Pacing video continuity nodes (may take up to 2 minutes)...",
      "Compiling final frame buffer files..."
    ];
    setVideoStatusText(messages[0]);

    // Simple ticker for loading messages
    let msgIndex = 0;
    const interval = setInterval(() => {
      msgIndex = (msgIndex + 1) % messages.length;
      setVideoStatusText(messages[msgIndex]);
    }, 12000);

    try {
      // 1. Dispatch start
      const response = await fetch('/api/generate-video', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: videoPrompt,
          aspectRatio,
          resolution,
          sourceImage: videoSourceImage,
          mimeType: videoSourceMime
        })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Unable to spawn video operation thread.");
      }

      const operationName = data.operationName;
      setVideoOperation(operationName);

      // 2. Begin Polling Loop
      let done = false;
      let checkCount = 0;
      const checkLimit = 50; // Max 5 minutes
      
      while (!done && checkCount < checkLimit) {
        // Wait 8 seconds between polls to respect rate limiting
        await new Promise(resolve => setTimeout(resolve, 8000));
        checkCount++;
        
        setVideoStatusText(`Tracking neural threads... Frame Check #${checkCount} (Processing)`);

        const statusRes = await fetch('/api/video-status', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ operationName })
        });
        
        const statusData = await statusRes.json();
        if (statusRes.ok && statusData.done) {
          done = true;
          break;
        }

        if (!statusRes.ok) {
          console.warn("Polling request failed. Retrying in next interval...", statusData.error);
        }
      }

      if (!done) {
        throw new Error("Video thread timed out on the neural cluster. Try polling again or simplify the prompt.");
      }

      // 3. Status completed! Fetching/downloading streamed mp4 video
      setVideoStatusText("Downloading output stream from neural buffer...");
      
      const downloadRes = await fetch('/api/video-download', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ operationName })
      });

      if (!downloadRes.ok) {
        throw new Error("Securing video binary download stream failed.");
      }

      const blob = await downloadRes.blob();
      const videoBlobUrl = URL.createObjectURL(blob);
      setGeneratedVideoUrl(videoBlobUrl);
      
      saveToGallery('video', videoBlobUrl, videoPrompt, aspectRatio, 'veo');
    } catch (err: any) {
      console.error(err);
      setErrorText(err.message || 'Fatal error in active Video Generation pipeline.');
    } finally {
      clearInterval(interval);
      setIsGeneratingVideo(false);
    }
  };

  // Helper to trigger direct downloads
  const triggerDownload = (url: string, filename: string) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex flex-col gap-6 w-full max-w-7xl mx-auto pb-12 z-10 relative">
      
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-[#00E5FF] font-mono mb-1.5 uppercase tracking-widest">
            <Sparkles className="w-4.5 h-4.5 animate-pulse text-[#00E5FF]" />
            <span>KRISHNA_OS Neural Multimedia Cluster</span>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white">
              Neural Canvas
            </h1>
            
            {/* Dedicated Visual Status Indicator for Prompt Queue */}
            {activeQueueCount > 0 ? (
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[10px] md:text-[11px] font-mono text-emerald-400 animate-fade-in shadow-[0_0_15px_rgba(16,185,129,0.1)]">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400"></span>
                </span>
                <span className="font-semibold">{pendingQueueCount} PENDING</span>
                <span className="text-gray-600">•</span>
                <div className="flex items-center gap-1 text-gray-300">
                  <Clock className="w-3.5 h-3.5 text-emerald-400" />
                  <span>EST: {formatEstimatedTime(estimatedQueueTimeSeconds)}</span>
                </div>
              </div>
            ) : (
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/[0.02] border border-white/5 text-[10px] font-mono text-gray-500 select-none">
                <div className="w-1.5 h-1.5 rounded-full bg-gray-600" />
                <span>QUEUE IDLE</span>
              </div>
            )}
          </div>
          <p className="text-gray-400 text-xs md:text-sm max-w-2xl mt-1">
            Harness generative vision intelligence. Produce stunning 2K images, manipulate frame assets with contextual editing instructs, and create immersive motion streams.
          </p>
        </div>

        {/* Global Tab Controllers */}
        <div className="flex bg-black/40 border border-white/5 rounded-xl p-1 gap-1 self-start md:self-auto shrink-0 select-none">
          <button
            onClick={() => { setActiveTab('generate'); setErrorText(null); }}
            className={cn(
              "flex items-center gap-2 px-4 py-2 text-xs font-mono font-bold tracking-wide rounded-lg transition-all duration-300 cursor-pointer",
              activeTab === 'generate'
                ? "bg-[#00E5FF]/10 text-[#00E5FF] border border-[#00E5FF]/20"
                : "text-gray-400 hover:text-white"
            )}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Image Generator</span>
          </button>
          <button
            onClick={() => { setActiveTab('edit'); setErrorText(null); }}
            className={cn(
              "flex items-center gap-2 px-4 py-2 text-xs font-mono font-bold tracking-wide rounded-lg transition-all duration-300 cursor-pointer",
              activeTab === 'edit'
                ? "bg-[#A78BFA]/10 text-[#A78BFA] border border-[#A78BFA]/20"
                : "text-gray-400 hover:text-white"
            )}
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>Image Editor</span>
          </button>
          <button
            onClick={() => { setActiveTab('video'); setErrorText(null); }}
            className={cn(
              "flex items-center gap-2 px-4 py-2 text-xs font-mono font-bold tracking-wide rounded-lg transition-all duration-300 cursor-pointer",
              activeTab === 'video'
                ? "bg-[#00FF9D]/10 text-[#00FF9D] border border-[#00FF9D]/20"
                : "text-gray-400 hover:text-white"
            )}
          >
            <VideoIcon className="w-3.5 h-3.5" />
            <span>Video Suite</span>
          </button>
        </div>
      </div>

      {/* Global Error Banner */}
      <AnimatePresence>
        {errorText && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-red-950/40 border-l-4 border-red-500 rounded-xl p-4 flex gap-3 text-red-200 text-xs font-mono items-start"
          >
            <AlertTriangle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">System Alert: </span>
              {errorText}
            </div>
            <button 
              onClick={() => setErrorText(null)}
              className="text-red-400 hover:text-red-200 ml-auto font-bold uppercase text-[10px] tracking-widest cursor-pointer"
            >
              Acknowledge
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Master Interactive Workspace Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Side: Controller Form Column */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          <div className="glass-panel border-white/5 p-5 flex flex-col gap-5 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-white/[0.02] to-transparent pointer-events-none rounded-bl-full" />
            
            <div className="flex items-center justify-between border-b border-white/5 pb-3">
              <div className="flex items-center gap-2">
                <Sliders className="w-4 h-4 text-gray-400" />
                <span className="text-xs uppercase font-mono font-bold text-gray-300">Synthesis Parameters</span>
              </div>
              <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-[10px] font-mono text-gray-400">
                <Terminal className="w-3 h-3 text-[#00E5FF]/80" />
                <span>ONLINE</span>
              </div>
            </div>

            {/* TAB CONTENT 1: Image Generator */}
            {activeTab === 'generate' && (
              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-gray-400 tracking-wide font-mono flex items-center justify-between">
                    <span>Neural Vision Engine</span>
                    <span className="text-[9px] text-gray-500 font-mono">
                      {imageEngine === 'imagen' ? 'Google DeepMind Engine' : 'OpenAI Dall-E Cluster'}
                    </span>
                  </label>
                  <div className="relative grid grid-cols-2 bg-black/45 p-1 border border-white/5 rounded-xl overflow-hidden select-none">
                    {/* Seamless animated slide helper */}
                    <div className="absolute inset-y-1 left-1 w-[calc(50%-4px)] rounded-lg pointer-events-none transition-transform duration-300 ease-out"
                         style={{
                           transform: imageEngine === 'dalle' ? 'translateX(100%)' : 'translateX(0)',
                           background: imageEngine === 'imagen' ? 'rgba(0, 229, 255, 0.08)' : 'rgba(16, 185, 129, 0.08)',
                           border: imageEngine === 'imagen' ? '1px solid rgba(0, 229, 255, 0.2)' : '1px solid rgba(16, 185, 129, 0.2)',
                           boxShadow: imageEngine === 'imagen' ? '0 0 10px rgba(0, 229, 255, 0.05)' : '0 0 10px rgba(16, 185, 129, 0.05)'
                         }}
                    />
                    
                    <button
                      type="button"
                      onClick={() => setImageEngine('imagen')}
                      className={cn(
                        "relative py-2 px-2 text-[10px] font-mono font-bold rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 focus:outline-none z-10",
                        imageEngine === 'imagen'
                          ? "text-[#00E5FF]"
                          : "text-gray-500 hover:text-gray-300"
                      )}
                    >
                      <Sparkles className={cn("w-3.5 h-3.5 transition-transform duration-300", imageEngine === 'imagen' ? "scale-110 text-[#00E5FF]" : "text-gray-500")} />
                      <span>KRISHNA Neural Studio</span>
                    </button>
                    
                    <button
                      type="button"
                      onClick={() => setImageEngine('dalle')}
                      className={cn(
                        "relative py-2 px-2 text-[10px] font-mono font-bold rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 focus:outline-none z-10",
                        imageEngine === 'dalle'
                          ? "text-[#10B981]"
                          : "text-gray-500 hover:text-gray-300"
                      )}
                    >
                      <ImageIcon className={cn("w-3.5 h-3.5 transition-transform duration-300", imageEngine === 'dalle' ? "scale-110 text-[#10B981]" : "text-gray-500")} />
                      <span>DALL-E 3 (OpenAI)</span>
                    </button>
                  </div>
                  
                  {/* Subtle info pill on engine configuration */}
                  <div className="text-[10px] text-gray-500 font-mono leading-relaxed px-1">
                    {imageEngine === 'imagen' ? (
                       <span className="text-[#00E5FF]/70">★ Optimized for hyper-crisp compositions, detailed textures, and instant load time.</span>
                    ) : (
                       <span className="text-[#10B981]/70">✦ Designed for master complex structural instructions and legible text inside image.</span>
                    )}
                  </div>
                </div>

                {imageEngine === 'dalle' && (
                  <div className="bg-black/25 border border-emerald-500/10 rounded-xl p-3 flex flex-col gap-3 mt-0.5 animate-fade-in">
                    <div className="flex items-center justify-between text-[10px] font-mono font-bold text-gray-400 border-b border-white/5 pb-1.5 uppercase tracking-wider">
                      <span>DALL-E Version Parameters</span>
                      <span className="text-emerald-400 animate-pulse">ACTIVE</span>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3">
                      {/* Quality Select */}
                      <div className="flex flex-col gap-1">
                        <span className="text-[9px] font-mono text-gray-500 uppercase font-semibold">Image Detail (Quality)</span>
                        <div className="flex gap-1 bg-black/40 p-0.5 rounded-lg border border-white/5">
                          {(['standard', 'hd'] as const).map((q) => (
                            <button
                              key={q}
                              type="button"
                              onClick={() => setDalleQuality(q)}
                              className={cn(
                                "flex-1 py-1 text-[9px] font-mono font-bold rounded-md uppercase transition-all cursor-pointer text-center",
                                dalleQuality === q
                                  ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/25"
                                  : "text-gray-500 hover:text-gray-300 border border-transparent"
                              )}
                            >
                              {q}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Style Select */}
                      <div className="flex flex-col gap-1">
                        <span className="text-[9px] font-mono text-gray-500 uppercase font-semibold">Render Style</span>
                        <div className="flex gap-1 bg-black/40 p-0.5 rounded-lg border border-white/5">
                          {(['vivid', 'natural'] as const).map((s) => (
                            <button
                              key={s}
                              type="button"
                              onClick={() => setDalleStyle(s)}
                              className={cn(
                                "flex-1 py-1 text-[9px] font-mono font-bold rounded-md uppercase transition-all cursor-pointer text-center",
                                dalleStyle === s
                                  ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/25"
                                  : "text-gray-500 hover:text-gray-300 border border-transparent"
                              )}
                            >
                              {s}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-gray-400 tracking-wide">Enter Prompt Instruction</label>
                  <textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="Describe the image you want e.g., A serene cyberpunk laboratory with neon water pipes, glowing terminals, and high-fidelity server racks, 3D photorealistic..."
                    className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-xs placeholder:text-gray-600 focus:outline-none focus:border-[#00E5FF]/40 text-white min-h-[100px] resize-none leading-relaxed transition-all"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-xs font-semibold text-gray-400 tracking-wide">Aspect Ratio Selection</label>
                  <div className="grid grid-cols-2 gap-2">
                    {ASPECT_RATIOS.map((item) => (
                      <button
                        key={item.value}
                        type="button"
                        onClick={() => setAspectRatio(item.value)}
                        className={cn(
                          "px-3 py-2 text-[11px] font-mono text-left rounded-lg border transition-all cursor-pointer flex justify-between items-center",
                          aspectRatio === item.value
                            ? "bg-[#00E5FF]/10 text-[#00E5FF] border-[#00E5FF]/40 shadow-[0_0_8px_rgba(0,229,255,0.05)]"
                            : "bg-white/[0.01] text-gray-400 border-white/5 hover:bg-white/5"
                        )}
                      >
                        <span>{item.label}</span>
                        <span className="opacity-40 text-[9px]">{item.value}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col gap-2 mt-2">
                  <button
                    type="button"
                    onClick={handleGenerateImage}
                    disabled={isGeneratingImage || isProcessingQueue || !prompt.trim()}
                    className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-cyan-500/80 to-blue-600/80 hover:from-cyan-400 hover:to-blue-500 text-white font-mono font-bold text-xs uppercase tracking-widest py-3.5 rounded-xl border border-cyan-400/20 shadow-md active:scale-98 transition-all disabled:opacity-45 disabled:pointer-events-none cursor-pointer"
                  >
                    {isGeneratingImage ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#00E5FF]" />
                        <span>Synthesizing...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Execute Immediate Synthesis</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={handleAddToQueue}
                    disabled={isGeneratingImage || !prompt.trim()}
                    className="w-full flex items-center justify-center gap-2 bg-black/40 border border-white/10 hover:border-[#00E5FF]/40 text-gray-300 hover:text-white font-mono font-bold text-xs uppercase tracking-wider py-3 rounded-xl hover:bg-[#00E5FF]/5 transition-all active:scale-98 disabled:opacity-40 disabled:pointer-events-none cursor-pointer"
                  >
                    <Plus className="w-4 h-4 text-[#00E5FF]" />
                    <span>Add to Sequenced Queue</span>
                  </button>
                </div>
              </div>
            )}

            {/* TAB CONTENT 2: Image Editor */}
            {activeTab === 'edit' && (
              <div className="flex flex-col gap-4">
                {/* Image Upload Block */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-gray-400 tracking-wide">Source Image Anchor</label>
                  
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={(e) => handleFileChange(e, 'edit')}
                    accept="image/*"
                    className="hidden"
                  />

                  {sourceImage ? (
                    <div className="relative group rounded-xl overflow-hidden border border-white/10 aspect-video bg-black/60 flex items-center justify-center">
                      <img src={sourceImage} alt="Anchor Upload" className="object-contain w-full h-full p-2" referrerPolicy="no-referrer" />
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-3 transition-opacity duration-300">
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="px-3 py-1.5 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg text-xs font-mono cursor-pointer transition-colors"
                        >
                          Replace Frame
                        </button>
                        <button
                          type="button"
                          onClick={() => { setSourceImage(null); setSourceImageMime(null); }}
                          className="px-3 py-1.5 bg-red-600/20 hover:bg-red-600/30 border border-red-500/20 text-red-300 rounded-lg text-xs font-mono cursor-pointer transition-colors"
                        >
                          Erase
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div 
                      onClick={() => fileInputRef.current?.click()}
                      className="border border-dashed border-white/15 hover:border-[#A78BFA]/30 rounded-xl aspect-video bg-white/[0.01] hover:bg-[#A78BFA]/5 cursor-pointer flex flex-col items-center justify-center gap-2 p-4 text-center transition-all"
                    >
                      <Upload className="w-8 h-8 text-gray-500 group-hover:text-[#A78BFA] transition-colors" />
                      <div>
                        <p className="text-xs text-gray-300 font-semibold font-mono">Upload Reference Frame</p>
                        <p className="text-[10px] text-gray-500 font-mono mt-1">Accepts system standard photo files</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Edit Request Prompt */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-gray-400 tracking-wide font-mono">Editing Instructions</label>
                  <textarea
                    value={editPrompt}
                    onChange={(e) => setEditPrompt(e.target.value)}
                    placeholder="Specify target edits e.g., Can you add a friendly digital hologram of a red helper robot next to the desk..."
                    className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-xs placeholder:text-gray-600 focus:outline-none focus:border-[#A78BFA]/40 text-white min-h-[90px] resize-none leading-relaxed transition-all"
                  />
                </div>

                <button
                  onClick={handleEditImage}
                  disabled={isEditingImage || !sourceImage || !editPrompt.trim()}
                  className="w-full mt-2 flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600/80 to-indigo-600/80 hover:from-purple-500 hover:to-indigo-500 text-white font-mono font-bold text-xs uppercase tracking-widest py-3.5 rounded-xl border border-purple-400/20 shadow-md active:scale-98 transition-all disabled:opacity-45 disabled:pointer-events-none cursor-pointer"
                >
                  {isEditingImage ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#A78BFA]" />
                      <span>Modifying Anchor Frame...</span>
                    </>
                  ) : (
                    <>
                      <Edit3 className="w-3.5 h-3.5 text-purple-300" />
                      <span>Execute Image Edit</span>
                    </>
                  )}
                </button>
              </div>
            )}

            {/* TAB CONTENT 3: Video Suite */}
            {activeTab === 'video' && (
              <div className="flex flex-col gap-4">
                {/* Optional Video Starting Image */}
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-gray-400 tracking-wide font-mono">Starting Frame (Optional)</label>
                    <span className="text-[9px] font-mono text-gray-500">Image to Motion</span>
                  </div>
                  
                  <input
                    type="file"
                    ref={videoImgInputRef}
                    onChange={(e) => handleFileChange(e, 'video')}
                    accept="image/*"
                    className="hidden"
                  />

                  {videoSourceImage ? (
                    <div className="relative group rounded-xl overflow-hidden border border-white/10 aspect-video bg-black/60 flex items-center justify-center">
                      <img src={videoSourceImage} alt="Video Starting Upload" className="object-contain w-full h-full p-2" referrerPolicy="no-referrer" />
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-3 transition-opacity duration-300">
                        <button
                          type="button"
                          onClick={() => videoImgInputRef.current?.click()}
                          className="px-3 py-1.5 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg text-xs font-mono cursor-pointer transition-colors"
                        >
                          Replace Frame
                        </button>
                        <button
                          type="button"
                          onClick={() => { setVideoSourceImage(null); setVideoSourceMime(null); }}
                          className="px-3 py-1.5 bg-red-600/20 hover:bg-red-600/30 border border-red-500/20 text-red-300 rounded-lg text-xs font-mono cursor-pointer transition-colors"
                        >
                          Erase
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div 
                      onClick={() => videoImgInputRef.current?.click()}
                      className="border border-dashed border-white/10 hover:border-[#00FF9D]/30 rounded-xl aspect-[21/9] bg-white/[0.005] hover:bg-[#00FF9D]/5 cursor-pointer flex flex-col items-center justify-center gap-1.5 p-3 text-center transition-all"
                    >
                      <Plus className="w-5 h-5 text-gray-600 hover:text-[#00FF9D] transition-colors" />
                      <p className="text-[11px] text-gray-400 font-mono">Add Source Frame context</p>
                    </div>
                  )}
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-gray-400 tracking-wide font-mono">Describe Dramatic Motion</label>
                  <textarea
                    value={videoPrompt}
                    onChange={(e) => setVideoPrompt(e.target.value)}
                    placeholder="E.g., An ultra-slow panning shot of neon-glowing server clusters with a shimmering stream of digital particles floating through the server corridor, holographic depth..."
                    className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-xs placeholder:text-gray-600 focus:outline-none focus:border-[#00FF9D]/40 text-white min-h-[90px] resize-none leading-relaxed transition-all"
                  />
                </div>

                {/* Additional Video Parameters */}
                <div className="grid grid-cols-2 gap-3 mt-1">
                  <div className="flex flex-col gap-1">
                    <span className="text-[11px] font-mono text-gray-400">Resolution</span>
                    <select
                      value={resolution}
                      onChange={(e) => setResolution(e.target.value)}
                      className="bg-black border border-white/10 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-[#00FF9D]/40 font-mono"
                    >
                      <option value="720p">HD Stream (720p)</option>
                      <option value="1080p">FHD Premium (1080p)</option>
                    </select>
                  </div>

                  <div className="flex flex-col gap-1">
                    <span className="text-[11px] font-mono text-gray-400">Layout Aspect</span>
                    <select
                      value={aspectRatio}
                      onChange={(e) => setAspectRatio(e.target.value)}
                      className="bg-black border border-white/10 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-[#00FF9D]/40 font-mono"
                    >
                      <option value="16:9">Widescreen (16:9)</option>
                      <option value="9:16">Vertical (9:16)</option>
                    </select>
                  </div>
                </div>

                <button
                  onClick={handleGenerateVideo}
                  disabled={isGeneratingVideo || !videoPrompt.trim()}
                  className="w-full mt-2 flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-600/80 to-teal-600/80 hover:from-emerald-500 hover:to-teal-500 text-white font-mono font-bold text-xs uppercase tracking-widest py-3.5 rounded-xl border border-emerald-400/20 shadow-md active:scale-98 transition-all disabled:opacity-45 disabled:pointer-events-none cursor-pointer"
                >
                  {isGeneratingVideo ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#00FF9D]" />
                      <span>Generating Thread...</span>
                    </>
                  ) : (
                    <>
                      <VideoIcon className="w-3.5 h-3.5 text-emerald-300" />
                      <span>Synthesize Video Motion</span>
                    </>
                  )}
                </button>
              </div>
            )}

            <div className="border-t border-white/5 pt-3.5 mt-2 flex gap-2 items-start text-[11px] text-gray-500">
              <Info className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" />
              <p className="leading-normal font-mono">
                Asset generation operations are parsed directly inside <span className="text-[#00E5FF]/80">KRISHNA NEURAL CLUSTER</span> under server-side encryption proxy protocols.
              </p>
            </div>
          </div>

          {/* Active Generation Queue Section */}
          {activeTab === 'generate' && generationQueue.length > 0 && (
            <div className="glass-panel border-white/5 p-4 flex flex-col gap-3 relative overflow-hidden animate-fade-in">
              <div className="flex items-center justify-between border-b border-white/5 pb-2">
                <div className="flex items-center gap-2">
                  <div className={cn("w-2 h-2 rounded-full", isProcessingQueue ? "bg-[#00E5FF] animate-pulse" : "bg-gray-500")} />
                  <span className="text-[10px] uppercase font-mono font-bold text-gray-300">
                    Synthesis Queue ({generationQueue.filter(q => q.status === 'pending').length} pending)
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  {generationQueue.some(q => q.status === 'completed') && (
                    <>
                      <button
                        type="button"
                        onClick={handleClearCompleted}
                        className="text-[9px] font-mono text-emerald-500/80 hover:text-emerald-400 font-semibold cursor-pointer transition-colors"
                      >
                        Clear Completed
                      </button>
                      <span className="text-white/10 text-[9px] select-none font-mono">|</span>
                    </>
                  )}
                  <button
                    type="button"
                    onClick={handleClearQueue}
                    className="text-[9px] font-mono text-gray-500 hover:text-red-400 font-semibold cursor-pointer transition-colors"
                  >
                    Clear Sequence
                  </button>
                </div>
              </div>

              <div className="flex flex-col gap-2 max-h-[220px] overflow-y-auto scrollbar-thin select-none">
                {generationQueue.map((item) => {
                  return (
                    <div 
                      key={item.id} 
                      className={cn(
                        "flex items-center gap-2.5 p-2 rounded-lg border bg-black/20 font-mono text-[10px] transition-all",
                        item.status === 'processing' ? 'border-[#00E5FF]/20 bg-[#00E5FF]/5' : 'border-white/5'
                      )}
                    >
                      {/* Status Thumbnail / Loader */}
                      <div className="relative w-8 h-8 rounded-md bg-black border border-white/5 flex items-center justify-center shrink-0 overflow-hidden">
                        {item.status === 'completed' && item.resultUrl ? (
                          <img src={item.resultUrl} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                        ) : item.status === 'processing' ? (
                          <RefreshCw className="w-4 h-4 text-amber-400 animate-spin" />
                        ) : item.status === 'failed' ? (
                          <AlertTriangle className="w-4 h-4 text-red-500" />
                        ) : (
                          <div className="w-1.5 h-1.5 rounded-full bg-gray-600 animate-pulse" />
                        )}
                      </div>

                      {/* Prompt & Engines brief */}
                      <div className="flex-1 min-w-0 flex flex-col gap-0.5">
                        <p className="text-gray-300 truncate font-semibold" title={item.prompt}>
                          {item.prompt}
                        </p>
                        <div className="flex items-center gap-1.5 text-[8px] text-gray-500">
                          <span className={cn(
                            "uppercase font-bold",
                            item.engine === 'dalle' ? 'text-emerald-400' : 'text-cyan-400'
                          )}>{item.engine === 'dalle' ? 'DALL-E 3' : 'Imagen 3'}</span>
                          <span className="opacity-40">•</span>
                          <span>Ratio: {item.aspectRatio}</span>
                          {item.engine === 'dalle' && (
                            <>
                              <span className="opacity-40">•</span>
                              <span className="text-emerald-500/80 uppercase">{item.quality}/{item.style}</span>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Action buttons (Delete / View Result) */}
                      <div className="flex items-center gap-1.5">
                        {item.status === 'completed' && item.resultUrl && (
                          <button
                            type="button"
                            onClick={() => setGeneratedImg(item.resultUrl!)}
                            className="p-1 px-2 rounded bg-cyan-500/15 text-cyan-300 hover:bg-cyan-500/25 transition-all text-[8px] uppercase tracking-wider font-bold cursor-pointer"
                            title="Set Active Preview"
                          >
                            View
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={(e) => handleRemoveFromQueue(item.id, e)}
                          disabled={item.status === 'processing'}
                          className="p-1 text-gray-500 hover:text-red-400 disabled:opacity-30 cursor-pointer"
                          title="Remove Task"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Right Side: Primary Preview Output Frame */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          <div className="glass-panel border-white/5 p-5 min-h-[480px] flex flex-col justify-between relative overflow-hidden">
            
            {/* Display header control status inside frame representation */}
            <div className="flex items-center justify-between border-b border-white/5 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-red-500/80 animate-ping" />
                <span className="text-xs uppercase font-mono font-bold tracking-wider text-gray-300">Live Synthesis Monitor</span>
              </div>
              <div className="text-[10px] text-gray-500 font-mono">
                {activeTab === 'generate' && 'MODE: TEXT_TO_IMAGE'}
                {activeTab === 'edit' && 'MODE: FRAME_MANIPULATION'}
                {activeTab === 'video' && 'MODE: TEMPORAL_VEO_MATRIX'}
              </div>
            </div>

            {/* PREVIEW FRAME TARGET BLOCKS */}
            <div className="flex-1 flex flex-col items-center justify-center p-3 relative min-h-[350px]">
              
              {/* Status 1: Currently General Image Generation Loader */}
              {isGeneratingImage && (
                <div className="flex flex-col items-center gap-3 font-mono p-6 text-center select-none z-10">
                  <div className="relative">
                    <RefreshCw className="w-12 h-12 text-[#00E5FF] animate-spin" />
                    <span className="absolute inset-0 bg-[#00E5FF] blur-xl opacity-20 rounded-full animate-pulse" />
                  </div>
                  <h4 className="text-[#00E5FF] text-xs font-bold tracking-widest uppercase mt-4 animate-pulse">Synchronizing Pixel Slices</h4>
                  <p className="text-gray-500 text-[10px] max-w-xs leading-relaxed">
                    Executing prompt mapping with active Imagen engine blocks. Please await validation response loop.
                  </p>
                </div>
              )}

              {/* Status 2: Currently Editing Image Loader */}
              {isEditingImage && (
                <div className="flex flex-col items-center gap-3 font-mono p-6 text-center select-none z-10">
                  <div className="relative">
                    <RefreshCw className="w-12 h-12 text-purple-400 animate-spin" />
                    <span className="absolute inset-0 bg-purple-500 blur-xl opacity-20 rounded-full animate-pulse" />
                  </div>
                  <h4 className="text-purple-400 text-xs font-bold tracking-widest uppercase mt-4 animate-pulse">Recalibrating Frame Matrix</h4>
                  <p className="text-gray-500 text-[10px] max-w-xs leading-relaxed">
                    Uploading frame pixels to layer mapping grids, generating visual edits...
                  </p>
                </div>
              )}

              {/* Status 3: Video Generation Operations Loader */}
              {isGeneratingVideo && (
                <div className="flex flex-col items-center gap-4 font-mono p-6 text-center select-none z-10 max-w-sm">
                  <div className="relative">
                    <VideoIcon className="w-12 h-12 text-[#00FF9D] animate-pulse" />
                    <span className="absolute inset-x-0 bottom-0 block w-full h-1 bg-[#00FF9D] animate-bounce" />
                    <span className="absolute inset-0 bg-[#00FF9D] blur-xl opacity-25 rounded-full" />
                  </div>
                  <h4 className="text-[#00FF9D] text-xs font-bold tracking-widest uppercase mt-2 animate-pulse">Veo Tensor Matrix Active</h4>
                  <div className="w-full bg-white/5 border border-white/10 rounded-lg p-2.5 font-mono text-[10px] text-gray-300 flex items-center gap-2">
                    <span className="shrink-0 w-1.5 h-1.5 rounded-full bg-[#00FF9D] animate-ping" />
                    <span className="text-left select-text">{videoStatusText}</span>
                  </div>
                  <p className="text-gray-500 text-[9px] leading-relaxed">
                    Veo preview queues are highly complex motion tasks and can run up to 1-2 minutes. Secure websocket buffers will pipe back once ready.
                  </p>
                </div>
              )}

              {/* Output Result Displays */}
              {!isGeneratingImage && !isGeneratingVideo && !isEditingImage && (
                <AnimatePresence mode="wait">
                  
                  {/* Option A: Render Generated Image */}
                  {activeTab === 'generate' && generatedImg && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.98 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0 }}
                      className="w-full h-full flex flex-col items-center justify-center p-2 relative group"
                    >
                      <div className={cn("max-h-[360px] overflow-hidden rounded-xl border border-white/10 shadow-[0_0_24px_rgba(0,0,0,0.6)] relative", 
                        ASPECT_RATIOS.find(r => r.value === aspectRatio)?.width || 'aspect-square'
                      )}>
                        <img 
                          src={generatedImg} 
                          alt="AI Generated Artwork" 
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-102"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                      <div className="flex gap-2.5 mt-4 select-none">
                        <button
                          onClick={() => triggerDownload(generatedImg, `krishna_scene_${Date.now()}.png`)}
                          className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 text-xs font-mono text-gray-200 transition-colors cursor-pointer"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>Download Frame</span>
                        </button>
                        <button
                          onClick={() => {
                            setSourceImage(generatedImg);
                            setSourceImageMime('image/png');
                            setActiveTab('edit');
                          }}
                          className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg border border-[#A78BFA]/20 bg-[#A78BFA]/10 hover:bg-[#A78BFA]/20 text-xs font-mono text-[#A78BFA] transition-colors cursor-pointer"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          <span>Push to Edit</span>
                        </button>
                      </div>
                    </motion.div>
                  )}

                  {/* Option B: Render Edited Image */}
                  {activeTab === 'edit' && editedImg && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.98 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0 }}
                      className="w-full h-full flex flex-col items-center justify-center p-2 relative group"
                    >
                      <div className="max-h-[360px] aspect-square overflow-hidden rounded-xl border border-white/10 shadow-[0_0_24px_rgba(0,0,0,0.6)]">
                        <img 
                          src={editedImg} 
                          alt="AI Edited Artwork" 
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-101"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                      <div className="flex gap-2.5 mt-4 select-none">
                        <button
                          onClick={() => triggerDownload(editedImg, `krishna_edit_${Date.now()}.png`)}
                          className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 text-xs font-mono text-gray-200 transition-colors cursor-pointer"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>Download File</span>
                        </button>
                        <button
                          onClick={() => setSourceImage(editedImg)}
                          className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg border border-purple-500/20 bg-purple-500/10 hover:bg-purple-500/20 text-xs font-mono text-purple-300 transition-colors cursor-pointer"
                        >
                          <RefreshCw className="w-3.5 h-3.5" />
                          <span>Edit Again</span>
                        </button>
                      </div>
                    </motion.div>
                  )}

                  {/* Option C: Render Generated Video */}
                  {activeTab === 'video' && generatedVideoUrl && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.98 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0 }}
                      className="w-full h-full flex flex-col items-center justify-center p-2 relative"
                    >
                      <div className={cn("max-h-[365px] rounded-xl overflow-hidden border border-white/10 shadow-[0_0_24px_rgba(0,0,0,0.7)] group bg-black relative", 
                        aspectRatio === '16:9' ? 'aspect-video' : 'aspect-[9/16]'
                      )}>
                        <video 
                          src={generatedVideoUrl} 
                          controls 
                          autoPlay 
                          loop 
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex gap-2.5 mt-4 select-none">
                        <button
                          onClick={() => triggerDownload(generatedVideoUrl, `krishna_motion_${Date.now()}.mp4`)}
                          className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 text-xs font-mono text-gray-200 transition-colors cursor-pointer"
                        >
                          <Download className="w-3.5 h-3.5 text-[#00FF9D]" />
                          <span>Download MP4</span>
                        </button>
                      </div>
                    </motion.div>
                  )}

                  {/* Fallback Blank States when nothing is generated yet */}
                  {((activeTab === 'generate' && !generatedImg) ||
                    (activeTab === 'edit' && !editedImg) ||
                    (activeTab === 'video' && !generatedVideoUrl)) && (
                    <div className="flex flex-col items-center gap-3 p-6 text-center select-none opacity-40 font-mono transition-all">
                      <FileImage className="w-10 h-10 text-gray-500" />
                      <div className="mt-2 text-[10px] text-gray-400">WAITING_FOR_EXECUTION_SEQUENCE</div>
                      <p className="text-[9px] text-gray-500 max-w-xs leading-relaxed">
                        Configure prompt commands and aspect parameters on the left to activate visual generation blocks.
                      </p>
                    </div>
                  )}

                </AnimatePresence>
              )}

            </div>

          </div>
        </div>

      </div>

      {/* Historical Gallery Session Section */}
      {gallery.length > 0 && (
        <div className="glass-panel border-white/5 p-5 mt-6 flex flex-col gap-4 relative overflow-hidden z-10">
          <div className="flex items-center justify-between border-b border-white/5 pb-3">
            <div className="flex items-center gap-2">
              <ImageIcon className="w-4 h-4 text-[#00E5FF]" />
              <h2 className="text-sm font-semibold tracking-wide text-white">Neural Cluster Archive</h2>
              <span className="text-[9px] font-mono bg-white/5 border border-white/15 px-2 py-0.5 rounded text-gray-400">
                {gallery.length} Records
              </span>
            </div>
            <button
              onClick={clearGallery}
              className="flex items-center gap-1 text-[10px] font-mono text-red-400 hover:text-red-300 transition-colors cursor-pointer"
              title="Clear all local gallery creations"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Nuke Session Cache</span>
            </button>
          </div>

          {/* Grid Layout of Cache */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {gallery.map((asset) => {
              const engineInfo = getAssetEngine(asset);
              const cleanPrompt = getCleanPrompt(asset);
              
              return (
                <div 
                  key={asset.id} 
                  className="group relative rounded-xl border border-white/5 bg-black/40 overflow-hidden flex flex-col gap-2 hover:border-[#00E5FF]/20 transition-all duration-300"
                >
                  {/* Visual Area */}
                  <div className="relative aspect-square w-full bg-black flex items-center justify-center overflow-hidden">
                    {asset.type === 'video' ? (
                      <video 
                        src={asset.url} 
                        className="w-full h-full object-cover" 
                        controls={false}
                        autoPlay={false}
                        loop
                        muted
                        onMouseEnter={(e) => e.currentTarget.play()}
                        onMouseLeave={(e) => {
                          e.currentTarget.pause();
                          e.currentTarget.currentTime = 0;
                        }}
                      />
                    ) : (
                      <img 
                        src={asset.url} 
                        alt="Gallery Frame" 
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-103" 
                        referrerPolicy="no-referrer"
                      />
                    )}

                    {/* Class Mode Indicator Badge */}
                    <div className="absolute top-2 left-2 px-1.5 py-0.5 rounded bg-black/80 backdrop-blur-md border border-white/10 text-[8px] font-mono flex items-center gap-1 text-white">
                      {asset.type === 'video' ? (
                        <>
                          <VideoIcon className="w-2 text-[#00FF9D]" />
                          <span>VIDEO</span>
                        </>
                      ) : (
                        <>
                          <ImageIcon className="w-2 text-[#00E5FF]" />
                          <span>IMAGE</span>
                        </>
                      )}
                    </div>

                    {/* Engine specific badge floating top-right (DALL-E 3 vs Imagen 3) */}
                    <div className={cn("absolute top-2 right-2 px-1 rounded text-[7px] font-mono border backdrop-blur-sm", engineInfo.color)}>
                      {engineInfo.label}
                    </div>

                    {/* Futuristic Hover Actions Overlay */}
                    <div className="absolute inset-0 bg-black/75 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center gap-2 px-3 transition-opacity duration-300 z-20">
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => triggerDownload(asset.url, `krishna_${asset.type}_${asset.id}.${asset.type === 'video' ? 'mp4' : 'png'}`)}
                          className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 border border-white/15 text-white cursor-pointer transition-colors"
                          title="Download Asset File"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </button>
                        
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCopyPromptText(asset, e);
                          }}
                          className="p-1.5 rounded-lg bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-500/20 text-cyan-300 cursor-pointer transition-colors"
                          title="Copy Direct Prompt Instruction"
                        >
                          {copiedId === asset.id ? (
                            <CheckCircle2 className="w-3.5 h-3.5 text-green-400" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>

                        <button
                          onClick={() => handleReuseAssetSettings(asset)}
                          className="p-1.5 rounded-lg bg-[#00FF9D]/10 hover:bg-[#00FF9D]/25 border border-[#00FF9D]/20 text-[#00FF9D] cursor-pointer transition-colors"
                          title="Re-run / Import Settings back into Generator"
                        >
                          <RefreshCw className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <button
                        onClick={() => setSelectedAsset(asset)}
                        className="py-1 px-3 text-[9px] font-mono font-bold rounded-md bg-[#00E5FF]/10 text-[#00E5FF] border border-[#00E5FF]/20 hover:bg-[#00E5FF]/20 transition-all cursor-pointer flex items-center gap-1 mt-1.5"
                      >
                        <Info className="w-3 h-3" />
                        <span>Inspect Metadata</span>
                      </button>
                    </div>
                  </div>

                  {/* Text info block click to show details */}
                  <div 
                    onClick={() => setSelectedAsset(asset)}
                    className="p-2 font-mono flex flex-col gap-1 cursor-pointer hover:bg-white/[0.03] transition-colors rounded-b-xl"
                    title="Click to view full prompt and metadata"
                  >
                    <p className="text-[10px] text-gray-300 font-medium truncate">
                      {cleanPrompt}
                    </p>
                    <div className="flex items-center justify-between text-[8px] text-gray-500 pt-0.5">
                      <span>{asset.timestamp}</span>
                      <span className="text-[#00E5FF]/70">{asset.aspectRatio || '1:1'}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Success Notification Toaster Overlay */}
      <AnimatePresence>
        {successToast && (
          <motion.div
            initial={{ opacity: 0, y: -20, x: 20 }}
            animate={{ opacity: 1, y: 0, x: 0 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            className="fixed top-6 right-6 z-50 bg-[#00E5FF]/15 backdrop-blur-md border border-[#00E5FF]/30 p-4 rounded-xl shadow-[0_0_24px_rgba(0,229,255,0.15)] flex items-center gap-3 font-mono text-[11px] text-[#00E5FF] max-w-sm"
          >
            <CheckCircle2 className="w-4 h-4 shrink-0 text-[#00E5FF]" />
            <div>
              <span className="font-bold uppercase tracking-wider block mb-0.5 text-white">Parameter Set Synced</span>
              <span className="text-gray-300">{successToast}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Detailed Prompt Revisit Inspector Modal */}
      <AnimatePresence>
        {selectedAsset && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
            <div className="absolute inset-0" onClick={() => setSelectedAsset(null)} />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative max-w-2xl w-full bg-[#0D111A]/95 border border-white/10 rounded-2xl overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.8)] z-10 flex flex-col md:flex-row"
            >
              {/* Left Column / Top Section: Visual Preview */}
              <div className="md:w-1/2 bg-black/60 flex items-center justify-center relative min-h-[250px] max-h-[350px] md:max-h-none border-b md:border-b-0 md:border-r border-white/5 p-4">
                {selectedAsset.type === 'video' ? (
                  <video 
                    src={selectedAsset.url} 
                    className="w-full h-full object-contain rounded-lg" 
                    controls 
                    autoPlay 
                    loop 
                  />
                ) : (
                  <img 
                    src={selectedAsset.url} 
                    alt="Selected Archived Frame" 
                    className="w-full h-full object-contain rounded-lg"
                    referrerPolicy="no-referrer"
                  />
                )}
                
                {/* Float Status Engine Badge */}
                <div className={cn("absolute top-4 left-4 px-2 py-0.5 rounded-md text-[9px] font-mono font-bold border", getAssetEngine(selectedAsset).color)}>
                  {getAssetEngine(selectedAsset).label}
                </div>
              </div>

              {/* Right Column / Bottom Section: Metadata Information Inspector */}
              <div className="p-5 md:w-1/2 flex flex-col gap-4 font-mono select-none">
                <div className="flex items-center justify-between border-b border-white/5 pb-2">
                  <span className="text-[10px] text-[#00E5FF] font-bold tracking-wider uppercase flex items-center gap-1.5">
                    <Terminal className="w-3.5 h-3.5" />
                    <span>SYNAPSE_METADATA_PROFILE</span>
                  </span>
                  <button 
                    onClick={() => setSelectedAsset(null)}
                    className="text-gray-500 hover:text-white text-xs cursor-pointer focus:outline-none transition-colors"
                  >
                    ✕ Close
                  </button>
                </div>

                {/* Main Instruction Prompt Content Box */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[9px] text-gray-500 font-bold uppercase tracking-widest flex items-center justify-between">
                    <span>Prompt Command</span>
                    <button
                      onClick={(e) => handleCopyPromptText(selectedAsset, e)}
                      className="text-[#00E5FF] hover:underline text-[9px] py-0.5 px-1.5 flex items-center gap-1 cursor-pointer"
                    >
                      {copiedId === selectedAsset.id ? (
                        <>
                          <CheckCircle2 className="w-3 h-3 text-green-400" />
                          <span>Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>Copy Instruction</span>
                        </>
                      )}
                    </button>
                  </label>
                  <div className="bg-black/55 p-3 border border-white/5 rounded-xl max-h-[140px] overflow-y-auto select-text scrollbar-thin">
                    <p className="text-[11px] leading-relaxed text-gray-300">
                      {getCleanPrompt(selectedAsset)}
                    </p>
                  </div>
                </div>

                {/* Structured Metadata Table (Pasted directly from storage state fields) */}
                <div className="flex flex-col gap-1">
                  <span className="text-[9px] text-gray-500 font-bold uppercase tracking-widest">Metadata Profile</span>
                  <div className="grid grid-cols-2 gap-2 bg-black/35 p-3 border border-white/5 rounded-xl text-[10px]">
                    <div className="flex flex-col flex-1">
                       <span className="text-gray-600 block text-[8px] uppercase">Engine Platform</span>
                       <span className="text-white font-semibold">{getAssetEngine(selectedAsset).label}</span>
                    </div>
                    <div className="flex flex-col flex-1">
                       <span className="text-gray-600 block text-[8px] uppercase">Aspect Ratio</span>
                       <span className="text-[#00E5FF]/80 font-semibold">{selectedAsset.aspectRatio || '1:1'}</span>
                    </div>
                    <div className="flex flex-col flex-1">
                       <span className="text-gray-600 block text-[8px] uppercase">Content Type</span>
                       <span className="text-white font-semibold uppercase">{selectedAsset.type}</span>
                    </div>
                    <div className="flex flex-col flex-1">
                       <span className="text-gray-600 block text-[8px] uppercase">Genesis Stamp</span>
                       <span className="text-white font-semibold truncate" title={selectedAsset.timestamp}>
                        {selectedAsset.timestamp}
                       </span>
                    </div>
                    {selectedAsset.modelVersion && (
                      <div className="flex flex-col col-span-2 border-t border-white/5 pt-2 mt-1">
                        <span className="text-gray-600 block text-[8px] uppercase">Model Version</span>
                        <span className="text-emerald-400 font-mono font-semibold text-[9px] truncate">{selectedAsset.modelVersion}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Modal setup parameters action buttons */}
                <div className="grid grid-cols-2 gap-2 mt-auto pt-2 select-none">
                  <button
                    onClick={() => {
                      handleReuseAssetSettings(selectedAsset);
                      setSelectedAsset(null);
                    }}
                    className="w-full py-2.5 px-3 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/15 border border-cyan-500/25 text-cyan-400 text-[10px] font-bold text-center transition-all cursor-pointer flex items-center justify-center gap-1.5 hover:shadow-[0_0_12px_rgba(0,229,255,0.06)]"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Reuse Prompt</span>
                  </button>
                  
                  <button
                    onClick={() => {
                      triggerDownload(selectedAsset.url, `krishna_${selectedAsset.type}_${selectedAsset.id}.${selectedAsset.type === 'video' ? 'mp4' : 'png'}`);
                    }}
                    className="w-full py-2.5 px-3 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-white text-[10px] font-bold text-center transition-all cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download file</span>
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
