import { afterEach, describe, expect, it, vi } from 'vitest';
import { calendarFor, calendarText, equivalentTurns, mandateTurn, periodCaption } from '../lib/calendar';
import { createNewGame, processEndTurn, resolvePendingElection, triggerMidtermStrategy } from '../engine/gameEngine';
import { closeTurn, countExecutions, createCausalState, getAvailability, isPreElection, meet } from '../engine/causal';
import { actionFiscalCommitments } from '../lib/actionCommitments';
import { calendarEventsFor } from '../data/calendar';
import { adaptiveBot } from '../playtest/bots';
import { playGame } from '../playtest/runner';

afterEach(() => vi.restoreAllMocks());
describe('Calendario Light persistido', () => {
  it('las nuevas estándar tienen cuatro años, tres cuatrimestres y mandato de doce turnos', () => {
    const state = createNewGame({ archetype: 'politico', governorName: 'Ana', scenarioId: 'pais_en_calma', seed: 1 });
    expect(calendarFor(state)).toMatchObject({ id: 'light-12', periodsPerYear: 3, midtermTurn: 6, turnsPerMandate: 12, totalTurns: 24 });
    expect(periodCaption(state)).toBe('Año 1 · Cuatrimestre 1');
    expect(mandateTurn({ ...state, year: 4, turn: 3 })).toBe(12);
    expect(calendarText('Efecto durante 4 trimestres; requiere 3 DNU en 6 turnos.', state)).toBe('Efecto durante 3 cuatrimestres; requiere 3 DNU en 5 turnos.');
    expect(equivalentTurns(0, state)).toBe(0);
    expect(equivalentTurns(99, state)).toBe(99);
  });

  it('las históricas conservan datos, suspensión de deuda y calendario trimestral incluso si se solicita 12', () => {
    const state = createNewGame({ archetype: 'politico', governorName: 'Ana', scenarioId: 'corralito', seed: 1, calendar: 'light-12' });
    expect(calendarFor(state).id).toBe('legacy-16');
    expect(state.causal.caja).toBe(700);
    expect(state.causal.deuda).toBe(6000);
    expect(state.causal.flags.default_deuda.end).toBe(8);
    expect(state.causal.bonuses.find(b => b.target === 'GOB')?.end).toBe(5);
    expect(calendarFor(createCausalState({ scenarioId: 'pais_en_llamas', calendar: 'light-12' })).id).toBe('legacy-16');
  });

  it('el calendario civil y la presión electoral apuntan a T6/T12 y conservan T8/T16 en legacy', () => {
    expect(calendarEventsFor('light-12').find(e => e.id === 'elecciones-medio-termino')).toMatchObject({ year: 2, turn: 3 });
    expect(calendarEventsFor('light-12').find(e => e.id === 'elecciones-generales')).toMatchObject({ year: 4, turn: 3 });
    expect([4,5,6,7,10,11,12].map(t => isPreElection(t, 'light-12'))).toEqual([false,true,true,false,false,true,true]);
    expect(isPreElection(8, 'legacy-16')).toBe(true);
    expect(isPreElection(6, 'legacy-16')).toBe(false);
  });

  it('adapta una duración anual y aplica el pago diferido una sola vez por cierre', () => {
    const run = (calendar: 'light-12' | 'legacy-16') => {
      let state = closeTurn(createCausalState({ scenarioId: 'pais_en_calma', seed: 1, calendar }), [{ actionId: 'congelar_tarifas' }]).state;
      const pending = state.agenda.find(e => e.actionId === 'congelar_tarifas' && e.target === 'CAJA')!;
      const duration = pending.end - pending.start + 1;
      for (let i = 0; i < 7; i++) state = closeTurn(state, []).state;
      const applications = state.records.flatMap(r => r.applied).filter(e => e.actionId === 'congelar_tarifas' && e.target === 'CAJA');
      return { duration, applications };
    };
    expect(run('light-12').duration).toBe(3);
    expect(run('light-12').applications).toHaveLength(3);
    expect(run('legacy-16').applications).toHaveLength(4);
    expect(actionFiscalCommitments('congelar_tarifas', { calendar: 'light-12' })[0].text).toContain('3 cuatrimestres');
  });

  it('conserva gasto fijo, adapta ventanas y cooldown sin reducir los conteos de repetición', () => {
    const state = createCausalState({ scenarioId: 'pais_en_calma', calendar: 'light-12' });
    state.turn = 7;
    state.executions = [{ actionId: 'emitir_dinero', turn: 1 }, { actionId: 'emitir_dinero', turn: 3 }, { actionId: 'emitir_dinero', turn: 6 }];
    expect(countExecutions(state, 'emitir_dinero', 6, 7)).toBe(2); // ventana de 5 cuatrimestres
    expect(getAvailability(state, 'emitir_dinero', [], 4).repetitionWarning).toBeTruthy(); // la tercera sigue siendo la tercera
    const start = createCausalState({ scenarioId: 'pais_en_calma', calendar: 'light-12' });
    const after = closeTurn(start, [{ actionId: 'aumento_salarial' }]).state;
    expect(after.gastoCorr - start.gastoCorr).toBe(150);
    const met = meet(start, 'docentes', 4).state;
    expect(met.actors.docentes.revealedUntil).toBe(3);
  });

  it('cierra partidas completas en 24 turnos y conserva 32 para partidas legacy', () => {
    const current = playGame(adaptiveBot, 1, { scenarioId: 'pais_en_calma' });
    expect(current.victorious).toBe(true);
    expect(current.turnsPlayed).toBe(24);
    expect(current.log[11]).toMatchObject({ turn: 12, year: 4, quarter: 3, term: 1 });
    expect(current.log[12]).toMatchObject({ turn: 13, year: 1, quarter: 1, term: 2 });
    const legacy = playGame(adaptiveBot, 1, { scenarioId: 'pais_en_calma', calendar: 'legacy-16' });
    expect(legacy.turnsPlayed).toBe(32);
    expect(legacy.victorious).toBe(true);
  });

  it('pide estrategia al cerrar T6 y elección al cerrar T12, sin pasos adicionales', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.999);
    let state = createNewGame({ archetype: 'politico', governorName: 'Ana', scenarioId: 'pais_en_calma', seed: 1 });
    for (let n = 1; n <= 12; n++) {
      if (state.pendingMidtermStrategy) state = triggerMidtermStrategy(state, 'negociar');
      state = processEndTurn(state).state;
      if (n === 6) expect(state.pendingMidtermStrategy).toBe(true);
      if (n < 12) expect(state.pendingElection).toBe(false);
    }
    expect(state.pendingElection).toBe(true);
    expect(state.causal.turn).toBe(13);
    state = resolvePendingElection(state);
    expect(state.term).toBe(2);
    expect(state.causal.mandateStart).toBe(13);
  });
});
