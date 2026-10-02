import { useState, type CSSProperties } from 'react';
import { Activity, HeartHandshake, Pause, Play, Radio, ShieldCheck, Sun, Vote, Wallet } from 'lucide-react';
import { INDICATORS } from '../../causal/catalog';
import { policyEffectsPreview } from '../../causal/engine';
import { fiscalForecast } from '../../causal/finance';
import { fmtScore, fmtSigned, fmtMoney } from '../../causal/format';
import type { CausalState, IndicatorId, PolicyDefinition } from '../../causal/types';
import { LITE_FEATURES } from '../../lite/config';
import { describeKpi } from '../../lite/present';

export function PresidentialMark({ compact = false }: { compact?: boolean }) {
  return <div className="b-brand"><span className="b-seal" aria-hidden="true"><Sun size={compact ? 21 : 25} strokeWidth={1.4} /><span className="b-live-dot" /></span><div><span className="b-wordmark">Gobern<span>Arg</span></span><span className="b-edition">B Lite / Sala de situación</span></div></div>;
}

export function NewsWire({ state }: { state: CausalState }) {
  const [paused, setPaused] = useState(false);
  const news = [...(state.campaign?.news ?? [])].reverse().filter(item => !item.dismissed).slice(0, 5);
  const messages = news.length ? news.map(item => `T${item.turn} · ${item.title}: ${item.text}`) : ['Sin avisos pendientes. Consultá el calendario y los compromisos de tu gestión.'];
  return <section className={`b-wire ${paused ? 'b-wire-paused' : ''}`} aria-label="Noticias de gobierno">
    <span className="b-wire-label"><Radio size={13} /> Cable de gobierno</span>
    <div className="b-wire-window"><div className="b-wire-track">{[0, 1].map(copy => <div className="b-wire-copy" key={copy} aria-hidden={copy === 1 ? true : undefined}>{messages.map((message, i) => <span key={i}>{message}</span>)}</div>)}</div></div>
    <button type="button" className="b-wire-toggle" aria-label={paused ? 'Reanudar noticias' : 'Pausar noticias'} onClick={() => setPaused(value => !value)}>{paused ? <Play size={13} /> : <Pause size={13} />}</button>
  </section>;
}

function Ring({ value }: { value: number }) {
  return <svg className="b-kpi-ring" viewBox="0 0 36 36" aria-hidden="true"><circle cx="18" cy="18" r="15.9155" fill="none" stroke="rgba(255,255,255,.08)" strokeWidth="3" /><circle className="b-ring-value" cx="18" cy="18" r="15.9155" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeDasharray={`${Math.max(0, Math.min(100, value))}, 100`} transform="rotate(-90 18 18)" /></svg>;
}

