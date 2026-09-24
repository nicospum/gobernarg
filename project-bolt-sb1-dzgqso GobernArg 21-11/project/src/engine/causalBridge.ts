/**
 * Puente entre el estado del juego (GameState, pantallas existentes) y el
 * motor causal (engine/causal). Todo lo que el juego viejo tenía y el Excel no
 * menciona (arquetipos, asesores, eventos, estrategias, elecciones) se conecta
 * acá, sin meter lógica del motor en los componentes React.
 */
import type { GameState, GroupMood, Archetype, MidtermStrategy, ElectionBreakdown } from '../types/game';
import {
  ACTOR_IDS,
  ACTORS,
  CAUSAL_ACTIONS_BY_ID,
  DEFAULT_PLATFORM_BY_ARCHETYPE,
  LEGACY_GROUP_TO_ACTOR,
  PARAMS,
  isActorId,
  isIndicatorId,
  type ActorId,
} from '../data/causal';
import { ADVISOR_ROLES } from '../data/advisors';
import { ARCHETYPE_PASSIVES } from '../data/specialAbilities';
import { MIDTERM_CAUSAL } from '../data/midtermStrategies';
import type { CausalEventEffect } from '../data/events/causalEvents';
import {
  clamp,
  createCausalState,
  defaultPerks,
  effective,
  effectiveLeg,
  legForLaws,
  lawThreshold,
  recomputePolitical,
  changeRel,
  Rng,
  viewRef,
  type CausalState,
  type Perks,
  type Selection,
} from './causal';

// ─────────────────────────────── Perks (arquetipo + asesores) ───────────────────────────────

/** Subgrupo viejo → actor con el que se puede tener reuniones. */
function meetingActorFor(legacyGroup: string): ActorId | null {
  if (legacyGroup === 'sectores-populares') return 'org_sociales';
  const a = LEGACY_GROUP_TO_ACTOR[legacyGroup];
  return a ?? (isActorId(legacyGroup) ? legacyGroup : null);
}

export function computePerks(archetype: Archetype, advisorIds: string[]): Perks {
  const p = defaultPerks();
  for (const passive of ARCHETYPE_PASSIVES[archetype] ?? []) {
    if (passive.electionRetention) p.structureMult *= 1 + 2 * passive.electionRetention;
    if (passive.incomeBonus) { /* se aplica al crear el estado (INGRESO_MULT) */ }
    for (const g of passive.freeInteractionGroups ?? []) {
      const a = meetingActorFor(g);
      if (a && !p.freeMeetingActors.includes(a)) p.freeMeetingActors.push(a);
    }
    if (passive.eventResilience) p.eventResilience += passive.eventResilience;
    if (passive.extraActions) p.freeMeetingsPerTurn += passive.extraActions;
    if (passive.extraLoans) p.loanDiscount += 0.1 * passive.extraLoans;
    if (passive.start?.freePolls) p.freePolls = true;
  }
  for (const id of advisorIds) {
    const role = ADVISOR_ROLES[id];
    if (!role) continue;
    for (const cat of role.categories) {
      p.categoryEfficacy[cat] = (p.categoryEfficacy[cat] ?? 1) * role.efficacy;
      if (role.paDiscount && !p.paDiscountCategories.includes(cat)) p.paDiscountCategories.push(cat);
      if (role.cajaDiscount) p.categoryCajaDiscount[cat] = (p.categoryCajaDiscount[cat] ?? 0) + role.cajaDiscount;
    }
    for (const [actor, bonus] of Object.entries(role.negotiation)) {
      p.negotiationBonus[actor as ActorId] = (p.negotiationBonus[actor as ActorId] ?? 0) + (bonus ?? 0);
    }
    for (const r of role.reveals) if (!p.reveals.includes(r)) p.reveals.push(r);
    if (role.freePolls) p.freePolls = true;
    if (role.eventResilience) p.eventResilience += role.eventResilience;
    if (role.securityInstMitigation) p.securityInstMitigation += role.securityInstMitigation;
    if (role.loanDiscount) p.loanDiscount += role.loanDiscount;
  }
  p.eventResilience = Math.min(0.6, p.eventResilience);
  return p;
}

