import { ACTORS, BALANCE, INDICATORS, POLICIES } from './catalog';
import { CABINET, STRATEGIES } from './campaignCatalog';
import type { ActorDefinition, ActorId, AgreementTemplate, CausalState, Comparator, IndicatorId, Indicators, PolicyDefinition } from './types';

export const clamp = (value: number, min = 0, max = 100) => Math.max(min, Math.min(max, value));
export const totalDebt = (state: CausalState) => state.loans.reduce((sum, loan) => sum + loan.outstanding, 0);
export const totalArrears = (state: CausalState) => state.arrears.reduce((sum, arrear) => sum + arrear.amount, 0);
export const policyById = (id: string): PolicyDefinition | undefined => POLICIES.find(policy => policy.id === id);
export const actorById = (id: string): ActorDefinition | undefined => ACTORS.find(actor => actor.id === id);
export const indicatorName = (id: string) => INDICATORS.find(indicator => indicator.id === id)?.name ?? id;
export const policyName = (id: string) => policyById(id)?.name ?? id;
export const actorName = (id: string) => actorById(id)?.name ?? id;
export const isProject = (id: string) => policyById(id)?.requirements.some(rule => rule.kind === 'study') ?? false;
export const isBill = (id: string) => policyById(id)?.requirements.some(rule => rule.kind === 'legislative') ?? false;
export const hasRecentMeeting = (state: CausalState, id: ActorId) => {
  const turn = state.actors[id].meeting?.turn;
  return turn !== undefined && state.turn >= turn && state.turn < turn + 4;
};
export function compare(actual: number, operator: Comparator, expected: number): boolean {
  switch (operator) {
    case '>=': return actual >= expected;
    case '<=': return actual <= expected;
    case '>': return actual > expected;
    case '<': return actual < expected;
    case '=': return actual === expected;
  }
}
export function countUses(state: CausalState, actionId: string, window: number, turn = state.turn): number {
  return state.history.filter(item => item.actionId === actionId && item.turn >= turn - window + 1 && item.turn <= turn).length;
}
export function actorTarget(id: ActorId, indicators: Indicators): number {
  const actor = actorById(id)!;
  const weight = actor.sensitivities.reduce((sum, item) => sum + Math.abs(item.weight), 0);
  return actor.sensitivities.reduce((sum, item) => sum + Math.abs(item.weight)
    * (item.weight < 0 ? 100 - indicators[item.indicatorId] : indicators[item.indicatorId]), 0) / weight;
}
export function socialComponent(state: CausalState): number {
  const total = ACTORS.reduce((sum, actor) => sum + actor.electoralWeight, 0);
  return ACTORS.reduce((sum, actor) => sum + actor.electoralWeight * state.actors[actor.id].satisfaction, 0) / total;
}
export function priorities(state: CausalState, id: ActorId) {
  return actorById(id)!.sensitivities.filter(item => Math.abs(item.weight) >= 6).map(item => ({
    ...item, value: state.indicators[item.indicatorId],
    utility: item.weight < 0 ? 100 - state.indicators[item.indicatorId] : state.indicators[item.indicatorId],
    trend: state.indicators[item.indicatorId] - state.previousIndicators[item.indicatorId],
  })).sort((a, b) => a.utility - b.utility || Math.abs(b.weight) - Math.abs(a.weight)
    || a.indicatorId.localeCompare(b.indicatorId)).slice(0, 2);
}
/** Scope is mandatory: an agreement on one bill, loan or project never covers another. */
export function agreementActive(state: CausalState, template: AgreementTemplate, scope?: string, actorId?: ActorId): boolean {
  return state.agreements.some(agreement => agreement.templateId === template
    && (!actorId || agreement.actorId === actorId)
    && (scope === undefined || (agreement.billId ?? agreement.projectId ?? agreement.loanId) === scope)
    && agreement.status !== 'broken' && agreement.activeFrom <= state.turn && state.turn < agreement.activeUntilExclusive);
}
export function legislativeSupport(state: CausalState, billId: string): number {
  let support = 0;
  for (const [id, initialSeats] of [['oficialismo', 40], ['aliados', 15], ['oposicion', 45]] as const) {
    const seats = state.campaign?.seats[id] ?? initialSeats;
    const { satisfaction, relationship } = state.actors[id];
    const s = satisfaction / 100, r = relationship / 100;
    const pact = agreementActive(state, 'acuerdo_ley', billId, id) || agreementActive(state, 'coalicion', billId, id) ? 1 : 0;
    const willingness = id === 'oficialismo' ? 0.30 + 0.40 * s + 0.30 * r
      : id === 'aliados' ? 0.05 + 0.15 * s + 0.20 * r + 0.60 * pact
        : 0.05 + 0.10 * s + 0.15 * r + 0.70 * pact;
    const coordination = state.campaign && state.turn < state.campaign.governanceUntil ? .05 : 0;
    support += seats * clamp(willingness + coordination, 0, 1);
  }
  return support;
}
export function channelOffsets(state: CausalState): Partial<Indicators> {
  const offsets: Partial<Indicators> = {};
  for (const actor of ACTORS) {
    const target = INDICATORS.find(indicator => indicator.id === actor.channel.target)?.id;
    if (!target) continue;
    const status = state.actors[actor.id];
    const factor = status.conflict ? -1 : status.cooperation ? 0.5 : 0;
    offsets[target] = (offsets[target] ?? 0) + factor * actor.channel.magnitude * actor.influence / 10;
  }
  for (const id of Object.keys(offsets) as IndicatorId[]) offsets[id] = clamp(offsets[id]!, -BALANCE.channel_cap, BALANCE.channel_cap);
  return offsets;
}
export function efficacy(state: CausalState, policy: PolicyDefinition): number {
  let penalty = 0, bonus = 0;
  const domains: ActorId[] = [];
  if (policy.category === 'Seguridad') domains.push('ddhh');
  if (isProject(policy.id)) domains.push('ambientalistas', 'gobernadores');
  if (policy.effects.some(effect => effect.kind === 'indicator' && effect.target === 'educacion')) domains.push('estudiantes');
  for (const id of domains) {
    const actor = actorById(id)!;
    if (state.actors[id].conflict) penalty += actor.channel.magnitude;
    if (state.actors[id].cooperation) bonus += actor.channel.magnitude / 2;
  }
  if (policy.bonuses.some(item => item.kind === 'federal') && agreementActive(state, 'pacto_federal', policy.id)) {
    // The specific federal pact replaces, rather than duplicates, governors' generic bonus.
    const existing = state.actors.gobernadores.cooperation ? actorById('gobernadores')!.channel.magnitude / 2 : 0;
    bonus += Math.max(0, 0.15 - existing);
  }
  if (state.campaign && policy.role === 'policy') {
    bonus += Math.min(.15, state.campaign.advisors.filter(a => a.activeFrom <= state.turn
      && CABINET.find(d => d.id === a.id)?.categories.includes(policy.category)).reduce((sum, a) => sum + a.level * .02, 0));
    if (state.campaign.strategy) bonus += STRATEGIES[state.campaign.strategy].efficacy;
    if (Math.abs(state.campaign.axes.radical) > 80 && policy.requirements.some(r => r.kind === 'legislative')) penalty += .05;
    if (state.campaign.axes.technical < -80 && isProject(policy.id)) penalty += .05;
  }
  return clamp(1 - penalty + bonus, 0.65, state.campaign ? 1.4 : 1.2);
}
export function fiscalMargin(revenue: number, recurring: number, interest: number, debt: number, arrears = 0): number {
  const margin = clamp(BALANCE.fiscal_neutral + 50 * (revenue - recurring - interest) / BALANCE.revenue_base
    - Math.min(BALANCE.debt_cap, debt / BALANCE.debt_divisor));
  return arrears > 0 ? Math.min(20, margin) : margin;
}
