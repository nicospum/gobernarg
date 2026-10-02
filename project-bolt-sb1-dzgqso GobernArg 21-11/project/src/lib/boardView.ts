/**
 * Datos derivados para el tablero "sala de situación". Todo sale del estado
 * real de la partida: no hay números de ejemplo.
 */
import type { GameState } from '../types/game';
import { INDICATOR_IDS, PARAMS } from '@/data/causal';
import { effective, viewRef } from '@/engine/causal';
import { indicatorBand } from './causalText';
import type { Risk } from './risk';

export const MANDATE_TURNS = 16;

/** Turno dentro del mandato (1-16). */
export function turnInMandate(state: GameState): number {
  return ((state.year - 1) * 4 + state.turn - 1) % MANDATE_TURNS + 1;
}

/** Próxima elección del mandato y cuántos cierres faltan. */
export function nextElection(state: GameState): { label: string; turns: number } {
  const inMandate = turnInMandate(state);
  if (inMandate <= 8) return { label: 'Legislativas', turns: 8 - inMandate };
  return { label: state.term >= 2 ? 'Sucesión presidencial' : 'Presidenciales', turns: 16 - inMandate };
}

/** Riesgo de derrota según la distancia al umbral de victoria (45%). */
export function defeatRisk(voteIntent: number): Risk {
  const t = PARAMS.VOTOS_PARA_GANAR;
  if (voteIntent >= t + 3) return 'bajo';
  if (voteIntent >= t) return 'medio';
  if (voteIntent >= t - 5) return 'alto';
  return 'critico';
}

export type SeriesKey = 'apro' | 'gob' | 'iv' | 'conf' | 'caja';

/**
 * Historia real de una métrica: el valor al empezar la partida, el de cada
 * cierre y el actual. Con menos de dos turnos jugados no hay curva.
 */
export function history(state: GameState, key: SeriesKey, max = 8): number[] {
  const c = state.causal;
  const current =
    key === 'conf' ? effective(c, 'CONF', viewRef(c)) : key === 'caja' ? c.caja : c.political[key];
  if (c.records.length === 0) return [current];
  const first = c.records[0];
  const start =
    key === 'conf' ? first.indicatorsBefore.CONF : key === 'caja' ? first.fiscal.cajaAntes : first.politicalBefore[key];
  const closes = c.records.map(r =>
    key === 'conf' ? r.indicatorsAfter.CONF : key === 'caja' ? r.fiscal.cajaDespues : r.politicalAfter[key],
  );
  const pts = [start, ...closes];
  if (Math.abs(pts[pts.length - 1] - current) > 0.05) pts.push(current);
  return pts.slice(-max);
}

/** Cuántos de los 15 indicadores del país están en zona de alerta. */
export function countryAlerts(state: GameState): { alerts: number; total: number } {
  const c = state.causal;
  const ref = viewRef(c);
  const alerts = INDICATOR_IDS.filter(id => indicatorBand(id, effective(c, id, ref)).tone === 'bad').length;
  return { alerts, total: INDICATOR_IDS.length };
}

/** Lleva a un panel del tablero (accesos de la barra de comando). */
export function scrollToPanel(id: string): void {
  const el = typeof document !== 'undefined' ? document.getElementById(id) : null;
  el?.scrollIntoView?.({ behavior: 'smooth', block: 'start' });
}
