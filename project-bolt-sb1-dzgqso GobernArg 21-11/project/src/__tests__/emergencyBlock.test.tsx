// @vitest-environment jsdom
/**
 * Escenarios históricos en la interfaz: bloque de emergencia con halo,
 * cierre de la semana o el mes, resumen de la subronda, grilla sin medidas
 * extraordinarias en la gestión, ficha de "Nueva partida" y avisos propios.
 */
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { EmergencyBlock } from '../components/board/EmergencyBlock';
import { ControlPanel } from '../components/ControlPanel';
import { TurnPlan } from '../components/board/TurnPlan';
import { TurnSummaryModal } from '../components/TurnSummaryModal';
import { HistoricScenarios } from '../components/HistoricScenarios';
import { HowToPlayModal } from '../components/HowToPlayModal';
import { GameHeader } from '../components/GameHeader';
import { MobileBottomBar } from '../components/mobile/MobileChrome';
import { createNewGame, getPolicyAvailability, processEndTurn, toggleActionSelection } from '../engine/gameEngine';
import { CAUSAL_ACTIONS_BY_ID, getScenario } from '../data/causal';
import { defeatWarnings } from '../lib/simpleView';
import { roundChanges, unitWords } from '../lib/crisisView';
import type { GameState } from '../types/game';

const corralito = () => createNewGame({ archetype: 'politico', governorName: 'Ana', seed: 1, scenarioId: 'corralito' });
const hiper = () => createNewGame({ archetype: 'politico', governorName: 'Ana', seed: 1, scenarioId: 'pais_en_llamas' });
const block = (state: GameState, onActionSelect: (id: string) => void = () => {}, compact = false) =>
  render(<EmergencyBlock gameState={state} onActionSelect={onActionSelect} onEndTurn={() => {}} canEndTurn compact={compact} />);
const extraordinary = (state: GameState) => getPolicyAvailability(state).filter(a => a.action.extraordinary);

beforeAll(() => {
  window.matchMedia ??= ((query: string) => ({ matches: false, media: query, onchange: null,
    addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {}, dispatchEvent: () => false,
  })) as unknown as typeof window.matchMedia;
});
afterEach(cleanup);

