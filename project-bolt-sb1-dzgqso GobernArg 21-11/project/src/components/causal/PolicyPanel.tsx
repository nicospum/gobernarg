import { useCallback, useState } from 'react';
import { ArrowRight, LockKeyhole, Search } from 'lucide-react';
import { POLICIES } from '../../causal/catalog';
import { policyAvailability, policyEffectsPreview } from '../../causal/engine';
import { indicatorName, isProject } from '../../causal/selectors';
import type { CausalState, CommandParams, PolicyDefinition } from '../../causal/types';
import { Dialog } from './Dialog';
import { CATEGORY_VISUALS } from './visuals';

interface Props { state: CausalState; onExecute: (id: string, params?: CommandParams) => boolean }
const number = (n: number) => n.toLocaleString('es-AR', { maximumFractionDigits: 1 });
export function PolicyPanel({ state, onExecute }: Props) {
  const [category, setCategory] = useState('Economía');
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState<PolicyDefinition | null>(null);
  const close = useCallback(() => setSelected(null), []);
  const categories = ['Todas', ...new Set(POLICIES.filter(policy => policy.role === 'policy').map(policy => policy.category))];
  const policies = POLICIES.filter(policy => policy.role === 'policy' && (category === 'Todas' || policy.category === category)
    && `${policy.name} ${policy.description}`.toLocaleLowerCase('es').includes(query.toLocaleLowerCase('es')));
  return <section className="bg-card border border-border rounded-xl overflow-hidden">
    <div className="p-4 border-b border-border flex items-center justify-between gap-3"><h2 className="font-display text-lg font-bold uppercase tracking-wide">Políticas públicas</h2><span className="text-xs text-muted-foreground">{state.actionPoints} PA disponibles</span></div>
    <div className="p-3 flex flex-wrap gap-1.5" role="group" aria-label="Categorías de políticas">
      {categories.map(item => <button type="button" key={item} onClick={() => setCategory(item)} aria-pressed={item === category}
        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded text-xs ${category === item ? 'bg-primary text-white' : 'bg-white/5 text-muted-foreground hover:text-white'}`}>{CATEGORY_VISUALS[item] && <img src={CATEGORY_VISUALS[item].image} alt="" className="w-5 h-5 object-contain" />}{item}</button>)}
    </div>
    <label className="mx-4 mb-3 flex items-center gap-2 border border-border rounded px-3 py-2 text-muted-foreground"><Search size={15} /><input value={query} onChange={event => setQuery(event.target.value)} aria-label="Buscar políticas" placeholder="Buscar una política" className="min-w-0 w-full bg-transparent outline-none text-sm text-foreground" /></label>
    <p className="text-xs text-muted-foreground px-4 pb-3">Consultá los efectos y requisitos antes de confirmar. Los recursos se comprometen al ejecutar.</p>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 p-4 pt-0">
      {policies.map(policy => {
        const availability = policyAvailability(state, policy.id);
        const effects = policy.effects.filter(effect => effect.kind === 'indicator').slice(0, 2);
        const visual = CATEGORY_VISUALS[policy.category];
        const adverse = policy.effects.some(effect => effect.kind === 'indicator' && (effect.target === 'inflacion' ? effect.magnitude > 0 : effect.magnitude < 0));
        const relevant = policy.effects.some(effect => effect.kind === 'indicator' && (effect.target === 'inflacion' ? effect.magnitude < 0 && state.indicators.inflacion > 60 : effect.magnitude > 0 && state.indicators[effect.target] < 45));
        return <button type="button" key={policy.id} onClick={() => setSelected(policy)} style={{ borderLeftColor: visual?.color }} className="text-left rounded-lg border border-l-4 border-border bg-background/40 p-4 hover:border-primary focus-visible:outline focus-visible:outline-primary transition-colors">
          <div className="flex items-center gap-2 mb-3"><img src={visual?.image} alt="" className="w-9 h-9 object-contain rounded bg-white/10" /><span className="text-[10px] uppercase font-semibold tracking-wide" style={{ color: visual?.color }}>{policy.category}</span>{relevant && availability.allowed && <span className="ml-auto text-[10px] text-amber-200">★ Prioritaria</span>}</div>
          <div className="flex items-start justify-between gap-2"><h3 className="font-semibold text-sm leading-5">{policy.name}</h3>{!availability.allowed && <LockKeyhole className="shrink-0 text-muted-foreground" size={14} aria-label="Requiere condiciones" />}</div>
          <p className="text-xs text-muted-foreground mt-2 leading-5">{policy.description}</p>
          <div className="mt-3 flex flex-wrap gap-1.5">{effects.map(effect => <span key={effect.id} className="text-[11px] bg-primary/10 border border-primary/20 text-blue-200 px-2 py-1 rounded">{indicatorName(effect.target)}</span>)}</div>
          <div className="mt-3 flex justify-between gap-2 text-xs"><span className="text-muted-foreground">{availability.actionCost} PA · {number(availability.cashCost)} U</span><span className="text-blue-300 flex gap-1 items-center">Ver política <ArrowRight size={12} /></span></div>
          <p className={`mt-2 text-[10px] ${adverse ? 'text-amber-200' : 'text-emerald-300'}`}>{adverse ? 'Riesgo: incluye efectos adversos' : 'Riesgo: sin perjuicio directo previsto'}{availability.efficacy > 1 ? ` · Bonificación ${number((availability.efficacy - 1) * 100)}%` : ''}</p>
        </button>;
      })}
      {policies.length === 0 && <p className="text-sm text-muted-foreground py-6">No hay políticas que coincidan con la búsqueda.</p>}
    </div>
    {selected && <PolicyDetails key={selected.id} policy={selected} state={state} onExecute={onExecute} onClose={close} />}
  </section>;
}

function PolicyDetails({ state, policy, onExecute, onClose }: Props & { policy: PolicyDefinition; onClose: () => void }) {
  const [projectId, setProjectId] = useState(POLICIES.find(item => isProject(item.id))?.id ?? '');
  const [loanId, setLoanId] = useState(state.loans.find(loan => loan.outstanding > 0 && !loan.restructured)?.id ?? '');
  const params = policy.id === 'estudio_factibilidad' ? { projectId } : policy.id === 'reestructurar_deuda' ? { loanId } : {};
  const available = policyAvailability(state, policy.id, params);
  const effects = policyEffectsPreview(state, policy, params);
  const financial = policy.effects.filter(effect => effect.kind === 'ledger' && effect.start > 0);
  const loan = policy.effects.find(effect => effect.kind === 'loan' && effect.operation === 'originate');
  return <Dialog title={policy.name} onClose={onClose}>
    <p className="text-sm text-muted-foreground leading-6">{policy.description} {policy.strategy}</p>
    {policy.id === 'estudio_factibilidad' && <label className="block text-sm">Obra a estudiar<select value={projectId} onChange={event => setProjectId(event.target.value)} className="causal-select mt-2" aria-label="Obra a estudiar">{POLICIES.filter(item => isProject(item.id)).map(item => <option key={item.id} value={item.id}>{item.name}</option>)}</select><span className="block text-xs text-muted-foreground mt-2">Se habilita el turno siguiente, dura 6 turnos y se consume al iniciar esta obra.</span></label>}
    {policy.id === 'reestructurar_deuda' && <label className="block text-sm">Contrato a reperfilar<select value={loanId} onChange={event => setLoanId(event.target.value)} className="causal-select mt-2">{state.loans.filter(item => item.outstanding > 0).map(item => <option key={item.id} value={item.id}>{item.type === 'external' ? 'Externo' : 'Local'} · {number(item.outstanding)} U · vence T{item.dueTurn}</option>)}</select></label>}
    <div className="grid grid-cols-3 gap-3 text-sm bg-background/50 border border-border rounded-lg p-3"><div><div className="text-xs text-muted-foreground">Agenda</div>{available.actionCost} PA</div><div><div className="text-xs text-muted-foreground">Desembolso inicial</div>{number(available.cashCost)} U</div><div><div className="text-xs text-muted-foreground">Próximo uso</div>T{state.turn + policy.cooldown}</div></div>
    {policy.id === 'emitir_dinero' && <p className="p-3 rounded bg-amber-400/10 text-amber-200 text-sm">Acredita 300 U ahora. La presión inflacionaria depende de cuántas veces emitiste en los últimos 5 turnos, incluido este uso.</p>}
    {loan && <p className="p-3 rounded bg-blue-400/10 text-blue-200 text-sm">Acredita {number(loan.magnitude)} U y registra una deuda por el mismo monto. {loan.explanation}</p>}
    {effects.length > 0 && <div><h3 className="font-semibold text-sm mb-2">Resultados previstos</h3><div className="space-y-2">{effects.map(effect => <div key={effect.id} className="border border-border rounded p-3 text-sm flex justify-between gap-4"><div><strong className="font-medium">{indicatorName(effect.target)}</strong><p className="text-xs text-muted-foreground mt-1">Desde T{effect.begins} · {effect.timing}</p>{effect.conditions.length > 0 && <p className="text-xs text-muted-foreground mt-1">Depende del contexto actual; el valor se fija al confirmar.</p>}</div><span className="font-mono shrink-0">{effect.capturedMagnitude > 0 ? '+' : ''}{number(effect.capturedMagnitude)}</span></div>)}</div></div>}
    {financial.length > 0 && <div><h3 className="font-semibold text-sm mb-2">Compromisos fiscales</h3>{financial.map(effect => <p key={effect.id} className="text-sm text-muted-foreground leading-6">{effect.target === 'revenue_recurring' ? 'Recaudación' : 'Gasto'} {effect.magnitude > 0 ? '+' : ''}{number(effect.magnitude)} U desde T{state.turn + effect.start}{effect.duration ? ` durante ${effect.duration} turnos` : ', de forma recurrente'}.</p>)}</div>}
    {available.efficacy !== 1 && <p className="text-sm text-amber-200">La cooperación o fricción de los actores lleva la eficacia de los beneficios al {number(available.efficacy * 100)}%. Los costos se mantienen.</p>}
    {policy.requirements.some(rule => rule.kind === 'legislative') && <p className="text-xs text-muted-foreground">Negociá esta ley con oficialismo, aliados u oposición desde Actores. Un acuerdo sobre otra ley no cuenta.</p>}
    {!available.allowed && <ul className="bg-amber-300/5 border border-amber-300/20 rounded p-3 space-y-1 text-sm text-amber-100" aria-label="Requisitos pendientes">{available.reasons.map(reason => <li key={reason}>{reason}</li>)}</ul>}
    <button type="button" disabled={!available.allowed} className="causal-primary w-full" onClick={() => { if (onExecute(policy.id, params)) onClose(); }}>Confirmar ejecución</button>
    <p className="text-xs text-muted-foreground">Los actores evalúan los resultados al cierre. Esta política no compra satisfacción ni votos.</p>
    {policy.sourceIds.length > 1 && <p className="text-xs text-muted-foreground">Este programa reúne instrumentos afines en una sola decisión.</p>}
  </Dialog>;
}
