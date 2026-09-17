import React from 'react';
import { AlertTriangle, RotateCcw } from 'lucide-react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Unhandled React Runtime Error:', error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-sans">
          <div className="max-w-md w-full bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xl text-center space-y-5">
            <div className="w-14 h-14 bg-rose-50 border border-rose-100 rounded-2xl flex items-center justify-center mx-auto text-rose-600 shadow-xs">
              <AlertTriangle className="w-7 h-7" />
            </div>

            <div>
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                অ্যাপ্লিকেশন সমস্যানিদান
              </h2>
              <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                একটি অপ্রত্যাশিত রানটাইম এরর ঘটেছে। দয়া করে পেজটি রিফ্রেশ করে পুনরায় চেষ্টা করুন।
              </p>
            </div>

            {process.env.NODE_ENV === 'development' && this.state.error?.message && (
              <div className="p-3 bg-slate-100 rounded-xl text-left text-[11px] font-mono text-rose-700 overflow-x-auto max-h-32 border border-slate-200">
                {this.state.error.message}
              </div>
            )}

            <button
              onClick={this.handleReload}
              className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-2xl transition-all shadow-md active:scale-98"
            >
              <RotateCcw className="w-4 h-4 text-emerald-400" />
              <span>পেজ রিফ্রেশ করুন (Reload Page)</span>
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
