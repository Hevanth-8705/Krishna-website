import { useState, useEffect, useRef } from 'react';
import { useSystemStore } from '../store/system';
import { 
  ShieldCheck, ShieldAlert, Cpu, Heart, Activity, User, BookOpen, MapPin, 
  Wind, Volume2, Globe, Sparkles, Key, Terminal, Mic, Shield, Star, 
  Accessibility, AlertCircle, Ban, Play, VolumeX, RefreshCw, Send, ArrowRight,
  Tv, Lock, Eye, AlertTriangle, CheckCircle2, ChevronRight, Phone, Download, Clock, Fingerprint, Filter
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

import { BiometricLock } from '../components/BiometricLock';
interface AppPermission {
  name: string;
  packageName: string;
  unsafePermissions: string[];
  threatLevel: 'HIGH' | 'MEDIUM' | 'LOW';
  scanned: boolean;
}

interface ThreatLog {
  time: string;
  event: string;
  category: 'cyber' | 'physical' | 'wellbeing' | 'financial';
  severity: 'high' | 'medium' | 'info';
}

interface BiometricLog {
  id: string;
  timestamp: Date;
  userId: string;
  outcome: 'success' | 'failed' | 'aborted';
}

export default function KrishnaGuardian() {
  const { setSystemMetrics, cpuUsage, memoryUsage } = useSystemStore();
  const [activeTab, setActiveTab] = useState<'cyber' | 'sos' | 'wellbeing' | 'access' | 'environ' | 'offline' | 'audit' | 'sandbox' | 'biometric'>('cyber');
  const [biometricLogs, setBiometricLogs] = useState<BiometricLog[]>([
    { id: 'sim-1', timestamp: new Date(Date.now() - 1000 * 60 * 5), userId: 'SYSTEM_MAINTENANCE', outcome: 'success' },
    { id: 'sim-2', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), userId: 'UNKNOWN_ENTITY', outcome: 'failed' }
  ]);
  const [biometricFilter, setBiometricFilter] = useState<'all' | 'success' | 'failed' | 'aborted'>('all');
  const [biometricSort, setBiometricSort] = useState<'date-desc' | 'date-asc' | 'user-asc'>('date-desc');

  const handleBiometricAttempt = (outcome: 'success' | 'failed' | 'aborted') => {
    setBiometricLogs(prev => [
      {
        id: Math.random().toString(36).substring(7),
        timestamp: new Date(),
        userId: 'KR-ADMIN-01',
        outcome
      },
      ...prev
    ].slice(0, 30));
  };
  
  // Audio chime feedback generator
  const playSfx = (freq: number, type: OscillatorType = 'sine', duration: number = 0.08) => {
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      gain.gain.setValueAtTime(0.05, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch (e) {
      console.warn("Audio Context blocked by browser permission policy.", e);
    }
  };

  // Toast system state
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'warn' | 'info' } | null>(null);
  const showToast = (message: string, type: 'success' | 'warn' | 'info' = 'info') => {
    setToast({ message, type });
    playSfx(type === 'success' ? 980 : (type === 'warn' ? 440 : 660), 'sine', 0.15);
    setTimeout(() => setToast(null), 3500);
  };

  // ----------------------------------------------------
  // Tab 1: Scam Detection & Cyber Security State
  // ----------------------------------------------------
  const [spamInput, setSpamInput] = useState('');
  const [spamResult, setSpamResult] = useState<{
    score: number;
    phishingRisk: 'CRITICAL' | 'SUSPICIOUS' | 'SAFE' | null;
    analysis: string[];
    reputation: string;
  } | null>(null);
  const [isSpamAnalyzing, setIsSpamAnalyzing] = useState(false);

  // Live Neural Social Engineering & Scam Analyzer States (Gemini-infused)
  const [aiSpamScanResult, setAiSpamScanResult] = useState<{
    score: number;
    risk: 'CRITICAL' | 'SUSPICIOUS' | 'SAFE';
    summary: string;
    psychologicalTriggers: string[];
    riskPoints: string[];
    defenseAdvice: string[];
  } | null>(null);
  const [isAiSpamAnalyzing, setIsAiSpamAnalyzing] = useState(false);

  // Installed app scanning simulators
  const [apps, setApps] = useState<AppPermission[]>([
    { name: 'PhotoFilter Pro', packageName: 'com.filter.beautypro', unsafePermissions: ['READ_SMS', 'RECEIVE_BOOT_COMPLETED', 'REQUEST_INSTALL_PACKAGES'], threatLevel: 'HIGH', scanned: false },
    { name: 'Flashlight Ultra', packageName: 'com.flashlight.neon.best', unsafePermissions: ['RECORD_AUDIO', 'ACCESS_COARSE_LOCATION'], threatLevel: 'MEDIUM', scanned: false },
    { name: 'Chatify Lite', packageName: 'com.chatify.messengers.free', unsafePermissions: ['SYSTEM_ALERT_WINDOW'], threatLevel: 'MEDIUM', scanned: false },
    { name: 'MyBank App Mobile', packageName: 'com.finance.mybank.auth', unsafePermissions: [], threatLevel: 'LOW', scanned: false },
  ]);
  const [scanningApp, setScanningApp] = useState<string | null>(null);

  // Deep Audit
  const [auditReport, setAuditReport] = useState<string | null>(null);
  const [isAuditing, setIsAuditing] = useState(false);

  const performDeepAudit = async () => {
    setIsAuditing(true);
    setAuditReport(null);
    playSfx(480, 'sine', 0.2);
    try {
      const appData = apps.map(a => `${a.name} (${a.packageName}): ${a.unsafePermissions.join(', ')}`).join('\\n');
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [{ role: 'user', content: `Perform a deep cybersecurity audit on these installed apps and their permissions. Evaluate the risk of privilege escalation or data exfiltration. Output a highly technical but human readable risk report.\n\nApps:\n${appData}` }],
          systemInstruction: 'You are KRISHNA OS Security Guardian. Provide a rigorous, analytical cybersecurity deep-scan report. Focus on privilege abuse.'
        })
      });
      const rawText = await res.text();
      let data: any = {};
      if (rawText && rawText.trim()) {
        try { data = JSON.parse(rawText); } catch (e) {}
      }
      if (data.text) {
        setAuditReport(data.text);
        showToast('Deep Audit Completed Successfully', 'success');
      } else {
        setAuditReport('AI Error: Report structure invalid.');
        showToast('Audit Error', 'warn');
      }
    } catch (e) {
      console.error(e);
      setAuditReport('Failed to connect to Neural Core.');
      showToast('Connection failed', 'warn');
    } finally {
      setIsAuditing(false);
    }
  };

  // Financial safety state
  const [transactions, setTransactions] = useState([
    { id: 't1', merchant: 'Unknown Svc Ltd (via Overseas gateway)', amount: '$299.00', date: 'Today, 08:34 AM', type: 'OTP Bypass Hazard', flag: 'high' },
    { id: 't2', merchant: 'DirectStreaming Premiums (Auto-Renewal)', amount: '$14.99', date: 'Yesterday, 11:20 PM', type: 'Undisclosed Dark Pattern', flag: 'medium' },
    { id: 't3', merchant: 'Weekly Fun Game Premium Passes', amount: '$49.99', date: 'May 26, 2026', type: 'Unsolicited Child Purchase', flag: 'medium' },
    { id: 't4', merchant: 'Local Grocery Market', amount: '$34.50', date: 'May 25, 2026', type: 'Standard Check-out', flag: 'safe' }
  ]);

  const handleSpamScan = () => {
    if (!spamInput.trim()) return;
    setIsSpamAnalyzing(true);
    playSfx(520, 'triangle', 0.1);
    
    setTimeout(() => {
      const text = spamInput.toLowerCase();
      let score = 15;
      let risk: 'CRITICAL' | 'SUSPICIOUS' | 'SAFE' = 'SAFE';
      const analysis: string[] = ['Sender context scrutinized against Krishna Global ScamDB.'];

      if (text.includes('otp') || text.includes('one-time password') || text.includes('verify')) {
        score += 35;
        analysis.push('Contains request for transactional validation variables (OTP targets).');
      }
      if (text.includes('link') || text.includes('http') || text.includes('bit.ly') || text.includes('tinyurl')) {
        score += 25;
        analysis.push('Features high-obfuscation URL redirect redirecting outside standard domains.');
      }
      if (text.includes('urgent') || text.includes('suspend') || text.includes('block') || text.includes('immediately')) {
        score += 20;
        analysis.push('Utilizes extreme emotional manipulation / urgency triggers.');
      }
      if (text.includes('win') || text.includes('lottery') || text.includes('claim') || text.includes('crore')) {
        score += 30;
        analysis.push('Exhibits classic windfall lottery scam indicators.');
      }

      score = Math.min(score, 100);
      if (score > 70) risk = 'CRITICAL';
      else if (score > 35) risk = 'SUSPICIOUS';

      setSpamResult({
        score,
        phishingRisk: risk,
        analysis,
        reputation: score > 70 ? 'Hostile phishing server signature matched' : 'Unknown / Unverified sender'
      });
      setIsSpamAnalyzing(false);
      showToast(risk === 'CRITICAL' ? 'HOSTILE ATTACK SOURCE PARSED!' : 'Scanning parameters finalized.', risk === 'CRITICAL' ? 'warn' : 'success');
    }, 1500);
  };

  const handleAiSpamScan = async () => {
    if (!spamInput.trim()) return;
    setIsAiSpamAnalyzing(true);
    setAiSpamScanResult(null);
    playSfx(620, 'sawtooth', 0.25);
    showToast("Launching Cognitive AI Social engineering analysis...", "info");
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [
            {
              role: 'user',
              parts: [{
                text: `You are the KRISHNA OS Scam Shield Engine. Perform a dynamic, deep social engineering threat scan of this message context, analyzing psychological hooks, urgent manipulation patterns, identity-theft risk, and financial fraud intent.

Message text to scan:
"${spamInput}"

Respond STRICTLY in JSON format. Do NOT wrap your response in backticks or any markdown code blocks. It must be a raw JSON parsable object matching this exact schema:
{
  "score": number (0-100 indicating scam likelihood),
  "risk": "CRITICAL" | "SUSPICIOUS" | "SAFE",
  "summary": "Brief 1-sentence analytical overview of what this message is trying to achieve",
  "psychologicalTriggers": ["trigger 1 (e.g. Scarcity/Urgency)", "trigger 2 (e.g. Authority Impersonation)"],
  "riskPoints": ["point 1: analysis of the link/sender", "point 2: analysis of the call to action", "point 3: threat explanation"],
  "defenseAdvice": ["proactive safety step 1", "proactive safety step 2", "proactive safety step 3"]
}`
              }]
            }
          ],
          systemInstruction: 'You are the intelligence security core of KRISHNA OS. Output only raw, compliant JSON. Never include markdown code block syntax (like triple backticks or ```json).'
        })
      });

      const data = await res.json();
      if (data.text) {
        let cleanText = data.text.trim();
        if (cleanText.startsWith('```json')) {
          cleanText = cleanText.substring(7);
        }
        if (cleanText.startsWith('```')) {
          cleanText = cleanText.substring(3);
        }
        if (cleanText.endsWith('```')) {
          cleanText = cleanText.substring(0, cleanText.length - 3);
        }
        cleanText = cleanText.trim();

        const scanJson = JSON.parse(cleanText);
        setAiSpamScanResult({
          score: typeof scanJson.score === 'number' ? scanJson.score : 50,
          risk: scanJson.risk || 'SUSPICIOUS',
          summary: scanJson.summary || 'A suspicious communication requiring extreme vigilance.',
          psychologicalTriggers: scanJson.psychologicalTriggers || ['Manipulative wording'],
          riskPoints: scanJson.riskPoints || ['Unverified link or sender profile', 'Implicit pressure tactics'],
          defenseAdvice: scanJson.defenseAdvice || ['Do not share OTP parameters', 'Double check the official domain directly']
        });
        showToast('Neural Threat Assessment Complete', 'success');
      } else {
        throw new Error('Empirical model feedback missing.');
      }
    } catch (e: any) {
      console.warn("AI Scam Scanner connection fell back to local diagnostics:", e);
      // Beautiful fallback simulation if API fluctuates or isn't connected
      const textLower = spamInput.toLowerCase();
      let score = 38;
      let risk: 'CRITICAL' | 'SUSPICIOUS' | 'SAFE' = 'SUSPICIOUS';
      let triggers = ['Urgent call to action', 'Incomplete identity verification'];
      let warnings = ['Unregistered telephone carrier block', 'Requesting action outside secure app dashboards'];
      let advice = ['Instruct zero credentials.', 'Contact service helplines through verified sites.', 'Block immediate numbers.'];

      if (textLower.includes('otp') || textLower.includes('password') || textLower.includes('verify') || textLower.includes('blocked') || textLower.includes('suspend')) {
        score = 88;
        risk = 'CRITICAL';
        triggers = ['Extreme fear of authority', 'Artificial system locking threat'];
        warnings = ['Explicit OTP harvesting variables matched', 'Severe domain redirection spoofing warning'];
        advice = ['Never declare OTP secrets to callers.', 'Revoke banking access if any link was clicked.', 'Audit live device log files.'];
      }

      setAiSpamScanResult({
        score,
        risk,
        summary: 'Heuristics Core engine computed scam profile safely.',
        psychologicalTriggers: triggers,
        riskPoints: warnings,
        defenseAdvice: advice
      });
      showToast('Completed local safety heuristic analysis', 'info');
    } finally {
      setIsAiSpamAnalyzing(false);
    }
  };

  const scanApk = (pkg: string) => {
    setScanningApp(pkg);
    playSfx(880, 'square', 0.15);
    setTimeout(() => {
      setApps(prev => prev.map(a => a.packageName === pkg ? { ...a, scanned: true } : a));
      setScanningApp(null);
      showToast(`Malware signature assessment on package ${pkg} completed.`, 'success');
    }, 2000);
  };

  // ----------------------------------------------------
  // Tab 2: Emergency SOS, Health & Sentinel State
  // ----------------------------------------------------
  const [sosActive, setSosActive] = useState(false);
  const [gpsCoordinates, setGpsCoordinates] = useState('Latitude: 17.3850° N, Longitude: 78.4867° E (Awaiting Broadcast)');
  const [recordingStatus, setRecordingStatus] = useState<'IDLE' | 'RECORDING'>('IDLE');
  const [fallTimer, setFallTimer] = useState<number | null>(null);
  const [healthStatus, setHealthStatus] = useState({
    symptoms: '',
    riskAssessment: 'UNDEDICTED',
    actionPlan: '',
    nearestHosp: ''
  });
  const [isHealthAnalyzing, setIsHealthAnalyzing] = useState(false);

  const triggerSOS = () => {
    const nextState = !sosActive;
    setSosActive(nextState);
    if (nextState) {
      setGpsCoordinates('Latitude: 17.4129° N, Longitude: 78.4418° E (Realtime Broadcast Activated)');
      setRecordingStatus('RECORDING');
      showToast("SOLAR DEFENSE SENTINEL ARMED! SOS alerts sent to emergency guardians.", "warn");
      setSystemMetrics({ threatLevel: 'HIGH', activeModules: 12 });
      
      // Infinite alert noise
      playSfx(880, 'sine', 0.3);
      setTimeout(() => playSfx(1100, 'sine', 0.3), 350);
    } else {
      setGpsCoordinates('Latitude: 17.3850° N, Longitude: 78.4867° E (Awaiting Broadcast)');
      setRecordingStatus('IDLE');
      showToast("SOS Mode terminated. Reverting perimeter protocols.", "success");
      setSystemMetrics({ threatLevel: 'LOW', activeModules: 8 });
    }
  };

  const simulateFall = () => {
    setFallTimer(10);
    showToast("CRITICAL KINETIC DECELERATION DETECTED! Potential user fall event sensed.", "warn");
    playSfx(330, 'sawtooth', 0.4);
  };

  useEffect(() => {
    if (fallTimer === null) return;
    if (fallTimer <= 0) {
      setFallTimer(null);
      triggerSOS();
      return;
    }
    const iv = setInterval(() => {
      setFallTimer(p => (p !== null ? p - 1 : null));
      playSfx(500, 'sine', 0.05);
    }, 1000);
    return () => clearInterval(iv);
  }, [fallTimer]);

  const analyzeSymptoms = () => {
    if (!healthStatus.symptoms.trim()) return;
    setIsHealthAnalyzing(true);
    playSfx(600, 'triangle', 0.2);

    setTimeout(() => {
      const txt = healthStatus.symptoms.toLowerCase();
      let risk = 'LOW RISK';
      let plan = 'Monitor stats. Hydrate adequately.';
      let hosp = 'Hyderabad Specialty Clinic (1.4 km)';

      if (txt.includes('chest') || txt.includes('breath') || txt.includes('heart') || txt.includes('tight')) {
        risk = 'HIGH HEALTH HAZARD DETECTED';
        plan = 'Administer aspirin, maintain standard upright respiration. Dynamic SOS speed-dials initialized.';
        hosp = 'Prestige Emergency Trauma Center (0.8 km) - Emergency ward alerted.';
      } else if (txt.includes('fever') || txt.includes('pain') || txt.includes('headache')) {
        risk = 'MODERATE SYSTEM REST STATE ADVISED';
        plan = 'Take paracetamol rest. Monitor body thermal indices at 30-minute variables.';
        hosp = 'Global Care Outpatient Wing (2.1 km)';
      }

      setHealthStatus(prev => ({
        ...prev,
        riskAssessment: risk,
        actionPlan: plan,
        nearestHosp: hosp
      }));
      setIsHealthAnalyzing(false);
      showToast("Health parameters parsed with recommendation metrics.", "info");
    }, 1800);
  };

  // ----------------------------------------------------
  // Tab 3: Student Distraction, Well-being & Emotional Support
  // ----------------------------------------------------
  const [focusActive, setFocusActive] = useState(false);
  const [focusTimer, setFocusTimer] = useState(25 * 60);
  const [stressLevel, setStressLevel] = useState(40);
  const [isBreathingIn, setIsBreathingIn] = useState(true);
  const [parentLockActive, setParentLockActive] = useState(false);
  const [parentPin, setParentPin] = useState('');
  const [parentLogs, setParentLogs] = useState([
    { app: 'Telegram messenger', action: 'Prevented launching during school block window', time: '10:14 AM' },
    { app: 'Unsafe adult content portal lookup', action: 'Forced DNS-over-HTTPS sinkhole redirect', time: '09:42 AM' },
    { app: 'Intrusive high-frequency gaming service', action: 'Restricted usage duration to 30m', time: '08:15 AM' }
  ]);

  // Pomodoro focus loop
  useEffect(() => {
    if (!focusActive) return;
    const iv = setInterval(() => {
      setFocusTimer(t => {
        if (t <= 1) {
          playSfx(880, 'sine', 0.5);
          showToast("Focus block complete! Great work restricting distraction targets.", "success");
          setFocusActive(false);
          return 25 * 60;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(iv);
  }, [focusActive]);

  // Diaphragmatic breath visualizer looping effect
  useEffect(() => {
    const iv = setInterval(() => {
      setIsBreathingIn(p => {
        const next = !p;
        // Synthesizing calming frequency sweeps matching breathing state!
        playSfx(next ? 180 : 130, 'sine', 0.6);
        return next;
      });
    }, 4500);
    return () => clearInterval(iv);
  }, []);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  // ----------------------------------------------------
  // Tab 4: Language Translator & Universal Accessibility
  // ----------------------------------------------------
  const [ocrText, setOcrText] = useState('');
  const [targetLang, setTargetLang] = useState('Telugu');
  const [translatedText, setTranslatedText] = useState('');
  const [isTranslating, setIsTranslating] = useState(false);
  const [fontSizeLarge, setFontSizeLarge] = useState(false);
  const [voiceReaderActive, setVoiceReaderActive] = useState(false);

  const performTranslation = () => {
    if (!ocrText.trim()) return;
    setIsTranslating(true);
    playSfx(480, 'sine', 0.1);

    setTimeout(() => {
      let tText = '';
      if (targetLang === 'Telugu') {
        tText = 'కృష్ణ OS లోపల సంపూర్ణ భద్రత మరియు రియల్-టైమ్ అసిస్టెంట్ మోడ్ విజయవంతంగా క్రియాశీలం చేయబడింది.';
      } else if (targetLang === 'Tamil') {
        tText = 'கிருஷ்ணா OS க்குள் முழுமையான பாதுகாப்பு மற்றும் நிகழ்நேர உதவியாளர் பயன்முறை வெற்றிகரமாக செயல்படுத்தப்பட்டது.';
      } else if (targetLang === 'Hindi') {
        tText = 'कृष्णा ओएस के भीतर पूर्ण सुरक्षा और वास्तविक समय सहायक मोड सफलतापूर्वक सक्रिय हो गया है।';
      } else {
        tText = 'Krishna OS dynamic OCR parser resolved safety parameters correctly.';
      }

      setTranslatedText(tText);
      setIsTranslating(false);
      showToast("OCR Language translation mapped successfully.", "success");
    }, 1200);
  };

  const toggleScreenReader = () => {
    const next = !voiceReaderActive;
    setVoiceReaderActive(next);
    if (next) {
      showToast("Universal HUD Screen Reader Online. Pitch scale tuned high.", "info");
      playSfx(440, 'triangle', 0.3);
    } else {
      showToast("Voice Accessibility feedback engine returned standby.", "success");
    }
  };

  // ----------------------------------------------------
  // Tab 5: Environmental Noise, Safety-Aware Routes & Commute
  // ----------------------------------------------------
  const [noiseLevel, setNoiseLevel] = useState(48); // decibels
  const [airQuality, setAirQuality] = useState(32); // US AQI
  const [selectedRoute, setSelectedRoute] = useState<'quick' | 'illuminated'>('quick');

  // Extreme Weather & Climate Crisis Sentinel state declarations
  const [activeCrisisScenario, setActiveCrisisScenario] = useState<'none' | 'heatwave' | 'flood' | 'smog' | 'outage'>('none');
  const [powerCapacityMilliAmpHours, setPowerCapacityMilliAmpHours] = useState<number>(10000); // mAh
  const [runningDevicesPowerUsageWatts, setRunningDevicesPowerUsageWatts] = useState({
    phone: true,      // 5W
    flashlight: false, // 1.5W
    radio: false,      // 2W
    waterpump: false   // 12W
  });
  const [emergencyChecklist, setEmergencyChecklist] = useState({
    water: false,
    rations: false,
    meds: false,
    radio: false,
    powerbank: false,
    flashlight: false
  });

  // Simulated live update loop for noise & environment indicators
  useEffect(() => {
    const iv = setInterval(() => {
      setNoiseLevel(p => Math.max(30, Math.min(110, p + Math.round((Math.random() - 0.5) * 8))));
      setAirQuality(p => Math.max(10, Math.min(160, p + Math.round((Math.random() - 0.5) * 4))));
    }, 7000);
    return () => clearInterval(iv);
  }, []);

  // ----------------------------------------------------
  // Tab 6: Offline-Native AI Core
  // ----------------------------------------------------
  const [isNetConnected, setIsNetConnected] = useState(true);
  const [offlineInput, setOfflineInput] = useState('');
  const [offlineRawOutput, setOfflineRawOutput] = useState<string[]>([
    'Local Neural Matrix 1.5B (Quantized) loaded into RAM blocks.',
    'System standby. Execute standalone prompt handshakes...'
  ]);

  const handleOfflineQuery = () => {
    if (!offlineInput.trim()) return;
    const text = offlineInput;
    setOfflineInput('');
    setOfflineRawOutput(prev => [...prev, `user@krishna_local:~$ ${text}`]);
    playSfx(780, 'square', 0.08);

    setTimeout(() => {
      let reply = "LOCAL_MODEL: Direct execution compiled inside sandbox boundaries. External API bypassed correctly.";
      const sub = text.toLowerCase();

      if (sub.includes('scam') || sub.includes('fraud')) {
        reply = "LOCAL_CORE WARNING: Unsolicited financial pressure cues matched. Reject immediate token transfers.";
      } else if (sub.includes('breathe') || sub.includes('calm')) {
        reply = "LOCAL_CORE WELLNESS: Pacing respiratory loops is highly recommended. Set focus variables higher.";
      } else if (sub.includes('help') || sub.includes('emergency')) {
        reply = "LOCAL_CORE ACTIVATION: SOS alert protocols can run locally over cellular mesh grid if WIFI is severed.";
      }

      setOfflineRawOutput(prev => [...prev, reply]);
      playSfx(900, 'triangle', 0.12);
    }, 600);
  };

  // ----------------------------------------------------
  // Tab 8: Neural Cybersecurity Sandbox & Real-time Emulator States
  // ----------------------------------------------------
  const [sandboxThreatId, setSandboxThreatId] = useState<'none' | 'ddos' | 'ransomware' | 'sql_inject' | 'mitm' | 'zero_day' | 'custom'>('none');
  const [customThreatPrompt, setCustomThreatPrompt] = useState('');
  const [customThreatTitle, setCustomThreatTitle] = useState('');
  const [customThreatDesc, setCustomThreatDesc] = useState('');
  const [customThreatRequirements, setCustomThreatRequirements] = useState<{
    rateLimitMax?: number;
    firewallMin?: number;
    mfaRequirement?: 'sms' | 'fido2' | 'none';
    encryptionMin?: number;
    dbSanitizerMin?: number;
    patchFrequencyRequirement?: 'weekly' | 'real-time' | 'monthly';
  }>({});
  const [isGeneratingCustomThreat, setIsGeneratingCustomThreat] = useState(false);

  const [sandboxScore, setSandboxScore] = useState(100);
  const [sandboxLogs, setSandboxLogs] = useState<string[]>([
    '[INIT] KRISHNA OS Cyber Shield sandbox loaded in offline partition.',
    '[INIT] Standby mode active. Choose threat vector below to execute dynamic stress testing.'
  ]);

  // Vulnerability nodes sliders state
  const [sandboxRateLimit, setSandboxRateLimit] = useState(1000); // 50 - 2000 req/s (Standard config: 1000)
  const [sandboxFirewall, setSandboxFirewall] = useState(1);       // 1 - 5 strictness level
  const [sandboxMfa, setSandboxMfa] = useState<'none' | 'sms' | 'fido2'>('none');
  const [sandboxEncryption, setSandboxEncryption] = useState<128 | 256 | 4096>(128);
  const [sandboxDbSanitizer, setSandboxDbSanitizer] = useState(1); // 1 - 5 level
  const [sandboxPatchFreq, setSandboxPatchFreq] = useState<'monthly' | 'weekly' | 'real-time'>('monthly');

  // Trigger automated simulation threats
  const triggerSandboxThreat = (threat: typeof sandboxThreatId) => {
    playSfx(480, 'sawtooth', 0.15);
    setSandboxThreatId(threat);
    setSandboxScore(75); // system security index compromised instantly
    
    let label = '';
    let detail = '';
    if (threat === 'ddos') {
      label = '[SIMULATION STARTED] Distributed Denial of Service (DDoS)';
      detail = '[ATTACK VECTOR] 15,000 bots flooding Gateway Node. High probability of memory starvation fallback!';
    } else if (threat === 'ransomware') {
      label = '[SIMULATION STARTED] Ransomware Propagation Blockade';
      detail = '[ATTACK VECTOR] Malicious crypto-jacking package executed. Seeking unprotected user database folders!';
    } else if (threat === 'sql_inject') {
      label = '[SIMULATION STARTED] Blind SQL Injection';
      detail = '[ATTACK VECTOR] Threat agent executing raw system drop requests on unsecured text forms!';
    } else if (threat === 'mitm') {
      label = '[SIMULATION STARTED] Subnet Man-in-the-Middle (MitM)';
      detail = '[ATTACK VECTOR] Local network bridge wiretapped. Dynamic access keys read in root frame!';
    } else if (threat === 'zero_day') {
      label = '[SIMULATION STARTED] Zero-Day Kernel Bypass';
      detail = '[ATTACK VECTOR] Buffer allocation overflow in network assembly bindings. Executing host escalation!';
    }

    setSandboxLogs(prev => [
      ...prev,
      label,
      detail,
      '[ALERT] Security Index dropped to 75%. Tune Node Parameters to patch vulnerability!'
    ].slice(-15));
    showToast(`${threat.toUpperCase()} threat stream launched!`, "warn");
  };

  // Check mitigating defense status
  const checkThreatMitigated = (): { mitigated: boolean; reason: string } => {
    switch (sandboxThreatId) {
      case 'ddos':
        if (sandboxRateLimit <= 200 && sandboxFirewall >= 3) {
          return { mitigated: true, reason: "Gateway rate metrics throttled (<=200 req/sec) + active firewall strictness." };
        }
        return { mitigated: false, reason: "Decrease Gateway Rate Limiting to <= 200 req/sec and raise Firewall Strictness to Tier 3+ to dump packet overflows." };
      case 'ransomware':
        if (sandboxEncryption >= 256 && sandboxPatchFreq !== 'monthly') {
          return { mitigated: true, reason: "Advanced encryption (>=256-bit) and dynamic patching system active." };
        }
        return { mitigated: false, reason: "Enable symmetric encryption key strength >= 256-bit and change Patch Frequency to Weekly or higher to lock directories." };
      case 'sql_inject':
        if (sandboxDbSanitizer >= 4) {
          return { mitigated: true, reason: "AST Query Sanitization level active, enforcing parsed parameter validation." };
        }
        return { mitigated: false, reason: "Increase Database query sanitization filter strictness to Tier 4 or higher to escape injected syntaxes." };
      case 'mitm':
        if (sandboxMfa === 'fido2' && sandboxEncryption === 4096) {
          return { mitigated: true, reason: "Hardware validated FIDO2 tokens and enterprise high-entropy ciphers active." };
        }
        return { mitigated: false, reason: "MFA parameter must be updated to hardware-token backed FIDO2, and Encryption level must be set to 4096-bit secure blocks." };
      case 'zero_day':
        if (sandboxPatchFreq === 'real-time' && sandboxFirewall >= 4) {
          return { mitigated: true, reason: "Continuous real-time patch pipeline and Firewall defense structures validated." };
        }
        return { mitigated: false, reason: "Solder memory leak by hot-swapping patch compilation frequency to Real-time, and elevating Firewall strictness >= Tier 4." };
      case 'custom':
        let meetsRate = !customThreatRequirements.rateLimitMax || sandboxRateLimit <= customThreatRequirements.rateLimitMax;
        let meetsFirewall = !customThreatRequirements.firewallMin || sandboxFirewall >= customThreatRequirements.firewallMin;
        let meetsMfa = !customThreatRequirements.mfaRequirement || 
          (customThreatRequirements.mfaRequirement === 'sms' && (sandboxMfa === 'sms' || sandboxMfa === 'fido2')) ||
          (customThreatRequirements.mfaRequirement === 'fido2' && sandboxMfa === 'fido2') ||
          (customThreatRequirements.mfaRequirement === 'none');
        let meetsEnc = !customThreatRequirements.encryptionMin || sandboxEncryption >= customThreatRequirements.encryptionMin;
        let meetsSanitizer = !customThreatRequirements.dbSanitizerMin || sandboxDbSanitizer >= customThreatRequirements.dbSanitizerMin;
        let meetsPatch = !customThreatRequirements.patchFrequencyRequirement ||
          (customThreatRequirements.patchFrequencyRequirement === 'monthly') ||
          (customThreatRequirements.patchFrequencyRequirement === 'weekly' && (sandboxPatchFreq === 'weekly' || sandboxPatchFreq === 'real-time')) ||
          (customThreatRequirements.patchFrequencyRequirement === 'real-time' && sandboxPatchFreq === 'real-time');

        if (meetsRate && meetsFirewall && meetsMfa && meetsEnc && meetsSanitizer && meetsPatch) {
          return { mitigated: true, reason: "All custom neural protection parameters fully satisfied by active dashboard state adjustment." };
        }
        const actions = [];
        if (!meetsRate) actions.push(`rate limit <= ${customThreatRequirements.rateLimitMax} req/s`);
        if (!meetsFirewall) actions.push(`firewall tier >= ${customThreatRequirements.firewallMin}`);
        if (!meetsMfa) actions.push(`MFA set to "${customThreatRequirements.mfaRequirement}"`);
        if (!meetsEnc) actions.push(`encryption >= ${customThreatRequirements.encryptionMin}-bit`);
        if (!meetsSanitizer) actions.push(`database filter level >= ${customThreatRequirements.dbSanitizerMin}`);
        if (!meetsPatch) actions.push(`patch cycle set to "${customThreatRequirements.patchFrequencyRequirement}"`);
        return { mitigated: false, reason: `Neural discrepancies found. Action needed: Change ${actions.join(', ')}.` };
      default:
        return { mitigated: true, reason: "Stanby configuration active." };
    }
  };

  // Auto Heal simulation parameters to instant resolve
  const autoHealParameters = () => {
    playSfx(880, 'sine', 0.25);
    showToast("AI Self-Healing Autopilot Activated!", "success");
    if (sandboxThreatId === 'ddos') {
      setSandboxRateLimit(150);
      setSandboxFirewall(4);
    } else if (sandboxThreatId === 'ransomware') {
      setSandboxEncryption(256);
      setSandboxPatchFreq('weekly');
    } else if (sandboxThreatId === 'sql_inject') {
      setSandboxDbSanitizer(5);
    } else if (sandboxThreatId === 'mitm') {
      setSandboxMfa('fido2');
      setSandboxEncryption(4096);
    } else if (sandboxThreatId === 'zero_day') {
      setSandboxPatchFreq('real-time');
      setSandboxFirewall(5);
    } else if (sandboxThreatId === 'custom') {
      if (customThreatRequirements.rateLimitMax) setSandboxRateLimit(customThreatRequirements.rateLimitMax);
      if (customThreatRequirements.firewallMin) setSandboxFirewall(customThreatRequirements.firewallMin);
      if (customThreatRequirements.mfaRequirement) setSandboxMfa(customThreatRequirements.mfaRequirement);
      if (customThreatRequirements.encryptionMin) setSandboxEncryption(customThreatRequirements.encryptionMin as any);
      if (customThreatRequirements.dbSanitizerMin) setSandboxDbSanitizer(customThreatRequirements.dbSanitizerMin);
      if (customThreatRequirements.patchFrequencyRequirement) setSandboxPatchFreq(customThreatRequirements.patchFrequencyRequirement);
    }
    setSandboxLogs(prev => [
      ...prev,
      '[AI AUTOPILOT] Re-calculated optimum security margins.',
      '[AI AUTOPILOT] Reprogramming node sliders and patching credentials...'
    ].slice(-15));
  };

  // Dynamic threat scanner via AI model with local heuristics fallback
  const generateAICustomThreat = async () => {
    if (!customThreatPrompt.trim()) return;
    setIsGeneratingCustomThreat(true);
    setSandboxThreatId('none');
    playSfx(550, 'sawtooth', 0.2);
    showToast("Interrogating Neural Core for cyber threat vectors...", "info");

    const promptText = customThreatPrompt;
    setCustomThreatPrompt('');

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [
            {
              role: 'user',
              parts: [{
                text: `You are the KRISHNA OS Threat Sandbox Modeler. Given the user's custom cyber threat query, generate a highly detailed simulated cyberattack scenario.
                
Custom Threat Query:
"${promptText}"

Respond STRICTLY in JSON format. Do NOT wrap your response in backticks or any markdown code blocks. It must be a raw JSON parsable object matching this exact schema:
{
  "title": "A short descriptive name of this custom threat scenario",
  "description": "A 2-sentence explanation of what this threat is and how it targets the system nodes",
  "rateLimitMax": number | null,
  "firewallMin": number | null,
  "mfaRequirement": "fido2" | "sms" | "none" | null,
  "encryptionMin": number | null,
  "dbSanitizerMin": number | null,
  "patchFrequencyRequirement": "weekly" | "real-time" | "monthly" | null
}`
              }]
            }
          ],
          systemInstruction: 'You are an advanced cybersecurity simulator. Answer strictly with raw JSON conforming to the requested schema. Do not write any markdown wrappers.'
        })
      });

      const data = await res.json();
      if (data.text) {
        let cleanText = data.text.trim();
        if (cleanText.startsWith('```json')) {
          cleanText = cleanText.substring(7);
        }
        if (cleanText.startsWith('```')) {
          cleanText = cleanText.substring(3);
        }
        if (cleanText.endsWith('```')) {
          cleanText = cleanText.substring(0, cleanText.length - 3);
        }
        cleanText = cleanText.trim();

        const threatJson = JSON.parse(cleanText);
        setCustomThreatTitle(threatJson.title || "Custom Exploitation Vector");
        setCustomThreatDesc(threatJson.description || "A custom compiled threat targeting active system bounds.");
        setCustomThreatRequirements({
          rateLimitMax: threatJson.rateLimitMax || undefined,
          firewallMin: threatJson.firewallMin || undefined,
          mfaRequirement: threatJson.mfaRequirement || undefined,
          encryptionMin: threatJson.encryptionMin || undefined,
          dbSanitizerMin: threatJson.dbSanitizerMin || undefined,
          patchFrequencyRequirement: threatJson.patchFrequencyRequirement || undefined,
        });

        setSandboxThreatId('custom');
        setSandboxScore(80);
        setSandboxLogs(prev => [
          ...prev,
          `[AI ENGINE] Spawned scenario: ${threatJson.title}`,
          `[AI ENGINE] Vector explanation: ${threatJson.description}`,
          `[SYSTEM] Security index compromised to 80%!`
        ].slice(-15));
        showToast("Neural Threat Matrix Active!", "success");
      } else {
        throw new Error("Missing content text.");
      }
    } catch (e) {
      console.warn("AI cyber sandbox generator fallback:", e);
      const lower = promptText.toLowerCase();
      let title = "Zero-Day Memory Leak";
      let desc = "An unpatched socket allocation discrepancy targets memory registers. Adjust nodes to patch.";
      let reqs: any = { firewallMin: 4, patchFrequencyRequirement: 'real-time' };

      if (lower.includes('chain') || lower.includes('solar') || lower.includes('supply')) {
        title = "Supply-Chain Package Hack";
        desc = "Malicious downstream open-source components hijack memory hooks. Demands real-time container patching and high key entropy.";
        reqs = { patchFrequencyRequirement: 'real-time', encryptionMin: 256 };
      } else if (lower.includes('credentials') || lower.includes('stuffing') || lower.includes('brute')) {
        title = "Automated Brute-Force Authentication Stuffing";
        desc = "High frequency dictionary triggers crack basic credentials. Restrict ingress rate limiters and demand strong MFA parameters.";
        reqs = { rateLimitMax: 100, mfaRequirement: 'fido2' };
      }

      setCustomThreatTitle(title);
      setCustomThreatDesc(desc);
      setCustomThreatRequirements(reqs);
      setSandboxThreatId('custom');
      setSandboxScore(85);
      setSandboxLogs(prev => [
        ...prev,
        `[LOCAL ENGINE] Simulated vector: ${title}`,
        `[LOCAL ENGINE] Threat parameters mapped to local defensive standards.`,
        `[SYSTEM] Security index compromised to 85%!`
      ].slice(-15));
      showToast("Triggered Local Simulation Fallback", "info");
    } finally {
      setIsGeneratingCustomThreat(false);
    }
  };

  // Sandbox simulation running loop
  useEffect(() => {
    if (sandboxThreatId === 'none') return;
    const iv = setInterval(() => {
      const { mitigated, reason } = checkThreatMitigated();
      if (mitigated) {
        setSandboxScore(prev => {
          if (prev >= 100) {
            clearInterval(iv);
            setSandboxThreatId('none');
            setSandboxLogs(s => [
              ...s,
              `[SUCCESS] Vulnerability securely patched. Threat vector neutralized successfully.`,
              `[SUCCESS] Integrity level restored to 100% nominal state.`
            ].slice(-15));
            showToast("System Secured! Threat fully mitigated.", "success");
            return 100;
          }
          return Math.min(100, prev + 10);
        });
        setSandboxLogs(prev => {
          if (prev[prev.length - 1]?.startsWith('[SECURE]')) return prev;
          return [
            ...prev,
            `[SECURE] Defense alignment checked: ${reason}`,
            `[RECOVERY] Recovering CPU kernel memory allocations... Progressing.`
          ].slice(-15);
        });
      } else {
        setSandboxScore(prev => {
          const next = Math.max(10, prev - 4);
          if (next <= 25) {
            playSfx(140, 'sawtooth', 0.3);
          } else {
            playSfx(220, 'square', 0.085);
          }
          return next;
        });
        setSandboxLogs(prev => {
          if (Math.random() < 0.45) {
            return [
              ...prev,
              `[ATTACK PULSE] Intruders probing nodes... Warning: ${reason}`
            ].slice(-15);
          }
          return prev;
        });
      }
    }, 1500);
    return () => clearInterval(iv);
  }, [
    sandboxThreatId, sandboxRateLimit, sandboxFirewall, sandboxMfa, 
    sandboxEncryption, sandboxDbSanitizer, sandboxPatchFreq, customThreatRequirements
  ]);

  return (
    <div className={`space-y-6 max-w-7xl mx-auto pb-16 transition-all duration-300 ${fontSizeLarge ? 'text-lg' : 'text-sm'}`}>
      
      {/* Dynamic Visual Notification Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20, rotateX: -15 }}
            animate={{ opacity: 1, y: 0, rotateX: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className={`fixed top-4 right-4 z-50 flex items-center gap-3 p-4 rounded-xl border font-mono text-xs shadow-2xl backdrop-blur-md ${
              toast.type === 'warn' ? 'bg-[#FF3B3B]/15 border-[#FF3B3B]/30 text-[#FF3B3B]' :
              toast.type === 'success' ? 'bg-[#00FF9D]/15 border-[#00FF9D]/30 text-[#00FF9D]' :
              'bg-[#00E5FF]/15 border-[#00E5FF]/30 text-[#00E5FF]'
            }`}
          >
            <AlertCircle size={16} className="text-[currentColor] animate-pulse" />
            <span>{toast.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Page Title & Overview HUD Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#00E5FF]/10 pb-6">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#00E5FF] animate-ping" />
            <h1 className="text-2xl font-bold tracking-tight font-sans text-white">KRISHNA GUARDIAN SYSTEM</h1>
          </div>
          <p className="text-xs text-gray-400 font-mono tracking-widest uppercase">
            Ambient Security / Emergency SOS / wellbeing / Access Auto-Platforms
          </p>
        </div>

        {/* Global Control Widgets */}
        <div className="flex flex-wrap items-center gap-3">
          <button 
            onClick={() => setFontSizeLarge(!fontSizeLarge)}
            className={`px-3 py-1.5 rounded-lg border font-mono text-xs transition-all uppercase flex items-center gap-2 cursor-pointer ${
              fontSizeLarge ? 'bg-[#00E5FF]/20 border-[#00E5FF] text-white' : 'border-white/10 text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Accessibility size={13} />
            {fontSizeLarge ? 'Oversized Text On' : 'Standard Font Scale'}
          </button>

          <button 
            onClick={toggleScreenReader}
            className={`px-3 py-1.5 rounded-lg border font-mono text-xs transition-all uppercase flex items-center gap-2 cursor-pointer ${
              voiceReaderActive ? 'bg-[#00FF9D]/20 border-[#00FF9D] text-white' : 'border-white/10 text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Volume2 size={13} className={voiceReaderActive ? 'animate-bounce' : ''} />
            {voiceReaderActive ? 'Acoustic Narration Active' : 'Screen Reader Muted'}
          </button>
        </div>
      </div>

      {/* Real-time Threat Diagnostic Dashboard Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Core Security Status */}
        <div className="glass-panel p-4 flex items-center justify-between group cursor-pointer relative overflow-hidden">
          <div className="absolute -right-6 -bottom-6 w-16 h-16 bg-[#00FF9D]/5 rounded-full blur-xl group-hover:bg-[#00FF9D]/15 transition-all"></div>
          <div className="space-y-1 z-10">
            <p className="text-[10px] font-mono text-gray-400 tracking-wider">CYBER SHIELD STATUS</p>
            <h3 className="text-xl font-bold font-mono text-[#00FF9D]">SECURED SCANNER</h3>
            <p className="text-[10px] text-gray-500 font-mono">No active malware signatures</p>
          </div>
          <div className="p-3 bg-[#00FF9D]/10 border border-[#00FF9D]/20 text-[#00FF9D] rounded-xl z-10">
            <ShieldCheck size={20} className="animate-pulse" />
          </div>
        </div>

        {/* SOS Alert Gateway */}
        <div 
          onClick={triggerSOS}
          className={`glass-panel p-4 flex items-center justify-between group cursor-pointer relative overflow-hidden transition-all duration-300 ${
            sosActive ? 'border-red-500 bg-red-950/20' : 'hover:border-red-500/30'
          }`}
        >
          <div className="absolute -right-6 -bottom-6 w-16 h-16 bg-red-500/5 rounded-full blur-xl group-hover:bg-red-500/15 transition-all"></div>
          <div className="space-y-1 z-10">
            <p className="text-[10px] font-mono text-gray-400 tracking-wider">SOS GUARDIAN TRIGGER</p>
            <h3 className={`text-xl font-bold font-mono transition-colors ${sosActive ? 'text-red-500 animate-pulse' : 'text-gray-200'}`}>
              {sosActive ? 'ACTIVE BROADCAST' : 'ARMED / DELAYED'}
            </h3>
            <p className="text-[10px] text-gray-500 font-mono">Click to broadcast location</p>
          </div>
          <div className={`p-3 rounded-xl border z-10 ${
            sosActive ? 'bg-red-500/20 border-red-500 text-red-500 animate-ping' : 'bg-white/5 border-white/10 text-gray-400'
          }`}>
            <AlertTriangle size={20} />
          </div>
        </div>

        {/* Distraction/Focus Level */}
        <div className="glass-panel p-4 flex items-center justify-between group cursor-pointer relative overflow-hidden">
          <div className="absolute -right-6 -bottom-6 w-16 h-16 bg-[#00E5FF]/5 rounded-full blur-xl group-hover:bg-[#00E5FF]/15 transition-all"></div>
          <div className="space-y-1 z-10">
            <p className="text-[10px] font-mono text-gray-400 tracking-wider">FOCUS CONTROLS</p>
            <h3 className="text-xl font-bold font-mono text-[#00E5FF]">
              {focusActive ? 'RESTRICTION LIVE' : 'STUDENT BLOCKER'}
            </h3>
            <p className="text-[10px] text-gray-500 font-mono">{focusActive ? 'Social apps restricted' : 'Resting state configured'}</p>
          </div>
          <div className="p-3 bg-[#00E5FF]/10 border border-[#00E5FF]/20 text-[#00E5FF] rounded-xl z-10">
            <Ban size={20} className={focusActive ? 'animate-spin' : ''} />
          </div>
        </div>

        {/* Environmental Decibels */}
        <div className="glass-panel p-4 flex items-center justify-between group cursor-pointer relative overflow-hidden">
          <div className="absolute -right-6 -bottom-6 w-16 h-16 bg-[#A78BFA]/5 rounded-full blur-xl group-hover:bg-[#A78BFA]/15 transition-all"></div>
          <div className="space-y-1 z-10">
            <p className="text-[10px] font-mono text-gray-400 tracking-wider">ACOUSTIC DECIBELS</p>
            <h3 className="text-xl font-bold font-mono text-[#A78BFA]">
              {noiseLevel} dB SPL
            </h3>
            <p className="text-[10px] text-gray-500 font-mono">
              {noiseLevel > 80 ? 'Noise hazardous - wear plugs' : 'Acoustics comfortable'}
            </p>
          </div>
          <div className="p-3 bg-[#A78BFA]/10 border border-[#A78BFA]/20 text-[#A78BFA] rounded-xl z-10">
            <Activity size={20} className="animate-pulse" />
          </div>
        </div>

      </div>

      {/* Main Holographic Tabs Grid & Navigation */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        
        {/* Unified Sidebar Navigation inside Guard page */}
        <div className="glass-panel p-4 space-y-2 flex flex-row lg:flex-col overflow-x-auto lg:overflow-x-visible items-center lg:items-stretch scrollbar-none gap-2 lg:gap-0 z-10">
          <span className="text-[9px] font-mono font-bold uppercase tracking-widest text-[#00E5FF]/60 px-2 mb-2 hidden lg:block">
            Subsystem Selection
          </span>
          
          <button
            onClick={() => { setActiveTab('cyber'); playSfx(660); }}
            className={`w-full text-left font-mono text-xs px-4 py-3 rounded-lg border transition-all flex items-center gap-3 cursor-pointer flex-shrink-0 ${
              activeTab === 'cyber' 
                ? 'bg-[#00E5FF]/10 border-[#00E5FF]/40 text-[#00E5FF]' 
                : 'border-transparent text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Shield size={14} className={activeTab === 'cyber' ? 'animate-pulse' : ''} />
            <span>Cyber Shield & Fraud DB</span>
          </button>

          <button
            onClick={() => { setActiveTab('sos'); playSfx(660); }}
            className={`w-full text-left font-mono text-xs px-4 py-3 rounded-lg border transition-all flex items-center gap-3 cursor-pointer flex-shrink-0 ${
              activeTab === 'sos' 
                ? 'bg-[#FF3B3B]/10 border-[#FF3B3B]/40 text-[#FF3B3B]' 
                : 'border-transparent text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <AlertCircle size={14} className={activeTab === 'sos' ? 'animate-ping' : ''} />
            <span>SOS Sentinel & Health Check</span>
          </button>

          <button
            onClick={() => { setActiveTab('wellbeing'); playSfx(660); }}
            className={`w-full text-left font-mono text-xs px-4 py-3 rounded-lg border transition-all flex items-center gap-3 cursor-pointer flex-shrink-0 ${
              activeTab === 'wellbeing' 
                ? 'bg-[#00FF9D]/10 border-[#00FF9D]/40 text-[#00FF9D]' 
                : 'border-transparent text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Heart size={14} className={activeTab === 'wellbeing' ? 'animate-pulse' : ''} />
            <span>Wellbeing, Focus & Kids Lock</span>
          </button>

          <button
            onClick={() => { setActiveTab('access'); playSfx(660); }}
            className={`w-full text-left font-mono text-xs px-4 py-3 rounded-lg border transition-all flex items-center gap-3 cursor-pointer flex-shrink-0 ${
              activeTab === 'access' 
                ? 'bg-[#A78BFA]/10 border-[#A78BFA]/40 text-[#A78BFA]' 
                : 'border-transparent text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Accessibility size={14} />
            <span>Translator & Accessibility</span>
          </button>

          <button
            onClick={() => { setActiveTab('environ'); playSfx(660); }}
            className={`w-full text-left font-mono text-xs px-4 py-3 rounded-lg border transition-all flex items-center gap-3 cursor-pointer flex-shrink-0 ${
              activeTab === 'environ' 
                ? 'bg-[#F472B6]/10 border-[#F472B6]/40 text-[#F472B6]' 
                : 'border-transparent text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <MapPin size={14} />
            <span>Commute & Environment</span>
          </button>

          <button
            onClick={() => { setActiveTab('offline'); playSfx(660); }}
            className={`w-full text-left font-mono text-xs px-4 py-3 rounded-lg border transition-all flex items-center gap-3 cursor-pointer flex-shrink-0 ${
              activeTab === 'offline' 
                ? 'bg-yellow-400/10 border-yellow-400/30 text-yellow-400' 
                : 'border-transparent text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Key size={14} />
            <span>Offline Edge Sandbox AI</span>
          </button>

          <button
            onClick={() => { setActiveTab('audit'); playSfx(660); }}
            className={`w-full text-left font-mono text-xs px-4 py-3 rounded-lg border transition-all flex items-center gap-3 cursor-pointer flex-shrink-0 ${
              activeTab === 'audit' 
                ? 'bg-indigo-400/10 border-indigo-400/30 text-indigo-400' 
                : 'border-transparent text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <ShieldCheck size={14} className={activeTab === 'audit' ? 'animate-pulse' : ''} />
            <span>Cybersecurity Audit</span>
          </button>

          <button
            onClick={() => { setActiveTab('sandbox'); playSfx(660); }}
            className={`w-full text-left font-mono text-xs px-4 py-3 rounded-lg border transition-all flex items-center gap-3 cursor-pointer flex-shrink-0 ${
              activeTab === 'sandbox' 
                ? 'bg-[#00E5FF]/10 border-[#00E5FF]/40 text-[#00E5FF]' 
                : 'border-transparent text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Terminal size={14} className={activeTab === 'sandbox' ? 'animate-pulse' : ''} />
            <span>Neural Threat Sandbox</span>
          </button>

          <button
            onClick={() => { setActiveTab('biometric'); playSfx(660); }}
            className={`w-full text-left font-mono text-xs px-4 py-3 rounded-lg border transition-all flex items-center gap-3 cursor-pointer flex-shrink-0 ${
              activeTab === 'biometric' 
                ? 'bg-[#00FF9D]/10 border-[#00FF9D]/40 text-[#00FF9D]' 
                : 'border-transparent text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Lock size={14} className={activeTab === 'biometric' ? 'animate-pulse' : ''} />
            <span>Biometric Interface Lock</span>
          </button>

          {/* JARVIS-style Reactor Widget */}
          <div className="hidden lg:block pt-6 border-t border-white/5 mt-4 space-y-4">
            <span className="text-[9px] font-mono font-bold uppercase tracking-widest text-gray-500 px-2 block">
              Biometric Fusion
            </span>
            <div className="flex justify-center py-4 relative">
              <motion.div 
                animate={{ rotate: 360 }}
                transition={{ duration: 16, repeat: Infinity, ease: 'linear' }}
                className="w-24 h-24 rounded-full border border-dashed border-[#00E5FF]/20 flex items-center justify-center"
              >
                <div className="w-18 h-18 rounded-full border border-dotted border-[#00FF9D]/30 flex items-center justify-center">
                  <div className="w-12 h-12 rounded-full border border-[#FF3B3B]/40 flex items-center justify-center bg-black/40">
                    <Heart className="w-5 h-5 text-red-500 animate-pulse" />
                  </div>
                </div>
              </motion.div>
              {/* Dynamic pulse rings */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <span className="w-28 h-28 rounded-full border border-[#00E5FF]/10 animate-ping absolute opacity-40"></span>
              </div>
            </div>
            <div className="space-y-1.5 font-mono text-[8px] text-gray-500 px-2 text-center">
              <div>BIO_METRIC_FEED: SAFE_NOMINAL</div>
              <div>COGNITIVE_GRID: STABILIZED</div>
            </div>
          </div>

        </div>

        {/* Tab content panel */}
        <div className="lg:col-span-3 min-h-[500px]">
          
          {/* TAB 1: CYBER SECURITY / ANTI-SPAM */}
          <AnimatePresence mode="wait">
            {activeTab === 'cyber' && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="space-y-6"
              >
                
                {/* Antiphishing scanner panel */}
                <div className="glass-panel p-6 relative overflow-hidden">
                  <h2 className="text-lg font-semibold flex items-center gap-2 mb-4 text-[#00E5FF]">
                    <ShieldCheck className="w-5 h-5" /> Scam Phishing & Message Reputation Analyzer
                  </h2>
                  <p className="text-xs text-gray-400 mb-4 font-mono leading-relaxed">
                    Paste suspicious SMS texts, emails, OTP alerts, or WhatsApp notifications to check confidence variables, threat probabilities, and reputation indicators.
                  </p>

                  <div className="space-y-4">
                    <textarea
                      value={spamInput}
                      onChange={(e) => setSpamInput(e.target.value)}
                      placeholder="Paste suspicious text here (e.g. 'Dear customer, your bank key is expired. Verify OTP at http://sus-link.info to avoid blockade immediately.')"
                      className="w-full bg-black/30 border border-white/10 rounded-xl p-3.5 text-xs text-gray-200 focus:outline-none focus:border-[#00E5FF] h-24 font-mono leading-relaxed"
                    />

                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-black/20 p-2.5 rounded-xl border border-white/5">
                      <span className="text-[10px] font-mono text-gray-400 uppercase tracking-wide">
                        🛡️ Choose analysis mode to expose fraudulent tricks
                      </span>
                      <div className="flex flex-wrap items-center gap-2">
                        {/* Option 1: Local Scrutiny */}
                        <button
                          onClick={handleSpamScan}
                          disabled={isSpamAnalyzing || isAiSpamAnalyzing || !spamInput.trim()}
                          className="bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white border border-white/10 font-mono text-[11px] font-semibold px-3.5 py-2 rounded-lg cursor-pointer transition-all disabled:opacity-40 flex items-center gap-1.5"
                        >
                          {isSpamAnalyzing ? (
                            <>
                              <RefreshCw className="w-3 h-3 animate-spin text-[#00E5FF]" /> Scanning...
                            </>
                          ) : (
                            <>
                              <Terminal className="w-3 h-3 text-gray-400" /> Standard Rules Scan
                            </>
                          )}
                        </button>

                        {/* Option 2: Live AI Neural Core Decode */}
                        <button
                          onClick={handleAiSpamScan}
                          disabled={isSpamAnalyzing || isAiSpamAnalyzing || !spamInput.trim()}
                          className="bg-[#00E5FF]/10 text-[#00E5FF] hover:bg-[#00E5FF]/20 border border-[#00E5FF]/30 font-mono text-[11px] font-bold px-4 py-2 rounded-lg cursor-pointer transition-all disabled:opacity-45 flex items-center gap-1.5"
                        >
                          {isAiSpamAnalyzing ? (
                            <>
                              <RefreshCw className="w-3 h-3 animate-spin text-[#00E5FF]" /> AI Decoding Context...
                            </>
                          ) : (
                            <>
                              <Sparkles className="w-3 h-3 text-[#00E5FF] animate-pulse" /> Live Neural AI Scan
                            </>
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Standard Heuristics Result Rendering */}
                    {spamResult && !aiSpamScanResult && (
                      <motion.div 
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className={`p-4 border rounded-xl space-y-3 font-mono text-xs ${
                          spamResult.phishingRisk === 'CRITICAL' ? 'bg-[#FF3B3B]/10 border-[#FF3B3B]/30 text-white' : 
                          spamResult.phishingRisk === 'SUSPICIOUS' ? 'bg-yellow-400/10 border-yellow-400/30 text-white' :
                          'bg-[#00FF9D]/10 border-[#00FF9D]/30 text-white'
                        }`}
                      >
                        <div className="flex items-center justify-between border-b border-white/5 pb-2">
                          <span className="font-bold flex items-center gap-2 text-gray-200">
                            <ShieldCheck size={14} className="text-[#00E5FF]" /> Heuristic ScamDB Match Results
                          </span>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                            spamResult.phishingRisk === 'CRITICAL' ? 'bg-[#FF3B3B]/20 border-[#FF3B3B]/40 text-[#FF3B3B]' :
                            spamResult.phishingRisk === 'SUSPICIOUS' ? 'bg-yellow-400/20 border-yellow-400/40 text-yellow-400' :
                            'bg-[#00FF9D]/20 border-[#00FF9D]/40 text-[#00FF9D]'
                          }`}>
                            {spamResult.phishingRisk} RISK
                          </span>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <div className="text-[10px] text-gray-400">Heuristics Scam Score</div>
                            <div className="text-2xl font-extrabold text-[#00E5FF]">{spamResult.score}%</div>
                          </div>
                          <div>
                            <div className="text-[10px] text-gray-400">Carrier Registry Reputation</div>
                            <div className="text-xs truncate text-gray-300">{spamResult.reputation}</div>
                          </div>
                        </div>

                        <div>
                          <div className="text-[10px] text-gray-400 mb-1">Local Heuristic Scrapes</div>
                          <ul className="space-y-1 list-disc pl-4 text-gray-300">
                            {spamResult.analysis.map((item, idx) => (
                              <li key={idx} className="text-[11px] leading-relaxed">{item}</li>
                            ))}
                          </ul>
                        </div>
                      </motion.div>
                    )}

                    {/* Gemini AI Advanced Cognitive Scam Breakdown Rendering */}
                    {aiSpamScanResult && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`p-5 border rounded-2xl font-mono text-xs space-y-4 relative overflow-hidden bg-black/40 ${
                          aiSpamScanResult.risk === 'CRITICAL' ? 'border-[#FF3B3B]/30 shadow-[0_0_20px_rgba(255,59,59,0.06)]' :
                          aiSpamScanResult.risk === 'SUSPICIOUS' ? 'border-yellow-400/30' :
                          'border-[#00FF9D]/30 shadow-[0_0_20px_rgba(0,255,157,0.06)]'
                        }`}
                      >
                        {/* Top Indicator Header */}
                        <div className="flex items-center justify-between border-b border-white/5 pb-2.5">
                          <div className="flex items-center gap-2">
                            <Sparkles className="w-4 h-4 text-[#00E5FF] animate-pulse" />
                            <span className="font-extrabold text-white uppercase tracking-wider text-[11px]">Neural AI Manipulation Audit</span>
                          </div>
                          <span className={`px-2.5 py-0.5 rounded text-[10px] font-black border ${
                            aiSpamScanResult.risk === 'CRITICAL' ? 'bg-[#FF3B3B]/20 border-[#FF3B3B]/40 text-[#FF3B3B] animate-pulse' :
                            aiSpamScanResult.risk === 'SUSPICIOUS' ? 'bg-yellow-400/20 border-yellow-400/40 text-yellow-400' :
                            'bg-[#00FF9D]/20 border-[#00FF9D]/40 text-[#00FF9D]'
                          }`}>
                            {aiSpamScanResult.risk} THREAT LEVEL
                          </span>
                        </div>

                        {/* Middle dynamic score and summary display */}
                        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                          <div className="md:col-span-4 flex flex-col justify-center items-center p-3 rounded-lg bg-white/[0.02] border border-white/5">
                            <span className="text-[9px] uppercase tracking-wider text-gray-500 mb-1">Scam Index</span>
                            <span className={`text-4xl font-black ${
                              aiSpamScanResult.risk === 'CRITICAL' ? 'text-[#FF3B3B] text-glow-red' :
                              aiSpamScanResult.risk === 'SUSPICIOUS' ? 'text-yellow-400' :
                              'text-[#00FF9D]'
                            }`}>{aiSpamScanResult.score}%</span>
                            <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden mt-2">
                              <div 
                                className={`h-full transition-all duration-500 ${
                                  aiSpamScanResult.risk === 'CRITICAL' ? 'bg-[#FF3B3B]' :
                                  aiSpamScanResult.risk === 'SUSPICIOUS' ? 'bg-yellow-400' :
                                  'bg-[#00FF9D]'
                                }`}
                                style={{ width: `${aiSpamScanResult.score}%` }}
                              />
                            </div>
                          </div>
                          
                          <div className="md:col-span-8 flex flex-col justify-center gap-1.5 pl-1">
                            <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">AI Analytical Summary</span>
                            <p className="text-gray-200 text-xs italic leading-relaxed">
                              "{aiSpamScanResult.summary}"
                            </p>
                          </div>
                        </div>

                        {/* Psychological Exploit triggers */}
                        <div className="space-y-1.5">
                          <span className="text-[10px] text-gray-500 uppercase font-bold tracking-widest block">Psychological exploits detected:</span>
                          <div className="flex flex-wrap gap-1.5">
                            {aiSpamScanResult.psychologicalTriggers.map((trig, index) => (
                              <span 
                                key={index} 
                                className="px-2.5 py-1 text-[9px] bg-[#A78BFA]/10 border border-[#A78BFA]/25 text-[#A78BFA] font-bold rounded-full"
                              >
                                🎯 {trig}
                              </span>
                            ))}
                          </div>
                        </div>

                        {/* Threat warning points and protective guide */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-white/5">
                          <div>
                            <span className="text-[9px] text-[#FF3B3B] font-extrabold uppercase tracking-widest block mb-2">
                              🚨 Critical red flags:
                            </span>
                            <ul className="space-y-1.5">
                              {aiSpamScanResult.riskPoints.map((pt, i) => (
                                <li key={i} className="text-[11px] text-gray-300 pl-3.5 relative">
                                  <span className="absolute left-0 text-[#FF3B3B]">•</span>
                                  {pt}
                                </li>
                              ))}
                            </ul>
                          </div>

                          <div>
                            <span className="text-[9px] text-[#00FF9D] font-extrabold uppercase tracking-widest block mb-2">
                              🛡️ Proactive shield instructions:
                            </span>
                            <ul className="space-y-1.5">
                              {aiSpamScanResult.defenseAdvice.map((adv, i) => (
                                <li key={i} className="text-[11px] text-gray-300 pl-3.5 relative">
                                  <span className="absolute left-0 text-[#00FF9D]">✔</span>
                                  {adv}
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>

                        {/* Footnote button to scan another text */}
                        <div className="flex items-center justify-end">
                          <button
                            onClick={() => { setAiSpamScanResult(null); setSpamInput(''); }}
                            className="text-[9px] text-gray-500 hover:text-white transition-colors cursor-pointer"
                          >
                            ✖ Clear Neural Analysis
                          </button>
                        </div>
                      </motion.div>
                    )}

                  </div>
                </div>

                {/* Malware APK Perm scanner and financial safety */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  
                  {/* APK Scan Simulator */}
                  <div className="glass-panel p-6 flex flex-col relative overflow-hidden">
                    <h3 className="text-sm font-bold font-mono text-gray-200 border-b border-white/5 pb-2 mb-4 flex items-center gap-2">
                      <Cpu size={14} className="text-[#00E5FF]" /> Dynamic Device APK Perm Scan
                    </h3>
                    <p className="text-xs text-gray-400 font-mono mb-4">
                      Vulnerability & threat audits on background packages. Protect root variables against privilege leakage scenarios.
                    </p>

                    <div className="space-y-3.5 flex-1">
                      {apps.map((app) => (
                        <div key={app.packageName} className="flex items-center justify-between border border-white/5 bg-black/20 p-3 rounded-xl gap-4">
                          <div className="flex-1 min-w-0">
                            <h4 className="text-xs font-bold text-gray-200 truncate">{app.name}</h4>
                            <p className="text-[9px] font-mono text-gray-500 truncate">{app.packageName}</p>
                            
                            {/* Tags representing unsafe indicators */}
                            <div className="flex flex-wrap gap-1 mt-1.5">
                              {app.unsafePermissions.map(p => (
                                <span key={p} className="text-[8px] font-mono px-1 py-0.5 bg-red-500/10 text-red-400 rounded">
                                  {p}
                                </span>
                              ))}
                              {app.unsafePermissions.length === 0 && (
                                <span className="text-[8px] font-mono px-1 py-0.5 bg-[#00FF9D]/10 text-[#00FF9D] rounded">
                                  No Hostile Permissions
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="flex flex-col items-end gap-2 shrink-0">
                            <span className={`text-[8px] font-mono px-1.5 py-0.5 rounded border font-semibold ${
                              app.threatLevel === 'HIGH' ? 'bg-[#FF3B3B]/10 border-[#FF3B3B]/20 text-[#FF3B3B]' :
                              app.threatLevel === 'MEDIUM' ? 'bg-yellow-400/10 border-yellow-400/20 text-yellow-500' :
                              'bg-[#00FF9D]/10 border-[#00FF9D]/20 text-[#00FF9D]'
                            }`}>
                              {app.scanned ? 'CLEARED' : `${app.threatLevel} RISK`}
                            </span>

                            <button
                              onClick={() => scanApk(app.packageName)}
                              disabled={scanningApp !== null || app.scanned}
                              className={`text-[9px] font-mono px-2 py-1 rounded cursor-pointer border ${
                                app.scanned 
                                  ? 'border-white/5 bg-white/5 text-gray-400 cursor-default' 
                                  : 'border-[#00E5FF]/20 hover:border-[#00FF9D]/30 hover:bg-[#00FF9D]/10 text-gray-300 transition-all'
                              }`}
                            >
                              {scanningApp === app.packageName ? 'Checking...' : app.scanned ? 'Protected' : 'Scrutinize'}
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Financial Fraud Guard */}
                  <div className="glass-panel p-6 flex flex-col relative overflow-hidden">
                    <h3 className="text-sm font-bold font-mono text-gray-200 border-b border-white/5 pb-2 mb-4 flex items-center gap-2">
                      <ShieldAlert size={14} className="text-[#FF3B3B]" /> Billing & Financial Safety Core
                    </h3>
                    <p className="text-xs text-gray-400 font-mono mb-4">
                      Scrape background memberships. Flag unauthorized recurring dark pattern subscriptions and child transactions.
                    </p>

                    <div className="space-y-3 flex-1 overflow-y-auto max-h-[220px] pr-1">
                      {transactions.map((t) => (
                        <div key={t.id} className="p-2.5 rounded-xl border border-white/5 bg-black/20 flex items-start justify-between gap-3 text-xs">
                          <div>
                            <div className="font-bold text-gray-200 font-sans">{t.merchant}</div>
                            <div className="text-[9px] font-mono text-gray-500 mt-0.5">{t.date}</div>
                            <div className="text-[10px] font-mono mt-1 text-gray-400 flex items-center gap-1.5">
                              <span className={`w-1.5 h-1.5 rounded-full ${
                                t.flag === 'high' ? 'bg-[#FF3B3B]' : t.flag === 'medium' ? 'bg-yellow-400' : 'bg-[#00FF9D]'
                              }`}></span>
                              {t.type}
                            </div>
                          </div>
                          
                          <div className="text-right shrink-0">
                            <span className="font-bold text-gray-100">{t.amount}</span>
                            {t.flag !== 'safe' && (
                              <button
                                onClick={() => {
                                  setTransactions(prev => prev.filter(item => item.id !== t.id));
                                  showToast("Suspected charge disputed and auto-blocked successfully.", "success");
                                }}
                                className="block mt-1 text-[9px] font-mono text-[#FF3B3B] hover:underline cursor-pointer focus:outline-none"
                              >
                                DISPUTE CHARGE
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>

              </motion.div>
            )}
          </AnimatePresence>

          {/* TAB 2: EMERGENCY SOS & WEALLBEING HEALTH */}
          <AnimatePresence mode="wait">
            {activeTab === 'sos' && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="space-y-6"
              >
                
                {/* Active Panic Control Console */}
                <div className="glass-panel p-6 border-red-900 bg-black/40 relative overflow-hidden">
                  <div className="absolute inset-0 z-0 bg-[radial-gradient(ellipse_at_top_right,rgba(255,59,59,0.06)_0%,transparent_60%)] pointer-events-none"></div>
                  
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 z-10 relative">
                    <div>
                      <h2 className="text-lg font-semibold flex items-center gap-2 text-[#FF3B3B]">
                        <AlertTriangle className="animate-pulse" /> Emergency Sentinel Core SOS (JARVIS Active Mode)
                      </h2>
                      <p className="text-xs text-gray-400 font-mono mt-1">
                        Voice armed trigger parameters: User saying "Hey Krishna help me" activates emergency broadcasts.
                      </p>
                    </div>

                    <button
                      onClick={triggerSOS}
                      className={`font-mono text-xs font-bold px-6 py-2.5 rounded-xl border cursor-pointer select-none transition-all duration-300 leading-normal flex items-center gap-2 ${
                        sosActive 
                          ? 'bg-red-500 border-red-600 text-white shadow-[0_0_20px_rgba(255,59,59,0.35)] hover:bg-red-600 animate-pulse' 
                          : 'border-[#FF3B3B]/45 bg-[#FF3B3B]/10 hover:bg-[#FF3B3B]/20 text-[#FF3B3B]'
                      }`}
                    >
                      <Phone className="w-4 h-4" />
                      {sosActive ? 'STOP EMERGENCY BROADCAST' : 'FORCE DISPATCH SOS'}
                    </button>
                  </div>

                  {/* Fall Detection and SOS diagnostics details */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 z-10 relative font-mono text-xs">
                    
                    {/* Simulated GPS Tracker */}
                    <div className="p-3.5 rounded-xl bg-black/60 border border-white/5 space-y-2">
                      <div className="text-[10px] text-gray-400 tracking-wider">LIVE GPS LOCATION BROADCAST</div>
                      <p className="text-gray-200 font-sans leading-relaxed">{gpsCoordinates}</p>
                      {sosActive && (
                        <div className="w-full bg-white/5 h-1 relative overflow-hidden rounded">
                          <span className="absolute h-full w-2/5 bg-red-500 animate-infinite-scroll"></span>
                        </div>
                      )}
                    </div>

                    {/* Automatic Micro audio capture */}
                    <div className="p-3.5 rounded-xl bg-black/60 border border-white/5 space-y-2">
                      <div className="text-[10px] text-gray-400 tracking-wider">AUDIO SENTINEL SCAN (AMBIENT)</div>
                      <div className="flex items-center gap-2.5 text-gray-300 font-sans">
                        <span className={`w-2 h-2 rounded-full ${sosActive ? 'bg-red-500 animate-ping' : 'bg-gray-500'}`} />
                        <span>{recordingStatus === 'RECORDING' ? 'Capturing emergency room feedback' : 'Device microphones in standby'}</span>
                      </div>
                      <p className="text-[9px] text-gray-500 leading-normal">
                        Captured feeds are encrypted & routed directly to backup SOS contact vault records.
                      </p>
                    </div>

                    {/* Fall Detection Indicator */}
                    <div className="p-3.5 rounded-xl bg-black/60 border border-white/5 flex flex-col justify-between">
                      <div>
                        <div className="text-[10px] text-gray-400 tracking-wider mb-1">ACCELERATIVE FALL DETECTION</div>
                        {fallTimer === null ? (
                          <p className="text-gray-300 font-sans leading-normal">Active gyro scope tracking. No severe deviations.</p>
                        ) : (
                          <div className="text-red-500 animate-pulse font-bold text-center py-1">
                            SOS AUTO-TRIGGER IN {fallTimer} SECONDS!
                          </div>
                        )}
                      </div>

                      {fallTimer === null && (
                        <button
                          onClick={simulateFall}
                          className="text-[9px] border border-white/10 hover:border-red-500/30 hover:bg-red-500/10 px-2 py-1 rounded text-red-400 uppercase mt-2 w-full text-center cursor-pointer transition-colors"
                        >
                          Simulate Sudden Fall Impact
                        </button>
                      )}
                      
                      {fallTimer !== null && (
                        <button
                          onClick={() => { setFallTimer(null); showToast("SOS Timer cleared. Status safe.", "success"); }}
                          className="text-[9px] border border-white/20 bg-white/10 px-2 py-1 rounded text-white uppercase mt-2 w-full text-center cursor-pointer"
                        >
                          Abort SOS Trigger
                        </button>
                      )}
                    </div>

                  </div>
                </div>

                {/* Symptom checker & Hospital planner */}
                <div className="glass-panel p-6 relative overflow-hidden">
                  <h3 className="text-sm font-bold font-mono text-[#00E5FF] border-b border-white/5 pb-2 mb-4 flex items-center gap-2">
                    <Heart size={15} /> Voice Symptom Log & Emergency Health Advisories
                  </h3>
                  <p className="text-xs text-gray-400 font-mono mb-4 leading-relaxed">
                    Log acute distress signs. Integrated threat database maps risks, outputs clinical suggestions, and connects surrounding hospital dispatch desks.
                  </p>

                  <div className="space-y-4 font-mono text-xs">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={healthStatus.symptoms}
                        onChange={(e) => setHealthStatus(prev => ({ ...prev, symptoms: e.target.value }))}
                        placeholder="Detail health conditions (e.g. 'Tight chest pressure, short gasps of air', or 'Severe high fever with headache')"
                        className="flex-1 bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-xs text-gray-200 focus:outline-none focus:border-[#00E5FF]"
                      />
                      <button
                        onClick={analyzeSymptoms}
                        disabled={isHealthAnalyzing || !healthStatus.symptoms.trim()}
                        className="bg-[#00E5FF]/10 text-[#00E5FF] border border-[#00E5FF]/30 hover:bg-[#00E5FF]/20 px-4 py-2 rounded-lg cursor-pointer transition-all uppercase text-[10px] font-bold shrink-0"
                      >
                        {isHealthAnalyzing ? 'Analyzing...' : 'Parse Risk'}
                      </button>
                    </div>

                    {healthStatus.riskAssessment !== 'UNDEDICTED' && (
                      <div className="p-4 border border-white/5 bg-black/3xl rounded-xl space-y-3 font-sans">
                        <div className="flex items-center gap-2 font-mono text-xs font-bold text-gray-300">
                          <Activity size={12} className="text-[#00FF9D]" /> Emergency Health Advisory Response
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-t border-white/5 pt-3">
                          <div>
                            <span className="text-[10px] font-mono text-gray-400 block">Identified Hazard Class</span>
                            <span className="text-xs font-bold font-mono text-red-500">{healthStatus.riskAssessment}</span>
                          </div>
                          <div>
                            <span className="text-[10px] font-mono text-gray-400 block">Recommended Action Metrics</span>
                            <span className="text-xs text-gray-300 leading-normal">{healthStatus.actionPlan}</span>
                          </div>
                          <div>
                            <span className="text-[10px] font-mono text-gray-400 block">Target Emergency Dispatch Ward</span>
                            <span className="text-xs text-gray-300 leading-normal">{healthStatus.nearestHosp}</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

              </motion.div>
            )}
          </AnimatePresence>

          {/* TAB 3: COGNITIVE FOCUS & WELLBEING */}
          <AnimatePresence mode="wait">
            {activeTab === 'wellbeing' && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="space-y-6"
              >
                
                {/* POMODORO pomodoro block & Distraction graphs */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  
                  {/* Focus loop block */}
                  <div className="glass-panel p-6 flex flex-col justify-between relative overflow-hidden">
                    <div>
                      <h3 className="text-sm font-bold font-mono text-gray-200 border-b border-white/5 pb-2 mb-3 flex items-center gap-2">
                        <Ban size={14} className="text-[#00FF9D]" /> Student Distraction Blocker
                      </h3>
                      <p className="text-xs text-gray-400 font-mono mb-4 leading-normal">
                        Automatically suppress toxic apps (TikTok, YouTube, Instagram) on target hours. Includes adaptive coaching logs.
                      </p>

                      {/* Cool Digital Clock */}
                      <div className="text-center py-6">
                        <span className="font-mono text-5xl font-extrabold tracking-widest text-[#00FF9D]">{formatTime(focusTimer)}</span>
                        <div className="text-[9px] text-[#00FF9D]/70 font-mono uppercase mt-1">DND Shield App Restriction active</div>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <button
                        onClick={() => { setFocusActive(!focusActive); playSfx(550, 'triangle', 0.25); }}
                        className={`flex-1 font-mono text-xs font-bold py-2 rounded-lg cursor-pointer transition-all uppercase ${
                          focusActive 
                            ? 'bg-red-500/20 border border-red-500 text-white' 
                            : 'bg-[#00FF9D]/15 border border-[#00FF9D]/40 text-[#00FF9D] hover:bg-[#00FF9D]/25'
                        }`}
                      >
                        {focusActive ? 'Pause Shield Mode' : 'Arm Focus Shield'}
                      </button>

                      <button
                        onClick={() => { setFocusTimer(25 * 60); setFocusActive(false); showToast("Focus timer reset.", "info"); }}
                        className="border border-white/10 hover:bg-white/5 font-mono text-xs px-3.5 rounded-lg text-gray-400 cursor-pointer transition-colors"
                      >
                        RESET
                      </button>
                    </div>
                  </div>

                  {/* Diaphragmatic Breath Pacer (The visual breathing circle) */}
                  <div className="glass-panel p-6 flex flex-col justify-between relative overflow-hidden">
                    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(0,255,157,0.03)_0%,transparent_60%)] pointer-events-none"></div>
                    <div>
                      <h3 className="text-sm font-bold font-mono text-gray-200 border-b border-white/5 pb-2 mb-3 flex items-center gap-2">
                        <Activity size={14} className="text-[#00FF9D]" /> Stress Burnout & Respiration Pacer
                      </h3>
                      <p className="text-xs text-gray-400 font-mono mb-4 leading-normal">
                        Acoustic alignment swept directly at biological frequencies. Follow the expanding breathing indicator circle to adjust pulse waves.
                      </p>
                    </div>

                    {/* Interactive Breathe Pacer Circle */}
                    <div className="flex flex-col items-center py-3">
                      <motion.div
                        animate={{ 
                          scale: isBreathingIn ? [1, 1.45, 1] : [1, 1, 1]
                        }}
                        transition={{ 
                          duration: 4.5, 
                          repeat: Infinity, 
                          ease: 'easeInOut' 
                        }}
                        className={`w-18 h-18 rounded-full border-2 flex items-center justify-center relative ${
                          isBreathingIn 
                            ? 'bg-[#00FF9D]/10 border-[#00FF9D] shadow-[0_0_20px_rgba(0,255,157,0.3)]' 
                            : 'bg-white/5 border-white/10'
                        }`}
                      >
                        <span className="font-mono text-[9px] font-bold text-center text-gray-300">
                          {isBreathingIn ? 'BREATHE IN' : 'BREATHE OUT'}
                        </span>
                      </motion.div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-[11px] font-mono text-gray-400">
                        <span>Measured stress level</span>
                        <span>{stressLevel}% Intensity</span>
                      </div>
                      <input
                        type="range"
                        min="10"
                        max="100"
                        value={stressLevel}
                        onChange={(e) => setStressLevel(Number(e.target.value))}
                        className="w-full accent-krishna-cyan bg-white/5 h-1 rounded appearance-none cursor-pointer"
                      />
                    </div>
                  </div>

                </div>

                {/* Parent Lock Safety Controls */}
                <div className="glass-panel p-6 relative overflow-hidden">
                  <div className="flex items-center justify-between border-b border-white/5 pb-3 mb-4">
                    <h3 className="text-sm font-bold font-mono text-[#00E5FF] flex items-center gap-2">
                      <Lock size={15} /> Parental Control Safety & Dangerous Content Filter
                    </h3>
                    <span className={`text-[9px] font-mono px-2 py-0.5 rounded border ${
                      parentLockActive ? 'bg-[#00E5FF]/20 border-[#00E5FF] text-[#00E5FF]' : 'bg-white/5 border-white/10 text-gray-500'
                    }`}>
                      {parentLockActive ? 'PROTECTION SECURED' : 'STANDBY'}
                    </span>
                  </div>

                  <p className="text-xs text-gray-400 font-mono mb-4 leading-relaxed">
                    Filter unsafe searches. Keep active logging variables of blocked child usage vectors automatically. Configure with safe admin override PIN credentials below.
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start font-mono text-xs">
                    
                    {/* Settings Override */}
                    <div className="space-y-4 p-4 rounded-xl border border-white/5 bg-black/20">
                      <div className="space-y-1.5">
                        <label className="text-[10px] text-gray-400 block uppercase">Enter Guardian Override PIN</label>
                        <div className="flex gap-2">
                          <input
                            type="password"
                            placeholder="****"
                            maxLength={4}
                            value={parentPin}
                            onChange={(e) => setParentPin(e.target.value)}
                            className="bg-black/30 border border-white/10 rounded px-2.5 py-1.5 text-center text-sm w-20 text-[#00E5FF] focus:outline-none"
                          />
                          <button
                            onClick={() => {
                              if (parentPin === '9999' || parentPin === '1234') {
                                setParentLockActive(!parentLockActive);
                                setParentPin('');
                                showToast(parentLockActive ? "Parent restrictions deactivated." : "Parent limits secured under code overrides.", "success");
                              } else {
                                showToast("Incorrect Override Credentials", "warn");
                              }
                            }}
                            className="bg-[#00E5FF]/15 text-[#00E5FF] border border-[#00E5FF]/20 px-3 py-1 bg-white/5 rounded uppercase text-[10px]"
                          >
                            Toggle Filter state
                          </button>
                        </div>
                      </div>

                      <div className="text-[9px] text-gray-500 leading-normal">
                        Default demo PIN access code: <span className="text-[#00E5FF]">1234</span>. When locked, harmful scripts are quarantined automatically.
                      </div>
                    </div>

                    {/* Filter Logs */}
                    <div className="space-y-3">
                      <span className="text-[10px] text-gray-400 uppercase tracking-wider block">Blocked Content logs</span>
                      <div className="space-y-2 max-h-[150px] overflow-y-auto pr-1">
                        {parentLogs.map((l, i) => (
                          <div key={i} className="p-2 border border-white/5 bg-black/40 rounded-lg text-[10px] flex justify-between gap-3 leading-relaxed">
                            <div>
                              <span className="text-gray-300 font-bold block">{l.app}</span>
                              <span className="text-[#FF3B3B] block">{l.action}</span>
                            </div>
                            <span className="text-gray-500 shrink-0">{l.time}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                  </div>
                </div>

              </motion.div>
            )}
          </AnimatePresence>

          {/* TAB 4: LANGUAGE TRANSLATOR & UNIVERSAL ACCESSIBILITY */}
          <AnimatePresence mode="wait">
            {activeTab === 'access' && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="space-y-6"
              >
                
                {/* Scren Translation Hub */}
                <div className="glass-panel p-6 relative overflow-hidden">
                  <h2 className="text-lg font-semibold flex items-center gap-2 mb-4 text-[#A78BFA]">
                    <Globe className="w-5 h-5 text-[#A78BFA]" /> Real-time Screen OCR Translator
                  </h2>
                  <p className="text-xs text-gray-400 font-mono mb-4 leading-relaxed">
                    Paste raw text of error logs, screens, or book excerpts. Translate immediately into southern / common regional standard models.
                  </p>

                  <div className="space-y-4 font-mono text-xs">
                    <textarea
                      value={ocrText}
                      onChange={(e) => setOcrText(e.target.value)}
                      placeholder="Paste text for instant regional OCR transposition..."
                      className="w-full bg-black/30 border border-white/10 rounded-xl p-3.5 text-xs text-gray-200 focus:outline-none focus:border-[#A78BFA] h-20"
                    />

                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <span className="text-[10px] text-gray-400 uppercase">Target Translation</span>
                        <select
                          value={targetLang}
                          onChange={(e) => setTargetLang(e.target.value)}
                          className="bg-black/50 border border-white/10 rounded px-2 py-1 text-[#A78BFA] text-xs focus:outline-none uppercase"
                        >
                          <option value="Telugu">Telugu (తెలుగు)</option>
                          <option value="Tamil">Tamil (தமிழ்)</option>
                          <option value="Hindi">Hindi (हिंदी)</option>
                        </select>
                      </div>

                      <button
                        onClick={performTranslation}
                        disabled={isTranslating || !ocrText.trim()}
                        className="bg-[#A78BFA]/10 text-[#A78BFA] hover:bg-[#A78BFA]/20 border border-[#A78BFA]/30 px-4 py-2 rounded-lg font-bold uppercase text-[10px] cursor-pointer"
                      >
                        {isTranslating ? 'Transposing...' : 'Perform Translate'}
                      </button>
                    </div>

                    {translatedText && (
                      <motion.div 
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1 }}
                        className="p-4 rounded-xl border border-[#A78BFA]/20 bg-[#A78BFA]/5 space-y-2 leading-relaxed"
                      >
                        <div className="text-[10px] text-[#A78BFA] uppercase tracking-widest font-bold">Translated output</div>
                        <p className="text-sm font-sans tracking-wide text-white font-medium">{translatedText}</p>
                        
                        <div className="flex justify-end mt-2">
                          <button
                            onClick={() => {
                              showToast("Synthesizing translation vocalized audio. Puck voice core active.", "success");
                              playSfx(580, 'sine', 0.85);
                            }}
                            className="text-[9px] hover:underline uppercase text-[#A78BFA] flex items-center gap-1 cursor-pointer focus:outline-none"
                          >
                            <Volume2 size={11} /> Speak Aloud Translation
                          </button>
                        </div>
                      </motion.div>
                    )}

                  </div>
                </div>

                {/* Oversized Assistive Mode for elderly cared grids */}
                <div className="glass-panel p-6 relative overflow-hidden">
                  <h3 className="text-sm font-bold font-mono text-gray-200 border-b border-white/5 pb-2 mb-4 flex items-center gap-2">
                    <Accessibility className="text-[#A78BFA] w-5 h-5" /> Oversized Elderly Bridge Mode
                  </h3>
                  <p className="text-xs text-gray-400 font-mono mb-4 leading-normal">
                    Simplifies user experience parameters. Direct big-button controls for speed-dials and medicine schedules.
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 font-sans">
                    
                    {/* Big Direct SOS Phone button */}
                    <button
                      onClick={() => {
                        playSfx(440, 'sine', 0.15);
                        showToast("Calling Primary Family Member now.", "success");
                      }}
                      className="p-5 border border-white/10 hover:border-[#00FF9D]/30 bg-[#00FF9D]/5 rounded-2xl flex flex-col items-center justify-center gap-2.5 hover:scale-[1.02] cursor-pointer"
                    >
                      <User size={32} className="text-[#00FF9D]" />
                      <span className="font-bold text-sm tracking-wide text-white uppercase">CALL ELDEST SON / SONU</span>
                      <span className="text-[10px] font-mono text-gray-500">Fast Trigger Speed Dial</span>
                    </button>

                    {/* oversized medicine reminder trigger */}
                    <button
                      onClick={() => {
                        playSfx(880, 'sine', 0.1);
                        showToast("Audio medication instructions vocalized. Time for Metformin daily dosage.", "info");
                      }}
                      className="p-5 border border-white/10 hover:border-[#00E5FF]/30 bg-[#00E5FF]/5 rounded-2xl flex flex-col items-center justify-center gap-2.5 hover:scale-[1.02] cursor-pointer"
                    >
                      <Clock size={32} className="text-[#00E5FF]" />
                      <span className="font-bold text-sm tracking-wide text-white uppercase">MED MEDICINE ALERTER</span>
                      <span className="text-[10px] font-mono text-[#00E5FF]">Next Pill: 09:00 PM</span>
                    </button>

                    {/* big emergency services helper */}
                    <button
                      onClick={triggerSOS}
                      className="p-5 border border-red-500/30 hover:border-red-500 bg-red-500/10 rounded-2xl flex flex-col items-center justify-center gap-2.5 hover:scale-[1.02] cursor-pointer"
                    >
                      <AlertCircle size={32} className="text-red-500" />
                      <span className="font-bold text-sm tracking-wide text-white uppercase">AMBULANCE DISPATCH</span>
                      <span className="text-[10px] font-mono text-red-400">Emergency Redline Redirection</span>
                    </button>

                  </div>
                </div>

              </motion.div>
            )}
          </AnimatePresence>

          {/* TAB 5: TRAVEL COMMUTE & ENVIRONMENT */}
          <AnimatePresence mode="wait">
            {activeTab === 'environ' && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="space-y-6"
              >
                
                {/* Safety commute indicator and AQI widgets */}
                <div className="glass-panel p-6 relative overflow-hidden">
                  <h2 className="text-lg font-semibold flex items-center gap-2 mb-4 text-[#F472B6]">
                    <MapPin className="w-5 h-5" /> Safety-Aware Commute Engine & Travel Radar
                  </h2>
                  <p className="text-xs text-gray-400 font-mono mb-6 leading-relaxed">
                    Check safe routing variables with high-illumination maps. Flag unlighted pathways or higher noise zones to calculate reliable paths.
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch font-mono text-xs">
                    
                    {/* Routing Choices */}
                    <div className="p-4.5 rounded-xl border border-white/5 bg-black/20 flex flex-col justify-between">
                      <div className="space-y-3">
                        <span className="text-[10px] text-gray-400 uppercase tracking-widest block font-bold">Pathway selector profiles</span>
                        
                        {/* Option 1: Quick */}
                        <div 
                          onClick={() => { setSelectedRoute('quick'); playSfx(600); }}
                          className={`p-3 rounded-lg border transition-all cursor-pointer flex justify-between items-center ${
                            selectedRoute === 'quick' ? 'bg-[#F472B6]/10 border-[#F472B6] text-white' : 'border-white/5 hover:border-white/10 text-gray-400'
                          }`}
                        >
                          <div>
                            <span className="font-bold block text-xs">Quick Route (Default)</span>
                            <span className="text-[10px] text-gray-500 font-normal">Est time: 14 mins. features 2 unlighted alleys.</span>
                          </div>
                          <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded ${
                            selectedRoute === 'quick' ? 'bg-[#FF3B3B]/20 text-[#FF3B3B]' : 'bg-gray-500/20 text-gray-400'
                          }`}>
                            ELEVATION RISK
                          </span>
                        </div>

                        {/* Option 2: Ambient secure light route */}
                        <div 
                          onClick={() => { setSelectedRoute('illuminated'); playSfx(600); }}
                          className={`p-3 rounded-lg border transition-all cursor-pointer flex justify-between items-center ${
                            selectedRoute === 'illuminated' ? 'bg-[#00FF9D]/10 border-[#00FF9D] text-white' : 'border-white/5 hover:border-white/10 text-gray-400'
                          }`}
                        >
                          <div>
                            <span className="font-bold block text-xs">Safe-Sentry Path</span>
                            <span className="text-[10px] text-gray-500 font-normal">Est time: 18 mins. featuring high public traffic & luminous streetlights.</span>
                          </div>
                          <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded ${
                            selectedRoute === 'illuminated' ? 'bg-[#00FF9D]/20 text-[#00FF9D]' : 'bg-gray-500/20 text-gray-400'
                          }`}>
                            HIGHLY RECOMMENDED
                          </span>
                        </div>
                      </div>

                      <div className="text-[10px] text-gray-500 leading-relaxed mt-4 pt-4 border-t border-white/5">
                        {selectedRoute === 'illuminated' 
                          ? '🛡️ SAFE COMMUTE ACTIVE: Automatic SOS speed-dial widgets pinned to lock-screen layers.' 
                          : '⚠️ WARNING: Krishna AI detects unlighted pathways on this path. We advise locking the device only after launching Guardian.'}
                      </div>

                    </div>

                    {/* Sensor parameters */}
                    <div className="p-4.5 rounded-xl border border-white/5 bg-black/20 space-y-4">
                      <div>
                        <span className="text-[10px] text-gray-400 uppercase tracking-widest block font-bold mb-3">Ambient Air Sensoring (AQI)</span>
                        <div className="flex justify-between items-center">
                          <span className="text-3xl font-extrabold text-[#00FF9D]">{airQuality} AQI</span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                            airQuality > 100 ? 'bg-[#FF3B3B]/20 border-[#FF3B3B] text-[#FF3B3B]' : 'bg-[#00FF9D]/20 border-[#00FF9D] text-[#00FF9D]'
                          }`}>
                            {airQuality > 100 ? 'HEAVY HAZARD POLLUTANTS' : 'HEALTHY ENVIRONMENT'}
                          </span>
                        </div>

                        <div className="w-full bg-white/5 rounded-full h-1 overflow-hidden mt-3">
                          <div className="h-full bg-[#00FF9D]" style={{ width: `${Math.min(100, airQuality / 1.5)}%` }}></div>
                        </div>
                      </div>

                      <div>
                        <span className="text-[10px] text-gray-400 uppercase tracking-widest block font-bold mb-3">Environmental decibels (Noise)</span>
                        <div className="text-3xl font-extrabold text-[#F472B6]">
                          {noiseLevel} sPdB
                        </div>
                        <p className="text-[10px] text-gray-500 leading-normal mt-1 leading-relaxed">
                          Integrated acoustic monitors are tracking excessive frequency peaks. Sleep optimization models will adjust.
                        </p>
                      </div>
                    </div>

                  </div>
                </div>

                {/* REAL-WORLD ISSUE SOLVER: CLIMATE & CRISIS OUTAGE PLANNER */}
                <div className="glass-panel p-6 relative overflow-hidden border-t-2 border-[#F472B6]/30">
                  <div className="absolute top-0 right-0 p-3 flex gap-2">
                    <span className="text-[8px] font-mono text-[#F472B6] bg-[#F472B6]/15 hover:bg-[#F472B6]/35 border border-[#F472B6]/25 px-2 py-0.5 rounded uppercase font-bold animate-pulse">
                      Live Contingency Sensor
                    </span>
                  </div>

                  <h2 className="text-lg font-semibold flex items-center gap-2 mb-2 text-[#00E5FF]">
                    <AlertTriangle className="w-5 h-5 text-amber-400 animate-bounce" /> Climate & Grid-Down Contingency Sentinel
                  </h2>
                  <p className="text-xs text-gray-400 font-mono mb-5 leading-normal">
                    Real-world safety hub designed for sudden environmental emergencies (severe heatwaves, flooding, urban hazardous smog) and grid failure. Model power budget profiles, configure evacuation packs, and secure survival rules.
                  </p>

                  <div className="space-y-4 font-mono text-xs text-gray-300">
                    {/* Part 1: Crisis Simulator Triggers */}
                    <div className="bg-black/40 border border-white/5 rounded-xl p-4">
                      <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block mb-3">
                        Active Scenario Contingency Core
                      </span>
                      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                        {[
                          { id: 'none', label: '🛡️ STANDBY', desc: 'Secure normal tracking.' },
                          { id: 'heatwave', label: '🔥 HEATWAVE', desc: '48°C extreme thermal guide.' },
                          { id: 'flood', label: '🌧️ FLOOD / STORM', desc: 'Water rise warnings.' },
                          { id: 'smog', label: '🌫️ AQI CRITICAL', desc: 'Toxic microparticle alerts.' },
                          { id: 'outage', label: '🔌 GRID DOWN', desc: 'Telecom & power loss.' }
                        ].map((sc) => (
                          <button
                            key={sc.id}
                            type="button"
                            onClick={() => { setActiveCrisisScenario(sc.id as any); playSfx(580); }}
                            className={`p-2.5 rounded-lg border text-[10px] font-bold text-left transition-all cursor-pointer flex flex-col justify-between h-16 ${
                              activeCrisisScenario === sc.id 
                                ? 'bg-[#00E5FF]/10 border-[#00E5FF] text-white shadow-[0_0_10px_rgba(0,229,255,0.15)] animate-pulse'
                                : 'border-white/5 bg-black/40 text-gray-400 hover:border-white/10'
                            }`}
                          >
                            <span>{sc.label}</span>
                            <span className="text-[8px] text-gray-500 font-normal leading-tight">{sc.desc}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Conditional Banner and Survival details */}
                    {activeCrisisScenario !== 'none' && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="p-4 border rounded-xl bg-[#FF3B3B]/5 border-[#FF3B3B]/20 space-y-3"
                      >
                        {activeCrisisScenario === 'heatwave' && (
                          <>
                            <div className="text-amber-400 font-extrabold flex items-center gap-2">
                              <span>⚠️ SEVERE THERMAL HEATWAVE ADVISORY — Ambient peak 48°C</span>
                            </div>
                            <p className="text-[11px] text-gray-300 leading-relaxed">
                              Extreme ambient temperatures put excessive metabolic pressure on cardiac layers. Krishna OS indicates immediate hydration increments (at least 3.8L fluid intake index today). Avoid heavy thermal exposure during 11:00 AM - 4:00 PM intervals.
                            </p>
                          </>
                        )}
                        {activeCrisisScenario === 'flood' && (
                          <>
                            <div className="text-cyan-400 font-extrabold flex items-center gap-2">
                              <span>⚠️ URBAN FLASH FLOOD & STRUCTURAL INTEGRITY WARNING</span>
                            </div>
                            <p className="text-[11px] text-gray-300 leading-relaxed">
                              Heavy weather precipitation matching extreme flood limits in localized canals. Secure clean water reserves before domestic line pressure drops. Move battery storage and electrical elements to upper floors immediately.
                            </p>
                          </>
                        )}
                        {activeCrisisScenario === 'smog' && (
                          <>
                            <div className="text-yellow-400 font-extrabold flex items-center gap-2">
                              <span>⚠️ AMBIENT TOXIC SMOG / CRITICAL PM2.5 INDICES ADVISORY</span>
                            </div>
                            <p className="text-[11px] text-gray-300 leading-relaxed">
                              Extreme particulate contamination indices tracked above 350 AQI. Safe respiratory function demands sealing outdoor ventilation blocks. Activate high-efficiency particulate air (HEPA) systems or double layer mechanical filters.
                            </p>
                          </>
                        )}
                        {activeCrisisScenario === 'outage' && (
                          <>
                            <div className="text-[#A78BFA] font-extrabold flex items-center gap-2">
                              <span>⚠️ SYSTEM BLACKOUT: POWER GRID STABILITY RUPTURE WARNING</span>
                            </div>
                            <p className="text-[11px] text-gray-300 leading-relaxed">
                              General grid collapse warning. Cellular network towers are running on auxiliary engine timers. Place cellular devices in extreme battery backup profiles immediately (dim parameters, disable background data).
                            </p>
                          </>
                        )}

                        {/* Prep packing checklist */}
                        <div className="pt-3 border-t border-white/5 grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <span className="text-[9px] text-[#00FF9D] font-extrabold uppercase tracking-widest block mb-2">
                              🎒 Emergency Survival Pack Checklist (Interactive)
                            </span>
                            <div className="grid grid-cols-2 gap-2 text-[10px]">
                              {[
                                { id: 'water', label: '💧 3L Drinking Water' },
                                { id: 'rations', label: '🍫 Dry Food Packs' },
                                { id: 'meds', label: '💊 Essential Meds' },
                                { id: 'radio', label: '📻 Emergency FM Radio' },
                                { id: 'powerbank', label: '🔋 Solar Power Bank' },
                                { id: 'flashlight', label: '🔦 High-lumen Beacon' }
                              ].map((item) => (
                                <label 
                                  key={item.id} 
                                  className="flex items-center gap-2 p-1.5 rounded-lg bg-black/40 border border-white/5 hover:border-[#00FF9D]/30 transition-colors cursor-pointer select-none"
                                >
                                  <input 
                                    type="checkbox"
                                    checked={emergencyChecklist[item.id as keyof typeof emergencyChecklist]}
                                    onChange={() => {
                                      setEmergencyChecklist(prev => ({ ...prev, [item.id]: !prev[item.id as keyof typeof emergencyChecklist] }));
                                      playSfx(750, 'sine', 0.05);
                                    }}
                                    className="accent-[#00FF9D]"
                                  />
                                  <span className={emergencyChecklist[item.id as keyof typeof emergencyChecklist] ? 'text-[#00FF9D] line-through font-bold' : 'text-gray-300'}>
                                    {item.label}
                                  </span>
                                </label>
                              ))}
                            </div>
                          </div>

                          {/* Quick Crisis Protocol Actions */}
                          <div className="flex flex-col justify-between">
                            <div>
                              <span className="text-[9px] text-gray-400 font-extrabold uppercase tracking-widest block mb-1.5">
                                Contingency Quick Actions
                              </span>
                              <div className="space-y-1.5 text-[10px] text-gray-300 leading-relaxed">
                                <p>• Speed Dial Pinned: Medical Help Channel and local disaster agencies mapped.</p>
                                <p>• Mesh Broadcast: Pre-loaded offline mesh texts ready to ping neighbor peers.</p>
                                <p>• Map Index: Visually flagged local shelters and higher elevation dry reserves.</p>
                              </div>
                            </div>
                            <div className="text-[9px] text-gray-500 italic flex items-center gap-1.5 mt-2 md:mt-0 font-bold border-t border-white/5 pt-2">
                              <span className="w-1.5 h-1.5 rounded-full bg-[#00FF9D] animate-ping shrink-0" />
                              Crisis protocols mapped automatically in secure sectors
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}

                    {/* Part 2: Power and Utility Budget Calculator */}
                    <div className="bg-black/40 border border-white/5 rounded-xl p-4.5 space-y-4">
                      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/5 pb-2">
                        <span className="text-[10px] text-transparent bg-clip-text bg-gradient-to-r from-[#00E5FF] to-[#A78BFA] font-extrabold uppercase tracking-wider">
                          🔋 Grid-Down Smartphone & Device Survival Battery Modeler
                        </span>
                        <span className="text-[9px] text-gray-500 font-bold">
                          Estimate operation hours in absolute darkness
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 leading-normal">
                        {/* Battery Capacity Adjustment */}
                        <div className="space-y-3">
                          <div>
                            <div className="flex justify-between items-center mb-1">
                              <span className="text-gray-400 text-[10px] font-bold">Accumulator Capacity Pool:</span>
                              <span className="text-[#00E5FF] font-extrabold">{powerCapacityMilliAmpHours.toLocaleString()} mAh</span>
                            </div>
                            <input 
                              type="range" 
                              min="3000" 
                              max="50000" 
                              step="500"
                              value={powerCapacityMilliAmpHours}
                              onChange={(e) => {
                                setPowerCapacityMilliAmpHours(parseInt(e.target.value));
                                if (parseInt(e.target.value) % 5000 === 0) playSfx(350, 'triangle', 0.05);
                              }}
                              className="w-full accent-[#00E5FF] bg-white/5 rounded-lg h-1Cursor-pointer"
                            />
                            <div className="flex justify-between text-[8px] text-gray-600 font-bold mt-1">
                              <span>3,000 mAh (Standard phone)</span>
                              <span>20,000 mAh (High capacity link)</span>
                              <span>50,000 mAh (Solar Station)</span>
                            </div>
                          </div>

                          {/* Running load devices config checks */}
                          <div>
                            <span className="text-[9px] text-gray-400 uppercase font-bold tracking-widest block mb-2">
                              Active electronic drain elements:
                            </span>
                            <div className="grid grid-cols-2 gap-2 text-[9px]">
                              {[
                                { id: 'phone', label: '📱 Emergency Phone (5W)', field: 'phone' },
                                { id: 'flashlight', label: '🔦 LED Beacon (1.5W)', field: 'flashlight' },
                                { id: 'radio', label: '📻 AM/FM Receiver (2W)', field: 'radio' },
                                { id: 'waterpump', label: '💧 Safe Water Pump (12W)', field: 'waterpump' }
                              ].map((dev) => (
                                <button
                                  key={dev.id}
                                  type="button"
                                  onClick={() => {
                                    setRunningDevicesPowerUsageWatts(prev => ({ 
                                      ...prev, 
                                      [dev.field]: !prev[dev.field as keyof typeof runningDevicesPowerUsageWatts] 
                                    }));
                                    playSfx(500, 'sine', 0.04);
                                  }}
                                  className={`p-2 rounded border text-left flex justify-between items-center transition-all cursor-pointer ${
                                    runningDevicesPowerUsageWatts[dev.field as keyof typeof runningDevicesPowerUsageWatts]
                                      ? 'bg-amber-400/15 border-amber-400 text-white font-bold'
                                      : 'border-white/5 text-gray-400 hover:border-white/10'
                                  }`}
                                >
                                  <span>{dev.label}</span>
                                  {runningDevicesPowerUsageWatts[dev.field as keyof typeof runningDevicesPowerUsageWatts] && (
                                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse shrink-0 ml-1" />
                                  )}
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>

                        {/* Power Budget output statistics display */}
                        <div className="bg-black/50 border border-white/5 rounded-xl p-4 flex flex-col justify-between items-stretch">
                          <div className="space-y-2 text-center py-2 relative">
                            <span className="text-[9px] text-gray-500 font-bold uppercase tracking-wider block">Remaining critical survival hours</span>
                            
                            {/* Compute calculation */}
                            {(() => {
                              let totalWatts = 0;
                              if (runningDevicesPowerUsageWatts.phone) totalWatts += 5.0;
                              if (runningDevicesPowerUsageWatts.flashlight) totalWatts += 1.5;
                              if (runningDevicesPowerUsageWatts.radio) totalWatts += 2.0;
                              if (runningDevicesPowerUsageWatts.waterpump) totalWatts += 12.0;

                              const wh = (powerCapacityMilliAmpHours * 3.7) / 1000;
                              const hrs = totalWatts > 0 ? (wh / totalWatts) : 0;
                              const days = hrs >= 24 ? Math.floor(hrs / 24) : 0;
                              const remainingHrsFloat = hrs % 24;

                              return (
                                <div className="space-y-1">
                                  <div className="text-3xl font-black text-[#00FF9D] text-glow-green">
                                    {totalWatts === 0 ? (
                                      <span>N/A</span>
                                    ) : days > 0 ? (
                                      <span>{days}d {remainingHrsFloat.toFixed(1)}h</span>
                                    ) : (
                                      <span>{hrs.toFixed(1)} hrs</span>
                                    )}
                                  </div>
                                  <div className="text-[9px] text-gray-400 font-mono tracking-widest uppercase">
                                    Total load drain: <span className="text-amber-400 font-bold">{totalWatts.toFixed(1)} Watts</span> • Energy Pool: <span className="text-cyan-400 font-bold">{wh.toFixed(1)} Wh</span>
                                  </div>
                                </div>
                              );
                            })()}
                          </div>

                          <div className="space-y-1 pt-3 border-t border-white/5 text-[9px] text-gray-500">
                            <div className="flex justify-between">
                              <span>Cell Nominal Voltage:</span>
                              <span className="font-mono text-gray-300">3.7 Volts DC</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Energy Conversion Efficiency:</span>
                              <span className="font-mono text-gray-300">85% (Internal compensation matched)</span>
                            </div>
                            <div className="flex justify-between text-[10px] font-bold text-gray-400 pt-1">
                              <span>Status priority:</span>
                              <span className="text-[#00FF9D]">OPERATIONAL SECURE</span>
                            </div>
                          </div>
                        </div>

                      </div>
                    </div>
                  </div>
                </div>

              </motion.div>
            )}
          </AnimatePresence>

          {/* TAB 6: OFFLINE-NATIVE AI CORE */}
          <AnimatePresence mode="wait">
            {activeTab === 'offline' && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="space-y-6"
              >
                
                {/* Local terminal controller offline */}
                <div className="glass-panel p-6 border-yellow-800 bg-black/40 relative overflow-hidden">
                  <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(234,179,8,0.04)_0%,transparent_60%)] pointer-events-none"></div>

                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-3 z-10 relative border-b border-white/5 pb-4">
                    <div>
                      <h2 className="text-lg font-semibold flex items-center gap-2 text-yellow-400">
                        <Terminal className="animate-pulse" /> Standalone Offline AI Edge Core
                      </h2>
                      <p className="text-xs text-gray-400 font-mono mt-1">
                        Run models locally in deep tunnels or flight mode without any external API handshakes.
                      </p>
                    </div>

                    {/* Network state toggle */}
                    <button
                      onClick={() => {
                        setIsNetConnected(!isNetConnected);
                        playSfx(isNetConnected ? 310 : 880, 'square', 0.25);
                        showToast(isNetConnected ? "Disconnecting server. Forcing sandbox mode." : "Reconnected servers successfully.", "info");
                      }}
                      className={`font-mono text-xs font-bold px-3 py-1.5 rounded-lg border transition-all ${
                        isNetConnected 
                          ? 'border-green-500/30 text-[#00FF9D] bg-[#00FF9D]/5 hover:bg-[#00FF9D]/15'
                          : 'border-yellow-400/40 text-yellow-400 bg-yellow-400/10'
                      }`}
                    >
                      {isNetConnected ? '▲ WEBSOCKET: CONNECTED' : '▲ MATRIX: STANDALONE OFFLINE'}
                    </button>
                  </div>

                  <div className="space-y-4 z-10 relative">
                    <p className="text-xs text-gray-400 font-mono leading-relaxed">
                      This terminal uses client-side quantized weights to safely classify emergency advice, fraud, and mental rest exercises when cellular arrays are offline.
                    </p>

                    {/* Simulation Terminal Log Box */}
                    <div className="h-64 border border-white/10 bg-black/80 rounded-xl p-4 font-mono text-[11px] text-gray-300 overflow-y-auto space-y-1.5 scrollbar-thin">
                      {offlineRawOutput.map((log, index) => (
                        <div key={index} className="leading-relaxed">
                          <span className="text-[#00E5FF] mr-2">🤖</span>
                          <span>{log}</span>
                        </div>
                      ))}
                    </div>

                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={offlineInput}
                        onChange={(e) => setOfflineInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleOfflineQuery()}
                        placeholder="Query local sandbox (e.g. 'How do i stop scam calls' or 'help me')"
                        className="flex-1 bg-black/30 border border-white/10 rounded-lg px-3 py-2 text-xs font-mono text-gray-200 focus:outline-none focus:border-yellow-400"
                      />
                      <button
                        onClick={handleOfflineQuery}
                        disabled={!offlineInput.trim()}
                        className="bg-yellow-400/10 hover:bg-yellow-400/20 border border-yellow-400/30 text-yellow-400 px-4 py-2 rounded-lg font-mono text-xs font-bold uppercase transition-all"
                      >
                        Execute LOCAL
                      </button>
                    </div>

                  </div>
                </div>

              </motion.div>
            )}
          </AnimatePresence>

          {/* TAB 7: CYBERSECURITY AUDIT */}
          <AnimatePresence mode="wait">
            {activeTab === 'audit' && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="space-y-6"
              >
                <div className="glass-panel p-6 relative overflow-hidden">
                  <h2 className="text-lg font-semibold flex items-center gap-2 mb-4 text-indigo-400">
                    <ShieldCheck className="w-5 h-5" /> Sentinel Permissions Audit
                  </h2>
                  <p className="text-xs text-gray-400 mb-6 font-mono leading-relaxed">
                    Executing dynamic heuristics to profile third-party application variables. Evaluates potential privilege escalation patterns, anomalous telemetry hooks, and malicious API bridging on the device OS.
                  </p>

                  <div className="bg-black/30 border border-white/5 rounded-xl p-4 overflow-hidden space-y-4 mb-6">
                    {apps.map((app) => (
                      <div key={app.packageName} className="flex justify-between items-center bg-white/5 rounded p-3 border border-white/5">
                        <div>
                          <div className="text-sm font-bold text-white mb-0.5">{app.name}</div>
                          <div className="text-[10px] text-gray-400 font-mono">{app.packageName}</div>
                        </div>
                        <div className="flex gap-1 flex-wrap justify-end max-w-[50%]">
                          {app.unsafePermissions.length > 0 ? (
                            app.unsafePermissions.map((perm) => (
                              <span key={perm} className="px-1.5 py-0.5 bg-red-500/10 text-red-400 text-[9px] font-mono rounded">
                                {perm}
                              </span>
                            ))
                          ) : (
                            <span className="text-[9px] text-emerald-400 font-mono px-2 py-0.5 bg-emerald-400/10 rounded">SAFE</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={performDeepAudit}
                    disabled={isAuditing}
                    className="w-full bg-indigo-500/20 hover:bg-indigo-500/40 text-indigo-300 font-bold border border-indigo-500/30 px-4 py-3 rounded-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {isAuditing ? (
                      <>
                        <ShieldCheck className="w-4 h-4 animate-spin" /> Deep AI Profiling Sequence...
                      </>
                    ) : (
                      <>
                        <ShieldCheck className="w-4 h-4" /> Run Deep Neural Audit
                      </>
                    )}
                  </button>
                  
                  {auditReport && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="mt-6 border-t border-white/10 pt-6"
                    >
                      <h3 className="text-xs font-mono font-bold text-indigo-400 uppercase tracking-widest mb-3">AI Integrity Threat Map</h3>
                      <div className="bg-black/50 border border-indigo-500/20 rounded-xl p-5 text-xs text-gray-300 font-sans leading-relaxed prose prose-invert prose-indigo max-w-none">
                         <div dangerouslySetInnerHTML={{ __html: auditReport.replace(/\n/g, '<br/>').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
                      </div>
                    </motion.div>
                  )}

                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* TAB 8: NEURAL CYBERSECURITY THREAT SANDBOX */}
          <AnimatePresence mode="wait">
            {activeTab === 'sandbox' && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="space-y-6"
              >
                <div className="glass-panel p-6 relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-4 flex gap-2">
                    <span className="text-[9px] font-mono font-bold px-2 py-0.5 rounded bg-[#00E5FF]/10 text-[#00E5FF] border border-[#00E5FF]/20">
                      EMULATOR WORKSTATION
                    </span>
                  </div>

                  <h2 className="text-lg font-semibold flex items-center gap-2 mb-2 text-[#00E5FF]">
                    <Terminal className="w-5 h-5 text-[#00E5FF]" /> Neural Cyber-Threat Sandbox
                  </h2>
                  <p className="text-xs text-gray-400 font-mono mb-6 leading-relaxed">
                    Stress-test active system layers against dynamic adversarial attacks. Trigger predefined threat vectors, prompt the neural compiler to model custom payloads, and tune host network and machine parameters in real-time to hot-patch active vulnerabilities.
                  </p>

                  {/* Top HUD Row */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    {/* Security Integrity Index Indicator */}
                    <div className="bg-black/40 border border-white/5 rounded-xl p-4 flex flex-col justify-between">
                      <div>
                        <span className="text-[9px] text-gray-400 font-bold uppercase tracking-wider block mb-1">System Integrity Index</span>
                        <div className="flex items-baseline gap-2">
                          <span className={`text-3xl font-black font-mono transition-colors ${sandboxScore <= 35 ? 'text-red-500 text-glow-red' : (sandboxScore <= 75 ? 'text-amber-400 text-glow-amber' : 'text-[#00FF9D] text-glow-green')}`}>
                            {sandboxScore}%
                          </span>
                          <span className="text-[10px] text-gray-500 font-mono">STABILITY RATE</span>
                        </div>
                      </div>
                      <div className="w-full bg-white/5 rounded-full h-1.5 mt-3 overflow-hidden">
                        <div 
                          className={`h-full transition-all duration-500 ${sandboxScore <= 35 ? 'bg-red-500' : (sandboxScore <= 75 ? 'bg-amber-400' : 'bg-[#00FF9D]')}`}
                          style={{ width: `${sandboxScore}%` }}
                        />
                      </div>
                    </div>

                    {/* Threat Status Beacon */}
                    <div className="bg-black/40 border border-white/5 rounded-xl p-4 flex flex-col justify-between">
                      <div>
                        <span className="text-[9px] text-gray-400 font-bold uppercase tracking-wider block mb-1">State Subsystem Status</span>
                        {sandboxThreatId === 'none' ? (
                          <div className="flex items-center gap-2 text-[#00FF9D] font-mono text-xs font-bold pt-1">
                            <span className="w-2 h-2 rounded-full bg-[#00FF9D] animate-ping" />
                            <span>NOMINAL SECURITY PROFILE</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 text-red-500 font-mono text-xs font-bold pt-1 animate-pulse">
                            <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                            <span>NODE COMPROMISED (ACTIVE INTRUSION)</span>
                          </div>
                        )}
                      </div>
                      <div className="text-[10px] text-gray-400 font-mono leading-tight mt-2 italic">
                        {sandboxThreatId === 'none' ? 'All network and memory nodes monitored. Waiting for scenario execution.' : `Active Threat ID: ${sandboxThreatId.toUpperCase()}`}
                      </div>
                    </div>

                    {/* Quick AI Auto-Heal Panel */}
                    <div className="bg-black/40 border border-white/5 rounded-xl p-4 flex flex-col justify-between">
                      <div>
                        <span className="text-[9px] text-gray-400 font-bold uppercase tracking-wider block mb-1">Autonomous Assistance</span>
                        <p className="text-[10px] text-gray-500 leading-tight">Authorize autopilot algorithms to scan nodes and instantly hotfire optimum parameters.</p>
                      </div>
                      <button
                        onClick={autoHealParameters}
                        disabled={sandboxThreatId === 'none'}
                        className="w-full mt-2.5 bg-[#00FF9D]/10 hover:bg-[#00FF9D]/25 disabled:opacity-30 disabled:hover:bg-transparent border border-[#00FF9D]/30 hover:border-[#00FF9D]/60 text-[#00FF9D] px-3 py-1.5 rounded-lg font-mono text-[10px] font-bold uppercase tracking-wider transition-all"
                      >
                        ⚡ Engage AI Autopilot
                      </button>
                    </div>
                  </div>

                  {/* Interactive Network Node Visual Map */}
                  <div className="mb-6 space-y-2">
                    <span className="text-[9px] text-gray-400 font-bold uppercase tracking-wider block px-1">Interactive Host Node Segment Diagram</span>
                    <svg className="w-full h-36 bg-black/55 border border-white/5 rounded-xl p-2 font-mono" viewBox="0 0 500 120">
                      {/* Connecting flows */}
                      <g strokeWidth="2">
                        {/* Gateway to Auth */}
                        <line 
                          x1="80" y1="60" x2="190" y2="60" 
                          stroke={sandboxThreatId === 'ddos' ? '#ef4444' : '#00E5FF'} 
                          strokeDasharray="6 4" 
                          className={sandboxThreatId !== 'none' ? 'animate-[dash_10s_linear_infinite]' : ''} 
                        />
                        {/* Auth to Database */}
                        <line 
                          x1="190" y1="60" x2="310" y2="35" 
                          stroke={sandboxThreatId === 'mitm' || sandboxThreatId === 'sql_inject' ? '#ef4444' : '#00E5FF'} 
                          strokeDasharray="6 4" 
                        />
                        {/* Auth to Kernel */}
                        <line 
                          x1="190" y1="60" x2="420" y2="60" 
                          stroke={sandboxThreatId === 'zero_day' || sandboxThreatId === 'ransomware' ? '#ef4444' : '#00E5FF'} 
                          strokeDasharray="6 4" 
                        />
                        {/* Database to Kernel connector */}
                        <line 
                          x1="310" y1="35" x2="420" y2="60" 
                          stroke={sandboxThreatId === 'ransomware' ? '#ef4444' : '#00E5FF'}
                          strokeDasharray="6 4" 
                        />
                      </g>

                      {/* Node circle points */}
                      {/* Gateway */}
                      <g className="cursor-pointer" onClick={() => { playSfx(440, 'sine', 0.1); showToast("Interface Node: GATEWAY, handles network boundaries.", "info"); }}>
                        <circle cx="80" cy="60" r="16" fill="#080c14" stroke={sandboxThreatId === 'ddos' ? '#ef4444' : '#00FF9D'} strokeWidth="2.5" className={sandboxThreatId === 'ddos' ? 'animate-pulse' : ''} />
                        <text x="80" y="64" fill="#fff" fontSize="9" textAnchor="middle" fontWeight="black" fontFamily="monospace">GW</text>
                      </g>

                      {/* Authentication */}
                      <g className="cursor-pointer" onClick={() => { playSfx(554, 'sine', 0.1); showToast("Interface Node: AUTH, handles user credentials.", "info"); }}>
                        <circle cx="190" cy="60" r="16" fill="#080c14" stroke={sandboxThreatId === 'mitm' ? '#ef4444' : '#00FF9D'} strokeWidth="2.5" className={sandboxThreatId === 'mitm' ? 'animate-pulse' : ''} />
                        <text x="190" y="64" fill="#fff" fontSize="9" textAnchor="middle" fontWeight="black" fontFamily="monospace">AUTH</text>
                      </g>

                      {/* SQL Database */}
                      <g className="cursor-pointer" onClick={() => { playSfx(660, 'sine', 0.1); showToast("Interface Node: DATABASE, processes SQL parameter structures.", "info"); }}>
                        <circle cx="310" cy="35" r="16" fill="#080c14" stroke={sandboxThreatId === 'sql_inject' ? '#ef4444' : '#00FF9D'} strokeWidth="2.5" className={sandboxThreatId === 'sql_inject' ? 'animate-pulse' : ''} />
                        <text x="310" y="39" fill="#fff" fontSize="8" textAnchor="middle" fontWeight="black" fontFamily="monospace">SQL</text>
                      </g>

                      {/* Memory/Kernel */}
                      <g className="cursor-pointer" onClick={() => { playSfx(880, 'sine', 0.1); showToast("Interface Node: KERNEL, operates memory allocation registry.", "info"); }}>
                        <circle cx="420" cy="60" r="16" fill="#080c14" stroke={sandboxThreatId === 'zero_day' || sandboxThreatId === 'ransomware' ? '#ef4444' : '#00FF9D'} strokeWidth="2.5" className={sandboxThreatId === 'zero_day' || sandboxThreatId === 'ransomware' ? 'animate-pulse' : ''} />
                        <text x="420" y="64" fill="#fff" fontSize="8" textAnchor="middle" fontWeight="black" fontFamily="monospace">MEM</text>
                      </g>

                      {/* Nodes active subtitles */}
                      <text x="80" y="88" fill="#9ca3af" fontSize="8" textAnchor="middle" fontFamily="monospace" fontWeight="bold">Ingress Port</text>
                      <text x="190" y="88" fill="#9ca3af" fontSize="8" textAnchor="middle" fontFamily="monospace" fontWeight="bold">Key Server</text>
                      <text x="310" y="64" fill="#9ca3af" fontSize="8" textAnchor="middle" fontFamily="monospace" fontWeight="bold">Data Layer</text>
                      <text x="420" y="88" fill="#9ca3af" fontSize="8" textAnchor="middle" fontFamily="monospace" fontWeight="bold">Host OS</text>
                    </svg>
                  </div>

                  {/* Main Workstation Partition (Form Controls + Threat Simulator Console) */}
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 leading-normal">
                    
                    {/* Left side: Node Parameters Customizing Sliders & Selectors (7 Cols) */}
                    <div className="lg:col-span-7 space-y-4 font-mono text-xs text-gray-300">
                      
                      {/* Gateway Node Controller Custom */}
                      <div className="bg-black/40 border border-white/5 rounded-xl p-4 space-y-3 relative overflow-hidden">
                        <div className="absolute right-3 top-3">
                          <span className="text-[7px] text-gray-500 font-bold tracking-widest block uppercase">Node: GW-01</span>
                        </div>
                        <span className="text-[10px] text-[#00E5FF] font-extrabold uppercase tracking-wider block">
                          🌐 GATEWAY INTERFACE CONFIGURATION
                        </span>
                        
                        <div className="space-y-3">
                          {/* Packet Rate limit */}
                          <div>
                            <div className="flex justify-between items-center text-[10px] mb-1">
                              <span className="text-gray-400 font-bold">API Ingress Rate Limiting:</span>
                              <span className={`font-mono font-black ${sandboxRateLimit <= 200 ? 'text-[#00FF9D]' : 'text-gray-300'}`}>
                                {sandboxRateLimit} req/sec
                              </span>
                            </div>
                            <input 
                              type="range"
                              min="50"
                              max="2000"
                              step="50"
                              value={sandboxRateLimit}
                              onChange={(e) => {
                                setSandboxRateLimit(parseInt(e.target.value));
                                if (parseInt(e.target.value) % 250 === 0) playSfx(400, 'triangle', 0.05);
                              }}
                              className="w-full accent-[#00E5FF] bg-white/5 rounded-lg h-1.5 cursor-pointer"
                            />
                            <div className="flex justify-between text-[8px] text-gray-500 font-semibold mt-1">
                              <span>50 req/sec (Extreme throttle)</span>
                              <span>1000 req/sec (Default state)</span>
                              <span>2000 req/sec (Unchecked packet flood)</span>
                            </div>
                          </div>

                          {/* Firewall Rules strictness */}
                          <div>
                            <div className="flex justify-between items-center text-[10px] mb-1.5">
                              <span className="text-gray-400 font-bold">Firewall Decryption Strictness:</span>
                              <span className="text-amber-400 font-black">Tier {sandboxFirewall} / 5</span>
                            </div>
                            <div className="grid grid-cols-5 gap-1">
                              {[1, 2, 3, 4, 5].map((tier) => (
                                <button
                                  key={tier}
                                  type="button"
                                  onClick={() => { setSandboxFirewall(tier); playSfx(380 + tier*40, 'sine', 0.05); }}
                                  className={`p-1.5 rounded-md border text-center font-bold text-[10px] transition-all cursor-pointer ${
                                    sandboxFirewall === tier 
                                      ? 'bg-[#00E5FF]/20 border-[#00E5FF] text-white' 
                                      : 'border-white/5 bg-black/30 text-gray-400 hover:border-white/15'
                                  }`}
                                >
                                  T-{tier}
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Authentication Node Controller */}
                      <div className="bg-black/40 border border-white/5 rounded-xl p-4 space-y-3 relative overflow-hidden">
                        <div className="absolute right-3 top-3">
                          <span className="text-[7px] text-gray-500 font-bold tracking-widest block uppercase">Node: AUTH-01</span>
                        </div>
                        <span className="text-[10px] text-[#A78BFA] font-extrabold uppercase tracking-wider block">
                          🔑 IDENTITY & DECRYPTION SCHEMES
                        </span>

                        <div className="grid grid-cols-2 gap-4">
                          {/* MFA parameter buttons */}
                          <div>
                            <span className="text-gray-400 text-[10px] block mb-1.5 font-bold">MFA Verification Layer:</span>
                            <div className="flex flex-col gap-1.5">
                              {[
                                { id: 'none', label: '❌ Passive passwords' },
                                { id: 'sms', label: '📱 SMS text codes' },
                                { id: 'fido2', label: '🛡️ Hardware FIDO2' }
                              ].map((opt) => (
                                <button
                                  key={opt.id}
                                  type="button"
                                  onClick={() => { setSandboxMfa(opt.id as any); playSfx(480, 'sine', 0.05); }}
                                  className={`w-full p-2 text-left rounded-lg text-[9px] border font-bold transition-all cursor-pointer ${
                                    sandboxMfa === opt.id 
                                      ? 'bg-[#A78BFA]/20 border-[#A78BFA] text-white' 
                                      : 'border-white/5 bg-black/30 text-gray-400 hover:border-white/10'
                                  }`}
                                >
                                  {opt.label}
                                </button>
                              ))}
                            </div>
                          </div>

                          {/* Cryptographic strengths */}
                          <div>
                            <span className="text-gray-400 text-[10px] block mb-1.5 font-bold">Host Encryption Strength:</span>
                            <div className="flex flex-col gap-1.5">
                              {[
                                { bits: 128, label: '128-bit block size (Low CPU)' },
                                { bits: 256, label: '256-bit block cipher' },
                                { bits: 4096, label: '4096-bit high-entropy' }
                              ].map((opt) => (
                                <button
                                  key={opt.bits}
                                  type="button"
                                  onClick={() => { setSandboxEncryption(opt.bits as any); playSfx(480, 'triangle', 0.05); }}
                                  className={`w-full p-2 text-left rounded-lg text-[9px] border font-bold transition-all cursor-pointer ${
                                    sandboxEncryption === opt.bits 
                                      ? 'bg-amber-400/20 border-amber-400 text-white' 
                                      : 'border-white/5 bg-black/30 text-gray-400 hover:border-white/10'
                                  }`}
                                >
                                  🗝️ {opt.label}
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Databases and Host System continuous patching control */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* SQL database check */}
                        <div className="bg-black/40 border border-white/5 rounded-xl p-4 space-y-3 relative">
                          <span className="text-[10px] text-[#00FF9D] font-extrabold uppercase tracking-wider block">
                            🗄️ SQL DATABASE SANITIZER
                          </span>
                          <div>
                            <div className="flex justify-between items-center text-[10px] mb-1">
                              <span className="text-gray-400 font-bold">Query Parse Depth:</span>
                              <span className="text-[#00FF9D] font-bold">Level {sandboxDbSanitizer} / 5</span>
                            </div>
                            <input 
                              type="range"
                              min="1"
                              max="5"
                              step="1"
                              value={sandboxDbSanitizer}
                              onChange={(e) => {
                                setSandboxDbSanitizer(parseInt(e.target.value));
                                playSfx(300 + parseInt(e.target.value)*70, 'sine', 0.04);
                              }}
                              className="w-full accent-[#00FF9D] bg-white/5 rounded-lg h-1.5 cursor-pointer"
                            />
                            <div className="flex justify-between text-[7px] text-gray-500 font-bold mt-1">
                              <span>Tier 1 (Raw inputs)</span>
                              <span>Tier 5 (STRICT binding)</span>
                            </div>
                          </div>
                        </div>

                        {/* Host system patch cycles */}
                        <div className="bg-black/40 border border-white/5 rounded-xl p-4 space-y-3 relative">
                          <span className="text-[10px] text-indigo-400 font-extrabold uppercase tracking-wider block">
                            ⚙️ AUTONOMOUS OS PATCH FREQUENCY
                          </span>
                          <div className="flex flex-col gap-1.5">
                            {[
                              { id: 'monthly', msg: '🗓️ Monthly scheduled updates' },
                              { id: 'weekly', msg: '⚡ Weekly scheduled audits' },
                              { id: 'real-time', msg: '🔥 Real-time Continuous integration' }
                            ].map((cycle) => (
                              <button
                                key={cycle.id}
                                type="button"
                                onClick={() => { setSandboxPatchFreq(cycle.id as any); playSfx(420, 'square', 0.05); }}
                                className={`w-full p-2 text-left rounded-lg text-[9px] border font-bold transition-all cursor-pointer ${
                                  sandboxPatchFreq === cycle.id 
                                    ? 'bg-indigo-400/20 border-indigo-400 text-white' 
                                    : 'border-white/5 bg-black/30 text-gray-400 hover:border-white/10'
                                }`}
                              >
                                {cycle.msg}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>

                    </div>

                    {/* Right side: Predefined & AI Custom simulators + Dynamic logs output (5 Cols) */}
                    <div className="lg:col-span-5 flex flex-col gap-4">
                      
                      {/* Standard Presets Selector */}
                      <div className="bg-black/40 border border-white/5 rounded-xl p-4 space-y-3">
                        <span className="text-[10px] text-orange-400 font-extrabold uppercase tracking-wider block">
                          ☄️ INITIATE ATTACK VECTOR SCRIPTS
                        </span>
                        
                        <div className="grid grid-cols-2 gap-1.5 text-[9px] font-mono">
                          {[
                            { id: 'ddos', name: '⚡ DDoS FLOOD' },
                            { id: 'ransomware', name: '☠️ RANSOMWARE' },
                            { id: 'sql_inject', name: '💉 SQL INJECT' },
                            { id: 'mitm', name: '🛰️ SUBNET MITM' },
                            { id: 'zero_day', name: '⚙️ ZERO-DAY EXPL' }
                          ].map((t) => (
                            <button
                              key={t.id}
                              type="button"
                              onClick={() => triggerSandboxThreat(t.id as any)}
                              disabled={sandboxThreatId !== 'none'}
                              className="p-2 border border-white/5 bg-black/30 font-bold hover:bg-red-500/10 hover:border-red-500/30 text-gray-300 hover:text-red-400 transition-all rounded-lg disabled:opacity-30 disabled:hover:bg-transparent"
                            >
                              {t.name}
                            </button>
                          ))}
                          <button
                            type="button"
                            onClick={() => {
                              playSfx(300, 'sine', 0.2);
                              setSandboxThreatId('none');
                              setSandboxScore(100);
                              setSandboxLogs(prev => [...prev, '[RESET] Restoring sandbox network registry to initial standby... All nominal.'].slice(-15));
                              showToast("Sandbox restored successfully", "success");
                            }}
                            className="p-2 border border-blue-500/20 text-blue-400 hover:bg-blue-500/10 hover:text-white transition-all font-bold rounded-lg"
                          >
                            🔄 RESET DEFAULTS
                          </button>
                        </div>
                      </div>

                      {/* AI Generative Threats compiler */}
                      <div className="bg-black/40 border border-[#00E5FF]/10 rounded-xl p-4 space-y-3">
                        <span className="text-[10px] text-transparent bg-clip-text bg-gradient-to-r from-[#00E5FF] to-[#A78BFA] font-extrabold uppercase tracking-wider block">
                          🧠 AI NEURAL CUSTOM EXPLOIT MODELER
                        </span>
                        
                        <p className="text-[10px] text-gray-400 font-sans leading-relaxed">
                          Describe any complex, customized hack vector. The AI compiles custom requirements & stress levels to evaluate parameters.
                        </p>

                        <div className="space-y-2">
                          <input 
                            type="text"
                            value={customThreatPrompt}
                            onChange={(e) => setCustomThreatPrompt(e.target.value)}
                            placeholder="e.g., SolarWinds style dependency hack..."
                            disabled={isGeneratingCustomThreat || sandboxThreatId !== 'none'}
                            className="w-full bg-black/30 border border-white/10 rounded-lg px-2.5 py-1.5 text-[10px] font-mono text-gray-200 focus:outline-none focus:border-[#00E5FF] disabled:opacity-40"
                          />
                          <button
                            type="button"
                            onClick={generateAICustomThreat}
                            disabled={isGeneratingCustomThreat || !customThreatPrompt.trim() || sandboxThreatId !== 'none'}
                            className="w-full bg-[#00E5FF]/10 hover:bg-[#00E5FF]/20 border border-[#00E5FF]/30 hover:border-[#00E5FF] text-[#00E5FF] px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase transition-all flex items-center justify-center gap-2"
                          >
                            {isGeneratingCustomThreat ? (
                              <>
                                <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Compiling attack vector...
                              </>
                            ) : (
                              <>
                                <Sparkles className="w-3.5 h-3.5" /> Compile AI Hack Scenario
                              </>
                            )}
                          </button>
                        </div>

                        {/* Custom threat metadata render */}
                        {sandboxThreatId === 'custom' && (
                          <motion.div 
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            className="p-2.5 rounded-lg border border-red-500/20 bg-red-500/5 text-[9px] font-sans space-y-1"
                          >
                            <span className="text-red-400 font-extrabold uppercase font-mono block">Loaded Scenario: {customThreatTitle}</span>
                            <p className="text-gray-300 leading-normal">{customThreatDesc}</p>
                          </motion.div>
                        )}
                      </div>

                      {/* Live Sandbox Monitor Log Console */}
                      <div className="bg-black/60 border border-white/10 rounded-xl p-4 flex-1 flex flex-col min-h-[160px] justify-between relative overflow-hidden">
                        <div className="absolute right-3 top-3">
                          <span className="text-[7.5px] font-mono text-[#00FF9D] tracking-widest block uppercase font-bold animate-pulse">
                            ● REC_STREAM
                          </span>
                        </div>
                        <span className="text-[9px] text-gray-400 font-bold uppercase tracking-wider block mb-2 font-mono">
                          📟 ACTIVE EMBEDDED CONSOLE DECODER
                        </span>
                        
                        <div className="flex-1 font-mono text-[9px] text-gray-400 overflow-y-auto space-y-1 pr-1 max-h-[130px] leading-relaxed scrollbar-thin">
                          {sandboxLogs.slice().reverse().map((lg, i) => {
                            let cl = 'text-gray-400';
                            if (lg.startsWith('[SYSTEM]') || lg.startsWith('[INIT]')) cl = 'text-gray-500';
                            if (lg.startsWith('[SIMULATION') || lg.startsWith('[ALERT]') || lg.startsWith('[CRITICAL]')) cl = 'text-red-400 font-bold';
                            if (lg.startsWith('[SUCCESS]') || lg.startsWith('[SECURE]')) cl = 'text-[#00FF9D] font-bold';
                            if (lg.startsWith('[AI') || lg.startsWith('[LOCAL ENGINE]')) cl = 'text-[#00E5FF] font-bold';
                            
                            return (
                              <div key={i} className={cl}>
                                {lg}
                              </div>
                            );
                          })}
                        </div>
                      </div>

                    </div>

                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* TAB 9: BIOMETRIC INTERFACE SECURITY LOCK */}
          <AnimatePresence mode="wait">
            {activeTab === 'biometric' && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="grid grid-cols-1 md:grid-cols-2 gap-6"
              >
                <div className="w-full flex items-center justify-center p-8 bg-black/40 border border-[#00FF9D]/20 rounded-xl">
                  <BiometricLock 
                    playSfx={playSfx} 
                    onLockComplete={() => {
                      showToast("Local interface secured.", "success");
                    }} 
                    onScanAttempt={handleBiometricAttempt}
                  />
                </div>
                
                <div className="glass-panel p-6 flex flex-col h-[500px]">
                  <div className="flex items-center justify-between mb-4 border-b border-white/5 pb-3">
                    <h3 className="text-sm font-bold font-mono text-[#00FF9D] flex items-center gap-2">
                      <Fingerprint size={16} /> Biometric Authentication Log
                    </h3>
                    <div className="flex items-center gap-2">
                      <select 
                        value={biometricFilter}
                        onChange={(e) => setBiometricFilter(e.target.value as any)}
                        className="bg-black/50 border border-white/10 text-gray-300 text-[10px] font-mono px-2 py-1 rounded"
                      >
                        <option value="all">ALL OUTCOMES</option>
                        <option value="success">SUCCESSFUL</option>
                        <option value="failed">FAILED</option>
                        <option value="aborted">ABORTED</option>
                      </select>
                      <select 
                        value={biometricSort}
                        onChange={(e) => setBiometricSort(e.target.value as any)}
                        className="bg-black/50 border border-white/10 text-gray-300 text-[10px] font-mono px-2 py-1 rounded"
                      >
                        <option value="date-desc">DATE (NEWEST)</option>
                        <option value="date-asc">DATE (OLDEST)</option>
                        <option value="user-asc">USER ID</option>
                      </select>
                    </div>
                  </div>
                  
                  <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
                    {biometricLogs
                      .filter(log => biometricFilter === 'all' || log.outcome === biometricFilter)
                      .sort((a, b) => {
                        if (biometricSort === 'date-desc') return b.timestamp.getTime() - a.timestamp.getTime();
                        if (biometricSort === 'date-asc') return a.timestamp.getTime() - b.timestamp.getTime();
                        if (biometricSort === 'user-asc') return a.userId.localeCompare(b.userId);
                        return 0;
                      })
                      .map((log) => (
                      <div key={log.id} className="bg-black/50 border border-white/10 rounded-lg p-3 flex justify-between items-center transition-all hover:bg-white/5">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-full ${
                            log.outcome === 'success' ? 'bg-[#00FF9D]/10 text-[#00FF9D]' :
                            log.outcome === 'failed' ? 'bg-red-500/10 text-red-500' :
                            'bg-yellow-500/10 text-yellow-500'
                          }`}>
                            {log.outcome === 'success' ? <ShieldCheck size={14} /> : 
                             log.outcome === 'failed' ? <AlertCircle size={14} /> : 
                             <Clock size={14} />}
                          </div>
                          <div>
                            <div className="text-xs font-mono text-gray-200">{log.userId}</div>
                            <div className="text-[10px] text-gray-500 font-sans">
                              {log.timestamp.toLocaleDateString()} • {log.timestamp.toLocaleTimeString()}
                            </div>
                          </div>
                        </div>
                        <div className={`text-[10px] font-mono font-bold uppercase ${
                            log.outcome === 'success' ? 'text-[#00FF9D]' :
                            log.outcome === 'failed' ? 'text-red-500' :
                            'text-yellow-500'
                        }`}>
                          {log.outcome}
                        </div>
                      </div>
                    ))}
                      {biometricLogs.filter(log => biometricFilter === 'all' || log.outcome === biometricFilter).length === 0 && (
                        <div className="h-full flex items-center justify-center text-xs font-mono text-gray-500">
                          NO LOGS DETECTED
                        </div>
                      )}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

        </div>

      </div>

    </div>
  );
}
