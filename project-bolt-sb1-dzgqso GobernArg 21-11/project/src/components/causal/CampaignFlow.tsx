import { useCallback, useState } from 'react';
import { CAMPAIGN_EVENTS, STRATEGIES } from '../../causal/campaignCatalog';
import { campaignActionReason } from '../../causal/campaign';
import { policyName, totalDebt } from '../../causal/selectors';
import { fmtPct, fmtScore, fmtMoney } from '../../causal/format';

const SEAT_LABEL: Record<string, string> = { oficialismo: 'Oficialismo', aliados: 'Aliados', oposicion: 'Oposición' };
import { IMAGES } from '../../utils/imageAssets';
import { Dialog } from './Dialog';
import { ObjectivesPanel, type CampaignProps } from './CivicPanels';

export function CampaignFlow({ state, onCommand, onRestart, onFeedback }: CampaignProps & { onRestart: () => void; onFeedback?: () => void }) {
  const noClose = useCallback(() => {}, []);
  // Registro de la partida (informes de cada cierre): no hay panel de historial en la Lite, pero el legado lo muestra.
  const [showLegacy, setShowLegacy] = useState(false);
  // Retirarse termina la partida: se confirma antes (igual que Reiniciar).
  const [confirmRetire, setConfirmRetire] = useState(false);
  const c = state.campaign;
  if (!c) return null;
  if (state.phase === 'ended' || state.phase === 'mandate_review') {
    const ended = state.phase === 'ended';
    const won = c.outcome === 'victory';
    const rating = Math.max(0, Math.min(10, (state.socialComponent * .5 + c.legitimacy * .2 + c.objectives.filter(o => o.completed).length / 3 * 30) / 10));
    return <Dialog title={ended ? 'Legado de tu gobierno' : 'Elecciones presidenciales'} onClose={noClose} dismissible={false}>
      <div className="relative h-48 rounded-xl overflow-hidden"><img src={won ? IMAGES.ui.shieldEmblemPremium : ended && c.outcome === 'defeat' ? IMAGES.events.socialProtest : IMAGES.events.electionDay} alt="Balance presidencial" className="w-full h-full object-cover" /><div className="absolute inset-0 bg-gradient-to-t from-[#102841] via-transparent to-transparent" /><h2 className="absolute bottom-4 left-5 text-2xl font-display font-bold">{ended ? won ? 'Un legado consolidado' : c.outcome === 'defeat' ? 'Fin del gobierno' : 'Una etapa concluida' : 'El país decide'}</h2></div>
      <p className="text-sm leading-6">{ended ? c.outcomeReason : `Completaste tu primer mandato. La proyección de voto es ${fmtPct(c.votes)}. Necesitás 45 % para ganar la reelección. Podés competir por un segundo y último mandato o retirarte.`}</p>
      {!ended && !confirmRetire && <div className="flex flex-wrap gap-3"><button className="causal-primary" onClick={() => onCommand('resolve_election')}>Presentarse a la reelección</button><button className="causal-secondary" onClick={() => setConfirmRetire(true)}>Retirarse de la presidencia</button></div>}
      {!ended && confirmRetire && <div className="rounded-xl border border-red-300/40 bg-red-300/10 p-4 space-y-3"><p className="text-sm font-semibold text-red-100">¿Retirarte de la presidencia?</p><p className="text-xs text-muted-foreground">La partida termina acá, con el balance de tu gestión. No se puede deshacer.</p><div className="flex flex-wrap gap-3"><button className="causal-secondary" onClick={() => setConfirmRetire(false)}>Volver</button><button className="causal-primary" onClick={() => onCommand('end_game')}>Sí, retirarme</button></div></div>}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">{[['Evaluación', `${fmtScore(rating)}/10`], ['Aprobación', fmtPct(c.approval)], ['Caja', fmtMoney(state.cash)], ['Deuda pendiente', fmtMoney(totalDebt(state))]].map(([label, value]) => <div key={label} className="rounded bg-background/50 border border-border p-3"><p className="text-xs text-muted-foreground">{label}</p><strong className="block mt-2">{value}</strong></div>)}</div>
      <ObjectivesPanel state={state} />
      <div className="grid sm:grid-cols-2 gap-3 text-sm"><div><h3 className="text-emerald-300 font-semibold">Fortalezas</h3><p className="text-xs mt-2">{c.approval >= 55 ? 'Resultados sociales valorados. ' : ''}{c.legitimacy >= 60 ? 'Garantías y confianza sostenidas. ' : ''}{c.objectives.filter(o => o.completed).length} objetivos cumplidos; {state.agreements.filter(a => a.status === 'fulfilled').length} acuerdos concretados.</p></div><div><h3 className="text-amber-200 font-semibold">Desafíos pendientes</h3><p className="text-xs mt-2">{c.objectives.filter(o => !o.completed).map(o => o.title).join(' · ') || 'Todos los objetivos cumplidos.'} {state.indicators.inflacion > 65 ? 'Presión inflacionaria elevada.' : ''}</p></div></div>
      <details className="text-sm"><summary className="cursor-pointer">Trayectoria electoral</summary>{c.elections.map(e => <p key={`${e.turn}:${e.kind}`} className="text-xs border-t border-border py-2 mt-2">T{e.turn} · {e.kind === 'legislative' ? 'Legislativas' : 'Presidenciales'} · {fmtPct(e.votes)} · {e.won ? 'Victoria' : 'Derrota'} · {e.ownSeats} bancas propias</p>)}</details>
      <button className="causal-secondary" onClick={() => setShowLegacy(!showLegacy)}>{showLegacy ? 'Ocultar informes de gestión' : 'Revisar informes de gestión'}</button>
      {showLegacy && [...state.reports].reverse().map(r => <details key={r.turn} className="text-xs border border-border p-3 rounded"><summary>T{r.turn} · Caja {fmtMoney(r.fiscal.closingCash)} · Componente social {fmtScore(r.socialComponent)}</summary><p className="mt-2">{r.messages.join(' ') || 'Cierre sin incidentes adicionales.'}</p><p className="mt-2">{r.executions.map(e => policyName(e.actionId)).join(', ') || 'Sin nuevas decisiones.'}</p></details>)}
      {ended && <div className="flex flex-wrap gap-3">{onFeedback && <button className="causal-secondary" onClick={onFeedback}>Contanos cómo te fue</button>}<button className="causal-primary" onClick={onRestart}>Nueva partida</button></div>}
    </Dialog>;
  }
  if (c.pendingEvent) {
    const event = CAMPAIGN_EVENTS.find(e => e.id === c.pendingEvent!.id)!;
    return <Dialog title={event.title} onClose={noClose} dismissible={false}><img src={IMAGES.events[event.image]} alt={event.title} className="w-full h-48 object-cover rounded-xl" /><p className="text-sm leading-6">{event.description}</p><p className="text-xs text-muted-foreground">Los efectos materiales se resuelven al próximo cierre. Esta decisión no consume agenda.</p>{event.choices.map(choice => {
      const reason = campaignActionReason(state, 'choose_event', event.id, choice.id);
      return <button key={choice.id} disabled={!!reason} className="block w-full text-left border border-border rounded-xl p-4 hover:border-sky-300 disabled:opacity-40" onClick={() => onCommand('choose_event', event.id, choice.id)}><strong className="text-sm">{choice.label} · {choice.cost ? fmtMoney(choice.cost) : 'sin costo'}</strong><span className="block mt-1 text-xs text-muted-foreground">{choice.description}{reason ? ` ${reason}` : ''}</span></button>;
    })}</Dialog>;
  }
  if (c.resultPending) {
    const result = c.elections[c.elections.length - 1];
    return <Dialog title={result?.kind === 'presidential' ? 'Resultado presidencial' : 'Resultado de las legislativas'} onClose={noClose} dismissible={false}><img src={IMAGES.events.electionDay} alt="Jornada electoral" className="w-full h-48 object-cover rounded-xl" />{result?.kind !== 'presidential' && <p className={`text-xs uppercase tracking-widest font-semibold ${result?.won ? 'text-emerald-300' : 'text-red-300'}`}>{result?.won ? 'Ganaste las legislativas' : 'Perdiste las legislativas'} · necesitabas 45 %</p>}<p className="text-4xl font-display font-bold text-amber-200">{result ? fmtPct(result.votes) : ''}<span className="text-sm text-muted-foreground font-sans font-normal"> de los votos</span></p><p className="text-sm">{result?.kind === 'presidential' ? 'Ganaste la reelección. Comienza el segundo y último mandato.' : 'Se renovó la mitad del Congreso. En el paso siguiente, este mismo turno, elegís cómo trabajar con esta composición.'}</p><div className="flex rounded overflow-hidden h-8" aria-label="Composición del Congreso">{Object.entries(c.seats).map(([id, seats], i) => <div key={id} style={{ width: `${seats}%`, background: ['#4eabdb', '#9a80c9', '#deae57'][i] }} title={`${SEAT_LABEL[id] ?? id}: ${seats} bancas`} />)}</div><p className="text-xs">Oficialismo {c.seats.oficialismo} · Aliados {c.seats.aliados} · Oposición {c.seats.oposicion}</p><button className="causal-primary" onClick={() => onCommand('acknowledge_result')}>{result?.kind === 'presidential' ? 'Comenzar segundo mandato' : 'Definir estrategia'}</button></Dialog>;
  }
  if (c.strategyPending) return <Dialog title="Estrategia postlegislativa" onClose={noClose} dismissible={false}><img src={IMAGES.backgrounds.congressInterior} alt="Recinto del Congreso" className="w-full h-40 object-cover rounded-xl" /><p className="text-sm">Elegí cómo encarar la segunda mitad del mandato.</p><div className="grid sm:grid-cols-2 gap-3">{Object.entries(STRATEGIES).map(([id, strategy]) => <button key={id} className="border border-border rounded-xl p-4 text-left hover:border-amber-200" onClick={() => onCommand('choose_strategy', id)}><strong className="font-display">{strategy.name}</strong><span className="block text-xs text-muted-foreground mt-2 leading-5">{strategy.description}</span></button>)}</div></Dialog>;
  return null;
}
