/**
 * Formatea un valor de presupuesto en millones a notación compacta:
 * - >= 1000M se muestra como $X.YB
 * - < 1000M se muestra como $XM
 * - Negativos preservan el signo.
 */
export function fmtBudget(n: number): string {
  const abs = Math.abs(n);
  const sign = n < 0 ? "-" : "";
  if (abs >= 1000) {
    return `${sign}$${(abs / 1000).toFixed(1)}B`;
  }
  return `${sign}$${Math.round(abs)}M`;
}

/** Formatea un delta de presupuesto: incluye signo + */
export function fmtBudgetDelta(n: number): string {
  if (n === 0) return "$0M";
  return n > 0 ? `+${fmtBudget(n)}` : fmtBudget(n);
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
