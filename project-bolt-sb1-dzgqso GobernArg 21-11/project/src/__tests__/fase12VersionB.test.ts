import { describe, expect, it } from 'vitest';
import { POLICIES } from '../causal/catalog';
import { CAMPAIGN_EVENTS } from '../causal/campaignCatalog';
import { fmtMoney, fmtMoneyDelta, fmtNum, fmtPct, fmtScore, fmtSigned } from '../causal/format';

describe('Formato argentino (glosario de la versión A)', () => {
  it('punto de miles, coma decimal y signo menos', () => {
    // La caja se muestra como en la A Lite: millones de pesos, sin decimales.
    expect(fmtMoney(1300)).toBe('$1.300 M');
    expect(fmtMoney(872.6)).toBe('$873 M');
    expect(fmtMoney(-27.4)).toBe('−$27 M');
    expect(fmtMoneyDelta(250)).toBe('+$250 M');
    expect(fmtMoneyDelta(0)).toBe('$0 M');
    expect(fmtPct(38.12)).toBe('38,1 %');
    expect(fmtScore(46)).toBe('46,0');
    expect(fmtSigned(2.54)).toBe('+2,5');
    expect(fmtSigned(-0.04)).toBe('0');
    expect(fmtNum(1234567, 0)).toBe('1.234.567');
  });
});

describe('Textos para el jugador', () => {
  const DESIGN = /MVP|playtest|redundan|Fusión|Excel|\bmotor\b/i;
  const TUTEO = /\b(Elige|Selecciona|Debes|Mantén|deberás|Has sido)\b/;

  it('las políticas no muestran notas de diseño ni tuteo', () => {
    const bad = POLICIES.filter(p => DESIGN.test(`${p.description} ${p.strategy}`) || TUTEO.test(`${p.description} ${p.strategy}`)).map(p => p.id);
    expect(bad).toEqual([]);
  });

  it('todo evento tiene al menos dos respuestas', () => {
    expect(CAMPAIGN_EVENTS.filter(e => e.choices.length < 2).map(e => e.id)).toEqual([]);
  });
});
