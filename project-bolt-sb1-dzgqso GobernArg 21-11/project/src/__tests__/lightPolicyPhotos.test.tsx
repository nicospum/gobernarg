// @vitest-environment jsdom
import { afterEach, beforeAll, describe, expect, it } from 'vitest';
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { ActionCard } from '../components/ActionCard';
import { TurnSummaryModal } from '../components/TurnSummaryModal';
import { createNewGame, getPolicyAvailability, processEndTurn, toggleActionSelection } from '../engine/gameEngine';
import { actionImage } from '../lib/liteImages';
import { CAUSAL_ACTIONS_BY_ID } from '../data/causal';
import { UI_CATEGORY_STYLES } from '../data/categoryStyles';

beforeAll(() => {
  window.matchMedia ??= ((query: string) => ({ matches: false, media: query, onchange: null,
    addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {}, dispatchEvent: () => false,
  })) as unknown as typeof window.matchMedia;
});
afterEach(cleanup);
const game = () => createNewGame({ archetype: 'politico', governorName: 'Ana', scenarioId: 'viento_de_cola', seed: 3 });
const gallery = () => screen.queryByRole('region', { name: 'Imágenes de las medidas ejecutadas' });
const sources = (element: HTMLElement) => [...element.querySelectorAll('img')].map(img => img.getAttribute('src'));

describe('Fotos de políticas en el cierre de Light', () => {
  it('la selección y su ayuda conservan textos, costos e icono de categoría sin foto', () => {
    const state = game();
    const availability = getPolicyAvailability(state).find(item => item.action.id === 'emitir_dinero')!;
    expect(actionImage(availability.action.id)).toBeTruthy();
    render(<ActionCard availability={availability} requestedBy={[]} onSelect={() => {}} isSelected={false} disabled={false} calendar="light-12" />);
    const card = screen.getByRole('article', { name: availability.action.name });
    expect(sources(card)).toEqual([UI_CATEGORY_STYLES[availability.action.category].imageSrc]);
    expect(within(card).getByText('Costo inicial')).toBeTruthy();
    expect(within(card).getByRole('button', { name: 'Agregar Emitir dinero al turno' })).toBeTruthy();
    fireEvent.click(within(card).getByRole('button', { name: 'Ayuda' }));
    const help = screen.getByRole('dialog', { name: availability.action.name });
    expect(sources(help)).toEqual([]);
    expect(within(help).getByText(availability.action.description)).toBeTruthy();
  });

  it('muestra la elegida ejecutada aun cuando la selección del tablero ya se vació', () => {
    const selected = toggleActionSelection(game(), 'emitir_dinero');
    expect(selected.selectedActions).toEqual(['emitir_dinero']);
    const result = processEndTurn(selected);
    expect(result.state.selectedActions).toEqual([]);
    const snapshot = structuredClone(result.state);
    render(<TurnSummaryModal summary={result.summary} gameState={result.state} onClose={() => {}} />);
    const images = gallery()!;
    expect(images).toBeTruthy();
    expect(sources(images)).toEqual([actionImage('emitir_dinero')]);
    expect(within(images).getByText(CAUSAL_ACTIONS_BY_ID.emitir_dinero.name)).toBeTruthy();
    expect(sources(images)).not.toContain(actionImage('mejorar_recaudacion'));
    expect(result.state).toEqual(snapshot);
  });

  it('un cierre sin medidas no crea galería', () => {
    const result = processEndTurn(game());
    render(<TurnSummaryModal summary={result.summary} gameState={result.state} onClose={() => {}} />);
    expect(gallery()).toBeNull();
    expect(screen.getByText(/nada nuevo este cuatrimestre/)).toBeTruthy();
  });

  it('una medida sin imagen sigue en el relato accesible y no recibe una inventada', () => {
    expect(actionImage('devaluacion')).toBeUndefined();
    const result = processEndTurn(toggleActionSelection(game(), 'devaluacion'));
    expect(result.state.causal.records[0].actions.some(action => action.actionId === 'devaluacion')).toBe(true);
    render(<TurnSummaryModal summary={result.summary} gameState={result.state} onClose={() => {}} />);
    expect(screen.getByText('Hiciste:').parentElement?.textContent).toContain(CAUSAL_ACTIONS_BY_ID.devaluacion.name);
    expect(gallery()).toBeNull();
  });

  it('excluye suspendidas, emisión automática y opciones que quedaron seleccionadas después', () => {
    const state = toggleActionSelection(game(), 'mejorar_recaudacion');
    state.causal.forcedEmission = true;
    const result = processEndTurn(state);
    const record = result.state.causal.records[0];
    expect(record.actions.some(action => action.actionId === 'emitir_dinero' && action.forced)).toBe(true);
    record.actions.push({ actionId: 'control_precios', caja: 0, scheduled: [], suspended: 'No se pudo ejecutar.' });
    result.state.selectedActions = ['prestamo_local'];
    render(<TurnSummaryModal summary={result.summary} gameState={result.state} onClose={() => {}} />);
    expect(sources(gallery()!)).toEqual([actionImage('mejorar_recaudacion')]);
  });

  it('usa el registro del resumen solicitado y no el último cierre del estado', () => {
    const first = processEndTurn(toggleActionSelection(game(), 'emitir_dinero'));
    const second = processEndTurn(toggleActionSelection(first.state, 'mejorar_recaudacion'));
    render(<TurnSummaryModal summary={first.summary} gameState={second.state} onClose={() => {}} />);
    expect(sources(gallery()!)).toEqual([actionImage('emitir_dinero')]);
  });
});
