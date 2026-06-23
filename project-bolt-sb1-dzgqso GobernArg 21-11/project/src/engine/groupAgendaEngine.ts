import { GameState, GroupAgendaItem, GroupMood } from '../types/game';

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
    const templates = AGENDA_TEMPLATES[sg.id] ?? [];
    if (templates.length === 0) continue;

    const hasActiveAgenda = state.groupAgendas.some(
      a => a.groupId === sg.id && !a.satisfied && !a.penaltyApplied
    );
    if (hasActiveAgenda) continue;

    const mood = state.groupMoods.find(m => m.groupId === sg.id);
    const ignoreBonus = (mood?.ignoredTurns ?? 0) * 0.1;
    const prob = Math.min(0.8, 0.3 + ignoreBonus);

    if (Math.random() < prob) {
      const demand = templates[Math.floor(Math.random() * templates.length)];
      newAgendas.push({
        id: `${sg.id}_agenda_${state.year}_${state.turn}`,
        groupId: sg.id,
        demand,
        deadline: state.turn + 4,
        satisfied: false,
        penaltyApplied: false
      });
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
  const updatedAgendas = state.groupAgendas.map(agenda => {
    if (agenda.satisfied || agenda.penaltyApplied) return agenda;
    if (state.turn >= agenda.deadline) {
      state.groupRelations[agenda.groupId] = Math.max(0, (state.groupRelations[agenda.groupId] ?? 50) - 8);
      return { ...agenda, penaltyApplied: true };
    }
    return agenda;
  });
  return { ...state, groupAgendas: updatedAgendas };
}
