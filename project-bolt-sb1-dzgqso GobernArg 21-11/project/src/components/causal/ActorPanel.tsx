import { useCallback, useState } from 'react';
import { ChevronRight, Handshake, Users } from 'lucide-react';
import { ACTORS, POLICIES } from '../../causal/catalog';
import { policyAvailability } from '../../causal/engine';
import { AGREEMENT_LABELS, agreementDescription, templatesForActor } from '../../causal/interactions';
import { actorById, hasRecentMeeting, indicatorName, isBill, isProject, policyName } from '../../causal/selectors';
import type { ActorId, AgreementTemplate, CausalState, CommandParams, IndicatorId } from '../../causal/types';
import { Dialog } from './Dialog';
import { actorPortrait } from './visuals';

interface Props { state: CausalState; onExecute: (id: string, params?: CommandParams) => boolean; previewTargets?: IndicatorId[] }
export function ActorPanel({ state, onExecute, previewTargets = [] }: Props) {
  const [selected, setSelected] = useState<ActorId | null>(null);
  const close = useCallback(() => setSelected(null), []);
  return <section className="b-actors-panel bg-card border border-border rounded-xl overflow-hidden">
    <div className="p-4 border-b border-border flex items-center gap-2"><Users size={17} className="text-blue-300" /><h2 className="font-display font-bold text-lg uppercase tracking-wide">Factores de poder</h2></div>
    <p className="text-xs text-muted-foreground px-4 py-3">Satisfacción con los resultados y relación política son dos cosas distintas.</p>
    <div className="max-h-[720px] overflow-y-auto divide-y divide-border">
      {ACTORS.map(actor => {
        const status = state.actors[actor.id];
        const relevant = actor.sensitivities.some(item => previewTargets.includes(item.indicatorId));
        return <button type="button" key={actor.id} onClick={() => setSelected(actor.id)} className={`b-actor-card ${relevant ? 'b-actor-relevant' : ''} w-full text-left p-3 px-4 hover:bg-white/5 transition-colors`}>
          <div className="flex items-center gap-3"><img src={actorPortrait(actor.id)} alt="" className="w-10 h-10 rounded-lg object-cover bg-white/10" /><span className="text-sm font-medium flex-1">{actor.name}</span><ChevronRight size={13} className="text-muted-foreground shrink-0" /></div>
          <p className="b-actor-channel">{actor.channel.name}</p><div className="b-actor-metrics flex gap-3 mt-2 text-[11px]"><span className={status.satisfaction < 35 ? 'text-amber-200' : 'text-muted-foreground'}>Satisfacción <strong className="text-foreground">{status.satisfaction.toFixed(0)}</strong><span className="b-meter"><span style={{ width: `${status.satisfaction}%`, background: status.satisfaction < 35 ? '#fbbf24' : '#34d399' }} /></span></span><span className="text-muted-foreground">Relación <strong className="text-foreground">{status.relationship.toFixed(0)}</strong><span className="b-meter"><span style={{ width: `${status.relationship}%` }} /></span></span>
            {status.conflict && <span className="text-red-300">Conflicto</span>}{status.cooperation && <span className="text-emerald-300">Cooperación</span>}</div><p className="b-actor-footnote">{relevant ? 'La política toca indicadores que este actor valora.' : hasRecentMeeting(state, actor.id) ? 'Prioridades reveladas · Abrir negociación' : 'Sin reunión vigente · Abrir audiencia'}</p>
        </button>;
      })}
    </div>
    {selected && <ActorDetails key={selected} actorId={selected} state={state} onExecute={onExecute} onClose={close} />}
  </section>;
}

