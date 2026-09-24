import { describe, expect, it } from 'vitest';
import { applyCommand, createCausalGame, policyAvailability } from '../causal/engine';
import { campaignActionReason, electoralBreakdown, eligibleCampaignEvents, settleCampaignClose } from '../causal/campaign';
import { ABILITIES, CABINET, CAMPAIGN_EVENTS } from '../causal/campaignCatalog';
import { deserializeSession, newSession, serializeSession } from '../causal/persistence';
import { actorTarget, efficacy, legislativeSupport, totalDebt } from '../causal/selectors';
import { ACTORS, INDICATORS, POLICIES } from '../causal/catalog';
import { fiscalForecast } from '../causal/finance';
import type { CausalState, GameCommand } from '../causal/types';

let seq = 0;
function issue(state: CausalState, type: GameCommand['type'], targetId?: string, choiceId?: string): CausalState {
  const cmd: GameCommand = { id: `campaign-test-${++seq}`, expectedTurn: state.turn, type, targetId, choiceId };
  if (type === 'execute') cmd.actionId = targetId;
  const result = applyCommand(state, cmd);
  expect(result.accepted, result.message).toBe(true);
  return result.state;
}
function settlePrompts(state: CausalState): CausalState {
  if (state.campaign!.pendingEvent) {
    const event = CAMPAIGN_EVENTS.find(e => e.id === state.campaign!.pendingEvent!.id)!;
    const choice = event.choices.find(c => c.cost === 0)!;
    state = issue(state, 'choose_event', event.id, choice.id);
  }
  if (state.campaign!.resultPending) state = issue(state, 'acknowledge_result');
  if (state.campaign!.strategyPending) state = issue(state, 'choose_strategy', 'negociar');
  return state;
}
function next(state: CausalState) { return issue(settlePrompts(state), 'close_turn'); }
function game(profile = 'politico') { return newSession({ name: 'Prueba', profile, avatar: '' }).state; }

describe('restored cabinet, profiles and abilities', () => {
  it('restores all seven advisors and eight profile abilities', () => {
    expect(CABINET).toHaveLength(7); expect(ABILITIES).toHaveLength(8);
    for (const id of ['politico', 'empresario', 'sindicalista', 'comunicador']) expect(ABILITIES.filter(a => a.profile === id)).toHaveLength(2);
  });
  it('activates extra capacity next turn and pays cabinet salaries in the fiscal ledger', () => {
    let state = game();
    const baseEfficacy = efficacy(state, POLICIES.find(p => p.id === 'mejorar_recaudacion')!);
    state = issue(state, 'hire_advisor', 'advisor1');
    expect(state.cash).toBe(900); expect(state.actionPoints).toBe(3);
    expect(efficacy(state, POLICIES.find(p => p.id === 'mejorar_recaudacion')!)).toBe(baseEfficacy);
    expect(fiscalForecast(state)[0].expense).toBe(450);
    state = next(state);
    expect(state.actionPoints).toBe(6); expect(state.reports[0].fiscal.recurringExpense).toBe(450);
    expect(efficacy(state, POLICIES.find(p => p.id === 'mejorar_recaudacion')!)).toBeCloseTo(1.06);
  });
  it('enforces cabinet capacity, availability, cash and one operation per turn', () => {
    let state = issue(game(), 'hire_advisor', 'advisor1');
    expect(campaignActionReason(state, 'hire_advisor', 'advisor2')).toContain('este turno');
    state = next(state); state = issue(state, 'hire_advisor', 'advisor2'); state = next(state);
    expect(campaignActionReason(state, 'hire_advisor', 'advisor3')).toContain('dos cargos');
    expect(campaignActionReason(game(), 'hire_advisor', 'advisor5')).toContain('aprobación');
    const poor = game(); poor.cash = 0;
    expect(campaignActionReason(poor, 'hire_advisor', 'advisor1')).toContain('300');
  });
  it('training suspends extra capacity and returns a higher-level advisor on its stated date', () => {
    let state = next(issue(game(), 'hire_advisor', 'advisor1'));
    state = issue(state, 'train_advisor', 'advisor1');
    expect(state.campaign!.advisors[0]).toMatchObject({ level: 4, activeFrom: 4 });
    expect(state.actionPoints).toBe(3);
    state = next(state); expect(state.actionPoints).toBe(4);
    state = next(state); expect(state.actionPoints).toBe(6);
    state = settlePrompts(state); state = issue(state, 'dismiss_advisor', 'advisor1');
    expect(state.campaign!.advisors).toHaveLength(0); expect(state.actionPoints).toBe(3);
  });
  it('profile advantages change agenda, meeting costs and policy costs', () => {
    expect(game('sindicalista').actionPoints).toBe(5);
    expect(policyAvailability(game('sindicalista'), 'reunirse', { actorId: 'sindicatos' }).cashCost).toBe(0);
    expect(policyAvailability(game(), 'reunirse', { actorId: 'aliados' }).cashCost).toBe(0);
    expect(policyAvailability(game('empresario'), 'mejorar_recaudacion').cashCost).toBe(90);
  });
  it('communication does not purchase material satisfaction and has a finite duration', () => {
    let state = game('comunicador'); const before = structuredClone(state.actors);
    state = issue(state, 'use_ability', 'campania_mediatica');
    expect(state.actors).toEqual(before); expect(electoralBreakdown(state).communication).toBe(5);
    expect(campaignActionReason(state, 'use_ability', 'campania_mediatica')).toContain('T4');
    while (state.turn < 4) state = next(state);
    expect(electoralBreakdown(state).communication).toBe(0);
    expect(state.campaign!.votes).toBeCloseTo(electoralBreakdown(state).total);
  });
  it('abilities respect profile, agenda and prerequisites', () => {
    expect(campaignActionReason(game(), 'use_ability', 'inversion_privada')).toContain('perfil');
    expect(campaignActionReason(game('empresario'), 'use_ability', 'inversion_privada')).toContain('industria');
    expect(campaignActionReason(game(), 'use_ability', 'pacto_gobernabilidad')).toContain('reuniones');
    const state = game(); state.actionPoints = 0;
    expect(campaignActionReason(state, 'use_ability', 'discurso_patriotico')).toContain('punto');
  });
});

