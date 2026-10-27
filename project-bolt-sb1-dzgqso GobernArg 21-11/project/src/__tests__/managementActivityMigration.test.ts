import { describe, expect, it } from 'vitest';
import { closeTurn, createCausalState, recomputePolitical } from '../engine/causal';
import { managementGovernabilityPenalty, migrateManagementActivity } from '../engine/causal/managementActivity';
import { createNewGame, processEndTurn } from '../engine/gameEngine';
import { encodeSavedGame, parseSavedGame, rehydrate } from '../lib/savegame';

const fresh = () => createCausalState({ scenarioId: 'viento_de_cola', calendar: 'light-12', seed: 1 });
const round = (n: number) => Math.round(n * 1e9) / 1e9;
function legacyHistory(remaining: number[], prefix = 0) {
  const s = fresh();
  const template = closeTurn(s, []).record;
  let pressure = prefix;
  s.records = remaining.map((unused, i) => {
    const before = pressure;
    const weight = unused === 4 ? 1 : unused === 3 ? 0.25 : unused === 2 ? 0.1 : 0;
    pressure = round(Math.max(0, weight ? pressure + weight : pressure - 1));
    return { ...structuredClone(template), turn: i + 1, managementActivity: {
      available: 4, used: 4 - unused, unused, pressureBefore: before, pressureAfter: pressure,
      governabilityPenalty: managementGovernabilityPenalty(pressure), imagenDelta: -0.5 * weight, bonusAwarded: false,
    } };
  });
  s.turn = remaining.length + 1;
  s.managementActivity = { pressure, mandateStart: 1, observedTurns: Math.min(12,remaining.length), perfectUse: false, bonusGranted: false };
  return s;
}

describe('Migración del desgaste parcial guardado', () => {
  it.each([[3,0.6],[2,0.3]])('recalcula doce cierres antiguos con %i PA libres sin tocar su historia', (unused, expected) => {
    const s = legacyHistory(Array(12).fill(unused)); const before = structuredClone(s);
    const migrated = migrateManagementActivity(s);
    expect(migrated.managementActivity).toEqual({ ...s.managementActivity, version: 2, pressure: expected });
    expect(migrated.records).toEqual(before.records);
    expect(migrated.political).toEqual(before.political);
    expect(s).toEqual(before);
    expect(migrateManagementActivity(migrated)).toBe(migrated);
  });

  it('alivia presión de uso parcial acumulada entre mandatos sin reiniciar sus metadatos', () => {
    const s = legacyHistory(Array(24).fill(3));
    s.mandateStart = 13;
    s.managementActivity = { ...s.managementActivity!, mandateStart: 13, observedTurns: 12, bonusGranted: true };
    expect(migrateManagementActivity(s).managementActivity).toEqual({ ...s.managementActivity, version: 2, pressure: 1.2 });
  });

  it('no perdona cierres sin usar PA y conserva recuperación real en una secuencia mixta', () => {
    const idle = legacyHistory(Array(5).fill(4));
    expect(migrateManagementActivity(idle).managementActivity?.pressure).toBe(5);
    const mixed = legacyHistory([4,4,3,2,1,3]);
    expect(migrateManagementActivity(mixed).managementActivity?.pressure).toBe(1.125);
  });

  it('con un hueco sólo reevalúa el sufijo demostrado y preserva el prefijo desconocido', () => {
    const s = legacyHistory(Array(6).fill(3));
    s.records.splice(2,1);
    expect(migrateManagementActivity(s).managementActivity?.pressure).toBe(0.9);
    const noSuffix = legacyHistory(Array(6).fill(3)); noSuffix.records.pop();
    expect(migrateManagementActivity(noSuffix).managementActivity?.pressure).toBe(1.5);
    noSuffix.records = [];
    expect(migrateManagementActivity(noSuffix).managementActivity?.pressure).toBe(1.5);
  });

  it('no interpreta presupuestos ausentes ni vuelve a migrar la versión suave', () => {
    const s = legacyHistory([3,3]); delete s.managementActivity;
    expect(migrateManagementActivity(s)).toBe(s);
    const modern = legacyHistory([3,3]); modern.managementActivity!.version = 2;
    expect(migrateManagementActivity(modern)).toBe(modern);
    const badTransition = legacyHistory([3,3]); badTransition.records[1].managementActivity!.pressureBefore = 4;
    expect(migrateManagementActivity(badTransition).managementActivity?.pressure).toBe(0.5);
  });

  it('rehidratar un respaldo antiguo corrige sólo gobernabilidad y la racha de crisis en curso', () => {
    const s = processEndTurn(createNewGame({ archetype: 'politico', governorName: 'Ana', scenarioId: 'viento_de_cola', seed: 1 })).state;
    s.causal.managementActivity = { pressure: 0.25, mandateStart: 1, observedTurns: 1, perfectUse: false, bonusGranted: false };
    s.causal.records[0].managementActivity = { available: 4, used: 1, unused: 3, pressureBefore: 0, pressureAfter: 0.25, governabilityPenalty: 0.0625, imagenDelta: -0.125, bonusAwarded: false };
    recomputePolitical(s.causal, 1); s.stability = Math.round(s.causal.political.gob * 10) / 10; s.causal.govCrisisStreak = 1;
    const before = structuredClone(s);
    const parsed = parseSavedGame(encodeSavedGame(s)); expect(parsed).not.toBeNull();
    expect(parsed!.state.causal.managementActivity?.version).toBeUndefined();
    const migrated = rehydrate(parsed!.state);
    expect(migrated.causal.managementActivity).toMatchObject({ version: 2, pressure: 0.05 });
    expect(migrated.causal.political.gob - s.causal.political.gob).toBeCloseTo(0.05, 8);
    expect(migrated.causal.political).toEqual({ ...s.causal.political, gob: migrated.causal.political.gob });
    expect(migrated.stability).toBe(Math.round(migrated.causal.political.gob * 10) / 10);
    expect(migrated.causal.govCrisisStreak).toBe(0);
    expect(migrated.causal.records).toEqual(s.causal.records);
    expect(s).toEqual(before);
    expect(rehydrate(parseSavedGame(encodeSavedGame(migrated))!.state)).toEqual(migrated);
    const terminal = rehydrate({ ...s, gameOver: true, victorious: false, defeatReason: 'impeachment' });
    expect(terminal).toMatchObject({ gameOver: true, victorious: false, defeatReason: 'impeachment' });
    expect(terminal.causal.govCrisisStreak).toBe(1);
  });

  it('valida el marcador opcional y rechaza versiones desconocidas o malformadas', () => {
    const state = processEndTurn(createNewGame({ archetype: 'politico', governorName: 'Ana', scenarioId: 'viento_de_cola', seed: 1 })).state;
    const saved = JSON.parse(encodeSavedGame(state));
    for (const version of [1,3,'2',null,{ broken: true }]) {
      const bad = structuredClone(saved); bad.state.causal.managementActivity.version = version;
      expect(parseSavedGame(JSON.stringify(bad))).toBeNull();
    }
    delete saved.state.causal.managementActivity.version;
    expect(parseSavedGame(JSON.stringify(saved))).not.toBeNull();
  });
});
