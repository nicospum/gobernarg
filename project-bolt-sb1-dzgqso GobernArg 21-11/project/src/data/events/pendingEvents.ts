/**
 * REGISTRO DE EVENTOS PENDIENTES
 * ==============================
 * Eventos diseñados y aprobados pero AÚN NO ACTIVOS en el juego.
 *
 * Para activar un evento, agregá su ID al array `ENABLED_PENDING_EVENT_IDS`.
 * Los eventos se agregan UNO POR UNO para evitar cambios bruscos de balance.
 *
 * Documento de diseño: docs/eventos-aleatorios-propuesta.md
 * Inventario actual: docs/eventos-aleatorios-inventario.md
 */

import { GameEvent } from '../../systems/events/types';

// ============================================================
// Eventos contextuales (triggered por decisiones/estado)
// ============================================================

const policeViolenceScandal: GameEvent = {
  id: 'police_violence_scandal',
  type: 'triggered',
  category: 'social',
  severity: 'critical',
  title: 'Escándalo de Violencia Policial',
  description: 'Un video de brutalidad policial se viraliza. Sectores sociales exigen respuestas.',
  conditions: {
    requiredActions: ['lucha_narcotrafico', 'seguridad_ciudadana'],
    probability: 1
  },
  effects: {
    immediate: [
      { type: 'immediate', target: 'popularity', value: -20 },
      { type: 'immediate', target: 'stability', value: -15 },
      { type: 'immediate', target: 'sectores-populares', value: -25 },
      { type: 'immediate', target: 'clase-media', value: -10 }
    ]
  },
  choices: [
    {
      id: 'investigate',
      text: 'Investigar a fondo',
      effects: {
        immediate: [
          { type: 'immediate', target: 'budget', value: -150 },
          { type: 'immediate', target: 'popularity', value: 10 },
          { type: 'immediate', target: 'sectores-populares', value: 20 }
        ]
      },
      probability: 0.7
    },
    {
      id: 'defend_police',
      text: 'Defender a la policía',
      effects: {
        immediate: [
          { type: 'immediate', target: 'popularity', value: -15 },
          { type: 'immediate', target: 'sectores-populares', value: -30 },
          { type: 'immediate', target: 'clase-alta', value: 10 }
        ]
      },
      probability: 0.5
    }
  ],
  probability: 1,
  cooldown: 99
};

const ministerResignation: GameEvent = {
  id: 'minister_resignation',
  type: 'triggered',
  category: 'political',
  severity: 'high',
  title: 'Renuncia de Ministro',
  description: 'Un ministro clave renuncia en medio de la crisis, citando diferencias irreconciliables.',
  conditions: {
    maxStability: 35,
    probability: 1
  },
  effects: {
    immediate: [
      { type: 'immediate', target: 'stability', value: -10 },
      { type: 'immediate', target: 'popularity', value: -8 }
    ]
  },
  choices: [
    {
      id: 'accept',
      text: 'Aceptar la renuncia',
      effects: {
        immediate: [
          { type: 'immediate', target: 'budget', value: -100 },
          { type: 'immediate', target: 'stability', value: 5 }
        ]
      },
      probability: 0.8
    },
    {
      id: 'convince',
      text: 'Convencerlo de quedarse',
      effects: {
        immediate: [
          { type: 'immediate', target: 'budget', value: -200 },
          { type: 'immediate', target: 'stability', value: 15 },
          { type: 'immediate', target: 'popularity', value: 5 }
        ]
      },
      probability: 0.6
    }
  ],
  probability: 1,
  cooldown: 99
};

// ============================================================
// Eventos aleatorios económicos
// ============================================================

