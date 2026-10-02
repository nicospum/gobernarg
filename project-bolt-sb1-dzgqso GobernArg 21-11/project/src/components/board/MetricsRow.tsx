import type { ReactNode } from 'react';
import { BarChart3, Gauge, Scale, Wallet, Waves, type LucideIcon } from 'lucide-react';
import type { GameState } from '../../types/game';
import { InfoTooltip } from '../InfoTooltip';
import { BudgetDetails, indicatorCards, type IndicatorCard } from '../IndicatorsPanel';
import { getValueRisk, riskLabel, type Risk } from '@/lib/risk';
import { fmtBudget, fmtBudgetDelta } from '@/lib/format';
import { history, type SeriesKey } from '@/lib/boardView';
import { detailed } from '@/lite/config';
import { StatusStrip } from './StatusStrip';

/** Color de acento de cada métrica (variables de :root). */
const ACCENT: Record<string, string> = {
  aprobacion: 'var(--sun)',
  gobernabilidad: 'var(--good)',
  conflictividad: 'var(--coral)',
  voto: 'var(--violet)',
  caja: 'var(--blue)',
};
const ICON: Record<string, LucideIcon> = {
  aprobacion: Gauge,
  gobernabilidad: Scale,
  conflictividad: Waves,
  voto: BarChart3,
  caja: Wallet,
};
const SERIES: Record<string, SeriesKey> = {
  aprobacion: 'apro',
  gobernabilidad: 'gob',
  conflictividad: 'conf',
  voto: 'iv',
  caja: 'caja',
};

const RISK_TONE: Record<Risk, string> = {
  bajo: 'text-sala-good',
  medio: 'text-sala-warn',
  alto: 'text-sala-bad',
  critico: 'text-sala-bad',
};

/** Curva con la historia real de la métrica; no se dibuja sin al menos dos puntos. */
export function Sparkline({ values, color, label }: { values: number[]; color: string; label: string }) {
  if (values.length < 2) return null;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min || 1;
  const pts = values
    .map((v, i) => `${((i / (values.length - 1)) * 88 + 1).toFixed(1)},${(24 - ((v - min) / span) * 21).toFixed(1)}`)
    .join(' ');
  return (
    <svg viewBox="0 0 90 26" className="h-7 w-20 flex-shrink-0" role="img" aria-label={`${label}: evolución de los últimos ${values.length} registros`}>
      <polyline points={pts} fill="none" stroke={`rgb(${color})`} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function trendNote(card: IndicatorCard): string {
  if (card.trend === null) return 'Primer turno: todavía sin variación';
  const d = Math.round(card.trend);
  if (d === 0) return 'Sin cambios desde el último turno';
  return `${d > 0 ? '+' : '−'}${Math.abs(d)} ${card.unit === '%' ? 'pts' : 'puntos'} desde el último turno`;
}

function Metric({ id, label, value, note, status, statusTone, series, detail, valueClass }: {
  id: string;
  label: string;
  value: string;
  /** Modo simple: palabra en vez de número (otro tamaño y color). */
  valueClass?: string;
  note: string;
  status?: string;
  statusTone?: string;
  series: number[];
  detail: ReactNode;
}) {
  const Icon = ICON[id];
  const accent = ACCENT[id];
  const curve = series.length >= 2;
  return (
    <InfoTooltip title={label} content={detail}>
      <div
        className="bg-surface px-4 py-3.5 min-h-[112px] cursor-help border-t-[3px] text-left transition-colors hover:bg-sunken/40"
        style={{ borderTopColor: `rgb(${accent})` }}
      >
        <div className="flex items-center justify-between" style={{ color: `rgb(${accent})` }}>
          <span className="sr-eyebrow">{label}</span>
          <Icon size={15} />
        </div>
        <div className="flex items-center justify-between gap-2 mt-2">
          <strong className={valueClass ?? 'text-[28px] leading-none font-bold tracking-tight text-ink font-mono'}>{value}</strong>
          {curve ? (
            <Sparkline values={series} color={accent} label={label} />
          ) : status ? (
            <span className={`sr-pill ${statusTone ?? ''}`}>{status}</span>
          ) : null}
        </div>
        <div className="text-[11px] text-sala-muted mt-2 leading-snug">{note}</div>
      </div>
    </InfoTooltip>
  );
}

/** Fila de las 5 métricas principales (aprobación, gobernabilidad, conflictividad, voto y caja). */
export function MetricsRow({ gameState, className = '' }: { gameState: GameState; className?: string }) {
  // Modo simple: franja con voto, caja y los 7 indicadores del país (como en la B).
  if (!detailed()) return <StatusStrip gameState={gameState} />;
  const cards = indicatorCards(gameState);
  const c = gameState.causal;
  const last = c.records[c.records.length - 1];
  const result = last?.fiscal.resultado ?? null;

  return (
    <section aria-label="Indicadores principales" className={`grid grid-cols-2 lg:grid-cols-5 gap-px bg-rule border-b border-rule ${className}`}>
      {cards.map(card => {
        const risk = getValueRisk(card.value, card.max, card.inverseRisk);
        const statusText = card.id === 'conflictividad'
          ? { bajo: 'Baja', medio: 'Moderada', alto: 'Alta', critico: 'Crítica' }[risk]
          : riskLabel(risk);
        return (
          <Metric
            key={card.id}
            id={card.id}
            label={card.label}
            value={`${Math.round(card.value)}${card.unit}`}
            note={card.targetLabel ? `${trendNote(card)} · ${card.targetLabel}` : trendNote(card)}
            status={card.id === 'conflictividad' ? statusText : `Riesgo ${statusText.toLowerCase()}`}
            statusTone={RISK_TONE[risk]}
            series={history(gameState, SERIES[card.id])}
            detail={
              <div className="flex flex-col gap-1 max-w-[260px]">
                <div className="font-semibold text-xs text-ink">{card.label}</div>
                <div className="text-[10px] text-ink/70">{card.tooltipDetail}</div>
              </div>
            }
          />
        );
      })}
      <Metric
        id="caja"
        label="Caja disponible"
        value={fmtBudget(c.caja)}
        note={result === null ? 'Recaudación activa' : `Resultado fiscal del último turno: ${fmtBudgetDelta(result)}`}
        status={c.caja >= 0 ? 'Con fondos' : 'En rojo'}
        statusTone={c.caja >= 0 ? 'text-sala-good' : 'text-sala-bad'}
        series={history(gameState, 'caja')}
        detail={<BudgetDetails gameState={gameState} />}
      />
    </section>
  );
}
