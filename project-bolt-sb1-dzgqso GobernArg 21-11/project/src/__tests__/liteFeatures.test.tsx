// @vitest-environment jsdom
/**
 * Funciones ocultas de Lite (src/lite/config.ts): siguen en el código,
 * funcionan y se pueden reactivar con su flag.
 */
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { DEFAULT_LEVEL_SCENARIO_ID, LITE_FEATURES, playableLevels, playableScenarios } from '../lite/config';
import { NewGameScreen } from '../components/NewGameScreen';
import { loadProgress, recordReelectionWin } from '../lib/progress';
import { getScenario, isScenarioUnlocked } from '../data/causal';
import { ALL_BOTS } from '../playtest/bots';
import { createNewGame } from '../engine/gameEngine';
import { loadGame, saveGame } from '../lib/savegame';
import { playGame } from '../playtest/runner';

beforeAll(() => {
  window.matchMedia ??= ((query: string) => ({
    matches: false, media: query, onchange: null,
    addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {}, dispatchEvent: () => false,
  })) as unknown as typeof window.matchMedia;
});

afterEach(() => {
  cleanup();
  localStorage.clear();
});

describe('nivel Fácil oculto (LITE_FEATURES.nivelFacil)', () => {
  it('apagado se ofrecen Normal y Argentina, con Normal de entrada', () => {
    expect(LITE_FEATURES.nivelFacil).toBe(false);
    expect(playableLevels().map(l => l.label)).toEqual(['Normal', 'Argentina']);
    expect(playableLevels({ nivelFacil: true }).map(l => l.label)).toEqual(['Fácil', 'Normal', 'Argentina']);
    expect(DEFAULT_LEVEL_SCENARIO_ID).toBe('viento_de_cola');
    render(<NewGameScreen onStart={() => {}} historicScenarios={false} />);
    expect(screen.queryByRole('radio', { name: /^Fácil/ })).toBeNull();
    expect(screen.getByRole('radio', { name: /^Normal/ }).getAttribute('aria-checked')).toBe('true');
  });

  it('una partida guardada en Fácil sigue cargando', () => {
    const state = createNewGame({ archetype: 'politico', governorName: 'Ana', seed: 1, scenarioId: 'pais_en_calma' });
    saveGame(state, []);
    expect(loadGame()?.state.causal.scenarioId).toBe('pais_en_calma');
  });
});

describe('escenarios históricos ocultos (LITE_FEATURES.escenariosHistoricos)', () => {
  it('apagados se juegan sólo los niveles; prendidos, también los históricos', () => {
    expect(playableScenarios({ escenariosHistoricos: false }).map(s => s.id).sort()).toEqual(['herencia_pesada', 'viento_de_cola']);
    expect(playableScenarios({ escenariosHistoricos: false, nivelFacil: true }).map(s => s.id).sort()).toEqual(['herencia_pesada', 'pais_en_calma', 'viento_de_cola']);
    expect(playableScenarios()).toEqual(playableScenarios(LITE_FEATURES));
    expect(playableScenarios({ escenariosHistoricos: true }).map(s => s.id)).toEqual(
      expect.arrayContaining(['corralito', 'pais_en_llamas']),
    );
  });

  it('apagados, "Nueva partida" no los muestra', () => {
    render(<NewGameScreen onStart={() => {}} historicScenarios={false} />);
    expect(screen.queryByText('Escenarios históricos')).toBeNull();
    expect(screen.queryByText('Corralito')).toBeNull();
  });

  it('prendidos, aparecen bloqueados y una reelección ganada desbloquea Corralito', async () => {
    const view = render(<NewGameScreen onStart={() => {}} historicScenarios />);
    expect(screen.getByText('Escenarios históricos')).toBeTruthy();
    expect(screen.getByRole('radio', { name: /Corralito/ }).getAttribute('aria-disabled')).toBe('true');
    view.unmount();

    recordReelectionWin();
    expect(loadProgress().reelectionsWon).toBe(1);
    expect(isScenarioUnlocked(getScenario('corralito'), 1)).toBe(true);

    const onStart = vi.fn();
    render(<NewGameScreen onStart={onStart} historicScenarios />);
    const corralito = screen.getByRole('radio', { name: /Corralito/ });
    expect(corralito.getAttribute('aria-disabled')).toBe('false');
    expect(screen.getByRole('radio', { name: /País en llamas/ }).getAttribute('aria-disabled')).toBe('true');
    fireEvent.change(screen.getByPlaceholderText('Ingresá tu nombre'), { target: { value: 'Ana' } });
    await act(async () => { fireEvent.click(corralito); });
    await act(async () => { fireEvent.click(screen.getByRole('button', { name: /^Empezar$/ })); });
    expect(onStart).toHaveBeenCalledWith(expect.objectContaining({ scenarioId: 'corralito' }));
  });

  it('se pueden jugar completos (bots)', () => {
    for (const scenarioId of ['corralito', 'pais_en_llamas']) {
      const o = playGame(ALL_BOTS[ALL_BOTS.length - 1], 1, { scenarioId });
      expect(o.turnsPlayed).toBeGreaterThan(0);
      expect(o.gameOver).toBe(true);
    }
  });
});
