import { GameState } from '../types/game';

export function calculatePopularidad(gameState: GameState) {
  // Calcular PopularidadGrupos (60% del total)
  const popularidadGrupos = calculatePopularidadGrupos(gameState);
  
  // Calcular PopularidadPolitica (40% del total)
  const popularidadPolitica = calculatePopularidadPolitica(gameState);
  
  // Calcular popularidad total
  const popularidadTotal = (popularidadGrupos * 0.6) + (popularidadPolitica * 0.4);
  
  return {
    popularidadTotal: Math.min(100, Math.max(0, popularidadTotal)),
    popularidadGrupos,
    popularidadPolitica
  };
}

function calculatePopularidadGrupos(gameState: GameState) {
  let popularidadGrupos = gameState.popularidadGrupos;

  // Ejemplo de lógica basada en interacciones
  for (const [, support] of Object.entries(gameState.groupRelations)) {
    if (support > 0) {
      popularidadGrupos += support * 0.1; // Incremento por apoyo positivo
    } else {
      popularidadGrupos += support * 0.2; // Decremento por apoyo negativo
    }
  }

  // Asegurar que la popularidad de grupos esté entre 0 y 100
  return Math.min(100, Math.max(0, popularidadGrupos));
}

function calculatePopularidadPolitica(gameState: GameState) {
  let base = gameState.popularidadPolitica;
  
  // Multiplicador por arquetipo
  const multiplicadorArchetype = {
    politico: 1.2,
    comunicador: 1.3,
    empresario: 0.9,
    sindicalista: 1.1
  }[gameState.archetype];
  
  // Multiplicador por posición
  const multiplicadorPosicion = {
    intendente: 1.0,
    gobernador: 1.2,
    presidente: 1.5
  }[gameState.position];
  
  return base * multiplicadorArchetype * multiplicadorPosicion;
}