import React from 'react';
import type { ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  message: string;
}

export class ErrorBoundary extends React.Component<Props, State> {
  state: State = { hasError: false, message: '' };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, message: error.message };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('[ErrorBoundary]', error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="h-screen flex flex-col items-center justify-center p-6 bg-c-bg text-c-text1 text-center">
          <div className="text-[40px] mb-4">⚠️</div>
          <div className="text-xl font-bold mb-2">Something went wrong</div>
          <div className="text-sm text-c-text2 mb-6 max-w-[320px]">
            {this.state.message || 'An unexpected error occurred.'}
          </div>
          <button
            onClick={() => window.location.reload()}
            className="py-[10px] px-4 rounded-pill bg-c-primary border-none text-white text-base font-semibold cursor-pointer"
          >
            Reload app
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
