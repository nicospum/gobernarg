import { describe, it, expect } from 'vitest';
import { getInitialGameState, hireAdvisors, dismissAdvisor, useSpecialAbility, resolvePendingElection } from '../engine/gameEngine';
import { availableAdvisors } from '../data/advisors';
import { calculateAvailableActions } from '../utils/actionCalculator';
import { getPositionObjectives } from '../utils/victoryConditions';
import type { GameState } from '../types/game';

// getInitialGameState() devuelve un estado completo (arquetipo 'politico',
// popularidad 50, estabilidad 50, legitimidad 60) sin aleatoriedad.
function stateWith(overrides: Partial<GameState> = {}): GameState {
  return { ...getInitialGameState(), ...overrides };
}

describe('hireAdvisors', () => {
  it('descuenta el costo total y activa los asesores', () => {
    const state = stateWith({ budget: 1000, advisors: [], advisorActionUsed: false });
    const advisor = availableAdvisors[0]; // cost 300

    const result = hireAdvisors(state, [advisor]);

    expect(result.budget).toBe(700);
    expect(result.advisorActionUsed).toBe(true);
    expect(result.advisors).toHaveLength(1);
    expect(result.advisors[0].id).toBe(advisor.id);
    expect(result.advisors[0].isActive).toBe(true);
    expect(result.advisors[0].turnsInactive).toBe(0);
  });

  it('suma múltiples asesores con el costo acumulado', () => {
    const state = stateWith({ budget: 1000, advisors: [] });
    const result = hireAdvisors(state, [availableAdvisors[0], availableAdvisors[1]]);

    expect(result.budget).toBe(1000 - availableAdvisors[0].cost - availableAdvisors[1].cost);
    expect(result.advisors).toHaveLength(2);
  });

  it('bloquea la segunda contratación devolviendo la misma referencia', () => {
    const state = stateWith({ budget: 1000, advisorActionUsed: true, advisors: [] });
    const result = hireAdvisors(state, [availableAdvisors[0]]);

    expect(result).toBe(state);
    expect(result.advisors).toHaveLength(0);
  });

  it('rechaza sin presupuesto suficiente devolviendo la misma referencia', () => {
    const state = stateWith({ budget: 299, advisorActionUsed: false });
    const result = hireAdvisors(state, [availableAdvisors[0]]); // cost 300

    expect(result).toBe(state);
  });
});

describe('useSpecialAbility', () => {
  function abilityState(overrides: Partial<GameState> = {}): GameState {
    return stateWith({
      budget: 100,
      actions: 2,
      groupRelations: { aliados: 50, 'clase-media': 50 },
      abilityCooldowns: {},
      ...overrides,
    });
  }

  it('aplica efectos y costos, y setea el cooldown', () => {
    const state = abilityState();
    // discurso_patriotico: costo 30 presupuesto + 1 acción; efectos +12 pop, +5 estabilidad,
    // +8 legitimidad, +8 aliados, +5 clase-media; cooldown 4
    const result = useSpecialAbility(state, 'discurso_patriotico');

    expect(result).not.toBe(state);
    expect(result.popularity).toBe(62);
    expect(result.stability).toBe(55);
    expect(result.legitimacy).toBe(68);
    expect(result.groupRelations.aliados).toBe(58);
    expect(result.groupRelations['clase-media']).toBe(55);
    expect(result.budget).toBe(70);
    expect(result.actions).toBe(1);
    expect(result.abilityCooldowns['discurso_patriotico']).toBe(4);

    // el estado original no se modifica
    expect(state.budget).toBe(100);
    expect(state.popularity).toBe(50);
    expect(state.abilityCooldowns).toEqual({});
  });

  it('clampa popularidad y apoyo de grupos al rango 0-100', () => {
    const state = abilityState({ popularity: 95, groupRelations: { aliados: 95, 'clase-media': 50 } });
    const result = useSpecialAbility(state, 'discurso_patriotico');

    expect(result.popularity).toBe(100);
    expect(result.groupRelations.aliados).toBe(100);
  });

  it('aplica costo de popularidad y ganancia de presupuesto (empresario)', () => {
    const state = abilityState({ archetype: 'empresario', popularity: 50 });
    // inversion_privada: costo -3 popularidad + 1 acción; efectos +400 presupuesto, -3 estabilidad
    const result = useSpecialAbility(state, 'inversion_privada');

    expect(result.popularity).toBe(47);
    expect(result.budget).toBe(500);
    expect(result.stability).toBe(47);
    expect(result.abilityCooldowns['inversion_privada']).toBe(5);
  });

  it('rechaza sin acciones suficientes devolviendo la misma referencia', () => {
    const state = abilityState({ actions: 0 });
    expect(useSpecialAbility(state, 'discurso_patriotico')).toBe(state);
  });

  it('rechaza sin presupuesto devolviendo la misma referencia', () => {
    const state = abilityState({ budget: 29 }); // costo 30
    expect(useSpecialAbility(state, 'discurso_patriotico')).toBe(state);
  });

  it('rechaza con cooldown activo devolviendo la misma referencia', () => {
    const state = abilityState({ abilityCooldowns: { discurso_patriotico: 1 } });
    expect(useSpecialAbility(state, 'discurso_patriotico')).toBe(state);
  });

  it('rechaza habilidad inexistente devolviendo la misma referencia', () => {
    const state = abilityState();
    expect(useSpecialAbility(state, 'habilidad_inexistente')).toBe(state);
  });
});

