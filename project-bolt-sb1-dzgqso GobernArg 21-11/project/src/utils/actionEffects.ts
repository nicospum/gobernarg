import { GameState, GameAction, PendingEffect, ActionCategory, AdvisorWithStatus } from '../types/game';
import { MIDTERM_STRATEGY_EFFECTS } from '../data/midtermStrategies';
import { getGlobalTurn } from '../engine/engineShared';

interface ActionEffect {
  immediateEffects: {
    popularityChange: number;
    budgetChange: number;
    stabilityChange: number;
    legitimacyChange: number;
    votingIntentionChange: number;
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

  // Fase 3: Multiplicador de estrategia post-legislativa
  const strategyMultiplier = gameState.midtermStrategy && gameState.year >= 3
    ? MIDTERM_STRATEGY_EFFECTS[gameState.midtermStrategy].actionMultiplier
    : 1.0;

  // Rendimientos decrecientes (Fase 2)
  const usageCount = gameState.actionUsageCount[action.id] || 0;
  const diminishingFactor = Math.pow(action.diminishingFactor ?? 0.80, usageCount);
  // Si se usó 5+ veces y la acción originalmente daba popularidad positiva, se invierte
  const effectivePopularityChange = usageCount >= 5 && action.popularityChange > 0
    ? -Math.abs(action.popularityChange)
    : action.popularityChange;

  // Efectos inmediatos (factor global para suavizar el impacto de popularidad)
  const POPULARITY_GLOBAL_FACTOR = 0.40; // Fase 1: reducido de 0.55 a 0.40

  // Sprint 2: Verificar reducción de costos por efectos diferidos activos
  let costMultiplier = 1;
  const currentGlobalTurn = getGlobalTurn(gameState);
  const activeReductions = gameState.pendingEffects
    .filter(pe => pe.costReductionCategory &&
      pe.activationTurn <= currentGlobalTurn &&
      (pe.duration === undefined || pe.activationTurn + pe.duration > currentGlobalTurn));
  for (const reduction of activeReductions) {
    if (reduction.costReductionCategory === action.category) {
      costMultiplier = Math.min(costMultiplier, 1 - (reduction.costReductionPercent ?? 0));
    }
  }

  const immediateEffects = {
    popularityChange: effectivePopularityChange * archetypeMultiplier * advisorMultiplier * strategyMultiplier * POPULARITY_GLOBAL_FACTOR * diminishingFactor,
    budgetChange: action.budgetChange * diminishingFactor * costMultiplier,
    stabilityChange: (action.multiEffects?.stabilityChange ?? 0) * diminishingFactor,
    legitimacyChange: (action.multiEffects?.legitimacyChange ?? 0) * diminishingFactor,
    votingIntentionChange: (action.multiEffects?.votingIntentionChange ?? 0) * diminishingFactor,
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

// Mapping: especialidad de asesor → categorías de acción que beneficia
const ADVISOR_SPECIALTY_CATEGORY_MAP: Record<string, ActionCategory[]> = {
  'economista': ['economia'],
  'comunicación social': ['cultura', 'social', 'diplomacia'],
  'comunicacion social': ['cultura', 'social', 'diplomacia'],
  'seguridad': ['seguridad'],
  'relaciones internacionales': ['diplomacia'],
  'infraestructura': ['infraestructura'],
  'educación': ['educacion'],
  'educacion': ['educacion'],
  'tecnología': ['tecnologia'],
  'tecnologia': ['tecnologia'],
  'turismo': ['turismo'],
};

function calculateAdvisorMultiplier(action: GameAction, advisors: AdvisorWithStatus[]): number {
  let multiplier = 1.0;

  advisors.forEach(advisor => {
    if (!advisor.isActive) return;
    const specialtyKey = advisor.specialty.toLowerCase().trim();
    const mappedCategories = ADVISOR_SPECIALTY_CATEGORY_MAP[specialtyKey];
    if (mappedCategories && mappedCategories.includes(action.category)) {
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
  const effects: PendingEffect[] = [];

  // Efectos diferidos explícitos
  if (action.futureEffects) {
    effects.push(...action.futureEffects.map(effect => ({
      id: `${action.id}_${getGlobalTurn(gameState) + effect.delay}`,
      activationTurn: getGlobalTurn(gameState) + effect.delay,
      budgetChange: effect.budgetChange,
      popularityChange: effect.popularityChange,
      groupEffects: effect.groupEffects
    })));
  }

  // Fase 2: Toda acción grande (>=|200| presupuesto) genera mantenimiento diferido
  if (Math.abs(action.budgetChange) >= 200) {
    const delay = 2 + Math.floor(Math.random() * 3); // 2-4 turnos
    const maintenanceCost = Math.round(Math.abs(action.budgetChange) * 0.15); // 15%
    effects.push({
      id: `${action.id}_maintenance_${getGlobalTurn(gameState) + delay}`,
      activationTurn: getGlobalTurn(gameState) + delay,
      budgetChange: -maintenanceCost,
      popularityChange: -2
    });
  }

  // TASK 2A-1: Acciones de infraestructura → incomeModifier positivo diferido
  // Activa en 3 turnos, dura 3 turnos
  if (action.category === 'infraestructura') {
    effects.push({
      id: `${action.id}_infra_income_${getGlobalTurn(gameState) + 3}`,
      activationTurn: getGlobalTurn(gameState) + 3,
      incomeModifier: 0.10,
      duration: 3,
      description: `Beneficio económico por obras de infraestructura: +10% ingresos por 3 turnos`
    });
  }

  // TASK 2A-2: Acciones de diplomacia → posibilidad de eventos futuros
  if (action.category === 'diplomacia') {
    effects.push({
      id: `${action.id}_diplo_event_${getGlobalTurn(gameState) + 2}`,
      activationTurn: getGlobalTurn(gameState) + 2,
      type: 'diplomatic_event',
      description: `Posibilidad de eventos diplomáticos futuros por ${action.title}`
    });
  }

  // TASK 2A-3: Estudio de factibilidad → reducción de costos de infraestructura
  // Activa en turn+1, dura 6 turnos
  if (action.id === 'estudio_factibilidad') {
    effects.push({
      id: `${action.id}_cost_reduction_${getGlobalTurn(gameState) + 1}`,
      activationTurn: getGlobalTurn(gameState) + 1,
      costReductionCategory: 'infraestructura',
      costReductionPercent: 0.20,
      duration: 6,
      description: `Estudio de factibilidad: -20% costo en acciones de infraestructura por 6 turnos`
    });
  }

  return effects;
}

/** Calcula el cooldown por defecto si la acción no tiene uno explícito */
export function getDefaultCooldown(action: GameAction): number {
  if (action.cooldown !== undefined) return action.cooldown;

  const absBudget = Math.abs(action.budgetChange);
  if (action.isLoan || action.id === 'emitir_dinero') return 8;
  if (absBudget > 500) return 6;
  if (absBudget >= 200) return 3;
  return 1;
}

export function isActionAvailable(action: GameAction, gameState: GameState): boolean {
  // Verificar cooldown (Fase 2)
  const cooldownRemaining = gameState.actionCooldowns[action.id] || 0;
  if (cooldownRemaining > 0) return false;

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
  const currentTurn = getGlobalTurn(gameState);

  // Un efecto está activo si ya se alcanzó su activationTurn (turno global) y
  // no expiró (solo los efectos con `duration` expiran; los one-shot no).
  const isEffectActive = (effect: PendingEffect): boolean =>
    effect.activationTurn <= currentTurn &&
    (effect.duration === undefined || effect.activationTurn + effect.duration > currentTurn);

  const activeEffects = gameState.pendingEffects.filter(isEffectActive);

  if (activeEffects.length === 0) {
    // Limpiar efectos de duración ya expirados aunque no haya efectos que aplicar
    const hasExpired = gameState.pendingEffects.some(
      e => e.activationTurn <= currentTurn && !isEffectActive(e)
    );
    if (!hasExpired) return gameState;
    return {
      ...gameState,
      pendingEffects: gameState.pendingEffects.filter(
        e => !isEffectActive(e) || e.duration !== undefined
      )
    };
  }

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

    if (effect.stabilityChange) {
      updatedState.stability = Math.max(0, Math.min(100,
        (updatedState.stability ?? 50) + effect.stabilityChange
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

  // Remover efectos one-shot ya aplicados y efectos de duración expirados.
  // Los efectos de duración vigentes se conservan: los filtros pasivos de
  // incomeModifier / costReduction los consumen hasta que expiren.
  updatedState.pendingEffects = updatedState.pendingEffects.filter(
    e => !isEffectActive(e) || e.duration !== undefined
  );

  return updatedState;
}