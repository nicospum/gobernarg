import {
  ACTOR_IDS,
  ACTORS,
  PARAMS,
  SENSITIVITIES,
  getPlatform,
  isIndicatorId,
  type ActorId,
  type SensitivityTarget,
} from '../../data/causal';
import { clamp, effective } from './context';
import type { CausalState } from './types';

/**
 * Satisfacción (00B_MOTOR, versión del prototipo):
 *   dev_i = 0.5·(v−50)/50 + 0.5·clamp((v−E)/K_REL, −1, 1)
 *   c_i   = s_i · dev_i   (×1.25 si c_i < 0: las malas noticias pesan más)
 *   SAT*  = 50 + 50·tanh(2·Σc_i / Σ|s_i|)
 *   SAT  += ALFA_SAT · (SAT* − SAT)
 * La satisfacción depende SÓLO de indicadores (y APRO/plataforma para actores
 * políticos). Nunca de acciones ni de reuniones (DC-4).
 */

export interface Contribution {
  target: SensitivityTarget;
  /** Indicador real (resuelve PLATAFORMA_n). */
  indicator: string;
  s: number;
  value: number;
  expectation: number;
  contribution: number;
}

function resolveTarget(state: CausalState, target: SensitivityTarget, baseS: number): { indicator: string; s: number } {
  if (target.startsWith('PLATAFORMA_')) {
    const idx = Number(target.slice(-1)) - 1;
    const item = getPlatform(state.platformId).items[idx];
    return item ? { indicator: item.indicator, s: item.s } : { indicator: 'APRO', s: 0 };
  }
  return { indicator: target, s: baseS };
}

function saliencyMult(state: CausalState, actor: ActorId, indicator: string, closeRef: number): number {
  let m = 1;
  for (const sal of state.saliency) {
    if (sal.actor === actor && sal.indicator === indicator && sal.end >= closeRef) m *= sal.mult;
  }
  return m;
}

export function contributions(state: CausalState, actor: ActorId, closeRef: number): Contribution[] {
  const out: Contribution[] = [];
  for (const sens of SENSITIVITIES[actor]) {
    const { indicator, s: rawS } = resolveTarget(state, sens.target, sens.s);
    if (rawS === 0) continue;
    const s = rawS * saliencyMult(state, actor, indicator, closeRef);
    const value = isIndicatorId(indicator) ? effective(state, indicator, closeRef) : state.political.apro;
    const expectation = state.expect[indicator] ?? value;
    const dev = 0.5 * (value - 50) / 50 + 0.5 * clamp((value - expectation) / PARAMS.K_REL, -1, 1);
    let c = s * dev;
    if (c < 0) c *= 1.25;
    out.push({ target: sens.target, indicator, s, value, expectation, contribution: c });
  }
  return out;
}

export function satisfactionTarget(state: CausalState, actor: ActorId, closeRef: number): number {
  const cs = contributions(state, actor, closeRef);
  const sumAbs = cs.reduce((a, c) => a + Math.abs(c.s), 0);
  if (sumAbs === 0) return 50;
  const sum = cs.reduce((a, c) => a + c.contribution, 0);
  return 50 + 50 * Math.tanh((2 * sum) / sumAbs);
}

/** T.7: la satisfacción se mueve ALFA_SAT hacia su objetivo. */
export function updateSatisfaction(state: CausalState, closeRef: number): void {
  const targets = {} as Record<ActorId, number>;
  for (const a of ACTOR_IDS) targets[a] = satisfactionTarget(state, a, closeRef);
  for (const a of ACTOR_IDS) {
    const st = state.actors[a];
    st.sat = clamp(st.sat + PARAMS.ALFA_SAT * (targets[a] - st.sat));
    st.lowStreak = st.sat < 45 ? st.lowStreak + 1 : 0;
  }
}

/**
 * Satisfacción "operativa" (canales y gobernabilidad): la oposición endurece
 * 2 turnos antes de cada elección (07: modificador de calendario −15).
 */
export function operativeSat(state: CausalState, actor: ActorId, turn: number): number {
  const sat = state.actors[actor].sat;
  if (actor === 'oposicion' && isPreElection(turn)) return clamp(sat - 15);
  return sat;
}

/** Turnos 7-8 y 15-16 de cada mandato (legislativas T8, presidenciales T16). */
export function isPreElection(turn: number): boolean {
  const inMandate = ((turn - 1) % PARAMS.TURNOS_MANDATO) + 1;
  return inMandate === 7 || inMandate === 8 || inMandate === 15 || inMandate === 16;
}

/** Top preocupaciones (contribuciones más negativas) y alivio principal. */
export function concerns(state: CausalState, actor: ActorId, closeRef: number): { worst: Contribution[]; best: Contribution | null } {
  const cs = contributions(state, actor, closeRef).filter(c => c.indicator !== 'APRO' || ACTORS[actor].electoralMode !== 'SATISFACCION');
  const sorted = [...cs].sort((a, b) => a.contribution - b.contribution);
  const worst = sorted.filter(c => c.contribution < -0.05).slice(0, 2);
  const bestCandidate = sorted[sorted.length - 1];
  return { worst, best: bestCandidate && bestCandidate.contribution > 0.05 ? bestCandidate : null };
}
