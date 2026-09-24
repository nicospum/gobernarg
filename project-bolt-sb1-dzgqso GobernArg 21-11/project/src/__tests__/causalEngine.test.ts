import { describe, expect, it } from 'vitest';
import { ACTORS, INDICATORS, POLICIES } from '../causal/catalog';
import { applyCommand, createCausalGame, policyAvailability, policyEffectsPreview } from '../causal/engine';
import { LEGACY_ACTION_AUDIT } from '../causal/legacyMapping';
import { agreementActive, countUses, legislativeSupport, socialComponent, totalArrears, totalDebt } from '../causal/selectors';
import { deserializeSession, newSession, serializeSession } from '../causal/persistence';
import { fiscalForecast } from '../causal/finance';
import type { ActorId, CausalState, CommandParams, GameCommand, IndicatorId } from '../causal/types';

let sequence = 0;
function command(state: CausalState, type: GameCommand['type'], actionId?: string, params?: CommandParams): GameCommand {
  return { id: `test-${++sequence}`, expectedTurn: state.turn, type, actionId, params };
}
function execute(state: CausalState, actionId: string, params?: CommandParams): CausalState {
  const result = applyCommand(state, command(state, 'execute', actionId, params));
  expect(result.accepted, result.message).toBe(true);
  return result.state;
}
function close(state: CausalState): CausalState {
  const result = applyCommand(state, command(state, 'close_turn'));
  expect(result.accepted, result.message).toBe(true);
  return result.state;
}
function setIndicator(state: CausalState, id: IndicatorId, value: number): void {
  state.base[id] = value; state.indicators[id] = value; state.previousIndicators[id] = value;
}
function arrangeMeeting(state: CausalState, actorId: ActorId): CausalState {
  return execute(state, 'reunirse', { actorId });
}
function sign(state: CausalState, actorId: ActorId, params: CommandParams = {}): CausalState {
  state = execute(state, 'negociar', { actorId, ...params });
  const offerId = state.offers[state.offers.length - 1].id;
  return execute(state, 'firmar_acuerdo', { actorId, offerId });
}

describe('causal catalog and migration coverage', () => {
  it('has a unique, linked replacement for every legacy action', () => {
    expect(POLICIES).toHaveLength(48); expect(ACTORS).toHaveLength(18); expect(INDICATORS).toHaveLength(14);
    expect(LEGACY_ACTION_AUDIT).toHaveLength(61);
    expect(new Set(LEGACY_ACTION_AUDIT.map(item => item.sourceId)).size).toBe(61);
    const ids = new Set(POLICIES.map(policy => policy.id));
    expect(ids.size).toBe(48);
    for (const item of LEGACY_ACTION_AUDIT) expect(ids.has(item.targetId)).toBe(true);
    const effects = POLICIES.flatMap(policy => policy.effects);
    expect(effects).toHaveLength(161); expect(new Set(effects.map(effect => effect.id)).size).toBe(161);
    for (const effect of effects) {
      expect(ids.has(effect.actionId)).toBe(true);
      if (effect.kind === 'indicator') { expect(INDICATORS.some(indicator => indicator.id === effect.target)).toBe(true); expect(effect.target).not.toBe('fiscal'); }
    }
    for (const policy of POLICIES) for (const requirement of policy.requirements) {
      if (requirement.kind === 'action') expect(ids.has(requirement.actionId)).toBe(true);
      if (requirement.kind === 'study') expect(ids.has(requirement.projectId)).toBe(true);
    }
  });
  it('uses different influence, electoral and relationship difficulty fields', () => {
    expect(ACTORS.reduce((n, actor) => n + actor.sensitivities.length, 0)).toBe(65);
    for (const actor of ACTORS) {
      expect(actor.sensitivities.length).toBeGreaterThanOrEqual(3);
      expect(actor.sensitivities.length).toBeLessThanOrEqual(5);
      if (actor.family === 'Política') expect(actor.electoralWeight).toBe(0);
    }
  });
});