const debtDefault: GameEvent = {
  id: 'debt_default',
  type: 'crisis',
  category: 'economic',
  severity: 'critical',
  title: 'Default Selectivo de Deuda',
  description: 'Los acreedores internacionales advierten que el país está al borde del default.',
  conditions: {
    minMoneyPrinting: 3,
    probability: 0.35,
    turnRange: { min: 5, max: 16 }
  },
  effects: {
    immediate: [
      { type: 'immediate', target: 'budget', value: -500 },
      { type: 'immediate', target: 'stability', value: -25 },
      { type: 'immediate', target: 'popularity', value: -15 }
    ]
  },
  choices: [
    {
      id: 'renegotiate',
      text: 'Renegociar deuda',
      effects: {
        immediate: [
          { type: 'immediate', target: 'budget', value: -300 },
          { type: 'immediate', target: 'stability', value: 15 },
          { type: 'immediate', target: 'popularity', value: -5 }
        ]
      },
      probability: 0.7
    },
    {
      id: 'default',
      text: 'Default técnico',
      effects: {
        immediate: [
          { type: 'immediate', target: 'budget', value: 200 },
          { type: 'immediate', target: 'stability', value: -30 },
          { type: 'immediate', target: 'popularity', value: -25 },
          { type: 'immediate', target: 'empresarios', value: -30 }
        ]
      },
      probability: 0.4
    }
  ],
  probability: 0.35,
  weight: 1.5
};

const energyCrisis: GameEvent = {
  id: 'energy_crisis',
  type: 'crisis',
  category: 'economic',
  severity: 'high',
  title: 'Crisis Energética',
  description: 'Un apagón masivo revela la fragilidad del sistema energético.',
  conditions: {
    maxBudget: 800,
    probability: 0.3,
    turnRange: { min: 4, max: 16 }
  },
  effects: {
    immediate: [
      { type: 'immediate', target: 'popularity', value: -18 },
      { type: 'immediate', target: 'stability', value: -15 },
      { type: 'immediate', target: 'budget', value: -250 }
    ]
  },
  choices: [
    {
      id: 'invest',
      text: 'Invertir en infraestructura',
      effects: {
        immediate: [
          { type: 'immediate', target: 'budget', value: -400 },
          { type: 'immediate', target: 'popularity', value: 15 },
          { type: 'immediate', target: 'stability', value: 10 }
        ]
      },
      probability: 0.75
    },
    {
      id: 'rate_hike',
      text: 'Tarifazos',
      effects: {
        immediate: [
          { type: 'immediate', target: 'popularity', value: -20 },
          { type: 'immediate', target: 'budget', value: 200 },
          { type: 'immediate', target: 'empresarios', value: 15 }
        ]
      },
      probability: 0.5
    }
  ],
  probability: 0.3,
  weight: 1.3
};

// ============================================================
// Eventos aleatorios sociales
// ============================================================

const generalStrike: GameEvent = {
  id: 'general_strike',
  type: 'crisis',
  category: 'social',
  severity: 'critical',
  title: 'Paro General',
  description: 'Los sindicatos convocan un paro general de 48 horas.',
  conditions: {
    probability: 0.35,
    turnRange: { min: 3, max: 16 }
  },
  effects: {
    immediate: [
      { type: 'immediate', target: 'stability', value: -20 },
      { type: 'immediate', target: 'popularity', value: -15 },
      { type: 'immediate', target: 'budget', value: -200 }
    ]
  },
  choices: [
    {
      id: 'negotiate',
      text: 'Negociar',
      effects: {
        immediate: [
          { type: 'immediate', target: 'budget', value: -150 },
          { type: 'immediate', target: 'stability', value: 15 },
          { type: 'immediate', target: 'sindicatos', value: 20 }
        ]
      },
      probability: 0.8
    },
    {
      id: 'deduct_pay',
      text: 'Descontar el día',
      effects: {
        immediate: [
          { type: 'immediate', target: 'budget', value: 50 },
          { type: 'immediate', target: 'popularity', value: -10 },
          { type: 'immediate', target: 'sindicatos', value: -25 }
        ]
      },
      probability: 0.4
    }
  ],
  probability: 0.35,
  weight: 1.4
};

