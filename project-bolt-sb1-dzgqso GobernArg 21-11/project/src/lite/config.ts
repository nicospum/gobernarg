/**
 * Funciones de la versión completa que la Lite conserva pero oculta.
 * Para reactivar una, poner su valor en `true` (y correr las pruebas).
 */
export interface LiteFeatures {
  /**
   * Escenarios históricos (Corralito y País en llamas) que se desbloquean
   * ganando reelecciones (causal/scenarios.ts y causal/progress.ts). Apagado:
   * no aparecen en "Nueva partida" ni se avisa al desbloquearlos, aunque las
   * reelecciones ganadas se siguen contando para cuando se reactiven.
   */
  escenariosHistoricos: boolean;
}

export const LITE_FEATURES: LiteFeatures = {
  escenariosHistoricos: false,
};
