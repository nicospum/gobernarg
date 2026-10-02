import { useState } from 'react';
import { ChevronDown, TrendingUp, TrendingDown, Minus, EyeOff } from 'lucide-react';
import type { GameState } from '../types/game';
import { INDICATOR_IDS, INDICATORS, type IndicatorId, type MacroCategory } from '@/data/causal';
import { effective, viewRef } from '@/engine/causal';
import { indicatorBand, inflationMonthly, type Tone } from '@/lib/causalText';
import { countryAlerts } from '@/lib/boardView';
import { InfoTooltip } from './InfoTooltip';

/**
 * Estado del país (15 indicadores del motor) agrupado en las 4 categorías
 * macro del Excel, que son SÓLO visuales (DC-2). Se muestran bandas
 * cualitativas y tendencias; el valor exacto no aparece salvo como dato
 * público orientativo (inflación mensual). Los indicadores "parciales" sólo
 * muestran tendencia (01_INDICADORES, R-22).
 */

const MACROS: MacroCategory[] = ['Economía', 'Estado y servicios', 'Desarrollo', 'Instituciones y sociedad'];

const TONE_TEXT: Record<Tone, string> = { good: 'text-sala-good', bad: 'text-sala-bad', neutral: 'text-sala-warn' };

function Trend({ delta, id }: { delta: number | null; id: IndicatorId }) {
  if (delta === null || Math.abs(delta) < 0.4) return <Minus size={10} className="text-sala-dim" />;
  const dir = INDICATORS[id].goodDirection;
  const good = dir === 0 ? null : Math.sign(delta) === dir;
  const cls = good === null ? 'text-sala-blue' : good ? 'text-sala-good' : 'text-sala-bad';
  return delta > 0 ? <TrendingUp size={11} className={cls} /> : <TrendingDown size={11} className={cls} />;
}

/** Anillo de situación general: cuántos de los 15 indicadores están sin alerta. */
function ScoreRing({ ok, total }: { ok: number; total: number }) {
  const r = 22;
  const len = 2 * Math.PI * r;
  return (
    <svg viewBox="0 0 54 54" className="w-[54px] h-[54px] flex-shrink-0" role="img" aria-label={`${ok} de ${total} indicadores sin alerta`}>
      <circle cx="27" cy="27" r={r} fill="none" stroke="rgb(var(--sunken))" strokeWidth="4" />
      <circle
        cx="27" cy="27" r={r} fill="none" stroke="rgb(var(--cyan))" strokeWidth="4" strokeLinecap="round"
        strokeDasharray={`${(ok / total) * len} ${len}`} transform="rotate(-90 27 27)"
      />
      <text x="27" y="29" textAnchor="middle" className="fill-ink" style={{ font: '700 15px Inter, sans-serif' }}>{ok}</text>
      <text x="27" y="39" textAnchor="middle" className="fill-sala-muted" style={{ font: '600 7px Inter, sans-serif' }}>/{total}</text>
    </svg>
  );
}

/**
 * En la computadora es el "briefing" de la columna izquierda. En el celular
 * (`compact`) cada categoría es un grupo que se abre y se cierra, con un
 * resumen de cuántos indicadores están en rojo.
 */
