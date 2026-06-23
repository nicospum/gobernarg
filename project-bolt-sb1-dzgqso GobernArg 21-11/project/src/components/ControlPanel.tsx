import { useState } from 'react';
import { ArrowRight, LayoutGrid } from 'lucide-react';
import { GameState, GameAction } from '../types/game';
import { ActionCard } from './ActionCard';
import { getAvailableActionsForState } from '../engine/gameEngine';
import { calculateActionEffects } from '../utils/actionEffects';
import { THUMBNAIL_CATEGORIES } from '../utils/iconThumbnails';
import { SpecialAbilitiesPanel } from './SpecialAbilitiesPanel';

interface ControlPanelProps {
  gameState: GameState;
  onActionSelect: (actionId: string) => void;
  onEndTurn: () => void;
  canTakeAction: boolean;
  onUseAbility?: () => void;
}

export function ControlPanel({ gameState, onActionSelect, onEndTurn, canTakeAction, onUseAbility }: ControlPanelProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('todas');
  const actions = getAvailableActionsForState(gameState);

  const selectedActionData = gameState.selectedActions
    .map(id => actions.find(action => action.id === id))
    .filter((action): action is GameAction => action !== undefined);

  const { popularityChange, budgetChange } = selectedActionData.reduce(
    (acc, action) => {
      const effects = calculateActionEffects(action, gameState);
      return {
        popularityChange: acc.popularityChange + effects.immediateEffects.popularityChange,
        budgetChange: acc.budgetChange + effects.immediateEffects.budgetChange
      };
    },
    { popularityChange: 0, budgetChange: 0 }
  );

  const handleActionSelect = (actionId: string) => {
    if (gameState.selectedActions.includes(actionId)) {
      // Deseleccionar la acción
      onActionSelect(actionId);
    } else if (canTakeAction) {
      // Seleccionar la acción
      onActionSelect(actionId);
    }
  };

  const filteredActions = selectedCategory === 'todas' 
    ? actions 
    : actions.filter(action => action.category === selectedCategory);

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-lg shadow-lg p-4 mb-4">
        <h2 className="text-xl font-bold mb-4">Acciones Políticas</h2>

        {gameState.legislativeSupport !== null && (
          <div className="mb-4 p-3 rounded-lg text-sm bg-slate-50 border border-slate-200">
            {gameState.legislativeSupport >= 45 && (
              <p className="text-green-700">Mayoría aplastante en el Congreso: las reformas cuestan menos esfuerzo político.</p>
            )}
            {gameState.legislativeSupport >= 38 && gameState.legislativeSupport < 45 && (
              <p className="text-blue-700">Tenés quorum propio: las reformas avanzan con costo normal.</p>
            )}
            {gameState.legislativeSupport >= 35 && gameState.legislativeSupport < 38 && (
              <p className="text-orange-700">Paridad de tercios: las reformas grandes cuestan +1 acción por la negociación obligada.</p>
            )}
            {gameState.legislativeSupport < 35 && (
              <p className="text-red-700">Congreso hostil: las reformas grandes cuestan +2 acciones o están bloqueadas.</p>
            )}
          </div>
        )}

        <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
          <button
            onClick={() => setSelectedCategory('todas')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              selectedCategory === 'todas'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 hover:bg-gray-200'
            }`}
          >
            <LayoutGrid className="w-4 h-4" />
            <span>Todas</span>
          </button>
          {['economia', 'social', 'infraestructura', 'diplomacia', 'seguridad', 'cultura'].map((category) => {
            const icon = THUMBNAIL_CATEGORIES[category];
            return (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors whitespace-nowrap ${
                  selectedCategory === category
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 hover:bg-gray-200'
                }`}
              >
                {icon ? (
                  <img src={icon} alt={category} className="w-5 h-5 object-contain" />
                ) : null}
                <span>{category.charAt(0).toUpperCase() + category.slice(1)}</span>
              </button>
            );
          })}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[600px] overflow-y-auto pr-2">
          {filteredActions.map((action) => (
            <ActionCard
              key={action.id}
              action={action}
              onSelect={() => handleActionSelect(action.id)}
              disabled={!canTakeAction && !gameState.selectedActions.includes(action.id)}
              isSelected={gameState.selectedActions.includes(action.id)}
            />
          ))}
          {gameState.selectedActions.length > 0 && (
            <div className="mt-4 p-4 bg-green-100 text-green-800 rounded-lg">
              <p>Acciones seleccionadas: {gameState.selectedActions.length}</p>
              <p>
                Impacto estimado:{' '}
                Popularidad {popularityChange >= 0 ? '+' : ''}{Math.round(popularityChange)}%,{' '}
                Presupuesto {budgetChange >= 0 ? '+' : ''}${Math.round(budgetChange)}M
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="flex justify-center">
        {onUseAbility && (
          <div className="w-full max-w-md mb-4">
            <SpecialAbilitiesPanel
              gameState={gameState}
              onUseAbility={onUseAbility}
              disabled={!canTakeAction}
            />
          </div>
        )}
        <button
          onClick={onEndTurn}
          disabled={gameState.gameOver}
          className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white px-8 py-3 rounded-lg flex items-center gap-2 transition-colors"
        >
          <span>Finalizar Turno</span>
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}