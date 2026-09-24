import {
  ACTORS,
  CAUSAL_ACTIONS_BY_ID,
  PARAMS,
  isOrganized,
  type ActorId,
} from '../../data/causal';
import { FOREVER, flagValue } from './context';
import { applyImmediateAction } from './effects';
import { changeRel, pickDemand } from './relations';
import { Rng } from './rng';
import type { CausalState } from './types';

/**
 * Relación con actores (08_REUNIONES): sin reunión → reunión → negociación → acuerdo.
 * La reunión revela; la relación se gana cumpliendo. Nunca compra satisfacción.
 */

export interface InteractionResult {
  ok: boolean;
  state: CausalState;
  /** PA que consumió (lo descuenta la capa de juego). */
  paSpent: number;
  message: string;
  success?: boolean;
}

function fail(state: CausalState, message: string): InteractionResult {
  return { ok: false, state, paSpent: 0, message };
}

// ─────────────────────────────── Reunión ───────────────────────────────

export function meetingCost(state: CausalState, actor: ActorId): number {
  const def = ACTORS[actor];
  const rel = state.actors[actor].rel ?? 50;
  if ((def.interactionDifficulty ?? 0) >= 7 || rel < 25) return 1;
  if (state.perks.freeMeetingActors.includes(actor)) return 0;
  return state.freeMeetingsUsed < state.perks.freeMeetingsPerTurn ? 0 : 1;
}

export function canMeet(state: CausalState, actor: ActorId, paLeft: number): string | null {
  if (!isOrganized(actor)) return 'No es una organización: para conocer su humor, encargá una encuesta.';
  if (state.actors[actor].lastMeeting === state.turn) return 'Ya te reuniste este turno.';
  if (meetingCost(state, actor) > paLeft) return 'No quedan puntos de acción.';
  return null;
}

export function meet(input: CausalState, actor: ActorId, paLeft: number): InteractionResult {
  const reason = canMeet(input, actor, paLeft);
  if (reason) return fail(input, reason);
  const state = structuredClone(input);
  const cost = meetingCost(state, actor);
  if (cost === 0 && !state.perks.freeMeetingActors.includes(actor)) state.freeMeetingsUsed += 1;
  state.executions.push({ actionId: 'reunion', turn: state.turn, actor });
  const applied = applyImmediateAction(state, 'reunion', actor);
  const st = state.actors[actor];
  st.lastMeeting = state.turn;
  st.lastContact = state.turn;
  st.revealedUntil = state.turn + PARAMS.FRESCURA_INFO - 1;
  if (!st.demand) {
    const id = pickDemand(state, actor, state.turn - 1);
    if (id) st.demand = { actionId: id, createdTurn: state.turn, revealedTurn: null };
  }
  if (st.demand) st.demand.revealedTurn = state.turn;
  const relDelta = applied.filter(a => a.target === `REL:${actor}`).reduce((x, a) => x + a.delta, 0);
  const extra = relDelta > 0 ? ' El gesto de apertura mejora un poco la relación.' : relDelta < 0 ? ' Otra reunión sin avances: empiezan a desconfiar.' : '';
  return { ok: true, state, paSpent: cost, message: `Reunión con ${ACTORS[actor].shortName}.${extra}` };
}

// ─────────────────────────────── Encuesta ───────────────────────────────

export const POLL_COST = 50;

export function canPoll(state: CausalState, actor: ActorId): string | null {
  if (isOrganized(actor)) return 'Las encuestas miden al electorado no organizado.';
  if (state.actors[actor].lastMeeting === state.turn) return 'Ya encargaste una encuesta este turno.';
  if (!state.perks.freePolls && state.caja < POLL_COST) return 'No alcanza la caja.';
  return null;
}

/** Encuesta / focus group: equivalente de la reunión para el electorado (04 encuesta). */
export function poll(input: CausalState, actor: ActorId): InteractionResult {
  const reason = canPoll(input, actor);
  if (reason) return fail(input, reason);
  const state = structuredClone(input);
  const cost = state.perks.freePolls ? 0 : POLL_COST;
  state.caja -= cost;
  state.immediateCosts += cost;
  state.executions.push({ actionId: 'encuesta', turn: state.turn, actor });
  const st = state.actors[actor];
  st.lastMeeting = state.turn;
  st.revealedUntil = state.turn + PARAMS.FRESCURA_INFO - 1;
  return { ok: true, state, paSpent: 0, message: `Encuesta sobre ${ACTORS[actor].shortName}.` };
}

// ─────────────────────────────── Negociación ───────────────────────────────

