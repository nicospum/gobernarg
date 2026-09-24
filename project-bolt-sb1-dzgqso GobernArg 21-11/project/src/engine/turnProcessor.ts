import type {
  GameState,
  TurnSummary,
  TurnLogEntry,
} from '../types/game';
import type { GameEvent } from '../systems/events/types';
import { getAllEvents } from '../data/events';
import { CHANNEL_GAME_EVENTS, CHANNEL_TO_EVENT } from '../data/events/causalEvents';
import { ACTORS, CAUSAL_ACTIONS_BY_ID } from '../data/causal';
import { getAvailableElectionOptions } from '../utils/electionSystem';
import { updateObjectives, checkCausalDefeat } from '../utils/victoryConditions';
import { addNotification, type TurnResult } from './engineShared';
import { processCalendarEvents, resolveLegislativeConsequences, resolveRandomEvents, applyImmediateEventEffects } from './eventResolver';
import { finalizePresidentialCareer } from './electionEngine';
import { generateTurnIntro } from './narrativeEngine';
import { applyArchetypePassives } from './archetypeEngine';
import { CHANNEL_EVENTS, closeTurn, countExecutions, effective, viewRef, type TurnRecord } from './causal';
import { paForTurn, selectionsFor, syncLegacy } from './causalBridge';

// ===========================
// Perfil de gestión (narrativo)
// ===========================

/**
 * Los ejes ideológicos ya no mueven mecánicas (D-07: los reemplaza la
 * plataforma del oficialismo). Se conservan como PERFIL de gestión en la
 * pantalla de legado, alimentado por las decisiones concretas.
 * [radical(−)↔conciliador(+), populista(−)↔técnico(+), cerrado(−)↔convocante(+)]
 */
const PROFILE_SHIFTS: Record<string, [number, number, number]> = {
  pacto_social: [6, 0, 3], acuerdo: [3, 0, 3], negociacion: [1, 0, 2], reunion: [0, 0, 1],
  transparencia_anticorrupcion: [2, 1, 1], ampliar_coalicion: [2, 0, 3], transferencias_provincias: [0, -1, 1],
  mano_dura: [-6, 0, -3], dnu: [-5, 0, -5], reforma_laboral: [-3, 2, -1], privatizacion: [-3, 3, 0],
  control_cambios: [-2, -1, 0], subir_retenciones: [-2, -1, 0],
  emitir_dinero: [0, -5, 0], congelar_tarifas: [0, -4, 0], control_precios: [0, -4, 0], bono_jubilados: [0, -3, 0],
  aumento_salarial: [0, -2, 0], suba_salario_minimo: [0, -3, 0], asistencia_alimentaria: [0, -2, 0],
  politica_monetaria_contractiva: [0, 5, 0], reduccion_gasto: [0, 4, -1], actualizar_tarifas: [0, 4, 0],
  mejorar_recaudacion: [0, 3, 0], reforma_tributaria: [0, 3, 0], prestamo_internacional: [0, 2, 0],
  financiamiento_ciencia: [0, 2, 0], liberar_cambios: [1, 3, 0],
};

function clampAxis(v: number): number {
  return Math.max(-100, Math.min(100, v));
}

function applyProfile(state: GameState, actionIds: string[]): void {
  for (const id of actionIds) {
    const shift = PROFILE_SHIFTS[id];
    if (!shift) continue;
    state.radicalConciliadorAxis = clampAxis(state.radicalConciliadorAxis + shift[0]);
    state.populistaTecnicoAxis = clampAxis(state.populistaTecnicoAxis + shift[1]);
    state.cerradoConvocanteAxis = clampAxis(state.cerradoConvocanteAxis + shift[2]);
  }
}

// ===========================
// Advertencias
// ===========================

function addWarningNotifications(state: GameState): GameState {
  const c = state.causal;
  const ref = viewRef(c);
  const infl = effective(c, 'INFL', ref);
  if (c.hyperStreak === 1) {
    state = addNotification(state, { type: 'warning', category: 'economy', title: 'Al borde de la hiperinflación', message: 'La inflación está fuera de control. Otro trimestre así y el gobierno cae.', importance: 'critical' });
  } else if (infl >= 78) {
    state = addNotification(state, { type: 'warning', category: 'economy', title: 'Inflación desbocada', message: 'Los precios se aceleran y erosionan salarios, crédito y recaudación.', importance: 'high' });
  }
  if (c.govCrisisStreak === 1) {
    state = addNotification(state, { type: 'warning', category: 'political', title: 'Crisis de gobernabilidad', message: 'El gobierno perdió capacidad de gobernar. Si no se recupera el próximo trimestre, avanza el juicio político.', importance: 'critical' });
  } else if (c.political.gob < 28) {
    state = addNotification(state, { type: 'warning', category: 'political', title: 'Gobernabilidad en riesgo', message: 'Congreso, actores y calle te dan cada vez menos margen.', importance: 'high' });
  }
  if (c.caja < 0) {
    state = addNotification(state, { type: 'warning', category: 'economy', title: 'Caja en rojo', message: 'Sin fondos, el Tesoro va a emitir para cubrir el déficit: eso alimenta la inflación.', importance: 'critical' });
  }
  if (effective(c, 'SOLV', ref) < 25) {
    state = addNotification(state, { type: 'warning', category: 'economy', title: 'Riesgo país extremo', message: 'El mercado local de deuda está cerrado y las expectativas se despegan.', importance: 'high' });
  }
  return state;
}

