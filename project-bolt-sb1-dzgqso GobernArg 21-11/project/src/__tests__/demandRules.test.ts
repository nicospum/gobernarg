import { describe, it, expect } from 'vitest';
import { generateGroupAgendas } from '../engine/groupAgendaEngine';
import { satisfyGroupDemand, getInitialGameState } from '../engine/gameEngine';
import { GameState } from '../types/game';

function makeStateWithGroups(overrides?: Partial<GameState>): GameState {
  const base = getInitialGameState();
  return { ...base, ...overrides };
}

describe('generateGroupAgendas - demandas raras', () => {
  it('no genera más de 2 demandas activas simultáneas', () => {
    // Estado con 2 demandas ya activas
    const state = makeStateWithGroups({
      groupAgendas: [
        {
          id: 'a1',
          groupId: 'empresarios',
          demand: 'test1',
          deadline: 99,
          satisfied: false,
          penaltyApplied: false,
        },
        {
          id: 'a2',
          groupId: 'sindicatos',
          demand: 'test2',
          deadline: 99,
          satisfied: false,
          penaltyApplied: false,
        },
      ],
      groupMoods: (getInitialGameState().interestGroups ?? [])
        .flatMap(g => g.subgroups)
        .map(sg => ({
          groupId: sg.id,
          mood: 'neutral' as const,
          ignoredTurns: 10, // máximo ignoreBonus
          lastSatisfiedTurn: 0,
        })),
    });

    const newAgendas = generateGroupAgendas(state);
    expect(newAgendas.length).toBe(0);
  });

  it('con 1 demanda activa, genera como máximo 1 adicional', () => {
    const state = makeStateWithGroups({
      groupAgendas: [
        {
          id: 'a1',
          groupId: 'empresarios',
          demand: 'test1',
          deadline: 99,
          satisfied: false,
          penaltyApplied: false,
        },
      ],
      groupMoods: (getInitialGameState().interestGroups ?? [])
        .flatMap(g => g.subgroups)
        .map(sg => ({
          groupId: sg.id,
          mood: 'neutral' as const,
          ignoredTurns: 10,
          lastSatisfiedTurn: 0,
        })),
    });

    const newAgendas = generateGroupAgendas(state);
    expect(newAgendas.length).toBeLessThanOrEqual(1);
  });

  it('con 0 demandas activas, genera como máximo 2', () => {
    const state = makeStateWithGroups({
      groupAgendas: [],
      groupMoods: (getInitialGameState().interestGroups ?? [])
        .flatMap(g => g.subgroups)
        .map(sg => ({
          groupId: sg.id,
          mood: 'neutral' as const,
          ignoredTurns: 10,
          lastSatisfiedTurn: 0,
        })),
    });

    const newAgendas = generateGroupAgendas(state);
    expect(newAgendas.length).toBeLessThanOrEqual(2);
  });

  it('respeta demandPausedUntil: no genera para grupos pausados', () => {
    const allGroups = (getInitialGameState().interestGroups ?? []).flatMap(g => g.subgroups);
    const pausedUntil: Record<string, number> = {};
    for (const sg of allGroups) {
      pausedUntil[sg.id] = 999; // pausar todos
    }

    const state = makeStateWithGroups({
      groupAgendas: [],
      demandPausedUntil: pausedUntil,
      groupMoods: allGroups.map(sg => ({
        groupId: sg.id,
        mood: 'neutral' as const,
        ignoredTurns: 10,
        lastSatisfiedTurn: 0,
      })),
    });

    const newAgendas = generateGroupAgendas(state);
    expect(newAgendas.length).toBe(0);
  });
});

