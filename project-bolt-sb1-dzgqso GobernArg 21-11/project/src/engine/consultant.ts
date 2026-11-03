/**
 * Gastón Barenboim, consultor político.
 *
 * Se acerca solo alrededor de cada elección del mandato, como un evento con
 * tres opciones: una visita anticipada y, solo si en esa seguiste tu instinto
 * (o no hubo anticipada), otra a último momento. Trae el dato de las
 * encuestas: el sector con votos al que no le venís tirando la soga y la
 * medida que lo mueve. Las opciones cobran honorarios, fijan esa medida en la
 * agenda del turno y mueven la intención de voto hasta el cierre de la
 * elección (el bono vive en causal.consultant y lo lee political.ts).
 *
 * No se importa desde engine/causal (evita ciclos): el motor solo lee el estado.
 */
import type { GameState } from '../types/game';
import type { GameEvent } from '../systems/events/types';
import { ACTOR_IDS, ACTORS, CAUSAL_ACTIONS_BY_ID, POLICY_ACTIONS, type ActorId } from '../data/causal';
import {
  CONSULTANT_CHOICE_IDS,
  CONSULTANT_ELECTIONS,
  CONSULTANT_EVENT_PREFIX,
  CONSULTANT_NAME,
  CONSULTANT_NOTICE,
  CONSULTANT_OPTION_LABEL,
  CONSULTANT_TIMINGS,
  consultantEventId,
  consultantFee,
  consultantIvDelta,
  consultantSpeech,
  isConsultantChoice,
  parseConsultantEventId,
} from '../data/consultor';
import { calendarFor, equivalentTurns, type CalendarSource } from '../lib/calendar';
import {
  demandScore,
  getAvailability,
  recomputePolitical,
  viewRef,
  type CausalState,
  type ConsultantElection,
  type ConsultantState,
  type ConsultantTiming,
  type ConsultantVisit,
} from './causal';
import { paForTurn, syncLegacy } from './causalBridge';
import { addNotification } from './engineShared';

// ─────────────────────────────── Calendario ───────────────────────────────

/**
 * Turno de decisión dentro del mandato (1..turnsPerMandate) en que Gastón
 * visita para esa elección y ese momento. Legislativas: 2 y el primer turno
 * del año electoral; presidenciales: dos turnos después de las legislativas y
 * el primer turno del último año.
 */
export function consultantVisitTurn(source: CalendarSource, election: ConsultantElection, timing: ConsultantTiming): number {
  const { periodsPerYear, midtermTurn } = calendarFor(source);
  if (election === 'legislativas') return timing === 'anticipado' ? 2 : periodsPerYear + 1;
  return timing === 'anticipado' ? midtermTurn + 2 : 3 * periodsPerYear + 1;
}

/** Cierre absoluto de la elección: hasta ahí rige el bono de voto. */
export function consultantElectionClose(source: CalendarSource, election: ConsultantElection, mandateStart: number): number {
  const { midtermTurn, turnsPerMandate } = calendarFor(source);
  return mandateStart + (election === 'legislativas' ? midtermTurn : turnsPerMandate) - 1;
}

export function emptyConsultantState(): ConsultantState {
  return { version: 1, visits: [], bonusIv: 0, bonusUntil: 0, lockedPolicy: null, lockedTurn: null };
}

function visitsForElection(consultant: ConsultantState | undefined, election: ConsultantElection, mandateStart: number): ConsultantVisit[] {
  return (consultant?.visits ?? []).filter(v => v.election === election && v.mandateStart === mandateStart);
}

/**
 * Qué visita corresponde en el turno de decisión actual, o null. A último
 * momento vuelve solo si en la anticipada seguiste tu instinto o si no hubo
 * anticipada (partida cargada de antes).
 */
export function pendingConsultantVisit(causal: CausalState): { election: ConsultantElection; timing: ConsultantTiming } | null {
  const t = causal.turn - causal.mandateStart + 1;
  for (const election of CONSULTANT_ELECTIONS) {
    const visits = visitsForElection(causal.consultant, election, causal.mandateStart);
    for (const timing of CONSULTANT_TIMINGS) {
      if (consultantVisitTurn(causal, election, timing) !== t) continue;
      if (visits.some(v => v.timing === timing)) continue;
      if (timing === 'ultimo_momento') {
        const early = visits.find(v => v.timing === 'anticipado');
        if (early && (early.choice === 'encuestador' || early.choice === 'redes')) continue;
      }
      return { election, timing };
    }
  }
  return null;
}

// ─────────────────────────────── El dato de las encuestas ───────────────────────────────

