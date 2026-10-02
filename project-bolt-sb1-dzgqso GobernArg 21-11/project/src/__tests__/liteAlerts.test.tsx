// @vitest-environment jsdom
/** Modo simple: la aprobación no se muestra, pero nadie pierde sin aviso. */
import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import { CausalDashboard } from '../components/causal/CausalDashboard';
import { newSession } from '../causal/persistence';
import { settleCampaignClose } from '../causal/campaign';
import { defeatWarnings } from '../lite/present';

afterEach(() => cleanup());
const game = () => newSession({ name: 'Avisos', profile: 'politico', avatar: '' }).state;
const board = (state: ReturnType<typeof game>) => render(<CausalDashboard state={state} savingError={null} onExecute={() => true} onCommand={() => true} onRestart={() => {}} />);

describe('Avisos de derrota en modo simple', () => {
  it('sin peligro no hay avisos', () => {
    expect(defeatWarnings(game())).toEqual([]);
  });

  it('con un cierre de aprobación bajo 25 avisa que se pierde en 1 turno', () => {
    const state = game();
    state.socialComponent = 10;
    settleCampaignClose(state); // el motor cuenta el primer cierre bajo 25
    expect(state.campaign!.lowApprovalTurns).toBe(1);
    expect(state.phase).toBe('governing');
    board(state);
    expect(screen.getByText('La gente está muy enojada con tu gobierno: si sigue así, perdés en 1 turno.')).toBeTruthy();
    expect(screen.queryByText(/\d+,\d/)).toBeNull();
  });

  it('con la aprobación cerca del límite avisa antes de que empiece la cuenta', () => {
    const state = game();
    state.campaign!.approval = 28;
    board(state);
    expect(screen.getByText(/La gente está muy enojada con tu gobierno\. Si empeora, podés perder/)).toBeTruthy();
  });

  it('también avisa de las otras derrotas con contador', () => {
    const state = game();
    state.campaign!.insolvencyTurns = 1; state.campaign!.coupTurns = 2; state.campaign!.hyperinflationTurns = 1; state.campaign!.impeachmentTurns = 1;
    const texts = defeatWarnings(state).map(w => w.text);
    expect(texts).toEqual(expect.arrayContaining([
      expect.stringMatching(/plata.*perdés en 2 turnos/),
      expect.stringMatching(/partido se aleja.*perdés en 1 turno/),
      expect.stringMatching(/precios.*perdés en 1 turno/),
      expect.stringMatching(/juicio político.*perdés en 1 turno/),
    ]));
  });
});
