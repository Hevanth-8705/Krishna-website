import { create } from 'zustand';

export interface Task {
  id: number;
  text: string;
  status: string;
  urgency: string;
  tag?: string;
}

export interface Habit {
  id: number;
  name: string;
  streak: number;
  history: boolean[];
}

export interface VoiceLog {
  id: string;
  text: string;
  timestamp: string;
  duration: string;
}

interface SystemState {
  isCoreOnline: boolean;
  cpuUsage: number;
  memoryUsage: number;
  threatLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  securityIntegrity: number;
  activeModules: number;
  isClapDetectionActive: boolean;
  clapSensitivity: number;
  clapCooldown: number;
  clapPulseMode: 'DISABLED' | 'SUBTLE' | 'INTENSE';
  tasks: Task[];
  habits: Habit[];
  productivityData: { name: string; tasks: number }[];
  focusState: 'idle' | 'running' | 'paused';
  focusTimeRemaining: number;
  zenMode: boolean;
  setSystemMetrics: (metrics: Partial<SystemState>) => void;
  setTasks: (tasks: Task[] | ((prev: Task[]) => Task[])) => void;
  setVoiceLogs: (logs: any) => void;
  toggleHabitToday: (id: number) => void;
  setFocusState: (state: 'idle' | 'running' | 'paused') => void;
  setFocusTimeRemaining: (time: number | ((prev: number) => number)) => void;
  completeFocusSession: () => void;
  setZenMode: (state: boolean | ((prev: boolean) => boolean)) => void;
}

const generateHistory = (days: number, probability: number) => 
  Array.from({ length: days }, () => Math.random() < probability);

export const useSystemStore = create<SystemState>((set) => ({
  isCoreOnline: true,
  cpuUsage: 12,
  memoryUsage: 45,
  threatLevel: 'LOW',
  securityIntegrity: 100,
  activeModules: 7,
  isClapDetectionActive: false,
  clapSensitivity: 150,
  clapCooldown: 1500,
  clapPulseMode: 'SUBTLE',
  tasks: [
    { id: 1, text: "Review user dietary anomaly logs", status: "pending", urgency: "high", tag: "Maintenance" },
    { id: 2, text: "Process Project Alpha vector embeddings", status: "pending", urgency: "medium", tag: "Project Alpha" },
    { id: 3, text: "Sync daily voice biometric signature", status: "completed", urgency: "low", tag: "Personal" }
  ],
  habits: [
    { id: 1, name: 'Core Meditation', streak: 12, history: [...generateHistory(27, 0.8), false] },
    { id: 2, name: 'Deep Work (2H)', streak: 4, history: [...generateHistory(27, 0.5), false] },
    { id: 3, name: 'Code Review', streak: 21, history: [...generateHistory(27, 0.9), false] }
  ],
  productivityData: [
    { name: 'Mon', tasks: 12 },
    { name: 'Tue', tasks: 19 },
    { name: 'Wed', tasks: 15 },
    { name: 'Thu', tasks: 22 },
    { name: 'Fri', tasks: 28 },
    { name: 'Sat', tasks: 10 },
    { name: 'Sun', tasks: 14 },
  ],
  focusState: 'idle',
  focusTimeRemaining: 25 * 60,
  zenMode: false,
  setSystemMetrics: (metrics) => set((state) => ({ ...state, ...metrics })),
  setTasks: (updater) => set((state) => ({
    tasks: typeof updater === 'function' ? updater(state.tasks) : updater,
  })),
  setVoiceLogs: () => {},
  toggleHabitToday: (id) => set((state) => ({
    habits: state.habits.map((h) => {
      if (h.id === id) {
        const newHistory = [...h.history];
        const todayIdx = newHistory.length - 1;
        const wasCompleted = newHistory[todayIdx];
        newHistory[todayIdx] = !wasCompleted;
        return {
          ...h,
          history: newHistory,
          streak: Math.max(0, wasCompleted ? h.streak - 1 : h.streak + 1),
        };
      }
      return h;
    }),
  })),
  setFocusState: (s) => set({ focusState: s }),
  setFocusTimeRemaining: (updater) => set((state) => ({
    focusTimeRemaining: typeof updater === 'function' ? updater(state.focusTimeRemaining) : updater,
  })),
  completeFocusSession: () => set((state) => {
    const newData = [...state.productivityData];
    const todayIndex = newData.length - 1;
    newData[todayIndex] = {
      ...newData[todayIndex],
      tasks: newData[todayIndex].tasks + 1
    };
    return {
      focusState: 'idle',
      focusTimeRemaining: 25 * 60,
      productivityData: newData
    };
  }),
  setZenMode: (updater) => set((state) => ({
    zenMode: typeof updater === 'function' ? updater(state.zenMode) : updater,
  })),
}));
