import { Advisor } from '../types/game';
import type { ActorId, UiCategory } from './causal';

export const availableAdvisors: Advisor[] = [
  {
    id: 'advisor1',
    name: 'Dr. Carlos Méndez',
    specialty: 'Economista',
    bonusActions: 0, // Motor causal: el aporte del asesor es su rol (ADVISOR_ROLES), no PA extra.
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
    bonusActions: 0, // Motor causal: el aporte del asesor es su rol (ADVISOR_ROLES), no PA extra.
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
    bonusActions: 0, // Motor causal: el aporte del asesor es su rol (ADVISOR_ROLES), no PA extra.
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
    bonusActions: 0, // Motor causal: el aporte del asesor es su rol (ADVISOR_ROLES), no PA extra.
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
    bonusActions: 0, // Motor causal: el aporte del asesor es su rol (ADVISOR_ROLES), no PA extra.
    influence: 9,
    cost: 500,
    description: 'Diplomático con amplia experiencia internacional',
    popularityEffect: 8,
    unlockRequirement: {
      type: 'popularity', // se compara con la Aprobación (APRO)
      value: 40
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
    bonusActions: 0, // Motor causal: el aporte del asesor es su rol (ADVISOR_ROLES), no PA extra.
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
    bonusActions: 0, // Motor causal: el aporte del asesor es su rol (ADVISOR_ROLES), no PA extra.
    influence: 8,
    cost: 300,
    description: 'Especialista en reforma educativa',
    popularityEffect: 10,
    unlockRequirement: {
      type: 'popularity', // se compara con la Aprobación (APRO)
      value: 37
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

/**
 * Rol de cada asesor dentro del motor causal.
 *
 * Antes los asesores daban +1/+2 acciones por turno (con 4 PA base eso rompía
 * el balance) y el resto de sus campos (policyModifiers, groupBonuses) eran
 * decorativos. Ahora cada asesor es un especialista:
 *  - sus efectos beneficiosos rinden más en su área (eficacia),
 *  - las acciones grandes (2 PA) de su área cuestan 1 PA,
 *  - revelan información (desanclaje, encuestas, riesgos de repetición),
 *  - mejoran la negociación con actores afines,
 *  - cobran un sueldo por turno (gasto corriente).
 */
export interface AdvisorRole {
  categories: UiCategory[];
  efficacy: number;
  paDiscount: boolean;
  cajaDiscount?: number;
  negotiation: Partial<Record<ActorId, number>>;
  reveals: ('desanclaje' | 'encuestas' | 'repeticion')[];
  freePolls?: boolean;
  eventResilience?: number;
  securityInstMitigation?: number;
  loanDiscount?: number;
  /** Imagen del presidente al contratarlo (antes popularityEffect). */
  imagenOnHire: number;
  /** Sueldo por turno (se suma al gasto corriente mientras está contratado). */
  salary: number;
  /** Resumen legible de lo que aporta. */
  perks: string[];
}

export const ADVISOR_ROLES: Record<string, AdvisorRole> = {
  advisor1: {
    categories: ['Economía y moneda', 'Impuestos'],
    efficacy: 1.2,
    paDiscount: true,
    negotiation: { financiero: 0.1, industria: 0.1 },
    reveals: ['desanclaje', 'repeticion'],
    imagenOnHire: -2,
    salary: 40,
    perks: [
      'Economía y moneda e impuestos: +20% de eficacia',
      'Reformas económicas grandes cuestan 1 PA',
      'Advierte cuándo repetir una medida sale caro y cómo están las expectativas de inflación',
      'Mejor negociación con el sector financiero y la industria',
    ],
  },
  advisor2: {
    categories: [],
    efficacy: 1,
    paDiscount: false,
    negotiation: { oficialismo: 0.05, aliados: 0.05 },
    reveals: ['encuestas'],
    freePolls: true,
    eventResilience: 0.2,
    imagenOnHire: 3,
    salary: 30,
    perks: [
      'Encuestas gratis: siempre sabés cómo están la clase media y los sectores populares',
      'Amortigua el golpe de los escándalos sobre tu imagen (−20%)',
      'Mejora tu imagen al asumir',
    ],
  },
  advisor3: {
    categories: ['Infraestructura'],
    efficacy: 1.2,
    paDiscount: true,
    cajaDiscount: 0.1,
    negotiation: { gobernadores: 0.1 },
    reveals: [],
    imagenOnHire: 1,
    salary: 50,
    perks: [
      'Obras: +20% de eficacia y −10% de costo',
      'Obras grandes cuestan 1 PA',
      'Mejor negociación con los gobernadores',
    ],
  },
  advisor4: {
    categories: ['Social y salud'],
    efficacy: 1.2,
    paDiscount: true,
    negotiation: { org_sociales: 0.1, sindicatos: 0.1 },
    reveals: [],
    imagenOnHire: 3,
    salary: 30,
    perks: [
      'Social y salud: +20% de eficacia',
      'Programas sociales grandes cuestan 1 PA',
      'Mejor negociación con organizaciones sociales y sindicatos',
    ],
  },
  advisor5: {
    categories: ['Exterior', 'Producción y trabajo'],
    efficacy: 1.15,
    paDiscount: true,
    loanDiscount: 0.15,
    negotiation: { financiero: 0.1, agro: 0.1 },
    reveals: [],
    imagenOnHire: 2,
    salary: 60,
    perks: [
      'Exterior y producción: +15% de eficacia',
      'Tratados y regímenes de inversión cuestan 1 PA',
      'Préstamos en mejores condiciones (−15% de deuda)',
      'Mejor negociación con el agro y el sector financiero',
    ],
  },
  advisor6: {
    categories: ['Seguridad y justicia'],
    efficacy: 1.25,
    paDiscount: true,
    securityInstMitigation: 0.5,
    negotiation: {},
    reveals: [],
    imagenOnHire: 2,
    salary: 40,
    perks: [
      'Seguridad y justicia: +25% de eficacia',
      'Operativos grandes cuestan 1 PA',
      'Las medidas de seguridad dañan la mitad a las instituciones',
    ],
  },
  advisor7: {
    categories: ['Educación, ciencia y cultura'],
    efficacy: 1.2,
    paDiscount: true,
    negotiation: { docentes: 0.15, estudiantes: 0.1, cientificos: 0.1 },
    reveals: [],
    imagenOnHire: 2,
    salary: 40,
    perks: [
      'Educación, ciencia y cultura: +20% de eficacia',
      'Reformas educativas y leyes de conocimiento cuestan 1 PA',
      'Mejor negociación con docentes, estudiantes y científicos',
    ],
  },
};
