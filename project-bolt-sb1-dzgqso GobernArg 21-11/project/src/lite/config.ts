/**
 * Configuración de la versión Lite: funciones que existen en el código pero
 * están apagadas. Para reactivar una, poner su flag en `true`.
 */
import { DIFFICULTY_LEVELS, SCENARIOS, type ScenarioDef } from '../data/causal';

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
}

export const LITE_FEATURES: LiteFeatures = {
  // Para reactivar Corralito y País en llamas: true.
  escenariosHistoricos: false,
  // Para ver todos los números como antes: true.
  modoDetallado: false,
};

/** ¿Se muestra la pantalla con todos los datos? (ver `modoDetallado`). */
export const detailed = () => LITE_FEATURES.modoDetallado;

/** Escenarios que se pueden jugar: los de los niveles y, con el flag, los históricos. */
export function playableScenarios(features: Pick<LiteFeatures, 'escenariosHistoricos'> = LITE_FEATURES): ScenarioDef[] {
  return features.escenariosHistoricos
    ? SCENARIOS
    : SCENARIOS.filter(s => DIFFICULTY_LEVELS.some(l => l.scenarioId === s.id));
}
