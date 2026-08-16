import { describe, it, expect } from 'vitest';
import { calculateInteractionCost } from '../utils/interactionCosts';
import type { Subgroup, GameState } from '../types/game';

function makeGroup(influence: number): Subgroup {
  return {
    id: 'test_group',
    name: 'Grupo de prueba',
    description: '',
    influence,
    popularity: 50,
    interests: [],
    demands: [],
    icon: {} as Subgroup['icon'],
    baseSupport: 50,
    supportMultiplier: 1,
    resourceDemand: 0,
    satisfactionLevel: 50,
    lastInteractionEffect: 0,
    demandActionIds: [],
  };
}

function makeState(): GameState {
  return {} as GameState;
}

describe('calculateInteractionCost', () => {
  it('una reunión cuesta 10 sin importar la influencia del grupo', () => {
    expect(calculateInteractionCost('reunion', makeGroup(1), makeState())).toBe(10);
    expect(calculateInteractionCost('reunion', makeGroup(5), makeState())).toBe(10);
  });

  it('negociar cuesta 25 por punto de influencia', () => {
    expect(calculateInteractionCost('negociar', makeGroup(1), makeState())).toBe(25);
    expect(calculateInteractionCost('negociar', makeGroup(2), makeState())).toBe(50);
  });

  it('conceder cuesta 45 por punto de influencia', () => {
    expect(calculateInteractionCost('conceder', makeGroup(1), makeState())).toBe(45);
    expect(calculateInteractionCost('conceder', makeGroup(2), makeState())).toBe(90);
  });

  it('redondea el costo cuando la influencia no es entera', () => {
    expect(calculateInteractionCost('negociar', makeGroup(1.5), makeState())).toBe(38);
    expect(calculateInteractionCost('conceder', makeGroup(1.5), makeState())).toBe(68);
  });

  it('devuelve 0 para un tipo de interacción desconocido', () => {
    expect(calculateInteractionCost('inexistente' as any, makeGroup(3), makeState())).toBe(0);
  });
});
