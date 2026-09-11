import React from 'react';
import { AlertTriangle, RotateCcw } from 'lucide-react';

interface ErrorBoundaryProps {
  children?: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  declare props: ErrorBoundaryProps;
  declare state: ErrorBoundaryState;

  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Uncaught error in Gizmo Portal:', error, errorInfo);
  }

  private handleReload = () => {
    window.location.href = window.location.origin + window.location.pathname;
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-zinc-50 flex items-center justify-center p-6 text-zinc-900 font-sans">
          <div className="max-w-md w-full bg-white border border-zinc-200 rounded-2xl p-6 shadow-xl text-center space-y-4">
            <div className="h-12 w-12 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-zinc-900">Application Error</h2>
              <p className="text-xs text-zinc-500 mt-1">
                An unexpected error occurred while rendering Gizmo Portal.
              </p>
            </div>
            {this.state.error?.message && (
              <div className="bg-zinc-100 rounded-xl p-3 text-left overflow-x-auto text-[11px] font-mono text-zinc-700 max-h-32 border border-zinc-200">
                {this.state.error.message}
              </div>
            )}
            <div className="pt-2">
              <button
                type="button"
                onClick={this.handleReload}
                className="w-full bg-zinc-900 hover:bg-black text-white text-xs font-semibold py-2.5 px-4 rounded-xl shadow-sm transition-all flex items-center justify-center gap-2"
              >
                <RotateCcw className="h-4 w-4 text-orange-400" />
                Reload Gizmo Portal
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
