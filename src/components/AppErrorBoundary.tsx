import { AlertTriangle, RotateCcw } from 'lucide-react';
import { Component, type ErrorInfo, type ReactNode } from 'react';

type AppErrorBoundaryProps = { children: ReactNode };
type AppErrorBoundaryState = { hasError: boolean };

export class AppErrorBoundary extends Component<
  AppErrorBoundaryProps,
  AppErrorBoundaryState
> {
  state: AppErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): AppErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(_error: Error, _info: ErrorInfo) {
    // A production app would report this to an observability service.
  }

  render() {
    if (this.state.hasError) {
      return (
        <main className="fatal-error" role="alert">
          <div><AlertTriangle size={30} /></div>
          <span>Application boundary</span>
          <h1>The Pokédex hit an unexpected problem</h1>
          <p>Your saved favorites are still safe. Reload the interface to start from a clean state.</p>
          <button onClick={() => window.location.reload()}>
            <RotateCcw size={18} /> Reload application
          </button>
        </main>
      );
    }

    return this.props.children;
  }
}

