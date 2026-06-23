import { GameState, Objective } from '../types/game';

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

    let progress = 0;
    let completed = false;

    if (objective.requirements.popularity) {
      progress = (gameState.popularity / objective.requirements.popularity) * 100;
      completed = gameState.popularity >= objective.requirements.popularity;
    }

    if (objective.requirements.budget && !completed) {
      progress = (gameState.budget / objective.requirements.budget) * 100;
      completed = gameState.budget >= objective.requirements.budget;
    }

    if (objective.requirements.completedActions && !completed) {
      const completedCount = objective.requirements.completedActions.filter(
        action => gameState.completedActions.includes(action)
      ).length;
      progress = (completedCount / objective.requirements.completedActions.length) * 100;
      completed = completedCount === objective.requirements.completedActions.length;
    }

    if (objective.requirements.groupSupport && !completed) {
      const groupProgress = Object.entries(objective.requirements.groupSupport).map(([groupId, required]) => {
        const currentSupport = (gameState.interestGroups ?? []).find(g => g.id === groupId)?.support || 0;
        return currentSupport >= required;
      });
      completed = groupProgress.every(Boolean);
      progress = (groupProgress.filter(Boolean).length / groupProgress.length) * 100;
    }

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