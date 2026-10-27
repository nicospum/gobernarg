// @vitest-environment jsdom
import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { createNewGame } from '../engine/gameEngine';
import { MandateTimeline } from '../components/GameHeader';
import { MobileHeader } from '../components/mobile/MobileChrome';
import { ControlPanel } from '../components/ControlPanel';
import { ActorsPanel } from '../components/ActorsPanel';
import { KnownDeadlines } from '../components/board/KnownDeadlines';
import { StatusStrip } from '../components/board/StatusStrip';
import { knownDeadlines } from '../lib/lightGuidance';
import { simpleIndicators } from '../lib/simpleView';
import { effective, viewRef } from '../engine/causal';
import { describeIndicator } from '../lib/simpleView';

const game = () => createNewGame({ archetype: 'politico', governorName: 'Ana', seed: 3, scenarioId: 'viento_de_cola' });
afterEach(cleanup);

describe('orientación sobria de Light', () => {
  it('dibuja 12 cuatrimestres y preserva la línea de 16 para una partida anterior', () => {
    const state = game();
    const view = render(<MandateTimeline gameState={state} />);
    const timeline = screen.getByRole('img', { name: 'Turno 1 de 12 del mandato' });
    expect(timeline.children).toHaveLength(12);
    expect(within(timeline).getByTitle('Turno 6: Legislativas')).toBeTruthy();
    expect(within(timeline).getByTitle('Turno 12: Elección presidencial')).toBeTruthy();
    delete state.causal.calendar;
    view.rerender(<MandateTimeline gameState={state} />);
    expect(screen.getByRole('img', { name: 'Turno 1 de 16 del mandato' }).children).toHaveLength(16);
  });

  it('el encabezado móvil identifica el cuatrimestre actual', () => {
    render(<MobileHeader gameState={game()} onOpenMenu={() => {}} />);
    expect(screen.getByText(/Año 1 · Cuatrimestre 1 · T1\/12/)).toBeTruthy();
    expect(screen.getByText(/Legislativas/)).toBeTruthy();
  });

  it('agrupa ocho indicadores sin inventar PIB ni reemplazar la actividad por empleo', () => {
    const state = game();
    const snapshot = structuredClone(state);
    render(<StatusStrip gameState={state} />);
    const economy = screen.getByRole('region', { name: 'Economía' });
    for (const label of ['Precios', 'Actividad', 'Bolsillo', 'Divisas']) expect(within(economy).getByText(label)).toBeTruthy();
    const life = screen.getByRole('region', { name: 'Vida cotidiana' });
    for (const label of ['Obras', 'Educación', 'Salud', 'Seguridad']) expect(within(life).getByText(label)).toBeTruthy();
    expect(screen.queryByText('PIB')).toBeNull();
    const foreign = simpleIndicators(state).find(ind => ind.key === 'EXTE')!;
    expect(foreign.word).toBe(describeIndicator('EXTE', effective(state.causal, 'EXTE', viewRef(state.causal))).word);
    expect(state).toEqual(snapshot);
  });

  it('el enlace de preparativos abre las políticas con requisitos pendientes', () => {
    render(<ControlPanel gameState={game()} onActionSelect={() => {}} canTakeAction />);
    const link = screen.getByRole('button', { name: 'Ver preparativos bloqueados' });
    expect(link.getAttribute('aria-expanded')).toBe('false');
    fireEvent.click(link);
    expect(screen.getByRole('button', { name: 'Ocultar preparativos' }).getAttribute('aria-expanded')).toBe('true');
    expect(screen.getAllByText('Bloqueada').length).toBeGreaterThan(0);
  });

  it('retira las demandas al vencer la ventana real del calendario', () => {
    const state = game();
    state.causal.turn = 6;
    state.causal.actors.docentes.demand = { actionId: 'inversion_educativa', createdTurn: 1, revealedTurn: 1 };
    const props = { onInteract: () => {}, onSelectAction: () => {}, disabled: false };
    const view = render(<ActorsPanel gameState={state} {...props} />);
    expect(screen.queryByText('Piden:')).toBeNull();
    state.causal.calendar = 'legacy-16';
    view.rerender(<ActorsPanel gameState={state} {...props} />);
    expect(screen.getByText('Piden:')).toBeTruthy();
  });

  it('los vencimientos leen acuerdos activos sin revelar demandas ni mutar el estado', () => {
    const state = game();
    expect(knownDeadlines(state.causal)).toEqual([]);
    state.causal.actors.docentes.demand = { actionId: 'inversion_educativa', createdTurn: 1, revealedTurn: null };
    state.causal.agreements.push({ id: 'firmado', actor: 'agro', commitmentActionId: 'bajar_retenciones', signedTurn: 1, deadline: 1, offer: 'apoyo', status: 'active' });
    state.causal.agreements.push({ id: 'cumplido', actor: 'docentes', commitmentActionId: 'inversion_educativa', signedTurn: 1, deadline: 3, offer: 'apoyo', status: 'fulfilled' });
    const snapshot = structuredClone(state);
    render(<KnownDeadlines state={state.causal} />);
    expect(screen.getByText('este cierre')).toBeTruthy();
    expect(screen.queryByText(/Inversión educativa/)).toBeNull();
    expect(knownDeadlines(state.causal).map(d => d.id)).toEqual(['firmado']);
    expect(state).toEqual(snapshot);
  });
});
