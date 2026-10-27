// @vitest-environment jsdom
import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { ManagementActivityNotice, ManagementActivityOutcome } from '../components/ManagementActivityNotice';
import { createNewGame, processEndTurn, toggleActionSelection } from '../engine/gameEngine';

afterEach(cleanup);
const makeGame = () => createNewGame({ archetype: 'politico', governorName: 'Prueba', seed: 1, scenarioId: 'pais_en_calma' });

describe('Uso de acciones visible sin interrumpir las decisiones', () => {
  it('actualiza el aviso al agregar y cancelar una política y deja consultar la regla', () => {
    const original = makeGame();
    const { rerender } = render(<ManagementActivityNotice gameState={original} />);
    expect(screen.getByText(/La inacción repetida desgasta/)).toBeTruthy();
    const selected = toggleActionSelection(original, 'emitir_dinero');
    expect(selected.actions).toBe(3);
    rerender(<ManagementActivityNotice gameState={selected} />);
    expect(screen.getByText(/Dejar 3 acciones sin usar/)).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Cómo influye el uso de acciones' }));
    expect(screen.getByText(/Dejar una acción libre no penaliza/)).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Cómo influye el uso de acciones' }).getAttribute('aria-expanded')).toBe('true');
    rerender(<ManagementActivityNotice gameState={toggleActionSelection(selected, 'emitir_dinero')} />);
    expect(screen.getByText(/La inacción repetida desgasta/)).toBeTruthy();
  });

  it('no añade un aviso de penalidad cuando sobra una acción o se usaron todas', () => {
    const state = makeGame();
    const { container, rerender } = render(<ManagementActivityNotice gameState={{ ...state, actions: 1 }} />);
    expect(container.textContent).toBe('');
    rerender(<ManagementActivityNotice gameState={{ ...state, actions: 0 }} />);
    expect(container.textContent).toBe('');
  });

  it('explica el desgaste antes del cuarto cierre y el resultado real del cierre', () => {
    let state = makeGame();
    for (let n = 0; n < 3; n++) state = processEndTurn(state).state;
    const { rerender } = render(<ManagementActivityNotice gameState={state} />);
    expect(screen.getByText(/Otro turno sin usar acciones debilita fuerte/)).toBeTruthy();
    state = processEndTurn(state).state;
    const record = state.causal.records[state.causal.records.length - 1];
    rerender(<ManagementActivityOutcome record={record} simple />);
    expect(screen.getByText(/La inacción acumulada debilitó la gobernabilidad/)).toBeTruthy();
    expect(screen.queryByText(/Gobernabilidad: −/)).toBeNull();
  });

  it('no agrega esta regla a los históricos ni inventa resultados de guardados anteriores', () => {
    const state = makeGame();
    state.causal.scenarioId = 'corralito';
    const { container, rerender } = render(<ManagementActivityNotice gameState={state} />);
    expect(container.textContent).toBe('');
    rerender(<ManagementActivityOutcome record={null} />);
    expect(container.textContent).toBe('');
  });
});
