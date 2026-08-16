import { GameState, GameAction } from '../types/game';

/** Calcula el cambio de legitimidad generado por una acción */
export function calculateLegitimacyChange(action: GameAction, _state: GameState): number {
  let change = 0;

  // GANANCIAS
  // Cumplir promesas (acciones de comunicación/explicación)
  if (action.category === 'cultura' || action.category === 'diplomacia') {
    change += 3;
  }

  // PÉRDIDAS
  // Decretos forzados: acciones muy costosas e impopulares
  if (action.popularityChange <= -10 && action.budgetChange <= -400) {
    change -= 8;
  }
  // Medidas impopulares
  if (action.popularityChange < 0) {
    change -= Math.min(5, Math.abs(action.popularityChange) * 0.1);
  }

  return change;
}

/** Si legitimidad = 0, las acciones cuestan el doble */
export function checkLegitimacyCostMultiplier(state: GameState): number {
  return state.legitimacy <= 0 ? 2 : 1;
}