/** Recalcula perks cuando cambian los asesores (contratar/despedir). */
export function refreshPerks(state: GameState): GameState {
  const causal = structuredClone(state.causal);
  causal.perks = computePerks(state.archetype, state.advisors.filter(a => a.isActive).map(a => a.id));
  return { ...state, causal };
}

// ─────────────────────────────── Creación ───────────────────────────────

export function newCausalForGame(archetype: Archetype, platformId?: string, seed?: number): CausalState {
  const relBonus: Partial<Record<ActorId, number>> = {};
  let imagen = 50;
  let desanclajeDelta = 0;
  let ingresoBonus = 0;
  for (const passive of ARCHETYPE_PASSIVES[archetype] ?? []) {
    for (const [a, v] of Object.entries(passive.start?.relBonus ?? {})) relBonus[a as ActorId] = (relBonus[a as ActorId] ?? 0) + (v ?? 0);
    imagen += passive.start?.imagen ?? 0;
    desanclajeDelta -= passive.start?.desanclaje ?? 0;
    ingresoBonus += (passive.incomeBonus ?? 0) * 0.15;
  }
  const causal = createCausalState({
    platformId: platformId ?? DEFAULT_PLATFORM_BY_ARCHETYPE[archetype],
    perks: computePerks(archetype, []),
    seed: seed ?? Math.floor(Math.random() * 2 ** 31),
    imagen,
    relBonus,
    desanclaje: Math.max(0, PARAMS.DESANCLAJE_INICIAL + desanclajeDelta),
  });
  causal.ingresoMult += ingresoBonus;
  recomputePolitical(causal, 0);
  return causal;
}

// ─────────────────────────────── Espejo de campos legacy ───────────────────────────────

/** Estado de ánimo (etiquetas del juego) a partir de satisfacción y relación. */
export function moodFor(sat: number, rel: number | null): GroupMood['mood'] {
  const coop = rel === null ? sat : 0.5 * sat + 0.5 * rel;
  if (coop >= 62) return 'contento';
  if (coop >= 50) return 'neutral';
  if (coop >= 40) return 'disconforme';
  if (coop >= 28) return 'enojado';
  return 'radicalizado';
}

/**
 * Proyecta el estado causal sobre los campos que leen las pantallas y los
 * sistemas conservados: popularidad → aprobación, presupuesto → caja,
 * estabilidad → gobernabilidad, legitimidad → instituciones, intención de
 * voto → IV, apoyo legislativo → bancas, relaciones de grupos → actores.
 */
export function syncLegacy(state: GameState): GameState {
  const c = state.causal;
  const ref = viewRef(c);
  const groupRelations: Record<string, number> = {};
  const groupMoods: GroupMood[] = [];
  for (const a of ACTOR_IDS) {
    const st = c.actors[a];
    groupRelations[a] = Math.round(st.rel ?? st.sat);
    groupMoods.push({ groupId: a, mood: moodFor(st.sat, st.rel), ignoredTurns: 0, lastSatisfiedTurn: 0 });
  }
  return {
    ...state,
    popularity: Math.round(c.political.apro * 10) / 10,
    votingIntention: Math.round(c.political.iv * 10) / 10,
    budget: Math.round(c.caja),
    stability: Math.round(c.political.gob * 10) / 10,
    legitimacy: Math.round(effective(c, 'INST', ref) * 10) / 10,
    legislativeSupport: Math.round(effectiveLeg(c, ref) * 10) / 10,
    groupRelations,
    groupMoods,
  };
}

// ─────────────────────────────── Turno ───────────────────────────────

/** Puntos de acción del turno (4 del Excel, menos los perdidos por un paro general). */
export function paForTurn(causal: CausalState): number {
  return Math.max(1, PARAMS.ACCIONES_POR_TURNO - causal.paPenaltyNextTurn);
}

/**
 * Traduce las acciones seleccionadas en `Selection`s del motor. Si hay un DNU
 * seleccionado, habilita UNA acción LEY sin mayoría (la primera elegida).
 */
