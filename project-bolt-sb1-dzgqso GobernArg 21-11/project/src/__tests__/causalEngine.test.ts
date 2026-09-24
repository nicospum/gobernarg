import { describe, it, expect } from 'vitest';
import {
  closeTurn,
  createCausalState,
  effective,
  evalCondition,
  decisionContext,
  getAvailability,
  meet,
  negotiate,
  signAgreement,
  canNegotiate,
  poll,
  recomputePolitical,
  flagValue,
  type CausalState,
} from '../engine/causal';

const step = (s: CausalState, ...actions: string[]) => closeTurn(s, actions.map(actionId => ({ actionId }))).state;
const view = (s: CausalState, id: Parameters<typeof effective>[1]) => effective(s, id, s.turn - 1);

describe('DSL de condiciones', () => {
  it('evalúa comparaciones, and/or/not y funciones', () => {
    let s = createCausalState();
    const ctx = () => decisionContext(s);
    expect(evalCondition('INFL>=58', ctx())).toBe(true);
    expect(evalCondition('INFL>=58 and ACTV>60', ctx())).toBe(false);
    expect(evalCondition('INFL>=58 or ACTV>60', ctx())).toBe(true);
    expect(evalCondition('not FLAG(cepo)', ctx())).toBe(true);
    expect(evalCondition('REL(oficialismo)>=75', ctx())).toBe(true);
    expect(evalCondition('SAT(industria)<45', ctx())).toBe(true);
    s = step(s, 'emitir_dinero');
    expect(evalCondition('DONE(emitir_dinero,6)', decisionContext(s))).toBe(true);
    expect(evalCondition('COUNT(emitir_dinero,6)>=2', decisionContext(s))).toBe(false);
  });
});

describe('Agenda de efectos: inmediato, diferido, persistente, temporal', () => {
  it('efecto diferido: la suba de tasas baja la inflación recién a t+1 y t+2', () => {
    const base = [createCausalState()];
    const tasas = [createCausalState()];
    for (let i = 0; i < 3; i++) {
      base.push(step(base[i]));
      tasas.push(step(tasas[i], ...(i === 0 ? ['politica_monetaria_contractiva'] : [])));
    }
    const applied1 = tasas[1].records[0].applied.filter(a => a.target === 'INFL');
    expect(applied1).toHaveLength(0); // nada de INFL en el cierre de ejecución
    expect(tasas[2].records[1].applied.some(a => a.effectId === 'politica_monetaria_contractiva.01')).toBe(true);
    expect(tasas[3].records[2].applied.some(a => a.effectId === 'politica_monetaria_contractiva.02')).toBe(true);
  });

  it('bonus temporal: el control de precios mejora el dato 2 turnos y deja rebote', () => {
    let s = step(createCausalState(), 'control_precios');
    const withBonus = s.bonuses.find(b => b.source === 'control_precios' && b.target === 'INFL');
    expect(withBonus).toBeDefined();
    expect(withBonus!.end - withBonus!.start).toBe(1);
    s = step(s);
    s = step(s);
    expect(s.bonuses.some(b => b.source === 'control_precios' && b.end >= s.turn - 1)).toBe(false);
    s = step(s); // t+3: rebote
    expect(s.records.some(r => r.applied.some(a => a.effectId === 'control_precios.03'))).toBe(true);
  });

  it('persistente: el régimen de grandes inversiones suma INVC 4 turnos seguidos', () => {
    let s = createCausalState();
    s.political.legAdj = 10; // mayoría para aprobar la ley
    recomputePolitical(s, 0);
    s = step(s, 'regimen_grandes_inversiones');
    let applied = 0;
    for (let i = 0; i < 6; i++) {
      s = step(s);
      applied += s.records[s.records.length - 1].applied.filter(a => a.effectId === 'regimen_grandes_inversiones.01').length;
    }
    expect(applied).toBe(4);
  });

  it('"mientras se cumpla": el cepo desalienta la inversión cada turno hasta liberarlo', () => {
    let s = step(createCausalState(), 'control_cambios');
    for (let i = 0; i < 3; i++) s = step(s);
    const cepoTurns = s.records.filter(r => r.applied.some(a => a.effectId === 'control_cambios.04')).length;
    expect(cepoTurns).toBe(3);
    s.base.EXTE = 60; // reservas reconstruidas
    s = step(s, 'liberar_cambios');
    s = step(s);
    s = step(s);
    const last = s.records[s.records.length - 1];
    expect(last.applied.some(a => a.effectId === 'control_cambios.04')).toBe(false);
  });

  it('mantenimiento permanente: una obra sube el gasto corriente para siempre', () => {
    let s = step(createCausalState(), 'estudio_factibilidad');
    s = step(s, 'infraestructura_vial');
    for (let i = 0; i < 8; i++) s = step(s);
    expect(s.gastoCorr).toBe(930);
  });
});

