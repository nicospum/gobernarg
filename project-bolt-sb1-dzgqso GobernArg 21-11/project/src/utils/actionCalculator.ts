import { GameState } from '../types/game';

export function calculateAvailableActions(gameState: GameState): number {
  // Acciones base por cargo (Fase 1)
  const POSITION_BASE_ACTIONS: Record<string, number> = {
    intendente: 3,
    gobernador: 2,
    presidente: 1
  };
  let baseActions = POSITION_BASE_ACTIONS[gameState.position] ?? 3;

  // Archetype bonus
  if (gameState.archetype === 'politico') {
    baseActions += 1;
  } else if (gameState.archetype === 'empresario' || gameState.archetype === 'sindicalista') {
    baseActions += 1;
  }

  // Advisor bonus
  const advisorBonus = gameState.advisors
    .filter(advisor => advisor.isActive)
    .reduce((sum, advisor) => sum + advisor.bonusActions, 0);
  
  baseActions += advisorBonus;

  // Popularity-based bonus (solo bonus por alta popularidad; sin bonus por baja)
  if (gameState.popularity >= 75) {
    baseActions += 1;
  }

  return baseActions;
}