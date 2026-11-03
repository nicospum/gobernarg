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
 *
 * Flujo de inicio (decisión del usuario, sep-2026): primero se crea el
 * personaje y después se elige la dificultad. Tres niveles abren un escenario
 * cada uno (Fácil, Normal y "Argentina"); los escenarios históricos restantes
 * se desbloquean ganando reelecciones.
 *
 * Lite: los históricos siguen acá y funcionan, pero están ocultos detrás de
 * LITE_FEATURES.escenariosHistoricos (src/lite/config.ts).
 */
export type ScenarioDifficulty = 'Exploración' | 'Normal' | 'Difícil' | 'Muy difícil';

/** Meta visible de un escenario histórico (se evalúa con los mismos requisitos que las metas de gestión). */
export interface ScenarioGoalDef {
  id: string;
  title: string;
  description: string;
  indicators?: Record<string, { min?: number; max?: number }>;
  /** Condiciones vigentes del motor: nombre → 1 (debe regir) o 0 (no debe regir). */
  flags?: Record<string, number>;
  budget?: number;
}

/**
 * Reglas nuevas de un escenario histórico: emergencia por subrondas al
 * arrancar, medidas extraordinarias y objetivos propios. Solo lo tienen
 * Corralito e Hiper; las partidas guardadas antes siguen con sus reglas.
 */