const heatWave: GameEvent = {
  id: 'heat_wave',
  type: 'random',
  category: 'natural',
  severity: 'medium',
  title: 'Ola de Calor Extrema',
  description: 'Una ola de calor histórica afecta a las grandes ciudades.',
  conditions: {
    probability: 0.2,
    turnRange: { min: 1, max: 16 }
  },
  effects: {
    immediate: [
      { type: 'immediate', target: 'popularity', value: -8 },
      { type: 'immediate', target: 'stability', value: -5 }
    ]
  },
  choices: [
    {
      id: 'emergency',
      text: 'Declarar emergencia',
      effects: {
        immediate: [
          { type: 'immediate', target: 'budget', value: -150 },
          { type: 'immediate', target: 'popularity', value: 10 },
          { type: 'immediate', target: 'stability', value: 5 }
        ]
      },
      probability: 0.7
    }
  ],
  probability: 0.2,
  weight: 1.0
};

// ============================================================
// Eventos internacionales
// ============================================================

const diplomaticConflict: GameEvent = {
  id: 'diplomatic_conflict',
  type: 'random',
  category: 'international',
  severity: 'high',
  title: 'Conflicto Diplomático',
  description: 'Un país vecino denuncia supuestas violaciones a un tratado bilateral.',
  conditions: {
    probability: 0.2,
    turnRange: { min: 3, max: 16 }
  },
  effects: {
    immediate: [
      { type: 'immediate', target: 'popularity', value: -10 },
      { type: 'immediate', target: 'stability', value: -8 },
      { type: 'immediate', target: 'budget', value: -100 }
    ]
  },
  choices: [
    {
      id: 'escalate',
      text: 'Escalar el conflicto',
      effects: {
        immediate: [
          { type: 'immediate', target: 'popularity', value: 5 },
          { type: 'immediate', target: 'stability', value: -15 }
        ]
      },
      probability: 0.4
    },
    {
      id: 'mediate',
      text: 'Buscar mediación',
      effects: {
        immediate: [
          { type: 'immediate', target: 'budget', value: -100 },
          { type: 'immediate', target: 'stability', value: 10 },
          { type: 'immediate', target: 'popularity', value: -5 }
        ]
      },
      probability: 0.7
    }
  ],
  probability: 0.2,
  weight: 1.1
};

const externalSanctions: GameEvent = {
  id: 'external_sanctions',
  type: 'crisis',
  category: 'international',
  severity: 'critical',
  title: 'Sanciones Externas',
  description: 'Organismos internacionales imponen sanciones económicas al país.',
  conditions: {
    maxStability: 40,
    probability: 0.25,
    turnRange: { min: 5, max: 16 }
  },
  effects: {
    immediate: [
      { type: 'immediate', target: 'budget', value: -400 },
      { type: 'immediate', target: 'popularity', value: -15 },
      { type: 'immediate', target: 'stability', value: -10 }
    ]
  },
  choices: [
    {
      id: 'accept',
      text: 'Aceptar las condiciones',
      effects: {
        immediate: [
          { type: 'immediate', target: 'budget', value: -200 },
          { type: 'immediate', target: 'stability', value: 10 },
          { type: 'immediate', target: 'popularity', value: -10 }
        ]
      },
      probability: 0.7
    }
  ],
  probability: 0.25,
  weight: 1.3
};

// ============================================================
// Eventos naturales
// ============================================================

const flood: GameEvent = {
  id: 'flood',
  type: 'crisis',
  category: 'natural',
  severity: 'high',
  title: 'Inundación',
  description: 'Lluvias torrenciales causan inundaciones en zonas pobladas.',
  conditions: {
    probability: 0.2,
    turnRange: { min: 2, max: 16 }
  },
  effects: {
    immediate: [
      { type: 'immediate', target: 'popularity', value: -15 },
      { type: 'immediate', target: 'budget', value: -300 },
      { type: 'immediate', target: 'stability', value: -10 }
    ]
  },
  choices: [
    {
      id: 'help',
      text: 'Ayuda inmediata',
      effects: {
        immediate: [
          { type: 'immediate', target: 'budget', value: -200 },
          { type: 'immediate', target: 'popularity', value: 15 },
          { type: 'immediate', target: 'stability', value: 10 }
        ]
      },
      probability: 0.8
    }
  ],
  probability: 0.2,
  weight: 1.1
};

