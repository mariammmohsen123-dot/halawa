import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  errorMessage: string;
  isPermissionError: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    errorMessage: '',
    isPermissionError: false,
  };

  public static getDerivedStateFromError(error: Error): State {
    let message = error.message || 'Unexpected application error.';
    let isPerm = false;
    try {
      const parsed = JSON.parse(error.message);
      if (parsed && typeof parsed.error === 'string') {
        message = parsed.error;
        if (parsed.error.toLowerCase().includes('permission')) {
          isPerm = true;
        }
      }
    } catch {
      if (message.toLowerCase().includes('permission')) {
        isPerm = true;
      }
    }
    return {
      hasError: true,
      errorMessage: message,
      isPermissionError: isPerm,
    };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Application ErrorBoundary:', error, errorInfo);
  }

  private handleReload = () => {
    window.location.reload();
  };

  private handleGoHome = () => {
    window.location.href = '/';
  };

  public render() {
    if (this.state.hasError) {
      const isArabic = document.documentElement.lang !== 'en';
      return (
        <div
          dir={isArabic ? 'rtl' : 'ltr'}
          className="min-h-screen bg-[#040B16] text-slate-100 flex items-center justify-center p-6"
        >
          <div className="max-w-lg w-full rounded-2xl bg-[#0D213D] border border-gold-400/30 p-8 shadow-2xl">
            <div className="w-12 h-12 rounded-xl bg-amber-500/15 border border-amber-400/30 flex items-center justify-center text-amber-300 mb-5">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h1 className="text-2xl font-extrabold text-white mb-3">
              {isArabic ? 'تعذر إتمام العملية الحالية' : 'Unable to Complete Operation'}
            </h1>
            <p className="text-slate-300 text-sm leading-relaxed mb-4">
              {this.state.isPermissionError
                ? isArabic
                  ? 'لا تملك الصلاحيات الكافية للوصول إلى هذا السجل أو تعديله. يرجى التحقق من حسابك أو التواصل مع مسؤول النظام.'
                  : 'You do not have sufficient permissions to access or modify this record. Please verify your account role.'
                : isArabic
                  ? 'حدث خطأ غير متوقع أثناء تحميل البيانات. يمكنك إعادة المحاولة أو العودة إلى الصفحة الرئيسية.'
                  : 'An unexpected error occurred while loading application data. You can reload or return to the homepage.'}
            </p>
            <div className="rounded-lg bg-[#040B16] border border-slate-800 p-3 text-xs text-slate-400 font-mono mb-6 break-words">
              {this.state.errorMessage}
            </div>
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={this.handleReload}
                className="btn-gold px-5 py-2.5 rounded-lg text-sm inline-flex items-center gap-2 cursor-pointer"
              >
                <RefreshCw className="w-4 h-4" />
                <span>{isArabic ? 'إعادة التحميل' : 'Reload Page'}</span>
              </button>
              <button
                type="button"
                onClick={this.handleGoHome}
                className="px-5 py-2.5 rounded-lg text-sm font-semibold border border-slate-700 text-slate-200 hover:bg-slate-800 transition-colors inline-flex items-center gap-2 cursor-pointer"
              >
                <Home className="w-4 h-4" />
                <span>{isArabic ? 'العودة للرئيسية' : 'Return Home'}</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
