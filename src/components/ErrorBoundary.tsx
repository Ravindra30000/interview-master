"use client";

import { Component, ReactNode } from "react";

type Props = {
  children: ReactNode;
  fallback?: ReactNode;
};

type State = {
  hasError: boolean;
};

export default class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: unknown, info: unknown) {
    console.error("App error boundary caught an error:", error, info);
  }

  handleRetry = () => {
    this.setState({ hasError: false });
    if (typeof window !== "undefined") {
      window.location.reload();
    }
  };

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback ?? (
          <div className="min-h-screen flex items-center justify-center bg-gray-50 px-6">
            <div className="max-w-md w-full bg-white border border-gray-200 rounded-xl p-6 shadow-sm text-center space-y-3">
              <h1 className="text-xl font-bold text-gray-900">Something went wrong</h1>
              <p className="text-sm text-gray-600">
                An unexpected error occurred. Please refresh the page and try again.
              </p>
              <button
                onClick={this.handleRetry}
                className="inline-flex justify-center px-4 py-2 rounded-lg bg-primary text-white text-sm font-semibold hover:bg-blue-700 transition"
              >
                Refresh
              </button>
            </div>
          </div>
        )
      );
    }

    return this.props.children;
  }
}

