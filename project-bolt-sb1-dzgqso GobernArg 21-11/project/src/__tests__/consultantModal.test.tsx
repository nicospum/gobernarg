// @vitest-environment jsdom
/**
 * La visita de Gastón Barenboim en pantalla: retrato, discurso, dato de las
 * encuestas y tres respuestas; y la medida fijada que no se puede quitar.
 */
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { ConsultantModal } from '../components/ConsultantModal';
import { ActionCard } from '../components/ActionCard';
import { TurnPlan } from '../components/board/TurnPlan';
import { CAUSAL_ACTIONS_BY_ID } from '../data/causal';
import { SECTOR_PHRASE } from '../data/consultor';
import { applyEventChoice, createNewGame, getPolicyAvailability, processEndTurn } from '../engine/gameEngine';
import { activeConsultantVisit, isConsultantEvent } from '../engine/consultant';
import { fmtBudget } from '../lib/format';
import { personImage } from '../lib/liteImages';

beforeAll(() => {
  window.matchMedia ??= ((query: string) => ({ matches: false, media: query, onchange: null,
    addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {}, dispatchEvent: () => false,
  })) as unknown as typeof window.matchMedia;
});
afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

/** Cierra turnos hasta la visita anticipada de las legislativas (turno 3). */
function visitState() {
  vi.spyOn(Math, 'random').mockReturnValue(0.999);
  let state = createNewGame({ archetype: 'politico', governorName: 'Ana', seed: 3, scenarioId: 'pais_en_calma' });
  for (let n = 0; n < 4; n++) {
    const result = processEndTurn(state);
    state = result.state;
    const event = result.triggeredEvents.find(isConsultantEvent);
    if (event) return { state, event };
  }
  throw new Error('sin visita anticipada');
}

