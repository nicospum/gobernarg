// @vitest-environment jsdom
import { afterEach, beforeAll, describe, expect, it } from 'vitest';
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { ControlPanel } from '../components/ControlPanel';
import { GameSetup } from '../components/GameSetup';
import { createNewGame } from '../engine/gameEngine';
import { ACTION_PLAYER_NOTES } from '../data/causal/playerTexts';

beforeAll(() => { window.matchMedia = ((query: string) => ({ matches: false, media: query, onchange: null, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {}, dispatchEvent: () => false })) as typeof window.matchMedia; });
afterEach(cleanup);
describe('Full compacta y progresiva', () => {
  it.each([1,3,4,17])('nota inicial respeta turno global %s y siempre se consulta desde el icono', turn => {
    const state = createNewGame('presidente', 'politico', 'QA', false, ''); state.causal.turn = turn;
    if (turn === 17) state.term = 2;
    render(<ControlPanel gameState={state} onActionSelect={() => {}} canTakeAction />);
    const card = screen.getByRole('article', { name: 'Emitir dinero' });
    expect(within(card).queryByText(ACTION_PLAYER_NOTES.emitir_dinero) !== null).toBe(turn <= 3);
    fireEvent.click(within(card).getByRole('button', { name: 'Información sobre Emitir dinero' }));
    expect(within(screen.getByRole('dialog', { name: 'Emitir dinero' })).getByText(ACTION_PLAYER_NOTES.emitir_dinero)).toBeTruthy();
    expect(within(card).queryByText('Ayuda')).toBeNull();
  });
  it('las victorias previas no permiten elegir históricos ni pierden progreso', () => {
    const raw = JSON.stringify({ reelectionsWon: 99, unlockAll: true, wonScenarios: ['corralito'] });
    localStorage.setItem('gobernarg.progress.v1', raw);
    render(<GameSetup draft={{ position: 'presidente', archetype: 'politico', governorName: 'QA', avatar: '' }} onBack={() => {}} onStart={() => {}} />);
    const historical = screen.getByRole('radio', { name: /Corralito/ }) as HTMLButtonElement;
    expect(historical.disabled).toBe(true);
    const selected = screen.getByRole('radio', { checked: true });
    fireEvent.click(historical);
    expect(selected.getAttribute('aria-checked')).toBe('true');
    expect(localStorage.getItem('gobernarg.progress.v1')).toBe(raw);
  });
});
