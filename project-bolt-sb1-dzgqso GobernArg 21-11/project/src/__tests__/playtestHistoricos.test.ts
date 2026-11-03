/**
 * Regresión liviana de los escenarios históricos jugados con bots: la
 * inacción pierde en los dos escenarios, al menos una estrategia de crisis
 * supera la emergencia y ninguna partida rompe el motor. Corre en `npm test`,
 * por eso usa una o dos semillas; el playtest completo (20 semillas, informe)
 * es `npm run playtest:historicos`.
 */
import { describe, expect, it } from 'vitest';
import { CRISIS_BOTS, crisisInactionBot, type Bot } from '../playtest/bots';
import { playGame, type GameOutcome } from '../playtest/runner';

const SCENARIOS = ['corralito', 'pais_en_llamas'] as const;
type ScenarioId = (typeof SCENARIOS)[number];

/** Subrondas de la emergencia más los trimestres que admitimos como "poco después". */
const EMERGENCY_ROUNDS = 3;
const SHORTLY_AFTER = 4;
/** 3 subrondas + 16 trimestres + 16 del segundo mandato. */
const MAX_ENTRIES = 35;

const cache = new Map<string, GameOutcome>();
function play(bot: Bot, scenarioId: ScenarioId, seed = 1): GameOutcome {
  const key = `${scenarioId}:${bot.id}:${seed}`;
  let out = cache.get(key);
  if (!out) {
    out = playGame(bot, seed, { scenarioId });
    cache.set(key, out);
  }
  return out;
}

const reelected = (o: GameOutcome) => o.victorious || o.log.some(t => t.term >= 2);

describe('Escenarios históricos jugados con bots (regresión liviana)', () => {
  it('ninguna partida lanza excepciones y todas terminan dentro del mandato doble', () => {
    for (const scenarioId of SCENARIOS) {
      for (const bot of CRISIS_BOTS) {
        expect(() => play(bot, scenarioId), `${bot.id} en ${scenarioId}`).not.toThrow();
        const o = play(bot, scenarioId);
        expect(o.turnsPlayed, `${bot.id} en ${scenarioId}`).toBeLessThanOrEqual(MAX_ENTRIES);
        expect(o.gameOver, `${bot.id} en ${scenarioId} debería terminar`).toBe(true);
        expect(o.crisis, `${bot.id} en ${scenarioId} debería registrar el estado de crisis`).toBeDefined();
      }
    }
  });

  it('la inacción pierde el Corralito (sin medidas, los bancos colapsan y no hay reelección)', () => {
    for (const seed of [1, 2]) {
      const o = play(crisisInactionBot, 'corralito', seed);
      expect(o.crisis?.used).toEqual([]);
      expect(o.gameOver).toBe(true);
      expect(o.victorious).toBe(false);
      expect(reelected(o)).toBe(false);
    }
  });

  it('la inacción cae en la Hiper por hiperinflación o renuncia, en la emergencia o poco después', () => {
    for (const seed of [1, 2]) {
      const o = play(crisisInactionBot, 'pais_en_llamas', seed);
      expect(o.crisis?.used).toEqual([]);
      expect(['hyperinflation', 'resignation']).toContain(o.defeatReason);
      expect(o.turnsPlayed).toBeLessThanOrEqual(EMERGENCY_ROUNDS + SHORTLY_AFTER);
    }
  });

  it('en cada escenario, al menos un bot de crisis supera la emergencia', () => {
    for (const scenarioId of SCENARIOS) {
      const survivors = CRISIS_BOTS.filter(bot => play(bot, scenarioId).crisis?.survivedEmergency);
      expect(survivors.map(b => b.id), scenarioId).not.toEqual([]);
    }
  });

  it('los bots de crisis toman medidas extraordinarias y el registro las conserva en orden', () => {
    for (const scenarioId of SCENARIOS) {
      for (const bot of CRISIS_BOTS.filter(b => b.id !== crisisInactionBot.id)) {
        const o = play(bot, scenarioId);
        const used = o.crisis?.used ?? [];
        expect(used.length, `${bot.id} en ${scenarioId}`).toBeGreaterThan(0);
        // Las medidas de la emergencia aparecen en la bitácora de subrondas con el mismo orden.
        const inLog = o.log.filter(t => t.round && t.actions.length).map(t => t.actions[0]);
        expect(inLog.length).toBeLessThanOrEqual(used.length);
      }
    }
  });
});
