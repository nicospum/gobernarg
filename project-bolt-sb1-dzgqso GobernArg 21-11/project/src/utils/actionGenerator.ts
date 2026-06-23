import { GameState, GameAction } from '../types/game';
import { actionCategories } from '../data/actionCategories';

export function generatePossibleActions(gameState: GameState): GameAction[] {
  // Obtener todas las acciones de todas las categorías
  const allActions = actionCategories.flatMap(category => category.actions);

  // Filtrar las acciones según los requisitos
  return allActions.filter(action => {
    const meetsMinBudget = gameState.budget >= action.requirements.minBudget;
    const meetsMinPopularity = !action.requirements.minPopularity || 
                              gameState.popularity >= action.requirements.minPopularity;
    
    // Verificar si la acción está disponible para el cargo actual
    const isAvailableForPosition = !action.availableForPositions || 
      action.availableForPositions.includes(gameState.position);
    
    return meetsMinBudget && meetsMinPopularity && isAvailableForPosition;
  });
}