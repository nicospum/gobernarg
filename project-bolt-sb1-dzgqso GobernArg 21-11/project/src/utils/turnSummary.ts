import { GameState, TurnSummary } from '../types/game';

const positiveEvents = [
  'La población celebra las mejoras en infraestructura',
  'Los medios destacan el progreso económico',
  'Encuestas muestran satisfacción con las políticas sociales',
  'Inversores muestran interés en nuevos proyectos',
  'Mejora la percepción de seguridad en la ciudad'
];

const negativeEvents = [
  'Protestas por aumento de impuestos',
  'Críticas por falta de mantenimiento urbano',
  'Preocupación por la situación económica',
  'Demandas por mejor atención en salud',
  'Reclamos por inseguridad'
];

export function generateTurnSummary(gameState: GameState): TurnSummary {
  // Calcular cambios en popularidad y presupuesto basados en acciones seleccionadas
  let popularityChange = 0;
  let budgetChange = 0;

  gameState.selectedActions.forEach(actionId => {
    const actionEffects = getActionEffects(actionId);
    popularityChange += actionEffects.popularityImpact;
    budgetChange += actionEffects.budgetImpact;
  });

  const events = generateEvents(popularityChange, gameState.selectedActions);

  // Actualizar objetivos
  updateObjectives(gameState);

  return {
    year: gameState.year,
    quarter: gameState.turn,
    events,
    popularityChange,
    budgetChange,
    inflationEvent: checkInflationEvent(gameState),
    immediateEffects: {
      popularityChange,
      budgetChange
    }
  };
}

function generateEvents(popularityChange: number, selectedActions: string[]): string[] {
  const events: string[] = [];
  const actionEventMap: Record<string, string[]> = {
    'mejorar_infraestructura': ['La población celebra las mejoras en infraestructura'],
    'reducir_impuestos': ['Los medios destacan el progreso económico'],
    'aumentar_gasto_social': ['Encuestas muestran satisfacción con las políticas sociales'],
    'atraer_inversiones': ['Inversores muestran interés en nuevos proyectos'],
    'mejorar_seguridad': ['Mejora la percepción de seguridad en la ciudad'],
    'promover_educacion': ['Aumento en la calidad educativa'],
    'fomentar_turismo': ['Incremento en el turismo local'],
    'desarrollar_tecnologia': ['Avances en innovación tecnológica']
  };

  selectedActions.forEach(action => {
    if (actionEventMap[action]) {
      events.push(...actionEventMap[action]);
    }
  });

  // Añadir eventos aleatorios si no hay suficientes eventos específicos
  while (events.length < 2) {
    const randomEvent = popularityChange >= 0
      ? positiveEvents[Math.floor(Math.random() * positiveEvents.length)]
      : negativeEvents[Math.floor(Math.random() * negativeEvents.length)];
    if (!events.includes(randomEvent)) events.push(randomEvent);
  }

  return events;
}

function checkInflationEvent(gameState: GameState): { triggered: boolean; count: number } {
  const moneyPrintingThisTurn = gameState.selectedActions.filter(
    action => action === 'emitir_dinero'
  ).length;

  return {
    triggered: gameState.moneyPrintingCount + moneyPrintingThisTurn >= 3,
    count: gameState.moneyPrintingCount + moneyPrintingThisTurn
  };
}

// Función de ejemplo para obtener los efectos de una acción
function getActionEffects(_actionId: string) {
  // Aquí se debería implementar la lógica para obtener los efectos reales de cada acción
  return {
    popularityImpact: Math.random() * 10 - 5, // Reemplazar con lógica real
    budgetImpact: Math.random() * 200 - 100  // Reemplazar con lógica real
  };
}

export function updateObjectives(gameState: GameState) {
  gameState.objectives.forEach(objective => {
    if (!objective.isCompleted && objective.checkCompletion && objective.checkCompletion(gameState)) {
      objective.isCompleted = true;
      gameState.completedObjectives.push(objective);
    }
  });
}
