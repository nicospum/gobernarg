import { ACTORS, ACTIONS_PER_TURN, BALANCE, INDICATORS, POLICIES, TURNS_PER_TERM } from './catalog';
import { activeAt, closeFinances, fiscalForecast } from './finance';
import { CAMPAIGN_COMMANDS, campaignActionPoints, campaignBlock, campaignPolicyExecuted, refreshPolitics, runCampaignCommand, settleCampaignClose } from './campaign';
import { STRATEGIES } from './campaignCatalog';
import { makeOffer, meetActor, offerReasons, resolveAgreements, signOffer, updateActorChannels } from './interactions';
import { actorById, actorTarget, agreementActive, channelOffsets, clamp, compare, countUses, efficacy,
  hasRecentMeeting, indicatorName, isProject, legislativeSupport, policyById, policyName, socialComponent, totalArrears, totalDebt } from './selectors';
import type { Availability, CausalState, CommandParams, CommandResult, EffectInstance, GameCommand,
  IndicatorContribution, IndicatorEffect, Indicators, PolicyDefinition, TurnReport } from './types';

export function createCausalGame(name = 'Presidente', profile = 'politico', avatar = ''): CausalState {
  const initial = Object.fromEntries(INDICATORS.map(indicator => [indicator.id, indicator.initial])) as Indicators;
  const state: CausalState = {
    schemaVersion: 1, modelVersion: 'causal-1', name, avatar, profile, turn: 1, term: 1, phase: 'governing',
    actionPoints: ACTIONS_PER_TURN, cash: BALANCE.cash_initial, openingCash: BALANCE.cash_initial,
    base: { ...initial }, indicators: { ...initial }, previousIndicators: { ...initial },
    actors: Object.fromEntries(ACTORS.map(actor => [actor.id, {
      satisfaction: actorTarget(actor.id, initial), relationship: actor.initialRelationship,
      consecutiveLow: 0, conflict: false, cooperation: false,
    }])) as CausalState['actors'],
    effects: [], loans: [], arrears: [], studies: [], offers: [], agreements: [], history: [], reports: [],
    processedCommands: [], socialComponent: 0, crisisTurns: 0, waterCrisisTurns: 0, waterCrisis: false, legislativeSupport: {},
  };
  state.socialComponent = socialComponent(state);
  refreshLegislature(state);
  return state;
}