describe('causal commands, timing and invariants', () => {
  it('starts president-only with four AP and the workbook fiscal baseline', () => {
    const state = createCausalGame();
    expect(state.actionPoints).toBe(4); expect(state.cash).toBe(1200); expect(state.indicators.fiscal).toBe(58);
    expect(Object.values(state.legislativeSupport).every(Number.isFinite)).toBe(true);
  });
  it('commits cash immediately, indicators once at close, without touching actors on execution', () => {
    const original = createCausalGame(), originalJson = JSON.stringify(original);
    const state = execute(original, 'emitir_dinero');
    expect(JSON.stringify(original)).toBe(originalJson);
    expect(state.cash).toBe(1500); expect(state.actionPoints).toBe(3);
    expect(state.indicators).toEqual(original.indicators); expect(state.actors).toEqual(original.actors);
    const closed = close(state);
    expect(closed.cash).toBe(1580); expect(closed.indicators.actividad).toBe(52); expect(closed.indicators.inflacion).toBe(40);
    expect(closed.reports[0].fiscal.issuance).toBe(300); expect(closed.reports[0].fiscal.result).toBe(80);
  });
  it('rejects duplicates, stale turns, unknown actions and insufficient cash atomically', () => {
    const initial = createCausalGame();
    const cmd = command(initial, 'execute', 'emitir_dinero');
    const first = applyCommand(initial, cmd).state;
    expect(applyCommand(first, cmd).state).toBe(first);
    expect(applyCommand(first, cmd).accepted).toBe(false);
    expect(applyCommand(first, command(first, 'execute', 'emitir_dinero')).accepted).toBe(false);
    expect(applyCommand(close(first), { ...cmd, id: 'stale' }).accepted).toBe(false);
    expect(applyCommand(initial, command(initial, 'execute', 'fake')).accepted).toBe(false);
    initial.cash = 0;
    const rejected = applyCommand(initial, command(initial, 'execute', 'plan_viviendas'));
    expect(rejected.accepted).toBe(false); expect(rejected.state).toBe(initial); expect(initial.history).toHaveLength(0);
  });
  it('uses one shared AP pool and prevents spending more AP by calling the engine directly', () => {
    let state = createCausalGame();
    for (const id of ['industria', 'agro', 'pymes', 'cultura'] as const) state = arrangeMeeting(state, id);
    expect(state.actionPoints).toBe(0);
    expect(policyAvailability(state, 'emitir_dinero').allowed).toBe(false);
    expect(close(state).actionPoints).toBe(4);
  });
  it('requires the correct unexpired single-use study, with next-turn activation', () => {
    let state = execute(createCausalGame(), 'estudio_factibilidad', { projectId: 'infraestructura_vial' });
    expect(policyAvailability(state, 'infraestructura_vial').allowed).toBe(false);
    state = close(state);
    expect(policyAvailability(state, 'construccion_hospitales').allowed).toBe(false);
    expect(policyAvailability(state, 'infraestructura_vial').allowed).toBe(true);
    state = execute(state, 'infraestructura_vial');
    expect(state.studies[0].consumed).toBe(true);
    let expired = execute(createCausalGame(), 'estudio_factibilidad', { projectId: 'infraestructura_vial' });
    while (expired.turn < 8) expired = close(expired);
    expect(policyAvailability(expired, 'infraestructura_vial').allowed).toBe(false);
  });
  it('captures context at confirmation and does not re-evaluate a delayed condition later', () => {
    let state = createCausalGame(); setIndicator(state, 'derechos', 30);
    state = execute(state, 'seguridad_ciudadana');
    expect(state.effects.find(effect => effect.target === 'derechos')?.magnitude).toBe(-3);
    state = close(state); setIndicator(state, 'derechos', 70);
    state = close(state);
    expect(state.indicators.derechos).toBe(67);
  });
  it('does not compound offsets and removes them exactly on expiry', () => {
    let state = execute(createCausalGame(), 'seguridad_ciudadana');
    state = close(state); expect(state.indicators.seguridad).toBe(50); expect(state.base.seguridad).toBe(45);
    state = close(state); expect(state.indicators.seguridad).toBe(50);
    state = close(state); expect(state.indicators.seguridad).toBe(45);
  });
  it('retains the base under saturation so an expiring offset leaves no residue', () => {
    let state = createCausalGame(); setIndicator(state, 'actividad', 99);
    state = execute(state, 'emitir_dinero'); state = close(state);
    expect(state.indicators.actividad - state.base.actividad).toBeCloseTo(2);
    state = close(state); state = close(state);
    expect(state.indicators.actividad).toBeCloseTo(state.base.actividad);
  });
  it('adds per-turn effects on every active close, then stops', () => {
    let state = createCausalGame(); setIndicator(state, 'inflacion', 60);
    state = execute(state, 'estabilizacion_monetaria');
    for (let t = 1; t <= 5; t++) {
      state = close(state);
      const trace = state.reports[t - 1].indicators.find(indicator => indicator.id === 'inflacion')!;
      const policyDelta = trace.contributions.filter(item => item.kind === 'policy').reduce((n, item) => n + item.amount, 0);
      expect(policyDelta).toBe(t >= 2 && t <= 4 ? -3 : 0);
    }
  });
  it('makes every indicator trace reconcile exactly, including caps and expirations', () => {
    let state = createCausalGame();
    for (let t = 1; t <= 10; t++) {
      if (t <= 5) state = execute(state, 'emitir_dinero');
      state = close(state);
      for (const trace of state.reports[t - 1].indicators) expect(trace.before + trace.contributions.reduce((sum, c) => sum + c.amount, 0)).toBeCloseTo(trace.after, 8);
    }
  });
});

