// Íconos de los actores del motor causal: reutilizan los emblemas existentes
// de grupos, arquetipos y categorías (assets/images/icons). Si falta alguno,
// queda string vacío y la UI cae al ícono de texto.
import { ACTORS, type ActorId } from '../data/causal';

const icons = import.meta.glob('../assets/images/icons/{groups,archetypes,categories}/*.webp', {
  eager: true,
  import: 'default',
});

export function getActorIcon(actor: ActorId): string {
  const key = `../assets/images/icons/${ACTORS[actor].iconKey}.webp`;
  return (icons[key] as string) || '';
}