export function selectionsFor(state: GameState): Selection[] {
  const causal = state.causal;
  const hasDnu = state.selectedActions.includes('dnu');
  let dnuUsed = false;
  return state.selectedActions.map(actionId => {
    const def = CAUSAL_ACTIONS_BY_ID[actionId];
    const lacksMajority = def?.ley && legForLaws(causal) < lawThreshold(causal);
    if (hasDnu && lacksMajority && !dnuUsed && !def.leyNoDnu) {
      dnuUsed = true;
      return { actionId, viaDnu: true };
    }
    return { actionId };
  });
}

// ─────────────────────────────── Efectos de eventos / habilidades ───────────────────────────────

/** Traducción por defecto de efectos del juego viejo (popularity/stability/budget/grupo). */
export function translateLegacyEffect(target: string, value: number): CausalEventEffect | null {
  switch (target) {
    case 'popularity': return { target: 'imagen', value: value * 0.4 };
    case 'stability': return { target: 'CONF', value: -value * 0.3 };
    case 'budget': return { target: 'CAJA', value };
    case 'legitimacy': return { target: 'INST', value: value * 0.3 };
    default: {
      const g = target.startsWith('group_') ? target.slice(6) : target;
      const actor = LEGACY_GROUP_TO_ACTOR[g] ?? (isActorId(g) ? g : undefined);
      if (!actor || !isActorId(actor)) return null;
      return ACTORS[actor].interactionDifficulty === null ? null : { target: `REL:${actor}`, value: value * 0.4 };
    }
  }
}

/**
 * Aplica efectos puntuales (eventos, habilidades, estrategias) al estado causal
 * fuera del cierre de turno. Muta `causal`. Devuelve el delta aplicado a la imagen.
 */
export function applyCausalEffects(causal: CausalState, effects: CausalEventEffect[], source: string, resilience = 0): void {
  const turn = causal.turn;
  const ref = viewRef(causal);
  for (const e of effects) {
    const t = e.target;
    if (isIndicatorId(t)) {
      if (e.mode === 'BONUS') {
        causal.bonuses.push({ id: `${source}.${t}.${turn}.${Math.round(e.value * 100)}`, target: t, value: e.value, start: ref, end: ref + Math.max(1, e.duration ?? 1) - 1, source, label: source });
      } else {
        causal.base[t] = clamp(causal.base[t] + e.value);
      }
    } else if (t === 'SOLV' || t === 'LEG') {
      if (e.mode === 'BONUS') {
        causal.bonuses.push({ id: `${source}.${t}.${turn}`, target: t, value: e.value, start: ref, end: ref + Math.max(1, e.duration ?? 1) - 1, source, label: source });
      } else if (t === 'LEG') {
        causal.political.legAdj += e.value;
      }
    } else if (t === 'CAJA') {
      causal.caja += e.value;
      if (e.value < 0) causal.immediateCosts += -e.value;
      else causal.immediateCosts -= e.value;
    } else if (t === 'DEUDA') {
      causal.deuda = Math.max(0, causal.deuda + e.value);
    } else if (t === 'GASTO_CORR') {
      causal.gastoCorr = Math.max(0, causal.gastoCorr + e.value);
    } else if (t === 'DESANCLAJE') {
      causal.desanclaje = Math.max(0, causal.desanclaje + e.value);
    } else if (t === 'imagen') {
      const v = e.value < 0 ? e.value * (1 - Math.min(0.8, resilience)) : e.value;
      causal.political.imagen = clamp(causal.political.imagen + v);
    } else if (t.startsWith('REL:')) {
      const actor = t.slice(4);
      if (isActorId(actor)) changeRel(causal, actor, e.value);
    } else if (t.startsWith('FLAG:')) {
      const name = t.slice(5);
      causal.flags[name] = { value: e.value, start: turn, end: e.duration ? turn + e.duration - 1 : null, source };
    }
  }
  recomputePolitical(causal, ref);
}

// ─────────────────────────────── Estrategia post-legislativa ───────────────────────────────

