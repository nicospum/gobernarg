// Fuente de verdad centralizada en src/types/game.ts.
// Este archivo reexporta los tipos comunes que los subsistemas necesitan
// y mantiene compatibilidad con imports existentes de '../types'.

export type {
  ActionCategory,
  ActionRequirements,
  GroupSupportRequirement,
  GameAction,
  Advisor,
  AdvisorWithStatus,
  InterestGroup,
  Subgroup,
  InteractionType,
  Objective,
  ElectionResults,
  TurnSummary,
  PendingEffect,
  ScheduledEvent,
  GameEvent,
  EventChoice,
  Notification,
  GameState,
  Position,
  Archetype,
} from '../types/game';

import type { Effect } from './effects/types';
export type { Effect };

export interface ImmediateActionEffects {
  popularity: number;
  budget: number;
  stability?: number;
}

export interface ActionEffects {
  immediate: ImmediateActionEffects;
  delayed?: Effect[];
  groupEffects?: {
    groupId: string;
    support: number;
    duration?: number;
  }[];
}
