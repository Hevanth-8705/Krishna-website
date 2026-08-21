import React, { Component, ErrorInfo, ReactNode } from 'react';
import { ShieldAlert, RefreshCw, Home, Terminal } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[KRISHNA_OS ErrorBoundary Caught Error]:', error, errorInfo);
    this.setState({ errorInfo });
  }

  private handleReload = () => {
    window.location.reload();
  };

  private handleGoHome = () => {
    window.location.href = '/';
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#02040A] text-white flex items-center justify-center p-4 selection:bg-[#00E5FF] selection:text-black">
          <div className="max-w-xl w-full bg-[#0B0F19]/90 border border-[#FF0055]/30 rounded-2xl p-6 md:p-8 backdrop-blur-xl shadow-[0_0_50px_rgba(255,0,85,0.15)] relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#FF0055] via-[#7928CA] to-[#00E5FF]" />
            
            <div className="flex items-center space-x-3 mb-6">
              <div className="p-3 bg-[#FF0055]/10 border border-[#FF0055]/30 rounded-xl text-[#FF0055]">
                <ShieldAlert className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <h1 className="text-xl font-bold font-mono tracking-wider text-white">
                  KRISHNA_OS NEURAL RECOVERY
                </h1>
                <p className="text-xs font-mono text-neutral-400">
                  Subsystem encountered an unhandled exception
                </p>
              </div>
            </div>

            <div className="bg-[#05070D] border border-white/10 rounded-xl p-4 mb-6 font-mono text-xs overflow-x-auto text-neutral-300">
              <div className="flex items-center space-x-2 text-[#00E5FF] mb-2 pb-2 border-b border-white/5">
                <Terminal className="w-4 h-4" />
                <span>DIAGNOSTIC LOG</span>
              </div>
              <p className="text-[#FF5577] font-semibold mb-2">
                {this.state.error?.message || 'Unknown runtime anomaly'}
              </p>
              {this.state.errorInfo?.componentStack && (
                <pre className="text-[11px] text-neutral-500 whitespace-pre-wrap max-h-40 overflow-y-auto">
                  {this.state.errorInfo.componentStack}
                </pre>
              )}
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                onClick={this.handleReload}
                className="flex-1 flex items-center justify-center space-x-2 px-4 py-3 bg-gradient-to-r from-[#00E5FF] to-[#0099FF] text-black font-semibold rounded-xl text-sm hover:opacity-90 transition shadow-lg shadow-[#00E5FF]/20 cursor-pointer"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Reinitialize System</span>
              </button>
              <button
                onClick={this.handleGoHome}
                className="px-4 py-3 bg-white/5 border border-white/10 text-white font-medium rounded-xl text-sm hover:bg-white/10 transition flex items-center space-x-2 cursor-pointer"
              >
                <Home className="w-4 h-4" />
                <span>Return to Nexus</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
