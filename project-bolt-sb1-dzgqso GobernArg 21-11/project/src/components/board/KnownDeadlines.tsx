import type { CausalState } from '@/engine/causal';
import { deadlineCaption, knownDeadlines } from '@/lib/lightGuidance';

/** Recordatorio discreto de compromisos conocidos; no revela demandas ocultas. */
export function KnownDeadlines({ state }: { state: CausalState }) {
  const deadlines = knownDeadlines(state);
  if (deadlines.length === 0) return null;
  return (
    <section aria-label="Vencimientos conocidos" className="text-[11px] leading-snug text-sala-muted">
      <h3 className="font-semibold text-ink mb-1">Vencimientos conocidos</h3>
      <ul className="space-y-1">
        {deadlines.slice(0, 2).map(deadline => <li key={deadline.id}>{deadline.label} · <b className="font-medium">{deadlineCaption(deadline.turns)}</b></li>)}
      </ul>
      {deadlines.length > 2 && <p className="mt-1">Y {deadlines.length - 2} vencimientos más.</p>}
    </section>
  );
}
