import { describe, it, expect } from 'vitest';
import { closeTurn, createCausalState, effective, type CausalState } from '../engine/causal';

/**
 * Reproduce las corridas de la pestaña 11_SIMULACIONES del Excel (prototipo del
 * motor). Los valores del prototipo son una "versión simplificada del motor"
 * (R-19), así que se verifican tendencias y órdenes de magnitud, no decimales.
 */

function run(state: CausalState, plan: (string[] | null)[]): CausalState[] {
  const out: CausalState[] = [];
  let s = state;
  for (const acts of plan) {
    s = closeTurn(s, (acts ?? []).map(actionId => ({ actionId }))).state;
    out.push(s);
  }
  return out;
}

const eff = (s: CausalState, id: Parameters<typeof effective>[1]) => effective(s, id, s.turn - 1);

describe('Estado inicial (01/02 del Excel)', () => {
  it('reproduce la satisfacción inicial calculada del Excel', () => {
    const s = createCausalState();
    expect(s.actors.industria.sat).toBeCloseTo(42.2, 0);
    expect(s.actors.agro.sat).toBeCloseTo(40.1, 0);
    expect(s.actors.clase_media.sat).toBeCloseTo(43.8, 0);
    expect(s.actors.sindicatos.sat).toBeCloseTo(41.8, 0);
  });

  it('APRO inicial ≈ 35 (Excel 34.9) y caja 1500', () => {
    const s = createCausalState();
    expect(s.political.apro).toBeGreaterThan(33);
    expect(s.political.apro).toBeLessThan(37);
    expect(s.caja).toBe(1500);
  });
});

describe('S1 · Emisión repetida', () => {
  it('los primeros usos son casi gratis y la repetición dispara inflación', () => {
    const base = run(createCausalState(), [null, null, null, null, null, null]);
    const emit = run(createCausalState(), [['emitir_dinero'], ['emitir_dinero'], ['emitir_dinero'], ['emitir_dinero'], ['emitir_dinero'], null]);
    // T1: INFL apenas sube, ACTV sube por el impulso de liquidez.
    expect(eff(emit[0], 'INFL') - eff(base[0], 'INFL')).toBeLessThan(4);
    expect(eff(emit[0], 'ACTV') - eff(base[0], 'ACTV')).toBeGreaterThan(1.5);
    // T5: la inflación ya está muy por encima (Excel: +32 vs base).
    expect(eff(emit[4], 'INFL') - eff(base[4], 'INFL')).toBeGreaterThan(15);
    // El daño viaja por indicadores: la clase media cae mucho más que al principio.
    const dCm1 = emit[0].actors.clase_media.sat - base[0].actors.clase_media.sat;
    const dCm5 = emit[4].actors.clase_media.sat - base[4].actors.clase_media.sat;
    expect(dCm5).toBeLessThan(dCm1 - 4);
    // La caja crece con cada emisión.
    expect(emit[4].caja).toBeGreaterThan(base[4].caja + 800);
  });

  it('emitir "día por medio" no esquiva la ventana de 6 turnos', () => {
    const dosif = run(createCausalState(), [['emitir_dinero'], null, ['emitir_dinero'], null, ['emitir_dinero'], null, ['emitir_dinero'], null]);
    const base = run(createCausalState(), [null, null, null, null, null, null, null, null]);
    expect(eff(dosif[7], 'INFL') - eff(base[7], 'INFL')).toBeGreaterThan(10);
  });
});

describe('S2 · Infraestructura vial', () => {
  it('una obra del turno 2 se cobra en el turno 6 y deja mantenimiento permanente', () => {
    const base = run(createCausalState(), [null, null, null, null, null, null]);
    const obra = run(createCausalState(), [['estudio_factibilidad'], ['infraestructura_vial'], null, null, null, null]);
    // Costo con descuento del estudio (500 × 0.8 = 400).
    expect(obra[1].records[obra[1].records.length - 1].fiscal.costoAcciones).toBe(400);
    // INFR +6 a partir de t+3 y gasto corriente +30 permanente.
    expect(eff(obra[4], 'INFR') - eff(base[4], 'INFR')).toBeGreaterThan(5);
    expect(obra[5].gastoCorr - base[5].gastoCorr).toBe(30);
    // El agro reacciona sin que la acción diga "+X al agro".
    expect(obra[5].actors.agro.sat).toBeGreaterThan(base[5].actors.agro.sat + 1.5);
  });
});

describe('S3 · Aumento salarial repetido', () => {
  it('mejora a sindicatos y docentes y empeora al financiero vía solvencia (sin antagonismo)', () => {
    const base = run(createCausalState(), [null, null, null]);
    const sal = run(createCausalState(), [['aumento_salarial'], ['aumento_salarial'], null]);
    expect(sal[2].actors.sindicatos.sat).toBeGreaterThan(base[2].actors.sindicatos.sat + 3);
    expect(sal[2].actors.docentes.sat).toBeGreaterThan(base[2].actors.docentes.sat + 3);
    expect(sal[2].actors.financiero.sat).toBeLessThan(base[2].actors.financiero.sat - 3);
    expect(eff(sal[2], 'SOLV')).toBeLessThan(eff(base[2], 'SOLV') - 5);
    expect(sal[2].gastoCorr - base[2].gastoCorr).toBe(300);
  });
});
