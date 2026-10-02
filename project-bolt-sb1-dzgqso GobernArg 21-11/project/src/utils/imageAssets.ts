import logoPrimary from '../assets/images/logo/logo-primary.webp';
import logoWide from '../assets/images/logo/logo-wide.webp';
import bgPresidentialOffice from '../assets/images/backgrounds/bg-presidential-office.webp';
import bgMapArgentina from '../assets/images/backgrounds/bg-map-argentina.webp';
import bgCasaRosadaMorning from '../assets/images/backgrounds/bg-casa-rosada-morning.webp';
import charExecutive1 from '../assets/images/characters/character-executive-1.webp';
import charExecutive2 from '../assets/images/characters/character-executive-2.webp';
import charPopularLeader from '../assets/images/characters/character-popular-leader.webp';
import charSpokesperson from '../assets/images/characters/character-spokesperson.webp';
import charCandidateHandshake from '../assets/images/characters/character-candidate-handshake.webp';
import charConservative from '../assets/images/characters/character-conservative-executive.webp';
import charFighter from '../assets/images/characters/character-fighter-leader.webp';
import charYoungOrator from '../assets/images/characters/character-young-orator.webp';
import charPodiumOfficial from '../assets/images/characters/character-podium-official.webp';
import charFemaleExecutive1 from '../assets/images/characters/character-female-executive-1.webp';
import charFemaleExecutive2 from '../assets/images/characters/character-female-executive-2.webp';
import charSeniorLeader from '../assets/images/characters/character-senior-leader.webp';
import charIndigenousLeader from '../assets/images/characters/character-indigenous-leader.webp';
import charYouthActivist from '../assets/images/characters/character-youth-activist.webp';
import charBusinessExecutive from '../assets/images/characters/character-business-executive.webp';
import eventEconomicCrisis from '../assets/images/events/event-economic-crisis.webp';
import eventSocialProtest from '../assets/images/events/event-social-protest.webp';
import eventCorruption from '../assets/images/events/event-corruption-scandal.webp';
import eventFlood from '../assets/images/events/event-flood-emergency.webp';
import eventInfrastructure from '../assets/images/events/event-infrastructure-plan.webp';
import eventElectionDay from '../assets/images/events/event-election-day.webp';
import eventDebtDefault from '../assets/images/events/event-debt-default.webp';
import eventEnergyCrisis from '../assets/images/events/event-energy-crisis.webp';
import eventGeneralStrike from '../assets/images/events/event-general-strike.webp';
import eventHeatWave from '../assets/images/events/event-heat-wave.webp';
import eventDiplomaticConflict from '../assets/images/events/event-diplomatic-conflict.webp';
import eventExternalSanctions from '../assets/images/events/event-external-sanctions.webp';
import eventDrought from '../assets/images/events/event-drought.webp';
import eventPrisonRiot from '../assets/images/events/event-prison-riot.webp';
import eventDrugWave from '../assets/images/events/event-drug-wave.webp';
import eventPoliceViolence from '../assets/images/events/event-police-violence-scandal.webp';
import eventMinisterResignation from '../assets/images/events/event-minister-resignation.webp';
import uiShieldEmblemPremium from '../assets/images/ui/shield-emblem-premium.webp';
import iconEconomy from '../assets/images/icons/categories/category-economy.webp';
import iconSocial from '../assets/images/icons/categories/category-social.webp';
import iconInfrastructure from '../assets/images/icons/categories/category-infrastructure.webp';
import iconDiplomacy from '../assets/images/icons/categories/category-diplomacy.webp';
import iconGovernment from '../assets/images/icons/categories/category-government.webp';
import iconEducation from '../assets/images/icons/categories/category-education.webp';
import iconSecurity from '../assets/images/icons/categories/category-security.webp';
import iconEconomyGrowth from '../assets/images/icons/categories/category-economy-growth.webp';
import iconGovernmentCongress from '../assets/images/icons/categories/category-government-congress.webp';
import iconDiplomacyHandshake from '../assets/images/icons/categories/category-diplomacy-handshake.webp';

