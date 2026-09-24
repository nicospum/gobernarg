/**
 * Motor causal de GobernArg (diseño: GobernArg_Motor_Causal_v1.xlsx).
 *
 *   ACCIÓN → paquete de EFECTOS (con timing) → INDICADORES del país
 *   → reglas estructurales → SATISFACCIÓN de actores → CANALES de poder
 *   → APRO / ESTRUCTURA / OTROS → INTENCIÓN DE VOTO y GOBERNABILIDAD
 *
 * Dominio puro (sin React). La capa de juego (engine/causalBridge.ts) lo
 * conecta con GameState y con los sistemas existentes (asesores, eventos,
 * elecciones, estrategias).
 */
export * from './types';
export * from './context';
export * from './dsl';
export * from './actors';
export * from './effects';
export * from './rules';
export * from './fiscal';
export * from './channels';
export * from './political';
export * from './relations';
export * from './state';
export * from './actions';
export * from './interactions';
export * from './turn';
export * from './rng';
