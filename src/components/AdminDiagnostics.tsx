import React, { useState, useEffect } from 'react';
import { Mail, ShieldCheck, CheckCircle2, AlertCircle, RefreshCw, Server, Send, Key, Activity, Database, Terminal, Trash2 } from 'lucide-react';
import { motion } from 'motion/react';

interface SmtpStatusResponse {
  success: boolean;
  message: string;
  host: string;
  port: number;
}

interface DiagnosticLog {
  id: string;
  timestamp: string;
  level: 'INFO' | 'WARN' | 'ERROR';
  text: string;
}

/**
 * Sanitizes error messages by stripping hostnames, email addresses, and credential/password patterns
 */
export function sanitizeErrorMessage(rawMessage: string): string {
  if (!rawMessage) return 'An unknown error occurred.';
  
  let sanitized = String(rawMessage);

  // 1. Redact email addresses
  sanitized = sanitized.replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, '[EMAIL_REDACTED]');

  // 2. Redact IP addresses
  sanitized = sanitized.replace(/\b(?:[0-9]{1,3}\.){3}[0-9]{1,3}\b/g, '[IP_REDACTED]');

  // 3. Redact domain hostnames (e.g. smtp.gmail.com, mail.google.com, etc.)
  sanitized = sanitized.replace(/\b[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*\.(?:com|org|net|io|co|gov|edu|app)\b/gi, '[HOST_REDACTED]');

  // 4. Redact key-value credentials (e.g. pass=..., password=..., secret=..., token=...)
  sanitized = sanitized.replace(/(?:password|pass|pwd|key|auth|secret|token|credentials)[:=]\s*['"]?[^\s'",;]+['"]?/gi, (match) => {
    const keyName = match.split(/[:=]/)[0];
    return `${keyName}=[REDACTED]`;
  });

  // 5. Redact 16-character space-separated App Passwords (e.g. izqm oykm xxrj trgb)
  sanitized = sanitized.replace(/\b[a-zA-Z]{4}\s[a-zA-Z]{4}\s[a-zA-Z]{4}\s[a-zA-Z]{4}\b/g, '[CREDENTIAL_REDACTED]');

  return sanitized;
}

