import type { LucideIcon } from 'lucide-react';
import type { CausalState } from '../engine/causal/types';

// =====================
// Cargos y arquetipos
// =====================
export type Position = 'presidente';

export type Archetype = 'politico' | 'empresario' | 'sindicalista' | 'comunicador';

// =====================
// Objetivos
// =====================
export interface ObjectiveRequirements {
  popularity?: number;
  budget?: number;
  completedActions?: string[];
  groupSupport?: Record<string, number>;
  /** Metas de gestión del motor causal: rango de un indicador del país (valor efectivo). */
  indicators?: Record<string, { min?: number; max?: number }>;
}

export interface ObjectiveReward {
  popularity?: number;
  budget?: number;
}

export interface Objective {
  id: string;
  title: string;
  description: string;
  requirements: ObjectiveRequirements;
  reward: ObjectiveReward;
  completed: boolean;
  progress: number;
  checkCompletion?: (gameState: GameState) => boolean;
  isCompleted?: boolean;
}

// =====================
// Elecciones
// =====================
export interface ElectionResults {
  votesPercentage: number;
  victory: boolean;
  details: {
    popularityImpact: number;
    budgetImpact: number;
    groupsSupport: number;
    completedObjectivesImpact: number;
    stabilityBonus: number;
  };
  /** Desglose del motor causal (IV = APRO + ESTRUCTURA + OTROS). */
  causal?: ElectionBreakdown;
  /** 'reelection' = fin del 1er mandato · 'succession' = fin del 2º (elección del sucesor). */
  kind?: 'reelection' | 'succession';
}

export interface ElectionBreakdown {
  apro: number;
  estructura: number;
  otros: number;
  incumbencia: number;
  /** Actores del electorado que más empujan a favor / en contra (nombre + satisfacción). */
  aFavor: { actor: string; sat: number }[];
  enContra: { actor: string; sat: number }[];
}

// =====================
// Carrera política y registro histórico
// =====================
export type CareerMilestoneType = 'initial' | 'reelection';

// Fase 3: Estrategias post-legislativas
export type MidtermStrategy = 'acelerar' | 'negociar' | 'abrirse' | 'jugada_audaz';

export interface MidtermStrategyEffect {
  actionMultiplier: number;
  actionCostModifier: number;
  stabilityPerTurn: number;
  popularityPerTurn: number;
  riskLevel: 'low' | 'medium' | 'high' | 'extreme';
  description: string;
}

// Derrotas
export type DefeatReason = 'low_popularity' | 'negative_budget' | 'impeachment' | 'institutional_coup' | 'hyperinflation' | 'election_loss';

/** Estado de ánimo de un actor (etiqueta del juego). */
export type Mood = 'contento' | 'neutral' | 'disconforme' | 'enojado' | 'radicalizado';

export interface CareerMilestone {
  position: Position;
  term: number;
  startYear: number;
  endYear: number;
  result: 'victory' | 'defeat';
  type: CareerMilestoneType;
  votesPercentage: number;
}

export interface TurnLogEntry {
  year: number;
  turn: number;
  position: Position;
  term: number;
  actionsTaken: string[];
  events: string[];
  decisions: string[];
  popularityChange: number;
  budgetChange: number;
  projectsCompleted: string[];
  crisesFaced: string[];
}

// =====================
// Resumen de turno
// =====================
export interface InflationEvent {
  triggered: boolean;
  count: number;
}

export interface TurnSummary {
  year: number;
  quarter: number;
  events: string[];
  popularityChange: number;
  budgetChange: number;
  inflationEvent: InflationEvent;
  immediateEffects: {
    popularityChange: number;
    budgetChange: number;
  };
  /** Turno absoluto cerrado (índice en causal.records). */
  causalTurn?: number;
}

// =====================
// Notificaciones
// =====================
export type NotificationType = 'info' | 'warning' | 'success' | 'error' | 'event' | 'crisis' | 'achievement';
export type NotificationImportance = 'low' | 'medium' | 'high' | 'critical' | 'success';
export type NotificationCategory =
  | 'economy'
  | 'social'
  | 'political'
  | 'infrastructure'
  | 'security'
  | 'culture'
  | 'system';

