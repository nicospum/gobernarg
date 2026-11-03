/**
 * Escenarios históricos con reglas nuevas (Corralito 2001 e Hiper 1989).
 *
 * Una partida histórica arranca con una EMERGENCIA de tres subrondas (semanas
 * o meses dentro del primer trimestre) en la que el jugador solo puede tomar
 * una medida extraordinaria por subronda. Cada subronda NO ejecuta un trimestre
 * completo: aplica (a) los efectos inmediatos de la medida elegida, (b) la
 * dinámica propia de la crisis (corrida de depósitos o aceleración de precios,
 * calle) y (c) una actualización parcial del humor de los actores. Lo diferido
 * de cada medida (y sus apuestas) queda en la agenda y llega con los cierres
 * trimestrales. Es una aproximación explícita: una subronda ≈ 3 a 4 semanas.
 *
 * Después de la emergencia sigue la GESTIÓN normal del calendario histórico,
 * con una medida extraordinaria por turno mientras sigan habilitadas y una
 * dinámica trimestral propia (liquidez bancaria, salida forzada de la
 * convertibilidad, economía dolarizada sin emisión).
 *
 * Las partidas guardadas antes de estas reglas no tienen `causal.crisis` y
 * siguen con sus reglas anteriores: nada de esto se aplica.
 */
import {
  ACTOR_IDS,
  CAUSAL_ACTIONS_BY_ID,
  CRISIS_META,
  getScenario,
  type CrisisScenarioDef,
  type IndicatorId,
  type ScenarioDef,
} from '../../data/causal';
import { satisfactionTarget } from './actors';
import { getAvailability, type Selection } from './actions';
import { FOREVER, clamp, effective, effectiveAll, flagValue, result3, viewRef } from './context';
import { countExecutions } from './context';
import { applyDelta, newAccumulator, scheduleActionEffects, type EffectAccumulator } from './effects';
import { recomputePolitical } from './political';
import { changeRel } from './relations';
import { Rng } from './rng';
import type { AppliedEffectRecord, CausalState, CrisisRoundRecord, CrisisState, RuleRecord, ScheduledEffect } from './types';

export type CrisisDefeat = 'resignation' | 'hyperinflation';

export const inCrisis = (state: CausalState): boolean => !!state.crisis;
export const inEmergency = (state: CausalState): boolean => state.crisis?.phase === 'emergencia';

export function crisisScenario(state: CausalState): CrisisScenarioDef | undefined {
  return state.crisis ? getScenario(state.scenarioId).crisis : undefined;
}

/** Etiqueta de la subronda actual ("Primera semana de diciembre"); vacía fuera de la emergencia. */
export function crisisRoundLabel(state: CausalState): string {
  const def = crisisScenario(state);
  if (!def || !state.crisis || !inEmergency(state)) return '';
  return def.rounds[state.crisis.round - 1] ?? '';
}

export function createCrisisState(scenario: ScenarioDef): CrisisState | undefined {
  const def = scenario.crisis;
  if (!def) return undefined;
  return {
    version: 1,
    kind: def.kind,
    phase: 'emergencia',
    round: 1,
    rounds: def.rounds.length,
    liquidez: def.liquidez ?? 0,
    aceleracion: 0,
    crisisStreak: 0,
    used: [],
    bets: {},
    log: [],
  };
}

// ─────────────────────────────── Lectura para la interfaz ───────────────────────────────

/** Índice de precios (0-100) → inflación mensual aproximada (%). Mapeo orientativo del catálogo, no una conversión exacta. */
const INFL_MAP: [number, number][] = [[0, 0], [20, 1], [40, 3], [60, 6], [80, 12], [90, 25], [95, 50], [98, 100], [100, 200]];

export function monthlyInflation(index: number): number {
  const v = clamp(index);
  for (let i = 1; i < INFL_MAP.length; i++) {
    const [x0, y0] = INFL_MAP[i - 1];
    const [x1, y1] = INFL_MAP[i];
    if (v <= x1) return Math.round((y0 + ((v - x0) / (x1 - x0)) * (y1 - y0)) * 10) / 10;
  }
  return 200;
}

export function monthlyInflationText(index: number): string {
  const pct = monthlyInflation(index);
  if (pct < 1) return 'precios estables';
  if (pct >= 100) return `más de ${Math.round(pct)} % mensual`;
  return `≈ ${pct >= 10 ? Math.round(pct) : pct} % mensual`;
}

