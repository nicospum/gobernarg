import {
  ACTOR_IDS,
  ACTORS,
  CAUSAL_ACTIONS_BY_ID,
  EFFECTS_BY_ACTION,
  MEETINGS,
  PARAMS,
  SENSITIVITIES,
  getPlatform,
  isIndicatorId,
  isOrganized,
  type ActorId,
} from '../../data/causal';
import { contributions } from './actors';
import { clamp, decisionContext } from './context';
import { evalCondition } from './dsl';
import type { CausalState } from './types';

/**
 * Relación ≠ satisfacción (00B). La relación se mueve por vínculo: reuniones
 * (poco), acuerdos cumplidos (mucho), demandas atendidas, concesiones
 * explícitas, incumplimientos (castigo) y falta de contacto (deriva).
 */

export function changeRel(state: CausalState, actor: ActorId, delta: number): number {
  const st = state.actors[actor];
  if (st.rel === null) return 0;
  const before = st.rel;
  st.rel = clamp(before + delta);
  return st.rel - before;
}

function executedIn(state: CausalState, actionId: string, from: number, to: number): boolean {
  return state.executions.some(e => e.actionId === actionId && e.turn >= from && e.turn <= to && !e.forced);
}

/**
 * Puntaje de una acción como demanda de un actor: cuánto mejora los
 * indicadores que le importan, priorizando los que hoy le preocupan.
 */
export function demandScore(state: CausalState, actor: ActorId, actionId: string, closeRef: number): number {
  const rows = EFFECTS_BY_ACTION[actionId] ?? [];
  const contribs = contributions(state, actor, closeRef);
  const sens = new Map<string, number>();
  for (const s of SENSITIVITIES[actor]) {
    if (s.target.startsWith('PLATAFORMA_')) continue;
    sens.set(s.target, s.s);
  }
  if (actor === 'oficialismo') {
    for (const it of getPlatform(state.platformId).items) sens.set(it.indicator, it.s);
  }
  let score = 0;
  for (const r of rows) {
    if (r.magnitude === null || r.kind === 'REPETITION' || r.kind === 'CONDITIONAL') continue;
    if (r.target === `REL:${actor}` || r.target === 'REL:[actor]') { score += 6; continue; }
    if (!isIndicatorId(r.target)) continue;
    const s = sens.get(r.target);
    if (!s) continue;
    const worry = contribs.find(c => c.indicator === r.target);
    const urgency = 1 + Math.max(0, -(worry?.contribution ?? 0)) * 2;
    const dur = typeof r.duration === 'number' && r.kind === 'PERSISTENT' ? Math.min(r.duration, 6) : 1;
    score += s * r.magnitude * urgency * dur;
  }
  return score;
}

/** Elige la demanda más relevante entre las típicas del actor (08_REUNIONES). */
export function pickDemand(state: CausalState, actor: ActorId, closeRef: number): string | null {
  const ctx = decisionContext(state);
  const candidates = MEETINGS[actor]?.demandActionIds ?? [];
  let best: string | null = null;
  let bestScore = -Infinity;
  for (const id of candidates) {
    const def = CAUSAL_ACTIONS_BY_ID[id];
    if (!def) continue;
    if (def.visibleWhen && !evalCondition(def.visibleWhen, ctx)) continue;
    if (state.executions.some(e => e.actionId === id && e.turn > state.turn - 3)) continue;
    const score = demandScore(state, actor, id, closeRef);
    if (score > bestScore) { best = id; bestScore = score; }
  }
  return best;
}

export interface RelationOutcome {
  messages: string[];
}

/** T.9 — Acuerdos, demandas atendidas, deriva sin contacto y nuevas demandas. */
export function processRelations(state: CausalState, close: number): RelationOutcome {
  const messages: string[] = [];

  // Acuerdos: cumplir da mucho, incumplir castiga fuerte (+ credibilidad).
  for (const ag of state.agreements) {
    if (ag.status !== 'active') continue;
    const name = ACTORS[ag.actor].shortName;
    const actionName = CAUSAL_ACTIONS_BY_ID[ag.commitmentActionId]?.name ?? ag.commitmentActionId;
    if (executedIn(state, ag.commitmentActionId, ag.signedTurn, Math.min(close, ag.deadline))) {
      ag.status = 'fulfilled';
      changeRel(state, ag.actor, 8);
      state.actors[ag.actor].lastContact = close;
      messages.push(`Cumpliste el acuerdo con ${name} (${actionName}): la relación mejora.`);
    } else if (close >= ag.deadline) {
      ag.status = 'broken';
      changeRel(state, ag.actor, -20);
      state.credibility = Math.max(-50, state.credibility - 5);
      delete state.flags[`acuerdo_${ag.actor}`];
      messages.push(`Incumpliste el acuerdo con ${name} (${actionName}): la relación se rompe y tu palabra vale menos.`);
    }
  }

  for (const actor of ACTOR_IDS) {
    if (!isOrganized(actor)) continue;
    const st = state.actors[actor];

    // Demanda atendida.
    if (st.demand) {
      const d = st.demand;
      if (executedIn(state, d.actionId, close, close)) {
        const revealed = d.revealedTurn !== null && close - d.revealedTurn < PARAMS.VENTANA_DEMANDA;
        changeRel(state, actor, revealed ? 8 : 3);
        if (revealed) st.lastContact = close;
        messages.push(`${ACTORS[actor].shortName}: ${revealed ? 'valoran que atendiste su reclamo' : 'notan la medida que pedían'}.`);
        st.demand = null;
      } else if (close - d.createdTurn >= PARAMS.VENTANA_DEMANDA) {
        st.demand = null;
      }
    }

    // Deriva sin contacto: −dificultad/10 por turno tras 4 turnos sin contacto.
    const last = st.lastContact ?? 0;
    if (close - last >= 4) changeRel(state, actor, -(ACTORS[actor].interactionDifficulty ?? 0) / 10);

    // Nueva demanda si no hay.
    if (!st.demand) {
      const id = pickDemand(state, actor, close);
      if (id) st.demand = { actionId: id, createdTurn: close, revealedTurn: null };
    }
  }
  return { messages };
}
