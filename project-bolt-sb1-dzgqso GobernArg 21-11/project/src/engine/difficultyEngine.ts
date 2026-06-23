import { Difficulty } from '../types/game';

interface DifficultyModifiers {
  popularityDecayMultiplier: number;
  crisisProbabilityMultiplier: number;
  loansAvailable: boolean;
  ironman: boolean;
  baseActionsModifier: number;
  incomeMultiplier: number;
}

const DIFFICULTY_MODIFIERS: Record<Difficulty, DifficultyModifiers> = {
  easy: {
    popularityDecayMultiplier: 0.5,
    crisisProbabilityMultiplier: 0.3,
    loansAvailable: true,
    ironman: false,
    baseActionsModifier: 1,
    incomeMultiplier: 1.2
  },
  normal: {
    popularityDecayMultiplier: 1.0,
    crisisProbabilityMultiplier: 1.0,
    loansAvailable: true,
    ironman: false,
    baseActionsModifier: 0,
    incomeMultiplier: 1.0
  },
  hard: {
    popularityDecayMultiplier: 1.3,
    crisisProbabilityMultiplier: 1.5,
    loansAvailable: false,
    ironman: false,
    baseActionsModifier: -1,
    incomeMultiplier: 0.85
  },
  legend: {
    popularityDecayMultiplier: 1.5,
    crisisProbabilityMultiplier: 2.0,
    loansAvailable: false,
    ironman: true,
    baseActionsModifier: -1,
    incomeMultiplier: 0.7
  }
};

export function getDifficultyModifiers(difficulty: Difficulty): DifficultyModifiers {
  return DIFFICULTY_MODIFIERS[difficulty];
}
