import { afterEach, describe, expect, it, vi } from 'vitest';
import { createNewGame, processEndTurn, resolvePendingElection, triggerMidtermStrategy } from '../engine/gameEngine';
import { closeTurn } from '../engine/causal';
import { getAllEvents } from '../data/events';
import { encodeSavedGame, loadGame, parseSavedGame, SAVE_KEY, saveGame } from '../lib/savegame';

const game = () => createNewGame({ archetype: 'politico', governorName: 'Ana', seed: 1, scenarioId: 'pais_en_calma' });
afterEach(() => { vi.restoreAllMocks(); vi.unstubAllGlobals(); });
describe('Guardados de ambos calendarios sin pérdida', () => {
  it('v2 identifica Light y conserva exactamente el calendario y el estado de una partida nueva', () => {
    const state = processEndTurn(game()).state;
    const before = structuredClone(state);
    const parsed = parseSavedGame(encodeSavedGame(state, []));
    expect(parsed).toMatchObject({ v: 2, edition: 'Light' });
    expect(parsed?.state).toEqual(state);
    expect(parsed?.state.causal.calendar).toBe('light-12');
    expect(state).toEqual(before);
  });

  it('acepta estados reales de cada cierre, elecciones, fin de partida y eventos pendientes en ambos calendarios', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.999);
    for (const calendar of ['light-12','legacy-16'] as const) {
      let state = createNewGame({ archetype: 'politico', governorName: 'Ana', seed: 1, scenarioId: 'pais_en_calma', calendar });
      let latestPeriod = 1;
      for (let n = 0; n < 40 && !state.gameOver; n++) {
        if (state.pendingMidtermStrategy) state = triggerMidtermStrategy(state, 'negociar');
        if (state.pendingElection) state = resolvePendingElection(state);
        if (state.gameOver) break;
        latestPeriod = Math.max(latestPeriod, state.turn);
        const result = processEndTurn(state);
        state = result.state;
        expect(parseSavedGame(encodeSavedGame(state, result.triggeredEvents))?.state).toEqual(state);
      }
      expect(state.gameOver).toBe(true);
      expect(latestPeriod).toBe(calendar === 'light-12' ? 3 : 4);
      expect(parseSavedGame(encodeSavedGame(state))?.state).toEqual(state);
    }
    expect(parseSavedGame(encodeSavedGame(game(), getAllEvents()))?.pendingEvents).toHaveLength(getAllEvents().length);
  });

  it('v1 mantiene16, incluyendo agenda, ventanas y ejecuciones, sin remapearlas', () => {
    const state = createNewGame({ archetype: 'politico', governorName: 'Anterior', seed: 1, scenarioId: 'pais_en_calma', calendar: 'legacy-16' });
    state.causal = closeTurn(state.causal, [{ actionId: 'inversion_educativa' }]).state;
    state.causal = closeTurn(closeTurn(state.causal, []).state, []).state;
    state.turn = 4;
    delete state.causal.calendar;
    const parsed = parseSavedGame(JSON.stringify({ v: 1, state, savedAt: '', pendingEvents: [] }));
    expect(parsed).toMatchObject({ v: 2, migratedFrom: 1 });
    expect(parsed?.state.causal.calendar).toBe('legacy-16');
    expect(parsed?.state.causal.agenda).toEqual(state.causal.agenda);
    expect(parsed?.state.causal.executions).toEqual(state.causal.executions);
    expect(parsed?.state.turn).toBe(4);
    const originalNext = closeTurn(state.causal, []).state;
    const loadedNext = closeTurn(parsed!.state.causal, []).state;
    expect(loadedNext.base).toEqual(originalNext.base);
    expect(loadedNext.records[loadedNext.records.length - 1]?.fiscal).toEqual(originalNext.records[originalNext.records.length - 1]?.fiscal);
    expect(parseSavedGame(encodeSavedGame(parsed!.state))?.state).toEqual(parsed?.state);
  });

  it('rechaza otra edición, calendarios inválidos, datos incompletos y valores no finitos', () => {
    const valid = JSON.parse(encodeSavedGame(game()));
    expect(parseSavedGame(JSON.stringify({ ...valid, edition: 'Full' }))).toBeNull();
    for (const change of [
      (x: typeof valid) => { x.state.causal.calendar = 'otro'; },
      (x: typeof valid) => { x.state.causal.agenda = {}; },
      (x: typeof valid) => { x.state.causal.actors.docentes = null; },
      (x: typeof valid) => { x.state.causal.political.iv = 'NaN'; },
      (x: typeof valid) => { x.pendingEvents = [null]; },
      (x: typeof valid) => { x.state.objectives[0].requirements.completedActions = {}; },
      (x: typeof valid) => { x.state.causal.expect = {}; },
      (x: typeof valid) => { x.pendingEvents = [{ ...getAllEvents()[0], choices: [{ id: 'x', text: 'x', effects: { immediate: [], delayed: ['roto'] } }] }]; },
      (x: typeof valid) => { x.state.turn = 4; },
    ]) { const bad = structuredClone(valid); change(bad); expect(parseSavedGame(JSON.stringify(bad))).toBeNull(); }
    expect(parseSavedGame(encodeSavedGame(game()).replace('"caja":2000', '"caja":1e999'))).toBeNull();
  });

  it('rechaza objetos en campos opcionales que después consume la interfaz', () => {
    const valid = JSON.parse(encodeSavedGame(processEndTurn(game()).state));
    expect(parseSavedGame(JSON.stringify(valid))).not.toBeNull();
    for (const field of ['year','turn','timestamp','expiresAt','read','dismissed','requiresAcknowledgment','groupId','category','actions','icon','metadata']) {
      const broken = structuredClone(valid);
      // metadata acepta objetos; se rompe con un array, el resto con un objeto.
      broken.state.notifications[0][field] = field === 'metadata' ? [] : { broken: true };
      expect(parseSavedGame(JSON.stringify(broken)), field).toBeNull();
    }
    const broken = structuredClone(valid);
    broken.state.lastInteractionMessage = { broken: true };
    expect(parseSavedGame(JSON.stringify(broken))).toBeNull();
  });

  it('el parseo inválido no sobrescribe la partida ni el progreso del almacenamiento', () => {
    const data = new Map<string,string>();
    vi.stubGlobal('window', { localStorage: { getItem: (k: string) => data.get(k) ?? null, setItem: (k:string,v:string) => data.set(k,v), removeItem: (k:string) => data.delete(k) } });
    saveGame(game());
    data.set('gobernarg.lite.progress.v1', '{"reelectionsWon":2}');
    const before = new Map(data);
    expect(parseSavedGame('{"v":2,"edition":"Full"}')).toBeNull();
    expect(data).toEqual(before);
    data.set(SAVE_KEY, '{roto');
    expect(loadGame()).toBeNull();
    expect(data.get(SAVE_KEY)).toBe('{roto');
  });

  it('conserva una partida histórica antigua en calendario16 y rechaza forzarla a12', () => {
    const historic = createNewGame({ archetype: 'politico', governorName: 'Histórica', seed: 1, scenarioId: 'corralito' });
    delete historic.causal.calendar;
    const old = parseSavedGame(JSON.stringify({ v: 1, state: historic, savedAt: '', pendingEvents: [] }));
    expect(old?.state.causal.calendar).toBe('legacy-16');
    expect(old?.state.causal.flags.default_deuda.end).toBe(8);
    const invalid = JSON.parse(encodeSavedGame(old!.state));
    invalid.state.causal.calendar = 'light-12';
    expect(parseSavedGame(JSON.stringify(invalid))).toBeNull();
  });
});
