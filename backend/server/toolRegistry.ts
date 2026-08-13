// =========================================
// KRISHNA AGENT — CONTROLLED TOOL REGISTRY
// =========================================
// All agent actions pass through this controlled layer.
// The AI decides WHAT should happen; this layer decides WHETHER and HOW.

export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH';
export type ToolStatus = 'ACTIVE' | 'NOT_IMPLEMENTED';
export type PermissionLevel = 'PUBLIC' | 'AUTHENTICATED';

export interface ToolDefinition {
  name: string;
  description: string;
  inputSchema: Record<string, string>;
  outputSchema: Record<string, string>;
  permissionLevel: PermissionLevel;
  riskLevel: RiskLevel;
  requiresConfirmation: boolean;
  timeout: number; // ms
  status: ToolStatus;
  execute: (input: any, context: ToolContext) => Promise<ToolResult>;
}

export interface ToolContext {
  userId?: string;
  isAuthenticated: boolean;
  groqApiKey?: string;
  groqModel?: string;
}

export interface ToolResult {
  success: boolean;
  data?: any;
  error?: string;
  message?: string;
}

// =========================================
// TOOL IMPLEMENTATIONS
// =========================================

async function executeAnalyzeVision(input: any, context: ToolContext): Promise<ToolResult> {
  // Vision analysis is handled by the /api/vision/analyze endpoint
  // This tool acts as a bridge for the agent to invoke vision
  return {
    success: true,
    data: { delegateTo: '/api/vision/analyze', input },
    message: 'Vision analysis delegated to Krishna Vision endpoint.'
  };
}

async function executeSearchWeb(input: any, context: ToolContext): Promise<ToolResult> {
  if (!context.groqApiKey) {
    return { success: false, error: 'AI provider not configured.' };
  }

  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${context.groqApiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: context.groqModel || 'llama-3.3-70b-versatile',
        messages: [
          { role: 'system', content: 'You are a knowledgeable search assistant. Provide accurate, concise information based on the query. Cite your confidence level.' },
          { role: 'user', content: `Search query: ${input.query}` }
        ],
        temperature: 0.3,
        max_tokens: 1024
      })
    });

    if (!response.ok) throw new Error(`Search failed: ${response.statusText}`);
    const data: any = await response.json();
    const text = data.choices?.[0]?.message?.content || '';

    return { success: true, data: { result: text }, message: 'Search completed.' };
  } catch (err: any) {
    return { success: false, error: 'Search failed. Please try again.' };
  }
}

async function executeCreateReminder(input: any, _context: ToolContext): Promise<ToolResult> {
  const { title, time, description } = input;
  if (!title) {
    return { success: false, error: 'Reminder title is required.' };
  }

  return {
    success: true,
    data: {
      reminderId: `rem-${Date.now()}`,
      title,
      time: time || 'Not specified',
      description: description || '',
      createdAt: new Date().toISOString()
    },
    message: `Reminder "${title}" created successfully.`
  };
}

async function executeNavigateTo(input: any, _context: ToolContext): Promise<ToolResult> {
  const validRoutes: Record<string, string> = {
    'dashboard': '/dashboard',
    'core': '/core',
    'voice': '/voice',
    'vision': '/vision',
    'agent': '/agent',
    'automation': '/automation',
    'learn': '/learn',
    'guardian': '/guardian',
    'canvas': '/canvas',
    'profile': '/profile',
    'home': '/'
  };

  const route = validRoutes[input.destination?.toLowerCase()];
  if (!route) {
    return { success: false, error: `Unknown destination: ${input.destination}. Valid: ${Object.keys(validRoutes).join(', ')}` };
  }

  return {
    success: true,
    data: { route, destination: input.destination },
    message: `Ready to navigate to ${input.destination}.`
  };
}

async function executeGenerateLearningPath(input: any, context: ToolContext): Promise<ToolResult> {
  if (!context.groqApiKey) {
    return { success: false, error: 'AI provider not configured.' };
  }

  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${context.groqApiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: context.groqModel || 'llama-3.3-70b-versatile',
        messages: [
          { role: 'system', content: 'You are KRISHNA OS Learning Intelligence. Create a structured learning path. Respond in valid JSON array: [{"title": "...", "time": "...", "level": "Beginner/Intermediate/Advanced", "description": "..."}]' },
          { role: 'user', content: `Learning goal: ${input.goal || input.topic}` }
        ],
        temperature: 0.5,
        max_tokens: 1024,
        response_format: { type: 'json_object' }
      })
    });

    if (!response.ok) throw new Error('Learning path generation failed.');
    const data: any = await response.json();
    const text = data.choices?.[0]?.message?.content || '{}';
    const parsed = JSON.parse(text);

    return {
      success: true,
      data: { learningPath: parsed.path || parsed.learningPath || parsed },
      message: 'Learning path generated.'
    };
  } catch (err: any) {
    return { success: false, error: 'Failed to generate learning path.' };
  }
}