function refreshLegislature(state: CausalState): void {
  state.legislativeSupport = Object.fromEntries(POLICIES.filter(policy => policy.requirements.some(rule => rule.kind === 'legislative'))
    .map(policy => [policy.id, legislativeSupport(state, policy.id)]));
}
function contextKey(actionId: string, params: CommandParams): string {
  return ['reunirse', 'negociar', 'firmar_acuerdo'].includes(actionId) ? `${actionId}:${params.actorId}` : actionId;
}
function scopeOf(params: CommandParams, policy: PolicyDefinition): string | undefined {
  return params.loanId ?? params.billId ?? params.projectId ?? (isProject(policy.id) ? policy.id : undefined);
}
function monetaryCost(state: CausalState, policy: PolicyDefinition, params: CommandParams): number {
  if (policy.id === 'reunirse' || policy.id === 'negociar') {
    const actor = actorById(params.actorId ?? '');
    let cost = (policy.id === 'reunirse' ? 10 : 15) + 5 * (actor?.interactionDifficulty ?? 0);
    if (state.campaign) {
      if (policy.id === 'reunirse' && ((state.profile === 'politico' && actor?.id === 'aliados')
        || (state.profile === 'sindicalista' && ['sindicatos', 'organizaciones'].includes(actor?.id ?? '')))) return 0;
      if ((policy.id === 'negociar' && state.campaign.strategy === 'negociar') || (policy.id === 'reunirse' && state.campaign.strategy === 'abrirse')) cost *= .75;
      if (state.campaign.axes.open < -80) cost *= 1.25;
    }
    return cost;
  }
  let cost = policy.effects.filter(effect => effect.kind === 'ledger' && effect.target === 'expense_once' && effect.start === 0)
    .reduce((sum, effect) => sum + effect.magnitude, 0);
  const discounted = policy.bonuses.some(bonus => (bonus.kind === 'environment' && state.indicators.ambiente < 40)
    || (bonus.kind === 'water' && state.waterCrisis));
  if (discounted) cost *= 0.9;
  if (state.campaign) {
    if (state.profile === 'empresario' && policy.category === 'Economía') cost *= .9;
    if (state.campaign.strategy) cost *= STRATEGIES[state.campaign.strategy].cost;
    if (policy.id === 'estudio_factibilidad' && state.campaign.axes.technical > 80) cost *= .9;
  }
  return cost;
}
/** Every command is validated again on commit. UI availability is never authority. */
export function policyAvailability(state: CausalState, actionId: string, params: CommandParams = {}): Availability {
  const policy = policyById(actionId);
  if (!policy) return { allowed: false, reasons: ['Acción desconocida.'], cashCost: 0, actionCost: 0, efficacy: 1 };
  const reasons: string[] = [];
  const campaignReason = campaignBlock(state);
  if (campaignReason) reasons.push(campaignReason);
  const cashCost = monetaryCost(state, policy, params);
  const actor = actorById(params.actorId ?? '');
  const culturalSurcharge = policy.id === 'reunirse' && actor?.family === 'Sociedad civil' && state.actors.cultura.conflict
    && !state.history.some(item => item.turn === state.turn && item.actionId === 'reunirse' && actorById(item.params.actorId ?? '')?.family === 'Sociedad civil');
  const actionCost = policy.actionCost + (culturalSurcharge ? 1 : 0);
  if (state.phase !== 'governing') reasons.push('Primero resolvé el cierre del mandato.');
  if (state.actionPoints < actionCost) reasons.push(`Necesitás ${actionCost} punto${actionCost === 1 ? '' : 's'} de acción.`);
  if (state.cash + 1e-8 < cashCost) reasons.push(`Necesitás ${cashCost} U de caja.`);
  const allowedInCrisis = ['emitir_dinero', 'reunirse', 'negociar', 'firmar_acuerdo', 'reestructurar_deuda'];
  if (totalArrears(state) > 0 && !allowedInCrisis.includes(policy.id)) reasons.push('Hay obligaciones impagas: resolvé la financiación o renegociá la deuda.');
  const same = state.history.filter(item => contextKey(item.actionId, item.params) === contextKey(actionId, params));
  const last = same[same.length - 1];
  if (last && state.turn < last.turn + policy.cooldown) reasons.push(`Disponible desde el turno ${last.turn + policy.cooldown}.`);
  if (last?.turn === state.turn) reasons.push('Ya ejecutaste esta acción en este turno.');
  if (policy.maxUses && same.length >= policy.maxUses) reasons.push(`Límite de ${policy.maxUses} usos por partida alcanzado.`);
  for (const effect of policy.effects) {
    if (effect.kind === 'indicator' && effect.operation === 'offset' && effect.stack === 'reject'
      && state.effects.some(instance => instance.effectId === effect.id && (instance.endExclusive === null || instance.endExclusive > state.turn))) {
      reasons.push('El beneficio temporal de este programa todavía está activo o programado.'); break;
    }
  }
  for (const requirement of policy.requirements) {
    switch (requirement.kind) {
      case 'action':
        if (!state.history.some(item => item.actionId === requirement.actionId && item.turn < state.turn)) reasons.push(`Completá ${policyName(requirement.actionId)} en un turno anterior.`);
        break;
      case 'indicator':
        if (!compare(state.indicators[requirement.indicatorId], requirement.operator, requirement.value)) reasons.push(`${indicatorName(requirement.indicatorId)} debe ser ${requirement.operator} ${requirement.value}.`);
        break;
      case 'legislative':
        if (legislativeSupport(state, policy.id) < requirement.minimum) reasons.push(`Requiere ${requirement.minimum} bancas de apoyo a esta ley (actual: ${legislativeSupport(state, policy.id).toFixed(1)}).`);
        break;
      case 'meeting': {
        const id = requirement.actorId === 'actorId' ? params.actorId : requirement.actorId;
        if (!id || !state.actors[id] || !hasRecentMeeting(state, id)) reasons.push('Requiere una reunión vigente con el actor (4 turnos).');
        break;
      }
      case 'agreement': {
        const active = requirement.templateId === 'acuerdo_precios'
          ? agreementActive(state, 'acuerdo_precios', undefined, 'industria') && agreementActive(state, 'acuerdo_precios', undefined, 'pymes')
          : agreementActive(state, requirement.templateId, scopeOf(params, policy));
        if (!active) reasons.push(`Requiere acuerdo vigente: ${requirement.templateId.replace(/_/g, ' ')}.`);
        break;
      }
      case 'study':
        if (!state.studies.some(study => study.projectId === policy.id && !study.consumed && study.startTurn <= state.turn && state.turn < study.endExclusive)) reasons.push('Requiere un estudio vigente para esta obra.');
        break;
      case 'debt': {
        const principal = policy.effects.find(effect => effect.kind === 'loan' && effect.operation === 'originate')?.magnitude ?? 0;
        { const maximum = requirement.maximum + (state.campaign && state.profile === 'empresario' ? 500 : 0);
          if (totalDebt(state) + principal > maximum) reasons.push(`La deuda posterior superaría ${maximum} U.`); }
        break;
      }
      case 'loan': {
        const loan = state.loans.find(item => item.id === params.loanId);
        if (!loan || loan.outstanding <= 0 || loan.restructured || loan.dueTurn - state.turn > requirement.maximumDueIn) reasons.push('Elegí un préstamo pendiente que venza dentro de 2 turnos y no haya sido reperfilado.');
        break;
      }
      case 'event': if (!state.waterCrisis) reasons.push('El contexto requerido no está activo.'); break;
    }
  }
  if (policy.id === 'estudio_factibilidad') {
    if (!isProject(params.projectId ?? '')) reasons.push('Elegí la obra que querés estudiar.');
    if (state.studies.some(study => study.projectId === params.projectId && !study.consumed && study.endExclusive > state.turn)) reasons.push('Ya existe un estudio vigente o pendiente para esa obra.');
  }
  if (policy.role === 'interaction' && !actor) reasons.push('Elegí un actor válido.');
  if (policy.id === 'negociar' && actor) {
    reasons.push(...offerReasons(state, params));
    const forecast = fiscalForecast(state);
    if (forecast.some(point => point.cash - cashCost < 0) && params.templateId !== 'reperfilamiento') reasons.push('Los compromisos actuales dejan caja negativa en la proyección de 4 turnos.');
  }
  if (policy.id === 'firmar_acuerdo') {
    const offer = state.offers.find(item => item.id === params.offerId && item.actorId === params.actorId);
    if (!offer || offer.accepted || state.turn >= offer.expiresExclusive) reasons.push('Necesitás una oferta negociada vigente.');
    if (actor && !hasRecentMeeting(state, actor.id)) reasons.push('La reunión debe seguir vigente al firmar.');
  }
  return { allowed: reasons.length === 0, reasons: [...new Set(reasons)], cashCost, actionCost, efficacy: efficacy(state, policy) };
}

