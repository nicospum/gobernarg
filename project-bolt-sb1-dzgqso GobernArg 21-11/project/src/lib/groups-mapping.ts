import {
  Briefcase,
  Users,
  Home,
  Heart,
  Wheat,
  Landmark,
  Megaphone,
  Globe,
  Scale,
  type LucideIcon,
} from 'lucide-react';

/**
 * Los 9 grupos visibles del rediseño (deciisión del usuario).
 * Cada uno agrega 1+ subgrupos del juego (de los 18 actuales).
 * Los partidos políticos (aliados, opositores) NO se agregan: van en Situación Electoral.
 */
export interface FixedGroup {
  id: string;
  name: string;
  description: string;
  icon: LucideIcon;
  /** IDs de subgroups del juego que pertenecen a este grupo. */
  members: string[];
}

export const FIXED_GROUPS: FixedGroup[] = [
  {
    id: 'empresarios',
    name: 'Empresarios',
    description: 'Sector privado, industria, comercio y elite económica.',
    icon: Briefcase,
    members: ['empresarios', 'clase-alta'],
  },
  {
    id: 'sindicatos-trabajadores',
    name: 'Sindicatos / Trabajadores',
    description: 'Centrales obreras, gremiales y conflictividad laboral.',
    icon: Users,
    members: ['sindicatos'],
  },
  {
    id: 'clase-media',
    name: 'Clase Media',
    description: 'Sector medio urbano, sensible a inflación, impuestos y servicios.',
    icon: Home,
    members: ['clase-media'],
  },
  {
    id: 'sectores-populares',
    name: 'Sectores Populares',
    description: 'Bajos recursos, comunidades vulnerables y economía social.',
    icon: Heart,
    members: ['sectores-populares', 'minorias-etnicas', 'cooperativas'],
  },
  {
    id: 'campo-agro',
    name: 'Campo / Agro',
    description: 'Productores agrícolas, ganaderos y agroexportadores.',
    icon: Wheat,
    members: ['sector-agricola'],
  },
  {
    id: 'sector-financiero',
    name: 'Sector Financiero',
    description: 'Bancos, mercados, crédito y estabilidad macro.',
    icon: Landmark,
    members: ['sector-financiero'],
  },
  {
    id: 'medios-opinion-publica',
    name: 'Medios / Opinión Pública',
    description: 'Movimientos visibles, cultura, deporte y prensa.',
    icon: Megaphone,
    members: ['feministas', 'estudiantiles', 'artistas', 'deportistas'],
  },
  {
    id: 'organismos-internacionales',
    name: 'Organismos Internacionales',
    description: 'ONGs, agencias internacionales, agenda global.',
    icon: Globe,
    members: ['ongs', 'ambientalistas'],
  },
  {
    id: 'poder-judicial',
    name: 'Poder Judicial',
    description: 'Justicia, academia y control institucional.',
    icon: Scale,
    members: ['academicos'],
  },
];

/** IDs que NO van en el accordion (partidos políticos). */
export const EXCLUDED_FROM_ACCORDION = ['aliados', 'opositores'];

/** Mapeo inverso: subgroupId → fixedGroupId. */
export const SUBGROUP_TO_GROUP: Record<string, string> = FIXED_GROUPS.reduce(
  (acc, group) => {
    for (const member of group.members) {
      acc[member] = group.id;
    }
    return acc;
  },
  {} as Record<string, string>,
);
