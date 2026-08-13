import React, { useState, useEffect } from 'react';
import { 
  BookOpen, 
  Target, 
  Compass, 
  Tv, 
  Cpu, 
  Award, 
  HelpCircle, 
  Layers, 
  CheckCircle2, 
  Play, 
  Pause, 
  RotateCw, 
  ArrowRight, 
  Volume2, 
  VolumeX, 
  Video, 
  Flame, 
  Clock, 
  Sliders, 
  Wand2, 
  MessageSquare, 
  FileText, 
  Brain, 
  TrendingUp, 
  Activity, 
  Eye, 
  ThumbsUp, 
  Lock, 
  Zap, 
  Plus, 
  X,
  AlertTriangle,
  ChevronRight,
  Sparkles,
  RefreshCw,
  Terminal,
  ShieldAlert,
  Search,
  Check,
  Globe,
  GraduationCap,
  Briefcase,
  Code2,
  FolderPlus
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import { youtubeService } from '../services/youtubeService';
import { videoProviderService, NormalizedVideo } from '../services/videoProvider';
import { useAuth } from '../context/AuthContext';
import { auth } from '../lib/firebase';

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
  id: string; // e.g., "python-functions"
  lessonId?: string;
  courseId: string; // e.g., "python"
  moduleId: string; // e.g., "python-basics"
  title: string;
  duration: string;
  order?: number;
  description?: string;
  video: NormalizedVideo | null; // null when video is not configured
  resources?: ResourceData[];
  practice?: PracticeQuestion[];
  isCustomPatched?: boolean;
}

export interface ModuleData {
  id: string;
  moduleId?: string;
  courseId: string;
  title: string;
  timeframe: string;
  description: string;
  skillsAcquired: string[];
  order?: number;
  lessons: LessonData[];
}

export interface CourseData {
  id: string;
  courseId?: string;
  userId?: string;
  title: string;
  category: string;
  description: string;
  level?: string;
  goal?: string;
  estimatedDuration?: string;
  createdAt?: number;
  modules: ModuleData[];
}

// Ambiguous Topic Map for Topic Validation / Clarification
const AMBIGUOUS_TOPICS: Record<string, string[]> = {
  'java': ['Core Java Fundamentals', 'Java Backend & Spring Boot', 'Java Full Stack Development', 'Java Enterprise Microservices'],
  'python': ['Python Core Programming', 'Python Full Stack Development', 'Python for Data Science & AI', 'Python Automation & Web Scraping'],
  'c++': ['Modern C++ (C++17/20)', 'C++ Data Structures & Algorithms', 'C++ Game Engine & Systems Dev'],
  'cloud': ['AWS Cloud Solutions Architect', 'Azure Cloud Engineering', 'Google Cloud Platform (GCP) Fundamentals'],
  'react': ['React Modern Fundamentals', 'React & Next.js Architecture', 'React Native Mobile Engineering'],
  'ai': ['Generative AI & LLMs', 'Machine Learning & Neural Architectures', 'Deep Learning & Computer Vision']
};

