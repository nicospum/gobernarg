import { Archetype, SpecialAbility } from '../types/game';

export interface SpecialAbility {
  id: string;
  name: string;
  description: string;
  cooldown: number;
  cost: {
    budget?: number;
    popularity?: number;
    legitimacy?: number;
    actions?: number;
  };
  effects: {
    popularityChange?: number;
    budgetChange?: number;
    stabilityChange?: number;
    legitimacyChange?: number;
    groupEffects?: { groupId: string; supportChange: number }[];
  };
}

export const ARCHETYPE_ABILITIES: Record<Archetype, SpecialAbility> = {
  politico: {
    id: 'discurso_patriotico',
    name: 'Discurso Patriótico',
    description: 'Un discurso que enciende el fervor popular y une a la nación.',
    cooldown: 4,
    cost: { budget: 30, actions: 1 },
    effects: {
      popularityChange: 12,
      stabilityChange: 5,
      legitimacyChange: 8,
      groupEffects: [
        { groupId: 'aliados', supportChange: 8 },
        { groupId: 'clase-media', supportChange: 5 }
      ]
    }
  },
  empresario: {
    id: 'inversion_privada',
    name: 'Inversión Privada',
    description: 'Movilizás contactos del sector privado para inyectar capital.',
    cooldown: 5,
    cost: { popularity: -3, actions: 1 },
    effects: {
      budgetChange: 400,
      stabilityChange: -3,
      groupEffects: [
        { groupId: 'empresarios', supportChange: 10 },
        { groupId: 'sector-financiero', supportChange: 8 },
        { groupId: 'sindicatos', supportChange: -8 },
        { groupId: 'sectores-populares', supportChange: -4 }
      ]
    }
  },
  sindicalista: {
    id: 'movilizacion_social',
    name: 'Movilización Social',
    description: 'Convocás una gran movilización popular que demuestra tu base de apoyo.',
    cooldown: 4,
    cost: { budget: 50, actions: 1 },
    effects: {
      popularityChange: 8,
      stabilityChange: -5,
      legitimacyChange: 5,
      groupEffects: [
        { groupId: 'sindicatos', supportChange: 12 },
        { groupId: 'sectores-populares', supportChange: 10 },
        { groupId: 'empresarios', supportChange: -6 },
        { groupId: 'clase-alta', supportChange: -5 }
      ]
    }
  },
  comunicador: {
    id: 'campania_mediatica',
    name: 'Campaña Mediática',
    description: 'Desplegás una campaña en medios que mejora la percepción pública.',
    cooldown: 3,
    cost: { budget: 80, actions: 1 },
    effects: {
      popularityChange: 10,
      groupEffects: [
        { groupId: 'clase-media', supportChange: 6 },
        { groupId: 'aliados', supportChange: 4 }
      ]
    }
  }
};
