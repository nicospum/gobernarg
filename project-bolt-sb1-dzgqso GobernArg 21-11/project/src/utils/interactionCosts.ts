import type { InteractionType, Subgroup, GameState } from '../types/game';

// ============================================================
// Constantes de costos y ganancias
// ============================================================

/** Presupuesto base para una negociación, multiplicado por la influencia del grupo */
const NEGOTIATE_COST_PER_INFLUENCE = 25;

/** Presupuesto base para una concesión, multiplicado por la influencia del grupo */
const CONCEDE_COST_PER_INFLUENCE = 45;

/** Ganancia de apoyo base por tipo de interacción */
const SUPPORT_GAINS: Record<InteractionType, number> = {
  reunion: 2,
  negociar: 4,
  conceder: 15,
};

/** Duración en turnos del bono temporal de apoyo tras reunirse */
const REUNION_SUPPORT_DURATION = 3;

/** Multiplicador de efecto en acciones que le gustan al grupo tras reunirse */
const REUNION_ACTION_MULTIPLIER = 1.1;

/** Cantidad de turnos que se pausan las demandas tras conceder */
const CONCEDE_DEMAND_PAUSE_TURNS = 4;

// ============================================================
// Tipos de compromiso (commitment) que devuelve getInteractionCommitment
// ============================================================

export interface InteractionCommitment {
  /** Bono temporal de apoyo (solo reunión) */
  temporarySupport?: {
    bonus: number;
    duration: number;
    actionMultiplier: number;
  };
  /** Indica que el grupo generará una demanda concreta (solo negociar) */
  demandPending?: {
    /** Rango de turnos en los que aparecerá la demanda [min, max] */
    turnsRange: [number, number];
  };
  /** Cantidad de turnos que se pausan las demandas (solo conceder) */
  demandPause?: number;
}

// ============================================================
// Funciones exportadas
// ============================================================

/**
 * Calcula el costo presupuestario de una interacción con un grupo.
 * El costo en acciones (1) se descuenta en el engine aparte.
 */
export function calculateInteractionCost(
  interactionType: InteractionType,
  group: Subgroup,
  _gameState: GameState
): number {
  switch (interactionType) {
    case 'reunion':
      return 10;
    case 'negociar':
      return Math.round(group.influence * NEGOTIATE_COST_PER_INFLUENCE);
    case 'conceder':
      return Math.round(group.influence * CONCEDE_COST_PER_INFLUENCE);
    default:
      return 0;
  }
}

/**
 * Calcula la ganancia de apoyo resultante de una interacción.
 */
export function calculateSupportGain(
  interactionType: InteractionType,
  _group: Subgroup,
  _gameState: GameState
): number {
  return SUPPORT_GAINS[interactionType] ?? 0;
}

/**
 * Devuelve el compromiso (commitment) que adquiere el estado tras la interacción.
 * El engine usa esta información para registrar efectos diferidos
 * (demandas pendientes, pausas, bonos temporales).
 */
export function getInteractionCommitment(
  interactionType: InteractionType,
  _group: Subgroup
): InteractionCommitment {
  switch (interactionType) {
    case 'reunion':
      return {
        temporarySupport: {
          bonus: SUPPORT_GAINS.reunion,
          duration: REUNION_SUPPORT_DURATION,
          actionMultiplier: REUNION_ACTION_MULTIPLIER,
        },
      };
    case 'negociar':
      return {
        demandPending: {
          turnsRange: [1, 2],
        },
      };
    case 'conceder':
      return {
        demandPause: CONCEDE_DEMAND_PAUSE_TURNS,
      };
    default:
      return {};
  }
}
