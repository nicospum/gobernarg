import type { ActorId, IndicatorId } from './index';

/**
 * Escenarios de partida (decisión del usuario, sep-2026): se elige con qué país
 * arrancás. El escenario base del Excel es "Herencia pesada"; se suman un modo
 * de exploración tranquilo y el boom de 2003.
 *
 * Los escenarios sólo cambian el PUNTO DE PARTIDA (indicadores, cuentas,
 * Congreso, relaciones, condiciones vigentes). Las reglas del motor son las
 * mismas en todos.
 *
 * Versión Lite: tres niveles (Fácil, Normal y "Argentina"), uno por escenario.
 * Sin escenarios históricos ni desbloqueos.
 */
export type ScenarioDifficulty = 'Exploración' | 'Normal' | 'Difícil' | 'Muy difícil';

export interface ScenarioDef {
  id: string;
  name: string;
  /** Referencia histórica o época (texto corto). */
  era: string;
  difficulty: ScenarioDifficulty;
  description: string;
  /** Lo que el jugador tiene que saber al elegirlo. */
  highlights: string[];
  /** Clave de imagen existente (IMAGES.backgrounds / IMAGES.events). */
  image: { group: 'backgrounds' | 'events'; key: string };
  /** Valores iniciales de indicadores que cambian respecto del Excel. */
  indicators?: Partial<Record<IndicatorId, number>>;
  caja?: number;
  deuda?: number;
  gastoCorr?: number;
  /** Multiplicador de recaudación (commodities, crisis). */
  ingresoMult?: number;
  /** Expectativas de inflación desancladas al inicio. */
  desanclaje?: number;
  /** Bancas: ajuste sobre el oficialismo base. */
  legAdj?: number;
  imagen?: number;
  relDelta?: Partial<Record<ActorId, number>>;
}

export const SCENARIOS: ScenarioDef[] = [
  {
    id: 'pais_en_calma',
    name: 'País en calma',
    era: 'Modo exploración',
    difficulty: 'Exploración',
    description: 'Un país ordenado: sin deuda, inflación baja y cuentas en superávit. Ideal para aprender cómo se encadenan las decisiones sin que todo se prenda fuego.',
    highlights: ['Sin deuda y con caja holgada', 'Inflación baja y expectativas ancladas', 'Actores de buen humor'],
    image: { group: 'backgrounds', key: 'casaRosadaMorning' },
    indicators: { INFL: 24, ACTV: 52, PODA: 50, INVC: 50, PRES: 52, SOLV: 68, EXTE: 58, INFR: 52, EDUC: 52, PSOC: 50, SEGU: 50, CIEN: 50, INST: 58, AMBI: 55, CONF: 28 },
    caja: 2000,
    deuda: 0,
    desanclaje: 0,
  },
  {
    id: 'herencia_pesada',
    name: 'Herencia pesada',
    era: 'Los traspasos de 2015, 2019 y 2023',
    difficulty: 'Difícil',
    description: 'El país que recibís arrastra inflación alta, pocas divisas y deuda. Es el escenario de diseño del motor: exige ordenar sin romper.',
    highlights: ['Inflación alta y expectativas desancladas', 'Deuda de $3.000M y reservas flacas', 'Caja justa: cada gasto se nota'],
    image: { group: 'backgrounds', key: 'presidentialOffice' },
  },
  {
    id: 'viento_de_cola',
    name: 'Viento de cola',
    era: '2003: el boom de la soja',
    difficulty: 'Normal',
    description: 'Salís de una crisis enorme, pero el mundo paga caro lo que el país exporta. Sobran divisas y la recaudación rinde; el desempleo y la pobreza siguen altos. Fácil de empezar, fácil de dilapidar.',
    highlights: ['Divisas y recaudación en alza', 'Desempleo y pobreza todavía altos', 'Si gastás todo en el boom, el final duele'],
    image: { group: 'backgrounds', key: 'mapArgentina' },
    indicators: { INFL: 32, ACTV: 46, PODA: 40, INVC: 46, PRES: 55, SOLV: 48, EXTE: 72, PSOC: 40, SEGU: 42, CONF: 40, INST: 48 },
    caja: 2200,
    deuda: 3000,
    ingresoMult: 1.1,
    desanclaje: 2,
  },
];

export const DEFAULT_SCENARIO_ID = 'pais_en_calma';
/** Escenario del Excel (el de las simulaciones de diseño y del playtest de balance). */
export const DESIGN_SCENARIO_ID = 'herencia_pesada';

export function getScenario(id: string | null | undefined): ScenarioDef {
  return SCENARIOS.find(s => s.id === id) ?? SCENARIOS.find(s => s.id === DESIGN_SCENARIO_ID)!;
}

export type DifficultyLevelId = 'facil' | 'normal' | 'argentina';

export interface DifficultyLevel {
  id: DifficultyLevelId;
  label: string;
  /** Remate en broma que acompaña al nivel. */
  tagline: string;
  scenarioId: string;
}

/** Los tres niveles del inicio: cada uno abre un escenario disponible desde el principio. */
export const DIFFICULTY_LEVELS: DifficultyLevel[] = [
  { id: 'facil', label: 'Fácil', tagline: 'Para aprender a gobernar sin que se prenda fuego todo.', scenarioId: 'pais_en_calma' },
  { id: 'normal', label: 'Normal', tagline: 'El mundo te compra todo. Disfrutalo mientras dure.', scenarioId: 'viento_de_cola' },
  { id: 'argentina', label: 'Argentina', tagline: 'Deuda, inflación y reservas flacas. Lo de siempre.', scenarioId: 'herencia_pesada' },
];
