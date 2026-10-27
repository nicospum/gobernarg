import type { CausalState } from '@/engine/causal';
import { ACTORS, CAUSAL_ACTIONS_BY_ID } from '@/data/causal';

export interface KnownDeadline {
  id: string;
  label: string;
  turns: number;
}

/** Sólo compromisos ya firmados y la revisión pública de un préstamo elegido. */
export function knownDeadlines(state: CausalState): KnownDeadline[] {
  const deadlines: KnownDeadline[] = state.agreements
    .filter(agreement => agreement.status === 'active' && agreement.deadline >= state.turn)
    .map(agreement => ({
      id: agreement.id,
      label: `${ACTORS[agreement.actor].shortName}: ${CAUSAL_ACTIONS_BY_ID[agreement.commitmentActionId]?.name ?? 'cumplir el acuerdo'}`,
      turns: agreement.deadline - state.turn,
    }));
  // Las condiciones de esta revisión se explican al elegir el programa. Se lee
  // la agenda real para conservar la fecha también en partidas de otro calendario.
  const review = state.agenda.filter(effect => effect.actionId === 'prestamo_internacional' && effect.target === 'CAJA' && effect.applyCondition && effect.start >= state.turn);
  for (const effect of review) deadlines.push({ id: effect.uid, label: 'Revisión fiscal del préstamo internacional', turns: effect.start - state.turn });
  return deadlines.sort((a, b) => a.turns - b.turns || a.id.localeCompare(b.id));
}

export function deadlineCaption(turns: number): string {
  return turns === 0 ? 'este cierre' : `en ${turns} ${turns === 1 ? 'turno' : 'turnos'}`;
}
