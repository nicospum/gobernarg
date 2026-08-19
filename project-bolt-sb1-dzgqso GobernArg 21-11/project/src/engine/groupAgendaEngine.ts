import { GameState, GroupAgendaItem, GroupMood } from '../types/game';
import { actionDefinitions } from '../data/actionRegistry';
import { getGlobalTurn } from './engineShared';

const AGENDA_TEMPLATES: Record<string, string[]> = {
  'empresarios': ['Reforma laboral', 'Simplificación tributaria', 'Incentivos a la inversión'],
  'sindicatos': ['Paritarias', 'Condiciones laborales', 'Aumento salarial'],
  'sector-financiero': ['Autonomía del BCRA', 'Control de inflación', 'Desregulación'],
  'sector-agricola': ['Subsidios agrícolas', 'Mejora de caminos rurales', 'Apoyo en sequías'],
  'sectores-populares': ['Ayuda social', 'Acceso a vivienda', 'Programas de empleo'],
  'ambientalistas': ['Políticas ambientales', 'Control de contaminación', 'Energías renovables'],
  'feministas': ['Paridad salarial', 'Protección contra violencia', 'Políticas inclusivas'],
};

export function generateGroupAgendas(state: GameState): GroupAgendaItem[] {
  const newAgendas: GroupAgendaItem[] = [];
  const allSubgroups = (state.interestGroups ?? []).flatMap(g => g.subgroups);

  // Regla de diseño: máx 2 demandas activas simultáneamente
  const activeAgendaCount = state.groupAgendas.filter(
    a => !a.satisfied && !a.penaltyApplied
  ).length;
  if (activeAgendaCount >= 2) return [];

  // Regla de diseño: probabilidad base baja, las demandas son eventos raros
  const BASE_PROBABILITY = 0.08;
  const MAX_PROBABILITY = 0.25;

  for (const sg of allSubgroups) {
    // Si ya llegamos al límite, parar
    if (newAgendas.length + activeAgendaCount >= 2) break;

    // Determinar si el grupo usa demandActionIds (nuevo sistema) o templates (legacy)
    const useActionIds = sg.demandActionIds && sg.demandActionIds.length > 0;
    const templates = AGENDA_TEMPLATES[sg.id] ?? [];
    if (!useActionIds && templates.length === 0) continue;

    const hasActiveAgenda = state.groupAgendas.some(
      a => a.groupId === sg.id && !a.satisfied && !a.penaltyApplied
    );
    if (hasActiveAgenda) continue;

    // Sprint 3: Respetar pausa de demandas
    const pausedUntil = state.demandPausedUntil?.[sg.id] ?? 0;
    if (getGlobalTurn(state) < pausedUntil) continue;

    const mood = state.groupMoods.find(m => m.groupId === sg.id);
    const ignoreBonus = (mood?.ignoredTurns ?? 0) * 0.05;
    const prob = Math.min(MAX_PROBABILITY, BASE_PROBABILITY + ignoreBonus);

    if (Math.random() < prob) {
      // Obtener IDs de acciones ejecutadas en los últimos 3 turnos (turno global)
      const currentGlobalTurn = getGlobalTurn(state);
      const recentActionIds = state.turnLog
        .filter(entry =>
          (entry.year - 1) * 4 + entry.turn >= currentGlobalTurn - 3 &&
          (entry.year - 1) * 4 + entry.turn < currentGlobalTurn
        )
        .flatMap(entry => entry.actionsTaken);

      let demand: string | null = null;

      if (useActionIds) {
        // Nuevo sistema: elegir acción del registry verificando disponibilidad
        const candidateIds = [...sg.demandActionIds];

        // Fisher-Yates shuffle para selección aleatoria sin repetición
        for (let i = candidateIds.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [candidateIds[i], candidateIds[j]] = [candidateIds[j], candidateIds[i]];
        }

        for (const actionId of candidateIds) {
          // Verificar que la acción existe en el registry
          const actionDef = actionDefinitions.find(a => a.id === actionId);
          if (!actionDef) continue;

          // Verificar que la acción está disponible para el cargo actual
          if (
            actionDef.availableForPositions &&
            actionDef.availableForPositions.length > 0 &&
            !actionDef.availableForPositions.includes(state.position)
          ) {
            continue;
          }

          // Verificar que el jugador cumpla los prerrequisitos de la acción
          // (requiredActions no ejecutadas = penalidad garantizada, skip)
          if (
            actionDef.prerequisites?.requiredActions &&
            !actionDef.prerequisites.requiredActions.every(reqId =>
              state.completedActions.includes(reqId)
            )
          ) {
            continue;
          }

          // Verificar que no se haya ejecutado en los últimos 3 turnos
          if (recentActionIds.includes(actionId)) continue;

          demand = actionId;
          break;
        }
      } else {
        // Sistema legacy: usar templates de texto
        demand = templates[Math.floor(Math.random() * templates.length)];
      }

      if (demand) {
        // Deadline: 3 a 5 turnos
        const deadlineTurns = 3 + Math.floor(Math.random() * 3);
        newAgendas.push({
          id: `${sg.id}_agenda_${state.year}_${state.turn}`,
          groupId: sg.id,
          demand,
          deadline: getGlobalTurn(state) + deadlineTurns,
          satisfied: false,
          penaltyApplied: false
        });
      }
    }
  }
  return newAgendas;
}

