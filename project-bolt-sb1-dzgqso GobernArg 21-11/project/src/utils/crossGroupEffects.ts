import { GameState } from '../types/game';
import { GROUP_ANTAGONISTS } from '../data/groupAntagonists';

/**
 * Aplica efectos cruzados entre grupos antagónicos.
 * Cuando un grupo gana apoyo (change > 0), sus antagonistas pierden
 * una proporción de esa ganancia.
 */
export function applyCrossGroupEffects(
  state: GameState,
  supportChanges: Record<string, number>
): GameState {
  for (const [groupId, change] of Object.entries(supportChanges)) {
    if (change <= 0) continue;

    const antagonists = GROUP_ANTAGONISTS[groupId];
    if (!antagonists) continue;

    for (const [antagonistId, ratio] of Object.entries(antagonists)) {
      const penalty = Math.round(change * ratio);
      const current = state.groupRelations[antagonistId] ?? 50;
      state.groupRelations[antagonistId] = Math.max(0, Math.min(100, current - penalty));
    }
  }
  return state;
}
