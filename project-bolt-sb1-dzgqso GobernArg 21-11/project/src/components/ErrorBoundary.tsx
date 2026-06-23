import { Component, ReactNode } from 'react';
import { AlertTriangle, RotateCcw } from 'lucide-react';

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

  handleRestart = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-900 flex items-center justify-center p-8">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 text-center">
            <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Algo salió mal</h1>
            <p className="text-gray-600 mb-4">
              Ocurrió un error inesperado en el juego. Esto puede pasar cuando hay datos inconsistentes.
            </p>
            <div className="bg-slate-50 rounded-lg p-3 mb-6 text-left">
              <p className="text-xs text-slate-500 font-mono break-all">
                {this.state.error?.message ?? 'Error desconocido'}
              </p>
            </div>
            <button
              onClick={this.handleRestart}
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-bold transition-colors"
            >
              <RotateCcw className="w-5 h-5" />
              Reiniciar juego
            </button>
            <p className="text-xs text-gray-400 mt-4">
              Si el error persiste, revisá la consola del navegador (F12) para más detalles.
            </p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
