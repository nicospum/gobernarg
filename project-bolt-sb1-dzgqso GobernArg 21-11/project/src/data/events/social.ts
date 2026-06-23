import { GameEvent } from '../../systems/events/types';

export const socialEvents: GameEvent[] = [
  {
    id: 'student_protests',
    type: 'crisis',
    category: 'social',
    severity: 'high',
    title: 'Protestas Estudiantiles',
    description: 'Estudiantes se movilizan exigiendo mejoras en la educación.',
    conditions: {
      maxPopularity: 50,
      probability: 0.25,
      turnRange: { min: 1, max: 16 }
    },
    effects: {
      immediate: [
        { type: 'immediate', target: 'popularity', value: -15 },
        { type: 'immediate', target: 'stability', value: -10 }
      ]
    },
    choices: [
      {
        id: 'increase_funding',
        text: 'Aumentar el presupuesto educativo',
        effects: {
          immediate: [
            { type: 'immediate', target: 'budget', value: -300 },
            { type: 'immediate', target: 'popularity', value: 20 },
            { type: 'immediate', target: 'group_estudiantes', value: 25 }
          ]
        },
        probability: 0.8
      },
      {
        id: 'minimal_changes',
        text: 'Realizar cambios mínimos',
        effects: {
          immediate: [
            { type: 'immediate', target: 'budget', value: -100 },
            { type: 'immediate', target: 'popularity', value: -5 },
            { type: 'immediate', target: 'group_estudiantes', value: -10 }
          ]
        },
        probability: 0.4
      }
    ],
    probability: 0.25,
    weight: 1.2
  },
  {
    id: 'healthcare_crisis',
    type: 'crisis',
    category: 'social',
    severity: 'critical',
    title: 'Crisis en el Sistema de Salud',
    description: 'El sistema de salud pública enfrenta graves problemas.',
    conditions: {
      maxBudget: 500,
      probability: 0.2,
      turnRange: { min: 2, max: 16 }
    },
    effects: {
      immediate: [
        { type: 'immediate', target: 'popularity', value: -20 },
        { type: 'immediate', target: 'stability', value: -15 }
      ]
    },
    choices: [
      {
        id: 'emergency_funding',
        text: 'Asignar fondos de emergencia',
        effects: {
          immediate: [
            { type: 'immediate', target: 'budget', value: -400 },
            { type: 'immediate', target: 'popularity', value: 25 },
            { type: 'immediate', target: 'stability', value: 15 }
          ]
        },
        probability: 0.75
      },
      {
        id: 'private_partnership',
        text: 'Buscar asociación con privados',
        effects: {
          immediate: [
            { type: 'immediate', target: 'budget', value: -200 },
            { type: 'immediate', target: 'popularity', value: -10 },
            { type: 'immediate', target: 'group_sindicatos', value: -15 }
          ]
        },
        probability: 0.6
      }
    ],
    probability: 0.2,
    weight: 1.4
  }
];