function ActorDetails({ actorId, state, onExecute, onClose }: Props & { actorId: ActorId; onClose: () => void }) {
  const actor = actorById(actorId)!;
  const status = state.actors[actorId];
  const [templateId, setTemplateId] = useState<AgreementTemplate>(actor.family === 'Política' ? templatesForActor(actorId)[1] ?? 'resultado' : 'resultado');
  const [indicatorId, setIndicatorId] = useState<IndicatorId | undefined>(status.meeting?.priorities[0]?.indicatorId);
  const [billId, setBillId] = useState(POLICIES.find(policy => isBill(policy.id))?.id ?? '');
  const [projectId, setProjectId] = useState(POLICIES.find(policy => isProject(policy.id))?.id ?? '');
  const [loanId, setLoanId] = useState(state.loans.find(loan => loan.outstanding > 0 && !loan.restructured)?.id ?? '');
  const selectedIndicator = indicatorId ?? status.meeting?.priorities[0]?.indicatorId;
  const params = { actorId, templateId, indicatorId: selectedIndicator, billId, projectId, loanId };
  const meeting = policyAvailability(state, 'reunirse', { actorId });
  const negotiation = policyAvailability(state, 'negociar', params);
  const offer = state.offers.find(item => item.actorId === actorId && !item.accepted && item.expiresExclusive > state.turn);
  const agreements = state.agreements.filter(item => item.actorId === actorId);
  const signing = policyAvailability(state, 'firmar_acuerdo', { actorId, offerId: offer?.id });
  const report = state.reports[state.reports.length - 1]?.actors.find(item => item.id === actorId);
  return <Dialog title={actor.name} onClose={onClose}>
    <img src={actorPortrait(actor.id)} alt={actor.name} className="w-20 h-20 rounded-xl object-cover border border-border" />
    <div className="grid grid-cols-2 gap-3"><div className="rounded-lg bg-background/50 border border-border p-4"><span className="text-xs text-muted-foreground">Satisfacción</span><div className="font-display text-3xl mt-1">{status.satisfaction.toFixed(1)}<span className="text-sm text-muted-foreground"> /100</span></div><p className="text-xs text-muted-foreground mt-2">Cómo evalúa los resultados que le importan.</p></div><div className="rounded-lg bg-background/50 border border-border p-4"><span className="text-xs text-muted-foreground">Relación / confianza</span><div className="font-display text-3xl mt-1">{status.relationship.toFixed(0)}<span className="text-sm text-muted-foreground"> /100</span></div><p className="text-xs text-muted-foreground mt-2">Cambia al cumplir o incumplir compromisos.</p></div></div>
    <div className="text-sm"><p><strong className="font-medium">Poder:</strong> {actor.channel.name}.</p><p className="text-xs text-muted-foreground mt-2">Presión {actor.influence}/10 · Peso electoral {actor.electoralWeight}/10 · Dificultad de relación {actor.interactionDifficulty}/10</p>{actor.electoralWeight === 0 && <p className="text-xs text-muted-foreground mt-2">Participa en gobernabilidad. Su satisfacción no se suma como votos al gobierno.</p>}</div>
    {status.conflict && <p className="text-sm bg-red-400/10 text-red-200 p-3 rounded">Su canal de presión está activo. Los efectos se aplican con un turno de demora.</p>}
    <section className="border border-border rounded-lg p-4 space-y-3"><h3 className="font-semibold text-sm flex items-center gap-2"><Handshake size={16} /> Reunión e información</h3>
      <p className="text-xs text-muted-foreground">Una reunión revela prioridades y habilita negociación durante 4 turnos. No agrega puntos de satisfacción ni relación.</p>
      {status.meeting ? <div className="text-sm"><p className="text-xs text-blue-200 mb-2">Informe de T{status.meeting.turn} · {hasRecentMeeting(state, actorId) ? `vigente hasta T${status.meeting.turn + 3}` : 'vencido; necesitás una nueva reunión'}</p>{status.meeting.priorities.map(item => <div key={item.indicatorId} className="py-2 border-t border-border"><span>{indicatorName(item.indicatorId)}</span><span className="float-right font-mono">{item.value.toFixed(1)}</span><p className="text-xs text-muted-foreground mt-1">Prioridad {Math.abs(item.weight)}/10 · {item.weight < 0 ? 'busca reducir este indicador' : 'busca mejorar este indicador'} · cambio reciente {item.trend > 0 ? '+' : ''}{item.trend.toFixed(1)}</p></div>)}</div> : <p className="text-sm text-muted-foreground">Todavía no te reuniste con este actor.</p>}
      <button type="button" className="causal-primary" disabled={!meeting.allowed} onClick={() => onExecute('reunirse', { actorId })}>Reunirse · {meeting.actionCost} {meeting.actionCost === 1 ? 'acción' : 'acciones'} · {meeting.cashCost} U</button>
      {!meeting.allowed && <p className="text-xs text-muted-foreground">{meeting.reasons.join(' ')}</p>}
    </section>
    <section className="border border-border rounded-lg p-4 space-y-3"><h3 className="font-semibold text-sm">Negociación</h3>
      <label className="block text-xs text-muted-foreground">Tipo de compromiso<select aria-label="Tipo de compromiso" className="causal-select mt-1" value={templateId} onChange={event => setTemplateId(event.target.value as AgreementTemplate)}>{templatesForActor(actorId).map(template => <option key={template} value={template}>{AGREEMENT_LABELS[template]}</option>)}</select></label>
      {templateId === 'resultado' && <label className="block text-xs text-muted-foreground">Resultado prioritario<select aria-label="Resultado prioritario" className="causal-select mt-1" value={selectedIndicator ?? ''} onChange={event => setIndicatorId(event.target.value as IndicatorId)}><option value="">Elegí una prioridad revelada</option>{status.meeting?.priorities.map(item => <option key={item.indicatorId} value={item.indicatorId}>{indicatorName(item.indicatorId)}</option>)}</select></label>}
      {(templateId === 'coalicion' || templateId === 'acuerdo_ley') && <label className="block text-xs text-muted-foreground">Ley a negociar<select className="causal-select mt-1" value={billId} onChange={event => setBillId(event.target.value)}>{POLICIES.filter(policy => isBill(policy.id)).map(policy => <option value={policy.id} key={policy.id}>{policy.name}</option>)}</select></label>}
      {templateId === 'pacto_federal' && <label className="block text-xs text-muted-foreground">Obra del convenio<select className="causal-select mt-1" value={projectId} onChange={event => setProjectId(event.target.value)}>{POLICIES.filter(policy => isProject(policy.id)).map(policy => <option value={policy.id} key={policy.id}>{policy.name}</option>)}</select></label>}
      {templateId === 'reperfilamiento' && <label className="block text-xs text-muted-foreground">Contrato<select className="causal-select mt-1" value={loanId} onChange={event => setLoanId(event.target.value)}><option value="">Elegí un préstamo</option>{state.loans.filter(loan => loan.outstanding > 0).map(loan => <option key={loan.id} value={loan.id}>{loan.type === 'external' ? 'Externo' : 'Local'} · {loan.outstanding} U · vence T{loan.dueTurn}</option>)}</select></label>}
      <button type="button" className="causal-secondary" disabled={!negotiation.allowed} onClick={() => onExecute('negociar', params)}>Negociar · 1 acción · {negotiation.cashCost} U</button>
      {!negotiation.allowed && <p className="text-xs text-muted-foreground">{negotiation.reasons.join(' ')}</p>}
      {offer && <div className="border border-blue-400/30 bg-blue-400/5 rounded p-3 space-y-2"><p className="text-sm font-medium">Oferta vigente hasta T{offer.expiresExclusive - 1}</p><p className="text-xs text-muted-foreground">{agreementDescription(offer)}</p>{offer.billId && <p className="text-xs">Ley: {policyName(offer.billId)}</p>}<button type="button" className="causal-primary" disabled={!signing.allowed} onClick={() => onExecute('firmar_acuerdo', { actorId, offerId: offer.id })}>Firmar compromiso · 1 acción</button>{!signing.allowed && <p className="text-xs text-amber-200">{signing.reasons.join(' ')}</p>}</div>}
    </section>
    {agreements.length > 0 && <section><h3 className="text-sm font-semibold mb-2">Compromisos</h3>{agreements.map(agreement => <div key={agreement.id} className="border border-border rounded p-3 mb-2 text-sm"><div className="flex justify-between gap-3"><span>{AGREEMENT_LABELS[agreement.templateId]}</span><span className={agreement.status === 'broken' ? 'text-red-300' : 'text-blue-200'}>{agreement.status === 'pending' ? `Plazo: T${agreement.deadline}` : agreement.status === 'fulfilled' ? 'Cumplido' : 'Incumplido'}</span></div><p className="text-xs text-muted-foreground mt-2">{agreementDescription(agreement)}</p>{agreement.indicatorId && <p className="text-xs mt-2">Valor al firmar: {agreement.baseline.toFixed(1)}. Objetivo: {(agreement.baseline + agreement.delta).toFixed(1)}.</p>}</div>)}</section>}
    {report && <p className="text-xs text-muted-foreground">Último cierre: satisfacción {report.before.toFixed(1)} → {report.after.toFixed(1)}. Según cómo les va, tendería a {report.target.toFixed(1)}; se acerca de a poco, turno a turno.</p>}
  </Dialog>;
}