export interface CrisisScenarioDef {
  kind: 'corralito' | 'hiper';
  /** Fecha de inicio (texto) y moneda, para la ficha. */
  start: string;
  currency: string;
  /** Etiquetas de las subrondas de la emergencia y su unidad. */
  rounds: string[];
  roundUnit: 'semana' | 'mes';
  /** Qué está pasando: hechos documentados, en tres líneas. */
  context: string[];
  /** Aclaración de historia alternativa. */
  alternateHistory: string;
  /** Liquidez bancaria inicial (Corralito). */
  liquidez?: number;
  goals: ScenarioGoalDef[];
}

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
  impulsos?: { target: IndicatorId; perTurn: number; turns: number; label: string; /** Solo aplica en los cierres en que se cumple (DSL). */ condition?: string; /** Empieza a contar desde este cierre (1 = primer cierre). */ from?: number }[];
  /** Condiciones vigentes al inicio: nombre → turnos de duración (null = hasta que se resuelva). */
  flags?: Record<string, number | null>;
  /**
   * Desbloqueo: reelecciones ganadas (en cualquier escenario) que hacen falta
   * para jugarlo. 0 = disponible desde el inicio.
   */
  reelectionsToUnlock: number;
  crisis?: CrisisScenarioDef;
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
    reelectionsToUnlock: 0,
  },
  {
    id: 'herencia_pesada',
    name: 'Herencia pesada',
    era: 'Los traspasos de 2015, 2019 y 2023',
    difficulty: 'Difícil',
    description: 'El país que recibís arrastra inflación alta, pocas divisas y deuda. Es el escenario de diseño del motor: exige ordenar sin romper.',
    highlights: ['Inflación alta y expectativas desancladas', 'Deuda de $3.000M y reservas flacas', 'Caja justa: cada gasto se nota'],
    image: { group: 'backgrounds', key: 'presidentialOffice' },
    reelectionsToUnlock: 0,
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
    reelectionsToUnlock: 0,
  },
  {
    id: 'corralito',
    name: 'Corralito',
    era: '30 de noviembre de 2001',
    difficulty: 'Difícil',
    description: 'Hoy se fueron 1.800 millones de los bancos en un solo día. La convertibilidad sigue en pie, la recesión lleva tres años y el crédito se cortó. Todavía no hay corralito, ni default, ni devaluación: lo que venga lo decidís vos.',
    highlights: ['Emergencia de tres semanas: una medida extraordinaria por semana', 'Convertibilidad vigente, reservas flacas y corrida bancaria', 'Desocupación del 18 % y pobreza del 38 %; el Congreso te dio la espalda en octubre'],
    image: { group: 'events', key: 'economicCrisis' },
    // Hipótesis de diseño calibradas con datos de 2001: IPC -1,5 % anual (deflación),
    // PIB -4,4 %, desocupación 18,3 % (oct-2001), pobreza 38,3 %. Ver ESCENARIOS-HISTORICOS-LIGHT.md.
    indicators: { INFL: 12, ACTV: 35, PODA: 35, INVC: 24, PRES: 52, SOLV: 15, EXTE: 20, INFR: 48, EDUC: 48, PSOC: 33, SEGU: 38, CIEN: 45, INST: 40, AMBI: 50, CONF: 60 },
    caja: 450,
    gastoCorr: 780,
    deuda: 6000,
    ingresoMult: 0.95,
    desanclaje: 2,
    // Congreso en contra: la ley de emergencia pide mayoría propia mínima (LEG ≥ 35) o un acuerdo con la oposición.
    legAdj: -4,
    imagen: 25,
    relDelta: { financiero: -10, sindicatos: -10, org_sociales: -12, oposicion: -10, gobernadores: -8 },
    // Rebote por capacidad ociosa (2002-2003 creció al 9 % anual): solo con nuevo régimen cambiario y precios contenidos, desde el tercer cierre.
    impulsos: [{ target: 'ACTV', perTurn: 2.5, turns: 8, from: 3, condition: 'not FLAG(convertibilidad) and INFL<55', label: 'Rebote: capacidad ociosa después del derrumbe (con nuevo régimen y precios contenidos)' }],
    flags: { convertibilidad: null, corrida: null, crisis_corralito: null, escenario_crisis: null },
    reelectionsToUnlock: 1,
    crisis: {
      kind: 'corralito',
      start: '30 de noviembre de 2001',
      currency: 'peso convertible (1 peso = 1 dólar)',
      rounds: ['Primera semana de diciembre', 'Mediados de diciembre', 'Fin de año'],
      roundUnit: 'semana',
      context: [
        'El 30 de noviembre de 2001 los bancos perdieron unos 1.800 millones de depósitos en un día (2,5 % del total). La convertibilidad sigue vigente: 1 peso = 1 dólar, y cada peso que sale se paga con reservas.',
        'La economía cae desde 1998: PIB -4,4 % en 2001, desocupación del 18,3 % y pobreza del 38,3 % (INDEC, octubre de 2001). Los precios bajan (deflación) y no hay crédito.',
        'El gobierno perdió las legislativas de octubre y no tiene mayoría. El FMI suspendió los desembolsos. Las organizaciones sociales y la clase media están en la calle.',
      ],
      alternateHistory: 'Desde acá la historia es alternativa: no hay corralito, default ni devaluación hasta que vos los decidas, y el mandato sigue cuatro años más.',
      liquidez: 40,
      goals: [
        { id: 'meta_corrida', title: 'Contener la corrida', description: 'Los bancos dejan de perder depósitos y vuelven a tener liquidez.', flags: { bancos_estables: 1 } },
        { id: 'meta_caja', title: 'Pagos esenciales al día', description: 'La caja cierra en positivo: sueldos, jubilaciones y proveedores cobran.', budget: 0 },
        { id: 'meta_depositos', title: 'Bancos en pie y depósitos libres', description: 'Sin corralito ni corralón, con los bancos estables.', flags: { corralito: 0, corralon: 0, bancos_estables: 1 } },
        { id: 'meta_deuda', title: 'Deuda al día o renegociada', description: 'Sin default: la deuda se paga o se renegoció con quita.', flags: { default_deuda: 0 } },
        { id: 'meta_precios', title: 'Precios bajo control', description: 'Si devaluaste, el traslado a precios se contuvo (Precios altos como mucho).', indicators: { INFL: { max: 50 } } },
        { id: 'meta_calle', title: 'La calle se calma', description: 'Conflictividad por debajo de la zona de riesgo.', indicators: { CONF: { max: 45 } } },
      ],
    },
  },
  {
    id: 'pais_en_llamas',
    name: 'País en llamas',
    era: '1 de junio de 1989',
    difficulty: 'Muy difícil',
    description: 'La hiperinflación está en marcha: los precios subieron 78 % en mayo y siguen acelerando. Perdiste la elección del 14 de mayo, hay saqueos, el Banco Central no tiene reservas y la deuda está en default desde 1988. Hay que frenar la aceleración, que la gente coma y lograr una salida viable.',
    highlights: ['Emergencia de tres meses: una medida extraordinaria por mes', 'Precios en 97 de 100 (unos 80 % por mes) y acelerando: dos meses así y caés', 'Austral sin respaldo, caja vacía, default y gobierno en transición'],
    image: { group: 'events', key: 'socialProtest' },
    // Hipótesis de diseño calibradas con datos de 1989: IPC mayo 78,5 % mensual (CEPAL),
    // pobreza GBA 25,9 % (mayo) y 47,3 % (octubre), BCRA sin reservas desde febrero, moratoria desde abril de 1988.
    indicators: { INFL: 97, ACTV: 37, PODA: 24, INVC: 22, PRES: 45, SOLV: 12, EXTE: 18, INFR: 42, EDUC: 45, PSOC: 30, SEGU: 38, CIEN: 42, INST: 42, AMBI: 50, CONF: 70 },
    caja: 250,
    gastoCorr: 800,
    deuda: 5000,
    ingresoMult: 0.92,
    desanclaje: 30,
    legAdj: -6,
    imagen: 22,
    relDelta: { financiero: -10, sindicatos: -5, industria: -5, org_sociales: -5, oposicion: 5 },
    // Rebote: la economía vuelve a moverse solo si la inflación se calma.
    impulsos: [{ target: 'ACTV', perTurn: 2, turns: 6, from: 2, condition: 'INFL<60', label: 'Rebote: la economía vuelve a moverse si se calma la inflación' }],
    flags: { default_deuda: null, estado_de_sitio: 1, crisis_hiper: null, escenario_crisis: null },
    reelectionsToUnlock: 2,
    crisis: {
      kind: 'hiper',
      start: '1 de junio de 1989',
      currency: 'austral',
      rounds: ['Junio de 1989', 'Julio de 1989', 'Agosto de 1989'],
      roundUnit: 'mes',
      context: [
        'Los precios subieron 33 % en abril y 78 % en mayo de 1989 (IPC, CEPAL). La gente se saca los australes de encima apenas los cobra y ahorra en dólares.',
        'El Banco Central dejó de intervenir en febrero por falta de reservas; la deuda externa está en moratoria desde abril de 1988. Hubo saqueos del 24 al 30 de mayo y el estado de sitio rige desde el 29.',
        'El gobierno perdió la elección del 14 de mayo y debe entregar el poder en diciembre. La pobreza del Gran Buenos Aires pasó del 26 % en mayo al 47 % en octubre.',
      ],
      alternateHistory: 'Desde acá la historia es alternativa: en la realidad el gobierno entregó el poder el 8 de julio de 1989. Acá seguís gobernando; si acordás la transición, gobernás con la fuerza que ganó.',
      goals: [
        { id: 'meta_frenar', title: 'Frenar la aceleración', description: 'Salir de la emergencia con los precios lejos del colapso (índice 85 o menos).', indicators: { INFL: { max: 85 } } },
        { id: 'meta_estabilizar', title: 'Estabilizar los precios', description: 'Inflación alta pero contenida (índice 60 o menos).', indicators: { INFL: { max: 60 } } },
        { id: 'meta_ingresos', title: 'Ingresos básicos sostenidos', description: 'Protección social y bolsillo fuera de la zona crítica.', indicators: { PSOC: { min: 35 }, PODA: { min: 30 } } },
        { id: 'meta_transicion', title: 'Transición acordada', description: 'Un acuerdo con la fuerza que ganó para gobernar la emergencia.', flags: { transicion: 1 } },
        { id: 'meta_moneda', title: 'Una moneda que se sostiene', description: 'Moneda nueva en circulación y precios estabilizados.', flags: { nueva_moneda: 1 }, indicators: { INFL: { max: 60 } } },
        { id: 'meta_deuda', title: 'Deuda renegociada', description: 'Salir del default con una quita.', flags: { default_deuda: 0 } },
      ],
    },
  },
];

