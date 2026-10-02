import type { CSSProperties } from 'react';
import { AlertTriangle, ArrowDown, ArrowRight, ArrowUp, CalendarClock, Landmark, Wallet } from 'lucide-react';
import { policyEffectsPreview } from '../../causal/engine';
import { AGREEMENT_LABELS } from '../../causal/interactions';
import { actorName, totalArrears, totalDebt } from '../../causal/selectors';
import { fmtMoney, fmtMoneyDelta, fmtPct } from '../../causal/format';
import type { CausalState, IndicatorId, PolicyDefinition, TurnReport } from '../../causal/types';
import { defeatWarnings, describeIndicator, goodness, effectArrows, effectIsGood, governabilityWord, inTurns, SHORT_NAMES, TONE_CLASS, trend, VISIBLE_INDICATORS } from '../../lite/present';

/**
 * Paneles de la Lite (LITE_FEATURES.modoDetallado = false): lo mínimo para
 * decidir y ver cómo se mueve el país, sin cifras de indicadores.
 */

export function TrendIcon({ id, delta, size = 13 }: { id: IndicatorId; delta: number; size?: number }) {
  const t = trend(id, delta);
  const Icon = t.direction === 'up' ? ArrowUp : t.direction === 'down' ? ArrowDown : ArrowRight;
  return <Icon size={size} aria-label={t.label} className={t.good === null ? 'text-slate-400' : t.good ? 'text-emerald-300' : 'text-rose-300'} />;
}

/** Tesoro mínimo: caja y deuda. */
export function LiteTreasury({ state }: { state: CausalState }) {
  const debt = totalDebt(state), arrears = totalArrears(state);
  const next = state.loans.filter(loan => loan.outstanding > 0).sort((a, b) => a.dueTurn - b.dueTurn)[0];
  const cashTone = arrears > 0 ? 'b-tone-critical' : state.cash < 300 ? 'b-tone-bad' : 'b-tone-good';
  return <section className="bg-card border border-border rounded-xl p-4" aria-label="Caja y deuda">
    <h2 className="font-display font-bold flex items-center gap-2"><Wallet size={17} className="text-blue-300" /> Caja y deuda</h2>
    <div className="grid grid-cols-2 gap-3 mt-4">
      <div className={`b-lite-money ${cashTone}`}><span>Caja</span><strong>{fmtMoney(state.cash)}</strong><small>{arrears > 0 ? `Debés ${fmtMoney(arrears)}` : state.cash < 300 ? 'Justa' : 'Alcanza'}</small></div>
      <div className={`b-lite-money ${debt > 0 ? 'b-tone-neutral' : 'b-tone-good'}`}><span>Deuda</span><strong>{fmtMoney(debt)}</strong><small>{next ? `Vence ${inTurns(next.dueTurn - state.turn)}: ${fmtMoney(next.outstanding)}` : 'Sin préstamos'}</small></div>
    </div>
  </section>;
}

/** Compromisos en una línea: cuántos hay y el más urgente. */
export function LiteCommitments({ state }: { state: CausalState }) {
  const pending = state.agreements.filter(agreement => agreement.status === 'pending').sort((a, b) => a.deadline - b.deadline);
  const urgent = pending[0];
  const upcoming = new Set(state.effects.filter(effect => effect.kind === 'indicator' && effect.startTurn > state.turn).map(effect => effect.actionId)).size;
  return <section className="bg-card border border-border rounded-xl p-4" aria-label="Compromisos">
    <h2 className="font-display font-bold flex items-center gap-2"><CalendarClock size={17} className="text-blue-300" /> Compromisos</h2>
    <p className="text-sm mt-3">{pending.length === 0 ? 'No tenés compromisos pendientes.' : `Tenés ${pending.length} ${pending.length === 1 ? 'compromiso pendiente' : 'compromisos pendientes'}.`}</p>
    {urgent && <p className="text-xs text-muted-foreground mt-1">El más urgente: {AGREEMENT_LABELS[urgent.templateId].toLowerCase()} con {actorName(urgent.actorId)}, vence {inTurns(urgent.deadline - state.turn)}.</p>}
    {upcoming > 0 && <p className="text-xs text-muted-foreground mt-1">{upcoming === 1 ? 'Una decisión todavía no se nota' : `${upcoming} decisiones todavía no se notan`}: sus efectos llegan en los próximos turnos.</p>}
  </section>;
}

/** Gobernabilidad en una palabra y una barra: cómo está repartido el Congreso y si alcanza para las leyes. */
export function LiteGovernability({ state }: { state: CausalState }) {
  const seats = state.campaign?.seats ?? { oficialismo: 40, aliados: 15, oposicion: 45 };
  const { word, tone } = governabilityWord(state);
  const blocks = [['Propios', seats.oficialismo, '#75aadb'], ['Aliados', seats.aliados, '#9a80c9'], ['Oposición', seats.oposicion, '#deae57']] as const;
  return <section className="bg-card border border-border rounded-xl p-4" aria-label="Gobernabilidad">
    <h2 className="font-display font-bold flex items-center gap-2"><Landmark size={17} className="text-blue-300" /> Gobernabilidad</h2>
    <p className={`b-lite-word mt-3 ${tone}`}>{word}</p>
    <div className="flex h-2.5 rounded overflow-hidden mt-3" role="img" aria-label="Composición del Congreso">{blocks.map(([name, n, color]) => <span key={name} style={{ width: `${n}%`, background: color }} />)}</div>
    <p className="flex gap-3 text-[11px] text-muted-foreground mt-2">{blocks.map(([name, , color]) => <span key={name} className="inline-flex items-center gap-1"><span className="w-2 h-2 rounded-sm" style={{ background: color } as CSSProperties} />{name}</span>)}</p>
    <p className="text-xs text-muted-foreground mt-2">Las leyes necesitan mayoría. Reunite y acordá con tu bloque, los aliados o la oposición.</p>
  </section>;
}

