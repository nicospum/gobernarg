import { afterEach, describe, expect, it, vi } from 'vitest';
import { createNewGame, processEndTurn, resolvePendingElection, triggerMidtermStrategy } from '../engine/gameEngine';
import { BACKUP_KEY, SAVE_KEY, encodeSavedGame, parseSavedGame, saveGame, loadGame, clearSavedGame } from '../lib/savegame';

import { getAllEvents } from '../data/events';

const state = () => createNewGame('presidente', 'politico', 'Respaldo', false, '', 'normal', undefined, 7, 'pais_en_calma');
function storage() {
  const data = new Map<string, string>();
  return { getItem: (key: string) => data.get(key) ?? null, setItem: (key: string, value: string) => { data.set(key, value); }, removeItem: (key: string) => { data.delete(key); } };
}
afterEach(() => vi.unstubAllGlobals());
describe('Guardado y respaldo propios de Full', () => {
  it('identifica Full, rechaza Light y valida estado antes de cargar', () => {
    const encoded = encodeSavedGame(state());
    expect(parseSavedGame(encoded)?.state.governorName).toBe('Respaldo');
    expect(parseSavedGame(encoded.replace('"edition":"Full"', '"edition":"Light"'))).toBeNull();
    const broken = JSON.parse(encoded); broken.state.causal.base.INFL = 'roto';
    expect(parseSavedGame(JSON.stringify(broken))).toBeNull();
  });
  it('acepta v1 de Full y mantiene escenarios históricos ya guardados', () => {
    const historical = createNewGame('presidente', 'politico', 'Anterior', false, '', 'normal', undefined, 2, 'corralito');
    expect(parseSavedGame(JSON.stringify({ v: 1, state: historical, pendingEvents: [] }))?.state.causal.scenarioId).toBe('corralito');
  });
  it('conserva el principal anterior si falla el guardado y permite reintentar', () => {
    const target = storage(); vi.stubGlobal('window', { localStorage: target });
    expect(saveGame(state())).toBe(true);
    const original = target.getItem(SAVE_KEY);
    const normalSet = target.setItem;
    target.setItem = () => { throw new Error('quota'); };
    expect(saveGame({ ...state(), governorName: 'Nuevo' })).toBe(false);
    expect(target.getItem(SAVE_KEY)).toBe(original);
    target.setItem = normalSet;
    expect(saveGame({ ...state(), governorName: 'Nuevo' })).toBe(true);
    expect(loadGame()?.state.governorName).toBe('Nuevo');
  });
  it('recupera copia anterior si se rompe el principal y no borra progreso ni Light', () => {
    const target = storage(); vi.stubGlobal('window', { localStorage: target });
    target.setItem('gobernarg.progress.v1', 'progreso'); target.setItem('gobernarg.lite.partida', 'Light');
    saveGame(state()); saveGame({ ...state(), governorName: 'Después' });
    expect(target.getItem(BACKUP_KEY)).toBeTruthy();
    target.setItem(SAVE_KEY, '{roto');
    expect(loadGame()?.recoveredFromBackup).toBe(true);
    expect(loadGame()?.state.governorName).toBe('Respaldo');
    clearSavedGame(); expect(loadGame()).toBeNull();
    expect(target.getItem('gobernarg.progress.v1')).toBe('progreso');
    expect(target.getItem('gobernarg.lite.partida')).toBe('Light');
  });
});

describe('Validación anidada antes de confirmar respaldo', () => {
  it('no migra ni toca el objeto al validar', () => {
    const legacy = state(); delete legacy.advisorSalaryVersion;
    const parsed = parseSavedGame(JSON.stringify({ v: 1, state: legacy, pendingEvents: [] }));
    expect(parsed?.state.advisorSalaryVersion).toBeUndefined();
  });
  it.each(['political','perks','actor','agenda','records','eventChoice'])('rechaza corrupción anidada %s', field => {
    const saved = JSON.parse(encodeSavedGame(processEndTurn(state()).state));
    if (field === 'political') saved.state.causal.political = null;
    if (field === 'perks') saved.state.causal.perks.categoryEfficacy = null;
    if (field === 'actor') saved.state.causal.actors.industria.rel = {};
    if (field === 'agenda') saved.state.causal.agenda = [{ start: 1 }];
    if (field === 'records') saved.state.causal.records[0].actorsBefore = null;
    if (field === 'eventChoice') saved.pendingEvents = [{ id: 'x', title: 'Evento', description: 'Prueba', type: 'random', category: 'social', severity: 'low', probability: 1, conditions: {}, effects: { immediate: [] }, choices: [{ id: 'x', text: 'Responder', effects: { immediate: [{ type: 'immediate', value: 'roto' }] } }] }];
    expect(parseSavedGame(JSON.stringify(saved))).toBeNull();
  });
  it('admite un turno completo válido con registro causal', () => {
    expect(parseSavedGame(encodeSavedGame(processEndTurn(state()).state))).not.toBeNull();
  });
});

describe('Compatibilidad de estados y eventos reales', () => {
  it('acepta todo el registro actual de eventos sin rehidratarlos', () => {
    for (const event of getAllEvents()) expect(parseSavedGame(encodeSavedGame(state(), [event])), event.id).not.toBeNull();
  });
  it('acepta cada cierre real, legislativas y final de partida con 16 trimestres por mandato', () => {
    let game = state();
    for (let index = 0; index < 40; index++) {
      expect(parseSavedGame(encodeSavedGame(game)), `turno ${game.causal.turn}`).not.toBeNull();
      if (game.gameOver) break;
      if (game.pendingMidtermStrategy) game = triggerMidtermStrategy(game, game.availableMidtermStrategies[0]);
      if (game.pendingElection) game = { ...resolvePendingElection(game, 'reelection'), electionResults: null };
      if (!game.gameOver) game = processEndTurn(game).state;
    }
  });
});

describe('Campos opcionales que se imprimen en la interfaz', () => {
  it.each(['lastInteractionMessage','notificationYear','notificationTurn','notificationRead','notificationTimestamp'])('rechaza %s incompatible antes de continuar', field => {
    const saved = JSON.parse(encodeSavedGame(state()));
    saved.state.notifications = [{ id: '1_1_1', type: 'info', title: 'Aviso', message: 'Prueba', importance: 'low' }];
    if (field === 'lastInteractionMessage') saved.state.lastInteractionMessage = { broken: true };
    if (field === 'notificationYear') saved.state.notifications[0].year = { broken: true };
    if (field === 'notificationTurn') saved.state.notifications[0].turn = { broken: true };
    if (field === 'notificationRead') saved.state.notifications[0].read = 'sí';
    if (field === 'notificationTimestamp') saved.state.notifications[0].timestamp = { broken: true };
    expect(parseSavedGame(JSON.stringify(saved))).toBeNull();
  });
});