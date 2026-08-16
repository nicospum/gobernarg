import type {
  GameState,
  GameAction,
  ActionCategory,
} from '../types/game';
import { actionDefinitions } from '../data/actionRegistry';
import { POSITION_ACTION_EXCLUSIONS } from './engineShared';

const REFORM_CATEGORIES: ActionCategory[] = ['economia', 'infraestructura'];

function isReformAction(action: GameAction): boolean {
  return REFORM_CATEGORIES.includes(action.category) || Math.abs(action.budgetChange) >= 200;
}

function getLegislativePenalty(legislativeSupport: number | null): number {
  if (legislativeSupport === null) return 0;
  if (legislativeSupport >= 45) return -1; // mayoría aplastante: reformas más baratas
  if (legislativeSupport >= 38) return 0;  // quorum propio: costo normal
  if (legislativeSupport >= 35) return 1;  // paridad de tercios: +1 acción
  return 2;                                 // derrota: +2 acciones
}

export function findActionById(actionId: string): GameAction | undefined {
  return actionDefinitions.find(action => action.id === actionId);
}

export function getAvailableActionsForState(gameState: GameState): GameAction[] {
  const excluded = POSITION_ACTION_EXCLUSIONS[gameState.position] || [];
  const penalty = getLegislativePenalty(gameState.legislativeSupport);

  return actionDefinitions
    .filter(action => {
      if (excluded.includes(action.id)) return false;
      // Fase 1: filtrar por cargo
      if (action.availableForPositions && !action.availableForPositions.includes(gameState.position)) return false;
      // Fase 2: filtrar por cooldown
      if ((gameState.actionCooldowns[action.id] || 0) > 0) return false;
      // Fase 3: filtrar por prerequisites
      if (action.prerequisites) {
        if (action.prerequisites.requiredActions) {
          const allDone = action.prerequisites.requiredActions.every(
            reqId => gameState.completedActions.includes(reqId)
          );
          if (!allDone) return false;
        }
        if (action.prerequisites.minLegislativeSupport !== undefined) {
          if ((gameState.legislativeSupport ?? 0) < action.prerequisites.minLegislativeSupport) return false;
        }
        if (action.prerequisites.minLegitimacy !== undefined) {
          if ((gameState.legitimacy ?? 50) < action.prerequisites.minLegitimacy) return false;
        }
        if (action.prerequisites.minGroupSupport) {
          const meets = Object.entries(action.prerequisites.minGroupSupport).every(
            ([groupId, min]) => (gameState.groupRelations[groupId] || 0) >= min
          );
          if (!meets) return false;
        }
      }
      if (gameState.budget < action.requirements.minBudget) return false;
      if (action.requirements.minPopularity && gameState.popularity < action.requirements.minPopularity) return false;
      return true;
    })
    .map(action => {
      const reform = isReformAction(action);
      const baseCost = 1;
      const actionCost = reform
        ? Math.max(1, baseCost + penalty)
        : baseCost;

      return {
        ...action,
        isReform: reform,
        actionCost
      };
    });
}

export function toggleActionSelection(gameState: GameState, actionId: string): GameState {
  const action = findActionById(actionId);
  const availableAction = action ? getAvailableActionsForState(gameState).find(a => a.id === actionId) : undefined;
  const actionCost = availableAction?.actionCost ?? 1;

  const isSelected = gameState.selectedActions.includes(actionId);
  if (isSelected) {
    return {
      ...gameState,
      selectedActions: gameState.selectedActions.filter(id => id !== actionId),
      actions: gameState.actions + actionCost
    };
  }
  if (gameState.actions < actionCost) return gameState;
  return {
    ...gameState,
    selectedActions: [...gameState.selectedActions, actionId],
    actions: gameState.actions - actionCost
  };
}
