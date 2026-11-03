/**
 * Gastón Barenboim, consultor político: calendario de visitas, dato de las
 * encuestas, efecto de cada respuesta, bono en la elección y guardado.
 */
import { afterEach, describe, expect, it, vi } from 'vitest';
import { ACTOR_IDS, ACTORS, CAUSAL_ACTIONS_BY_ID, POLICY_ACTIONS } from '../data/causal';
import { consultantEventId, consultantFee, consultantIvDelta, parseConsultantEventId } from '../data/consultor';
import {
  applyEventChoice,
  createNewGame,
  interactWithActor,
  processEndTurn,
  resolvePendingElection,
  toggleActionSelection,
  triggerMidtermStrategy,
} from '../engine/gameEngine';
import { canMeet, clamp, computeIv, demandScore, getAvailability, recomputePolitical, viewRef } from '../engine/causal';
import { paForTurn } from '../engine/causalBridge';
import { eventChoiceEffects } from '../engine/eventResolver';
import {
  activeConsultantVisit,
  consultantVisitTurn,
  isConsultantEvent,
  isLockedPolicy,
  pendingConsultantVisit,
  pollRecommendation,
} from '../engine/consultant';
import { calendarFor, type CalendarId } from '../lib/calendar';
import { encodeSavedGame, parseSavedGame } from '../lib/savegame';
import { validPendingEvents } from '../lib/savegameValidation';
import type { GameState } from '../types/game';
import type { GameEvent } from '../systems/events/types';
import type { ConsultantChoice } from '../engine/causal/types';

const game = (calendar?: CalendarId, seed = 1) =>
  createNewGame({ archetype: 'politico', governorName: 'Ana', seed, scenarioId: 'pais_en_calma', calendar });

type Answer = ConsultantChoice | ((event: GameEvent) => ConsultantChoice);

/** Deja el turno listo para cerrar: resuelve estrategia y elección pendientes y se reúne con tres actores. */
function prepare(state: GameState): GameState {
  if (state.pendingMidtermStrategy) state = triggerMidtermStrategy(state, 'negociar');
  if (state.pendingElection) state = { ...resolvePendingElection(state), electionResults: null };
  if (state.gameOver) return state;
  for (const actor of ACTOR_IDS) {
    if (state.baseActions - state.actions >= 3) break;
    if (canMeet(state.causal, actor, state.actions) === null) state = interactWithActor(state, actor, 'reunion');
  }
  return state;
}

/** Un turno como lo pide la interfaz, respondiéndole a Gastón si aparece. */
function playTurn(state: GameState, answer: Answer): { state: GameState; events: GameEvent[] } {
  state = prepare(state);
  if (state.gameOver) return { state, events: [] };
  const result = processEndTurn(state);
  state = result.state;
  const events = result.triggeredEvents.filter(isConsultantEvent);
  for (const event of events) state = applyEventChoice(state, event, typeof answer === 'function' ? answer(event) : answer);
  return { state, events };
}

/** Cierra turnos hasta la visita anticipada de las legislativas (turno 3 en Light). */
function firstVisit(calendar?: CalendarId) {
  let state = game(calendar);
  for (let n = 0; n < 4; n++) {
    const result = processEndTurn(state);
    state = result.state;
    const event = result.triggeredEvents.find(isConsultantEvent);
    if (event) return { state, event };
  }
  throw new Error('sin visita anticipada');
}

/** Intención de voto del mismo estado sin el bono del consultor. */
function ivWithoutBonus(state: GameState): number {
  const causal = structuredClone(state.causal);
  if (causal.consultant) causal.consultant.bonusIv = 0;
  recomputePolitical(causal, viewRef(causal));
  return causal.political.iv;
}

const IDS = [
  'consultor_legislativas_anticipado',
  'consultor_legislativas_ultimo_momento',
  'consultor_presidenciales_anticipado',
  'consultor_presidenciales_ultimo_momento',
];

afterEach(() => vi.restoreAllMocks());

