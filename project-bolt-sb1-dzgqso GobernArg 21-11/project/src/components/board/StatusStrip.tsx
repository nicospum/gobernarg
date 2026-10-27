import { AlertTriangle, ChevronRight, Minus, TrendingDown, TrendingUp } from 'lucide-react';
import type { GameState } from '../../types/game';
import { PARAMS } from '@/data/causal';
import { fmtBudget } from '@/lib/format';
import { riskLabel } from '@/lib/risk';
import { defeatRisk } from '@/lib/boardView';
import { defeatWarnings, SIMPLE_GROUPS, simpleIndicators, type SimpleIndicator } from '@/lib/simpleView';

const TONE: Record<string, string> = { good: 'text-sala-good', neutral: 'text-sala-warn', bad: 'text-sala-bad' };

function Arrow({ ind }: { ind: SimpleIndicator }) {
  if (ind.delta === null || Math.abs(ind.delta) < 0.4) return <Minus size={13} className="text-sala-dim" aria-label="estable" />;
  const cls = ind.delta > 0 === ind.goodWhenUp ? 'text-sala-good' : 'text-sala-bad';
  return ind.delta > 0 ? <TrendingUp size={14} className={cls} aria-label="sube" /> : <TrendingDown size={14} className={cls} aria-label="baja" />;
}

/** Voto y caja, seguidos de dos grupos breves con indicadores efectivos del motor. */
export function StatusStrip({ gameState, mobile = false }: { gameState: GameState; mobile?: boolean }) {
  const c = gameState.causal;
  const iv = c.political.iv;
  const risk = defeatRisk(iv);
  const target = PARAMS.VOTOS_PARA_GANAR;
  const indicators = simpleIndicators(gameState);
  return (
    <div className="relative">
      <section
        aria-label="El país"
        tabIndex={mobile ? 0 : undefined}
        className={mobile
          ? 'flex gap-px overflow-x-auto snap-x rounded-xl border border-rule bg-rule [scrollbar-width:thin] [&>*]:snap-start'
          : 'grid grid-cols-[260px_minmax(0,1fr)_minmax(0,1fr)] gap-px bg-rule border-b border-rule'}
      >
        <div className={`grid grid-cols-2 gap-px bg-rule ${mobile ? 'flex-none w-[270px]' : ''}`}>
          <div className="bg-surface px-3 py-2 border-t-[3px] border-t-sala-violet">
            <span className="sr-eyebrow block !text-sala-violet whitespace-nowrap">Voto</span>
            <strong className={`block text-[23px] leading-tight font-bold font-mono ${iv >= target ? 'text-ink' : 'text-sala-bad'}`}>{Math.round(iv)}%</strong>
            <div className="relative h-1 my-1 rounded-full bg-sunken">
              <i className="absolute inset-y-0 left-0 rounded-full bg-sala-violet" style={{ width: `${Math.max(0, Math.min(100, iv))}%` }} />
              <i className="absolute -top-[3px] w-0.5 h-[10px] bg-sala-navy" style={{ left: `${target}%` }} />
            </div>
            <small className="block text-[10px] text-sala-muted">meta {target}% · riesgo {riskLabel(risk).toLowerCase()}</small>
          </div>
          <div className="bg-surface px-3 py-2 border-t-[3px] border-t-sala-blue">
            <span className="sr-eyebrow block !text-sala-blue">Caja</span>
            <strong className={`block text-[23px] leading-tight font-bold font-mono whitespace-nowrap ${c.caja >= 0 ? 'text-ink' : 'text-sala-bad'}`}>{fmtBudget(c.caja)}</strong>
            <small className={`block text-[10px] mt-1.5 ${c.caja >= 0 ? 'text-sala-muted' : 'text-sala-bad'}`}>{c.caja >= 0 ? 'Con fondos' : 'En rojo: se emite'}</small>
          </div>
        </div>
        {SIMPLE_GROUPS.map(group => (
          <section key={group} aria-label={group} className={`bg-surface border-t-[3px] border-t-rule py-2 ${mobile ? 'flex-none w-[430px]' : 'min-w-0'}`}>
            <h2 className="px-2.5 text-[9px] font-bold uppercase tracking-[0.12em] text-sala-muted">{group}</h2>
            <div className="grid grid-cols-4 divide-x divide-rule mt-1.5">
              {indicators.filter(ind => ind.group === group).map(ind => (
                <div key={ind.key} className="px-2.5 min-w-0">
                  <span className="block text-[11px] text-sala-muted">{ind.label}</span>
                  <span className="flex items-start gap-1 mt-1">
                    <b className={`text-[12px] xl:text-[13px] leading-snug ${TONE[ind.tone]}`}>{ind.word}</b>
                    <span className="shrink-0 mt-0.5"><Arrow ind={ind} /></span>
                  </span>
                </div>
              ))}
            </div>
          </section>
        ))}
      </section>
      {mobile && <div className="pointer-events-none absolute inset-y-px right-px w-8 rounded-r-xl bg-gradient-to-l from-surface to-transparent flex items-center justify-end pr-1" aria-hidden="true"><ChevronRight size={17} className="text-sala-muted" /></div>}
    </div>
  );
}

/** Derrotas en camino: rojo si el próximo cierre puede terminar el gobierno. */
export function DefeatAlerts({ gameState, className = '' }: { gameState: GameState; className?: string }) {
  const warnings = defeatWarnings(gameState);
  if (warnings.length === 0) return null;
  return (
    <div className={`space-y-2 ${className}`} aria-label="Peligro para tu gobierno">
      {warnings.map(w => (
        <p key={w.id} role="alert" className={`flex items-start gap-2 rounded-lg px-3.5 py-2.5 text-[13px] font-semibold leading-snug ${w.critical ? 'bg-red-500/10 text-sala-bad border border-red-500/30' : 'bg-amber-500/10 text-sala-warn border border-amber-500/25'}`}>
          <AlertTriangle size={16} className="mt-px flex-shrink-0" />{w.text}
        </p>
      ))}
    </div>
  );
}
