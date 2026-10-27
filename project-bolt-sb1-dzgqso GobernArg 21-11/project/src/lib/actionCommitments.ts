import { calendarFor, equivalentTurns, type CalendarSource } from './calendar';
import { EFFECTS_BY_ACTION } from '@/data/causal';
import { fmtBudgetDelta, fmtNumber } from './format';

export interface FiscalCommitment {
  key: string;
  text: string;
  conditional: boolean;
}

/** Costos catalogados que el jugador necesita conocer; no pronostica indicadores. */
export function actionFiscalCommitments(actionId: string, { loanDiscount = 0, calendar }: { loanDiscount?: number; calendar?: CalendarSource } = {}): FiscalCommitment[] {
  const periods = calendarFor(calendar);
  const commitments: FiscalCommitment[] = [];
  for (const row of EFFECTS_BY_ACTION[actionId] ?? []) {
    if (row.magnitude === null || row.mode !== 'DELTA') continue;
    const conditional = !!row.condition || !!row.repetition || row.kind === 'CONDITIONAL' || row.kind === 'REPETITION' || row.duration === 99;
    const condition = row.repetition || row.kind === 'REPETITION' ? ' · si se reitera' : conditional ? ' · según condiciones' : '';
    const offset = equivalentTurns(row.offset, calendar);
    const duration = typeof row.duration === 'number' ? equivalentTurns(row.duration, calendar) : row.duration;
    const starts = offset === 0 ? 'desde este cierre' : offset === 1 ? `desde el próximo ${periods.periodLabel}` : `comienza en ${offset} ${periods.periodLabelPlural}`;
    let text: string;
    if (row.target === 'GASTO_CORR' && row.magnitude > 0) {
      // DELTA modifica el gasto fijo; duration=1 no lo vuelve un gasto de un solo cierre.
      text = `Gasto fijo: ${fmtBudgetDelta(row.magnitude)}/turno · permanente · ${starts}`;
    } else if (row.target === 'CAJA' && row.magnitude < 0) {
      const recurring = row.kind === 'PERSISTENT' || (typeof row.duration === 'number' && row.duration > 1);
      const horizon = row.duration === 99 || row.duration === 'PERM' ? 'mientras esté vigente' : row.duration === 'plazo' ? 'durante el plazo del acuerdo' : `durante ${duration} ${duration === 1 ? periods.periodLabel : periods.periodLabelPlural}`;
      text = recurring
        ? `Costo de caja: ${fmtBudgetDelta(row.magnitude)}/turno · ${horizon} · ${starts}`
        : `Cargo de caja: ${fmtBudgetDelta(row.magnitude)} · ${offset === 0 ? 'en este cierre' : `en ${offset} ${offset === 1 ? periods.periodLabel : periods.periodLabelPlural}`}`;
    } else if (row.target === 'INGRESO_MULT' && row.magnitude < 0) {
      const pct = Math.abs(row.magnitude * 100);
      text = `Menor recaudación: ${fmtNumber(pct, Number.isInteger(pct) ? 0 : 1)}% de la base · permanente · ${starts}`;
    } else if (row.target === 'DEUDA' && row.magnitude > 0) {
      // Coincide con scheduleActionEffects: el descuento afecta sólo deuda IMMEDIATE positiva.
      const principal = row.magnitude * (row.kind === 'IMMEDIATE' ? 1 - loanDiscount : 1);
      text = `Deuda ${conditional ? 'adicional' : 'base'}: ${fmtBudgetDelta(principal)} · con intereses · ${starts}`;
    } else continue;
    commitments.push({ key: row.id, text: text + condition, conditional });
  }
  return commitments;
}
