import { ShieldCheck } from 'lucide-react';
import { GameState } from '../types/game';
import { activeConditions } from '@/lib/agendaView';
import { PanelHead } from './board/PanelHead';

interface ActiveBenefitsProps {
  gameState: GameState;
  index?: string;
}

/** Condiciones vigentes: estudio de factibilidad, cepo, pacto social, luna de miel, estrategia… */
export function ActiveBenefits({ gameState, index }: ActiveBenefitsProps) {
  const items = activeConditions(gameState.causal);

  return (
    <section id="panel-condiciones" className="sr-panel scroll-mt-24" aria-label="Condiciones vigentes">
      <PanelHead index={index} label="Marco vigente" title="Condiciones vigentes">
        <ShieldCheck size={17} className="text-sala-good" />
      </PanelHead>
      {items.length === 0 ? (
        <p className="px-4 py-4 text-[12px] text-sala-muted">No hay condiciones especiales vigentes.</p>
      ) : (
        <ul>
          {items.map(item => (
            <li key={item.key} className="px-4 py-3 border-t border-rule first:border-t-0" title={item.detail}>
              <div className="flex items-center justify-between gap-2">
                <b className="text-[12px] text-ink">{item.label}</b>
                {item.turnsLeft !== null && (
                  <span className="text-[10px] font-bold font-mono text-sala-good bg-emerald-500/10 rounded px-1.5 py-0.5">{item.turnsLeft} t</span>
                )}
              </div>
              {item.detail && <p className="text-[11px] text-sala-muted leading-snug mt-0.5">{item.detail}</p>}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
