// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest';
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { SaveControls } from '../components/SaveControls';
import { createNewGame } from '../engine/gameEngine';
import { encodeSavedGame } from '../lib/savegame';

afterEach(() => { cleanup(); vi.restoreAllMocks(); });

const makeState = (name: string) => createNewGame({ archetype: 'politico', governorName: name, seed: 1, scenarioId: 'pais_en_calma' });
function setup(failed = false) {
  const state = makeState('Partida actual');
  const onRetry = vi.fn();
  const onRestore = vi.fn();
  const onImportOpenChange = vi.fn();
  render(<SaveControls state={state} pendingEvents={[]} failed={failed} onRetry={onRetry} onRestore={onRestore} onImportOpenChange={onImportOpenChange} />);
  return { state, onRetry, onRestore, onImportOpenChange };
}

async function upload(raw: string) {
  const file = new File([raw], 'respaldo.json', { type: 'application/json' });
  Object.defineProperty(file, 'text', { value: async () => raw });
  await act(async () => { fireEvent.change(screen.getByLabelText('Archivo de respaldo de Light'), { target: { files: [file] } }); });
}

describe('Protección de la partida y respaldos', () => {
  it('un fallo es visible y permite reintentar sin reemplazar el estado', () => {
    const { onRetry, onRestore } = setup(true);
    expect(screen.getByRole('alert').textContent).toContain('No se pudo guardar');
    fireEvent.click(screen.getByRole('button', { name: 'Reintentar' }));
    expect(onRetry).toHaveBeenCalledOnce();
    expect(onRestore).not.toHaveBeenCalled();
  });

  it('un archivo inválido no reemplaza la partida actual', async () => {
    const { onRestore } = setup();
    await upload('{no es json');
    expect(screen.getByRole('alert').textContent).toContain('Tu partida sigue igual');
    expect(onRestore).not.toHaveBeenCalled();
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('un respaldo Full no reemplaza una partida Light', async () => {
    const { onRestore } = setup();
    const data = JSON.parse(encodeSavedGame(makeState('Otra'), []));
    data.edition = 'Full';
    await upload(JSON.stringify(data));
    expect(screen.getByRole('alert').textContent).toContain('no es un respaldo válido');
    expect(onRestore).not.toHaveBeenCalled();
  });

  it('cargar requiere confirmación y cancelar conserva el estado actual', async () => {
    const { onRestore } = setup();
    const raw = encodeSavedGame(makeState('Respaldo'), []);
    await upload(raw);
    expect(screen.getByRole('dialog').textContent).toContain('Reemplazará la partida abierta');
    expect(onRestore).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button', { name: 'Cancelar' }));
    expect(onRestore).not.toHaveBeenCalled();
    await upload(raw);
    fireEvent.click(screen.getByRole('button', { name: 'Cargar partida' }));
    expect(onRestore).toHaveBeenCalledOnce();
    expect(onRestore.mock.calls[0][0].state.governorName).toBe('Respaldo');
  });
});
