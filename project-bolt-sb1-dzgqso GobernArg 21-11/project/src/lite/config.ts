/**
 * Configuración de GobernArg Light: opciones recuperadas del juego existente
 * y política de información. El modo detallado sigue apagado.
 */
import { DIFFICULTY_LEVELS, SCENARIOS, type DifficultyLevel, type ScenarioDef } from '../data/causal';

export interface LiteFeatures {
  /**
   * Escenarios históricos (Corralito y País en llamas) y su desbloqueo con
   * reelecciones. Apagado: no aparecen en "Nueva partida" y los bots de
   * playtest juegan sólo los 3 niveles; las reelecciones ganadas se siguen
   * contando sin aviso, así al reactivarlos los desbloqueos se conservan.
   */
  escenariosHistoricos: boolean;
  /**
   * Pantalla con todos los datos (índices, efectos con plazos, actores con
   * números, cuentas del trimestre). Apagado: modo simple, "tomás una
   * decisión y ves cómo se mueve". Solo cambia lo que se muestra: el motor,
   * las acciones, los actores y el guardado son los mismos.
   */
  modoDetallado: boolean;
  /**
   * Nivel Fácil ("País en calma"). Apagado: "Nueva partida" ofrece Normal y
   * Argentina, y los bots de playtest juegan esos dos. Las partidas guardadas
   * en Fácil siguen cargando (el escenario sigue en los datos).
   */
  nivelFacil: boolean;
}

export const LITE_FEATURES: LiteFeatures = {
  // Fuera de la edición actual; fuentes, reglas y progreso se conservan.
  escenariosHistoricos: false,
  // Para ver todos los números como antes: true.
  modoDetallado: false,
  // Entrada amable; Normal sigue siendo el nivel elegido de entrada.
  nivelFacil: true,
};

/** ¿Se muestra la pantalla con todos los datos? (ver `modoDetallado`). */
export const detailed = () => LITE_FEATURES.modoDetallado;

/** Niveles que ofrece "Nueva partida" (Fácil solo con `nivelFacil`). */
export function playableLevels(features: Pick<LiteFeatures, 'nivelFacil'> = LITE_FEATURES): DifficultyLevel[] {
  return DIFFICULTY_LEVELS.filter(l => features.nivelFacil || l.id !== 'facil');
}

/** Nivel elegido de entrada en "Nueva partida": Normal. */
export const DEFAULT_LEVEL_SCENARIO_ID = DIFFICULTY_LEVELS.find(l => l.id === 'normal')!.scenarioId;

/** Escenarios que se pueden jugar: los de los niveles visibles y, con el flag, los históricos. */
export function playableScenarios(
  features: Pick<LiteFeatures, 'escenariosHistoricos'> & Partial<Pick<LiteFeatures, 'nivelFacil'>> = LITE_FEATURES,
): ScenarioDef[] {
  const levels = playableLevels({ nivelFacil: features.nivelFacil ?? LITE_FEATURES.nivelFacil });
  const hidden = DIFFICULTY_LEVELS.filter(l => !levels.includes(l)).map(l => l.scenarioId);
  return features.escenariosHistoricos
    ? SCENARIOS.filter(s => !hidden.includes(s.id))
    : SCENARIOS.filter(s => levels.some(l => l.scenarioId === s.id));
}
