// @ts-nocheck
import { Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  errorMsg: string;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    errorMsg: ''
  };

  public static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI.
    return { hasError: true, errorMsg: error.message };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-charcoal text-white p-6 text-center">
          <div className="bg-darkslate border border-danger/50 rounded-xl p-8 max-w-2xl shadow-xl">
            <h1 className="text-4xl text-danger font-black mb-4">⚠️ UI Crash Detected</h1>
            <p className="text-gray-300 mb-6">
              A critical error occurred while rendering this module. We have suppressed the stack trace for security reasons.
            </p>
            <div className="bg-charcoal p-4 rounded text-left text-sm text-gray-500 font-mono overflow-auto mb-6">
              Error: {this.state.errorMsg}
            </div>
            <button 
              onClick={() => window.location.href = '/'}
              className="bg-warning text-darkslate font-bold py-2 px-6 rounded hover:bg-yellow-500 transition-colors"
            >
              Return to Dashboard
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
