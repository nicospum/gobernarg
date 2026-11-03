/**
 * Cierre de una SUBRONDA de la emergencia de un escenario histórico, al nivel
 * del estado del juego (GameState). Espejo chico de processEndTurn: no avanza
 * el calendario, no corre elecciones ni eventos aleatorios; solo la dinámica
 * de la crisis y la medida extraordinaria elegida.
 */
import type { GameState, TurnSummary } from '../types/game';
import { CAUSAL_ACTIONS_BY_ID } from '../data/causal';
import { updateObjectives } from '../utils/victoryConditions';
import { addNotification, type TurnResult } from './engineShared';
import { closeCrisisRound, crisisScenario } from './causal';
import { paForTurn, selectionsFor, syncLegacy } from './causalBridge';

export function processEmergencyRound(gameState: GameState): TurnResult {
  let state: GameState = {
    ...gameState,
    completedActions: [...gameState.completedActions],
    notifications: [...gameState.notifications],
  };
  const empty: TurnSummary = {
    year: state.year,
    quarter: state.turn,
    events: [],
    popularityChange: 0,
    budgetChange: 0,
    inflationEvent: { triggered: false, count: 0 },
    immediateEffects: { popularityChange: 0, budgetChange: 0 },
  };
  if (state.gameOver || state.causal.crisis?.phase !== 'emergencia') {
    return { state, summary: { ...empty, events: [state.gameOver ? 'La partida ya terminó.' : 'No hay una emergencia en curso.'] }, triggeredEvents: [] };
  }

  const def = crisisScenario(state.causal)!;
  const aproBefore = state.causal.political.apro;
  const cajaBefore = state.causal.caja;
  const { state: causal, record, defeat } = closeCrisisRound(state.causal, selectionsFor(state));
  state.causal = causal;
  if (record.measure && !state.completedActions.includes(record.measure)) state.completedActions.push(record.measure);
  state = syncLegacy(state);

  const last = record.round >= causal.crisis!.rounds;
  const unit = def.roundUnit;
  state = addNotification(state, {
    type: 'info',
    category: 'political',
    title: `${record.label}: ${record.measure ? CAUSAL_ACTIONS_BY_ID[record.measure]?.name ?? record.measure : 'sin medidas extraordinarias'}`,
    message: record.lines.slice(0, 3).join(' '),
    importance: 'medium',
  });

  if (defeat) {
    state.gameOver = true;
    state.victorious = false;
    state.defeatReason = defeat;
    state.pendingElection = false;
    state.pendingMidtermStrategy = false;
    state.availableMidtermStrategies = [];
  } else if (last) {
    state = addNotification(state, {
      type: 'event',
      category: 'political',
      title: 'Termina la emergencia',
      message: `Empieza la gestión por trimestres. Las medidas extraordinarias que sigan habilitadas se pueden tomar de a una por ${unit === 'mes' ? 'turno' : 'turno'}.`,
      importance: 'high',
    });
  }

  // Lo elegido ya se ejecutó; la subronda siguiente (o el primer turno) arranca limpia.
  state.selectedActions = [];
  state.baseActions = paForTurn(state.causal);
  state.actions = state.baseActions;
  state.lastInteractionMessage = null;
  state = updateObjectives(state);

  const summary: TurnSummary = {
    ...empty,
    events: record.lines,
    popularityChange: state.causal.political.apro - aproBefore,
    budgetChange: state.causal.caja - cajaBefore,
    immediateEffects: { popularityChange: state.causal.political.apro - aproBefore, budgetChange: state.causal.caja - cajaBefore },
    inflationEvent: { triggered: record.indicatorsAfter.INFL >= 70, count: 0 },
    crisisRound: { round: record.round, label: record.label, last },
  };
  return { state, summary, triggeredEvents: [] };
}
