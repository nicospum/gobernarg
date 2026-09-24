import {
  ACTOR_IDS,
  CAUSAL_ACTIONS_BY_ID,
  INDICATOR_IDS,
  PARAMS,
  type ActorId,
  type IndicatorId,
} from '../../data/causal';
import { updateSatisfaction } from './actors';
import { cajaCost, type Selection } from './actions';
import { applyChannelQueue, evaluateChannels } from './channels';
import { countExecutions, effective, effectiveAll, flagValue } from './context';
import { applyAgenda, newAccumulator, scheduleActionEffects } from './effects';
import { closeFiscal, type ActionCashFlows } from './fiscal';
import { recomputePolitical, updateImagen } from './political';
import { changeRel, processRelations } from './relations';
import { COALITION_ACTIONS, expandCoalition, updateInterna } from './interna';
import { Rng } from './rng';
import { applyStructuralRules } from './rules';
import type { CausalState, PoliticalState, TurnActionRecord, TurnRecord } from './types';

export interface CloseResult {
  state: CausalState;
  record: TurnRecord;
  /** Eventos de canal disparados en este cierre (ids de CHANNEL_EVENTS). */
  channelEvents: string[];
}

function snapshotActors(state: CausalState): Record<ActorId, { sat: number; rel: number | null }> {
  const out = {} as Record<ActorId, { sat: number; rel: number | null }>;
  for (const a of ACTOR_IDS) out[a] = { sat: state.actors[a].sat, rel: state.actors[a].rel };
  return out;
}

/** Expira bonus, multiplicadores, saliencias y modificadores vencidos antes del cierre `c`. */
function expire(state: CausalState, c: number): void {
  state.bonuses = state.bonuses.filter(b => b.end >= c);
  state.saliency = state.saliency.filter(s => s.end >= c);
  state.modifiers = state.modifiers.filter(m => m.end >= c);
  for (const [k, v] of Object.entries(state.costMult)) if (v.end < c) delete state.costMult[k];
  for (const [k, f] of Object.entries(state.flags)) if (f.end !== null && f.end < c) delete state.flags[k];
}

/** Suspensión judicial / bloqueo de una acción (07 derechos_cultura, ambiente; DNU abusivo). */
function suspensionReason(state: CausalState, sel: Selection, rng: Rng, c: number): string | undefined {
  const action = CAUSAL_ACTIONS_BY_ID[sel.actionId];
  if (action.tags.includes('RESTRICTIVA') && state.actors.derechos_cultura.sat < 35 && rng.chance(0.25)) {
    return 'Suspendida por la justicia tras un litigio de organismos de derechos humanos.';
  }
  if (action.tags.includes('AMBIENTAL') && state.actors.ambiente.sat < 25 && rng.chance(0.3)) {
    return 'Frenada por un amparo ambiental.';
  }
  if (sel.viaDnu && countExecutions(state, 'dnu', 6, c) >= 3 && rng.chance(0.3)) {
    return 'La justicia suspendió el decreto por abuso de DNU.';
  }
  return undefined;
}

/**
 * Cierre de turno — secuencia T.2 a T.10 del Excel (00_README "LÓGICA DEL TURNO").
 * Función pura: devuelve un estado nuevo y el TurnRecord que explica el turno.
 */
