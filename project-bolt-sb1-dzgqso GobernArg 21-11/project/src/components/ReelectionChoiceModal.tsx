import { TrendingUp, AlertTriangle } from 'lucide-react';
import { GameState } from '../types/game';
import {
  ElectionOption,
  getOptionLabel,
  getOptionDescription,
  canRunForOption,
  calculateVotingIntentionForOption
} from '../utils/electionSystem';

interface ReelectionChoiceModalProps {
  gameState: GameState;
  onSelect: (option: ElectionOption) => void;
}

export function ReelectionChoiceModal({ gameState, onSelect }: ReelectionChoiceModalProps) {
  const options = gameState.pendingElectionOptions;

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl">
        <div className="bg-blue-900 text-white p-6 text-center">
          <h2 className="text-3xl font-bold mb-2">¡Victoria electoral!</h2>
          <p className="text-white/90">
            Terminaste tu mandato como{' '}
            <span className="font-semibold capitalize">{gameState.position}</span>. ¿Qué camino
            querés tomar ahora?
          </p>
        </div>

        <div className="p-6 space-y-4">
          {options.length === 0 ? (
            <div className="text-center text-gray-600 py-8">
              No hay opciones disponibles. Tu carrera política llegó a su fin.
            </div>
          ) : (
            options.map((option) => {
              const allowed = canRunForOption(gameState, option);
              const projectedVotes = calculateVotingIntentionForOption(gameState, option);
              const difficultyColor = projectedVotes >= 45 ? 'text-green-600' : projectedVotes >= 35 ? 'text-yellow-600' : 'text-red-600';

              return (
                <button
                  key={option}
                  onClick={() => allowed && onSelect(option)}
                  disabled={!allowed}
                  className={`w-full text-left p-5 rounded-xl border-2 transition-all ${
                    allowed
                      ? 'border-gray-200 hover:border-blue-500 hover:bg-blue-50'
                      : 'border-gray-100 bg-gray-50 opacity-60 cursor-not-allowed'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-bold text-lg text-gray-900">{getOptionLabel(option)}</h3>
                      <p className="text-sm text-gray-600 mt-1">{getOptionDescription(option)}</p>
                      {!allowed && (
                        <p className="text-sm text-red-600 mt-2 flex items-center gap-1">
                          <AlertTriangle className="w-4 h-4" />
                          Requiere al menos {option === 'promote-president' ? '75%' : 'popularidad suficiente'}.
                        </p>
                      )}
                    </div>
                    <div className={`text-right ${difficultyColor}`}>
                      <div className="flex items-center gap-1 justify-end">
                        <TrendingUp className="w-4 h-4" />
                        <span className="font-bold">{projectedVotes.toFixed(1)}%</span>
                      </div>
                      <span className="text-xs">
                        {projectedVotes >= 45 ? 'Proyección favorable' : 'Proyección desfavorable'}
                      </span>
                    </div>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
