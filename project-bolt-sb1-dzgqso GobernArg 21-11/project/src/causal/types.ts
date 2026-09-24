import type { CampaignCommand, CampaignState } from './campaignTypes';
/** Serializable contracts for the president-only causal simulation (workbook v0.1). */
export type IndicatorId = 'inflacion' | 'actividad' | 'ingreso_real' | 'credito' | 'fiscal'
  | 'externo' | 'infraestructura' | 'educacion' | 'salud' | 'proteccion'
  | 'seguridad' | 'ciencia' | 'derechos' | 'ambiente';
export type ActorId = 'industria' | 'agro' | 'financiero' | 'sindicatos' | 'pymes'
  | 'clase_media' | 'cooperativas' | 'estudiantes' | 'docentes' | 'cientificos'
  | 'organizaciones' | 'ddhh' | 'ambientalistas' | 'cultura' | 'oficialismo'
  | 'aliados' | 'oposicion' | 'gobernadores';
export type Indicators = Record<IndicatorId, number>;
export type Comparator = '>=' | '<=' | '>' | '<' | '=';
export interface IndicatorDefinition {
  id: IndicatorId; name: string; category: string; description: string;
  high: string; low: string; initial: number; notes: string;
}
export interface Sensitivity { indicatorId: IndicatorId; weight: number }
export interface ActorDefinition {
  id: ActorId; name: string; family: string; influence: number; electoralWeight: number;
  interactionDifficulty: number; initialRelationship: number; sensitivities: Sensitivity[];
  channel: { name: string; target: string; magnitude: number }; notes: string;
}
export interface Predicate { indicatorId: IndicatorId; operator: Comparator; value: number }
export type LedgerAccount = 'expense_once' | 'revenue_once' | 'expense_recurring' | 'revenue_recurring' | 'financing_issue';
interface EffectBase { id: string; actionId: string; magnitude: number; start: number; duration: number; explanation: string }
export interface IndicatorEffect extends EffectBase {
  kind: 'indicator'; target: IndicatorId; operation: 'pulse' | 'offset' | 'per_turn';
  conditions: Predicate[]; repetition?: 'emission'; stack: 'sum' | 'reject' | 'renew';
}
export interface LedgerEffect extends EffectBase { kind: 'ledger'; target: LedgerAccount; operation: 'flow' }
export interface LoanEffect extends EffectBase { kind: 'loan'; target: 'external' | 'domestic' | 'selectedLoanId'; operation: 'originate' | 'reschedule' }
export interface SpecialEffect extends EffectBase { kind: 'token' | 'interaction' | 'agreement'; target: string; operation: string }
export type EffectDefinition = IndicatorEffect | LedgerEffect | LoanEffect | SpecialEffect;
export type Requirement =
  | { kind: 'action'; actionId: string }
  | { kind: 'indicator'; indicatorId: IndicatorId; operator: Comparator; value: number }
  | { kind: 'legislative'; minimum: number }
  | { kind: 'meeting'; actorId: ActorId | 'actorId'; age: number }
  | { kind: 'agreement'; templateId: AgreementTemplate }
  | { kind: 'study'; projectId: string }
  | { kind: 'debt'; maximum: number }
  | { kind: 'loan'; maximumDueIn: number }
  | { kind: 'event'; eventId: string };
export interface PolicyDefinition {
  id: string; name: string; description: string; category: string; strategy: string;
  actionCost: number; cooldown: number; maxUses: number; role: 'policy' | 'interaction';
  effects: EffectDefinition[]; requirements: Requirement[];
  bonuses: { kind: 'federal' | 'environment' | 'water'; description: string }[];
  sourceIds: string[];
}
export type AgreementTemplate = 'resultado' | 'pacto_laboral' | 'pacto_ambiental' | 'pacto_federal'
  | 'acuerdo_precios' | 'coalicion' | 'acuerdo_ley' | 'reperfilamiento';