export function updateGroupMoods(state: GameState): GameState {
  const updatedMoods = state.groupMoods.map(mood => {
    const wasInteracted = (state.interactionHistory[mood.groupId]?.turnsLeft ?? 0) > 0;
    let ignoredTurns = wasInteracted ? 0 : mood.ignoredTurns + 1;

    const support = state.groupRelations[mood.groupId] ?? 50;
    let newMood: GroupMood['mood'] = 'neutral';
    if (support >= 70) newMood = 'contento';
    else if (support >= 50) newMood = 'neutral';
    else if (support >= 35) newMood = ignoredTurns >= 3 ? 'enojado' : 'disconforme';
    else newMood = ignoredTurns >= 2 ? 'radicalizado' : 'enojado';

    return { ...mood, ignoredTurns, mood: newMood };
  });
  return { ...state, groupMoods: updatedMoods };
}

export function applyGroupSatisfactionPenalty(state: GameState): GameState {
  const newGroupRelations = { ...state.groupRelations };
  const updatedAgendas = state.groupAgendas.map(agenda => {
    if (agenda.satisfied || agenda.penaltyApplied) return agenda;
    if (getGlobalTurn(state) >= agenda.deadline) {
      // Verificar si el jugador cumplió la demanda (ejecutó la acción)
      const isFulfilled = state.completedActions.includes(agenda.demand);

      if (isFulfilled) {
        // Demanda cumplida: +10 apoyo al grupo
        newGroupRelations[agenda.groupId] = Math.min(
          100,
          (newGroupRelations[agenda.groupId] ?? 50) + 10
        );
        return { ...agenda, satisfied: true, penaltyApplied: true };
      } else {
        // Penalización proporcional a la influencia del grupo
        const subgroup = (state.interestGroups ?? [])
          .flatMap(g => g.subgroups)
          .find(sg => sg.id === agenda.groupId);
        const influence = subgroup?.influence ?? 5;
        const penalty = Math.round(influence);
        newGroupRelations[agenda.groupId] = Math.max(
          0,
          (newGroupRelations[agenda.groupId] ?? 50) - penalty
        );
        return { ...agenda, penaltyApplied: true };
      }
    }
    return agenda;
  });
  return { ...state, groupAgendas: updatedAgendas, groupRelations: newGroupRelations };
}

// Sprint 3: Resolver negociaciones pendientes
export function resolvePendingNegotiations(state: GameState): GameState {
  const agendas: import('../types/game').GroupAgendaItem[] = [];
  const newNegotiationPending = { ...state.negotiationPending };

  for (const [subgroupId, resolveTurn] of Object.entries(state.negotiationPending)) {
    if (getGlobalTurn(state) >= resolveTurn) {
      // Buscar el subgroup para usar demandActionIds si existen
      const subgroup = (state.interestGroups ?? [])
        .flatMap(g => g.subgroups)
        .find(sg => sg.id === subgroupId);

      let demand: string | null = null;

      if (subgroup?.demandActionIds && subgroup.demandActionIds.length > 0) {
        // Nuevo sistema: elegir de demandActionIds verificando disponibilidad
        const candidateIds = [...subgroup.demandActionIds];

        // Fisher-Yates shuffle para selección aleatoria sin repetición
        for (let i = candidateIds.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [candidateIds[i], candidateIds[j]] = [candidateIds[j], candidateIds[i]];
        }

        for (const actionId of candidateIds) {
          const actionDef = actionDefinitions.find(a => a.id === actionId);
          if (
            !actionDef ||
            (actionDef.availableForPositions &&
              actionDef.availableForPositions.length > 0 &&
              !actionDef.availableForPositions.includes(state.position))
          ) {
            continue;
          }

          // Verificar que el jugador cumpla los prerrequisitos de la acción
          // (requiredActions no ejecutadas = penalidad garantizada, skip)
          if (
            actionDef.prerequisites?.requiredActions &&
            !actionDef.prerequisites.requiredActions.every(reqId =>
              state.completedActions.includes(reqId)
            )
          ) {
            continue;
          }

          demand = actionId;
          break;
        }
      }

      // Fallback a templates legacy
      if (!demand) {
        const templates = AGENDA_TEMPLATES[subgroupId];
        if (templates && templates.length > 0) {
          demand = templates[Math.floor(Math.random() * templates.length)];
        }
      }

      if (demand) {
        agendas.push({
          id: `${subgroupId}_negotiated_${state.year}_${state.turn}`,
          groupId: subgroupId,
          demand,
          deadline: getGlobalTurn(state) + 4,
          satisfied: false,
          penaltyApplied: false
        });
      }
      delete newNegotiationPending[subgroupId];
    }
  }

  return {
    ...state,
    groupAgendas: [...state.groupAgendas, ...agendas],
    negotiationPending: newNegotiationPending,
  };
}