function capturedMagnitude(state: CausalState, effect: IndicatorEffect, factor: number): number {
  if (!effect.conditions.every(condition => compare(state.indicators[condition.indicatorId], condition.operator, condition.value))) return 0;
  let magnitude = effect.magnitude;
  if (effect.repetition === 'emission') {
    const count = countUses(state, 'emitir_dinero', 5); // Current execution is already recorded.
    magnitude = BALANCE.emission_multiplier * Math.max(0, count - BALANCE.emission_threshold) ** 2
      + (state.indicators.inflacion >= BALANCE.inflation_condition ? BALANCE.emission_high : 0);
  }
  const beneficial = effect.target === 'inflacion' ? magnitude < 0 : magnitude > 0;
  return beneficial ? magnitude * factor : magnitude;
}
function executePolicy(state: CausalState, policy: PolicyDefinition, params: CommandParams, id: string, availability: Availability): void {
  const cashBefore = state.cash;
  state.cash -= availability.cashCost;
  state.actionPoints -= availability.actionCost;
  const execution = { id, actionId: policy.id, params: { ...params }, turn: state.turn, cashDelta: 0, actionCost: availability.actionCost, efficacy: availability.efficacy };
  state.history.push(execution);
  for (const effect of policy.effects) {
    if (effect.kind === 'indicator' || effect.kind === 'ledger') {
      if (effect.kind === 'ledger' && effect.start === 0) {
        if (effect.target === 'revenue_once' || effect.target === 'financing_issue') state.cash += effect.magnitude;
        // expense_once was debited once above, including any contextual discount.
        continue;
      }
      const instance: EffectInstance = {
        id: `${id}:${effect.id}`, executionId: id, effectId: effect.id, actionId: policy.id,
        startTurn: state.turn + effect.start, endExclusive: effect.duration ? state.turn + effect.start + effect.duration : null,
        magnitude: effect.kind === 'indicator' ? capturedMagnitude(state, effect, availability.efficacy) : effect.magnitude,
        kind: effect.kind, target: effect.target, operation: effect.operation, lastAppliedTurn: null,
      };
      if (effect.kind === 'indicator' && effect.stack === 'renew') {
        for (const previous of state.effects.filter(item => item.effectId === effect.id && (item.endExclusive === null || item.endExclusive > state.turn))) previous.endExclusive = state.turn;
      }
      state.effects.push(instance);
    } else if (effect.kind === 'loan' && effect.operation === 'originate') {
      const type = effect.target === 'external' ? 'external' : 'domestic';
      state.loans.push({ id: `loan:${id}`, executionId: id, type, originalPrincipal: effect.magnitude,
        outstanding: effect.magnitude, issuedTurn: state.turn, dueTurn: state.turn + effect.duration,
        interest: type === 'external' ? BALANCE.external_interest : BALANCE.domestic_interest, restructured: false });
      state.cash += effect.magnitude;
    } else if (effect.kind === 'loan' && effect.operation === 'reschedule') {
      const loan = state.loans.find(item => item.id === params.loanId)!;
      // A past due contract needs four future turns, not a due date still in the past.
      loan.dueTurn = Math.max(state.turn, loan.dueTurn) + effect.magnitude;
      loan.pendingInterest = { amount: loan.interest * 1.25, startTurn: state.turn + 1 };
      loan.restructured = true;
      state.arrears = state.arrears.filter(arrear => !(arrear.loanId === loan.id && arrear.category === 'principal'));
    } else if (effect.kind === 'token') {
      state.studies.push({ projectId: params.projectId!, executionId: id, startTurn: state.turn + effect.start,
        endExclusive: state.turn + effect.start + effect.duration, consumed: false });
    }
  }
  if (policy.id === 'reunirse') meetActor(state, params.actorId!);
  if (policy.id === 'negociar') state.offers.push(makeOffer(state, params, id));
  if (policy.id === 'firmar_acuerdo') signOffer(state, state.offers.find(offer => offer.id === params.offerId)!, id);
  if (isProject(policy.id)) state.studies.find(study => study.projectId === policy.id && !study.consumed && study.startTurn <= state.turn && state.turn < study.endExclusive)!.consumed = true;
  execution.cashDelta = state.cash - cashBefore;
  campaignPolicyExecuted(state, policy);
}

