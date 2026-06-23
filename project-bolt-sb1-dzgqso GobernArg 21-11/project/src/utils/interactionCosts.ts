import { InteractionType } from '../types/game';

const BASE_COSTS = {
  reunion: 0,
  negociar: 25,
  conceder: 50
};

const INFLUENCE_MULTIPLIER = 0.2; // 20% increase per influence point

export function calculateInteractionCost(
  interactionType: InteractionType,
  influence: number
): number {
  const baseCost = BASE_COSTS[interactionType];
  const multiplier = 1 + (influence * INFLUENCE_MULTIPLIER);
  return Math.round(baseCost * multiplier);
}

export function calculateSupportGain(
  interactionType: InteractionType,
  influence: number,
  advisorBonus: number = 0
): number {
  const baseSupport = {
    reunion: 5,
    negociar: 10,
    conceder: 15
  }[interactionType];

  // Higher influence groups are harder to influence
  const influencePenalty = 1 - (influence * 0.05); // 5% reduction per influence point
  const finalMultiplier = Math.max(0.5, influencePenalty) + advisorBonus;

  return Math.round(baseSupport * finalMultiplier);
}