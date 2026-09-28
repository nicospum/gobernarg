import { useState } from 'react';
import { ChevronDown, ChevronRight, Globe2, TrendingUp, TrendingDown, Minus, EyeOff } from 'lucide-react';
import type { GameState } from '../types/game';
import { INDICATOR_IDS, INDICATORS, type IndicatorId, type MacroCategory } from '@/data/causal';
import { effective, viewRef } from '@/engine/causal';
import { indicatorBand, inflationMonthly, toneClass } from '@/lib/causalText';
import { InfoTooltip } from './InfoTooltip';

/**
 * Estado del país (15 indicadores del motor) agrupado en las 4 categorías
 * macro del Excel, que son SÓLO visuales (DC-2). Se muestran bandas
 * cualitativas y tendencias; el valor exacto no aparece salvo como dato
 * público orientativo (inflación mensual). Los indicadores "parciales" sólo
 * muestran tendencia (01_INDICADORES, R-22).
 */

const MACROS: MacroCategory[] = ['Economía', 'Estado y servicios', 'Desarrollo', 'Instituciones y sociedad'];

function Trend({ delta, id }: { delta: number | null; id: IndicatorId }) {
  if (delta === null || Math.abs(delta) < 0.4) return <Minus size={10} className="text-muted-foreground" />;
  const dir = INDICATORS[id].goodDirection;
  const good = dir === 0 ? null : Math.sign(delta) === dir;
  const cls = good === null ? 'text-sky-300' : good ? 'text-emerald-400' : 'text-red-400';
  return delta > 0 ? <TrendingUp size={11} className={cls} /> : <TrendingDown size={11} className={cls} />;
}

/**
 * En la computadora es una matriz de 4 columnas que se pliega entera. En el
 * celular (`compact`) cada categoría es un grupo que se abre y se cierra, con
 * un resumen de cuántos indicadores están en rojo.
 */
export function CountryPanel({ gameState, compact = false }: { gameState: GameState; compact?: boolean }) {
  const [open, setOpen] = useState(true);
  const [openMacro, setOpenMacro] = useState<MacroCategory | null>('Economía');
  const c = gameState.causal;
  const ref = viewRef(c);
  const last = c.records[c.records.length - 1];
  const showExpectations = c.perks.reveals.includes('desanclaje');
  const idsOf = (macro: MacroCategory) => INDICATOR_IDS.filter(id => INDICATORS[id].macro === macro);

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
        <div
          className={`flex items-center justify-between gap-2 cursor-help group hover:bg-sunken/70 px-1 rounded transition-colors ${
            compact ? 'min-h-[38px] border-t border-dashed border-rule first:border-t-0' : 'py-[3px]'
          }`}
        >
          <span className={`${compact ? 'text-[14px]' : 'text-[11px]'} text-ink/80 group-hover:text-ink truncate flex items-center gap-1 font-medium`}>
            {def.name}
            {partial && <EyeOff size={9} className="text-ink/70 flex-shrink-0" />}
          </span>
          <span className="flex items-center gap-1.5 flex-shrink-0">
            <span className={`${compact ? 'text-[13px]' : 'text-[11px]'} font-mono font-semibold ${toneClass(band.tone)}`}>
              {id === 'INFL' ? inflationMonthly(v) : band.label}
            </span>
            <Trend delta={delta} id={id} />
          </span>
        </div>
      </InfoTooltip>
    );
  };

  const expectations = (
    <div className="flex items-center justify-between gap-2 pt-1.5 border-t border-ink/6">
      <span className={`${compact ? 'text-[14px]' : 'text-[11px]'} text-ink/70`}>Expectativas inflación</span>
      <span className={`${compact ? 'text-[13px]' : 'text-[10px]'} font-bold ${c.desanclaje > 20 ? 'text-red-400' : c.desanclaje > 10 ? 'text-amber-300' : 'text-emerald-400'}`}>
        {c.desanclaje > 20 ? 'Despegadas' : c.desanclaje > 10 ? 'Inquietas' : 'Ancladas'}
      </span>
    </div>
  );

  if (compact) {
    return (
      <section className="rounded-lg border border-rule bg-surface overflow-hidden divide-y divide-rule">
        {MACROS.map(macro => {
          const ids = idsOf(macro);
          const bad = ids.filter(id => indicatorBand(id, effective(c, id, ref)).tone === 'bad').length;
          const isOpen = openMacro === macro;
          return (
            <div key={macro}>
              <button
                onClick={() => setOpenMacro(isOpen ? null : macro)}
                aria-expanded={isOpen}
                className="w-full min-h-[54px] flex items-center gap-3 px-4 text-left hover:bg-sunken/60 transition-colors"
              >
                <span className="flex-1 min-w-0">
                  <span className="block text-[15px] font-semibold text-ink">{macro}</span>
                  <span className={`block text-[12px] ${bad > 0 ? 'text-red-400' : 'text-ink/70'}`}>
                    {ids.length} {ids.length === 1 ? 'indicador' : 'indicadores'} · {bad > 0 ? `${bad} en rojo` : 'sin alertas'}
                  </span>
                </span>
                <ChevronDown size={18} className={`text-ink/70 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
              </button>
              {isOpen && (
                <div className="px-4 pb-3">
                  {ids.map(row)}
                  {macro === 'Economía' && showExpectations && expectations}
                </div>
              )}
            </div>
          );
        })}
      </section>
    );
  }

  return (
    <section className="rounded-lg border border-rule bg-surface overflow-hidden">
      <button
        onClick={() => setOpen(v => !v)}
        className="w-full flex items-center justify-between px-5 py-2.5 border-b border-rule hover:bg-sunken/60 transition-colors"
      >
        <h2 className="font-display font-semibold text-[15px] text-ink flex items-center gap-2">
          <Globe2 size={14} className="text-gold-ink" />
          Detalle Macroeconómico & Motor Causal ({INDICATOR_IDS.length} Indicadores)
        </h2>
        <div className="flex items-center gap-2">
          <span className="text-[11px] text-ink/70">
            {open ? 'Ocultar matriz' : 'Desplegar matriz'}
          </span>
          {open ? <ChevronDown size={14} className="text-ink/70" /> : <ChevronRight size={14} className="text-ink/70" />}
        </div>
      </button>
      {open && (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-rule">
          {MACROS.map(macro => (
            <div key={macro} className="px-4 py-3">
              <div className="text-[10px] uppercase tracking-widest text-gold-ink font-semibold pb-1.5 mb-1 border-b border-rule">
                {macro}
              </div>
              <div className="space-y-px">
                {idsOf(macro).map(row)}
                {macro === 'Economía' && showExpectations && expectations}
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
