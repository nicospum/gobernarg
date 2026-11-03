/**
 * Revisión de la interfaz de los escenarios históricos (Corralito 2001 e
 * Hiper 1989): metas con caja 0, avisos de derrota en la emergencia, flechas
 * del tablero sin cierres trimestrales, legado y etiqueta de la renuncia,
 * coherencia del guardado y textos de la economía dolarizada.
 */
import { describe, expect, it } from 'vitest';
import type { GameState, Objective } from '../types/game';
import { createNewGame, getInitialGameState } from '../engine/gameEngine';
import { processEmergencyRound } from '../engine/crisisProcessor';
import { getScenarioGoals, updateObjectives } from '../utils/victoryConditions';
import { defeatWarnings, simpleIndicators } from '../lib/simpleView';
import { validGameState } from '../lib/savegameValidation';
import { DEFEAT_LABEL } from '../lib/playtest';
import { generateLegacyText } from '../utils/careerLog';

const corralito = () => createNewGame({ archetype: 'politico', governorName: 'Ana', seed: 1, scenarioId: 'corralito' });
const hiper = () => createNewGame({ archetype: 'politico', governorName: 'Ana', seed: 1, scenarioId: 'pais_en_llamas' });
const clone = <T>(x: T): T => JSON.parse(JSON.stringify(x));

const goal = (requirements: Objective['requirements']): Objective =>
  ({ id: 'g', title: 'Meta', description: '', requirements, reward: {}, completed: false, progress: 0 });

describe('Metas con requisito de caja 0 (Pagos esenciales al día)', () => {
  it('con la caja en positivo la meta se cumple; en rojo, no', () => {
    const base = corralito();
    const ok = updateObjectives({ ...base, budget: 450, objectives: [goal({ budget: 0 })] });
    expect(ok.objectives[0].completed).toBe(true);
    expect(ok.objectives[0].progress).toBe(100);
    const red = updateObjectives({ ...base, budget: -10, objectives: [goal({ budget: 0 })] });
    expect(red.objectives[0].completed).toBe(false);
    expect(red.objectives[0].progress).toBe(0);
  });

  it('con un requisito positivo el avance se mide en porcentaje y se tope en 100', () => {
    const s = updateObjectives({ ...corralito(), budget: 5000, objectives: [goal({ budget: 1 })] });
    expect(s.objectives[0].completed).toBe(true);
    expect(s.objectives[0].progress).toBe(100);
    const half = updateObjectives({ ...corralito(), budget: 500, objectives: [goal({ budget: 1000 })] });
    expect(half.objectives[0].progress).toBe(50);
  });

  it('la meta de caja del Corralito trae budget: 0 y progresa en la partida', () => {
    const goals = getScenarioGoals('corralito')!;
    const caja = goals.find(g => g.id === 'meta_caja')!;
    expect(caja.requirements.budget).toBe(0);
    const g = corralito();
    const s = updateObjectives({ ...g, budget: Math.max(1, g.budget), objectives: goals });
    expect(s.objectives.find(o => o.id === 'meta_caja')!.completed).toBe(true);
  });
});

describe('Avisos de derrota en la emergencia (crisisStreak)', () => {
  it('Corralito: con la cuenta en marcha el aviso es rojo aunque los números de hoy no sean de derrota', () => {
    const g = corralito();
    g.causal.crisis!.crisisStreak = 1;
    g.causal.political.gob = 40;
    g.causal.hyperStreak = 0;
    g.causal.govCrisisStreak = 0;
    expect(defeatWarnings(g)).toEqual([expect.objectContaining({ id: 'resignation', critical: true })]);
    expect(defeatWarnings(g)[0].text).toBe('Sin gobernabilidad: otra semana así y el presidente renuncia.');
  });

  it('Hiper: con la cuenta en marcha y los precios acelerando, el aviso es rojo', () => {
    const g = hiper();
    g.causal.crisis!.crisisStreak = 1;
    g.causal.crisis!.aceleracion = 1;
    g.causal.base.INFL = 97;
    g.causal.political.gob = 40;
    expect(defeatWarnings(g)).toEqual([expect.objectContaining({ id: 'hyperinflation', critical: true })]);
    expect(defeatWarnings(g)[0].text).toBe('Los precios están en el techo y acelerando: otro mes así y el gobierno cae.');
  });

  it('Hiper: con la cuenta en marcha por gobernabilidad y los precios calmos, avisa la renuncia', () => {
    const g = hiper();
    g.causal.crisis!.crisisStreak = 1;
    g.causal.crisis!.aceleracion = -2;
    g.causal.base.INFL = 60;
    g.causal.political.gob = 10;
    expect(defeatWarnings(g)).toEqual([expect.objectContaining({ id: 'resignation', critical: true })]);
  });

  it('sin la cuenta en marcha y lejos del umbral no hay avisos', () => {
    const g = corralito();
    g.causal.crisis!.crisisStreak = 0;
    g.causal.political.gob = 60;
    expect(defeatWarnings(g)).toEqual([]);
  });
});

