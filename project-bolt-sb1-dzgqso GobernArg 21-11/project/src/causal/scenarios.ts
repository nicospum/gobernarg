import { BALANCE } from './catalog';
import type { Difficulty } from './campaignTypes';
import type { ActorId, CausalState, IndicatorId } from './types';

/**
 * Escenarios de partida (traídos de la versión A, sep-2026). Como en
 * Civilization, se elige con qué país arrancás: cambian los indicadores
 * iniciales, la caja, la deuda y algunas relaciones; las reglas son las mismas.
 *
 * Tres niveles abren un escenario cada uno (Fácil, Normal y "Argentina").
 * Los escenarios históricos se desbloquean ganando reelecciones; en la Lite
 * están ocultos detrás de LITE_FEATURES.escenariosHistoricos (lite/config.ts).
 */
export type ScenarioDifficulty = 'Exploración' | 'Normal' | 'Difícil' | 'Muy difícil';

export interface ScenarioDef {
  id: string;
  name: string;
  era: string;
  difficulty: ScenarioDifficulty;
  description: string;
  highlights: string[];
  /** Imagen existente (IMAGES.backgrounds / IMAGES.events). */
  image: { group: 'backgrounds' | 'events'; key: string };
  /** Exigencia del escenario (recaudación, eventos, elecciones). En la Lite la fija el escenario elegido. */
  suggestedDifficulty: Difficulty;
  indicators?: Partial<Record<IndicatorId, number>>;
  cash?: number;
  /** Deuda heredada: préstamos externos al 4% por turno, como los del juego. */
  loans?: { principal: number; dueTurn: number }[];
  relationships?: Partial<Record<ActorId, number>>;
  /** Ingreso extra por turno durante un período (p. ej. precios de exportación altos). */
  revenueBoost?: { amount: number; turns: number; label: string };
  /** Reelecciones ganadas (en cualquier escenario) que hacen falta para jugarlo. 0 = disponible desde el inicio. */
  reelectionsToUnlock: number;
}

export const SCENARIOS: ScenarioDef[] = [
  {
    id: 'pais_en_calma',
    name: 'País en calma',
    era: 'Modo exploración',
    difficulty: 'Exploración',
    description: 'Un país ordenado: sin deuda, precios estables y cuentas en superávit. Ideal para aprender cómo se encadenan las decisiones sin que todo se prenda fuego.',
    highlights: ['Sin deuda y con caja holgada', 'Precios estables', 'Actores de buen humor'],
    image: { group: 'backgrounds', key: 'casaRosadaMorning' },
    suggestedDifficulty: 'easy',
    indicators: { inflacion: 28, actividad: 54, ingreso_real: 52, credito: 52, fiscal: 66, externo: 56, infraestructura: 50, educacion: 52, salud: 52, proteccion: 50, seguridad: 50, ciencia: 45, derechos: 58, ambiente: 55 },
    cash: 1600,
    reelectionsToUnlock: 0,
  },
  {
    id: 'viento_de_cola',
    name: 'Viento de cola',
    era: '2003: el boom de la soja',
    difficulty: 'Normal',
    description: 'Salís de una crisis enorme, pero el mundo paga caro lo que el país exporta. Sobran dólares y la recaudación rinde; el desempleo y la pobreza siguen altos. Fácil de empezar, fácil de dilapidar.',
    highlights: ['Exportaciones y recaudación en alza los primeros 12 turnos', 'Desempleo y pobreza todavía altos', 'Si gastás todo en el boom, el final duele'],
    image: { group: 'backgrounds', key: 'mapArgentina' },
    suggestedDifficulty: 'normal',
    indicators: { inflacion: 42, actividad: 44, ingreso_real: 38, credito: 42, fiscal: 54, externo: 70, proteccion: 38, seguridad: 42, derechos: 50 },
    cash: 1300,
    loans: [{ principal: 1500, dueTurn: 20 }],
    revenueBoost: { amount: 60, turns: 12, label: 'Precios de exportación altos' },
    reelectionsToUnlock: 0,
  },
  {
    id: 'herencia_pesada',
    name: 'Herencia pesada',
    era: 'Los traspasos de 2015, 2019 y 2023',
    difficulty: 'Difícil',
    description: 'El país que recibís arrastra inflación alta, pocos dólares y deuda. Exige ordenar sin romper.',
    highlights: ['Inflación alta', 'Deuda de $1.500 M: la mitad vence en el turno 12', 'Caja justa: cada gasto se nota'],
    image: { group: 'backgrounds', key: 'presidentialOffice' },
    suggestedDifficulty: 'hard',
    indicators: { inflacion: 58, actividad: 46, ingreso_real: 40, credito: 40, fiscal: 46, externo: 36, proteccion: 42, seguridad: 42, ciencia: 38, derechos: 52 },
    cash: 900,
    loans: [{ principal: 750, dueTurn: 12 }, { principal: 750, dueTurn: 24 }],
    reelectionsToUnlock: 0,
  },
  {
    id: 'corralito',
    name: 'Corralito',
    era: 'Diciembre de 2001',
    difficulty: 'Difícil',
    description: 'Los depósitos están atrapados, el país está en default y la calle se llenó de cacerolas. No hay crédito: hay que reconstruir con lo que hay.',
    highlights: ['Default: la deuda vieja no se paga, pero nadie te presta', 'Desempleo, pobreza y crédito en el piso', 'Sectores enojados con el gobierno'],
    image: { group: 'events', key: 'economicCrisis' },
    suggestedDifficulty: 'hard',
    indicators: { inflacion: 55, actividad: 34, ingreso_real: 32, credito: 25, fiscal: 32, externo: 48, infraestructura: 40, proteccion: 32, seguridad: 36, derechos: 45 },
    cash: 450,
    relationships: { financiero: -15, sindicatos: -10, organizaciones: -10, oposicion: -10 },
    reelectionsToUnlock: 1,
  },
  {
    id: 'pais_en_llamas',
    name: 'País en llamas',
    era: '1989: la hiperinflación',
    difficulty: 'Muy difícil',
    description: 'La inflación está al borde de la hiper, la caja vacía y los saqueos en la tapa de los diarios. El primer año decide todo.',
    highlights: ['Inflación al borde de la hiper', 'Caja flaca y deuda que vence pronto', 'Poder adquisitivo en el piso'],
    image: { group: 'events', key: 'socialProtest' },
    suggestedDifficulty: 'legend',
    indicators: { inflacion: 80, actividad: 40, ingreso_real: 30, credito: 32, fiscal: 36, externo: 36, proteccion: 36, seguridad: 40, derechos: 50 },
    cash: 600,
    loans: [{ principal: 600, dueTurn: 10 }, { principal: 600, dueTurn: 20 }],
    reelectionsToUnlock: 2,
  },
];

