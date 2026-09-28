/** Signo menos tipográfico (no el guion). */
const MINUS = "\u2212";
/** Espacio que no se corta: "$250 M" nunca queda partido en dos renglones. */
const NBSP = "\u00A0";

/** Punto de miles sobre los dígitos de un entero: "2200" → "2.200". */
function groupThousands(digits: string): string {
  return digits.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

/** Entero con punto de miles: 2200 → "2.200". */
function thousands(n: number): string {
  return groupThousands(String(Math.round(Math.abs(n))));
}

/**
 * Monto de la caja en millones, en formato argentino (glosario):
 * 2200 → "$2.200 M", 250 → "$250 M", -50 → "−$50 M".
 */
export function fmtBudget(n: number): string {
  const sign = Math.round(n) < 0 ? MINUS : "";
  return `${sign}$${thousands(n)}${NBSP}M`;
}

/** Variación de caja, siempre con signo: "+$250 M", "−$50 M", "$0 M". */
export function fmtBudgetDelta(n: number): string {
  if (Math.round(n) === 0) return `$0${NBSP}M`;
  return n > 0 ? `+${fmtBudget(n)}` : fmtBudget(n);
}

/** Número con coma decimal: 57.6 → "57,6". */
export function fmtNumber(n: number, decimals = 0): string {
  const fixed = Math.abs(n).toFixed(decimals);
  const [int, dec] = fixed.split(".");
  const body = groupThousands(int) + (dec ? `,${dec}` : "");
  return (n < 0 && Number(fixed) !== 0 ? MINUS : "") + body;
}

/** Porcentaje: 57.6 → "57,6 %" (un decimal solo donde hace falta, p. ej. elecciones). */
export function fmtPct(n: number, decimals = 0): string {
  return `${fmtNumber(n, decimals)}${NBSP}%`;
}

/** Variación con signo: +2, −3, 0 (enteros en el tablero, como pide el glosario). */
export function fmtSigned(n: number, decimals = 0): string {
  const r = Number(n.toFixed(decimals));
  if (r === 0) return fmtNumber(0, decimals);
  return (r > 0 ? "+" : "") + fmtNumber(r, decimals);
}

import type { GameAction, GameState } from "@/types/game";

/** Genera un string corto que describe el efecto inmediato de una acción */
export function formatImmediateEffect(action: GameAction): string {
  const parts: string[] = [];

  if (action.popularityChange > 0) parts.push(`+${action.popularityChange}% popular.`);
  else if (action.popularityChange < 0) parts.push(`${action.popularityChange}% popular.`);

  if (action.budgetChange > 0) parts.push(`+${fmtBudget(action.budgetChange)}`);
  else if (action.budgetChange < 0) parts.push(`−${fmtBudget(Math.abs(action.budgetChange))}`);

  if (action.multiEffects?.stabilityChange) {
    const v = action.multiEffects.stabilityChange;
    parts.push(`${v > 0 ? "+" : ""}${v} estab.`);
  }
  if (action.multiEffects?.legitimacyChange) {
    const v = action.multiEffects.legitimacyChange;
    parts.push(`${v > 0 ? "+" : ""}${v} legit.`);
  }

  return parts.join(", ") || "Sin efecto inmediato";
}

/** Genera un string sobre el efecto futuro si lo hay */
export function formatFutureEffect(action: GameAction): string | null {
  if (!action.futureEffects || action.futureEffects.length === 0) return null;
  const first = action.futureEffects[0];
  const bits: string[] = [];
  if (first.budgetChange) {
    const sign = first.budgetChange > 0 ? "+" : "−";
    bits.push(`${sign}${fmtBudget(Math.abs(first.budgetChange))}`);
  }
  if (first.popularityChange) {
    bits.push(`${first.popularityChange > 0 ? "+" : ""}${first.popularityChange}% pop.`);
  }
  return bits.length > 0 ? `${bits.join(", ")} en ${first.delay}t` : null;
}

/** Si la acción no puede ejecutarse, devuelve una razón corta */
export function getBlockReason(action: GameAction, state: GameState): string | null {
  if (state.budget < action.requirements.minBudget) {
    return `Presupuesto insuficiente: requiere ${fmtBudget(action.requirements.minBudget)}`;
  }
  if (
    action.requirements.minPopularity !== undefined &&
    state.popularity < action.requirements.minPopularity
  ) {
    return `Popularidad insuficiente: requiere ${action.requirements.minPopularity}%`;
  }
  if (action.cooldown && state.actionCooldowns?.[action.id] > 0) {
    return `En cooldown: ${state.actionCooldowns[action.id]}t restantes`;
  }
  return null;
}

/** Si la acción es recomendable contextualmente, devuelve la razón */
export function getRecReason(action: GameAction, state: GameState): string | null {
  if (action.isReform && state.legislativeSupport !== null && state.legislativeSupport >= 45) {
    return "Apoyo legislativo fuerte: costo reducido";
  }
  if (action.multiEffects?.legitimacyChange && action.multiEffects.legitimacyChange >= 5) {
    return "Alto impacto en legitimidad";
  }
  if (action.popularityChange >= 15 && state.popularity < 40) {
    return "Recuperar popularidad baja";
  }
  return null;
}
