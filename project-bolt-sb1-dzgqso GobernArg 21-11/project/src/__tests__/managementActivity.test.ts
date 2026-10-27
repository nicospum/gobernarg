import { afterEach, describe, expect, it, vi } from 'vitest';
import { ACTOR_IDS, DIFFICULTY_LEVELS } from '../data/causal';
import { canMeet, closeTurn, createCausalState, nextRandom, recomputePolitical } from '../engine/causal';
import { managementGovernabilityPenalty, previewManagementActivity } from '../engine/causal/managementActivity';
import { createNewGame, interactWithActor, processEndTurn, toggleActionSelection, triggerMidtermStrategy } from '../engine/gameEngine';
import { encodeSavedGame, parseSavedGame } from '../lib/savegame';

const fresh = () => createCausalState({ scenarioId: 'pais_en_calma', calendar: 'light-12', seed: 1 });
const game = () => createNewGame({ archetype: 'empresario', governorName: 'Ana', scenarioId: 'pais_en_calma', seed: 1 });
afterEach(() => vi.restoreAllMocks());

describe('Uso de PA reales y presión de gestión', () => {
  it('tolera un PA libre, acumula mucho menos por dos/tres libres y no castiga capacidad cero', () => {
    const state = fresh();
    expect(previewManagementActivity(state, { available: 4, remaining: 1 }, 12).record).toMatchObject({ pressureAfter: 0, imagenDelta: 0, governabilityPenalty: 0 });
    expect(previewManagementActivity(state, { available: 4, remaining: 2 }, 12).record).toMatchObject({ pressureAfter: 0.025, imagenDelta: -0.0125 });
    expect(previewManagementActivity(state, { available: 4, remaining: 3 }, 12).record).toMatchObject({ pressureAfter: 0.05, imagenDelta: -0.025 });
    expect(previewManagementActivity(state, { available: 3, remaining: 3 }, 12).record).toMatchObject({ pressureAfter: 1, imagenDelta: -0.5, used: 0 });
    expect(previewManagementActivity(state, { available: 0, remaining: 0 }, 12).record).toMatchObject({ pressureAfter: 0, imagenDelta: 0, bonusAwarded: false });
  });

  it('la inacción es leve los primeros tres cierres y recupera presión usando al menos tres PA', () => {
    const s = fresh();
    const penalties: number[] = [];
    for (let t = 1; t <= 5; t++) {
      s.turn = t;
      const next = previewManagementActivity(s, { available: 4, remaining: 4 }, 12);
      s.managementActivity = next.activity; penalties.push(next.record.governabilityPenalty);
    }
    expect(penalties).toEqual([0.25,0.5,0.75,16.75,32.75]);
    s.turn++;
    const recovered = previewManagementActivity(s, { available: 4, remaining: 1 }, 12);
    expect(recovered.record).toMatchObject({ pressureBefore: 5, pressureAfter: 4, governabilityPenalty: 16.75, imagenDelta: 0 });
    expect(managementGovernabilityPenalty(20)).toBe(100);
    expect(managementGovernabilityPenalty(-3)).toBe(0);
  });

  it('un mandato completo dejando dos o tres PA libres tiene presión pequeña, sin escalada de inacción total', () => {
    for (const [remaining, expected] of [[2,0.3],[3,0.6]]) {
      const s = fresh();
      for (let t = 1; t <= 12; t++) { s.turn = t; s.managementActivity = previewManagementActivity(s, { available: 4, remaining }, 12).activity; }
      expect(s.managementActivity?.pressure).toBe(expected);
      expect(managementGovernabilityPenalty(s.managementActivity!.pressure)).toBeLessThanOrEqual(0.75);
    }
  });

  it.each([12,16])('dos mandatos de %i cierres con uso parcial conservan un desgaste muy pequeño', turns => {
    for (const [remaining, weight] of [[2,0.025],[3,0.05]]) {
      const s = fresh(); let imageLoss = 0;
      for (let t = 1; t <= 2 * turns; t++) {
        s.turn = t; s.mandateStart = t > turns ? turns + 1 : 1;
        const preview = previewManagementActivity(s, { available: 4, remaining }, turns);
        s.managementActivity = preview.activity; imageLoss += preview.record.imagenDelta;
        expect(preview.record.bonusAwarded).toBe(false);
      }
      expect(s.managementActivity?.pressure).toBeCloseTo(2 * turns * weight, 9);
      expect(managementGovernabilityPenalty(s.managementActivity!.pressure)).toBeCloseTo(0.25 * 2 * turns * weight, 9);
      expect(imageLoss).toBeCloseTo(-0.5 * 2 * turns * weight, 9);
      expect(managementGovernabilityPenalty(s.managementActivity!.pressure)).toBeLessThanOrEqual(0.4);
    }
  });

  it('la previsión es pura y un recalculo político no borra la penalidad acumulada', () => {
    const s = fresh(); const before = structuredClone(s);
    const preview = previewManagementActivity(s, { available: 4, remaining: 4 }, 12);
    expect(s).toEqual(before);
    const control = structuredClone(s); recomputePolitical(control, 0);
    s.managementActivity = { ...preview.activity, pressure: 4 }; recomputePolitical(s, 0);
    expect(control.political.gob - s.political.gob).toBeCloseTo(16.75, 8);
    recomputePolitical(s, 0);
    expect(control.political.gob - s.political.gob).toBeCloseTo(16.75, 8);
  });

  it('el exceso de bonus sobre100 no absorbe el descuento de gobernabilidad', () => {
    const s = fresh();
    s.bonuses.push({ id: 'emergencia', target: 'GOB', value: 200, start: 0, end: 99, source: 'test', label: 'Emergencia' });
    s.managementActivity!.pressure = 9; recomputePolitical(s, 0);
    expect(s.political.gob).toBeCloseTo(3.25, 8);
  });

  it('mide reunión gratis/paga, encuesta y negociación incluso fallida, sin contar sólo políticas', () => {
    let s = game();
    s = interactWithActor(s, 'clase_media', 'encuesta');
    s = interactWithActor(s, 'aliados', 'reunion');
    expect(s.actions).toBe(4);
    s = interactWithActor(s, 'financiero', 'reunion');
    expect(s.actions).toBe(3);
    s = interactWithActor(s, 'financiero', 'negociar');
    expect(s.actions).toBe(2);
    const result = processEndTurn(s);
    expect(result.state.causal.records[0].managementActivity).toMatchObject({ available: 4, used: 2, unused: 2, pressureAfter: 0.025 });
  });

  it('seleccionar y cancelar devuelve los PA; la emisión forzada no disimula la inacción', () => {
    let s = game();
    s = toggleActionSelection(toggleActionSelection(s, 'mantenimiento_infraestructura'), 'mantenimiento_infraestructura');
    s.causal.forcedEmission = true;
    const result = processEndTurn(s); const record = result.state.causal.records[0];
    expect(record.actions.some(a => a.forced)).toBe(true);
    expect(record.managementActivity).toMatchObject({ used: 0, unused: 4, pressureAfter: 1 });
  });

  it('el motor de bajo nivel sin presupuesto no inventa uso o desuso de PA', () => {
    const s = fresh(); delete s.managementActivity;
    const result = closeTurn(s, []);
    expect(result.state.managementActivity).toBeUndefined();
    expect(result.record.managementActivity).toBeUndefined();
  });
});

