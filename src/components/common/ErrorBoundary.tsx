import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertCircle, RotateCcw } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    try {
      window.location.reload();
    } catch {}
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#ECEEF2] flex flex-col items-center justify-center p-5 text-[#11141A]">
          <div className="w-full max-w-sm bg-white rounded-3xl p-6 shadow-xl border border-neutral-200 text-center space-y-4">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center">
              <AlertCircle className="w-7 h-7" />
            </div>
            <div className="space-y-1">
              <h2 className="text-base font-black text-neutral-900">
                Terjadi Kendala Memuat Halaman
              </h2>
              <p className="text-xs text-neutral-500 leading-relaxed">
                {this.state.error?.message || 'Aplikasi sedang memulihkan data tampilan.'}
              </p>
            </div>
            <button
              type="button"
              onClick={this.handleReset}
              className="w-full h-11 rounded-2xl bg-[#13281E] text-white font-bold text-xs flex items-center justify-center gap-2 hover:bg-[#1A3428] active:scale-95 transition-all shadow-sm cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Muat Ulang Halaman</span>
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
