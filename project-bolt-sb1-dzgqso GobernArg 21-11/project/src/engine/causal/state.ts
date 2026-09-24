import {
  ACTOR_IDS,
  ACTORS,
  INDICATOR_IDS,
  INDICATORS,
  PARAMS,
  PLATFORMS,
  DESIGN_SCENARIO_ID,
  getScenario,
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
  /** Escenario de partida (por defecto, el del Excel: herencia pesada). */
  scenarioId?: string;
}

/** Estado inicial del país (valores de 01_INDICADORES y 02_ACTORES). */
export function createCausalState(opts: CreateOptions = {}): CausalState {
  const scenario = getScenario(opts.scenarioId ?? DESIGN_SCENARIO_ID);
  const base = {} as Record<IndicatorId, number>;
  for (const id of INDICATOR_IDS) base[id] = scenario.indicators?.[id] ?? INDICATORS[id].initial;

  const actors = {} as Record<ActorId, ActorState>;
  for (const a of ACTOR_IDS) {
    const rel0 = ACTORS[a].relInitial;
    actors[a] = {
      sat: 50,
      rel: rel0 === null ? null : Math.min(100, Math.max(0, rel0 + (opts.relBonus?.[a] ?? 0) + (scenario.relDelta?.[a] ?? 0))),
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
    caja: scenario.caja ?? PARAMS.CAJA_INICIAL,
    gastoCorr: scenario.gastoCorr ?? PARAMS.GASTO_CORR_INICIAL,
    deuda: scenario.deuda ?? PARAMS.DEUDA_INICIAL,
    ingresoMult: scenario.ingresoMult ?? 1,
    desanclaje: opts.desanclaje ?? scenario.desanclaje ?? PARAMS.DESANCLAJE_INICIAL,
    fiscalHistory: [],
    executions: [],
    actors,
    channelQueue: [],
    channelEventTurns: {},
    saliency: [],
    modifiers: [],
    political: {
      leg: 47, legAdj: scenario.legAdj ?? 0, gob: 50, apro: 50, estr: 50, otros: 50, iv: 50,
      imagen: opts.imagen ?? scenario.imagen ?? 50, umbralLey: PARAMS.UMBRAL_LEY,
      interna: 0, coalicion: 0,
    },
    platformId: opts.platformId ?? PLATFORMS[0].id,
    scenarioId: scenario.id,
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

  // Condiciones vigentes del escenario (p. ej. default de deuda).
  for (const [name, turns] of Object.entries(scenario.flags ?? {})) {
    state.flags[name] = { value: 1, start: 1, end: turns === null ? null : turns, source: `escenario:${scenario.id}` };
  }

  if (scenario.emergencia) {
    state.bonuses.push({
      id: `escenario.${scenario.id}.GOB`, target: 'GOB', value: scenario.emergencia.gob,
      start: 0, end: scenario.emergencia.turns - 1, source: 'escenario', label: 'Ley de emergencia',
    });
  }

  (scenario.impulsos ?? []).forEach((imp, i) => {
    state.agenda.push({
      uid: `escenario.${scenario.id}.${i}`, effectId: `escenario.${scenario.id}.${i}`, actionId: 'escenario', originTurn: 0,
      target: imp.target, mode: 'DELTA', magnitude: imp.perTurn, start: 1, end: imp.turns, everyTurn: true,
      appliedTotal: 0, explanation: imp.label,
    });
  });

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
