import { afterEach, describe, it, expect, vi } from 'vitest';
import { calculateActionEffects, getDefaultCooldown, processPendingEffects } from '../utils/actionEffects';
import { actionCategories } from '../data/actionCategories';
import type { GameState, GameAction } from '../types/game';

function makeAction(overrides: Partial<GameAction> = {}): GameAction {
  return {
    id: 'test_action',
    title: 'Test Action',
    description: 'Una acción de prueba',
    icon: {} as any,
    category: 'economia',
    popularityChange: 10,
    budgetChange: -100,
    requirements: { minBudget: 0 },
    ...overrides,
  };
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
    advisors: [],
    actionUsageCount: {},
    actionCooldowns: {},
    pendingEffects: [],
    interestGroups: [],
    groupRelations: {},
    unlockedActions: ['test_action'],
    completedActions: [],
    midtermStrategy: null,
    ...overrides,
  } as GameState;
}

describe('calculateActionEffects', () => {
  it('calcula efectos básicos para una acción de economía', () => {
    const action = makeAction({ category: 'economia', popularityChange: 10, budgetChange: -100 });
    const state = baseState({ archetype: 'politico' });

    const result = calculateActionEffects(action, state);

    expect(result.immediateEffects.budgetChange).toBeLessThan(0);
    expect(result.immediateEffects.popularityChange).toBeGreaterThan(0);
    // 10 * 1.0 archetype * 1.0 advisor * 0.40 factor * 1.0 diminishing
    expect(result.immediateEffects.popularityChange).toBeCloseTo(4, 0);
  });

  it('aplica multiplicador de arquetipo empresario para economía', () => {
    const action = makeAction({ category: 'economia', popularityChange: 10, budgetChange: -100 });
    const state = baseState({ archetype: 'empresario' });

    const result = calculateActionEffects(action, state);

    // empresario: economía × 1.3
    expect(result.immediateEffects.popularityChange).toBeCloseTo(10 * 1.3 * 0.40, 0);
  });

  it('aplica rendimiento decreciente tras usos repetidos', () => {
    const action = makeAction({
      category: 'economia',
      popularityChange: 10,
      budgetChange: -100,
      diminishingFactor: 0.80
    });
    const state = baseState({
      actionUsageCount: { test_action: 3 },
    });

    const result = calculateActionEffects(action, state);

    // diminishing: 0.80^3 = 0.512
    const expectedPopularity = 10 * 1.0 * 0.40 * 0.512;
    expect(result.immediateEffects.popularityChange).toBeCloseTo(expectedPopularity, 1);
  });

  it('invierte popularidad positiva cuando se usa 5+ veces', () => {
    const action = makeAction({
      category: 'social',
      popularityChange: 5,
      budgetChange: -50,
      diminishingFactor: 0.80
    });
    const state = baseState({
      archetype: 'sindicalista',
      actionUsageCount: { test_action: 5 },
    });

    const result = calculateActionEffects(action, state);

    // popularidad se vuelve negativa
    expect(result.immediateEffects.popularityChange).toBeLessThan(0);
  });
});

describe('getDefaultCooldown', () => {
  it('préstamos y emisión monetaria → cooldown 8', () => {
    expect(getDefaultCooldown(makeAction({ isLoan: true, budgetChange: -100 }))).toBe(8);
    expect(getDefaultCooldown(makeAction({ id: 'emitir_dinero', budgetChange: 100 }))).toBe(8);
  });

  it('|presupuesto| >= 600 → cooldown 6', () => {
    expect(getDefaultCooldown(makeAction({ budgetChange: -600 }))).toBe(6);
    expect(getDefaultCooldown(makeAction({ budgetChange: 600 }))).toBe(6);
  });

  it('|presupuesto| >= 200 → cooldown 3', () => {
    expect(getDefaultCooldown(makeAction({ budgetChange: -200 }))).toBe(3);
    expect(getDefaultCooldown(makeAction({ budgetChange: 500 }))).toBe(3); // 500 no supera 500
  });

  it('|presupuesto| < 200 → cooldown 1', () => {
    expect(getDefaultCooldown(makeAction({ budgetChange: -199 }))).toBe(1);
    expect(getDefaultCooldown(makeAction({ budgetChange: 0 }))).toBe(1);
  });

  it('el cooldown explícito tiene prioridad', () => {
    expect(getDefaultCooldown(makeAction({ cooldown: 5, budgetChange: -1000 }))).toBe(5);
  });
});

describe('processPendingEffects', () => {
  // turno global = (año - 1) * 4 + turno → year 1, turn 1 = 1

  it('aplica budget/popularity/stability de efectos activos y elimina los one-shot aplicados', () => {
    const state = baseState({
      budget: 500,
      popularity: 50,
      stability: 50,
      pendingEffects: [
        { id: 'e1', activationTurn: 1, budgetChange: 100, popularityChange: 20, stabilityChange: 10 },
        { id: 'e2', activationTurn: 5, budgetChange: -50 },                    // futuro: se conserva
        { id: 'e3', activationTurn: 1, duration: 3, incomeModifier: 0.1 },     // duración vigente: se conserva
        { id: 'e4', activationTurn: 0, duration: 1, budgetChange: 999 },       // expirado: no se aplica pero se conserva
      ],
    });

    const result = processPendingEffects(state);

    expect(result.budget).toBe(600); // e4 (999) no se aplica
    expect(result.popularity).toBe(70);
    expect(result.stability).toBe(60);
    // Solo se remueven los one-shot activados; futuros, vigentes y expirados se conservan
    expect(result.pendingEffects.map(e => e.id)).toEqual(['e2', 'e3', 'e4']);
  });

  it('clampa popularidad y estabilidad entre 0 y 100', () => {
    const state = baseState({
      popularity: 95,
      stability: 5,
      pendingEffects: [
        { id: 'up', activationTurn: 1, popularityChange: 20 },
        { id: 'down', activationTurn: 1, stabilityChange: -10 },
      ],
    });

    const result = processPendingEffects(state);

    expect(result.popularity).toBe(100);
    expect(result.stability).toBe(0);
  });

  it('no muta el estado original', () => {
    const state = baseState({
      budget: 500,
      pendingEffects: [{ id: 'e1', activationTurn: 1, budgetChange: 100 }],
    });

    processPendingEffects(state);

    expect(state.budget).toBe(500);
    expect(state.popularity).toBe(50);
    expect(state.pendingEffects).toHaveLength(1);
  });

  it('sin efectos activos ni expirados devuelve el mismo estado', () => {
    const state = baseState({ pendingEffects: [{ id: 'futuro', activationTurn: 10, budgetChange: 1 }] });
    expect(processPendingEffects(state)).toBe(state);
  });
});

