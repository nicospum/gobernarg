import { describe, it, expect } from 'vitest';
import { applyArchetypePassives } from '../engine/archetypeEngine';
import { getInitialGameState } from '../engine/gameEngine';
import type { Archetype, GameState } from '../types/game';

function baseState(archetype: Archetype): GameState {
  const state = getInitialGameState();
  return {
    ...state,
    archetype,
    baseActions: 5,
    actions: 5,
    radicalConciliadorAxis: 0,
    populistaTecnicoAxis: 0,
    cerradoConvocanteAxis: 0,
    _archetypeIncomeBonus: 0,
    _archetypeExtraLoans: 0,
    _archetypeElectionRetention: 0,
    _archetypeEventResilience: 0,
    _archetypeFreeInteractions: [],
  };
}

describe('applyArchetypePassives - político', () => {
  it('otorga retención electoral y reuniones gratis con aliados', () => {
    const result = applyArchetypePassives(baseState('politico'));

    expect(result._archetypeElectionRetention).toBeCloseTo(0.10);
    expect(result._archetypeFreeInteractions).toEqual(['aliados']);
  });

  it('desplaza el eje hacia conciliador y convocante', () => {
    const result = applyArchetypePassives(baseState('politico'));

    expect(result.radicalConciliadorAxis).toBe(2);
    expect(result.cerradoConvocanteAxis).toBe(1);
    expect(result.populistaTecnicoAxis).toBe(0);
  });

  it('no genera bonus de ingresos ni préstamos extra', () => {
    const result = applyArchetypePassives(baseState('politico'));

    expect(result._archetypeIncomeBonus).toBe(0);
    expect(result._archetypeExtraLoans).toBe(0);
  });
});

describe('applyArchetypePassives - empresario', () => {
  it('otorga bonus de ingresos y un préstamo extra', () => {
    const result = applyArchetypePassives(baseState('empresario'));

    expect(result._archetypeIncomeBonus).toBeCloseTo(0.20);
    expect(result._archetypeExtraLoans).toBe(1);
  });

  it('desplaza el eje hacia técnico y cerrado', () => {
    const result = applyArchetypePassives(baseState('empresario'));

    expect(result.populistaTecnicoAxis).toBe(2);
    expect(result.cerradoConvocanteAxis).toBe(-1);
    expect(result.radicalConciliadorAxis).toBe(0);
  });

  it('no otorga acciones extra', () => {
    const result = applyArchetypePassives(baseState('empresario'));

    expect(result.baseActions).toBe(5);
    expect(result.actions).toBe(5);
  });
});

describe('applyArchetypePassives - sindicalista', () => {
  it('otorga reuniones gratis con sindicatos y sectores populares', () => {
    const result = applyArchetypePassives(baseState('sindicalista'));

    expect(result._archetypeFreeInteractions).toEqual([
      'sindicatos',
      'sectores-populares'
    ]);
  });

  it('otorga una acción base extra', () => {
    const result = applyArchetypePassives(baseState('sindicalista'));

    expect(result.baseActions).toBe(6);
    expect(result.actions).toBe(6);
  });

  it('desplaza el eje hacia radical y populista', () => {
    const result = applyArchetypePassives(baseState('sindicalista'));

    expect(result.radicalConciliadorAxis).toBe(-2);
    expect(result.populistaTecnicoAxis).toBe(-2);
    expect(result.cerradoConvocanteAxis).toBe(0);
  });
});

describe('applyArchetypePassives - comunicador', () => {
  it('otorga resiliencia ante eventos negativos', () => {
    const result = applyArchetypePassives(baseState('comunicador'));

    expect(result._archetypeEventResilience).toBeCloseTo(0.30);
  });

  it('desplaza el eje hacia convocante', () => {
    const result = applyArchetypePassives(baseState('comunicador'));

    expect(result.cerradoConvocanteAxis).toBe(2);
    expect(result.radicalConciliadorAxis).toBe(0);
    expect(result.populistaTecnicoAxis).toBe(0);
  });

  it('no otorga acciones extra ni bonus de ingresos', () => {
    const result = applyArchetypePassives(baseState('comunicador'));

    expect(result.baseActions).toBe(5);
    expect(result.actions).toBe(5);
    expect(result._archetypeIncomeBonus).toBe(0);
  });
});