export interface CrisisStatusLine {
  label: string;
  value: string;
  tone: 'good' | 'bad' | 'neutral';
}

function liquidezWord(l: number): { word: string; tone: CrisisStatusLine['tone'] } {
  if (l >= 50) return { word: 'estables', tone: 'good' };
  if (l > 25) return { word: 'con poca liquidez', tone: 'neutral' };
  if (l > 10) return { word: 'al límite', tone: 'bad' };
  return { word: 'colapsados', tone: 'bad' };
}

/** Estado de la crisis en palabras, para el bloque de emergencia. Solo lectura. */
export function crisisStatus(state: CausalState): CrisisStatusLine[] {
  const c = state.crisis;
  if (!c) return [];
  const f = (name: string) => !!flagValue(state, name, state.turn);
  const ref = viewRef(state);
  const infl = effective(state, 'INFL', ref);
  const out: CrisisStatusLine[] = [];
  const deuda: CrisisStatusLine = f('default_deuda')
    ? { label: 'Deuda', value: 'En default: sin crédito hasta renegociar', tone: 'bad' }
    : f('deuda_renegociada')
      ? { label: 'Deuda', value: 'Renegociada con quita, intereses reducidos', tone: 'good' }
      : { label: 'Deuda', value: 'Pagándose', tone: 'neutral' };
  if (c.kind === 'corralito') {
    out.push({
      label: 'Régimen cambiario',
      value: f('dolarizada') ? 'Economía dolarizada' : f('convertibilidad') ? 'Convertibilidad: 1 peso = 1 dólar' : 'Peso flotante',
      tone: f('dolarizada') ? 'neutral' : f('convertibilidad') ? 'neutral' : 'neutral',
    });
    const retiros = f('corralon') ? 'Reprogramados (corralón)' : f('corralito') ? 'Retiros limitados (corralito)' : f('corrida') ? 'Retiros libres: corrida en marcha' : 'Retiros libres';
    out.push({ label: 'Depósitos', value: retiros, tone: f('corralon') || f('corralito') ? 'bad' : f('corrida') ? 'bad' : 'good' });
    const lw = liquidezWord(c.liquidez);
    out.push({ label: 'Bancos', value: `Bancos ${lw.word}`, tone: lw.tone });
    out.push(deuda);
    out.push({ label: 'Precios', value: infl < 15 ? 'Deflación: los precios bajan' : monthlyInflationText(infl), tone: infl < 55 ? 'good' : infl < 75 ? 'neutral' : 'bad' });
  } else {
    const trend = c.aceleracion > 0.5 ? 'acelerando' : c.aceleracion < -0.5 ? 'frenando' : 'sin cambios';
    out.push({ label: 'Precios', value: `${monthlyInflationText(infl)} · ${trend}`, tone: infl >= 90 ? 'bad' : infl >= 70 ? 'neutral' : 'good' });
    out.push({ label: 'Moneda', value: f('nueva_moneda') ? 'Moneda nueva con respaldo' : f('dolarizada') ? 'Economía dolarizada' : 'Austral sin respaldo', tone: f('nueva_moneda') || f('dolarizada') ? 'good' : 'bad' });
    out.push(deuda);
    const conf = effective(state, 'CONF', ref);
    out.push({ label: 'Calle', value: f('estado_de_sitio') ? 'Estado de sitio vigente' : conf >= 70 ? 'Saqueos y protestas' : conf >= 55 ? 'Tensa' : 'Calma', tone: conf >= 70 ? 'bad' : conf >= 55 ? 'neutral' : 'good' });
    out.push({ label: 'Transición', value: f('transicion') ? 'Acordada con la oposición' : 'Sin acuerdo: gobierno saliente', tone: f('transicion') ? 'good' : 'neutral' });
  }
  return out;
}

/** Condiciones vigentes que la dinámica de la crisis mantiene (corrida, bancos). */
export function syncCrisisFlags(state: CausalState, decisionRef: number = state.turn): void {
  const c = state.crisis;
  if (!c || c.kind !== 'corralito') return;
  const set = (name: string, on: boolean) => {
    if (on) state.flags[name] = state.flags[name] ?? { value: 1, start: 0, end: null, source: 'crisis' };
    else delete state.flags[name];
  };
  const restringido = !!flagValue(state, 'corralito', decisionRef) || !!flagValue(state, 'corralon', decisionRef);
  set('corrida', c.liquidez < 50 && !restringido);
  set('bancos_al_limite', c.liquidez <= 25);
  set('bancos_estables', c.liquidez >= 50);
}

