import { AlertTriangle, Minus, TrendingDown, TrendingUp } from 'lucide-react';
import type { GameState } from '../../types/game';
import { PARAMS } from '@/data/causal';
import { fmtBudget } from '@/lib/format';
import { riskLabel } from '@/lib/risk';
import { defeatRisk } from '@/lib/boardView';
import { defeatWarnings, simpleIndicators, type SimpleIndicator } from '@/lib/simpleView';

const TONE: Record<string, string> = { good: 'text-sala-good', neutral: 'text-sala-warn', bad: 'text-sala-bad' };

function Arrow({ ind }: { ind: SimpleIndicator }) {
  if (ind.delta === null || Math.abs(ind.delta) < 0.4) return <Minus size={13} className="text-sala-dim" aria-label="estable" />;
  const cls = ind.delta > 0 === ind.goodWhenUp ? 'text-sala-good' : 'text-sala-bad';
  return ind.delta > 0 ? <TrendingUp size={14} className={cls} aria-label="sube" /> : <TrendingDown size={14} className={cls} aria-label="baja" />;
}

/**
 * Franja de arriba del modo simple (como en la B): voto con la meta, caja y
 * los 7 indicadores del país en chips (palabra, color y flecha). En el
 * celular se desliza de costado.
 */
export function StatusStrip({ gameState, mobile = false }: { gameState: GameState; mobile?: boolean }) {
  const c = gameState.causal;
  const iv = c.political.iv;
  const risk = defeatRisk(iv);
  const target = PARAMS.VOTOS_PARA_GANAR;
  const chip = `${mobile ? 'flex-none min-w-[112px]' : 'flex-1 min-w-[112px]'} bg-surface px-3.5 py-2.5`;
  return (
    <section
      aria-label="El país"
      className={
        mobile
          ? 'flex gap-px overflow-x-auto rounded-xl border border-rule bg-rule [scrollbar-width:none]'
          : 'flex flex-wrap gap-px bg-rule border-b border-rule'
      }
    >
      <div className={`${chip} ${mobile ? 'min-w-[140px]' : 'min-w-[190px]'} border-t-[3px] border-t-sala-violet`}>
        <span className="sr-eyebrow block !text-sala-violet">Intención de voto</span>
        <strong className={`block text-[24px] leading-tight font-bold font-mono ${iv >= target ? 'text-ink' : 'text-sala-bad'}`}>{Math.round(iv)}%</strong>
        <div className="relative h-[4px] my-1 rounded-full bg-sunken">
          <i className="absolute inset-y-0 left-0 rounded-full bg-sala-violet" style={{ width: `${Math.min(100, iv)}%` }} />
          <i className="absolute -top-[3px] w-0.5 h-[10px] bg-sala-navy" style={{ left: `${target}%` }} />
        </div>
        <small className="block text-[11px] text-sala-muted">meta {target}% · riesgo {riskLabel(risk).toLowerCase()}</small>
      </div>
      <div className={`${chip} ${mobile ? 'min-w-[130px]' : 'min-w-[170px]'} border-t-[3px] border-t-sala-blue`}>
        <span className="sr-eyebrow block !text-sala-blue">Caja</span>
        <strong className={`block text-[24px] leading-tight font-bold font-mono ${c.caja >= 0 ? 'text-ink' : 'text-sala-bad'}`}>{fmtBudget(c.caja)}</strong>
        <small className={`block text-[11px] mt-1.5 ${c.caja >= 0 ? 'text-sala-muted' : 'text-sala-bad'}`}>{c.caja >= 0 ? 'Con fondos' : 'En rojo: el Tesoro emite'}</small>
      </div>
      {simpleIndicators(gameState).map(ind => (
        <div key={ind.key} className={`${chip} border-t-[3px] border-t-rule`}>
          <span className="sr-eyebrow block !text-sala-muted">{ind.label}</span>
          <span className="flex items-center gap-1.5 mt-1.5">
            <b className={`text-[15px] ${TONE[ind.tone]}`}>{ind.word}</b>
            <Arrow ind={ind} />
          </span>
        </div>
      ))}
    </section>
  );
}

/** Derrotas en camino (modo simple): suave cerca del umbral, rojo si el próximo cierre puede terminar el gobierno. */
export function DefeatAlerts({ gameState, className = '' }: { gameState: GameState; className?: string }) {
  const warnings = defeatWarnings(gameState);
  if (warnings.length === 0) return null;
  return (
    <div className={`space-y-2 ${className}`} aria-label="Peligro para tu gobierno">
      {warnings.map(w => (
        <p
          key={w.id}
          role="alert"
          className={`flex items-start gap-2 rounded-lg px-3.5 py-2.5 text-[13px] font-semibold leading-snug ${
            w.critical ? 'bg-red-500/10 text-sala-bad border border-red-500/30' : 'bg-amber-500/10 text-sala-warn border border-amber-500/25'
          }`}
        >
          <AlertTriangle size={16} className="mt-px flex-shrink-0" />
          {w.text}
        </p>
      ))}
    </div>
  );
}
