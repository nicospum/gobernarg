import { Trophy, BarChart, TrendingUp, Users, Target, Shield } from 'lucide-react';
import { ElectionResults } from '../types/game';
import { IMAGES } from '../utils/imageAssets';

interface ElectionResultsModalProps {
  result: ElectionResults;
  onClose: () => void;
}

export function ElectionResultsModal({ result, onClose }: ElectionResultsModalProps) {
  const { votesPercentage, victory, details } = result;

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="relative w-full max-w-2xl rounded-2xl overflow-hidden shadow-2xl bg-white">
        {/* Header visual */}
        <div className="relative h-48 md:h-56">
          <img
            src={IMAGES.events.electionDay}
            alt="Elecciones"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-6 text-white text-center">
            <Trophy className="w-12 h-12 mx-auto mb-2" />
            <h2 className="text-3xl font-bold">
              {victory ? '¡Victoria Electoral!' : 'Derrota Electoral'}
            </h2>
            <p className="text-xl text-white/90">{votesPercentage.toFixed(1)}% de los votos</p>
          </div>
        </div>

        <div className="p-6">
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2 text-gray-900">
            <BarChart className="w-6 h-6" />
            Análisis Electoral
          </h3>

          <div className="grid grid-cols-2 gap-6 mb-6">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <TrendingUp className="w-5 h-5 text-blue-500" />
                <div>
                  <p className="text-sm text-gray-600">Impacto de Popularidad</p>
                  <p className="font-bold text-lg text-gray-900">{details.popularityImpact.toFixed(1)}%</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Users className="w-5 h-5 text-green-500" />
                <div>
                  <p className="text-sm text-gray-600">Apoyo de Grupos</p>
                  <p className="font-bold text-lg text-gray-900">{details.groupsSupport.toFixed(1)}%</p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Target className="w-5 h-5 text-purple-500" />
                <div>
                  <p className="text-sm text-gray-600">Objetivos Cumplidos</p>
                  <p className="font-bold text-lg text-gray-900">{details.completedObjectivesImpact.toFixed(1)}%</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Shield className="w-5 h-5 text-yellow-500" />
                <div>
                  <p className="text-sm text-gray-600">Estabilidad</p>
                  <p className="font-bold text-lg text-gray-900">{details.stabilityBonus.toFixed(1)}%</p>
                </div>
              </div>
            </div>
          </div>

          <div className="text-center">
            <button
              onClick={onClose}
              className={`px-8 py-3 rounded-lg text-white font-bold transition-colors ${
                victory ? 'bg-green-500 hover:bg-green-600' : 'bg-blue-500 hover:bg-blue-600'
              }`}
            >
              Continuar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