// ─────────────────────────────── Ejecución de medidas ───────────────────────────────

function bump(state: CausalState, id: IndicatorId, delta: number): void {
  state.base[id] = clamp(state.base[id] + delta);
}

/** Resuelve una medida incierta (renegociar la deuda, rescate del FMI): devuelve la pseudo-acción resultado. */
export function resolveUncertainMeasure(state: CausalState, actionId: string, rng: Rng, notes: string[]): string {
  const meta = CRISIS_META[actionId];
  const outcome = meta?.uncertain;
  if (!outcome) return actionId;
  const ref = viewRef(state);
  const solv = effective(state, 'SOLV', ref);
  const inst = effective(state, 'INST', ref);
  const relFin = state.actors.financiero.rel ?? 50;
  const fiscalOk = result3(state) >= 0;
  const diplomacia = countExecutions(state, 'agenda_internacional', 8, state.turn) > 0;
  let chance: number;
  if (actionId === 'negociar_deuda') {
    chance = 0.45 + 0.01 * (solv - 15) + 0.004 * (relFin - 30) + (fiscalOk ? 0.15 : 0) + (diplomacia ? 0.1 : 0);
  } else {
    chance = 0.35 + 0.012 * (solv - 15) + (fiscalOk ? 0.25 : 0) + 0.006 * (inst - 40) + (diplomacia ? 0.1 : 0);
  }
  chance = Math.min(0.9, Math.max(0.1, chance));
  const success = rng.chance(chance);
  const name = CAUSAL_ACTIONS_BY_ID[actionId]?.name ?? actionId;
  if (success) {
    if (actionId === 'negociar_deuda') {
      state.deuda = Math.round(state.deuda * 0.65);
      notes.push(`${name}: los acreedores aceptaron una quita del 35 %. La deuda baja y vuelve el crédito.`);
    } else {
      notes.push(`${name}: el Fondo aprobó el programa. Entran dólares con una meta fiscal que revisan en 4 trimestres.`);
    }
    return outcome.success;
  }
  notes.push(actionId === 'negociar_deuda'
    ? `${name}: los acreedores se levantaron de la mesa. Se puede volver a intentar más adelante.`
    : `${name}: el Fondo dijo que no. Sin superávit ni confianza no hay rescate.`);
  return outcome.failure;
}

/** Liquidez bancaria que mueve cada medida (Corralito): la mecánica bancaria no está en las filas de efectos. */
const LIQUIDEZ_POR_MEDIDA: Record<string, number> = {
  limitar_retiros: 6,
  reprogramar_depositos: 18,
  liberar_depositos: -8,
  rescate_fmi_exito: 10,
  dolarizar: 8,
  pesificar: -4,
  salir_convertibilidad: -3,
  cuasimonedas: 3,
};

/**
 * Tomar una medida extraordinaria es un impulso en sí mismo: el gobierno toma
 * el toro por las astas. Gobernabilidad por dos cierres e imagen.
 */
function decisionBoost(state: CausalState, actionId: string, startRef: number, endRef: number): void {
  if (CAUSAL_ACTIONS_BY_ID[actionId]?.outcome) return;
  state.bonuses.push({ id: `crisis.decision.${actionId}.${startRef}`, target: 'GOB', value: 4, start: startRef, end: endRef, source: actionId, label: 'Decisión de emergencia: el gobierno toma el control' });
  state.political.imagen = clamp(state.political.imagen + 2);
  const c = state.crisis;
  if (c && c.kind === 'corralito' && LIQUIDEZ_POR_MEDIDA[actionId]) c.liquidez = clamp(c.liquidez + LIQUIDEZ_POR_MEDIDA[actionId]);
}

/**
 * Ejecuta una medida extraordinaria en el CIERRE TRIMESTRAL (fase de gestión):
 * marca el uso, resuelve lo incierto y agenda los efectos como cualquier acción.
 * Devuelve lo agendado. La llama turn.ts.
 */
