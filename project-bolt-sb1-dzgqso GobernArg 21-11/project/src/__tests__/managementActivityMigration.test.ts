import { describe, expect, it } from 'vitest';
import { closeTurn, createCausalState, managementGovernabilityPenalty, migrateManagementActivity, previewManagementActivity, recomputePolitical } from '../engine/causal';
import type { CausalState } from '../engine/causal/types';
import { createNewGame } from '../engine/gameEngine';
import { encodeSavedGame, parseSavedGame, rehydrate } from '../lib/savegame';

function legacyHistory(uses: number[]): CausalState {
  let state = createCausalState({ scenarioId: 'viento_de_cola' });
  let pressure = 0;
  for (let i = 0; i < uses.length; i++) {
    if (i === 16) state.mandateStart = 17;
    state = closeTurn(state, [], { activityBudget: { available: 4, remaining: 4 - uses[i] } }).state;
    const oldWeight = uses[i] === 0 ? 1 : uses[i] === 1 ? 0.25 : uses[i] === 2 ? 0.1 : 0;
    const before = pressure;
    pressure = Math.round(Math.max(0, oldWeight ? pressure + oldWeight : pressure - 1) * 1e9) / 1e9;
    state.managementActivity = { ...state.managementActivity!, pressure };
    delete state.managementActivity.version;
    const record = state.records[state.records.length - 1].managementActivity!;
    Object.assign(record, { pressureBefore: before, pressureAfter: pressure, governabilityPenalty: managementGovernabilityPenalty(pressure), imagenDelta: -0.5 * oldWeight + (record.bonusAwarded ? 2 : 0) });
    recomputePolitical(state, state.turn - 1);
  }
  return state;
}

describe('Desgaste suave durante dos mandatos', () => {
  it.each([[1, 1.6, 0.4], [2, 0.8, 0.2], [3, 0, 0], [4, 0, 0]])('%i PA por cierre mantiene presión %f y descuento GOB %f a los32 cierres', (used, pressure, penalty) => {
    const state = createCausalState();
    for (let turn = 1; turn <= 32; turn++) {
      state.turn = turn;
      if (turn === 17) state.mandateStart = 17;
      const preview = previewManagementActivity(state, { available: 4, remaining: 4 - used });
      state.managementActivity = preview.activity;
      if (used < 4) expect(preview.record.bonusAwarded).toBe(false);
    }
    expect(state.managementActivity!.pressure).toBe(pressure);
    expect(managementGovernabilityPenalty(pressure)).toBeCloseTo(penalty);
  });
});

describe('Migración conservadora del desgaste observado anterior', () => {
  it('reproduce ambos mandatos con pesos suaves sin mutar registros ni elegibilidad', () => {
    const original = legacyHistory(Array(32).fill(1));
    const before = structuredClone(original);
    const migrated = migrateManagementActivity(original);
    expect(migrated.managementActivity).toEqual({ ...original.managementActivity, version: 2, pressure: 1.6 });
    expect(migrated.records).toBe(original.records);
    expect(migrated.political).toBe(original.political);
    expect(original).toEqual(before);
    expect(migrateManagementActivity(migrated)).toBe(migrated);
  });
  it('mantiene el desgaste fuerte de la inacción total y respeta la recuperación', () => {
    expect(migrateManagementActivity(legacyHistory([0, 0, 0, 0])).managementActivity!.pressure).toBe(4);
    expect(migrateManagementActivity(legacyHistory([0, 1, 2, 3, 0])).managementActivity!.pressure).toBe(1.075);
  });
  it('conserva presión de prefijos desconocidos y reproduce sólo el sufijo verificable', () => {
    const partial = legacyHistory(Array(8).fill(1));
    partial.records = partial.records.slice(-2);
    expect(migrateManagementActivity(partial).managementActivity!.pressure).toBe(1.6);
    const gap = legacyHistory(Array(8).fill(1));
    gap.records.splice(5, 1);
    expect(migrateManagementActivity(gap).managementActivity!.pressure).toBe(1.6);
    const inconsistent = legacyHistory([1, 1]);
    inconsistent.records[inconsistent.records.length - 1].managementActivity!.pressureBefore = 0.2;
    expect(migrateManagementActivity(inconsistent).managementActivity!.pressure).toBe(0.5);
  });
  it('no inventa historial ni cambia históricos y deja un premio ya otorgado intacto', () => {
    const old = createCausalState(); delete old.managementActivity;
    expect(migrateManagementActivity(old)).toBe(old);
    const historical = legacyHistory([1, 1]); historical.scenarioId = 'corralito';
    expect(migrateManagementActivity(historical)).toBe(historical);
    const awarded = legacyHistory([4]); awarded.managementActivity!.bonusGranted = true;
    const migrated = migrateManagementActivity(awarded);
    expect(migrated.managementActivity!.bonusGranted).toBe(true);
    expect(migrated.records[0].managementActivity!.bonusAwarded).toBe(false);
  });
  it('carga/importa de forma idempotente, actualiza sólo GOB visible y evita heredar una crisis corregida', () => {
    const game = createNewGame('presidente', 'politico', 'Migración', false, '', 'normal', undefined, 7, 'viento_de_cola');
    game.causal = legacyHistory(Array(16).fill(1));
    game.year = 4; game.turn = 4; game.pendingElection = true;
    game.causal.govCrisisStreak = 1;
    game.causal.political.gob = 2;
    game.stability = 2;
    const political = { ...game.causal.political };
    const migrated = rehydrate(game);
    expect(migrated.causal.managementActivity).toMatchObject({ version: 2, pressure: 0.8 });
    expect(migrated.causal.political.gob).toBeGreaterThanOrEqual(15);
    expect(migrated.stability).toBe(Math.round(migrated.causal.political.gob * 10) / 10);
    expect(migrated.causal.govCrisisStreak).toBe(0);
    expect(migrated.causal.political).toEqual({ ...political, gob: migrated.causal.political.gob });
    expect(migrated.gameOver).toBe(false);
    expect(parseSavedGame(encodeSavedGame(migrated))).not.toBeNull();
    expect(rehydrate(migrated)).toEqual(migrated);
    const terminal = rehydrate({ ...game, gameOver: true, defeatReason: 'impeachment' });
    expect(terminal.gameOver).toBe(true);
    expect(terminal.defeatReason).toBe('impeachment');
    expect(terminal.causal.govCrisisStreak).toBe(1);
  });
  it('rechaza versiones de actividad desconocidas antes de importar', () => {
    const game = createNewGame('presidente', 'politico', 'Versión', false, '', 'normal', undefined, 7, 'viento_de_cola');
    const saved = JSON.parse(encodeSavedGame(game));
    saved.state.causal.managementActivity.version = 99;
    expect(parseSavedGame(JSON.stringify(saved))).toBeNull();
  });
});