export interface MeetingReport {
  turn: number; priorities: { indicatorId: IndicatorId; weight: number; value: number; utility: number; trend: number }[];
}
export interface ActorState {
  satisfaction: number; relationship: number; meeting?: MeetingReport;
  consecutiveLow: number; conflict: boolean; cooperation: boolean;
}
export interface EffectInstance {
  id: string; executionId: string; effectId: string; actionId: string;
  startTurn: number; endExclusive: number | null; magnitude: number;
  kind: 'indicator' | 'ledger'; target: IndicatorId | LedgerAccount;
  operation: 'pulse' | 'offset' | 'per_turn' | 'flow'; lastAppliedTurn: number | null;
}
export interface LoanContract {
  id: string; executionId: string; type: 'external' | 'domestic'; originalPrincipal: number;
  outstanding: number; issuedTurn: number; dueTurn: number; interest: number;
  restructured: boolean; pendingInterest?: { amount: number; startTurn: number };
}
export interface Arrear { id: string; category: 'basic' | 'interest' | 'program' | 'principal'; amount: number; loanId?: string; dueTurn: number }
export interface StudyToken { projectId: string; executionId: string; startTurn: number; endExclusive: number; consumed: boolean }
export interface CommandParams {
  actorId?: ActorId; projectId?: string; billId?: string; loanId?: string;
  templateId?: AgreementTemplate; offerId?: string; indicatorId?: IndicatorId;
}
export interface Execution {
  id: string; actionId: string; turn: number; params: CommandParams;
  cashDelta: number; actionCost: number; efficacy: number;
}
export interface Offer {
  id: string; actorId: ActorId; templateId: AgreementTemplate; createdTurn: number;
  expiresExclusive: number; indicatorId?: IndicatorId; delta: number;
  projectId?: string; billId?: string; loanId?: string; accepted: boolean;
}
export interface Agreement extends Omit<Offer, 'accepted' | 'expiresExclusive'> {
  signedTurn: number; signedExecutionId: string; baseline: number; deadline: number;
  status: 'pending' | 'fulfilled' | 'broken'; resolvedTurn?: number;
  activeFrom: number; activeUntilExclusive: number;
}
export interface IndicatorContribution { sourceId: string; label: string; kind: 'policy' | 'link' | 'channel' | 'expiry' | 'cap' | 'fiscal'; amount: number }
export interface IndicatorTrace { id: IndicatorId; before: number; after: number; contributions: IndicatorContribution[] }
export interface FiscalReport {
  turn: number; openingCash: number; executionNet: number; revenue: number; recurringExpense: number;
  interestDue: number; interestPaid: number; recurringPaid: number; principalReceived: number; principalPaid: number;
  issuance: number; closingCash: number; debt: number; arrears: number; result: number; margin: number;
}
export interface TurnReport {
  turn: number; term: number; executions: Execution[]; fiscal: FiscalReport;
  indicators: IndicatorTrace[]; actors: { id: ActorId; before: number; target: number; after: number; relationship: number; conflict: boolean }[];
  socialComponent: number; messages: string[];
}
export interface CausalState {
  campaign?: CampaignState;
  schemaVersion: 1; modelVersion: 'causal-1'; name: string; avatar: string; profile: string;
  turn: number; term: number; phase: 'governing' | 'mandate_review' | 'ended';
  actionPoints: number; cash: number; openingCash: number; base: Indicators;
  indicators: Indicators; previousIndicators: Indicators;
  actors: Record<ActorId, ActorState>; effects: EffectInstance[]; loans: LoanContract[];
  arrears: Arrear[]; studies: StudyToken[]; offers: Offer[]; agreements: Agreement[];
  history: Execution[]; reports: TurnReport[]; processedCommands: string[];
  socialComponent: number; crisisTurns: number; waterCrisisTurns: number; waterCrisis: boolean;
  legislativeSupport: Record<string, number>;
}
export interface GameCommand {
  id: string; expectedTurn: number;
  type: 'execute' | 'close_turn' | 'continue_term' | 'end_game' | CampaignCommand;
  targetId?: string; choiceId?: string;
  actionId?: string; params?: CommandParams;
}
export interface CommandResult { state: CausalState; accepted: boolean; message: string }
export interface Availability { allowed: boolean; reasons: string[]; cashCost: number; actionCost: number; efficacy: number }