/** Cierre de turno: las 3 cosas que más cambiaron, la caja y los avisos. */
export function LiteReport({ report }: { report: TurnReport }) {
  const visible = new Set(VISIBLE_INDICATORS.map(item => item.id));
  const changes = report.indicators.filter(trace => visible.has(trace.id) && Math.abs(trace.after - trace.before) >= 0.5)
    .sort((a, b) => Math.abs(b.after - b.before) - Math.abs(a.after - a.before)).slice(0, 3);
  const cashDelta = report.fiscal.closingCash - report.fiscal.openingCash;
  return <>
    <h3 className="text-sm font-semibold">Lo que más cambió</h3>
    {changes.length === 0 ? <p className="text-sm text-muted-foreground">El país se mantuvo estable este trimestre.</p>
      : <ul className="grid sm:grid-cols-3 gap-3">{changes.map(trace => {
        const before = describeIndicator(trace.id, trace.before), after = describeIndicator(trace.id, trace.after);
        const t = trend(trace.id, trace.after - trace.before);
        return <li key={trace.id} className={`b-lite-change ${TONE_CLASS[after.tone]}`}><span className="flex items-center justify-between gap-2 text-sm"><strong>{SHORT_NAMES[trace.id]}</strong><TrendIcon id={trace.id} delta={trace.after - trace.before} size={16} /></span>
          <span className="b-lite-word">{after.word}</span><small>{before.word === after.word ? (t.good ? 'Mejora' : 'Empeora') : `Antes: ${before.word.toLowerCase()}`}</small></li>;
      })}</ul>}
    <p className="b-lite-cash"><Wallet size={15} /> Caja: <strong>{fmtMoney(report.fiscal.closingCash)}</strong> <span className={cashDelta >= 0 ? 'text-emerald-300' : 'text-rose-300'}>({fmtMoneyDelta(cashDelta)} en el trimestre)</span></p>
    {report.messages.slice(0, 3).map((message, index) => <p key={index} className="text-sm rounded bg-blue-400/5 border border-border p-3">{message}</p>)}
  </>;
}

/** Avisos de derrota en camino (modo simple): nadie pierde sin aviso. */
export function LiteDefeatAlerts({ state }: { state: CausalState }) {
  const warnings = defeatWarnings(state);
  if (!warnings.length) return null;
  return <div className="space-y-2" aria-label="Peligro para tu gobierno">{warnings.map(warning => <p key={warning.id} role="alert" className={`b-lite-alert ${warning.critical ? 'b-lite-alert-critical' : ''}`}><AlertTriangle size={17} className="shrink-0" /><span>{warning.text}</span></p>)}</div>;
}

/**
 * Franja de arriba del modo simple: voto, caja y los 7 índices del país en
 * chips (palabra, color y flecha). Al pasar sobre una política, ▲/▼.
 */
export function LiteStatusStrip({ state, preview }: { state: CausalState; preview: PolicyDefinition | null }) {
  const c = state.campaign;
  const effects = preview ? policyEffectsPreview(state, preview) : [];
  return <section className="b-lite-strip" aria-label="El país">
    {c && <div className={`b-lite-chip b-lite-chip-vote ${c.votes < 45 ? 'b-tone-bad' : 'b-tone-good'}`}><span>Voto</span><strong>{fmtPct(c.votes, 0)}</strong><span className="b-kpi-goal" aria-hidden="true"><span style={{ width: `${Math.max(0, Math.min(100, c.votes))}%`, background: 'var(--tone)' }} /><i /></span><small>meta 45 %</small></div>}
    <div className={`b-lite-chip b-lite-chip-cash ${totalArrears(state) > 0 ? 'b-tone-critical' : 'b-tone-good'}`}><span>Caja</span><strong>{fmtMoney(state.cash)}</strong><small>{totalArrears(state) > 0 ? `Debés ${fmtMoney(totalArrears(state))}` : 'Tesoro'}</small></div>
    {VISIBLE_INDICATORS.map(({ id, label }) => {
      const value = state.indicators[id];
      const { word, tone } = describeIndicator(id, value);
      const total = effects.filter(effect => effect.target === id).reduce((sum, effect) => sum + effect.capturedMagnitude, 0);
      const arrows = effectArrows(total);
      const impact = arrows ? effectIsGood(id, total) ? 'b-impact-beneficial' : 'b-impact-adverse' : '';
      return <div key={id} data-indicator={id} className={`b-lite-chip ${TONE_CLASS[tone]} ${impact}`}>
        <span className="flex items-center justify-between gap-1">{label}<TrendIcon id={id} delta={value - state.previousIndicators[id]} size={12} /></span>
        <strong>{word}</strong>
        {arrows ? <small className={effectIsGood(id, total) ? 'text-emerald-300' : 'text-rose-300'} aria-label={`${label}: ${effectIsGood(id, total) ? 'mejora' : 'empeora'}`}>{arrows}</small> : <span className="b-meter" aria-hidden="true"><span style={{ width: `${goodness(id, value)}%`, background: 'var(--tone)' }} /></span>}
      </div>;
    })}
  </section>;
}
