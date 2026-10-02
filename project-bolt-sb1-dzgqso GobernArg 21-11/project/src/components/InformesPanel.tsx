import { Activity, Newspaper } from 'lucide-react';
import type { GameState } from '../types/game';
import { runningEffects } from '@/lib/agendaView';
import { PanelHead } from './board/PanelHead';

interface InformesPanelProps {
  gameState: GameState;
  index?: string;
}

/**
 * Informes de gestión: programas que siguen produciendo efectos cada turno
 * (regímenes, reformas que maduran, cepo, subsidios) y medidas temporales
 * vigentes (controles, bonos, tasas).
 */
export function InformesPanel({ gameState, index }: InformesPanelProps) {
  const items = runningEffects(gameState.causal);

  return (
    <section id="panel-informes" className="sr-panel scroll-mt-24" aria-label="Informes de gestión">
      <PanelHead index={index} label="Programas en curso" title="Informes de gestión">
        <Newspaper size={17} className="text-sala-dim" />
      </PanelHead>
      {items.length === 0 ? (
        <p className="px-4 py-4 text-[12px] text-sala-muted">Todavía no hay programas en curso.</p>
      ) : (
        <ul className="max-h-[480px] overflow-y-auto">
          {items.map(item => {
            const pct = item.total > 0 ? Math.min(100, Math.round((item.done / item.total) * 100)) : 100;
            return (
              <li key={item.key} className="px-4 py-3 border-t border-rule first:border-t-0 space-y-1.5">
                <div className="flex items-start justify-between gap-2">
                  <b className="text-[12px] text-ink leading-tight truncate">{item.title}</b>
                  <span className="text-[10px] text-sala-muted font-mono flex-shrink-0">
                    {item.total > 0 ? `${item.done}/${item.total} t` : 'en curso'}
                  </span>
                </div>
                {item.total > 0 && (
                  <div className="sr-track !h-[5px]">
                    <i className={item.positive ? 'bg-sala-good' : 'bg-sala-blue'} style={{ width: `${pct}%` }} />
                  </div>
                )}
                <p className="flex items-start gap-1.5 text-[11px] text-sala-muted leading-snug">
                  <Activity size={11} className="mt-0.5 flex-shrink-0" /> {item.detail}
                </p>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
