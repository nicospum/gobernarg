// Iconos de perfiles y de grupos de actores.
import archetypeInstitutional from '../assets/images/icons/archetypes/archetype-institutional.webp';
import archetypeUnion from '../assets/images/icons/archetypes/archetype-union.webp';
import archetypeBusiness from '../assets/images/icons/archetypes/archetype-business.webp';
import archetypeCommunicator from '../assets/images/icons/archetypes/archetype-communicator.webp';

import groupWorkers from '../assets/images/icons/groups/group-workers.webp';
import groupBusiness from '../assets/images/icons/groups/group-business.webp';
import groupAgriculture from '../assets/images/icons/groups/group-agriculture.webp';
import groupFinancial from '../assets/images/icons/groups/group-financial.webp';
import groupMiddleClass from '../assets/images/icons/groups/group-middle-class.webp';
import groupLowIncome from '../assets/images/icons/groups/group-low-income.webp';
import groupNgo from '../assets/images/icons/groups/group-ngo.webp';
import groupEnvironmentalists from '../assets/images/icons/groups/group-environmentalists.webp';
import groupStudents from '../assets/images/icons/groups/group-students.webp';
import groupCooperatives from '../assets/images/icons/groups/group-cooperatives.webp';
import groupAllies from '../assets/images/icons/groups/group-allies.webp';
import groupOpposition from '../assets/images/icons/groups/group-opposition.webp';
import groupArtists from '../assets/images/icons/groups/group-artists.webp';
import groupAcademics from '../assets/images/icons/groups/group-academics.webp';

export const THUMBNAIL_GROUPS: Record<string, string> = {
  sindicatos: groupWorkers,
  empresarios: groupBusiness,
  'sector-agricola': groupAgriculture,
  'sector-financiero': groupFinancial,
  'clase-media': groupMiddleClass,
  'sectores-populares': groupLowIncome,
  ongs: groupNgo,
  ambientalistas: groupEnvironmentalists,
  estudiantiles: groupStudents,
  cooperativas: groupCooperatives,
  aliados: groupAllies,
  opositores: groupOpposition,
  artistas: groupArtists,
  academicos: groupAcademics,
};

export const THUMBNAIL_ARCHETYPES: Record<string, string> = {
  politico: archetypeInstitutional,
  sindicalista: archetypeUnion,
  empresario: archetypeBusiness,
  comunicador: archetypeCommunicator,
};
