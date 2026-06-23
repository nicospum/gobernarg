import { GameState } from '../types/game';

interface PopularityFactors {
  popularidadGrupos: number;
  popularidadPolitica: number;
}

const archetypeMultipliers = {
  politico: {
    social: 1.2,
    economic: 1.0,
    diplomatic: 0.8
  },
  empresario: {
    social: 0.8,
    economic: 1.3,
    diplomatic: 0.9
  },
  sindicalista: {
    social: 1.3,
    economic: 0.8,
    diplomatic: 0.9
  },
  comunicador: {
    social: 1.1,
    economic: 0.9,
    diplomatic: 1.2
  }
};

export function calculatePopularity(gameState: GameState): number {
  const factors = calculatePopularityFactors(gameState);
  return (factors.popularidadGrupos * 0.6) + (factors.popularidadPolitica * 0.4);
}

function calculatePopularityFactors(gameState: GameState): PopularityFactors {
  const popularidadGrupos = calculateGroupPopularity(gameState);
  const popularidadPolitica = calculatePoliticalPopularity(gameState);

  return {
    popularidadGrupos,
    popularidadPolitica
  };
}

function calculateGroupPopularity(gameState: GameState): number {
  let totalWeightedSupport = 0;
  let totalInfluence = 0;

  (gameState.interestGroups ?? []).forEach(group => {
    group.subgroups.forEach(subgroup => {
      const weight = subgroup.influence / 10; // Normalizar influencia
      totalWeightedSupport += (subgroup.support ?? 0) * weight;
      totalInfluence += weight;
    });
  });

  return totalWeightedSupport / totalInfluence;
}

function calculatePoliticalPopularity(gameState: GameState): number {
  const archetype = gameState.archetype;
  const multipliers = archetypeMultipliers[archetype];
  
  let basePopularity = gameState.popularity;
  
  // Aplicar multiplicadores según el arquetipo
  let modifiedPopularity = basePopularity * (
    (multipliers.social + multipliers.economic + multipliers.diplomatic) / 3
  );

  // Ajustar según la posición
  switch (gameState.position) {
    case 'intendente':
      modifiedPopularity *= 1.1; // Más fácil mantener popularidad local
      break;
    case 'gobernador':
      modifiedPopularity *= 1.0; // Balance neutral
      break;
    case 'presidente':
      modifiedPopularity *= 0.9; // Más difícil mantener popularidad nacional
      break;
  }

  return Math.min(100, Math.max(0, modifiedPopularity));
}