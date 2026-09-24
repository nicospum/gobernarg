import type { ActorId, IndicatorId } from './index';

/**
 * Escenarios de partida (decisión del usuario, sep-2026): como en Civilization o
 * Age of Empires, se elige con qué país arrancás. El escenario base del Excel
 * pasa a ser "Herencia pesada"; se suma un modo de exploración tranquilo y
 * escenarios inspirados en momentos de la historia argentina.
 *
 * Los escenarios sólo cambian el PUNTO DE PARTIDA (indicadores, cuentas,
 * Congreso, relaciones, condiciones vigentes). Las reglas del motor son las
 * mismas en todos.
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
  /**
   * Ley de emergencia: el Congreso y los actores dan margen extra de
   * gobernabilidad los primeros turnos (crisis heredadas).
   */
  emergencia?: { gob: number; turns: number };
  /**
   * Inercias del país heredado: cambios por turno durante los primeros turnos
   * (p. ej. rebote por capacidad ociosa después de una crisis).
   */
  impulsos?: { target: IndicatorId; perTurn: number; turns: number; label: string }[];
  /** Condiciones vigentes al inicio: nombre → turnos de duración (null = hasta que se resuelva). */
  flags?: Record<string, number | null>;
  /**
   * Desbloqueo: ganar cualquiera de estos escenarios. Vacío = disponible desde el inicio.
   */
  unlockedBy: string[];
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
    unlockedBy: [],
  },
  {
    id: 'herencia_pesada',
    name: 'Herencia pesada',
    era: 'Los traspasos de 2015, 2019 y 2023',
    difficulty: 'Normal',
    description: 'El país que recibís arrastra inflación alta, pocas divisas y deuda. Es el escenario de diseño del motor: exige ordenar sin romper.',
    highlights: ['Inflación alta y expectativas desancladas', 'Deuda de $3.000M y reservas flacas', 'Caja justa: cada gasto se nota'],
    image: { group: 'backgrounds', key: 'presidentialOffice' },
    unlockedBy: [],
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
    unlockedBy: ['pais_en_calma', 'herencia_pesada'],
  },
  {
    id: 'corralito',
    name: 'Corralito',
    era: 'Diciembre de 2001',
    difficulty: 'Difícil',
    description: 'Los depósitos están atrapados, el país está en default y la calle se llenó de cacerolas. No hay crédito: hay que reconstruir con lo que hay.',
    highlights: ['Default: 8 turnos sin crédito (tampoco se pagan intereses)', 'Desempleo, pobreza y conflicto muy altos', 'Ley de emergencia: el Congreso te da margen los primeros turnos'],
    image: { group: 'events', key: 'economicCrisis' },
    indicators: { INFL: 40, ACTV: 36, PODA: 34, INVC: 38, PRES: 55, SOLV: 18, EXTE: 50, PSOC: 34, SEGU: 36, INST: 38, CONF: 55 },
    caja: 700,
    gastoCorr: 820,
    deuda: 6000,
    desanclaje: 8,
    legAdj: 4,
    imagen: 50,
    emergencia: { gob: 12, turns: 6 },
    impulsos: [{ target: 'ACTV', perTurn: 1.8, turns: 8, label: 'Rebote: capacidad ociosa después del derrumbe' }],
    relDelta: { financiero: -15, sindicatos: -10, org_sociales: -10, oposicion: -10 },
    flags: { default_deuda: 8 },
    unlockedBy: ['herencia_pesada', 'viento_de_cola'],
  },
  {
    id: 'pais_en_llamas',
    name: 'País en llamas',
    era: '1989: la hiperinflación',
    difficulty: 'Muy difícil',
    description: 'La inflación está al borde de la hiper, la caja vacía y los saqueos en la tapa de los diarios. El primer año decide todo.',
    highlights: ['Inflación al borde de la hiper: dos turnos sobre 90 y caés', 'Caja flaca y expectativas desancladas', 'Asumís con apoyo: ley de emergencia y buena imagen, por poco tiempo'],
    image: { group: 'events', key: 'socialProtest' },
    indicators: { INFL: 72, ACTV: 40, PODA: 33, INVC: 38, SOLV: 30, EXTE: 38, PSOC: 38, SEGU: 40, INST: 46, CONF: 52 },
    caja: 900,
    deuda: 5000,
    gastoCorr: 850,
    desanclaje: 10,
    legAdj: 4,
    imagen: 58,
    emergencia: { gob: 12, turns: 6 },
    impulsos: [{ target: 'ACTV', perTurn: 1.6, turns: 8, label: 'Rebote: la economía vuelve a moverse si se calma la inflación' }],
    unlockedBy: ['corralito'],
  },
];

export const DEFAULT_SCENARIO_ID = 'pais_en_calma';
/** Escenario del Excel (el de las simulaciones de diseño y del playtest de balance). */
export const DESIGN_SCENARIO_ID = 'herencia_pesada';

export function getScenario(id: string | null | undefined): ScenarioDef {
  return SCENARIOS.find(s => s.id === id) ?? SCENARIOS.find(s => s.id === DESIGN_SCENARIO_ID)!;
}

/** Escenarios disponibles según los escenarios ya ganados. */
export function isScenarioUnlocked(s: ScenarioDef, won: string[], unlockAll = false): boolean {
  return unlockAll || s.unlockedBy.length === 0 || s.unlockedBy.some(id => won.includes(id));
}
