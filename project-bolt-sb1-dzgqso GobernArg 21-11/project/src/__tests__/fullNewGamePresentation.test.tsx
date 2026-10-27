// @vitest-environment jsdom
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { CharacterCreation, AVATARS } from '../components/CharacterCreation';
import { GameSetup } from '../components/GameSetup';
import { DIFFICULTY_LEVELS, HISTORIC_SCENARIOS, NO_PLATFORM_ID, getScenario } from '../data/causal';
import { DEFAULT_NEW_GAME_SCENARIO_ID, NEW_GAME_DIFFICULTY_LEVELS, isNewScenarioAvailable } from '../lib/editionAccess';
import { createNewGame, processEndTurn } from '../engine/gameEngine';
import { encodeSavedGame, parseSavedGame } from '../lib/savegame';
import { photoToDataUrl } from '../lib/avatarPhoto';

vi.mock('../lib/avatarPhoto', async importOriginal => ({
  ...await importOriginal<typeof import('../lib/avatarPhoto')>(),
  photoToDataUrl: vi.fn(),
}));
const draft = { position: 'presidente' as const, archetype: 'politico' as const, governorName: 'Prueba', avatar: AVATARS[0].src };
beforeAll(() => {
  window.matchMedia = ((query: string) => ({ matches: false, media: query, onchange: null, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {}, dispatchEvent: () => false })) as typeof window.matchMedia;
});
beforeEach(() => { localStorage.clear(); vi.mocked(photoToDataUrl).mockReset(); });
afterEach(cleanup);

describe('Nuevas partidas Full: sólo Normal y Argentina', () => {
  it('inicia en Normal y sólo permite elegir las dos opciones públicas', () => {
    const onStart = vi.fn();
    render(<GameSetup draft={draft} onBack={() => {}} onStart={onStart} />);
    const levels = within(screen.getByRole('radiogroup', { name: 'Dificultad' }));
    expect(levels.getAllByRole('radio')).toHaveLength(2);
    expect(levels.getByRole('radio', { name: /^Normal/, checked: true })).toBeTruthy();
    expect(screen.queryByText('Fácil')).toBeNull();
    expect(screen.queryByText('País en calma')).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: 'Comenzar gestión' }));
    expect(onStart).toHaveBeenLastCalledWith(NO_PLATFORM_ID, 'viento_de_cola');
    fireEvent.click(levels.getByRole('radio', { name: /^Argentina/ }));
    fireEvent.click(screen.getByRole('button', { name: 'Comenzar gestión' }));
    expect(onStart).toHaveBeenLastCalledWith(NO_PLATFORM_ID, 'herencia_pesada');
  });
  it('un progreso anterior no expone Fácil ni lo convierte en histórico', () => {
    const progress = JSON.stringify({ reelectionsWon: 99, unlockAll: true, wonScenarios: ['pais_en_calma'] });
    localStorage.setItem('gobernarg.progress.v1', progress);
    render(<GameSetup draft={draft} onBack={() => {}} onStart={() => {}} />);
    expect(screen.queryByRole('radio', { name: /^Fácil\b|País en calma/ })).toBeNull();
    expect(NEW_GAME_DIFFICULTY_LEVELS.map(level => level.id)).toEqual(['normal', 'argentina']);
    expect(DEFAULT_NEW_GAME_SCENARIO_ID).toBe('viento_de_cola');
    expect(isNewScenarioAvailable('pais_en_calma')).toBe(false);
    expect(DIFFICULTY_LEVELS.some(level => level.id === 'facil')).toBe(true);
    expect(HISTORIC_SCENARIOS.map(scenario => scenario.id)).toEqual(['corralito', 'pais_en_llamas']);
    expect(localStorage.getItem('gobernarg.progress.v1')).toBe(progress);
  });
  it('mantiene el escenario interno y permite continuar un guardado antiguo de Fácil', () => {
    expect(getScenario('pais_en_calma').id).toBe('pais_en_calma');
    const legacy = createNewGame('presidente', 'politico', 'Anterior', false, '', 'normal', undefined, 7, 'pais_en_calma');
    const parsed = parseSavedGame(JSON.stringify({ v: 1, state: legacy, pendingEvents: [] }));
    expect(parsed).not.toBeNull();
    const next = processEndTurn(parsed!.state).state;
    expect(next.causal.turn).toBe(2);
    expect(next.causal.scenarioId).toBe('pais_en_calma');
    expect(parseSavedGame(encodeSavedGame(next))).not.toBeNull();
  });
});