// 7 Predefined Baseline Courses
const PREDEFINED_COURSES: CourseData[] = [
  {
    id: 'python',
    courseId: 'python',
    userId: 'system',
    title: 'Python Programming',
    category: 'Backend & Core Systems',
    description: 'Master Python syntax, functions, object-oriented concepts, and computational algorithms.',
    level: 'Beginner',
    goal: 'Job preparation',
    estimatedDuration: '4 weeks',
    modules: [
      {
        id: 'python-basics',
        moduleId: 'python-basics',
        courseId: 'python',
        title: 'Phase 1: Python Basics & Core Syntax',
        timeframe: 'Weeks 1-2',
        description: 'Understand variables, control flow, functions, and fundamental data structures in Python.',
        skillsAcquired: ['Python Syntax', 'Functions & Scope', 'Control Flow'],
        lessons: [
          {
            id: 'python-intro',
            lessonId: 'python-intro',
            courseId: 'python',
            moduleId: 'python-basics',
            title: 'Python for Beginners – Complete Fundamentals',
            duration: '6:14:07',
            description: 'Comprehensive introduction to Python installation, data types, loops, and basic logic.',
            video: {
              provider: 'youtube',
              videoId: '8DvywoWv6fI',
              title: 'Python for Beginners – Full Course',
              channelName: 'freeCodeCamp.org',
              duration: '6:14:07',
              qualityScore: 99,
              views: '12M views',
              likes: '450K likes',
              tags: ['Python', 'Coding', 'Fundamentals'],
              agentRecommended: true
            },
            resources: [
              { title: 'Python Official Documentation', url: 'https://docs.python.org/3/', type: 'doc', description: 'Official standard Python guide and tutorials.' }
            ],
            practice: [
              {
                question: 'Which of the following is a mutable data type in Python?',
                options: ['List', 'Tuple', 'String', 'Integer'],
                correctIndex: 0,
                rationale: 'Lists in Python are mutable sequences that can be altered after instantiation.'
              }
            ]
          },
          {
            id: 'python-functions',
            lessonId: 'python-functions',
            courseId: 'python',
            moduleId: 'python-basics',
            title: 'Python Functions & Scope Deep Dive',
            duration: '22:15',
            description: 'Master positional arguments, kwargs, lambda functions, and scope boundaries in Python.',
            video: {
              provider: 'youtube',
              videoId: 'BVfCWuca9nw',
              title: 'Python Functions – How to Write Modular Code',
              channelName: 'Corey Schafer',
              duration: '22:15',
              qualityScore: 98,
              views: '1.8M views',
              likes: '95K likes',
              tags: ['Python', 'Functions', 'Modular Code'],
              agentRecommended: true
            }
          },
          {
            id: 'python-modules',
            lessonId: 'python-modules',
            courseId: 'python',
            moduleId: 'python-basics',
            title: 'Working with Python Standard Modules',
            duration: '35:00',
            description: 'Importing modules, packages, and utilizing virtual environments.',
            video: null // Unconfigured video to test VIDEO_NOT_CONFIGURED requirement
          }
        ]
      },
      {
        id: 'python-oop-mod',
        moduleId: 'python-oop-mod',
        courseId: 'python',
        title: 'Phase 2: Object-Oriented Python',
        timeframe: 'Weeks 3-4',
        description: 'Implement robust classes, encapsulated properties, inheritance, and magic methods.',
        skillsAcquired: ['OOP Concepts', 'Classes & Objects', 'Inheritance'],
        lessons: [
          {
            id: 'python-classes',
            lessonId: 'python-classes',
            courseId: 'python',
            moduleId: 'python-oop-mod',
            title: 'Python OOP (Object Oriented Programming) Explained',
            duration: '18:40',
            description: 'Learn how to create custom classes, methods, and instantiate objects in Python.',
            video: {
              provider: 'youtube',
              videoId: 'JeznW_7UrB0',
              title: 'Python OOP (Object Oriented Programming) Explained',
              channelName: 'TechWithTim',
              duration: '18:40',
              qualityScore: 95,
              views: '2.3M views',
              likes: '120K likes',
              tags: ['OOP', 'Classes', 'Inheritance'],
              agentRecommended: true
            }
          }
        ]
      }
    ]
  },
  {
    id: 'java',
    courseId: 'java',
    userId: 'system',
    title: 'Java Development',
    category: 'Enterprise Software',
    description: 'Master Java architecture, JVM internals, object-oriented principles, and thread concurrency.',
    level: 'Intermediate',
    goal: 'Job preparation',
    estimatedDuration: '6 weeks',
    modules: [
      {
        id: 'java-fundamentals',
        moduleId: 'java-fundamentals',
        courseId: 'java',
        title: 'Phase 1: Java Core Fundamentals',
        timeframe: 'Weeks 1-2',
        description: 'Learn static typing, compilation, methods, arrays, and control structures in Java.',
        skillsAcquired: ['Java Syntax', 'JVM Architecture', 'Data Types'],
        lessons: [
          {
            id: 'java-intro',
            lessonId: 'java-intro',
            courseId: 'java',
            moduleId: 'java-fundamentals',
            title: 'Java Tutorial for Beginners – Complete Guide',
            duration: '2:30:00',
            description: 'Comprehensive setup, syntax rules, variables, and control flow in Java.',
            video: {
              provider: 'youtube',
              videoId: 'eIrMbAQSU34',
              title: 'Java Tutorial for Beginners',
              channelName: 'Programming with Mosh',
              duration: '2:30:00',
              qualityScore: 98,
              views: '8.5M views',
              likes: '390K likes',
              tags: ['Java', 'Programming', 'Backend'],
              agentRecommended: true
            }
          }
        ]
      },
      {
        id: 'java-oop',
        moduleId: 'java-oop',
        courseId: 'java',
        title: 'Phase 2: Java Object-Oriented Design',
        timeframe: 'Weeks 3-4',
        description: 'Master encapsulation, abstraction, interfaces, and design patterns in Java.',
        skillsAcquired: ['Java OOP', 'Interfaces', 'Polymorphism'],
        lessons: [
          {
            id: 'java-classes',
            lessonId: 'java-classes',
            courseId: 'java',
            moduleId: 'java-oop',
            title: 'Object Oriented Programming in Java',
            duration: '1:30:00',
            description: 'Constructors, getters/setters, access modifiers, and class hierarchies in Java.',
            video: {
              provider: 'youtube',
              videoId: 'IUqKuGNasdM',
              title: 'Java OOP Full Course',
              channelName: 'freeCodeCamp.org',
              duration: '1:30:00',
              qualityScore: 96,
              views: '1.9M views',
              likes: '88K likes',
              tags: ['Java OOP', 'Classes', 'Interfaces'],
              agentRecommended: true
            }
          }
        ]
      }
    ]
  },
  {
    id: 'javascript',
    courseId: 'javascript',
    userId: 'system',
    title: 'JavaScript Modern Masterclass',
    category: 'Web Development',
    description: 'Master asynchronous JS, ES6+ standards, event loops, DOM manipulation, and functional patterns.',
    level: 'Beginner',
    goal: 'Project development',
    estimatedDuration: '4 weeks',
    modules: [
      {
        id: 'js-foundations',
        moduleId: 'js-foundations',
        courseId: 'javascript',
        title: 'Phase 1: JavaScript Foundations',
        timeframe: 'Weeks 1-2',
        description: 'Understand JS execution context, variables (let/const), functions, and scope.',
        skillsAcquired: ['JS Syntax', 'Scope & Closures', 'DOM Basics'],
        lessons: [
          {
            id: 'js-intro',
            lessonId: 'js-intro',
            courseId: 'javascript',
            moduleId: 'js-foundations',
            title: 'JavaScript Tutorial for Beginners',
            duration: '48:17',
            description: 'Core syntax, variables, operators, conditional branches, and function definitions.',
            video: {
              provider: 'youtube',
              videoId: 'W6NZfCO5SIk',
              title: 'JavaScript Tutorial for Beginners',
              channelName: 'Programming with Mosh',
              duration: '48:17',
              qualityScore: 99,
              views: '11M views',
              likes: '510K likes',
              tags: ['JavaScript', 'Web Dev', 'Frontend'],
              agentRecommended: true
            }
          }
        ]
      },
      {
        id: 'js-async',
        moduleId: 'js-async',
        courseId: 'javascript',
        title: 'Phase 2: Asynchronous JavaScript & Promises',
        timeframe: 'Weeks 3-4',
        description: 'Master non-blocking I/O, event loop mechanics, Promises, and async/await syntax.',
        skillsAcquired: ['Async JS', 'Promises', 'Event Loop'],
        lessons: [
          {
            id: 'js-promises',
            lessonId: 'js-promises',
            courseId: 'javascript',
            moduleId: 'js-async',
            title: 'Async JavaScript & Promises Explained',
            duration: '02:30',
            description: 'Understand promises, resolve/reject queues, microtasks, and async/await syntax.',
            video: {
              provider: 'youtube',
              videoId: 'PoRJizFvM7s',
              title: 'Async JavaScript in 100 Seconds',
              channelName: 'Fireship',
              duration: '02:30',
              qualityScore: 98,
              views: '1.5M views',
              likes: '110K likes',
              tags: ['JavaScript', 'Async', 'Promises'],
              agentRecommended: true
            }
          }
        ]
      }
    ]
  },
  {
    id: 'react',
    courseId: 'react',
    userId: 'system',
    title: 'React & Next.js Architecture',
    category: 'Frontend Engineering',
    description: 'Build component-driven single-page applications, manage component state, and build server-rendered apps.',
    level: 'Intermediate',
    goal: 'Job preparation',
    estimatedDuration: '5 weeks',
    modules: [
      {
        id: 'react-fundamentals',
        moduleId: 'react-fundamentals',
        courseId: 'react',
        title: 'Phase 1: React Fundamentals & JSX',
        timeframe: 'Weeks 1-2',
        description: 'Understand Virtual DOM, JSX syntax, component lifecycles, and prop passing.',
        skillsAcquired: ['React Fundamentals', 'JSX', 'Props & State'],
        lessons: [
          {
            id: 'react-intro',
            lessonId: 'react-intro',
            courseId: 'react',
            moduleId: 'react-fundamentals',
            title: 'React JS Full Course for Beginners',
            duration: '12:45:00',
            description: 'Learn React building blocks, functional components, state management, and props.',
            video: {
              provider: 'youtube',
              videoId: 'Ke90Tje7VS0',
              title: 'React JS Full Course for Beginners',
              channelName: 'freeCodeCamp.org',
              duration: '12:45:00',
              qualityScore: 98,
              views: '4.8M views',
              likes: '310K likes',
              tags: ['React', 'Web Dev', 'Vite'],
              agentRecommended: true
            }
          }
        ]
      },
      {
        id: 'react-nextjs',
        moduleId: 'react-nextjs',
        courseId: 'react',
        title: 'Phase 2: Next.js App Router Architecture',
        timeframe: 'Weeks 3-5',
        description: 'Server Components, App Router, Server Actions, and API Route handlers in Next.js.',
        skillsAcquired: ['Next.js App Router', 'SSR & SSG', 'Full-Stack React'],
        lessons: [
          {
            id: 'nextjs-app-router',
            lessonId: 'nextjs-app-router',
            courseId: 'react',
            moduleId: 'react-nextjs',
            title: 'Complete Next.js App Router Tutorial',
            duration: '31:10',
            description: 'Master file-based routing, layout components, server side rendering, and data fetching.',
            video: {
              provider: 'youtube',
              videoId: 'V9D_g9Ilg3Y',
              title: 'Complete Next.js App Router Tutorial',
              channelName: 'Net Ninja Core',
              duration: '31:10',
              qualityScore: 91,
              views: '350K views',
              likes: '28K likes',
              tags: ['Nextjs', 'App Router', 'React'],
              agentRecommended: true
            }
          }
        ]
      }
    ]
  },
  {
    id: 'machine-learning',
    courseId: 'machine-learning',
    userId: 'system',
    title: 'Machine Learning & Neural Architectures',
    category: 'AI & Intelligence',
    description: 'Explore neural network math, gradient descent calculus, backpropagation, and transformer attention.',
    level: 'Advanced',
    goal: 'Interview preparation',
    estimatedDuration: '8 weeks',
    modules: [
      {
        id: 'ml-neural-nets',
        moduleId: 'ml-neural-nets',
        courseId: 'machine-learning',
        title: 'Phase 1: Deep Learning & Neural Network Mathematics',
        timeframe: 'Weeks 1-3',
        description: 'Understand computational logic, activation functions, vectors, and loss functions.',
        skillsAcquired: ['Neural Networks', 'Gradient Calculus', 'Loss Minimization'],
        lessons: [
          {
            id: 'ml-nn-intro',
            lessonId: 'ml-nn-intro',
            courseId: 'machine-learning',
            moduleId: 'ml-neural-nets',
            title: 'But what is a neural network? | Deep learning, chapter 1',
            duration: '20:13',
            description: 'Visual mathematical intuition for multilayer perceptrons, weights, and biases.',
            video: {
              provider: 'youtube',
              videoId: 'aircAruvnKk',
              title: 'But what is a neural network? | Deep learning, chapter 1',
              channelName: '3Blue1Brown',
              duration: '20:13',
              qualityScore: 98,
              views: '15M views',
              likes: '980K likes',
              tags: ['Neural Networks', 'Deep Learning', 'Calculus'],
              agentRecommended: true
            }
          }
        ]
      },
      {
        id: 'ml-llms',
        moduleId: 'ml-llms',
        courseId: 'machine-learning',
        title: 'Phase 2: Large Language Models & Transformers',
        timeframe: 'Weeks 4-8',
        description: 'Understand multi-head self-attention, tokenization, positional embeddings, and KV caching.',
        skillsAcquired: ['LLMs', 'Transformer Architecture', 'Self-Attention'],
        lessons: [
          {
            id: 'ml-llm-intro',
            lessonId: 'ml-llm-intro',
            courseId: 'machine-learning',
            moduleId: 'ml-llms',
            title: 'Intro to Large Language Models (LLMs)',
            duration: '1:02:15',
            description: 'Comprehensive overview of LLM training phases, pretraining, fine-tuning, and security.',
            video: {
              provider: 'youtube',
              videoId: 'zjkBMFhNj_g',
              title: 'Intro to Large Language Models (LLMs)',
              channelName: 'Andrej Karpathy',
              duration: '1:02:15',
              qualityScore: 99,
              views: '3.1M views',
              likes: '220K likes',
              tags: ['LLM', 'AI', 'Security'],
              agentRecommended: true
            }
          }
        ]
      }
    ]
  },
  {
    id: 'data-science',
    courseId: 'data-science',
    userId: 'system',
    title: 'Data Science & Analytical Computing',
    category: 'Data & Analytics',
    description: 'Learn data analysis, statistical modeling, data cleaning with Pandas, and visualization.',
    level: 'Intermediate',
    goal: 'Job preparation',
    estimatedDuration: '6 weeks',
    modules: [
      {
        id: 'ds-foundations',
        moduleId: 'ds-foundations',
        courseId: 'data-science',
        title: 'Phase 1: Data Science Foundations',
        timeframe: 'Weeks 1-2',
        description: 'Introduction to data analysis workflows, exploratory data analysis, and Python tools.',
        skillsAcquired: ['Data Analysis', 'Python for DS', 'Statistics'],
        lessons: [
          {
            id: 'ds-intro',
            lessonId: 'ds-intro',
            courseId: 'data-science',
            moduleId: 'ds-foundations',
            title: 'Data Science for Beginners – Full Course',
            duration: '5:50:00',
            description: 'Learn fundamental data science paradigms, environment setup, and data pipelines.',
            video: {
              provider: 'youtube',
              videoId: 'ua-CiDNNj30',
              title: 'Data Science for Beginners – Full Course',
              channelName: 'freeCodeCamp.org',
              duration: '5:50:00',
              qualityScore: 97,
              views: '2.8M views',
              likes: '130K likes',
              tags: ['Data Science', 'Python', 'Analytics'],
              agentRecommended: true
            }
          }
        ]
      }
    ]
  },
  {
    id: 'operating-system',
    courseId: 'operating-system',
    userId: 'system',
    title: 'Operating System & Kernel Architecture',
    category: 'Core Computer Science',
    description: 'Master OS process scheduling, memory management, virtual memory, file systems, and concurrency primitives.',
    level: 'Intermediate',
    goal: 'Interview preparation',
    estimatedDuration: '4 weeks',
    modules: [
      {
        id: 'os-processes-mod',
        moduleId: 'os-processes-mod',
        courseId: 'operating-system',
        title: 'Phase 1: Processes, Threads & CPU Scheduling',
        timeframe: 'Weeks 1-2',
        description: 'Process control blocks, context switching, FCFS, Round Robin, and thread synchronization.',
        skillsAcquired: ['Processes & Threads', 'CPU Scheduling', 'Context Switch'],
        lessons: [
          {
            id: 'os-intro',
            lessonId: 'os-intro',
            courseId: 'operating-system',
            moduleId: 'os-processes-mod',
            title: 'Operating System Architecture & Kernel Basics',
            duration: '4:15:00',
            description: 'Introduction to kernel modes, system calls, interrupt handling, and OS primitives.',
            video: {
              provider: 'youtube',
              videoId: 'vBURTt97EkA',
              title: 'Operating System Full Course for Beginners',
              channelName: 'Gate Smashers',
              duration: '4:15:00',
              qualityScore: 98,
              views: '3.2M views',
              likes: '150K likes',
              tags: ['Operating Systems', 'Kernel', 'Processes'],
              agentRecommended: true
            },
            resources: [
              { title: 'OS Concepts (Silberschatz)', url: 'https://codex.cs.yale.edu/avi/os-book/', type: 'doc', description: 'Standard reference text for operating system concepts.' }
            ],
            practice: [
              {
                question: 'Which component transitions the CPU from user mode to kernel mode during a system call?',
                options: ['Hardware Interrupt Vector / Trap', 'DMA Controller', 'L1 Cache Line Unit', 'TLB Buffer'],
                correctIndex: 0,
                rationale: 'System calls trigger a software interrupt trap that switches the execution mode bit to kernel mode.'
              }
            ]
          },
          {
            id: 'os-processes',
            lessonId: 'os-processes',
            courseId: 'operating-system',
            moduleId: 'os-processes-mod',
            title: 'Process Scheduling Algorithms & Concurrency',
            duration: '35:20',
            description: 'Analysis of SJF, Round Robin, Priority scheduling, and PCB state transitions.',
            video: {
              provider: 'youtube',
              videoId: '26QPDBe-NB8',
              title: 'Process Management & Scheduling Algorithms',
              channelName: 'Neso Academy',
              duration: '35:20',
              qualityScore: 96,
              views: '1.1M views',
              likes: '62K likes',
              tags: ['Processes', 'CPU Scheduling', 'Context Switch'],
              agentRecommended: true
            }
          }
        ]
      },
      {
        id: 'os-memory-mod',
        moduleId: 'os-memory-mod',
        courseId: 'operating-system',
        title: 'Phase 2: Virtual Memory & Page Replacement',
        timeframe: 'Weeks 3-4',
        description: 'Paging, segmentation, TLB caches, page fault handling, and LRU page replacement algorithms.',
        skillsAcquired: ['Paging', 'Virtual Memory', 'TLB'],
        lessons: [
          {
            id: 'os-paging',
            lessonId: 'os-paging',
            courseId: 'operating-system',
            moduleId: 'os-memory-mod',
            title: 'Virtual Memory & Paging Mechanisms',
            duration: '40:00',
            description: 'Page tables, MMU address translation, and TLB hit/miss latency breakdown.',
            video: null, // Unconfigured video to demonstrate VIDEO_NOT_CONFIGURED requirement
            resources: [
              { title: 'Virtual Memory & Address Translation', url: 'https://pages.cs.wisc.edu/~remzi/OSTEP/', type: 'doc' }
            ],
            practice: [
              {
                question: 'What is the primary role of the Translation Lookaside Buffer (TLB)?',
                options: ['Hardware cache for page table address translations', 'Secondary disk swap manager', 'CPU register stack allocator', 'Network packet router'],
                correctIndex: 0,
                rationale: 'The TLB is a high-speed associative hardware cache that speeds up virtual-to-physical address translation.'
              }
            ]
          }
        ]
      }
    ]
  }
];