// ===========================
// Eventos de canal → eventos del juego (con imagen y opciones)
// ===========================

function channelGameEvents(ids: string[]): GameEvent[] {
  const all = getAllEvents();
  const out: GameEvent[] = [];
  for (const id of ids) {
    const mapped = CHANNEL_TO_EVENT[id];
    const ev = mapped ? all.find(e => e.id === mapped) : CHANNEL_GAME_EVENTS[id];
    if (ev) out.push(ev);
  }
  return out;
}

function recordLines(record: TurnRecord): string[] {
  const lines: string[] = [];
  for (const a of record.actions) {
    const name = CAUSAL_ACTIONS_BY_ID[a.actionId]?.name ?? a.actionId;
    if (a.suspended) lines.push(`${name}: ${a.suspended}`);
  }
  lines.push(...record.notes);
  lines.push(...record.relationEvents);
  for (const id of record.events) {
    const def = CHANNEL_EVENTS[id];
    if (def) lines.push(`${def.title} (${ACTORS[def.actor].shortName}).`);
  }
  return lines;
}

// ===========================
// Procesar fin de turno
// ===========================

export function processEndTurn(gameState: GameState): TurnResult {
  let state: GameState = {
    ...gameState,
    completedActions: [...gameState.completedActions],
    completedObjectives: [...gameState.completedObjectives],
    turnLog: [...gameState.turnLog],
    historicalPopularity: [...gameState.historicalPopularity],
    historicalBudget: [...gameState.historicalBudget],
    actionUsageCount: { ...gameState.actionUsageCount },
    lastEventFiredTurns: { ...gameState.lastEventFiredTurns },
    notifications: [...gameState.notifications],
  };
  const narrative = generateTurnIntro(state);

  // Bloquear avance si hay estrategia post-legislativa pendiente.
  if (state.pendingMidtermStrategy) {
    return {
      state,
      summary: {
        year: state.year,
        quarter: state.turn,
        events: ['Definición de estrategia post-legislativa pendiente.'],
        popularityChange: 0,
        budgetChange: 0,
        inflationEvent: { triggered: false, count: 0 },
        immediateEffects: { popularityChange: 0, budgetChange: 0 },
      },
      triggeredEvents: [],
      narrative,
    };
  }

  const aproBefore = state.causal.political.apro;
  const cajaBefore = state.causal.caja;
  const closingYear = state.year;
  const closingQuarter = state.turn;

  // 1. Cierre del turno en el motor causal (T.2–T.10).
  const selections = selectionsFor(state);
  const { state: causal, record, channelEvents } = closeTurn(state.causal, selections);
  state.causal = causal;
  const executedIds = record.actions.filter(a => !a.suspended).map(a => a.actionId);
  for (const id of executedIds) {
    if (!state.completedActions.includes(id)) state.completedActions.push(id);
    state.actionUsageCount[id] = (state.actionUsageCount[id] ?? 0) + 1;
  }
  const systemThisTurn = causal.executions.filter(e => e.turn === record.turn && ['reunion', 'negociacion', 'acuerdo'].includes(e.actionId)).map(e => e.actionId);
  applyProfile(state, [...executedIds, ...systemThisTurn]);
  state = syncLegacy(state);

  // 2. Calendario político (legislativas con la IV de este cierre, estrategia).
  state = processCalendarEvents(state);

  // 3. Consecuencias del resultado legislativo.
  state.causal = structuredClone(state.causal);
  state = resolveLegislativeConsequences(state);

  // 4. Eventos de canal (paro general, corrida, cacerolazo…) con opciones de respuesta.
  const fromChannels = channelGameEvents(channelEvents);

  // 5. Eventos aleatorios y contextuales conectados a indicadores/actores.
  const randomEvents = resolveRandomEvents(state);
  for (const ev of randomEvents) applyImmediateEventEffects(state, ev);
  const triggeredEvents = [...fromChannels, ...randomEvents];

  // 6. Noticias del turno.
  for (const ev of triggeredEvents) {
    state = addNotification(state, {
      type: ev.type === 'crisis' ? 'crisis' : 'event',
      category: ev.category === 'political' ? 'political' : ev.category === 'economic' ? 'economy' : 'social',
      title: ev.title,
      message: ev.description,
      importance: ev.severity === 'critical' ? 'critical' : ev.severity === 'high' ? 'high' : 'medium',
    });
  }
  const lines = recordLines(record);
  for (const msg of record.relationEvents) {
    state = addNotification(state, { type: 'info', category: 'social', title: 'Relación con actores', message: msg, importance: 'medium' });
  }
  for (const note of record.notes) {
    state = addNotification(state, { type: 'warning', category: 'economy', title: 'Aviso', message: note, importance: 'high' });
  }

  // 7. Fin de mandato: elección presidencial (o de sucesión en el 2º mandato).
  const isEndOfTerm = state.year === 4 && state.turn === 4;
  if (isEndOfTerm) {
    state.pendingElection = true;
    state.pendingElectionOptions = getAvailableElectionOptions(state);
    if (state.position === 'presidente' && state.pendingElectionOptions.length === 0) {
      state.pendingElection = false;
      state.pendingElectionOptions = [];
      state = finalizePresidentialCareer(state);
    }
  }

  // 8. Avanzar calendario (salvo elección pendiente).
  if (!state.pendingElection && !state.gameOver) {
    state.turn += 1;
    if (state.turn > 4) {
      state.turn = 1;
      state.year += 1;
    }
  }

  // 9. Recursos del turno siguiente: PA (paro general quita 1), habilidades, pasivas.
  const abilityCooldowns: Record<string, number> = {};
  for (const [id, cd] of Object.entries(state.abilityCooldowns)) if (cd > 1) abilityCooldowns[id] = cd - 1;
  state.abilityCooldowns = abilityCooldowns;
  state = applyArchetypePassives(state);
  state.baseActions = paForTurn(state.causal);
  state.actions = state.baseActions;
  if (state.causal.paPenaltyNextTurn > 0) {
    state = addNotification(state, { type: 'warning', category: 'political', title: 'Gestión paralizada', message: 'Atender el paro general te quita un punto de acción este turno.', importance: 'high' });
    state.causal = { ...state.causal, paPenaltyNextTurn: 0 };
  }

  // 10. Espejo, derrotas, advertencias, metas e historial.
  state = syncLegacy(state);
  if (!state.gameOver) {
    const defeat = checkCausalDefeat(state);
    if (defeat) {
      state.gameOver = true;
      state.victorious = false;
      state.defeatReason = defeat;
    }
  }
  state = addWarningNotifications(state);

  const previouslyCompleted = new Set(state.objectives.filter(o => o.completed).map(o => o.id));
  state = updateObjectives(state);
  for (const obj of state.objectives) {
    if (obj.completed && !previouslyCompleted.has(obj.id)) {
      if (!state.completedObjectives.some(o => o.id === obj.id)) state.completedObjectives.push(obj);
      state = addNotification(state, { type: 'success', category: 'political', title: 'Meta de gestión alcanzada', message: `${obj.title}. ${obj.description}`, importance: 'success' });
    }
  }

  state.historicalPopularity.push(state.popularity);
  state.historicalBudget.push(state.budget);

  const actionTitles = executedIds.map(id => CAUSAL_ACTIONS_BY_ID[id]?.name ?? id);
  const turnLogEntry: TurnLogEntry = {
    year: closingYear,
    turn: closingQuarter,
    position: gameState.position,
    term: gameState.term,
    actionsTaken: actionTitles,
    events: triggeredEvents.map(e => e.title),
    decisions: [],
    popularityChange: state.causal.political.apro - aproBefore,
    budgetChange: state.causal.caja - cajaBefore,
    projectsCompleted: executedIds.filter(id => CAUSAL_ACTIONS_BY_ID[id]?.category === 'Infraestructura').map(id => CAUSAL_ACTIONS_BY_ID[id].name),
    crisesFaced: triggeredEvents.filter(e => e.severity === 'high' || e.severity === 'critical').map(e => e.title),
  };
  state.turnLog.push(turnLogEntry);

  state.selectedActions = [];
  state.advisorActionUsed = false;
  state.lastInteractionMessage = null;

  const emissions = countExecutions(state.causal, 'emitir_dinero', 6, record.turn);
  const summary: TurnSummary = {
    year: closingYear,
    quarter: closingQuarter,
    events: [...lines, ...triggeredEvents.map(e => e.title)],
    popularityChange: turnLogEntry.popularityChange,
    budgetChange: turnLogEntry.budgetChange,
    inflationEvent: { triggered: record.indicatorsAfter.INFL >= 70, count: emissions },
    immediateEffects: { popularityChange: turnLogEntry.popularityChange, budgetChange: turnLogEntry.budgetChange },
    causalTurn: record.turn,
  };

  return { state, summary, triggeredEvents, narrative };
}
