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
    <section className="rounded-lg border border-border bg-card overflow-hidden">
      <header className="flex items-center justify-between px-4 py-2.5 border-b border-border">
        <h2 className="font-display font-bold text-[13px] uppercase tracking-widest text-foreground">
          Efectos en Camino
        </h2>
        <span className="text-[11px] text-muted-foreground font-mono">{items.length}</span>
      </header>
      <div className="p-3 space-y-2 max-h-[420px] overflow-y-auto">
        {items.map(item => {
          const urgent = item.inTurns <= 1;
          return (
            <div
              key={item.key}
              className={`rounded-lg border p-3 ${item.positive ? 'border-emerald-400/15 bg-emerald-400/4' : 'border-red-400/20 bg-red-400/4'}`}
            >
              <div className="flex items-start justify-between gap-2 mb-1.5">
                <div className="font-display font-semibold text-[13px] text-foreground leading-tight">{item.title}</div>
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <Clock size={9} className={urgent ? 'text-amber-400' : 'text-muted-foreground'} />
                  <span className={`text-[10px] font-mono ${urgent ? 'text-amber-400' : 'text-muted-foreground'}`}>
                    {urgent ? 'próximo turno' : `en ${item.inTurns} turnos`}
                  </span>
                </div>
              </div>
              <div className="text-[10px] text-muted-foreground mb-1.5">↳ decidido en el turno {item.origin}</div>
              <div className="flex gap-1.5 items-start flex-wrap">
                <Zap size={9} className="text-muted-foreground/60 mt-1 flex-shrink-0" />
                {item.chips.map((c, i) => (
                  <span key={i} className={`inline-flex items-center gap-1 px-1.5 py-0 rounded border text-[10px] ${toneChipClass(c.tone)}`}>
                    {c.label} <span className="font-mono">{c.text}</span>
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
