import { GameState, GroupAgendaItem, GroupMood } from '../types/game';
import { actionDefinitions } from '../data/actionRegistry';

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

  for (const sg of allSubgroups) {
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
    if (state.turn < pausedUntil) continue;

    const mood = state.groupMoods.find(m => m.groupId === sg.id);
    const ignoreBonus = (mood?.ignoredTurns ?? 0) * 0.1;
    const prob = Math.min(0.8, 0.3 + ignoreBonus);

    if (Math.random() < prob) {
      // Obtener IDs de acciones ejecutadas en los últimos 3 turnos
      const recentActionIds = state.turnLog
        .filter(entry => entry.turn >= state.turn - 3 && entry.turn < state.turn)
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
          deadline: state.turn + deadlineTurns,
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
    if (state.turn >= agenda.deadline) {
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
    if (state.turn >= resolveTurn) {
      // Buscar el subgroup para usar demandActionIds si existen
      const subgroup = (state.interestGroups ?? [])
        .flatMap(g => g.subgroups)
        .find(sg => sg.id === subgroupId);

      let demand: string | null = null;

      if (subgroup?.demandActionIds && subgroup.demandActionIds.length > 0) {
        // Nuevo sistema: elegir de demandActionIds
        const actionId = subgroup.demandActionIds[
          Math.floor(Math.random() * subgroup.demandActionIds.length)
        ];
        const actionDef = actionDefinitions.find(a => a.id === actionId);
        if (
          actionDef &&
          (!actionDef.availableForPositions ||
            actionDef.availableForPositions.length === 0 ||
            actionDef.availableForPositions.includes(state.position))
        ) {
          demand = actionId;
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
          deadline: state.turn + 4,
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
