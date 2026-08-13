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
  Volume1,
  ShieldAlert,
  Gauge
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import { youtubeService } from '../services/youtubeService';

// Interfaces for Course-Specific Video Mapping Architecture
export interface VideoData {
  provider: 'youtube';
  videoId: string;
  title: string;
  channelName: string;
  duration: string;
  qualityScore: number;
  views: string;
  likes: string;
  tags: string[];
  agentRecommended?: boolean;
}

export interface LessonData {
  id: string; // e.g., "python-functions"
  courseId: string; // e.g., "python"
  moduleId: string; // e.g., "python-basics"
  title: string; // e.g., "Python Functions & Scope"
  duration: string; // e.g., "22:15"
  video: VideoData | null; // null when video is not configured
  description?: string;
  isCustomPatched?: boolean;
}

export interface ModuleData {
  id: string; // e.g., "python-basics"
  courseId: string; // e.g., "python"
  title: string; // e.g., "Phase 1: Core Syntax & Logic"
  timeframe: string; // e.g., "Weeks 1-2"
  description: string;
  lessons: LessonData[];
  skillsAcquired: string[];
}

export interface CourseData {
  id: string; // e.g., "python", "java", "javascript", "react", "machine-learning", "data-science"
  title: string;
  category: string;
  description: string;
  modules: ModuleData[];
}

