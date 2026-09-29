import { useCallback, useEffect, useRef, useState } from 'react';
import { ArrowRight, BarChart3, BookOpen, Briefcase, Clock3, History, Info, Landmark, LayoutGrid, MoreHorizontal, NotebookPen, RefreshCw, Users, Wallet, CalendarClock } from 'lucide-react';
import { INDICATORS, TURNS_PER_TERM } from '../../causal/catalog';
import { fiscalForecast } from '../../causal/finance';
import { indicatorName, policyName, totalArrears, totalDebt } from '../../causal/selectors';
import type { CausalState, CommandParams, IndicatorId, TurnReport } from '../../causal/types';
import { fmtNum, fmtScore, fmtSigned, fmtU } from '../../causal/format';
import { useIsMobile } from '../../lib/useMediaQuery';
import { IMAGES } from '../../utils/imageAssets';
import { PolicyPanel } from './PolicyPanel';
import { ActorPanel } from './ActorPanel';
import { Dialog } from './Dialog';
import { GovernmentPanel, type CampaignDispatch } from './GovernmentPanel';
import { AxesPanel, ManagementNotebook, ObjectivesPanel, PoliticalSidebar, PoliticalStatus, ProjectReports } from './CivicPanels';
import { CampaignFlow } from './CampaignFlow';
import { HowToPlay, TutorialCard, useTutorial } from './Tutorial';
import { campaignBlock } from '../../causal/campaign';
import { getScenario } from '../../causal/scenarios';

interface Props {
  state: CausalState; savingError: string | null;
  onExecute: (id: string, params?: CommandParams) => boolean;
  onCommand: CampaignDispatch; onRestart: () => void;
}
/** Hitos del mandato (turno dentro del mandato): legislativas y elección presidencial. */
const MILESTONES: Record<number, string> = { 8: 'Legislativas', 16: 'Elección presidencial' };
const acciones = (n: number) => `${n} ${n === 1 ? 'acción' : 'acciones'}`;

/** Línea de tiempo del mandato (traída de la versión A, con los colores de esta versión). */
function MandateTimeline({ inTerm, wide = false }: { inTerm: number; wide?: boolean }) {
  return <div className="flex items-center gap-[3px] mt-1" role="img" aria-label={`Turno ${inTerm} de ${TURNS_PER_TERM} del mandato`}>
    {Array.from({ length: TURNS_PER_TERM }, (_, i) => i + 1).map(n => <span key={n} title={MILESTONES[n] ? `T${n}: ${MILESTONES[n]}` : `T${n}`}
      className={`h-1.5 ${wide ? 'flex-1' : 'w-2'} rounded-[1px] ${n === inTerm ? 'bg-blue-300' : n < inTerm ? 'bg-blue-300/40' : MILESTONES[n] ? 'bg-amber-300/70' : 'bg-white/15'}`} />)}
  </div>;
}

/** Hay un modal de campaña (evento, elección, estrategia, balance) delante del tablero. */
function campaignModalOpen(state: CausalState): boolean {
  const c = state.campaign;
  if (!c) return state.phase === 'mandate_review' || state.phase === 'ended';
  return state.phase === 'ended' || state.phase === 'mandate_review' || !!c.pendingEvent || !!c.resultPending || !!c.strategyPending;
}

type MobileTab = 'acciones' | 'pais' | 'actores' | 'gabinete';
const TABS: { id: MobileTab; label: string; icon: typeof LayoutGrid }[] = [
  { id: 'acciones', label: 'Acciones', icon: LayoutGrid },
  { id: 'pais', label: 'País', icon: BarChart3 },
  { id: 'actores', label: 'Actores', icon: Users },
  { id: 'gabinete', label: 'Gabinete', icon: Briefcase },
];

