// @vitest-environment jsdom
/**
 * Funciones ocultas de Lite (src/lite/config.ts): siguen en el código,
 * funcionan y se pueden reactivar con su flag.
 */
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { DEFAULT_LEVEL_SCENARIO_ID, LITE_FEATURES, playableLevels, playableScenarios } from '../lite/config';
import { NewGameScreen } from '../components/NewGameScreen';
import { loadProgress, recordReelectionWin } from '../lib/progress';
import { HISTORIC_SCENARIOS, getScenario, isScenarioUnlocked } from '../data/causal';
import { ALL_BOTS } from '../playtest/bots';
import { createNewGame } from '../engine/gameEngine';
import { loadGame, saveGame } from '../lib/savegame';
import { playGame } from '../playtest/runner';
import { DEFAULT_NEW_GAME_SCENARIO_ID, NEW_GAME_DIFFICULTY_LEVELS, isNewScenarioAvailable } from '../lib/editionAccess';

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

describe('opciones de inicio de Light', () => {
  it('ofrece sólo Normal y Argentina; conserva Fácil en el catálogo interno', () => {
    expect(LITE_FEATURES.nivelFacil).toBe(true);
    expect(playableLevels().map(l => l.label)).toEqual(['Fácil', 'Normal', 'Argentina']);
    expect(playableLevels({ nivelFacil: false }).map(l => l.label)).toEqual(['Normal', 'Argentina']);
    expect(playableLevels({ nivelFacil: true }).map(l => l.label)).toEqual(['Fácil', 'Normal', 'Argentina']);
    expect(DEFAULT_LEVEL_SCENARIO_ID).toBe('viento_de_cola');
    expect(DEFAULT_NEW_GAME_SCENARIO_ID).toBe('viento_de_cola');
    expect(NEW_GAME_DIFFICULTY_LEVELS.map(level => level.label)).toEqual(['Normal', 'Argentina']);
    expect(HISTORIC_SCENARIOS.map(sc => sc.id)).toEqual(['corralito', 'pais_en_llamas']);
    render(<NewGameScreen onStart={() => {}} historicScenarios={false} />);
    expect(screen.queryByRole('radio', { name: /^Fácil/ })).toBeNull();
    expect(within(screen.getByRole('radiogroup', { name: 'Nivel' })).getAllByRole('radio')).toHaveLength(2);
    expect(screen.getByRole('radio', { name: /^Normal/ }).getAttribute('aria-checked')).toBe('true');
  });

  it('el guard público rechaza Easy, históricos e ids desconocidos sin fallback', () => {
    expect(isNewScenarioAvailable('viento_de_cola')).toBe(true);
    expect(isNewScenarioAvailable('herencia_pesada')).toBe(true);
    for (const id of ['pais_en_calma','corralito','pais_en_llamas','desconocido','']) expect(isNewScenarioAvailable(id)).toBe(false);
  });

  it('los retratos no tienen leyendas ni profesiones; las fotos y perfiles siguen seleccionándose', () => {
    const onStart = vi.fn();
    render(<NewGameScreen onStart={onStart} />);
    const photos = within(screen.getByRole('radiogroup', { name: 'Foto' }));
    const avatars = photos.getAllByRole('radio');
    expect(avatars).toHaveLength(15);
    for (const [index, radio] of avatars.entries()) {
      expect(radio.getAttribute('aria-label')).toBe(`Avatar ${index + 1}`);
      expect(radio.textContent).toBe('');
      expect(radio.querySelector('[title], figcaption')).toBeNull();
      expect(radio.hasAttribute('title')).toBe(false);
      expect(radio.querySelector('img')?.getAttribute('alt')).toBe(`Avatar ${index + 1}`);
    }
    expect(screen.getByLabelText('Subir mi foto').getAttribute('accept')).toBe('image/*');
    fireEvent.click(avatars[2]);
    fireEvent.click(screen.getByRole('radio', { name: /^Empresario/ }));
    fireEvent.click(screen.getByRole('radio', { name: /^Argentina/ }));
    fireEvent.change(screen.getByPlaceholderText('Ingresá tu nombre'), { target: { value: 'Ana' } });
    fireEvent.click(screen.getByRole('button', { name: /^Empezar$/ }));
    expect(onStart).toHaveBeenCalledWith(expect.objectContaining({ avatar: avatars[2].querySelector('img')?.getAttribute('src'), archetype: 'empresario', scenarioId: 'herencia_pesada' }));
  });

  it('una partida guardada en Fácil sigue cargando', () => {
    const state = createNewGame({ archetype: 'politico', governorName: 'Ana', seed: 1, scenarioId: 'pais_en_calma' });
    saveGame(state, []);
    expect(loadGame()?.state.causal.scenarioId).toBe('pais_en_calma');
  });
});

describe('desafíos históricos con progreso propio', () => {
  it('apagados se juegan sólo los niveles; prendidos, también los históricos', () => {
    expect(playableScenarios({ escenariosHistoricos: false, nivelFacil: false }).map(s => s.id).sort()).toEqual(['herencia_pesada', 'viento_de_cola']);
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

  it('ni una reelección ni el prop de inicio habilitan históricos en esta edición', () => {
    recordReelectionWin();
    recordReelectionWin();
    expect(loadProgress().reelectionsWon).toBe(2);
    expect(isScenarioUnlocked(getScenario('corralito'), 2)).toBe(true);
    expect(LITE_FEATURES.escenariosHistoricos).toBe(false);
    const onStart = vi.fn();
    render(<NewGameScreen onStart={onStart} historicScenarios />);
    expect(screen.queryByText('Escenarios históricos')).toBeNull();
    expect(screen.queryByRole('radio', { name: /Corralito/ })).toBeNull();
    expect(screen.queryByRole('radio', { name: /País en llamas/ })).toBeNull();
    fireEvent.change(screen.getByPlaceholderText('Ingresá tu nombre'), { target: { value: 'Ana' } });
    fireEvent.click(screen.getByRole('button', { name: /^Empezar$/ }));
    expect(onStart).toHaveBeenCalledWith(expect.objectContaining({ scenarioId: 'viento_de_cola' }));
  });

  it('se pueden jugar completos (bots)', () => {
    for (const scenarioId of ['corralito', 'pais_en_llamas']) {
      const o = playGame(ALL_BOTS[ALL_BOTS.length - 1], 1, { scenarioId });
      expect(o.turnsPlayed).toBeGreaterThan(0);
      expect(o.gameOver).toBe(true);
    }
  });
});
