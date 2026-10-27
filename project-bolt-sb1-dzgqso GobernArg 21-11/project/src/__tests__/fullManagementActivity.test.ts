import { afterEach, describe, expect, it, vi } from 'vitest';
import { POLICY_ACTIONS, SCENARIOS } from '../data/causal';
import { availableAdvisors } from '../data/advisors';
import {
  closeTurn, createCausalState, managementGovernabilityPenalty, previewManagementActivity,
  recomputePolitical, Rng,
} from '../engine/causal';
import {
  createNewGame, hireAdvisors, interactWithActor, processEndTurn, toggleActionSelection,
  triggerMidtermStrategy, useSpecialAbility,
} from '../engine/gameEngine';
import { encodeSavedGame, parseSavedGame } from '../lib/savegame';

afterEach(() => vi.restoreAllMocks());
const game = (scenarioId = 'pais_en_calma') => createNewGame('presidente', 'politico', 'Actividad', false, '', 'easy', undefined, 7, scenarioId);
const budget = (remaining: number, available = 4) => ({ available, remaining });

describe('Actividad: acumulación gradual y recuperación', () => {
  it.each([
    [0, 0, 0], [1, 0, 0], [2, 0.025, -0.0125], [3, 0.05, -0.025], [4, 1, -0.5],
  ])('con %i PA sin usar registra presión %f e imagen %f', (remaining, pressure, imagenDelta) => {
    const state = createCausalState();
    const before = structuredClone(state);
    const result = previewManagementActivity(state, budget(remaining));
    expect(result.activity.pressure).toBe(pressure);
    expect(result.record).toMatchObject({ available: 4, used: 4 - remaining, unused: remaining, imagenDelta });
    expect(result.record.bonusAwarded).toBe(false);
    expect(state).toEqual(before);
  });
  it('cero uso es inactividad completa incluso con sólo tres PA por un paro', () => {
    expect(previewManagementActivity(createCausalState(), budget(3, 3)).activity.pressure).toBe(1);
    expect(previewManagementActivity(createCausalState(), budget(0, 0)).activity.pressure).toBe(0);
  });
  it('cuatro cierres ociosos acumulan desgaste alto; dos/tres PA sobrantes crecen mucho menos', () => {
    const pressures = [2, 3, 4].map(remaining => {
      let state = createCausalState();
      for (let turn = 1; turn <= 4; turn++) {
        state = { ...state, turn, managementActivity: previewManagementActivity(state, budget(remaining)).activity };
        state.turn = turn + 1;
      }
      return state.managementActivity!.pressure;
    });
    expect(pressures).toEqual([0.1, 0.2, 4]);
    expect(managementGovernabilityPenalty(4)).toBe(16.75);
    expect(managementGovernabilityPenalty(100)).toBe(100);
  });
  it('usar al menos tres PA recupera un punto sin borrar de golpe el desgaste acumulado', () => {
    const state = createCausalState();
    state.managementActivity!.pressure = 4;
    const result = previewManagementActivity(state, budget(1));
    expect(result.activity.pressure).toBe(3);
    expect(result.record.governabilityPenalty).toBe(0.75);
    expect(result.record.imagenDelta).toBe(0);
  });
});

