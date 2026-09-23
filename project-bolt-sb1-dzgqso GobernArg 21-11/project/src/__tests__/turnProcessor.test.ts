import { afterEach, describe, it, expect, vi } from 'vitest';
import { processEndTurn } from '../engine/turnProcessor';
import { getInitialGameState } from '../engine/gameEngine';
import { actionCategories } from '../data/actionCategories';
import { actionDefinitions } from '../data/actionRegistry';
import { interestGroups } from '../data/interestGroups';
import { calculateActionEffects } from '../utils/actionEffects';
import type { GameState, Position } from '../types/game';

function baseState(position: Position): GameState {
  return {
    ...getInitialGameState(),
    position,
  };
}

afterEach(() => {
  vi.restoreAllMocks();
});

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
    // Fixture presidente: el cargo es irrelevante para lo que se prueba
    // (el MVP es presidente-only; el cargo solo importa en los tests de decay).
    const result = processEndTurn(baseState('presidente'));
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
    // Fixture presidente: el cargo es irrelevante para lo que se prueba.
    const result = processEndTurn(baseState('presidente'));
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


// ===== Regresión: completedObjectives no se muta (Punto 9) =====

describe('completedObjectives — anti mutación', () => {
  it('processEndTurn no muta completedObjectives del estado original', () => {
    // Fixture presidente: el cargo es irrelevante para lo que se prueba.
    const state = baseState('presidente');
    state.objectives = [
      {
        id: 'obj-test',
        title: 'Objetivo de prueba',
        description: '',
        requirements: { popularity: 1 },
        reward: { budget: 100 },
        completed: false,
        progress: 0,
      } as any,
    ];
    state.popularity = 80; // cumple el requisito → se otorga la recompensa

    const before = state.completedObjectives;
    const result = processEndTurn(state);

    // El nuevo estado registra el objetivo completado...
    expect(result.state.completedObjectives.some(o => o.id === 'obj-test')).toBe(true);
    // ...pero el estado original (prev de React) queda intacto
    expect(state.completedObjectives).toBe(before);
    expect(state.completedObjectives.some(o => o.id === 'obj-test')).toBe(false);
  });
});


// ===== Regresión: advertencias de emisión monetaria (Punto 10) =====

describe('advertencias de emisión monetaria (Punto 10)', () => {
  it('a las 3 emisiones avisa riesgo inflacionario (importance high)', () => {
    const state = { ...baseState('presidente'), moneyPrintingCount: 3 };

    const result = processEndTurn(state);

    const warning = result.state.notifications.find(n => n.title === 'Riesgo inflacionario');
    expect(warning).toBeDefined();
    expect(warning!.importance).toBe('high');
  });

  it('a las 5 emisiones avisa riesgo de hiperinflación (importance critical)', () => {
    const state = { ...baseState('presidente'), moneyPrintingCount: 5 };

    const result = processEndTurn(state);

    const warning = result.state.notifications.find(n => n.title === 'Riesgo de hiperinflación');
    expect(warning).toBeDefined();
    expect(warning!.importance).toBe('critical');
    expect(warning!.message).toContain('7 emisiones');
  });

  it('emitir_dinero tiene cooldown 3: la derrota por hiperinflación ahora es alcanzable', () => {
    const action = actionCategories
      .flatMap(c => c.actions)
      .find(a => a.id === 'emitir_dinero')!;

    expect(action.cooldown).toBe(3);
  });
});


// ===== Regresión: advertencia de popularidad alineada a la regla real (Punto 10) =====

describe('advertencia de popularidad crítica (Punto 10)', () => {
  it('usa el umbral del cargo (gobernador: 25) y avisa "Dos turnos consecutivos"', () => {
    // random = 0.999 → sin eventos aleatorios ni agendas: corrida determinística.
    vi.spyOn(Math, 'random').mockReturnValue(0.999);

    // Relaciones en 0 → la popularidad recalculada queda igual a la política.
    // 28 - 7 (desgaste de gobernador) = 21: bajo el umbral 25 de gobernador
    // pero NO bajo el 20 fijo que usaba el aviso viejo — la advertencia debe
    // aparecer igual, con el texto de la regla real (2 turnos, no 3).
    const zeroRelations = Object.fromEntries(
      interestGroups.flatMap(g => g.subgroups).map(sg => [sg.id, 0])
    );
    const state = { ...baseState('gobernador'), popularity: 28, groupRelations: zeroRelations };

    const result = processEndTurn(state);

    expect(result.state.popularity).toBe(21);
    const warning = result.state.notifications.find(n => n.title === 'Popularidad crítica');
    expect(warning).toBeDefined();
    // LOW_POPULARITY_TURNS = 2 (victoryConditions.ts); el texto viejo decía "Tres".
    expect(warning!.message).toContain('Dos turnos consecutivos');
    expect(warning!.importance).toBe('critical');
  });
});


// ===== Regresión: penalización a antagonistas alineada al cálculo canónico (Punto 13) =====

describe('antagonistas — alineados a calculateActionEffects (Punto 13)', () => {
  it('la penalización al antagonista usa el groupEffects canónico aunque la acción ya se haya usado', () => {
    // random = 0.999 → sin eventos aleatorios y sin agendas nuevas que
    // modifiquen relaciones: corrida determinística.
    vi.spyOn(Math, 'random').mockReturnValue(0.999);

    // plan_viviendas: explicitGroupEffects → sectores-populares +12.
    // Antagonistas de sectores-populares (groupAntagonists.ts):
    // empresarios ×0.5, clase-alta ×0.4.
    const action = actionDefinitions.find(a => a.id === 'plan_viviendas')!;
    const state = baseState('presidente');
    state.selectedActions = ['plan_viviendas'];
    // Segundo uso: el contador YA arranca incrementado. La pasada vieja del
    // paso 1.5 recalculaba los efectos con este contador incrementado de
    // nuevo (doble pasada), descontando ~20-25% de más a los antagonistas.
    state.actionUsageCount = { plan_viviendas: 1 };
    state.groupRelations = {
      ...state.groupRelations,
      'sectores-populares': 50,
      empresarios: 50,
      'clase-alta': 50,
    };

    // Valor canónico: lo que calculateActionEffects calcula para ESTE estado
    // (el mismo cálculo que ve el jugador en el tooltip, pre-turno).
    const canonicalGain = calculateActionEffects(action, state)
      .immediateEffects.groupEffects
      .find(ge => ge.groupId === 'sectores-populares')!.supportChange;

    const result = processEndTurn(state);

    // Apoyo ganado y penalización a antagonistas derivan del efecto canónico
    // del paso 1 (una sola pasada), sin reducción extra por uso repetido.
    expect(result.state.groupRelations['sectores-populares']).toBeCloseTo(50 + canonicalGain, 5);
    expect(result.state.groupRelations['empresarios']).toBeCloseTo(50 - Math.round(canonicalGain * 0.5), 5);
    expect(result.state.groupRelations['clase-alta']).toBeCloseTo(50 - Math.round(canonicalGain * 0.4), 5);
  });
});