describe('Flechas del tablero durante la emergencia', () => {
  it('sin cierres trimestrales, la flecha sale del cierre de la última subronda', () => {
    const g = corralito();
    expect(g.causal.records).toHaveLength(0);
    expect(simpleIndicators(g).every(i => i.delta === null)).toBe(true);
    const before = { ...g.causal.base };
    const after = { ...before, EXTE: before.EXTE - 10 };
    g.causal.crisis!.log.push({ round: 1, label: 'Primera semana de diciembre', measure: null, lines: [], indicatorsBefore: before, indicatorsAfter: after, gobBefore: 40, gobAfter: 38, cajaBefore: 100, cajaAfter: 90 });
    const divisas = simpleIndicators(g).find(i => i.key === 'EXTE')!;
    expect(divisas.delta).toBeCloseTo(-10);
    expect(simpleIndicators(g).find(i => i.key === 'INFL')!.delta).toBe(0);
  });
});

describe('Cierre de subronda: aviso crítico con la cuenta en marcha', () => {
  it('si la subronda deja la cuenta de derrota en 1, la notificación del cierre es crítica', () => {
    const g = corralito();
    // Sin gobernabilidad posible: bono negativo sobre GOB durante toda la emergencia.
    g.causal.bonuses.push({ id: 'test_gob', target: 'GOB', value: -100, start: 0, end: 99, source: 'test', label: 'test' });
    const { state, summary } = processEmergencyRound(g);
    expect(state.gameOver).toBe(false);
    expect(state.causal.crisis!.crisisStreak).toBe(1);
    const closing = state.notifications.find(n => n.title.startsWith(summary.crisisRound!.label));
    expect(closing?.importance).toBe('critical');
  });

  it('con la cuenta en cero, la notificación del cierre es normal', () => {
    const g = corralito();
    g.causal.bonuses.push({ id: 'test_gob', target: 'GOB', value: 100, start: 0, end: 99, source: 'test', label: 'test' });
    const { state, summary } = processEmergencyRound(g);
    expect(state.causal.crisis!.crisisStreak).toBe(0);
    const closing = state.notifications.find(n => n.title.startsWith(summary.crisisRound!.label));
    expect(closing?.importance).toBe('medium');
  });
});

describe('Renuncia: etiqueta y legado', () => {
  it('el playtest la resume como "renuncia"', () => {
    expect(DEFEAT_LABEL.resignation).toBe('renuncia');
  });

  it('el legado no cae en el texto electoral', () => {
    const s: GameState = {
      ...getInitialGameState(),
      governorName: 'Ana',
      gameOver: true,
      victorious: false,
      defeatReason: 'resignation',
      careerHistory: [{ position: 'presidente', term: 1, startYear: 1, endYear: 1, result: 'defeat', type: 'initial', votesPercentage: 0 }],
    };
    const text = generateLegacyText(s);
    expect(text).toContain('Ana renunció a la presidencia en medio de la emergencia');
    expect(text).not.toContain('perdió las elecciones');
  });
});

describe('Guardado: coherencia de la crisis y del consultor', () => {
  it('acepta una partida válida del Corralito', () => {
    expect(validGameState(clone(corralito()))).toBe(true);
  });

  it('rechaza una emergencia en un escenario sin reglas nuevas', () => {
    const s = clone(corralito());
    s.causal.scenarioId = 'herencia_pesada';
    expect(validGameState(s)).toBe(false);
  });

  it('rechaza una crisis de otro tipo o con otra cantidad de subrondas', () => {
    const cross = clone(corralito());
    cross.causal.crisis!.kind = 'hiper';
    expect(validGameState(cross)).toBe(false);
    const rounds = clone(corralito());
    rounds.causal.crisis!.rounds = 4;
    expect(validGameState(rounds)).toBe(false);
  });

  it('rechaza medidas del consultor que no existen en el catálogo', () => {
    const consultant = { version: 1 as const, visits: [], bonusIv: 0, bonusUntil: 0, lockedPolicy: null, lockedTurn: null };
    const ok = clone(corralito());
    ok.causal.consultant = { ...consultant, lockedPolicy: 'reunion', lockedTurn: 1 };
    expect(validGameState(ok)).toBe(true);
    const locked = clone(corralito());
    locked.causal.consultant = { ...consultant, lockedPolicy: 'medida_inventada', lockedTurn: 1 };
    expect(validGameState(locked)).toBe(false);
    const visit = clone(corralito());
    visit.causal.consultant = { ...consultant, visits: [{ election: 'legislativas', timing: 'anticipado', turn: 1, mandateStart: 1, actor: null, policy: 'medida_inventada', fee: 0, choice: null, ivDelta: 0 }] };
    expect(validGameState(visit)).toBe(false);
  });
});
