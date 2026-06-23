import type { GameEvent } from '../../systems/events/types';

export const oppositionEvents: GameEvent[] = [
  {
    id: 'oposicion_bloqueo',
    type: 'crisis',
    category: 'political',
    severity: 'high',
    title: 'Bloqueo legislativo',
    description: 'La oposición unió fuerzas para frenar un proyecto clave del gobierno. La imagen de gestión se resiente.',
    conditions: { minPopularity: 0, maxPopularity: 100, probability: 1 },
    effects: {
      immediate: [
        { type: 'immediate', target: 'popularity', value: -8 },
        { type: 'immediate', target: 'stability', value: -5 }
      ]
    },
    probability: 1
  },
  {
    id: 'oposicion_marcha',
    type: 'crisis',
    category: 'social',
    severity: 'medium',
    title: 'Marcha opositora al Congreso',
    description: 'Organizaciones sociales y bloques opositores convocan a una marcha contra las políticas oficiales.',
    conditions: { minPopularity: 0, maxPopularity: 100, probability: 1 },
    effects: {
      immediate: [
        { type: 'immediate', target: 'popularity', value: -5 },
        { type: 'immediate', target: 'stability', value: -3 }
      ]
    },
    probability: 1
  },
  {
    id: 'oposicion_juicio',
    type: 'crisis',
    category: 'political',
    severity: 'critical',
    title: 'Intento de juicio político',
    description: 'Con la mayoría opositora, sectores legislativos impulsan un juicio político simbólico contra un ministro.',
    conditions: { minPopularity: 0, maxPopularity: 100, probability: 1 },
    effects: {
      immediate: [
        { type: 'immediate', target: 'popularity', value: -10 },
        { type: 'immediate', target: 'stability', value: -8 }
      ]
    },
    probability: 1
  }
];

export const overconfidenceEvents: GameEvent[] = [
  {
    id: 'desgaste_soberbia',
    type: 'random',
    category: 'political',
    severity: 'medium',
    title: 'Críticas por soberbia de gobierno',
    description: 'Tras la contundente victoria electoral, sectores aliados advierten que el oficialismo se está "pasando de rosca".',
    conditions: { minPopularity: 0, maxPopularity: 100, probability: 1 },
    effects: {
      immediate: [
        { type: 'immediate', target: 'popularity', value: -4 },
        { type: 'immediate', target: 'stability', value: -3 }
      ]
    },
    probability: 1
  },
  {
    id: 'desgaste_alianza',
    type: 'random',
    category: 'political',
    severity: 'medium',
    title: 'Aliados incómodos',
    description: 'Algunos gobernadores aliados empiezan a distanciarse, molestos por la centralización de decisiones.',
    conditions: { minPopularity: 0, maxPopularity: 100, probability: 1 },
    effects: {
      immediate: [
        { type: 'immediate', target: 'stability', value: -5 },
        { type: 'immediate', target: 'group_aliados', value: -10 }
      ]
    },
    probability: 1
  },
  {
    id: 'desgaste_medios',
    type: 'random',
    category: 'political',
    severity: 'low',
    title: 'Editoriales de advertencia',
    description: 'La prensa amiga publica editoriales llamando a no confiarse tras la victoria electoral.',
    conditions: { minPopularity: 0, maxPopularity: 100, probability: 1 },
    effects: {
      immediate: [
        { type: 'immediate', target: 'popularity', value: -2 }
      ]
    },
    probability: 1
  }
];
