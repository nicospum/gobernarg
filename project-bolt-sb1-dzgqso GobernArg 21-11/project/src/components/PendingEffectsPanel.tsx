import { Clock, Zap } from 'lucide-react';
import type { GameState } from '../types/game';
import { upcomingEffects } from '@/lib/agendaView';
import { toneChipClass } from '@/lib/causalText';

interface PendingEffectsPanelProps {
  gameState: GameState;
}

/**
 * Efectos en camino: consecuencias ya decididas que todavía no llegaron
 * (obras que maduran, rebotes, mantenimiento, revisiones de metas…).
 */
export function PendingEffectsPanel({ gameState }: PendingEffectsPanelProps) {
  const items = upcomingEffects(gameState.causal);
  if (items.length === 0) return null;

  return (
    <section className="rounded-lg border border-ink/8 bg-surface overflow-hidden ">
      <header className="flex items-center justify-between px-4 py-3 border-b border-ink/8 bg-surface">
        <h2 className="font-display font-semibold text-[16px]   text-ink">
          Efectos en camino ({items.length})
        </h2>
        <span className="text-[10px] text-ink/40 font-mono">Próximas maduraciones</span>
      </header>
      <div className="p-3.5 space-y-2.5 max-h-[420px] overflow-y-auto">
        {items.map(item => {
          const urgent = item.inTurns <= 1;
          return (
            <div
              key={item.key}
              className={`rounded-xl border p-3.5 shadow-md ${item.positive ? 'border-emerald-500/30 bg-emerald-500/10' : 'border-red-500/30 bg-red-500/10'}`}
            >
              <div className="flex items-start justify-between gap-2 mb-1.5">
                <div className="font-display font-semibold text-base text-ink leading-tight">{item.title}</div>
                <div className="flex items-center gap-1.5 flex-shrink-0 bg-ink/4 px-2 py-0.5 rounded border border-ink/8">
                  <Clock size={11} className={urgent ? 'text-amber-400' : 'text-ink/40'} />
                  <span className={`text-[10px] font-mono font-bold ${urgent ? 'text-amber-400' : 'text-ink/70'}`}>
                    {urgent ? 'PRÓXIMO TURNO' : `en ${item.inTurns}t`}
                  </span>
                </div>
              </div>
              <div className="text-[10px] text-ink/50 mb-2 font-mono">↳ Origen: decisión en turno {item.origin}</div>
              <div className="flex gap-1.5 items-center flex-wrap">
                <Zap size={11} className="text-blue-400 flex-shrink-0" />
                {item.chips.map((c, i) => (
                  <span key={i} className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] border font-mono ${toneChipClass(c.tone)}`}>
                    {c.label} {c.text}
                  </span>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
