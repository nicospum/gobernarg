import type { ElectionResults, GameState } from '../types/game';
import { STARTING_POSITION } from '../data/careerRules';
import { updateObjectives } from '../utils/victoryConditions';
import { PARAMS } from '../data/causal';
import { INCUMBENCY_BONUS, paForTurn, presidentialVote, syncLegacy } from './causalBridge';

function recordElectionOutcome(state: GameState, votesPercentage: number, victory: boolean): GameState {
  const lastIndex = state.careerHistory.length - 1;
  const lastMilestone = state.careerHistory[lastIndex];
  if (lastMilestone && lastMilestone.term === state.term) {
    // 'initial' sólo para el primer hito de la carrera; 'reelection' en el resto.
    const milestoneType = lastIndex === 0 ? 'initial' : 'reelection';
    state.careerHistory = state.careerHistory.map((m, i) =>
      i === lastIndex
        ? {
            ...m,
            endYear: state.year,
            result: victory ? 'victory' : 'defeat',
            type: milestoneType,
            votesPercentage,
          }
        : m
    );
  }
  return state;
}

/**
 * Resultado electoral con el motor causal: IV (aprobación de actores +
 * estructura + imagen) más la ventaja por incumbencia en la reelección (+5).
 * Umbral de victoria: 45%.
 */
function causalElectionResults(state: GameState, kind: 'reelection' | 'succession'): ElectionResults {
  const { votes, breakdown } = presidentialVote(state.causal, 'succession');
  const bonus = kind === 'reelection' ? INCUMBENCY_BONUS : 0;
  const votesPercentage = Math.min(100, Math.max(0, votes + bonus));
  return {
    votesPercentage,
    victory: votesPercentage >= PARAMS.VOTOS_PARA_GANAR,
    details: {
      popularityImpact: breakdown.apro,
      budgetImpact: 0,
      groupsSupport: breakdown.estructura,
      completedObjectivesImpact: 0,
      stabilityBonus: state.causal.political.gob,
    },
    causal: { ...breakdown, incumbencia: bonus },
    kind,
  };
}

/** Reelección al final del primer mandato. */
export function resolvePendingElection(gameState: GameState): GameState {
  // Anti doble-clic: si no hay elección pendiente (o ya fue resuelta), no-op.
  if (!gameState.pendingElection || gameState.electionResults) return gameState;

  let state: GameState = {
    ...gameState,
    careerHistory: gameState.careerHistory.map(m => ({ ...m })),
    causal: structuredClone(gameState.causal),
  };
  const results = causalElectionResults(state, 'reelection');
  state.electionResults = results;
  state.votingIntention = results.votesPercentage;
  state.pendingElection = false;

  state = recordElectionOutcome(state, results.votesPercentage, results.victory);

  if (!results.victory) {
    state.gameOver = true;
    state.victorious = false;
    state.defeatReason = 'election_loss';
    return state;
  }

  state.term += 1;
  state.careerHistory.push({
    position: STARTING_POSITION,
    term: state.term,
    startYear: 1,
    endYear: 1,
    result: 'victory',
    type: 'reelection',
    votesPercentage: 0
  });

  // Nuevo mandato: el calendario (año/trimestre) vuelve a empezar.
  state.year = 1;
  state.turn = 1;
  state.lastRandomEventTurn = 0;
  state.randomEventsThisTerm = 0;
  state.lastEventFiredTurns = {};
  state.midtermStrategy = null;
  state.pendingMidtermStrategy = false;
  state.availableMidtermStrategies = [];
  state.completedActions = [];

  // Decisión de diseño (usuario): PAÍS CONTINUO. No se reinician indicadores,
  // deuda, caja, relaciones ni efectos diferidos: el segundo
  // mandato hereda las consecuencias del primero. Empieza una nueva luna de
  // miel legislativa y se reinician las legislativas del nuevo mandato.
  state.causal.mandateStart = state.causal.turn;
  state.legislativeResults = null;
  state.baseActions = paForTurn(state.causal);
  state.actions = state.baseActions;
  return syncLegacy(state);
}

/**
 * "No presentarme" a la reelección: el oficialismo compite con otro candidato
 * (la misma elección de sucesión que al final del segundo mandato) y la
 * partida termina con ese resultado.
 */
export function retireFromReelection(gameState: GameState): GameState {
  if (!gameState.pendingElection || gameState.electionResults) return gameState;
  return finalizePresidentialCareer({ ...gameState, pendingElection: false });
}

/**
 * Fin del segundo mandato (sin reelección posible): elección de SUCESIÓN.
 * Victoria final si el espacio político del presidente retiene el gobierno
 * (IV ≥ 45, sin ventaja de incumbencia). Decisión del usuario.
 */
export function finalizePresidentialCareer(gameState: GameState): GameState {
  let state: GameState = { ...gameState, causal: structuredClone(gameState.causal) };
  state = updateObjectives(state);
  const results = causalElectionResults(state, 'succession');
  state = recordElectionOutcome(state, results.votesPercentage, true);
  state.electionResults = results;
  state.gameOver = true;
  state.victorious = results.victory;
  state.defeatReason = results.victory ? null : 'election_loss';
  return syncLegacy(state);
}
