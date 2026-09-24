import type { ActorId, IndicatorId } from '../../data/causal';

/**
 * Convenciones de tiempo del motor causal
 * ----------------------------------------
 * `turn` es el turno ABSOLUTO de la partida (1..32, continuo entre mandatos).
 * Durante la fase de decisión el jugador está en el turno `state.turn`; al
 * "Finalizar turno" se ejecuta el CIERRE de ese turno (pasos T.2–T.10 del
 * Excel) y `state.turn` avanza.
 *
 * - Bonus (efectos temporales): [start, end] en turnos de CIERRE. El valor
 *   efectivo "que ve el jugador" en la fase de decisión del turno t es el del
 *   cierre t−1.
 * - Flags: [start, end] en turnos de DECISIÓN. Un flag seteado en el cierre c
 *   rige desde la decisión c+1; uno seteado por una acción inmediata
 *   (reunión) rige desde el turno actual.
 */

export interface Bonus {
  id: string;
  /** Indicador, 'SOLV' incluido, o 'LEG'. */
  target: string;
  value: number;
  start: number;
  end: number;
  source: string;
  label: string;
}

export interface ScheduledEffect {
  uid: string;
  effectId: string;
  actionId: string;
  originTurn: number;
  actor?: ActorId;
  target: string;
  mode: 'DELTA' | 'BONUS' | 'SET';
  magnitude: number;
  /** Primer y último cierre en que aplica (inclusive). */
  start: number;
  end: number;
  /** DELTA que se aplica en cada cierre de [start, end] (PERSISTENT o duración > 1). */
  everyTurn: boolean;
  /** Condición evaluada al aplicar (APPLY). Con duración 99 es "mientras se cumpla". */
  applyCondition?: string;
  whileCondition?: boolean;
  floor?: number;
  cumulativeCap?: number;
  appliedTotal: number;
  explanation: string;
}

export interface FlagState {
  value: number;
  start: number;
  /** null = permanente */
  end: number | null;
  source: string;
}

export interface CostMultiplier {
  value: number;
  start: number;
  end: number;
}

export interface Execution {
  actionId: string;
  turn: number;
  actor?: ActorId;
  forced?: boolean;
}

/** Demanda activa de un actor (08: se revela en la reunión). */
export interface ActorDemand {
  actionId: string;
  createdTurn: number;
  revealedTurn: number | null;
}

export interface ActorState {
  sat: number;
  /** null para electorado no organizado (clase media, sectores populares). */
  rel: number | null;
  /** Último turno con contacto (reunión, negociación, acuerdo, demanda atendida). */
  lastContact: number | null;
  /** La información revelada (satisfacción exacta, preocupaciones) está fresca hasta este turno inclusive. */
  revealedUntil: number;
  /** Turno de la última reunión o encuesta. */
  lastMeeting: number | null;
  demand: ActorDemand | null;
  /** Negociación exitosa pendiente de convertirse en acuerdo (turno en que vence la oferta). */
  offerUntil: number | null;
  /** Turnos consecutivos con SAT < 45 (histéresis de fuga de cerebros, etc.). */
  lowStreak: number;
}

export type AgreementStatus = 'active' | 'fulfilled' | 'broken';

export interface Agreement {
  id: string;
  actor: ActorId;
  /** Acción que el gobierno se compromete a ejecutar. */
  commitmentActionId: string;
  signedTurn: number;
  deadline: number;
  /** Qué ofrece el actor a cambio (texto) y su efecto (canal de acuerdo 07). */
  offer: string;
  status: AgreementStatus;
}

export interface ChannelEffect {
  id: string;
  actor: ActorId;
  label: string;
  target: string;
  value: number;
  mode: 'DELTA' | 'BONUS';
  duration: number;
  applyTurn: number;
  /** Evento de canal (paro, corrida, cacerolazo…) si corresponde. */
  eventId?: string;
}

export interface Saliency {
  actor: ActorId;
  indicator: IndicatorId;
  mult: number;
  end: number;
  source: string;
}

/** Modificadores globales temporales (estrategia post-legislativa, jugada audaz…). */
export interface GlobalModifier {
  id: string;
  label: string;
  /** Multiplica los efectos beneficiosos sobre indicadores. */
  efficacy?: number;
  /** Delta por turno sobre CONF / imagen / REL(actor). */
  confPerTurn?: number;
  imagenPerTurn?: number;
  relPerTurn?: Partial<Record<ActorId, number>>;
  /** Ajuste del umbral de LEY. */
  umbralLey?: number;
  start: number;
  end: number;
}

export interface PoliticalState {
  /** Bancas propias + aliadas (%). */
  leg: number;
  /** Ajustes permanentes a LEG por canales, coalición o elecciones. */
  legAdj: number;
  gob: number;
  apro: number;
  estr: number;
  otros: number;
  iv: number;
  /** Imagen del presidente/candidato (componente OTROS, no lee indicadores). */
  imagen: number;
  umbralLey: number;
}