// Curated Course-Specific Video Mapping Data
const INITIAL_COURSES: CourseData[] = [
  {
    id: 'python',
    title: 'Python Programming',
    category: 'Backend & Core Systems',
    description: 'Master Python syntax, functions, object-oriented concepts, and computational algorithms.',
    modules: [
      {
        id: 'python-basics',
        courseId: 'python',
        title: 'Phase 1: Python Basics & Core Syntax',
        timeframe: 'Weeks 1-2',
        description: 'Understand variables, control flow, functions, and fundamental data structures in Python.',
        skillsAcquired: ['Python Syntax', 'Functions & Scope', 'Control Flow'],
        lessons: [
          {
            id: 'python-intro',
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
            }
          },
          {
            id: 'python-functions',
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
              agentRecommended: false
            }
          },
          {
            id: 'python-modules',
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
        courseId: 'python',
        title: 'Phase 2: Object-Oriented Python',
        timeframe: 'Weeks 3-4',
        description: 'Implement robust classes, encapsulated properties, inheritance, and magic methods.',
        skillsAcquired: ['OOP Concepts', 'Classes & Objects', 'Inheritance'],
        lessons: [
          {
            id: 'python-classes',
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
          },
          {
            id: 'python-inheritance',
            courseId: 'python',
            moduleId: 'python-oop-mod',
            title: 'Advanced Inheritance & Polymorphism',
            duration: '25:10',
            description: 'Subclassing, super() calls, and abstract base classes in Python.',
            video: null
          }
        ]
      },
      {
        id: 'python-dsa-mod',
        courseId: 'python',
        title: 'Phase 3: Data Structures & Algorithms',
        timeframe: 'Weeks 5-6',
        description: 'Explore lists, trees, Big O notation, and algorithm optimization in Python.',
        skillsAcquired: ['DSA', 'Algorithms', 'Big O Notation'],
        lessons: [
          {
            id: 'python-dsa-basics',
            courseId: 'python',
            moduleId: 'python-dsa-mod',
            title: 'Data Structures and Algorithms in Python',
            duration: '29:05',
            description: 'Understand array manipulation, hash maps, queues, and complexity analysis.',
            video: {
              provider: 'youtube',
              videoId: 'bum_19lojMU',
              title: 'Data Structures and Algorithms in Python',
              channelName: 'CS Dojo',
              duration: '29:05',
              qualityScore: 94,
              views: '3.1M views',
              likes: '190K likes',
              tags: ['DSA', 'Algorithms', 'Big O'],
              agentRecommended: true
            }
          }
        ]
      }
    ]
  },
  {
    id: 'java',
    title: 'Java Development',
    category: 'Enterprise Software',
    description: 'Master Java architecture, JVM internals, object-oriented principles, and thread concurrency.',
    modules: [
      {
        id: 'java-fundamentals',
        courseId: 'java',
        title: 'Phase 1: Java Core Fundamentals',
        timeframe: 'Weeks 1-2',
        description: 'Learn static typing, compilation, methods, arrays, and control structures in Java.',
        skillsAcquired: ['Java Syntax', 'JVM Architecture', 'Data Types'],
        lessons: [
          {
            id: 'java-intro',
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
          },
          {
            id: 'java-methods',
            courseId: 'java',
            moduleId: 'java-fundamentals',
            title: 'Java Methods & Parameter Passing',
            duration: '20:15',
            description: 'Static vs instance methods, pass-by-value semantics, and overloading in Java.',
            video: null
          }
        ]
      },
      {
        id: 'java-oop',
        courseId: 'java',
        title: 'Phase 2: Java Object-Oriented Design',
        timeframe: 'Weeks 3-4',
        description: 'Master encapsulation, abstraction, interfaces, and design patterns in Java.',
        skillsAcquired: ['Java OOP', 'Interfaces', 'Polymorphism'],
        lessons: [
          {
            id: 'java-classes',
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
          },
          {
            id: 'java-polymorphism',
            courseId: 'java',
            moduleId: 'java-oop',
            title: 'Polymorphism & Abstract Classes in Java',
            duration: '28:00',
            description: 'Method overriding, dynamic dispatch, and interface contracts in Java.',
            video: null
          }
        ]
      },
      {
        id: 'java-collections',
        courseId: 'java',
        title: 'Phase 3: Java Collections Framework',
        timeframe: 'Weeks 5-6',
        description: 'Master List, Set, Map, Queue implementations, Iterators, and Stream API.',
        skillsAcquired: ['Java Collections', 'Streams API', 'Generics'],
        lessons: [
          {
            id: 'java-collections-intro',
            courseId: 'java',
            moduleId: 'java-collections',
            title: 'Java Collections Framework Complete Masterclass',
            duration: '1:15:00',
            description: 'Explore ArrayList, LinkedList, HashMap, HashSet, and complexity comparison.',
            video: {
              provider: 'youtube',
              videoId: '9v44lAum180',
              title: 'Java Collections Tutorial',
              channelName: 'Amigoscode',
              duration: '1:15:00',
              qualityScore: 95,
              views: '950K views',
              likes: '45K likes',
              tags: ['Java', 'Collections', 'Data Structures'],
              agentRecommended: true
            }
          }
        ]
      }
    ]
  },
  {
    id: 'javascript',
    title: 'JavaScript Modern Masterclass',
    category: 'Web Development',
    description: 'Master asynchronous JS, ES6+ standards, event loops, DOM manipulation, and functional patterns.',
    modules: [
      {
        id: 'js-foundations',
        courseId: 'javascript',
        title: 'Phase 1: JavaScript Foundations',
        timeframe: 'Weeks 1-2',
        description: 'Understand JS execution context, variables (let/const), functions, and scope.',
        skillsAcquired: ['JS Syntax', 'Scope & Closures', 'DOM Basics'],
        lessons: [
          {
            id: 'js-intro',
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
          },
          {
            id: 'js-functions',
            courseId: 'javascript',
            moduleId: 'js-foundations',
            title: 'JavaScript Higher Order Functions & Scope',
            duration: '32:10',
            description: 'Function expressions, arrow functions, callbacks, and lexical scoping.',
            video: {
              provider: 'youtube',
              videoId: 'g1TC4jh5vD0',
              title: 'JavaScript Higher Order Functions & Arrays',
              channelName: 'Traversy Media',
              duration: '32:10',
              qualityScore: 96,
              views: '1.4M views',
              likes: '72K likes',
              tags: ['JavaScript', 'Functions', 'Callbacks'],
              agentRecommended: false
            }
          }
        ]
      },
      {
        id: 'js-async',
        courseId: 'javascript',
        title: 'Phase 2: Asynchronous JavaScript & Promises',
        timeframe: 'Weeks 3-4',
        description: 'Master non-blocking I/O, event loop mechanics, Promises, and async/await syntax.',
        skillsAcquired: ['Async JS', 'Promises', 'Event Loop'],
        lessons: [
          {
            id: 'js-promises',
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
          },
          {
            id: 'js-event-loop',
            courseId: 'javascript',
            moduleId: 'js-async',
            title: 'What the heck is the event loop anyway?',
            duration: '26:24',
            description: 'Deep dive into call stack, web APIs, task queue, and microtask execution.',
            video: {
              provider: 'youtube',
              videoId: '8aGhZQkoFbQ',
              title: 'What the heck is the event loop anyway?',
              channelName: 'JSConf',
              duration: '26:24',
              qualityScore: 99,
              views: '3.8M views',
              likes: '190K likes',
              tags: ['Event Loop', 'Execution Context', 'Concurrency'],
              agentRecommended: false
            }
          }
        ]
      },
      {
        id: 'js-es6',
        courseId: 'javascript',
        title: 'Phase 3: Modern ES6+ Features',
        timeframe: 'Weeks 5-6',
        description: 'Destructuring, spread/rest syntax, ES Modules, Classes, and Map/Set data structures.',
        skillsAcquired: ['ES6+', 'Modules', 'Functional JS'],
        lessons: [
          {
            id: 'js-es6-features',
            courseId: 'javascript',
            moduleId: 'js-es6',
            title: 'JavaScript ES6+ Modern Features Course',
            duration: '58:00',
            description: 'Master template literals, destructuring, modules, arrow functions, and promises.',
            video: {
              provider: 'youtube',
              videoId: 'NCwa_zjNoCI',
              title: 'JavaScript ES6+ Tutorial',
              channelName: 'Traversy Media',
              duration: '58:00',
              qualityScore: 95,
              views: '1.2M views',
              likes: '54K likes',
              tags: ['ES6', 'JavaScript', 'Modern Web'],
              agentRecommended: true
            }
          }
        ]
      }
    ]
  },
  {
    id: 'react',
    title: 'React & Next.js Architecture',
    category: 'Frontend Engineering',
    description: 'Build component-driven single-page applications, manage component state, and build server-rendered apps.',
    modules: [
      {
        id: 'react-fundamentals',
        courseId: 'react',
        title: 'Phase 1: React Fundamentals & JSX',
        timeframe: 'Weeks 1-2',
        description: 'Understand Virtual DOM, JSX syntax, component lifecycles, and prop passing.',
        skillsAcquired: ['React Fundamentals', 'JSX', 'Props & State'],
        lessons: [
          {
            id: 'react-intro',
            courseId: 'react',
            moduleId: 'react-fundamentals',
            title: 'React JS Full Course for Beginners (2026)',
            duration: '12:45:00',
            description: 'Learn React building blocks, functional components, state management, and props.',
            video: {
              provider: 'youtube',
              videoId: 'Ke90Tje7VS0',
              title: 'React JS Full Course for Beginners (2026)',
              channelName: 'freeCodeCamp.org',
              duration: '12:45:00',
              qualityScore: 98,
              views: '4.8M views',
              likes: '310K likes',
              tags: ['React', 'Web Dev', 'Vite'],
              agentRecommended: true
            }
          },
          {
            id: 'react-components',
            courseId: 'react',
            moduleId: 'react-fundamentals',
            title: 'Component Composition & Prop Validation',
            duration: '35:20',
            description: 'Designing reusable, modular components and passing child elements.',
            video: null
          }
        ]
      },
      {
        id: 'react-hooks-mod',
        courseId: 'react',
        title: 'Phase 2: React Hooks & State Management',
        timeframe: 'Weeks 3-4',
        description: 'Master useState, useEffect, useContext, useMemo, and custom hooks.',
        skillsAcquired: ['React Hooks', 'State Architecture', 'Side Effects'],
        lessons: [
          {
            id: 'react-hooks',
            courseId: 'react',
            moduleId: 'react-hooks-mod',
            title: 'React Hooks Explained in 100 Seconds',
            duration: '02:30',
            description: 'Clear walkthrough of core hooks: useState, useEffect, useRef, and useContext.',
            video: {
              provider: 'youtube',
              videoId: 'TNhaISOUy6g',
              title: 'React hooks explained in 100 seconds',
              channelName: 'Fireship',
              duration: '02:30',
              qualityScore: 95,
              views: '1.2M views',
              likes: '94K likes',
              tags: ['React Hooks', 'State', 'Effect'],
              agentRecommended: true
            }
          },
          {
            id: 'react-context',
            courseId: 'react',
            moduleId: 'react-hooks-mod',
            title: 'Global State Management with React Context API',
            duration: '40:15',
            description: 'Building custom providers, avoiding prop drilling, and optimizing context re-renders.',
            video: null
          }
        ]
      },
      {
        id: 'react-nextjs',
        courseId: 'react',
        title: 'Phase 3: Next.js & Full-Stack Frameworks',
        timeframe: 'Weeks 5-6',
        description: 'Server Components, App Router, Server Actions, and API Route handlers in Next.js.',
        skillsAcquired: ['Next.js App Router', 'SSR & SSG', 'Full-Stack React'],
        lessons: [
          {
            id: 'nextjs-app-router',
            courseId: 'react',
            moduleId: 'react-nextjs',
            title: 'Complete Next.js 15 App Router Tutorial',
            duration: '31:10',
            description: 'Master file-based routing, layout components, server side rendering, and data fetching.',
            video: {
              provider: 'youtube',
              videoId: 'V9D_g9Ilg3Y',
              title: 'Complete Next.js 15 App Router Tutorial',
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
    title: 'Machine Learning & Neural Architectures',
    category: 'AI & Intelligence',
    description: 'Explore neural network math, gradient descent calculus, backpropagation, and transformer attention.',
    modules: [
      {
        id: 'ml-neural-nets',
        courseId: 'machine-learning',
        title: 'Phase 1: Deep Learning & Neural Network Mathematics',
        timeframe: 'Weeks 1-2',
        description: 'Understand computational logic, activation functions, vectors, and loss functions.',
        skillsAcquired: ['Neural Networks', 'Gradient Calculus', 'Loss Minimization'],
        lessons: [
          {
            id: 'ml-nn-intro',
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
          },
          {
            id: 'ml-gradient-descent',
            courseId: 'machine-learning',
            moduleId: 'ml-neural-nets',
            title: 'Gradient descent, how neural networks learn | Chapter 2',
            duration: '21:05',
            description: 'Mathematical breakdown of loss functions and stepping down parameter gradients.',
            video: {
              provider: 'youtube',
              videoId: 'IHZwWFHWa-w',
              title: 'Gradient descent, how neural networks learn | Chapter 2',
              channelName: '3Blue1Brown',
              duration: '21:05',
              qualityScore: 96,
              views: '8.4M views',
              likes: '510K likes',
              tags: ['Gradient Descent', 'Backpropagation', 'Math'],
              agentRecommended: false
            }
          },
          {
            id: 'ml-backprop',
            courseId: 'machine-learning',
            moduleId: 'ml-neural-nets',
            title: 'What is backpropagation really doing? | Chapter 3',
            duration: '18:40',
            description: 'Chain rule calculus for backward parameter weight updates across network layers.',
            video: {
              provider: 'youtube',
              videoId: 'Ilg3gGewQ5U',
              title: 'What is backpropagation really doing? | Chapter 3',
              channelName: '3Blue1Brown',
              duration: '18:40',
              qualityScore: 95,
              views: '5.2M views',
              likes: '320K likes',
              tags: ['Backpropagation', 'Chain Rule', 'Calculus'],
              agentRecommended: false
            }
          }
        ]
      },
      {
        id: 'ml-llms',
        courseId: 'machine-learning',
        title: 'Phase 2: Large Language Models & Transformers',
        timeframe: 'Weeks 3-4',
        description: 'Understand multi-head self-attention, tokenization, positional embeddings, and KV caching.',
        skillsAcquired: ['LLMs', 'Transformer Architecture', 'Self-Attention'],
        lessons: [
          {
            id: 'ml-llm-intro',
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
          },
          {
            id: 'ml-transformer-arch',
            courseId: 'machine-learning',
            moduleId: 'ml-llms',
            title: 'Transformer Architecture Explained - Step by Step',
            duration: '28:12',
            description: 'Deep visual explanation of Query, Key, Value vectors and attention matrices.',
            video: {
              provider: 'youtube',
              videoId: 'wjZofJX0v4M',
              title: 'Transformer Architecture Explained - Step by Step',
              channelName: '3Blue1Brown',
              duration: '28:12',
              qualityScore: 97,
              views: '2.5M views',
              likes: '180K likes',
              tags: ['Transformers', 'Attention', 'Neural Network'],
              agentRecommended: false
            }
          }
        ]
      }
    ]
  },
  {
    id: 'data-science',
    title: 'Data Science & Analytical Computing',
    category: 'Data & Analytics',
    description: 'Learn data analysis, statistical modeling, data cleaning with Pandas, and visualization.',
    modules: [
      {
        id: 'ds-foundations',
        courseId: 'data-science',
        title: 'Phase 1: Data Science Foundations',
        timeframe: 'Weeks 1-2',
        description: 'Introduction to data analysis workflows, exploratory data analysis, and Python tools.',
        skillsAcquired: ['Data Analysis', 'Python for DS', 'Statistics'],
        lessons: [
          {
            id: 'ds-intro',
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
      },
      {
        id: 'ds-pandas',
        courseId: 'data-science',
        title: 'Phase 2: Data Wrangling with Pandas & NumPy',
        timeframe: 'Weeks 3-4',
        description: 'Manipulate tabular datasets, perform aggregations, handle missing values, and query data.',
        skillsAcquired: ['Pandas', 'NumPy', 'Data Cleaning'],
        lessons: [
          {
            id: 'ds-pandas-numpy',
            courseId: 'data-science',
            moduleId: 'ds-pandas',
            title: 'Pandas & NumPy Complete Masterclass',
            duration: '1:05:00',
            description: 'Master DataFrames, Series, vectorized indexing, filtering, and data aggregation.',
            video: {
              provider: 'youtube',
              videoId: 'vmEHCJofslg',
              title: 'Pandas & NumPy Complete Tutorial',
              channelName: 'Keith Galli',
              duration: '1:05:00',
              qualityScore: 96,
              views: '1.6M views',
              likes: '82K likes',
              tags: ['Pandas', 'NumPy', 'Data Cleaning'],
              agentRecommended: true
            }
          }
        ]
      },
      {
        id: 'ds-visualization',
        courseId: 'data-science',
        title: 'Phase 3: Data Visualization & Insights',
        timeframe: 'Weeks 5-6',
        description: 'Create informative plots, charts, and interactive dashboards using Matplotlib and Seaborn.',
        skillsAcquired: ['Data Visualization', 'Matplotlib', 'Seaborn'],
        lessons: [
          {
            id: 'ds-viz-intro',
            courseId: 'data-science',
            moduleId: 'ds-visualization',
            title: 'Data Visualization with Python',
            duration: '2:15:00',
            description: 'Master bar charts, scatter plots, heatmaps, and distribution plots in Python.',
            video: {
              provider: 'youtube',
              videoId: 'UO98lXi3QYA',
              title: 'Data Visualization with Python',
              channelName: 'freeCodeCamp.org',
              duration: '2:15:00',
              qualityScore: 95,
              views: '880K views',
              likes: '41K likes',
              tags: ['Data Visualization', 'Matplotlib', 'Seaborn'],
              agentRecommended: true
            }
          }
        ]
      }
    ]
  }
];

export default function KrishnaLearn() {
  // General view tabs: 'setup' | 'classroom'
  const [learningMode, setLearningMode] = useState<'setup' | 'classroom'>('setup');
  
  // Courses Data & Navigation States
  const [allCourses, setAllCourses] = useState<CourseData[]>(INITIAL_COURSES);
  const [selectedCourseId, setSelectedCourseId] = useState<string>('python');
  const [selectedModuleId, setSelectedModuleId] = useState<string>('python-basics');
  const [selectedLessonId, setSelectedLessonId] = useState<string>('python-intro');

  // Progress Tracking State (Keyed by `${courseId}:${lessonId}`)
  const [completedLessons, setCompletedLessons] = useState<Record<string, boolean>>(() => {
    try {
      const saved = localStorage.getItem('krishna_learn_completed');
      return saved ? JSON.parse(saved) : {};
    } catch (_) {
      return {};
    }
  });

  // Derived Active Entities
  const selectedCourse = allCourses.find(c => c.id === selectedCourseId) || allCourses[0];
  const selectedModule = selectedCourse.modules.find(m => m.id === selectedModuleId) || selectedCourse.modules[0];
  const selectedLesson = selectedModule?.lessons.find(l => l.id === selectedLessonId) || selectedModule?.lessons[0];

  // Active Video Player State (must match selectedLesson.video)
  const [activePlayingVideo, setActivePlayingVideo] = useState<VideoData | null>(selectedLesson?.video || null);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [videoPlaybackProgress, setVideoPlaybackProgress] = useState(15);
  const [autoplayEnabled, setAutoplayEnabled] = useState(true);

  // Sync activePlayingVideo whenever selectedLesson updates
  useEffect(() => {
    if (selectedLesson) {
      setActivePlayingVideo(selectedLesson.video);
      setIsVideoPlaying(false);
      setVideoPlaybackProgress(0);
    } else {
      setActivePlayingVideo(null);
    }
  }, [selectedLessonId, selectedCourseId, selectedModuleId]);

  // Quiz states
  const [activeQuizIndex, setActiveQuizIndex] = useState(0);
  const [selectedQuizAnswer, setSelectedQuizAnswer] = useState<number | null>(null);
  const [quizScore, setQuizScore] = useState(0);
  const [quizSubmitted, setQuizSubmitted] = useState(false);

  // Setup form states
  const [topicInput, setTopicInput] = useState('Python Programming');
  const [skillLevel, setSkillLevel] = useState<'beginner' | 'intermediate' | 'advanced'>('intermediate');
  const [preferredLanguage, setPreferredLanguage] = useState('English');
  const [timeline, setTimeline] = useState('30 days');
  const [primaryGoal, setPrimaryGoal] = useState('Job preparation & building direct production agents');
  
  // Engine calculation indicators
  const [isSynthesizing, setIsSynthesizing] = useState(false);
  const [synthesisStatus, setSynthesisStatus] = useState('');
  const [soundProfileEnabled, setSoundProfileEnabled] = useState(true);

  // Applet Core Learning Stats
  const [studyStreak, setStudyStreak] = useState(12);
  const [totalMinutesLearned, setTotalMinutesLearned] = useState(380);

  // Robust YouTube service state variables
  const [ytServiceState, setYtServiceState] = useState(youtubeService.getTokenStatus());
  const [ytErrorLogs, setYtErrorLogs] = useState(youtubeService.getErrorLogs());
  const [customApiKey, setCustomApiKey] = useState('');
  const [simulatedTrafficScale, setSimulatedTrafficScale] = useState(1);
  const [ytActiveError, setYtActiveError] = useState<{ code: number; message: string; action: string } | null>(null);
  const [isYtFallbackActive, setIsYtFallbackActive] = useState(false);

  // Focus Mode Overlay toggle
  const [focusModeActive, setFocusModeActive] = useState(false);

  // Specialized Sub-Agent Conversation States
  const [activeAssistantAgent, setActiveAssistantAgent] = useState<'notes' | 'quiz' | 'adaptive' | 'chat'>('notes');
  const [notesAgentContent, setNotesAgentContent] = useState<string>('');
  const [gptChatInput, setGptChatInput] = useState('');
  const [chatLog, setChatLog] = useState<Array<{ role: 'user' | 'assistant'; agentName: string; text: string }>>([
    { role: 'assistant', agentName: 'Krishna Tutor', text: 'Initiating learning session telemetry. How may I explain this concept further?' }
  ]);
  const [isAskingGroq, setIsAskingGroq] = useState(false);

  // User notes custom text area
  const [workspaceNotes, setWorkspaceNotes] = useState('// Active session notes & personal key take-aways appear here.\n// Keep track of code concepts, design notes, or math formulas.\n');

  // Simulated Custom Interactive Quizzes based on active selections
  const [dynamicQuizzes, setDynamicQuizzes] = useState([
    {
      question: "Which optimizer leverages decaying gradients alongside adaptive moment variations?",
      options: [
        "Adam Optimizer (Adaptive Moment Estimation)",
        "Stochastic Gradient Descent (Classic SGD)",
        "Root Mean Squared Propagation (RMSprop)",
        "Adagrad L2 Regularized Descent"
      ],
      correctIndex: 0,
      rationale: "Adam takes both the first moment (average gradient) and second moment (uncentered variance) to iteratively adapt parameters."
    },
    {
      question: "How does sinusoidal positional encoding prevent token sequence overlap in deep transformers?",
      options: [
        "By multiplying sequence indices into randomized prime integers",
        "By injecting non-linear trigonometric indices uniquely mapped to wave frequencies",
        "By applying fully-connected static dropout layers onto the inputs",
        "By forcing absolute constraint limits at each sequence chunk step"
      ],
      correctIndex: 1,
      rationale: "Using different sin and cos frequencies allows the model to capture relative mathematical patterns and token distances cleanly."
    }
  ]);

  // Audio chimes for interactions
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

  // Handlers for Course / Module / Lesson selection logic
  const handleSelectCourse = (courseId: string) => {
    const targetCourse = allCourses.find(c => c.id === courseId);
    if (!targetCourse) return;

    setSelectedCourseId(courseId);
    setTopicInput(targetCourse.title);

    const firstModule = targetCourse.modules[0];
    if (firstModule) {
      setSelectedModuleId(firstModule.id);
      const firstLesson = firstModule.lessons[0];
      if (firstLesson) {
        setSelectedLessonId(firstLesson.id);
        setActivePlayingVideo(firstLesson.video);
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
    setYtActiveError(null);
    playChime(600, 'sine', 0.1);
  };

  const handleSelectModule = (moduleId: string) => {
    setSelectedModuleId(moduleId);
    const targetModule = selectedCourse?.modules.find(m => m.id === moduleId);
    if (targetModule && targetModule.lessons.length > 0) {
      const firstLesson = targetModule.lessons[0];
      setSelectedLessonId(firstLesson.id);
      setActivePlayingVideo(firstLesson.video);
    } else {
      setSelectedLessonId('');
      setActivePlayingVideo(null);
    }

    setIsVideoPlaying(false);
    setVideoPlaybackProgress(0);
    setYtActiveError(null);
    playChime(420, 'sine', 0.05);
  };

  const handleSelectLesson = (lessonId: string) => {
    setSelectedLessonId(lessonId);
    const targetLesson = selectedModule?.lessons.find(l => l.id === lessonId);
    if (targetLesson) {
      setActivePlayingVideo(targetLesson.video);
    } else {
      setActivePlayingVideo(null);
    }

    setIsVideoPlaying(false);
    setVideoPlaybackProgress(0);
    setYtActiveError(null);
    playChime(500, 'sine', 0.05);
  };

  // Toggle Lesson Completion status per (courseId, lessonId)
  const toggleLessonCompletion = (courseId: string, lessonId: string) => {
    playChime(680, 'sine', 0.08);
    const key = `${courseId}:${lessonId}`;
    setCompletedLessons(prev => {
      const next = { ...prev, [key]: !prev[key] };
      try {
        localStorage.setItem('krishna_learn_completed', JSON.stringify(next));
      } catch (_) {}
      return next;
    });
  };

  // Calculate Overall Progress for current selected course
  const calculateCourseProgress = () => {
    if (!selectedCourse) return 0;
    let totalLessons = 0;
    let completedCount = 0;

    selectedCourse.modules.forEach(m => {
      m.lessons.forEach(l => {
        totalLessons++;
        if (completedLessons[`${selectedCourse.id}:${l.id}`]) {
          completedCount++;
        }
      });
    });

    return totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;
  };

  const overallProgress = calculateCourseProgress();

  // Quota metrics
  const getQuotaVelocityMetrics = () => {
    if (isYtFallbackActive || ytServiceState.quotaUsed >= ytServiceState.maxQuota) {
      return { frequency: 0, velocity: 0, etaText: 'Infinite (Offline Stable)', severity: 'safe' };
    }
    const baseFrequency = isVideoPlaying ? 16 : 0.8;
    const frequency = baseFrequency * simulatedTrafficScale;
    const POINTS_PER_REQ = 10;
    const velocity = frequency * POINTS_PER_REQ;
    const remainingQuota = Math.max(0, ytServiceState.maxQuota - ytServiceState.quotaUsed);
    
    let etaText = 'Infinite';
    let severity = 'safe';

    if (velocity > 0) {
      const totalMinutesLeft = remainingQuota / velocity;
      if (totalMinutesLeft > 1440) {
        etaText = `> 24 hours`;
      } else if (totalMinutesLeft >= 60) {
        const hours = Math.floor(totalMinutesLeft / 60);
        const mins = Math.round(totalMinutesLeft % 60);
        etaText = `${hours}h ${mins}m est.`;
      } else {
        const totalSecondsLeft = Math.round(totalMinutesLeft * 60);
        const mins = Math.floor(totalSecondsLeft / 60);
        const secs = totalSecondsLeft % 60;
        etaText = `${mins}m ${secs}s est.`;
      }

      if (totalMinutesLeft < 15) severity = 'danger';
      else if (totalMinutesLeft < 60) severity = 'warning';
    }

    return { frequency, velocity, etaText, severity };
  };

  const velocityMetrics = getQuotaVelocityMetrics();

  // Subscribe to YouTube token & error state changes
  useEffect(() => {
    const unsubscribe = youtubeService.subscribe(() => {
      setYtServiceState(youtubeService.getTokenStatus());
      setYtErrorLogs(youtubeService.getErrorLogs());
    });
    return () => unsubscribe();
  }, []);

  // Update summary notes when active video changes
  useEffect(() => {
    if (activePlayingVideo) {
      setNotesAgentContent(`--- EXTRAPOLATION: ${activePlayingVideo.title} ---
LESSON BREADCRUMB: ${selectedCourse.title} → ${selectedModule.title} → ${selectedLesson?.title || ''}
CHANNEL CREDIBILITY: ${activePlayingVideo.qualityScore}% (Multi-Agent consensus index)

CORE HIGHLIGHTS:
• Establishes dimensional parameters for ${selectedLesson?.title || 'active topic'}.
• Direct code implementation matching course curriculum constraints.
• Applied concepts reinforce production system development.

RECOMMENDED EXPERIMENTATION:
Try implementing the code presented in this lesson directly inside your local development environment.`);
    } else {
      setNotesAgentContent(`--- NO VIDEO CONFIGURED FOR THIS LESSON ---
BREADCRUMB: ${selectedCourse.title} → ${selectedModule.title} → ${selectedLesson?.title || ''}

STATUS: Video not available for this lesson yet.
Note: You may proceed with the task checklist or select another lesson in this course.`);
    }
  }, [activePlayingVideo, selectedCourseId, selectedModuleId, selectedLessonId]);

  // Simulating playback progress
  useEffect(() => {
    if (!isVideoPlaying || !activePlayingVideo) return;
    const interval = setInterval(() => {
      const pointsToConsume = Math.max(1, Math.round(2 * simulatedTrafficScale));
      youtubeService.consumeQuota(pointsToConsume);

      setVideoPlaybackProgress(prev => {
        const next = prev + 1;
        if (next >= 100) {
          playChime(950, 'sine', 0.2);
          if (autoplayEnabled && selectedModule) {
            // Autoplay next lesson within the current module
            const currentIdx = selectedModule.lessons.findIndex(l => l.id === selectedLessonId);
            if (currentIdx !== -1 && currentIdx + 1 < selectedModule.lessons.length) {
              const nextLesson = selectedModule.lessons[currentIdx + 1];
              handleSelectLesson(nextLesson.id);
              setChatLog(prevLogs => [
                { role: 'assistant', agentName: 'Playmaster Bot', text: `Autoplaying next lesson in module: "${nextLesson.title}"` },
                ...prevLogs
              ]);
            } else {
              setIsVideoPlaying(false);
            }
          } else {
            setIsVideoPlaying(false);
          }
          return 0;
        }
        if (next % 10 === 0) {
          setTotalMinutesLearned(t => t + 1);
        }
        return next;
      });
    }, 1200);

    return () => clearInterval(interval);
  }, [isVideoPlaying, activePlayingVideo, autoplayEnabled, selectedModule, selectedLessonId, simulatedTrafficScale]);

  // Handler: Synthesize Customized AI Roadmap into Active Course
  const handleGenerateRoadmap = async () => {
    setIsSynthesizing(true);
    setSynthesisStatus('Initializing Core Syllabus Architect Agent...');
    playChime(520, 'triangle', 0.15);

    try {
      setTimeout(() => {
        setSynthesisStatus('Recommendation agent scoring high-quality educational resources...');
        playChime(640, 'triangle', 0.12);
      }, 1200);

      setTimeout(() => {
        setSynthesisStatus('Mapping course-specific modules and verified video nodes...');
        playChime(760, 'triangle', 0.12);
      }, 2400);

      const prompt = `Topic user wants to learn: "${topicInput}"
Current Experience Level: "${skillLevel}"
Preferred Language: "${preferredLanguage}"
Target Timeline: "${timeline}"
Ultimate Goal: "${primaryGoal}"

Act as the KRISHNA Learn Adaptive Education Agent. Formulate a structured course object.
Respond STRICTLY with valid JSON matching:
{
  "courseTitle": "${topicInput}",
  "modules": [
    {
      "id": "dyn-mod-1",
      "title": "Phase 1: Core Fundamentals",
      "timeframe": "Weeks 1-2",
      "description": "Foundational logic and basic building blocks",
      "skillsAcquired": ["Foundations", "Setup"],
      "lessons": [
        {
          "id": "dyn-les-1",
          "title": "Introduction & Environment Setup",
          "duration": "25 mins",
          "description": "Setting up workspace and understanding main concepts"
        }
      ]
    }
  ]
}`;

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [{ role: 'user', text: prompt }],
          systemInstruction: 'You are the core KRISHNA Learn Multimodal Syllabus Architect. Respond strictly in valid raw JSON.'
        })
      });

      const data = await response.json();
      if (response.ok && data.text) {
        const rawText = data.text.replace(/```json/g, '').replace(/```/g, '').trim();
        const parsed = JSON.parse(rawText);

        if (parsed.modules && parsed.modules.length > 0) {
          const generatedCourseId = `custom-${Date.now()}`;
          const newModules: ModuleData[] = parsed.modules.map((m: any, mIdx: number) => ({
            id: `${generatedCourseId}-mod-${mIdx + 1}`,
            courseId: generatedCourseId,
            title: m.title || `Phase ${mIdx + 1}: Module`,
            timeframe: m.timeframe || `Stage ${mIdx + 1}`,
            description: m.description || 'Custom generated study module',
            skillsAcquired: m.skillsAcquired || [topicInput],
            lessons: (m.lessons || []).map((l: any, lIdx: number) => ({
              id: `${generatedCourseId}-les-${mIdx + 1}-${lIdx + 1}`,
              courseId: generatedCourseId,
              moduleId: `${generatedCourseId}-mod-${mIdx + 1}`,
              title: l.title || `Lesson ${lIdx + 1}`,
              duration: l.duration || '30 mins',
              description: l.description || '',
              video: lIdx === 0 ? {
                provider: 'youtube',
                videoId: 'Ke90Tje7VS0', // Verified fallback tutorial for custom prompt
                title: `Masterclass: ${l.title || topicInput}`,
                channelName: 'KRISHNA AI Academy',
                duration: l.duration || '30:00',
                qualityScore: 98,
                views: '1M views',
                likes: '80K likes',
                tags: [topicInput, 'AI Curriculum'],
                agentRecommended: true
              } : null
            }))
          }));

          const newCourse: CourseData = {
            id: generatedCourseId,
            title: topicInput,
            category: 'AI Generated Curriculum',
            description: `Tailored curriculum generated for target goal: ${primaryGoal}`,
            modules: newModules
          };

          setAllCourses(prev => [newCourse, ...prev]);
          handleSelectCourse(generatedCourseId);
        }

        playChime(1100, 'sine', 0.25);
        setLearningMode('classroom');
      } else {
        throw new Error("Invalid API response format");
      }

    } catch (error) {
      console.warn("Using fallback client-side custom course generator:", error);
      const generatedCourseId = `custom-local-${Date.now()}`;
      const newCourse: CourseData = {
        id: generatedCourseId,
        title: topicInput,
        category: 'Custom Study Path',
        description: `Custom learning matrix for ${topicInput}`,
        modules: [
          {
            id: `${generatedCourseId}-m1`,
            courseId: generatedCourseId,
            title: `Stage 1: Core Fundamentals of ${topicInput}`,
            timeframe: 'Weeks 1-2',
            description: `Understand foundational building blocks and core principles of ${topicInput}.`,
            skillsAcquired: [topicInput, 'Core Logic'],
            lessons: [
              {
                id: `${generatedCourseId}-l1`,
                courseId: generatedCourseId,
                moduleId: `${generatedCourseId}-m1`,
                title: `${topicInput} – Primary Masterclass`,
                duration: '45 mins',
                description: `Comprehensive orientation and initial setup guide for ${topicInput}.`,
                video: {
                  provider: 'youtube',
                  videoId: '8DvywoWv6fI',
                  title: `${topicInput} Masterclass`,
                  channelName: 'freeCodeCamp.org',
                  duration: '45:00',
                  qualityScore: 98,
                  views: '2M views',
                  likes: '100K likes',
                  tags: [topicInput],
                  agentRecommended: true
                }
              },
              {
                id: `${generatedCourseId}-l2`,
                courseId: generatedCourseId,
                moduleId: `${generatedCourseId}-m1`,
                title: `${topicInput} – Hands-on Implementation`,
                duration: '30 mins',
                description: `Building your initial test scripts and practical exercises.`,
                video: null
              }
            ]
          }
        ]
      };

      setAllCourses(prev => [newCourse, ...prev]);
      handleSelectCourse(generatedCourseId);
      playChime(880, 'triangle', 0.15);
      setLearningMode('classroom');
    } finally {
      setIsSynthesizing(false);
      setSynthesisStatus('');
    }
  };

  // Handler: Interactive doubt assistant query (Groq-powered chat)
  const handleAskTutor = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!gptChatInput.trim() || isAskingGroq) return;

    const userMessageText = gptChatInput;
    setGptChatInput('');
    setChatLog(prev => [{ role: 'user', agentName: 'You (Operator)', text: userMessageText }, ...prev]);
    setIsAskingGroq(true);
    playChime(420, 'sine', 0.05);

    try {
      const promptText = `Active course: "${selectedCourse?.title}"
Active module: "${selectedModule?.title}"
Active lesson: "${selectedLesson?.title}"
User query: "${userMessageText}"

Act as the personal elite KRISHNA AI Educational Tutor. Solve the doubt clearly, providing compact examples if applicable. Keep the language direct, inspiring, and technically rigorous.`;

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [{ role: 'user', content: promptText }],
          systemInstruction: 'You are the personal elite KRISHNA AI Educational Tutor.'
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to connect to Krishna AI Tutor.');

      setChatLog(prev => [{ role: 'assistant', agentName: 'KRISHNA Tutor (Groq)', text: data.text || 'No response.' }, ...prev]);
      playChime(880, 'triangle', 0.1);
    } catch (err: any) {
      console.error('Tutor Chat Error:', err);
      setChatLog(prev => [{ role: 'assistant', agentName: 'KRISHNA Failsafe', text: `[Tutor Error]: ${err.message || 'Unable to contact neural tutor.'}` }, ...prev]);
    } finally {
      setIsAskingGroq(false);
    }
  };

  // Speed / Remediation loop trigger
  const adjustRoadmapSpeed = (adjustment: 'intensify' | 'remediate') => {
    playChime(580, 'triangle', 0.15);
    if (!selectedCourse || !selectedModule) return;

    if (adjustment === 'remediate') {
      const patchedLessonId = `remedial-${Date.now()}`;
      const newLesson: LessonData = {
        id: patchedLessonId,
        courseId: selectedCourse.id,
        moduleId: selectedModule.id,
        title: `🚨 Remedial Deep-Dive: Resolving Blockers in ${selectedModule.title}`,
        duration: '45 mins',
        description: 'Targeted remediation module to resolve concept friction.',
        video: null,
        isCustomPatched: true
      };

      setAllCourses(prevCourses => prevCourses.map(c => {
        if (c.id === selectedCourse.id) {
          return {
            ...c,
            modules: c.modules.map(m => {
              if (m.id === selectedModule.id) {
                return { ...m, lessons: [...m.lessons, newLesson] };
              }
              return m;
            })
          };
        }
        return c;
      }));

      setChatLog(prev => [
        { 
          role: 'assistant', 
          agentName: 'Syllabus Architect', 
          text: `Generated a targeted Remedial Lesson node inside "${selectedModule.title}" to reinforce core baseline concepts.` 
        },
        ...prev
      ]);
    } else {
      setChatLog(prev => [
        { 
          role: 'assistant', 
          agentName: 'Strategy Agent', 
          text: 'Accelerating target milestone velocity. Priority learning nodes highlighted.' 
        },
        ...prev
      ]);
    }
  };

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
          <p className="text-xs text-gray-500 font-mono mt-0.5">KRISHNA_OS / ADAPTIVE_LEARNING_MATRIX_v3.6</p>
        </div>

        {/* Global stats bar */}
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => {
              setSoundProfileEnabled(!soundProfileEnabled);
              playChime(880, 'sine', 0.1);
            }}
            id="btn-sound-toggle"
            className={cn(
              "px-3 py-1.5 text-[9px] font-mono font-bold tracking-wider uppercase border rounded-lg transition-all flex items-center gap-1.5 cursor-pointer",
              soundProfileEnabled 
                ? "bg-cyan-500/10 border-cyan-500/30 text-[#00E5FF]" 
                : "bg-white/5 border-white/10 text-gray-400"
            )}
            title="Toggle sound cues"
          >
            {soundProfileEnabled ? <Volume2 className="w-3 h-3 text-[#00E5FF]" /> : <VolumeX className="w-3 h-3 text-gray-500" />}
            {soundProfileEnabled ? "AUDIO ON" : "AUDIO MUTED"}
          </button>

          <div className="flex items-center gap-2 px-3 py-1.5 bg-black/40 border border-white/5 rounded-lg text-xs font-mono">
            <Flame className="w-4 h-4 text-orange-500 fill-orange-500 animate-pulse" />
            <span className="text-gray-400">Streak:</span>
            <span className="text-white font-bold">{studyStreak} days</span>
          </div>

          <div className="flex items-center gap-2 px-3 py-1.5 bg-black/40 border border-white/5 rounded-lg text-xs font-mono">
            <Clock className="w-4 h-4 text-[#00E5FF]" />
            <span className="text-gray-400">Studied:</span>
            <span className="text-white font-bold">{totalMinutesLearned} mins</span>
          </div>

          <button
            onClick={() => {
              setLearningMode(learningMode === 'setup' ? 'classroom' : 'setup');
              playChime(400, 'triangle', 0.1);
            }}
            id="btn-switch-mode"
            className="px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-[10px] font-mono uppercase tracking-wider text-gray-300"
          >
            {learningMode === 'setup' ? "Enter Classroom" : "Config Custom Topic"}
          </button>
        </div>
      </div>

      {/* VIEW 1: SETUP FORM */}
      {learningMode === 'setup' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start animate-fadeIn">
          
          <div className="lg:col-span-7 glass-panel p-6 border-cyan-500/15 relative overflow-hidden space-y-6">
            <div className="absolute top-0 right-0 w-48 h-48 bg-cyan-500/10 rounded-full filter blur-3xl pointer-events-none -mr-16 -mt-16"></div>

            <div className="space-y-1">
              <h2 className="text-lg font-bold tracking-wide text-white flex items-center gap-2">
                <Sliders className="text-[#00E5FF] w-5 h-5" />
                Adaptive Syllabus Setup Matrix
              </h2>
              <p className="text-xs text-gray-400">Configure parameters to synthesize a dynamic AI curriculum or choose an existing course below.</p>
            </div>

            {/* Quick Course Presets */}
            <div className="space-y-2 border-b border-white/5 pb-4">
              <label className="text-[10px] font-mono text-cyan-400 uppercase block font-bold">Select Preconfigured Krishna Course</label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {allCourses.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => {
                      handleSelectCourse(c.id);
                      setLearningMode('classroom');
                    }}
                    className={cn(
                      "p-3 rounded-xl border text-left cursor-pointer transition-all hover:scale-[1.02]",
                      selectedCourseId === c.id 
                        ? "bg-cyan-500/10 border-cyan-500/40 text-cyan-300" 
                        : "bg-black/40 border-white/5 text-gray-300 hover:border-white/20"
                    )}
                  >
                    <span className="text-[9px] font-mono text-gray-500 block uppercase">{c.category}</span>
                    <h4 className="text-xs font-bold text-white mt-0.5 line-clamp-1">{c.title}</h4>
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-mono text-gray-500 uppercase block mb-1.5">Or Synthesize Custom Topic</label>
                <div className="relative">
                  <input
                    type="text"
                    id="input-learn-topic"
                    value={topicInput}
                    onChange={(e) => setTopicInput(e.target.value)}
                    className="w-full bg-black/40 border border-white/10 focus:border-[#00E5FF]/40 rounded-xl px-4 py-3 text-sm text-white outline-none font-sans"
                    placeholder="e.g. Quantum Computing, React Advanced Patterns, Rust Concurrency"
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center">
                    <Sparkles size={14} className="text-[#00E5FF] animate-pulse" />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-mono text-gray-500 uppercase block mb-1.5">Knowledge Level</label>
                  <div className="grid grid-cols-3 gap-2 bg-black/40 p-1 border border-white/10 rounded-xl">
                    {(['beginner', 'intermediate', 'advanced'] as const).map((lvl) => (
                      <button
                        key={lvl}
                        onClick={() => {
                          setSkillLevel(lvl);
                          playChime(580, 'sine', 0.05);
                        }}
                        className={cn(
                          "py-1.5 text-[10px] font-mono uppercase rounded-lg transition-all cursor-pointer",
                          skillLevel === lvl 
                            ? "bg-[#00E5FF]/10 text-[#00E5FF] border border-[#00E5FF]/30" 
                            : "text-gray-400 hover:text-white"
                        )}
                      >
                        {lvl}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-mono text-gray-500 uppercase block mb-1.5">Target Timeline</label>
                  <select
                    value={timeline}
                    onChange={(e) => setTimeline(e.target.value)}
                    className="w-full bg-black/40 border border-white/10 focus:border-[#00E5FF]/40 rounded-xl px-3 py-2 text-xs text-white outline-none cursor-pointer"
                  >
                    {['7 days (Crash course)', '30 days (Standard build)', '3 months (Professional core)', '6 months (Enterprise specialization)'].map((t) => (
                      <option key={t} value={t} className="bg-black text-white">{t}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="pt-2">
                <button
                  onClick={handleGenerateRoadmap}
                  disabled={isSynthesizing || !topicInput.trim()}
                  id="btn-forge-syllabus"
                  className="w-full py-4 bg-gradient-to-r from-cyan-950 via-blue-950 to-indigo-950 hover:bg-cyan-900 border border-cyan-500/40 hover:border-[#00E5FF] rounded-xl text-xs font-mono font-black tracking-widest uppercase text-cyan-400 hover:text-white transition-all duration-300 transform active:scale-[0.98] shadow-lg flex items-center justify-center gap-2.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSynthesizing ? (
                    <>
                      <RefreshCw size={14} className="animate-spin text-[#00E5FF]" />
                      <span>{synthesisStatus}</span>
                    </>
                  ) : (
                    <>
                      <Wand2 size={14} className="text-[#00E5FF]" />
                      <span>INITIALIZE SYLLABUS SYNTHESIS ENGINE</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 space-y-6">
            <div className="glass-panel p-5 bg-gradient-to-b from-[#02050E] to-[#04091C] border-white/5 space-y-4">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-cyan-500/10 rounded-lg text-cyan-400">
                  <Cpu size={16} />
                </div>
                <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-white">Course Video Architecture</h3>
              </div>

              <div className="space-y-2.5 pt-1 text-xs">
                <div className="flex items-start gap-2.5 text-gray-400">
                  <CheckCircle2 size={14} className="text-cyan-400 mt-0.5 flex-shrink-0" />
                  <span><strong className="text-white">Strict Course Hierarchy:</strong> Course → Module → Lesson → Verified Video.</span>
                </div>
                <div className="flex items-start gap-2.5 text-gray-400">
                  <CheckCircle2 size={14} className="text-cyan-400 mt-0.5 flex-shrink-0" />
                  <span><strong className="text-white">Zero Fallback Contamination:</strong> Lessons without videos display a clear unconfigured message instead of generic videos.</span>
                </div>
                <div className="flex items-start gap-2.5 text-gray-400">
                  <CheckCircle2 size={14} className="text-cyan-400 mt-0.5 flex-shrink-0" />
                  <span><strong className="text-white">Isolated Progress:</strong> Progress tracking maps directly to unique (courseId, lessonId) pairs.</span>
                </div>
              </div>
            </div>
          </div>

        </div>
      )}

      {/* VIEW 2: FULL CLASSROOM VIEW */}
      {learningMode === 'classroom' && selectedCourse && (
        <div className="space-y-6 animate-fadeIn">
          
          {/* Top Course Selection Bar */}
          <div className="glass-panel p-3 bg-black/60 border-white/10 flex flex-wrap items-center gap-2">
            <span className="text-[10px] font-mono text-gray-500 uppercase tracking-widest px-2 font-bold">COURSES:</span>
            {allCourses.map((course) => {
              const isSelected = course.id === selectedCourseId;
              return (
                <button
                  key={course.id}
                  onClick={() => handleSelectCourse(course.id)}
                  id={`course-btn-${course.id}`}
                  className={cn(
                    "px-3 py-1.5 rounded-lg text-xs font-mono tracking-wide transition-all cursor-pointer border flex items-center gap-2",
                    isSelected 
                      ? "bg-cyan-500/15 border-cyan-500/40 text-cyan-300 shadow-[0_0_12px_rgba(0,229,255,0.2)] font-bold" 
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

              {/* Modules Accordion / List */}
              <div className="glass-panel p-4 space-y-3">
                <h3 className="text-xs font-mono font-bold tracking-widest text-[#00E5FF] uppercase border-b border-white/5 pb-2">
                  COURSE MODULES
                </h3>

                <div className="space-y-2">
                  {selectedCourse.modules.map((module) => {
                    const isSelected = module.id === selectedModuleId;
                    const totalLessons = module.lessons.length;
                    const completedCount = module.lessons.filter(l => completedLessons[`${selectedCourse.id}:${l.id}`]).length;

                    return (
                      <div
                        key={module.id}
                        onClick={() => handleSelectModule(module.id)}
                        id={`module-select-${module.id}`}
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

              {/* Selected Module Lessons List */}
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

                  {/* List of Lessons */}
                  <div className="space-y-2 max-h-72 overflow-y-auto scrollbar-thin">
                    {selectedModule.lessons.map((lesson) => {
                      const isSelected = lesson.id === selectedLessonId;
                      const isCompleted = !!completedLessons[`${selectedCourse.id}:${lesson.id}`];
                      const hasVideo = lesson.video !== null;

                      return (
                        <div
                          key={lesson.id}
                          onClick={() => handleSelectLesson(lesson.id)}
                          id={`lesson-select-${lesson.id}`}
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
                                toggleLessonCompletion(selectedCourse.id, lesson.id);
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
                              <span className="text-[8px] font-mono bg-gray-900 text-gray-500 border border-white/10 px-1.5 py-0.5 rounded">
                                NO VIDEO
                              </span>
                            )}
                            <span className="text-[9px] font-mono text-gray-500">{lesson.duration}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Remedial / Fast-track buttons */}
                  <div className="flex gap-2 pt-2 border-t border-white/5 text-xs font-mono">
                    <button
                      onClick={() => adjustRoadmapSpeed('remediate')}
                      className="flex-1 py-2 bg-red-500/10 hover:bg-red-500/15 border border-red-500/20 hover:border-red-500/40 text-red-400 text-[10px] rounded-lg tracking-wider uppercase transition-all flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <AlertTriangle size={11} className="text-red-400" /> Remedial Lesson Node
                    </button>
                    <button
                      onClick={() => adjustRoadmapSpeed('intensify')}
                      className="flex-1 py-2 bg-cyan-500/10 hover:bg-[#00E5FF]/20 border border-cyan-500/20 hover:border-cyan-400 text-cyan-400 text-[10px] rounded-lg tracking-wider uppercase transition-all flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <Zap size={11} className="text-cyan-400 animate-pulse" /> Fast-Track Module
                    </button>
                  </div>
                </div>
              )}

            </div>

            {/* RIGHT: Lesson Video Player & Telemetry HUD (Span 7) */}
            <div className="lg:col-span-7 space-y-6">

              {/* COURSE BREADCRUMB & LESSON IDENTIFIER HUD */}
              <div className="glass-panel p-3 bg-black/80 border-cyan-500/20 flex items-center justify-between text-xs font-mono">
                <div className="flex items-center gap-2 overflow-hidden truncate">
                  <span className="text-cyan-400 font-bold">{selectedCourse.title}</span>
                  <ChevronRight size={12} className="text-gray-500 flex-shrink-0" />
                  <span className="text-gray-300 truncate">{selectedModule?.title}</span>
                  <ChevronRight size={12} className="text-gray-500 flex-shrink-0" />
                  <span className="text-white font-bold truncate">{selectedLesson?.title}</span>
                </div>
              </div>

              {/* LESSON VIDEO PLAYER CONTAINER */}
              <div key={selectedLesson?.id || 'no-lesson-container'} className="glass-panel p-4 bg-black/70 border-[#00E5FF]/10 space-y-4">
                
                {/* Check if active playing video exists for selected lesson */}
                {selectedLesson && activePlayingVideo ? (
                  <>
                    <div className="flex items-start justify-between gap-2 overflow-hidden border-b border-white/5 pb-2">
                      <div className="overflow-hidden">
                        <div className="flex items-center gap-1.5">
                          <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse"></span>
                          <span className="text-[9px] font-mono text-gray-500 uppercase tracking-widest">{activePlayingVideo.channelName}</span>
                        </div>
                        <h3 className="text-xs font-bold text-white tracking-wide mt-1 line-clamp-1" title={activePlayingVideo.title}>
                          {activePlayingVideo.title}
                        </h3>
                      </div>

                      {isYtFallbackActive ? (
                        <span className="text-[8px] font-mono font-bold tracking-widest text-amber-400 bg-amber-400/10 border border-amber-400/30 px-1.5 py-0.5 rounded flex-shrink-0 uppercase animate-pulse">
                          LOCAL CACHE ACTIVE
                        </span>
                      ) : (
                        <span className="text-[8px] font-mono font-bold tracking-widest text-[#00FF9D] bg-[#00FF9D]/10 border border-[#00FF9D]/30 px-1.5 py-0.5 rounded flex-shrink-0 uppercase animate-pulse">
                          CORRECT LESSON VIDEO
                        </span>
                      )}
                    </div>

                    {/* YouTube Video Player Feed */}
                    <div className="relative aspect-video w-full rounded-xl overflow-hidden bg-[#02050D] border border-white/5 flex flex-col justify-between p-3">
                      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,0,0,0)_20%,rgba(0,0,0,0.8)_100%)] z-10 pointer-events-none"></div>
                      
                      {ytActiveError ? (
                        <div className="absolute inset-0 w-full h-full bg-[#03060C] z-10 p-4 flex flex-col justify-center items-center text-center gap-3 border border-red-500/20">
                          <div className="p-2.5 bg-red-500/10 border border-red-500/30 text-red-400 rounded-full animate-bounce">
                            <AlertTriangle size={20} />
                          </div>
                          <div className="space-y-1">
                            <h4 className="text-xs font-bold text-red-400 tracking-wide">{ytActiveError.message} (Code {ytActiveError.code})</h4>
                            <p className="text-[10px] text-gray-400 font-mono max-w-md leading-relaxed">{ytActiveError.action}</p>
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={async () => {
                                await youtubeService.refreshToken();
                                setYtActiveError(null);
                                setIsVideoPlaying(true);
                              }}
                              className="px-2.5 py-1.5 bg-[#00E5FF]/20 text-[#00E5FF] hover:bg-[#00E5FF]/30 border border-[#00E5FF]/40 text-[9px] font-mono rounded cursor-pointer transition-colors"
                            >
                              Trigger Auto-Recovery Bypass
                            </button>
                          </div>
                        </div>
                      ) : (
                        <iframe
                          className="absolute inset-0 w-full h-full border-none opacity-95 z-0"
                          src={`https://www.youtube.com/embed/${activePlayingVideo.videoId}?autoplay=${isVideoPlaying ? 1 : 0}&mute=${isVideoPlaying ? 1 : 0}&enablejsapi=1`}
                          title="Krishna Lesson Video Stream"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                        />
                      )}

                      <div className="relative z-20 flex justify-between items-center text-[10px] font-mono bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/10">
                        <span className="text-gray-300 flex items-center gap-1">
                          <Tv size={11} className="text-cyan-400" /> Active Video: <strong className="text-white">{selectedLesson.title}</strong>
                        </span>
                        <span className="text-purple-400 font-bold flex items-center gap-1">
                          <Award size={11} /> Credibility: {activePlayingVideo.qualityScore}% Match
                        </span>
                      </div>

                      {!isVideoPlaying && !ytActiveError && (
                        <div className="relative z-20 mx-auto my-auto flex flex-col items-center gap-2">
                          <button
                            onClick={() => {
                              const check = youtubeService.requestVideoLoad(activePlayingVideo.videoId);
                              if (!check.allowed) {
                                if (check.error === 'TOKEN_EXPIRED') {
                                  setYtActiveError({
                                    code: 401,
                                    message: 'API Authorization Token Expired!',
                                    action: 'Your current authorization window is closed. Click auto-recover below.'
                                  });
                                  return;
                                } else if (check.error === 'QUOTA_EXCEEDED') {
                                  setIsYtFallbackActive(true);
                                  setYtActiveError(null);
                                  setIsVideoPlaying(true);
                                  return;
                                }
                              }
                              setIsYtFallbackActive(false);
                              setIsVideoPlaying(true);
                              playChime(640, 'sine', 0.2);
                            }}
                            id="btn-play-video-overlay"
                            className="w-14 h-14 rounded-full bg-cyan-700/30 hover:bg-[#00E5FF] border border-cyan-400/50 flex items-center justify-center pointer-events-auto transition-all cursor-pointer backdrop-blur-sm shadow-[0_0_15px_rgba(0,229,255,0.3)] hover:scale-105 active:scale-95"
                          >
                            <Play size={24} className="text-white translate-x-0.5 fill-white" />
                          </button>
                          <span className="bg-black/60 backdrop-blur-sm px-2 py-0.5 rounded text-[10px] font-mono text-gray-300 animate-pulse">Click to Play Lesson Video</span>
                        </div>
                      )}

                      <div className="relative z-20 w-full bg-black/60 backdrop-blur-md p-2.5 rounded-lg border border-white/10 mt-auto flex flex-col gap-2">
                        <div className="flex justify-between items-center text-[9px] font-mono text-gray-400">
                          <span>DURATION: {activePlayingVideo.duration}</span>
                          <span>{videoPlaybackProgress}% Stream Session Sync</span>
                        </div>

                        <div className="w-full bg-white/20 h-1 rounded overflow-hidden">
                          <div className="bg-[#00E5FF] h-1" style={{ width: `${videoPlaybackProgress}%` }}></div>
                        </div>

                        <div className="flex justify-between items-center">
                          <div className="flex gap-2">
                            <button
                              onClick={() => {
                                setIsVideoPlaying(!isVideoPlaying);
                                playChime(580, 'sine', 0.08);
                              }}
                              id="btn-toggle-video-play"
                              className="px-2 py-1 bg-white/10 rounded hover:bg-white/20 text-[9px] font-mono uppercase tracking-widest cursor-pointer text-white"
                            >
                              {isVideoPlaying ? "PAUSE STREAM" : "PLAY STREAM"}
                            </button>

                            <button
                              onClick={() => {
                                setVideoPlaybackProgress(0);
                                playChime(400, 'triangle', 0.08);
                              }}
                              id="btn-restart-stream"
                              className="px-2 py-1 bg-white/10 rounded hover:bg-white/20 text-[9px] font-mono cursor-pointer text-white"
                              title="Restart streaming video time"
                            >
                              <RotateCw size={10} />
                            </button>

                            <a
                              href={`https://www.youtube.com/watch?v=${activePlayingVideo.videoId}`}
                              target="_blank"
                              rel="noreferrer"
                              className="px-2 py-1 bg-red-600/20 hover:bg-red-600 border border-red-500/30 rounded text-[9px] font-mono uppercase tracking-widest text-[#FF8585] hover:text-white flex items-center gap-1 cursor-pointer no-underline transition-colors"
                            >
                              Watch on YouTube
                            </a>
                          </div>

                          <div className="flex items-center gap-3">
                            <label className="flex items-center gap-1.5 text-[9px] font-mono text-gray-400 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={autoplayEnabled}
                                onChange={(e) => setAutoplayEnabled(e.target.checked)}
                                className="rounded bg-black border-white/20 accent-[#00E5FF]"
                              />
                              AUTOPLAY SYNCHRONIZED
                            </label>

                            <button
                              onClick={() => {
                                setFocusModeActive(true);
                                setIsVideoPlaying(true);
                                playChime(800, 'sine', 0.25);
                              }}
                              id="btn-focus-mode"
                              className="px-2 py-1 bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/30 hover:border-purple-400 text-purple-400 text-[9px] font-mono tracking-wider items-center gap-1 rounded transition-all cursor-pointer flex"
                            >
                              <Compass size={11} className="animate-spin" /> FOCUS MODE
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </>
                ) : (
                  /* STRICT MISSING VIDEO DISPLAY (VIDEO_NOT_CONFIGURED) */
                  <div className="aspect-video w-full rounded-xl bg-[#030712] border border-amber-500/30 flex flex-col justify-center items-center p-6 text-center space-y-3">
                    <div className="p-3 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-full">
                      <AlertTriangle size={28} />
                    </div>
                    <div className="space-y-1">
                      <h4 className="text-sm font-bold text-white tracking-wide">VIDEO NOT CONFIGURED</h4>
                      <p className="text-xs text-amber-300/80 font-mono">Video not available for this lesson yet.</p>
                    </div>
                    <div className="text-[10px] font-mono text-gray-500 max-w-sm">
                      Lesson: <strong className="text-gray-300">{selectedLesson?.title || 'Selected Lesson'}</strong> ({selectedCourse.title})
                    </div>
                  </div>
                )}

                {/* SECURE YOUTUBE GATEWAY & AUTH TELEMETRY CENTER */}
                <div className="border-t border-white/5 pt-4 mt-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-[9px] font-mono uppercase tracking-widest text-[#00E5FF]">
                      <ShieldAlert size={12} className="text-[#00E5FF] animate-pulse" />
                      <span>Secure YouTube Stream Gateway</span>
                    </div>
                    <span className={cn(
                      "text-[8px] font-mono px-1.5 py-0.5 rounded font-bold uppercase tracking-widest border",
                      ytServiceState.state === 'VALID' && "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
                      ytServiceState.state === 'EXPIRED' && "bg-red-500/10 text-red-500 border-red-500/20 animate-pulse"
                    )}>
                      • STATUS: {ytServiceState.state}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[10px] font-mono">
                    <div className="p-2 border border-white/5 bg-black/40 rounded flex flex-col justify-between gap-1.5">
                      <div>
                        <span className="text-gray-500 text-[8px] uppercase block">Security Handshake Key</span>
                        <span className="text-[9px] truncate text-[#00FF9D] font-mono block mt-0.5" title={ytServiceState.token}>
                          {ytServiceState.token}
                        </span>
                      </div>
                      <button
                        onClick={async () => {
                          await youtubeService.refreshToken();
                          setYtActiveError(null);
                        }}
                        className="w-full text-center py-1 bg-cyan-400/10 hover:bg-cyan-400/20 text-[#00E5FF] text-[8.5px] uppercase tracking-wider rounded cursor-pointer transition-colors border border-cyan-500/20"
                      >
                        Renew Handshake
                      </button>
                    </div>

                    <div className="p-2 border border-white/5 bg-black/40 rounded flex flex-col justify-between gap-1.5">
                      <div>
                        <span className="text-gray-500 text-[8px] uppercase block">API Daily Quota Engine</span>
                        <div className="flex justify-between text-[9px] text-[#FF8585] mt-0.5 font-bold">
                          <span>USED Capacity:</span>
                          <span>{ytServiceState.quotaUsed} / {ytServiceState.maxQuota} pts</span>
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          youtubeService.resetMetrics();
                          setYtActiveError(null);
                        }}
                        className="w-full text-center py-1 bg-gray-500/10 border border-white/10 hover:bg-gray-500/20 text-gray-300 text-[8.5px] uppercase tracking-wider rounded cursor-pointer transition-colors"
                      >
                        Reset Quota Usage
                      </button>
                    </div>

                    <div className="p-2 border border-white/5 bg-black/40 rounded flex flex-col justify-between gap-1.5">
                      <div>
                        <span className="text-gray-500 text-[8px] uppercase block">Quota Consumption</span>
                        <span className="text-gray-300 text-[9px] block mt-1 font-bold">
                          Velocity: {velocityMetrics.velocity.toFixed(0)} pts/m
                        </span>
                      </div>
                      <span className="text-[8px] font-mono text-cyan-400">ETA: {velocityMetrics.etaText}</span>
                    </div>
                  </div>
                </div>

              </div>

              {/* SUB-AGENT UTILITY CENTER */}
              <div className="glass-panel border-white/5">
                <div className="flex border-b border-white/5 bg-black/50 p-1 rounded-t-xl gap-1">
                  <button
                    onClick={() => setActiveAssistantAgent('notes')}
                    className={cn(
                      "flex-1 py-2 text-[10px] font-mono tracking-wider uppercase transition-all rounded-lg cursor-pointer flex items-center justify-center gap-1",
                      activeAssistantAgent === 'notes' ? "bg-cyan-500/10 text-[#00E5FF]" : "text-gray-400 hover:text-white"
                    )}
                  >
                    <FileText size={12} /> Notes & Summary
                  </button>
                  <button
                    onClick={() => setActiveAssistantAgent('quiz')}
                    className={cn(
                      "flex-1 py-2 text-[10px] font-mono tracking-wider uppercase transition-all rounded-lg cursor-pointer flex items-center justify-center gap-1",
                      activeAssistantAgent === 'quiz' ? "bg-[#00FF9D]/10 text-[#00FF5D]" : "text-gray-400 hover:text-white"
                    )}
                  >
                    <Brain size={12} /> Adaptive Quiz
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

                <div className="p-4 min-h-[220px] bg-black/40 relative">
                  {activeAssistantAgent === 'notes' && (
                    <div className="space-y-3 text-left animate-fadeIn">
                      <div className="flex justify-between items-center text-[10px] font-mono text-cyan-400 uppercase">
                        <span>LESSON SUMMARY & ADVISORY NOTES</span>
                      </div>
                      <div className="text-xs text-gray-300 leading-relaxed bg-[#02050C] border border-white/5 p-3 rounded-xl whitespace-pre-wrap select-text max-h-56 overflow-y-auto scrollbar-thin">
                        {notesAgentContent}
                      </div>
                      <div className="pt-1.5 border-t border-white/5 flex justify-between items-center">
                        <span className="text-[8.5px] font-mono text-gray-500">Auto-summaries sync with current lesson selection.</span>
                        <button
                          onClick={() => {
                            setWorkspaceNotes(prev => prev + `\n--- SAVED: ${selectedLesson?.title} ---\n` + notesAgentContent + '\n');
                            playChime(950, 'sine', 0.1);
                          }}
                          className="text-[9px] font-mono font-bold uppercase text-[#00FF9D] bg-[#00FF9D]/10 border border-[#00FF9D]/20 px-2 py-1 rounded hover:bg-[#00FF9D]/20 cursor-pointer"
                        >
                          Append to Notebook
                        </button>
                      </div>
                    </div>
                  )}

                  {activeAssistantAgent === 'quiz' && (
                    <div className="space-y-4 text-left animate-fadeIn">
                      <div className="flex justify-between items-center text-[10px] font-mono">
                        <span className="text-[#00FF9D] uppercase tracking-wider">Concept Assessment</span>
                        <span className="text-gray-500 font-bold">
                          Question {activeQuizIndex + 1} of {dynamicQuizzes.length}
                        </span>
                      </div>

                      <div className="bg-[#02050E] border border-white/5 p-3.5 rounded-xl space-y-3">
                        <h4 className="text-xs font-bold leading-normal text-white">
                          {dynamicQuizzes[activeQuizIndex]?.question}
                        </h4>

                        <div className="space-y-2">
                          {dynamicQuizzes[activeQuizIndex]?.options.map((option, idx) => (
                            <div
                              key={idx}
                              onClick={() => {
                                if (quizSubmitted) return;
                                setSelectedQuizAnswer(idx);
                              }}
                              className={cn(
                                "p-2.5 rounded-lg border text-xs cursor-pointer transition-all leading-normal",
                                selectedQuizAnswer === idx 
                                  ? "border-[#00FF9D] bg-[#00FF9D]/5" 
                                  : "bg-black/40 border-white/5 hover:border-white/10",
                                quizSubmitted && idx === dynamicQuizzes[activeQuizIndex].correctIndex && "border-[#00FF9D] bg-emerald-950/20 text-[#00FF9D]",
                                quizSubmitted && selectedQuizAnswer === idx && idx !== dynamicQuizzes[activeQuizIndex].correctIndex && "border-red-500/40 bg-red-950/10 text-red-400"
                              )}
                            >
                              <span className="font-mono text-[9px] mr-1.5 opacity-50 font-bold">{String.fromCharCode(65 + idx)}.</span>
                              {option}
                            </div>
                          ))}
                        </div>

                        {quizSubmitted && (
                          <div className="bg-white/[0.02] border border-white/5 p-3 rounded-lg text-[10px] leading-relaxed text-gray-300">
                            <strong className={cn(
                              "uppercase font-mono block mb-1",
                              selectedQuizAnswer === dynamicQuizzes[activeQuizIndex].correctIndex ? "text-[#00FF9D]" : "text-red-400"
                            )}>
                              {selectedQuizAnswer === dynamicQuizzes[activeQuizIndex].correctIndex ? "✓ Verification Passed" : "✗ Constraint Failed"}
                            </strong>
                            {dynamicQuizzes[activeQuizIndex].rationale}
                          </div>
                        )}

                        <div className="flex gap-2 justify-end">
                          {!quizSubmitted ? (
                            <button
                              onClick={() => {
                                if (selectedQuizAnswer === null) return;
                                setQuizSubmitted(true);
                                if (selectedQuizAnswer === dynamicQuizzes[activeQuizIndex].correctIndex) {
                                  setQuizScore(s => s + 1);
                                  playChime(1100, 'sine', 0.25);
                                } else {
                                  playChime(420, 'sawtooth', 0.25);
                                }
                              }}
                              disabled={selectedQuizAnswer === null}
                              className="bg-[#00FF9D]/15 hover:bg-[#00FF9D]/20 border border-[#00FF9D]/40 text-[#00FF5D] text-[10px] font-mono px-3.5 py-1.5 rounded-lg transition-all cursor-pointer disabled:opacity-50"
                            >
                              Verify Answer
                            </button>
                          ) : (
                            <button
                              onClick={() => {
                                if (activeQuizIndex + 1 < dynamicQuizzes.length) {
                                  setActiveQuizIndex(idx => idx + 1);
                                  setSelectedQuizAnswer(null);
                                  setQuizSubmitted(false);
                                } else {
                                  setActiveQuizIndex(0);
                                  setSelectedQuizAnswer(null);
                                  setQuizSubmitted(false);
                                  setQuizScore(0);
                                }
                              }}
                              className="bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/30 text-purple-400 text-[10px] font-mono px-3.5 py-1.5 rounded-lg cursor-pointer transition-all"
                            >
                              {activeQuizIndex + 1 < dynamicQuizzes.length ? "Next Question" : "Reset Quiz"}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {activeAssistantAgent === 'chat' && (
                    <div className="space-y-3 text-left flex flex-col justify-between h-56 animate-fadeIn">
                      <div className="flex justify-between items-center text-[9px] font-mono text-purple-400 uppercase">
                        <span>Neural doubt solver loop</span>
                      </div>

                      <div className="flex-1 overflow-y-auto space-y-2.5 p-2 bg-[#020409] border border-white/5 rounded-xl max-h-36 scrollbar-thin flex flex-col-reverse">
                        {chatLog.map((log, index) => (
                          <div
                            key={index}
                            className={cn(
                              "p-2.5 rounded-lg text-xs leading-normal leading-relaxed",
                              log.role === 'user' 
                                ? "bg-purple-950/20 border border-purple-500/20 text-purple-300 self-end ml-6" 
                                : "bg-white/[0.02] border border-white/5 text-gray-300 self-start mr-6"
                            )}
                          >
                            <span className="text-[9px] font-mono uppercase block mb-0.5 opacity-50">{log.agentName}</span>
                            {log.text}
                          </div>
                        ))}
                      </div>

                      <form onSubmit={handleAskTutor} className="flex gap-1.5">
                        <input
                          type="text"
                          value={gptChatInput}
                          onChange={(e) => setGptChatInput(e.target.value)}
                          className="flex-1 bg-black/40 border border-white/10 focus:border-[#A78BFA]/50 rounded-lg px-3 py-2 text-xs text-white outline-none"
                          placeholder="Ask a question about this lesson..."
                        />
                        <button
                          type="submit"
                          disabled={isAskingGroq || !gptChatInput.trim()}
                          className="bg-purple-500/15 hover:bg-purple-500/20 border border-purple-500/30 font-mono text-[10px] text-purple-400 font-bold px-3 py-2 rounded-lg cursor-pointer disabled:opacity-40"
                        >
                          {isAskingGroq ? "Asking..." : "Query Core"}
                        </button>
                      </form>
                    </div>
                  )}
                </div>
              </div>

              {/* WORKSPACE NOTEBOOK */}
              <div className="glass-panel p-5 bg-[#010307] border-white/5 space-y-3">
                <div className="flex justify-between items-center border-b border-white/5 pb-2">
                  <h4 className="text-xs font-mono font-bold uppercase text-gray-400 tracking-wider flex items-center gap-1.5">
                    <Terminal size={14} className="text-[#00E5FF]" /> Live Operator Notepad Workspace
                  </h4>
                  <button
                    onClick={() => setWorkspaceNotes('// Notepad wiped.\n')}
                    className="text-[8.5px] font-mono text-red-400 hover:text-white uppercase transition-colors"
                  >
                    Clear Notes
                  </button>
                </div>

                <textarea
                  rows={5}
                  value={workspaceNotes}
                  onChange={(e) => setWorkspaceNotes(e.target.value)}
                  className="w-full bg-black/60 border border-white/10 focus:border-[#00E5FF]/40 rounded-xl p-3 text-xs font-mono text-emerald-400 outline-none resize-none leading-normal"
                  placeholder="// Record notes or code concepts during this feed..."
                />
              </div>

            </div>

          </div>
        </div>
      )}

      {/* FOCUS MODE OVERLAY */}
      <AnimatePresence>
        {focusModeActive && activePlayingVideo && selectedLesson && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-[#020409] text-white flex flex-col p-6 items-center justify-center space-y-6 overflow-hidden select-none"
          >
            <div className="w-full max-w-4xl flex justify-between items-center border-b border-white/10 pb-4">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-purple-500 animate-ping"></span>
                <span className="text-xs font-mono font-black tracking-widest text-purple-400 uppercase">
                  ACTIVE FOCUS SESSION: {selectedCourse?.title} → {selectedLesson.title}
                </span>
              </div>

              <button
                onClick={() => setFocusModeActive(false)}
                id="btn-exit-focus"
                className="px-3.5 py-1.5 bg-red-500/15 hover:bg-red-500/20 border border-red-500/30 text-red-400 hover:text-white rounded-lg text-xs font-mono font-bold uppercase transition-all tracking-wider cursor-pointer"
              >
                Exit Focus Mode
              </button>
            </div>

            <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch flex-1 overflow-hidden">
              <div className="md:col-span-8 bg-black border border-white/5 rounded-xl overflow-hidden flex flex-col justify-between p-3 relative">
                <iframe
                  className="w-full h-full border-none opacity-90 rounded-lg aspect-video"
                  src={`https://www.youtube.com/embed/${activePlayingVideo.videoId}?autoplay=1&enablejsapi=1`}
                  title="Krishna Focus Video Stream"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
                <div className="bg-[#03060D] border border-white/10 p-3 rounded-lg flex justify-between items-center mt-3 text-xs font-mono">
                  <div className="truncate">
                    <span className="text-[10px] text-gray-500 font-bold block">{activePlayingVideo.channelName}</span>
                    <h4 className="text-white font-bold leading-none line-clamp-1 truncate mt-0.5">{activePlayingVideo.title}</h4>
                  </div>
                  <button
                    onClick={() => setIsVideoPlaying(!isVideoPlaying)}
                    className="px-2 py-1 bg-white/10 rounded font-bold text-[9px] cursor-pointer"
                  >
                    {isVideoPlaying ? "Pause Feed" : "Resume"}
                  </button>
                </div>
              </div>

              <div className="md:col-span-4 flex flex-col gap-4">
                <div className="bg-[#03060E] border border-white/5 p-4 rounded-xl flex-1 flex flex-col justify-between">
                  <div>
                    <h4 className="text-[10px] font-mono text-purple-400 uppercase tracking-widest">
                      Lesson Advisory Notes
                    </h4>
                    <p className="text-xs text-gray-300 leading-normal font-sans mt-3 whitespace-pre-wrap select-text max-h-[180px] overflow-y-auto scrollbar-thin">
                      {notesAgentContent}
                    </p>
                  </div>
                </div>

                <div className="bg-black/50 border border-white/5 p-3 rounded-xl">
                  <span className="text-[9px] font-mono text-gray-500 uppercase tracking-widest block mb-1">
                    Direct Code Scratchpad
                  </span>
                  <textarea
                    rows={4}
                    value={workspaceNotes}
                    onChange={(e) => setWorkspaceNotes(e.target.value)}
                    className="w-full bg-[#02050E] border border-white/10 focus:border-cyan-500/40 rounded-lg p-2.5 text-[11px] font-mono text-[#00FF9D] outline-none resize-none leading-normal"
                    placeholder="// Synthesize formulas or code here..."
                  />
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
