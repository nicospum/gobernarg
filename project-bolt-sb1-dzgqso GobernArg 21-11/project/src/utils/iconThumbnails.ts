// Iconos webp para UI (arquetipos, categorías y grupos de interés).
// Se cargan con import.meta.glob para que, si falta algún asset, quede un
// string vacío como fallback en lugar de romper el build.
const archetypeIcons = import.meta.glob('../assets/images/icons/archetypes/*.webp', {
  eager: true,
  import: 'default',
});

const categoryIcons = import.meta.glob('../assets/images/icons/categories/*.webp', {
  eager: true,
  import: 'default',
});

const groupIcons = import.meta.glob('../assets/images/icons/groups/*.webp', {
  eager: true,
  import: 'default',
});

function getArchetypeIcon(name: string): string {
  const key = `../assets/images/icons/archetypes/${name}.webp`;
  return (archetypeIcons[key] as string) || '';
}

function getCategoryIcon(name: string): string {
  const key = `../assets/images/icons/categories/${name}.webp`;
  return (categoryIcons[key] as string) || '';
}

function getGroupIcon(name: string): string {
  const key = `../assets/images/icons/groups/${name}.webp`;
  return (groupIcons[key] as string) || '';
}

export const THUMBNAIL_CATEGORIES: Record<string, string> = {
  economia: getCategoryIcon('category-economy'),
  social: getCategoryIcon('category-social'),
  infraestructura: getCategoryIcon('category-infrastructure'),
  diplomacia: getCategoryIcon('category-diplomacy'),
  seguridad: getCategoryIcon('category-security'),
  cultura: getCategoryIcon('category-culture'),
  educacion: getCategoryIcon('category-education'),
  gobierno: getCategoryIcon('category-government'),
  turismo: getCategoryIcon('category-tourism'),
  tecnologia: getCategoryIcon('category-technology'),
};

export const THUMBNAIL_GROUPS: Record<string, string> = {
  sindicatos: getGroupIcon('group-workers'),
  empresarios: getGroupIcon('group-business'),
  'sector-agricola': getGroupIcon('group-agriculture'),
  medios: getGroupIcon('group-media'),
  'sector-financiero': getGroupIcon('group-financial'),
  'clase-media': getGroupIcon('group-middle-class'),
  'sectores-populares': getGroupIcon('group-low-income'),
  'clase-alta': getGroupIcon('group-upper-class'),
  'minorias-etnicas': getGroupIcon('group-indigenous'),
  ongs: getGroupIcon('group-ngo'),
  ambientalistas: getGroupIcon('group-environmentalists'),
  feministas: getGroupIcon('group-feminists'),
  estudiantiles: getGroupIcon('group-students'),
  cooperativas: getGroupIcon('group-cooperatives'),
  aliados: getGroupIcon('group-allies'),
  opositores: getGroupIcon('group-opposition'),
  artistas: getGroupIcon('group-artists'),
  deportistas: getGroupIcon('group-athletes'),
  academicos: getGroupIcon('group-academics'),
};

export const THUMBNAIL_ARCHETYPES: Record<string, string> = {
  politico: getArchetypeIcon('archetype-institutional'),
  sindicalista: getArchetypeIcon('archetype-union'),
  empresario: getArchetypeIcon('archetype-business'),
  comunicador: getArchetypeIcon('archetype-communicator'),
};