const drought: GameEvent = {
  id: 'drought',
  type: 'crisis',
  category: 'natural',
  severity: 'high',
  title: 'Sequía',
  description: 'Una sequía prolongada afecta al sector agropecuario.',
  conditions: {
    probability: 0.15,
    turnRange: { min: 3, max: 16 }
  },
  effects: {
    immediate: [
      { type: 'immediate', target: 'budget', value: -250 },
      { type: 'immediate', target: 'sector-agricola', value: -20 },
      { type: 'immediate', target: 'popularity', value: -8 }
    ]
  },
  choices: [
    {
      id: 'subsidies',
      text: 'Subsidios de emergencia',
      effects: {
        immediate: [
          { type: 'immediate', target: 'budget', value: -300 },
          { type: 'immediate', target: 'sector-agricola', value: 25 },
          { type: 'immediate', target: 'popularity', value: 10 }
        ]
      },
      probability: 0.75
    }
  ],
  probability: 0.15,
  weight: 1.2
};

// ============================================================
// Eventos de seguridad
// ============================================================

const prisonRiot: GameEvent = {
  id: 'prison_riot',
  type: 'crisis',
  category: 'social',
  severity: 'high',
  title: 'Motín Carcelario',
  description: 'Un motín en una cárcel de máxima seguridad deja víctimas.',
  conditions: {
    maxStability: 35,
    probability: 0.25,
    turnRange: { min: 3, max: 16 }
  },
  effects: {
    immediate: [
      { type: 'immediate', target: 'popularity', value: -18 },
      { type: 'immediate', target: 'stability', value: -15 }
    ]
  },
  choices: [
    {
      id: 'negotiate',
      text: 'Negociar',
      effects: {
        immediate: [
          { type: 'immediate', target: 'budget', value: -100 },
          { type: 'immediate', target: 'popularity', value: 5 },
          { type: 'immediate', target: 'stability', value: 10 }
        ]
      },
      probability: 0.7
    }
  ],
  probability: 0.25,
  weight: 1.2
};

const drugWave: GameEvent = {
  id: 'drug_wave',
  type: 'crisis',
  category: 'social',
  severity: 'critical',
  title: 'Ola de Narcotráfico',
  description: 'Aumentan los crímenes vinculados al narcotráfico en zonas urbanas.',
  conditions: {
    maxStability: 40,
    probability: 0.2,
    turnRange: { min: 4, max: 16 }
  },
  effects: {
    immediate: [
      { type: 'immediate', target: 'popularity', value: -20 },
      { type: 'immediate', target: 'stability', value: -15 },
      { type: 'immediate', target: 'budget', value: -200 }
    ]
  },
  choices: [
    {
      id: 'security_op',
      text: 'Operativo de seguridad',
      effects: {
        immediate: [
          { type: 'immediate', target: 'budget', value: -300 },
          { type: 'immediate', target: 'popularity', value: 10 },
          { type: 'immediate', target: 'stability', value: 15 }
        ]
      },
      probability: 0.7
    }
  ],
  probability: 0.2,
  weight: 1.4
};

// ============================================================
// REGISTRO COMPLETO
// ============================================================

export const PENDING_EVENTS: Record<string, GameEvent> = {
  police_violence_scandal: policeViolenceScandal,
  minister_resignation: ministerResignation,
  debt_default: debtDefault,
  energy_crisis: energyCrisis,
  general_strike: generalStrike,
  heat_wave: heatWave,
  diplomatic_conflict: diplomaticConflict,
  external_sanctions: externalSanctions,
  flood: flood,
  drought: drought,
  prison_riot: prisonRiot,
  drug_wave: drugWave,
};

/**
 * IDs de eventos pendientes ACTIVOS en el juego.
 * Para agregar un evento, agregá su ID a este array.
 * Se agregan UNO POR UNO para evitar cambios bruscos.
 */
export const ENABLED_PENDING_EVENT_IDS: string[] = [];

/**
 * Devuelve los eventos pendientes que están habilitados.
 */
export function getEnabledPendingEvents(): GameEvent[] {
  return ENABLED_PENDING_EVENT_IDS
    .map(id => PENDING_EVENTS[id])
    .filter((event): event is GameEvent => event !== undefined);
}
