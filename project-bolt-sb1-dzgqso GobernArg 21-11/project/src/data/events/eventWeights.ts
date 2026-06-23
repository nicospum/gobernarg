// Pesos y modificadores para el sistema de eventos
export const eventWeights = {
  // Pesos base por categoría
  categoryWeights: {
    economic: 1.0,
    political: 1.0,
    social: 1.0,
    international: 0.8,
    natural: 0.6
  },

  // Pesos por severidad
  severityWeights: {
    low: 0.8,
    medium: 1.0,
    high: 1.2,
    critical: 1.5
  },

  // Modificadores por arquetipo
  archetypeModifiers: {
    politico: {
      political: 1.2,
      social: 1.1,
      economic: 0.9
    },
    empresario: {
      economic: 1.3,
      political: 0.9,
      social: 0.8
    },
    sindicalista: {
      social: 1.3,
      political: 1.1,
      economic: 0.8
    },
    comunicador: {
      political: 1.2,
      social: 1.2,
      economic: 0.8
    }
  },

  // Modificadores por cargo
  positionModifiers: {
    intendente: {
      local: 1.3,
      regional: 0.7,
      national: 0.4
    },
    gobernador: {
      local: 0.8,
      regional: 1.3,
      national: 0.7
    },
    presidente: {
      local: 0.6,
      regional: 0.9,
      national: 1.3
    }
  },

  // Modificadores por estado del juego
  stateModifiers: {
    lowPopularity: 1.3,    // < 30%
    highPopularity: 0.7,   // > 70%
    lowBudget: 1.4,        // presupuesto negativo
    highBudget: 0.8,       // presupuesto > 2000M
    lowStability: 1.5,     // < 25%
    highStability: 0.6     // > 75%
  },

  // Modificadores por turno
  turnModifiers: {
    earlyGame: 0.8,        // turnos 1-4
    midGame: 1.0,          // turnos 5-12
    lateGame: 1.2          // turnos 13-16
  }
};