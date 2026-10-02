import type { GameState } from '../types/game';
import { ARCHETYPE_PASSIVES } from '../data/specialAbilities';

/**
 * Pasivas del arquetipo que viven en el estado del juego: corren el perfil de
 * gestión (ejes narrativos de la pantalla de legado) al inicio y en cada turno.
 * Las pasivas que mueven el motor causal se aplican en causalBridge
 * (newCausalForGame y computePerks).
 */
export function applyArchetypePassives(state: GameState): GameState {
  const passives = ARCHETYPE_PASSIVES[state.archetype];
  if (!passives || passives.length === 0) return state;

  let radicalConciliadorShift = 0;
  let populistaTecnicoShift = 0;
  let cerradoConvocanteShift = 0;
  for (const passive of passives) {
    radicalConciliadorShift += passive.radicalConciliadorShift ?? 0;
    populistaTecnicoShift += passive.populistaTecnicoShift ?? 0;
    cerradoConvocanteShift += passive.cerradoConvocanteShift ?? 0;
  }

  return {
    ...state,
    radicalConciliadorAxis: clampAxis(state.radicalConciliadorAxis + radicalConciliadorShift),
    populistaTecnicoAxis: clampAxis(state.populistaTecnicoAxis + populistaTecnicoShift),
    cerradoConvocanteAxis: clampAxis(state.cerradoConvocanteAxis + cerradoConvocanteShift),
  };
}

function clampAxis(value: number): number {
  return Math.min(100, Math.max(-100, value));
}
