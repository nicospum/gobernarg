import { describe, it, expect } from 'vitest';
import { updateGroupMoods, applyGroupSatisfactionPenalty } from '../engine/groupAgendaEngine';
import type { GameState, GroupMood, InterestGroup } from '../types/game';

function mood(groupId: string, ignoredTurns: number, initialMood: GroupMood['mood'] = 'neutral'): GroupMood {
  return { groupId, mood: initialMood, ignoredTurns, lastSatisfiedTurn: 0 };
}

function baseState(overrides: Partial<GameState> = {}): GameState {
  return {
    position: 'intendente',
    archetype: 'politico',
    popularity: 50,
    budget: 500,
    stability: 50,
    turn: 1,
    year: 1,
    term: 1,
    difficulty: 'normal',
    groupRelations: {},
    interactionHistory: {},
    groupMoods: [],
    groupAgendas: [],
    completedActions: [],
    interestGroups: [],
    advisors: [],
    pendingEffects: [],
    ...overrides,
  } as GameState;
}

function subgroupWithInfluence(id: string, influence: number): InterestGroup {
  return {
    id: `group-${id}`,
    name: `Grupo ${id}`,
    subgroups: [
      {
        id,
        name: id,
        description: '',
        influence,
        popularity: 50,
        interests: [],
        demands: [],
        icon: {} as any,
        baseSupport: 50,
        supportMultiplier: 1,
        resourceDemand: 0,
        satisfactionLevel: 0,
        lastInteractionEffect: 0,
        demandActionIds: [],
      },
    ],
  };
}

describe('updateGroupMoods', () => {
  it('soporte >= 70 → contento', () => {
    const state = baseState({
      groupRelations: { 'clase-media': 70 },
      groupMoods: [mood('clase-media', 0)],
    });
    expect(updateGroupMoods(state).groupMoods[0].mood).toBe('contento');
  });

  it('soporte 60 → neutral', () => {
    const state = baseState({
      groupRelations: { 'clase-media': 60 },
      groupMoods: [mood('clase-media', 0)],
    });
    expect(updateGroupMoods(state).groupMoods[0].mood).toBe('neutral');
  });

  it('soporte 40: con 3+ turnos ignorados → enojado', () => {
    const state = baseState({
      groupRelations: { 'clase-media': 40 },
      groupMoods: [mood('clase-media', 3)],
    });
    expect(updateGroupMoods(state).groupMoods[0].mood).toBe('enojado');
  });

  it('soporte 40: con pocos turnos ignorados → disconforme', () => {
    const state = baseState({
      groupRelations: { 'clase-media': 40 },
      groupMoods: [mood('clase-media', 1)],
    });
    expect(updateGroupMoods(state).groupMoods[0].mood).toBe('disconforme');
  });

  it('soporte 30: con 2+ turnos ignorados → radicalizado', () => {
    const state = baseState({
      groupRelations: { 'clase-media': 30 },
      groupMoods: [mood('clase-media', 2)],
    });
    expect(updateGroupMoods(state).groupMoods[0].mood).toBe('radicalizado');
  });

  it('soporte 30: sin turnos ignorados previos → enojado (boundary)', () => {
    // el mood se evalúa con ignoredTurns ya incrementado (1): 1 < 2 → enojado
    const state = baseState({
      groupRelations: { 'clase-media': 30 },
      groupMoods: [mood('clase-media', 0)],
    });
    expect(updateGroupMoods(state).groupMoods[0].mood).toBe('enojado');
  });

  it('incrementa ignoredTurns sin interacción y lo resetea si la hubo', () => {
    const sinInteraccion = baseState({
      groupRelations: { 'clase-media': 60 },
      groupMoods: [mood('clase-media', 2)],
    });
    expect(updateGroupMoods(sinInteraccion).groupMoods[0].ignoredTurns).toBe(3);

    const conInteraccion = baseState({
      groupRelations: { 'clase-media': 60 },
      interactionHistory: { 'clase-media': { lastInteraction: 'reunion', turnsLeft: 1 } },
      groupMoods: [mood('clase-media', 2)],
    });
    expect(updateGroupMoods(conInteraccion).groupMoods[0].ignoredTurns).toBe(0);
  });

  it('sin relación registrada usa soporte 50 por defecto (neutral)', () => {
    const state = baseState({
      groupRelations: {},
      groupMoods: [mood('clase-media', 0)],
    });
    expect(updateGroupMoods(state).groupMoods[0].mood).toBe('neutral');
  });

  it('no muta el estado original', () => {
    const state = baseState({
      groupRelations: { 'clase-media': 30 },
      groupMoods: [mood('clase-media', 1)],
    });
    const originalMood = state.groupMoods[0];

    updateGroupMoods(state);

    expect(state.groupMoods[0]).toBe(originalMood);
    expect(originalMood.mood).toBe('neutral');
    expect(originalMood.ignoredTurns).toBe(1);
  });
});

