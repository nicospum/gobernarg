import type { PendingEffect } from "@/types/game";

export type EffectType = "economic" | "social" | "political" | "electoral" | "institutional";

export const EFFECT_TYPE_PALETTE: Record<
  EffectType,
  { label: string; cls: string }
> = {
  economic: {
    label: "Económico",
    cls: "text-amber-300 bg-amber-400/10 border-amber-400/20",
  },
  social: {
    label: "Social",
    cls: "text-sky-300 bg-sky-400/10 border-sky-400/20",
  },
  political: {
    label: "Político",
    cls: "text-purple-300 bg-purple-400/10 border-purple-400/20",
  },
  electoral: {
    label: "Electoral",
    cls: "text-pink-300 bg-pink-400/10 border-pink-400/20",
  },
  institutional: {
    label: "Institucional",
    cls: "text-cyan-300 bg-cyan-400/10 border-cyan-400/20",
  },
};

/** Infiere el EffectType de un PendingEffect mirando type/description/source. */
export function inferEffectType(effect: PendingEffect): EffectType {
  const blob = [effect.type, effect.description, effect.source].filter(Boolean).join(" ").toLowerCase();
  if (/econom|presupuesto|fmi|deuda|inflac|tarifa|impuesto/.test(blob)) return "economic";
  if (/social|grupo|sindicato|salud|vivienda|empleo|asistencia/.test(blob)) return "social";
  if (/electora|voto|comicio|elec/.test(blob)) return "electoral";
  if (/institucion|congreso|judicial|legitim/.test(blob)) return "institutional";
  return "political";
}

/** True si el efecto es positivo a nivel agregado (suma + popularidad o presupuesto). */
export function isPositiveEffect(effect: PendingEffect): boolean {
  const sum =
    (effect.popularityChange ?? 0) + (effect.budgetChange ?? 0) + (effect.stabilityChange ?? 0);
  return sum > 0;
}

/** True si el efecto es urgente (1 turno o menos para activación). */
export function isUrgentEffect(effect: PendingEffect, currentTurn: number): boolean {
  const turnsLeft = effect.activationTurn - currentTurn;
  return turnsLeft <= 1;
}

/** Genera el string de impacto agregado del efecto (combinando todos los campos). */
export function describeEffectImpact(effect: PendingEffect): string {
  const parts: string[] = [];
  if (effect.budgetChange) {
    const sign = effect.budgetChange > 0 ? "+" : "−";
    parts.push(`${sign}$${Math.abs(effect.budgetChange)}M`);
  }
  if (effect.popularityChange) {
    const sign = effect.popularityChange > 0 ? "+" : "";
    parts.push(`${sign}${effect.popularityChange}% pop.`);
  }
  if (effect.stabilityChange) {
    const sign = effect.stabilityChange > 0 ? "+" : "";
    parts.push(`${sign}${effect.stabilityChange} estab.`);
  }
  if (effect.incomeModifier) {
    const pct = Math.round(effect.incomeModifier * 100);
    parts.push(`${pct > 0 ? "+" : ""}${pct}% ingresos/t`);
  }
  if (effect.costReductionPercent) {
    const pct = Math.round(effect.costReductionPercent * 100);
    parts.push(`−${pct}% costo ${effect.costReductionCategory ?? ""}`);
  }
  if (effect.groupEffects && effect.groupEffects.length > 0) {
    parts.push(`Relaciones (${effect.groupEffects.length} grupos)`);
  }
  return parts.join(" · ") || "Sin impacto numérico";
}

// ─── Tipos UI para Informes (vista de proyectos largos) ──────────────────

export interface Milestone {
  turnNumber: number;
  title: string;
  completed: boolean;
  isCurrent: boolean;
}

export interface Informe {
  id: string;
  title: string;
  source?: string;
  type: EffectType;
  startTurn: number;
  totalTurns: number;
  currentProgress: number;
  milestones: Milestone[];
  expectedImpact: string;
  positive: boolean;
}

/** Convierte un PendingEffect (duración > 3) a Informe con milestones. */
export function pendingEffectToInforme(
  effect: PendingEffect,
  currentTurn: number,
): Informe {
  const total = effect.duration ?? 1;
  const startTurn = effect.activationTurn - total;
  const progress = Math.min(Math.max(currentTurn - startTurn, 0), total);

  const milestones: Milestone[] = Array.from({ length: total }, (_, i) => {
    const turnNumber = i + 1;
    const absoluteTurn = startTurn + i;
    return {
      turnNumber,
      title: `Turno ${turnNumber}/${total}`,
      completed: absoluteTurn < currentTurn,
      isCurrent: absoluteTurn === currentTurn,
    };
  });

  return {
    id: effect.id,
    title: effect.description ?? effect.source ?? "Proyecto en curso",
    source: effect.source,
    type: inferEffectType(effect),
    startTurn,
    totalTurns: total,
    currentProgress: progress,
    milestones,
    expectedImpact: describeEffectImpact(effect),
    positive: isPositiveEffect(effect),
  };
}

/** Threshold para separar efectos cortos de informes largos. */
export const INFORME_MIN_DURATION = 4;

export function isInformeEffect(effect: PendingEffect): boolean {
  return (effect.duration ?? 0) >= INFORME_MIN_DURATION;
}
