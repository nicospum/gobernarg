import type { CausalState } from '@/engine/causal';
import { pendingPolicies } from '@/lib/pendingPolicies';

/** Un recordatorio de decisiones anteriores, sin restaurar el panel detallado. */
export function PendingPolicies({ state }: { state: CausalState }) {
  const policies = pendingPolicies(state);
  if (policies.length === 0) return null;
  return (
    <section aria-label="Efectos en espera" className="rounded-md border border-rule bg-sunken/50 px-3 py-2 text-[12px]">
      <h3 className="font-bold text-ink mb-1">Efectos en espera</h3>
      <ul className="space-y-1 text-sala-muted">
        {policies.slice(0, 2).map(policy => (
          <li key={policy.id}>
            <span className="font-medium text-ink">{policy.name}</span> · {policy.closes === 1 ? 'próximo cierre' : `dentro de ${policy.closes} cierres`}{policy.conditional ? ', según condiciones' : ''}
          </li>
        ))}
      </ul>
      {policies.length > 2 && <p className="mt-1 text-sala-muted">Y {policies.length - 2} {policies.length === 3 ? 'decisión anterior más' : 'decisiones anteriores más'}.</p>}
    </section>
  );
}
