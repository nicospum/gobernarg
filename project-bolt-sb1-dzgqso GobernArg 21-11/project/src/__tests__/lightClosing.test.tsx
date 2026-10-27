// @vitest-environment jsdom
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { ActionCard } from '../components/ActionCard';
import { ActorsPanel } from '../components/ActorsPanel';
import { TurnPlan } from '../components/board/TurnPlan';
import { createNewGame, getPolicyAvailability, interactWithActor } from '../engine/gameEngine';
import { closeTurn, createCausalState, debtService, projectedCloseCaja } from '../engine/causal';
import { pendingPolicies } from '../lib/pendingPolicies';
import { simpleEffects } from '../lib/simpleView';

const game = () => createNewGame({ archetype: 'politico', governorName: 'Ana', seed: 3, scenarioId: 'viento_de_cola' });
beforeAll(() => {
  window.matchMedia ??= ((query: string) => ({ matches: false, media: query, onchange: null,
    addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {}, dispatchEvent: () => false,
  })) as unknown as typeof window.matchMedia;
});
afterEach(cleanup);

describe('cierre de Light sin recuperar saturación', () => {
  it('la tarjeta simple advierte repetición y agregar al turno solo selecciona', () => {
    const state = game();
    state.causal.turn = 3;
    state.causal.executions = [{ actionId: 'emitir_dinero', turn: 1 }, { actionId: 'emitir_dinero', turn: 2 }];
    const availability = getPolicyAvailability(state).find(a => a.action.id === 'emitir_dinero')!;
    expect(availability.repetitionWarning).toBeTruthy();
    const onSelect = vi.fn();
    render(<ActionCard availability={availability} requestedBy={[]} onSelect={onSelect} isSelected={false} disabled={false} />);
    expect(screen.getByText(/Uso reiterado/)).toBeTruthy();
    expect(screen.queryByText('Ejecutar')).toBeNull();
    expect(screen.queryByText(/^Riesgo (bajo|medio|alto|crítico)$/)).toBeNull();
    expect(screen.getByRole('button', { name: 'Ayuda' })).toBeTruthy();
    fireEvent.click(screen.getByText('Agregar al turno'));
    expect(onSelect).toHaveBeenCalledTimes(1);
    expect(state.causal.turn).toBe(3);
    fireEvent.click(screen.getByRole('button', { name: 'Ayuda' }));
    expect(screen.getByRole('dialog', { name: availability.action.name })).toBeTruthy();
    expect(onSelect).toHaveBeenCalledTimes(1);
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('una política ambiental conserva beneficio y contrapartida aunque ambiente no esté en la franja', () => {
    const effects = simpleEffects('proteccion_ambiental');
    expect(effects).toEqual(expect.arrayContaining([expect.objectContaining({ label: expect.stringMatching(/Ambiente/i), tone: 'good', up: true })]));
    expect(effects).toEqual(expect.arrayContaining([expect.objectContaining({ label: 'Empleo', tone: 'bad', up: false })]));
    expect(effects.length).toBeLessThanOrEqual(3);
    expect(simpleEffects('inversion_educativa')).toEqual(expect.arrayContaining([expect.objectContaining({ label: 'Educación', tone: 'good', when: 'más adelante' })]));
  });

  it('muestra gasto fijo y subsidios diferidos junto al costo inicial', () => {
    const state = game();
    const availability = getPolicyAvailability(state);
    for (const [id, expected] of [['aumento_salarial', /Gasto fijo:.*150.*turno.*permanente/], ['congelar_tarifas', /Costo de caja:.*80.*turno.*4 trimestres/]] as const) {
      render(<ActionCard availability={availability.find(a => a.action.id === id)!} requestedBy={[]} onSelect={() => {}} isSelected={false} disabled={false} />);
      expect(screen.getByText('Costo inicial')).toBeTruthy();
      expect(within(screen.getByRole('list', { name: 'Compromisos fiscales conocidos' })).getByText(expected)).toBeTruthy();
      expect(screen.queryByRole('dialog')).toBeNull();
      cleanup();
    }
  });

  it('recuerda una inversión real pendiente y la retira cuando ya se aplicó', () => {
    let state = createCausalState({ scenarioId: 'viento_de_cola', seed: 3 });
    expect(pendingPolicies(state)).toEqual([]);
    state = closeTurn(state, [{ actionId: 'inversion_educativa' }]).state;
    const snapshot = structuredClone(state);
    expect(pendingPolicies(state)).toEqual(expect.arrayContaining([expect.objectContaining({ name: 'Inversión educativa', closes: 1 })]));
    expect(state).toEqual(snapshot);
    for (let i = 0; i < 12; i++) state = closeTurn(state, []).state;
    expect(pendingPolicies(state).some(p => p.name === 'Inversión educativa')).toBe(false);
  });

  it('marca las condiciones de un efecto pendiente sin prometer que ocurrirá', () => {
    let state = createCausalState({ scenarioId: 'viento_de_cola' });
    state = closeTurn(state, [{ actionId: 'inversion_educativa' }]).state;
    const future = state.agenda.find(e => e.start >= state.turn)!;
    future.applyCondition = 'INFL<20';
    state.agenda = [future];
    expect(pendingPolicies(state)[0].conditional).toBe(true);
  });

  it('el plan muestra la estimación y su límite sin depender de hover', () => {
    render(<TurnPlan gameState={game()} onActionSelect={() => {}} onEndTurn={() => {}} canEndTurn compact />);
    expect(screen.getByText(/Caja estimada al cierre/)).toBeTruthy();
    expect(screen.getByText('No incluye efectos diferidos ni eventos.')).toBeTruthy();
  });

  it('la proyección respeta los intereses suspendidos de Corralito y vuelve a cobrarlos al vencer', () => {
    const state = createCausalState({ scenarioId: 'corralito' });
    const defaultProjection = projectedCloseCaja(state, []);
    expect(debtService(state)).toBe(0);
    const regular = structuredClone(state);
    delete regular.flags.default_deuda;
    expect(defaultProjection.caja - projectedCloseCaja(regular, []).caja).toBeCloseTo(debtService(regular));
    expect(debtService(regular)).toBeGreaterThan(0);
    const expired = structuredClone(state);
    expired.turn = (expired.flags.default_deuda.end ?? 0) + 1;
    const expiredRegular = structuredClone(expired);
    delete expiredRegular.flags.default_deuda;
    expect(projectedCloseCaja(expired, [])).toEqual(projectedCloseCaja(expiredRegular, []));
  });

  it('revela demandas después de la reunión y habilita agregar la respuesta al turno', () => {
    const props = { onInteract: () => {}, onSelectAction: vi.fn(), disabled: false };
    const state = game();
    const view = render(<ActorsPanel gameState={state} {...props} />);
    expect(screen.queryByText('Piden:')).toBeNull();
    const after = interactWithActor(state, 'docentes', 'reunion');
    expect(after.causal.actors.docentes.demand?.revealedTurn).toBe(after.causal.turn);
    view.rerender(<ActorsPanel gameState={after} {...props} />);
    const demand = screen.getByText('Piden:');
    const button = within(demand.parentElement!).getByRole('button', { name: /Agregar al turno/ });
    expect((button as HTMLButtonElement).disabled).toBe(false);
    fireEvent.click(button);
    expect(props.onSelectAction).toHaveBeenCalledWith(after.causal.actors.docentes.demand?.actionId);
    expect(after.causal.actors.agro.demand?.revealedTurn).toBeNull();
  });
});