export function negotiationChance(state: CausalState, actor: ActorId): number {
  const st = state.actors[actor];
  const rel = st.rel ?? 50;
  const diff = ACTORS[actor].interactionDifficulty ?? 5;
  const demandOffered = st.demand?.revealedTurn !== null && st.demand !== null ? 0.1 : 0;
  const p = 0.5 + (rel - 50) / 100 - 0.04 * diff + demandOffered
    + (state.perks.negotiationBonus[actor] ?? 0)
    + state.credibility / 100;
  return Math.min(0.95, Math.max(0.05, p));
}

export function canNegotiate(state: CausalState, actor: ActorId, paLeft: number): string | null {
  if (!isOrganized(actor)) return 'No hay con quién negociar: es electorado no organizado.';
  if (!flagValue(state, `reunido_${actor}`, state.turn)) return 'Primero hay que reunirse (la reunión habilita negociar por 3 turnos).';
  if (state.executions.some(e => e.actionId === 'negociacion' && e.actor === actor && e.turn > state.turn - 2)) return 'Ya negociaron hace poco: esperá un turno.';
  if (state.agreements.some(a => a.actor === actor && a.status === 'active')) return 'Ya hay un acuerdo vigente con este actor.';
  if (!state.actors[actor].demand) return 'No hay una demanda concreta sobre la mesa.';
  if (paLeft < 1) return 'No quedan puntos de acción.';
  return null;
}

export function negotiate(input: CausalState, actor: ActorId, paLeft: number): InteractionResult {
  const reason = canNegotiate(input, actor, paLeft);
  if (reason) return fail(input, reason);
  const state = structuredClone(input);
  const rng = new Rng(state.rng);
  const chance = negotiationChance(state, actor);
  const success = rng.chance(chance);
  state.rng = rng.seed;
  state.executions.push({ actionId: 'negociacion', turn: state.turn, actor });
  state.actors[actor].lastContact = state.turn;
  const name = ACTORS[actor].shortName;
  if (success) {
    state.actors[actor].offerUntil = state.turn + 1;
    return { ok: true, state, paSpent: 1, success, message: `${name} acepta discutir un acuerdo. Tenés hasta el próximo turno para firmarlo.` };
  }
  changeRel(state, actor, -3);
  return { ok: true, state, paSpent: 1, success, message: `La negociación con ${name} fracasó. La relación se resiente.` };
}

// ─────────────────────────────── Acuerdo ───────────────────────────────

/** Contraprestación del actor al firmar (07 filas "Acuerdo" + 08 "Qué puede desbloquear"). */
type OfferEffect = { target: string; mode: 'DELTA' | 'BONUS'; magnitude: number; offset: number; duration: number; everyTurn: boolean; explanation: string };

const OFFERS: Record<ActorId, { text: string; effects: OfferEffect[] }> = {
  industria: { text: 'Compromiso de inversión', effects: [{ target: 'INVC', mode: 'DELTA', magnitude: 3, offset: 0, duration: 3, everyTurn: true, explanation: 'Acuerdo: compromiso de inversión' }] },
  agro: { text: 'Liquidación adelantada de la cosecha', effects: [{ target: 'EXTE', mode: 'DELTA', magnitude: 4, offset: 0, duration: 1, everyTurn: false, explanation: 'Acuerdo: liquidación adelantada' }] },
  financiero: { text: 'Refinanciación de vencimientos', effects: [{ target: 'CAJA', mode: 'DELTA', magnitude: 15, offset: 0, duration: 4, everyTurn: true, explanation: 'Acuerdo: servicio de deuda −10%' }] },
  sindicatos: { text: 'Tregua: no habrá paro general mientras dure', effects: [{ target: 'CONF', mode: 'BONUS', magnitude: -2, offset: 0, duration: 4, everyTurn: false, explanation: 'Acuerdo: tregua sindical' }] },
  pymes: { text: 'Moderación de precios y contratación', effects: [{ target: 'ACTV', mode: 'DELTA', magnitude: 1, offset: 0, duration: 2, everyTurn: true, explanation: 'Acuerdo: las PyMEs contratan' }] },
  clase_media: { text: '', effects: [] },
  sectores_populares: { text: '', effects: [] },
  estudiantes: { text: 'Levantan las tomas mientras se trata el financiamiento', effects: [{ target: 'CONF', mode: 'BONUS', magnitude: -2, offset: 0, duration: 4, everyTurn: false, explanation: 'Acuerdo: sin tomas' }] },
  docentes: { text: 'Paritaria cerrada: sin paros mientras dure', effects: [{ target: 'EDUC', mode: 'DELTA', magnitude: 1, offset: 0, duration: 2, everyTurn: true, explanation: 'Acuerdo: días de clase garantizados' }] },
  cientificos: { text: 'Plan plurianual: continuidad de los equipos', effects: [{ target: 'CIEN', mode: 'DELTA', magnitude: 1, offset: 0, duration: 3, everyTurn: true, explanation: 'Acuerdo: plan plurianual' }] },
  org_sociales: { text: 'Gestión conjunta de programas: contención en los barrios', effects: [{ target: 'CONF', mode: 'DELTA', magnitude: -2, offset: 0, duration: 3, everyTurn: true, explanation: 'Acuerdo: contención territorial' }] },
  derechos_cultura: { text: 'Protocolo con garantías', effects: [{ target: 'INST', mode: 'DELTA', magnitude: 1, offset: 0, duration: 1, everyTurn: false, explanation: 'Acuerdo: protocolo con garantías' }] },
  ambiente: { text: 'Evaluación ambiental participativa', effects: [{ target: 'AMBI', mode: 'DELTA', magnitude: 1, offset: 0, duration: 1, everyTurn: false, explanation: 'Acuerdo: evaluación participativa' }] },
  oficialismo: { text: 'Agenda legislativa común', effects: [{ target: 'LEG', mode: 'BONUS', magnitude: 2, offset: 0, duration: 4, everyTurn: false, explanation: 'Acuerdo: el bloque acompaña' }] },
  aliados: { text: 'Los socios votan en bloque', effects: [{ target: 'LEG', mode: 'BONUS', magnitude: 3, offset: 0, duration: 4, everyTurn: false, explanation: 'Acuerdo: votos de los aliados' }] },
  oposicion: { text: 'Ley de consenso: acompañan una ley', effects: [] },
  gobernadores: { text: 'Votos en el Senado y ejecución federal', effects: [{ target: 'LEG', mode: 'BONUS', magnitude: 3, offset: 0, duration: 4, everyTurn: false, explanation: 'Acuerdo: senadores provinciales acompañan' }] },
};

