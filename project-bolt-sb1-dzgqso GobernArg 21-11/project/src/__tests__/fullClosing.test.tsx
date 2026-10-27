// @vitest-environment jsdom
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { ActionCard } from '../components/ActionCard';
import { InfoTooltip } from '../components/InfoTooltip';
import { createCausalState, debtService, getAvailability, projectedCloseCaja } from '../engine/causal';

let touch = false;
beforeAll(() => {
  window.matchMedia = ((query: string) => ({
    matches: touch && query === '(hover: none)', media: query, onchange: null,
    addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {}, dispatchEvent: () => false,
  })) as typeof window.matchMedia;
  class Observer { observe() {} unobserve() {} disconnect() {} }
  globalThis.ResizeObserver ??= Observer as unknown as typeof ResizeObserver;
});
beforeEach(() => { touch = false; });
afterEach(cleanup);

describe('Decisiones y ayuda accesible', () => {
  it.each([false, true])('consultar ayuda no agrega la acción y devuelve el foco (táctil=%s)', (isTouch) => {
    touch = isTouch;
    const onSelect = vi.fn();
    const av = getAvailability(createCausalState(), 'emitir_dinero', [], 3);
    render(<ActionCard availability={av} requestedBy={[]} onSelect={onSelect} isSelected={false} disabled={false} />);
    const help = screen.getByRole('button', { name: `Ayuda sobre ${av.action.name}` });
    help.focus();
    fireEvent.click(help);
    expect(screen.getByRole('dialog', { name: av.action.name })).toBeTruthy();
    expect(onSelect).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button', { name: 'Cerrar' }));
    expect(document.activeElement).toBe(help);
    fireEvent.click(screen.getByRole('button', { name: `Agregar al turno: ${av.action.name}` }));
    expect(onSelect).toHaveBeenCalledTimes(1);
  });

  it('permite quitar una selección aunque ya no queden acciones', () => {
    const onSelect = vi.fn();
    const av = getAvailability(createCausalState(), 'emitir_dinero', [], 0);
    render(<ActionCard availability={av} requestedBy={[]} onSelect={onSelect} isSelected disabled />);
    fireEvent.click(screen.getByRole('button', { name: `Quitar del turno: ${av.action.name}` }));
    expect(onSelect).toHaveBeenCalledOnce();
  });

  it('abre una explicación del país con teclado y permite cerrarla con Escape', () => {
    render(<InfoTooltip title="Estado del país" content="Definición consultable"><div>Consultar indicador</div></InfoTooltip>);
    const trigger = screen.getByRole('button', { name: 'Consultar indicador' });
    trigger.focus();
    fireEvent.keyDown(trigger, { key: 'Enter' });
    expect(screen.getByRole('dialog', { name: 'Estado del país' })).toBeTruthy();
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(screen.queryByRole('dialog')).toBeNull();
    expect(document.activeElement).toBe(trigger);
  });
});

describe('Estimación fiscal de Corralito', () => {
  it('respeta intereses suspendidos y vuelve a incluirlos al vencer el default', () => {
    const state = createCausalState({ scenarioId: 'corralito' });
    const regular = structuredClone(state);
    delete regular.flags.default_deuda;
    expect(debtService(state)).toBe(0);
    expect(projectedCloseCaja(state, []).caja - projectedCloseCaja(regular, []).caja).toBeCloseTo(debtService(regular));
    const expired = structuredClone(state);
    expired.turn = (expired.flags.default_deuda.end ?? 0) + 1;
    const expiredRegular = structuredClone(expired);
    delete expiredRegular.flags.default_deuda;
    expect(debtService(expired)).toBeGreaterThan(0);
    expect(projectedCloseCaja(expired, [])).toEqual(projectedCloseCaja(expiredRegular, []));
  });
});
