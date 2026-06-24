import { Component, type ErrorInfo, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}
interface State {
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error('Unhandled error in <ErrorBoundary>:', error, info);
  }

  render(): ReactNode {
    if (this.state.error) {
      return (
        this.props.fallback ?? (
          <div role="alert" className="mx-auto max-w-md px-6 py-20 text-center">
            <h1 className="text-xl font-semibold text-ink">Something went wrong</h1>
            <p className="mt-2 text-sm text-body">
              We couldn’t load the bundle builder. Please refresh to try again.
            </p>
            <button
              type="button"
              onClick={() => globalThis.location.reload()}
              className="mt-5 rounded-[var(--radius-control)] bg-brand px-5 py-2.5 text-sm font-semibold text-brand-foreground"
            >
              Reload
            </button>
          </div>
        )
      );
    }
    return this.props.children;
  }
}