export interface PollRecommendation {
  actor: ActorId | null;
  policy: string | null;
}

/**
 * El sector con votos al que no le venís tirando la soga (peso electoral por
 * insatisfacción, descartando a los atendidos en los últimos turnos) y la
 * política visible y disponible que más lo mueve, excluyendo lo ejecutado
 * hace poco, la emergencia y el financiamiento.
 */
export function pollRecommendation(causal: CausalState): PollRecommendation {
  const ref = viewRef(causal);
  const candidates = ACTOR_IDS.filter(a => ACTORS[a].electoralMode === 'SATISFACCION' && ACTORS[a].electoralWeight >= 4);
  if (candidates.length === 0) return { actor: null, policy: null };

  // Atendido: alguna acción de los últimos 4 turnos lo mueve (demanda > 0).
  // Las de sistema (reunión, negociación, acuerdo) cuentan solo con ese actor.
  const recent = causal.executions.filter(e => !e.forced && e.turn >= causal.turn - equivalentTurns(4, causal));
  const attended = (actor: ActorId) => recent.some(e => {
    const def = CAUSAL_ACTIONS_BY_ID[e.actionId];
    if (!def || (def.isSystem && e.actor !== actor)) return false;
    return demandScore(causal, actor, e.actionId, ref) > 0;
  });
  const score = (a: ActorId) => ACTORS[a].electoralWeight * (55 - causal.actors[a].sat);
  const pool = candidates.filter(a => !attended(a));
  const ranked = (pool.length > 0 ? pool : candidates).slice().sort((x, y) => score(y) - score(x));
  const actor = ranked[0];

  const paLeft = paForTurn(causal);
  const since = causal.turn - equivalentTurns(6, causal);
  const executedRecently = new Set(causal.executions.filter(e => e.turn >= since).map(e => e.actionId));
  let best: { id: string; score: number; cost: number } | null = null;
  for (const action of POLICY_ACTIONS) {
    if (action.isFinancing || (action.category as string) === 'Emergencia' || executedRecently.has(action.id)) continue;
    const av = getAvailability(causal, action.id, [], paLeft);
    if (!av.visible || !av.available || av.needsDnu) continue;
    const s = demandScore(causal, actor, action.id, ref);
    if (s <= 0) continue;
    const cost = Math.max(0, -av.caja);
    if (!best || s > best.score || (s === best.score && cost < best.cost)) best = { id: action.id, score: s, cost };
  }
  return { actor, policy: best?.id ?? null };
}

// ─────────────────────────────── Evento ───────────────────────────────

export function isConsultantEvent(event: Pick<GameEvent, 'id'>): boolean {
  return event.id.startsWith(CONSULTANT_EVENT_PREFIX);
}

/**
 * El evento que muestra la pantalla y responde el bot. Solo lleva el discurso
 * y las tres opciones (válido para guardar); el dato de las encuestas y los
 * subtítulos se recalculan desde la visita pendiente (causal.consultant).
 */
export function consultantEventFor(visit: Pick<ConsultantVisit, 'election' | 'timing'> & Partial<Pick<ConsultantVisit, 'mandateStart'>>): GameEvent {
  return {
    id: consultantEventId(visit.election, visit.timing),
    type: 'triggered',
    category: 'political',
    severity: 'medium',
    title: CONSULTANT_NAME,
    description: consultantSpeech(visit.election, visit.timing, visit.mandateStart ?? 1),
    conditions: {},
    effects: { immediate: [] },
    probability: 1,
    choices: CONSULTANT_CHOICE_IDS.map(id => ({ id, text: CONSULTANT_OPTION_LABEL[id], effects: { immediate: [] } })),
  };
}

/** Índice de la visita sin responder (la del evento, si se indica; si no, la última pendiente); -1 si no hay. */
function activeVisitIndex(causal: CausalState, event?: Pick<GameEvent, 'id'>): number {
  const parsed = event ? parseConsultantEventId(event.id) : null;
  if (event && !parsed) return -1;
  const visits = causal.consultant?.visits ?? [];
  for (let i = visits.length - 1; i >= 0; i--) {
    const v = visits[i];
    if (v.choice !== null) continue;
    if (!parsed || (v.election === parsed.election && v.timing === parsed.timing)) return i;
  }
  return -1;
}

/** La visita sin responder (la del evento, si se indica; si no, la última pendiente). */
export function activeConsultantVisit(causal: CausalState, event?: Pick<GameEvent, 'id'>): ConsultantVisit | null {
  const index = activeVisitIndex(causal, event);
  return index >= 0 ? causal.consultant!.visits[index] : null;
}