describe('Premio sólo con un mandato completo de uso perfecto comprobado', () => {
  function observeMandate(state = createCausalState(), suspendedTurn = 0) {
    const records = [];
    for (let turn = state.turn; turn <= state.mandateStart + 15; turn++) {
      state.turn = turn;
      const result = previewManagementActivity(state, { ...budget(0), allSelectionsExecuted: turn !== suspendedTurn });
      state.managementActivity = result.activity;
      records.push(result.record);
    }
    return { state, records };
  }
  it('otorga +2 imagen sólo en el cierre 16, equivalente a hasta +0.5 pp de IV', () => {
    const { state, records } = observeMandate();
    expect(records.slice(0, 15).every(record => !record.bonusAwarded && record.imagenDelta === 0)).toBe(true);
    expect(records[15]).toMatchObject({ bonusAwarded: true, imagenDelta: 2 });
    expect(state.managementActivity).toMatchObject({ observedTurns: 16, perfectUse: true, bonusGranted: true });
    expect(previewManagementActivity(state, budget(0)).record.bonusAwarded).toBe(false);
  });
  it('no inventa historial en una partida antigua a mitad de mandato ni premia una suspensión', () => {
    const legacy = createCausalState(); delete legacy.managementActivity; legacy.turn = 8;
    expect(observeMandate(legacy).records.some(record => record.bonusAwarded)).toBe(false);
    expect(observeMandate(createCausalState(), 7).records.some(record => record.bonusAwarded)).toBe(false);
  });
  it('una acción restante en un cierre impide el premio, aunque no tenga penalización', () => {
    const state = createCausalState();
    state.managementActivity = previewManagementActivity(state, budget(1)).activity;
    state.turn = 2;
    expect(observeMandate(state).records.some(record => record.bonusAwarded)).toBe(false);
  });
  it('el mandato siguiente reinicia elegibilidad e historial y conserva la presión heredada', () => {
    const state = createCausalState();
    state.managementActivity = { pressure: 4, mandateStart: 1, observedTurns: 16, perfectUse: false, bonusGranted: true };
    state.turn = 17; state.mandateStart = 17;
    expect(previewManagementActivity(state, budget(0)).activity).toEqual({ version: 2, pressure: 3, mandateStart: 17, observedTurns: 1, perfectUse: true, bonusGranted: false });
  });
});