export const DEFAULT_SCENARIO_ID = 'pais_en_calma';
/** Escenario del Excel (el de las simulaciones de diseño y del playtest de balance). */
export const DESIGN_SCENARIO_ID = 'herencia_pesada';

export function getScenario(id: string | null | undefined): ScenarioDef {
  return SCENARIOS.find(s => s.id === id) ?? SCENARIOS.find(s => s.id === DESIGN_SCENARIO_ID)!;
}

/** Escenarios disponibles según las reelecciones ganadas. */
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

/** Los tres niveles del inicio: cada uno abre un escenario disponible desde el principio. */
export const DIFFICULTY_LEVELS: DifficultyLevel[] = [
  { id: 'facil', label: 'Fácil', tagline: 'Para aprender a gobernar sin que se prenda fuego todo.', scenarioId: 'pais_en_calma' },
  { id: 'normal', label: 'Normal', tagline: 'El mundo te compra todo. Disfrutalo mientras dure.', scenarioId: 'viento_de_cola' },
  { id: 'argentina', label: 'Argentina', tagline: 'Deuda, inflación y reservas flacas. Lo de siempre.', scenarioId: 'herencia_pesada' },
];

/** Escenarios históricos: los que no abre ningún nivel y se ganan con reelecciones. */
export const HISTORIC_SCENARIOS: ScenarioDef[] = SCENARIOS.filter(
  s => !DIFFICULTY_LEVELS.some(l => l.scenarioId === s.id),
);
