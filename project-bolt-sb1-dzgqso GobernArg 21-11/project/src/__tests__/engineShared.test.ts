import { describe, it, expect } from 'vitest';
import { addNotification } from '../engine/engineShared';
import { getInitialGameState } from '../engine/gameEngine';
import { PARAMS } from '../data/causal';

describe('getInitialGameState - flujo solo presidente', () => {
  it('arranca como presidente', () => {
    expect(getInitialGameState().position).toBe('presidente');
  });

  it('arranca con la caja inicial del motor causal', () => {
    expect(getInitialGameState().budget).toBe(PARAMS.CAJA_INICIAL);
    expect(getInitialGameState().causal.caja).toBe(PARAMS.CAJA_INICIAL);
  });
});


// ===== Regresión: addNotification congela el turno de creación (Punto 13) =====

describe('addNotification', () => {
  it('guarda el year/turn del estado al crear la notificación', () => {
    const state = { ...getInitialGameState(), year: 3, turn: 2 };

    const result = addNotification(state, {
      type: 'info',
      title: 'Aviso de prueba',
      message: 'Mensaje',
      importance: 'low',
    });

    // El centro de notificaciones mostraba el turno vivo del estado; la
    // notificación debe llevar el año/trimestre de cuando fue creada.
    const notification = result.notifications[0];
    expect(notification.year).toBe(3);
    expect(notification.turn).toBe(2);
    // No muta el estado original (patrón prev de React).
    expect(state.notifications).toHaveLength(0);
  });
});
