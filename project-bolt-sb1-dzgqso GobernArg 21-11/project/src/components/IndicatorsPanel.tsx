import { Info, TrendingUp, TrendingDown, Minus, Wallet } from 'lucide-react';
import { GameState } from '../types/game';
import { InfoTooltip } from './InfoTooltip';
import { getValueRisk, riskColor, riskLabel, type Risk } from '@/lib/risk';
import { fmtBudget } from '@/lib/format';
import { getGlobalTurn } from '../engine/engineShared';

interface IndicatorsPanelProps {
  gameState: GameState;
}

interface IndicatorCard {
  id: string;
  label: string;
  value: number;
  max: number;
  unit: string;
  inverseRisk: boolean;
  target: number;
  tooltipDetail: string;
}

// Umbrales mínimos del cargo (target para popularidad/estabilidad)
const POSITION_THRESHOLDS: Record<string, { popularity: number; stability: number }> = {
  intendente: { popularity: 30, stability: 30 },
  gobernador: { popularity: 35, stability: 35 },
  presidente: { popularity: 40, stability: 40 },
};

/** Deriva Conflicto Social de proxies que ya existen en GameState. */
function deriveConflictoSocial(state: GameState): number {
  let conflict = 0;

  if (state.groupMoods) {
    const conflictivos = state.groupMoods.filter(
      (m) => m.mood === 'disconforme' || m.mood === 'enojado' || m.mood === 'radicalizado',
    ).length;
    conflict += conflictivos * 8;
  }

  if (state.groupAgendas) {
    const vencidas = state.groupAgendas.filter(
      (a) => !a.satisfied && a.deadline < getGlobalTurn(state),
    ).length;
    conflict += vencidas * 5;
  }

  conflict += state.consecutiveLowPopularity * 4;
  conflict += state.consecutiveNegativeBudget * 3;

  return Math.min(100, Math.max(0, conflict));
}

/** Tendencia de una serie histórica: último valor vs el anterior. null si no hay datos. */
function seriesTrend(series: number[] | undefined): number | null {
  if (!series || series.length < 2) return null;
  return Math.round(series[series.length - 1] - series[series.length - 2]);
}

function trendLabel(trend: number | null): string {
  if (trend === null) return 'Sin historial';
  if (trend > 0) return `+${trend}`;
  if (trend < 0) return `${trend}`;
  return 'Sin cambios';
}