describe('calendario de visitas', () => {
  it('turnos de visita por calendario e ids de evento', () => {
    const turns = (calendar: CalendarId) =>
      (['legislativas', 'presidenciales'] as const).flatMap(e => (['anticipado', 'ultimo_momento'] as const).map(t => consultantVisitTurn(calendar, e, t)));
    expect(turns('light-12')).toEqual([3, 5, 9, 11]);
    expect(turns('legacy-16')).toEqual([5, 7, 13, 15]);
    expect(consultantEventId('presidenciales', 'ultimo_momento')).toBe('consultor_presidenciales_ultimo_momento');
    expect(parseConsultantEventId('consultor_presidenciales_ultimo_momento')).toEqual({ election: 'presidenciales', timing: 'ultimo_momento' });
    expect(parseConsultantEventId('consultor_otra_cosa')).toBeNull();
    expect(parseConsultantEventId('paro_general')).toBeNull();
  });

  it.each([
    ['light-12', [3, 5, 9, 11]],
    ['legacy-16', [5, 7, 13, 15]],
  ] as const)('con instinto aparece cuatro veces por mandato en %s y se repite en el segundo mandato', (calendar, turns) => {
    vi.spyOn(Math, 'random').mockReturnValue(0.999);
    const { turnsPerMandate, totalTurns } = calendarFor(calendar);
    let state = game(calendar);
    const seen: string[] = [];
    let maxTerm = 1;
    for (let n = 0; n < totalTurns + 4 && !state.gameOver; n++) {
      const played = playTurn(state, 'instinto');
      state = played.state;
      maxTerm = Math.max(maxTerm, state.term);
      for (const event of played.events) seen.push(`${state.causal.turn}:${event.id}`);
    }
    expect(maxTerm).toBe(2);
    expect(seen).toEqual([0, turnsPerMandate].flatMap(offset => turns.map((t, i) => `${offset + t}:${IDS[i]}`)));
    const visits = state.causal.consultant!.visits;
    expect(visits.map(v => [v.mandateStart, v.election, v.timing, v.turn - v.mandateStart + 1, v.choice, v.ivDelta])).toEqual(
      [1, turnsPerMandate + 1].flatMap(ms => [
        [ms, 'legislativas', 'anticipado', turns[0], 'instinto', 0],
        [ms, 'legislativas', 'ultimo_momento', turns[1], 'instinto', 0],
        [ms, 'presidenciales', 'anticipado', turns[2], 'instinto', 0],
        [ms, 'presidenciales', 'ultimo_momento', turns[3], 'instinto', 0],
      ]),
    );
    expect(state.notifications.filter(n => n.title === 'Gastón Barenboim pasó por el despacho').length).toBeGreaterThan(0);
  });

  it('si en la anticipada hacés caso o mirás las redes, no vuelve a último momento', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.999);
    let state = game();
    const seen: string[] = [];
    for (let n = 0; n < 12 && !state.gameOver; n++) {
      const played = playTurn(state, event => (event.id.includes('legislativas') ? 'encuestador' : 'redes'));
      state = played.state;
      seen.push(...played.events.map(e => e.id));
    }
    expect(seen).toEqual(['consultor_legislativas_anticipado', 'consultor_presidenciales_anticipado']);
    expect(pendingConsultantVisit({ ...state.causal, turn: 11 })).toBeNull();
    expect(pendingConsultantVisit({ ...state.causal, turn: 5 })).toBeNull();
  });

  it('sin visita anticipada (partida de antes) igual aparece a último momento, y nunca fuera de sus turnos', () => {
    const causal = game().causal;
    expect(causal.consultant).toBeUndefined();
    expect(pendingConsultantVisit({ ...causal, turn: 5 })).toEqual({ election: 'legislativas', timing: 'ultimo_momento' });
    expect(pendingConsultantVisit({ ...causal, turn: 11 })).toEqual({ election: 'presidenciales', timing: 'ultimo_momento' });
    for (const turn of [1, 2, 4, 6, 7, 8, 10, 12]) expect(pendingConsultantVisit({ ...causal, turn }), String(turn)).toBeNull();
  });
});

