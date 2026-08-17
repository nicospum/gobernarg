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
});
