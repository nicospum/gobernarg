import { IMAGES } from '../../utils/imageAssets';
import { actorImage, policyImage } from '../../utils/liteImages';
import type { ActorId } from '../../causal/types';

export const CATEGORY_VISUALS: Record<string, { image: string; color: string }> = {
  Economía: { image: IMAGES.icons.categories.economy, color: '#55d6a0' },
  Servicios: { image: IMAGES.icons.categories.social, color: '#f8ab67' },
  Instituciones: { image: IMAGES.icons.categories.government, color: '#c5a3ff' },
  Infraestructura: { image: IMAGES.icons.categories.infrastructureBridge, color: '#78c3ee' },
  Desarrollo: { image: IMAGES.icons.categories.technology, color: '#76dbda' },
  Seguridad: { image: IMAGES.icons.categories.security, color: '#86a9ff' },
  Cultura: { image: IMAGES.icons.categories.culture, color: '#efd274' },
};
/** Retrato del actor (b-lite/actores/<id>.webp). Sin archivo, no se muestra imagen. */
export const actorPortrait = (id: ActorId): string | undefined => actorImage(id);
/** Ilustración de la política (b-lite/politicas/<id>.webp), si ya existe. */
export const policyArt = (id: string): string | undefined => policyImage(id);