function endogenousChanges(state: CausalState): Partial<Indicators> {
  const previous = state.indicators, older = state.previousIndicators;
  return {
    inflacion: -BALANCE.inflation_revert * (state.base.inflacion - 40),
    actividad: -BALANCE.activity_revert * (state.base.actividad - 50) + BALANCE.credit_to_activity * (previous.credito - 45)
      + BALANCE.infra_to_activity * (previous.infraestructura - 45) + BALANCE.external_to_activity * (previous.externo - 45),
    ingreso_real: BALANCE.activity_to_income * (previous.actividad - older.actividad) + BALANCE.inflation_to_income * (previous.inflacion - older.inflacion),
    credito: -BALANCE.credit_revert * (state.base.credito - 45) + BALANCE.inflation_to_credit * (previous.inflacion - older.inflacion)
      + BALANCE.fiscal_to_credit * (previous.fiscal - BALANCE.fiscal_initial),
  };
}
function indicatorClose(state: CausalState, margin: number): TurnReport['indicators'] {
  const links = endogenousChanges(state), channels = channelOffsets(state);
  const previous = { ...state.indicators }, oldBase = { ...state.base };
  const traces: TurnReport['indicators'] = [];
  for (const indicator of INDICATORS) {
    const id = indicator.id;
    const contributions: IndicatorContribution[] = [];
    if (id === 'fiscal') {
      state.base[id] = margin; state.indicators[id] = margin;
      contributions.push({ sourceId: `fiscal:${state.turn}`, label: 'Ingresos, obligaciones recurrentes, intereses y deuda', kind: 'fiscal', amount: margin - previous[id] });
    } else {
      let impulses = 0, offsets = 0;
      for (const effect of state.effects.filter(item => item.kind === 'indicator' && item.target === id && activeAt(item, state.turn))) {
        if (effect.operation === 'offset') offsets += effect.magnitude;
        else if (effect.lastAppliedTurn !== state.turn) impulses += effect.magnitude;
        else continue;
        contributions.push({ sourceId: effect.id, label: `${policyName(effect.actionId)}${effect.operation === 'offset' ? ' (beneficio temporal)' : ''}`, kind: 'policy', amount: effect.magnitude });
        effect.lastAppliedTurn = state.turn;
      }
      const link = links[id] ?? 0;
      if (link) contributions.push({ sourceId: `link:${id}`, label: 'Interacción rezagada entre indicadores', kind: 'link', amount: link });
      const channel = channels[id] ?? 0;
      if (channel) contributions.push({ sourceId: `channel:${id}`, label: 'Consecuencias de actores del cierre anterior', kind: 'channel', amount: channel });
      const previousOffset = previous[id] - oldBase[id];
      if (previousOffset) contributions.push({ sourceId: `offset:${state.turn - 1}:${id}`, label: 'Sustitución de modificadores del turno anterior', kind: 'expiry', amount: -previousOffset });
      state.base[id] = clamp(oldBase[id] + clamp(impulses + link, -BALANCE.delta_cap, BALANCE.delta_cap));
      state.indicators[id] = clamp(state.base[id] + offsets + channel);
      const explained = contributions.reduce((sum, contribution) => sum + contribution.amount, 0);
      const remainder = state.indicators[id] - previous[id] - explained;
      if (Math.abs(remainder) > 1e-8) contributions.push({ sourceId: `cap:${id}`, label: 'Límite de cambio o saturación del indicador', kind: 'cap', amount: remainder });
    }
    traces.push({ id, before: previous[id], after: state.indicators[id], contributions });
  }
  state.previousIndicators = previous;
  return traces;
}
function closeTurn(state: CausalState): void {
  const messages: string[] = [];
  const fiscal = closeFinances(state);
  const indicators = indicatorClose(state, fiscal.margin);
  const actors = ACTORS.map(actor => {
    const before = state.actors[actor.id].satisfaction;
    const target = actorTarget(actor.id, state.indicators);
    state.actors[actor.id].satisfaction = clamp((1 - BALANCE.smoothing) * before + BALANCE.smoothing * target);
    return { id: actor.id, before, target, after: state.actors[actor.id].satisfaction, relationship: 0, conflict: false };
  });
  messages.push(...resolveAgreements(state));
  updateActorChannels(state);
  for (const report of actors) {
    const status = state.actors[report.id];
    report.relationship = status.relationship; report.conflict = status.conflict;
    if (status.consecutiveLow === 1) messages.push(`${actorById(report.id)!.name} advierte sobre su situación. Otro cierre bajo umbral puede activar su canal de presión.`);
  }
  if (state.actors.cultura.cooperation) {
    const civil = ACTORS.filter(actor => actor.family === 'Sociedad civil' && !hasRecentMeeting(state, actor.id));
    const revealed = civil[0];
    if (revealed) messages.push(`Agenda cultural: ${actorById(revealed.id)!.name} quiere discutir ${indicatorName(actorById(revealed.id)!.sensitivities[0].indicatorId)}. Una reunión permite conocer su demanda.`);
  }
  state.socialComponent = socialComponent(state);
  state.waterCrisisTurns = state.indicators.ambiente < 30 ? state.waterCrisisTurns + 1 : 0;
  if (state.waterCrisisTurns >= 2) state.waterCrisis = true;
  if (state.indicators.ambiente >= 40) state.waterCrisis = false;
  if (state.waterCrisis) messages.push('Crisis hídrica: fondos extraordinarios reducen 10% el costo inicial del plan hídrico.');
  if (fiscal.arrears > 0) messages.push(`${state.crisisTurns >= 2 ? 'Crisis fiscal' : 'Advertencia fiscal'}: ${fiscal.arrears.toFixed(1)} U pendientes de pago. La deuda y los atrasos no se borran.`);
  settleCampaignClose(state);
  state.reports.push({ turn: state.turn, term: state.term, executions: state.history.filter(item => item.turn === state.turn), fiscal,
    indicators, actors, socialComponent: state.socialComponent, messages });
  // Keep currently active and future instances; history and reports retain consumed effect provenance.
  state.effects = state.effects.filter(effect => effect.endExclusive === null || effect.endExclusive > state.turn + 1);
  const endedTerm = state.turn % TURNS_PER_TERM === 0;
  state.turn += 1;
  state.actionPoints = campaignActionPoints(state); state.openingCash = state.cash;
  if (endedTerm && state.phase !== 'ended') state.phase = 'mandate_review';
  if (state.phase === 'governing') refreshPolitics(state);
  refreshLegislature(state);
}