describe('applyGroupSatisfactionPenalty', () => {
  // turno global = (año - 1) * 4 + turno → year 1, turn 2 = 2

  it('demanda vencida cumplida: +10 apoyo y se marca como satisfecha', () => {
    const state = baseState({
      turn: 2,
      groupRelations: { sindicatos: 55 },
      completedActions: ['reforma_laboral'],
      groupAgendas: [
        { id: 'a1', groupId: 'sindicatos', demand: 'reforma_laboral', deadline: 2, satisfied: false, penaltyApplied: false },
      ],
    });

    const result = applyGroupSatisfactionPenalty(state);

    expect(result.groupRelations.sindicatos).toBe(65);
    expect(result.groupAgendas[0].satisfied).toBe(true);
    expect(result.groupAgendas[0].penaltyApplied).toBe(true);
  });

  it('demanda vencida no cumplida: resta la influencia del grupo', () => {
    const state = baseState({
      turn: 2,
      groupRelations: { sindicatos: 55 },
      completedActions: [],
      interestGroups: [subgroupWithInfluence('sindicatos', 8)],
      groupAgendas: [
        { id: 'a1', groupId: 'sindicatos', demand: 'reforma_laboral', deadline: 2, satisfied: false, penaltyApplied: false },
      ],
    });

    const result = applyGroupSatisfactionPenalty(state);

    expect(result.groupRelations.sindicatos).toBe(47);
    expect(result.groupAgendas[0].satisfied).toBe(false);
    expect(result.groupAgendas[0].penaltyApplied).toBe(true);
  });

  it('sin datos del grupo usa influencia por defecto 5', () => {
    const state = baseState({
      turn: 2,
      groupRelations: { sindicatos: 55 },
      completedActions: [],
      groupAgendas: [
        { id: 'a1', groupId: 'sindicatos', demand: 'reforma_laboral', deadline: 2, satisfied: false, penaltyApplied: false },
      ],
    });

    const result = applyGroupSatisfactionPenalty(state);

    expect(result.groupRelations.sindicatos).toBe(50);
  });

  it('demanda no vencida: no aplica penalidad', () => {
    const state = baseState({
      turn: 2,
      groupRelations: { sindicatos: 55 },
      completedActions: [],
      groupAgendas: [
        { id: 'a1', groupId: 'sindicatos', demand: 'reforma_laboral', deadline: 3, satisfied: false, penaltyApplied: false },
      ],
    });

    const result = applyGroupSatisfactionPenalty(state);

    expect(result.groupRelations.sindicatos).toBe(55);
    expect(result.groupAgendas[0].penaltyApplied).toBe(false);
  });

  it('no muta el estado original', () => {
    const state = baseState({
      turn: 2,
      groupRelations: { sindicatos: 55 },
      completedActions: [],
      groupAgendas: [
        { id: 'a1', groupId: 'sindicatos', demand: 'reforma_laboral', deadline: 2, satisfied: false, penaltyApplied: false },
      ],
    });
    const originalAgenda = state.groupAgendas[0];

    applyGroupSatisfactionPenalty(state);

    expect(state.groupAgendas[0]).toBe(originalAgenda);
    expect(state.groupRelations.sindicatos).toBe(55);
  });
});
