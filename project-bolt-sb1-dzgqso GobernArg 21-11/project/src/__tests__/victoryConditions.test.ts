import { describe, it, expect } from 'vitest';
import { updateObjectives } from '../utils/victoryConditions';
import type { GameState, Objective } from '../types/game';

function baseState(overrides: Partial<GameState> = {}): GameState {
  // Fixture presidente: el cargo es irrelevante para lo que se prueba
  // (los tests de umbrales por cargo sobreescriben `position` explícitamente).
  return {
    position: 'presidente',
    archetype: 'politico',
    popularity: 50,
    budget: 500,
    stability: 50,
    turn: 1,
    year: 1,
    term: 1,
    votingIntention: 50,
    groupRelations: {},
    advisors: [],
    ...overrides,
  } as GameState;
}

function makeObjective(requirements: Objective['requirements']): Objective {
  return {
    id: 'test-objective',
    title: 'Objetivo de prueba',
    description: '',
    requirements,
    reward: {},
    completed: false,
    progress: 0,
  };
}

describe('updateObjectives', () => {
  it('completa el objetivo por requisito de popularidad y calcula progress', () => {
    const state = baseState({ popularity: 80, objectives: [makeObjective({ popularity: 70 })] });
    const updated = updateObjectives(state);
    expect(updated.objectives[0].completed).toBe(true);
    expect(updated.objectives[0].progress).toBe(100); // 80/70 > 100 → clamp
  });

  it('no completa si no alcanza la popularidad y deja progress parcial', () => {
    const state = baseState({ popularity: 35, objectives: [makeObjective({ popularity: 70 })] });
    const updated = updateObjectives(state);
    expect(updated.objectives[0].completed).toBe(false);
    expect(updated.objectives[0].progress).toBe(50); // 35/70 = 50%
  });

  it('completa el objetivo por requisito de presupuesto', () => {
    const state = baseState({ budget: 2500, objectives: [makeObjective({ budget: 2000 })] });
    const updated = updateObjectives(state);
    expect(updated.objectives[0].completed).toBe(true);
  });

  it('completa el objetivo cuando todas las acciones requeridas fueron ejecutadas', () => {
    const state = baseState({
      completedActions: ['plan_viviendas', 'transporte_publico'],
      objectives: [makeObjective({ completedActions: ['plan_viviendas', 'transporte_publico'] })],
    });
    const updated = updateObjectives(state);
    expect(updated.objectives[0].completed).toBe(true);
    expect(updated.objectives[0].progress).toBe(100);
  });

  it('deja el objetivo incompleto cuando falta alguna acción', () => {
    const state = baseState({
      completedActions: ['plan_viviendas'],
      objectives: [makeObjective({ completedActions: ['plan_viviendas', 'transporte_publico'] })],
    });
    const updated = updateObjectives(state);
    expect(updated.objectives[0].completed).toBe(false);
    expect(updated.objectives[0].progress).toBe(50);
  });

  it('completa el objetivo por apoyo de grupos leyendo state.groupRelations', () => {
    const state = baseState({
      groupRelations: { empresarios: 80, sindicatos: 80, 'clase-media': 75 },
      objectives: [makeObjective({ groupSupport: { empresarios: 80, sindicatos: 80, 'clase-media': 75 } })],
    });
    const updated = updateObjectives(state);
    expect(updated.objectives[0].completed).toBe(true);
    expect(updated.objectives[0].progress).toBe(100);
  });

  it('no completa si algún grupo no alcanza el apoyo requerido', () => {
    const state = baseState({
      groupRelations: { empresarios: 80, sindicatos: 79, 'clase-media': 75 },
      objectives: [makeObjective({ groupSupport: { empresarios: 80, sindicatos: 80, 'clase-media': 75 } })],
    });
    const updated = updateObjectives(state);
    expect(updated.objectives[0].completed).toBe(false);
    expect(updated.objectives[0].progress).toBe(67); // 2 de 3 grupos
  });

  it('un grupo sin relación previa cuenta como apoyo 0', () => {
    const state = baseState({
      groupRelations: {},
      objectives: [makeObjective({ groupSupport: { empresarios: 80 } })],
    });
    const updated = updateObjectives(state);
    expect(updated.objectives[0].completed).toBe(false);
    expect(updated.objectives[0].progress).toBe(0);
  });

  it('no muta el estado original', () => {
    const state = baseState({ popularity: 80, objectives: [makeObjective({ popularity: 70 })] });
    const originalObjective = state.objectives[0];
    updateObjectives(state);
    expect(state.objectives[0]).toBe(originalObjective);
    expect(originalObjective.completed).toBe(false);
  });

  it('respeta objetivos ya completados sin recalcularlos', () => {
    const state = baseState({
      popularity: 10,
      objectives: [{ ...makeObjective({ popularity: 70 }), completed: true, progress: 100 }],
    });
    const updated = updateObjectives(state);
    expect(updated.objectives[0].completed).toBe(true);
    expect(updated.objectives[0].progress).toBe(100);
  });
});


describe('updateObjectives — objetivos con requisitos múltiples (AND)', () => {
  it('no completa si solo se cumple UN requisito de varios (popularidad sí, presupuesto no)', () => {
    const state = baseState({
      popularity: 80,
      budget: 500,
      objectives: [makeObjective({ popularity: 70, budget: 10000 })],
    });
    const updated = updateObjectives(state);
    expect(updated.objectives[0].completed).toBe(false);
    // progress = promedio de ambos requisitos (clamp solo al final):
    // 80/70 → 114 + 500/10000 → 5 → 119/2 = 59.6 → 60
    expect(updated.objectives[0].progress).toBe(60);
  });

  it('completa solo cuando se cumplen TODOS los requisitos', () => {
    const state = baseState({
      popularity: 80,
      budget: 10000,
      objectives: [makeObjective({ popularity: 70, budget: 10000 })],
    });
    const updated = updateObjectives(state);
    expect(updated.objectives[0].completed).toBe(true);
    expect(updated.objectives[0].progress).toBe(100);
  });

  it('popularidad + apoyo grupal: completa solo con ambos cumplidos', () => {
    const objective = makeObjective({ popularity: 70, groupSupport: { sindicatos: 60 } });
    const incomplete = baseState({
      popularity: 90,
      groupRelations: { sindicatos: 30 },
      objectives: [objective],
    });
    expect(updateObjectives(incomplete).objectives[0].completed).toBe(false);

    const complete = baseState({
      popularity: 90,
      groupRelations: { sindicatos: 60 },
      objectives: [objective],
    });
    expect(updateObjectives(complete).objectives[0].completed).toBe(true);
  });
});
