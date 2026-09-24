import type {
  GameState,
  GameAction,
  ActionCategory,
} from '../types/game';
import { actionDefinitions } from '../data/actionRegistry';
import { POSITION_ACTION_EXCLUSIONS } from './engineShared';
import { getDifficultyModifiers } from './difficultyEngine';
import { CAUSAL_ACTIONS_BY_ID } from '../data/causal';
import { getAvailability, legForLaws, lawThreshold, listPolicyAvailability, type Availability, type Selection } from './causal';

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

/** DEPRECADO (catálogo viejo de 61 acciones): se conserva para módulos legacy y sus tests. */
export function findActionById(actionId: string): GameAction | undefined {
  return actionDefinitions.find(action => action.id === actionId);
}

/** DEPRECADO: disponibilidad del catálogo viejo. La UI usa getPolicyAvailability. */
export function getAvailableActionsForState(gameState: GameState): GameAction[] {
  const excluded = POSITION_ACTION_EXCLUSIONS[gameState.position] || [];
  const penalty = getLegislativePenalty(gameState.legislativeSupport);

  return actionDefinitions
    .filter(action => {
      if (excluded.includes(action.id)) return false;
      // Dificultad: filtrar préstamos si la dificultad actual no los permite
      if (action.isLoan && !getDifficultyModifiers(gameState.difficulty).loansAvailable) return false;
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
      // Fase 2: filtrar por asesor requerido
      if (action.requirements.advisorRequired) {
        const hasRequiredAdvisor = gameState.advisors.some(
          advisor => advisor.id === action.requirements.advisorRequired && advisor.isActive
        );
        if (!hasRequiredAdvisor) return false;
      }
      // Fase 2: filtrar por apoyo de grupos requerido
      if (action.requirements.groupSupportRequired) {
        const meetsGroupSupport = action.requirements.groupSupportRequired.every(
          req => (gameState.groupRelations[req.groupId] || 0) >= req.minSupport
        );
        if (!meetsGroupSupport) return false;
      }
      // Fase 2: filtrar por acciones desbloqueadas
      if (!(gameState.unlockedActions ?? []).includes(action.id)) return false;
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

/** Selección actual en formato del motor (para validar disponibilidad y costos). */
function currentSelections(gameState: GameState): Selection[] {
  return gameState.selectedActions.map(actionId => ({ actionId }));
}

/** Disponibilidad de todas las políticas para la grilla de acciones. */
export function getPolicyAvailability(gameState: GameState): Availability[] {
  return listPolicyAvailability(gameState.causal, currentSelections(gameState), gameState.actions, {
    loansAllowed: getDifficultyModifiers(gameState.difficulty).loansAvailable,
  });
}

/**
 * Seleccionar / deseleccionar una política del turno. El costo en PA se
 * descuenta al seleccionar y se devuelve al deseleccionar; la caja se paga al
 * cerrar el turno (pero la selección no puede superarla).
 */
export function toggleActionSelection(gameState: GameState, actionId: string): GameState {
  const def = CAUSAL_ACTIONS_BY_ID[actionId];
  if (!def || def.isSystem) return gameState;
  const selections = currentSelections(gameState);
  const isSelected = gameState.selectedActions.includes(actionId);
  if (isSelected) {
    const av = getAvailability(gameState.causal, actionId, selections, gameState.actions);
    let selected = gameState.selectedActions.filter(id => id !== actionId);
    let refund = av.pa;
    // Sin DNU, las leyes sin mayoría seleccionadas dejan de ser viables.
    if (actionId === 'dnu' && legForLaws(gameState.causal) < lawThreshold(gameState.causal)) {
      for (const id of selected) {
        const d = CAUSAL_ACTIONS_BY_ID[id];
        if (d?.ley) {
          refund += getAvailability(gameState.causal, id, selections, gameState.actions).pa;
          selected = selected.filter(x => x !== id);
        }
      }
    }
    return { ...gameState, selectedActions: selected, actions: gameState.actions + refund };
  }
  const av = getAvailability(gameState.causal, actionId, selections, gameState.actions, {
    loansAllowed: getDifficultyModifiers(gameState.difficulty).loansAvailable,
  });
  if (!av.visible || !av.available) return gameState;
  return {
    ...gameState,
    selectedActions: [...gameState.selectedActions, actionId],
    actions: gameState.actions - av.pa,
  };
}
