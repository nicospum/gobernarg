import { TrendingUp, AlertTriangle } from 'lucide-react';
import { GameState } from '../types/game';
import {
  ElectionOption,
  getOptionLabel,
  getOptionDescription,
  canRunForOption,
  calculateVotingIntentionForOption,
} from '../utils/electionSystem';

interface ReelectionChoiceModalProps {
  gameState: GameState;
  onSelect: (option: ElectionOption) => void;
}

export function ReelectionChoiceModal({ gameState, onSelect }: ReelectionChoiceModalProps) {
  const options = gameState.pendingElectionOptions;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-card border border-border rounded-xl w-full max-w-2xl overflow-hidden shadow-2xl">
        <div className="border-b border-border p-6 text-center">
          <h2 className="font-display text-3xl font-bold uppercase tracking-wide text-foreground mb-2">
            ¡Victoria electoral!
          </h2>
          <p className="text-foreground/80 text-sm">
            Terminaste tu mandato como{' '}
            <span className="font-semibold capitalize text-accent">{gameState.position}</span>. ¿Qué
            camino querés tomar ahora?
          </p>
        </div>

        <div className="p-6 space-y-3">
          {options.length === 0 ? (
            <div className="text-center text-muted-foreground py-8 text-sm">
              No hay opciones disponibles. Tu carrera política llegó a su fin.
            </div>
          ) : (
            options.map((option) => {
              const allowed = canRunForOption(gameState, option);
              const projectedVotes = calculateVotingIntentionForOption(gameState, option);
              const difficultyColor =
                projectedVotes >= 45
                  ? 'text-emerald-400'
                  : projectedVotes >= 35
                    ? 'text-amber-400'
                    : 'text-red-400';

              return (
                <button
                  key={option}
                  onClick={() => allowed && onSelect(option)}
                  disabled={!allowed}
                  className={`w-full text-left p-5 rounded-xl border transition-all ${
                    allowed
                      ? 'border-border bg-card hover:border-primary/50 hover:bg-primary/5'
                      : 'border-border bg-white/3 opacity-60 cursor-not-allowed'
                  }`}
                >
                  <div className="flex justify-between items-start gap-3">
                    <div className="min-w-0">
                      <h3 className="font-display font-bold text-lg text-foreground uppercase tracking-wide">
                        {getOptionLabel(option)}
                      </h3>
                      <p className="text-sm text-foreground/70 mt-1">
                        {getOptionDescription(option)}
                      </p>
                      {!allowed && (
                        <p className="text-xs text-red-400 mt-2 flex items-center gap-1">
                          <AlertTriangle className="w-3.5 h-3.5" />
                          Requiere al menos{' '}
                          {option === 'promote-president' ? '75%' : 'popularidad suficiente'}.
                        </p>
                      )}
                    </div>
                    <div className={`text-right flex-shrink-0 ${difficultyColor}`}>
                      <div className="flex items-center gap-1 justify-end">
                        <TrendingUp className="w-4 h-4" />
                        <span className="font-mono font-bold text-lg">
                          {projectedVotes.toFixed(1)}%
                        </span>
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