describe('el dato de las encuestas', () => {
  it('elige un sector con votos no atendido y la medida disponible, no ejecutada hace poco, que más lo mueve', () => {
    const c = game().causal;
    const rec = pollRecommendation(c);
    expect(rec.actor).not.toBeNull();
    expect(rec.policy).not.toBeNull();
    const actor = rec.actor!;
    const policy = rec.policy!;
    expect(ACTORS[actor].electoralMode).toBe('SATISFACCION');
    expect(ACTORS[actor].electoralWeight).toBeGreaterThanOrEqual(4);
    const av = getAvailability(c, policy, [], paForTurn(c));
    expect(av.visible && av.available && !av.needsDnu).toBe(true);
    expect(CAUSAL_ACTIONS_BY_ID[policy].isFinancing).toBe(false);
    const score = demandScore(c, actor, policy, viewRef(c));
    expect(score).toBeGreaterThan(0);
    const best = Math.max(...POLICY_ACTIONS.filter(a => !a.isFinancing).map(a => {
      const x = getAvailability(c, a.id, [], paForTurn(c));
      return x.visible && x.available && !x.needsDnu ? demandScore(c, actor, a.id, viewRef(c)) : -Infinity;
    }));
    expect(score).toBe(best);

    // Ejecutada hace poco: no se vuelve a recomendar, y como mueve a ese sector, el sector ya cuenta como atendido.
    const recent = structuredClone(c);
    recent.executions.push({ actionId: policy, turn: c.turn - 1 });
    const again = pollRecommendation(recent);
    expect(again.actor).not.toBe(actor);
    expect(again.policy).not.toBe(policy);

    // Una ejecución forzada (suspendida o emisión del Tesoro) no cuenta como atender al sector.
    const forced = structuredClone(c);
    forced.executions.push({ actionId: policy, turn: c.turn - 1, forced: true });
    expect(pollRecommendation(forced).actor).toBe(actor);
    expect(pollRecommendation(forced).policy).not.toBe(policy);
  });

  it('si todos fueron atendidos, igual elige al de mayor peso por descontento', () => {
    const c = game().causal;
    const candidates = ACTOR_IDS.filter(a => ACTORS[a].electoralMode === 'SATISFACCION' && ACTORS[a].electoralWeight >= 4);
    const attended = structuredClone(c);
    for (const a of candidates) {
      const mover = POLICY_ACTIONS.find(p => demandScore(c, a, p.id, viewRef(c)) > 0);
      expect(mover, a).toBeDefined();
      attended.executions.push({ actionId: mover!.id, turn: c.turn - 1 });
    }
    const weight = (a: (typeof candidates)[number]) => ACTORS[a].electoralWeight * (55 - c.actors[a].sat);
    const expected = [...candidates].sort((x, y) => weight(y) - weight(x))[0];
    expect(pollRecommendation(attended).actor).toBe(expected);
  });
});

