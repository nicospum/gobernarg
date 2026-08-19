import type { GameState } from '../types/game';
import type { ArchetypePassive } from '../data/specialAbilities';
import { ARCHETYPE_PASSIVES } from '../data/specialAbilities';

/** Aplica los efectos pasivos del arquetipo al estado de juego. Se llama al inicio de cada turno. */
export function applyArchetypePassives(state: GameState): GameState {
  const passives = (ARCHETYPE_PASSIVES as Record<string, ArchetypePassive[]>)[state.archetype];
  if (!passives || passives.length === 0) return state;

  const updated = { ...state };

  // Reiniciar acumuladores para evitar duplicación en llamadas repetidas
  updated._archetypeIncomeBonus = 0;
  updated._archetypeExtraLoans = 0;
  updated._archetypeElectionRetention = 0;
  updated._archetypeEventResilience = 0;
  updated._archetypeFreeInteractions = [];
  updated._archetypeExtraActions = 0;

  // Acumuladores de shift de ejes ideológicos
  let radicalConciliadorShift = 0;
  let populistaTecnicoShift = 0;
  let cerradoConvocanteShift = 0;

  for (const passive of passives) {
    if (passive.incomeBonus && passive.incomeBonus > 0) {
      updated._archetypeIncomeBonus = (updated._archetypeIncomeBonus ?? 0) + passive.incomeBonus;
    }

    if (passive.extraActions) {
      updated._archetypeExtraActions = (updated._archetypeExtraActions ?? 0) + passive.extraActions;
      updated.baseActions = (updated.baseActions || 5) + passive.extraActions;
      updated.actions = updated.baseActions;
    }

    if (passive.extraLoans) {
      updated._archetypeExtraLoans = (updated._archetypeExtraLoans ?? 0) + passive.extraLoans;
    }

    if (passive.electionRetention) {
      updated._archetypeElectionRetention = (updated._archetypeElectionRetention ?? 0) + passive.electionRetention;
    }

    if (passive.eventResilience) {
      updated._archetypeEventResilience = (updated._archetypeEventResilience ?? 0) + passive.eventResilience;
    }

    if (passive.freeInteractionGroups && passive.freeInteractionGroups.length > 0) {
      updated._archetypeFreeInteractions = [
        ...(updated._archetypeFreeInteractions ?? []),
        ...passive.freeInteractionGroups
      ];
    }

    // Sprint 5: Acumular shifts de ejes ideológicos
    if (passive.radicalConciliadorShift) {
      radicalConciliadorShift += passive.radicalConciliadorShift;
    }
    if (passive.populistaTecnicoShift) {
      populistaTecnicoShift += passive.populistaTecnicoShift;
    }
    if (passive.cerradoConvocanteShift) {
      cerradoConvocanteShift += passive.cerradoConvocanteShift;
    }
  }

  // Sprint 5: Aplicar shifts de ejes ideológicos (con clamp)
  updated.radicalConciliadorAxis = clampAxis(updated.radicalConciliadorAxis + radicalConciliadorShift);
  updated.populistaTecnicoAxis = clampAxis(updated.populistaTecnicoAxis + populistaTecnicoShift);
  updated.cerradoConvocanteAxis = clampAxis(updated.cerradoConvocanteAxis + cerradoConvocanteShift);

  return updated;
}

function clampAxis(value: number): number {
  return Math.min(100, Math.max(-100, value));
}

/**
 * Préstamos máximos permitidos: 3 base + préstamos extra por pasiva de arquetipo
 * (empresario "Red de contactos": +1, máx 4).
 *
 * TODO: el límite se aplica hoy con `Math.min(3, ...)` en turnProcessor.ts (y se
 * inicializa en gameEngine.ts), archivos fuera del alcance del task de pasivas.
 * Al integrar la pasiva, reemplazar el literal 3 por getMaxLoans(state).
 */
export function getMaxLoans(state: GameState): number {
  return 3 + (state._archetypeExtraLoans ?? 0);
}
