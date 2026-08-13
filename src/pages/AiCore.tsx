import { useState, useRef, useEffect, FormEvent } from 'react';
import { Send, Bot, User, Sparkles, Brain, Activity, Mic, Zap } from 'lucide-react';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';

interface Message {
  role: 'user' | 'model';
  text: string;
  emotion?: string;
}

export default function AiCore() {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'model', text: 'Greetings. I am KRISHNA, your Neural Assistant and Operating System powered by Groq. How may I assist you today?', emotion: 'Professional' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [micSupported, setMicSupported] = useState(true);
  const [enableStreaming, setEnableStreaming] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Initialize SpeechRecognition on mount
  useEffect(() => {
    // @ts-ignore
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) {
          setInput(prev => {
            const trimmed = prev.trim();
            return trimmed ? `${trimmed} ${transcript}` : transcript;
          });
        }
      };

      recognition.onerror = (event: any) => {
        console.error("Speech Recognition Error:", event.error);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    } else {
      setMicSupported(false);
    }

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch (e) {
          // ignore
        }
      }
    };
  }, []);

  const toggleListening = () => {
    if (!micSupported || !recognitionRef.current) {
      alert("Acoustic Recognition (Web Speech API) is not fully supported or restricted by safety headers in this browser container context.");
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
    } else {
      try {
        recognitionRef.current.start();
      } catch (err) {
        console.error("Speech Recognition Start Failed:", err);
      }
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    if (isListening && recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (err) {
        // ignore
      }
    }

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMessage }]);
    setIsLoading(true);

    try {
      const history = messages.map(m => ({
        role: m.role === 'model' ? 'assistant' : 'user',
        content: m.text
      }));
      
      history.push({ role: 'user', content: userMessage });

      const systemCtxt = `You are KRISHNA OS, a futuristic intelligent Operating System and Neural Core designed and developed by B. Hevanth Kumar.
If the user asks who created you, who is your owner, who developed/built/made you or who B. Hevanth Kumar is: B. Hevanth Kumar is your founder, futuristic operating system creator, and systems architect. Generate a natural, dynamic, professional, inspirational, and intelligent reply.
If the user asks what you are or your mission: you are a futuristic AI Operating System committed to ambient computing, autonomous workflow orchestration, real-world accessibility problem-solving, and personalized learning.`;

      if (enableStreaming) {
        // STREAMING HANDLING
        const res = await fetch('/api/chat/stream', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ messages: history, systemInstruction: systemCtxt })
        });

        if (!res.ok) {
          const errText = await res.text().catch(() => '');
          throw new Error(errText || `Server responded with status ${res.status}`);
        }

        if (!res.body) {
          throw new Error("No readable response stream available from server.");
        }

        // Push placeholder model message
        setMessages(prev => [...prev, { role: 'model', text: '', emotion: 'Analytical' }]);

        const reader = res.body.getReader();
        const decoder = new TextDecoder('utf-8');
        let accumulatedText = '';
        let sseBuffer = '';

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          sseBuffer += chunk;

          const lines = sseBuffer.split('\n');
          sseBuffer = lines.pop() || ''; // Keep incomplete trailing line in buffer

          for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed || trimmed.startsWith(':')) continue;

            if (trimmed.startsWith('data: ')) {
              const dataStr = trimmed.slice(6).trim();
              if (dataStr === '[DONE]') break;

              try {
                const parsed = JSON.parse(dataStr);
                const delta = parsed.choices?.[0]?.delta?.content || '';
                if (delta) {
                  accumulatedText += delta;
                  const currentText = accumulatedText;
                  setMessages(prev => {
                    const newArr = [...prev];
                    if (newArr.length > 0 && newArr[newArr.length - 1].role === 'model') {
                      newArr[newArr.length - 1] = {
                        ...newArr[newArr.length - 1],
                        text: currentText
                      };
                    }
                    return newArr;
                  });
                }
              } catch (e) {
                // Ignore incomplete SSE json chunk parse errors safely
              }
            }
          }
        }

        if (!accumulatedText.trim()) {
          setMessages(prev => {
            const newArr = [...prev];
            if (newArr.length > 0 && newArr[newArr.length - 1].role === 'model') {
              newArr[newArr.length - 1] = {
                role: 'model',
                text: "Krishna received your request but returned an empty response. Please try again.",
                emotion: 'Alert'
              };
            }
            return newArr;
          });
        }
      } else {
        // NON-STREAMING HANDLING (SAFE RESPONSES)
        const res = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ messages: history, systemInstruction: systemCtxt })
        });

        const rawText = await res.text();
        let data: any = {};
        if (rawText && rawText.trim()) {
          try {
            data = JSON.parse(rawText);
          } catch (e) {
            console.error("JSON parse error on response:", rawText);
            throw new Error("Invalid response format received from server.");
          }
        }

        if (!res.ok) {
          throw new Error(data.error || `Server responded with HTTP status ${res.status}`);
        }

        const replyText = data.text || "Krishna received your request. Please try again.";
        const emotion = data.emotion || 'Professional';

        setMessages(prev => [...prev, { role: 'model', text: replyText, emotion }]);
      }

    } catch (error: any) {
      console.error("Krishna Chat Error:", error);
      const isParsingErr = error.message?.includes('Unexpected end of JSON') || error.message?.includes('Failed to execute');
      const safeMessage = isParsingErr
        ? "Krishna couldn't complete that request. Please try again."
        : (error.message || "Krishna couldn't complete that request. Please try again.");

      setMessages(prev => [...prev, { role: 'model', text: safeMessage, emotion: 'Alert' }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full max-h-screen max-w-5xl mx-auto glass-panel p-0 overflow-hidden relative">
      {/* Header */}
      <div className="p-4 border-b border-white/10 flex items-center justify-between bg-white/[0.02]">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-[#00E5FF]/10 neural-glow">
            <Brain size={20} className="text-[#00E5FF]" />
          </div>
          <div>
            <h2 className="font-semibold text-white/90">KRISHNA Core</h2>
            <p className="text-xs text-gray-400 font-mono flex items-center gap-2">
               <span className="w-1.5 h-1.5 rounded-full bg-[#00E5FF] animate-pulse"></span>
               Groq Neural Engine Active
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={() => setEnableStreaming(prev => !prev)}
            className={cn(
              "px-2.5 py-1 rounded-full text-xs font-mono border transition-colors flex items-center gap-1.5 cursor-pointer",
              enableStreaming
                ? "bg-[#00E5FF]/20 border-[#00E5FF]/50 text-[#00E5FF]"
                : "bg-white/5 border-white/10 text-gray-400 hover:text-white"
            )}
            title={enableStreaming ? "Streaming mode enabled (Real-time SSE)" : "Click to enable real-time response streaming"}
          >
            <Zap size={12} className={enableStreaming ? "text-[#00E5FF] animate-pulse" : ""} />
            {enableStreaming ? "STREAMING ON" : "STREAMING OFF"}
          </button>

          <div className="px-3 py-1 bg-[#00E5FF]/10 border border-[#00E5FF]/30 rounded-full text-xs font-mono text-[#00E5FF] flex items-center gap-2 font-semibold">
            <Sparkles size={12} className="text-[#00E5FF]" />
            KRISHNA AI • GROQ
          </div>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
        <AnimatePresence initial={false}>
          {messages.map((message, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={cn(
                "flex gap-4 max-w-[85%]",
                message.role === 'user' ? "ml-auto flex-row-reverse" : ""
              )}
            >
              <div className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-1",
                message.role === 'user' 
                  ? "bg-white/10 border border-white/20" 
                  : "bg-[#00E5FF]/10 border border-[#00E5FF]/30 neural-glow"
              )}>
                {message.role === 'user' ? <User size={14} className="text-gray-300" /> : <Bot size={14} className="text-[#00E5FF]" />}
              </div>
              
              <div className={cn(
                "px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap font-sans",
                message.role === 'user'
                  ? "bg-white/10 text-white rounded-tr-sm border border-white/5"
                  : "glass-panel rounded-tl-sm border-[#00E5FF]/10 text-gray-200"
              )}>
                {message.text || (isLoading && i === messages.length - 1 ? '...' : '')}
                {message.role === 'model' && message.emotion && (
                  <div className="mt-3 flex">
                    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded border border-[#00E5FF]/30 bg-[#00E5FF]/10 text-[10px] font-mono font-bold text-[#00E5FF] tracking-wider uppercase shadow-[0_0_10px_rgba(0,229,255,0.2)]">
                      <Activity className="w-3 h-3" />
                      {message.emotion}
                    </span>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        
        {isLoading && messages[messages.length - 1]?.role !== 'model' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-4">
             <div className="w-8 h-8 rounded-full bg-[#00E5FF]/10 border border-[#00E5FF]/30 flex items-center justify-center flex-shrink-0 mt-1">
                <Bot size={14} className="text-[#00E5FF]" />
              </div>
              <div className="glass-panel px-4 py-4 rounded-2xl rounded-tl-sm flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 bg-[#00E5FF] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-1.5 h-1.5 bg-[#00E5FF] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-1.5 h-1.5 bg-[#00E5FF] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
          </motion.div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 border-t border-white/10 bg-white/[0.02]">
        <form onSubmit={handleSubmit} className="relative flex items-end overflow-hidden glass-panel rounded-xl pl-2 pr-1 py-1">
          <AnimatePresence>
            {isListening && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                className="absolute inset-y-0 left-0 right-12 bg-[#080D1C]/95 backdrop-blur-sm flex items-center justify-between px-4 z-10"
              >
                <div className="flex items-center gap-3">
                  <span className="flex h-2 w-2 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00E5FF] opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-[#00E5FF]"></span>
                  </span>
                  <span className="text-xs font-mono text-[#00E5FF] font-medium tracking-wide">
                    KRISHNA ACOUSTIC GRID ACTIVE: Speak your command...
                  </span>
                </div>
                <div className="flex items-end gap-1 h-5 pr-2">
                  <div className="w-1 bg-[#00E5FF] rounded-full animate-bounce h-2" style={{ animationDelay: '0ms', animationDuration: '0.6s' }} />
                  <div className="w-1 bg-[#00E5FF] rounded-full animate-bounce h-4" style={{ animationDelay: '150ms', animationDuration: '0.5s' }} />
                  <div className="w-1 bg-[#00E5FF] rounded-full animate-bounce h-5" style={{ animationDelay: '300ms', animationDuration: '0.7s' }} />
                  <div className="w-1 bg-[#00E5FF] rounded-full animate-bounce h-3" style={{ animationDelay: '450ms', animationDuration: '0.4s' }} />
                  <div className="w-1 bg-[#00E5FF] rounded-full animate-bounce h-1" style={{ animationDelay: '100ms', animationDuration: '0.8s' }} />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <button
            type="button"
            onClick={toggleListening}
            disabled={!micSupported}
            className={cn(
              "w-10 h-10 flex-shrink-0 flex items-center justify-center rounded-lg transition-all m-1 cursor-pointer focus:outline-none z-20",
              isListening
                ? "bg-[#00E5FF]/20 text-[#00E5FF] border border-[#00E5FF]/45 shadow-[0_0_12px_rgba(0,229,255,0.25)] animate-pulse"
                : "bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white border border-white/5"
            )}
            title={isListening ? "Disconnect system audio feed" : "Transmit with speech-to-text input"}
          >
            {isListening ? <Mic className="w-4 h-4 text-[#00E5FF] animate-pulse" /> : <Mic className="w-4 h-4" />}
          </button>

          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isListening}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSubmit(e);
              }
            }}
            placeholder={isListening ? "Speak continuously..." : "Initialize command sequence..."}
            className="w-full max-h-32 min-h-[44px] bg-transparent border-none text-white text-sm placeholder:text-white/30 resize-none py-3 px-3 focus:outline-none focus:ring-0"
            rows={1}
          />
          <button 
            type="submit" 
            disabled={!input.trim() || isLoading}
            className="w-10 h-10 flex-shrink-0 flex items-center justify-center bg-[#00E5FF]/20 hover:bg-[#00E5FF]/30 text-[#00E5FF] rounded-lg transition-colors m-1 disabled:opacity-50 disabled:cursor-not-allowed z-20"
          >
            <Send size={16} />
          </button>
        </form>
        <p className="text-center text-[10px] text-gray-500 font-mono mt-2">
          KRISHNA Neural Core processes inputs via end-to-end encrypted streams. {micSupported ? "Click the micro-wave icon to capture voice commands." : "Web Speech is restricted in this container client."}
        </p>
      </div>
    </div>
  );
}