describe('Bloque de emergencia (Corralito 2001)', () => {
  it('muestra la etapa, el contexto, el estado, las medidas con halo y el botón de cerrar la semana', () => {
    const g = corralito();
    const def = getScenario('corralito').crisis!;
    const onActionSelect = vi.fn();
    const { container } = block(g, onActionSelect);

    expect(screen.getByText('Primera semana de diciembre · Semana 1 de 3')).toBeTruthy();
    for (const line of def.context) expect(screen.getByText(line)).toBeTruthy();
    expect(screen.getByText(def.alternateHistory)).toBeTruthy();
    expect(screen.getByText('Convertibilidad: 1 peso = 1 dólar')).toBeTruthy();
    expect(screen.getByText('Contener la corrida')).toBeTruthy();

    const glowing = container.querySelectorAll('[data-glow]');
    expect(glowing.length).toBeGreaterThanOrEqual(5);
    expect(screen.getAllByText(/^Sale bien si/).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/^Explota si/).length).toBeGreaterThan(0);
    expect(screen.getAllByText('Sin costo · una por semana').length).toBeGreaterThan(0);
    expect(screen.getByText('Sin medida extraordinaria esta semana')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Cerrar la semana' })).toBeTruthy();

    const name = CAUSAL_ACTIONS_BY_ID.limitar_retiros.name;
    fireEvent.click(screen.getByRole('button', { name: `Agregar ${name} al turno` }));
    expect(onActionSelect).toHaveBeenCalledWith('limitar_retiros');

    // Más de seis medidas: las que sobran quedan plegadas, y al abrirlas están todas.
    const total = extraordinary(g).length;
    const more = screen.queryByRole('button', { name: /Ver \d+ medidas? más/ });
    if (total > 6) {
      expect(more).toBeTruthy();
      expect(glowing.length).toBe(6);
      fireEvent.click(more!);
      expect(container.querySelectorAll('[data-glow]').length).toBe(total);
    } else {
      expect(more).toBeNull();
    }
  });

  it('con una medida elegida, las demás avisan que es una sola por subronda y se ve "Elegiste"', () => {
    const g = toggleActionSelection(corralito(), 'salir_convertibilidad');
    expect(g.selectedActions).toEqual(['salir_convertibilidad']);
    block(g);
    const name = CAUSAL_ACTIONS_BY_ID.salir_convertibilidad.name;
    expect(screen.getByText(/Elegiste:/).textContent).toContain(name);
    expect(screen.getByRole('button', { name: `Quitar ${name} del turno` })).toBeTruthy();
    expect(screen.getAllByText('Una sola medida extraordinaria por subronda.').length).toBeGreaterThan(0);
    expect(screen.queryByRole('button', { name: /^Agregar .* al turno$/ })).toBeNull();
  });

  it('la ayuda abre una hoja con la nota larga de la medida', () => {
    block(corralito());
    const name = CAUSAL_ACTIONS_BY_ID.limitar_retiros.name;
    const card = screen.getByRole('article', { name });
    fireEvent.click(card.querySelector('button')!);
    const dialog = screen.getByRole('dialog', { name });
    expect(dialog.textContent).toContain(CAUSAL_ACTIONS_BY_ID.limitar_retiros.strategic);
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('después de tres semanas pasa a gestión: el bloque dice "Medidas extraordinarias" y la grilla no las repite', () => {
    let g = corralito();
    for (let i = 0; i < 3; i++) g = processEndTurn(g).state;
    expect(g.causal.crisis?.phase).toBe('gestion');

    block(g, () => {}, true);
    expect(screen.getByText('Medidas extraordinarias', { selector: 'p' })).toBeTruthy();
    expect(screen.queryByRole('button', { name: /Cerrar la semana/ })).toBeNull();
    expect(screen.getAllByText('Sin costo · una por turno').length).toBeGreaterThan(0);
    cleanup();

    render(<ControlPanel gameState={g} onActionSelect={() => {}} canTakeAction />);
    const regular = getPolicyAvailability(g).filter(a => !a.action.extraordinary && a.available);
    expect(regular.length).toBeGreaterThan(0);
    expect(screen.getByRole('article', { name: regular[0].action.name })).toBeTruthy();
    const extra = extraordinary(g);
    expect(extra.length).toBeGreaterThan(0);
    for (const a of extra) expect(screen.queryByRole('article', { name: a.action.name })).toBeNull();
  });
});

describe('Resumen de la subronda', () => {
  it('muestra el título de la semana, lo que hiciste, lo que pasó y lo que más se movió', () => {
    const result = processEndTurn({ ...corralito(), selectedActions: ['limitar_retiros'] });
    expect(result.summary.crisisRound).toMatchObject({ round: 1, label: 'Primera semana de diciembre', last: false });
    render(<TurnSummaryModal summary={result.summary} gameState={result.state} onClose={() => {}} />);
    expect(screen.getByRole('heading', { name: 'Primera semana de diciembre' })).toBeTruthy();
    expect(screen.getByText('Cierre de la semana')).toBeTruthy();
    expect(screen.getByText(/Hiciste:/).closest('p')?.textContent).toContain(CAUSAL_ACTIONS_BY_ID.limitar_retiros.name);
    for (const line of result.summary.events) expect(screen.getByText(line)).toBeTruthy();
    expect(screen.getByText('Lo que más se movió')).toBeTruthy();
    expect(screen.getByText(/Gobernabilidad:/)).toBeTruthy();
    expect(screen.getByText(/Caja:/)).toBeTruthy();
    expect(screen.queryByText(/Termina la emergencia/)).toBeNull();
    const record = result.state.causal.crisis!.log[0];
    expect(roundChanges(record).length).toBeGreaterThan(0);
  });

  it('al cerrar la tercera semana avisa que empieza la gestión por trimestres', () => {
    let g = corralito();
    let result = processEndTurn(g);
    for (let i = 0; i < 2; i++) {
      g = result.state;
      result = processEndTurn(g);
    }
    expect(result.summary.crisisRound?.last).toBe(true);
    render(<TurnSummaryModal summary={result.summary} gameState={result.state} onClose={() => {}} />);
    expect(screen.getAllByText(/Termina la emergencia/)).toHaveLength(1);
    expect(screen.getByText('Termina la emergencia: empieza la gestión por trimestres.')).toBeTruthy();
    expect(screen.getByRole('button', { name: /Empezar la gestión/ })).toBeTruthy();
  });
});

describe('Encabezados y plan durante la emergencia', () => {
  it('"Este turno" habla de la semana, no cuenta acciones y cierra la semana', () => {
    render(<TurnPlan gameState={corralito()} onActionSelect={() => {}} onEndTurn={() => {}} canEndTurn compact />);
    expect(screen.getByText('Esta semana')).toBeTruthy();
    expect(screen.getByRole('button', { name: /Cerrar la semana/ })).toBeTruthy();
    expect(screen.queryByText(/acciones$/)).toBeNull();
    expect(screen.queryByText(/Caja estimada al cierre/)).toBeNull();
  });

  it('en la gestión, una medida extraordinaria elegida lleva la marca', () => {
    let g = corralito();
    for (let i = 0; i < 3; i++) g = processEndTurn(g).state;
    // Tres semanas sin medidas: la convertibilidad se rompió sola, así que se elige la primera que siga habilitada.
    const available = extraordinary(g).find(a => a.available)!;
    expect(available).toBeTruthy();
    g = toggleActionSelection(g, available.action.id);
    expect(g.selectedActions).toContain(available.action.id);
    render(<TurnPlan gameState={g} onActionSelect={() => {}} onEndTurn={() => {}} canEndTurn compact />);
    expect(screen.getByText(available.action.name, { exact: false })).toBeTruthy();
    expect(screen.getByText('Este turno')).toBeTruthy();
    expect(screen.getByText('extraordinaria')).toBeTruthy();
    expect(screen.getByRole('button', { name: /Cerrar el trimestre/ })).toBeTruthy();
  });

  it('el encabezado de escritorio muestra la subronda y "Cerrar la semana"; en la gestión, la fecha de inicio', () => {
    render(<GameHeader gameState={corralito()} availableActions={4} onRestart={() => {}} onEndTurn={() => {}} canEndTurn />);
    expect(screen.getByText('Primera semana de diciembre')).toBeTruthy();
    expect(screen.getByText('Semana 1 de 3')).toBeTruthy();
    expect(screen.getByRole('button', { name: /Cerrar la semana/ })).toBeTruthy();
    expect(screen.queryByRole('button', { name: /Finalizar turno/ })).toBeNull();
    cleanup();

    let g = corralito();
    for (let i = 0; i < 3; i++) g = processEndTurn(g).state;
    render(<GameHeader gameState={g} availableActions={4} onRestart={() => {}} onEndTurn={() => {}} canEndTurn />);
    expect(screen.getByText(/desde el 30 de noviembre de 2001/)).toBeTruthy();
    expect(screen.getByRole('button', { name: /Finalizar turno/ })).toBeTruthy();
  });

  it('la barra del celular dice "Cerrar el mes" en la Hiper', () => {
    render(<MobileBottomBar gameState={hiper()} tab="acciones" onTab={() => {}} onEndTurn={() => {}} canEndTurn />);
    expect(screen.getByRole('button', { name: 'Cerrar el mes' })).toBeTruthy();
    expect(unitWords('mes').close).toBe('Cerrar el mes');
    expect(unitWords('semana').thisCap).toBe('Esta semana');
  });
});

describe('Avisos de derrota propios de la emergencia', () => {
  it('Hiper: precios en el techo y acelerando con la cuenta en marcha', () => {
    const g = hiper();
    g.causal.crisis!.crisisStreak = 1;
    g.causal.crisis!.aceleracion = 2;
    g.causal.base.INFL = 97;
    g.causal.political.gob = 40;
    const warnings = defeatWarnings(g);
    expect(warnings).toEqual([expect.objectContaining({ id: 'hyperinflation', critical: true })]);
    expect(warnings[0].text).toBe('Los precios están en el techo y acelerando: otro mes así y el gobierno cae.');
    expect(warnings.every(w => !/\d/.test(w.text))).toBe(true);
  });

  it('Corralito: sin gobernabilidad, otra semana así y el presidente renuncia', () => {
    const g = corralito();
    g.causal.crisis!.crisisStreak = 1;
    g.causal.political.gob = 10;
    const warnings = defeatWarnings(g);
    expect(warnings).toEqual([expect.objectContaining({ id: 'resignation', critical: true })]);
    expect(warnings[0].text).toBe('Sin gobernabilidad: otra semana así y el presidente renuncia.');
    // Sin la cuenta en marcha, el aviso es suave.
    const calm = corralito();
    calm.causal.political.gob = 20;
    expect(defeatWarnings(calm).map(w => w.critical)).toEqual([false]);
  });

  it('en la gestión vuelven las reglas normales', () => {
    let g = corralito();
    for (let i = 0; i < 3; i++) g = processEndTurn(g).state;
    g.causal.govCrisisStreak = 1;
    expect(defeatWarnings(g).some(w => w.id === 'impeachment' && w.critical)).toBe(true);
  });
});

describe('Nueva partida y ayuda', () => {
  it('la ficha muestra la fecha de inicio, la moneda y la historia alternativa', () => {
    render(<HistoricScenarios scenarioId="corralito" onSelect={() => {}} />);
    expect(screen.getByText(/Arranca el 30 de noviembre de 2001/)).toBeTruthy();
    expect(screen.getByText(/Arranca el 1 de junio de 1989/)).toBeTruthy();
    expect(screen.getByText(/moneda: austral/)).toBeTruthy();
    expect(screen.getAllByText(/historia es alternativa/)).toHaveLength(2);
    expect(screen.getByText('Emergencia de tres semanas: una medida extraordinaria por semana')).toBeTruthy();
  });

  it('la guía explica los escenarios históricos sin números', () => {
    render(<HowToPlayModal actions={4} onClose={() => {}} />);
    expect(screen.getByText('Escenarios históricos')).toBeTruthy();
    const text = screen.getByText(/Arrancan con una emergencia/).textContent ?? '';
    expect(/\d/.test(text)).toBe(false);
  });
});