describe('events, news and government objectives', () => {
  it('only offers crises and post-election events when their context exists', () => {
    const state = game();
    const eligible = () => eligibleCampaignEvents(state).map(e => e.id);
    expect(CAMPAIGN_EVENTS).toHaveLength(24);
    expect(eligible()).not.toContain('minister_resignation');
    expect(eligible()).not.toContain('debt_default');
    expect(eligible().some(id => id.startsWith('oposicion_') || id.startsWith('desgaste_'))).toBe(false);
    state.campaign!.advisors.push({ id: 'advisor1', level: 3, activeFrom: 1, hiredTurn: 1 });
    state.arrears.push({ id: 'arrear', category: 'interest', amount: 10, dueTurn: 1 });
    expect(eligible()).toContain('minister_resignation'); expect(eligible()).toContain('debt_default');
    state.campaign!.elections.push({ kind: 'legislative', term: 1, turn: 8, votes: 40, won: false, ownSeats: 40 });
    expect(eligible()).toContain('oposicion_bloqueo'); expect(eligible()).not.toContain('desgaste_soberbia');
    state.campaign!.elections[0].won = true;
    expect(eligible()).not.toContain('oposicion_bloqueo'); expect(eligible()).toContain('desgaste_soberbia');
    state.term = 2;
    expect(eligible().some(id => id.startsWith('oposicion_') || id.startsWith('desgaste_'))).toBe(false);
  });
  it.each(['accept', 'retain'])('the minister event %s changes actual cabinet capacity', choice => {
    let state = next(issue(game(), 'hire_advisor', 'advisor1'));
    state.campaign!.pendingEvent = { id: 'minister_resignation', turn: 1 };
    state = issue(state, 'choose_event', 'minister_resignation', choice);
    expect(state.actionPoints).toBe(4);
    if (choice === 'accept') expect(state.campaign!.advisors).toHaveLength(0);
    else {
      expect(state.campaign!.advisors[0].activeFrom).toBe(4);
      state = next(state); expect(state.actionPoints).toBe(4);
      state = next(state); expect(state.actionPoints).toBe(6);
    }
  });
  it('every event offers an affordable exit and choices block unrelated commands', () => {
    for (const event of CAMPAIGN_EVENTS) expect(event.choices.some(c => c.cost === 0)).toBe(true);
    const state = game(); state.campaign!.pendingEvent = { id: 'health', turn: 1 }; state.cash = 0;
    expect(policyAvailability(state, 'emitir_dinero').allowed).toBe(false);
    expect(applyCommand(state, { id: 'blocked', expectedTurn: 1, type: 'close_turn' }).accepted).toBe(false);
    expect(campaignActionReason(state, 'choose_event', 'health', 'emergency')).toContain('100');
    const after = issue(state, 'choose_event', 'health', 'wait');
    expect(after.campaign!.pendingEvent).toBeNull(); expect(after.actionPoints).toBe(state.actionPoints);
    expect(after.indicators.salud).toBe(50);
    expect(next(after).indicators.salud).toBe(47);
  });
  it('communicator reduces adverse event impacts without erasing the tradeoff', () => {
    let state = game('comunicador'); state.campaign!.pendingEvent = { id: 'health', turn: 1 };
    state = issue(state, 'choose_event', 'health', 'wait'); state = next(state);
    expect(state.indicators.salud).toBeCloseTo(47.9);
  });
  it('records event spending once and rejects a duplicate response', () => {
    let state = game(); state.campaign!.pendingEvent = { id: 'health', turn: 1 };
    const command: GameCommand = { id: 'response', expectedTurn: 1, type: 'choose_event', targetId: 'health', choiceId: 'emergency' };
    const result = applyCommand(state, command); expect(result.accepted).toBe(true); state = result.state;
    expect(state.cash).toBe(1100); expect(applyCommand(state, command).accepted).toBe(false);
    expect(campaignActionReason(state, 'choose_event', 'health', 'wait')).toContain('pendiente');
    state = next(state); expect(state.reports[0].fiscal.executionNet).toBe(-100);
  });
  it('marks and dismisses news without spending agenda or changing results', () => {
    let state = game(); const points = state.actionPoints, cash = state.cash;
    state = issue(state, 'read_news', 'all'); expect(state.campaign!.news.every(n => n.read)).toBe(true);
    state = issue(state, 'dismiss_news', state.campaign!.news[0].id);
    expect(state.campaign!.news[0].dismissed).toBe(true); expect(state.actionPoints).toBe(points); expect(state.cash).toBe(cash);
  });
  it('objective rewards enter the next ledger once, without unexplained cash creation', () => {
    let state = game();
    for (const id of ['educacion', 'salud', 'proteccion'] as const) state.base[id] = state.indicators[id] = 60;
    state = next(state); expect(state.campaign!.objectives[0].completed).toBe(true);
    expect(state.effects.filter(e => e.id === 'objective:services')).toHaveLength(1);
    const opening = state.cash;
    state = next(state);
    expect(state.reports[1].fiscal.executionNet).toBe(120);
    expect(state.cash).toBeCloseTo(opening + 80 + 120);
    state = next(state); expect(state.effects.some(e => e.id === 'objective:services')).toBe(false);
  });
});

