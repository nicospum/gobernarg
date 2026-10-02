import { TrendingUp, DoorOpen } from 'lucide-react';
import { GameState } from '../types/game';
import { INCUMBENCY_BONUS } from '../engine/causalBridge';
import { useDialog } from '@/lib/useDialog';
import { fmtPct } from '@/lib/format';

interface ReelectionChoiceModalProps {
  gameState: GameState;
  onSelect: () => void;
  /** No presentarse: compite otro candidato del espacio y la partida termina. */
  onRetire?: () => void;
}

export function ReelectionChoiceModal({ gameState, onSelect, onRetire }: ReelectionChoiceModalProps) {
  const dialogRef = useDialog<HTMLDivElement>();
  // Intención de voto actual + ventaja por incumbencia.
  const projectedVotes = Math.max(0, Math.min(100, gameState.causal.political.iv + INCUMBENCY_BONUS));
  const difficultyColor =
    projectedVotes >= 45
      ? 'text-emerald-400'
      : projectedVotes >= 35
        ? 'text-amber-400'
        : 'text-red-400';

  return (
    <div ref={dialogRef} className="outline-none fixed inset-0 bg-ink/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-card border border-border rounded-xl w-full max-w-2xl overflow-hidden shadow-2xl">
        <div className="border-b border-border p-6 text-center">
          <h2 className="font-display text-3xl font-semibold   text-foreground mb-2">
            Fin del mandato
          </h2>
          <p className="text-foreground/80 text-sm">
            Terminaste tu mandato como{' '}
            <span className="font-semibold capitalize text-accent">{gameState.position}</span>.
            {' '}Llegan las elecciones presidenciales: ¿buscás la reelección?
          </p>
        </div>

        <div className="p-6 space-y-3">
          <button
            onClick={onSelect}
            className="w-full text-left p-5 rounded-xl border transition-all border-border bg-card hover:border-primary/50 hover:bg-primary/5"
          >
            <div className="flex justify-between items-start gap-3">
              <div className="min-w-0">
                <h3 className="font-display font-semibold text-lg text-foreground  ">
                  Buscar la reelección
                </h3>
                <p className="text-sm text-foreground/70 mt-1">
                  Ventaja por incumbencia. Consolidá tu gestión con un segundo mandato.
                </p>
              </div>
              <div className={`text-right flex-shrink-0 ${difficultyColor}`}>
                <div className="flex items-center gap-1 justify-end">
                  <TrendingUp className="w-4 h-4" />
                  <span className="font-mono font-bold text-lg">
                    {fmtPct(projectedVotes, 1)}
                  </span>
                </div>
                <span className="text-xs">
                  {projectedVotes >= 45 ? 'Proyección favorable' : 'Proyección desfavorable'}
                </span>
              </div>
            </div>
          </button>
          {onRetire && (
            <button
              onClick={onRetire}
              className="w-full text-left p-5 rounded-xl border border-border bg-card hover:border-primary/50 hover:bg-primary/5 transition-all"
            >
              <div className="flex items-start gap-3">
                <DoorOpen className="w-5 h-5 text-ink/70 mt-0.5 flex-shrink-0" />
                <div className="min-w-0">
                  <h3 className="font-display font-semibold text-lg text-foreground">No presentarme</h3>
                  <p className="text-sm text-foreground/70 mt-1">
                    Tu espacio compite con otro candidato. Si gana, tu gestión queda como legado; la partida termina con esta elección.
                  </p>
                </div>
              </div>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