export function CausalDashboard({ state, onExecute, onCommand, onRestart, savingError }: Props) {
  const [indicator, setIndicator] = useState<IndicatorId | null>(null);
  const [history, setHistory] = useState(false);
  const [restart, setRestart] = useState(false);
  const [review, setReview] = useState<TurnReport | null>(null);
  const [notebook, setNotebook] = useState(false);
  const [menu, setMenu] = useState(false);
  const [help, setHelp] = useState(false);
  const [tab, setTab] = useState<MobileTab>('acciones');
  const isMobile = useIsMobile();
  const tutorial = useTutorial();
  const closeNotebook = useCallback(() => setNotebook(false), []);
  const closeIndicator = useCallback(() => setIndicator(null), []);
  const closeHistory = useCallback(() => setHistory(false), []);
  const closeRestart = useCallback(() => setRestart(false), []);
  const closeReview = useCallback(() => setReview(null), []);
  const closeMenu = useCallback(() => setMenu(false), []);
  const closeHelp = useCallback(() => setHelp(false), []);
  const inTerm = (state.turn - 1) % TURNS_PER_TERM + 1;
  const forecasts = fiscalForecast(state);
  const lastReport = state.reports[state.reports.length - 1];
  const selectedIndicator = INDICATORS.find(item => item.id === indicator);
  const campaignOpen = campaignModalOpen(state);
  const nextMilestone = Object.keys(MILESTONES).map(Number).find(t => t >= inTerm);

  // Resumen automático al cerrar cada turno (antes había que buscar "Ver cierre").
  // Si el cierre trae un evento o una elección, el resumen aparece al resolverlos.
  const reportCount = useRef(state.reports.length);
  useEffect(() => {
    if (state.reports.length > reportCount.current) setReview(state.reports[state.reports.length - 1]);
    reportCount.current = state.reports.length;
  }, [state.reports]);

  // "Cerrar turno": sin foco en el botón, un Enter posterior no cierra otro turno.
  const canClose = state.phase === 'governing' && !campaignBlock(state) && !review;
  const closeTurn = (button: HTMLButtonElement) => { button.blur(); if (canClose) onCommand('close_turn'); };

  const showTutorial = !tutorial.dismissed && state.term === 1 && state.turn === 1 && state.reports.length === 0;
  const tutorialCard = showTutorial && <TutorialCard onDismiss={tutorial.dismiss} onOpenGuide={() => setHelp(true)} />;

  const menuItems: [string, typeof History, () => void, boolean?][] = [
    ['Cuaderno de gestión', NotebookPen, () => setNotebook(true)],
    ['Historial de gobierno', History, () => setHistory(true)],
    ['Cómo se juega', BookOpen, () => setHelp(true)],
    ['Reiniciar partida…', RefreshCw, () => setRestart(true), true],
  ];

  const hero = <section className="relative overflow-hidden rounded-2xl border border-sky-200/25 min-h-44 md:min-h-52"><img src={IMAGES.backgrounds.casaRosadaSunset} alt="Casa Rosada al atardecer" className="absolute inset-0 h-full w-full object-cover object-center" /><div className="absolute inset-0 bg-gradient-to-r from-[#0a2340]/95 via-[#0a2340]/55 to-transparent" /><div className="relative z-10 p-6 md:p-8 max-w-xl"><p className="text-[10px] uppercase tracking-[.25em] text-amber-200">República Argentina · Presidencia de la Nación</p><h2 className="font-display text-3xl font-bold mt-2">Gobernar es construir futuro</h2><p className="text-sm text-blue-100 mt-2">Decisiones, acuerdos y resultados que dejan huella.</p><button className="causal-secondary mt-3" onClick={() => setNotebook(true)}>Abrir cuaderno de gestión</button></div></section>;
  const savingAlert = savingError && <p role="alert" className="text-sm border border-amber-400/30 bg-amber-400/10 p-3 rounded text-amber-100">{savingError}</p>;
  const country = <>
    <div className="flex flex-wrap gap-3 items-center justify-between"><div><h2 className="font-display text-lg font-bold">Estado del país</h2><p className="text-xs text-muted-foreground mt-1">Los resultados cambian al cerrar el trimestre. Tocá un indicador para ver sus causas.</p></div><button type="button" className="causal-secondary flex gap-2 items-center" onClick={() => setHistory(true)}><History size={14} /> Historial de gobierno</button></div>
    <section aria-label="Indicadores del país" className="grid grid-cols-2 sm:grid-cols-4 xl:grid-cols-7 gap-2">
      {INDICATORS.map(item => {
        const value = state.indicators[item.id], delta = value - state.previousIndicators[item.id];
        const positive = item.id === 'inflacion' ? delta < 0 : delta > 0;
        return <button type="button" key={item.id} onClick={() => setIndicator(item.id)} className="bg-card border border-border rounded-lg p-3 text-left hover:border-primary transition-colors">
          <span className="text-[11px] text-muted-foreground block min-h-8 leading-4">{item.name}</span>
          <div className="flex justify-between items-baseline gap-2 mt-2"><strong className="font-mono text-xl">{fmtScore(value)}</strong><span className={`text-[10px] ${delta === 0 ? 'text-muted-foreground' : positive ? 'text-emerald-300' : 'text-amber-200'}`}>{fmtSigned(delta)}</span></div>
          <div className="bg-white/5 h-1 rounded mt-2 overflow-hidden"><div className="h-full bg-primary rounded" style={{ width: `${value}%` }} /></div>
        </button>;
      })}
    </section>
    {lastReport && <div className="bg-card border border-border rounded-lg px-4 py-3 flex items-center justify-between gap-3"><div><p className="text-sm">Turno {lastReport.turn} cerrado · Caja {fmtU(lastReport.fiscal.closingCash)}</p><p className="text-xs text-muted-foreground mt-1">{lastReport.messages[0] ?? 'Los actores evaluaron los resultados y se actualizaron los compromisos.'}</p></div><button type="button" className="causal-secondary shrink-0" onClick={() => setReview(lastReport)}>Ver cierre</button></div>}
    {totalArrears(state) > 0 && <div role="alert" className="border border-red-300/30 bg-red-300/10 text-red-100 rounded-lg p-4 text-sm">{state.crisisTurns >= 2 ? 'Crisis fiscal' : 'Obligaciones pendientes'}: {fmtU(totalArrears(state))}. Se restringe el gasto discrecional. Podés financiar la caja o negociar los vencimientos.</div>}
  </>;
  const futureEffects = <section className="bg-card border border-border rounded-xl p-4"><h2 className="font-display font-bold flex items-center gap-2"><CalendarClock size={17} className="text-blue-300" /> Efectos y compromisos futuros</h2>
    {state.effects.length === 0 ? <p className="text-xs text-muted-foreground mt-3">Las políticas que ejecutes dejarán aquí sus efectos programados y gastos recurrentes.</p> : <div className="max-h-80 overflow-y-auto mt-3 space-y-2">{state.effects.map(effect => <div key={effect.id} className="flex justify-between gap-3 border-b border-border py-2 text-xs"><div><p className="text-sm">{policyName(effect.actionId)}</p><p className="text-muted-foreground mt-1">{effect.kind === 'indicator' ? indicatorName(effect.target) : effect.target === 'expense_recurring' ? 'Gasto recurrente' : 'Recaudación recurrente'} · {effect.operation === 'offset' ? 'beneficio temporal' : effect.operation === 'per_turn' ? 'variación por turno' : effect.operation === 'pulse' ? 'cambio de nivel' : 'flujo fiscal'}</p></div><div className="text-right shrink-0"><strong className="font-mono">{effect.kind === 'ledger' ? `${effect.magnitude > 0 ? '+' : ''}${fmtU(effect.magnitude)}` : fmtSigned(effect.magnitude)}</strong><p className="text-muted-foreground mt-1">T{effect.startTurn}{effect.endExclusive === null ? ' en adelante' : effect.endExclusive - 1 > effect.startTurn ? `–T${effect.endExclusive - 1}` : ''}</p></div></div>)}</div>}
  </section>;
  const cashAndDebt = <section className="bg-card border border-border rounded-xl p-4"><h2 className="font-display font-bold flex items-center gap-2"><Wallet size={17} className="text-blue-300" /> Caja y deuda</h2><div className="grid grid-cols-3 gap-3 mt-4 text-sm"><div><span className="text-xs text-muted-foreground block">Caja</span>{fmtU(state.cash)}</div><div><span className="text-xs text-muted-foreground block">Deuda pendiente</span>{fmtU(totalDebt(state))}</div><div><span className="text-xs text-muted-foreground block">Margen fiscal</span>{fmtScore(state.indicators.fiscal)}/100</div></div>
    {state.loans.length > 0 && <div className="space-y-2 mt-4">{state.loans.map(loan => <div key={loan.id} className="border border-border p-3 rounded text-xs"><p className="text-sm">Préstamo {loan.type === 'external' ? 'externo' : 'local'} · {loan.outstanding > 0 ? `${fmtU(loan.outstanding)} pendientes` : 'Cancelado'}</p><p className="text-muted-foreground mt-1">Vencimiento T{loan.dueTurn} · Interés {fmtU(loan.interest)}/turno{loan.restructured ? ' · Reperfilado' : ''}{loan.pendingInterest ? ` · Desde T${loan.pendingInterest.startTurn}: ${fmtU(loan.pendingInterest.amount)}/turno` : ''}</p></div>)}</div>}
    <h3 className="text-sm font-semibold mt-5 mb-2">Proyección de obligaciones</h3><div className="overflow-x-auto"><table className="w-full text-xs text-right"><thead className="text-muted-foreground"><tr><th className="text-left py-2">Turno</th><th>Ingresos</th><th>Gastos</th><th>Deuda a pagar</th><th>Caja prevista</th></tr></thead><tbody>{forecasts.map(point => <tr key={point.turn} className="border-t border-border"><td className="text-left py-2">T{point.turn}</td><td>{fmtNum(point.income)}</td><td>{fmtNum(point.expense)}</td><td>{fmtNum(point.interest + point.principal)}</td><td className={point.cash < 0 ? 'text-red-300' : ''}>{fmtNum(point.cash)}</td></tr>)}</tbody></table></div><p className="text-[11px] text-muted-foreground mt-2">Unidades de juego. Proyección con actividad actual y compromisos conocidos; no incluye nuevas políticas.</p>
  </section>;
  const governability = <section className="bg-card border border-border rounded-xl p-4"><h2 className="font-display font-bold flex items-center gap-2"><Landmark size={17} className="text-blue-300" /> Gobernabilidad</h2><p className="text-xs text-muted-foreground mt-2">{state.campaign?.seats.oficialismo ?? 40} bancas propias, {state.campaign?.seats.aliados ?? 15} aliadas y {state.campaign?.seats.oposicion ?? 45} opositoras. El apoyo se calcula para cada ley.</p><div className="space-y-2 mt-3">{Object.entries(state.legislativeSupport).map(([id, support]) => <div key={id} className="flex justify-between text-xs gap-3 border-t border-border pt-2"><span>{policyName(id)}</span><span className={`font-mono shrink-0 ${support >= 51 ? 'text-emerald-300' : 'text-muted-foreground'}`}>{fmtScore(support)} / 51</span></div>)}</div></section>;
  const socialComponent = <section className="bg-primary/10 border border-primary/25 rounded-xl p-4"><h2 className="text-sm font-semibold">Componente electoral social</h2><p className="text-3xl font-display font-bold mt-2">{fmtScore(state.socialComponent)}<span className="text-sm text-muted-foreground"> /100</span></p><p className="text-xs text-muted-foreground mt-2 leading-5">Resume satisfacción y peso de los actores sociales. Es una parte del sistema electoral; no es un porcentaje de votos ni garantiza una victoria.</p></section>;

  const overlays = <>
    {notebook && <ManagementNotebook state={state} onClose={closeNotebook} />}
    <CampaignFlow state={state} onCommand={onCommand} onRestart={onRestart} />
    {selectedIndicator && <Dialog title={selectedIndicator.name} onClose={closeIndicator}><p className="text-sm leading-6">{selectedIndicator.description}</p><div className="grid grid-cols-2 gap-3 text-sm"><p className="bg-background/50 p-3 rounded">Alto: {selectedIndicator.high}</p><p className="bg-background/50 p-3 rounded">Bajo: {selectedIndicator.low}</p></div>{lastReport?.indicators.filter(trace => trace.id === indicator).map(trace => <div key={trace.id}><h3 className="text-sm font-semibold mb-3">Último cierre: {fmtScore(trace.before)} → {fmtScore(trace.after)}</h3>{trace.contributions.map((contribution, index) => <p key={`${contribution.sourceId}:${index}`} className="flex justify-between gap-3 text-sm py-2 border-b border-border"><span>{contribution.label}</span><span className="font-mono shrink-0">{fmtSigned(contribution.amount)}</span></p>)}</div>)}</Dialog>}
    {history && <Dialog title="Historial de gobierno" onClose={closeHistory}>{state.reports.length === 0 ? <p className="text-sm text-muted-foreground">Todavía no cerraste un turno.</p> : [...state.reports].reverse().map(report => <button type="button" key={report.turn} className="w-full text-left border border-border rounded p-3 hover:border-primary" onClick={() => { setHistory(false); setReview(report); }}><strong className="text-sm">Turno {report.turn} · Mandato {report.term}</strong><p className="text-xs text-muted-foreground mt-1">{report.executions.map(execution => policyName(execution.actionId)).join(', ') || 'Sin nuevas políticas'} · Caja {fmtU(report.fiscal.closingCash)}</p></button>)}</Dialog>}
    {review && !campaignOpen && <Dialog title={`Cierre del turno ${review.turn}`} onClose={closeReview}><ReportContent report={review} /><button type="button" className="causal-primary w-full" onClick={closeReview}>Seguir gobernando</button></Dialog>}
    {menu && <Dialog title="Menú" onClose={closeMenu}><div className="flex flex-col">{menuItems.map(([label, Icon, action, danger]) => <button key={label} type="button" className={`flex items-center gap-3 min-h-[52px] px-2 rounded text-left hover:bg-white/10 ${danger ? 'text-red-300 border-t border-border mt-2 pt-2' : ''}`} onClick={() => { setMenu(false); action(); }}><Icon size={18} /> {label}</button>)}</div></Dialog>}
    {help && <HowToPlay onClose={closeHelp} />}
    {restart && <Dialog title="Reiniciar partida" onClose={closeRestart}><p className="text-sm">Esto reemplaza la partida guardada en este navegador y su historial.</p><div className="flex gap-3"><button type="button" className="causal-secondary" onClick={closeRestart}>Seguir jugando</button><button type="button" className="causal-primary" onClick={onRestart}>Reiniciar</button></div></Dialog>}
    {!state.campaign && (state.phase === 'mandate_review' || state.phase === 'ended') && <Dialog title={state.phase === 'ended' ? 'Gestión finalizada' : 'Mandato completado'} onClose={() => {}} dismissible={false}><Landmark className="text-accent" size={30} /><p className="text-sm text-muted-foreground leading-6">El componente social cierra en {fmtScore(state.socialComponent)}/100. El resultado electoral completo todavía no está definido. Podés revisar tu gestión o continuar la simulación conservando deuda, acuerdos y efectos futuros.</p><div className="flex flex-wrap gap-3">{state.phase === 'mandate_review' && <button type="button" className="causal-primary" onClick={() => onCommand('continue_term')}>Continuar simulación</button>}<button type="button" className="causal-secondary" onClick={() => setHistory(true)}>Revisar historial</button>{state.phase === 'mandate_review' && <button type="button" className="causal-secondary" onClick={() => onCommand('end_game')}>Finalizar gestión</button>}{state.phase === 'ended' && <button type="button" className="causal-primary" onClick={onRestart}>Nueva partida</button>}</div></Dialog>}
  </>;

  const scenarioName = getScenario(state.scenarioId)?.name;

  if (isMobile) {
    return <div className="government-game min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-40 bg-card/95 backdrop-blur border-b border-border pl-4 pr-2 pt-2 pb-2.5">
        <div className="flex items-center gap-3">
          {state.avatar ? <img src={state.avatar} alt="" className="h-10 w-10 rounded-full object-cover border-2 border-amber-200/50" /> : <img src={IMAGES.logo.primary} alt="GobernArg" className="h-9 w-auto" />}
          <div className="flex-1 min-w-0"><h1 className="text-sm font-semibold truncate">{state.name}</h1><p className="text-[11px] text-muted-foreground truncate">Año {Math.ceil(inTerm / 4)} · Turno {inTerm} de {TURNS_PER_TERM} · Mandato {state.term}{scenarioName ? ` · ${scenarioName}` : ''}</p></div>
          <button type="button" aria-label="Menú" className="w-11 h-11 flex items-center justify-center rounded hover:bg-white/10" onClick={() => setMenu(true)}><MoreHorizontal size={22} /></button>
        </div>
        <div className="pr-2"><MandateTimeline inTerm={inTerm} wide /><div className="flex justify-between text-[10px] text-muted-foreground mt-1"><span>Mandato</span>{nextMilestone && <span className="text-amber-200 font-semibold">{MILESTONES[nextMilestone]}{nextMilestone > inTerm ? ` en ${nextMilestone - inTerm} ${nextMilestone - inTerm === 1 ? 'turno' : 'turnos'}` : ' este turno'}</span>}<span>Fin T{TURNS_PER_TERM}</span></div></div>
      </header>
      <main className="px-3 pt-3 pb-[calc(9rem+env(safe-area-inset-bottom))] space-y-4">
        <PoliticalStatus state={state} compact />
        {tutorialCard}
        {savingAlert}
        {tab === 'acciones' && <><ObjectivesPanel state={state} /><PolicyPanel state={state} onExecute={onExecute} /><ProjectReports state={state} /></>}
        {tab === 'pais' && <>{country}{futureEffects}{cashAndDebt}{hero}</>}
        {tab === 'actores' && <><PoliticalSidebar state={state} onCommand={onCommand} />{governability}{socialComponent}<ActorPanel state={state} onExecute={onExecute} /><AxesPanel state={state} /></>}
        {tab === 'gabinete' && <><GovernmentPanel state={state} onCommand={onCommand} /></>}
      </main>
      <div className="fixed inset-x-0 bottom-0 z-40 bg-card border-t border-border shadow-[0_-8px_20px_rgba(0,0,0,.35)] pb-[env(safe-area-inset-bottom)]">
        <div className="flex items-center gap-4 h-[68px] pl-4 pr-3">
          <div className="leading-tight"><p className="text-[10px] text-muted-foreground">Agenda</p><strong className="text-base">{acciones(state.actionPoints)}</strong></div>
          <div className="leading-tight"><p className="text-[10px] text-muted-foreground">Caja</p><strong className="text-base">{fmtU(state.cash, 0)}</strong></div>
          <button type="button" data-no-restore-focus className="causal-primary ml-auto h-12 flex items-center gap-2" disabled={!canClose} onClick={e => closeTurn(e.currentTarget)}>Cerrar turno <ArrowRight size={16} /></button>
        </div>
        <nav aria-label="Secciones" className="grid grid-cols-4 h-16 border-t border-border">
          {TABS.map(({ id, label, icon: Icon }) => <button key={id} type="button" aria-current={tab === id ? 'page' : undefined} onClick={() => { setTab(id); window.scrollTo({ top: 0 }); }} className={`-mt-px flex flex-col items-center justify-center gap-0.5 text-xs border-t-[3px] ${tab === id ? 'border-amber-200 text-white font-semibold' : 'border-transparent text-muted-foreground'}`}><Icon size={21} strokeWidth={1.8} />{label}</button>)}
        </nav>
      </div>
      {overlays}
    </div>;
  }

  return <div className="government-game min-h-screen bg-background text-foreground">
    <header className="sticky top-0 z-40 bg-card/95 backdrop-blur border-b border-border px-4 md:px-6 py-3">
      <div className="max-w-[1600px] mx-auto flex flex-wrap items-center gap-3 md:gap-6">
        <img src={IMAGES.logo.primary} alt="GobernArg" className="h-9 w-auto" />
        {state.avatar && <img src={state.avatar} alt={state.name} className="h-10 w-10 rounded-full object-cover border-2 border-amber-200/50" />}
        <div className="mr-auto"><p className="text-[10px] uppercase tracking-widest text-muted-foreground">Presidente · Mandato {state.term}{scenarioName ? ` · ${scenarioName}` : ''}</p><h1 className="text-sm font-semibold">{state.name}</h1></div>
        <div className="text-xs flex items-center gap-2"><Clock3 size={15} className="text-blue-300" /><span>Año {Math.ceil(inTerm / 4)} · T{(inTerm - 1) % 4 + 1}<span className="block text-[10px] text-muted-foreground">Turno global {state.turn}</span><span className="hidden lg:block"><MandateTimeline inTerm={inTerm} /></span></span></div>
        <div className="text-xs flex items-center gap-2"><Wallet size={15} className="text-blue-300" /><span>{fmtU(state.cash)}<span className="block text-[10px] text-muted-foreground">Caja disponible</span></span></div>
        <div className="text-xs"><strong>{acciones(state.actionPoints)}</strong><span className="block text-[10px] text-muted-foreground">Agenda disponible</span></div>
        <button type="button" aria-haspopup="dialog" className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-white px-2 py-2 rounded hover:bg-white/10" onClick={() => setMenu(true)}><MoreHorizontal size={17} /> Menú</button>
        <button type="button" data-no-restore-focus className="causal-primary flex items-center gap-2" disabled={!canClose} onClick={e => closeTurn(e.currentTarget)}>Cerrar turno <ArrowRight size={15} /></button>
      </div>
    </header>
    <main className="max-w-[1600px] mx-auto px-4 md:px-6 py-5 space-y-5">
      {tutorialCard}
      {hero}
      <PoliticalStatus state={state} />
      {savingAlert}
      {country}
      <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,2fr)_minmax(320px,1fr)] gap-5 items-start">
        <div className="space-y-5"><ObjectivesPanel state={state} /><PolicyPanel state={state} onExecute={onExecute} /><ProjectReports state={state} />{futureEffects}{cashAndDebt}<GovernmentPanel state={state} onCommand={onCommand} /></div>
        <aside className="space-y-5"><PoliticalSidebar state={state} onCommand={onCommand} />{governability}{socialComponent}<ActorPanel state={state} onExecute={onExecute} /><AxesPanel state={state} /></aside>
      </div>
    </main>
    {overlays}
  </div>;
}

