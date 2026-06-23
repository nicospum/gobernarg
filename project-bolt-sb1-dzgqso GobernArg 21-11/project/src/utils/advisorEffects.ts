import { GameState, AdvisorWithStatus, GameAction } from '../types/game';

export function calculateAdvisorEffects(advisors: AdvisorWithStatus[], _gameState: GameState) {
  const effects = {
    bonusActions: 0,
    popularityModifier: 1.0,
    budgetModifier: 1.0,
    groupBonuses: {} as Record<string, number>,
    policyModifiers: {} as Record<string, number>,
    unlockedActions: new Set<string>()
  };

  advisors.forEach(advisor => {
    if (!advisor.isActive) return;

    // Acciones bonus
    effects.bonusActions += advisor.bonusActions;

    // Modificador de popularidad
    effects.popularityModifier += (advisor.popularityEffect / 100);

    // Bonificaciones a grupos
    Object.entries(advisor.groupBonuses).forEach(([groupId, bonus]) => {
      effects.groupBonuses[groupId] = (effects.groupBonuses[groupId] || 0) + bonus;
    });

    // Modificadores de políticas
    Object.entries(advisor.policyModifiers).forEach(([category, modifier]) => {
      effects.policyModifiers[category] = (effects.policyModifiers[category] || 1) * modifier;
    });

    // Acciones desbloqueadas
    advisor.specialAbilities.forEach(actionId => {
      effects.unlockedActions.add(actionId);
    });
  });

  return effects;
}

export function applyAdvisorEffects(action: GameAction, gameState: GameState): GameAction {
  const advisorEffects = calculateAdvisorEffects(gameState.advisors, gameState);
  
  // Aplicar modificadores de categoría
  const categoryModifier = advisorEffects.policyModifiers[action.category] || 1;

  return {
    ...action,
    popularityChange: action.popularityChange * categoryModifier,
    budgetChange: action.budgetChange * (categoryModifier * 0.8 + 0.2) // Menor impacto en presupuesto
  };
}

export function updateGroupRelationsWithAdvisors(
  groupId: string,
  baseChange: number,
  gameState: GameState
): number {
  const advisorEffects = calculateAdvisorEffects(gameState.advisors, gameState);
  const groupBonus = advisorEffects.groupBonuses[groupId] || 0;
  
  return baseChange * (1 + (groupBonus / 100));
}