describe('visita de Gastón Barenboim', () => {
  it('muestra el retrato, el discurso, el dato de las encuestas y las tres respuestas en orden', () => {
    const { state, event } = visitState();
    const visit = activeConsultantVisit(state.causal, event)!;
    expect(visit.actor).not.toBeNull();
    expect(visit.policy).not.toBeNull();
    const policyName = CAUSAL_ACTIONS_BY_ID[visit.policy!].name;
    const onChoice = vi.fn();
    render(<ConsultantModal event={event} gameState={state} onChoice={onChoice} />);

    const dialog = screen.getByRole('dialog', { name: 'Gastón Barenboim' });
    expect(screen.getByText('Consultor político')).toBeTruthy();
    const img = screen.getByRole('img', { name: 'Gastón Barenboim' });
    expect(img.getAttribute('src')).toContain('gaston-barenboim');
    expect(personImage('gaston-barenboim')).toBe(img.getAttribute('src'));
    expect(img.className).toContain('object-contain');
    expect(screen.getByText(event.description)).toBeTruthy();
    expect(screen.getByText('Dato de las encuestas')).toBeTruthy();
    expect(screen.getByText(/Las encuestas dicen que/).textContent).toContain(SECTOR_PHRASE[visit.actor!].phrase);
    expect(screen.getByText(`Lo que mueve a ese sector: ${policyName}.`)).toBeTruthy();

    const buttons = within(dialog).getAllByRole('button');
    expect(buttons).toHaveLength(3);
    expect(buttons[0].textContent).toContain('Lo que diga el encuestador, se hace');
    expect(buttons[0].textContent).toContain(`Honorarios: ${fmtBudget(150)}`);
    expect(buttons[0].textContent).toContain(`${policyName} queda en la agenda de este turno`);
    expect(buttons[1].textContent).toContain('No le doy vuelo. Me fijo qué dicen en las redes');
    expect(buttons[1].textContent).toContain('Sin costo');
    expect(buttons[2].textContent).toContain('Gracias, Gastón. Sigo mi instinto');
    expect(buttons[2].textContent).toContain('Nada cambia');
    // Los puntos de voto no se muestran nunca.
    expect(dialog.textContent).not.toMatch(/[+−]\s?\d/);

    fireEvent.click(buttons[0]);
    expect(onChoice).toHaveBeenLastCalledWith('encuestador');
    fireEvent.click(buttons[1]);
    expect(onChoice).toHaveBeenLastCalledWith('redes');
    fireEvent.click(buttons[2]);
    expect(onChoice).toHaveBeenLastCalledWith('instinto');
    expect(onChoice).toHaveBeenCalledTimes(3);

    // Decisión obligatoria: Escape no cierra.
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(screen.getByRole('dialog', { name: 'Gastón Barenboim' })).toBe(dialog);
  });

  it('sin medida que recomendar, la opción del encuestador muestra solo el honorario', () => {
    const { state, event } = visitState();
    const visit = state.causal.consultant!.visits[0];
    const bare = { ...state, causal: { ...state.causal, consultant: { ...state.causal.consultant!, visits: [{ ...visit, policy: null }] } } };
    render(<ConsultantModal event={event} gameState={bare} onChoice={() => {}} />);
    expect(screen.getByText(/Las encuestas dicen que/)).toBeTruthy();
    expect(screen.queryByText(/Lo que mueve a ese sector/)).toBeNull();
    const first = within(screen.getByRole('dialog', { name: 'Gastón Barenboim' })).getAllByRole('button')[0];
    expect(first.textContent).toContain(`Honorarios: ${fmtBudget(150)}`);
    expect(first.textContent).not.toContain('agenda');
  });

  it('sin caja para el honorario, hacerle caso queda deshabilitado y lo dice; las otras dos siguen', () => {
    const { state, event } = visitState();
    const broke = { ...state, causal: { ...state.causal, caja: 149 }, budget: 149 };
    const onChoice = vi.fn();
    render(<ConsultantModal event={event} gameState={broke} onChoice={onChoice} />);
    const buttons = within(screen.getByRole('dialog', { name: 'Gastón Barenboim' })).getAllByRole('button') as HTMLButtonElement[];
    expect(buttons).toHaveLength(3);
    expect(buttons[0].disabled).toBe(true);
    expect(buttons[0].textContent).toContain(`Honorarios: ${fmtBudget(150)}`);
    expect(buttons[0].textContent).toContain('No alcanza la caja');
    expect(buttons[1].disabled).toBe(false);
    expect(buttons[2].disabled).toBe(false);
    expect(buttons[1].textContent).not.toContain('No alcanza la caja');
    fireEvent.click(buttons[0]);
    expect(onChoice).not.toHaveBeenCalled();
    fireEvent.click(buttons[2]);
    expect(onChoice).toHaveBeenLastCalledWith('instinto');
    cleanup();

    // Con la caja justa, se puede.
    render(<ConsultantModal event={event} gameState={{ ...state, causal: { ...state.causal, caja: 150 } }} onChoice={onChoice} />);
    const first = within(screen.getByRole('dialog', { name: 'Gastón Barenboim' })).getAllByRole('button')[0] as HTMLButtonElement;
    expect(first.disabled).toBe(false);
    expect(first.textContent).not.toContain('No alcanza la caja');
  });

  it('la medida fijada por el encuestador no se puede quitar desde el plan ni desde la tarjeta', () => {
    const { state, event } = visitState();
    const after = applyEventChoice(state, event, 'encuestador');
    const policy = after.causal.consultant!.lockedPolicy!;
    const name = CAUSAL_ACTIONS_BY_ID[policy].name;
    const onActionSelect = vi.fn();

    render(<TurnPlan gameState={after} onActionSelect={onActionSelect} onEndTurn={() => {}} canEndTurn compact />);
    expect(screen.getByText('fijada por el encuestador')).toBeTruthy();
    expect(screen.queryByRole('button', { name: `Quitar ${name} de la agenda` })).toBeNull();
    cleanup();

    render(<TurnPlan gameState={after} onActionSelect={onActionSelect} onEndTurn={() => {}} canEndTurn />);
    expect(screen.getByText('fijada por el encuestador')).toBeTruthy();
    expect(screen.queryByRole('button', { name: `Quitar ${name} de la agenda` })).toBeNull();
    cleanup();

    const availability = getPolicyAvailability(after).find(a => a.action.id === policy)!;
    render(<ActionCard availability={availability} requestedBy={[]} onSelect={onActionSelect} isSelected disabled={false} locked />);
    const fixed = screen.getByRole('button', { name: `${name}: fijada por el encuestador` }) as HTMLButtonElement;
    expect(fixed.disabled).toBe(true);
    expect(fixed.textContent).toContain('Fijada por el encuestador');
    expect(screen.queryByText('Seleccionada · quitar')).toBeNull();
    fireEvent.click(screen.getByRole('article', { name }));
    expect(onActionSelect).not.toHaveBeenCalled();
  });
});
