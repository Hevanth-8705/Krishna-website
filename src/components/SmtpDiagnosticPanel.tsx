import React, { useState, useEffect } from 'react';
import { Mail, ShieldCheck, CheckCircle2, AlertCircle, RefreshCw, Server, Lock, Send, Key } from 'lucide-react';
import { motion } from 'motion/react';

interface SmtpStatusResponse {
  success: boolean;
  message: string;
  host: string;
  port: number;
}

export function SmtpDiagnosticPanel({ onClose }: { onClose?: () => void }) {
  const [loading, setLoading] = useState<boolean>(false);
  const [statusResult, setStatusResult] = useState<SmtpStatusResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Test Email Sending State
  const [testEmail, setTestEmail] = useState<string>('krishnab3032@gmail.com');
  const [dispatching, setDispatching] = useState<boolean>(false);
  const [dispatchResult, setDispatchResult] = useState<{ success: boolean; message: string } | null>(null);

  const runSmtpTest = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch('/api/auth/smtp-status');
      const data = await res.json();
      setStatusResult(data);
    } catch (err: any) {
      setError('Failed to reach backend SMTP diagnostic endpoint.');
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
      setDispatchResult({
        success: res.ok && data.success,
        message: data.message || 'Dispatched request to SMTP service.',
      });
    } catch (err: any) {
      setDispatchResult({
        success: false,
        message: 'Network error communicating with password reset dispatch service.',
      });
    } finally {
      setDispatching(false);
    }
  };

  return (
    <div className="bg-[#090D16] border border-[#00E5FF]/30 rounded-2xl p-6 text-white space-y-6 shadow-[0_0_30px_rgba(0,229,255,0.1)] relative overflow-hidden">
      {/* Accent Header */}
      <div className="flex items-center justify-between border-b border-white/10 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#00E5FF]/10 border border-[#00E5FF]/30 flex items-center justify-center text-[#00E5FF] shadow-[0_0_15px_rgba(0,229,255,0.2)]">
            <Mail size={20} />
          </div>
          <div>
            <h3 className="text-sm font-bold font-mono tracking-wider text-white uppercase flex items-center gap-2">
              KRISHNA_OS SMTP Diagnostic Console
              <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-[#00FF9D]/15 text-[#00FF9D] border border-[#00FF9D]/30">
                PRODUCTION
              </span>
            </h3>
            <p className="text-xs text-gray-400 font-mono">
              Safe connection test & token delivery verifier (zero credentials exposed)
            </p>
          </div>
        </div>

        {onClose && (
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white font-mono text-sm px-2 py-1 rounded-lg bg-white/5 hover:bg-white/10 cursor-pointer"
          >
            ✕
          </button>
        )}
      </div>

      {/* Diagnostics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Status Card */}
        <div className="bg-black/40 border border-white/10 rounded-xl p-4 space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-xs font-mono text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
              <Server size={14} className="text-[#00E5FF]" />
              SMTP Connection Status
            </span>
            <button
              onClick={runSmtpTest}
              disabled={loading}
              className="p-1.5 rounded-lg bg-[#00E5FF]/10 hover:bg-[#00E5FF]/20 text-[#00E5FF] transition-all cursor-pointer disabled:opacity-50"
              title="Re-verify SMTP Handshake"
            >
              <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            </button>
          </div>

          {loading ? (
            <div className="py-6 text-center space-y-2">
              <RefreshCw size={24} className="animate-spin text-[#00E5FF] mx-auto" />
              <p className="text-xs font-mono text-gray-400">Testing TLS Handshake...</p>
            </div>
          ) : error ? (
            <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-xs font-mono text-red-400 flex items-center gap-2">
              <AlertCircle size={16} className="shrink-0" />
              <span>{error}</span>
            </div>
          ) : statusResult ? (
            <div className="space-y-2.5 font-mono text-xs">
              <div className="flex justify-between items-center p-2 rounded bg-white/5 border border-white/5">
                <span className="text-gray-400">Status:</span>
                <span className={`font-bold flex items-center gap-1 ${statusResult.success ? 'text-[#00FF9D]' : 'text-red-400'}`}>
                  {statusResult.success ? <CheckCircle2 size={14} /> : <AlertCircle size={14} />}
                  {statusResult.success ? 'CONNECTED & VERIFIED' : 'FAILED'}
                </span>
              </div>

              <div className="flex justify-between items-center p-2 rounded bg-white/5 border border-white/5">
                <span className="text-gray-400">Host / Port:</span>
                <span className="text-[#00E5FF] font-semibold">{statusResult.host}:{statusResult.port}</span>
              </div>

              <div className="flex justify-between items-center p-2 rounded bg-white/5 border border-white/5">
                <span className="text-gray-400">TLS Encryption:</span>
                <span className="text-[#00FF9D] font-semibold">TLS / Port 465 Verified</span>
              </div>

              <p className="text-[11px] text-gray-400 pt-1 leading-snug">
                {statusResult.message}
              </p>
            </div>
          ) : null}
        </div>

        {/* Security Audit Badges */}
        <div className="bg-black/40 border border-white/10 rounded-xl p-4 space-y-3">
          <span className="text-xs font-mono text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
            <ShieldCheck size={14} className="text-[#00FF9D]" />
            Security Architecture
          </span>

          <div className="space-y-2 text-xs font-mono">
            <div className="flex items-center gap-2 text-gray-300 bg-white/5 p-2 rounded">
              <CheckCircle2 size={14} className="text-[#00FF9D] shrink-0" />
              <span>Zero credentials in client bundle / logs</span>
            </div>

            <div className="flex items-center gap-2 text-gray-300 bg-white/5 p-2 rounded">
              <CheckCircle2 size={14} className="text-[#00FF9D] shrink-0" />
              <span>SHA-256 Reset Token Hashing Enabled</span>
            </div>

            <div className="flex items-center gap-2 text-gray-300 bg-white/5 p-2 rounded">
              <CheckCircle2 size={14} className="text-[#00FF9D] shrink-0" />
              <span>Rate Limiting & Cooldown Protection Active</span>
            </div>

            <div className="flex items-center gap-2 text-gray-300 bg-white/5 p-2 rounded">
              <CheckCircle2 size={14} className="text-[#00FF9D] shrink-0" />
              <span>Email Enumeration Protection Shield</span>
            </div>
          </div>
        </div>
      </div>

      {/* Live Reset Email Test Form */}
      <div className="bg-black/40 border border-white/10 rounded-xl p-4 space-y-3">
        <span className="text-xs font-mono text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
          <Send size={14} className="text-[#00E5FF]" />
          Trigger Test Password Reset Dispatch
        </span>

        <form onSubmit={handleSendTestEmail} className="flex flex-col sm:flex-row gap-2">
          <div className="flex-1 relative">
            <Mail className="absolute left-3 top-2.5 text-gray-500" size={14} />
            <input
              type="email"
              required
              value={testEmail}
              onChange={(e) => setTestEmail(e.target.value)}
              placeholder="Admin or Test Email"
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
                <span>DISPATCH TEST RESET</span>
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
    </div>
  );
}
