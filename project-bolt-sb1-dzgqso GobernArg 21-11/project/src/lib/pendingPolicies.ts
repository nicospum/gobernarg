import { CAUSAL_ACTIONS_BY_ID } from '@/data/causal';
import type { CausalState } from '@/engine/causal';

export interface PendingPolicy {
  id: string;
  name: string;
  closes: number;
  conditional: boolean;
}

/** Primer efecto todavía no iniciado de decisiones ya ejecutadas; no es un pronóstico. */
export function pendingPolicies(state: CausalState): PendingPolicy[] {
  const grouped = new Map<string, PendingPolicy>();
  for (const effect of state.agenda) {
    const action = CAUSAL_ACTIONS_BY_ID[effect.actionId];
    if (!action || effect.start < state.turn || effect.start <= effect.originTurn || effect.end < state.turn) continue;
    const id = `${effect.actionId}.${effect.originTurn}`;
    const closes = effect.start - state.turn + 1;
    const current = grouped.get(id);
    if (!current || closes < current.closes) {
      grouped.set(id, { id, name: action.name, closes, conditional: !!effect.applyCondition });
    } else if (closes === current.closes) {
      current.conditional = current.conditional || !!effect.applyCondition;
    }
  }
  return [...grouped.values()].sort((a, b) => a.closes - b.closes || a.id.localeCompare(b.id));
}
