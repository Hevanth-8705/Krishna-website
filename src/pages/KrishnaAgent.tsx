import { useState, useEffect, useRef, useCallback } from 'react';
import { Zap, Send, Loader2, CheckCircle2, Circle, XCircle, Clock, AlertTriangle, ChevronRight, History, Trash2, Play, Shield, X, RotateCcw, Bot, Sparkles, Mic } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import { useAgentStore, type AgentTask, type TaskStatus } from '../store/agent';
import { auth } from '../lib/firebase';

const STATUS_CONFIG: Record<TaskStatus, { label: string; color: string; icon: any; pulse?: boolean }> = {
  PLANNING: { label: 'Planning', color: '#A78BFA', icon: Clock, pulse: true },
  WAITING_FOR_USER: { label: 'Awaiting Confirmation', color: '#FBBF24', icon: Shield, pulse: true },
  READY: { label: 'Ready', color: '#00E5FF', icon: Play },
  EXECUTING: { label: 'Executing', color: '#00E5FF', icon: Zap, pulse: true },
  VERIFYING: { label: 'Verifying', color: '#A78BFA', icon: CheckCircle2, pulse: true },
  COMPLETED: { label: 'Completed', color: '#00FF9D', icon: CheckCircle2 },
  FAILED: { label: 'Failed', color: '#FF3B3B', icon: XCircle },
  CANCELLED: { label: 'Cancelled', color: '#6B7280', icon: XCircle },
};

const LOADING_STAGES = ['ANALYZING REQUEST', 'PLANNING', 'PROCESSING', 'COMPLETING'];

async function getAuthHeaders(): Promise<Record<string, string>> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  try {
    if (auth.currentUser) {
      const token = await auth.currentUser.getIdToken();
      headers['Authorization'] = `Bearer ${token}`;
    }
  } catch (err) {
    console.warn('[Krishna Agent] Auth token retrieval warning:', err);
  }
  return headers;
}

async function parseAgentResponse<T = any>(res: Response): Promise<{ ok: boolean; status: number; data?: T; error?: string }> {
  const status = res.status;
  const contentType = res.headers.get('content-type') || '';
  
  let rawText = '';
  try {
    rawText = await res.text();
  } catch (err: any) {
    return { ok: false, status, error: 'Failed to read server response body.' };
  }

  const trimmed = rawText.trim();
  if (!trimmed) {
    if (status === 200) {
      return { ok: false, status, error: 'Krishna Agent returned no result.' };
    }
    return { ok: false, status, error: `Krishna Agent server returned an empty response (HTTP ${status}).` };
  }

  if (contentType.includes('text/html') || trimmed.startsWith('<!DOCTYPE') || trimmed.startsWith('<html')) {
    return { ok: false, status, error: `Krishna Agent received an invalid server response (HTTP ${status}).` };
  }

  let json: any;
  try {
    json = JSON.parse(trimmed);
  } catch (err) {
    return { ok: false, status, error: 'Krishna Agent received malformed JSON from the server.' };
  }

  if (!res.ok) {
    let errorMsg = json.error?.message || json.error || json.message;
    if (!errorMsg) {
      if (status === 401) errorMsg = 'Your session has expired. Please sign in again.';
      else if (status === 403) errorMsg = 'Permission denied.';
      else if (status === 404) errorMsg = 'Krishna Agent endpoint not found.';
      else if (status === 429) errorMsg = 'Rate limit exceeded. Please try again shortly.';
      else if (status === 502) errorMsg = 'Krishna AI service is temporarily unavailable.';
      else errorMsg = `Server error (HTTP ${status}).`;
    }
    return { ok: false, status, error: errorMsg };
  }

  const data = json.data !== undefined ? json.data : (json.task !== undefined ? json.task : json);
  return { ok: true, status, data };
}