export function agreementOffer(actor: ActorId): string {
  return OFFERS[actor].text;
}

export function canSignAgreement(state: CausalState, actor: ActorId): string | null {
  const st = state.actors[actor];
  if (st.offerUntil === null || st.offerUntil < state.turn) return 'Primero hay que negociar con éxito.';
  if (!st.demand) return 'No hay una demanda concreta para comprometerse.';
  return null;
}

/**
 * Firma: el gobierno se compromete a ejecutar la acción demandada dentro del
 * plazo; el actor entrega su contraprestación ya. REL +6 al firmar (acuerdo.01);
 * cumplir +8, incumplir −20 (relations.ts).
 */
export function signAgreement(input: CausalState, actor: ActorId): InteractionResult {
  const reason = canSignAgreement(input, actor);
  if (reason) return fail(input, reason);
  const state = structuredClone(input);
  const st = state.actors[actor];
  const commitment = st.demand!.actionId;
  const turn = state.turn;
  state.executions.push({ actionId: 'acuerdo', turn, actor });
  applyImmediateAction(state, 'acuerdo', actor);
  // El flag acuerdo_[actor] dura el plazo (acuerdo.02 "plazo").
  const deadline = turn + PARAMS.PLAZO_ACUERDO - 1;
  state.flags[`acuerdo_${actor}`] = { value: 1, start: turn, end: deadline, source: 'acuerdo' };
  state.agreements.push({
    id: `ag_${actor}_${turn}`,
    actor,
    commitmentActionId: commitment,
    signedTurn: turn,
    deadline,
    offer: OFFERS[actor].text,
    status: 'active',
  });
  if (actor === 'oposicion') {
    state.modifiers.push({ id: `consenso_${turn}`, label: 'Ley de consenso', umbralLey: -5, start: turn, end: deadline });
  }
  for (const e of OFFERS[actor].effects) {
    const start = turn + e.offset;
    state.agenda.push({
      uid: `acuerdo.${actor}.${turn}.${e.target}`,
      effectId: `acuerdo.${actor}`,
      actionId: 'acuerdo',
      originTurn: turn,
      actor,
      target: e.target,
      mode: e.mode,
      magnitude: e.magnitude,
      start,
      end: e.duration >= FOREVER ? FOREVER : start + e.duration - 1,
      everyTurn: e.everyTurn,
      appliedTotal: 0,
      explanation: e.explanation,
    });
  }
  st.offerUntil = null;
  st.lastContact = turn;
  const actionName = CAUSAL_ACTIONS_BY_ID[commitment]?.name ?? commitment;
  return {
    ok: true,
    state,
    paSpent: 0,
    message: `Acuerdo con ${ACTORS[actor].shortName}: te comprometés a "${actionName}" en ${PARAMS.PLAZO_ACUERDO} turnos. A cambio: ${OFFERS[actor].text.toLowerCase()}.`,
  };
}
