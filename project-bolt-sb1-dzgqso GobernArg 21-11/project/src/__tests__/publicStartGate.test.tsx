// @vitest-environment jsdom
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import App from '../App';
import type { NewGameChoice } from '../components/NewGameScreen';
import type { GameState } from '../types/game';
import { createNewGame } from '../engine/gameEngine';
import { SAVE_KEY, loadGame, saveGame } from '../lib/savegame';

// El callback de una pantalla no debe poder saltarse el filtro público de App.
vi.mock('../components/NewGameScreen', () => ({
  NewGameScreen: ({ onStart }: { onStart: (choice: NewGameChoice) => void }) => (
    <div data-testid="new-game-stub">
      {['pais_en_calma','corralito','desconocido','viento_de_cola'].map(scenarioId => (
        <button key={scenarioId} onClick={() => onStart({ governorName: 'Ana', avatar: '', archetype: 'politico', scenarioId })}>Iniciar {scenarioId}</button>
      ))}
    </div>
  ),
}));
vi.mock('../components/WelcomeScreen', () => ({
  WelcomeScreen: ({ onStart, onContinue, saved }: { onStart: () => void; onContinue?: () => void; saved?: GameState }) => (
    <div><button onClick={onStart}>Abrir nueva partida</button>{saved && <button onClick={onContinue}>Continuar anterior</button>}</div>
  ),
}));

beforeAll(() => {
  window.matchMedia ??= ((query: string) => ({ matches: false, media: query, onchange: null, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {}, dispatchEvent: () => false })) as unknown as typeof window.matchMedia;
  window.scrollTo = () => {};
});
afterEach(() => { cleanup(); localStorage.clear(); });

describe('Guard de inicio público en App', () => {
  it('rechaza Easy/histórico/desconocido desde el callback, sin crear partida por fallback', () => {
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: 'Abrir nueva partida' }));
    for (const id of ['pais_en_calma','corralito','desconocido']) {
      fireEvent.click(screen.getByRole('button', { name: `Iniciar ${id}` }));
      expect(screen.getByTestId('new-game-stub')).toBeTruthy();
      expect(localStorage.getItem(SAVE_KEY)).toBeNull();
    }
    fireEvent.click(screen.getByRole('button', { name: 'Iniciar viento_de_cola' }));
    expect(screen.queryByTestId('new-game-stub')).toBeNull();
    expect(loadGame()?.state.causal.scenarioId).toBe('viento_de_cola');
  });

  it('continuar una partida anterior de Fácil conserva escenario, calendario y foto', () => {
    const old = createNewGame({ archetype: 'comunicador', governorName: 'Anterior', avatar: 'data:image/jpeg;base64,AA', scenarioId: 'pais_en_calma', calendar: 'legacy-16', seed: 1 });
    expect(saveGame(old)).toBe(true);
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: 'Continuar anterior' }));
    expect(loadGame()?.state).toEqual(old);
    expect(screen.queryByTestId('new-game-stub')).toBeNull();
  });
});