describe('calculateActionEffects - mantenimiento diferido', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('acciones con |costo| >= 200 generan mantenimiento (-15% costo, delay 2-4 turnos)', () => {
    const action = makeAction({ budgetChange: -300, popularityChange: 10 });
    const state = baseState({ year: 1, turn: 1 }); // turno global 1

    vi.spyOn(Math, 'random').mockReturnValue(0); // delay = 2 + 0
    const early = calculateActionEffects(action, state);
    const maintenanceEarly = early.pendingEffects.find(e => e.id.includes('maintenance'));
    expect(maintenanceEarly).toBeDefined();
    expect(maintenanceEarly!.activationTurn).toBe(3); // 1 + 2
    expect(maintenanceEarly!.budgetChange).toBe(-45); // 15% de 300
    expect(maintenanceEarly!.popularityChange).toBe(-2);

    vi.spyOn(Math, 'random').mockReturnValue(0.999); // delay = 2 + floor(2.997) = 4
    const late = calculateActionEffects(action, state);
    const maintenanceLate = late.pendingEffects.find(e => e.id.includes('maintenance'));
    expect(maintenanceLate).toBeDefined();
    expect(maintenanceLate!.activationTurn).toBe(5); // 1 + 4
  });

  it('acciones con |costo| < 200 no generan mantenimiento', () => {
    const action = makeAction({ budgetChange: -100 });
    const state = baseState({ year: 1, turn: 1 });
    vi.spyOn(Math, 'random').mockReturnValue(0);

    const result = calculateActionEffects(action, state);

    expect(result.pendingEffects.some(e => e.id.includes('maintenance'))).toBe(false);
  });
});


// ===== Regresión: explicitGroupEffects como fuente de verdad (Punto 6) =====

describe('explicitGroupEffects (Punto 6 — Etapa 1)', () => {
  it('si la acción declara explicitGroupEffects, el matcher textual NO se usa', () => {
    // Descripción con "apoyo": antes matcheaba al grupo deportistas en frío
    const action = makeAction({
      description: 'Apoyo económico al sector industrial',
      popularityChange: 10,
      explicitGroupEffects: [
        { groupId: 'empresarios', supportChange: 8 },
        { groupId: 'sindicatos', supportChange: 8 },
        { groupId: 'sector-financiero', supportChange: -9 },
        { groupId: 'ongs', supportChange: -6 }
      ]
    });
    const state = baseState({
      interestGroups: [
        { id: 'g1', subgroups: [{ id: 'deportistas', interests: ['apoyo'], influence: 6 }] }
      ] as any
    });

    const effects = calculateActionEffects(action, state);

    expect(effects.immediateEffects.groupEffects).toEqual([
      { groupId: 'empresarios', supportChange: 8 },
      { groupId: 'sindicatos', supportChange: 8 },
      { groupId: 'sector-financiero', supportChange: -9 },
      { groupId: 'ongs', supportChange: -6 }
    ]);
  });

  it('sin explicitGroupEffects el matcher textual sigue como fallback', () => {
    const action = makeAction({ description: 'Mejorar la seguridad pública', popularityChange: 20 });
    const state = baseState({
      interestGroups: [
        { id: 'g1', subgroups: [{ id: 'clase-media', interests: ['seguridad'], influence: 7 }] }
      ] as any
    });

    const effects = calculateActionEffects(action, state);

    expect(effects.immediateEffects.groupEffects).toEqual([
      { groupId: 'clase-media', supportChange: 14 }
    ]);
  });

  it('subsidios_industriales real: grupos declarados, cero deportistas', () => {
    const action = actionCategories
      .flatMap(c => c.actions)
      .find(a => a.id === 'subsidios_industriales')!;

    const effects = calculateActionEffects(action, baseState());

    const ids = effects.immediateEffects.groupEffects.map(g => g.groupId);
    expect(ids).toEqual(['empresarios', 'sindicatos', 'sector-financiero', 'ongs']);
    expect(ids).not.toContain('deportistas');
  });

  it('tercera_edad real: sus 3 grupos declarados, cero deportistas', () => {
    const action = actionCategories
      .flatMap(c => c.actions)
      .find(a => a.id === 'tercera_edad')!;

    const effects = calculateActionEffects(action, baseState());

    expect(effects.immediateEffects.groupEffects).toEqual([
      { groupId: 'sectores-populares', supportChange: 9 },
      { groupId: 'clase-media', supportChange: 10.5 },
      { groupId: 'ongs', supportChange: 9 }
    ]);
  });
});
