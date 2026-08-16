import { describe, it, expect } from 'vitest';
import {
  POSITION_INCOME,
  POSITION_MAINTENANCE,
  POSITION_STARTING_BUDGET
} from '../engine/engineShared';

describe('POSITION_INCOME', () => {
  it('define el ingreso por turno para cada cargo', () => {
    expect(POSITION_INCOME.intendente).toBe(200);
    expect(POSITION_INCOME.gobernador).toBe(350);
    expect(POSITION_INCOME.presidente).toBe(500);
  });

  it('cubre exactamente los tres cargos del juego', () => {
    expect(Object.keys(POSITION_INCOME).sort()).toEqual([
      'gobernador',
      'intendente',
      'presidente'
    ]);
  });

  it('mantiene valores positivos y crecientes por jerarquía', () => {
    expect(POSITION_INCOME.intendente).toBeGreaterThan(0);
    expect(POSITION_INCOME.gobernador).toBeGreaterThan(POSITION_INCOME.intendente);
    expect(POSITION_INCOME.presidente).toBeGreaterThan(POSITION_INCOME.gobernador);
  });
});

describe('POSITION_MAINTENANCE', () => {
  it('define el gasto fijo por turno para cada cargo', () => {
    expect(POSITION_MAINTENANCE.intendente).toBe(120);
    expect(POSITION_MAINTENANCE.gobernador).toBe(200);
    expect(POSITION_MAINTENANCE.presidente).toBe(350);
  });

  it('cubre exactamente los tres cargos del juego', () => {
    expect(Object.keys(POSITION_MAINTENANCE).sort()).toEqual([
      'gobernador',
      'intendente',
      'presidente'
    ]);
  });

  it('mantiene el gasto fijo por debajo del ingreso correspondiente', () => {
    expect(POSITION_MAINTENANCE.intendente).toBeLessThan(POSITION_INCOME.intendente);
    expect(POSITION_MAINTENANCE.gobernador).toBeLessThan(POSITION_INCOME.gobernador);
    expect(POSITION_MAINTENANCE.presidente).toBeLessThan(POSITION_INCOME.presidente);
  });
});

describe('POSITION_STARTING_BUDGET', () => {
  it('define el presupuesto inicial para cada cargo', () => {
    expect(POSITION_STARTING_BUDGET.intendente).toBe(800);
    expect(POSITION_STARTING_BUDGET.gobernador).toBe(2000);
    expect(POSITION_STARTING_BUDGET.presidente).toBe(3500);
  });

  it('cubre exactamente los tres cargos del juego', () => {
    expect(Object.keys(POSITION_STARTING_BUDGET).sort()).toEqual([
      'gobernador',
      'intendente',
      'presidente'
    ]);
  });

  it('mantiene presupuestos iniciales crecientes por jerarquía', () => {
    expect(POSITION_STARTING_BUDGET.intendente).toBeGreaterThan(0);
    expect(POSITION_STARTING_BUDGET.gobernador).toBeGreaterThan(POSITION_STARTING_BUDGET.intendente);
    expect(POSITION_STARTING_BUDGET.presidente).toBeGreaterThan(POSITION_STARTING_BUDGET.gobernador);
  });
});
