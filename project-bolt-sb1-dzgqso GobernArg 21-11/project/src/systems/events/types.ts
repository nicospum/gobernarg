import { Effect } from '../effects/types';

export type EventType = 'random' | 'scheduled' | 'triggered' | 'crisis';
export type EventCategory = 'political' | 'economic' | 'social' | 'international' | 'natural';
export type EventSeverity = 'low' | 'medium' | 'high' | 'critical';

export interface GameEvent {
  id: string;
  type: EventType;
  category: EventCategory;
  severity: EventSeverity;
  title: string;
  description: string;
  conditions: EventConditions;
  effects: EventEffects;
  choices?: EventChoice[];
  probability: number;
  weight?: number;
  cooldown?: number;
  duration?: number;
  blockedBy?: string[];
  requires?: string[];
}

export interface EventConditions {
  minPopularity?: number;
  maxPopularity?: number;
  minBudget?: number;
  maxBudget?: number;
  minStability?: number;
  maxStability?: number;
  requiredGroups?: string[];
  requiredAdvisors?: string[];
  requiredActions?: string[];
  probability?: number;
  minMoneyPrinting?: number;
  turnRange?: {
    min: number;
    max: number;
  };
}

export interface EventEffects {
  immediate: Effect[];
  delayed?: Effect[];
  permanent?: Effect[];
}

export interface EventChoice {
  id: string;
  text: string;
  effects: EventEffects;
  requirements?: EventConditions;
  probability?: number;
  consequences?: {
    success: EventEffects;
    failure: EventEffects;
  };
}

export interface EventState {
  activeEvents: ActiveEvent[];
  scheduledEvents: ScheduledEvent[];
  historicalEvents: HistoricalEvent[];
  eventCooldowns: Map<string, number>;
  blockedEvents: Set<string>;
}

export interface ActiveEvent extends GameEvent {
  startedAt: number;
  duration: number;
  choiceMade?: string;
}

export interface ScheduledEvent {
  event: GameEvent;
  triggerTurn: number;
  priority: number;
}

export interface HistoricalEvent {
  event: GameEvent;
  occurredAt: number;
  choiceMade?: string;
  outcome: 'success' | 'failure' | 'neutral';
  effects: Effect[];
}