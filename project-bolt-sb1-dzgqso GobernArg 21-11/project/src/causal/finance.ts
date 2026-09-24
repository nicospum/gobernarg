import { BALANCE } from './catalog';
import { DIFFICULTIES } from './campaignCatalog';
import { fiscalMargin, totalArrears, totalDebt } from './selectors';
import type { Arrear, CausalState, EffectInstance, FiscalReport } from './types';

export const activeAt = (effect: EffectInstance, turn: number) => effect.startTurn <= turn
  && (effect.endExclusive === null || turn < effect.endExclusive);

/** Accrual reports and cash payments are separate. Unpaid amounts stay in the ledger. */
export function closeFinances(state: CausalState): FiscalReport {
  let revenue = BALANCE.revenue_base + BALANCE.activity_tax * (state.indicators.actividad - 50);
  let recurringExpense = BALANCE.spending_base;
  if (state.campaign) {
    revenue *= DIFFICULTIES[state.campaign.difficulty].revenue;
    recurringExpense += state.campaign.advisors.reduce((sum, advisor) => sum + advisor.level * 10, 0);
    if (state.campaign.strategy === 'abrirse') recurringExpense += 20;
  }
  let oneOffNet = 0;
  for (const effect of state.effects) {
    if (effect.kind !== 'ledger' || !activeAt(effect, state.turn) || effect.lastAppliedTurn === state.turn) continue;
    switch (effect.target) {
      case 'revenue_recurring': revenue += effect.magnitude; break;
      case 'expense_recurring': recurringExpense += effect.magnitude; break;
      case 'revenue_once': oneOffNet += effect.magnitude; break;
      case 'expense_once': oneOffNet -= effect.magnitude; break;
      // Issuance is exclusively booked at confirmation, never at close.
    }
    effect.lastAppliedTurn = state.turn;
  }
  revenue = Math.max(0, revenue);
  recurringExpense = Math.max(0, recurringExpense);
  state.cash += revenue + Math.max(0, oneOffNet);
  const due: Arrear[] = state.arrears.map(arrear => ({ ...arrear }));
  const basic = Math.min(BALANCE.spending_base, recurringExpense);
  due.push({ id: `basic:${state.turn}`, category: 'basic', amount: basic, dueTurn: state.turn });
  due.push({ id: `program:${state.turn}`, category: 'program', amount: recurringExpense - basic + Math.max(0, -oneOffNet), dueTurn: state.turn });
  let interestDue = 0;
  for (const loan of state.loans) {
    if (loan.outstanding <= 0 || loan.issuedTurn >= state.turn) continue;
    if (loan.pendingInterest && loan.pendingInterest.startTurn <= state.turn) {
      loan.interest = loan.pendingInterest.amount; delete loan.pendingInterest;
    }
    const interest = loan.interest * loan.outstanding / loan.originalPrincipal;
    interestDue += interest;
    due.push({ id: `interest:${loan.id}:${state.turn}`, category: 'interest', amount: interest, dueTurn: state.turn, loanId: loan.id });
    if (loan.dueTurn <= state.turn && !due.some(arrear => arrear.category === 'principal' && arrear.loanId === loan.id)) {
      due.push({ id: `principal:${loan.id}`, category: 'principal', amount: loan.outstanding, dueTurn: loan.dueTurn, loanId: loan.id });
    }
  }
  const priority = { basic: 0, interest: 1, program: 2, principal: 3 };
  due.sort((a, b) => priority[a.category] - priority[b.category] || a.dueTurn - b.dueTurn || a.id.localeCompare(b.id));
  state.arrears = [];
  let interestPaid = 0, principalPaid = 0, recurringPaid = 0;
  for (const item of due) {
    const paid = Math.min(state.cash, item.amount);
    state.cash -= paid;
    if (item.category === 'interest') interestPaid += paid;
    else if (item.category === 'principal') {
      principalPaid += paid;
      const loan = state.loans.find(candidate => candidate.id === item.loanId)!;
      loan.outstanding = Math.max(0, loan.outstanding - paid);
    } else recurringPaid += paid;
    const unpaid = item.amount - paid;
    if (unpaid > 1e-8) state.arrears.push({ ...item, amount: unpaid });
  }
  const executions = state.history.filter(item => item.turn === state.turn);
  const principalReceived = state.loans.filter(loan => loan.issuedTurn === state.turn).reduce((sum, loan) => sum + loan.originalPrincipal, 0);
  const issuance = executions.filter(item => item.actionId === 'emitir_dinero').reduce((sum, item) => sum + item.cashDelta, 0);
  const executionNet = executions.reduce((sum, execution) => sum + execution.cashDelta, 0) - principalReceived - issuance;
  const debt = totalDebt(state), arrears = totalArrears(state);
  state.crisisTurns = arrears > 0 ? state.crisisTurns + 1 : 0;
  return {
    turn: state.turn, openingCash: state.openingCash, executionNet: executionNet + oneOffNet,
    revenue, recurringExpense, recurringPaid, interestDue, interestPaid, principalReceived, principalPaid,
    issuance, closingCash: state.cash, debt, arrears,
    result: executionNet + oneOffNet + revenue - recurringExpense - interestDue,
    margin: fiscalMargin(revenue, recurringExpense, interestDue, debt, arrears),
  };
}

/** Known obligations only. This is a planning forecast, not extra simulated income. */
export function fiscalForecast(state: CausalState, horizon = 4) {
  const projected = structuredClone(state);
  return Array.from({ length: horizon }, () => {
    const turn = projected.turn;
    const principal = projected.loans.filter(loan => loan.dueTurn <= turn)
      .reduce((sum, loan) => sum + loan.outstanding, 0);
    // Use the same payment priority and remaining-principal interest as the real ledger.
    // Activity stays fixed, but unpaid loans continue accruing interest after maturity.
    const report = closeFinances(projected);
    const cash = projected.cash - totalArrears(projected);
    projected.turn += 1;
    projected.openingCash = projected.cash;
    return { turn, income: report.revenue, expense: report.recurringExpense,
      interest: report.interestDue, principal, cash };
  });
}
