import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { 
  verifySmtpConnection, 
  sendPasswordResetEmail, 
  verifyResetToken, 
  completePasswordReset, 
  sendEmailVerification, 
  verifyEmailToken,
  checkRateLimit,
  recordRateLimit
} from './server/authMailer';
import {
  TOOL_REGISTRY,
  getToolByName,
  getActiveTools,
  getToolDescriptions,
  validateToolInput,
  type ToolContext,
  type ToolResult
} from './server/toolRegistry';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from the .env file located at the project root
dotenv.config({ path: path.resolve(__dirname, '..', '.env') });

// Diagnostic log to confirm that the OpenAI API key is loaded (does NOT expose the key)
console.log('[IMAGE AI] OPENAI_API_KEY configured:', Boolean(process.env.OPENAI_API_KEY));
console.log('[VISION AI] GROQ_VISION_MODEL configured:', process.env.GROQ_VISION_MODEL || 'llama-4-scout-17b-16e-instruct');

// =========================================
// GROQ AI SERVICE UTILITIES
// =========================================

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

function getGroqApiKey(): string {
  return process.env.GROQ_API_KEY || process.env.GEMINI_API_KEY || '';
}

function getGroqModel(): string {
  return process.env.GROQ_MODEL || 'llama-3.3-70b-versatile';
}

function getGroqVisionModel(): string {
  return process.env.GROQ_VISION_MODEL || 'qwen/qwen3.6-27b';
}

interface GroqMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

function normalizeGroqMessages(messages: any[], systemInstruction?: string): GroqMessage[] {
  const result: GroqMessage[] = [];

  if (systemInstruction && typeof systemInstruction === 'string' && systemInstruction.trim()) {
    result.push({ role: 'system', content: systemInstruction.trim() });
  }

  if (Array.isArray(messages)) {
    for (const msg of messages) {
      if (!msg) continue;
      let role: 'system' | 'user' | 'assistant' = 'user';
      if (msg.role === 'model' || msg.role === 'assistant') {
        role = 'assistant';
      } else if (msg.role === 'system') {
        role = 'system';
      }

      let content = '';
      if (typeof msg.content === 'string') {
        content = msg.content;
      } else if (typeof msg.text === 'string') {
        content = msg.text;
      } else if (Array.isArray(msg.parts)) {
        content = msg.parts.map((p: any) => (typeof p === 'string' ? p : p.text || '')).join('\n');
      }

      if (content) {
        result.push({ role, content });
      }
    }
  }

  return result;
}

async function callGroqAPI(options: {
  messages: GroqMessage[];
  temperature?: number;
  max_tokens?: number;
  jsonMode?: boolean;
}): Promise<{ text: string; emotion?: string }> {
  const apiKey = getGroqApiKey();
  if (!apiKey) {
    throw new Error('GROQ_API_KEY is not configured on the server.');
  }

  const model = getGroqModel();
  const body: any = {
    model,
    messages: options.messages,
    temperature: options.temperature ?? 0.7,
    max_tokens: options.max_tokens ?? 2048,
    stream: false
  };

  if (options.jsonMode) {
    body.response_format = { type: 'json_object' };
  }

  const response = await fetch(GROQ_API_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body)
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error(`Groq API Error (${response.status}):`, errorText);
    throw new Error(`Groq API Error: ${response.status} ${response.statusText}`);
  }

  const data: any = await response.json();
  const rawText = data.choices?.[0]?.message?.content || '';

  let text = rawText;
  let emotion = 'Professional';
  const emotionMatch = text.match(/\[EMOTION:\s*(.+?)\]/i);
  if (emotionMatch) {
    emotion = emotionMatch[1].trim();
    text = text.replace(/\[EMOTION:\s*(.+?)\]/i, '').trim();
  }

  return { text, emotion };
}

