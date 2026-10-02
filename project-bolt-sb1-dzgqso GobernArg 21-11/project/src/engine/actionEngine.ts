import type { GameState } from '../types/game';
import { CAUSAL_ACTIONS_BY_ID } from '../data/causal';
import { getAvailability, legForLaws, lawThreshold, listPolicyAvailability, type Availability, type Selection } from './causal';

/** Selección actual en formato del motor (para validar disponibilidad y costos). */
function currentSelections(gameState: GameState): Selection[] {
  return gameState.selectedActions.map(actionId => ({ actionId }));
}

/** Disponibilidad de todas las políticas para la grilla de acciones. */
export function getPolicyAvailability(gameState: GameState): Availability[] {
  return listPolicyAvailability(gameState.causal, currentSelections(gameState), gameState.actions);
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
  const av = getAvailability(gameState.causal, actionId, selections, gameState.actions);
  if (!av.visible || !av.available) return gameState;
  return {
    ...gameState,
    selectedActions: [...gameState.selectedActions, actionId],
    actions: gameState.actions - av.pa,
  };
}
