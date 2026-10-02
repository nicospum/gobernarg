import { Save } from 'lucide-react';
import type { GameState } from '../../types/game';
import { getScenario } from '@/data/causal';
import { turnInMandate } from '@/lib/boardView';

/** Pie de estado: última novedad, guardado automático y escenario. */
export function StatusFooter({ gameState }: { gameState: GameState }) {
  const last = gameState.notifications[0];
  const scenario = getScenario(gameState.causal.scenarioId);
  return (
    <footer className="bg-surface border-t border-rule">
      <div className="max-w-[1540px] mx-auto flex flex-wrap items-center gap-x-6 gap-y-1.5 px-4 lg:px-7 py-3 text-[11px] text-sala-muted">
        <span className="inline-flex items-center gap-2"><span className="sr-live-dot" /> Partida en curso</span>
        <span className="truncate max-w-[420px]">Última novedad: {last ? last.title : 'sin novedades'}</span>
        <span className="inline-flex items-center gap-1.5"><Save size={12} /> Autoguardado · turno {turnInMandate(gameState)} de 16</span>
        <span className="ml-auto">GobernArg Lite <b className="text-sala-cyan">·</b> {scenario.name}</span>
      </div>
    </footer>
  );
}