export function applyMidtermStrategy(causal: CausalState, strategy: MidtermStrategy): void {
  const def = MIDTERM_CAUSAL[strategy];
  const start = causal.turn;
  const mandateEnd = causal.mandateStart + PARAMS.TURNOS_MANDATO - 1;
  const end = def.duration === null ? mandateEnd : start + def.duration - 1;
  causal.modifiers.push({
    id: `midterm_${strategy}_${start}`,
    label: strategy,
    efficacy: def.efficacy,
    confPerTurn: def.confPerTurn,
    imagenPerTurn: def.imagenPerTurn,
    relPerTurn: def.relPerTurn,
    umbralLey: def.umbralLey,
    start,
    end,
  });
  if (def.after) {
    causal.modifiers.push({
      id: `midterm_${strategy}_after_${start}`,
      label: `${strategy} (rebote)`,
      confPerTurn: def.after.confPerTurn,
      imagenPerTurn: def.after.imagenPerTurn,
      start: end + 1,
      end: end + def.after.duration,
    });
  }
  if (def.legOnce) causal.political.legAdj += def.legOnce;
  if (def.imagenOnce) causal.political.imagen = clamp(causal.political.imagen + def.imagenOnce);
  recomputePolitical(causal, viewRef(causal));
}

// ─────────────────────────────── Elecciones ───────────────────────────────

export interface LegislativeOutcome {
  votes: number;
  newLeg: number;
  outcome: 'landslide' | 'clear' | 'tie' | 'minority' | 'defeat';
}

/**
 * Elecciones legislativas (T8 de cada mandato): se renueva la mitad del
 * Congreso según los votos del oficialismo (IV) y la relación con aliados.
 * 00B: "LEG se reinicia parcialmente en legislativas T8".
 */
export function legislativeElection(causal: CausalState): LegislativeOutcome {
  const rng = new Rng(causal.rng);
  const votes = clamp(causal.political.iv + (rng.next() - 0.5) * 4);
  causal.rng = rng.seed;
  const aliados = (causal.actors.aliados.rel ?? 0) >= 40 ? PARAMS.LEG_ALIADOS : 0;
  const current = causal.political.leg;
  const renewed = votes + aliados;
  const newLeg = clamp(0.5 * current + 0.5 * renewed, 10, 90);
  causal.political.legAdj += newLeg - current;
  recomputePolitical(causal, viewRef(causal));
  const outcome: LegislativeOutcome['outcome'] =
    votes > 45 ? 'landslide' : votes > 42 ? 'clear' : votes > 37 ? 'tie' : votes > 34 ? 'minority' : 'defeat';
  return { votes, newLeg: causal.political.leg, outcome };
}

/** Bonificación por incumbencia en la reelección (se conserva del juego: +5). */
export const INCUMBENCY_BONUS = 5;

export function presidentialVote(causal: CausalState, kind: 'reelection' | 'succession'): { votes: number; breakdown: ElectionBreakdown } {
  const rng = new Rng(causal.rng);
  const noise = (rng.next() - 0.5) * 3;
  causal.rng = rng.seed;
  const p = causal.political;
  const incumbencia = kind === 'reelection' ? INCUMBENCY_BONUS : 0;
  const votes = clamp(p.iv + incumbencia + noise);
  const electorate = ACTOR_IDS
    .filter(a => ACTORS[a].electoralMode === 'SATISFACCION' && ACTORS[a].electoralWeight > 0)
    .map(a => ({ actor: ACTORS[a].shortName, sat: Math.round(causal.actors[a].sat), w: ACTORS[a].electoralWeight }));
  const aFavor = electorate.filter(e => e.sat >= 50).sort((x, y) => y.sat * y.w - x.sat * x.w).slice(0, 3).map(({ actor, sat }) => ({ actor, sat }));
  const enContra = electorate.filter(e => e.sat < 45).sort((x, y) => x.sat * y.w - y.sat * x.w).slice(0, 3).map(({ actor, sat }) => ({ actor, sat }));
  return {
    votes,
    breakdown: {
      apro: p.apro,
      estructura: p.estr,
      otros: p.otros,
      incumbencia,
      aFavor,
      enContra,
    },
  };
}
