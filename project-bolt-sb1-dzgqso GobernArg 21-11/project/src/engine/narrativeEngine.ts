import type { GameState, GameAction } from '../types/game';
import { interestGroups } from '../data/interestGroups';
import { getGlobalTurn } from './engineShared';

// ===========================
// Helpers
// ===========================

const QUARTERS: Record<number, string> = {
  1: 'primer trimestre',
  2: 'segundo trimestre',
  3: 'tercer trimestre',
  4: 'cuarto trimestre',
};

const YEAR_SUFFIX: Record<number, string> = {
  1: '1°',
  2: '2°',
  3: '3°',
  4: '4°',
};

function getQuarterName(turn: number): string {
  return QUARTERS[turn] ?? `${turn}° trimestre`;
}

function getSubgroupName(subgroupId: string): string {
  for (const group of interestGroups) {
    for (const sg of group.subgroups) {
      if (sg.id === subgroupId) return sg.name;
    }
  }
  return subgroupId;
}

interface GroupEffectEntry {
  groupId: string;
  supportChange: number;
}

// ===========================
// 1. generateTurnIntro
// ===========================

export function generateTurnIntro(state: GameState): string {
  const parts: string[] = [];

  // Apertura principal
  const quarter = getQuarterName(state.turn);
  const yearSuffix = YEAR_SUFFIX[state.year] ?? `${state.year}°`;
  const cargo = state.position;
  parts.push(`Comienza el ${quarter} de tu ${yearSuffix} año como ${cargo}.`);

  // Popularidad
  if (state.popularity > 70) {
    parts.push('Tu popularidad está en alza.');
  } else if (state.popularity < 30) {
    parts.push('Tu popularidad se desploma.');
  }

  // Demandas pendientes
  const currentGlobalTurn = getGlobalTurn(state);
  const pendingDemands = (state.groupAgendas ?? []).filter(
    a => !a.satisfied && !a.penaltyApplied && a.deadline <= currentGlobalTurn + 1
  );

  if (pendingDemands.length > 0) {
    const urgent = pendingDemands.filter(a => a.deadline <= currentGlobalTurn);
    const upcoming = pendingDemands.filter(a => a.deadline === currentGlobalTurn + 1);

    const groupNames = [...new Set(pendingDemands.map(a => getSubgroupName(a.groupId)))];

    if (urgent.length > 0 && upcoming.length > 0) {
      parts.push(
        `Hay demandas vencidas de ${urgent.map(a => getSubgroupName(a.groupId)).join(', ')} ` +
        `y demandas próximas a vencer de ${upcoming.map(a => getSubgroupName(a.groupId)).join(', ')}.`
      );
    } else if (urgent.length > 0) {
      parts.push(`Hay demandas vencidas de ${groupNames.join(', ')} que requieren atención urgente.`);
    } else if (upcoming.length > 0) {
      parts.push(`Hay demandas de ${groupNames.join(', ')} que vencen el próximo turno.`);
    }
  }

  // Elecciones cercanas (año 4, turno 3: falta 1 turno para elecciones)
  if (state.year === 4 && state.turn === 3) {
    parts.push('Las elecciones generales están a la vuelta de la esquina: falta solo un turno.');
  }

  // Campaña presidencial inicia (año 4, turno 2)
  if (state.year === 4 && state.turn === 2) {
    parts.push('Comienza la campaña presidencial. Cada decisión que tomes será examinada con lupa.');
  }

  return parts.join(' ');
}

// ===========================
// 2. generateActionResult
// ===========================

export function generateActionResult(
  action: GameAction,
  effects: { immediateEffects?: { groupEffects?: GroupEffectEntry[] } }
): string {
  const parts: string[] = [];

  // Inauguración
  parts.push(`Inaugurás "${action.title}".`);

  const groupEffects = effects?.immediateEffects?.groupEffects ?? [];
  const supporters = groupEffects.filter(g => g.supportChange > 0);
  const opponents = groupEffects.filter(g => g.supportChange < 0);

  if (supporters.length > 0) {
    const names = supporters.map(g => getSubgroupName(g.groupId));
    parts.push(`${names.join(', ')} lo celebran.`);
  }

  if (opponents.length > 0) {
    const names = opponents.map(g => getSubgroupName(g.groupId));
    parts.push(`${names.join(', ')} critican la medida.`);
  }

  return parts.join(' ');
}

// ===========================
// 3. generateInteractionResult
// ===========================

export function generateInteractionResult(type: string, groupName: string): string {
  switch (type) {
    case 'reunion':
      return `Te reuniste con ${groupName}. El diálogo fue productivo y se fortalecieron los lazos.`;

    case 'negociar':
      return `Negociaste con ${groupName}. Quedaron a la espera de resultados concretos en los próximos turnos.`;

    case 'conceder':
      return `Concediste ante las demandas de ${groupName}. El gesto fue bien recibido y bajará la tensión por un tiempo.`;

    default:
      return `Interactuaste con ${groupName}. La relación se ha visto afectada.`;
  }
}

// ===========================
// 4. generateElectionResult
// ===========================

export function generateElectionResult(result: {
  votesPercentage: number;
  victory: boolean;
}): string {
  const pct = Math.round(result.votesPercentage);

  if (result.victory) {
    if (pct >= 60) {
      return `Noche electoral. Con un contundente ${pct}% de los votos, el pueblo te ha respaldado de manera aplastante. Tu mandato queda renovado con fuerza.`;
    }
    if (pct >= 50) {
      return `Noche electoral. Con el ${pct}% de los votos, lograste imponerte en las urnas. No fue fácil, pero el resultado te favorece.`;
    }
    return `Noche electoral. Con un ajustado ${pct}% de los votos, ganás por un margen mínimo. El país está dividido y el próximo mandato no será sencillo.`;
  }

  if (pct >= 45) {
    return `Noche electoral. Con el ${pct}% de los votos, la derrota es por un margen muy estrecho. Estuviste cerca, pero no alcanzó.`;
  }
  if (pct >= 35) {
    return `Noche electoral. Con apenas el ${pct}% de los votos, la derrota es clara. El pueblo eligió un rumbo diferente.`;
  }
  return `Noche electoral. Con solo el ${pct}% de los votos, el resultado es una derrota catastrófica. Tu gobierno perdió toda la confianza popular.`;
}
