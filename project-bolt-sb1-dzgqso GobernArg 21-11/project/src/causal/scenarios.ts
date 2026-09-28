import { BALANCE } from './catalog';
import type { Difficulty } from './campaignTypes';
import type { ActorId, CausalState, IndicatorId, Sensitivity } from './types';

/**
 * Escenarios de partida (traídos de la versión A, sep-2026). Como en
 * Civilization, se elige con qué país arrancás: cambian los indicadores
 * iniciales, la caja, la deuda y algunas relaciones; las reglas son las mismas.
 *
 * Inicio en dos pasos: primero el personaje, después la dificultad. Tres
 * niveles abren un escenario cada uno (Fácil, Normal y "Argentina"); los
 * escenarios históricos se desbloquean ganando reelecciones.
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
  /** Exigencia sugerida de la versión B (recaudación, eventos, elecciones). El jugador la puede cambiar. */
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
    highlights: ['Inflación alta', 'Deuda de 1.500 U: la mitad vence en el turno 12', 'Caja justa: cada gasto se nota'],
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

// ─────────────────────────────── Plataforma del partido ───────────────────────────────

export interface PlatformDef {
  id: string;
  name: string;
  description: string;
  /** Lo que tu partido espera ver: reemplaza las prioridades del oficialismo. */
  items: Sensitivity[];
}

/** Plataformas prearmadas (las mismas cinco de la versión A, en los indicadores de la B). */
export const PLATFORMS: PlatformDef[] = [
  { id: 'crecimiento_con_salarios', name: 'Crecimiento con salarios', description: 'El partido quiere ver actividad, poder adquisitivo y una inflación que no se escape.',
    items: [{ indicatorId: 'actividad', weight: 8 }, { indicatorId: 'ingreso_real', weight: 8 }, { indicatorId: 'inflacion', weight: -6 }] },
  { id: 'desarrollo_productivo', name: 'Desarrollo productivo', description: 'Inversión, crédito para producir y una economía que exporte.',
    items: [{ indicatorId: 'credito', weight: 8 }, { indicatorId: 'actividad', weight: 8 }, { indicatorId: 'externo', weight: 6 }] },
  { id: 'estado_presente', name: 'Estado presente', description: 'Protección social, salario real y educación pública.',
    items: [{ indicatorId: 'proteccion', weight: 8 }, { indicatorId: 'ingreso_real', weight: 8 }, { indicatorId: 'educacion', weight: 6 }] },
  { id: 'orden_y_estabilidad', name: 'Orden y estabilidad', description: 'Baja inflación, seguridad y cuentas públicas sólidas.',
    items: [{ indicatorId: 'inflacion', weight: -8 }, { indicatorId: 'seguridad', weight: 8 }, { indicatorId: 'fiscal', weight: 6 }] },
  { id: 'modernizacion', name: 'Modernización', description: 'Instituciones sólidas, ciencia e inserción en el mundo.',
    items: [{ indicatorId: 'derechos', weight: 8 }, { indicatorId: 'ciencia', weight: 8 }, { indicatorId: 'externo', weight: 6 }] },
];

/** Plataforma apagada: el partido mira lo de siempre en la versión B. */
export const NO_PLATFORM_ID = 'ninguna';
/** Plataforma propia: se arma con lo que el jugador empuja con sus políticas (se recalcula en cada cierre). */
export const OWN_PLATFORM_ID = 'propia';
export const OWN_PLATFORM_WINDOW = 4;
const OWN_WEIGHTS = [8, 8, 6];

export function getPlatform(id: string | null | undefined): PlatformDef | undefined {
  return PLATFORMS.find(p => p.id === id);
}

export function isValidPlatformId(id: unknown): boolean {
  return id === NO_PLATFORM_ID || id === OWN_PLATFORM_ID || PLATFORMS.some(p => p.id === id);
}

/**
 * Plataforma propia: los (hasta) tres indicadores que más empujaste en la
 * dirección buena con las políticas de los últimos turnos. Recibe la suma de
 * impulsos por indicador; la inflación es el único donde subir es malo.
 */
export function deriveOwnPlatform(push: Partial<Record<IndicatorId, number>>): Sensitivity[] {
  return (Object.entries(push) as [IndicatorId, number][])
    .map(([indicatorId, total]) => ({ indicatorId, score: indicatorId === 'inflacion' ? -total : total }))
    .filter(x => x.score > 0)
    .sort((a, b) => b.score - a.score || a.indicatorId.localeCompare(b.indicatorId))
    .slice(0, OWN_WEIGHTS.length)
    .map((x, i) => ({ indicatorId: x.indicatorId, weight: (x.indicatorId === 'inflacion' ? -1 : 1) * OWN_WEIGHTS[i] }));
}
