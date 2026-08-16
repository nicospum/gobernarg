import { useState } from 'react';
import { LayoutGrid } from 'lucide-react';
import { GameState, GameAction, ActionCategory } from '../types/game';
import { ActionCard } from './ActionCard';
import { getAvailableActionsForState } from '../engine/gameEngine';
import { calculateActionEffects } from '../utils/actionEffects';
import { CATEGORY_STYLES, ALL_CATEGORIES } from '@/data/categoryStyles';
import { fmtBudgetDelta } from '@/lib/format';

interface ControlPanelProps {
  gameState: GameState;
  onActionSelect: (actionId: string) => void;
  canTakeAction: boolean;
}

type TabValue = 'todas' | ActionCategory;

export function ControlPanel({ gameState, onActionSelect, canTakeAction }: ControlPanelProps) {
  const [selectedCategory, setSelectedCategory] = useState<TabValue>('todas');
  const actions = getAvailableActionsForState(gameState);

  const selectedActionData = gameState.selectedActions
    .map((id) => actions.find((action) => action.id === id))
    .filter((action): action is GameAction => action !== undefined);

  const { popularityChange, budgetChange } = selectedActionData.reduce(
    (acc, action) => {
      const effects = calculateActionEffects(action, gameState);
      return {
        popularityChange: acc.popularityChange + effects.immediateEffects.popularityChange,
        budgetChange: acc.budgetChange + effects.immediateEffects.budgetChange,
      };
    },
    { popularityChange: 0, budgetChange: 0 },
  );

  const handleActionSelect = (actionId: string) => {
    if (gameState.selectedActions.includes(actionId)) {
      onActionSelect(actionId);
    } else if (canTakeAction) {
      onActionSelect(actionId);
    }
  };

  const filteredActions =
    selectedCategory === 'todas'
      ? actions
      : actions.filter((action) => action.category === selectedCategory);

  const legSupport = gameState.legislativeSupport;

  return (
    <div className="flex flex-col rounded-lg border border-border bg-card shadow-sm overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <h2 className="font-display font-bold text-lg uppercase tracking-wide text-foreground">
          Acciones Políticas
        </h2>
        <span className="text-[11px] text-muted-foreground font-mono">
          {filteredActions.length}{' '}
          {filteredActions.length === 1 ? 'acción' : 'acciones'}
        </span>
      </div>

      {/* Legislative support banner */}
      {legSupport !== null && (
        <div className="mx-4 mt-3 px-3 py-2 rounded border border-border bg-white/3 text-[11px]">
          {legSupport >= 45 && (
            <p className="text-emerald-300">
              Mayoría aplastante: las reformas cuestan menos esfuerzo político.
            </p>
          )}
          {legSupport >= 38 && legSupport < 45 && (
            <p className="text-sky-300">Quórum propio: las reformas avanzan con costo normal.</p>
          )}
          {legSupport >= 35 && legSupport < 38 && (
            <p className="text-amber-300">
              Paridad: las reformas grandes cuestan +1 acción por la negociación obligada.
            </p>
          )}
          {legSupport < 35 && (
            <p className="text-red-300">
              Congreso hostil: las reformas grandes cuestan +2 acciones o están bloqueadas.
            </p>
          )}
        </div>
      )}

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
        {ALL_CATEGORIES.map((category) => {
          const style = CATEGORY_STYLES[category];
          return (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded text-[11px] font-semibold transition-all whitespace-nowrap border ${
                selectedCategory === category
                  ? `border-transparent text-white ${style.bgColor.replace('/15', '/50')}`
                  : `text-muted-foreground hover:text-foreground hover:bg-white/5 border-transparent`
              }`}
            >
              <img src={style.imageSrc} alt={style.label} className="w-3 h-3 object-contain" />
              {style.label}
            </button>
          );
        })}
      </div>

      {/* Grid */}
      <div className="flex-1 overflow-y-auto px-3 pb-3">
        {filteredActions.length === 0 ? (
          <div className="text-center py-10 text-[12px] text-muted-foreground">
            No hay acciones disponibles en esta categoría.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
            {filteredActions.map((action) => (
              <ActionCard
                key={action.id}
                action={action}
                gameState={gameState}
                onSelect={() => handleActionSelect(action.id)}
                disabled={!canTakeAction && !gameState.selectedActions.includes(action.id)}
                isSelected={gameState.selectedActions.includes(action.id)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Footer sumario */}
      {gameState.selectedActions.length > 0 && (
        <div className="px-4 py-2.5 border-t border-border bg-primary/5 text-[12px] flex items-center justify-between gap-3 flex-wrap">
          <span className="font-semibold text-foreground">
            {gameState.selectedActions.length}{' '}
            {gameState.selectedActions.length === 1
              ? 'acción seleccionada'
              : 'acciones seleccionadas'}
          </span>
          <span className="text-muted-foreground font-mono">
            <span className={popularityChange >= 0 ? 'text-emerald-400' : 'text-red-400'}>
              {popularityChange >= 0 ? '+' : ''}
              {Math.round(popularityChange)}% pop
            </span>
            {' · '}
            <span className={budgetChange >= 0 ? 'text-emerald-400' : 'text-red-400'}>
              {fmtBudgetDelta(budgetChange)}
            </span>
          </span>
        </div>
      )}
    </div>
  );
}
