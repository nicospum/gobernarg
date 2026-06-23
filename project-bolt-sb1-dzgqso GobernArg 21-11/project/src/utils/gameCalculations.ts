import { GameState } from '../types/game';

export function calculateAvailableActions(gameState: GameState): number {
  let baseActions = 3; // Base number of actions

  // Add archetype bonus
  switch (gameState.archetype) {
    case 'politico':
      baseActions += 2;
      break;
    case 'empresario':
    case 'sindicalista':
      baseActions += 1;
      break;
  }

  // Add advisor bonus
  const advisorBonus = gameState.advisors
    .filter(advisor => advisor.isActive)
    .reduce((sum, advisor) => sum + advisor.bonusActions, 0);
  
  baseActions += advisorBonus;

  // Add popularity bonus/penalty
  if (gameState.popularity >= 75) {
    baseActions += 1;
  } else if (gameState.popularity < 25) {
    baseActions += 2;
  }

  return baseActions - gameState.selectedActions.length;
}