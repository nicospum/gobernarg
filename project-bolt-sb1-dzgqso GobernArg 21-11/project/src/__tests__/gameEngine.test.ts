import { describe, it, expect } from 'vitest';
import { getInitialGameState, hireAdvisors, dismissAdvisor, useSpecialAbility, resolvePendingElection } from '../engine/gameEngine';
import { availableAdvisors, ADVISOR_ROLES } from '../data/advisors';
import { getPositionObjectives } from '../utils/victoryConditions';
import type { GameState } from '../types/game';

// getInitialGameState() devuelve un estado completo (arquetipo 'politico') sin
// aleatoriedad, con el motor causal inicializado con semilla fija.
// `budget` se traduce a la caja del motor (fuente de verdad).
function stateWith(overrides: Partial<GameState> = {}): GameState {
  const base = getInitialGameState();
  const causal = structuredClone(base.causal);
  if (overrides.budget !== undefined) causal.caja = overrides.budget;
  return { ...base, ...overrides, causal };
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

describe('useSpecialAbility (efectos en el motor causal)', () => {
  function abilityState(overrides: Partial<GameState> = {}): GameState {
    return stateWith({ budget: 100, actions: 2, abilityCooldowns: {}, ...overrides });
  }

  it('aplica efectos y costos, y setea el cooldown', () => {
    const state = abilityState();
    // discurso_patriotico: caja 30 + 1 acción; imagen +6, conflictividad −3 (2t),
    // relación oficialismo +4 y aliados +4; cooldown 4.
    const result = useSpecialAbility(state, 'discurso_patriotico');

    expect(result).not.toBe(state);
    expect(result.causal.political.imagen).toBeCloseTo(state.causal.political.imagen + 6, 5);
    expect(result.causal.actors.aliados.rel).toBe(state.causal.actors.aliados.rel! + 4);
    expect(result.causal.actors.oficialismo.rel).toBe(Math.min(100, state.causal.actors.oficialismo.rel! + 4));
    expect(result.causal.bonuses.some(b => b.target === 'CONF' && b.value === -3)).toBe(true);
    expect(result.budget).toBe(70);
    expect(result.actions).toBe(1);
    expect(result.abilityCooldowns['discurso_patriotico']).toBe(4);
    // La intención de voto sube por la imagen (OTROS), no por indicadores.
    expect(result.causal.political.iv).toBeGreaterThan(state.causal.political.iv);

    // el estado original no se modifica
    expect(state.budget).toBe(100);
    expect(state.abilityCooldowns).toEqual({});
  });

  it('clampa la imagen y la relación al rango 0-100', () => {
    const state = abilityState();
    state.causal.political.imagen = 98;
    state.causal.actors.aliados.rel = 99;
    const result = useSpecialAbility(state, 'discurso_patriotico');

    expect(result.causal.political.imagen).toBe(100);
    expect(result.causal.actors.aliados.rel).toBe(100);
  });

  it('empresario: resigna imagen y moviliza inversión y caja', () => {
    const state = abilityState({ archetype: 'empresario' });
    const result = useSpecialAbility(state, 'inversion_privada');

    expect(result.causal.political.imagen).toBeCloseTo(state.causal.political.imagen - 2, 5);
    expect(result.budget).toBe(300);
    expect(result.causal.base.INVC).toBe(state.causal.base.INVC + 4);
    expect(result.abilityCooldowns['inversion_privada']).toBe(5);
  });

  it('rechaza sin acciones suficientes devolviendo la misma referencia', () => {
    const state = abilityState({ actions: 0 });
    expect(useSpecialAbility(state, 'discurso_patriotico')).toBe(state);
  });

  it('rechaza sin caja devolviendo la misma referencia', () => {
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


// ===== Decisión de diseño: país continuo entre mandatos =====

describe('reelección con país continuo', () => {
  it('al ganar la reelección no se reinician caja, deuda, indicadores ni asesores', () => {
    const state = stateWith({ pendingElection: true, electionResults: null });
    state.causal.political.iv = 70;
    state.causal.turn = 17;
    state.causal.caja = 321;
    state.causal.deuda = 4500;
    state.causal.base.INFL = 77;
    state.advisors = [{ ...availableAdvisors[0], isActive: true, turnsInactive: 0 }];

    const result = resolvePendingElection(state, 'reelection');

    expect(result.electionResults?.victory).toBe(true);
    expect(result.term).toBe(2);
    expect(result.year).toBe(1);
    expect(result.causal.caja).toBe(321);
    expect(result.causal.deuda).toBe(4500);
    expect(result.causal.base.INFL).toBe(77);
    expect(result.advisors).toHaveLength(1);
    // Nueva luna de miel legislativa: el mandato empieza en el turno actual.
    expect(result.causal.mandateStart).toBe(17);
  });
});


// ===== Asesores: rol en el motor causal (antes: +acciones por turno) =====

describe('hireAdvisors / dismissAdvisor — rol del asesor en el motor', () => {
  it('contratar suma el sueldo al gasto corriente y aplica el rol (eficacia y descuento de PA)', () => {
    const state = stateWith({ budget: 1000, advisors: [], advisorActionUsed: false });
    const advisor = availableAdvisors[0]; // economista

    const result = hireAdvisors(state, [advisor]);

    expect(result.causal.gastoCorr).toBe(state.causal.gastoCorr + ADVISOR_ROLES[advisor.id].salary);
    expect(result.causal.perks.categoryEfficacy['Economía y moneda']).toBeCloseTo(1.2, 5);
    expect(result.causal.perks.paDiscountCategories).toContain('Impuestos');
    // Ya no suma puntos de acción.
    expect(result.actions).toBe(state.actions);
  });

  it('despedir quita el sueldo y el rol en el turno actual', () => {
    const advisor = { ...availableAdvisors[0], isActive: true, turnsInactive: 0 };
    const hired = hireAdvisors(stateWith({ budget: 1000, advisors: [], advisorActionUsed: false }), [advisor]);
    const state = { ...hired, advisorActionUsed: false };

    const result = dismissAdvisor(state, advisor.id);

    expect(result.causal.gastoCorr).toBe(state.causal.gastoCorr - ADVISOR_ROLES[advisor.id].salary);
    expect(result.causal.perks.categoryEfficacy['Economía y moneda']).toBeUndefined();
  });
});


// ===== Regresión: tipo de milestone al ascender en el primer mandato (Punto 11) =====

describe('resolvePendingElection — tipo de milestone (Punto 11)', () => {
  // Estado con intención de voto alta para que cualquier opción gane.
  function winningState(overrides: Partial<GameState> = {}): GameState {
    const objectives = getPositionObjectives('intendente');
    const s = stateWith({
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
    // La elección se decide con la intención de voto del motor causal.
    s.causal.political.iv = 90;
    return s;
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
