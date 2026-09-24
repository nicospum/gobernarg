/**
 * Runner de playtest: juega partidas completas con las MISMAS funciones que
 * usa la UI (createNewGame, interactWithActor, toggleActionSelection,
 * processEndTurn, applyEventChoice, resolvePendingElection,
 * triggerMidtermStrategy, hireAdvisors) y registra cada turno para poder
 * responder "¿por qué ocurrió esto?".
 */
import type { GameState } from '../types/game';
import { ACTOR_IDS, ACTORS, CAUSAL_ACTIONS_BY_ID, type ActorId } from '../data/causal';
import { availableAdvisors } from '../data/advisors';
import {
  applyEventChoice,
  createNewGame,
  hireAdvisors,
  interactWithActor,
  processEndTurn,
  resolvePendingElection,
  toggleActionSelection,
  triggerMidtermStrategy,
} from '../engine/gameEngine';
import { effective, immediateGastoDelta, nextRandom, projectedCloseCaja, repetitionWarning, viewRef } from '../engine/causal';
import { indicatorChanges } from '../lib/turnExplain';
import type { Bot } from './bots';

export const KEY_INDICATORS = ['INFL', 'ACTV', 'PODA', 'INVC', 'SOLV', 'EXTE', 'INFR', 'EDUC', 'PSOC', 'SEGU', 'INST', 'CONF'] as const;

export interface TurnLog {
  turn: number;
  term: number;
  year: number;
  quarter: number;
  actions: string[];
  interactions: string[];
  events: string[];
  indicatorsBefore: Record<string, number>;
  indicatorsAfter: Record<string, number>;
  causes: string[];
  channels: string[];
  pendingEffects: number;
  actors: Record<ActorId, { sat: number; rel: number | null }>;
  apro: number;
  iv: number;
  gob: number;
  leg: number;
  imagen: number;
  caja: number;
  deuda: number;
  gastoCorr: number;
  resultado: number;
  financiamiento: number;
  pa: number;
  notes: string[];
}

export interface GameOutcome {
  bot: string;
  seed: number;
  turnsPlayed: number;
  gameOver: boolean;
  victorious: boolean;
  defeatReason: string | null;
  reelectionVotes: number | null;
  successionVotes: number | null;
  midtermVotes: number[];
  finalIv: number;
  minGob: number;
  maxInfl: number;
  finalCaja: number;
  finalDeuda: number;
  meetings: number;
  agreementsSigned: number;
  agreementsBroken: number;
  channelEvents: number;
  log: TurnLog[];
}

/** Reemplaza Math.random por un generador con semilla durante la partida. */
function withSeededRandom<T>(seed: number, fn: () => T): T {
  const original = Math.random;
  let s = seed >>> 0;
  Math.random = () => {
    const [v, next] = nextRandom(s);
    s = next;
    return v;
  };
  try {
    return fn();
  } finally {
    Math.random = original;
  }
}

function snapshotIndicators(state: GameState): Record<string, number> {
  const c = state.causal;
  const out: Record<string, number> = {};
  for (const id of KEY_INDICATORS) out[id] = Math.round(effective(c, id, viewRef(c)) * 10) / 10;
  return out;
}