export interface FiscalBreakdown {
  cajaAntes: number;
  ingresos: number;
  gastoCorriente: number;
  servicioDeuda: number;
  costoAcciones: number;
  ingresosAcciones: number;
  efectosCaja: number;
  financiamiento: number;
  resultado: number;
  cajaDespues: number;
}

export interface AppliedEffectRecord {
  source: string;
  actionId?: string;
  effectId?: string;
  originTurn?: number;
  target: string;
  delta: number;
  mode: 'DELTA' | 'BONUS' | 'SET';
  explanation: string;
}

export interface RuleRecord {
  ruleId: string;
  target: string;
  delta: number;
}

export interface ChannelRecord {
  actor: ActorId;
  label: string;
  target: string;
  value: number;
  eventId?: string;
}

export interface TurnActionRecord {
  actionId: string;
  actor?: ActorId;
  caja: number;
  scheduled: string[];
  suspended?: string;
  forced?: boolean;
}

export interface TurnRecord {
  turn: number;
  actions: TurnActionRecord[];
  applied: AppliedEffectRecord[];
  rules: RuleRecord[];
  channelsApplied: ChannelRecord[];
  channelsScheduled: ChannelRecord[];
  fiscal: FiscalBreakdown;
  indicatorsBefore: Record<IndicatorId, number>;
  indicatorsAfter: Record<IndicatorId, number>;
  actorsBefore: Record<ActorId, { sat: number; rel: number | null }>;
  actorsAfter: Record<ActorId, { sat: number; rel: number | null }>;
  politicalBefore: PoliticalState;
  politicalAfter: PoliticalState;
  relationEvents: string[];
  events: string[];
  notes: string[];
}

export interface CausalState {
  /** Turno absoluto de la fase de decisión actual (el próximo cierre). */
  turn: number;
  base: Record<IndicatorId, number>;
  expect: Record<string, number>;
  bonuses: Bonus[];
  agenda: ScheduledEffect[];
  flags: Record<string, FlagState>;
  costMult: Record<string, CostMultiplier>;
  caja: number;
  gastoCorr: number;
  deuda: number;
  ingresoMult: number;
  desanclaje: number;
  /** Resultado fiscal de cada cierre (para RESULT3). */
  fiscalHistory: number[];
  executions: Execution[];
  actors: Record<ActorId, ActorState>;
  channelQueue: ChannelEffect[];
  /** Último turno en que se disparó cada evento de canal (cooldown). */
  channelEventTurns: Record<string, number>;
  saliency: Saliency[];
  modifiers: GlobalModifier[];
  political: PoliticalState;
  platformId: string;
  agreements: Agreement[];
  /** Credibilidad para negociar: baja con cada incumplimiento (−5% por vez). */
  credibility: number;
  /** PA perdidos el próximo turno (paro general). */
  paPenaltyNextTurn: number;
  /** Reuniones gratuitas usadas en el turno actual. */
  freeMeetingsUsed: number;
  /** Costos de caja de acciones inmediatas (encuestas) del turno, para el resultado fiscal. */
  immediateCosts: number;
  /** Emisión forzada pendiente por caja negativa al cierre (D-10). */
  forcedEmission: boolean;
  hyperStreak: number;
  govCrisisStreak: number;
  /** Bancas perdidas por disidencias acumuladas (oficialismo/aliados descontentos), se recuperan al mejorar. */
  dissent: Partial<Record<ActorId, number>>;
  /** Rupturas permanentes ocurridas (ruptura del bloque, salida de la coalición). */
  ruptures: string[];
  records: TurnRecord[];
  /** Estado del generador pseudoaleatorio (reproducible en playtests). */
  rng: number;
  /** Parámetros por arquetipo/asesores resueltos al iniciar o cambiar asesores. */
  perks: Perks;
}

/** Bonificaciones de arquetipo y asesores que el motor consulta. */
export interface Perks {
  freeMeetingsPerTurn: number;
  /** Actores con reunión siempre gratis. */
  freeMeetingActors: ActorId[];
  /** Encuestas sin costo. */
  freePolls: boolean;
  /** Factor que reduce efectos negativos de eventos sobre la imagen (0..1). */
  eventResilience: number;
  /** Multiplicador sobre ESTRUCTURA. */
  structureMult: number;
  /** Suma a la probabilidad de éxito de negociar con estos actores. */
  negotiationBonus: Partial<Record<ActorId, number>>;
  /** Eficacia por categoría de acción (asesores). */
  categoryEfficacy: Record<string, number>;
  /** Categorías donde las acciones de 2 PA cuestan 1 (asesores). */
  paDiscountCategories: string[];
  /** Descuento de caja por categoría (0.1 = −10%). */
  categoryCajaDiscount: Record<string, number>;
  /** Mitiga el costo institucional de medidas de seguridad (0..1). */
  securityInstMitigation: number;
  /** Mejores condiciones de préstamos (reduce DEUDA tomada, 0..1). */
  loanDiscount: number;
  /** Revela información oculta (ids: 'desanclaje', 'encuestas', 'repeticion'). */
  reveals: string[];
}