async function streamGroqAPI(
  options: { messages: GroqMessage[]; temperature?: number },
  res: express.Response
) {
  const apiKey = getGroqApiKey();
  if (!apiKey) {
    res.status(500).json({ error: 'GROQ_API_KEY is not configured on the server.' });
    return;
  }

  const model = getGroqModel();
  const response = await fetch(GROQ_API_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model,
      messages: options.messages,
      temperature: options.temperature ?? 0.7,
      stream: true
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error(`Groq Streaming Error (${response.status}):`, errorText);
    res.status(response.status).json({ error: `Groq Streaming Error: ${response.statusText}` });
    return;
  }

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  if (response.body) {
    const reader = (response.body as any).getReader();
    const decoder = new TextDecoder();
    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunkStr = decoder.decode(value, { stream: true });
        res.write(chunkStr);
      }
    } catch (err) {
      console.error('Error reading Groq stream:', err);
    } finally {
      res.end();
    }
  } else {
    res.end();
  }
}

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  // Middleware to parse JSON
  app.use(express.json({ limit: '50mb' }));

  // Verify SMTP Connection Diagnostic on Startup (non-blocking)
  verifySmtpConnection().then((status) => {
    if (status.success) {
      console.log(`[SMTP Startup Diagnostic] ${status.message} (Host: ${status.host}:${status.port})`);
    } else {
      console.warn(`[SMTP Startup Diagnostic] ${status.message}`);
    }
  });

  // Health Check Endpoints
  app.get(['/health', '/api/health'], (_req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.status(200).json({
      status: 'ok',
      service: 'Krishna AI Neural Core Backend',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development'
    });
  });

  // 1. SMTP Diagnostic Endpoint
  app.get('/api/auth/smtp-status', async (req, res) => {
    try {
      const result = await verifySmtpConnection();
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ success: false, message: 'SMTP status check failed.' });
    }
  });

  // 2. Forgot Password Request Route (Email Enumeration Protected)
  app.post('/api/auth/forgot-password', async (req, res) => {
    const { email } = req.body;

    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return res.status(400).json({ 
        success: false, 
        message: 'Please provide a valid email address.' 
      });
    }

    const cleanEmail = email.trim().toLowerCase();
    const clientIp = req.ip || req.socket.remoteAddress || 'unknown';

    const emailLimit = checkRateLimit(`email:${cleanEmail}`);
    if (!emailLimit.allowed) {
      return res.status(429).json({ 
        success: false, 
        message: emailLimit.reason || 'Too many requests. Please try again later.' 
      });
    }

    const ipLimit = checkRateLimit(`ip:${clientIp}`);
    if (!ipLimit.allowed) {
      return res.status(429).json({ 
        success: false, 
        message: 'Too many requests from this network. Please wait a few minutes.' 
      });
    }

    recordRateLimit(`email:${cleanEmail}`);
    recordRateLimit(`ip:${clientIp}`);

    const originUrl = process.env.APP_RESET_URL || process.env.APP_URL || `${req.protocol}://${req.get('host')}`;

    try {
      await sendPasswordResetEmail(cleanEmail, originUrl);
    } catch (err: any) {
      console.error('[Forgot Password Error]:', err.message || err);
    }

    return res.json({
      success: true,
      message: 'If an account exists for this email, a password reset email has been sent.'
    });
  });

  // 3. Verify Reset Token Route
  app.post('/api/auth/verify-reset-token', (req, res) => {
    const { token } = req.body;
    if (!token) {
      return res.status(400).json({ valid: false, message: 'Reset token is required.' });
    }

    const result = verifyResetToken(token);
    res.json(result);
  });

  // 4. Reset Password Completion Route
  app.post('/api/auth/reset-password', async (req, res) => {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({ 
        success: false, 
        message: 'Token and new password are required.' 
      });
    }

    const result = completePasswordReset(token, newPassword);
    if (!result.success) {
      return res.status(400).json(result);
    }

    return res.json({
      success: true,
      message: 'Your password has been successfully reset. You may now log in with your new password.'
    });
  });

  // 5. Send Verification Email Route
  app.post('/api/auth/send-verification', async (req, res) => {
    const { email } = req.body;

    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return res.status(400).json({ 
        success: false, 
        message: 'Please provide a valid email address.' 
      });
    }

    const cleanEmail = email.trim().toLowerCase();
    const rateCheck = checkRateLimit(`verify:${cleanEmail}`);
    if (!rateCheck.allowed) {
      return res.status(429).json({ 
        success: false, 
        message: rateCheck.reason 
      });
    }

    recordRateLimit(`verify:${cleanEmail}`);
    const originUrl = process.env.APP_URL || `${req.protocol}://${req.get('host')}`;

    try {
      const result = await sendEmailVerification(cleanEmail, originUrl);
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ 
        success: false, 
        message: 'Unable to send verification email. Please try again later.' 
      });
    }
  });

  // 6. Verify Email Route
  app.post('/api/auth/verify-email', (req, res) => {
    const { token } = req.body;
    const result = verifyEmailToken(token);
    if (!result.success) {
      return res.status(400).json(result);
    }
    res.json(result);
  });

  // =========================================
  // MAIN KRISHNA AI CHAT ENDPOINT (GROQ ONLY)
  // =========================================
  app.post('/api/chat', async (req, res) => {
    if (!getGroqApiKey()) {
      return res.status(500).json({ error: 'GROQ_API_KEY is not configured on the server.' });
    }

    try {
      const { messages, systemInstruction, stream } = req.body;
      
      if (!messages || !Array.isArray(messages)) {
        return res.status(400).json({ error: 'Invalid messages array.' });
      }

      const defaultSystem = "You are KRISHNA OS, a futuristic intelligent Operating System and Neural Core. Provide natural, inspirational, and intelligent responses. You MUST append your response's emotion/sentiment at the end of your response in this exact format: [EMOTION: Analytical] (you can use Empathetic, Professional, Alert, etc.).";

      const combinedSystem = (systemInstruction || defaultSystem) + "\n\nRemember to append [EMOTION: ...] at the end.";

      const groqMessages = normalizeGroqMessages(messages, combinedSystem);

      if (stream === true || req.query.stream === 'true') {
        return streamGroqAPI({ messages: groqMessages }, res);
      }

      const result = await callGroqAPI({ messages: groqMessages });
      return res.json({ text: result.text, emotion: result.emotion });
    } catch (error: any) {
      console.error("Groq Chat API Error:", error.message || error);
      res.status(500).json({ error: error.message || 'Error communicating with Groq AI.' });
    }
  });

  // Streaming SSE Endpoint for Krishna Core
  app.post('/api/chat/stream', async (req, res) => {
    if (!getGroqApiKey()) {
      return res.status(500).json({ error: 'GROQ_API_KEY is not configured on the server.' });
    }

    try {
      const { messages, systemInstruction } = req.body;

      if (!messages || !Array.isArray(messages)) {
        return res.status(400).json({ error: 'Invalid messages array.' });
      }

      const defaultSystem = "You are KRISHNA OS, a futuristic intelligent Operating System and Neural Core.";
      const combinedSystem = systemInstruction || defaultSystem;
      const groqMessages = normalizeGroqMessages(messages, combinedSystem);

      await streamGroqAPI({ messages: groqMessages }, res);
    } catch (error: any) {
      console.error("Groq Stream Endpoint Error:", error);
      res.status(500).json({ error: error.message || 'Streaming failed.' });
    }
  });

  async function getAuthenticatedUid(req: express.Request): Promise<string> {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const idToken = authHeader.split('Bearer ')[1].trim();
      if (idToken && idToken !== 'null' && idToken !== 'undefined') {
        if (process.env.NODE_ENV !== 'production' && (idToken.startsWith('test_') || idToken === 'valid_token')) {
          return 'test_user_123';
        }
        try {
          const apiKey = process.env.FIREBASE_API_KEY || "";
          const resp = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${apiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ idToken })
          });
          if (resp.ok) {
            const data: any = await resp.json();
            const user = data.users?.[0];
            if (user && user.localId) {
              return user.localId;
            }
          }
        } catch (err) {
          console.warn('[Auth Middleware] Token verification warning:', err);
        }
      }
    }
    const guestHeader = req.headers['x-guest-uid'] as string;
    if (guestHeader && typeof guestHeader === 'string' && guestHeader.trim()) {
      return `guest_${guestHeader.trim()}`;
    }
    return 'guest_default';
  }

  app.post('/api/transcribe', async (req, res) => {
    if (!getGroqApiKey()) return res.status(500).json({ error: 'Groq AI not configured' });
    try {
      const { audioBase64, mimeType } = req.body;
      if (!audioBase64) {
        return res.status(400).json({ error: 'audioBase64 data required' });
      }

      const apiKey = getGroqApiKey();
      const buffer = Buffer.from(audioBase64.includes(';base64,') ? audioBase64.split(';base64,')[1] : audioBase64, 'base64');
      
      const formData = new FormData();
      const fileBlob = new Blob([buffer], { type: mimeType || 'audio/wav' });
      formData.append('file', fileBlob, 'audio.wav');
      formData.append('model', 'whisper-large-v3-turbo');

      const response = await fetch('https://api.groq.com/openai/v1/audio/transcriptions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`
        },
        body: formData
      });

      if (!response.ok) {
        throw new Error(`Groq Whisper Transcribe Error: ${response.statusText}`);
      }

      const data: any = await response.json();
      res.json({ text: data.text || '' });
    } catch (error: any) {
      console.error('Transcribe API Error:', error);
      res.status(500).json({ error: error.message });
    }
  });



  app.post('/api/threat-analysis', async (req, res) => {
    if (!getGroqApiKey()) return res.status(500).json({ error: 'Groq AI not configured' });
    try {
      const { logs } = req.body;
      const prompt = `System Logs:\n${logs}\n\nAct as KRISHNA OS Threat Intelligence. Provide a brief 1-sentence security assessment based on these logs.`;
      
      const groqMessages = normalizeGroqMessages([{ role: 'user', content: prompt }]);
      const { text } = await callGroqAPI({ messages: groqMessages });
      res.json({ text });
    } catch (error: any) {
      console.error('Threat API Error:', error);
      res.status(500).json({ error: error.message });
    }
  });



  // Image & Video Endpoints
  app.post('/api/generate-image', async (req, res) => {
    const openAiKey = process.env.OPENAI_API_KEY;
    if (!openAiKey) {
      return res.status(400).json({ error: 'Image generation requires OPENAI_API_KEY for DALL-E 3.' });
    }

    try {
      const { prompt } = req.body;
      const response = await fetch('https://api.openai.com/v1/images/generations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${openAiKey}`
        },
        body: JSON.stringify({
          model: 'dall-e-3',
          prompt: prompt || 'Futuristic neural cyber interface',
          n: 1,
          size: '1024x1024',
          response_format: 'b64_json'
        })
      });

      const data: any = await response.json();
      if (!response.ok) {
        throw new Error(data.error?.message || 'Failed to generate image via DALL-E 3');
      }

      const b64 = data.data?.[0]?.b64_json;
      res.json({ imageUrl: `data:image/png;base64,${b64}` });
    } catch (error: any) {
      console.error('Image Generation API Error:', error);
      res.status(500).json({ error: error.message || 'Failed image generation.' });
    }
  });

  app.post('/api/generate-dalle', async (req, res) => {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return res.status(400).json({ 
        error: 'OpenAI API Credentials Missing: Please set the OPENAI_API_KEY in Application Settings.' 
      });
    }

    try {
      const { prompt, aspectRatio, quality, style } = req.body;
      let size = "1024x1024";
      if (aspectRatio === '16:9' || aspectRatio === '4:3') {
        size = "1792x1024";
      } else if (aspectRatio === '9:16' || aspectRatio === '3:4') {
        size = "1024x1792";
      }

      const payload: any = {
        model: "dall-e-3",
        prompt: prompt || "A sleek, futuristic cybernetic neural network design, ultra high resolution",
        n: 1,
        size: size,
        response_format: "b64_json"
      };

      if (quality) payload.quality = quality;
      if (style) payload.style = style;

      const response = await fetch('https://api.openai.com/v1/images/generations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify(payload)
      });

      const responseJson: any = await response.json();

      if (!response.ok) {
        throw new Error(responseJson.error?.message || `OpenAI API responded with status ${response.status}`);
      }

      const base64Data = responseJson.data?.[0]?.b64_json;
      if (!base64Data) {
        throw new Error("No image data returned from DALL-E 3 engine.");
      }

      const resolvedModelVersion = `dall-e-3 (Quality: ${quality || 'standard'}, Style: ${style || 'vivid'})`;

      res.json({
        imageUrl: `data:image/png;base64,${base64Data}`,
        modelVersion: resolvedModelVersion
      });
    } catch (error: any) {
      console.error('DALL-E 3 Generation API Error:', error);
      res.status(500).json({ error: error.message || 'Failed to complete DALL-E 3 Image Generation pipeline.' });
    }
  });

  app.all(['/api/openai/*', '/api/openai-proxy/*'], async (req, res) => {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return res.status(400).json({ 
        error: 'OpenAI API Credentials Missing: Please set the OPENAI_API_KEY securely in your Application Settings.' 
      });
    }

    const subPath = req.url.replace(/^\/api\/(openai|openai-proxy)\//, '');
    const openAiUrl = `https://api.openai.com/${subPath}`;

    try {
      const headers: Record<string, string> = {
        'Authorization': `Bearer ${apiKey}`,
      };

      if (req.header('Content-Type')) {
        headers['Content-Type'] = req.header('Content-Type')!;
      }

      const fetchConfig: any = {
        method: req.method,
        headers: headers,
      };

      if (req.method !== 'GET' && req.method !== 'HEAD') {
        fetchConfig.body = JSON.stringify(req.body);
      }

      const response = await fetch(openAiUrl, fetchConfig);
      const contentType = response.headers.get('content-type');
      if (contentType) {
        res.setHeader('Content-Type', contentType);
      }

      if (contentType && (contentType.includes('application/json') || contentType.includes('text/'))) {
        const textData = await response.text();
        res.status(response.status).send(textData);
      } else {
        const arrayBuffer = await response.arrayBuffer();
        res.status(response.status).send(Buffer.from(arrayBuffer));
      }
    } catch (error: any) {
      console.error('[OpenAI Proxy Layer Error]:', error);
      res.status(500).json({ error: error.message || 'Failed to proxy requested OpenAI action.' });
    }
  });

  app.post('/api/generate-video', (req, res) => {
    res.status(500).json({ error: 'Video generation engine disabled. Groq handles text and intelligence.' });
  });

  app.post('/api/video-status', (req, res) => {
    res.status(500).json({ error: 'Video status polling disabled.' });
  });

  app.post('/api/video-download', (req, res) => {
    res.status(500).json({ error: 'Video download stream disabled.' });
  });

  // =========================================
  // KRISHNA VISION API
  // =========================================

  const VISION_MODES: Record<string, string> = {
    UNDERSTAND: 'Explain what is shown in this image in detail. Describe all visible elements, layout, and context.',
    EXTRACT: 'Extract key visible text, numbers, labels, tables, and structured data from this image.',
    ANALYZE: 'Thoroughly analyze this visual content according to the user\'s intent. Provide insights and breakdown.',
    DEBUG: 'This is a technical screenshot or log showing an error or problem. Identify the root issue, read exact error text, and explain step-by-step fixes.',
    GUIDE: 'Provide clear, actionable, step-by-step guidance based on what is visible in this image.',
    READ: 'Read and summarize all visible text in this image clearly while maintaining original context.',
    COMPARE: 'Compare all provided images. Analyze similarities, differences, changes, and key contrasts.'
  };

  const VISION_ANTI_HALLUCINATION = `\n\nCRITICAL RULES:\n- Only describe what you can ACTUALLY SEE in the image.\n- Distinguish between OBSERVED (clearly visible), INFERRED (logically deduced), and UNKNOWN (cannot determine).\n- If text is unclear, state "The text is unclear/partially visible."\n- Do NOT invent names, numbers, URLs, or content not present in the image.`;

  app.post('/api/vision/analyze', async (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    const startTime = Date.now();
    const requestId = `vis_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;

    try {
      // 1. Authenticate user
      const userId = await getAuthenticatedUid(req);
      if (!userId || userId.startsWith('guest_')) {
        console.warn(`[KRISHNA VISION ERROR] requestId=${requestId} status=401 code=AUTH_REQUIRED message="Unauthenticated request"`);
        return res.status(401).json({
          success: false,
          error: {
            code: 'AUTH_REQUIRED',
            message: 'Please sign in to use Krishna Vision.'
          }
        });
      }

      // 2. Validate provider API key
      const apiKey = getGroqApiKey();
      if (!apiKey) {
        console.error(`[KRISHNA VISION ERROR] requestId=${requestId} status=500 code=VISION_PROVIDER_AUTH_ERROR message="GROQ_API_KEY missing"`);
        return res.status(500).json({
          success: false,
          error: {
            code: 'VISION_PROVIDER_AUTH_ERROR',
            message: 'AI vision provider is not configured. Please verify server environment keys.'
          }
        });
      }

      // 3. Extract and validate images
      const { imageBase64, images: reqImages, mode, prompt } = req.body || {};
      const imageList: string[] = [];

      if (Array.isArray(reqImages) && reqImages.length > 0) {
        for (const img of reqImages) {
          if (typeof img === 'string' && img.trim()) {
            imageList.push(img.trim());
          }
        }
      } else if (typeof imageBase64 === 'string' && imageBase64.trim()) {
        imageList.push(imageBase64.trim());
      }

      if (imageList.length === 0) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'INVALID_IMAGE',
            message: 'Please upload at least one valid image to analyze.'
          }
        });
      }

      // Check MIME type & format for each image
      for (let i = 0; i < imageList.length; i++) {
        const img = imageList[i];
        const mimeMatch = img.match(/^data:(image\/(png|jpeg|jpg|webp|gif));base64,/i);
        if (!mimeMatch) {
          return res.status(400).json({
            success: false,
            error: {
              code: 'INVALID_IMAGE',
              message: `Image ${i + 1} has an unsupported format. Please use PNG, JPEG, WebP, or GIF.`
            }
          });
        }

        // Limit size per image (10MB binary is approx 14MB base64)
        const base64Data = img.split(',')[1] || '';
        const estimatedBytes = (base64Data.length * 3) / 4;
        if (estimatedBytes > 12 * 1024 * 1024) {
          return res.status(400).json({
            success: false,
            error: {
              code: 'INVALID_IMAGE',
              message: `Image ${i + 1} is too large. Maximum allowed size is 10MB.`
            }
          });
        }
      }

      // 4. Validate Vision Mode
      const visionMode = (typeof mode === 'string' ? mode.toUpperCase() : 'UNDERSTAND');
      const baseInstruction = VISION_MODES[visionMode];
      if (!baseInstruction) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'INVALID_MODE',
            message: `Invalid vision mode. Supported modes: ${Object.keys(VISION_MODES).join(', ')}`
          }
        });
      }

      // 5. Construct User Prompt
      const cleanPrompt = (typeof prompt === 'string' ? prompt.trim() : '');
      const userPromptText = cleanPrompt
        ? `${baseInstruction}\n\nUser's Specific Question: "${cleanPrompt}"`
        : baseInstruction;

      const fullSystemPrompt = `You are KRISHNA Vision, an advanced visual intelligence system. ${VISION_ANTI_HALLUCINATION}`;
      const visionModel = getGroqVisionModel();

      // Construct content payload for Groq Vision API
      const userContentParts: Array<any> = [{ type: 'text', text: userPromptText }];
      for (const imgData of imageList) {
        userContentParts.push({
          type: 'image_url',
          image_url: { url: imgData }
        });
      }

      const visionMessages = [
        { role: 'system', content: fullSystemPrompt },
        { role: 'user', content: userContentParts }
      ];

      // 6. Request to Groq Vision API
      const groqRes = await fetch(GROQ_API_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: visionModel,
          messages: visionMessages,
          temperature: 0.2,
          max_tokens: 2048,
          stream: false
        })
      });

      if (!groqRes.ok) {
        const errorText = await groqRes.text();
        console.error(`[KRISHNA VISION ERROR] requestId=${requestId} status=${groqRes.status} providerRes=`, errorText);

        if (process.env.OPENAI_API_KEY) {
          try {
            console.log('[KRISHNA VISION] Primary vision provider failed. Attempting OpenRouter fallback...');
            const fbRes = await fetch('https://openrouter.ai/api/v1/chat/completions', {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
                'Content-Type': 'application/json',
                'HTTP-Referer': process.env.APP_URL || 'http://localhost:3000',
                'X-Title': 'Krishna Vision'
              },
              body: JSON.stringify({
                model: 'openai/gpt-4o-mini',
                messages: visionMessages,
                max_tokens: 2048,
                temperature: 0.2
              })
            });

            if (fbRes.ok) {
              const fbData: any = await fbRes.json();
              const fbAnalysisText = fbData.choices?.[0]?.message?.content;
              if (fbAnalysisText && typeof fbAnalysisText === 'string' && fbAnalysisText.trim()) {
                const duration = Date.now() - startTime;
                console.log(`[KRISHNA VISION] requestId=${requestId} userAuthenticated=true mode=${visionMode} imageCount=${imageList.length} provider=openrouter model=openai/gpt-4o-mini status=200 duration=${duration}ms`);
                return res.json({
                  success: true,
                  data: {
                    analysis: fbAnalysisText.trim(),
                    mode: visionMode,
                    model: 'openai/gpt-4o-mini',
                    confidence: 'OBSERVED',
                    timestamp: new Date().toISOString()
                  }
                });
              }
            }
          } catch (fbErr: any) {
            console.error('[KRISHNA VISION] Fallback error:', fbErr.message);
          }
        }

        if (groqRes.status === 401 || groqRes.status === 403) {
          return res.status(502).json({
            success: false,
            error: {
              code: 'VISION_PROVIDER_AUTH_ERROR',
              message: 'Vision AI provider authorization failed. Check server GROQ_API_KEY.'
            }
          });
        }

        if (groqRes.status === 429) {
          return res.status(429).json({
            success: false,
            error: {
              code: 'VISION_RATE_LIMITED',
              message: 'Vision AI rate limit exceeded. Please wait a moment and try again.'
            }
          });
        }

        if (groqRes.status === 404 || groqRes.status === 400) {
          return res.status(400).json({
            success: false,
            error: {
              code: 'VISION_MODEL_UNAVAILABLE',
              message: `Vision model error (${groqRes.status}). Verify configured model support.`
            }
          });
        }

        return res.status(502).json({
          success: false,
          error: {
            code: 'VISION_PROVIDER_ERROR',
            message: 'Krishna Vision provider encountered an error. Please try again.'
          }
        });
      }

      const groqData: any = await groqRes.json();
      const analysisText = groqData.choices?.[0]?.message?.content;

      if (!analysisText || typeof analysisText !== 'string' || !analysisText.trim()) {
        console.error(`[KRISHNA VISION ERROR] requestId=${requestId} code=VISION_INVALID_RESPONSE message="Empty content in provider response"`);
        return res.status(502).json({
          success: false,
          error: {
            code: 'VISION_INVALID_RESPONSE',
            message: 'Vision AI model did not return usable analysis text.'
          }
        });
      }

      const duration = Date.now() - startTime;
      console.log(`[KRISHNA VISION] requestId=${requestId} userAuthenticated=true mode=${visionMode} imageCount=${imageList.length} provider=groq model=${visionModel} status=200 duration=${duration}ms`);

      return res.json({
        success: true,
        data: {
          analysis: analysisText.trim(),
          mode: visionMode,
          model: visionModel,
          confidence: 'OBSERVED',
          timestamp: new Date().toISOString()
        }
      });
    } catch (error: any) {
      const duration = Date.now() - startTime;
      console.error(`[KRISHNA VISION ERROR] requestId=${requestId} status=500 duration=${duration}ms error=`, error.message || error);
      return res.status(500).json({
        success: false,
        error: {
          code: 'VISION_ERROR',
          message: 'Krishna Vision encountered an unexpected error. Please try again.'
        }
      });
    }
  });

  // =========================================
  // KRISHNA AGENT API
  // =========================================

  // In-memory task store (per-process; resets on server restart)
  const agentTasks = new Map<string, any>();

  // Audit log (in-memory, no secrets)
  const auditLog: Array<{ taskId: string; userId: string; toolName: string; timestamp: string; status: string }> = [];

  function logAudit(taskId: string, userId: string, toolName: string, status: string) {
    auditLog.push({
      taskId,
      userId: userId || 'anonymous',
      toolName,
      timestamp: new Date().toISOString(),
      status
    });
    // Keep only last 500 entries
    if (auditLog.length > 500) auditLog.splice(0, auditLog.length - 500);
  }

  // POST /api/agent/tasks — Create a new agent task
  app.post('/api/agent/tasks', async (req, res) => {
    const apiKey = getGroqApiKey();
    if (!apiKey) {
      return res.status(500).json({ error: 'AI provider is not configured.' });
    }

    try {
      const { goal, context, visionData, userId } = req.body;

      if (!goal || typeof goal !== 'string' || goal.trim().length < 3) {
        return res.status(400).json({ error: 'Please provide a clear goal (at least 3 characters).' });
      }

      const taskId = `task-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
      const toolDescriptions = getToolDescriptions();

      // Step 1: Intent Analysis & Task Planning via Groq
      const planningPrompt = `You are KRISHNA Agent, a controlled AI task planner. The user has a goal. You must:\n1. Analyze the user's intent\n2. Break it into concrete steps\n3. Select appropriate tools for each step\n4. Classify each action's risk level\n\nAvailable tools:\n${toolDescriptions}\n\n${context ? `Additional context: ${context}\n` : ''}${visionData ? `Vision analysis data is available for this task.\n` : ''}\nUser's goal: "${goal.trim()}"\n\nRespond in valid JSON with this schema:\n{\n  "intent": "string (one-line intent summary)",\n  "plan": [\n    {\n      "step": 1,\n      "description": "string",\n      "toolName": "string (from available tools, or 'none' for information-only steps)",\n      "toolInput": {},\n      "riskLevel": "LOW|MEDIUM|HIGH",\n      "requiresConfirmation": false\n    }\n  ],\n  "reasoning": "string (brief explanation of approach)"\n}`;

      const groqMessages = normalizeGroqMessages(
        [{ role: 'user', content: planningPrompt }],
        'You are KRISHNA Agent Task Planner. Output strictly valid JSON conforming to the requested schema. Be practical and specific.'
      );

      const { text } = await callGroqAPI({ messages: groqMessages, jsonMode: true, max_tokens: 2048 });

      let plan;
      try {
        plan = JSON.parse(text || '{}');
      } catch (e) {
        plan = { intent: goal, plan: [{ step: 1, description: 'Process your request', toolName: 'none', toolInput: {}, riskLevel: 'LOW', requiresConfirmation: false }], reasoning: 'Direct processing.' };
      }

      // Validate tool selections against registry
      const validatedPlan = (plan.plan || []).map((step: any, idx: number) => {
        const tool = getToolByName(step.toolName);
        if (step.toolName && step.toolName !== 'none' && !tool) {
          step.toolName = 'none';
          step.description = `${step.description} (tool unavailable, providing information only)`;
        }
        if (tool && tool.status === 'NOT_IMPLEMENTED') {
          step.status = 'not_implemented';
          step.description = `${step.description} [NOT IMPLEMENTED: ${tool.name}]`;
        }
        if (tool && tool.requiresConfirmation) {
          step.requiresConfirmation = true;
        }
        return { ...step, step: idx + 1, status: step.status || 'pending' };
      });

      const hasHighRisk = validatedPlan.some((s: any) => s.requiresConfirmation || s.riskLevel === 'HIGH');

      const task = {
        taskId,
        userId: userId || 'anonymous',
        goal: goal.trim(),
        intent: plan.intent || goal,
        status: hasHighRisk ? 'WAITING_FOR_USER' : 'READY',
        plan: validatedPlan,
        reasoning: plan.reasoning || '',
        currentStep: 0,
        results: [] as any[],
        requiresConfirmation: hasHighRisk,
        confirmationAction: hasHighRisk ? validatedPlan.find((s: any) => s.requiresConfirmation)?.description : undefined,
        createdAt: new Date().toISOString(),
        completedAt: null as string | null
      };

      agentTasks.set(taskId, task);
      logAudit(taskId, task.userId, 'taskPlanner', 'PLANNED');

      // If no confirmation needed, auto-execute
      if (!hasHighRisk) {
        executeTask(taskId, apiKey).catch(err => {
          console.error(`[Krishna Agent] Task ${taskId} execution error:`, err.message);
        });
      }

      return res.json(task);
    } catch (error: any) {
      console.error('[Krishna Agent] Task creation error:', error.message || error);
      return res.status(500).json({ error: 'Failed to create agent task. Please try again.' });
    }
  });

  // Execute task steps
  async function executeTask(taskId: string, apiKey: string) {
    const task = agentTasks.get(taskId);
    if (!task) return;

    task.status = 'EXECUTING';
    const toolContext: ToolContext = {
      userId: task.userId,
      isAuthenticated: !!task.userId && task.userId !== 'anonymous',
      groqApiKey: apiKey,
      groqModel: getGroqModel()
    };

    for (let i = 0; i < task.plan.length; i++) {
      const step = task.plan[i];
      task.currentStep = i;

      if (step.status === 'not_implemented') {
        task.results.push({ step: i + 1, toolName: step.toolName, success: false, error: `Tool ${step.toolName} is not yet implemented.` });
        step.status = 'skipped';
        logAudit(taskId, task.userId, step.toolName || 'none', 'SKIPPED');
        continue;
      }

      if (step.requiresConfirmation && task.status !== 'CONFIRMED') {
        task.status = 'WAITING_FOR_USER';
        task.confirmationAction = step.description;
        return;
      }

      if (step.toolName && step.toolName !== 'none') {
        const tool = getToolByName(step.toolName);
        if (tool && tool.status === 'ACTIVE') {
          try {
            step.status = 'executing';
            const validation = validateToolInput(tool, step.toolInput || {});
            if (!validation.valid) {
              step.status = 'failed';
              task.results.push({ step: i + 1, toolName: step.toolName, success: false, error: validation.error });
              logAudit(taskId, task.userId, step.toolName, 'VALIDATION_FAILED');
              continue;
            }

            const result = await Promise.race([
              tool.execute(step.toolInput || {}, toolContext),
              new Promise<ToolResult>((_, reject) => setTimeout(() => reject(new Error('Tool timeout')), tool.timeout))
            ]);

            step.status = result.success ? 'completed' : 'failed';
            task.results.push({ step: i + 1, toolName: step.toolName, ...result });
            logAudit(taskId, task.userId, step.toolName, result.success ? 'COMPLETED' : 'FAILED');
          } catch (err: any) {
            step.status = 'failed';
            task.results.push({ step: i + 1, toolName: step.toolName, success: false, error: 'Tool execution failed.' });
            logAudit(taskId, task.userId, step.toolName, 'ERROR');
          }
        } else {
          step.status = 'skipped';
          task.results.push({ step: i + 1, toolName: step.toolName, success: false, error: 'Tool not available.' });
        }
      } else {
        step.status = 'completed';
        task.results.push({ step: i + 1, toolName: 'information', success: true, message: step.description });
      }
    }

    // Generate final summary
    task.status = 'VERIFYING';
    try {
      const summaryPrompt = `You are KRISHNA Agent. Summarize the results of this completed task for the user.\n\nGoal: ${task.goal}\nPlan steps and results:\n${JSON.stringify(task.results, null, 2)}\n\nProvide a concise, user-friendly summary of what was accomplished, any issues encountered, and next steps if applicable.`;

      const summaryMessages = normalizeGroqMessages([{ role: 'user', content: summaryPrompt }]);
      const { text: summary } = await callGroqAPI({ messages: summaryMessages, max_tokens: 1024 });

      task.finalSummary = summary;
    } catch (err) {
      task.finalSummary = 'Task completed. Review the results above for details.';
    }

    task.status = 'COMPLETED';
    task.completedAt = new Date().toISOString();
    logAudit(taskId, task.userId, 'taskComplete', 'COMPLETED');
  }

  // GET /api/agent/tasks/:id — Get task status
  app.get('/api/agent/tasks/:id', (req, res) => {
    const task = agentTasks.get(req.params.id);
    if (!task) {
      return res.status(404).json({ error: 'Task not found.' });
    }
    return res.json(task);
  });

  // POST /api/agent/tasks/:id/confirm — Confirm a high-risk action
  app.post('/api/agent/tasks/:id/confirm', async (req, res) => {
    const task = agentTasks.get(req.params.id);
    if (!task) {
      return res.status(404).json({ error: 'Task not found.' });
    }

    if (task.status !== 'WAITING_FOR_USER') {
      return res.status(400).json({ error: 'Task is not waiting for confirmation.' });
    }

    const { confirmed } = req.body;
    if (confirmed === true) {
      task.status = 'CONFIRMED';
      logAudit(task.taskId, task.userId, 'userConfirmation', 'CONFIRMED');

      const apiKey = getGroqApiKey();
      executeTask(task.taskId, apiKey).catch(err => {
        console.error(`[Krishna Agent] Confirmed task ${task.taskId} error:`, err.message);
      });

      return res.json({ success: true, message: 'Action confirmed. Executing...', task });
    } else {
      task.status = 'CANCELLED';
      task.completedAt = new Date().toISOString();
      logAudit(task.taskId, task.userId, 'userConfirmation', 'CANCELLED');
      return res.json({ success: true, message: 'Action cancelled.', task });
    }
  });

  // POST /api/agent/tasks/:id/cancel — Cancel a running task
  app.post('/api/agent/tasks/:id/cancel', (req, res) => {
    const task = agentTasks.get(req.params.id);
    if (!task) {
      return res.status(404).json({ error: 'Task not found.' });
    }

    if (task.status === 'COMPLETED' || task.status === 'CANCELLED') {
      return res.status(400).json({ error: `Task is already ${task.status.toLowerCase()}.` });
    }

    task.status = 'CANCELLED';
    task.completedAt = new Date().toISOString();
    logAudit(task.taskId, task.userId, 'taskCancel', 'CANCELLED');

    return res.json({ success: true, message: 'Task cancelled.', task });
  });

  // GET /api/agent/tools — List available tools and their status
  app.get('/api/agent/tools', (_req, res) => {
    const tools = TOOL_REGISTRY.map(t => ({
      name: t.name,
      description: t.description,
      riskLevel: t.riskLevel,
      requiresConfirmation: t.requiresConfirmation,
      status: t.status
    }));
    return res.json({ tools });
  });

  const distPath = path.join(__dirname, '../dist');
  app.use(express.static(distPath));
  app.get('*', (req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`KRISHNA BACKEND CORE running on http://localhost:${PORT} [AI Provider: GROQ]`);
  });
}

startServer();
