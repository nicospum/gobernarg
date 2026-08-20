import { describe, it, expect } from 'vitest';
import { getInitialGameState, hireAdvisors, useSpecialAbility } from '../engine/gameEngine';
import { availableAdvisors } from '../data/advisors';
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