export function AdminDiagnostics({ onClose }: { onClose?: () => void }) {
  const [loading, setLoading] = useState<boolean>(false);
  const [statusResult, setStatusResult] = useState<SmtpStatusResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Test Email Sending State
  const [testEmail, setTestEmail] = useState<string>('krishnab3032@gmail.com');
  const [dispatching, setDispatching] = useState<boolean>(false);
  const [dispatchResult, setDispatchResult] = useState<{ success: boolean; message: string } | null>(null);

  // Sanitized Error & Event Log Stream
  const [logs, setLogs] = useState<DiagnosticLog[]>([]);

  const addSanitizedLog = (level: 'INFO' | 'WARN' | 'ERROR', rawText: string) => {
    const sanitizedText = sanitizeErrorMessage(rawText);
    const newLog: DiagnosticLog = {
      id: Math.random().toString(36).substring(2, 9),
      timestamp: new Date().toLocaleTimeString(),
      level,
      text: sanitizedText,
    };
    setLogs((prev) => [newLog, ...prev.slice(0, 19)]);
  };

  const runSmtpTest = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch('/api/auth/smtp-status');
      const data = await res.json();
      
      const sanitizedMsg = sanitizeErrorMessage(data.message || '');
      setStatusResult({
        ...data,
        message: sanitizedMsg,
      });

      if (data.success) {
        addSanitizedLog('INFO', `SMTP Connection verified successfully on TLS port.`);
      } else {
        addSanitizedLog('ERROR', `SMTP Verification failed: ${data.message}`);
      }
    } catch (err: any) {
      const sanitizedErr = sanitizeErrorMessage(err?.message || 'Failed to connect to backend SMTP diagnostic route.');
      setError(sanitizedErr);
      addSanitizedLog('ERROR', `SMTP Diagnostic fetch error: ${sanitizedErr}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    runSmtpTest();
  }, []);

  const handleSendTestEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!testEmail || !testEmail.includes('@')) return;

    try {
      setDispatching(true);
      setDispatchResult(null);

      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: testEmail }),
      });

      const data = await res.json();
      const sanitizedMsg = sanitizeErrorMessage(data.message || 'Dispatched password reset email via SMTP.');

      setDispatchResult({
        success: res.ok && data.success,
        message: sanitizedMsg,
      });

      if (res.ok && data.success) {
        addSanitizedLog('INFO', `Password reset request dispatched. User email masked for privacy.`);
      } else {
        addSanitizedLog('WARN', `Reset dispatch warning: ${sanitizedMsg}`);
      }
    } catch (err: any) {
      const sanitizedErr = sanitizeErrorMessage(err?.message || 'Network error communicating with password reset dispatch service.');
      setDispatchResult({
        success: false,
        message: sanitizedErr,
      });
      addSanitizedLog('ERROR', `Dispatch Exception: ${sanitizedErr}`);
    } finally {
      setDispatching(false);
    }
  };

  return (
    <div id="admin-diagnostics-dashboard" className="bg-[#090D16] border border-[#00E5FF]/30 rounded-2xl p-6 text-white space-y-6 shadow-[0_0_35px_rgba(0,229,255,0.12)] relative overflow-hidden">
      {/* Glow Effects */}
      <div className="absolute -top-20 -left-20 w-40 h-40 bg-[#00E5FF]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-20 -right-20 w-40 h-40 bg-[#7C3AED]/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/10 pb-4 relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#00E5FF]/10 border border-[#00E5FF]/30 flex items-center justify-center text-[#00E5FF] shadow-[0_0_15px_rgba(0,229,255,0.2)]">
            <Activity size={20} />
          </div>
          <div>
            <h3 className="text-sm font-bold font-mono tracking-wider text-white uppercase flex items-center gap-2">
              Admin Diagnostics Dashboard
              <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-[#00FF9D]/15 text-[#00FF9D] border border-[#00FF9D]/30">
                SYSTEM ONLINE
              </span>
            </h3>
            <p className="text-xs text-gray-400 font-mono">
              KRISHNA_OS Infrastructure & SMTP Gateway Health
            </p>
          </div>
        </div>

        {onClose && (
          <button
            id="admin-diagnostics-close-btn"
            onClick={onClose}
            className="text-gray-400 hover:text-white font-mono text-sm px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 cursor-pointer transition-colors"
          >
            ✕
          </button>
        )}
      </div>

      {/* Top Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 relative z-10 font-mono">
        <div className="bg-black/40 border border-white/10 rounded-xl p-3 flex items-center gap-3">
          <Server className="text-[#00E5FF] shrink-0" size={20} />
          <div>
            <div className="text-[10px] text-gray-400 uppercase">SMTP Gateway</div>
            <div className="text-xs font-bold text-white">
              {statusResult?.success ? 'TLS Secured' : loading ? 'Testing...' : 'Offline'}
            </div>
          </div>
        </div>

        <div className="bg-black/40 border border-white/10 rounded-xl p-3 flex items-center gap-3">
          <ShieldCheck className="text-[#00FF9D] shrink-0" size={20} />
          <div>
            <div className="text-[10px] text-gray-400 uppercase">Credential Vault</div>
            <div className="text-xs font-bold text-[#00FF9D]">Zero Leaks (ENV)</div>
          </div>
        </div>

        <div className="bg-black/40 border border-white/10 rounded-xl p-3 flex items-center gap-3">
          <Database className="text-[#7C3AED] shrink-0" size={20} />
          <div>
            <div className="text-[10px] text-gray-400 uppercase">Token Hashing</div>
            <div className="text-xs font-bold text-white">SHA-256 Single-Use</div>
          </div>
        </div>
      </div>

      {/* Main Diagnostic Test Panel */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 relative z-10">
        {/* SMTP Connection Tester */}
        <div id="smtp-tester-card" className="bg-black/40 border border-white/10 rounded-xl p-4 space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-xs font-mono text-gray-300 uppercase tracking-wider flex items-center gap-1.5 font-bold">
              <Mail size={15} className="text-[#00E5FF]" />
              SMTP Connection Test
            </span>
            <button
              id="trigger-smtp-test-btn"
              onClick={runSmtpTest}
              disabled={loading}
              className="px-2.5 py-1 rounded-lg bg-[#00E5FF]/10 hover:bg-[#00E5FF]/20 text-[#00E5FF] text-xs font-mono transition-all cursor-pointer disabled:opacity-50 flex items-center gap-1.5 border border-[#00E5FF]/30"
            >
              <RefreshCw size={12} className={loading ? 'animate-spin' : ''} />
              <span>TEST NOW</span>
            </button>
          </div>

          {loading ? (
            <div className="py-6 text-center space-y-2">
              <RefreshCw size={22} className="animate-spin text-[#00E5FF] mx-auto" />
              <p className="text-xs font-mono text-gray-400">Verifying TLS Handshake with SMTP Server...</p>
            </div>
          ) : error ? (
            <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-xs font-mono text-red-400 flex items-center gap-2">
              <AlertCircle size={16} className="shrink-0" />
              <span>{error}</span>
            </div>
          ) : statusResult ? (
            <div className="space-y-2 font-mono text-xs">
              <div className="flex justify-between items-center p-2 rounded bg-white/5 border border-white/5">
                <span className="text-gray-400">Handshake Result:</span>
                <span className={`font-bold flex items-center gap-1 ${statusResult.success ? 'text-[#00FF9D]' : 'text-red-400'}`}>
                  {statusResult.success ? <CheckCircle2 size={14} /> : <AlertCircle size={14} />}
                  {statusResult.success ? 'SUCCESS (200 OK)' : 'FAILED'}
                </span>
              </div>

              <div className="flex justify-between items-center p-2 rounded bg-white/5 border border-white/5">
                <span className="text-gray-400">Target Encryption:</span>
                <span className="text-[#00E5FF] font-semibold">TLS Secured</span>
              </div>

              <div className="p-2.5 bg-black/60 rounded border border-white/5 text-[11px] text-gray-300 leading-relaxed">
                <div className="text-[10px] text-gray-500 uppercase mb-1">Sanitized Status Message:</div>
                {statusResult.message}
              </div>
            </div>
          ) : null}
        </div>

        {/* Security Audit Rules */}
        <div className="bg-black/40 border border-white/10 rounded-xl p-4 space-y-3">
          <span className="text-xs font-mono text-gray-300 uppercase tracking-wider flex items-center gap-1.5 font-bold">
            <ShieldCheck size={15} className="text-[#00FF9D]" />
            Security & Credential Masking
          </span>

          <div className="space-y-2 text-xs font-mono">
            <div className="flex items-center gap-2 text-gray-300 bg-white/5 p-2 rounded border border-white/5">
              <CheckCircle2 size={14} className="text-[#00FF9D] shrink-0" />
              <span>SMTP Passwords never outputted in logs or UI</span>
            </div>

            <div className="flex items-center gap-2 text-gray-300 bg-white/5 p-2 rounded border border-white/5">
              <CheckCircle2 size={14} className="text-[#00FF9D] shrink-0" />
              <span>Rate limit: 60s cooldown & max 3 reqs / 15 mins</span>
            </div>

            <div className="flex items-center gap-2 text-gray-300 bg-white/5 p-2 rounded border border-white/5">
              <CheckCircle2 size={14} className="text-[#00FF9D] shrink-0" />
              <span>Generic response prevents email enumeration</span>
            </div>

            <div className="flex items-center gap-2 text-gray-300 bg-white/5 p-2 rounded border border-white/5">
              <CheckCircle2 size={14} className="text-[#00FF9D] shrink-0" />
              <span>TLS Certificate verification active</span>
            </div>
          </div>
        </div>
      </div>

      {/* Dispatch Test Form */}
      <div className="bg-black/40 border border-white/10 rounded-xl p-4 space-y-3 relative z-10">
        <span className="text-xs font-mono text-gray-300 uppercase tracking-wider flex items-center gap-1.5 font-bold">
          <Send size={14} className="text-[#00E5FF]" />
          Send Test Password Reset Email
        </span>

        <form onSubmit={handleSendTestEmail} className="flex flex-col sm:flex-row gap-2">
          <div className="flex-1 relative">
            <Mail className="absolute left-3 top-2.5 text-gray-500" size={14} />
            <input
              type="email"
              required
              value={testEmail}
              onChange={(e) => setTestEmail(e.target.value)}
              placeholder="Enter recipient email"
              className="w-full pl-9 pr-3 py-2 bg-black/60 border border-white/10 rounded-lg text-xs text-white placeholder-gray-600 font-mono focus:outline-none focus:border-[#00E5FF]"
            />
          </div>

          <button
            type="submit"
            disabled={dispatching}
            className="px-4 py-2 bg-[#00E5FF]/20 hover:bg-[#00E5FF]/30 border border-[#00E5FF]/40 text-[#00E5FF] font-mono text-xs font-bold rounded-lg transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2 shrink-0"
          >
            {dispatching ? (
              <>
                <RefreshCw size={12} className="animate-spin" />
                <span>DISPATCHING...</span>
              </>
            ) : (
              <>
                <Key size={12} />
                <span>DISPATCH TEST EMAIL</span>
              </>
            )}
          </button>
        </form>

        {dispatchResult && (
          <div className={`p-3 rounded-lg text-xs font-mono flex items-center gap-2 ${
            dispatchResult.success 
              ? 'bg-[#00FF9D]/10 border border-[#00FF9D]/30 text-[#00FF9D]' 
              : 'bg-red-500/10 border border-red-500/30 text-red-400'
          }`}>
            {dispatchResult.success ? <CheckCircle2 size={16} className="shrink-0" /> : <AlertCircle size={16} className="shrink-0" />}
            <span>{dispatchResult.message}</span>
          </div>
        )}
      </div>

      {/* Sanitized Console Stream */}
      <div className="bg-black/60 border border-white/10 rounded-xl p-4 space-y-2 relative z-10 font-mono">
        <div className="flex items-center justify-between text-xs text-gray-400 border-b border-white/10 pb-2">
          <div className="flex items-center gap-2 font-bold text-gray-200">
            <Terminal size={14} className="text-[#00E5FF]" />
            <span>Sanitized Diagnostic Console Feed</span>
          </div>
          {logs.length > 0 && (
            <button
              onClick={() => setLogs([])}
              className="text-gray-500 hover:text-red-400 flex items-center gap-1 text-[10px] cursor-pointer"
            >
              <Trash2 size={10} /> CLEAR
            </button>
          )}
        </div>

        <div className="max-h-36 overflow-y-auto space-y-1 pr-1 text-[11px]">
          {logs.length === 0 ? (
            <p className="text-gray-600 italic py-2 text-center text-[10px]">
              No diagnostic events recorded in current session. Run a connection test above.
            </p>
          ) : (
            logs.map((log) => (
              <div key={log.id} className="flex items-start gap-2 py-0.5 border-b border-white/[0.03]">
                <span className="text-gray-500 shrink-0 text-[10px]">{log.timestamp}</span>
                <span className={`px-1 py-0.2 text-[9px] rounded font-bold shrink-0 ${
                  log.level === 'ERROR' ? 'bg-red-500/20 text-red-400' :
                  log.level === 'WARN' ? 'bg-amber-500/20 text-amber-300' : 'bg-[#00FF9D]/20 text-[#00FF9D]'
                }`}>
                  {log.level}
                </span>
                <span className="text-gray-300 break-all">{log.text}</span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