function TrendChip({ value }: { value: number | null }) {
  if (value === null) {
    return (
      <span className="flex items-center gap-0.5 text-[10px] text-muted-foreground/70 font-mono">
        <Minus size={10} />—
      </span>
    );
  }
  if (value === 0) {
    return (
      <span className="flex items-center gap-0.5 text-[10px] text-muted-foreground font-mono">
        <Minus size={10} />0
      </span>
    );
  }
  const positive = value > 0;
  return (
    <span
      className={`flex items-center gap-0.5 text-[10px] font-mono ${
        positive ? 'text-emerald-400' : 'text-red-400'
      }`}
    >
      {positive ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
      {positive ? '+' : ''}
      {value}
    </span>
  );
}

function IndicatorCardView({
  card,
  trend,
}: {
  card: IndicatorCard;
  trend: number | null;
}) {
  const risk = getValueRisk(card.value, card.max, card.inverseRisk);
  const pct = Math.min(100, Math.max(0, (card.value / card.max) * 100));
  const targetPct = Math.min(100, Math.max(0, (card.target / card.max) * 100));
  const displayLabel = card.inverseRisk
    ? { bajo: 'Bajo', medio: 'Moderado', alto: 'Alto', critico: 'Crítico' }[risk]
    : riskLabel(risk);

  return (
    <InfoTooltip
      content={
        <div className="flex flex-col gap-1">
          <div className="font-semibold text-xs">{card.label}</div>
          <div className="text-[11px] text-muted-foreground">
            Valor: {Math.round(card.value)}
            {card.unit} / {card.max}
            {card.unit}
          </div>
          <div className="text-[11px] text-muted-foreground">
            Tendencia:{' '}
            <span className={trend === null ? '' : trend > 0 ? 'text-emerald-400' : trend < 0 ? 'text-red-400' : ''}>
              {trendLabel(trend)}
            </span>
          </div>
          <div className="text-[10px] text-muted-foreground/70">{card.tooltipDetail}</div>
        </div>
      }
    >
      <div className="flex-1 min-w-0 rounded-lg border border-border bg-card px-3.5 py-2.5 cursor-help">
        {/* Header: label + trend */}
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-semibold flex items-center gap-1">
            {card.label}
            <Info size={9} className="opacity-50" />
          </span>
          <TrendChip value={trend} />
        </div>

        {/* Value + unit */}
        <div className="flex items-baseline gap-1 mb-2">
          <span className={`font-mono text-2xl font-bold leading-none ${riskColor(risk)}`}>
            {Math.round(card.value)}
          </span>
          <span className="text-[11px] text-muted-foreground">{card.unit}</span>
        </div>

        {/* Bar with target marker */}
        <div className="relative h-1.5 w-full overflow-hidden rounded-full bg-white/10">
          <div
            className={`absolute inset-y-0 left-0 rounded-full transition-all duration-500 ${riskColor(risk, 'bg')}`}
            style={{ width: `${pct}%` }}
          />
          {card.target > 0 && (
            <div
              className="absolute inset-y-0 w-px bg-white/60"
              style={{ left: `${targetPct}%` }}
              title={`Target: ${card.target}`}
            />
          )}
        </div>

        {/* Footer: target + risk label */}
        <div className="flex items-center justify-between mt-1.5">
          <span className="text-[9px] text-muted-foreground">
            Target: {card.target}
            {card.unit}
          </span>
          <span className={`text-[9px] font-semibold uppercase tracking-wide ${riskColor(risk)}`}>
            {displayLabel}
          </span>
        </div>
      </div>
    </InfoTooltip>
  );
}

function BudgetIndicatorCard({ budget, trend }: { budget: number; trend: number | null }) {
  const healthy = budget >= 0;
  const valueColor = healthy ? 'text-emerald-400' : 'text-red-400';

  return (
    <InfoTooltip
      content={
        <div className="flex flex-col gap-1">
          <div className="font-semibold text-xs">Presupuesto</div>
          <div className="text-[11px] text-muted-foreground">Saldo actual: {fmtBudget(budget)}</div>
          <div className="text-[11px] text-muted-foreground">
            Tendencia:{' '}
            <span className={trend === null ? '' : trend > 0 ? 'text-emerald-400' : trend < 0 ? 'text-red-400' : ''}>
              {trendLabel(trend)}
            </span>
          </div>
          <div className="text-[10px] text-muted-foreground/70">
            {healthy
              ? 'Presupuesto en equilibrio o superávit.'
              : 'Déficit sostenido (3 turnos consecutivos) puede derivar en crisis.'}
          </div>
        </div>
      }
    >
      <div className="flex-1 min-w-0 rounded-lg border border-border bg-card px-3.5 py-2.5 cursor-help">
        {/* Header: label + trend */}
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-semibold flex items-center gap-1">
            <Wallet size={10} className="opacity-60" />
            Presupuesto
            <Info size={9} className="opacity-50" />
          </span>
          <TrendChip value={trend} />
        </div>

        {/* Value */}
        <div className="flex items-baseline gap-1 mb-2">
          <span className={`font-mono text-2xl font-bold leading-none ${valueColor}`}>
            {fmtBudget(budget)}
          </span>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between mt-1.5">
          <span className="text-[9px] text-muted-foreground">
            {healthy ? 'Superávit / equilibrio' : 'Déficit'}
          </span>
          <span className={`text-[9px] font-semibold uppercase tracking-wide ${valueColor}`}>
            {healthy ? 'Saludable' : 'Riesgo'}
          </span>
        </div>
      </div>
    </InfoTooltip>
  );
}

export function IndicatorsPanel({ gameState }: IndicatorsPanelProps) {
  const thresholds = POSITION_THRESHOLDS[gameState.position] ?? POSITION_THRESHOLDS.intendente;
  const conflicto = deriveConflictoSocial(gameState);
  const popTrend = seriesTrend(gameState.historicalPopularity);
  const budgetTrend = seriesTrend(gameState.historicalBudget);

  const cards: IndicatorCard[] = [
    {
      id: 'popularidad',
      label: 'Popularidad',
      value: gameState.popularity,
      max: 100,
      unit: '%',
      inverseRisk: false,
      target: thresholds.popularity,
      tooltipDetail: `Aprobación general de la gestión. Si baja del umbral del cargo (${thresholds.popularity}%) por 2 turnos consecutivos, perdés.`,
    },
    {
      id: 'estabilidad',
      label: 'Estabilidad',
      value: gameState.stability,
      max: 100,
      unit: '',
      inverseRisk: false,
      target: thresholds.stability,
      tooltipDetail:
        'Nivel de orden institucional y social. Estabilidad baja + popularidad baja puede llevar a impeachment o golpe.',
    },
    {
      id: 'legitimidad',
      label: 'Legitimidad',
      value: gameState.legitimacy,
      max: 100,
      unit: '',
      inverseRisk: false,
      target: 50,
      tooltipDetail:
        'Percepción de autoridad del gobierno. Si baja a 0, las acciones cuestan el doble. Mejora con diplomacia y cultura.',
    },
    {
      id: 'conflicto',
      label: 'Conflicto Social',
      value: conflicto,
      max: 100,
      unit: '',
      inverseRisk: true,
      target: 40,
      tooltipDetail:
        'Nivel de tensión social activa (derivado). Mayor valor = mayor riesgo. Sube por grupos enojados, demandas vencidas, popularidad baja sostenida y déficit crónico.',
    },
    {
      id: 'voto',
      label: 'Intención de Voto',
      value: gameState.votingIntention,
      max: 100,
      unit: '%',
      inverseRisk: false,
      target: 45,
      tooltipDetail:
        'Proyección electoral actual. Mínimo 45% para ganar elecciones. Combina popularidad, estabilidad, presupuesto y apoyo de grupos.',
    },
  ];

  const trends: Record<string, number | null> = {
    popularidad: popTrend,
    estabilidad: null,
    legitimidad: null,
    conflicto: null,
    voto: null,
  };

  return (
    <section className="space-y-3">
      <div className="flex flex-wrap gap-2.5">
        {cards.map((card) => (
          <IndicatorCardView
            key={card.id}
            card={card}
            trend={trends[card.id] ?? null}
          />
        ))}
        <BudgetIndicatorCard budget={gameState.budget} trend={budgetTrend} />
      </div>
    </section>
  );
}

// Re-exporto Risk como tipo para usos externos
export type { Risk };
