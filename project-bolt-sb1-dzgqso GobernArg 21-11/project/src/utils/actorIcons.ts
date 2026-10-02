// Íconos de los actores del motor causal: reutilizan los emblemas existentes
// de grupos, arquetipos y categorías (assets/images/icons). Imports explícitos:
// sólo entran al build los 17 que se usan.
import type { ActorId } from '../data/causal';
import business from '../assets/images/icons/groups/group-business.webp';
import agriculture from '../assets/images/icons/groups/group-agriculture.webp';
import financial from '../assets/images/icons/groups/group-financial.webp';
import workers from '../assets/images/icons/groups/group-workers.webp';
import archetypeBusiness from '../assets/images/icons/archetypes/archetype-business.webp';
import middleClass from '../assets/images/icons/groups/group-middle-class.webp';
import lowIncome from '../assets/images/icons/groups/group-low-income.webp';
import students from '../assets/images/icons/groups/group-students.webp';
import academics from '../assets/images/icons/groups/group-academics.webp';
import technology from '../assets/images/icons/categories/category-technology.webp';
import cooperatives from '../assets/images/icons/groups/group-cooperatives.webp';
import ngo from '../assets/images/icons/groups/group-ngo.webp';
import environmentalists from '../assets/images/icons/groups/group-environmentalists.webp';
import institutional from '../assets/images/icons/archetypes/archetype-institutional.webp';
import allies from '../assets/images/icons/groups/group-allies.webp';
import opposition from '../assets/images/icons/groups/group-opposition.webp';
import tourism from '../assets/images/icons/categories/category-tourism.webp';

const ACTOR_ICONS: Record<ActorId, string> = {
  industria: business,
  agro: agriculture,
  financiero: financial,
  sindicatos: workers,
  pymes: archetypeBusiness,
  clase_media: middleClass,
  sectores_populares: lowIncome,
  estudiantes: students,
  docentes: academics,
  cientificos: technology,
  org_sociales: cooperatives,
  derechos_cultura: ngo,
  ambiente: environmentalists,
  oficialismo: institutional,
  aliados: allies,
  oposicion: opposition,
  gobernadores: tourism,
};

export function getActorIcon(actor: ActorId): string {
  return ACTOR_ICONS[actor] ?? '';
}
