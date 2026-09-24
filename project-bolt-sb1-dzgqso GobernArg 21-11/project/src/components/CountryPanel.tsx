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
  if (delta === null || Math.abs(delta) < 0.4) return <Minus size={10} className="text-muted-foreground/60" />;
  const dir = INDICATORS[id].goodDirection;
  const good = dir === 0 ? null : Math.sign(delta) === dir;
  const cls = good === null ? 'text-sky-300' : good ? 'text-emerald-400' : 'text-red-400';
  return delta > 0 ? <TrendingUp size={11} className={cls} /> : <TrendingDown size={11} className={cls} />;
}

export function CountryPanel({ gameState }: { gameState: GameState }) {
  const [open, setOpen] = useState(true);
  const c = gameState.causal;
  const ref = viewRef(c);
  const last = c.records[c.records.length - 1];
  const showExpectations = c.perks.reveals.includes('desanclaje');

  return (
    <section className="rounded-xl border border-white/8 bg-[#0f1e38] overflow-hidden shadow-lg">
      <button
        onClick={() => setOpen(v => !v)}
        className="w-full flex items-center justify-between px-4 py-3 border-b border-white/8 hover:bg-white/4 transition-colors"
      >
        <h2 className="font-['Barlow_Condensed'] font-bold text-sm uppercase tracking-wider text-white flex items-center gap-2">
          <Globe2 size={14} className="text-blue-400" />
          Detalle Macroeconómico & Motor Causal ({INDICATOR_IDS.length} Indicadores)
        </h2>
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-white/40 font-mono">
            {open ? 'Ocultar matriz' : 'Desplegar matriz'}
          </span>
          {open ? <ChevronDown size={14} className="text-white/40" /> : <ChevronRight size={14} className="text-white/40" />}
        </div>
      </button>
      {open && (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-px bg-white/6">
          {MACROS.map(macro => (
            <div key={macro} className="bg-[#0f1e38] p-3.5 space-y-2">
              <div className="text-[10px] uppercase tracking-widest text-blue-300/70 font-bold border-b border-white/6 pb-1">
                {macro}
              </div>
              <div className="space-y-2 pt-0.5">
                {INDICATOR_IDS.filter(id => INDICATORS[id].macro === macro).map(id => {
                  const def = INDICATORS[id];
                  const v = effective(c, id, ref);
                  const band = indicatorBand(id, v);
                  const delta = last ? last.indicatorsAfter[id] - last.indicatorsBefore[id] : null;
                  const partial = def.visibility === 'partial';
                  return (
                    <InfoTooltip
                      key={id}
                      content={
                        <div className="flex flex-col gap-1 max-w-[260px]">
                          <div className="font-semibold text-xs text-white">{def.name}</div>
                          <div className="text-[10px] text-white/70">{def.definition}</div>
                          <div className="text-[10px] text-white/50">
                            Alto: {def.high} | Bajo: {def.low}
                          </div>
                          {partial && <div className="text-[10px] text-amber-300">Dato estimado: sólo se conoce tendencia.</div>}
                        </div>
                      }
                    >
                      <div className="flex items-center justify-between gap-2 cursor-help group hover:bg-white/4 p-1 rounded transition-colors">
                        <span className="text-[11px] text-white/80 group-hover:text-white truncate flex items-center gap-1 font-medium">
                          {def.name}
                          {partial && <EyeOff size={9} className="text-white/30 flex-shrink-0" />}
                        </span>
                        <span className="flex items-center gap-1.5 flex-shrink-0">
                          <span className={`text-[10px] font-mono font-bold ${toneClass(band.tone)}`}>
                            {id === 'INFL' ? inflationMonthly(v) : band.label}
                          </span>
                          <Trend delta={delta} id={id} />
                        </span>
                      </div>
                    </InfoTooltip>
                  );
                })}
                {macro === 'Economía' && showExpectations && (
                  <div className="flex items-center justify-between gap-2 pt-1.5 border-t border-white/6">
                    <span className="text-[11px] text-white/70">Expectativas inflación</span>
                    <span className={`text-[10px] font-bold ${c.desanclaje > 20 ? 'text-red-400' : c.desanclaje > 10 ? 'text-amber-300' : 'text-emerald-400'}`}>
                      {c.desanclaje > 20 ? 'Despegadas' : c.desanclaje > 10 ? 'Inquietas' : 'Ancladas'}
                    </span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
