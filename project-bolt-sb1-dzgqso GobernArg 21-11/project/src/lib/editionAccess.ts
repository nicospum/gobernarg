import { DIFFICULTY_LEVELS, HISTORIC_SCENARIOS } from '@/data/causal';

/** Bloqueo de acceso de producto; conserva escenarios, simulaciones y progreso. */
export const HISTORICAL_SCENARIOS_ENABLED = false;
export function isNewScenarioAvailable(id: string): boolean {
  return DIFFICULTY_LEVELS.some(level => level.scenarioId === id)
    || (HISTORICAL_SCENARIOS_ENABLED && HISTORIC_SCENARIOS.some(scenario => scenario.id === id));
}