export function executeExtraordinaryAtClose(state: CausalState, actionId: string, turn: number, rng: Rng, notes: string[]): ScheduledEffect[] {
  const c = state.crisis;
  if (!c) return scheduleActionEffects(state, actionId, turn);
  if (!c.used.includes(actionId)) c.used.push(actionId);
  const resolved = resolveUncertainMeasure(state, actionId, rng, notes);
  if (resolved !== actionId) state.executions.push({ actionId: resolved, turn, forced: true });
  decisionBoost(state, actionId, turn, turn + 1);
  if (resolved !== actionId && LIQUIDEZ_POR_MEDIDA[resolved] && c.kind === 'corralito') c.liquidez = clamp(c.liquidez + LIQUIDEZ_POR_MEDIDA[resolved]);
  return scheduleActionEffects(state, resolved, turn);
}

function applyImmediate(state: CausalState, eff: ScheduledEffect, acc: EffectAccumulator, lines: string[]): void {
  const turn = state.turn;
  const ref = viewRef(state);
  if (eff.mode === 'BONUS') {
    // Visible ya (referencia de decisión) y vigente hasta el cierre que marca la duración.
    state.bonuses.push({ id: eff.uid, target: eff.target, value: eff.magnitude, start: ref, end: eff.end, source: eff.actionId, label: eff.explanation });
  } else if (eff.mode === 'SET') {
    if (eff.target.startsWith('FLAG:')) {
      state.flags[eff.target.slice(5)] = { value: eff.magnitude, start: turn, end: eff.end >= FOREVER ? null : eff.end, source: eff.actionId };
    } else if (eff.target.startsWith('COSTO_MULT:')) {
      state.costMult[eff.target.slice(11)] = { value: eff.magnitude, start: turn, end: eff.end };
    }
  } else {
    applyDelta(state, eff, eff.magnitude, acc);
    eff.appliedTotal += eff.magnitude;
    if (eff.everyTurn && eff.end > turn) {
      // Un efecto por cierre que arranca ya: el resto queda para los cierres siguientes.
      state.agenda.push({ ...eff, start: turn + 1 });
    }
  }
  acc.applied.push({ source: `action:${eff.actionId}`, actionId: eff.actionId, effectId: eff.effectId, originTurn: eff.originTurn, target: eff.target, delta: eff.magnitude, mode: eff.mode, explanation: eff.explanation });
  if (eff.explanation && (eff.mode !== 'DELTA' || Math.abs(eff.magnitude) >= 3 || !eff.target.match(/^[A-Z]{4}$/))) lines.push(eff.explanation);
}

/**
 * Ejecuta una medida en una SUBRONDA de la emergencia: lo inmediato se aplica
 * ya (semana), lo diferido queda en la agenda para los cierres trimestrales.
 */
function executeMeasureInRound(state: CausalState, actionId: string, rng: Rng, lines: string[], acc: EffectAccumulator): void {
  const c = state.crisis!;
  const turn = state.turn;
  const name = CAUSAL_ACTIONS_BY_ID[actionId]?.name ?? actionId;
  state.executions.push({ actionId, turn });
  if (!c.used.includes(actionId)) c.used.push(actionId);
  lines.push(`Medida de la ${crisisScenario(state)?.roundUnit ?? 'subronda'}: ${name}.`);
  const resolved = resolveUncertainMeasure(state, actionId, rng, lines);
  if (resolved !== actionId) state.executions.push({ actionId: resolved, turn, forced: true });
  decisionBoost(state, actionId, viewRef(state), turn);
  if (resolved !== actionId && LIQUIDEZ_POR_MEDIDA[resolved] && c.kind === 'corralito') c.liquidez = clamp(c.liquidez + LIQUIDEZ_POR_MEDIDA[resolved]);
  const scheduled = scheduleActionEffects(state, resolved, turn);
  const now = scheduled.filter(e => e.start === turn && !e.applyCondition);
  const nowIds = new Set(now.map(e => e.uid));
  state.agenda = state.agenda.filter(e => !nowIds.has(e.uid));
  for (const eff of now) applyImmediate(state, eff, acc, lines);
}

// ─────────────────────────────── Dinámica de la crisis ───────────────────────────────