describe('Premio único al cierre de un mandato completo observado', () => {
  it.each([12,16])('sólo concede +2 imagen al último de %i cierres completos, nunca antes ni dos veces', turns => {
    const s = fresh(); const deltas: number[] = [];
    for (let t = 1; t <= turns; t++) { s.turn = t; const next = previewManagementActivity(s, { available: 4, remaining: 0 }, turns); s.managementActivity = next.activity; deltas.push(next.record.imagenDelta); }
    expect(deltas.slice(0,-1).every(x => x === 0)).toBe(true);
    expect(deltas[turns - 1]).toBe(2);
    expect(previewManagementActivity(s, { available: 4, remaining: 0 }, turns).record.bonusAwarded).toBe(false);
  });

  it('el cierre integrado concede exactamente dos puntos de imagen y como máximo medio punto de IV', () => {
    const s = fresh(); s.turn = 12;
    s.managementActivity = { pressure: 0, mandateStart: 1, observedTurns: 11, perfectUse: true, bonusGranted: false };
    const control = closeTurn(s, []);
    const awarded = closeTurn(s, [], { activityBudget: { available: 4, remaining: 0 }, mandateTurns: 12 });
    expect(awarded.record.managementActivity?.bonusAwarded).toBe(true);
    expect(awarded.state.political.imagen - control.state.political.imagen).toBeCloseTo(2, 8);
    expect(awarded.state.political.iv - control.state.political.iv).toBeCloseTo(0.5, 8);
    expect(awarded.state.political.gob).toBe(control.state.political.gob);
  });

  it('un solo PA libre, una suspensión o un salto de historial impiden el premio', () => {
    for (const failure of ['unused','suspended','missing']) {
      const s = fresh();
      for (let t = 1; t <= 12; t++) {
        s.turn = t;
        if (failure === 'missing' && t === 5) continue;
        const next = previewManagementActivity(s, { available: 4, remaining: failure === 'unused' && t === 5 ? 1 : 0, allSelectionsExecuted: !(failure === 'suspended' && t === 5) }, 12);
        s.managementActivity = next.activity;
        expect(next.record.bonusAwarded).toBe(false);
      }
    }
  });

  it('una suspensión judicial consume esfuerzo pero invalida el premio en el cierre integrado', () => {
    const s = fresh(); s.turn = 12;
    s.managementActivity = { pressure: 0, mandateStart: 1, observedTurns: 11, perfectUse: true, bonusGranted: false };
    s.actors.derechos_cultura.sat = 0;
    for (let seed = 1; seed < 100; seed++) { if (nextRandom(seed)[0] < .25) { s.rng = seed; break; } }
    const result = closeTurn(s, [{ actionId: 'mano_dura' }], { activityBudget: { available: 4, remaining: 0 }, mandateTurns: 12 });
    expect(result.record.actions[0].suspended).toBeTruthy();
    expect(result.record.managementActivity).toMatchObject({ used: 4, pressureAfter: 0, bonusAwarded: false });
    expect(result.state.managementActivity?.perfectUse).toBe(false);
  });

  it('un guardado sin historial arranca neutral; el mandato siguiente reinicia observación y conserva presión', () => {
    const s = fresh(); s.turn = 5; delete s.managementActivity;
    expect(previewManagementActivity(s, { available: 4, remaining: 0 }, 12)).toMatchObject({ activity: { pressure: 0, observedTurns: 1, perfectUse: false } });
    s.turn = 13; s.mandateStart = 13;
    s.managementActivity = { pressure: 3, mandateStart: 1, observedTurns: 12, perfectUse: false, bonusGranted: false };
    expect(previewManagementActivity(s, { available: 4, remaining: 0 }, 12)).toMatchObject({ activity: { pressure: 2, mandateStart: 13, observedTurns: 1, perfectUse: true, bonusGranted: false } });
  });
});

