import { GameEvent } from '../../systems/events/types';
import { economicEvents } from './economic';
import { politicalEvents } from './political';
import { socialEvents } from './social';
import { getEnabledPendingEvents } from './pendingEvents';

// Todos los eventos sorteables en un array plano.
export function getAllEvents(): GameEvent[] {
  return [...economicEvents, ...politicalEvents, ...socialEvents, ...getEnabledPendingEvents()];
}
