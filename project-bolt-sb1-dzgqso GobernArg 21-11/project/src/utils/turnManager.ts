import { GameState, PendingEffect, ScheduledEvent } from '../types/game';
import { calculatePopularidad } from './popularidad';
import { calculateAvailableActions } from './actionCalculator';

export function processTurn(gameState: GameState): GameState {
  // Procesar efectos pendientes
  const activeEffects = gameState.pendingEffects.filter(
    effect => effect.activationTurn === gameState.turn
  );
  
  // Aplicar efectos activos
  let updatedState = applyEffects(gameState, activeEffects);

  // Procesar eventos programados
  const currentEvents = gameState.scheduledEvents.filter(
    event => event.turn === gameState.turn
  );
  
  // Aplicar efectos de eventos
  updatedState = applyEventEffects(updatedState, currentEvents);

  // Actualizar estado del turno
  updatedState = {
    ...updatedState,
    turn: updatedState.turn > 4 ? 1 : updatedState.turn + 1,
    year: updatedState.turn > 4 ? updatedState.year + 1 : updatedState.year,
    selectedActions: [],
    pendingEffects: updatedState.pendingEffects.filter(
      effect => effect.activationTurn !== gameState.turn
    ),
    scheduledEvents: updatedState.scheduledEvents.filter(
      event => event.turn !== gameState.turn
    )
  };

  // Recalcular popularidad y acciones disponibles
  const { popularidadTotal, popularidadGrupos, popularidadPolitica } = 
    calculatePopularidad(updatedState);

  return {
    ...updatedState,
    popularity: popularidadTotal,
    popularidadGrupos,
    popularidadPolitica,
    actions: calculateAvailableActions(updatedState)
  };
}

function applyEffects(state: GameState, effects: PendingEffect[]): GameState {
  let updatedState = { ...state };

  effects.forEach(effect => {
    if (effect.target === undefined || effect.value === undefined) return;

    switch (effect.target) {
      case 'popularity':
        updatedState.popularity = Math.max(0, Math.min(100, 
          updatedState.popularity + effect.value
        ));
        break;
      case 'budget':
        updatedState.budget += effect.value;
        break;
      case 'stability':
        updatedState.stability = Math.max(0, Math.min(100, 
          updatedState.stability + effect.value
        ));
        break;
      default:
        if (effect.target.startsWith('group_')) {
          const groupId = effect.target.replace('group_', '');
          updatedState.groupRelations[groupId] = Math.max(0, Math.min(100,
            (updatedState.groupRelations[groupId] || 0) + effect.value
          ));
        }
    }
  });

  return updatedState;
}

function applyEventEffects(state: GameState, events: ScheduledEvent[]): GameState {
  let updatedState = { ...state };

  events.forEach(event => {
    event.effects.forEach(effect => {
      if (effect.activationTurn === state.turn) {
        updatedState = applyEffects(updatedState, [effect]);
      } else {
        updatedState.pendingEffects.push(effect);
      }
    });
  });

  return updatedState;
}

export function addPendingEffect(
  state: GameState,
  effect: PendingEffect
): GameState {
  return {
    ...state,
    pendingEffects: [...state.pendingEffects, effect]
  };
}

export function scheduleEvent(
  state: GameState,
  event: ScheduledEvent
): GameState {
  return {
    ...state,
    scheduledEvents: [...state.scheduledEvents, event]
  };
}