describe('las tres respuestas', () => {
  it('hacerle caso cobra el honorario, suma 4 de intención de voto y fija la medida en la agenda del turno', () => {
    const { state, event } = firstVisit();
    expect(event.id).toBe('consultor_legislativas_anticipado');
    expect(event.choices?.map(c => c.id)).toEqual(['encuestador', 'redes', 'instinto']);
    expect(eventChoiceEffects(event, 'encuestador')).toEqual([]);
    const visit = activeConsultantVisit(state.causal, event)!;
    expect(visit).toMatchObject({ election: 'legislativas', timing: 'anticipado', turn: 3, mandateStart: 1, fee: 150, choice: null, ivDelta: 0 });
    expect(visit.policy).not.toBeNull();
    const policy = visit.policy!;
    expect(state.selectedActions).toEqual([]);

    const after = applyEventChoice(state, event, 'encuestador');
    expect(after.causal.caja).toBeCloseTo(state.causal.caja - 150, 8);
    expect(after.causal.immediateCosts).toBeCloseTo(state.causal.immediateCosts + 150, 8);
    expect(after.budget).toBe(Math.round(after.causal.caja));
    expect(after.causal.consultant).toMatchObject({ bonusIv: 4, bonusUntil: 6, lockedPolicy: policy, lockedTurn: 3 });
    expect(after.causal.consultant!.visits[0]).toMatchObject({ choice: 'encuestador', ivDelta: 4 });
    expect(after.causal.political.iv).toBeCloseTo(clamp(ivWithoutBonus(after) + 4), 6);
    expect(after.votingIntention).toBeCloseTo(Math.round(after.causal.political.iv * 10) / 10, 6);
    const pa = getAvailability(state.causal, policy, [], state.actions).pa;
    expect(after.selectedActions).toEqual([policy]);
    expect(after.actions).toBe(state.actions - pa);
    expect(isLockedPolicy(after.causal, policy)).toBe(true);
    expect(toggleActionSelection(after, policy)).toBe(after);
    expect(activeConsultantVisit(after.causal)).toBeNull();
    // Responder dos veces no cobra dos veces.
    expect(applyEventChoice(after, event, 'encuestador')).toBe(after);

    // Al cerrar el turno la medida se ejecuta, el honorario entra al resultado fiscal y la fijación caduca sola.
    const closed = processEndTurn(after).state;
    expect(closed.causal.executions.some(e => e.actionId === policy && e.turn === 3)).toBe(true);
    expect(closed.causal.records[closed.causal.records.length - 1].fiscal.costoAcciones).toBeGreaterThanOrEqual(150);
    expect(isLockedPolicy(closed.causal, policy)).toBe(false);
    expect(toggleActionSelection({ ...closed, selectedActions: [policy], actions: closed.actions - pa }, policy).selectedActions).toEqual([]);
  });

  it('mirar las redes es gratis y resta 4; seguir el instinto no cambia nada y trae la visita a último momento', () => {
    const { state, event } = firstVisit();
    const redes = applyEventChoice(state, event, 'redes');
    expect(redes.causal.caja).toBe(state.causal.caja);
    expect(redes.causal.immediateCosts).toBe(state.causal.immediateCosts);
    expect(redes.selectedActions).toEqual([]);
    expect(redes.actions).toBe(state.actions);
    expect(redes.causal.consultant).toMatchObject({ bonusIv: -4, bonusUntil: 6, lockedPolicy: null, lockedTurn: null });
    expect(redes.causal.political.iv).toBeCloseTo(clamp(ivWithoutBonus(redes) - 4), 6);

    const instinto = applyEventChoice(state, event, 'instinto');
    expect(instinto.causal.caja).toBe(state.causal.caja);
    expect(instinto.selectedActions).toEqual([]);
    expect(instinto.causal.political.iv).toBeCloseTo(state.causal.political.iv, 6);
    expect(instinto.causal.consultant).toMatchObject({ bonusIv: 0, lockedPolicy: null });
    expect(instinto.causal.consultant!.visits[0]).toMatchObject({ choice: 'instinto', ivDelta: 0 });

    vi.spyOn(Math, 'random').mockReturnValue(0.999);
    let s = instinto;
    const ids: string[] = [];
    for (let n = 0; n < 2; n++) {
      const played = playTurn(s, 'instinto');
      s = played.state;
      ids.push(...played.events.map(e => e.id));
    }
    expect(ids).toEqual(['consultor_legislativas_ultimo_momento']);
    expect(s.causal.consultant!.visits[1]).toMatchObject({ election: 'legislativas', timing: 'ultimo_momento', turn: 5, fee: 350, choice: 'instinto' });

    let r = redes;
    const none: string[] = [];
    for (let n = 0; n < 2; n++) {
      const played = playTurn(r, 'instinto');
      r = played.state;
      none.push(...played.events.map(e => e.id));
    }
    expect(none).toEqual([]);
    expect(r.causal.consultant!.visits).toHaveLength(1);
  });

  it('a último momento vale 2 y cuesta 350; en presidenciales todo por 1,5', () => {
    expect(['anticipado', 'ultimo_momento'].map(t => consultantFee('legislativas', t as 'anticipado'))).toEqual([150, 350]);
    expect(['anticipado', 'ultimo_momento'].map(t => consultantFee('presidenciales', t as 'anticipado'))).toEqual([225, 525]);
    const deltas = (election: 'legislativas' | 'presidenciales') =>
      (['anticipado', 'ultimo_momento'] as const).flatMap(t => (['encuestador', 'redes', 'instinto'] as const).map(c => consultantIvDelta(election, t, c)));
    expect(deltas('legislativas')).toEqual([4, -4, 0, 2, -2, 0]);
    expect(deltas('presidenciales')).toEqual([6, -6, 0, 3, -3, 0]);

    vi.spyOn(Math, 'random').mockReturnValue(0.999);
    // Hasta el turno 9 siguiendo el instinto; la visita anticipada de presidenciales queda sin responder.
    let state = game();
    let event: GameEvent | undefined;
    for (let n = 0; n < 9 && !event; n++) {
      const result = processEndTurn(prepare(state));
      state = result.state;
      const found = result.triggeredEvents.find(isConsultantEvent);
      if (!found) continue;
      if (found.id === 'consultor_presidenciales_anticipado') event = found;
      else state = applyEventChoice(state, found, 'instinto');
    }
    expect(event?.id).toBe('consultor_presidenciales_anticipado');
    expect(activeConsultantVisit(state.causal, event!)).toMatchObject({ election: 'presidenciales', timing: 'anticipado', turn: 9, fee: 225 });
    const base = ivWithoutBonus(state);
    const yes = applyEventChoice(state, event!, 'encuestador');
    expect(yes.causal.caja).toBeCloseTo(state.causal.caja - 225, 8);
    expect(yes.causal.consultant).toMatchObject({ bonusIv: 6, bonusUntil: 12 });
    expect(yes.causal.political.iv).toBeCloseTo(clamp(base + 6), 6);
    const no = applyEventChoice(state, event!, 'redes');
    expect(no.causal.caja).toBe(state.causal.caja);
    expect(no.causal.consultant).toMatchObject({ bonusIv: -6, bonusUntil: 12 });
    expect(no.causal.political.iv).toBeCloseTo(clamp(base - 6), 6);

    // Instinto: vuelve en el 11 a 525 y con ±3.
    let s = applyEventChoice(state, event!, 'instinto');
    let late: GameEvent | undefined;
    for (let n = 0; n < 2; n++) {
      const result = processEndTurn(prepare(s));
      s = result.state;
      late = result.triggeredEvents.find(isConsultantEvent) ?? late;
    }
    expect(late?.id).toBe('consultor_presidenciales_ultimo_momento');
    expect(activeConsultantVisit(s.causal, late!)).toMatchObject({ turn: 11, fee: 525, choice: null });
    const b = ivWithoutBonus(s);
    const lateYes = applyEventChoice(s, late!, 'encuestador');
    expect(lateYes.causal.caja).toBeCloseTo(s.causal.caja - 525, 8);
    expect(lateYes.causal.consultant).toMatchObject({ bonusIv: 3, bonusUntil: 12 });
    expect(lateYes.causal.political.iv).toBeCloseTo(clamp(b + 3), 6);
    expect(applyEventChoice(s, late!, 'redes').causal.political.iv).toBeCloseTo(clamp(b - 3), 6);
  });
});

