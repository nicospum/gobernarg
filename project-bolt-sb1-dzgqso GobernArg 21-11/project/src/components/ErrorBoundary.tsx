import { Component, ReactNode } from 'react';
import { AlertTriangle, RotateCcw, Trash2 } from 'lucide-react';
import { SAVE_KEY } from '../causal/persistence';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('[GobernArg] Error atrapado por ErrorBoundary:', error, errorInfo);
  }

  // La partida se guarda sola: recargar vuelve a la portada con "Continuar partida".
  handleRetry = () => {
    window.location.reload();
  };

  // Si el error viene de la partida guardada, se puede empezar de cero.
  handleReset = () => {
    try { window.localStorage.removeItem(SAVE_KEY); } catch { /* Sin almacenamiento no hay nada que borrar. */ }
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="government-game min-h-screen bg-background text-foreground flex items-center justify-center p-6">
          <div role="alert" className="bg-card border border-border rounded-2xl shadow-2xl max-w-md w-full p-8 text-center">
            <AlertTriangle className="w-14 h-14 text-amber-300 mx-auto mb-4" />
            <h1 className="font-display text-2xl font-bold mb-2">Algo salió mal</h1>
            <p className="text-muted-foreground mb-4">
              Ocurrió un error inesperado en el juego. Tu partida quedó guardada hasta la última decisión.
            </p>
            <div className="bg-background/60 border border-border rounded-lg p-3 mb-6 text-left">
              <p className="text-xs text-muted-foreground font-mono break-all">
                {this.state.error?.message ?? 'Error desconocido'}
              </p>
            </div>
            <div className="flex flex-col gap-2.5">
              <button onClick={this.handleRetry} className="causal-primary inline-flex items-center justify-center gap-2">
                <RotateCcw className="w-5 h-5" />
                Volver a intentar
              </button>
              <button onClick={this.handleReset} className="causal-secondary inline-flex items-center justify-center gap-2 text-red-200">
                <Trash2 className="w-4 h-4" />
                Borrar la partida y empezar de cero
              </button>
            </div>
            <p className="text-xs text-muted-foreground mt-4">
              Si el error persiste, revisá la consola del navegador (F12) para más detalles.
            </p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
