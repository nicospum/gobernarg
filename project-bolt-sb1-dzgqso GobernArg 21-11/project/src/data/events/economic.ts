import { GameEvent } from '../../systems/events/types';

export const economicEvents: GameEvent[] = [
  {
    id: 'inflation_crisis',
    type: 'crisis',
    category: 'economic',
    severity: 'critical',
    title: 'Crisis Inflacionaria',
    description: 'La inflación se dispara afectando severamente la economía.',
    conditions: {
      minMoneyPrinting: 3,
      probability: 0.4,
      turnRange: { min: 3, max: 16 }
    },
    effects: {
      immediate: [
        { type: 'immediate', target: 'popularity', value: -25 },
        { type: 'immediate', target: 'stability', value: -20 },
        { type: 'immediate', target: 'budget', value: -300 }
      ]
    },
    choices: [
      {
        id: 'austerity',
        text: 'Implementar medidas de austeridad',
        effects: {
          immediate: [
            { type: 'immediate', target: 'popularity', value: -15 },
            { type: 'immediate', target: 'stability', value: 10 },
            { type: 'immediate', target: 'budget', value: 200 }
          ]
        },
        probability: 0.7
      },
      {
        id: 'price_controls',
        text: 'Establecer control de precios',
        effects: {
          immediate: [
            { type: 'immediate', target: 'popularity', value: 10 },
            { type: 'immediate', target: 'stability', value: -15 },
            { type: 'immediate', target: 'group_empresarios', value: -20 }
          ]
        },
        probability: 0.4
      }
    ],
    probability: 0.4,
    weight: 1.5
  },
  {
    id: 'foreign_investment',
    type: 'random',
    category: 'economic',
    severity: 'medium',
    title: 'Inversión Extranjera',
    description: 'Inversores extranjeros muestran interés en la región.',
    conditions: {
      minStability: 60,
      minPopularity: 50,
      probability: 0.3,
      turnRange: { min: 4, max: 16 }
    },
    effects: {
      immediate: [
        { type: 'immediate', target: 'budget', value: 400 },
        { type: 'immediate', target: 'stability', value: 10 }
      ]
    },
    choices: [
      {
        id: 'welcome_investment',
        text: 'Facilitar la inversión',
        effects: {
          immediate: [
            { type: 'immediate', target: 'budget', value: 600 },
            { type: 'immediate', target: 'group_empresarios', value: 20 },
            { type: 'immediate', target: 'group_sindicatos', value: -10 }
          ]
        },
        probability: 0.8
      },
      {
        id: 'restrict_investment',
        text: 'Imponer condiciones estrictas',
        effects: {
          immediate: [
            { type: 'immediate', target: 'budget', value: 200 },
            { type: 'immediate', target: 'group_empresarios', value: -15 },
            { type: 'immediate', target: 'group_sindicatos', value: 15 }
          ]
        },
        probability: 0.6
      }
    ],
    probability: 0.3,
    weight: 1.2
  }
];