import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.resolve(__dirname, '..', 'data');
const STORE_PATH = path.join(DATA_DIR, 'learn_store.json');

export interface VideoData {
  provider: 'youtube' | 'other';
  videoId: string;
  title: string;
  channelName: string;
  duration: string;
  qualityScore: number;
  views?: string;
  likes?: string;
  tags?: string[];
  agentRecommended?: boolean;
}

export interface ResourceData {
  title: string;
  url: string;
  type: 'doc' | 'article' | 'github' | 'tutorial';
  description?: string;
}

export interface PracticeQuestion {
  question: string;
  options: string[];
  correctIndex: number;
  rationale: string;
}

export interface LessonData {
  lessonId: string;
  courseId: string;
  moduleId: string;
  title: string;
  duration: string;
  description: string;
  order: number;
  video: VideoData | null;
  resources: ResourceData[];
  practice: PracticeQuestion[];
}

export interface ModuleData {
  moduleId: string;
  courseId: string;
  title: string;
  timeframe: string;
  description: string;
  skillsAcquired: string[];
  order: number;
  lessons: LessonData[];
}

export interface CoursePath {
  courseId: string;
  userId: string; // 'system' or authenticated uid
  title: string;
  category: string;
  description: string;
  level: string;
  goal: string;
  estimatedDuration: string;
  createdAt: number;
  modules: ModuleData[];
}

export interface UserProgressRecord {
  userId: string;
  courseId: string;
  moduleId: string;
  lessonId: string;
  completed: boolean;
  watchProgress: number;
  practiceCompleted: boolean;
  updatedAt: number;
}

export interface UserLastAccessed {
  userId: string;
  courseId: string;
  moduleId: string;
  lessonId: string;
  updatedAt: number;
}

interface StoreSchema {
  paths: Record<string, CoursePath>; // key: `${userId}:${courseId}` or `system:${courseId}`
  progress: Record<string, UserProgressRecord>; // key: `${userId}:${courseId}:${lessonId}`
  lastAccessed: Record<string, UserLastAccessed>; // key: userId
}

function ensureStoreExists(): StoreSchema {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  if (!fs.existsSync(STORE_PATH)) {
    const initial: StoreSchema = {
      paths: {},
      progress: {},
      lastAccessed: {}
    };
    fs.writeFileSync(STORE_PATH, JSON.stringify(initial, null, 2), 'utf-8');
    return initial;
  }

  try {
    const content = fs.readFileSync(STORE_PATH, 'utf-8');
    return JSON.parse(content);
  } catch (err) {
    console.error('[LearnStore] File read error, resetting store:', err);
    const fallback: StoreSchema = { paths: {}, progress: {}, lastAccessed: {} };
    fs.writeFileSync(STORE_PATH, JSON.stringify(fallback, null, 2), 'utf-8');
    return fallback;
  }
}

function saveStore(data: StoreSchema): void {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(STORE_PATH, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('[LearnStore] File save error:', err);
  }
}

export const learnStore = {
  getCourse(courseId: string, userId: string): CoursePath | null {
    const store = ensureStoreExists();
    // Check user-specific path first
    const userKey = `${userId}:${courseId}`;
    if (store.paths[userKey]) return store.paths[userKey];

    // Check system default course
    const sysKey = `system:${courseId}`;
    if (store.paths[sysKey]) return store.paths[sysKey];

    return null;
  },

  saveCourse(course: CoursePath): void {
    const store = ensureStoreExists();
    const key = `${course.userId}:${course.courseId}`;
    store.paths[key] = course;
    saveStore(store);
  },

  getUserCourses(userId: string): CoursePath[] {
    const store = ensureStoreExists();
    const results: CoursePath[] = [];

    // User-created courses
    for (const [key, pathObj] of Object.entries(store.paths)) {
      if (pathObj.userId === userId) {
        results.push(pathObj);
      }
    }
    return results;
  },

  saveProgress(record: UserProgressRecord): void {
    const store = ensureStoreExists();
    const key = `${record.userId}:${record.courseId}:${record.lessonId}`;
    store.progress[key] = {
      ...record,
      updatedAt: Date.now()
    };

    // Update last accessed
    store.lastAccessed[record.userId] = {
      userId: record.userId,
      courseId: record.courseId,
      moduleId: record.moduleId,
      lessonId: record.lessonId,
      updatedAt: Date.now()
    };

    saveStore(store);
  },

  getUserProgress(userId: string, courseId?: string): Record<string, UserProgressRecord> {
    const store = ensureStoreExists();
    const result: Record<string, UserProgressRecord> = {};
    for (const [key, rec] of Object.entries(store.progress)) {
      if (rec.userId === userId && (!courseId || rec.courseId === courseId)) {
        result[rec.lessonId] = rec;
      }
    }
    return result;
  },

  setLastAccessed(userId: string, courseId: string, moduleId: string, lessonId: string): void {
    const store = ensureStoreExists();
    store.lastAccessed[userId] = {
      userId,
      courseId,
      moduleId,
      lessonId,
      updatedAt: Date.now()
    };
    saveStore(store);
  },

  getLastAccessed(userId: string): UserLastAccessed | null {
    const store = ensureStoreExists();
    return store.lastAccessed[userId] || null;
  },

  searchCourses(query: string, userId: string): CoursePath[] {
    const store = ensureStoreExists();
    const q = query.trim().toLowerCase();
    if (!q) return [];

    const matches: CoursePath[] = [];
    const seenIds = new Set<string>();

    // Search user courses first
    for (const pathObj of Object.values(store.paths)) {
      if ((pathObj.userId === userId || pathObj.userId === 'system') && !seenIds.has(pathObj.courseId)) {
        if (
          pathObj.title.toLowerCase().includes(q) ||
          pathObj.category.toLowerCase().includes(q) ||
          pathObj.description.toLowerCase().includes(q)
        ) {
          matches.push(pathObj);
          seenIds.add(pathObj.courseId);
        }
      }
    }

    return matches;
  }
};
