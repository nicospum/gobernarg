export interface Effect {
  type: EffectType;
  value: number;
  duration?: number;
  turnsUntil?: number;
  target?: string;
  conditions?: EffectConditions;
  source?: string;
}

export type EffectType = 'immediate' | 'delayed' | 'conditional';

export interface EffectConditions {
  minPopularity?: number;
  minBudget?: number;
  requiredGroups?: string[];
  probability?: number;
}
