import {
  ACTOR_IDS,
  ACTORS,
  INDICATOR_IDS,
  INDICATORS,
  PARAMS,
  PLATFORMS,
  type ActorId,
  type IndicatorId,
} from '../../data/causal';
import { satisfactionTarget } from './actors';
import { computeApro, recomputePolitical } from './political';
import { pickDemand } from './relations';
import { debtService, revenue } from './fiscal';
import type { ActorState, CausalState, Perks } from './types';

export function defaultPerks(): Perks {
  return {
    freeMeetingsPerTurn: PARAMS.REUNIONES_GRATIS,
    freeMeetingActors: [],
    freePolls: false,
    eventResilience: 0,
    structureMult: 1,
    negotiationBonus: {},
    categoryEfficacy: {},
    paDiscountCategories: [],
    categoryCajaDiscount: {},
    securityInstMitigation: 0,
    loanDiscount: 0,
    reveals: [],
  };
}

export interface CreateOptions {
  platformId?: string;
  perks?: Perks;
  seed?: number;
  /** Imagen inicial del presidente (componente OTROS). */
  imagen?: number;
  /** Ajustes iniciales de relación por arquetipo. */
  relBonus?: Partial<Record<ActorId, number>>;
  /** Desanclaje inicial (herencia). */
  desanclaje?: number;
}

/** Estado inicial del país (valores de 01_INDICADORES y 02_ACTORES). */
export function createCausalState(opts: CreateOptions = {}): CausalState {
  const base = {} as Record<IndicatorId, number>;
  for (const id of INDICATOR_IDS) base[id] = INDICATORS[id].initial;

  const actors = {} as Record<ActorId, ActorState>;
  for (const a of ACTOR_IDS) {
    const rel0 = ACTORS[a].relInitial;
    actors[a] = {
      sat: 50,
      rel: rel0 === null ? null : Math.min(100, Math.max(0, rel0 + (opts.relBonus?.[a] ?? 0))),
      lastContact: null,
      revealedUntil: 0,
      lastMeeting: null,
      demand: null,
      offerUntil: null,
      lowStreak: 0,
    };
  }

  const state: CausalState = {
    turn: 1,
    mandateStart: 1,
    base,
    expect: { ...base, APRO: 50 },
    bonuses: [],
    agenda: [],
    flags: {},
    costMult: {},
    caja: PARAMS.CAJA_INICIAL,
    gastoCorr: PARAMS.GASTO_CORR_INICIAL,
    deuda: PARAMS.DEUDA_INICIAL,
    ingresoMult: 1,
    desanclaje: opts.desanclaje ?? PARAMS.DESANCLAJE_INICIAL,
    fiscalHistory: [],
    executions: [],
    actors,
    channelQueue: [],
    channelEventTurns: {},
    saliency: [],
    modifiers: [],
    political: {
      leg: 47, legAdj: 0, gob: 50, apro: 50, estr: 50, otros: 50, iv: 50,
      imagen: opts.imagen ?? 50, umbralLey: PARAMS.UMBRAL_LEY,
    },
    platformId: opts.platformId ?? PLATFORMS[0].id,
    agreements: [],
    credibility: 0,
    paPenaltyNextTurn: 0,
    freeMeetingsUsed: 0,
    immediateCosts: 0,
    forcedEmission: false,
    hyperStreak: 0,
    govCrisisStreak: 0,
    dissent: {},
    ruptures: [],
    records: [],
    rng: (opts.seed ?? 20260924) >>> 0,
    perks: opts.perks ?? defaultPerks(),
  };

  // SAT inicial = objetivo con los indicadores iniciales (E = valor: sin componente relativo).
  // Primero los actores no políticos (APRO depende de ellos), después APRO y los políticos.
  for (const a of ACTOR_IDS) {
    if (ACTORS[a].family !== 'Política') actors[a].sat = satisfactionTarget(state, a, 0);
  }
  state.political.apro = computeApro(state);
  state.expect.APRO = state.political.apro;
  for (const a of ACTOR_IDS) {
    if (ACTORS[a].family === 'Política') actors[a].sat = satisfactionTarget(state, a, 0);
  }
  recomputePolitical(state, 0);
  // Historial fiscal heredado: el promedio de 3 turnos (RESULT3, R19) arranca
  // con el resultado estructural inicial en lugar de vacío. Sin esto, un solo
  // turno de inversión hundía la solvencia (calibración de playtest).
  const inherited = revenue(state, 0) - state.gastoCorr - debtService(state);
  state.fiscalHistory = [inherited, inherited];
  for (const a of ACTOR_IDS) {
    if (actors[a].rel !== null) actors[a].demand = { actionId: pickDemand(state, a, 0) ?? '', createdTurn: 0, revealedTurn: null };
    if (actors[a].demand && !actors[a].demand.actionId) actors[a].demand = null;
  }
  return state;
}
