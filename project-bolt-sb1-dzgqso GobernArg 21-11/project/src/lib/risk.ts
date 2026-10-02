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
