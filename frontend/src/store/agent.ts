import { create } from 'zustand';

// =========================================
// KRISHNA AGENT STATE MANAGEMENT
// =========================================

export type TaskStatus = 
  | 'PLANNING' 
  | 'WAITING_FOR_USER' 
  | 'READY' 
  | 'EXECUTING' 
  | 'VERIFYING' 
  | 'COMPLETED' 
  | 'FAILED' 
  | 'CANCELLED';

export interface PlanStep {
  step: number;
  description: string;
  toolName: string;
  toolInput: Record<string, any>;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  requiresConfirmation: boolean;
  status: 'pending' | 'executing' | 'completed' | 'failed' | 'skipped' | 'not_implemented';
}

export interface ToolExecution {
  step: number;
  toolName: string;
  success: boolean;
  data?: any;
  error?: string;
  message?: string;
}

export interface AgentTask {
  taskId: string;
  goal: string;
  intent: string;
  status: TaskStatus;
  plan: PlanStep[];
  currentStep: number;
  reasoning: string;
  results: ToolExecution[];
  requiresConfirmation: boolean;
  confirmationAction?: string;
  finalSummary?: string;
  createdAt: string;
  completedAt?: string | null;
}

export interface VisionAnalysis {
  imagePreview: string;
  analysis: string;
  mode: string;
  model: string;
  confidence: string;
  timestamp: string;
}

interface AgentState {
  // Agent
  currentTask: AgentTask | null;
  taskHistory: AgentTask[];
  isCreatingTask: boolean;
  agentError: string | null;
  
  // Vision
  currentVisionAnalysis: VisionAnalysis | null;
  isAnalyzingVision: boolean;
  visionError: string | null;
  visionHistory: VisionAnalysis[];

  // Actions
  setCurrentTask: (task: AgentTask | null) => void;
  updateCurrentTask: (updates: Partial<AgentTask>) => void;
  addToHistory: (task: AgentTask) => void;
  setIsCreatingTask: (val: boolean) => void;
  setAgentError: (err: string | null) => void;
  clearAgent: () => void;
  
  setCurrentVisionAnalysis: (analysis: VisionAnalysis | null) => void;
  setIsAnalyzingVision: (val: boolean) => void;
  setVisionError: (err: string | null) => void;
  addVisionToHistory: (analysis: VisionAnalysis) => void;
  clearVision: () => void;
}

// Load task history from localStorage
function loadTaskHistory(): AgentTask[] {
  try {
    const saved = localStorage.getItem('krishna_agent_task_history');
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
}

function saveTaskHistory(tasks: AgentTask[]) {
  try {
    localStorage.setItem('krishna_agent_task_history', JSON.stringify(tasks.slice(0, 50)));
  } catch {
    // Silently fail if localStorage is unavailable
  }
}

function loadVisionHistory(): VisionAnalysis[] {
  try {
    const saved = localStorage.getItem('krishna_vision_history');
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
}

function saveVisionHistory(analyses: VisionAnalysis[]) {
  try {
    localStorage.setItem('krishna_vision_history', JSON.stringify(analyses.slice(0, 30)));
  } catch {
    // Silently fail
  }
}

export const useAgentStore = create<AgentState>((set, get) => ({
  currentTask: null,
  taskHistory: loadTaskHistory(),
  isCreatingTask: false,
  agentError: null,
  
  currentVisionAnalysis: null,
  isAnalyzingVision: false,
  visionError: null,
  visionHistory: loadVisionHistory(),

  setCurrentTask: (task) => set({ currentTask: task }),
  
  updateCurrentTask: (updates) => set((state) => {
    if (!state.currentTask) return state;
    return { currentTask: { ...state.currentTask, ...updates } };
  }),
  
  addToHistory: (task) => set((state) => {
    const updated = [task, ...state.taskHistory].slice(0, 50);
    saveTaskHistory(updated);
    return { taskHistory: updated };
  }),
  
  setIsCreatingTask: (val) => set({ isCreatingTask: val }),
  setAgentError: (err) => set({ agentError: err }),
  
  clearAgent: () => set({ currentTask: null, agentError: null, isCreatingTask: false }),

  setCurrentVisionAnalysis: (analysis) => set({ currentVisionAnalysis: analysis }),
  setIsAnalyzingVision: (val) => set({ isAnalyzingVision: val }),
  setVisionError: (err) => set({ visionError: err }),
  
  addVisionToHistory: (analysis) => set((state) => {
    const updated = [analysis, ...state.visionHistory].slice(0, 30);
    saveVisionHistory(updated);
    return { visionHistory: updated };
  }),
  
  clearVision: () => set({ currentVisionAnalysis: null, visionError: null, isAnalyzingVision: false }),
}));