describe('elections, defeats and a complete presidential career', () => {
  it('does not count treasury or opposition satisfaction as votes', () => {
    const state = game(), before = electoralBreakdown(state).total;
    state.cash += 999999; state.actors.oposicion.satisfaction = 100;
    expect(electoralBreakdown(state).total).toBe(before);
  });
  it('holds midterms once, conserves 100 seats and requires a strategy', () => {
    let state = game(); while (state.turn <= 8) state = next(state);
    const c = state.campaign!;
    expect(c.elections).toHaveLength(1); expect(c.resultPending).toBe(true); expect(c.strategyPending).toBe(true);
    expect(Object.values(c.seats).reduce((a, b) => a + b)).toBe(100);
    expect(campaignActionReason(state, 'choose_strategy', 'acelerar')).not.toBeNull();
    state = issue(state, 'acknowledge_result'); state = issue(state, 'choose_strategy', 'acelerar');
    expect(state.campaign!.strategy).toBe('acelerar'); expect(policyAvailability(state, 'mejorar_recaudacion').cashCost).toBeCloseTo(110);
  });
  it('uses actual seat counts when evaluating a bill', () => {
    const state = game(), before = legislativeSupport(state, 'reforma_impositiva');
    state.campaign!.seats = { oficialismo: 70, aliados: 10, oposicion: 20 };
    expect(legislativeSupport(state, 'reforma_impositiva')).toBeGreaterThan(before);
  });
  it('limits the bold strategy to two turns', () => {
    let state = game(); state.turn = 9; state.campaign!.strategyPending = true;
    state = issue(state, 'choose_strategy', 'jugada_audaz');
    state = next(state); expect(state.campaign!.strategy).toBe('jugada_audaz');
    state = next(state); expect(state.campaign!.strategy).toBe('negociar');
  });
  it('reelection preserves debt, effects, cabinet and contracts', () => {
    let state = game(); state = issue(state, 'hire_advisor', 'advisor1'); state = issue(state, 'execute', 'prestamo_local');
    state.phase = 'mandate_review'; state.turn = 17; state.campaign!.votes = 55;
    const debt = totalDebt(state), effects = structuredClone(state.effects), cabinet = structuredClone(state.campaign!.advisors);
    state = issue(state, 'resolve_election');
    expect(state.term).toBe(2); expect(state.campaign!.resultPending).toBe(true);
    expect(state.campaign!.elections[state.campaign!.elections.length - 1]?.votes).toBe(55);
    expect(state.campaign!.votes).toBeCloseTo(electoralBreakdown(state).total);
    expect(totalDebt(state)).toBe(debt); expect(state.effects).toEqual(effects); expect(state.campaign!.advisors).toEqual(cabinet);
    expect(campaignActionReason(state, 'resolve_election')).not.toBeNull();
  });
  it('a lost election ends the game and cannot be bypassed with continue_term', () => {
    let state = game(); state.turn = 17; state.phase = 'mandate_review'; state.campaign!.votes = 40;
    expect(applyCommand(state, { id: 'bypass', expectedTurn: 17, type: 'continue_term' }).accepted).toBe(false);
    state = issue(state, 'resolve_election'); expect(state.phase).toBe('ended'); expect(state.campaign!.outcome).toBe('defeat');
  });
  it('completes two mandates and makes a third impossible', () => {
    let state = game();
    while (state.turn <= 16) state = next(state);
    expect(state.phase).toBe('mandate_review');
    state.campaign!.votes = Math.max(50, state.campaign!.votes);
    state = issue(state, 'resolve_election');
    while (state.turn <= 32 && state.phase !== 'ended') state = next(state);
    expect(state.phase).toBe('ended'); expect(state.turn).toBe(33); expect(state.term).toBe(2);
    expect(state.campaign!.elections.filter(e => e.kind === 'legislative')).toHaveLength(2);
    expect(applyCommand(state, { id: 'third', expectedTurn: 33, type: 'continue_term' }).accepted).toBe(false);
  });
  it('awards the final victory only with objectives and electoral backing', () => {
    const state = game(); state.turn = 32; state.term = 2;
    state.campaign!.objectives.forEach(o => { o.completed = true; o.progress = 100; });
    state.socialComponent = 75;
    settleCampaignClose(state);
    expect(state.phase).toBe('ended'); expect(state.campaign!.outcome).toBe('victory');
  });
  it.each(['approval', 'fiscal', 'impeachment', 'coup', 'hyperinflation'] as const)('restores the %s defeat path with warning turns', kind => {
    const state = game();
    if (kind === 'approval') state.socialComponent = 10;
    if (kind === 'fiscal') state.arrears = [{ id: 'unpaid', category: 'program', amount: 900, dueTurn: 1 }];
    if (kind === 'impeachment') { state.indicators.derechos = 0; state.agreements = [{ id: 'broken', actorId: 'aliados', status: 'broken', templateId: 'resultado', createdTurn: 1, delta: 4, signedTurn: 1, signedExecutionId: 'x', baseline: 50, deadline: 2, activeFrom: 1, activeUntilExclusive: 2 }]; }
    if (kind === 'coup') { Object.values(state.actors).forEach(a => a.conflict = true); state.actors.oficialismo.relationship = 10; }
    if (kind === 'hyperinflation') { state.indicators.inflacion = 99; state.indicators.ingreso_real = 10; }
    settleCampaignClose(state); expect(state.phase).toBe('governing'); expect(state.campaign!.news.some(n => n.importance === 'critical')).toBe(true);
    for (let i = 0; i < 2 && state.phase !== 'ended'; i++) { state.turn++; settleCampaignClose(state); }
    expect(state.phase).toBe('ended'); expect(state.campaign!.outcome).toBe('defeat');
  });
});