/** Sin escenario elegido (partidas guardadas antes de esta versión): el país base de la versión B. */
export const DEFAULT_SCENARIO_ID = 'pais_en_calma';

export function getScenario(id: string | null | undefined): ScenarioDef | undefined {
  return SCENARIOS.find(s => s.id === id);
}

export function isScenarioUnlocked(s: ScenarioDef, reelectionsWon: number, unlockAll = false): boolean {
  return unlockAll || reelectionsWon >= s.reelectionsToUnlock;
}

export type DifficultyLevelId = 'facil' | 'normal' | 'argentina';

export interface DifficultyLevel {
  id: DifficultyLevelId;
  label: string;
  /** Remate en broma que acompaña al nivel. */
  tagline: string;
  scenarioId: string;
}

export const DIFFICULTY_LEVELS: DifficultyLevel[] = [
  { id: 'facil', label: 'Fácil', tagline: 'Para aprender a gobernar sin que se prenda fuego todo.', scenarioId: 'pais_en_calma' },
  { id: 'normal', label: 'Normal', tagline: 'El mundo te compra todo. Disfrutalo mientras dure.', scenarioId: 'viento_de_cola' },
  { id: 'argentina', label: 'Argentina', tagline: 'Deuda, inflación y reservas flacas. Lo de siempre.', scenarioId: 'herencia_pesada' },
];

export const HISTORIC_SCENARIOS: ScenarioDef[] = SCENARIOS.filter(
  s => !DIFFICULTY_LEVELS.some(l => l.scenarioId === s.id),
);

/** Aplica el país heredado sobre un estado recién creado (antes del primer turno). */
export function applyScenario(state: CausalState, scenario: ScenarioDef): void {
  for (const [id, value] of Object.entries(scenario.indicators ?? {})) {
    const key = id as IndicatorId;
    state.base[key] = value!;
    state.indicators[key] = value!;
    state.previousIndicators[key] = value!;
  }
  if (scenario.cash !== undefined) { state.cash = scenario.cash; state.openingCash = scenario.cash; }
  for (const [i, loan] of (scenario.loans ?? []).entries()) {
    state.loans.push({
      id: `loan:escenario:${scenario.id}:${i}`, executionId: `escenario:${scenario.id}`, type: 'external',
      originalPrincipal: loan.principal, outstanding: loan.principal, issuedTurn: 0, dueTurn: loan.dueTurn,
      interest: BALANCE.external_interest * loan.principal / 600, restructured: false,
    });
  }
  for (const [actor, delta] of Object.entries(scenario.relationships ?? {})) {
    const s = state.actors[actor as ActorId];
    s.relationship = Math.max(0, Math.min(100, s.relationship + delta!));
  }
  if (scenario.revenueBoost) {
    const id = `escenario:${scenario.id}:recaudacion`;
    state.effects.push({
      id, executionId: `escenario:${scenario.id}`, effectId: id, actionId: scenario.revenueBoost.label,
      startTurn: 1, endExclusive: 1 + scenario.revenueBoost.turns, magnitude: scenario.revenueBoost.amount,
      kind: 'ledger', target: 'revenue_recurring', operation: 'flow', lastAppliedTurn: null,
    });
  }
}