describe('five workbook scenarios', () => {
  it('reproduces emission pressure, cap, delayed erosion and an inclusive five-turn window', () => {
    let state = createCausalGame();
    const expected = [40, 41, 41.9, 44.71, 53.239, 65.239, 62.7151, 60.44359, 58.399231, 56.5593079];
    for (let t = 1; t <= 10; t++) {
      if (t <= 5) state = execute(state, 'emitir_dinero');
      if (t === 6) expect(countUses(state, 'emitir_dinero', 5)).toBe(4);
      state = close(state);
      expect(state.indicators.inflacion).toBeCloseTo(expected[t - 1], 7);
    }
    expect(state.indicators.ingreso_real).toBeLessThan(40);
    expect(state.actors.clase_media.satisfaction).toBeCloseTo(43.4208442241, 6);
    expect(state.socialComponent).toBeCloseTo(46.7278444716, 6);
  });
  it('reproduces the road timeline: T2 execution, T4 infrastructure, T5 exports and maintenance', () => {
    let state = execute(createCausalGame(), 'estudio_factibilidad', { projectId: 'infraestructura_vial' });
    state = close(state); state = execute(state, 'infraestructura_vial');
    while (state.turn <= 10) {
      state = close(state); const report = state.reports[state.reports.length - 1];
      expect(report.fiscal.recurringExpense).toBe(report.turn >= 5 ? 450 : 420);
      expect(state.indicators.infraestructura).toBe(report.turn >= 4 ? 51 : 45);
    }
    expect(state.actors.agro.satisfaction).toBeCloseTo(48.1484790878, 6);
  });
  it('reproduces two negotiated salary increases with permanent fiscal commitments', () => {
    let state = createCausalGame();
    for (let t = 1; t <= 10; t++) {
      if (t === 1 || t === 5) state = arrangeMeeting(state, 'sindicatos');
      if (t === 2 || t === 6) state = execute(state, 'aumento_salarial');
      state = close(state);
    }
    expect(state.reports[6].fiscal.recurringExpense).toBe(540);
    expect(state.indicators.ingreso_real).toBeCloseTo(54.9852219896, 6);
    expect(state.actors.sindicatos.satisfaction).toBeCloseTo(51.1136859039, 6);
  });
  it('reproduces the external loan without counting principal as revenue or expense', () => {
    let state = execute(createCausalGame(), 'mejorar_recaudacion'); state = close(state);
    state = execute(state, 'prestamo_internacional');
    while (state.turn <= 10) state = close(state);
    expect(state.reports.reduce((sum, report) => sum + report.fiscal.interestPaid, 0)).toBe(192);
    expect(state.reports[9].fiscal.principalPaid).toBe(800); expect(totalDebt(state)).toBe(0);
    expect(state.reports[1].fiscal.principalReceived).toBe(800);
    expect(state.indicators.fiscal).toBeCloseTo(62.584028533, 6);
  });
  it('reproduces a rights conflict and applies friction only to later security benefits', () => {
    let state = createCausalGame(); setIndicator(state, 'derechos', 20); state.actors.ddhh.relationship = 30;
    // The workbook initializes each actor from this alternative scenario, not from the standard start.
    for (const actor of ACTORS) {
      const weight = actor.sensitivities.reduce((sum, item) => sum + Math.abs(item.weight), 0);
      state.actors[actor.id].satisfaction = actor.sensitivities.reduce((sum, item) => sum + Math.abs(item.weight)
        * (item.weight < 0 ? 100 - state.indicators[item.indicatorId] : state.indicators[item.indicatorId]), 0) / weight;
    }
    for (let t = 1; t <= 10; t++) {
      if (t === 1 || t === 5) state = execute(state, 'seguridad_ciudadana');
      if (t === 2) state = execute(state, 'transparencia_publica');
      state = close(state);
    }
    expect(state.indicators.derechos).toBe(19); expect(state.actors.ddhh.conflict).toBe(true);
    expect(state.actors.ddhh.satisfaction).toBeCloseTo(29.947023241, 6);
    expect(state.socialComponent).toBeCloseTo(43.8049437199, 6);
  });
});

