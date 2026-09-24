import { Info, TrendingUp, TrendingDown, Minus, Wallet } from 'lucide-react';
import { GameState } from '../types/game';
import { InfoTooltip } from './InfoTooltip';
import { getValueRisk, riskColor, riskLabel, type Risk } from '@/lib/risk';
import { fmtBudget, fmtBudgetDelta } from '@/lib/format';
import { PARAMS } from '@/data/causal';
import { effective, debtService, viewRef } from '@/engine/causal';

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
  /** Marca de referencia en la barra (0 = sin marca). */
  target: number;
  targetLabel?: string;
  tooltipDetail: string;
  trend: number | null;
}

function TrendChip({ value, inverse = false }: { value: number | null; inverse?: boolean }) {
  if (value === null) {
    return (
      <span className="flex items-center gap-0.5 text-[10px] text-muted-foreground/70 font-mono">
        <Minus size={10} />—
      </span>
    );
  }
  if (Math.round(value) === 0) {
    return (
      <span className="flex items-center gap-0.5 text-[10px] text-muted-foreground font-mono">
        <Minus size={10} />0
      </span>
    );
  }
  const positive = value > 0;
  const good = inverse ? !positive : positive;
  return (
    <span className={`flex items-center gap-0.5 text-[10px] font-mono ${good ? 'text-emerald-400' : 'text-red-400'}`}>
      {positive ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
      {positive ? '+' : ''}
      {Math.round(value)}
    </span>
  );
}

function IndicatorCardView({ card }: { card: IndicatorCard }) {
  const risk: Risk = getValueRisk(card.value, card.max, card.inverseRisk);
  const pct = Math.min(100, Math.max(0, (card.value / card.max) * 100));
  const targetPct = card.target > 0 ? Math.min(100, Math.max(0, (card.target / card.max) * 100)) : 0;
  const displayLabel = card.inverseRisk
    ? { bajo: 'BAJO', medio: 'MEDIO', alto: 'ALTO', critico: 'CRÍTICO' }[risk]
    : riskLabel(risk).toUpperCase();

  return (
    <InfoTooltip
      content={
        <div className="flex flex-col gap-1 max-w-[260px]">
          <div className="font-semibold text-xs text-white">{card.label}</div>
          <div className="text-[10px] text-white/70">{card.tooltipDetail}</div>
        </div>
      }
    >
      <div className="flex-1 min-w-[170px] rounded-xl border border-white/8 bg-[#0f1e38] p-3.5 shadow-lg cursor-help transition-all hover:border-white/15">
        <div className="flex items-center justify-between mb-1">
          <span className="text-[10px] text-white/40 uppercase tracking-widest font-bold flex items-center gap-1">
            {card.label}
            <Info size={10} className="opacity-40" />
          </span>
          <TrendChip value={card.trend} inverse={card.inverseRisk} />
        </div>
        <div className="flex items-baseline gap-1 mb-2.5">
          <span className={`font-mono text-2xl font-bold leading-none ${riskColor(risk)}`}>
            {Math.round(card.value)}
          </span>
          <span className="text-[12px] font-semibold text-white/50">{card.unit}</span>
        </div>
        <div className="relative h-1.5 w-full overflow-hidden rounded-full bg-white/8">
          <div
            className={`absolute inset-y-0 left-0 rounded-full transition-all duration-500 ${riskColor(risk, 'bg')}`}
            style={{ width: `${pct}%` }}
          />
          {card.target > 0 && (
            <div
              className="absolute inset-y-0 w-0.5 bg-white/70 shadow"
              style={{ left: `${targetPct}%` }}
              title={card.targetLabel}
            />
          )}
        </div>
        <div className="flex items-center justify-between mt-2">
          <span className="text-[9px] font-mono text-white/40">
            {card.targetLabel ? card.targetLabel : `Escala 0-${card.max}`}
          </span>
          <span className={`text-[9px] font-bold uppercase tracking-wider ${riskColor(risk)}`}>
            {displayLabel}
          </span>
        </div>
      </div>
    </InfoTooltip>
  );
}

function BudgetIndicatorCard({ gameState }: { gameState: GameState }) {
  const c = gameState.causal;
  const last = c.records[c.records.length - 1];
  const result = last?.fiscal.resultado ?? null;
  const healthy = c.caja >= 0;
  const valueColor = healthy ? 'text-emerald-400' : 'text-red-400';

  return (
    <InfoTooltip
      content={
        <div className="flex flex-col gap-1 max-w-[260px]">
          <div className="font-semibold text-xs text-white">Caja del Tesoro</div>
          {last && (
            <div className="text-[11px] text-white/70 space-y-0.5 font-mono">
              <div>Recaudación: {fmtBudget(last.fiscal.ingresos)}</div>
              <div>Gasto corriente: −{fmtBudget(last.fiscal.gastoCorriente)}</div>
              <div>Intereses de deuda: −{fmtBudget(last.fiscal.servicioDeuda)}</div>
              {last.fiscal.costoAcciones !== 0 && <div>Políticas del turno: −{fmtBudget(last.fiscal.costoAcciones)}</div>}
              {last.fiscal.financiamiento !== 0 && <div>Financiamiento: {fmtBudgetDelta(last.fiscal.financiamiento)}</div>}
            </div>
          )}
          <div className="text-[10px] text-white/50 mt-1">
            Deuda: {fmtBudget(c.deuda)} (intereses {fmtBudget(debtService(c))}/turno). Gasto fijo: {fmtBudget(c.gastoCorr)}/turno.
          </div>
        </div>
      }
    >
      <div className="flex-1 min-w-[170px] rounded-xl border border-white/8 bg-[#0f1e38] p-3.5 shadow-lg cursor-help transition-all hover:border-white/15">
        <div className="flex items-center justify-between mb-1">
          <span className="text-[10px] text-white/40 uppercase tracking-widest font-bold flex items-center gap-1">
            <Wallet size={10} className="opacity-60" />
            Presupuesto / Caja
            <Info size={10} className="opacity-40" />
          </span>
        </div>
        <div className="flex items-baseline gap-1 mb-2.5">
          <span className={`font-mono text-2xl font-bold leading-none ${valueColor}`}>
            {fmtBudget(c.caja)}
          </span>
        </div>
        <div className="relative h-1.5 w-full overflow-hidden rounded-full bg-white/8">
          <div
            className={`absolute inset-y-0 left-0 rounded-full transition-all duration-500 ${healthy ? 'bg-emerald-400' : 'bg-red-400'}`}
            style={{ width: `${Math.min(100, Math.max(10, (c.caja / 3000) * 100))}%` }}
          />
        </div>
        <div className="flex items-center justify-between mt-2">
          <span className="text-[9px] font-mono text-white/40">
            {result === null ? 'Recaudación activa' : `Balance ${fmtBudgetDelta(result)}`}
          </span>
          <span className={`text-[9px] font-bold uppercase tracking-wider ${valueColor}`}>
            {healthy ? 'OK' : 'EN ROJO'}
          </span>
        </div>
      </div>
    </InfoTooltip>
  );
}

export function IndicatorsPanel({ gameState }: IndicatorsPanelProps) {
  const c = gameState.causal;
  const p = c.political;
  const last = c.records[c.records.length - 1];
  const conf = effective(c, 'CONF', viewRef(c));

  const cards: IndicatorCard[] = [
    {
      id: 'aprobacion',
      label: 'Aprobación',
      value: p.apro,
      max: 100,
      unit: '%',
      inverseRisk: false,
      target: 0,
      tooltipDetail: 'Aprobación de gestión: resume cuán satisfechos están los actores con peso electoral (clase media, sectores populares, trabajadores, PyMEs…). No se compra: sube si les va mejor.',
      trend: last ? p.apro - last.politicalBefore.apro : null,
    },
    {
      id: 'gobernabilidad',
      label: 'Gobernabilidad',
      value: p.gob,
      max: 100,
      unit: '',
      inverseRisk: false,
      target: PARAMS.GOB_CRISIS_UMBRAL,
      targetLabel: `Crisis < ${PARAMS.GOB_CRISIS_UMBRAL}`,
      tooltipDetail: `Capacidad de gobernar: apoyo en el Congreso, cooperación de los actores organizados y paz social. Dos trimestres por debajo de ${PARAMS.GOB_CRISIS_UMBRAL} abren un juicio político.`,
      trend: last ? p.gob - last.politicalBefore.gob : null,
    },
    {
      id: 'conflictividad',
      label: 'Conflictividad',
      value: conf,
      max: 100,
      unit: '',
      inverseRisk: true,
      target: 55,
      targetLabel: 'Sobre 55 frena la economía',
      tooltipDetail: 'Protestas, paros y cortes. La alimentan los actores descontentos (paros, piquetes) y la exclusión; se disipa sola con el tiempo.',
      trend: last ? last.indicatorsAfter.CONF - last.indicatorsBefore.CONF : null,
    },
    {
      id: 'voto',
      label: 'Intención de Voto',
      value: p.iv,
      max: 100,
      unit: '%',
      inverseRisk: false,
      target: PARAMS.VOTOS_PARA_GANAR,
      targetLabel: `Para ganar: ${PARAMS.VOTOS_PARA_GANAR}%`,
      tooltipDetail: 'Humor social de los actores (65%), aparato político (10%) e imagen presidencial (25%). La economía entra sólo a través de lo que siente cada actor.',
      trend: last ? p.iv - last.politicalBefore.iv : null,
    },
  ];

  return (
    <section className="space-y-3">
      <div className="flex flex-wrap gap-2.5">
        {cards.map(card => <IndicatorCardView key={card.id} card={card} />)}
        <BudgetIndicatorCard gameState={gameState} />
      </div>
    </section>
  );
}

export type { Risk };