export function closeTurn(input: CausalState, selections: Selection[]): CloseResult {
  const state: CausalState = structuredClone(input);
  const c = state.turn;
  const rng = new Rng(state.rng);
  const notes: string[] = [];

  const indicatorsBefore = effectiveAll(state, c - 1);
  const actorsBefore = snapshotActors(state);
  const politicalBefore: PoliticalState = { ...state.political };

  expire(state, c);

  // D-10: caja negativa en el cierre anterior → emisión forzada.
  const sels: Selection[] = [...selections];
  if (state.forcedEmission) {
    sels.unshift({ actionId: 'emitir_dinero', forced: true });
    state.forcedEmission = false;
    notes.push('Caja negativa: el Tesoro emitió para cubrir el déficit (emisión forzada).');
  }

  // Pacto social: emitir o devaluar durante su vigencia lo rompe (04 pacto_social).
  if (flagValue(state, 'pacto_social', c) && sels.some(s => s.actionId === 'emitir_dinero' || s.actionId === 'devaluacion')) {
    for (const a of ['sindicatos', 'industria', 'pymes'] as ActorId[]) changeRel(state, a, -15);
    delete state.flags.pacto_social;
    notes.push('Rompiste el pacto social: sindicatos, industria y PyMEs se sienten traicionados.');
  }

  // T.2 — ejecución: caja, historial, agenda de efectos.
  const flows: ActionCashFlows = { costoAcciones: state.immediateCosts, ingresosAcciones: 0, financiamiento: 0 };
  state.immediateCosts = 0;
  const cajaAntes = state.caja + flows.costoAcciones;
  const actions: TurnActionRecord[] = [];
  for (const sel of sels) {
    const action = CAUSAL_ACTIONS_BY_ID[sel.actionId];
    if (!action) continue;
    const suspended = suspensionReason(state, sel, rng, c);
    if (suspended) {
      state.executions.push({ actionId: sel.actionId, turn: c, forced: true });
      actions.push({ actionId: sel.actionId, caja: 0, scheduled: [], suspended });
      continue;
    }
    const caja = cajaCost(state, action);
    state.caja += caja;
    if (caja < 0) flows.costoAcciones += -caja;
    else if (action.isFinancing) flows.financiamiento += caja;
    else flows.ingresosAcciones += caja;
    state.executions.push({ actionId: sel.actionId, turn: c, forced: sel.forced });
    const scheduled = scheduleActionEffects(state, sel.actionId, c);
    if (COALITION_ACTIONS[sel.actionId]) expandCoalition(state, COALITION_ACTIONS[sel.actionId]);
    actions.push({ actionId: sel.actionId, caja, scheduled: scheduled.map(s => s.effectId), forced: sel.forced });
  }

  // T.3 — efectos cuyo turno llegó.
  const acc = newAccumulator();
  applyAgenda(state, c, acc);

  // T.4 — canales de poder agendados en el cierre anterior + modificadores por turno.
  const channelsApplied = applyChannelQueue(state, c);
  for (const m of state.modifiers) {
    if (m.start > c || m.end < c) continue;
    if (m.confPerTurn) state.base.CONF = Math.max(0, Math.min(100, state.base.CONF + m.confPerTurn));
    for (const [actor, d] of Object.entries(m.relPerTurn ?? {})) changeRel(state, actor as ActorId, d ?? 0);
  }

  // T.5 — fiscal.
  const fiscal = closeFiscal(state, c, cajaAntes, flows, acc.cajaEffects, acc.financingEffects);
  if (state.caja < 0) state.forcedEmission = true;

  // T.6 — reglas estructurales.
  const rules = applyStructuralRules(state, c);

  // T.7 — satisfacción de actores.
  updateSatisfaction(state, c);

  // T.8 — canales (se aplican el turno siguiente) y eventos de canal.
  const { scheduled: channelsScheduled, events: channelEvents } = evaluateChannels(state, c, rng);

  // T.9 — relaciones.
  const { messages: relationEvents } = processRelations(state, c);
  const interna = updateInterna(state);

  // T.10 — político, expectativas, contadores de derrota.
  updateImagen(state, c);
  recomputePolitical(state, c);
  for (const id of INDICATOR_IDS) {
    const v = effective(state, id, c);
    state.expect[id] += PARAMS.BETA_EXPECT * (v - state.expect[id]);
  }
  state.expect.APRO += PARAMS.BETA_EXPECT * (state.political.apro - state.expect.APRO);
  state.hyperStreak = effective(state, 'INFL', c) >= PARAMS.HIPER_UMBRAL ? state.hyperStreak + 1 : 0;
  state.govCrisisStreak = state.political.gob < PARAMS.GOB_CRISIS_UMBRAL ? state.govCrisisStreak + 1 : 0;

  const indicatorsAfter = effectiveAll(state, c) as Record<IndicatorId, number>;
  const record: TurnRecord = {
    turn: c,
    actions,
    applied: acc.applied,
    rules,
    channelsApplied,
    channelsScheduled,
    fiscal,
    indicatorsBefore,
    indicatorsAfter,
    actorsBefore,
    actorsAfter: snapshotActors(state),
    politicalBefore,
    politicalAfter: { ...state.political },
    relationEvents,
    events: channelEvents,
    notes,
    internaReasons: interna.reasons,
  };
  state.records = [...state.records, record].slice(-40);

  state.turn = c + 1;
  state.freeMeetingsUsed = 0;
  state.rng = rng.seed;
  return { state, record, channelEvents };
}
