// Iconos de perfiles. Los retratos de actores están en liteImages.ts.
import archetypeInstitutional from '../assets/images/icons/archetypes/archetype-institutional.webp';
import archetypeUnion from '../assets/images/icons/archetypes/archetype-union.webp';
import archetypeBusiness from '../assets/images/icons/archetypes/archetype-business.webp';
import archetypeCommunicator from '../assets/images/icons/archetypes/archetype-communicator.webp';

export const THUMBNAIL_ARCHETYPES: Record<string, string> = {
  politico: archetypeInstitutional,
  sindicalista: archetypeUnion,
  empresario: archetypeBusiness,
  comunicador: archetypeCommunicator,
};
