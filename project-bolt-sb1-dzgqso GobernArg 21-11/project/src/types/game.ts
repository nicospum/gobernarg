import type { LucideIcon } from 'lucide-react';

// =====================
// Cargos y arquetipos
// =====================
export type Position = 'intendente' | 'gobernador' | 'presidente';

export type Archetype = 'politico' | 'empresario' | 'sindicalista' | 'comunicador';

// =====================
// Acciones políticas
// =====================
export type ActionCategory =
  | 'economia'
  | 'social'
  | 'infraestructura'
  | 'diplomacia'
  | 'seguridad'
  | 'cultura'
  | 'educacion'
  | 'turismo'
  | 'tecnologia';

export interface ActionRequirements {
  minBudget: number;
  minPopularity?: number;
  advisorRequired?: string;
  groupSupportRequired?: GroupSupportRequirement[];
}

export interface GroupSupportRequirement {
  groupId: string;
  minSupport: number;
}

export interface FutureEffect {
  delay: number;
  budgetChange?: number;
  popularityChange?: number;
  groupEffects?: GroupEffect[];
}

export interface GroupEffect {
  groupId: string;
  supportChange: number;
  duration?: number;
}

export interface GameAction {
  id: string;
  title: string;
  description: string;
  icon: LucideIcon;
  category: ActionCategory;
  popularityChange: number;
  budgetChange: number;
  requirements: ActionRequirements;
  futureEffects?: FutureEffect[];
  unlockedActions?: string[];
  cooldown?: number;
  actionCost?: number; // coste en puntos de acción (por defecto 1)
  isReform?: boolean;  // si es una reforma grande, se ve afectada por apoyo legislativo
  /** Cargos para los que está disponible esta acción. undefined = disponible para todos. */
  availableForPositions?: Position[];
  /** Efectos multidimensionales (Fase 2) */
  multiEffects?: {
    stabilityChange?: number;
    legitimacyChange?: number;
    votingIntentionChange?: number;
  };
  /** Si esta acción es un préstamo (afecta debtCount) */
  isLoan?: boolean;
  /** Factor de rendimiento decreciente. default 0.80 (pierde 20% cada uso repetido) */
  diminishingFactor?: number;
  /** Prerrequisitos de desbloqueo (Fase 3). Diferente de requirements (que son de ejecución). */
  prerequisites?: {
    requiredActions?: string[];
    minLegislativeSupport?: number;
    minLegitimacy?: number;
    minGroupSupport?: Record<string, number>;
  };
}

export interface ActionCategoryData {
  id: string;
  name: string;
  actions: GameAction[];
}

// =====================
// Asesores
// =====================
export interface Advisor {
  id: string;
  name: string;
  specialty: string;
  bonusActions: number;
  influence: number;
  cost: number;
  description: string;
  popularityEffect: number;
  unlockRequirement: null | {
    type: string;
    value: number;
  };
  level: number;
  specialAbilities: string[];
  groupBonuses: Record<string, number>;
  policyModifiers: Record<string, number>;
  traits: string[];
  effectiveness: number;
}

export interface AdvisorWithStatus extends Advisor {
  isActive: boolean;
  turnsInactive: number;
}

// =====================
// Grupos de interés
// =====================
export interface Subgroup {
  id: string;
  name: string;
  description: string;
  influence: number;
  popularity: number;
  interests: string[];
  demands: string[];
  icon: LucideIcon;
  baseSupport: number;
  supportMultiplier: number;
  resourceDemand: number;
  satisfactionLevel: number;
  lastInteractionEffect: number;
  support?: number;
}

export interface InterestGroup {
  id: string;
  name: string;
  subgroups: Subgroup[];
  support?: number;
}

// =====================
// Interacciones
// =====================
export type InteractionType = 'reunion' | 'negociar' | 'conceder';

export interface InteractionRecord {
  lastInteraction: InteractionType;
  turnsLeft: number;
}

// =====================
// Objetivos
// =====================
export interface ObjectiveRequirements {
  popularity?: number;
  budget?: number;
  completedActions?: string[];
  groupSupport?: Record<string, number>;
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
}

// =====================
// Carrera política y registro histórico
// =====================
export type CareerMilestoneType = 'initial' | 'reelection' | 'promotion';

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
}

// =====================
// Efectos pendientes y eventos programados
// =====================
export interface PendingEffect {
  id: string;
  activationTurn: number;
  target?: string;
  value?: number;
  budgetChange?: number;
  popularityChange?: number;
  groupEffects?: GroupEffect[];
  description?: string;
  source?: string;
  type?: string;
  duration?: number;
  conditions?: Record<string, unknown>;
}

export interface ScheduledEvent {
  turn: number;
  event: GameEvent;
  effects: PendingEffect[];
}

// =====================
// Eventos del juego
// =====================
export type EventType = 'random' | 'scheduled' | 'triggered' | 'crisis';
export type EventCategory = 'political' | 'economic' | 'social' | 'international' | 'natural';
export type EventSeverity = 'low' | 'medium' | 'high' | 'critical';

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

export interface EventEffect {
  type: 'immediate' | 'delayed' | 'conditional';
  target: string;
  value: number;
  duration?: number;
  conditions?: EventConditions;
  source?: string;
}

export interface EventEffects {
  immediate: EventEffect[];
  delayed?: EventEffect[];
  permanent?: EventEffect[];
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
  termsByPosition: Record<Position, number>;
  careerHistory: CareerMilestone[];
  turnLog: TurnLogEntry[];
  popularity: number;
  popularidadGrupos: number;
  popularidadPolitica: number;
  budget: number;
  turn: number;
  year: number;
  actions: number;
  baseActions: number;
  advisors: AdvisorWithStatus[];
  selectedActions: string[];
  moneyPrintingCount: number;
  governorName: string;
  advisorActionUsed: boolean;
  interactionHistory: Record<string, InteractionRecord>;
  consecutiveLowPopularity: number;
  consecutiveNegativeBudget: number;
  objectives: Objective[];
  completedObjectives: Objective[];
  gameOver: boolean;
  victorious: boolean;
  votingIntention: number;
  electionResults: ElectionResults | null;
  pendingElection: boolean;
  pendingElectionOptions: ElectionOption[];
  legislativeResults: LegislativeResults | null;
  legislativeSupport: number | null;
  historicalPopularity: number[];
  historicalBudget: number[];
  completedActions: string[];
  groupRelations: Record<string, number>;
  isAdminMode: boolean;
  stability: number;
  pendingEffects: PendingEffect[];
  scheduledEvents: ScheduledEvent[];
  interestGroups?: InterestGroup[];
  unlockedActions?: string[];
  notifications: Notification[];
  // Fase 2: Memoria de decisiones
  actionUsageCount: Record<string, number>;
  actionCooldowns: Record<string, number>;
  debtCount: number;
  debtServiceRatio: number;
  legitimacy: number;
  // Fase 3: Estrategia y política
  midtermStrategy: MidtermStrategy | null;
  pendingMidtermStrategy: boolean;
  availableMidtermStrategies: MidtermStrategy[];
}