function forcedExit(state: CausalState, lines: string[]): void {
  state.flags.convertibilidad = { value: 0, start: state.turn, end: null, source: 'crisis' };
  state.flags.regimen_flotante = { value: 1, start: state.turn, end: null, source: 'crisis' };
  bump(state, 'INFL', 15); bump(state, 'EXTE', 6); bump(state, 'PODA', -8); bump(state, 'INST', -4); bump(state, 'CONF', 6);
  state.desanclaje += 12;
  lines.push('Se acabaron las reservas: la convertibilidad se rompió sola, de la peor manera. El peso flota y los precios saltan.');
}

function bankCollapse(state: CausalState, lines: string[]): void {
  state.flags.crisis_bancaria = { value: 1, start: state.turn, end: null, source: 'crisis' };
  bump(state, 'INVC', -6); bump(state, 'ACTV', -4); bump(state, 'SOLV', -5); bump(state, 'CONF', 6);
  changeRel(state, 'financiero', -10);
  lines.push('Colapso bancario: los bancos se quedaron sin plata para devolver. Crédito, actividad y confianza por el piso.');
}

/** Dinámica de una subronda (semana) del Corralito. */
function corralitoRound(state: CausalState, lines: string[]): void {
  const c = state.crisis!;
  const f = (n: string) => !!flagValue(state, n, state.turn);
  const retiros = f('corralon') ? 'reprogramado' : f('corralito') ? 'limitado' : 'libre';
  const fijo = f('convertibilidad') && !f('dolarizada');
  if (retiros === 'libre') {
    c.liquidez -= 14;
    bump(state, 'EXTE', fijo ? -4 : -2); bump(state, 'INVC', -2);
    lines.push('La corrida sigue: los depósitos se van de los bancos y las reservas respaldan cada peso que sale.');
  } else if (retiros === 'limitado') {
    c.liquidez -= 3;
    bump(state, 'CONF', 3); bump(state, 'ACTV', -1.5); bump(state, 'PODA', -1);
    lines.push('Con los retiros limitados la plata no circula: comercio parado y cacerolas en los balcones.');
  } else {
    c.liquidez += 6;
    bump(state, 'CONF', 2);
    lines.push('Depósitos reprogramados: los bancos respiran y los ahorristas protestan en la puerta.');
  }
  c.liquidez = clamp(c.liquidez);
  if (c.liquidez <= 10 && !f('crisis_bancaria')) bankCollapse(state, lines);
  if (fijo && effective(state, 'EXTE', viewRef(state)) < 10) forcedExit(state, lines);
  let calle = 2;
  if (effective(state, 'PSOC', viewRef(state)) < 35) calle += 2;
  if (f('estado_de_sitio')) calle = 0;
  // La calle también se cansa: un tercio del decaimiento trimestral (R15).
  bump(state, 'CONF', 0.08 * (30 - effective(state, 'CONF', viewRef(state))));
  if (calle > 0) {
    bump(state, 'CONF', calle);
    lines.push(calle >= 4 ? 'Saqueos en el conurbano: la olla está vacía.' : 'Diciembre caliente: más gente en la calle.');
  } else {
    lines.push('Con el estado de sitio, la calle quedó vacía por la fuerza.');
  }
  bump(state, 'PSOC', -1);
  syncCrisisFlags(state);
}