// ===== Regresión: anti duplicación / máximo de asesores (Punto 13) =====

describe('hireAdvisors — anti duplicados y máximo', () => {
  function hiredAdvisor(index: number) {
    return { ...availableAdvisors[index], isActive: true, turnsInactive: 0 };
  }

  it('ignora asesores ya contratados (devuelve la misma referencia)', () => {
    const advisor = availableAdvisors[0];
    const state = stateWith({
      budget: 1000,
      advisorActionUsed: false,
      advisors: [hiredAdvisor(0)],
    });

    const result = hireAdvisors(state, [advisor]);

    expect(result).toBe(state);
    expect(result.advisors).toHaveLength(1);
  });

  it('con 1 slot libre contrata solo al primero y descuenta solo su costo', () => {
    const state = stateWith({
      budget: 2000,
      advisorActionUsed: false,
      advisors: [hiredAdvisor(0)],
    });

    const result = hireAdvisors(state, [availableAdvisors[1], availableAdvisors[2]]);

    expect(result.advisors).toHaveLength(2);
    expect(result.advisors[1].id).toBe(availableAdvisors[1].id);
    expect(result.budget).toBe(2000 - availableAdvisors[1].cost);
    expect(result.advisorActionUsed).toBe(true);
  });

  it('no-op cuando ya hay 2 asesores contratados', () => {
    const state = stateWith({
      budget: 2000,
      advisorActionUsed: false,
      advisors: [hiredAdvisor(0), hiredAdvisor(1)],
    });

    const result = hireAdvisors(state, [availableAdvisors[2]]);

    expect(result).toBe(state);
  });
});

// ===== Regresión: pasivas de arquetipo no duplicadas (Punto 13) =====

describe('getInitialGameState — pasivas de arquetipo', () => {
  it('no aplica las pasivas del arquetipo default: las aplica createNewGame una sola vez', () => {
    const state = getInitialGameState();
    // Si aplicara las pasivas de 'politico' (default): retención 0.10 y
    // shifts de ejes +2/+1. El estado base debe venir sin ellas.
    expect(state._archetypeElectionRetention ?? 0).toBe(0);
    expect(state.radicalConciliadorAxis).toBe(0);
    expect(state.cerradoConvocanteAxis).toBe(0);
  });
});

// ===== Regresión: anti doble-clic electoral (Punto 2) =====

describe('resolvePendingElection — anti doble-clic', () => {
  it('es no-op si ya hay resultados electorales (evita doble reset de mandato)', () => {
    const state = stateWith({
      pendingElection: true,
      electionResults: { victory: false, votesPercentage: 30 } as any,
    });

    const result = resolvePendingElection(state, 'reelection');

    expect(result).toBe(state);
  });

  it('es no-op si no hay elección pendiente', () => {
    const state = stateWith({ pendingElection: false });

    const result = resolvePendingElection(state, 'reelection');

    expect(result).toBe(state);
  });
});


// ===== Regresión: reset de historicalBudget al cambiar de mandato (Punto 14) =====

describe('reset de mandato — historicalBudget (Punto 14)', () => {
  it('al ganar la reelección, historicalBudget se resetea al presupuesto del nuevo mandato', () => {
    const state = stateWith({
      position: 'intendente',
      term: 1,
      popularity: 75,
      budget: 600,
      stability: 50,
      historicalPopularity: [75, 74, 76, 75], // promedio 75 → victoria clara
      historicalBudget: [500],
      groupRelations: { aliados: 50 },
      pendingElection: true,
      electionResults: null,
      turnLog: [],
      termsByPosition: { intendente: 0, gobernador: 0, presidente: 0 },
    });

    const result = resolvePendingElection(state, 'reelection');

    expect(result.electionResults?.victory).toBe(true);
    // Antes: historicalBudget quedaba [500, ...] de toda la carrera y el
    // budgetImpact se medía contra el arranque como intendente.
    expect(result.historicalBudget).toHaveLength(1);
    expect(result.historicalBudget[0]).toBe(result.budget);
  });
});


