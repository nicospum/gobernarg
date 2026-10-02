import { Clock } from 'lucide-react';
import type { GameState } from '../types/game';
import { upcomingEffects } from '@/lib/agendaView';
import type { Tone } from '@/lib/causalText';
import { PanelHead } from './board/PanelHead';

interface PendingEffectsPanelProps {
  gameState: GameState;
  index?: string;
}

const TONE: Record<Tone, string> = { good: 'text-sala-good', bad: 'text-sala-bad', neutral: 'text-sala-blue' };

/**
 * Próximas maduraciones: consecuencias ya decididas que todavía no llegaron
 * (obras que maduran, rebotes, mantenimiento, revisiones de metas…).
 */
export function PendingEffectsPanel({ gameState, index }: PendingEffectsPanelProps) {
  const items = upcomingEffects(gameState.causal);

  return (
    <section id="panel-maduraciones" className="sr-panel scroll-mt-24" aria-label="Próximas maduraciones">
      <PanelHead index={index} label="Efectos en camino" title="Próximas maduraciones">
        {items.length > 0 && <span className="text-[11px] font-bold font-mono text-sala-blue">{items.length}</span>}
      </PanelHead>
      {items.length === 0 ? (
        <p className="px-4 py-4 text-[12px] text-sala-muted">No hay efectos en camino: lo decidido ya llegó.</p>
      ) : (
        <ul className="max-h-[420px] overflow-y-auto">
          {items.map(item => {
            const urgent = item.inTurns <= 1;
            return (
              <li key={item.key} className="relative px-4 py-3 border-t border-rule first:border-t-0">
                <span className={`absolute left-0 top-3 bottom-3 w-1 rounded-r ${item.positive ? 'bg-sala-good' : 'bg-sala-coral'}`} aria-hidden="true" />
                <div className="flex items-start justify-between gap-2">
                  <b className="text-[12px] text-ink leading-tight">{item.title}</b>
                  <span className={`flex-shrink-0 inline-flex items-center gap-1 text-[10px] font-bold font-mono ${urgent ? 'text-sala-warn' : 'text-sala-muted'}`}>
                    <Clock size={11} /> {urgent ? 'Próximo turno' : `en ${item.inTurns}t`}
                  </span>
                </div>
                <div className="text-[10px] text-sala-dim mt-0.5">Decidido en el turno {item.origin}</div>
                <div className="flex flex-wrap gap-x-3 gap-y-0.5 mt-1.5 text-[11px]">
                  {item.chips.map((c, i) => (
                    <span key={i} className="text-sala-muted">
                      {c.label} <b className={`font-mono ${TONE[c.tone]}`}>{c.text}</b>
                    </span>
                  ))}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
