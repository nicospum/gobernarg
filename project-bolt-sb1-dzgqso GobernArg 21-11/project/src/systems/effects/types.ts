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

export interface EffectState {
  activeEffects: Effect[];
  pendingEffects: PendingEffect[];
  historicalEffects: HistoricalEffect[];
}

export interface PendingEffect extends Effect {
  activationTurn: number;
}

export interface HistoricalEffect extends Effect {
  appliedAt: number;
  success: boolean;
}