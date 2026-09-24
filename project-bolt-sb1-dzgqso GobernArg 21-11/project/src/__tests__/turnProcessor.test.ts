import { afterEach, describe, it, expect, vi } from 'vitest';
import { processEndTurn } from '../engine/turnProcessor';
import { getInitialGameState } from '../engine/gameEngine';
import { ACTOR_IDS, CAUSAL_ACTIONS_BY_ID, EFFECTS_BY_ACTION, isOrganized } from '../data/causal';
import type { GameState, Position } from '../types/game';

function baseState(position: Position = 'presidente'): GameState {
  const s = getInitialGameState();
  return { ...s, position, causal: structuredClone(s.causal) };
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe('aprobación: sin desgaste fijo (motor causal)', () => {
  it('el cambio de aprobación del turno es el de la satisfacción de los actores, no un −10 fijo', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.999);
    const state = baseState();
    const result = processEndTurn(state);
    const delta = result.state.causal.political.apro - state.causal.political.apro;
    expect(result.summary.popularityChange).toBeCloseTo(delta, 5);
    expect(result.summary.popularityChange).not.toBe(-10);
    expect(result.state.popularity).toBeCloseTo(result.state.causal.political.apro, 0);
  });
});

describe('creación del TurnLogEntry', () => {
  it('registra un entry con los campos requeridos', () => {
    const result = processEndTurn(baseState());
    const entry = result.state.turnLog[result.state.turnLog.length - 1];

    expect(entry).toBeDefined();
    expect(entry).toHaveProperty('year');
    expect(entry).toHaveProperty('turn');
    expect(entry).toHaveProperty('position');
    expect(entry).toHaveProperty('actionsTaken');
    expect(entry).toHaveProperty('events');
    expect(entry).toHaveProperty('popularityChange');
    expect(entry).toHaveProperty('budgetChange');
  });

  it('registra year, turn y position del turno procesado', () => {
    const result = processEndTurn(baseState('gobernador'));
    const entry = result.state.turnLog[result.state.turnLog.length - 1];

    expect(entry.year).toBe(1);
    expect(entry.turn).toBe(1);
    expect(entry.position).toBe('gobernador');
  });

  it('registra actionsTaken y events como arrays', () => {
    const result = processEndTurn(baseState());
    const entry = result.state.turnLog[result.state.turnLog.length - 1];

    expect(Array.isArray(entry.actionsTaken)).toBe(true);
    expect(Array.isArray(entry.events)).toBe(true);
  });

  it('budgetChange es el movimiento real de la caja del turno (recaudación − gasto − deuda)', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.999);
    const state = baseState();
    const result = processEndTurn(state);
    const entry = result.state.turnLog[result.state.turnLog.length - 1];
    const fiscal = result.state.causal.records[result.state.causal.records.length - 1].fiscal;

    expect(entry.budgetChange).toBeCloseTo(fiscal.cajaDespues - state.causal.caja, 5);
    expect(fiscal.ingresos - fiscal.gastoCorriente - fiscal.servicioDeuda).toBeCloseTo(fiscal.resultado, 5);
  });

  it('registra el nombre de las políticas ejecutadas', () => {
    const state = { ...baseState(), selectedActions: ['estudio_factibilidad'] };
    const result = processEndTurn(state);
    const entry = result.state.turnLog[result.state.turnLog.length - 1];
    expect(entry.actionsTaken).toEqual([CAUSAL_ACTIONS_BY_ID.estudio_factibilidad.name]);
  });
});

// ===== Regresión: completedObjectives no se muta (Punto 9) =====

describe('completedObjectives — anti mutación', () => {
  it('processEndTurn no muta completedObjectives del estado original', () => {
    const state = baseState();
    state.objectives = [
      {
        id: 'obj-test',
        title: 'Objetivo de prueba',
        description: '',
        requirements: { popularity: 1 },
        reward: {},
        completed: false,
        progress: 0,
      },
    ];

    const before = state.completedObjectives;
    const result = processEndTurn(state);

    expect(result.state.completedObjectives.some(o => o.id === 'obj-test')).toBe(true);
    expect(state.completedObjectives).toBe(before);
    expect(state.completedObjectives.some(o => o.id === 'obj-test')).toBe(false);
  });
});

