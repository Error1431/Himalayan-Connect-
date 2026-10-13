import React from 'react';
import { FaExclamationTriangle, FaHome, FaRedo } from 'react-icons/fa';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // Logged to the console so it's visible in dev tools / server logs
    // (e.g. Vercel's function logs) even though the user sees a friendly
    // screen instead of a blank white page or a raw stack trace.
    console.error('Unhandled UI error caught by ErrorBoundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-surface-alt dark:bg-gray-900 px-4">
          <div className="max-w-md w-full bg-surface dark:bg-gray-800 rounded-2xl shadow-xl p-8 text-center">
            <FaExclamationTriangle className="text-5xl text-amber-500 mx-auto mb-4" />
            <h1 className="text-xl font-bold text-ink-soft dark:text-white mb-2">Something went wrong</h1>
            <p className="text-sm text-ink-soft-soft dark:text-gray-400 mb-6">
              This part of the page hit an unexpected error. You can try reloading, or head back home — the rest of the site is unaffected.
            </p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => window.location.reload()}
                className="flex items-center gap-2 bg-green-600 text-white px-5 py-2.5 rounded-xl font-semibold hover:bg-green-700 transition"
              >
                <FaRedo className="text-sm" /> Reload
              </button>
              <a
                href="/"
                className="flex items-center gap-2 border border-gray-300 dark:border-gray-600 px-5 py-2.5 rounded-xl font-semibold hover:bg-surface-alt dark:hover:bg-gray-700 transition"
              >
                <FaHome className="text-sm" /> Home
              </a>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
