import { useMemo, useState } from 'react';
import { Eye, EyeOff, LayoutGrid, Scale } from 'lucide-react';
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
  const [showBlocked, setShowBlocked] = useState(false);
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

  const inCategory = availability
    .filter(av => selectedCategory === 'todas' || av.action.category === selectedCategory);
  const blockedCount = inCategory.filter(av => av.blocked).length;
  const filtered = inCategory
    .filter(av => showBlocked || !av.blocked)
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
    <div className="flex flex-col rounded-lg border border-border bg-card shadow-sm overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <h2 className="font-display font-bold text-lg uppercase tracking-wide text-foreground">
          Acciones Políticas
        </h2>
        <span className="text-[11px] text-muted-foreground font-mono">
          {inCategory.filter(a => a.available).length} disponibles · {inCategory.length} en total
        </span>
      </div>

      {/* Congreso */}
      <div className="mx-4 mt-3 px-3 py-2 rounded border border-border bg-white/3 text-[11px] flex items-start gap-2">
        <Scale size={13} className={hasMajority ? 'text-emerald-300 mt-0.5' : 'text-amber-300 mt-0.5'} />
        <p className={hasMajority ? 'text-emerald-300' : 'text-amber-300'}>
          {hasMajority
            ? `Congreso: las leyes salen (${leg}% de apoyo; se necesita ${threshold}%).`
            : `Congreso: sin mayoría para leyes (${leg}% de apoyo; se necesita ${threshold}%). Un DNU permite sacar una ley por decreto, con costo institucional.`}
          {honeymoon && <span className="text-sky-300"> Luna de miel: el Congreso acompaña más los primeros turnos.</span>}
        </p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-0.5 p-2 m-3 rounded bg-white/3 border border-border overflow-x-auto">
        <button
          onClick={() => setSelectedCategory('todas')}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded text-[11px] font-semibold transition-all whitespace-nowrap ${
            selectedCategory === 'todas'
              ? 'bg-primary text-primary-foreground'
              : 'text-muted-foreground hover:text-foreground hover:bg-white/5'
          }`}
        >
          <LayoutGrid size={12} />
          Todas
        </button>
        {UI_CATEGORIES.filter(c => availability.some(av => av.action.category === c)).map((category) => {
          const style = UI_CATEGORY_STYLES[category];
          return (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              title={category}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded text-[11px] font-semibold transition-all whitespace-nowrap border ${
                selectedCategory === category
                  ? `border-transparent text-white ${style.bgColor.replace('/15', '/50')}`
                  : 'text-muted-foreground hover:text-foreground hover:bg-white/5 border-transparent'
              }`}
            >
              <img src={style.imageSrc} alt={style.label} className="w-3 h-3 object-contain" />
              {style.label}
            </button>
          );
        })}
      </div>

      {/* Bloqueadas: ocultas por defecto */}
      {blockedCount > 0 && (
        <div className="mx-3 mb-2 flex items-center justify-between gap-2 text-[11px] text-muted-foreground">
          <span>
            {showBlocked
              ? `Mostrando ${blockedCount} bloqueada${blockedCount === 1 ? '' : 's'} (requisitos, espera o Congreso).`
              : `${blockedCount} bloqueada${blockedCount === 1 ? '' : 's'} oculta${blockedCount === 1 ? '' : 's'} (requisitos, espera o Congreso).`}
          </span>
          <button
            onClick={() => setShowBlocked(v => !v)}
            className="inline-flex items-center gap-1 px-2 py-1 rounded border border-border hover:bg-white/5 hover:text-foreground transition-colors whitespace-nowrap"
          >
            {showBlocked ? <EyeOff size={11} /> : <Eye size={11} />}
            {showBlocked ? 'Ocultar bloqueadas' : 'Ver también las bloqueadas'}
          </button>
        </div>
      )}

      {/* Grid */}
      <div className="flex-1 overflow-y-auto px-3 pb-3 max-h-[560px]">
        {filtered.length === 0 ? (
          <div className="text-center py-10 text-[12px] text-muted-foreground">
            {inCategory.length === 0 ? 'No hay acciones en esta categoría.' : 'Todas las acciones de esta categoría están bloqueadas por ahora.'}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
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

      {/* Footer: proyección de caja al cierre */}
      <div className={`px-4 py-2.5 border-t border-border text-[12px] flex items-center justify-between gap-3 flex-wrap ${projection.caja < 0 ? 'bg-red-400/10' : 'bg-primary/5'}`}>
        <span className="font-semibold text-foreground">
          {gameState.selectedActions.length === 0
            ? 'Sin políticas seleccionadas'
            : `${gameState.selectedActions.length} ${gameState.selectedActions.length === 1 ? 'acción seleccionada' : 'acciones seleccionadas'} (${fmtBudgetDelta(selectedCaja)})`}
        </span>
        <span className="text-muted-foreground font-mono" title="Estimación: caja actual + costo de lo elegido + recaudación − gasto corriente − intereses. No incluye efectos diferidos ni eventos.">
          Caja estimada al cierre:{' '}
          <span className={projection.caja >= 0 ? 'text-emerald-400' : 'text-red-400'}>{fmtBudget(projection.caja)}</span>
          {' · '}Resultado estructural:{' '}
          <span className={projection.structural >= 0 ? 'text-emerald-400' : 'text-red-400'}>{fmtBudgetDelta(projection.structural)}/turno</span>
        </span>
        {projection.caja < 0 && (
          <span className="w-full text-[11px] text-red-300">
            Con esta selección la caja queda en rojo: el Tesoro emitirá el turno siguiente y eso empuja la inflación.
          </span>
        )}
      </div>
    </div>
  );
}
