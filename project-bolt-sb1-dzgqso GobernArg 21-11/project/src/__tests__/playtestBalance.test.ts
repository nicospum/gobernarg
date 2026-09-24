import { describe, it, expect } from 'vitest';
import {
  adaptiveBot,
  debtBot,
  negotiatorBot,
  passiveBot,
  printerBot,
  rigidOrthodoxBot,
} from '../playtest/bots';
import { playGame } from '../playtest/runner';

/**
 * Regresiones de balance (partidas completas deterministas con semillas fijas,
 * mismas funciones que la UI). El informe completo se genera con `npm run playtest`.
 */
const SEEDS = [1, 2, 3];

describe('balance: propiedades del diseño', () => {
  it('el jugador pasivo no se reelige', () => {
    for (const seed of SEEDS) {
      const o = playGame(passiveBot, seed);
      expect(o.victorious).toBe(false);
      expect(o.reelectionVotes ?? 0).toBeLessThan(45);
    }
  });

  it('abusar de la emisión termina en hiperinflación', () => {
    for (const seed of SEEDS) {
      const o = playGame(printerBot, seed);
      expect(o.defeatReason).toBe('hyperinflation');
      expect(o.turnsPlayed).toBeLessThanOrEqual(10);
    }
  });

  it('endeudarse sin límite no sostiene el gobierno', () => {
    for (const seed of SEEDS) {
      const o = playGame(debtBot, seed);
      expect(o.victorious).toBe(false);
      expect(o.finalDeuda).toBeGreaterThan(3000);
    }
  });

  it('reunirse con todos no compra estabilidad por sí solo', () => {
    for (const seed of SEEDS) {
      expect(playGame(negotiatorBot, seed).victorious).toBe(false);
    }
  });

  it('repetir la misma receta hasta el castigo se paga (sin castigo por coherencia: ver G2b en el informe)', () => {
    for (const seed of SEEDS) {
      expect(playGame(rigidOrthodoxBot, seed).victorious).toBe(false);
    }
  });

  it('una estrategia que lee el contexto puede ganar', () => {
    for (const seed of SEEDS) {
      const o = playGame(adaptiveBot, seed);
      expect(o.reelectionVotes ?? 0).toBeGreaterThanOrEqual(45);
      expect(o.victorious).toBe(true);
    }
  });

  it('las partidas son reproducibles con la misma semilla', () => {
    const a = playGame(adaptiveBot, 7);
    const b = playGame(adaptiveBot, 7);
    expect(a.finalIv).toBe(b.finalIv);
    expect(a.log.map(t => t.actions.join()).join('|')).toBe(b.log.map(t => t.actions.join()).join('|'));
  });
});
