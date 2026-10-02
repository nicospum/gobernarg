import { Component, ReactNode } from 'react';
import { AlertTriangle, RotateCcw, Trash2 } from 'lucide-react';
import { clearSavedGame } from '@/lib/savegame';

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
    clearSavedGame();
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-paper flex items-center justify-center p-6">
          <div role="alert" className="bg-surface border border-rule rounded-xl shadow-2xl max-w-md w-full p-8 text-center">
            <AlertTriangle className="w-14 h-14 text-red-400 mx-auto mb-4" />
            <h1 className="font-display text-2xl font-semibold text-ink mb-2">Algo salió mal</h1>
            <p className="text-ink/75 mb-4">
              Ocurrió un error inesperado en el juego. Tu partida quedó guardada hasta el último cambio.
            </p>
            <div className="bg-sunken rounded-lg p-3 mb-6 text-left">
              <p className="text-xs text-ink/70 font-mono break-all">
                {this.state.error?.message ?? 'Error desconocido'}
              </p>
            </div>
            <div className="flex flex-col gap-2.5">
              <button
                onClick={this.handleRetry}
                className="sr-btn-navy h-11 px-6"
              >
                <RotateCcw className="w-5 h-5" />
                Volver a intentar
              </button>
              <button
                onClick={this.handleReset}
                className="inline-flex items-center justify-center gap-2 border border-rule text-red-400 hover:bg-red-950 h-11 px-6 rounded-md font-medium transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                Borrar la partida y empezar de cero
              </button>
            </div>
            <p className="text-xs text-ink/70 mt-4">
              Si el error persiste, revisá la consola del navegador (F12) para más detalles.
            </p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
