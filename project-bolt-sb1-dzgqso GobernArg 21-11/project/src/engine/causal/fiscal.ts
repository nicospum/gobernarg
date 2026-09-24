import { PARAMS } from '../../data/causal';
import { effective } from './context';
import type { CausalState, FiscalBreakdown } from './types';

export interface ActionCashFlows {
  /** Costos de acciones del turno (valor positivo = gasto). */
  costoAcciones: number;
  /** Ingresos no financieros de acciones (retenciones, ajuste, tarifas…). */
  ingresosAcciones: number;
  /** Emisión, préstamos, privatización: financian pero no son resultado. */
  financiamiento: number;
}

/** Recaudación del turno (00B FISCAL). */
export function revenue(state: CausalState, close: number): number {
  const actv = effective(state, 'ACTV', close);
  const pres = effective(state, 'PRES', close);
  const infl = effective(state, 'INFL', close);
  return PARAMS.INGRESO_BASE
    * (0.7 + (0.3 * actv) / 50)
    * (pres / 50)
    * state.ingresoMult
    * (1 - (0.15 * Math.max(0, infl - 60)) / 40);
}

export function debtService(state: CausalState): number {
  return PARAMS.TASA_DEUDA * state.deuda;
}

/**
 * T.5 — Resultado fiscal y caja. Las acciones ya movieron la caja al ejecutarse
 * (T.2) y los efectos de caja en T.3: acá se completa con recaudación, gasto
 * corriente y servicio de deuda, y se registra el resultado para SOLV (R19).
 */
export function closeFiscal(
  state: CausalState,
  close: number,
  cajaAntes: number,
  flows: ActionCashFlows,
  cajaEffects: number,
  financingEffects: number,
): FiscalBreakdown {
  const ingresos = revenue(state, close);
  const gastoCorriente = state.gastoCorr;
  const servicioDeuda = debtService(state);
  const resultado = ingresos - gastoCorriente - servicioDeuda - flows.costoAcciones + flows.ingresosAcciones + cajaEffects;
  state.caja += ingresos - gastoCorriente - servicioDeuda;
  state.fiscalHistory.push(resultado);
  return {
    cajaAntes,
    ingresos,
    gastoCorriente,
    servicioDeuda,
    costoAcciones: flows.costoAcciones,
    ingresosAcciones: flows.ingresosAcciones,
    efectosCaja: cajaEffects,
    financiamiento: flows.financiamiento + financingEffects,
    resultado,
    cajaDespues: state.caja,
  };
}

/**
 * Estimación de la caja al cierre del turno con lo seleccionado (para avisar
 * al jugador ANTES de cerrar): costo de las políticas + recaudación − gasto
 * corriente (incluido el gasto permanente que agregan las políticas elegidas)
 * − servicio de deuda. No incluye efectos diferidos ni eventos.
 */
export interface ProjectionDeltas {
  caja: number;
  gasto: number;
  ingresoMult: number;
  pres: number;
  deuda: number;
}

export function projectCaja(state: CausalState, selections: { actionId: string }[], deltasOf: (id: string) => ProjectionDeltas): { caja: number; structural: number } {
  const close = state.turn - 1;
  const d: ProjectionDeltas = { caja: 0, gasto: 0, ingresoMult: 0, pres: 0, deuda: 0 };
  for (const s of selections) {
    const x = deltasOf(s.actionId);
    d.caja += x.caja; d.gasto += x.gasto; d.ingresoMult += x.ingresoMult; d.pres += x.pres; d.deuda += x.deuda;
  }
  const actv = effective(state, 'ACTV', close);
  const pres = Math.max(0, effective(state, 'PRES', close) + d.pres);
  const infl = effective(state, 'INFL', close);
  const ing = PARAMS.INGRESO_BASE * (0.7 + (0.3 * actv) / 50) * (pres / 50) * (state.ingresoMult + d.ingresoMult) * (1 - (0.15 * Math.max(0, infl - 60)) / 40);
  const structural = ing - (state.gastoCorr + d.gasto) - PARAMS.TASA_DEUDA * (state.deuda + d.deuda);
  return { caja: state.caja + d.caja + structural, structural };
}
