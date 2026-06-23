// Thumbnails 128x128 generados automáticamente para iconos de UI.
const thumbnails = import.meta.glob('../assets/images/icons/thumbnails/*.webp', {
  eager: true,
  import: 'default',
});

function getThumb(name: string): string {
  const key = `../assets/images/icons/thumbnails/${name}.webp`;
  return (thumbnails[key] as string) || '';
}

export const THUMBNAIL_CATEGORIES: Record<string, string> = {
  economia: getThumb('category-economy'),
  social: getThumb('category-social'),
  infraestructura: getThumb('category-infrastructure'),
  diplomacia: getThumb('category-diplomacy'),
  seguridad: getThumb('category-security'),
  cultura: getThumb('category-education'),
  educacion: getThumb('category-education'),
  gobierno: getThumb('category-government'),
  turismo: getThumb('category-diplomacy-handshake'),
  tecnologia: getThumb('category-economy-growth'),
};

export const THUMBNAIL_GROUPS: Record<string, string> = {
  sindicatos: getThumb('group-workers'),
  empresarios: getThumb('group-business'),
  'sector-agricola': getThumb('group-agriculture'),
  medios: getThumb('group-media'),
};

export const THUMBNAIL_ARCHETYPES: Record<string, string> = {
  politico: getThumb('archetype-institutional'),
  sindicalista: getThumb('archetype-nationalist'),
  empresario: getThumb('advisor-economy-icon'),
  comunicador: getThumb('advisor-press-icon'),
};
