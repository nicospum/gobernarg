import { DIFFICULTY_LEVELS } from '../data/causal';

/** Entrada pública de Light; el catálogo interno conserva Fácil y sus guardados. */
export const NEW_GAME_DIFFICULTY_LEVELS = Object.freeze(
  DIFFICULTY_LEVELS.filter(level => level.id === 'normal' || level.id === 'argentina'),
);
export const DEFAULT_NEW_GAME_SCENARIO_ID = NEW_GAME_DIFFICULTY_LEVELS.find(level => level.id === 'normal')!.scenarioId;
const NEW_GAME_SCENARIOS = new Set(NEW_GAME_DIFFICULTY_LEVELS.map(level => level.scenarioId));

/** Valida el id original: nunca convierte un escenario oculto o desconocido por fallback. */
export function isNewScenarioAvailable(scenarioId: string): boolean {
  return NEW_GAME_SCENARIOS.has(scenarioId);
}
