import { GameState, GameAction, PendingEffect } from '../types/game';

interface ActionEffect {
  immediateEffects: {
    popularityChange: number;
    budgetChange: number;
    groupEffects: {
      groupId: string;
      supportChange: number;
    }[];
  };
  pendingEffects: PendingEffect[];
  unlockedActions: string[];
}

export function calculateActionEffects(
  action: GameAction,
  gameState: GameState
): ActionEffect {
  const archetypeMultiplier = getArchetypeMultiplier(gameState.archetype, action);
  const advisorMultiplier = calculateAdvisorMultiplier(action, gameState.advisors);

  // Efectos inmediatos (factor global para suavizar el impacto de popularidad)
  const POPULARITY_GLOBAL_FACTOR = 0.55;
  const immediateEffects = {
    popularityChange: action.popularityChange * archetypeMultiplier * advisorMultiplier * POPULARITY_GLOBAL_FACTOR,
    budgetChange: action.budgetChange,
    groupEffects: calculateGroupEffects(action, gameState)
  };

  // Efectos pendientes
  const pendingEffects = generatePendingEffects(action, gameState);

  // Acciones desbloqueadas
  const unlockedActions = action.unlockedActions || [];

  return {
    immediateEffects,
    pendingEffects,
    unlockedActions
  };
}

function getArchetypeMultiplier(archetype: string, action: GameAction): number {
  switch (archetype) {
    case 'politico':
      return action.category === 'diplomacia' ? 1.2 : 1.0;
    case 'empresario':
      return action.category === 'economia' ? 1.3 : 0.9;
    case 'sindicalista':
      return action.category === 'social' ? 1.3 : 0.9;
    case 'comunicador':
      return 1.1;
    default:
      return 1.0;
  }
}

function calculateAdvisorMultiplier(action: GameAction, advisors: any[]): number {
  let multiplier = 1.0;

  advisors.forEach(advisor => {
    if (advisor.isActive && advisor.specialty.toLowerCase().includes(action.category)) {
      multiplier *= 1.2;
    }
  });

  return multiplier;
}

function calculateGroupEffects(action: GameAction, gameState: GameState) {
  const effects: { groupId: string; supportChange: number; }[] = [];

  gameState.interestGroups?.forEach(group => {
    group.subgroups.forEach(subgroup => {
      // Verificar si la acción afecta a los intereses del subgrupo
      const matchesInterests = subgroup.interests.some(
        interest => action.description.toLowerCase().includes(interest.toLowerCase())
      );

      if (matchesInterests) {
        effects.push({
          groupId: subgroup.id,
          supportChange: action.popularityChange * (subgroup.influence / 10)
        });
      }
    });
  });

  return effects;
}

function generatePendingEffects(action: GameAction, gameState: GameState): PendingEffect[] {
  if (!action.futureEffects) return [];

  return action.futureEffects.map(effect => ({
    id: `${action.id}_${gameState.turn + effect.delay}`,
    activationTurn: gameState.turn + effect.delay,
    budgetChange: effect.budgetChange,
    popularityChange: effect.popularityChange,
    groupEffects: effect.groupEffects
  }));
}

export function isActionAvailable(action: GameAction, gameState: GameState): boolean {
  // Verificar presupuesto mínimo
  if (gameState.budget < action.requirements.minBudget) return false;

  // Verificar popularidad mínima
  if (action.requirements.minPopularity && 
      gameState.popularity < action.requirements.minPopularity) return false;

  // Verificar asesor requerido
  if (action.requirements.advisorRequired) {
    const hasRequiredAdvisor = gameState.advisors.some(
      advisor => advisor.id === action.requirements.advisorRequired && advisor.isActive
    );
    if (!hasRequiredAdvisor) return false;
  }

  // Verificar apoyo de grupos requerido
  if (action.requirements.groupSupportRequired) {
    const meetsGroupSupport = action.requirements.groupSupportRequired.every(
      req => (gameState.groupRelations[req.groupId] || 0) >= req.minSupport
    );
    if (!meetsGroupSupport) return false;
  }

  // Verificar si la acción está desbloqueada
  if (!(gameState.unlockedActions ?? []).includes(action.id)) return false;

  return true;
}

export function processPendingEffects(gameState: GameState): GameState {
  const currentTurn = gameState.turn;
  const activeEffects = gameState.pendingEffects.filter(
    effect => effect.activationTurn === currentTurn
  );
  
  if (activeEffects.length === 0) return gameState;

  let updatedState = { ...gameState };

  activeEffects.forEach(effect => {
    if (effect.budgetChange) {
      updatedState.budget += effect.budgetChange;
    }
    
    if (effect.popularityChange) {
      updatedState.popularity = Math.max(0, Math.min(100, 
        updatedState.popularity + effect.popularityChange
      ));
    }

    if (effect.groupEffects) {
      effect.groupEffects.forEach(groupEffect => {
        const currentSupport = updatedState.groupRelations[groupEffect.groupId] || 0;
        updatedState.groupRelations[groupEffect.groupId] = Math.max(0, Math.min(100,
          currentSupport + groupEffect.supportChange
        ));
      });
    }
  });

  // Remover los efectos procesados
  updatedState.pendingEffects = updatedState.pendingEffects.filter(
    effect => effect.activationTurn !== currentTurn
  );

  return updatedState;
}