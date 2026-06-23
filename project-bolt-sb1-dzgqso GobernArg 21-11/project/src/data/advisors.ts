import { Advisor } from '../types/game';

export const availableAdvisors: Advisor[] = [
  {
    id: 'advisor1',
    name: 'Dr. Carlos Méndez',
    specialty: 'Economista',
    bonusActions: 2,
    influence: 8,
    cost: 300,
    description: 'Experto en política monetaria y desarrollo económico',
    popularityEffect: -5,
    unlockRequirement: null,
    level: 3,
    specialAbilities: ['reforma_monetaria_avanzada', 'plan_economico_integral'],
    groupBonuses: {
      'empresarios': 15,
      'sector-financiero': 10
    },
    policyModifiers: {
      'economia': 1.3,
      'infraestructura': 1.1
    },
    traits: ['analítico', 'conservador'],
    effectiveness: 85
  },
  {
    id: 'advisor2',
    name: 'Lic. María González',
    specialty: 'Comunicación Social',
    bonusActions: 1,
    influence: 9,
    cost: 250,
    description: 'Especialista en manejo de medios y opinión pública',
    popularityEffect: 10,
    unlockRequirement: null,
    level: 2,
    specialAbilities: ['campania_mediatica_intensiva', 'gestion_crisis_comunicacional'],
    groupBonuses: {
      'medios': 20,
      'clase-media': 10
    },
    policyModifiers: {
      'social': 1.2,
      'cultura': 1.15
    },
    traits: ['carismática', 'persuasiva'],
    effectiveness: 80
  },
  {
    id: 'advisor3',
    name: 'Ing. Roberto Silva',
    specialty: 'Infraestructura',
    bonusActions: 2,
    influence: 7,
    cost: 400,
    description: 'Experto en desarrollo urbano y obras públicas',
    popularityEffect: 5,
    unlockRequirement: null,
    level: 4,
    specialAbilities: ['plan_infraestructura_avanzado', 'optimizacion_recursos'],
    groupBonuses: {
      'empresarios': 10,
      'sindicatos': 15
    },
    policyModifiers: {
      'infraestructura': 1.4,
      'economia': 1.1
    },
    traits: ['pragmático', 'innovador'],
    effectiveness: 90
  },
  {
    id: 'advisor4',
    name: 'Dra. Ana Martínez',
    specialty: 'Políticas Sociales',
    bonusActions: 1,
    influence: 8,
    cost: 200,
    description: 'Especialista en programas de desarrollo social',
    popularityEffect: 15,
    unlockRequirement: null,
    level: 3,
    specialAbilities: ['programa_social_integral', 'mediacion_conflictos'],
    groupBonuses: {
      'sectores-populares': 20,
      'clase-media': 10
    },
    policyModifiers: {
      'social': 1.3,
      'cultura': 1.1
    },
    traits: ['empática', 'progresista'],
    effectiveness: 85
  },
  {
    id: 'advisor5',
    name: 'Dr. Jorge Ramírez',
    specialty: 'Relaciones Internacionales',
    bonusActions: 2,
    influence: 9,
    cost: 500,
    description: 'Diplomático con amplia experiencia internacional',
    popularityEffect: 8,
    unlockRequirement: {
      type: 'popularity',
      value: 60
    },
    level: 5,
    specialAbilities: ['negociacion_internacional', 'atraccion_inversiones'],
    groupBonuses: {
      'empresarios': 15,
      'sector-financiero': 15
    },
    policyModifiers: {
      'diplomacia': 1.4,
      'economia': 1.2
    },
    traits: ['diplomático', 'estratega'],
    effectiveness: 95
  },
  {
    id: 'advisor6',
    name: 'Lic. Patricia Sánchez',
    specialty: 'Seguridad Pública',
    bonusActions: 1,
    influence: 7,
    cost: 350,
    description: 'Experta en políticas de seguridad y prevención',
    popularityEffect: 12,
    unlockRequirement: null,
    level: 3,
    specialAbilities: ['plan_seguridad_integral', 'prevencion_delito'],
    groupBonuses: {
      'clase-media': 15,
      'clase-alta': 10
    },
    policyModifiers: {
      'seguridad': 1.3,
      'social': 1.1
    },
    traits: ['metódica', 'resolutiva'],
    effectiveness: 85
  },
  {
    id: 'advisor7',
    name: 'Dr. Miguel Ángel Torres',
    specialty: 'Educación',
    bonusActions: 2,
    influence: 8,
    cost: 300,
    description: 'Especialista en reforma educativa',
    popularityEffect: 10,
    unlockRequirement: {
      type: 'popularity',
      value: 55
    },
    level: 4,
    specialAbilities: ['reforma_educativa', 'modernizacion_academica'],
    groupBonuses: {
      'academicos': 20,
      'clase-media': 10
    },
    policyModifiers: {
      'social': 1.3,
      'cultura': 1.2
    },
    traits: ['académico', 'reformista'],
    effectiveness: 90
  }
];