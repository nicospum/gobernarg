import { describe, it, expect } from 'vitest';
import { applyAxisShift, getAxisModifiers } from '../engine/axisEngine';
import type { GameAction, GameState } from '../types/game';

function makeAction(category: GameAction['category'] = 'economia'): GameAction {
  return {
    id: 'test_action',
    title: 'Acción de prueba',
    description: 'Acción usada para tests de ejes',
    icon: {} as GameAction['icon'],
    category,
    popularityChange: 0,
    budgetChange: 0,
    requirements: { minBudget: 0 },
  };
}

function makeAxisState(
  overrides: Partial<
    Pick<GameState, 'radicalConciliadorAxis' | 'populistaTecnicoAxis' | 'cerradoConvocanteAxis'>
  > = {}
): GameState {
  return {
    radicalConciliadorAxis: 0,
    populistaTecnicoAxis: 0,
    cerradoConvocanteAxis: 0,
    ...overrides,
  } as GameState;
}

describe('applyAxisShift', () => {
  it('economía sube populistaTecnico +2 y baja cerradoConvocante -1', () => {
    const state = applyAxisShift(makeAction('economia'), makeAxisState());

    expect(state.populistaTecnicoAxis).toBe(2);
    expect(state.cerradoConvocanteAxis).toBe(-1);
    expect(state.radicalConciliadorAxis).toBe(0);
  });

  it('diplomacia aplica +2 radicalConciliador, 0 populistaTecnico y +3 cerradoConvocante', () => {
    const state = applyAxisShift(makeAction('diplomacia'), makeAxisState());

    expect(state.radicalConciliadorAxis).toBe(2);
    expect(state.populistaTecnicoAxis).toBe(0);
    expect(state.cerradoConvocanteAxis).toBe(3);
  });

  it('clampa radicalConciliador en +100', () => {
    const state = applyAxisShift(
      makeAction('diplomacia'),
      makeAxisState({ radicalConciliadorAxis: 99 })
    );

    expect(state.radicalConciliadorAxis).toBe(100);
  });

  it('clampa cerradoConvocante en -100', () => {
    const state = applyAxisShift(
      makeAction('seguridad'),
      makeAxisState({ cerradoConvocanteAxis: -99 })
    );

    expect(state.cerradoConvocanteAxis).toBe(-100);
  });

  it('categoría desconocida no modifica los ejes', () => {
    const state = applyAxisShift(
      makeAction('inexistente' as unknown as GameAction['category']),
      makeAxisState()
    );

    expect(state.radicalConciliadorAxis).toBe(0);
    expect(state.populistaTecnicoAxis).toBe(0);
    expect(state.cerradoConvocanteAxis).toBe(0);
  });
});

describe('getAxisModifiers', () => {
  it('en ejes neutros no devuelve modificadores', () => {
    const mods = getAxisModifiers({
      radicalConciliadorAxis: 0,
      populistaTecnicoAxis: 0,
      cerradoConvocanteAxis: 0,
    });

    expect(mods).toEqual({});
  });

  it('radicalConciliador +80 descuenta cultura/diplomacia y encarece seguridad', () => {
    const mods = getAxisModifiers({
      radicalConciliadorAxis: 80,
      populistaTecnicoAxis: 0,
      cerradoConvocanteAxis: 0,
    });

    expect(mods.actionCostModifier).toEqual({ cultura: -1, diplomacia: -1, seguridad: 1 });
  });

  it('radicalConciliador -80 multiplica seguridad y debilita diplomacia', () => {
    const mods = getAxisModifiers({
      radicalConciliadorAxis: -80,
      populistaTecnicoAxis: 0,
      cerradoConvocanteAxis: 0,
    });

    expect(mods.effectivenessMultiplier).toEqual({ seguridad: 1.10, diplomacia: 0.85 });
  });

  it('populistaTecnico +80 multiplica economía y debilita social', () => {
    const mods = getAxisModifiers({
      radicalConciliadorAxis: 0,
      populistaTecnicoAxis: 80,
      cerradoConvocanteAxis: 0,
    });

    expect(mods.effectivenessMultiplier).toEqual({ economia: 1.20, social: 0.90 });
  });

  it('populistaTecnico -80 descuenta y multiplica social', () => {
    const mods = getAxisModifiers({
      radicalConciliadorAxis: 0,
      populistaTecnicoAxis: -80,
      cerradoConvocanteAxis: 0,
    });

    expect(mods.actionCostModifier).toEqual({ social: -1 });
    expect(mods.effectivenessMultiplier).toEqual({ social: 1.20 });
  });

  it('cerradoConvocante +80 mejora relaciones y reduce estabilidad', () => {
    const mods = getAxisModifiers({
      radicalConciliadorAxis: 0,
      populistaTecnicoAxis: 0,
      cerradoConvocanteAxis: 80,
    });

    expect(mods.groupRelationsModifier).toBe(10);
    expect(mods.stabilityModifier).toBe(-5);
  });

  it('cerradoConvocante -80 sube estabilidad y perjudica relaciones', () => {
    const mods = getAxisModifiers({
      radicalConciliadorAxis: 0,
      populistaTecnicoAxis: 0,
      cerradoConvocanteAxis: -80,
    });

    expect(mods.stabilityModifier).toBe(5);
    expect(mods.groupRelationsModifier).toBe(-10);
  });
});