describe('meetings, offers and scoped agreements', () => {
  it('a meeting gives information without buying satisfaction or relationship', () => {
    const before = createCausalGame(), after = arrangeMeeting(before, 'sindicatos');
    expect(after.cash).toBe(before.cash - 45); expect(after.actors.sindicatos.relationship).toBe(before.actors.sindicatos.relationship);
    expect(after.actors.sindicatos.satisfaction).toBe(before.actors.sindicatos.satisfaction);
    expect(after.actors.sindicatos.meeting?.priorities).toHaveLength(2);
  });
  it('rejects negotiation and signature before meeting, and respects expiry at t+4', () => {
    let state = createCausalGame();
    expect(policyAvailability(state, 'negociar', { actorId: 'sindicatos', indicatorId: 'ingreso_real' }).allowed).toBe(false);
    expect(policyAvailability(state, 'firmar_acuerdo', { actorId: 'sindicatos' }).allowed).toBe(false);
    state = arrangeMeeting(state, 'sindicatos');
    while (state.turn < 4) state = close(state);
    expect(policyAvailability(state, 'negociar', { actorId: 'sindicatos', indicatorId: 'ingreso_real' }).allowed).toBe(true);
    state = close(state);
    expect(policyAvailability(state, 'negociar', { actorId: 'sindicatos', indicatorId: 'ingreso_real' }).allowed).toBe(false);
  });
  it('signature alone gives no relationship; post-signature delivery rewards exactly once', () => {
    let state = arrangeMeeting(createCausalGame(), 'sindicatos');
    state = sign(state, 'sindicatos', { templateId: 'pacto_laboral' });
    expect(state.actors.sindicatos.relationship).toBe(45);
    state = execute(state, 'aumento_salarial'); state = close(state);
    expect(state.actors.sindicatos.relationship).toBe(53); expect(state.agreements[0].status).toBe('fulfilled');
    state = close(state); expect(state.actors.sindicatos.relationship).toBe(53);
  });
  it('does not reward a policy committed before the signature, even within the same turn', () => {
    let state = arrangeMeeting(createCausalGame(), 'sindicatos'); state = execute(state, 'aumento_salarial');
    state = sign(state, 'sindicatos', { templateId: 'pacto_laboral' }); state = close(state);
    expect(state.agreements[0].status).toBe('pending'); expect(state.actors.sindicatos.relationship).toBe(45);
  });
  it('an unmet agreement expires once and leaves satisfaction independent of relationship', () => {
    let state = arrangeMeeting(createCausalGame(), 'sindicatos'); state = sign(state, 'sindicatos', { templateId: 'pacto_laboral' });
    while (state.turn <= 6) state = close(state);
    expect(state.actors.sindicatos.relationship).toBe(33); expect(state.agreements[0].status).toBe('broken');
    expect(state.actors.sindicatos.satisfaction).toBeGreaterThan(40);
  });
  it('opposition can negotiate from its initial relationship and only assists the specified bill', () => {
    let state = arrangeMeeting(createCausalGame(), 'oposicion');
    state = sign(state, 'oposicion', { templateId: 'acuerdo_ley', billId: 'reforma_impositiva' });
    const before = legislativeSupport(state, 'reforma_impositiva');
    state = close(state); state = close(state); state = arrangeMeeting(state, 'oposicion'); state = close(state);
    expect(agreementActive(state, 'acuerdo_ley', 'reforma_impositiva', 'oposicion')).toBe(true);
    expect(agreementActive(state, 'acuerdo_ley', 'alivio_tributario', 'oposicion')).toBe(false);
    expect(legislativeSupport(state, 'reforma_impositiva')).toBeGreaterThan(before + 30);
    expect(state.socialComponent).toBeCloseTo(socialComponent(createCausalGame()), 5);
  });
  it('uses hysteresis and does not cause a same-turn channel feedback loop', () => {
    let state = createCausalGame();
    for (const id of ['actividad', 'credito', 'infraestructura', 'externo'] as const) setIndicator(state, id, 10);
    state.actors.industria.satisfaction = 20; state.actors.industria.relationship = 30;
    state = close(state); expect(state.actors.industria.conflict).toBe(false);
    state = close(state); expect(state.actors.industria.conflict).toBe(true);
    expect(state.reports[1].indicators.find(item => item.id === 'actividad')!.contributions.some(item => item.kind === 'channel')).toBe(false);
    state = close(state);
    expect(state.reports[2].indicators.find(item => item.id === 'actividad')!.contributions.some(item => item.kind === 'channel')).toBe(true);
  });
});