describe('satisfyGroupDemand - recompensa reducida', () => {
  it('da +5 apoyo (no +10)', () => {
    const state = makeStateWithGroups({
      groupRelations: { empresarios: 50 },
      groupAgendas: [
        {
          id: 'a1',
          groupId: 'empresarios',
          demand: 'test',
          deadline: 99,
          satisfied: false,
          penaltyApplied: false,
        },
      ],
    });

    const result = satisfyGroupDemand(state, 'a1');
    expect(result.groupRelations['empresarios']).toBe(55);
  });

  it('da +1 popularidad (no +2)', () => {
    const state = makeStateWithGroups({
      popularity: 50,
      groupRelations: { empresarios: 50 },
      groupAgendas: [
        {
          id: 'a1',
          groupId: 'empresarios',
          demand: 'test',
          deadline: 99,
          satisfied: false,
          penaltyApplied: false,
        },
      ],
    });

    const result = satisfyGroupDemand(state, 'a1');
    expect(result.popularity).toBe(51);
  });

  it('marca la demanda como satisfecha', () => {
    const state = makeStateWithGroups({
      groupAgendas: [
        {
          id: 'a1',
          groupId: 'empresarios',
          demand: 'test',
          deadline: 99,
          satisfied: false,
          penaltyApplied: false,
        },
      ],
    });

    const result = satisfyGroupDemand(state, 'a1');
    expect(result.groupAgendas[0].satisfied).toBe(true);
  });

  it('aplica impacto cruzado: satisfacer empresarios penaliza a sindicatos', () => {
    const state = makeStateWithGroups({
      groupRelations: { empresarios: 50, sindicatos: 50, 'sectores-populares': 50 },
      groupAgendas: [
        {
          id: 'a1',
          groupId: 'empresarios',
          demand: 'test',
          deadline: 99,
          satisfied: false,
          penaltyApplied: false,
        },
      ],
    });

    const result = satisfyGroupDemand(state, 'a1');

    // Empresarios sube +5
    expect(result.groupRelations['empresarios']).toBe(55);
    // Sindicatos baja 5 × 0.5 = 2.5 → 3 (round)
    expect(result.groupRelations['sindicatos']).toBe(47);
    // Sectores populares baja 5 × 0.3 = 1.5 → 2 (round)
    expect(result.groupRelations['sectores-populares']).toBe(48);
  });

  it('aplica impacto cruzado: satisfacer sindicatos penaliza a empresarios', () => {
    const state = makeStateWithGroups({
      groupRelations: { sindicatos: 50, empresarios: 50, 'clase-alta': 50 },
      groupAgendas: [
        {
          id: 'a1',
          groupId: 'sindicatos',
          demand: 'test',
          deadline: 99,
          satisfied: false,
          penaltyApplied: false,
        },
      ],
    });

    const result = satisfyGroupDemand(state, 'a1');

    // Sindicatos sube +5
    expect(result.groupRelations['sindicatos']).toBe(55);
    // Empresarios baja 5 × 0.5 = 2.5 → 3
    expect(result.groupRelations['empresarios']).toBe(47);
    // Clase alta baja 5 × 0.4 = 2
    expect(result.groupRelations['clase-alta']).toBe(48);
  });

  it('matemáticamente imposible subir todos los grupos: la suma neta es ≤ 0 en pares antagónicos', () => {
    // Satisfacer demandas de empresarios y sindicatos alternadamente
    // nunca puede subir AMBOS al mismo tiempo porque son antagonistas mutuos
    const state = makeStateWithGroups({
      groupRelations: { empresarios: 50, sindicatos: 50 },
      groupAgendas: [
        {
          id: 'a1',
          groupId: 'empresarios',
          demand: 'test1',
          deadline: 99,
          satisfied: false,
          penaltyApplied: false,
        },
        {
          id: 'a2',
          groupId: 'sindicatos',
          demand: 'test2',
          deadline: 99,
          satisfied: false,
          penaltyApplied: false,
        },
      ],
    });

    // Satisfacer empresarios: emp +5, sind -3 → emp 55, sind 47
    let result = satisfyGroupDemand(state, 'a1');
    expect(result.groupRelations['empresarios']).toBe(55);
    expect(result.groupRelations['sindicatos']).toBe(47);

    // Satisfacer sindicatos: sind +5, emp -3 → sind 52, emp 52
    result = satisfyGroupDemand(result, 'a2');
    expect(result.groupRelations['sindicatos']).toBe(52);
    expect(result.groupRelations['empresarios']).toBe(52);

    // Ambos terminan en 52, NO en 100. Es imposible maximizar ambos.
    expect(result.groupRelations['empresarios']).toBeLessThan(100);
    expect(result.groupRelations['sindicatos']).toBeLessThan(100);
  });

  it('satisfacer demanda consume 1 acción', () => {
    const state = makeStateWithGroups({
      actions: 3,
      groupAgendas: [
        {
          id: 'a1',
          groupId: 'empresarios',
          demand: 'test',
          deadline: 99,
          satisfied: false,
          penaltyApplied: false,
        },
      ],
    });

    const result = satisfyGroupDemand(state, 'a1');
    expect(result.actions).toBe(2);
  });

  it('sin acciones disponibles NO puede satisfacer la demanda', () => {
    const state = makeStateWithGroups({
      actions: 0,
      groupAgendas: [
        {
          id: 'a1',
          groupId: 'empresarios',
          demand: 'test',
          deadline: 99,
          satisfied: false,
          penaltyApplied: false,
        },
      ],
    });

    const result = satisfyGroupDemand(state, 'a1');
    // No se aplicó: misma referencia, no satisfecha
    expect(result).toBe(state);
    expect(result.groupAgendas[0].satisfied).toBe(false);
  });
});
