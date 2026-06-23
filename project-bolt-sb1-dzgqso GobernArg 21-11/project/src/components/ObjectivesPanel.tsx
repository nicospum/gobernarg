import { Trophy, AlertTriangle, TrendingUp, Wallet } from 'lucide-react';
import { GameState } from '../types/game';

interface ObjectivesPanelProps {
  gameState: GameState;
}

export function ObjectivesPanel({ gameState }: ObjectivesPanelProps) {
  const { objectives, consecutiveLowPopularity, consecutiveNegativeBudget } = gameState;

  return (
    <div className="bg-white rounded-lg shadow-lg p-4">
      <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
        <Trophy className="w-6 h-6 text-yellow-500" />
        Objetivos y Estado
      </h2>

      {/* Warnings */}
      {(consecutiveLowPopularity > 0 || consecutiveNegativeBudget > 0) && (
        <div className="mb-4 space-y-2">
          {consecutiveLowPopularity > 0 && (
            <div className="flex items-center gap-2 text-red-600 bg-red-50 p-3 rounded-lg">
              <AlertTriangle className="w-5 h-5" />
              <span>
                ¡Popularidad crítica! {2 - consecutiveLowPopularity} {
                  2 - consecutiveLowPopularity === 1 ? 'turno' : 'turnos'
                } para mejorar
              </span>
            </div>
          )}
          {consecutiveNegativeBudget > 0 && (
            <div className="flex items-center gap-2 text-red-600 bg-red-50 p-3 rounded-lg">
              <AlertTriangle className="w-5 h-5" />
              <span>
                ¡Presupuesto negativo! {2 - consecutiveNegativeBudget} {
                  2 - consecutiveNegativeBudget === 1 ? 'turno' : 'turnos'
                } para recuperar
              </span>
            </div>
          )}
        </div>
      )}

      {/* Objectives */}
      <div className="space-y-4">
        {objectives.map((objective) => (
          <div
            key={objective.id}
            className={`border rounded-lg p-4 ${
              objective.completed
                ? 'bg-green-50 border-green-200'
                : 'bg-white border-gray-200'
            }`}
          >
            <div className="flex justify-between items-start mb-2">
              <div>
                <h3 className="font-semibold text-gray-900">{objective.title}</h3>
                <p className="text-sm text-gray-600">{objective.description}</p>
              </div>
              {objective.completed && (
                <Trophy className="w-5 h-5 text-green-500" />
              )}
            </div>

            {/* Progress bar */}
            <div className="w-full bg-gray-200 rounded-full h-2.5 mb-2">
              <div
                className={`h-2.5 rounded-full ${
                  objective.completed ? 'bg-green-500' : 'bg-blue-500'
                }`}
                style={{ width: `${objective.progress}%` }}
              />
            </div>

            {/* Rewards */}
            {(objective.reward.popularity || objective.reward.budget) && (
              <div className="text-sm text-gray-600 mt-2">
                <p className="font-medium">Recompensa:</p>
                <div className="flex gap-4">
                  {objective.reward.popularity && (
                    <span className="flex items-center gap-1">
                      <TrendingUp className="w-4 h-4 text-green-500" />
                      +{objective.reward.popularity}% popularidad
                    </span>
                  )}
                  {objective.reward.budget && (
                    <span className="flex items-center gap-1">
                      <Wallet className="w-4 h-4 text-green-500" />
                      +${objective.reward.budget}M presupuesto
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}