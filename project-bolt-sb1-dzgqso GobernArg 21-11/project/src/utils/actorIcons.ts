// Retratos de los actores del motor causal (tabla en src/lite/imageMap.ts).
// Si a un actor le falta el archivo, devuelve '' y la tarjeta muestra un
// recuadro neutro.
import type { ActorId } from '../data/causal';
import { actorPortrait } from '@/lib/liteImages';

export function getActorIcon(actor: ActorId): string {
  return actorPortrait(actor) ?? '';
}
