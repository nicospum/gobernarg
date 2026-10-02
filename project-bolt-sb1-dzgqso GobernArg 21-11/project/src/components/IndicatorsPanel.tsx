import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { GameState } from '../types/game';
import type { Risk } from '@/lib/risk';
import { fmtBudget, fmtBudgetDelta } from '@/lib/format';
import { PARAMS } from '@/data/causal';
import { effective, debtService, viewRef } from '@/engine/causal';

export interface IndicatorCard {
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

export function TrendChip({ value, inverse = false }: { value: number | null; inverse?: boolean }) {
  if (value === null) {
    return (
      <span className="flex items-center gap-0.5 text-[10px] text-muted-foreground font-mono">
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

/** Desglose de la caja: el cartel de la tarjeta y la hoja del celular. */
export function BudgetDetails({ gameState }: { gameState: GameState }) {
  const c = gameState.causal;
  const last = c.records[c.records.length - 1];
  return (
    <div className="flex flex-col gap-1 max-w-[260px]">
      <div className="font-semibold text-xs text-ink">Caja del Tesoro</div>
      {last && (
        <div className="text-[11px] text-ink/70 space-y-0.5 font-mono">
          <div>Recaudación: {fmtBudget(last.fiscal.ingresos)}</div>
          <div>Gasto corriente: −{fmtBudget(last.fiscal.gastoCorriente)}</div>
          <div>Intereses de deuda: −{fmtBudget(last.fiscal.servicioDeuda)}</div>
          {last.fiscal.costoAcciones !== 0 && <div>Políticas del turno: −{fmtBudget(last.fiscal.costoAcciones)}</div>}
          {last.fiscal.financiamiento !== 0 && <div>Financiamiento: {fmtBudgetDelta(last.fiscal.financiamiento)}</div>}
        </div>
      )}
      <div className="text-[10px] text-ink/70 mt-1">
        Deuda: {fmtBudget(c.deuda)} (intereses {fmtBudget(debtService(c))}/turno). Gasto fijo: {fmtBudget(c.gastoCorr)}/turno.
      </div>
    </div>
  );
}

/** Los 4 indicadores políticos principales (tablero y barra del celular). */
export function indicatorCards(gameState: GameState): IndicatorCard[] {
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
      label: 'Intención de voto',
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
  return cards;
}

export type { Risk };