describe('Integración con el cierre y con recursos reales', () => {
  it('los cierres de bajo nivel sin presupuesto explícito mantienen las reglas anteriores', () => {
    const state = createCausalState();
    const result = closeTurn(state, []);
    expect(result.state.managementActivity).toEqual(state.managementActivity);
    expect(result.record.managementActivity).toBeUndefined();
  });
  it('el descuento de gobernabilidad persiste después de eventos o reuniones que recalculan política', () => {
    const result = closeTurn(createCausalState(), [], { activityBudget: budget(4) });
    const withActivity = structuredClone(result.state);
    const withoutActivity = structuredClone(result.state); delete withoutActivity.managementActivity;
    recomputePolitical(withActivity, 1); recomputePolitical(withoutActivity, 1);
    expect(withoutActivity.political.gob - withActivity.political.gob).toBeCloseTo(0.25);
    expect(result.record.managementActivity?.pressureAfter).toBe(1);
  });
  it('un bonus de GOB por encima del máximo no absorbe el descuento declarado', () => {
    const state = createCausalState();
    state.bonuses.push({ id: 'test', target: 'GOB', value: 200, start: 0, end: 10, source: 'test', label: 'Prueba' });
    state.managementActivity!.pressure = 9;
    recomputePolitical(state, 1);
    expect(state.political.gob).toBeCloseTo(100 - managementGovernabilityPenalty(9));
  });
  it('aplica el premio al componente imagen y conserva la fórmula de IV', () => {
    const state = createCausalState(); state.turn = 16;
    state.managementActivity = { pressure: 0, mandateStart: 1, observedTurns: 15, perfectUse: true, bonusGranted: false };
    const regular = closeTurn(state, []);
    const perfect = closeTurn(state, [], { activityBudget: budget(0), mandateTurns: 16 });
    expect(perfect.record.managementActivity).toMatchObject({ bonusAwarded: true, imagenDelta: 2 });
    expect(perfect.state.political.imagen - regular.state.political.imagen).toBeCloseTo(2);
    expect(perfect.state.political.iv - regular.state.political.iv).toBeCloseTo(0.5);
  });
  it('cuenta PA de habilidades y reuniones pagas aunque no haya políticas seleccionadas', () => {
    let state = game();
    state.causal.perks.freeMeetingsPerTurn = 0; state.causal.perks.freeMeetingActors = [];
    state = useSpecialAbility(state, 'discurso_patriotico');
    state = interactWithActor(state, 'industria', 'reunion');
    expect(state.selectedActions).toHaveLength(0);
    expect(state.actions).toBe(2);
    const result = processEndTurn(state).state;
    expect(result.causal.records.slice(-1)[0]?.managementActivity).toMatchObject({ available: 4, used: 2, unused: 2, pressureAfter: 0.025 });
    expect(result.actions).toBe(result.baseActions);
  });
  it('seleccionar y cancelar devuelve PA; encuestas y asesores no inventan consumo de PA', () => {
    let state = game();
    state = toggleActionSelection(state, 'estudio_factibilidad');
    expect(state.actions).toBeLessThan(state.baseActions);
    state = toggleActionSelection(state, 'estudio_factibilidad');
    state = interactWithActor(state, 'clase_media', 'encuesta');
    state = hireAdvisors(state, [availableAdvisors[0]]);
    expect(state.actions).toBe(state.baseActions);
    expect(processEndTurn(state).state.causal.records.slice(-1)[0]?.managementActivity).toMatchObject({ used: 0, unused: 4, pressureAfter: 1 });
  });
  it('emisión forzada no cuenta como una acción usada ni obtiene el premio por sí sola', () => {
    const state = createCausalState(); state.forcedEmission = true;
    const result = closeTurn(state, [], { activityBudget: budget(4) });
    expect(result.record.actions.some(action => action.forced)).toBe(true);
    expect(result.record.managementActivity).toMatchObject({ used: 0, pressureAfter: 1, bonusAwarded: false });
  });
  it('una política suspendida conserva PA reservados como esfuerzo y pierde elegibilidad al premio', () => {
    const action = POLICY_ACTIONS.find(item => item.tags.includes('AMBIENTAL'))!;
    const state = createCausalState(); state.actors.ambiente.sat = 0;
    vi.spyOn(Rng.prototype, 'chance').mockReturnValue(true);
    const result = closeTurn(state, [{ actionId: action.id }], { activityBudget: budget(0) });
    expect(result.record.actions[0].suspended).toBeTruthy();
    expect(result.record.managementActivity).toMatchObject({ used: 4, pressureAfter: 0 });
    expect(result.state.managementActivity?.perfectUse).toBe(false);
  });
  it.each(SCENARIOS.filter(scenario => scenario.reelectionsToUnlock > 0))('mantiene el histórico $id sin nueva actividad', scenario => {
    const result = processEndTurn(game(scenario.id)).state;
    expect(result.causal.managementActivity).toBeUndefined();
    expect(result.causal.records.slice(-1)[0]?.managementActivity).toBeUndefined();
  });
  it('si cae en el cierre legislativo, termina sin dejar una estrategia o elección pendiente', () => {
    const state = game(); state.year = 2; state.turn = 4; state.causal.turn = 8;
    state.causal.govCrisisStreak = 1;
    state.causal.managementActivity = { pressure: 8, mandateStart: 1, observedTurns: 7, perfectUse: false, bonusGranted: false };
    const result = processEndTurn(state).state;
    expect(result.gameOver).toBe(true);
    expect(result.defeatReason).toBe('impeachment');
    expect(result.pendingMidtermStrategy).toBe(false);
    expect(result.availableMidtermStrategies).toEqual([]);
    expect(result.pendingElection).toBe(false);
    expect(result.pendingElectionOptions).toEqual([]);
  });
  it.each([true, false])('el cierre32 prioriza crisis terminal=%s antes de resolver sucesión', terminalCrisis => {
    let state = game();
    state.term = 2; state.year = 4; state.turn = 4;
    state.causal.turn = 32; state.causal.mandateStart = 17;
    state.causal.govCrisisStreak = 1;
    state.causal.managementActivity = { pressure: terminalCrisis ? 10 : 0, mandateStart: 17, observedTurns: 15, perfectUse: false, bonusGranted: false };
    state.causal.political.imagen = 90;
    for (const actor of Object.values(state.causal.actors)) { actor.sat = 90; if (actor.rel !== null) actor.rel = 90; }
    state.causal.perks.freeMeetingsPerTurn = 0; state.causal.perks.freeMeetingActors = [];
    // El uso completo del último trimestre sólo recupera un punto de presión.
    for (const actor of ['industria', 'agro', 'pymes', 'sindicatos'] as const) state = interactWithActor(state, actor, 'reunion');
    expect(state.actions).toBe(0);
    const result = processEndTurn(state).state;
    expect(result.gameOver).toBe(true);
    expect(result.causal.political.iv).toBeGreaterThan(45);
    expect(result.victorious).toBe(!terminalCrisis);
    expect(result.defeatReason).toBe(terminalCrisis ? 'impeachment' : null);
    expect(result.pendingElection).toBe(false);
    expect(result.pendingMidtermStrategy).toBe(false);
    expect(result.year).toBe(4);
    expect(result.turn).toBe(4);
    expect(parseSavedGame(encodeSavedGame(result))).not.toBeNull();
    if (terminalCrisis) {
      expect(result.causal.govCrisisStreak).toBe(2);
      expect(result.causal.managementActivity?.pressure).toBe(9);
      expect(result.electionResults).toBeNull();
    } else expect(result.electionResults?.kind).toBe('succession');
  });
  it('una estrategia pendiente bloquea el cierre sin acumular actividad dos veces', () => {
    const state = game(); state.pendingMidtermStrategy = true;
    const result = processEndTurn(state).state;
    expect(result.causal.turn).toBe(state.causal.turn);
    expect(result.causal.managementActivity).toEqual(state.causal.managementActivity);
    expect(result.causal.records).toEqual([]);
  });
  it('la inactividad total cae antes de terminar incluso el mandato Fácil', () => {
    let state = game();
    for (let turn = 1; turn <= 12 && !state.gameOver; turn++) {
      if (state.pendingMidtermStrategy) state = triggerMidtermStrategy(state, state.availableMidtermStrategies[0]);
      state = processEndTurn(state).state;
    }
    expect(state.gameOver).toBe(true);
    expect(state.defeatReason).toBe('impeachment');
    expect(state.causal.records.length).toBeLessThan(12);
    expect(state.causal.govCrisisStreak).toBeGreaterThanOrEqual(2);
  });
});