// ===== Regresión: hire/dismiss recalculan las acciones al instante (Punto 12) =====

describe('hireAdvisors / dismissAdvisor — recálculo inmediato (Punto 12)', () => {
  it('contratar suma las acciones extra del asesor sin esperar al próximo turno', () => {
    const state = stateWith({ budget: 1000, advisors: [], advisorActionUsed: false });
    const advisor = availableAdvisors[0]; // bonusActions: 2

    const result = hireAdvisors(state, [advisor]);

    // recalcState corre dentro de hireAdvisors: baseActions ya incluye el bono
    // del asesor (sin el fix, el bono no se veía hasta el próximo turno).
    const baseSinAsesor = calculateAvailableActions({ ...result, advisors: [], actions: 0, selectedActions: [] });
    expect(result.baseActions).toBe(baseSinAsesor + advisor.bonusActions);
    expect(result.actions).toBe(result.baseActions);
  });

  it('despedir quita el bono de acciones en el turno actual', () => {
    const advisor = { ...availableAdvisors[0], isActive: true, turnsInactive: 0 };
    const state = stateWith({ budget: 1000, advisors: [advisor], advisorActionUsed: false });

    const result = dismissAdvisor(state, advisor.id);

    // Sin el fix, el bono del asesor despedido se conservaba el turno actual.
    const baseSinAsesor = calculateAvailableActions({ ...result, actions: 0, selectedActions: [] });
    expect(result.baseActions).toBe(baseSinAsesor);
    expect(result.actions).toBe(result.baseActions);
  });
});


// ===== Regresión: tipo de milestone al ascender en el primer mandato (Punto 11) =====

describe('resolvePendingElection — tipo de milestone (Punto 11)', () => {
  // Estado con intención de voto alta para que cualquier opción gane.
  function winningState(overrides: Partial<GameState> = {}): GameState {
    const objectives = getPositionObjectives('intendente');
    return stateWith({
      position: 'intendente',
      term: 1,
      popularity: 90,
      budget: 600,
      stability: 100,
      historicalPopularity: [90, 90, 90, 90],
      historicalBudget: [500],
      groupRelations: { aliados: 100 },
      objectives,
      completedObjectives: objectives.map(o => ({ ...o, completed: true })),
      // 16 acciones en el mandato → activityImpact en el tope (100).
      turnLog: [
        {
          year: 4,
          turn: 4,
          position: 'intendente',
          term: 1,
          actionsTaken: Array(16).fill('plan_viviendas'),
          events: [],
          decisions: [],
          popularityChange: 0,
          budgetChange: 0,
          projectsCompleted: [],
          crisesFaced: [],
        },
      ],
      pendingElection: true,
      electionResults: null,
      termsByPosition: { intendente: 0, gobernador: 0, presidente: 0 },
      ...overrides,
    });
  }

  it('ascender en el primer mandato registra el milestone como promotion, no initial', () => {
    const state = winningState({
      careerHistory: [
        { position: 'intendente', term: 1, startYear: 1, endYear: 1, result: 'victory', type: 'initial', votesPercentage: 50 },
      ],
    });

    const result = resolvePendingElection(state, 'promote-governor');

    expect(result.electionResults?.victory).toBe(true);
    expect(result.position).toBe('gobernador');
    // Bug: `state.term === 1` pisaba el ascenso y dejaba 'initial';
    // el legacy text no contaba el salto intendente → gobernador.
    expect(result.careerHistory[0].type).toBe('promotion');
  });

  it('reelección en el primer mandato después de un ascenso es reelection, no initial', () => {
    const state = winningState({
      position: 'gobernador',
      careerHistory: [
        { position: 'intendente', term: 1, startYear: 1, endYear: 4, result: 'victory', type: 'initial', votesPercentage: 55 },
        { position: 'gobernador', term: 1, startYear: 1, endYear: 1, result: 'victory', type: 'promotion', votesPercentage: 56 },
      ],
    });

    const result = resolvePendingElection(state, 'reelection');

    expect(result.electionResults?.victory).toBe(true);
    // term === 1 pero no es el mandato inicial de la carrera: es reelección.
    expect(result.careerHistory[1].type).toBe('reelection');
  });
});
