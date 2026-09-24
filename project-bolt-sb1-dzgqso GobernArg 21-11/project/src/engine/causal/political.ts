import { ACTOR_IDS, ACTORS, PARAMS, isOrganized, type ActorId } from '../../data/causal';
import { operativeSat } from './actors';
import { channelStatus } from './channels';
import { bonusSum, clamp, effective } from './context';
import { internaGobPenalty } from './interna';
import type { CausalState } from './types';

/**
 * Capa política (00B_MOTOR "POLÍTICO"), paso T.10.
 *
 *   APRO = 100·Σ EW·g(SAT)/Σ EW    (actores en modo SATISFACCION; g = logística)
 *   ESTR = Σ EW·(0.5·SAT + 0.5·REL)/Σ EW   (oficialismo, aliados, gobernadores)
 *   IV   = 0.65·APRO + 0.10·ESTR + 0.25·OTROS
 *   GOB  = 0.3·LEG_norm + 0.4·cooperación + 0.3·(100 − CONF)
 *
 * Reglas anti doble conteo: ningún indicador entra directo a IV (DC-1); OTROS
 * no lee indicadores (R-01/R-21): es la imagen del presidente/candidato, que
 * mueven eventos, habilidades y la campaña.
 */

const logistic = (x: number) => 1 / (1 + Math.exp(-(x - 50) / 10));

export function computeApro(state: CausalState): number {
  let num = 0;
  let den = 0;
  for (const a of ACTOR_IDS) {
    const def = ACTORS[a];
    if (def.electoralMode !== 'SATISFACCION' || def.electoralWeight <= 0) continue;
    num += def.electoralWeight * logistic(state.actors[a].sat);
    den += def.electoralWeight;
  }
  return den > 0 ? (100 * num) / den : 50;
}

/** Contribución de cada actor al componente de aprobación (para explicar la elección). */
export function aproBreakdown(state: CausalState): { actor: ActorId; weight: number; score: number }[] {
  const rows: { actor: ActorId; weight: number; score: number }[] = [];
  let den = 0;
  for (const a of ACTOR_IDS) {
    const def = ACTORS[a];
    if (def.electoralMode !== 'SATISFACCION' || def.electoralWeight <= 0) continue;
    den += def.electoralWeight;
  }
  for (const a of ACTOR_IDS) {
    const def = ACTORS[a];
    if (def.electoralMode !== 'SATISFACCION' || def.electoralWeight <= 0) continue;
    rows.push({ actor: a, weight: def.electoralWeight / den, score: 100 * logistic(state.actors[a].sat) });
  }
  return rows;
}

export function computeStructure(state: CausalState, structureBonus: number): number {
  let num = 0;
  let den = 0;
  for (const a of ACTOR_IDS) {
    const def = ACTORS[a];
    if (def.electoralMode !== 'ESTRUCTURA') continue;
    const st = state.actors[a];
    num += def.electoralWeight * (0.5 * st.sat + 0.5 * (st.rel ?? st.sat));
    den += def.electoralWeight;
  }
  const base = den > 0 ? num / den : 50;
  return clamp(base * state.perks.structureMult + structureBonus);
}

export function computeCooperation(state: CausalState, turn: number): number {
  let num = 0;
  let den = 0;
  for (const a of ACTOR_IDS) {
    if (!isOrganized(a)) continue;
    const def = ACTORS[a];
    const st = state.actors[a];
    num += def.influence * (0.5 * operativeSat(state, a, turn) + 0.5 * (st.rel ?? 50));
    den += def.influence;
  }
  return den > 0 ? num / den : 50;
}

export function legNorm(leg: number): number {
  return clamp((leg - 25) * 2);
}

export function computeLeg(state: CausalState, legStatus: number): number {
  const aliados = (state.actors.aliados.rel ?? 0) >= 40 ? PARAMS.LEG_ALIADOS : 0;
  return clamp(PARAMS.LEG_OFICIALISMO_BASE + aliados + state.political.legAdj + legStatus, 10, 90);
}

export function computeIv(apro: number, estr: number, otros: number): number {
  return clamp(PARAMS.PESO_APRO_EN_IV * apro + PARAMS.PESO_ESTRUCTURA_EN_IV * estr + PARAMS.PESO_OTROS_EN_IV * otros);
}

/**
 * Imagen del presidente (OTROS): regresa lentamente a 50 y sufre fatiga de
 * gestión. Modificadores temporales (estrategia, jugada audaz) la mueven.
 */
export function updateImagen(state: CausalState, close: number): void {
  const p = state.political;
  let delta = 0.05 * (50 - p.imagen) - 0.3;
  for (const m of state.modifiers) {
    if (m.imagenPerTurn && m.start <= close && close <= m.end) delta += m.imagenPerTurn;
  }
  p.imagen = clamp(p.imagen + delta);
}

/** Recalcula LEG, GOB, APRO, ESTR, OTROS e IV sobre el estado del cierre `close`. */
export function recomputePolitical(state: CausalState, close: number): void {
  const { legStatus, umbralLey, structureBonus } = channelStatus(state, close);
  const p = state.political;
  p.leg = computeLeg(state, legStatus);
  p.umbralLey = umbralLey;
  p.apro = computeApro(state);
  p.estr = computeStructure(state, structureBonus);
  p.otros = p.imagen;
  p.iv = computeIv(p.apro, p.estr, p.otros);
  const legEff = clamp(p.leg + bonusSum(state, 'LEG', close));
  p.gob = clamp(
    0.3 * legNorm(legEff)
    + 0.4 * computeCooperation(state, close)
    + 0.3 * (100 - effective(state, 'CONF', close))
    + bonusSum(state, 'GOB', close)
    - internaGobPenalty(state),
  );
}