/** Pure transition. Duplicate IDs and stale turn requests never mutate or charge the player. */
export function applyCommand(input: CausalState, command: GameCommand): CommandResult {
  const reject = (message: string): CommandResult => ({ state: input, accepted: false, message });
  if (!command.id.trim() || command.id.length > 180) return reject('Identificador de comando inválido.');
  if (input.processedCommands.includes(command.id)) return reject('Este comando ya fue procesado.');
  if (command.expectedTurn !== input.turn) return reject('La partida cambió de turno. Revisá el estado actual.');
  if (CAMPAIGN_COMMANDS.includes(command.type)) {
    const state = structuredClone(input);
    const error = runCampaignCommand(state, command);
    if (error) return reject(error);
    refreshLegislature(state);
    state.processedCommands.push(command.id);
    return { state, accepted: true, message: 'Decisión registrada.' };
  }
  if (input.phase === 'ended') return reject('Esta partida ya terminó.');
  if (command.type === 'execute') {
    const policy = policyById(command.actionId ?? '');
    if (!policy) return reject('Acción desconocida.');
    const availability = policyAvailability(input, policy.id, command.params);
    if (!availability.allowed) return reject(availability.reasons.join(' '));
    const state = structuredClone(input);
    executePolicy(state, policy, command.params ?? {}, command.id, availability);
    if (state.campaign) { refreshPolitics(state); refreshLegislature(state); }
    state.processedCommands.push(command.id);
    return { state, accepted: true, message: `${policy.name}: ejecución registrada.` };
  }
  if (command.type === 'close_turn' && input.phase !== 'governing') return reject('El mandato está pendiente de revisión.');
  if (command.type === 'close_turn' && campaignBlock(input)) return reject(campaignBlock(input)!);
  if (command.type === 'continue_term' && input.campaign) return reject('La continuidad se resuelve en la elección presidencial.');
  if (command.type === 'continue_term' && input.phase !== 'mandate_review') return reject('Todavía no terminó el mandato.');
  const state = structuredClone(input);
  if (command.type === 'close_turn') closeTurn(state);
  if (command.type === 'continue_term') { state.term += 1; state.phase = 'governing'; }
  if (command.type === 'end_game') { state.phase = 'ended'; if (state.campaign) { state.campaign.outcome = 'retired'; state.campaign.outcomeReason = 'Decidiste finalizar tu carrera presidencial.'; } }
  state.processedCommands.push(command.id);
  return { state, accepted: true, message: command.type === 'close_turn' ? `Turno ${input.turn} cerrado.` : 'Estado actualizado.' };
}

export function policyEffectsPreview(state: CausalState, policy: PolicyDefinition, params: CommandParams = {}) {
  const factor = efficacy(state, policy);
  const previewState = { ...state, history: [...state.history, { id: 'preview', actionId: policy.id, params, turn: state.turn, cashDelta: 0, actionCost: 0, efficacy: factor }] };
  return policy.effects.filter((effect): effect is IndicatorEffect => effect.kind === 'indicator').map(effect => ({
    ...effect, capturedMagnitude: capturedMagnitude(previewState, effect, factor),
    begins: state.turn + effect.start,
    timing: effect.operation === 'offset' ? `beneficio temporal por ${effect.duration} turnos`
      : effect.operation === 'per_turn' ? `cada cierre durante ${effect.duration} turnos` : 'cambio de nivel una vez',
  }));
}
