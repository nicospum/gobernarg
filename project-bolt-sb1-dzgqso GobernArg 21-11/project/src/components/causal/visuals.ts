import { IMAGES } from '../../utils/imageAssets';
import { THUMBNAIL_GROUPS } from '../../utils/iconThumbnails';
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
const actorKeys: Record<ActorId, string> = {
  industria: 'empresarios', agro: 'sector-agricola', financiero: 'sector-financiero', sindicatos: 'sindicatos',
  pymes: 'empresarios', clase_media: 'clase-media', cooperativas: 'cooperativas', estudiantes: 'estudiantiles',
  docentes: 'academicos', cientificos: 'academicos', organizaciones: 'sectores-populares', ddhh: 'ongs',
  ambientalistas: 'ambientalistas', cultura: 'artistas', oficialismo: 'aliados', aliados: 'aliados', oposicion: 'opositores', gobernadores: 'aliados',
};
export const actorPortrait = (id: ActorId) => THUMBNAIL_GROUPS[actorKeys[id]] || IMAGES.ui.shieldEmblem;
