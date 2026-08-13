export type VideoProviderType = 'youtube' | 'vimeo' | 'custom';

export interface NormalizedVideo {
  provider: VideoProviderType;
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

// Registry of verified educational videos mapped by key topics
const VERIFIED_VIDEO_REGISTRY: Record<string, NormalizedVideo> = {
  // Python
  'python-intro': {
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
  'python-functions': {
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
  },
  'python-classes': {
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
  },
  'python-dsa-basics': {
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
  },

  // Java
  'java-intro': {
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
  },
  'java-classes': {
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
  },
  'java-collections-intro': {
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
  },

  // JavaScript
  'js-intro': {
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
  },
  'js-functions': {
    provider: 'youtube',
    videoId: 'g1TC4jh5vD0',
    title: 'JavaScript Higher Order Functions & Arrays',
    channelName: 'Traversy Media',
    duration: '32:10',
    qualityScore: 96,
    views: '1.4M views',
    likes: '72K likes',
    tags: ['JavaScript', 'Functions', 'Callbacks'],
    agentRecommended: true
  },
  'js-promises': {
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
  },
  'js-event-loop': {
    provider: 'youtube',
    videoId: '8aGhZQkoFbQ',
    title: 'What the heck is the event loop anyway?',
    channelName: 'JSConf',
    duration: '26:24',
    qualityScore: 99,
    views: '3.8M views',
    likes: '190K likes',
    tags: ['Event Loop', 'Execution Context', 'Concurrency'],
    agentRecommended: true
  },

  // React
  'react-intro': {
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
  },
  'react-hooks': {
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
  },
  'nextjs-app-router': {
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
  },

  // Machine Learning
  'ml-nn-intro': {
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
  },
  'ml-gradient-descent': {
    provider: 'youtube',
    videoId: 'IHZwWFHWa-w',
    title: 'Gradient descent, how neural networks learn | Chapter 2',
    channelName: '3Blue1Brown',
    duration: '21:05',
    qualityScore: 96,
    views: '8.4M views',
    likes: '510K likes',
    tags: ['Gradient Descent', 'Backpropagation', 'Math'],
    agentRecommended: true
  },
  'ml-llm-intro': {
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
  },

  // Data Science
  'ds-intro': {
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
  },
  'ds-pandas-numpy': {
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
  },

  // Operating System
  'os-intro': {
    provider: 'youtube',
    videoId: 'vBURTt97EkA',
    title: 'Operating System Full Course for Beginners',
    channelName: 'Gate Smashers',
    duration: '4:15:00',
    qualityScore: 98,
    views: '3.2M views',
    likes: '150K likes',
    tags: ['Operating Systems', 'Processes', 'Threads'],
    agentRecommended: true
  },
  'os-processes': {
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
  },

  // Docker / DevOps / Cloud
  'docker-intro': {
    provider: 'youtube',
    videoId: '3c-iBn73dDE',
    title: 'Docker Tutorial for Beginners',
    channelName: 'TechWorld with Nana',
    duration: '2:45:00',
    qualityScore: 98,
    views: '4.5M views',
    likes: '210K likes',
    tags: ['Docker', 'DevOps', 'Containers'],
    agentRecommended: true
  },
  'system-design-intro': {
    provider: 'youtube',
    videoId: 'm8Icp_Cid5o',
    title: 'System Design Interview Crash Course',
    channelName: 'ByteByteGo',
    duration: '45:00',
    qualityScore: 99,
    views: '2.1M views',
    likes: '110K likes',
    tags: ['System Design', 'Architecture', 'Scalability'],
    agentRecommended: true
  }
};

export const videoProviderService = {
  getVerifiedVideoForLesson(lessonId: string, topicOrTitle: string): NormalizedVideo | null {
    // 1. Exact match in registry by lessonId
    if (VERIFIED_VIDEO_REGISTRY[lessonId]) {
      return VERIFIED_VIDEO_REGISTRY[lessonId];
    }

    // 2. Fuzzy topic match against registry keys
    const lowerTopic = topicOrTitle.toLowerCase();
    for (const [key, video] of Object.entries(VERIFIED_VIDEO_REGISTRY)) {
      if (lowerTopic.includes(key.replace(/-/g, ' '))) {
        return video;
      }
    }

    // 3. Keyword matching for common topics
    if (lowerTopic.includes('python')) return VERIFIED_VIDEO_REGISTRY['python-intro'];
    if (lowerTopic.includes('java ') || lowerTopic.includes('java-') || lowerTopic === 'java') return VERIFIED_VIDEO_REGISTRY['java-intro'];
    if (lowerTopic.includes('javascript') || lowerTopic.includes('js')) return VERIFIED_VIDEO_REGISTRY['js-intro'];
    if (lowerTopic.includes('react')) return VERIFIED_VIDEO_REGISTRY['react-intro'];
    if (lowerTopic.includes('machine learning') || lowerTopic.includes('neural')) return VERIFIED_VIDEO_REGISTRY['ml-nn-intro'];
    if (lowerTopic.includes('data science') || lowerTopic.includes('pandas')) return VERIFIED_VIDEO_REGISTRY['ds-intro'];
    if (lowerTopic.includes('operating system') || lowerTopic.includes('os ')) return VERIFIED_VIDEO_REGISTRY['os-intro'];
    if (lowerTopic.includes('docker') || lowerTopic.includes('container')) return VERIFIED_VIDEO_REGISTRY['docker-intro'];
    if (lowerTopic.includes('system design') || lowerTopic.includes('architecture')) return VERIFIED_VIDEO_REGISTRY['system-design-intro'];

    // 4. Return null if unverified (Strict "Video not available for this lesson yet" state)
    return null;
  }
};
