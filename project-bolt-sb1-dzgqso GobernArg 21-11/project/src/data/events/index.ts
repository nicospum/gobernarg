import { GameEvent } from '../../systems/events/types';
import { economicEvents } from './economic';
import { politicalEvents } from './political';
import { socialEvents } from './social';
import { eventWeights } from './eventWeights';
import { getEnabledPendingEvents } from './pendingEvents';

// Exportamos todos los eventos organizados por categoría
export const events = {
  economic: economicEvents,
  political: politicalEvents,
  social: socialEvents
};

// Función para obtener todos los eventos en un array plano
export function getAllEvents(): GameEvent[] {
  const baseEvents = Object.values(events).flat();
  const enabledPending = getEnabledPendingEvents();
  return [...baseEvents, ...enabledPending];
}

// Exportamos los pesos y modificadores
export { eventWeights };