/** Dinámica de una subronda (mes) de la Hiper. */
function hiperRound(state: CausalState, lines: string[]): void {
  const c = state.crisis!;
  const f = (n: string) => !!flagValue(state, n, state.turn);
  const ref = viewRef(state);
  const before = effective(state, 'INFL', ref);
  const exte = effective(state, 'EXTE', ref);
  let delta = 3 + 0.05 * (state.desanclaje - 20) - 0.04 * (exte - 16);
  if (f('congelamiento')) delta -= 2;
  if (f('nueva_moneda') || f('dolarizada')) delta -= 3;
  bump(state, 'INFL', delta);
  bump(state, 'PODA', f('congelamiento') ? -0.5 : -2);
  bump(state, 'ACTV', -1.5);
  bump(state, 'PSOC', -1);
  bump(state, 'EXTE', f('nueva_moneda') || f('dolarizada') ? -0.5 : -1);
  let calle = 3;
  if (effective(state, 'PSOC', ref) >= 35) calle -= 2;
  if (f('estado_de_sitio')) calle = 0;
  bump(state, 'CONF', 0.08 * (30 - effective(state, 'CONF', ref)));
  if (calle > 0) {
    bump(state, 'CONF', calle);
    lines.push(calle >= 4 ? 'Saqueos y cortes: la gente no llega a fin de mes, ni de semana.' : 'La calle sigue tensa, pero la ayuda llega.');
  } else {
    lines.push('Con el estado de sitio, la calle quedó vacía por la fuerza.');
  }
  const after = effective(state, 'INFL', ref);
  // El índice se satura en 100: en el techo, la aceleración es la presión que seguiría empujando (delta), no el cambio visible.
  c.aceleracion = Math.round((after >= 99.9 && delta > 0 ? Math.max(delta, after - before) : after - before) * 10) / 10;
  if (c.aceleracion > 0) state.desanclaje += 1;
  else if (c.aceleracion <= -5) state.desanclaje = Math.max(0, state.desanclaje - 2);
  lines.push(
    c.aceleracion > 0.5
      ? `Los precios siguen acelerando: ${monthlyInflationText(after)}. Nadie quiere quedarse con australes.`
      : c.aceleracion < -0.5
        ? `Los precios frenan: ${monthlyInflationText(after)}. Todavía es una hiper, pero cambió la tendencia.`
        : `Los precios se mantienen: ${monthlyInflationText(after)}.`,
  );
}

/** Humor de los actores en una subronda: la mitad de la velocidad de un trimestre. */
function partialSatisfaction(state: CausalState): void {
  const ref = viewRef(state);
  for (const a of ACTOR_IDS) {
    const target = satisfactionTarget(state, a, ref);
    state.actors[a].sat = clamp(state.actors[a].sat + 0.2 * (target - state.actors[a].sat));
  }
}

export interface CrisisRoundResult {
  state: CausalState;
  record: CrisisRoundRecord;
  defeat: CrisisDefeat | null;
}

/**
 * Cierra una subronda de la emergencia. Función pura: devuelve un estado nuevo.
 * El calendario no avanza (`turn` sigue en 1): lo que avanza es `crisis.round`.
 */
export function closeCrisisRound(input: CausalState, selections: Selection[]): CrisisRoundResult {
  const state = structuredClone(input);
  const c = state.crisis;
  if (!c || c.phase !== 'emergencia') throw new Error('No hay una emergencia en curso.');
  const def = crisisScenario(state)!;
  const rng = new Rng(state.rng);
  const lines: string[] = [];
  const acc = newAccumulator();
  const ref = viewRef(state);
  const label = def.rounds[c.round - 1] ?? `Subronda ${c.round}`;
  const indicatorsBefore = effectiveAll(state, ref);
  const gobBefore = state.political.gob;
  const cajaBefore = state.caja;

  // Una sola medida extraordinaria por subronda; se vuelve a verificar que esté disponible.
  const chosen = selections.map(s => s.actionId).filter(id => CAUSAL_ACTIONS_BY_ID[id]?.extraordinary);
  let measure: string | null = null;
  for (const id of chosen) {
    const av = getAvailability(state, id, [], 99);
    if (av.visible && av.available) { measure = id; break; }
    lines.push(`${CAUSAL_ACTIONS_BY_ID[id].name}: ya no está disponible (${av.reasons[0] ?? 'cambiaron las condiciones'}).`);
  }
  if (measure) executeMeasureInRound(state, measure, rng, lines, acc);
  else lines.push('Sin medidas extraordinarias esta vez.');

  if (c.kind === 'corralito') corralitoRound(state, lines);
  else hiperRound(state, lines);

  // El estado de sitio dura una subronda.
  if (state.flags.estado_de_sitio) delete state.flags.estado_de_sitio;

  partialSatisfaction(state);
  recomputePolitical(state, ref);

  // Derrotas propias de la emergencia.
  let defeat: CrisisDefeat | null = null;
  const gob = state.political.gob;
  const infl = effective(state, 'INFL', ref);
  const losing = c.kind === 'hiper' ? (infl >= 95 && c.aceleracion > 0) || gob < 15 : gob < 15;
  c.crisisStreak = losing ? c.crisisStreak + 1 : 0;
  if (c.crisisStreak >= 2) {
    defeat = c.kind === 'hiper' && infl >= 95 && c.aceleracion > 0 ? 'hyperinflation' : 'resignation';
  } else if (losing) {
    lines.push(c.kind === 'hiper' && infl >= 95
      ? 'Aviso: con los precios en el techo y acelerando, otro mes así y el gobierno cae.'
      : 'Aviso: sin gobernabilidad, otra subronda así y el presidente renuncia.');
  }

  const record: CrisisRoundRecord = {
    round: c.round,
    label,
    measure,
    lines,
    indicatorsBefore,
    indicatorsAfter: effectiveAll(state, ref),
    gobBefore,
    gobAfter: state.political.gob,
    cajaBefore,
    cajaAfter: state.caja,
  };
  c.log = [...c.log, record].slice(-10);
  c.round += 1;
  if (c.round > c.rounds && !defeat) {
    c.phase = 'gestion';
    c.crisisStreak = 0;
    lines.push(c.kind === 'hiper'
      ? 'Termina la emergencia: empieza la gestión por trimestres. Si los precios siguen en hiper dos trimestres, el gobierno cae.'
      : 'Termina la emergencia: empieza la gestión por trimestres con las medidas extraordinarias que sigan habilitadas.');
  }
  state.rng = rng.seed;
  return { state, record, defeat };
}