describe('Repetición en ventana', () => {
  it('la 3ª emisión dentro de 6 turnos dispara la aceleración; fuera de la ventana no', () => {
    let s = createCausalState();
    s = step(s, 'emitir_dinero');
    s = step(s, 'emitir_dinero');
    s = step(s, 'emitir_dinero');
    expect(s.records[2].actions[0].scheduled).toContain('emitir_dinero.06');

    let t = createCausalState();
    t = step(t, 'emitir_dinero');
    for (let i = 0; i < 6; i++) t = step(t);
    t = step(t, 'emitir_dinero');
    t = step(t, 'emitir_dinero');
    expect(t.records[t.records.length - 1].actions[0].scheduled).not.toContain('emitir_dinero.06');
  });

  it('el cooldown impide ejecutar dos veces la misma acción en el turno', () => {
    const s = createCausalState();
    const av = getAvailability(s, 'emitir_dinero', [], 4);
    expect(av.available).toBe(true);
    const after = step(s, 'devaluacion');
    const dev = getAvailability(after, 'devaluacion', [], 4);
    expect(dev.available).toBe(false);
    expect(dev.reasons.join(' ')).toMatch(/Disponible en/);
  });
});

describe('Prerequisitos y desbloqueos', () => {
  it('las obras requieren un estudio de factibilidad vigente del turno anterior', () => {
    let s = createCausalState();
    expect(getAvailability(s, 'infraestructura_vial', [], 4).available).toBe(false);
    s = step(s, 'estudio_factibilidad');
    expect(flagValue(s, 'estudio_vigente', s.turn)).toBe(1);
    expect(getAvailability(s, 'infraestructura_vial', [], 4).available).toBe(true);
    for (let i = 0; i < 6; i++) s = step(s);
    expect(getAvailability(s, 'infraestructura_vial', [], 4).available).toBe(false);
  });

  it('las leyes requieren mayoría; la luna de miel ayuda y el DNU es la alternativa', () => {
    let s = createCausalState();
    // Turno 1: LEG 47 + luna de miel 8 ≥ 50.
    expect(getAvailability(s, 'reduccion_impuestos', [], 4).available).toBe(true);
    for (let i = 0; i < 3; i++) s = step(s);
    const sinMayoria = getAvailability(s, 'reduccion_impuestos', [], 4);
    expect(sinMayoria.available).toBe(false);
    expect(sinMayoria.needsDnu).toBe(true);
    const conDnu = getAvailability(s, 'reduccion_impuestos', [{ actionId: 'dnu' }], 4);
    expect(conDnu.available).toBe(true);
    const priv = getAvailability(s, 'privatizacion', [{ actionId: 'dnu' }], 4);
    expect(priv.available).toBe(false); // no admite DNU
  });

  it('liberar el cepo sólo aparece si hay cepo', () => {
    let s = createCausalState();
    expect(getAvailability(s, 'liberar_cambios', [], 4).visible).toBe(false);
    s = step(s, 'control_cambios');
    expect(getAvailability(s, 'liberar_cambios', [], 4).visible).toBe(true);
  });
});