describe('el bono en la elección', () => {
  it('las legislativas lo incluyen y deja de regir después de su cierre', () => {
    const run = (bonus: number) => {
      vi.spyOn(Math, 'random').mockReturnValue(0.999);
      let state = game();
      let afterElection: GameState | null = null;
      for (let n = 1; n <= 8; n++) {
        state = playTurn(state, 'instinto').state;
        // Después de la última visita de las legislativas (turno 5), el bono queda como se pide.
        if (n === 4) state = { ...state, causal: { ...state.causal, consultant: { ...state.causal.consultant!, bonusIv: bonus } } };
        if (n === 6) afterElection = state;
      }
      vi.restoreAllMocks();
      return { afterElection: afterElection!, afterNext: state };
    };
    const plain = run(0);
    const boosted = run(4);
    expect(boosted.afterElection.causal.consultant!.bonusUntil).toBe(6);
    const p6 = boosted.afterElection.causal.political;
    expect(p6.iv).toBeCloseTo(clamp(computeIv(p6.apro, p6.estr, p6.otros) + 4), 6);
    expect(boosted.afterElection.legislativeResults!.officialismVotes - plain.afterElection.legislativeResults!.officialismVotes).toBeCloseTo(4, 5);
    // Cierre siguiente (turno 7): la intención de voto ya no lo incluye aunque el bono siga guardado
    // en ese momento; el registro del cierre lo muestra antes de que la visita de presidenciales lo reinicie.
    const records = boosted.afterNext.causal.records;
    const r6 = records.find(r => r.turn === 6)!.politicalAfter;
    const r7 = records.find(r => r.turn === 7)!.politicalAfter;
    expect(r6.iv).toBeCloseTo(clamp(computeIv(r6.apro, r6.estr, r6.otros) + 4), 6);
    expect(r7.iv).toBeCloseTo(clamp(computeIv(r7.apro, r7.estr, r7.otros)), 6);
    const p7 = boosted.afterNext.causal.political;
    expect(boosted.afterNext.causal.turn).toBe(9);
    expect(p7.iv).toBeCloseTo(clamp(computeIv(p7.apro, p7.estr, p7.otros)), 6);
    // En el 9 llega la anticipada de presidenciales: la elección nueva arranca con bono 0 hasta su cierre.
    expect(boosted.afterNext.causal.consultant).toMatchObject({ bonusIv: 0, bonusUntil: 12 });
    const visits = boosted.afterNext.causal.consultant!.visits;
    expect(visits[visits.length - 1]).toMatchObject({ election: 'presidenciales', timing: 'anticipado', turn: 9, choice: 'instinto' });
  });
});

describe('guardado', () => {
  it('la partida con el consultor y el evento pendiente se guarda y se carga igual', () => {
    const { state, event } = firstVisit();
    expect(validPendingEvents([event])).toBe(true);
    const parsed = parseSavedGame(encodeSavedGame(state, [event]));
    expect(parsed?.state).toEqual(state);
    expect(parsed?.pendingEvents).toEqual([event]);
    expect(parsed?.state.causal.consultant?.visits[0]).toMatchObject({ election: 'legislativas', timing: 'anticipado', choice: null });
    expect(activeConsultantVisit(parsed!.state.causal, parsed!.pendingEvents[0])).toEqual(state.causal.consultant!.visits[0]);
    const answered = applyEventChoice(state, event, 'encuestador');
    expect(parseSavedGame(encodeSavedGame(answered))?.state).toEqual(answered);
  });
});
