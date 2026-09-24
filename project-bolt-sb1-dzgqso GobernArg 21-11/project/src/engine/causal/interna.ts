import { PARAMS } from '../../data/causal';
import { clamp } from './context';
import type { CausalState } from './types';

/**
 * Interna del oficialismo (decisión de diseño, sep-2026; reemplaza el efecto
 * directo de transparencia de R-26).
 *
 * El partido es mezquino: si sos popular te sigue, si no, te pasa factura; y
 * cuando compartís poder con otros espacios (coalición ampliada) le queda menos
 * espacio a su gente y se enoja. La interna (0–100) sube por eso y baja con
 * popularidad. Con interna:
 * - las políticas rinden menos (eficacia),
 * - cuesta más sacarlas (costo en caja y umbral de las leyes),
 * - crecen los indicadores negativos (conflictividad, deterioro institucional)
 *   y cae la gobernabilidad.
 */
export const INTERNA = {
  /** Golpe al ampliar la coalición (acción, evento o estrategia post-legislativa). */
  SHOCK_COALICION: 25,
  /** Suba por turno por cada ampliación vigente (tope 2 ampliaciones). */
  POR_TURNO_COALICION: 1.5,
  IMPOPULAR_APRO: 30,
  POR_TURNO_IMPOPULAR: 2,
  POPULAR_APRO: 55,
  POR_TURNO_POPULAR: -3,
  /** Se apaga sola despacio si no hay motivos. */
  DECAIMIENTO: -1,
  /** Pérdida de eficacia y suba de costos con interna 100. */
  MAX_EFICACIA: 0.3,
  MAX_COSTO: 0.3,
  /** +1 punto al umbral de las leyes cada N de interna. */
  LEY_CADA: 15,
  /** −1 de gobernabilidad cada N de interna. */
  GOB_CADA: 10,
  /** Suba de conflictividad y caída institucional por turno con interna 100. */
  CONF_POR_TURNO: 1.6,
  INST_POR_TURNO: -1.2,
} as const;

/** Acciones que amplían la coalición y cuánto golpean. */
export const COALITION_ACTIONS: Record<string, number> = { ampliar_coalicion: INTERNA.SHOCK_COALICION };

export type InternaTone = 'good' | 'neutral' | 'warn' | 'bad';

export function internaLevel(value: number): { label: string; tone: InternaTone } {
  if (value < 25) return { label: 'Partido alineado', tone: 'good' };
  if (value < 50) return { label: 'Tensión interna', tone: 'neutral' };
  if (value < 75) return { label: 'Interna abierta', tone: 'warn' };
  return { label: 'Partido fracturado', tone: 'bad' };
}

export function internaEfficacy(state: CausalState): number {
  return 1 - (INTERNA.MAX_EFICACIA * state.political.interna) / 100;
}

export function internaCostMult(state: CausalState): number {
  return 1 + (INTERNA.MAX_COSTO * state.political.interna) / 100;
}

export function internaLawPlus(state: CausalState): number {
  return Math.floor(state.political.interna / INTERNA.LEY_CADA);
}

export function internaGobPenalty(state: CausalState): number {
  return state.political.interna / INTERNA.GOB_CADA;
}

/** Registra una ampliación de la coalición (suma interna y desgaste por turno). */
export function expandCoalition(state: CausalState, shock: number = INTERNA.SHOCK_COALICION): void {
  state.political.coalicion += 1;
  state.political.interna = clamp(state.political.interna + shock);
}

/**
 * T.9b — evolución de la interna en el cierre. Usa la aprobación del cierre
 * anterior (la del turno que el jugador vio). Devuelve los motivos del cambio.
 */
export function updateInterna(state: CausalState): { delta: number; reasons: string[] } {
  const p = state.political;
  const before = p.interna;
  const reasons: string[] = [];
  let d = 0;
  const vigentes = state.ruptures.includes('salida_coalicion') ? 0 : Math.min(2, p.coalicion);
  if (vigentes > 0) {
    d += INTERNA.POR_TURNO_COALICION * vigentes;
    reasons.push('compartís poder con otros espacios');
  }
  // Luna de miel: los primeros turnos del mandato el partido te da tiempo.
  const honeymoon = state.turn - state.mandateStart + 1 <= PARAMS.LUNA_MIEL;
  if (p.apro < INTERNA.IMPOPULAR_APRO && !honeymoon) {
    d += INTERNA.POR_TURNO_IMPOPULAR;
    reasons.push('la baja aprobación los envalentona');
  } else if (p.apro >= INTERNA.POPULAR_APRO) {
    d += INTERNA.POR_TURNO_POPULAR;
    reasons.push('la popularidad los ordena');
  } else if (vigentes === 0 && p.apro >= INTERNA.IMPOPULAR_APRO) {
    d += INTERNA.DECAIMIENTO;
  }
  p.interna = clamp(before + d);

  // Crecen los indicadores negativos.
  const k = p.interna / 100;
  if (k > 0) {
    state.base.CONF = clamp(state.base.CONF + INTERNA.CONF_POR_TURNO * k);
    state.base.INST = clamp(state.base.INST + INTERNA.INST_POR_TURNO * k);
  }
  return { delta: p.interna - before, reasons };
}
