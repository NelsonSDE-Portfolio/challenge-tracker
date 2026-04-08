import { Component, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    console.error('ErrorBoundary caught:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div
          className="min-h-screen flex items-center justify-center"
          style={{ background: 'hsl(var(--background))' }}
        >
          <div className="text-center p-8">
            <h2
              className="text-xl font-bold mb-4"
              style={{ color: 'hsl(var(--foreground))' }}
            >
              Something went wrong
            </h2>
            <p
              className="mb-6"
              style={{ color: 'hsl(var(--muted-foreground))' }}
            >
              An unexpected error occurred. Please try again.
            </p>
            <button
              onClick={() => this.setState({ hasError: false })}
              className="px-4 py-2 rounded-lg text-white font-medium"
              style={{ background: 'var(--gradient-primary)' }}
            >
              Try Again
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
