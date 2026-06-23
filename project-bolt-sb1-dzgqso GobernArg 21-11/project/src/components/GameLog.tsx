import { ScrollText, TrendingUp, DollarSign, Shield, AlertTriangle, Zap } from 'lucide-react';
import { GameState } from '../types/game';

interface GameLogProps {
  gameState: GameState;
  onClose: () => void;
}

export function GameLog({ gameState, onClose }: GameLogProps) {
  const entries = [...gameState.turnLog].reverse();

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col">
        <div className="p-6 border-b flex items-center justify-between">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <ScrollText className="w-6 h-6 text-blue-600" />
            Historial de gestión
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl">&times;</button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {entries.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No hay registros todavía.</p>
          ) : (
            <div className="space-y-4">
              {entries.map((entry, i) => (
                <div key={i} className="border-l-2 border-blue-300 pl-4 pb-4">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                      A{entry.year} T{entry.quarter}
                    </span>
                    <span className="text-xs text-gray-500 capitalize">{entry.position}</span>
                  </div>

                  {entry.actionsTaken.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-1">
                      {entry.actionsTaken.map((action, j) => (
                        <span key={j} className="text-xs bg-gray-100 px-1.5 py-0.5 rounded text-gray-700">
                          {action}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="flex items-center gap-3 text-xs text-gray-600">
                    {entry.popularityChange !== 0 && (
                      <span className={`flex items-center gap-0.5 ${entry.popularityChange > 0 ? 'text-green-600' : 'text-red-600'}`}>
                        <TrendingUp className="w-3 h-3" />
                        {entry.popularityChange > 0 ? '+' : ''}{entry.popularityChange.toFixed(1)}% pop
                      </span>
                    )}
                    {entry.budgetChange !== 0 && (
                      <span className={`flex items-center gap-0.5 ${entry.budgetChange > 0 ? 'text-green-600' : 'text-red-600'}`}>
                        <DollarSign className="w-3 h-3" />
                        {entry.budgetChange > 0 ? '+' : ''}${Math.round(Math.abs(entry.budgetChange))}M
                      </span>
                    )}
                  </div>

                  {entry.eventsTriggered.length > 0 && (
                    <div className="mt-1 flex items-center gap-1 text-xs text-orange-600">
                      <AlertTriangle className="w-3 h-3" />
                      {entry.eventsTriggered.join(', ')}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