describe('Integración de caída y persistencia', () => {
  it('inacción total cae antes de fin de mandato en tres niveles, cuatro arquetipos y ambos calendarios', () => {
    vi.spyOn(Math, 'random').mockReturnValue(.999);
    for (const calendar of ['light-12','legacy-16'] as const) for (const difficulty of DIFFICULTY_LEVELS) for (const archetype of ['politico','empresario','sindicalista','comunicador'] as const) {
      let s = createNewGame({ scenarioId: difficulty.scenarioId, archetype, governorName: 'Idle', seed: 1, calendar });
      for (let t = 0; t < 16 && !s.gameOver; t++) { if (s.pendingMidtermStrategy) s = triggerMidtermStrategy(s, 'negociar'); s = processEndTurn(s).state; }
      expect(s.defeatReason).toBe('impeachment');
      expect(s.causal.records.length).toBeLessThan(calendar === 'light-12' ? 12 : 16);
      expect(s.causal.records[s.causal.records.length - 1].managementActivity?.used).toBe(0);
    }
  });

  it('la derrota coincidente con legislativas limpia decisiones pendientes e impide seguir actuando', () => {
    vi.spyOn(Math, 'random').mockReturnValue(.999);
    let s = createNewGame({ scenarioId: 'viento_de_cola', archetype: 'politico', governorName: 'Idle', seed: 1 });
    s.year = 2; s.turn = 3; s.causal.turn = 6;
    s.causal.managementActivity = { pressure: 5, mandateStart: 1, observedTurns: 5, perfectUse: false, bonusGranted: false };
    s.causal.govCrisisStreak = 1;
    s = processEndTurn(s).state;
    expect(s.gameOver).toBe(true);
    expect(s.pendingMidtermStrategy).toBe(false);
    expect(s.availableMidtermStrategies).toEqual([]);
    expect(s.pendingElection).toBe(false);
    expect(toggleActionSelection(s, 'emitir_dinero')).toBe(s);
    expect(interactWithActor(s, 'financiero', 'reunion')).toBe(s);
    expect(processEndTurn(s).state.causal).toEqual(s.causal);
  });

  it('la segunda crisis al cerrar T24 tiene prioridad sobre una sucesión con IV ganadora', () => {
    vi.spyOn(Math, 'random').mockReturnValue(.999);
    const s = game();
    s.term = 2; s.year = 4; s.turn = 3; s.actions = 3;
    s.causal.turn = 24; s.causal.mandateStart = 13; s.causal.govCrisisStreak = 1;
    s.causal.managementActivity = { pressure: 5.75, mandateStart: 13, observedTurns: 11, perfectUse: false, bonusGranted: false };
    s.causal.base.CONF = 100; s.causal.political.imagen = 95;
    for (const actor of ACTOR_IDS) { s.causal.actors[actor].sat = 90; if (s.causal.actors[actor].rel !== null) s.causal.actors[actor].rel = 90; }
    const result = processEndTurn(s).state;
    expect(result.causal.govCrisisStreak).toBe(2);
    expect(result.causal.political.iv).toBeGreaterThan(45);
    expect(result).toMatchObject({ gameOver: true, victorious: false, defeatReason: 'impeachment', pendingElection: false, pendingMidtermStrategy: false, electionResults: null, year: 4, turn: 3 });
    expect(result.causal.turn).toBe(25);
    expect(parseSavedGame(encodeSavedGame(result))?.state).toEqual(result);
  });

  it('los históricos no registran ni aplican la nueva regla', () => {
    const s = createNewGame({ scenarioId: 'corralito', archetype: 'politico', governorName: 'Histórico', seed: 1 });
    const result = processEndTurn(s).state;
    expect(result.causal.calendar).toBe('legacy-16');
    expect(result.causal.managementActivity).toBeUndefined();
    expect(result.causal.records[0].managementActivity).toBeUndefined();
  });

  it('guardar/cargar conserva presión y progreso sin alterarlos; rechaza campos nuevos malformados', () => {
    const s = processEndTurn(game()).state;
    const raw = encodeSavedGame(s); expect(parseSavedGame(raw)?.state).toEqual(s);
    const v2 = JSON.parse(raw);
    for (const field of ['pressure','mandateStart','observedTurns','perfectUse','bonusGranted']) { const bad = structuredClone(v2); bad.state.causal.managementActivity[field] = { broken: true }; expect(parseSavedGame(JSON.stringify(bad))).toBeNull(); }
    for (const pressure of [-1,5,33]) { const bad = structuredClone(v2); bad.state.causal.managementActivity.pressure = pressure; expect(parseSavedGame(JSON.stringify(bad))).toBeNull(); }
    const bad = structuredClone(v2); bad.state.causal.records[0].managementActivity.used = 8; expect(parseSavedGame(JSON.stringify(bad))).toBeNull();
    const old = structuredClone(v2); delete old.state.causal.managementActivity; for (const r of old.state.causal.records) delete r.managementActivity;
    expect(parseSavedGame(JSON.stringify(old))?.state.causal.managementActivity).toBeUndefined();
  });

  it('un cierre que usa tres PA reales no agrega desgaste y permanece guardable', () => {
    let s = game();
    for (const actor of ACTOR_IDS) { if (s.baseActions - s.actions >= 3) break; if (canMeet(s.causal, actor, s.actions) === null) s = interactWithActor(s, actor, 'reunion'); }
    const result = processEndTurn(s).state;
    expect(result.causal.records[0].managementActivity).toMatchObject({ used: 3, unused: 1, pressureAfter: 0, imagenDelta: 0 });
    expect(parseSavedGame(encodeSavedGame(result))?.state).toEqual(result);
  });
});
