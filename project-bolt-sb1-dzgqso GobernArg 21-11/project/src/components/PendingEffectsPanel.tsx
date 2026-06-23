import { Clock, TrendingUp, Wallet, Users } from 'lucide-react';
import { PendingEffect } from '../types/game';

interface PendingEffectsPanelProps {
  effects: PendingEffect[];
  currentTurn: number;
}

export function PendingEffectsPanel({ effects, currentTurn }: PendingEffectsPanelProps) {
  if (effects.length === 0) return null;

  return (
    <div className="bg-white rounded-lg shadow-lg p-4">
      <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
        <Clock className="w-6 h-6 text-blue-600" />
        Efectos Pendientes
      </h2>

      <div className="space-y-4">
        {effects.map((effect) => {
          const turnsRemaining = effect.activationTurn - currentTurn;
          
          return (
            <div
              key={effect.id}
              className="border rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-start mb-2">
                <p className="font-medium">{effect.description}</p>
                <span className="text-sm text-gray-600">
                  {turnsRemaining} {turnsRemaining === 1 ? 'turno' : 'turnos'} restante
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                {effect.budgetChange && (
                  <div className={`flex items-center gap-1 ${
                    effect.budgetChange > 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    <Wallet className="w-4 h-4" />
                    <span>
                      {effect.budgetChange > 0 ? '+' : ''}
                      ${effect.budgetChange}M
                    </span>
                  </div>
                )}

                {effect.popularityChange && (
                  <div className={`flex items-center gap-1 ${
                    effect.popularityChange > 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    <TrendingUp className="w-4 h-4" />
                    <span>
                      {effect.popularityChange > 0 ? '+' : ''}
                      {effect.popularityChange}% popularidad
                    </span>
                  </div>
                )}

                {effect.groupEffects && effect.groupEffects.length > 0 && (
                  <div className="col-span-2 flex items-center gap-1">
                    <Users className="w-4 h-4 text-blue-600" />
                    <span>Cambios en relaciones con grupos</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}