/**
 * Dinámica trimestral de la crisis (fase de gestión), T.6b del cierre:
 * liquidez bancaria y bancos, salida forzada de la convertibilidad.
 */
export function crisisQuarterRules(state: CausalState, close: number, notes: string[]): RuleRecord[] {
  const c = state.crisis;
  const out: RuleRecord[] = [];
  if (!c) return out;
  const f = (n: string) => !!flagValue(state, n, close + 1);
  if (c.kind === 'corralito') {
    const retiros = f('corralon') ? 'reprogramado' : f('corralito') ? 'limitado' : 'libre';
    const fijo = f('convertibilidad') && !f('dolarizada');
    const exte = effective(state, 'EXTE', close);
    const before = c.liquidez;
    if (retiros === 'libre') c.liquidez += exte >= 30 ? 6 : -6;
    else if (retiros === 'limitado') c.liquidez -= 1;
    else c.liquidez += 5;
    c.liquidez = clamp(c.liquidez);
    if (c.liquidez !== before) out.push({ ruleId: 'C01', target: 'LIQUIDEZ', delta: c.liquidez - before });
    if (c.liquidez <= 10 && !f('crisis_bancaria')) {
      const lines: string[] = [];
      bankCollapse(state, lines);
      notes.push(...lines);
      out.push({ ruleId: 'C02', target: 'INVC', delta: -6 });
    }
    if (fijo && exte < 10) {
      const lines: string[] = [];
      forcedExit(state, lines);
      notes.push(...lines);
      out.push({ ruleId: 'C03', target: 'INFL', delta: 15 });
    }
    // Las condiciones fijadas en este cierre rigen desde la decisión siguiente.
    syncCrisisFlags(state, close + 1);
  }
  return out;
}

/** Registra las apuestas resueltas en este cierre y las explica. */
export function noteCrisisBets(state: CausalState, applied: AppliedEffectRecord[], notes: string[]): void {
  const c = state.crisis;
  if (!c) return;
  const seen = new Set<string>();
  for (const a of applied) {
    const m = /^([a-z_]+)\.(bien|mal)\.\d+$/.exec(a.effectId ?? '');
    if (!m || !a.actionId || seen.has(a.actionId)) continue;
    seen.add(a.actionId);
    const outcome = m[2] as 'bien' | 'mal';
    c.bets[a.actionId] = outcome;
    const name = CAUSAL_ACTIONS_BY_ID[a.actionId]?.name ?? a.actionId;
    notes.push(outcome === 'bien' ? `La apuesta de "${name}" salió bien: ${a.explanation}` : `La apuesta de "${name}" explotó: ${a.explanation}`);
  }
}

/** Economía dolarizada: sin emisión, la caja en rojo se paga con atraso de sueldos y proveedores. */
export function dollarizedShortfall(state: CausalState, notes: string[]): void {
  bump(state, 'PODA', -3); bump(state, 'CONF', 6); bump(state, 'PSOC', -2);
  changeRel(state, 'sindicatos', -5);
  notes.push('Caja en rojo y sin emisión posible (economía dolarizada): sueldos y proveedores cobran con atraso.');
}
