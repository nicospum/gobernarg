import { MidtermStrategy, MidtermStrategyEffect } from '../types/game';

export const MIDTERM_STRATEGY_EFFECTS: Record<MidtermStrategy, MidtermStrategyEffect> = {
  acelerar: {
    actionMultiplier: 1.25,
    actionCostModifier: 0,
    stabilityPerTurn: -3,
    popularityPerTurn: -2,
    riskLevel: 'high',
    description: 'Acelerás las reformas. Tus acciones rinden +25% más pero generás inestabilidad y desgaste. Riesgo alto de choque si ganaste fuerte.'
  },
  negociar: {
    actionMultiplier: 0.85,
    actionCostModifier: +1,
    stabilityPerTurn: +3,
    popularityPerTurn: 0,
    riskLevel: 'low',
    description: 'Aflojás el ritmo para recomponer consensos. Menor efectividad pero ganás estabilidad gradualmente.'
  },
  abrirse: {
    actionMultiplier: 1.15,
    actionCostModifier: 0,
    stabilityPerTurn: +5,
    popularityPerTurn: +1,
    riskLevel: 'medium',
    description: 'Armás coaliciones amplias. +estabilidad, mejor intención de voto a largo plazo. Costo: cedés apoyo en tu base (aliados).'
  },
  jugada_audaz: {
    actionMultiplier: 1.50,
    actionCostModifier: 0,
    stabilityPerTurn: -5,
    popularityPerTurn: -3,
    riskLevel: 'extreme',
    description: 'Movida arriesgada de alto impacto. Efectos ×1.5 durante 2 turnos, luego penalización fuerte. Depende del arquetipo.'
  }
};
