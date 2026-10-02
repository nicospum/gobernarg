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
  /**
   * Pantalla con todas las cifras de la versión completa: indicadores con
   * número y causas, calendario, noticias, objetivos, estilo de gobierno,
   * informe de obras, expediente del trimestre, Tesoro completo y cierre de
   * turno detallado. Apagado (la Lite): tomás una decisión y ves cómo se
   * mueve el país en palabras, colores y flechas. El motor es el mismo.
   */
  modoDetallado: boolean;
}

export const LITE_FEATURES: LiteFeatures = {
  escenariosHistoricos: false,
  modoDetallado: false,
};
