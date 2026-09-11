import { AlertTriangle, RotateCcw } from 'lucide-react';
import { Component, type ErrorInfo, type ReactNode } from 'react';

type AppErrorBoundaryProps = { children: ReactNode };
type AppErrorBoundaryState = { hasError: boolean };

export class AppErrorBoundary extends Component<AppErrorBoundaryProps, AppErrorBoundaryState> {
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
          <div>
            <AlertTriangle size={30} />
          </div>
          <span>Recuperar aplicación</span>
          <h1>La Pokédex encontró un problema inesperado</h1>
          <p>Recarga la interfaz para continuar. Tus favoritos guardados seguirán disponibles.</p>
          <button onClick={() => window.location.reload()}>
            <RotateCcw size={18} /> Recargar aplicación
          </button>
        </main>
      );
    }

    return this.props.children;
  }
}