async function executeSummarizeContent(input: any, context: ToolContext): Promise<ToolResult> {
  if (!context.groqApiKey) {
    return { success: false, error: 'AI provider not configured.' };
  }

  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${context.groqApiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: context.groqModel || 'llama-3.3-70b-versatile',
        messages: [
          { role: 'system', content: 'You are a precise content summarizer. Provide clear, structured summaries. Use bullet points for key takeaways.' },
          { role: 'user', content: `Summarize the following:\n\n${input.content}` }
        ],
        temperature: 0.3,
        max_tokens: 1024
      })
    });

    if (!response.ok) throw new Error('Summarization failed.');
    const data: any = await response.json();
    const text = data.choices?.[0]?.message?.content || '';

    return { success: true, data: { summary: text }, message: 'Content summarized.' };
  } catch (err: any) {
    return { success: false, error: 'Summarization failed. Please try again.' };
  }
}

async function executeAnalyzeResume(input: any, context: ToolContext): Promise<ToolResult> {
  if (!context.groqApiKey) {
    return { success: false, error: 'AI provider not configured.' };
  }

  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${context.groqApiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: context.groqModel || 'llama-3.3-70b-versatile',
        messages: [
          { role: 'system', content: 'You are KRISHNA OS Career Intelligence. Analyze the resume/job description and provide: match score (0-100), strengths, gaps, and recommendations. Be specific and actionable.' },
          { role: 'user', content: input.content }
        ],
        temperature: 0.4,
        max_tokens: 1500
      })
    });

    if (!response.ok) throw new Error('Resume analysis failed.');
    const data: any = await response.json();
    const text = data.choices?.[0]?.message?.content || '';

    return { success: true, data: { analysis: text }, message: 'Resume analysis complete.' };
  } catch (err: any) {
    return { success: false, error: 'Resume analysis failed.' };
  }
}

function notImplementedTool(name: string, reason: string) {
  return async (_input: any, _context: ToolContext): Promise<ToolResult> => ({
    success: false,
    error: `Tool "${name}" is not yet implemented. Reason: ${reason}`
  });
}

// =========================================
// TOOL REGISTRY
// =========================================

