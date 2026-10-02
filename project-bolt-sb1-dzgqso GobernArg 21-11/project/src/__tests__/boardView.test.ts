import { describe, expect, it } from 'vitest';
import { createNewGame, processEndTurn } from '../engine/gameEngine';
import { countryAlerts, defeatRisk, history, nextElection, turnInMandate } from '../lib/boardView';

const game = () => createNewGame({ archetype: 'politico', governorName: 'Ana', seed: 3, scenarioId: 'pais_en_calma' });

describe('datos del tablero (sala de situación)', () => {
  it('sin turnos jugados no hay curva: un solo punto, el valor actual', () => {
    const s = game();
    expect(history(s, 'apro')).toEqual([s.causal.political.apro]);
  });

  it('la curva sale de los cierres reales y termina en el valor actual', () => {
    let s = game();
    const start = s.causal.political.iv;
    s = processEndTurn(s).state;
    s = processEndTurn(s).state;
    const iv = history(s, 'iv');
    expect(iv[0]).toBeCloseTo(start, 5);
    expect(iv[iv.length - 1]).toBeCloseTo(s.causal.political.iv, 5);
    const caja = history(s, 'caja');
    expect(caja[caja.length - 1]).toBeCloseTo(s.causal.caja, 5);
  });

  it('próxima elección, turno del mandato, riesgo y alertas', () => {
    const s = game();
    expect(turnInMandate(s)).toBe(1);
    expect(nextElection(s)).toEqual({ label: 'Legislativas', turns: 7 });
    expect(nextElection({ ...s, year: 3, turn: 1 })).toEqual({ label: 'Presidenciales', turns: 7 });
    expect(defeatRisk(50)).toBe('bajo');
    expect(defeatRisk(30)).toBe('critico');
    const { alerts, total } = countryAlerts(s);
    expect(total).toBe(15);
    expect(alerts).toBeGreaterThanOrEqual(0);
  });
});
