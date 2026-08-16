import { GameState, DefeatReason } from '../types/game';

export function generateLegacyText(gameState: GameState): string {
  const { governorName, careerHistory, turnLog } = gameState;
  const name = governorName || 'El gobernante';

  if (careerHistory.length === 0) {
    return `${name} tuvo una gestión breve y no dejó huella en la historia.`;
  }

  const paragraphs: string[] = [];

  // Introducción
  const first = careerHistory[0];
  paragraphs.push(
    `${name} comenzó su carrera política como ${capitalize(first.position)} en 2026, asumiendo con una ambiciosa agenda de gobierno.`
  );

  // Hitos de carrera
  for (let i = 0; i < careerHistory.length; i++) {
    const milestone = careerHistory[i];
    const year = 2026 + i * 4;
    const endYear = year + 3;

    if (milestone.type === 'initial') {
      paragraphs.push(
        `Su primer mandato como ${capitalize(milestone.position)} se extendió entre ${year} y ${endYear}.`
      );
    } else if (milestone.type === 'reelection') {
      paragraphs.push(
        `En ${endYear} buscó la reelección como ${capitalize(milestone.position)} y obtuvo el ${milestone.votesPercentage.toFixed(1)}% de los votos, ${milestone.result === 'victory' ? 'logrando continuar' : 'sin lograr continuar'} en el cargo.`
      );
    } else if (milestone.type === 'promotion') {
      paragraphs.push(
        `En ${endYear} dio el salto de ${capitalize(careerHistory[i - 1]?.position ?? 'su cargo anterior')} a ${capitalize(milestone.position)}, alcanzando el ${milestone.votesPercentage.toFixed(1)}% en una elección histórica.`
      );
    }
  }

  // Obras y crisis
  const totalProjects = turnLog.reduce((sum, log) => sum + log.projectsCompleted.length, 0);
  const totalCrises = turnLog.reduce((sum, log) => sum + log.crisesFaced.length, 0);
  const uniqueProjects = Array.from(new Set(turnLog.flatMap(log => log.projectsCompleted)));

  if (totalProjects > 0) {
    paragraphs.push(
      `A lo largo de su gestión impulsó ${totalProjects} obra${totalProjects === 1 ? '' : 's'}, entre las que destacan: ${uniqueProjects.slice(0, 3).join(', ')}${uniqueProjects.length > 3 ? ' y otras' : ''}.`
    );
  }

  if (totalCrises > 0) {
    paragraphs.push(
      `Su mandato no estuvo exento de desafíos: enfrentó ${totalCrises} crisis significativa${totalCrises === 1 ? '' : 's'} que pusieron a prueba su capacidad de liderazgo.`
    );
  }

  // Victoria o derrota final
  const lastMilestone = careerHistory[careerHistory.length - 1];
  if (gameState.gameOver && !gameState.victorious) {
    const narratives: Partial<Record<DefeatReason, string>> = {
      low_popularity: `Finalmente, la popularidad de ${name} se desplomó a niveles insostenibles, forzando su salida del poder.`,
      negative_budget: `El déficit fiscal crónico terminó con el gobierno de ${name}, que no pudo mantener las cuentas públicas en orden.`,
      impeachment: `El Congreso destituyó a ${name} mediante un juicio político que puso fin a su mandato de forma abrupta.`,
      institutional_coup: `Las instituciones colapsaron bajo la gestión de ${name}, que fue removido del poder en un golpe institucional.`,
      hyperinflation: `La economía argentina colapsó en una hiperinflación desatada por la emisión descontrolada durante la gestión de ${name}.`,
      election_loss: `Finalmente, en las urnas, el pueblo decidió un cambio de rumbo. ${name} perdió las elecciones con el ${lastMilestone.votesPercentage.toFixed(1)}% de los votos, cerrando así su ciclo en el poder.`,
    };
    paragraphs.push(
      narratives[gameState.defeatReason ?? 'election_loss'] ??
      `${name} perdió las elecciones con el ${lastMilestone.votesPercentage.toFixed(1)}% de los votos, cerrando así su paso por el ejecutivo.`
    );
  } else if (gameState.position === 'presidente' && gameState.term >= 2) {
    paragraphs.push(
      `Completó dos mandatos como Presidente y se retiró del cargo con una trayectoria que quedará en la memoria política del país.`
    );
  } else if (gameState.victorious) {
    paragraphs.push(
      `${name} culminó su carrera como una figura consolidada en la política nacional, habiendo dejado una marca indeleble en la historia argentina.`
    );
  }

  return paragraphs.join('\n\n');
}

export function generateLegacyStats(gameState: GameState): { label: string; value: string }[] {
  const { careerHistory, turnLog, popularity, termsByPosition } = gameState;

  const yearsInPower = Math.max(0, (careerHistory.length - 1) * 4 + (gameState.year - 1));
  const mandatesWon = careerHistory.filter(m => m.result === 'victory').length;
  const mandatesLost = careerHistory.filter(m => m.result === 'defeat').length;
  const totalProjects = turnLog.reduce((sum, log) => sum + log.projectsCompleted.length, 0);
  const totalCrises = turnLog.reduce((sum, log) => sum + log.crisesFaced.length, 0);
  const positionsHeld = Object.entries(termsByPosition)
    .filter(([, count]) => count > 0)
    .map(([pos]) => capitalize(pos))
    .join(', ');

  return [
    { label: 'Años en el poder', value: `${yearsInPower}` },
    { label: 'Cargos ocupados', value: positionsHeld || 'Ninguno' },
    { label: 'Mandatos ganados', value: `${mandatesWon}` },
    { label: 'Mandatos perdidos', value: `${mandatesLost}` },
    { label: 'Obras completadas', value: `${totalProjects}` },
    { label: 'Crisis superadas', value: `${totalCrises}` },
    { label: 'Popularidad final', value: `${Math.round(popularity)}%` }
  ];
}

export function getRecentCrises(gameState: GameState, limit = 5): string[] {
  const crises = gameState.turnLog.flatMap(log => log.crisesFaced);
  return Array.from(new Set(crises)).slice(0, limit);
}

export function getRecentProjects(gameState: GameState, limit = 5): string[] {
  const projects = gameState.turnLog.flatMap(log => log.projectsCompleted);
  return Array.from(new Set(projects)).slice(0, limit);
}

function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}
