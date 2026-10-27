import { DIFFICULTY_LEVELS, HISTORIC_SCENARIOS } from '@/data/causal';

/** Catálogo público de nuevas partidas; el catálogo interno conserva los guardados. */
export const NEW_GAME_DIFFICULTY_LEVELS = DIFFICULTY_LEVELS.filter(level => level.id === 'normal' || level.id === 'argentina');
export const DEFAULT_NEW_GAME_SCENARIO_ID = 'viento_de_cola';

/** Bloqueo de acceso de producto; conserva escenarios, simulaciones y progreso. */
export const HISTORICAL_SCENARIOS_ENABLED = false;
export function isNewScenarioAvailable(id: string): boolean {
  if (id === 'pais_en_calma') return false;
  return NEW_GAME_DIFFICULTY_LEVELS.some(level => level.scenarioId === id)
    || (HISTORICAL_SCENARIOS_ENABLED && HISTORIC_SCENARIOS.some(scenario => scenario.id === id));
}