describe('Retratos neutrales y foto propia', () => {
  it('conserva todas las imágenes seleccionables, sin leyendas profesionales y con perfil independiente', () => {
    const onContinue = vi.fn();
    render(<CharacterCreation initial={draft} onContinue={onContinue} />);
    const portraits = screen.getAllByRole('button', { name: /^Retrato \d+$/ });
    expect(portraits).toHaveLength(AVATARS.length);
    for (const portrait of portraits) {
      expect(portrait.textContent).toBe('');
      expect(portrait.getAttribute('title')).toBeNull();
      expect(portrait.querySelector('img')?.alt).toBe('');
    }
    expect(screen.queryByText('Ejecutivo')).toBeNull();
    expect(screen.queryByText('Líder indígena')).toBeNull();
    expect(screen.getByRole('button', { name: /Político de Raza/ })).toBeTruthy();
    expect(screen.getByRole('button', { name: /Sindicalista/ })).toBeTruthy();
    expect(screen.getByRole('button', { name: /Empresario/ })).toBeTruthy();
    expect(screen.getByRole('button', { name: /Comunicador/ })).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Retrato 2' }));
    expect(screen.getByRole('button', { name: 'Retrato 2' }).getAttribute('aria-pressed')).toBe('true');
    fireEvent.click(screen.getByRole('button', { name: 'Continuar' }));
    expect(onContinue).toHaveBeenCalledWith({ ...draft, avatar: AVATARS[1].src });
  });
  it('procesa una foto, permite volver a seleccionarla y la conserva en el guardado', async () => {
    let finish!: (value: string) => void;
    vi.mocked(photoToDataUrl).mockReturnValueOnce(new Promise(resolve => { finish = resolve; }));
    const onContinue = vi.fn();
    render(<CharacterCreation initial={draft} onContinue={onContinue} />);
    const file = new File(['foto'], 'mi-foto.jpg', { type: 'image/jpeg' });
    fireEvent.change(screen.getByLabelText('Subir mi foto'), { target: { files: [file] } });
    expect(screen.getByRole('status').textContent).toContain('Procesando foto');
    expect((screen.getByRole('button', { name: 'Continuar' }) as HTMLButtonElement).disabled).toBe(true);
    expect((screen.getByRole('button', { name: 'Retrato 1' }) as HTMLButtonElement).disabled).toBe(true);
    const data = 'data:image/jpeg;base64,Zm90bw==';
    finish(data);
    await waitFor(() => expect(screen.getByRole('button', { name: 'Mi foto' }).getAttribute('aria-pressed')).toBe('true'));
    fireEvent.click(screen.getByRole('button', { name: 'Retrato 2' }));
    fireEvent.click(screen.getByRole('button', { name: 'Mi foto' }));
    fireEvent.click(screen.getByRole('button', { name: 'Continuar' }));
    expect(onContinue).toHaveBeenCalledWith({ ...draft, avatar: data });
    const state = createNewGame('presidente', 'politico', 'Foto', false, data, 'normal', NO_PLATFORM_ID, 7, 'viento_de_cola');
    expect(parseSavedGame(encodeSavedGame(state))?.state.avatar).toBe(data);
  });
  it('muestra errores de formato y lectura sin reemplazar la imagen anterior', async () => {
    const onContinue = vi.fn();
    render(<CharacterCreation initial={draft} onContinue={onContinue} />);
    const input = screen.getByLabelText('Subir mi foto');
    fireEvent.change(input, { target: { files: [new File(['x'], 'documento.pdf', { type: 'application/pdf' })] } });
    expect(screen.getByRole('alert').textContent).toContain('no es una imagen');
    expect(photoToDataUrl).not.toHaveBeenCalled();
    vi.mocked(photoToDataUrl).mockRejectedValueOnce(new Error('No se pudo leer la imagen.'));
    fireEvent.change(input, { target: { files: [new File(['x'], 'roto.jpg', { type: 'image/jpeg' })] } });
    await waitFor(() => expect(screen.getByRole('alert').textContent).toContain('No se pudo leer'));
    expect(screen.getByRole('button', { name: 'Retrato 1' }).getAttribute('aria-pressed')).toBe('true');
    fireEvent.click(screen.getByRole('button', { name: 'Continuar' }));
    expect(onContinue).toHaveBeenCalledWith(draft);
  });
});
