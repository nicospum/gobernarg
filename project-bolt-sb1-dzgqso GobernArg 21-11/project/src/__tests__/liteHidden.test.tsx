// @vitest-environment jsdom
/**
 * Lo que la Lite conserva oculto: los escenarios históricos (detrás de
 * LITE_FEATURES.escenariosHistoricos) y el registro de la partida, que no
 * tiene panel de historial pero se muestra en el legado final.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { NewGameScreen } from '../components/NewGameScreen';
import { CampaignFlow } from '../components/causal/CampaignFlow';
import { LITE_FEATURES } from '../lite/config';
import { loadProgress, recordReelectionWin, setUnlockAll } from '../causal/progress';
import { applyCommand } from '../causal/engine';
import { deserializeSession, newSession, serializeSession } from '../causal/persistence';
import { CAMPAIGN_EVENTS } from '../causal/campaignCatalog';
import type { CausalState, GameCommand } from '../causal/types';

beforeEach(() => localStorage.clear());
afterEach(() => cleanup());
const click = async (el: HTMLElement) => { await act(async () => { fireEvent.click(el); }); };

describe('Escenarios históricos ocultos', () => {
  it('el flag de la Lite está apagado y la pantalla no los muestra', () => {
    expect(LITE_FEATURES.escenariosHistoricos).toBe(false);
    render(<NewGameScreen onBack={() => {}} onStart={() => {}} />);
    expect(screen.queryByText('Escenarios históricos')).toBeNull();
    expect(screen.queryByText(/Corralito/)).toBeNull();
  });

  it('el progreso cuenta cada reelección una sola vez y respeta "desbloquear todos"', () => {
    expect(recordReelectionWin('cmd-1').counted).toBe(true);
    expect(recordReelectionWin('cmd-1').counted).toBe(false);
    expect(loadProgress().reelectionsWon).toBe(1);
    expect(setUnlockAll(true).unlockAll).toBe(true);
  });

  it('reactivados, se desbloquean con reelecciones y arrancan su escenario', async () => {
    const onStart = vi.fn();
    const { unmount } = render(<NewGameScreen onBack={() => {}} onStart={onStart} historicScenarios />);
    expect(screen.getByText('Escenarios históricos')).toBeTruthy();
    expect((screen.getByRole('radio', { name: /Corralito/ }) as HTMLButtonElement).disabled).toBe(true);
    unmount();

    recordReelectionWin('ganada-1');
    render(<NewGameScreen onBack={() => {}} onStart={onStart} historicScenarios />);
    expect((screen.getByRole('radio', { name: /Corralito/ }) as HTMLButtonElement).disabled).toBe(false);
    expect((screen.getByRole('radio', { name: /País en llamas/ }) as HTMLButtonElement).disabled).toBe(true);
    fireEvent.change(screen.getByPlaceholderText('Ingresá tu nombre'), { target: { value: 'Histórica' } });
    await click(screen.getByRole('radio', { name: /Corralito/ }));
    await click(screen.getByRole('button', { name: /^Empezar$/ }));
    expect(onStart).toHaveBeenCalledWith(expect.objectContaining({ scenarioId: 'corralito' }));
  });

  it('País en llamas (exigencia Leyenda) se juega y se guarda', () => {
    let session = newSession({ name: 'Llamas', profile: 'politico', avatar: 'avatar:1', difficulty: 'legend', scenarioId: 'pais_en_llamas' });
    expect(session.state.indicators.inflacion).toBe(80);
    const cmd: GameCommand = { id: 'llamas-1', expectedTurn: 1, type: 'close_turn' };
    session = { ...session, state: applyCommand(session.state, cmd).state, commands: [cmd] };
    expect(deserializeSession(serializeSession(session)).state).toEqual(session.state);
  });
});

describe('Registro de la partida en el legado', () => {
  it('sin panel de historial, el balance final repasa cada cierre', async () => {
    let state: CausalState = newSession({ name: 'Legado', profile: 'politico', avatar: '' }).state;
    let n = 0;
    const issue = (type: GameCommand['type'], targetId?: string, choiceId?: string, actionId?: string) => {
      const r = applyCommand(state, { id: `legado-${++n}`, expectedTurn: state.turn, type, targetId, choiceId, actionId });
      expect(r.accepted, r.message).toBe(true); state = r.state;
    };
    issue('execute', undefined, undefined, 'mejorar_recaudacion');
    for (let t = 0; t < 3; t++) {
      if (state.campaign!.pendingEvent) { const e = CAMPAIGN_EVENTS.find(x => x.id === state.campaign!.pendingEvent!.id)!; issue('choose_event', e.id, e.choices.find(c => c.cost === 0)!.id); }
      issue('close_turn');
    }
    issue('end_game');
    expect(state.reports).toHaveLength(3);
    render(<CampaignFlow state={state} onCommand={() => true} onRestart={() => {}} />);
    expect(screen.getByRole('dialog', { name: 'Legado de tu gobierno' })).toBeTruthy();
    await click(screen.getByRole('button', { name: 'Revisar informes de gestión' }));
    expect(screen.getByText(/^T1 · Caja/)).toBeTruthy();
    expect(screen.getByText(/^T3 · Caja/)).toBeTruthy();
    expect(screen.getAllByText(/Mejorar la recaudación|recaudación/i).length).toBeGreaterThan(0);
  });
});

describe('Niveles de la Lite', () => {
  it('ofrece Normal y Argentina, con Normal elegido; Fácil vuelve con el flag', async () => {
    const onStart = vi.fn();
    render(<NewGameScreen onBack={() => {}} onStart={onStart} />);
    const levels = screen.getByRole('radiogroup', { name: 'Nivel' });
    expect(levels.querySelectorAll('[role=radio]')).toHaveLength(2);
    expect(screen.queryByRole('radio', { name: /Fácil/ })).toBeNull();
    expect(screen.getByRole('radio', { name: /Normal/ }).getAttribute('aria-checked')).toBe('true');
    fireEvent.change(screen.getByPlaceholderText('Ingresá tu nombre'), { target: { value: 'Normal' } });
    await click(screen.getByRole('button', { name: /^Empezar$/ }));
    expect(onStart).toHaveBeenCalledWith(expect.objectContaining({ scenarioId: 'viento_de_cola' }));
    cleanup();

    LITE_FEATURES.nivelFacil = true;
    try {
      render(<NewGameScreen onBack={() => {}} onStart={() => {}} />);
      expect(screen.getByRole('radio', { name: /Fácil/ })).toBeTruthy();
    } finally { LITE_FEATURES.nivelFacil = false; }
  });

  it('una partida guardada en Fácil se sigue cargando', () => {
    const session = newSession({ name: 'Fácil', profile: 'politico', avatar: 'avatar:2', difficulty: 'easy', scenarioId: 'pais_en_calma' });
    expect(deserializeSession(serializeSession(session)).state.scenarioId).toBe('pais_en_calma');
  });
});