describe('Persistencia compatible y validación de actividad', () => {
  it('acepta guardados previos sin campos nuevos y conserva el seguimiento nuevo al reabrir', () => {
    const legacy = game(); delete legacy.causal.managementActivity;
    expect(parseSavedGame(JSON.stringify({ v: 1, state: legacy, pendingEvents: [] }))).not.toBeNull();
    const current = processEndTurn(game()).state;
    expect(parseSavedGame(encodeSavedGame(current))?.state.causal.managementActivity).toEqual(current.causal.managementActivity);
  });
  it.each(['negativePressure','hugePressure','observedTurns','perfectUse','recordCount','recordPenalty','bonusAwarded'])('rechaza actividad corrupta %s antes de importar', field => {
    const saved = JSON.parse(encodeSavedGame(processEndTurn(game()).state));
    const activity = saved.state.causal.managementActivity;
    const record = saved.state.causal.records[0].managementActivity;
    if (field === 'negativePressure') activity.pressure = -1;
    if (field === 'hugePressure') activity.pressure = 1e300;
    if (field === 'observedTurns') activity.observedTurns = 1.5;
    if (field === 'perfectUse') activity.perfectUse = {};
    if (field === 'recordCount') record.used = record.available + 1;
    if (field === 'recordPenalty') record.governabilityPenalty = 101;
    if (field === 'bonusAwarded') record.bonusAwarded = 'sí';
    expect(parseSavedGame(JSON.stringify(saved))).toBeNull();
  });
});