export interface NotificationAction {
  id?: string;
  label: string;
  action: () => void;
  style?: 'primary' | 'secondary' | 'danger';
  requiresConfirmation?: boolean;
  confirmationMessage?: string;
}

export interface Notification {
  id: string;
  type: NotificationType;
  category?: NotificationCategory;
  title: string;
  message: string;
  importance: NotificationImportance;
  actions?: NotificationAction[];
  icon?: LucideIcon;
  metadata?: Record<string, unknown>;
  expiresAt?: number;
  groupId?: string;
  timestamp?: number;
  read?: boolean;
  dismissed?: boolean;
  requiresAcknowledgment?: boolean;
  /** Año/trimestre del estado en el momento de crear la notificación.
   *  Sin estos campos el centro de notificaciones mostraba el turno vivo
   *  del estado actual, no el de creación (Punto 13). */
  year?: number;
  turn?: number;
}

// =====================
// Calendario político
// =====================
export interface CalendarEvent {
  id: string;
  year: number;
  turn: number;
  title: string;
  description: string;
  type: 'milestone' | 'election' | 'crisis' | 'opportunity';
  effect?: (state: GameState) => Partial<GameState> | void;
}

export interface LegislativeResults {
  officialismVotes: number;     // porcentaje de votos oficialismo
  oppositionVotes: number;      // porcentaje aproximado de la oposición más fuerte
  legislativeSupport: number;   // 0-100, bancada propia estimada
  outcome: 'landslide' | 'clear' | 'tie' | 'minority' | 'defeat';
  message: string;
}

// =====================
// Estado del juego
// =====================
export interface GameState {
  position: Position;
  archetype: Archetype;
  avatar: string;
  term: number;
  careerHistory: CareerMilestone[];
  /** Registro de turnos: no se muestra durante la partida; alimenta la pantalla de legado. */
  turnLog: TurnLogEntry[];
  popularity: number;
  budget: number;
  turn: number;
  year: number;
  actions: number;
  baseActions: number;
  selectedActions: string[];
  governorName: string;
  objectives: Objective[];
  gameOver: boolean;
  victorious: boolean;
  votingIntention: number;
  electionResults: ElectionResults | null;
  pendingElection: boolean;
  legislativeResults: LegislativeResults | null;
  legislativeSupport: number | null;
  historicalPopularity: number[];
  completedActions: string[];
  groupRelations: Record<string, number>;
  stability: number;
  notifications: Notification[];
  legitimacy: number;
  // Estrategia post-legislativa
  midtermStrategy: MidtermStrategy | null;
  pendingMidtermStrategy: boolean;
  availableMidtermStrategies: MidtermStrategy[];
  // Perfil de gestión (narrativo, pantalla de legado)
  radicalConciliadorAxis: number;
  populistaTecnicoAxis: number;
  cerradoConvocanteAxis: number;
  defeatReason: DefeatReason | null;
  /** Turno en el que se disparó el último evento aleatorio (para cooldown global) */
  lastRandomEventTurn: number;
  /**
   * Turno global (dentro del mandato) en que se disparó cada evento por id.
   * Se respeta el campo `cooldown` del evento.
   */
  lastEventFiredTurns?: Record<string, number>;
  /** Cantidad de eventos aleatorios disparados en el mandato actual */
  randomEventsThisTerm: number;
  // Motor causal (GobernArg_Motor_Causal_v1). Fuente de verdad del país, los
  // actores y la política; los campos popularity, budget, stability,
  // legitimacy, votingIntention, legislativeSupport y groupRelations son un
  // espejo que mantiene engine/causalBridge.ts para las pantallas.
  causal: CausalState;
  /** Mensajes de la última interacción con actores (feedback inmediato en el panel). */
  lastInteractionMessage?: string | null;
}
