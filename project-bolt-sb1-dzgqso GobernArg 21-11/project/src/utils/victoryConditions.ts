import type { DefeatReason, GameState, Objective } from '../types/game';
import { isIndicatorId } from '../data/causal';
import { effective, viewRef } from '../engine/causal/context';

export function updateObjectives(gameState: GameState): GameState {
  const updatedObjectives = gameState.objectives.map(objective => {
    if (objective.completed) return objective;

    // FIX: los requisitos de un objetivo se combinan con AND — antes cada
    // bloque pisaba al anterior, así que un objetivo {popularity, budget}
    // se completaba cumpliendo solo uno de los dos.
    const checks: { completed: boolean; progress: number }[] = [];

    if (objective.requirements.popularity) {
      const required = objective.requirements.popularity;
      checks.push({
        completed: gameState.popularity >= required,
        progress: (gameState.popularity / required) * 100
      });
    }

    if (objective.requirements.budget) {
      const required = objective.requirements.budget;
      checks.push({
        completed: gameState.budget >= required,
        progress: (gameState.budget / required) * 100
      });
    }

    if (objective.requirements.completedActions) {
      const required = objective.requirements.completedActions;
      const completedCount = required.filter(
        action => gameState.completedActions.includes(action)
      ).length;
      checks.push({
        completed: completedCount === required.length,
        progress: (completedCount / required.length) * 100
      });
    }

    if (objective.requirements.indicators) {
      const c = gameState.causal;
      for (const [id, range] of Object.entries(objective.requirements.indicators)) {
        if (!isIndicatorId(id)) continue;
        const v = effective(c, id, viewRef(c));
        const okMin = range.min === undefined || v >= range.min;
        const okMax = range.max === undefined || v <= range.max;
        const target = range.min ?? range.max ?? v;
        const progress = range.min !== undefined ? (v / target) * 100 : (target / Math.max(1, v)) * 100;
        checks.push({ completed: okMin && okMax, progress: Math.min(100, progress) });
      }
    }

    if (objective.requirements.groupSupport) {
      const groupProgress = Object.entries(objective.requirements.groupSupport).map(([groupId, required]) => {
        const currentSupport = gameState.groupRelations[groupId] ?? 0;
        return currentSupport >= required;
      });
      checks.push({
        completed: groupProgress.every(Boolean),
        progress: groupProgress.length > 0
          ? (groupProgress.filter(Boolean).length / groupProgress.length) * 100
          : 0
      });
    }

    const completed = checks.length > 0 && checks.every(c => c.completed);
    const progress = checks.length > 0
      ? checks.reduce((sum, c) => sum + c.progress, 0) / checks.length
      : 0;

    return {
      ...objective,
      completed,
      progress: Math.min(100, Math.round(progress))
    };
  });

  return {
    ...gameState,
    objectives: updatedObjectives
  };
}

/**
 * Metas de gestión del presidente (motor causal). Reemplazan a los objetivos
 * viejos ("10.000M y 80% de popularidad", "85 de apoyo en 5 grupos"), que el
 * motor nuevo vuelve inalcanzables o sin sentido. Son logros de legado: no dan
 * recompensas de popularidad (evita doble conteo en la elección) y no deciden
 * la victoria (la decide la elección de sucesión).
 */
export function getPresidentialGoals(): Objective[] {
  const goal = (id: string, title: string, description: string, indicators: Record<string, { min?: number; max?: number }>): Objective => ({
    id, title, description, requirements: { indicators }, reward: {}, completed: false, progress: 0,
  });
  return [
    goal('meta_inflacion', 'Inflación bajo control', 'Llevar la inflación a niveles moderados (índice ≤ 40, ~2% mensual).', { INFL: { max: 40 } }),
    goal('meta_crecimiento', 'Economía en crecimiento', 'Actividad y empleo por encima de lo normal (≥ 55).', { ACTV: { min: 55 } }),
    goal('meta_salario', 'Salario real recuperado', 'Poder adquisitivo de los hogares ≥ 50.', { PODA: { min: 50 } }),
    goal('meta_solvencia', 'Cuentas en orden', 'Solvencia fiscal sólida (≥ 55): riesgo país bajo.', { SOLV: { min: 55 } }),
    goal('meta_paz_social', 'Paz social', 'Conflictividad baja (≤ 30).', { CONF: { max: 30 } }),
  ];
}

/** Derrotas anticipadas del motor causal (R-24, aceptadas por el usuario). */
export function checkCausalDefeat(state: GameState): DefeatReason | null {
  const c = state.causal;
  if (c.hyperStreak >= 2) return 'hyperinflation';
  if (c.govCrisisStreak >= 2) return 'impeachment';
  return null;
}