describe('debt, crises, continuity and persistence', () => {
  it('forecasts interest on overdue principal without changing the real ledger', () => {
    let state = execute(createCausalGame(), 'prestamo_local');
    while (state.turn < 7) state = close(state);
    state.cash = 0; state.openingCash = 0;
    state = close(state);
    const snapshot = JSON.stringify(state);
    const forecast = fiscalForecast(state);
    expect(forecast[0].interest).toBeCloseTo(20 * state.loans[0].outstanding / 500);
    expect(forecast[0].interest).toBeGreaterThan(0);
    const next = close(state);
    expect(forecast[0].cash).toBeCloseTo(next.cash - totalArrears(next));
    expect(forecast[1].interest).toBeLessThan(forecast[0].interest);
    expect(JSON.stringify(state)).toBe(snapshot);
  });
  it('pays domestic interest and principal on the actual contracted dates', () => {
    let state = execute(createCausalGame(), 'prestamo_local');
    while (state.turn <= 7) state = close(state);
    expect(state.reports.map(report => report.fiscal.interestPaid)).toEqual([0, 20, 20, 20, 20, 20, 20]);
    expect(state.reports[6].fiscal.principalPaid).toBe(500); expect(totalDebt(state)).toBe(0);
  });
  it('retains partial unpaid principal and does not duplicate arrears at the next close', () => {
    let state = execute(createCausalGame(), 'prestamo_local');
    while (state.turn < 7) state = close(state);
    state.cash = 0; state.openingCash = 0;
    state = close(state);
    const unpaid = totalDebt(state); expect(unpaid).toBeGreaterThan(400); expect(totalArrears(state)).toBeCloseTo(unpaid);
    expect(policyAvailability(state, 'salud_preventiva').allowed).toBe(false);
    state = close(state);
    expect(totalDebt(state)).toBeLessThan(unpaid);
    expect(state.arrears.filter(item => item.category === 'principal')).toHaveLength(1);
    expect(state.cash).toBeGreaterThanOrEqual(0);
  });
  it('reprofiles only a negotiated selected loan, preserving principal and charging the new rate next turn', () => {
    let state = execute(createCausalGame(), 'prestamo_local');
    while (state.turn < 5) state = close(state);
    const loanId = state.loans[0].id;
    expect(policyAvailability(state, 'reestructurar_deuda', { loanId }).allowed).toBe(false);
    state = arrangeMeeting(state, 'financiero');
    state = sign(state, 'financiero', { templateId: 'reperfilamiento', loanId });
    state = execute(state, 'reestructurar_deuda', { loanId });
    expect(state.loans[0].outstanding).toBe(500); expect(state.loans[0].dueTurn).toBe(11);
    state = close(state); expect(state.reports[4].fiscal.interestPaid).toBe(20);
    state = close(state); expect(state.reports[5].fiscal.interestPaid).toBe(25);
    expect(policyAvailability(state, 'reestructurar_deuda', { loanId }).allowed).toBe(false);
  });
  it('keeps delayed effects, financing, history and cooldowns across a mandate', () => {
    let state = createCausalGame();
    while (state.turn < 15) state = close(state);
    state = execute(state, 'estudio_factibilidad', { projectId: 'infraestructura_vial' }); state = close(state);
    state = execute(state, 'infraestructura_vial'); state = execute(state, 'prestamo_local'); state = execute(state, 'emitir_dinero'); state = close(state);
    expect(state.phase).toBe('mandate_review'); expect(state.turn).toBe(17);
    expect(applyCommand(state, command(state, 'close_turn')).accepted).toBe(false);
    const originalCash = state.cash, historyCount = state.history.length;
    state = applyCommand(state, command(state, 'continue_term')).state;
    expect(state.cash).toBe(originalCash); expect(state.history).toHaveLength(historyCount); expect(totalDebt(state)).toBe(500);
    expect(countUses(state, 'emitir_dinero', 5)).toBe(1);
    state = close(state); state = close(state);
    expect(state.indicators.infraestructura).toBe(51);
    expect(state.loans[0].dueTurn).toBe(22);
  });
  it('cannot infer votes from the treasury or opposition satisfaction', () => {
    const state = createCausalGame(), original = socialComponent(state);
    state.cash = 999999; state.actors.oposicion.satisfaction = 100; state.actors.oficialismo.relationship = 100;
    expect(socialComponent(state)).toBe(original);
  });
  it('replays a mid-turn save identically and rejects incompatible or malicious history', () => {
    const session = newSession({ name: 'Prueba', profile: 'politico', avatar: '' });
    for (const action of ['emitir_dinero', 'prestamo_local']) {
      const cmd = command(session.state, 'execute', action);
      session.state = applyCommand(session.state, cmd).state; session.commands.push(cmd);
    }
    const cmd = command(session.state, 'close_turn'); session.state = applyCommand(session.state, cmd).state; session.commands.push(cmd);
    const restored = deserializeSession(serializeSession(session));
    expect(restored.state).toEqual(session.state);
    expect(close(restored.state).indicators).toEqual(close(session.state).indicators);
    expect(() => deserializeSession('{"schemaVersion":0}')).toThrow();
    const invalid = JSON.parse(serializeSession(session)); invalid.commands[0].params = { actorId: 'unknown' };
    expect(() => deserializeSession(JSON.stringify(invalid))).toThrow();
    invalid.commands = [invalid.commands[1], invalid.commands[1]];
    expect(() => deserializeSession(JSON.stringify(invalid))).toThrow();
  });
  it('previews repetition using the current execution without mutating state', () => {
    let state = execute(createCausalGame(), 'emitir_dinero'); state = close(state);
    state = execute(state, 'emitir_dinero'); state = close(state);
    const snapshot = JSON.stringify(state);
    const preview = policyEffectsPreview(state, POLICIES.find(policy => policy.id === 'emitir_dinero')!);
    expect(preview.filter(effect => effect.target === 'inflacion').reduce((sum, effect) => sum + effect.capturedMagnitude, 0)).toBe(3);
    expect(JSON.stringify(state)).toBe(snapshot);
  });
});
