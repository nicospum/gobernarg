import { GameState } from '../types/game';

export function calculatePopularidad(gameState: GameState) {
  // Calcular PopularidadGrupos (promedio simple de relaciones con grupos)
  const popularidadGrupos = calculatePopularidadGrupos(gameState);
  
  // PopularidadPolítica = el valor de popularidad actual (afectado por acciones, desgaste, eventos)
  const popularidadPolitica = gameState.popularity;
  
  // Popularidad total: apoyo grupal solo suma (bonus), no resta (castigo ya cubierto por demandas/protestas/elecciones)
  const baseWeighted = Math.round(popularidadGrupos * 0.4 + popularidadPolitica * 0.6);
  const popularidadTotal = Math.max(popularidadPolitica, baseWeighted);
  
  return {
    popularidadTotal: Math.min(100, Math.max(0, popularidadTotal)),
    popularidadGrupos,
    popularidadPolitica
  };
}

function calculatePopularidadGrupos(gameState: GameState): number {
  const supports = Object.values(gameState.groupRelations);
  if (supports.length === 0) return 50;
  const avgSupport = supports.reduce((a, b) => a + b, 0) / supports.length;
  return Math.min(100, Math.max(0, avgSupport));
}