import { describe, expect, it } from 'vitest';
import { PARAMS } from '../data/causal';
import { closeTurn, createCausalState, projectedCloseCaja } from '../engine/causal';
import { createNewGame } from '../engine/gameEngine';
import { actionFiscalCommitments } from '../lib/actionCommitments';
import { upcomingEffects } from '../lib/agendaView';
import { fmtBudgetDelta } from '../lib/format';

describe('Compromisos fiscales conocidos', () => {
  it('conserva gasto fijo permanente aunque la fila se aplique una sola vez', () => {
    const [salary] = actionFiscalCommitments('aumento_salarial');
    expect(salary.text).toContain(`${fmtBudgetDelta(150)}/turno`);
    expect(salary.text).toContain('permanente');
    expect(salary.conditional).toBe(false);
    const maintenance = actionFiscalCommitments('infraestructura_vial');
    expect(maintenance.some(item => item.text.includes(`${fmtBudgetDelta(30)}/turno`) && item.text.includes('3 trimestres'))).toBe(true);
  });

  it('muestra subsidios recurrentes con duración y comienzo, sin sumarlos al costo inicial', () => {
    const [subsidy] = actionFiscalCommitments('congelar_tarifas');
    expect(subsidy.text).toContain(`${fmtBudgetDelta(-80)}/turno`);
    expect(subsidy.text).toContain('durante 4 trimestres');
    expect(subsidy.text).toContain('próximo trimestre');
    expect(subsidy.conditional).toBe(false);
  });

  it('distingue costos condicionales, repetición y pérdida permanente de ingreso', () => {
    const review = actionFiscalCommitments('prestamo_internacional').find(item => item.key.endsWith('.08'));
    expect(review?.text).toContain(fmtBudgetDelta(-200));
    expect(review?.text).toContain('4 trimestres');
    expect(review?.conditional).toBe(true);
    expect(actionFiscalCommitments('emitir_dinero')[0].text).toContain('si se reitera');
    const revenue = actionFiscalCommitments('bajar_retenciones')[0];
    expect(revenue.text).toContain('3% de la base');
    expect(revenue.text).toContain('permanente');
  });

  it('ajusta sólo el principal inmediato por descuento y no lo presenta como deuda neta garantizada', () => {
    const loan = actionFiscalCommitments('prestamo_internacional', { loanDiscount: 0.1 });
    expect(loan.find(item => item.key.endsWith('.01'))?.text).toContain(`Deuda base: ${fmtBudgetDelta(720)}`);
    expect(loan.find(item => item.key.endsWith('.09'))?.text).toContain(`Deuda adicional: ${fmtBudgetDelta(100)}`);
    expect(loan.find(item => item.key.endsWith('.09'))?.conditional).toBe(true);
  });
});

describe('Horizonte y condiciones de lo pendiente', () => {
  it('señala la revisión del préstamo condicionada al resultado fiscal', () => {
    const after = closeTurn(createCausalState(), [{ actionId: 'prestamo_internacional' }]).state;
    const review = upcomingEffects(after).find(item => item.key.startsWith('prestamo_internacional.') && item.inTurns === 4);
    expect(review?.conditional).toBe(true);
    const education = closeTurn(createCausalState(), [{ actionId: 'inversion_educativa' }]).state;
    expect(upcomingEffects(education).every(item => !item.conditional)).toBe(true);
  });
});

describe('Estimación fiel al cierre actual', () => {
  it('usa el principal realmente asumido por el perfil Empresario para estimar intereses', () => {
    const state = createNewGame('presidente', 'empresario', 'Prueba', false, '').causal;
    state.base.SOLV = 60; // Evita el recargo condicional del préstamo local.
    expect(state.perks.loanDiscount).toBeGreaterThan(0);
    const before = structuredClone(state);
    const baseline = projectedCloseCaja(state, []);
    const forecast = projectedCloseCaja(state, [{ actionId: 'prestamo_local' }]);
    const after = closeTurn(state, [{ actionId: 'prestamo_local' }]).state;
    expect(forecast.structural - baseline.structural).toBeCloseTo(-PARAMS.TASA_DEUDA * (after.deuda - state.deuda));
    expect(state).toEqual(before);
  });

  it('no adelanta recaudación que comienza dos trimestres después', () => {
    const state = createCausalState();
    expect(projectedCloseCaja(state, [{ actionId: 'mejorar_recaudacion' }]).structural).toBeCloseTo(projectedCloseCaja(state, []).structural);
    const first = closeTurn(state, [{ actionId: 'mejorar_recaudacion' }]).state;
    const second = closeTurn(first, []).state;
    const third = closeTurn(second, []).state;
    expect(first.ingresoMult).toBe(state.ingresoMult);
    expect(second.ingresoMult).toBe(state.ingresoMult);
    expect(third.ingresoMult).toBeGreaterThan(state.ingresoMult);
  });

  it('no adelanta una rebaja tributaria que comienza el trimestre siguiente', () => {
    const state = createCausalState();
    expect(projectedCloseCaja(state, [{ actionId: 'reduccion_impuestos' }]).structural).toBeCloseTo(projectedCloseCaja(state, []).structural);
    const first = closeTurn(state, [{ actionId: 'reduccion_impuestos' }]).state;
    expect(first.base.PRES).toBe(state.base.PRES);
    expect(closeTurn(first, []).state.base.PRES).toBeLessThan(first.base.PRES);
  });
});
