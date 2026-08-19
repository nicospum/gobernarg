/**
 * Registro central de assets visuales del juego.
 *
 * Agrupa los nuevos assets por dominio para consumo directo en componentes.
 * Los iconos de grupos sociales (15) se cargan con `import.meta.glob` para
 * evitar imports repetitivos; el resto se importa de forma estática.
 */

// ---- Arquetipos ----
import archetypeBusiness from '../assets/images/icons/archetypes/archetype-business.webp';
import archetypeCommunicator from '../assets/images/icons/archetypes/archetype-communicator.webp';
import archetypeUnion from '../assets/images/icons/archetypes/archetype-union.webp';

// ---- Categorías ----
import categoryCulture from '../assets/images/icons/categories/category-culture.webp';
import categoryTourism from '../assets/images/icons/categories/category-tourism.webp';
import categoryTechnology from '../assets/images/icons/categories/category-technology.webp';

// ---- Eventos ----
import eventDebtDefault from '../assets/images/events/event-debt-default.webp';
import eventEnergyCrisis from '../assets/images/events/event-energy-crisis.webp';
import eventGeneralStrike from '../assets/images/events/event-general-strike.webp';
import eventHeatWave from '../assets/images/events/event-heat-wave.webp';
import eventDiplomaticConflict from '../assets/images/events/event-diplomatic-conflict.webp';
import eventExternalSanctions from '../assets/images/events/event-external-sanctions.webp';
import eventDrought from '../assets/images/events/event-drought.webp';
import eventPrisonRiot from '../assets/images/events/event-prison-riot.webp';
import eventDrugWave from '../assets/images/events/event-drug-wave.webp';
import eventPoliceViolenceScandal from '../assets/images/events/event-police-violence-scandal.webp';
import eventMinisterResignation from '../assets/images/events/event-minister-resignation.webp';

// ---- Fondos ----
import bgCabinetRoom from '../assets/images/backgrounds/bg-cabinet-room.webp';
import bgCongressInterior from '../assets/images/backgrounds/bg-congress-interior.webp';
import bgPressRoom from '../assets/images/backgrounds/bg-press-room.webp';
import bgPresidentialOffice from '../assets/images/backgrounds/bg-presidential-office.webp';
import bgGovernmentNight from '../assets/images/backgrounds/bg-government-night.webp';
import bgRainyCity from '../assets/images/backgrounds/bg-rainy-city.webp';
import bgProtestDemonstration from '../assets/images/backgrounds/bg-protest-demonstration.webp';
import bgCampaignRally from '../assets/images/backgrounds/bg-campaign-rally.webp';
import bgMapArgentina from '../assets/images/backgrounds/bg-map-argentina.webp';
import bgCasaRosadaMorning from '../assets/images/backgrounds/bg-casa-rosada-morning.webp';

// ---- Asesores ----
import advisorInfrastructureMale from '../assets/images/advisors/advisor-infrastructure-male.webp';
import advisorForeignMale from '../assets/images/advisors/advisor-foreign-male.webp';
import advisorEducationMale from '../assets/images/advisors/advisor-education-male.webp';
import advisorCommunicationMale from '../assets/images/advisors/advisor-communication-male.webp';
import advisorSecurityMale from '../assets/images/advisors/advisor-security-male.webp';
import advisorSocialMale from '../assets/images/advisors/advisor-social-male.webp';
import advisorHealthFemale from '../assets/images/advisors/advisor-health-female.webp';
import advisorJusticeMale from '../assets/images/advisors/advisor-justice-male.webp';

// ---- Personajes ----
import charFemaleExecutive1 from '../assets/images/characters/character-female-executive-1.webp';
import charFemaleExecutive2 from '../assets/images/characters/character-female-executive-2.webp';
import charSeniorLeader from '../assets/images/characters/character-senior-leader.webp';
import charIndigenousLeader from '../assets/images/characters/character-indigenous-leader.webp';
import charYouthActivist from '../assets/images/characters/character-youth-activist.webp';
import charBusinessExecutive from '../assets/images/characters/character-business-executive.webp';

// ---- Iconos de grupos (15) cargados con glob ----
const groupIconFiles = import.meta.glob(
  '../assets/images/icons/groups/*.webp',
  { eager: true, import: 'default' },
) as Record<string, string>;

function getGroupIcon(name: string): string {
  return groupIconFiles[`../assets/images/icons/groups/${name}.webp`] ?? '';
}

export const archetypeIcons = {
  business: archetypeBusiness,
  communicator: archetypeCommunicator,
  union: archetypeUnion,
};

export const categoryIcons = {
  culture: categoryCulture,
  tourism: categoryTourism,
  technology: categoryTechnology,
};

export const groupIcons = {
  financial: getGroupIcon('group-financial'),
  middleClass: getGroupIcon('group-middle-class'),
  lowIncome: getGroupIcon('group-low-income'),
  upperClass: getGroupIcon('group-upper-class'),
  indigenous: getGroupIcon('group-indigenous'),
  ngo: getGroupIcon('group-ngo'),
  environmentalists: getGroupIcon('group-environmentalists'),
  feminists: getGroupIcon('group-feminists'),
  students: getGroupIcon('group-students'),
  cooperatives: getGroupIcon('group-cooperatives'),
  allies: getGroupIcon('group-allies'),
  opposition: getGroupIcon('group-opposition'),
  artists: getGroupIcon('group-artists'),
  athletes: getGroupIcon('group-athletes'),
  academics: getGroupIcon('group-academics'),
};

export const eventImages = {
  debtDefault: eventDebtDefault,
  energyCrisis: eventEnergyCrisis,
  generalStrike: eventGeneralStrike,
  heatWave: eventHeatWave,
  diplomaticConflict: eventDiplomaticConflict,
  externalSanctions: eventExternalSanctions,
  drought: eventDrought,
  prisonRiot: eventPrisonRiot,
  drugWave: eventDrugWave,
  policeViolenceScandal: eventPoliceViolenceScandal,
  ministerResignation: eventMinisterResignation,
};

export const backgrounds = {
  cabinetRoom: bgCabinetRoom,
  congressInterior: bgCongressInterior,
  pressRoom: bgPressRoom,
  presidentialOffice: bgPresidentialOffice,
  governmentNight: bgGovernmentNight,
  rainyCity: bgRainyCity,
  protestDemonstration: bgProtestDemonstration,
  campaignRally: bgCampaignRally,
  mapArgentina: bgMapArgentina,
  casaRosadaMorning: bgCasaRosadaMorning,
};

export const advisors = {
  infrastructureMale: advisorInfrastructureMale,
  foreignMale: advisorForeignMale,
  educationMale: advisorEducationMale,
  communicationMale: advisorCommunicationMale,
  securityMale: advisorSecurityMale,
  socialMale: advisorSocialMale,
  healthFemale: advisorHealthFemale,
  justiceMale: advisorJusticeMale,
};

export const characters = {
  femaleExecutive1: charFemaleExecutive1,
  femaleExecutive2: charFemaleExecutive2,
  seniorLeader: charSeniorLeader,
  indigenousLeader: charIndigenousLeader,
  youthActivist: charYouthActivist,
  businessExecutive: charBusinessExecutive,
};