// ===== Inflación: advertencias y derrota (D-06, R-24) =====

describe('inflación y emisión', () => {
  it('emitir_dinero se frena por la ventana de repetición, no por cooldown (D-06)', () => {
    expect(CAUSAL_ACTIONS_BY_ID.emitir_dinero.cooldown).toBe(1);
    const reps = (EFFECTS_BY_ACTION.emitir_dinero ?? []).filter(r => r.kind === 'REPETITION');
    expect(reps.some(r => r.repetition === 'COUNT(emitir_dinero,6)>=3')).toBe(true);
  });

  it('con inflación desbocada avisa, y con hiperinflación dos turnos seguidos se pierde el gobierno', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.999);
    let state = baseState();
    state.causal.base.INFL = 99;
    state.causal.desanclaje = 60;

    let result = processEndTurn(state);
    expect(result.state.notifications.some(n => n.title === 'Al borde de la hiperinflación' && n.importance === 'critical')).toBe(true);
    expect(result.state.gameOver).toBe(false);

    state = result.state;
    result = processEndTurn(state);
    expect(result.state.gameOver).toBe(true);
    expect(result.state.defeatReason).toBe('hyperinflation');
  });

  it('caja negativa al cierre: aviso y emisión forzada el turno siguiente (D-10)', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.999);
    const state = baseState();
    state.causal.caja = -800;
    let result = processEndTurn(state);
    expect(result.state.notifications.some(n => n.title === 'Caja en rojo')).toBe(true);
    result = processEndTurn(result.state);
    const last = result.state.causal.records[result.state.causal.records.length - 1];
    expect(last.actions[0]).toMatchObject({ actionId: 'emitir_dinero', forced: true });
  });
});

// ===== Gobernabilidad: crisis y juicio político (R-24) =====

describe('crisis de gobernabilidad', () => {
  it('dos turnos con gobernabilidad bajo 15 terminan en juicio político', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.999);
    let state = baseState();
    state.causal.base.CONF = 100;
    state.causal.political.legAdj = -30;
    for (const a of ACTOR_IDS) {
      state.causal.actors[a].sat = 3;
      if (isOrganized(a)) state.causal.actors[a].rel = 0;
    }
    let result = processEndTurn(state);
    expect(result.state.causal.political.gob).toBeLessThan(15);
    expect(result.state.notifications.some(n => n.title === 'Crisis de gobernabilidad')).toBe(true);
    state = result.state;
    result = processEndTurn(state);
    expect(result.state.gameOver).toBe(true);
    expect(result.state.defeatReason).toBe('impeachment');
  });
});

// ===== Sin antagonismo automático (D-05) =====

describe('sin antagonismo automático', () => {
  it('una política no cambia la relación con actores que no son parte de ella', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.999);
    const state = { ...baseState(), selectedActions: ['cobertura_social'] };
    const result = processEndTurn(state);
    for (const a of ['industria', 'financiero', 'agro'] as const) {
      // Sin contacto 1 turno no hay deriva: la relación queda igual.
      expect(result.state.causal.actors[a].rel).toBe(state.causal.actors[a].rel);
    }
  });

  it('el conflicto de intereses emerge de los indicadores: subir tasas mejora al financiero y golpea a las PyMEs', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.999);
    let base = baseState();
    let tasas = { ...baseState(), selectedActions: ['politica_monetaria_contractiva'] };
    for (let i = 0; i < 3; i++) {
      base = processEndTurn(base).state;
      tasas = processEndTurn(tasas).state;
    }
    expect(tasas.causal.actors.financiero.sat).toBeGreaterThan(base.causal.actors.financiero.sat);
    expect(tasas.causal.actors.pymes.sat).toBeLessThan(base.causal.actors.pymes.sat);
  });
});
