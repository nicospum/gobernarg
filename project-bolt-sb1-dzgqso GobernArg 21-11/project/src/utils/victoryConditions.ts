import { GameState, Objective } from '../types/game';
import { isIndicatorId } from '../data/causal';
import { effective, viewRef } from '../engine/causal/context';

const DEFEAT_CONDITIONS = {
  LOW_POPULARITY_THRESHOLD: {
    intendente: 20,
    gobernador: 25,
    presidente: 30
  } as Record<string, number>,
  LOW_POPULARITY_TURNS: 2,
  NEGATIVE_BUDGET_TURNS: 2
};

export function checkVictoryConditions(gameState: GameState): boolean {
  const objectivesCompleted = gameState.objectives.every(obj => obj.completed);
  const hasRequiredPopularity = gameState.popularity >= 60;
  const hasPositiveBudget = gameState.budget > 0;

  return objectivesCompleted && hasRequiredPopularity && hasPositiveBudget;
}

export function checkDefeatConditions(gameState: GameState): boolean {
  const popThreshold = DEFEAT_CONDITIONS.LOW_POPULARITY_THRESHOLD[gameState.position] ?? 20;
  
  // Check for consecutive low popularity
  if (gameState.popularity < popThreshold) {
    if (gameState.consecutiveLowPopularity + 1 >= DEFEAT_CONDITIONS.LOW_POPULARITY_TURNS) {
      return true;
    }
  }

  // Check for consecutive negative budget
  if (gameState.budget < 0) {
    if (gameState.consecutiveNegativeBudget + 1 >= DEFEAT_CONDITIONS.NEGATIVE_BUDGET_TURNS) {
      return true;
    }
  }

  return false;
}

// Fase 4: 5 vías de derrota
export interface DefeatResult {
  defeated: boolean;
  reason: import('../types/game').DefeatReason | null;
  message: string;
}

export function checkAllDefeatConditions(state: GameState): DefeatResult {
  const popThreshold = DEFEAT_CONDITIONS.LOW_POPULARITY_THRESHOLD[state.position] ?? 20;

  // 1. Popularidad baja (ya incrementado en checkDefeat)
  if (state.popularity < popThreshold && state.consecutiveLowPopularity >= DEFEAT_CONDITIONS.LOW_POPULARITY_TURNS) {
    return { defeated: true, reason: 'low_popularity', message: 'Tu popularidad se desplomó y perdiste todo apoyo político.' };
  }

  // 2. Presupuesto negativo (ya incrementado en checkDefeat)
  if (state.budget < 0 && state.consecutiveNegativeBudget >= DEFEAT_CONDITIONS.NEGATIVE_BUDGET_TURNS) {
    return { defeated: true, reason: 'negative_budget', message: 'El déficit fiscal se volvió insostenible.' };
  }

  // 3. Impeachment: pop < 10% + estabilidad < 20% × 2 turnos
  if (state.popularity < 10 && state.stability < 20) {
    if ((state.impeachmentConsecutiveTurns ?? 0) >= 2) {
      return { defeated: true, reason: 'impeachment', message: 'El Congreso inició un juicio político. Fuiste destituido.' };
    }
  }

  // 4. Golpe institucional: estabilidad < 10% + legislativeSupport < 25% × 3 turnos
  if (state.stability < 10 && (state.legislativeSupport ?? 100) < 25) {
    if ((state.coupConsecutiveTurns ?? 0) >= 3) {
      return { defeated: true, reason: 'institutional_coup', message: 'Las instituciones colapsaron. Un golpe te removió del poder.' };
    }
  }

  // 5. Hiperinflación
  if (state.moneyPrintingCount >= 7) {
    return { defeated: true, reason: 'hyperinflation', message: 'La emisión descontrolada provocó hiperinflación. La economía colapsó.' };
  }

  return { defeated: false, reason: null, message: '' };
}

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

    if (objective.requirements.indicators && gameState.causal) {
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

// MODO CAMPAÑA (RESERVADO POST-MVP): los objetivos/thresholds de intendente y
// gobernador pertenecen a la carrera intendente→gobernador→presidente. Hoy
// inalcanzables (MVP presidente-only) pero se conservan para el modo campaña
// del roadmap.
export function getPositionObjectives(position: string): Objective[] {
  switch (position) {
    case 'intendente':
      return [
        {
          id: 'local-development',
          title: 'Desarrollo Local',
          description: 'Alcanza un presupuesto de 2000M y 70% de popularidad',
          requirements: {
            popularity: 70,
            budget: 2000
          },
          reward: {
            popularity: 10
          },
          completed: false,
          progress: 0
        },
        {
          id: 'community-support',
          title: 'Apoyo Comunitario',
          description: 'Completa 5 proyectos de infraestructura local',
          requirements: {
            completedActions: [
              'plan_viviendas',
              'transporte_publico',
              'construccion_hospitales',
              'red_comunicaciones',
              'infraestructura_vial'
            ]
          },
          reward: {
            budget: 500
          },
          completed: false,
          progress: 0
        }
      ];

    case 'gobernador':
      return [
        {
          id: 'provincial-growth',
          title: 'Crecimiento Provincial',
          description: 'Alcanza un presupuesto de 5000M y 75% de popularidad',
          requirements: {
            popularity: 75,
            budget: 5000
          },
          reward: {
            popularity: 15
          },
          completed: false,
          progress: 0
        },
        {
          id: 'sector-alliance',
          title: 'Alianza Sectorial',
          description: 'Obtén alto apoyo de sectores clave',
          requirements: {
            groupSupport: {
              'empresarios': 80,
              'sindicatos': 80,
              'clase-media': 75
            }
          },
          reward: {
            budget: 1000
          },
          completed: false,
          progress: 0
        }
      ];

    case 'presidente':
      return [
        {
          id: 'national-prosperity',
          title: 'Prosperidad Nacional',
          description: 'Alcanza un presupuesto de 10000M y 80% de popularidad',
          requirements: {
            popularity: 80,
            budget: 10000
          },
          reward: {
            popularity: 20
          },
          completed: false,
          progress: 0
        },
        {
          id: 'total-stability',
          title: 'Estabilidad Total',
          description: 'Mantén alto apoyo en todos los sectores',
          requirements: {
            groupSupport: {
              'empresarios': 85,
              'sindicatos': 85,
              'clase-media': 80,
              'clase-alta': 75,
              'sectores-populares': 80
            }
          },
          reward: {
            budget: 2000
          },
          completed: false,
          progress: 0
        }
      ];

    default:
      return [];
  }
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
export function checkCausalDefeat(state: GameState): import('../types/game').DefeatReason | null {
  const c = state.causal;
  if (!c) return null;
  if (c.hyperStreak >= 2) return 'hyperinflation';
  if (c.govCrisisStreak >= 2) return 'impeachment';
  return null;
}
