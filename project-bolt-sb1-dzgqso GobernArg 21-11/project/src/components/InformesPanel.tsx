import { Activity, Clock } from 'lucide-react';
import type { GameState } from '../types/game';
import { runningEffects } from '@/lib/agendaView';

interface InformesPanelProps {
  gameState: GameState;
}

/**
 * Informes de gestión: programas que siguen produciendo efectos cada turno
 * (regímenes, reformas que maduran, cepo, subsidios) y medidas temporales
 * vigentes (controles, bonos, tasas).
 */
export function InformesPanel({ gameState }: InformesPanelProps) {
  const items = runningEffects(gameState.causal);
  if (items.length === 0) return null;

  return (
    <section className="rounded-lg border border-border bg-card overflow-hidden">
      <header className="flex items-center justify-between px-4 py-2.5 border-b border-border">
        <h2 className="font-display font-bold text-[13px] uppercase tracking-widest text-foreground flex items-center gap-2">
          <Clock size={12} className="text-muted-foreground" />
          Informes de Gestión
        </h2>
        <span className="text-[11px] text-muted-foreground font-mono">{items.length}</span>
      </header>
      <div className="p-3 space-y-3 max-h-[480px] overflow-y-auto">
        {items.map(item => {
          const pct = item.total > 0 ? Math.min(100, Math.round((item.done / item.total) * 100)) : 100;
          return (
            <article
              key={item.key}
              className={`rounded-lg border p-3 space-y-2 ${item.positive ? 'border-emerald-400/15 bg-emerald-400/4' : 'border-border bg-card'}`}
            >
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-display font-semibold text-[13px] text-foreground leading-tight truncate">{item.title}</h3>
                <span className="text-[9px] text-muted-foreground font-mono flex-shrink-0">
                  {item.total > 0 ? `${item.done}/${item.total} t` : 'en curso'}
                </span>
              </div>
              {item.total > 0 && (
                <div className="relative h-1.5 w-full overflow-hidden rounded-full bg-white/10">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${item.positive ? 'bg-emerald-400' : 'bg-primary'}`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              )}
              <div className="flex items-center gap-2 text-[11px] pt-1 border-t border-border">
                <Activity size={10} className="text-muted-foreground flex-shrink-0" />
                <span className="text-foreground/70 leading-snug">{item.detail}</span>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
