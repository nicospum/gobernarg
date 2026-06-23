import { GameState } from '../types/game';

export function calculateAvailableActions(gameState: GameState): number {
  let baseActions = 5; // Base number of actions

  // Archetype bonus
  if (gameState.archetype === 'politico') {
    baseActions += 2;
  } else if (gameState.archetype === 'empresario' || gameState.archetype === 'sindicalista') {
    baseActions += 1;
  }

  // Advisor bonus
  const advisorBonus = gameState.advisors
    .filter(advisor => advisor.isActive)
    .reduce((sum, advisor) => sum + advisor.bonusActions, 0);
  
  baseActions += advisorBonus;

  // Popularity-based bonus
  if (gameState.popularity >= 75) {
    baseActions += 1;
  } else if (gameState.popularity < 25) {
    baseActions += 2;
  }

  return baseActions;
}