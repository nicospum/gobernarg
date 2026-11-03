/**
 * Regresiones de la revisión de los escenarios históricos: ley de emergencia
 * alcanzable, demandas de todos los actores, apuestas que ven los flags del
 * mismo cierre, default único, corralón a tiempo y conteo de medidas.
 */
import { describe, expect, it } from 'vitest';
import { ACTOR_IDS } from '../data/causal';
import {
  applyAgenda,
  closeCrisisRound,
  countExecutions,
  createCausalState,
  flagValue,
  getAvailability,
  newAccumulator,
  type CausalState,
} from '../engine/causal';

const corralito = (seed = 1) => createCausalState({ scenarioId: 'corralito', seed });
const hiper = (seed = 1) => createCausalState({ scenarioId: 'pais_en_llamas', seed });
const round = (s: CausalState, ...ids: string[]) => closeCrisisRound(s, ids.map(actionId => ({ actionId }))).state;

describe('Revisión de los escenarios históricos', () => {
  it('la ley de emergencia está disponible en la primera subronda de los dos escenarios', () => {
    for (const s of [corralito(), hiper()]) {
      const av = getAvailability(s, 'ley_emergencia', [], 3);
      expect(av.visible).toBe(true);
      expect(av.reasons).toEqual([]);
      expect(av.available).toBe(true);
    }
  });

  it('todo actor organizado tiene una demanda posible en los históricos', () => {
    // Los que en un nivel normal tienen demanda (los no organizados no piden nada).
    const normal = createCausalState({ scenarioId: 'herencia_pesada', seed: 1 });
    const organizados = ACTOR_IDS.filter(a => normal.actors[a].demand !== null);
    for (const s of [corralito(), hiper()]) {
      const sinDemanda = organizados.filter(a => s.actors[a].demand === null);
      expect(sinDemanda).toEqual([]);
    }
  });

  it('una apuesta ve el flag que deja puesto el mismo cierre en que se resuelve', () => {
    const s = round(corralito(), 'suspender_pagos');
    const bets = s.agenda.filter(e => e.actionId === 'suspender_pagos' && /\.(bien|mal)\./.test(e.effectId));
    expect(bets.length).toBeGreaterThan(0);
    const close = bets[0].start;
    // Renegociación exitosa en ese mismo cierre.
    s.agenda.push({ ...bets[0], uid: 'test.renegocia', effectId: 'negociar_deuda_exito.2', actionId: 'negociar_deuda_exito', mode: 'SET', target: 'FLAG:deuda_renegociada', magnitude: 0.6, applyCondition: undefined, start: close, end: close + 7 });
    const acc = newAccumulator();
    applyAgenda(s, close, acc);
    expect(flagValue(s, 'deuda_renegociada', close + 1)).toBe(0.6);
    const resueltas = acc.applied.filter(r => r.actionId === 'suspender_pagos').map(r => r.effectId ?? '');
    expect(resueltas.length).toBeGreaterThan(0);
    expect(resueltas.every(id => id.includes('.bien.'))).toBe(true);
  });

  it('no se puede volver a defaultear después de renegociar', () => {
    const s = hiper();
    s.flags.default_deuda = { value: 0, start: 0, end: null, source: 'test' };
    s.flags.deuda_renegociada = { value: 0.6, start: 0, end: 9, source: 'test' };
    expect(getAvailability(s, 'suspender_pagos', [], 3).visible).toBe(false);
  });

  it('en la Hiper la deuda ya está en default desde 1988: no hace falta esperar cuatro trimestres', () => {
    const s = hiper();
    const av = getAvailability(s, 'negociar_deuda', [], 3);
    expect(av.reasons.some(r => r.includes('tiempo en default'))).toBe(false);
  });

  it('con corralito en la primera semana, el corralón aparece antes de que se resuelva su apuesta', () => {
    let s = corralito();
    s = round(s, 'limitar_retiros');
    s = round(s, 'salir_convertibilidad');
    s = round(s, 'pesificar');
    expect(getAvailability(s, 'reprogramar_depositos', [], 3).visible).toBe(true);
  });

  it('acuerdo_transicion se cuenta por su id: no lo confunde con un acuerdo con un actor', () => {
    const s = hiper();
    s.executions.push({ actionId: 'acuerdo_transicion', turn: 1 });
    expect(countExecutions(s, 'acuerdo_transicion', 4, 1)).toBe(1);
  });

  it('el estado de sitio se termina con su subronda: también su calma artificial', () => {
    const s = round(hiper());
    expect(s.bonuses.filter(b => b.source === 'estado_de_sitio' && !b.id.startsWith('crisis.decision.'))).toEqual([]);
  });
});