export function CountryPanel({ gameState, compact = false, index }: { gameState: GameState; compact?: boolean; index?: string }) {
  const [openMacro, setOpenMacro] = useState<MacroCategory | null>('Economía');
  const c = gameState.causal;
  const ref = viewRef(c);
  const last = c.records[c.records.length - 1];
  const showExpectations = c.perks.reveals.includes('desanclaje');
  const idsOf = (macro: MacroCategory) => INDICATOR_IDS.filter(id => INDICATORS[id].macro === macro);
  const { alerts, total } = countryAlerts(gameState);

  const row = (id: IndicatorId) => {
    const def = INDICATORS[id];
    const v = effective(c, id, ref);
    const band = indicatorBand(id, v);
    const delta = last ? last.indicatorsAfter[id] - last.indicatorsBefore[id] : null;
    const partial = def.visibility === 'partial';
    return (
      <InfoTooltip
        key={id}
        title={def.name}
        content={
          <div className="flex flex-col gap-1 max-w-[260px]">
            <div className="font-semibold text-xs text-ink">{def.name}</div>
            <div className="text-[10px] text-ink/70">{def.definition}</div>
            <div className="text-[10px] text-ink/70">
              Alto: {def.high} | Bajo: {def.low}
            </div>
            {partial && <div className="text-[10px] text-amber-300">Dato estimado: sólo se conoce tendencia.</div>}
          </div>
        }
      >
        <div className={`flex items-center justify-between gap-2 cursor-help rounded px-1 -mx-1 hover:bg-sunken/70 transition-colors ${compact ? 'min-h-[40px]' : 'min-h-[24px]'}`}>
          <span className={`${compact ? 'text-[14px]' : 'text-[12px]'} text-sala-muted truncate flex items-center gap-1`}>
            {def.name}
            {partial && <EyeOff size={9} className="text-sala-dim flex-shrink-0" />}
          </span>
          <span className="flex items-center gap-1.5 flex-shrink-0">
            <b className={`${compact ? 'text-[13px]' : 'text-[11px]'} ${TONE_TEXT[band.tone]}`}>
              {id === 'INFL' ? inflationMonthly(v) : band.label}
            </b>
            <Trend delta={delta} id={id} />
          </span>
        </div>
      </InfoTooltip>
    );
  };

  const expectations = showExpectations && (
    <div className="flex items-center justify-between gap-2 min-h-[24px]">
      <span className={`${compact ? 'text-[14px]' : 'text-[12px]'} text-sala-muted`}>Expectativas de inflación</span>
      <b className={`${compact ? 'text-[13px]' : 'text-[11px]'} ${c.desanclaje > 20 ? 'text-sala-bad' : c.desanclaje > 10 ? 'text-sala-warn' : 'text-sala-good'}`}>
        {c.desanclaje > 20 ? 'Despegadas' : c.desanclaje > 10 ? 'Inquietas' : 'Ancladas'}
      </b>
    </div>
  );

  const groupSummary = (ids: IndicatorId[]) => {
    const bad = ids.filter(id => indicatorBand(id, effective(c, id, ref)).tone === 'bad').length;
    return { bad, text: bad > 0 ? `${bad} en rojo` : 'Sin alertas' };
  };

  if (compact) {
    return (
      <section className="sr-panel divide-y divide-rule" aria-label="Estado del país">
        {MACROS.map(macro => {
          const ids = idsOf(macro);
          const { bad, text } = groupSummary(ids);
          const isOpen = openMacro === macro;
          return (
            <div key={macro}>
              <button
                onClick={() => setOpenMacro(isOpen ? null : macro)}
                aria-expanded={isOpen}
                className="w-full min-h-[54px] flex items-center gap-3 px-4 text-left hover:bg-sunken/60 transition-colors"
              >
                <span className="flex-1 min-w-0">
                  <span className="sr-eyebrow block !text-sala-muted">{macro}</span>
                  <span className={`block text-[13px] mt-1 ${bad > 0 ? 'text-sala-bad' : 'text-sala-good'}`}>
                    {ids.length} {ids.length === 1 ? 'indicador' : 'indicadores'} · {text.toLowerCase()}
                  </span>
                </span>
                <ChevronDown size={18} className={`text-sala-dim transition-transform ${isOpen ? 'rotate-180' : ''}`} />
              </button>
              {isOpen && (
                <div className="px-4 pb-3">
                  {ids.map(row)}
                  {macro === 'Economía' && expectations}
                </div>
              )}
            </div>
          );
        })}
      </section>
    );
  }

  return (
    <section id="panel-pais" className="sr-panel scroll-mt-24" aria-label="Estado del país">
      <div className="sr-panel-head">
        <div>
          <span className="sr-label">{index ? `${index} / ` : ''}Briefing</span>
          <h2 className="sr-panel-title">Estado del país</h2>
        </div>
      </div>
      <div className="flex items-center gap-3.5 px-4 py-3.5 border-b border-rule">
        <ScoreRing ok={total - alerts} total={total} />
        <div>
          <b className="text-[13px] text-ink">Situación general</b>
          <p className="text-[11px] text-sala-muted mt-1 leading-snug">
            {total - alerts} de {total} indicadores sin alerta
            {alerts > 0 ? ` · ${alerts} ${alerts === 1 ? 'alerta activa' : 'alertas activas'}` : ''}
          </p>
        </div>
      </div>
      {MACROS.map(macro => {
        const ids = idsOf(macro);
        const { bad, text } = groupSummary(ids);
        return (
          <div key={macro} className="px-4 pt-3 pb-2 border-b border-rule last:border-b-0">
            <div className="flex items-center justify-between mb-1.5">
              <span className="sr-eyebrow !text-sala-muted">{macro}</span>
              <b className={`text-[10px] ${bad > 0 ? 'text-sala-bad' : 'text-sala-good'}`}>{text}</b>
            </div>
            {ids.map(row)}
            {macro === 'Economía' && expectations}
          </div>
        );
      })}
    </section>
  );
}