describe('Reuniones, negociación y acuerdos', () => {
  it('la reunión revela información y habilita negociar, pero no compra satisfacción', () => {
    const s0 = createCausalState();
    expect(canNegotiate(s0, 'industria', 4)).toMatch(/reunirse/);
    const r = meet(s0, 'industria', 4);
    expect(r.ok).toBe(true);
    expect(r.paSpent).toBe(0); // primera reunión del turno gratis
    expect(r.state.actors.industria.sat).toBe(s0.actors.industria.sat);
    expect(r.state.actors.industria.revealedUntil).toBeGreaterThanOrEqual(s0.turn);
    expect(r.state.actors.industria.demand?.revealedTurn).toBe(s0.turn);
    expect(canNegotiate(r.state, 'industria', 4)).toBeNull();
    // La segunda reunión del turno cuesta 1 PA.
    expect(meet(r.state, 'pymes', 4).paSpent).toBe(1);
  });

  it('no hay reuniones con el electorado: se usa la encuesta', () => {
    const s = createCausalState();
    expect(meet(s, 'clase_media', 4).ok).toBe(false);
    const p = poll(s, 'clase_media');
    expect(p.ok).toBe(true);
    expect(p.state.caja).toBe(s.caja - 50);
  });

  it('reuniones vacías repetidas deterioran la relación', () => {
    let s = createCausalState();
    const rel0 = s.actors.industria.rel!;
    for (let i = 0; i < 3; i++) {
      s = meet(s, 'industria', 4).state;
      s = step(s);
    }
    expect(s.actors.industria.rel!).toBeLessThan(rel0);
  });

  it('cumplir un acuerdo mejora la relación; incumplirlo la rompe', () => {
    let s = createCausalState();
    s.actors.sindicatos.rel = 90; // negociación casi segura
    s = meet(s, 'sindicatos', 4).state;
    let neg = negotiate(s, 'sindicatos', 4);
    let tries = 0;
    while (!neg.success && tries++ < 10) {
      s = step(neg.state);
      s = meet(s, 'sindicatos', 4).state;
      neg = negotiate(s, 'sindicatos', 4);
    }
    expect(neg.success).toBe(true);
    const signed = signAgreement(neg.state, 'sindicatos');
    expect(signed.ok).toBe(true);
    const ag = signed.state.agreements[0];
    // Incumplir: dejar pasar el plazo.
    let broken = signed.state;
    const relSigned = broken.actors.sindicatos.rel!;
    for (let i = 0; i < 5; i++) broken = step(broken);
    expect(broken.agreements[0].status).toBe('broken');
    expect(broken.actors.sindicatos.rel!).toBeLessThan(relSigned - 15);
    // Cumplir: ejecutar lo comprometido dentro del plazo.
    const kept = step(signed.state, ag.commitmentActionId);
    expect(kept.agreements[0].status).toBe('fulfilled');
  });
});

describe('Satisfacción ≠ relación', () => {
  it('una política cambia satisfacción sin tocar la relación', () => {
    const s0 = createCausalState();
    const s = step(s0, 'aumento_salarial');
    expect(s.actors.sindicatos.sat).toBeGreaterThan(s0.actors.sindicatos.sat);
    expect(s.actors.sindicatos.rel).toBe(s0.actors.sindicatos.rel);
  });
});

describe('Elecciones sin doble conteo', () => {
  it('ningún indicador entra directo a la intención de voto (DC-1)', () => {
    const s = createCausalState();
    const iv0 = s.political.iv;
    s.base.INFL = 95;
    s.base.ACTV = 10;
    recomputePolitical(s, 0);
    // Sin pasar por la satisfacción de los actores, la IV no cambia.
    expect(s.political.iv).toBeCloseTo(iv0, 5);
  });

  it('la oposición no suma votos al gobierno aunque esté contenta (EW 0)', () => {
    const s = createCausalState();
    const apro0 = s.political.apro;
    s.actors.oposicion.sat = 95;
    recomputePolitical(s, 0);
    expect(s.political.apro).toBeCloseTo(apro0, 5);
  });
});

describe('Fiscal, canales y derrotas', () => {
  it('caja negativa al cierre → emisión forzada en el turno siguiente (D-10)', () => {
    let s = createCausalState();
    s.caja = -500;
    s = step(s);
    expect(s.forcedEmission).toBe(true);
    s = step(s);
    expect(s.records[s.records.length - 1].actions[0]).toMatchObject({ actionId: 'emitir_dinero', forced: true });
  });

  it('los canales se aplican con un turno de rezago', () => {
    let s = createCausalState();
    s.actors.pymes.sat = 10;
    s = step(s);
    const sched = s.records[0].channelsScheduled.find(c => c.actor === 'pymes');
    expect(sched).toBeDefined();
    expect(s.records[0].channelsApplied.find(c => c.actor === 'pymes')).toBeUndefined();
    s = step(s);
    expect(s.records[1].channelsApplied.find(c => c.actor === 'pymes')).toBeDefined();
  });

  it('cuenta turnos seguidos de hiperinflación', () => {
    let s = createCausalState();
    s.base.INFL = 99;
    s.desanclaje = 60;
    s = step(s);
    s = step(s);
    expect(view(s, 'INFL')).toBeGreaterThanOrEqual(90);
    expect(s.hyperStreak).toBe(2);
  });
});
