import { DIFFICULTY_LEVELS, HISTORIC_SCENARIOS, isScenarioUnlocked } from '../data/causal';
import { LITE_FEATURES } from '../lite/config';
import { loadProgress } from './progress';

/** Entrada pública de Light; el catálogo interno conserva Fácil y sus guardados. */
export const NEW_GAME_DIFFICULTY_LEVELS = Object.freeze(
  DIFFICULTY_LEVELS.filter(level => level.id === 'normal' || level.id === 'argentina'),
);
export const DEFAULT_NEW_GAME_SCENARIO_ID = NEW_GAME_DIFFICULTY_LEVELS.find(level => level.id === 'normal')!.scenarioId;
const NEW_GAME_SCENARIOS = new Set(NEW_GAME_DIFFICULTY_LEVELS.map(level => level.scenarioId));

/**
 * Valida el id original: nunca convierte un escenario oculto o desconocido por fallback.
 * Los históricos (Corralito, País en llamas) pasan sólo con el flag prendido y
 * si el progreso del jugador ya los desbloqueó.
 */
export function isNewScenarioAvailable(scenarioId: string): boolean {
  if (NEW_GAME_SCENARIOS.has(scenarioId)) return true;
  if (!LITE_FEATURES.escenariosHistoricos) return false;
  const historic = HISTORIC_SCENARIOS.find(sc => sc.id === scenarioId);
  if (!historic) return false;
  const progress = loadProgress();
  return isScenarioUnlocked(historic, progress.reelectionsWon, progress.unlockAll);
}