export function CommandStatus({ state }: { state: CausalState }) {
  const c = state.campaign;
  if (!c) return null;
  // Lite: sin "Aprobación material" (el motor la sigue calculando).
  const items = [
    { label: 'Aprobación material', value: c.approval, detail: 'Satisfacción social ponderada', icon: HeartHandshake, color: '#fbbf24', unit: '/100' },
    { label: 'Estabilidad', value: c.stability, detail: 'Conflictos y obligaciones fiscales', icon: Activity, color: '#75aadb', unit: '/100' },
    { label: 'Legitimidad', value: c.legitimacy, detail: 'Garantías y compromisos', icon: ShieldCheck, color: '#c9a96e', unit: '/100' },
    { label: 'Proyección electoral', value: c.votes, detail: `Umbral de victoria: 45 % · ${c.votes < 45 ? 'Por debajo' : 'Sobre el umbral'}`, icon: Vote, color: '#c4a0ff', unit: '%' },
  ];
  const forecast = fiscalForecast(state)[0];
  // Lite: palabras en vez de cifras (el voto se ve en % porque es la meta: 45 %).
  const lite = !LITE_FEATURES.modoDetallado;
  const visibleItems = lite ? items.filter(item => item.label !== 'Aprobación material') : items;
  const shown = (label: string, value: number, unit: string) => lite ? label === 'Proyección electoral' ? <>{Math.round(value)}<small>%</small></> : <span className="b-kpi-word">{describeKpi(value).word}</span> : <>{fmtScore(value)}<small>{unit}</small></>;
  return <section className={`b-command-status ${lite ? 'b-command-status-lite' : ''}`} aria-label="Estado político y fiscal">{visibleItems.map(({ label, value, detail, icon: Icon, color, unit }) => <article className="b-kpi" key={label} style={{ '--metric-color': color } as CSSProperties}><div><p className="b-kpi-label"><Icon size={13} />{label}</p><strong className="b-kpi-value"><span key={value} className="b-value-update">{shown(label, value, unit)}</span></strong>{(!lite || label === 'Proyección electoral') && <p className="b-kpi-detail">{lite ? `Necesitás 45 % · ${value < 45 ? 'Por debajo' : 'Sobre el umbral'}` : detail}</p>}</div><Ring value={value} /></article>)}
    <article className="b-kpi b-kpi-cash" style={{ '--metric-color': '#34d399' } as CSSProperties}><div><p className="b-kpi-label"><Wallet size={13} />Caja del Tesoro</p><strong className="b-kpi-value"><span key={state.cash} className="b-value-update">{fmtMoney(state.cash)}</span></strong>{!lite && <p className="b-kpi-detail">Prevista T{forecast?.turn}: {forecast ? fmtMoney(forecast.cash) : '—'}</p>}</div></article>
  </section>;
}

export function CountryBriefing({ state, preview, onIndicator }: { state: CausalState; preview: PolicyDefinition | null; onIndicator: (id: IndicatorId) => void }) {
  const effects = preview ? policyEffectsPreview(state, preview) : [];
  const groups = [...new Set(INDICATORS.map(item => item.category))];
  return <section className="b-briefing b-panel" aria-label="Indicadores del país"><div className="b-panel-heading"><Activity size={16} /><h2>Briefing del país</h2><span className="b-tag">14 índices</span></div><p className="b-briefing-note">Escala 0–100. Los resultados cambian al cierre. Abrí un índice para ver sus causas.</p>
    {preview && <p className="b-preview-legend" role="status">Vista previa: {preview.name}. Efectos directos previstos; el cierre también resuelve contexto y actores.</p>}
    {groups.map(group => <div className="b-indicator-group" key={group}><h3>{group}</h3><div>{INDICATORS.filter(item => item.category === group).map(item => {
      const value = state.indicators[item.id], delta = value - state.previousIndicators[item.id];
      const affected = effects.filter(effect => effect.target === item.id);
      const signs = affected.map(effect => item.id === 'inflacion' ? -effect.capturedMagnitude : effect.capturedMagnitude);
      const tone = signs.some(n => n > 0) && signs.some(n => n < 0) ? 'mixed' : signs.some(n => n < 0) ? 'adverse' : signs.some(n => n > 0) ? 'beneficial' : '';
      const positive = item.id === 'inflacion' ? delta < 0 : delta > 0;
      return <button key={item.id} type="button" onClick={() => onIndicator(item.id)} data-indicator={item.id} className={`b-indicator ${tone ? `b-impact-${tone}` : ''}`}><span className="b-indicator-top"><span>{item.name}</span><strong>{fmtScore(value)}</strong></span><span className="b-indicator-bottom"><span className="b-meter"><span style={{ width: `${value}%` }} /></span><span className={delta === 0 ? '' : positive ? 'text-emerald-300' : 'text-rose-300'}>{fmtSigned(delta)}</span></span>{affected.map(effect => <span className="b-indicator-preview" key={effect.id}>{fmtSigned(effect.capturedMagnitude)} desde T{effect.begins} · {effect.timing}</span>)}</button>;
    })}</div></div>)}
  </section>;
}
