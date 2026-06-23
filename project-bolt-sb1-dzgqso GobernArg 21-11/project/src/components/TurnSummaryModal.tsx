import { X, TrendingUp, Wallet, AlertTriangle } from 'lucide-react';
import { TurnSummary } from '../types/game';
import { IMAGES } from '../utils/imageAssets';

interface TurnSummaryModalProps {
  summary: TurnSummary;
  onClose: () => void;
}

export function TurnSummaryModal({ summary, onClose }: TurnSummaryModalProps) {
  const headerImage = summary.inflationEvent.triggered
    ? IMAGES.events.economicCrisis
    : IMAGES.ui.shieldEmblem;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl w-full max-w-2xl overflow-hidden shadow-2xl">
        {/* Header visual */}
        <div className="relative h-40 md:h-48">
          <img
            src={headerImage}
            alt="Resumen del trimestre"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-4 text-white flex justify-between items-end">
            <div>
              <h2 className="text-2xl font-bold">Resumen del Trimestre</h2>
              <p className="text-white/90">Año {summary.year} · Trimestre {summary.quarter}</p>
            </div>
            <button onClick={onClose} className="p-1 hover:bg-white/20 rounded">
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="p-6">
          <div className="prose max-w-none">
            {/* Efectos Inmediatos */}
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <h4 className="font-semibold text-gray-700 mb-3">Efectos Inmediatos</h4>
              <div className="grid grid-cols-2 gap-4">
                <div className={`flex items-center gap-2 ${
                  summary.popularityChange >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  <TrendingUp className="w-5 h-5" />
                  <div>
                    <p className="font-medium">Popularidad</p>
                    <p className="text-lg">
                      {summary.popularityChange >= 0 ? '+' : ''}
                      {summary.popularityChange}%
                    </p>
                  </div>
                </div>

                <div className={`flex items-center gap-2 ${
                  summary.budgetChange >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  <Wallet className="w-5 h-5" />
                  <div>
                    <p className="font-medium">Presupuesto</p>
                    <p className="text-lg">
                      {summary.budgetChange >= 0 ? '+' : ''}
                      ${summary.budgetChange}M
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Eventos */}
            <div className="mb-6">
              <h4 className="font-semibold text-gray-700 mb-3">Eventos Destacados</h4>
              <ul className="list-disc pl-5 space-y-2">
                {summary.events.map((event, index) => (
                  <li key={index} className="text-gray-600">{event}</li>
                ))}
              </ul>
            </div>

            {/* Alerta de Inflación */}
            {summary.inflationEvent.triggered && (
              <div className="bg-red-50 rounded-lg p-4 mb-6">
                <div className="flex items-center gap-2 text-red-800">
                  <AlertTriangle className="w-5 h-5" />
                  <p className="font-medium">¡Advertencia de Inflación!</p>
                </div>
                <p className="text-sm text-red-600 mt-1">
                  La emisión monetaria excesiva está generando presiones inflacionarias.
                </p>
              </div>
            )}

            <div className="text-center">
              <button
                onClick={onClose}
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-2 rounded-lg font-semibold transition-colors"
              >
                Continuar
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