export default function KrishnaAgent() {
  const [goalInput, setGoalInput] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [pollingId, setPollingId] = useState<string | null>(null);
  const [loadingStageIdx, setLoadingStageIdx] = useState(0);

  const inputRef = useRef<HTMLTextAreaElement>(null);
  const recognitionRef = useRef<any>(null);
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const loadingTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const {
    currentTask,
    taskHistory,
    isCreatingTask,
    agentError,
    setCurrentTask,
    updateCurrentTask,
    addToHistory,
    setIsCreatingTask,
    setAgentError,
    clearAgent,
  } = useAgentStore();

  // Loading stage cycling animation
  useEffect(() => {
    if (isCreatingTask) {
      setLoadingStageIdx(0);
      loadingTimerRef.current = setInterval(() => {
        setLoadingStageIdx(prev => (prev < LOADING_STAGES.length - 1 ? prev + 1 : prev));
      }, 1200);
    } else {
      if (loadingTimerRef.current) clearInterval(loadingTimerRef.current);
    }
    return () => {
      if (loadingTimerRef.current) clearInterval(loadingTimerRef.current);
    };
  }, [isCreatingTask]);

  // Poll for task status updates
  useEffect(() => {
    if (pollingId && currentTask && !['COMPLETED', 'FAILED', 'CANCELLED'].includes(currentTask.status)) {
      pollingRef.current = setInterval(async () => {
        try {
          const headers = await getAuthHeaders();
          const res = await fetch(`/api/agent/tasks/${pollingId}`, { headers });
          const parsed = await parseAgentResponse(res);
          
          if (parsed.ok && parsed.data) {
            const updatedTask = parsed.data;
            setCurrentTask(updatedTask);

            if (['COMPLETED', 'FAILED', 'CANCELLED'].includes(updatedTask.status)) {
              setPollingId(null);
              addToHistory(updatedTask);
            }
          }
        } catch {
          // Silently handle transient polling errors
        }
      }, 1500);

      return () => {
        if (pollingRef.current) clearInterval(pollingRef.current);
      };
    }
  }, [pollingId, currentTask?.status]);

  // Voice input setup
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onresult = (e: any) => {
        const text = e.results[0][0].transcript;
        setGoalInput(prev => prev ? `${prev} ${text}` : text);
      };
      recognition.onend = () => setIsListening(false);
      recognition.onerror = () => setIsListening(false);

      recognitionRef.current = recognition;
    }

    return () => {
      if (recognitionRef.current) {
        try { recognitionRef.current.abort(); } catch {}
      }
    };
  }, []);

  const toggleVoice = () => {
    if (!recognitionRef.current) return;
    if (isListening) {
      recognitionRef.current.stop();
    } else {
      try { recognitionRef.current.start(); setIsListening(true); } catch {}
    }
  };

  const handleSubmitGoal = async () => {
    if (!goalInput.trim() || isCreatingTask) return;

    setIsCreatingTask(true);
    setAgentError(null);
    clearAgent();

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 45000);

    try {
      const headers = await getAuthHeaders();
      const res = await fetch('/api/agent/tasks', {
        method: 'POST',
        headers,
        body: JSON.stringify({ goal: goalInput.trim() }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);
      const parsed = await parseAgentResponse(res);

      if (!parsed.ok) {
        throw new Error(parsed.error || 'Failed to create task.');
      }

      const taskData: AgentTask = parsed.data;
      setCurrentTask(taskData);
      setPollingId(taskData.taskId);
      addToHistory(taskData);
      setGoalInput('');
    } catch (err: any) {
      clearTimeout(timeoutId);
      if (err.name === 'AbortError') {
        setAgentError('Krishna Agent request timed out. Please try again.');
      } else {
        setAgentError(err.message || 'Failed to create agent task.');
      }
    } finally {
      setIsCreatingTask(false);
    }
  };

  const handleConfirm = async (confirmed: boolean) => {
    if (!currentTask) return;

    try {
      const headers = await getAuthHeaders();
      const res = await fetch(`/api/agent/tasks/${currentTask.taskId}/confirm`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ confirmed })
      });

      const parsed = await parseAgentResponse(res);
      if (parsed.ok && parsed.data) {
        const taskObj = parsed.data.task || parsed.data;
        setCurrentTask(taskObj);
        if (confirmed) setPollingId(currentTask.taskId);
        else addToHistory(taskObj);
      } else {
        setAgentError(parsed.error || 'Failed to process confirmation.');
      }
    } catch (err: any) {
      setAgentError('Failed to process confirmation.');
    }
  };

  const handleCancel = async () => {
    if (!currentTask) return;

    try {
      const headers = await getAuthHeaders();
      const res = await fetch(`/api/agent/tasks/${currentTask.taskId}/cancel`, {
        method: 'POST',
        headers
      });

      const parsed = await parseAgentResponse(res);
      if (parsed.ok && parsed.data) {
        const taskObj = parsed.data.task || parsed.data;
        setCurrentTask(taskObj);
        setPollingId(null);
        addToHistory(taskObj);
      } else {
        setAgentError(parsed.error || 'Failed to cancel task.');
      }
    } catch {
      setAgentError('Failed to cancel task.');
    }
  };

  const getStepIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle2 className="w-4 h-4 text-[#00FF9D]" />;
      case 'executing': return <Loader2 className="w-4 h-4 text-[#00E5FF] animate-spin" />;
      case 'failed': return <XCircle className="w-4 h-4 text-[#FF3B3B]" />;
      case 'skipped': return <Circle className="w-4 h-4 text-gray-600" />;
      case 'not_implemented': return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      default: return <Circle className="w-4 h-4 text-gray-600" />;
    }
  };

  const statusConfig = currentTask ? STATUS_CONFIG[currentTask.status] : null;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#00E5FF]/20 to-[#00FF9D]/20 border border-[#00E5FF]/30 flex items-center justify-center">
              <Zap className="w-7 h-7 text-[#00E5FF]" />
            </div>
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-[#00FF9D] rounded-full animate-pulse" />
          </div>
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-[#00E5FF] to-[#00FF9D] bg-clip-text text-transparent">
              KRISHNA AGENT
            </h1>
            <p className="text-sm text-gray-400 font-mono tracking-wide">CONTROLLED AI TASK ENGINE</p>
          </div>
        </div>

        <button
          onClick={() => setShowHistory(!showHistory)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-colors text-sm text-gray-300"
        >
          <History className="w-4 h-4" />
          History ({taskHistory.length})
        </button>
      </motion.div>

      {/* Goal Input */}
      {!currentTask && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-panel p-6"
        >
          <h3 className="text-lg font-semibold text-white mb-1">What would you like me to accomplish?</h3>
          <p className="text-xs text-gray-500 font-mono mb-4">Describe your goal and Krishna Agent will plan, select tools, and execute safely.</p>

          <div className="relative">
            <textarea
              ref={inputRef}
              value={goalInput}
              onChange={(e) => setGoalInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmitGoal();
                }
              }}
              placeholder="e.g., Prepare me for tomorrow's interview, or Analyze this job posting and compare with my skills..."
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-4 pr-28 text-white placeholder-gray-600 text-sm focus:outline-none focus:border-[#00E5FF]/50 resize-none h-24 font-mono"
            />
            <div className="absolute bottom-3 right-3 flex items-center gap-2">
              <button
                onClick={toggleVoice}
                className={cn(
                  'w-9 h-9 rounded-full flex items-center justify-center transition-all',
                  isListening
                    ? 'bg-[#FF3B3B] text-white animate-pulse'
                    : 'bg-white/10 text-gray-400 hover:text-white hover:bg-white/20'
                )}
              >
                <Mic className="w-4 h-4" />
              </button>
              <button
                onClick={handleSubmitGoal}
                disabled={!goalInput.trim() || isCreatingTask}
                className={cn(
                  'w-9 h-9 rounded-full flex items-center justify-center transition-all',
                  goalInput.trim() && !isCreatingTask
                    ? 'bg-gradient-to-r from-[#00E5FF] to-[#00FF9D] text-black hover:shadow-lg'
                    : 'bg-white/10 text-gray-600 cursor-not-allowed'
                )}
              >
                {isCreatingTask ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Quick suggestions */}
          <div className="flex flex-wrap gap-2 mt-4">
            {[
              'Summarize the latest tech news',
              'Create a learning path for React',
              'Help me prepare for a coding interview',
            ].map((suggestion) => (
              <button
                key={suggestion}
                onClick={() => setGoalInput(suggestion)}
                className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
              >
                <Sparkles className="w-3 h-3 inline mr-1.5" />{suggestion}
              </button>
            ))}
          </div>
        </motion.div>
      )}

      {/* Error Display */}
      <AnimatePresence>
        {agentError && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="glass-panel p-4 border-[#FF3B3B]/30 bg-[#FF3B3B]/5"
          >
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-[#FF3B3B] flex-shrink-0" />
              <p className="text-sm text-[#FF3B3B]/90 flex-1">{agentError}</p>
              <button onClick={() => setAgentError(null)} className="text-gray-500 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Active Task */}
      <AnimatePresence>
        {currentTask && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            {/* Task Header & Status */}
            <div className="glass-panel p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  {statusConfig && (
                    <div
                      className={cn('w-10 h-10 rounded-xl flex items-center justify-center', statusConfig.pulse && 'animate-pulse')}
                      style={{ backgroundColor: `${statusConfig.color}15`, border: `1px solid ${statusConfig.color}30` }}
                    >
                      <statusConfig.icon className="w-5 h-5" style={{ color: statusConfig.color }} />
                    </div>
                  )}
                  <div>
                    <h3 className="text-sm font-bold text-white">{currentTask.intent || currentTask.goal}</h3>
                    <p className="text-[10px] font-mono" style={{ color: statusConfig?.color }}>
                      {statusConfig?.label} • {currentTask.taskId}
                    </p>
                  </div>
                </div>

                {!['COMPLETED', 'CANCELLED', 'FAILED'].includes(currentTask.status) && (
                  <button
                    onClick={handleCancel}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#FF3B3B]/10 border border-[#FF3B3B]/30 text-[#FF3B3B] text-xs hover:bg-[#FF3B3B]/20 transition-colors"
                  >
                    <XCircle className="w-3.5 h-3.5" /> Cancel Task
                  </button>
                )}
              </div>

              {/* Progress Bar */}
              <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{
                    width: currentTask.status === 'COMPLETED' ? '100%' :
                      currentTask.plan.length > 0 ? `${((currentTask.currentStep + 1) / currentTask.plan.length) * 100}%` : '10%'
                  }}
                  className="h-full rounded-full transition-all duration-500"
                  style={{ backgroundColor: statusConfig?.color }}
                />
              </div>
            </div>

            {/* Plan Steps */}
            {currentTask.plan.length > 0 && (
              <div className="glass-panel p-5">
                <h4 className="text-xs font-mono text-gray-400 uppercase tracking-widest mb-4">Execution Plan</h4>
                <div className="space-y-3">
                  {currentTask.plan.map((step, i) => (
                    <div
                      key={i}
                      className={cn(
                        'flex items-start gap-3 p-3 rounded-xl border transition-all',
                        step.status === 'executing' ? 'bg-[#00E5FF]/5 border-[#00E5FF]/20' :
                          step.status === 'completed' ? 'bg-[#00FF9D]/5 border-[#00FF9D]/20' :
                            step.status === 'failed' ? 'bg-[#FF3B3B]/5 border-[#FF3B3B]/20' :
                              'bg-white/[0.02] border-white/5'
                      )}
                    >
                      <div className="mt-0.5">{getStepIcon(step.status)}</div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-white">{step.description}</p>
                        <div className="flex items-center gap-2 mt-1">
                          {step.toolName !== 'none' && (
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/5 text-[#00E5FF]">
                              {step.toolName}
                            </span>
                          )}
                          <span className={cn(
                            'text-[10px] font-mono px-2 py-0.5 rounded',
                            step.riskLevel === 'LOW' ? 'bg-[#00FF9D]/10 text-[#00FF9D]' :
                              step.riskLevel === 'MEDIUM' ? 'bg-[#FBBF24]/10 text-[#FBBF24]' :
                                'bg-[#FF3B3B]/10 text-[#FF3B3B]'
                          )}>
                            {step.riskLevel}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Confirmation Required */}
            {currentTask.status === 'WAITING_FOR_USER' && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="glass-panel p-6 border-[#FBBF24]/30 bg-[#FBBF24]/5"
              >
                <div className="flex items-center gap-3 mb-4">
                  <Shield className="w-6 h-6 text-[#FBBF24]" />
                  <h3 className="text-lg font-bold text-[#FBBF24]">ACTION REQUIRES CONFIRMATION</h3>
                </div>
                <p className="text-sm text-gray-300 mb-6">
                  {currentTask.confirmationAction || 'This action requires your explicit approval before proceeding.'}
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => handleConfirm(false)}
                    className="flex-1 py-3 rounded-xl border border-white/20 text-white font-semibold text-sm hover:bg-white/10 transition-colors"
                  >
                    CANCEL
                  </button>
                  <button
                    onClick={() => handleConfirm(true)}
                    className="flex-1 py-3 rounded-xl bg-gradient-to-r from-[#FBBF24] to-[#F59E0B] text-black font-semibold text-sm hover:shadow-lg hover:shadow-[#FBBF24]/20 transition-all"
                  >
                    CONFIRM
                  </button>
                </div>
              </motion.div>
            )}

            {/* Results */}
            {currentTask.results.length > 0 && (
              <div className="glass-panel p-5">
                <h4 className="text-xs font-mono text-gray-400 uppercase tracking-widest mb-4">Execution Results</h4>
                <div className="space-y-3">
                  {currentTask.results.map((result, i) => (
                    <div
                      key={i}
                      className={cn(
                        'p-3 rounded-xl border',
                        result.success ? 'bg-[#00FF9D]/5 border-[#00FF9D]/20' : 'bg-[#FF3B3B]/5 border-[#FF3B3B]/20'
                      )}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        {result.success ? (
                          <CheckCircle2 className="w-4 h-4 text-[#00FF9D]" />
                        ) : (
                          <XCircle className="w-4 h-4 text-[#FF3B3B]" />
                        )}
                        <span className="text-xs font-mono text-gray-400">Step {result.step} • {result.toolName}</span>
                      </div>
                      {result.message && <p className="text-sm text-gray-300 ml-6">{result.message}</p>}
                      {result.error && <p className="text-sm text-[#FF3B3B]/80 ml-6">{result.error}</p>}
                      {result.data && typeof result.data === 'object' && result.data.result && (
                        <div className="ml-6 mt-2 p-3 rounded-lg bg-black/20 border border-white/5 text-xs text-gray-300 whitespace-pre-wrap max-h-[200px] overflow-y-auto">
                          {typeof result.data.result === 'string' ? result.data.result : JSON.stringify(result.data.result, null, 2)}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Final Summary */}
            {currentTask.finalSummary && currentTask.status === 'COMPLETED' && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-panel p-5 border-[#00FF9D]/20"
              >
                <div className="flex items-center gap-2 mb-3">
                  <Bot className="w-5 h-5 text-[#00FF9D]" />
                  <h4 className="text-sm font-bold text-[#00FF9D]">Task Summary</h4>
                </div>
                <p className="text-sm text-gray-200 leading-relaxed whitespace-pre-wrap">{currentTask.finalSummary}</p>
              </motion.div>
            )}

            {/* New Task Button */}
            {['COMPLETED', 'CANCELLED', 'FAILED'].includes(currentTask.status) && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-center">
                <button
                  onClick={() => { clearAgent(); setPollingId(null); }}
                  className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-[#00E5FF]/20 to-[#00FF9D]/20 border border-[#00E5FF]/30 text-[#00E5FF] font-semibold text-sm hover:bg-[#00E5FF]/10 transition-colors"
                >
                  <RotateCcw className="w-4 h-4" /> New Task
                </button>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Task History */}
      <AnimatePresence>
        {showHistory && taskHistory.length > 0 && !currentTask && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="glass-panel p-5"
          >
            <h3 className="text-xs font-mono text-gray-400 uppercase tracking-widest mb-4">Task History</h3>
            <div className="space-y-2 max-h-[400px] overflow-y-auto">
              {taskHistory.map((task, i) => {
                const config = STATUS_CONFIG[task.status];
                return (
                  <button
                    key={i}
                    onClick={() => setCurrentTask(task)}
                    className="w-full flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors text-left"
                  >
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${config.color}15` }}>
                      <config.icon className="w-4 h-4" style={{ color: config.color }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-white truncate">{task.goal}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[10px] font-mono" style={{ color: config.color }}>{config.label}</span>
                        <span className="text-[10px] text-gray-600">{new Date(task.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-600" />
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Loading State for Creating Task */}
      <AnimatePresence>
        {isCreatingTask && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="glass-panel p-8 flex flex-col items-center justify-center"
          >
            <div className="relative">
              <div className="w-16 h-16 rounded-full border-2 border-[#00E5FF]/20 border-t-[#00E5FF] animate-spin" />
              <Zap className="absolute inset-0 m-auto text-[#00E5FF] animate-pulse" size={24} />
            </div>
            <p className="text-sm font-mono text-[#00E5FF] mt-4 tracking-widest uppercase">
              {LOADING_STAGES[loadingStageIdx]}...
            </p>
            <p className="text-xs text-gray-500 mt-2">Analyzing intent • Building plan • Selecting tools</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Platform Notice */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="text-center"
      >
        <p className="text-[10px] font-mono text-gray-700">
          KRISHNA AGENT • Controlled AI Task Engine • High-risk actions require explicit user confirmation • No autonomous execution of dangerous operations
        </p>
      </motion.div>
    </div>
  );
}