function ReportContent({ report }: { report: TurnReport }) {
  return <><div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">{[['Caja final', fmtU(report.fiscal.closingCash)], ['Resultado fiscal', fmtU(report.fiscal.result)], ['Deuda pendiente', fmtU(report.fiscal.debt)], ['Componente social', `${fmtScore(report.socialComponent)}/100`]].map(([name, value]) => <div key={name} className="p-3 bg-background/50 border border-border rounded"><p className="text-xs text-muted-foreground">{name}</p><strong className="block mt-2">{value}</strong></div>)}</div>
    <p className="text-xs text-muted-foreground flex gap-2"><Info size={15} className="shrink-0" /> Préstamos y emisión son financiación. Su desembolso no aumenta el resultado fiscal.</p>
    {report.messages.map((message, index) => <p key={index} className="text-sm rounded bg-blue-400/5 border border-border p-3">{message}</p>)}
    <h3 className="text-sm font-semibold">Cambios del país</h3><div className="space-y-2">{report.indicators.filter(trace => Math.abs(trace.after - trace.before) > 0.001).map(trace => <details key={trace.id} className="border border-border rounded p-3 text-sm"><summary className="cursor-pointer">{indicatorName(trace.id)} <span className="float-right font-mono">{fmtScore(trace.before)} → {fmtScore(trace.after)}</span></summary><div className="mt-3 text-xs text-muted-foreground space-y-2">{trace.contributions.map((item, index) => <div key={index} className="flex justify-between gap-3"><span>{item.label}</span><span className="font-mono">{fmtSigned(item.amount)}</span></div>)}</div></details>)}</div>
    <p className="text-xs text-muted-foreground">Ingresos {fmtU(report.fiscal.revenue)} · Gastos recurrentes {fmtU(report.fiscal.recurringExpense)} · Intereses devengados {fmtU(report.fiscal.interestDue)} · Principal pagado {fmtU(report.fiscal.principalPaid)}.</p>
  </>;
}
