import type { ActorId, IndicatorId } from './types';

export type Difficulty = 'easy' | 'normal' | 'hard' | 'legend';
export type Strategy = 'acelerar' | 'negociar' | 'abrirse' | 'jugada_audaz';
export interface CabinetMember { id: string; level: number; activeFrom: number; hiredTurn: number }
export interface NewsItem { id: string; turn: number; title: string; text: string; read: boolean; dismissed: boolean; importance: 'normal' | 'warning' | 'critical' }
export interface ElectionRecord { turn: number; term: number; kind: 'legislative' | 'presidential'; votes: number; won: boolean; ownSeats: number }
export interface ObjectiveState { id: string; title: string; description: string; progress: number; completed: boolean; reward: number }
export interface CampaignState {
  version: 1; difficulty: Difficulty; advisors: CabinetMember[]; cabinetActionTurn: number;
  abilities: Record<string, number>; communication: { value: number; until: number };
  axes: { radical: number; technical: number; open: number };
  seats: { oficialismo: number; aliados: number; oposicion: number };
  strategy: Strategy | null; strategyUntil: number; strategyPending: boolean;
  pendingEvent: { id: string; turn: number } | null; eventHistory: { id: string; turn: number; choiceId: string }[];
  randomSeed: number; lastEventTurn: number; news: NewsItem[];
  objectives: ObjectiveState[]; elections: ElectionRecord[]; resultPending: boolean;
  votes: number; approval: number; stability: number; legitimacy: number;
  lowApprovalTurns: number; insolvencyTurns: number; impeachmentTurns: number; coupTurns: number; hyperinflationTurns: number;
  outcome: 'victory' | 'defeat' | 'retired' | null; outcomeReason: string;
  governanceUntil: number;
}
export interface CampaignDelta { indicator?: Partial<Record<IndicatorId, number>>; relationship?: Partial<Record<ActorId, number>>; communication?: number; cabinet?: 'resign' | 'suspend' }
export interface EventChoice { id: string; label: string; description: string; cost: number; effect: CampaignDelta }
export interface CampaignEvent { id: string; title: string; description: string; image: 'economicCrisis' | 'socialProtest' | 'infrastructure' | 'corruption' | 'electionDay' | 'flood' | 'generalStrike' | 'debtDefault' | 'energyCrisis' | 'heatWave' | 'diplomaticConflict' | 'externalSanctions' | 'drought' | 'prisonRiot' | 'drugWave' | 'policeViolenceScandal' | 'ministerResignation'; choices: EventChoice[] }
export type CampaignCommand = 'hire_advisor' | 'dismiss_advisor' | 'train_advisor' | 'use_ability' | 'choose_event' | 'choose_strategy' | 'resolve_election' | 'acknowledge_result' | 'read_news' | 'dismiss_news';
