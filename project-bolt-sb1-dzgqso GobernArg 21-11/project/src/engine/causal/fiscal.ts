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
