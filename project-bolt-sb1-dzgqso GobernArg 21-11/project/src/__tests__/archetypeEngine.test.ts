import { describe, it, expect } from 'vitest';
import { applyArchetypePassives } from '../engine/archetypeEngine';
import { computePerks } from '../engine/causalBridge';
import { getInitialGameState } from '../engine/gameEngine';
import type { Archetype, GameState } from '../types/game';

function baseState(archetype: Archetype): GameState {
  return {
    ...getInitialGameState(),
    archetype,
    radicalConciliadorAxis: 0,
    populistaTecnicoAxis: 0,
    cerradoConvocanteAxis: 0,
  };
}

describe('applyArchetypePassives — perfil de gestión', () => {
  it('político: hacia conciliador y convocante', () => {
    const result = applyArchetypePassives(baseState('politico'));
    expect(result.radicalConciliadorAxis).toBe(2);
    expect(result.cerradoConvocanteAxis).toBe(1);
    expect(result.populistaTecnicoAxis).toBe(0);
  });

  it('empresario: hacia técnico y cerrado', () => {
    const result = applyArchetypePassives(baseState('empresario'));
    expect(result.populistaTecnicoAxis).toBe(2);
    expect(result.cerradoConvocanteAxis).toBe(-1);
    expect(result.radicalConciliadorAxis).toBe(0);
  });

  it('sindicalista: hacia radical y populista', () => {
    const result = applyArchetypePassives(baseState('sindicalista'));
    expect(result.radicalConciliadorAxis).toBe(-2);
    expect(result.populistaTecnicoAxis).toBe(-2);
    expect(result.cerradoConvocanteAxis).toBe(0);
  });

  it('comunicador: hacia convocante', () => {
    const result = applyArchetypePassives(baseState('comunicador'));
    expect(result.cerradoConvocanteAxis).toBe(2);
    expect(result.radicalConciliadorAxis).toBe(0);
    expect(result.populistaTecnicoAxis).toBe(0);
  });

  it('no toca los puntos de acción', () => {
    const state = { ...baseState('sindicalista'), baseActions: 4, actions: 4 };
    const result = applyArchetypePassives(state);
    expect(result.baseActions).toBe(4);
    expect(result.actions).toBe(4);
  });
});

describe('pasivas de arquetipo en el motor (computePerks)', () => {
  it('político: más estructura electoral y reuniones gratis con aliados', () => {
    const p = computePerks('politico');
    expect(p.structureMult).toBeCloseTo(1.2);
    expect(p.freeMeetingActors).toEqual(['aliados']);
  });

  it('empresario: préstamos en mejores condiciones', () => {
    expect(computePerks('empresario').loanDiscount).toBeCloseTo(0.1);
  });

  it('sindicalista: reuniones gratis con sindicatos y organizaciones sociales, y una extra por turno', () => {
    const p = computePerks('sindicalista');
    expect(p.freeMeetingActors).toEqual(['sindicatos', 'org_sociales']);
    expect(p.freeMeetingsPerTurn).toBeGreaterThanOrEqual(1);
  });

  it('comunicador: resiliencia ante eventos y encuestas gratis', () => {
    const p = computePerks('comunicador');
    expect(p.eventResilience).toBeCloseTo(0.3);
    expect(p.freePolls).toBe(true);
  });
});
