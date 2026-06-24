export type Risk = "bajo" | "medio" | "alto" | "critico";

/**
 * Calcula el riesgo semántico de un indicador según su porcentaje sobre el máximo.
 * @param value valor actual
 * @param max valor máximo
 * @param inverse si true, mayor valor = mayor riesgo (ej: Conflicto Social).
 *                Si false (default), mayor valor = menor riesgo (ej: Popularidad).
 */
export function getValueRisk(value: number, max: number, inverse = false): Risk {
  const p = value / max;
  if (inverse) {
    if (p < 0.3) return "bajo";
    if (p < 0.55) return "medio";
    if (p < 0.75) return "alto";
    return "critico";
  }
  if (p > 0.7) return "bajo";
  if (p > 0.5) return "medio";
  if (p > 0.3) return "alto";
  return "critico";
}

export function riskLabel(risk: Risk): string {
  return { bajo: "Bajo", medio: "Medio", alto: "Alto", critico: "Crítico" }[risk];
}

const RISK_MAP: Record<Risk, { text: string; bg: string; border: string; fill: string }> = {
  bajo: {
    text: "text-emerald-400",
    bg: "bg-emerald-400",
    border: "border-emerald-400/30",
    fill: "fill-emerald-400",
  },
  medio: {
    text: "text-amber-400",
    bg: "bg-amber-400",
    border: "border-amber-400/30",
    fill: "fill-amber-400",
  },
  alto: {
    text: "text-orange-400",
    bg: "bg-orange-400",
    border: "border-orange-400/30",
    fill: "fill-orange-400",
  },
  critico: {
    text: "text-red-400",
    bg: "bg-red-400",
    border: "border-red-400/30",
    fill: "fill-red-400",
  },
};

export function riskColor(risk: Risk, variant: "text" | "bg" | "border" | "fill" = "text"): string {
  return RISK_MAP[risk][variant];
}

import type { GameAction, GameState } from "@/types/game";

/**
 * Riesgo de una acción derivado de:
 * - Magnitud del cambio presupuestario (negativo = costo)
 * - Si es préstamo o emisión monetaria
 * - Si tiene futureEffects negativos diferidos
 * - Si la popularidad cae significativamente
 */
export function getActionRisk(action: GameAction, _state: GameState): Risk {
  void _state; // reservado para uso futuro
  const absBudget = Math.abs(action.budgetChange);
  const isLoanOrMoney = action.isLoan || action.id === "emitir_dinero" || action.id === "emision_monetaria";
  const isReform = action.isReform === true;
  const popularityHit = action.popularityChange <= -10;

  // Préstamo o emisión grande → crítico
  if (isLoanOrMoney && absBudget >= 200) return "critico";
  if (popularityHit && absBudget >= 300) return "critico";
  if (absBudget >= 500) return "critico";
  if (absBudget >= 300 || (isReform && absBudget >= 200)) return "alto";
  if (absBudget >= 150 || popularityHit) return "medio";
  return "bajo";
}

