import { describe, it, expect } from 'vitest';
import { processEndTurn } from '../engine/turnProcessor';
import { getInitialGameState } from '../engine/gameEngine';
import type { GameState, Position } from '../types/game';

function baseState(position: Position): GameState {
  return {
    ...getInitialGameState(),
    position,
  };
}

describe('POPULARITY_DECAY por cargo', () => {
  it('intendente desgasta 5 puntos de popularidad por turno', () => {
    const result = processEndTurn(baseState('intendente'));

    expect(result.summary.popularityChange).toBe(-5);
  });

  it('gobernador desgasta 7 puntos de popularidad por turno', () => {
    const result = processEndTurn(baseState('gobernador'));

    expect(result.summary.popularityChange).toBe(-7);
  });

  it('presidente desgasta 10 puntos de popularidad por turno', () => {
    const result = processEndTurn(baseState('presidente'));

    expect(result.summary.popularityChange).toBe(-10);
  });
});

describe('creación del TurnLogEntry', () => {
  it('registra un entry con los campos requeridos', () => {
    const result = processEndTurn(baseState('intendente'));
    const entry = result.state.turnLog[result.state.turnLog.length - 1];

    expect(entry).toBeDefined();
    expect(entry).toHaveProperty('year');
    expect(entry).toHaveProperty('turn');
    expect(entry).toHaveProperty('position');
    expect(entry).toHaveProperty('actionsTaken');
    expect(entry).toHaveProperty('events');
    expect(entry).toHaveProperty('popularityChange');
    expect(entry).toHaveProperty('budgetChange');
  });

  it('registra year, turn y position del turno procesado', () => {
    const result = processEndTurn(baseState('gobernador'));
    const entry = result.state.turnLog[result.state.turnLog.length - 1];

    expect(entry.year).toBe(1);
    expect(entry.turn).toBe(1);
    expect(entry.position).toBe('gobernador');
  });

  it('registra actionsTaken y events como arrays', () => {
    const result = processEndTurn(baseState('intendente'));
    const entry = result.state.turnLog[result.state.turnLog.length - 1];

    expect(Array.isArray(entry.actionsTaken)).toBe(true);
    expect(Array.isArray(entry.events)).toBe(true);
  });

  it('registra popularityChange y budgetChange coherentes para intendente', () => {
    const result = processEndTurn(baseState('intendente'));
    const entry = result.state.turnLog[result.state.turnLog.length - 1];

    expect(entry.popularityChange).toBe(-5);
    // Ingreso 200 - mantenimiento 120 = +80
    expect(entry.budgetChange).toBe(80);
  });
});