/** La medida fijada por el encuestador en el turno actual no se puede quitar de la agenda. */
export function isLockedPolicy(causal: CausalState, actionId: string): boolean {
  const c = causal.consultant;
  return !!c && c.lockedPolicy === actionId && c.lockedTurn === causal.turn;
}

/**
 * Genera la visita que corresponde al turno recién empezado: la registra en
 * causal.consultant (choice null), avisa en notificaciones y devuelve el
 * evento para la pantalla. Null si no toca o si hay algo pendiente.
 */
export function createConsultantVisit(gameState: GameState): { state: GameState; event: GameEvent } | null {
  if (gameState.gameOver || gameState.pendingElection || gameState.pendingMidtermStrategy) return null;
  const causal = gameState.causal;
  const due = pendingConsultantVisit(causal);
  if (!due) return null;
  const previous = causal.consultant ?? emptyConsultantState();
  const firstOfElection = visitsForElection(previous, due.election, causal.mandateStart).length === 0;
  const { actor, policy } = pollRecommendation(causal);
  const visit: ConsultantVisit = {
    election: due.election,
    timing: due.timing,
    turn: causal.turn,
    mandateStart: causal.mandateStart,
    actor,
    policy,
    fee: consultantFee(due.election, due.timing),
    choice: null,
    ivDelta: 0,
  };
  // Cada elección arranca con bono 0 y rige hasta su cierre.
  const consultant: ConsultantState = {
    ...previous,
    visits: [...previous.visits, visit],
    bonusIv: firstOfElection ? 0 : previous.bonusIv,
    bonusUntil: firstOfElection ? consultantElectionClose(causal, due.election, causal.mandateStart) : previous.bonusUntil,
  };
  const state = addNotification({ ...gameState, causal: { ...causal, consultant } }, {
    type: 'event',
    category: 'political',
    title: `${CONSULTANT_NAME} pasó por el despacho`,
    message: CONSULTANT_NOTICE,
    importance: 'medium',
  });
  return { state, event: consultantEventFor(visit) };
}

// ─────────────────────────────── Respuesta ───────────────────────────────

/**
 * Aplica la opción elegida a la visita pendiente del evento: cobra el
 * honorario, fija la medida en la agenda del turno (descontando sus PA) y
 * guarda el bono de voto; recalcula la capa política para que el tablero lo
 * muestre ya.
 */
export function applyConsultantChoice(gameState: GameState, event: Pick<GameEvent, 'id'>, choiceId: string): GameState {
  if (!isConsultantChoice(choiceId) || gameState.gameOver) return gameState;
  const index = activeVisitIndex(gameState.causal, event);
  if (index < 0) return gameState;

  const causal = structuredClone(gameState.causal);
  const consultant = causal.consultant!;
  const visit = consultant.visits[index];
  const delta = consultantIvDelta(visit.election, visit.timing, choiceId);
  visit.choice = choiceId;
  visit.ivDelta = delta;
  consultant.bonusIv = visitsForElection(consultant, visit.election, visit.mandateStart).reduce((sum, v) => sum + v.ivDelta, 0);
  consultant.bonusUntil = consultantElectionClose(causal, visit.election, visit.mandateStart);

  let selectedActions = gameState.selectedActions;
  let actions = gameState.actions;
  let message: string | null = null;
  if (choiceId === 'encuestador') {
    // Como las encuestas: entra al resultado fiscal del cierre. Si no alcanza, la caja queda en rojo.
    causal.caja -= visit.fee;
    causal.immediateCosts += visit.fee;
    if (visit.policy) {
      if (selectedActions.includes(visit.policy)) {
        consultant.lockedPolicy = visit.policy;
        consultant.lockedTurn = causal.turn;
      } else {
        const pa = getAvailability(causal, visit.policy, selectedActions.map(actionId => ({ actionId })), actions).pa;
        if (pa <= actions) {
          selectedActions = [...selectedActions, visit.policy];
          actions -= pa;
          consultant.lockedPolicy = visit.policy;
          consultant.lockedTurn = causal.turn;
        } else {
          const name = CAUSAL_ACTIONS_BY_ID[visit.policy]?.name ?? visit.policy;
          message = `Gastón: ${name} no entró en la agenda, no te quedan acciones este turno. Los números igual los tenés.`;
        }
      }
    }
  }
  recomputePolitical(causal, viewRef(causal));
  return syncLegacy({ ...gameState, causal, selectedActions, actions, lastInteractionMessage: message ?? gameState.lastInteractionMessage });
}
