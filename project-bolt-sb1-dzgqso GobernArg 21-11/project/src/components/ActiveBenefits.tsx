import { ShieldCheck } from 'lucide-react';
import { GameState } from '../types/game';
import { activeConditions } from '@/lib/agendaView';

interface ActiveBenefitsProps {
  gameState: GameState;
}

/** Condiciones vigentes: estudio de factibilidad, cepo, pacto social, luna de miel, estrategia… */
export function ActiveBenefits({ gameState }: ActiveBenefitsProps) {
  const items = activeConditions(gameState.causal);
  if (items.length === 0) return null;

  return (
    <div className="bg-emerald-400/10 border border-emerald-400/20 rounded-lg p-3">
      <h3 className="text-sm font-semibold text-emerald-300 mb-2 flex items-center gap-1">
        <ShieldCheck className="w-4 h-4" />
        Condiciones vigentes
      </h3>
      <div className="space-y-1.5">
        {items.map(item => (
          <div key={item.key} className="text-xs text-emerald-200/90" title={item.detail}>
            <div className="flex items-center justify-between gap-2">
              <span className="font-medium">{item.label}</span>
              {item.turnsLeft !== null && <span className="text-emerald-400 font-mono">{item.turnsLeft}t</span>}
            </div>
            {item.detail && <p className="text-[10px] text-emerald-200/60 leading-snug">{item.detail}</p>}
          </div>
        ))}
      </div>
    </div>
  );
}
