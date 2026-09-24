import { ACTORS, POLICIES } from './catalog';
import { actorById, clamp, hasRecentMeeting, indicatorName, isBill, isProject, priorities, totalArrears } from './selectors';
import type { ActorId, Agreement, AgreementTemplate, CausalState, CommandParams, Offer, PolicyDefinition } from './types';

export const AGREEMENT_LABELS: Record<AgreementTemplate, string> = {
  resultado: 'Mejora de un resultado', pacto_laboral: 'Pacto laboral', pacto_ambiental: 'Pacto ambiental',
  pacto_federal: 'Ejecución federal', acuerdo_precios: 'Acuerdo de precios', coalicion: 'Cooperación parlamentaria',
  acuerdo_ley: 'Acuerdo sobre una ley', reperfilamiento: 'Reperfilamiento de deuda',
};
export function templatesForActor(id: ActorId): AgreementTemplate[] {
  const templates: AgreementTemplate[] = ['resultado'];
  if (id === 'sindicatos') templates.push('pacto_laboral');
  if (id === 'ambientalistas') templates.push('pacto_ambiental');
  if (id === 'gobernadores') templates.push('pacto_federal');
  if (id === 'industria' || id === 'pymes') templates.push('acuerdo_precios');
  if (id === 'oficialismo' || id === 'aliados') templates.push('coalicion');
  if (id === 'oposicion' || id === 'oficialismo' || id === 'aliados') templates.push('acuerdo_ley');
  if (id === 'financiero') templates.push('reperfilamiento');
  return templates;
}
export function canImprove(policy: PolicyDefinition, indicatorId: string, sign: number): boolean {
  return policy.effects.some(effect => indicatorId === 'fiscal'
    ? effect.kind === 'ledger' && ((effect.target === 'revenue_recurring' && effect.magnitude > 0)
      || (effect.target === 'expense_recurring' && effect.magnitude < 0))
    : effect.kind === 'indicator' && effect.target === indicatorId && effect.magnitude * sign > 0);
}
/** Pure offer validation is shared by preview and commit; no random acceptance or direct support purchase. */
export function offerReasons(state: CausalState, params: CommandParams): string[] {
  const reasons: string[] = [];
  const actor = actorById(params.actorId ?? '');
  if (!actor) return ['Elegí un actor válido.'];
  const id = actor.id, template = params.templateId ?? 'resultado';
  if (!hasRecentMeeting(state, id)) reasons.push('Primero necesitás una reunión vigente (4 turnos).');
  if (!templatesForActor(id).includes(template)) reasons.push('Ese acuerdo no corresponde a este actor.');
  if (state.actors[id].relationship < 10) reasons.push('La relación está rota. Necesitás resolver compromisos previos.');
  if (state.offers.some(offer => offer.actorId === id && !offer.accepted && offer.expiresExclusive > state.turn)) reasons.push('Ya hay una oferta vigente con este actor.');
  if (state.agreements.some(agreement => agreement.actorId === id && agreement.status === 'pending')) reasons.push('Primero resolvé el compromiso pendiente con este actor.');
  if (template === 'pacto_federal' && !isProject(params.projectId ?? '')) reasons.push('Elegí una obra federal para el convenio.');
  if (template === 'coalicion' || template === 'acuerdo_ley') {
    if (!isBill(params.billId ?? '')) reasons.push('Elegí una ley concreta para negociar.');
  }
  if (template === 'reperfilamiento') {
    const loan = state.loans.find(item => item.id === params.loanId);
    if (!loan || loan.outstanding <= 0 || loan.restructured || loan.dueTurn - state.turn > 2) reasons.push('Seleccioná un préstamo pendiente que venza dentro de 2 turnos y no haya sido reperfilado.');
    if (state.indicators.fiscal < 25 && totalArrears(state) === 0) reasons.push('El margen fiscal debe alcanzar 25.');
    // In a crisis the ceiling on the fiscal indicator must not make restructuring an impossible exit.
  }
  if (['resultado', 'pacto_laboral', 'pacto_ambiental'].includes(template)) {
    const idWanted = template === 'pacto_laboral' ? 'ingreso_real' : template === 'pacto_ambiental' ? 'ambiente' : params.indicatorId;
    const revealed = state.actors[id].meeting?.priorities.find(item => item.indicatorId === idWanted);
    if (!revealed || revealed.utility >= 65) reasons.push('Elegí una de las necesidades materiales reveladas en la reunión.');
    if (revealed) {
      const delta = 3 + Math.floor(actor.interactionDifficulty / 4);
      if ((revealed.weight > 0 ? 100 - state.indicators[revealed.indicatorId] : state.indicators[revealed.indicatorId]) < delta) reasons.push('El objetivo supera el límite del indicador.');
      const exists = POLICIES.some(policy => canImprove(policy, revealed.indicatorId, Math.sign(revealed.weight))
        && (!policy.maxUses || state.history.filter(item => item.actionId === policy.id).length < policy.maxUses));
      if (!exists) reasons.push('No queda una política capaz de mejorar ese resultado.');
    }
  }
  return reasons;
}
export function makeOffer(state: CausalState, params: CommandParams, executionId: string): Offer {
  const actorId = params.actorId!;
  const templateId = params.templateId ?? 'resultado';
  const indicatorId = templateId === 'pacto_laboral' ? 'ingreso_real' : templateId === 'pacto_ambiental' ? 'ambiente' : params.indicatorId;
  const weight = actorById(actorId)!.sensitivities.find(item => item.indicatorId === indicatorId)?.weight ?? 1;
  return {
    id: `offer:${executionId}`, actorId, templateId, createdTurn: state.turn, expiresExclusive: state.turn + 3,
    indicatorId: ['resultado', 'pacto_laboral', 'pacto_ambiental'].includes(templateId) ? indicatorId : undefined,
    delta: (3 + Math.floor(actorById(actorId)!.interactionDifficulty / 4)) * Math.sign(weight),
    projectId: templateId === 'pacto_federal' ? params.projectId : undefined,
    billId: templateId === 'coalicion' || templateId === 'acuerdo_ley' ? params.billId : undefined,
    loanId: templateId === 'reperfilamiento' ? params.loanId : undefined, accepted: false,
  };
}
export function signOffer(state: CausalState, offer: Offer, executionId: string): void {
  offer.accepted = true;
  const material = offer.indicatorId !== undefined;
  const provisional = offer.templateId === 'acuerdo_precios' || offer.templateId === 'reperfilamiento';
  state.agreements.push({
    id: `agreement:${offer.id}`, actorId: offer.actorId, templateId: offer.templateId, createdTurn: offer.createdTurn,
    indicatorId: offer.indicatorId, delta: offer.delta, billId: offer.billId, projectId: offer.projectId, loanId: offer.loanId,
    signedTurn: state.turn, signedExecutionId: executionId, baseline: material ? state.indicators[offer.indicatorId!] : 0,
    deadline: state.turn + (material || provisional ? 4 : 2), status: 'pending',
    activeFrom: provisional ? state.turn : Number.MAX_SAFE_INTEGER,
    activeUntilExclusive: provisional ? state.turn + 5 : Number.MAX_SAFE_INTEGER,
  });
}
export function agreementDescription(agreement: Pick<Agreement, 'templateId' | 'indicatorId' | 'delta' | 'projectId' | 'billId' | 'loanId'>): string {
  if (agreement.indicatorId) return `${agreement.delta > 0 ? 'Mejorar' : 'Reducir'} ${indicatorName(agreement.indicatorId)} en ${Math.abs(agreement.delta)} puntos desde la firma, dentro de 4 turnos.`;
  if (agreement.templateId === 'acuerdo_precios') return 'Ejecutar el acuerdo temporal de precios después de las firmas de industria y PyMEs.';
  if (agreement.templateId === 'reperfilamiento') return 'Reperfilar el contrato elegido: 4 turnos adicionales y un interés 25% mayor desde el turno siguiente.';
  return 'Registrar una nueva reunión de consulta después de la firma, dentro de 2 turnos. La cooperación se limita a este proyecto.';
}
export function resolveAgreements(state: CausalState): string[] {
  const messages: string[] = [];
  for (const agreement of state.agreements) {
    if (agreement.status !== 'pending') continue;
    const signedIndex = state.history.findIndex(execution => execution.id === agreement.signedExecutionId);
    const subsequent = signedIndex < 0 ? [] : state.history.slice(signedIndex + 1);
    let fulfilled = false;
    if (agreement.indicatorId) {
      const gain = state.indicators[agreement.indicatorId] - agreement.baseline;
      const resultReached = agreement.delta > 0 ? gain >= agreement.delta : gain <= agreement.delta;
      const followedThrough = subsequent.some(item => {
        const policy = POLICIES.find(candidate => candidate.id === item.actionId);
        return policy ? canImprove(policy, agreement.indicatorId!, Math.sign(agreement.delta)) : false;
      });
      fulfilled = resultReached && followedThrough;
    } else if (agreement.templateId === 'acuerdo_precios') {
      fulfilled = subsequent.some(item => item.actionId === 'control_precios');
    } else if (agreement.templateId === 'reperfilamiento') {
      fulfilled = subsequent.some(item => item.actionId === 'reestructurar_deuda' && item.params.loanId === agreement.loanId);
    } else {
      fulfilled = subsequent.some(item => item.actionId === 'reunirse' && item.params.actorId === agreement.actorId && item.turn > agreement.signedTurn);
    }
    if (fulfilled && state.turn <= agreement.deadline) {
      agreement.status = 'fulfilled'; agreement.resolvedTurn = state.turn;
      agreement.activeFrom = state.turn + 1;
      agreement.activeUntilExclusive = state.turn + (agreement.billId ? 3 : 5);
      const procedural = !agreement.indicatorId && agreement.templateId !== 'acuerdo_precios' && agreement.templateId !== 'reperfilamiento';
      state.actors[agreement.actorId].relationship = clamp(state.actors[agreement.actorId].relationship + (procedural ? 4 : 8));
      messages.push(`Compromiso cumplido con ${actorById(agreement.actorId)!.name}. Mejora la relación; la satisfacción sigue los resultados.`);
    } else if (state.turn >= agreement.deadline) {
      agreement.status = 'broken'; agreement.resolvedTurn = state.turn; agreement.activeUntilExclusive = state.turn;
      state.actors[agreement.actorId].relationship = clamp(state.actors[agreement.actorId].relationship - 12);
      messages.push(`Venció sin cumplirse el compromiso con ${actorById(agreement.actorId)!.name}: relación −12.`);
    }
  }
  return messages;
}
export function meetActor(state: CausalState, id: ActorId): void {
  state.actors[id].meeting = { turn: state.turn, priorities: priorities(state, id) };
}
export function updateActorChannels(state: CausalState): void {
  for (const actor of ACTORS) {
    const a = state.actors[actor.id];
    const low = (a.satisfaction < 35 && a.relationship < 45) || a.satisfaction < 20;
    a.consecutiveLow = low ? a.consecutiveLow + 1 : 0;
    a.conflict = a.conflict ? (a.satisfaction < 40 && a.relationship < 50) || a.satisfaction < 25 : a.consecutiveLow >= 2;
    a.cooperation = a.satisfaction >= 65 && a.relationship >= 55 && state.agreements.some(agreement =>
      agreement.actorId === actor.id && agreement.status === 'fulfilled'
      && agreement.activeFrom <= state.turn + 1 && state.turn + 1 < agreement.activeUntilExclusive);
  }
}
