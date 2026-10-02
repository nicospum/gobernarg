/**
 * Configuración de la versión Lite: funciones que existen en el código pero
 * están apagadas. Para reactivar una, poner su flag en `true`.
 */
import { DIFFICULTY_LEVELS, SCENARIOS, type ScenarioDef } from '../data/causal';

export interface LiteFeatures {
  /**
   * Escenarios históricos (Corralito y País en llamas) y su desbloqueo con
   * reelecciones. Apagado: no aparecen en "Nueva partida", no se registra
   * progreso de desbloqueo y los bots de playtest juegan sólo los 3 niveles.
   */
  escenariosHistoricos: boolean;
}

export const LITE_FEATURES: LiteFeatures = {
  // Para reactivar Corralito y País en llamas: true.
  escenariosHistoricos: false,
};

/** Escenarios que se pueden jugar: los de los niveles y, con el flag, los históricos. */
export function playableScenarios(features: LiteFeatures = LITE_FEATURES): ScenarioDef[] {
  return features.escenariosHistoricos
    ? SCENARIOS
    : SCENARIOS.filter(s => DIFFICULTY_LEVELS.some(l => l.scenarioId === s.id));
}