export default function KrishnaLearn() {
  const { user } = useAuth();
  
  // General view tabs: 'discovery' | 'classroom'
  const [learningMode, setLearningMode] = useState<'discovery' | 'classroom'>('discovery');
  
  // Courses Data & Navigation States
  const [allCourses, setAllCourses] = useState<CourseData[]>(PREDEFINED_COURSES);
  const [selectedCourseId, setSelectedCourseId] = useState<string>('python');
  const [selectedModuleId, setSelectedModuleId] = useState<string>('python-basics');
  const [selectedLessonId, setSelectedLessonId] = useState<string>('python-intro');

  // Search & Topic Selection States
  const [searchQuery, setSearchQuery] = useState('');
  const [topicInput, setTopicInput] = useState('');
  const [showConfigPanel, setShowConfigPanel] = useState(false);
  const [duplicatePromptCourse, setDuplicatePromptCourse] = useState<CourseData | null>(null);
  const [ambiguousModalTopic, setAmbiguousModalTopic] = useState<{ topic: string; options: string[] } | null>(null);

  // Optional Setup Preferences
  const [skillLevel, setSkillLevel] = useState<'Beginner' | 'Intermediate' | 'Advanced'>('Beginner');
  const [learningGoal, setLearningGoal] = useState<string>('Job preparation');
  const [dailyTime, setDailyTime] = useState<string>('1 hour');
  const [preferredLanguage, setPreferredLanguage] = useState<string>('English');

  // Loading experience step-by-step indicator
  const [isGeneratingPath, setIsGeneratingPath] = useState(false);
  const [generationStep, setGenerationStep] = useState<number>(0);
  const [generationError, setGenerationError] = useState<string | null>(null);

  // Step names required by acceptance criteria
  const generationStepLabels = [
    'ANALYZING TOPIC',
    'BUILDING ROADMAP',
    'GENERATING MODULES',
    'FINDING LEARNING RESOURCES',
    'FINALIZING LEARNING PATH'
  ];

  // Progress Tracking State (Keyed by `${userId}:${courseId}:${lessonId}`)
  const [completedLessons, setCompletedLessons] = useState<Record<string, boolean>>(() => {
    try {
      const saved = localStorage.getItem('krishna_learn_completed');
      return saved ? JSON.parse(saved) : {};
    } catch (_) {
      return {};
    }
  });

  // Last active continue learning state
  const [lastActiveState, setLastActiveState] = useState<{ courseId: string; moduleId: string; lessonId: string } | null>(() => {
    try {
      const saved = localStorage.getItem('krishna_learn_last_active');
      return saved ? JSON.parse(saved) : null;
    } catch (_) {
      return null;
    }
  });

  // Helper to obtain authenticated headers with Firebase Token
  const getAuthHeaders = async (): Promise<Record<string, string>> => {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (auth.currentUser) {
      try {
        const token = await auth.currentUser.getIdToken();
        headers['Authorization'] = `Bearer ${token}`;
      } catch (e) {
        console.warn('Failed to fetch Firebase ID token:', e);
      }
    }
    let guestId = localStorage.getItem('krishna_guest_uid');
    if (!guestId) {
      guestId = 'guest_' + Math.random().toString(36).substring(2, 9);
      localStorage.setItem('krishna_guest_uid', guestId);
    }
    headers['x-guest-uid'] = guestId;
    return headers;
  };

  // Load user paths and progress from backend on mount
  useEffect(() => {
    const fetchUserPaths = async () => {
      try {
        const headers = await getAuthHeaders();
        const res = await fetch('/api/learn/paths', { headers });
        if (res.ok) {
          const data = await res.json();
          if (data.success && Array.isArray(data.paths)) {
            // Merge user paths with predefined courses without duplicates
            setAllCourses(prev => {
              const existingIds = new Set(prev.map(c => c.id));
              const newPaths = data.paths.filter((p: any) => !existingIds.has(p.courseId || p.id));
              const mapped = newPaths.map((p: any) => ({
                id: p.courseId || p.id,
                courseId: p.courseId || p.id,
                userId: p.userId,
                title: p.title,
                category: p.category || 'Custom Path',
                description: p.description,
                level: p.level,
                goal: p.goal,
                estimatedDuration: p.estimatedDuration,
                modules: p.modules || []
              }));
              return [...mapped, ...prev];
            });
          }

          if (data.progress) {
            const mappedProgress: Record<string, boolean> = {};
            for (const [key, val] of Object.entries(data.progress as any)) {
              if ((val as any).completed) {
                mappedProgress[`${(val as any).courseId}:${(val as any).lessonId}`] = true;
              }
            }
            setCompletedLessons(prev => ({ ...prev, ...mappedProgress }));
          }

          if (data.lastAccessed) {
            setLastActiveState({
              courseId: data.lastAccessed.courseId,
              moduleId: data.lastAccessed.moduleId,
              lessonId: data.lastAccessed.lessonId
            });
          }
        }
      } catch (err) {
        console.warn('Backend sync offline, using local state:', err);
      }
    };

    fetchUserPaths();
  }, [user]);

  // Derived Active Entities
  const selectedCourse = allCourses.find(c => (c.courseId || c.id) === selectedCourseId) || allCourses[0];
  const selectedModule = selectedCourse?.modules.find(m => (m.moduleId || m.id) === selectedModuleId) || selectedCourse?.modules[0];
  const selectedLesson = selectedModule?.lessons.find(l => (l.lessonId || l.id) === selectedLessonId) || selectedModule?.lessons[0];

  // Active Video Player State
  const [activePlayingVideo, setActivePlayingVideo] = useState<NormalizedVideo | null>(selectedLesson?.video || null);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [videoPlaybackProgress, setVideoPlaybackProgress] = useState(15);
  const [autoplayEnabled, setAutoplayEnabled] = useState(true);

  // Sync activePlayingVideo whenever selected lesson updates
  useEffect(() => {
    if (selectedLesson) {
      setActivePlayingVideo(selectedLesson.video || null);
      setIsVideoPlaying(false);
      setVideoPlaybackProgress(0);
    } else {
      setActivePlayingVideo(null);
    }
  }, [selectedLessonId, selectedCourseId, selectedModuleId]);

  // Audio chimes
  const [soundProfileEnabled, setSoundProfileEnabled] = useState(true);
  const playChime = (freq: number, type: OscillatorType = 'sine', duration: number = 0.08) => {
    if (!soundProfileEnabled) return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = type;
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      gain.gain.setValueAtTime(0.04, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch (_) {}
  };

  // Selection Handlers
  const handleSelectCourse = (courseId: string) => {
    const targetCourse = allCourses.find(c => (c.courseId || c.id) === courseId);
    if (!targetCourse) return;

    setSelectedCourseId(courseId);
    const firstModule = targetCourse.modules[0];
    if (firstModule) {
      const modId = firstModule.moduleId || firstModule.id;
      setSelectedModuleId(modId);
      const firstLesson = firstModule.lessons[0];
      if (firstLesson) {
        const lesId = firstLesson.lessonId || firstLesson.id;
        setSelectedLessonId(lesId);
        setActivePlayingVideo(firstLesson.video || null);
      } else {
        setSelectedLessonId('');
        setActivePlayingVideo(null);
      }
    } else {
      setSelectedModuleId('');
      setSelectedLessonId('');
      setActivePlayingVideo(null);
    }

    setIsVideoPlaying(false);
    setVideoPlaybackProgress(0);
    playChime(600, 'sine', 0.1);
  };

  const handleSelectModule = (moduleId: string) => {
    setSelectedModuleId(moduleId);
    const targetModule = selectedCourse?.modules.find(m => (m.moduleId || m.id) === moduleId);
    if (targetModule && targetModule.lessons.length > 0) {
      const firstLesson = targetModule.lessons[0];
      const lesId = firstLesson.lessonId || firstLesson.id;
      setSelectedLessonId(lesId);
      setActivePlayingVideo(firstLesson.video || null);
    } else {
      setSelectedLessonId('');
      setActivePlayingVideo(null);
    }
    setIsVideoPlaying(false);
    setVideoPlaybackProgress(0);
    playChime(420, 'sine', 0.05);
  };

  const handleSelectLesson = (lessonId: string) => {
    setSelectedLessonId(lessonId);
    const targetLesson = selectedModule?.lessons.find(l => (l.lessonId || l.id) === lessonId);
    if (targetLesson) {
      setActivePlayingVideo(targetLesson.video || null);
    } else {
      setActivePlayingVideo(null);
    }
    setIsVideoPlaying(false);
    setVideoPlaybackProgress(0);
    playChime(500, 'sine', 0.05);

    // Save last active state
    if (selectedCourse && selectedModule) {
      const lastState = {
        courseId: selectedCourse.courseId || selectedCourse.id,
        moduleId: selectedModule.moduleId || selectedModule.id,
        lessonId
      };
      setLastActiveState(lastState);
      try {
        localStorage.setItem('krishna_learn_last_active', JSON.stringify(lastState));
      } catch (_) {}
    }
  };

  // Toggle Lesson Completion Status
  const toggleLessonCompletion = async (courseId: string, lessonId: string) => {
    playChime(680, 'sine', 0.08);
    const key = `${courseId}:${lessonId}`;
    const nextVal = !completedLessons[key];

    setCompletedLessons(prev => {
      const next = { ...prev, [key]: nextVal };
      try {
        localStorage.setItem('krishna_learn_completed', JSON.stringify(next));
      } catch (_) {}
      return next;
    });

    // Sync progress to backend
    try {
      const headers = await getAuthHeaders();
      await fetch('/api/learn/progress', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          courseId,
          moduleId: selectedModuleId,
          lessonId,
          completed: nextVal,
          watchProgress: videoPlaybackProgress
        })
      });
    } catch (_) {}
  };

  // Calculate course progress percentage
  const calculateCourseProgress = (c: CourseData): number => {
    let total = 0;
    let done = 0;
    const cid = c.courseId || c.id;

    c.modules.forEach(m => {
      m.lessons.forEach(l => {
        total++;
        const lid = l.lessonId || l.id;
        if (completedLessons[`${cid}:${lid}`]) {
          done++;
        }
      });
    });

    return total > 0 ? Math.round((done / total) * 100) : 0;
  };

  const overallProgress = selectedCourse ? calculateCourseProgress(selectedCourse) : 0;

  // Handle Course Creation Flow with Step-by-Step Loading
  const handleInitiateCourseCreation = async (targetTopic: string) => {
    if (!targetTopic || !targetTopic.trim()) return;
    const cleanTopic = targetTopic.trim();

    // 1. Ambiguous topic validation check
    const lower = cleanTopic.toLowerCase();
    if (AMBIGUOUS_TOPICS[lower]) {
      setAmbiguousModalTopic({
        topic: cleanTopic,
        options: AMBIGUOUS_TOPICS[lower]
      });
      return;
    }

    // 2. Duplicate course check
    const existing = allCourses.find(c => 
      c.title.toLowerCase() === lower || 
      c.title.toLowerCase().includes(lower) ||
      (c.courseId || c.id).toLowerCase() === lower
    );

    if (existing) {
      setDuplicatePromptCourse(existing);
      return;
    }

    await generateCoursePath(cleanTopic);
  };

  const generateCoursePath = async (topicName: string) => {
    setDuplicatePromptCourse(null);
    setAmbiguousModalTopic(null);
    setIsGeneratingPath(true);
    setGenerationStep(0);
    setGenerationError(null);
    playChime(520, 'triangle', 0.15);

    // Step-by-step loading animation timers
    const timer1 = setTimeout(() => setGenerationStep(1), 1000);
    const timer2 = setTimeout(() => setGenerationStep(2), 2200);
    const timer3 = setTimeout(() => setGenerationStep(3), 3400);
    const timer4 = setTimeout(() => setGenerationStep(4), 4500);

    try {
      const headers = await getAuthHeaders();
      const response = await fetch('/api/learn/generate', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          topic: topicName,
          level: skillLevel,
          goal: learningGoal,
          dailyTime,
          language: preferredLanguage
        })
      });

      const data = await response.json();
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(timer4);

      if (response.ok && data.success && data.course) {
        const newCourse: CourseData = {
          id: data.course.courseId || data.course.id,
          courseId: data.course.courseId || data.course.id,
          userId: data.course.userId,
          title: data.course.title,
          category: data.course.category || 'AI Custom Path',
          description: data.course.description,
          level: data.course.level,
          goal: data.course.goal,
          estimatedDuration: data.course.estimatedDuration,
          modules: data.course.modules || []
        };

        setAllCourses(prev => [newCourse, ...prev]);
        handleSelectCourse(newCourse.id);
        playChime(1100, 'sine', 0.25);
        setLearningMode('classroom');
      } else {
        throw new Error(data.error || 'Krishna could not create this learning path. Please try again.');
      }
    } catch (err: any) {
      console.warn('Backend API course generation error, executing client failsafe:', err);
      // Client Failsafe Generator with Validated Schema
      const generatedId = `custom-${Date.now()}`;
      const verifiedVid = videoProviderService.getVerifiedVideoForLesson(generatedId, topicName);

      const fallbackCourse: CourseData = {
        id: generatedId,
        courseId: generatedId,
        userId: user?.uid || 'guest',
        title: topicName,
        category: 'Custom Learning Matrix',
        description: `Personalized learning path synthesized for ${topicName}.`,
        level: skillLevel,
        goal: learningGoal,
        estimatedDuration: '4 weeks',
        modules: [
          {
            id: `${generatedId}-mod-1`,
            moduleId: `${generatedId}-mod-1`,
            courseId: generatedId,
            title: `Phase 1: ${topicName} Core Fundamentals`,
            timeframe: 'Weeks 1-2',
            description: `Understand foundational building blocks and core principles of ${topicName}.`,
            skillsAcquired: [topicName, 'Core Architecture'],
            lessons: [
              {
                id: `${generatedId}-les-1-1`,
                lessonId: `${generatedId}-les-1-1`,
                courseId: generatedId,
                moduleId: `${generatedId}-mod-1`,
                title: `Introduction to ${topicName}`,
                duration: '30 mins',
                description: `Comprehensive introduction and environment setup for ${topicName}.`,
                video: verifiedVid,
                resources: [
                  { title: `${topicName} Official Documentation`, url: 'https://developer.mozilla.org', type: 'doc', description: 'Primary developer documentation & guidelines.' }
                ],
                practice: [
                  {
                    question: `What is the key advantage of learning ${topicName}?`,
                    options: ['Modular system execution', 'Manual memory management', 'Static hardware locking', 'Browser cache flush'],
                    correctIndex: 0,
                    rationale: `${topicName} provides modular execution and high productivity.`
                  }
                ]
              },
              {
                id: `${generatedId}-les-1-2`,
                lessonId: `${generatedId}-les-1-2`,
                courseId: generatedId,
                moduleId: `${generatedId}-mod-1`,
                title: `Hands-on ${topicName} Implementation`,
                duration: '45 mins',
                description: `Building practical scripts and exercises with ${topicName}.`,
                video: null, // Test missing video fallback
                resources: [
                  { title: `${topicName} Best Practices Guide`, url: 'https://github.com', type: 'github' }
                ],
                practice: [
                  {
                    question: `Which command initializes a clean environment for ${topicName}?`,
                    options: ['Standard package manager init', 'Direct kernel panic', 'Raw memory dump', 'System reboot'],
                    correctIndex: 0,
                    rationale: 'Package managers handle clean initialization of dependencies.'
                  }
                ]
              }
            ]
          }
        ]
      };

      setAllCourses(prev => [fallbackCourse, ...prev]);
      handleSelectCourse(fallbackCourse.id);
      playChime(880, 'triangle', 0.15);
      setLearningMode('classroom');
    } finally {
      setIsGeneratingPath(false);
      setGenerationStep(0);
    }
  };

  // Sub-Agent Assistant States
  const [activeAssistantAgent, setActiveAssistantAgent] = useState<'notes' | 'quiz' | 'chat'>('notes');
  const [notesAgentContent, setNotesAgentContent] = useState<string>('');
  const [gptChatInput, setGptChatInput] = useState('');
  const [chatLog, setChatLog] = useState<Array<{ role: 'user' | 'assistant'; agentName: string; text: string }>>([
    { role: 'assistant', agentName: 'Krishna Tutor', text: 'Initiating learning telemetry. Ask any question about this lesson!' }
  ]);
  const [isAskingGroq, setIsAskingGroq] = useState(false);
  const [workspaceNotes, setWorkspaceNotes] = useState('// Active session notes & personal code snippets appear here.\n');

  // Quiz Answer Verification States
  const [activeQuizIndex, setActiveQuizIndex] = useState(0);
  const [selectedQuizAnswer, setSelectedQuizAnswer] = useState<number | null>(null);
  const [quizSubmitted, setQuizSubmitted] = useState(false);

  // Sync lesson summary notes when selected lesson changes
  useEffect(() => {
    if (selectedLesson) {
      if (selectedLesson.video) {
        setNotesAgentContent(`--- LESSON ADVISORY: ${selectedLesson.title} ---
COURSE BREADCRUMB: ${selectedCourse?.title} → ${selectedModule?.title} → ${selectedLesson.title}
VERIFIED VIDEO: ${selectedLesson.video.title} (${selectedLesson.video.channelName})

KEY CONCEPTS:
• Comprehensive orientation and computational logic for ${selectedLesson.title}.
• Verified video content matched specifically to this lesson topic.
• Recommended hands-on implementation in your local dev workspace.`);
      } else {
        setNotesAgentContent(`--- VIDEO NOT AVAILABLE FOR THIS LESSON YET ---
BREADCRUMB: ${selectedCourse?.title} → ${selectedModule?.title} → ${selectedLesson.title}

STATUS: Video not configured for this specific lesson topic yet.
• Complete the lesson notes and resources provided below.
• Practice with the concept verification question to test your knowledge.`);
      }
    }
  }, [selectedLessonId, selectedCourseId, selectedModuleId]);

  // Handle Tutor Chat
  const handleAskTutor = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!gptChatInput.trim() || isAskingGroq) return;

    const userText = gptChatInput.trim();
    setGptChatInput('');
    setChatLog(prev => [{ role: 'user', agentName: 'You', text: userText }, ...prev]);
    setIsAskingGroq(true);
    playChime(420, 'sine', 0.05);

    try {
      const promptText = `Active Course: "${selectedCourse?.title}"
Active Module: "${selectedModule?.title}"
Active Lesson: "${selectedLesson?.title}"
User Query: "${userText}"

Act as Krishna AI Educational Tutor. Answer the user's doubt clearly, providing compact code examples if applicable.`;

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [{ role: 'user', content: promptText }],
          systemInstruction: 'You are Krishna AI Educational Tutor.'
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to connect to Krishna AI Tutor.');
      setChatLog(prev => [{ role: 'assistant', agentName: 'Krishna AI Tutor', text: data.text || 'No response.' }, ...prev]);
      playChime(880, 'triangle', 0.1);
    } catch (err: any) {
      setChatLog(prev => [{ role: 'assistant', agentName: 'Krishna Failsafe', text: `[Tutor Error]: ${err.message || 'Unable to contact neural tutor.'}` }, ...prev]);
    } finally {
      setIsAskingGroq(false);
    }
  };

  // Filter courses for search
  const filteredCourses = searchQuery.trim()
    ? allCourses.filter(c => 
        c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.description.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : allCourses;

  return (
    <div className="max-w-7xl mx-auto pb-16 space-y-8 select-none font-sans" id="krishna-learn-root">
      
      {/* Top Banner / Heading section */}
      <div className="flex flex-col md:flex-row items-start md:items-end justify-between border-b border-[#00E5FF]/10 pb-6 gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="h-2 w-2 rounded-full bg-[#00E5FF] animate-pulse"></span>
            <span className="text-[10px] font-mono tracking-widest text-[#00E5FF] uppercase">Autonomous Educational OS & AI Mentor</span>
          </div>
          <h1 className="text-3xl font-light tracking-wide text-white flex items-center gap-2">
            Krishna <span className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#00E5FF] to-blue-400">Learn</span>
          </h1>
          <p className="text-xs text-gray-500 font-mono mt-0.5">ADAPTIVE_USER_SELECTED_LEARNING_SYSTEM_v4.0</p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => {
              setSoundProfileEnabled(!soundProfileEnabled);
              playChime(880, 'sine', 0.1);
            }}
            className={cn(
              "px-3 py-1.5 text-[9px] font-mono font-bold tracking-wider uppercase border rounded-lg transition-all flex items-center gap-1.5 cursor-pointer",
              soundProfileEnabled 
                ? "bg-cyan-500/10 border-cyan-500/30 text-[#00E5FF]" 
                : "bg-white/5 border-white/10 text-gray-400"
            )}
          >
            {soundProfileEnabled ? <Volume2 className="w-3 h-3 text-[#00E5FF]" /> : <VolumeX className="w-3 h-3 text-gray-500" />}
            {soundProfileEnabled ? "AUDIO ON" : "MUTED"}
          </button>

          <button
            onClick={() => {
              setLearningMode(learningMode === 'discovery' ? 'classroom' : 'discovery');
              playChime(400, 'triangle', 0.1);
            }}
            className="px-3.5 py-1.5 bg-gradient-to-r from-cyan-950 to-blue-950 hover:from-cyan-900 border border-cyan-500/30 rounded-lg text-xs font-mono uppercase tracking-wider text-cyan-300 flex items-center gap-1.5 cursor-pointer"
          >
            {learningMode === 'discovery' ? (
              <><BookOpen size={13} /> Enter Classroom</>
            ) : (
              <><Search size={13} /> Course Discovery & Search</>
            )}
          </button>
        </div>
      </div>

      {/* VIEW 1: COURSE DISCOVERY & TOPIC SELECTION */}
      {learningMode === 'discovery' && (
        <div className="space-y-8 animate-fadeIn">
          
          {/* HERO ADAPTIVE TOPIC INPUT BOX */}
          <div className="glass-panel p-6 sm:p-8 bg-gradient-to-b from-[#020714] via-[#040D24] to-[#01040D] border-cyan-500/25 relative overflow-hidden space-y-6">
            <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full filter blur-3xl pointer-events-none -mr-20 -mt-20"></div>

            <div className="max-w-2xl space-y-2">
              <span className="text-[10px] font-mono text-[#00E5FF] uppercase font-bold tracking-widest px-2.5 py-1 bg-cyan-950/60 border border-cyan-500/30 rounded-full inline-flex items-center gap-1.5">
                <Sparkles size={11} className="animate-spin" /> ADAPTIVE ROADMAP ENGINE
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-wide leading-tight">
                What do you want to learn today?
              </h2>
              <p className="text-xs text-gray-400 font-sans leading-relaxed">
                Enter any technical topic — Python Full Stack, Generative AI, C++, System Design, Docker, DevOps, SQL, Cybersecurity, or custom engineering fields. Krishna AI will synthesize a complete roadmap.
              </p>
            </div>

            {/* Input & Create Button */}
            <div className="space-y-4 max-w-3xl">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <input
                    type="text"
                    id="input-custom-topic"
                    value={topicInput}
                    onChange={(e) => setTopicInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleInitiateCourseCreation(topicInput);
                    }}
                    placeholder="Enter any topic e.g. Generative AI, Python Full Stack, System Design..."
                    className="w-full bg-black/60 border border-cyan-500/30 focus:border-[#00E5FF] rounded-xl px-4 py-3.5 text-sm text-white outline-none font-sans placeholder-gray-500 shadow-inner"
                  />
                  {topicInput && (
                    <button
                      onClick={() => setTopicInput('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white"
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>

                <button
                  onClick={() => handleInitiateCourseCreation(topicInput)}
                  disabled={isGeneratingPath || !topicInput.trim()}
                  id="btn-create-learning-path"
                  className="px-6 py-3.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 border border-cyan-400 rounded-xl text-xs font-mono font-bold tracking-widest uppercase text-black transition-all transform active:scale-[0.98] shadow-[0_0_20px_rgba(0,229,255,0.3)] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Plus size={16} />
                  <span>CREATE LEARNING PATH</span>
                </button>
              </div>

              {/* Optional Config Toggle */}
              <div className="flex items-center justify-between pt-1">
                <button
                  onClick={() => setShowConfigPanel(!showConfigPanel)}
                  className="text-[11px] font-mono text-cyan-400 hover:text-white flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Sliders size={12} />
                  <span>{showConfigPanel ? "Hide Preferences" : "Optional Configuration (Level, Goal, Language)"}</span>
                </button>
                <span className="text-[9px] font-mono text-gray-500">Inputs are unconstrained. Any legitimate topic works.</span>
              </div>

              {/* Collapsible Optional Configuration Panel */}
              <AnimatePresence>
                {showConfigPanel && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-4 bg-black/40 border border-white/10 rounded-xl overflow-hidden text-xs font-mono"
                  >
                    <div>
                      <label className="text-[9px] text-gray-400 uppercase block mb-1">Experience Level</label>
                      <select
                        value={skillLevel}
                        onChange={(e) => setSkillLevel(e.target.value as any)}
                        className="w-full bg-black border border-white/10 rounded-lg p-2 text-white outline-none cursor-pointer"
                      >
                        <option value="Beginner">Beginner</option>
                        <option value="Intermediate">Intermediate</option>
                        <option value="Advanced">Advanced</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-[9px] text-gray-400 uppercase block mb-1">Learning Goal</label>
                      <select
                        value={learningGoal}
                        onChange={(e) => setLearningGoal(e.target.value)}
                        className="w-full bg-black border border-white/10 rounded-lg p-2 text-white outline-none cursor-pointer"
                      >
                        <option value="Job preparation">Job preparation</option>
                        <option value="College/exam preparation">College/exam preparation</option>
                        <option value="Interview preparation">Interview preparation</option>
                        <option value="Project development">Project development</option>
                        <option value="Certification">Certification</option>
                        <option value="General knowledge">General knowledge</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-[9px] text-gray-400 uppercase block mb-1">Daily Study Time</label>
                      <select
                        value={dailyTime}
                        onChange={(e) => setDailyTime(e.target.value)}
                        className="w-full bg-black border border-white/10 rounded-lg p-2 text-white outline-none cursor-pointer"
                      >
                        <option value="30 minutes">30 minutes</option>
                        <option value="1 hour">1 hour</option>
                        <option value="2 hours">2 hours</option>
                        <option value="3+ hours">3+ hours</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-[9px] text-gray-400 uppercase block mb-1">Preferred Language</label>
                      <select
                        value={preferredLanguage}
                        onChange={(e) => setPreferredLanguage(e.target.value)}
                        className="w-full bg-black border border-white/10 rounded-lg p-2 text-white outline-none cursor-pointer"
                      >
                        <option value="English">English</option>
                        <option value="Telugu">Telugu</option>
                        <option value="Hindi">Hindi</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* STEP-BY-STEP GENERATION LOADING OVERLAY */}
            {isGeneratingPath && (
              <div className="p-6 bg-black/80 border border-cyan-500/40 rounded-xl space-y-4 animate-pulse">
                <div className="flex items-center justify-between text-xs font-mono text-cyan-400">
                  <span className="flex items-center gap-2 font-bold">
                    <RefreshCw size={14} className="animate-spin text-cyan-400" />
                    GENERATING PERSONALIZED ROADMAP: "{topicInput}"
                  </span>
                  <span>STEP {generationStep + 1} OF 5</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-5 gap-2 text-[10px] font-mono">
                  {generationStepLabels.map((stepLabel, idx) => (
                    <div
                      key={stepLabel}
                      className={cn(
                        "p-2.5 rounded-lg border text-center transition-all flex flex-col justify-center gap-1",
                        idx === generationStep && "bg-cyan-500/20 border-cyan-400 text-white font-bold animate-bounce",
                        idx < generationStep && "bg-emerald-950/30 border-emerald-500/30 text-emerald-400",
                        idx > generationStep && "bg-black/40 border-white/5 text-gray-600"
                      )}
                    >
                      <span>0{idx + 1}</span>
                      <span>{stepLabel}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>

          {/* CONTINUE LEARNING HERO SECTION */}
          {lastActiveState && selectedCourse && (
            <div className="glass-panel p-5 bg-gradient-to-r from-purple-950/20 via-black to-cyan-950/20 border-purple-500/20 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="space-y-1">
                <span className="text-[9px] font-mono px-2 py-0.5 bg-purple-500/20 text-purple-300 border border-purple-500/30 rounded uppercase font-bold tracking-widest">
                  CONTINUE LEARNING
                </span>
                <h3 className="text-base font-bold text-white tracking-wide">
                  {selectedCourse.title}
                </h3>
                <p className="text-xs text-gray-400 font-mono">
                  Last active: <strong className="text-cyan-300">{selectedModule?.title || 'Phase 1'}</strong> → <strong className="text-white">{selectedLesson?.title || 'Lesson 1'}</strong>
                </p>
              </div>

              <button
                onClick={() => {
                  handleSelectCourse(lastActiveState.courseId);
                  setLearningMode('classroom');
                }}
                className="px-5 py-2.5 bg-purple-600 hover:bg-purple-500 border border-purple-400 text-xs font-mono font-bold uppercase tracking-wider text-white rounded-xl shadow-lg transition-all flex items-center gap-2 cursor-pointer"
              >
                <Play size={14} fill="currentColor" />
                <span>RESUME LESSON</span>
              </button>
            </div>
          )}

          {/* MY LEARNING PATHS SECTION */}
          <div className="space-y-4">
            <div className="flex justify-between items-center border-b border-white/5 pb-2">
              <h3 className="text-sm font-mono font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <FolderPlus size={16} className="text-[#00E5FF]" />
                MY LEARNING PATHS
              </h3>
              <span className="text-xs font-mono text-gray-500">
                {allCourses.filter(c => c.userId !== 'system').length} User-Created Paths
              </span>
            </div>

            {allCourses.filter(c => c.userId !== 'system').length === 0 ? (
              <div className="p-6 rounded-xl border border-white/5 bg-black/40 text-center text-xs font-mono text-gray-500 space-y-1">
                <p>No user-created custom learning paths yet.</p>
                <p className="text-[10px] text-gray-600">Enter any topic above to synthesize a personalized AI roadmap!</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {allCourses.filter(c => c.userId !== 'system').map(c => {
                  const progress = calculateCourseProgress(c);
                  return (
                    <div
                      key={c.id}
                      onClick={() => {
                        handleSelectCourse(c.id);
                        setLearningMode('classroom');
                      }}
                      className="glass-panel p-4 bg-black/50 border-cyan-500/20 hover:border-cyan-400 transition-all cursor-pointer space-y-3 group hover:scale-[1.01]"
                    >
                      <div className="flex justify-between items-start">
                        <span className="text-[9px] font-mono px-2 py-0.5 bg-cyan-950 text-cyan-400 border border-cyan-500/30 rounded uppercase font-bold">
                          {c.level || 'Custom'}
                        </span>
                        <span className="text-[10px] font-mono text-[#00FF9D] font-bold">{progress}% Progress</span>
                      </div>

                      <div>
                        <h4 className="text-sm font-bold text-white group-hover:text-cyan-300 transition-colors line-clamp-1">{c.title}</h4>
                        <p className="text-xs text-gray-400 line-clamp-2 mt-1">{c.description}</p>
                      </div>

                      <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                        <div className="bg-[#00FF9D] h-1.5 transition-all duration-300" style={{ width: `${progress}%` }}></div>
                      </div>

                      <div className="flex justify-between items-center text-[9px] font-mono text-gray-500 pt-1">
                        <span>{c.modules.length} Modules</span>
                        <span className="text-cyan-400 group-hover:underline flex items-center gap-1">Open Course <ChevronRight size={10} /></span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* POPULAR TOPICS & PREDEFINED PRESETS */}
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-white/5 pb-2 gap-2">
              <h3 className="text-sm font-mono font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <BookOpen size={16} className="text-cyan-400" />
                POPULAR TOPICS & PREDEFINED COURSES
              </h3>

              <div className="relative w-full sm:w-64">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search paths..."
                  className="w-full bg-black/40 border border-white/10 focus:border-cyan-400 rounded-lg px-3 py-1.5 text-xs text-white outline-none pl-8 font-sans"
                />
                <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-500" />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredCourses.map((c) => {
                const progress = calculateCourseProgress(c);
                const isSelected = (c.courseId || c.id) === selectedCourseId;

                return (
                  <div
                    key={c.id}
                    onClick={() => {
                      handleSelectCourse(c.id);
                      setLearningMode('classroom');
                    }}
                    className={cn(
                      "glass-panel p-4 transition-all cursor-pointer space-y-3 group hover:scale-[1.01]",
                      isSelected 
                        ? "bg-cyan-500/10 border-cyan-500/40" 
                        : "bg-black/40 border-white/5 hover:border-white/20"
                    )}
                  >
                    <div className="flex justify-between items-start">
                      <span className="text-[9px] font-mono text-gray-500 uppercase">{c.category}</span>
                      <span className="text-[9px] font-mono text-[#00FF9D] font-bold">{progress}%</span>
                    </div>

                    <div>
                      <h4 className="text-sm font-bold text-white group-hover:text-cyan-300 transition-colors line-clamp-1">{c.title}</h4>
                      <p className="text-xs text-gray-400 line-clamp-2 mt-1">{c.description}</p>
                    </div>

                    <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-[#00FF9D] h-1.5 transition-all duration-300" style={{ width: `${progress}%` }}></div>
                    </div>

                    <div className="flex justify-between items-center text-[9px] font-mono text-gray-500 pt-1">
                      <span>{c.modules.length} Modules</span>
                      <span className="text-cyan-400 group-hover:underline flex items-center gap-1">Open Course <ChevronRight size={10} /></span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      )}

      {/* VIEW 2: CLASSROOM VIEW */}
      {learningMode === 'classroom' && selectedCourse && (
        <div className="space-y-6 animate-fadeIn">
          
          {/* Top Course Switcher Bar */}
          <div className="glass-panel p-3 bg-black/60 border-white/10 flex flex-wrap items-center gap-2">
            <span className="text-[10px] font-mono text-gray-500 uppercase tracking-widest px-2 font-bold">COURSES:</span>
            {allCourses.map((course) => {
              const cid = course.courseId || course.id;
              const isSelected = cid === selectedCourseId;
              return (
                <button
                  key={cid}
                  onClick={() => handleSelectCourse(cid)}
                  className={cn(
                    "px-3 py-1.5 rounded-lg text-xs font-mono tracking-wide transition-all cursor-pointer border flex items-center gap-2",
                    isSelected 
                      ? "bg-cyan-500/15 border-cyan-500/40 text-cyan-300 font-bold shadow-[0_0_12px_rgba(0,229,255,0.2)]" 
                      : "bg-white/[0.02] border-white/5 text-gray-400 hover:text-white hover:border-white/20"
                  )}
                >
                  <BookOpen size={12} className={isSelected ? "text-cyan-400" : "text-gray-500"} />
                  <span>{course.title}</span>
                </button>
              );
            })}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* LEFT: Modules & Lessons Checklist (Span 5) */}
            <div className="lg:col-span-5 space-y-6">
              
              {/* Course & Progress Header */}
              <div className="glass-panel p-4 bg-[#03070E] border-cyan-500/20 space-y-2">
                <span className="text-[8px] font-mono px-2 py-0.5 bg-cyan-950/40 border border-[#00E5FF]/20 rounded text-[#00E5FF] uppercase font-bold">
                  ACTIVE COURSE
                </span>
                <h2 className="text-base font-extrabold text-white tracking-wide">{selectedCourse.title}</h2>
                <p className="text-xs text-gray-400">{selectedCourse.description}</p>

                {/* Progress Bar */}
                <div className="space-y-1 pt-2">
                  <div className="flex justify-between text-[9px] font-mono text-gray-400">
                    <span>COURSE COMPLETION</span>
                    <span className="text-[#00FF9D] font-bold">{overallProgress}%</span>
                  </div>
                  <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-[#00FF9D] h-1.5 transition-all duration-300" style={{ width: `${overallProgress}%` }}></div>
                  </div>
                </div>
              </div>

              {/* Modules List */}
              <div className="glass-panel p-4 space-y-3">
                <h3 className="text-xs font-mono font-bold tracking-widest text-[#00E5FF] uppercase border-b border-white/5 pb-2">
                  COURSE MODULES
                </h3>

                <div className="space-y-2">
                  {selectedCourse.modules.map((module) => {
                    const mid = module.moduleId || module.id;
                    const isSelected = mid === selectedModuleId;
                    const totalLessons = module.lessons.length;
                    const completedCount = module.lessons.filter(l => completedLessons[`${selectedCourse.id}:${l.lessonId || l.id}`]).length;

                    return (
                      <div
                        key={mid}
                        onClick={() => handleSelectModule(mid)}
                        className={cn(
                          "p-3 rounded-xl border text-left cursor-pointer transition-all hover:bg-white/[0.04] relative group",
                          isSelected 
                            ? "bg-cyan-500/5 border-cyan-500/30" 
                            : "bg-black/30 border-white/5"
                        )}
                      >
                        {isSelected && (
                          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-3/5 bg-[#00E5FF] rounded-r"></div>
                        )}
                        
                        <div className="flex justify-between items-start">
                          <span className="text-[9px] font-mono text-gray-500 uppercase">{module.timeframe}</span>
                          <span className="text-[9px] font-mono text-[#00FF9D] font-bold">
                            {completedCount}/{totalLessons} completed
                          </span>
                        </div>

                        <h4 className="text-xs font-bold text-white mt-1 group-hover:text-cyan-400 transition-colors line-clamp-1">
                          {module.title}
                        </h4>
                        
                        <p className="text-[10px] text-gray-400 mt-1 line-clamp-1">{module.description}</p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Lessons List */}
              {selectedModule && (
                <div className="glass-panel p-5 bg-[#010307] border-white/5 space-y-4">
                  <div className="flex justify-between items-start pb-2 border-b border-white/5">
                    <div>
                      <h3 className="text-xs font-extrabold text-white flex items-center gap-1.5 uppercase tracking-wide">
                        <Target size={13} className="text-cyan-400" /> Module Lessons
                      </h3>
                      <p className="text-[10px] text-gray-500 mt-0.5">{selectedModule.title}</p>
                    </div>
                  </div>

                  <div className="space-y-2 max-h-72 overflow-y-auto scrollbar-thin">
                    {selectedModule.lessons.map((lesson) => {
                      const lid = lesson.lessonId || lesson.id;
                      const isSelected = lid === selectedLessonId;
                      const isCompleted = !!completedLessons[`${selectedCourse.id}:${lid}`];
                      const hasVideo = lesson.video !== null;

                      return (
                        <div
                          key={lid}
                          onClick={() => handleSelectLesson(lid)}
                          className={cn(
                            "p-3 rounded-xl border flex items-center justify-between text-left transition-all cursor-pointer relative",
                            isSelected 
                              ? "bg-cyan-500/10 border-cyan-500/40 text-white" 
                              : isCompleted 
                                ? "bg-[#00FF9D]/5 border-[#00FF9D]/20 text-gray-300"
                                : "bg-white/[0.02] border-white/5 text-gray-300 hover:border-white/20"
                          )}
                        >
                          <div className="flex items-center gap-2.5 min-w-0 flex-1">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleLessonCompletion(selectedCourse.id, lid);
                              }}
                              className={cn(
                                "w-4 h-4 rounded border flex items-center justify-center transition-all flex-shrink-0 cursor-pointer",
                                isCompleted 
                                  ? "border-[#00FF9D] bg-[#00FF9D]/20" 
                                  : "border-white/20 hover:border-[#00E5FF]"
                              )}
                            >
                              {isCompleted && <CheckCircle2 className="w-3 h-3 text-[#00FF9D]" />}
                            </button>
                            <div className="min-w-0 flex-1">
                              <span className={cn(
                                "text-xs font-medium block truncate",
                                isCompleted && "line-through text-gray-500",
                                isSelected && "text-cyan-300 font-bold"
                              )}>
                                {lesson.title}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                            {hasVideo ? (
                              <span className="text-[8px] font-mono bg-cyan-950 text-cyan-400 border border-cyan-500/30 px-1.5 py-0.5 rounded flex items-center gap-1">
                                <Video size={10} /> VIDEO
                              </span>
                            ) : (
                              <span className="text-[8px] font-mono bg-amber-950 text-amber-400 border border-amber-500/30 px-1.5 py-0.5 rounded">
                                NO VIDEO
                              </span>
                            )}
                            <span className="text-[9px] font-mono text-gray-500">{lesson.duration}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

            </div>

            {/* RIGHT: Video Player / Video Not Configured Display (Span 7) */}
            <div className="lg:col-span-7 space-y-6">

              {/* Breadcrumb HUD */}
              <div className="glass-panel p-3 bg-black/80 border-cyan-500/20 flex items-center justify-between text-xs font-mono">
                <div className="flex items-center gap-2 overflow-hidden truncate">
                  <span className="text-cyan-400 font-bold">{selectedCourse.title}</span>
                  <ChevronRight size={12} className="text-gray-500 flex-shrink-0" />
                  <span className="text-gray-300 truncate">{selectedModule?.title}</span>
                  <ChevronRight size={12} className="text-gray-500 flex-shrink-0" />
                  <span className="text-white font-bold truncate">{selectedLesson?.title}</span>
                </div>
              </div>

              {/* Video Player Container */}
              <div key={selectedLesson?.id || 'player'} className="glass-panel p-4 bg-black/70 border-[#00E5FF]/10 space-y-4">
                
                {selectedLesson && activePlayingVideo ? (
                  <>
                    <div className="flex items-start justify-between gap-2 border-b border-white/5 pb-2">
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse"></span>
                          <span className="text-[9px] font-mono text-gray-500 uppercase tracking-widest">{activePlayingVideo.channelName}</span>
                        </div>
                        <h3 className="text-xs font-bold text-white tracking-wide mt-1 line-clamp-1" title={activePlayingVideo.title}>
                          {activePlayingVideo.title}
                        </h3>
                      </div>

                      <span className="text-[8px] font-mono font-bold tracking-widest text-[#00FF9D] bg-[#00FF9D]/10 border border-[#00FF9D]/30 px-1.5 py-0.5 rounded flex-shrink-0 uppercase">
                        VERIFIED LESSON VIDEO
                      </span>
                    </div>

                    <div className="relative aspect-video w-full rounded-xl overflow-hidden bg-[#02050D] border border-white/5 flex flex-col justify-between p-3">
                      <iframe
                        className="absolute inset-0 w-full h-full border-none opacity-95 z-0"
                        src={`https://www.youtube.com/embed/${activePlayingVideo.videoId}?autoplay=${isVideoPlaying ? 1 : 0}&mute=${isVideoPlaying ? 1 : 0}&enablejsapi=1`}
                        title="Krishna Lesson Video Stream"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />

                      {!isVideoPlaying && (
                        <div className="relative z-20 mx-auto my-auto flex flex-col items-center gap-2">
                          <button
                            onClick={() => setIsVideoPlaying(true)}
                            className="w-14 h-14 rounded-full bg-cyan-700/40 hover:bg-[#00E5FF] border border-cyan-400 flex items-center justify-center transition-all cursor-pointer backdrop-blur-sm shadow-[0_0_20px_rgba(0,229,255,0.4)]"
                          >
                            <Play size={24} className="text-white translate-x-0.5 fill-white" />
                          </button>
                          <span className="bg-black/70 backdrop-blur-sm px-2.5 py-1 rounded text-[10px] font-mono text-gray-300">Click to Play Lesson Video</span>
                        </div>
                      )}
                    </div>
                  </>
                ) : (
                  /* STRICT MISSING VIDEO DISPLAY (VIDEO_NOT_CONFIGURED) */
                  <div className="aspect-video w-full rounded-xl bg-[#030712] border border-amber-500/30 flex flex-col justify-center items-center p-6 text-center space-y-4">
                    <div className="p-3 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-full animate-pulse">
                      <AlertTriangle size={32} />
                    </div>
                    <div className="space-y-1 max-w-md">
                      <h4 className="text-base font-extrabold text-white tracking-wide">Video not available for this lesson yet.</h4>
                      <p className="text-xs text-amber-300/80 font-mono">
                        Krishna has not assigned an unverified video to this topic. Please utilize the structured lesson notes, documentation, and practice questions below.
                      </p>
                    </div>
                    <div className="text-[10px] font-mono text-gray-500">
                      Lesson: <strong className="text-gray-300">{selectedLesson?.title || 'Active Lesson'}</strong>
                    </div>
                  </div>
                )}

              </div>

              {/* LESSON RESOURCES & PRACTICE SUB-AGENT HUB */}
              <div className="glass-panel border-white/5">
                <div className="flex border-b border-white/5 bg-black/50 p-1 rounded-t-xl gap-1">
                  <button
                    onClick={() => setActiveAssistantAgent('notes')}
                    className={cn(
                      "flex-1 py-2 text-[10px] font-mono tracking-wider uppercase transition-all rounded-lg cursor-pointer flex items-center justify-center gap-1",
                      activeAssistantAgent === 'notes' ? "bg-cyan-500/10 text-[#00E5FF]" : "text-gray-400 hover:text-white"
                    )}
                  >
                    <FileText size={12} /> Notes & Resources
                  </button>
                  <button
                    onClick={() => setActiveAssistantAgent('quiz')}
                    className={cn(
                      "flex-1 py-2 text-[10px] font-mono tracking-wider uppercase transition-all rounded-lg cursor-pointer flex items-center justify-center gap-1",
                      activeAssistantAgent === 'quiz' ? "bg-[#00FF9D]/10 text-[#00FF5D]" : "text-gray-400 hover:text-white"
                    )}
                  >
                    <Brain size={12} /> Practice Questions
                  </button>
                  <button
                    onClick={() => setActiveAssistantAgent('chat')}
                    className={cn(
                      "flex-1 py-2 text-[10px] font-mono tracking-wider uppercase transition-all rounded-lg cursor-pointer flex items-center justify-center gap-1",
                      activeAssistantAgent === 'chat' ? "bg-purple-500/15 text-purple-400" : "text-gray-400 hover:text-white"
                    )}
                  >
                    <MessageSquare size={12} /> Live Doubt Solver
                  </button>
                </div>

                <div className="p-4 min-h-[200px] bg-black/40 relative">
                  {activeAssistantAgent === 'notes' && (
                    <div className="space-y-4 text-left animate-fadeIn">
                      <div className="text-xs text-gray-300 leading-relaxed bg-[#02050C] border border-white/5 p-3.5 rounded-xl whitespace-pre-wrap select-text max-h-56 overflow-y-auto scrollbar-thin">
                        {notesAgentContent}
                      </div>

                      {/* Documentation & Resources List */}
                      {selectedLesson?.resources && selectedLesson.resources.length > 0 && (
                        <div className="space-y-2 pt-2 border-t border-white/5">
                          <label className="text-[10px] font-mono text-cyan-400 uppercase font-bold block">Documentation & Resources</label>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {selectedLesson.resources.map((res, idx) => (
                              <a
                                key={idx}
                                href={res.url}
                                target="_blank"
                                rel="noreferrer"
                                className="p-2.5 rounded-lg border border-white/10 bg-black/50 hover:border-cyan-400 text-xs flex items-center justify-between text-gray-300 hover:text-white transition-all no-underline"
                              >
                                <span className="font-bold truncate">{res.title}</span>
                                <Globe size={12} className="text-cyan-400 flex-shrink-0 ml-2" />
                              </a>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {activeAssistantAgent === 'quiz' && (
                    <div className="space-y-4 text-left animate-fadeIn">
                      {selectedLesson?.practice && selectedLesson.practice.length > 0 ? (
                        <div className="bg-[#02050E] border border-white/5 p-4 rounded-xl space-y-3">
                          <h4 className="text-xs font-bold leading-normal text-white">
                            {selectedLesson.practice[0].question}
                          </h4>

                          <div className="space-y-2">
                            {selectedLesson.practice[0].options.map((opt, idx) => (
                              <div
                                key={idx}
                                onClick={() => {
                                  if (quizSubmitted) return;
                                  setSelectedQuizAnswer(idx);
                                }}
                                className={cn(
                                  "p-2.5 rounded-lg border text-xs cursor-pointer transition-all",
                                  selectedQuizAnswer === idx ? "border-[#00FF9D] bg-[#00FF9D]/5 text-white" : "bg-black/40 border-white/5 text-gray-300",
                                  quizSubmitted && idx === selectedLesson.practice![0].correctIndex && "border-[#00FF9D] bg-emerald-950/30 text-[#00FF9D]"
                                )}
                              >
                                <span className="font-mono text-[9px] mr-2 text-gray-500">{String.fromCharCode(65 + idx)}.</span>
                                {opt}
                              </div>
                            ))}
                          </div>

                          {!quizSubmitted ? (
                            <button
                              onClick={() => {
                                if (selectedQuizAnswer === null) return;
                                setQuizSubmitted(true);
                                playChime(selectedQuizAnswer === selectedLesson.practice![0].correctIndex ? 1100 : 400);
                              }}
                              disabled={selectedQuizAnswer === null}
                              className="w-full py-2 bg-[#00FF9D]/15 hover:bg-[#00FF9D]/25 border border-[#00FF9D]/40 text-[#00FF5D] text-xs font-mono rounded-lg cursor-pointer disabled:opacity-40"
                            >
                              Verify Answer
                            </button>
                          ) : (
                            <div className="p-3 bg-white/5 rounded-lg text-[11px] text-gray-300 font-sans leading-relaxed border border-white/10">
                              <strong className={selectedQuizAnswer === selectedLesson.practice![0].correctIndex ? "text-[#00FF9D] block mb-1" : "text-red-400 block mb-1"}>
                                {selectedQuizAnswer === selectedLesson.practice![0].correctIndex ? "✓ Verification Passed" : "✗ Incorrect Option"}
                              </strong>
                              {selectedLesson.practice[0].rationale}
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="p-6 text-center text-xs font-mono text-gray-500">
                          No practice questions generated for this lesson yet.
                        </div>
                      )}
                    </div>
                  )}

                  {activeAssistantAgent === 'chat' && (
                    <div className="space-y-3 text-left flex flex-col justify-between h-56 animate-fadeIn">
                      <div className="flex-1 overflow-y-auto space-y-2 p-2 bg-[#020409] border border-white/5 rounded-xl max-h-36 scrollbar-thin flex flex-col-reverse">
                        {chatLog.map((log, idx) => (
                          <div
                            key={idx}
                            className={cn(
                              "p-2.5 rounded-lg text-xs leading-normal",
                              log.role === 'user' ? "bg-purple-950/30 border border-purple-500/20 text-purple-200 self-end ml-4" : "bg-white/[0.02] border border-white/5 text-gray-300 self-start mr-4"
                            )}
                          >
                            <span className="text-[9px] font-mono uppercase block text-gray-500 mb-0.5">{log.agentName}</span>
                            {log.text}
                          </div>
                        ))}
                      </div>

                      <form onSubmit={handleAskTutor} className="flex gap-2">
                        <input
                          type="text"
                          value={gptChatInput}
                          onChange={(e) => setGptChatInput(e.target.value)}
                          placeholder="Ask a question about this lesson..."
                          className="flex-1 bg-black/40 border border-white/10 focus:border-purple-400 rounded-lg px-3 py-2 text-xs text-white outline-none font-sans"
                        />
                        <button
                          type="submit"
                          disabled={isAskingGroq || !gptChatInput.trim()}
                          className="bg-purple-600 hover:bg-purple-500 text-white text-xs font-mono font-bold px-3 py-2 rounded-lg cursor-pointer disabled:opacity-40"
                        >
                          {isAskingGroq ? "Asking..." : "Send"}
                        </button>
                      </form>
                    </div>
                  )}
                </div>
              </div>

            </div>

          </div>
        </div>
      )}

      {/* AMBIGUOUS TOPIC CLARIFICATION MODAL */}
      <AnimatePresence>
        {ambiguousModalTopic && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4"
          >
            <div className="bg-[#030712] border border-cyan-500/40 rounded-2xl p-6 max-w-md w-full space-y-4 text-left shadow-2xl">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-[9px] font-mono text-cyan-400 uppercase font-bold tracking-wider">TOPIC CLARIFICATION</span>
                  <h3 className="text-lg font-bold text-white mt-1">Which path do you want for "{ambiguousModalTopic.topic}"?</h3>
                </div>
                <button onClick={() => setAmbiguousModalTopic(null)} className="text-gray-500 hover:text-white">
                  <X size={16} />
                </button>
              </div>

              <p className="text-xs text-gray-400">
                "{ambiguousModalTopic.topic}" is a broad learning domain. Choose your target specialization to generate a tailored roadmap:
              </p>

              <div className="space-y-2">
                {ambiguousModalTopic.options.map((opt) => (
                  <button
                    key={opt}
                    onClick={() => {
                      setAmbiguousModalTopic(null);
                      setTopicInput(opt);
                      generateCoursePath(opt);
                    }}
                    className="w-full p-3 rounded-xl bg-black/60 border border-white/10 hover:border-cyan-400 text-left text-xs font-bold text-white hover:text-cyan-300 transition-all flex items-center justify-between cursor-pointer group"
                  >
                    <span>{opt}</span>
                    <ChevronRight size={14} className="text-gray-500 group-hover:text-cyan-400" />
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* DUPLICATE COURSE PROMPT MODAL */}
      <AnimatePresence>
        {duplicatePromptCourse && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4"
          >
            <div className="bg-[#030712] border border-amber-500/40 rounded-2xl p-6 max-w-md w-full space-y-4 text-left shadow-2xl">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-amber-500/10 border border-amber-500/30 text-amber-400 rounded-full">
                  <AlertTriangle size={20} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Existing Learning Path Found</h3>
                  <p className="text-xs text-gray-400">You already have access to "{duplicatePromptCourse.title}".</p>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => {
                    handleSelectCourse(duplicatePromptCourse.id);
                    setDuplicatePromptCourse(null);
                    setLearningMode('classroom');
                  }}
                  className="flex-1 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-mono font-bold rounded-xl cursor-pointer"
                >
                  OPEN EXISTING PATH
                </button>
                <button
                  onClick={() => {
                    const customName = `${topicInput} (Custom Path)`;
                    setDuplicatePromptCourse(null);
                    generateCoursePath(customName);
                  }}
                  className="flex-1 py-2.5 bg-white/10 hover:bg-white/20 border border-white/10 text-gray-300 text-xs font-mono font-bold rounded-xl cursor-pointer"
                >
                  CREATE CUSTOM PATH
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
