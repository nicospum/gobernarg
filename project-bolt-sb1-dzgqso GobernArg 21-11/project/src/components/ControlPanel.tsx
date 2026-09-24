import { useMemo, useState } from 'react';
import { LayoutGrid, Scale } from 'lucide-react';
import { GameState } from '../types/game';
import { ActionCard } from './ActionCard';
import { getPolicyAvailability } from '../engine/gameEngine';
import { UI_CATEGORY_STYLES } from '@/data/categoryStyles';
import { ACTOR_IDS, PARAMS, UI_CATEGORIES, type ActorId, type UiCategory } from '@/data/causal';
import { legForLaws, lawThreshold, projectedCloseCaja } from '@/engine/causal';
import { fmtBudget, fmtBudgetDelta } from '@/lib/format';

interface ControlPanelProps {
  gameState: GameState;
  onActionSelect: (actionId: string) => void;
  canTakeAction: boolean;
}

type TabValue = 'todas' | UiCategory;

export function ControlPanel({ gameState, onActionSelect, canTakeAction }: ControlPanelProps) {
  const [selectedCategory, setSelectedCategory] = useState<TabValue>('todas');
  const availability = getPolicyAvailability(gameState);
  const causal = gameState.causal;

  // Demandas reveladas en reuniones → la acción pedida se marca en la grilla.
  const requestedBy = useMemo(() => {
    const map: Record<string, ActorId[]> = {};
    for (const a of ACTOR_IDS) {
      const d = causal.actors[a].demand;
      if (d && d.revealedTurn !== null && causal.turn - d.revealedTurn < PARAMS.VENTANA_DEMANDA) {
        (map[d.actionId] ??= []).push(a);
      }
    }
    return map;
  }, [causal]);

  const filtered = availability
    .filter(av => selectedCategory === 'todas' || av.action.category === selectedCategory)
    .sort((x, y) => {
      const sx = gameState.selectedActions.includes(x.action.id) ? 0 : x.available ? 1 : 2;
      const sy = gameState.selectedActions.includes(y.action.id) ? 0 : y.available ? 1 : 2;
      return sx - sy;
    });

  const selectedCaja = availability
    .filter(av => gameState.selectedActions.includes(av.action.id))
    .reduce((acc, av) => acc + av.caja, 0);

  const projection = projectedCloseCaja(causal, gameState.selectedActions.map(actionId => ({ actionId })));
  const leg = Math.round(legForLaws(causal));
  const threshold = lawThreshold(causal);
  const honeymoon = causal.turn - causal.mandateStart + 1 <= PARAMS.LUNA_MIEL;
  const hasMajority = leg >= threshold;

  return (
    <div className="flex flex-col rounded-xl border border-white/8 bg-[#0f1e38] shadow-xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-white/8 bg-[#091422]">
        <h2 className="font-['Barlow_Condensed'] font-bold text-xl uppercase tracking-wider text-white">
          ACCIONES POLÍTICAS
        </h2>
        <span className="text-[11px] text-white/50 font-mono">
          {filtered.filter(a => a.available).length} disponibles · {filtered.length} en categoría
        </span>
      </div>

      {/* Alerta de Congreso */}
      <div className="mx-4 mt-3 px-3.5 py-2.5 rounded-lg border border-white/8 bg-white/4 text-[11px] flex items-start gap-2.5">
        <Scale size={14} className={hasMajority ? 'text-emerald-400 flex-shrink-0 mt-0.5' : 'text-amber-400 flex-shrink-0 mt-0.5'} />
        <p className={hasMajority ? 'text-emerald-300/90 leading-relaxed' : 'text-amber-300/90 leading-relaxed'}>
          {hasMajority
            ? `Congreso favorable: mayorías para votar leyes (${leg}% de apoyo parlamentario; requere ${threshold}%).`
            : `Congreso fragmentado (${leg}% de apoyo; requiere ${threshold}%). Las leyes complejas pueden enviarse por DNU con mayor costo político.`}
          {honeymoon && <span className="text-cyan-300 font-semibold"> (Luna de miel activa)</span>}
        </p>
      </div>

      {/* Categorías Filter Tabs */}
      <div className="flex items-center gap-1.5 p-2 mx-4 my-3 rounded-lg bg-[#070e17] border border-white/8 overflow-x-auto scrollbar-none">
        <button
          onClick={() => setSelectedCategory('todas')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[11px] font-bold transition-all whitespace-nowrap ${
            selectedCategory === 'todas'
              ? 'bg-blue-600 text-white shadow-md'
              : 'text-white/60 hover:text-white hover:bg-white/6'
          }`}
        >
          <LayoutGrid size={13} />
          Todas
        </button>
        {UI_CATEGORIES.filter(c => availability.some(av => av.action.category === c)).map((category) => {
          const style = UI_CATEGORY_STYLES[category];
          const isActive = selectedCategory === category;
          return (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[11px] font-bold transition-all whitespace-nowrap border ${
                isActive
                  ? 'border-blue-500/40 bg-blue-500/20 text-white shadow-sm'
                  : 'border-transparent text-white/60 hover:text-white hover:bg-white/6'
              }`}
            >
              <img src={style.imageSrc} alt={style.label} className="w-3.5 h-3.5 object-contain" />
              {style.label}
            </button>
          );
        })}
      </div>

      {/* Grid de tarjetas */}
      <div className="flex-1 overflow-y-auto px-4 pb-4 max-h-[620px]">
        {filtered.length === 0 ? (
          <div className="text-center py-12 text-[12px] text-white/40">
            No hay acciones disponibles en esta categoría.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {filtered.map((av) => (
              <ActionCard
                key={av.action.id}
                availability={av}
                requestedBy={requestedBy[av.action.id] ?? []}
                onSelect={() => onActionSelect(av.action.id)}
                isSelected={gameState.selectedActions.includes(av.action.id)}
                disabled={!canTakeAction && !gameState.selectedActions.includes(av.action.id)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Footer: proyección de caja */}
      <div className={`px-5 py-3 border-t border-white/8 text-[12px] flex items-center justify-between gap-3 flex-wrap ${projection.caja < 0 ? 'bg-red-500/10' : 'bg-[#091422]'}`}>
        <span className="font-bold text-white">
          {gameState.selectedActions.length === 0
            ? 'Sin acciones en agenda este turno'
            : `${gameState.selectedActions.length} ${gameState.selectedActions.length === 1 ? 'acción elegida' : 'acciones elegidas'} (${fmtBudgetDelta(selectedCaja)})`}
        </span>
        <span className="text-white/60 font-mono text-[11px]">
          Caja proyectada:{' '}
          <span className={`font-bold ${projection.caja >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>{fmtBudget(projection.caja)}</span>
          {' · '}Balance estructural:{' '}
          <span className={`font-bold ${projection.structural >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>{fmtBudgetDelta(projection.structural)}/t</span>
        </span>
        {projection.caja < 0 && (
          <span className="w-full text-[11px] text-red-300 font-semibold">
            ⚠ Alerta fiscal: la caja caerá en déficit y el Tesoro emitirá moneda en el próximo turno.
          </span>
        )}
      </div>
    </div>
  );
}