describe('persistence, migration and deterministic simulation', () => {
  it('replays a full first mandate, cabinet decisions, events and election exactly', () => {
    const session = newSession({ name: 'Partida completa', profile: 'politico', avatar: '', difficulty: 'easy' });
    const submit = (type: GameCommand['type'], targetId?: string, choiceId?: string) => {
      const cmd: GameCommand = { id: `save-${++seq}`, expectedTurn: session.state.turn, type, targetId, choiceId };
      const result = applyCommand(session.state, cmd); expect(result.accepted, result.message).toBe(true);
      session.state = result.state; session.commands.push(cmd);
    };
    submit('hire_advisor', 'advisor1');
    while (session.state.turn <= 16) {
      const c = session.state.campaign!;
      if (c.pendingEvent) { const event = CAMPAIGN_EVENTS.find(e => e.id === c.pendingEvent!.id)!; submit('choose_event', event.id, event.choices.find(x => x.cost === 0)!.id); }
      if (session.state.campaign!.resultPending) submit('acknowledge_result');
      if (session.state.campaign!.strategyPending) submit('choose_strategy', 'abrirse');
      submit('close_turn');
    }
    submit('resolve_election');
    expect(deserializeSession(serializeSession(session)).state).toEqual(session.state);
  });
  it('upgrades an old causal save at a replay boundary without rewriting past decisions', () => {
    const original = createCausalGame('Anterior', 'politico', '');
    const cmd: GameCommand = { id: 'old', type: 'execute', actionId: 'prestamo_local', expectedTurn: 1 };
    const old = applyCommand(original, cmd).state;
    const raw = JSON.stringify({ schemaVersion: 1, modelVersion: 'causal-1', player: { name: 'Anterior', profile: 'politico', avatar: '' }, commands: [cmd] });
    const upgraded = deserializeSession(raw);
    expect(upgraded.state.cash).toBe(old.cash); expect(upgraded.state.loans).toEqual(old.loans); expect(upgraded.campaignStart).toBe(1);
    expect(deserializeSession(serializeSession(upgraded)).state).toEqual(upgraded.state);
  });
  it('difficulty changes fiscal revenue and cannot be tampered into an unknown mode', () => {
    const easy = newSession({ name: 'A', profile: 'politico', avatar: '', difficulty: 'easy' });
    const hard = newSession({ name: 'A', profile: 'politico', avatar: '', difficulty: 'hard' });
    expect(next(easy.state).cash).toBeGreaterThan(next(hard.state).cash);
    const broken = JSON.parse(serializeSession(easy)); broken.player.difficulty = 'unknown';
    expect(() => deserializeSession(JSON.stringify(broken))).toThrow();
  });
  it('recovers a core-only development save stamped before its migration boundary existed', () => {
    const command: GameCommand = { id: 'old-close', expectedTurn: 1, type: 'close_turn' };
    const raw = JSON.stringify({ schemaVersion: 1, modelVersion: 'causal-1', campaignVersion: 1, player: { name: 'Anterior', profile: 'politico', avatar: '' }, commands: [command] });
    const restored = deserializeSession(raw);
    expect(restored.campaignStart).toBe(1); expect(restored.state.turn).toBe(2);
    expect(deserializeSession(serializeSession(restored)).state).toEqual(restored.state);
  });
  it('does not mutate state when previewing unavailable campaign actions', () => {
    const state = game(), snapshot = JSON.stringify(state);
    campaignActionReason(state, 'hire_advisor', 'advisor1'); campaignActionReason(state, 'use_ability', 'discurso_patriotico');
    expect(JSON.stringify(state)).toBe(snapshot);
  });
  it('can safely close after a special ability while a material agreement is pending', () => {
    let state = game('comunicador');
    state.agreements.push({ id: 'a', actorId: 'sindicatos', templateId: 'resultado', indicatorId: 'ingreso_real', createdTurn: 1, delta: 4, signedTurn: 1, signedExecutionId: 'signature', baseline: 45, deadline: 5, activeFrom: 99, activeUntilExclusive: 99, status: 'pending' });
    state.history.push({ id: 'signature', actionId: 'firmar_acuerdo', params: { actorId: 'sindicatos' }, turn: 1, cashDelta: 0, actionCost: 1, efficacy: 1 });
    state = issue(state, 'use_ability', 'gira_medios'); state = next(state);
    expect(state.agreements[0].status).toBe('pending');
  });
  it('keeps all generated indicators finite and bounded over repeated full careers', () => {
    for (const profile of ['politico', 'sindicalista', 'empresario', 'comunicador']) {
      let state = game(profile);
      for (let t = 0; t < 32 && state.phase !== 'ended'; t++) {
        if (state.phase === 'mandate_review') state = issue(state, 'resolve_election');
        if (state.phase === 'ended') break;
        state = next(state);
        for (const indicator of INDICATORS) expect(state.indicators[indicator.id]).toBeGreaterThanOrEqual(0);
        for (const actor of ACTORS) expect(Number.isFinite(actorTarget(actor.id, state.indicators))).toBe(true);
        expect(state.cash).toBeGreaterThanOrEqual(0);
      }
    }
  });
});