export const TOOL_REGISTRY: ToolDefinition[] = [
  {
    name: 'analyzeVision',
    description: 'Analyze an image using Krishna Vision. Supports understanding, extraction, debugging, and reading.',
    inputSchema: { imageBase64: 'string (base64 encoded image)', mode: 'string (UNDERSTAND|EXTRACT|ANALYZE|DEBUG|GUIDE|READ|COMPARE)', prompt: 'string (optional user question)' },
    outputSchema: { analysis: 'string', mode: 'string' },
    permissionLevel: 'AUTHENTICATED',
    riskLevel: 'LOW',
    requiresConfirmation: false,
    timeout: 30000,
    status: 'ACTIVE',
    execute: executeAnalyzeVision
  },
  {
    name: 'searchWeb',
    description: 'Search for information on a given topic or question.',
    inputSchema: { query: 'string (search query)' },
    outputSchema: { result: 'string' },
    permissionLevel: 'PUBLIC',
    riskLevel: 'LOW',
    requiresConfirmation: false,
    timeout: 15000,
    status: 'ACTIVE',
    execute: executeSearchWeb
  },
  {
    name: 'createReminder',
    description: 'Create a reminder with a title and optional time.',
    inputSchema: { title: 'string', time: 'string (optional)', description: 'string (optional)' },
    outputSchema: { reminderId: 'string', title: 'string', time: 'string' },
    permissionLevel: 'AUTHENTICATED',
    riskLevel: 'LOW',
    requiresConfirmation: false,
    timeout: 5000,
    status: 'ACTIVE',
    execute: executeCreateReminder
  },
  {
    name: 'navigateTo',
    description: 'Navigate to a specific page in Krishna OS. Valid destinations: dashboard, core, voice, vision, agent, automation, learn, guardian, canvas, profile, home.',
    inputSchema: { destination: 'string (page name)' },
    outputSchema: { route: 'string', destination: 'string' },
    permissionLevel: 'PUBLIC',
    riskLevel: 'LOW',
    requiresConfirmation: false,
    timeout: 5000,
    status: 'ACTIVE',
    execute: executeNavigateTo
  },
  {
    name: 'generateLearningPath',
    description: 'Generate a structured learning path for a given topic or career goal.',
    inputSchema: { goal: 'string (learning goal or topic)' },
    outputSchema: { learningPath: 'array of learning steps' },
    permissionLevel: 'AUTHENTICATED',
    riskLevel: 'LOW',
    requiresConfirmation: false,
    timeout: 20000,
    status: 'ACTIVE',
    execute: executeGenerateLearningPath
  },
  {
    name: 'summarizeContent',
    description: 'Summarize text content into key points and takeaways.',
    inputSchema: { content: 'string (text to summarize)' },
    outputSchema: { summary: 'string' },
    permissionLevel: 'PUBLIC',
    riskLevel: 'LOW',
    requiresConfirmation: false,
    timeout: 15000,
    status: 'ACTIVE',
    execute: executeSummarizeContent
  },
  {
    name: 'analyzeResume',
    description: 'Analyze a resume or compare it against a job description. Provides match score, strengths, gaps, and recommendations.',
    inputSchema: { content: 'string (resume text or job description + resume)' },
    outputSchema: { analysis: 'string' },
    permissionLevel: 'AUTHENTICATED',
    riskLevel: 'LOW',
    requiresConfirmation: false,
    timeout: 20000,
    status: 'ACTIVE',
    execute: executeAnalyzeResume
  },
  // === NOT IMPLEMENTED TOOLS ===
  {
    name: 'sendEmail',
    description: 'Send an email to a specified recipient.',
    inputSchema: { to: 'string', subject: 'string', body: 'string' },
    outputSchema: { sent: 'boolean' },
    permissionLevel: 'AUTHENTICATED',
    riskLevel: 'HIGH',
    requiresConfirmation: true,
    timeout: 30000,
    status: 'NOT_IMPLEMENTED',
    execute: notImplementedTool('sendEmail', 'Requires authenticated user SMTP configuration.')
  },
  {
    name: 'calendarEvent',
    description: 'Create a calendar event.',
    inputSchema: { title: 'string', date: 'string', time: 'string' },
    outputSchema: { eventId: 'string' },
    permissionLevel: 'AUTHENTICATED',
    riskLevel: 'MEDIUM',
    requiresConfirmation: true,
    timeout: 15000,
    status: 'NOT_IMPLEMENTED',
    execute: notImplementedTool('calendarEvent', 'No calendar integration exists in this project.')
  },
  {
    name: 'purchaseItem',
    description: 'Purchase a product or service.',
    inputSchema: { item: 'string', amount: 'number' },
    outputSchema: { transactionId: 'string' },
    permissionLevel: 'AUTHENTICATED',
    riskLevel: 'HIGH',
    requiresConfirmation: true,
    timeout: 60000,
    status: 'NOT_IMPLEMENTED',
    execute: notImplementedTool('purchaseItem', 'No payment system exists in this project.')
  },
  {
    name: 'deleteFile',
    description: 'Delete a file from the system.',
    inputSchema: { filePath: 'string' },
    outputSchema: { deleted: 'boolean' },
    permissionLevel: 'AUTHENTICATED',
    riskLevel: 'HIGH',
    requiresConfirmation: true,
    timeout: 10000,
    status: 'NOT_IMPLEMENTED',
    execute: notImplementedTool('deleteFile', 'No file system access from web platform.')
  }
];

// =========================================
// REGISTRY HELPERS
// =========================================

export function getToolByName(name: string): ToolDefinition | undefined {
  return TOOL_REGISTRY.find(t => t.name === name);
}

export function getActiveTools(): ToolDefinition[] {
  return TOOL_REGISTRY.filter(t => t.status === 'ACTIVE');
}

export function getToolDescriptions(): string {
  return getActiveTools()
    .map(t => `- ${t.name}: ${t.description} [Risk: ${t.riskLevel}] [Confirmation: ${t.requiresConfirmation ? 'YES' : 'NO'}]`)
    .join('\n');
}

export function validateToolInput(tool: ToolDefinition, input: any): { valid: boolean; error?: string } {
  if (!input || typeof input !== 'object') {
    return { valid: false, error: 'Tool input must be an object.' };
  }

  // Check required fields from schema (fields without "optional" in description)
  for (const [key, desc] of Object.entries(tool.inputSchema)) {
    if (!String(desc).toLowerCase().includes('optional') && (input[key] === undefined || input[key] === null || input[key] === '')) {
      return { valid: false, error: `Missing required field: ${key}` };
    }
  }

  return { valid: true };
}
