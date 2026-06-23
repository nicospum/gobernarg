import { GameEvent } from '../../systems/events/types';

export const politicalEvents: GameEvent[] = [
  {
    id: 'coalition_opportunity',
    type: 'random',
    category: 'political',
    severity: 'medium',
    title: 'Oportunidad de Coalición',
    description: 'Partidos políticos clave muestran interés en formar una coalición.',
    conditions: {
      minPopularity: 45,
      minStability: 50,
      requiredGroups: ['partidos'],
      probability: 0.25,
      turnRange: { min: 3, max: 16 }
    },
    effects: {
      immediate: [
        { type: 'immediate', target: 'popularity', value: 15 },
        { type: 'immediate', target: 'stability', value: 10 }
      ]
    },
    choices: [
      {
        id: 'accept_coalition',
        text: 'Aceptar la coalición',
        effects: {
          immediate: [
            { type: 'immediate', target: 'popularity', value: 15 },
            { type: 'immediate', target: 'stability', value: 10 },
            { type: 'immediate', target: 'group_partidos', value: 20 }
          ]
        },
        probability: 0.8
      },
      {
        id: 'reject_coalition',
        text: 'Mantener independencia',
        effects: {
          immediate: [
            { type: 'immediate', target: 'popularity', value: -5 },
            { type: 'immediate', target: 'stability', value: -5 },
            { type: 'immediate', target: 'group_partidos', value: -10 }
          ]
        },
        probability: 0.6
      }
    ],
    probability: 0.25,
    weight: 1.1
  },
  {
    id: 'legislative_block',
    type: 'crisis',
    category: 'political',
    severity: 'high',
    title: 'Bloqueo Legislativo',
    description: 'La oposición bloquea iniciativas clave en el legislativo.',
    conditions: {
      maxPopularity: 40,
      maxStability: 45,
      probability: 0.3,
      turnRange: { min: 2, max: 16 }
    },
    effects: {
      immediate: [
        { type: 'immediate', target: 'popularity', value: -15 },
        { type: 'immediate', target: 'stability', value: -20 }
      ]
    },
    choices: [
      {
        id: 'negotiate',
        text: 'Negociar con la oposición',
        effects: {
          immediate: [
            { type: 'immediate', target: 'budget', value: -200 },
            { type: 'immediate', target: 'stability', value: 15 },
            { type: 'immediate', target: 'group_partidos', value: 10 }
          ]
        },
        probability: 0.7
      },
      {
        id: 'force_agenda',
        text: 'Forzar la agenda',
        effects: {
          immediate: [
            { type: 'immediate', target: 'popularity', value: -10 },
            { type: 'immediate', target: 'stability', value: -15 },
            { type: 'immediate', target: 'group_partidos', value: -20 }
          ]
        },
        probability: 0.4
      }
    ],
    probability: 0.3,
    weight: 1.3
  }
];