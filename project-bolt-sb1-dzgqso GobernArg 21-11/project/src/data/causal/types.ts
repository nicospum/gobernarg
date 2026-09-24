/**
 * Tipos de las filas transcriptas del Excel `GobernArg_Motor_Causal_v1.xlsx`
 * (ver scripts/excel_to_causal.py). Son datos crudos: el motor los normaliza
 * en src/data/causal/index.ts.
 */

export interface IndicatorRow {
  id: string;
  name: string | null;
  macro: string | null;
  definition: string | null;
  high: string | null;
  low: string | null;
  scale: string | null;
  initial: number | null;
  visibility: string | null;
  importance: string | null;
  kind: string | null;
  movedBy: string | null;
  interactions: string | null;
  notes: string | null;
}

export interface ActorRow {
  id: string;
  name: string | null;
  family: string | null;
  description: string | null;
  influence: number | null;
  electoralWeight: number | null;
  electoralMode: string | null;
  interactionDifficulty: number | null;
  satInitialExcel: number | null;
  relInitial: number | null;
  channelMain: string | null;
  channelSecondary: string | null;
  highConsequence: string | null;
  lowConsequence: string | null;
  balanceNotes: string | null;
}

export interface SensitivityRow {
  actor: string;
  target: string;
  s: number | null;
  priority: string | null;
  explanation: string | null;
}

export interface ActionRow {
  id: string;
  name: string | null;
  description: string | null;
  uiCategory: string | null;
  status: string | null;
  origin: string | null;
  paCost: number | null;
  paCostText: string;
  caja: number;
  cooldownText: string | null;
  cooldown: number;
  leyText: string | null;
  tags: string[];
  strategic: string | null;
  prerequisitesText: string | null;
  unlocksText: string | null;
  risksText: string | null;
  directRelationText: string | null;
  notes: string | null;
}

export interface EffectRow {
  id: string;
  actionId: string;
  target: string;
  targetType: string | null;
  mode: string | null;
  magnitude: number | null;
  timing: string | null;
  offset: number;
  duration: number | 'PERM' | 'plazo';
  kind: string | null;
  condition: string | null;
  evalAt: string | null;
  repetition: string | null;
  window: number | null;
  cap: { floor?: number; cumulative?: number; text?: string } | null;
  explanation: string | null;
}

export interface MeetingRow {
  actor: string;
  reveals: string | null;
  discusses: string[];
  demandsText: string | null;
  demandActionIds: string[];
  vetoActionIds: string[];
  unlocks: string | null;
  shouldNot: string | null;
  exampleText: string | null;
}

export interface AuditRow {
  oldId: string;
  oldName: string | null;
  oldCategory: string | null;
  decision: string | null;
  newIds: string[];
  justification: string | null;
}