export function playGame(bot: Bot, seed: number, maxTurns = 40): GameOutcome {
  return withSeededRandom(seed, () => {
    let state = createNewGame('presidente', bot.archetype, `Bot ${bot.id}`, false, '', 'normal', undefined, seed);
    const log: TurnLog[] = [];
    const outcome: GameOutcome = {
      bot: bot.id, seed, turnsPlayed: 0, gameOver: false, victorious: false, defeatReason: null,
      reelectionVotes: null, successionVotes: null, midtermVotes: [], finalIv: 0, minGob: 100, maxInfl: 0,
      finalCaja: 0, finalDeuda: 0, meetings: 0, agreementsSigned: 0, agreementsBroken: 0, channelEvents: 0, log,
    };

    for (let i = 0; i < maxTurns && !state.gameOver; i++) {
      if (state.pendingMidtermStrategy) {
        state = triggerMidtermStrategy(state, bot.midterm(state, state.availableMidtermStrategies));
      }
      if (state.pendingElection) {
        state = resolvePendingElection(state, 'reelection');
        outcome.reelectionVotes = state.electionResults?.votesPercentage ?? null;
        state = { ...state, electionResults: null };
        if (state.gameOver) break;
      }

      // Asesores (una vez por partida, al principio).
      if (state.causal.turn === 1 && bot.advisors) {
        const wanted = availableAdvisors.filter(a => bot.advisors!(state).includes(a.id));
        state = hireAdvisors(state, wanted);
      }

      const before = snapshotIndicators(state);
      const interactions: string[] = [];
      for (const it of bot.interactions(state)) {
        const next = interactWithActor(state, it.actor, it.kind);
        if (next.causal !== state.causal) {
          interactions.push(`${it.kind} ${ACTORS[it.actor].shortName}: ${next.lastInteractionMessage ?? ''}`);
          if (it.kind === 'reunion') outcome.meetings++;
          if (it.kind === 'acuerdo') outcome.agreementsSigned++;
        }
        state = next;
      }
      for (const id of bot.policies(state)) {
        if (state.selectedActions.includes(id) || state.actions <= 0) continue;
        if (bot.avoidRepetition && repetitionWarning(state.causal, id)) continue;
        if (bot.fiscalGuard) {
          const sel = [...state.selectedActions, id].map(actionId => ({ actionId }));
          const p = projectedCloseCaja(state.causal, sel);
          if (p.caja < 150 || (p.structural < -60 && immediateGastoDelta(id) > 0)) continue;
        }
        state = toggleActionSelection(state, id);
      }
      const paUsed = state.baseActions - state.actions;

      const result = processEndTurn(state);
      state = result.state;
      const events: string[] = [];
      for (const ev of result.triggeredEvents) {
        if (ev.choices && ev.choices.length > 0) {
          const choice = bot.eventChoice(state, ev);
          state = applyEventChoice(state, ev, choice);
          events.push(`${ev.title} → ${ev.choices.find(c => c.id === choice)?.text ?? choice}`);
        } else {
          events.push(ev.title);
        }
      }
      if (state.legislativeResults && state.causal.records.length && (state.year === 3 && state.turn === 1) && !outcome.midtermVotes.includes(state.legislativeResults.officialismVotes)) {
        outcome.midtermVotes.push(state.legislativeResults.officialismVotes);
      }

      const c = state.causal;
      const record = c.records[c.records.length - 1];
      outcome.channelEvents += record.events.length;
      const actors = {} as TurnLog['actors'];
      for (const a of ACTOR_IDS) actors[a] = { sat: Math.round(c.actors[a].sat), rel: c.actors[a].rel === null ? null : Math.round(c.actors[a].rel!) };
      log.push({
        turn: record.turn,
        term: gameStateTerm(result.state),
        year: result.summary.year,
        quarter: result.summary.quarter,
        actions: record.actions.map(a => (CAUSAL_ACTIONS_BY_ID[a.actionId]?.name ?? a.actionId) + (a.forced ? ' (forzada)' : '') + (a.suspended ? ' (suspendida)' : '')),
        interactions,
        events,
        indicatorsBefore: before,
        indicatorsAfter: snapshotIndicators(state),
        causes: indicatorChanges(record, 4).map(ch => `${ch.name} ${ch.delta > 0 ? '+' : ''}${ch.delta.toFixed(1)}${ch.causes.length ? ` (${ch.causes.map(x => x.text).join('; ')})` : ''}`),
        channels: record.channelsApplied.map(ch => `${ch.label} (${ch.target} ${ch.value > 0 ? '+' : ''}${ch.value.toFixed(1)})`),
        pendingEffects: c.agenda.filter(e => e.start >= c.turn).length,
        actors,
        apro: round(c.political.apro),
        iv: round(c.political.iv),
        gob: round(c.political.gob),
        leg: round(c.political.leg),
        imagen: round(c.political.imagen),
        caja: Math.round(c.caja),
        deuda: Math.round(c.deuda),
        gastoCorr: Math.round(c.gastoCorr),
        resultado: Math.round(record.fiscal.resultado),
        financiamiento: Math.round(record.fiscal.financiamiento),
        pa: paUsed,
        notes: [...record.notes, ...record.relationEvents],
      });
      outcome.minGob = Math.min(outcome.minGob, c.political.gob);
      outcome.maxInfl = Math.max(outcome.maxInfl, effective(c, 'INFL', viewRef(c)));
    }

    const c = state.causal;
    outcome.turnsPlayed = log.length;
    outcome.gameOver = state.gameOver;
    outcome.victorious = state.victorious;
    outcome.defeatReason = state.defeatReason;
    if (state.electionResults?.kind === 'succession') outcome.successionVotes = state.electionResults.votesPercentage;
    outcome.finalIv = round(c.political.iv);
    outcome.finalCaja = Math.round(c.caja);
    outcome.finalDeuda = Math.round(c.deuda);
    outcome.agreementsBroken = c.agreements.filter(a => a.status === 'broken').length;
    outcome.minGob = round(outcome.minGob);
    outcome.maxInfl = round(outcome.maxInfl);
    return outcome;
  });
}

function gameStateTerm(s: GameState): number {
  return s.term;
}

function round(v: number): number {
  return Math.round(v * 10) / 10;
}