export const IMAGES = {
  logo: {
    primary: logoPrimary,
    wide: logoWide,
  },
  backgrounds: {
    presidentialOffice: bgPresidentialOffice,
    mapArgentina: bgMapArgentina,
    casaRosadaMorning: bgCasaRosadaMorning,
  },
  characters: {
    executive1: charExecutive1,
    executive2: charExecutive2,
    popularLeader: charPopularLeader,
    spokesperson: charSpokesperson,
    candidateHandshake: charCandidateHandshake,
    conservative: charConservative,
    fighter: charFighter,
    youngOrator: charYoungOrator,
    podiumOfficial: charPodiumOfficial,
    femaleExecutive1: charFemaleExecutive1,
    femaleExecutive2: charFemaleExecutive2,
    seniorLeader: charSeniorLeader,
    indigenousLeader: charIndigenousLeader,
    youthActivist: charYouthActivist,
    businessExecutive: charBusinessExecutive,
  },
  events: {
    economicCrisis: eventEconomicCrisis,
    socialProtest: eventSocialProtest,
    corruption: eventCorruption,
    flood: eventFlood,
    infrastructure: eventInfrastructure,
    electionDay: eventElectionDay,
    debtDefault: eventDebtDefault,
    energyCrisis: eventEnergyCrisis,
    generalStrike: eventGeneralStrike,
    heatWave: eventHeatWave,
    diplomaticConflict: eventDiplomaticConflict,
    externalSanctions: eventExternalSanctions,
    drought: eventDrought,
    prisonRiot: eventPrisonRiot,
    drugWave: eventDrugWave,
    policeViolenceScandal: eventPoliceViolence,
    ministerResignation: eventMinisterResignation,
  },
  ui: {
    shieldEmblemPremium: uiShieldEmblemPremium,
  },
  icons: {
    categories: {
      economy: iconEconomy,
      social: iconSocial,
      infrastructure: iconInfrastructure,
      diplomacy: iconDiplomacy,
      government: iconGovernment,
      education: iconEducation,
      security: iconSecurity,
      economyGrowth: iconEconomyGrowth,
      governmentCongress: iconGovernmentCongress,
      diplomacyHandshake: iconDiplomacyHandshake,
    },
  },
} as const;


// Imagen de evento según id (prioridad) o categoría/severidad (fallback)
export function getEventImage(category: string, _severity: string, eventId?: string): string {
  // Mapeo por event.id (prioridad)
  const eventIdMap: Record<string, string> = {
    debt_default: IMAGES.events.debtDefault,
    energy_crisis: IMAGES.events.energyCrisis,
    general_strike: IMAGES.events.generalStrike,
    heat_wave: IMAGES.events.heatWave,
    diplomatic_conflict: IMAGES.events.diplomaticConflict,
    external_sanctions: IMAGES.events.externalSanctions,
    drought: IMAGES.events.drought,
    prison_riot: IMAGES.events.prisonRiot,
    drug_wave: IMAGES.events.drugWave,
    police_violence_scandal: IMAGES.events.policeViolenceScandal,
    minister_resignation: IMAGES.events.ministerResignation,
    // Eventos de canal del motor causal (reutilizan imágenes existentes)
    paro_agrario: IMAGES.events.drought,
    corrida: IMAGES.events.debtDefault,
    paro_docente: IMAGES.events.generalStrike,
    cacerolazo: IMAGES.events.socialProtest,
    estallido: IMAGES.events.socialProtest,
    marcha_federal: IMAGES.events.socialProtest,
    plan_de_lucha: IMAGES.events.socialProtest,
    ruptura_oficialismo: IMAGES.events.ministerResignation,
    salida_coalicion: IMAGES.events.ministerResignation,
    inflation_crisis: IMAGES.events.economicCrisis,
    healthcare_crisis: IMAGES.events.socialProtest,
  };

  if (eventId && eventIdMap[eventId]) {
    return eventIdMap[eventId];
  }

  // Fallback por categoría
  switch (category) {
    case 'economic':
      return IMAGES.events.economicCrisis;
    case 'social':
      return IMAGES.events.socialProtest;
    case 'political':
      return IMAGES.events.corruption;
    case 'natural':
      return IMAGES.events.flood;
    case 'international':
      return IMAGES.events.infrastructure;
    default:
      return IMAGES.events.electionDay;
  }
}
