// Imágenes que usa el juego. Cada archivo de src/assets/images que no figura
// acá (o en iconThumbnails.ts) no se publica.

import bgCasaRosadaSunset from '../assets/images/backgrounds/balcony-casa-rosada-sunset.webp';
import bgCongressSunrise from '../assets/images/backgrounds/congress-sunrise-panorama.webp';
import bgCongressFlags from '../assets/images/backgrounds/balcony-congress-flags.webp';
import bgCongressInterior from '../assets/images/backgrounds/bg-congress-interior.webp';
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

import uiShieldEmblem from '../assets/images/ui/shield-emblem.webp';
import uiShieldEmblemPremium from '../assets/images/ui/shield-emblem-premium.webp';

import iconEconomy from '../assets/images/icons/categories/category-economy.webp';
import iconSocial from '../assets/images/icons/categories/category-social.webp';
import iconGovernment from '../assets/images/icons/categories/category-government.webp';
import iconSecurity from '../assets/images/icons/categories/category-security.webp';
import iconInfrastructureBridge from '../assets/images/icons/categories/category-infrastructure-bridge.webp';
import iconCulture from '../assets/images/icons/categories/category-culture.webp';
import iconTechnology from '../assets/images/icons/categories/category-technology.webp';

export const IMAGES = {
  backgrounds: {
    casaRosadaSunset: bgCasaRosadaSunset,
    congressSunrise: bgCongressSunrise,
    congressFlags: bgCongressFlags,
    congressInterior: bgCongressInterior,
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
  },
  ui: {
    shieldEmblem: uiShieldEmblem,
    shieldEmblemPremium: uiShieldEmblemPremium,
  },
  icons: {
    categories: {
      economy: iconEconomy,
      social: iconSocial,
      government: iconGovernment,
      security: iconSecurity,
      infrastructureBridge: iconInfrastructureBridge,
      culture: iconCulture,
      technology: iconTechnology,
    },
  },
} as const;
