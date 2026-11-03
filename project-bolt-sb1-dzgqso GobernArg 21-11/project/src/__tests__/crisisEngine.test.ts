/**
 * Escenarios históricos con reglas nuevas (Corralito 2001 e Hiper 1989):
 * emergencia por subrondas, medidas extraordinarias con apuesta, dinámica de
 * la crisis, derrotas propias, guardado y compatibilidad con partidas anteriores.
 */
import { describe, expect, it } from 'vitest';
import { CAUSAL_ACTIONS_BY_ID, CRISIS_META, EXTRAORDINARY_IDS, HIDDEN_IN_CRISIS, getScenario } from '../data/causal';
import {
  closeCrisisRound,
  closeTurn,
  createCausalState,
  crisisStatus,
  debtService,
  effective,
  flagValue,
  getAvailability,
  listExtraordinaryAvailability,
  listPolicyAvailability,
  monthlyInflation,
  viewRef,
  type CausalState,
} from '../engine/causal';
import { createNewGame, processEndTurn } from '../engine/gameEngine';
import { encodeSavedGame, parseSavedGame } from '../lib/savegame';
import { updateObjectives } from '../utils/victoryConditions';

const corralito = (seed = 1) => createCausalState({ scenarioId: 'corralito', seed });
const hiper = (seed = 1) => createCausalState({ scenarioId: 'pais_en_llamas', seed });
const round = (s: CausalState, ...ids: string[]) => closeCrisisRound(s, ids.map(actionId => ({ actionId })));
const step = (s: CausalState, ...ids: string[]) => closeTurn(s, ids.map(actionId => ({ actionId }))).state;
const infl = (s: CausalState) => effective(s, 'INFL', viewRef(s));

describe('Estado inicial de los escenarios históricos', () => {
  it('Corralito: convertibilidad vigente, corrida, sin corralito ni default, emergencia de 3 semanas', () => {
    const s = corralito();
    expect(s.crisis).toMatchObject({ version: 1, kind: 'corralito', phase: 'emergencia', round: 1, rounds: 3, liquidez: 40, used: [], bets: {} });
    expect(flagValue(s, 'convertibilidad', 1)).toBe(1);
    expect(flagValue(s, 'corrida', 1)).toBe(1);
    expect(flagValue(s, 'escenario_crisis', 1)).toBe(1);
    expect(flagValue(s, 'crisis_corralito', 1)).toBe(1);
    expect(flagValue(s, 'corralito', 1)).toBe(0);
    expect(flagValue(s, 'default_deuda', 1)).toBe(0);
    expect(s.base.INFL).toBe(12);
    expect(s.caja).toBe(450);
    expect(debtService(s)).toBeGreaterThan(0);
  });

  it('Hiper: precios en 96, default desde 1988 sin vencimiento, estado de sitio por una subronda', () => {
    const s = hiper();
    expect(s.crisis).toMatchObject({ kind: 'hiper', phase: 'emergencia', round: 1, rounds: 3 });
    expect(s.base.INFL).toBe(97);
    expect(s.flags.default_deuda.end).toBeNull();
    expect(flagValue(s, 'estado_de_sitio', 1)).toBe(1);
    expect(flagValue(s, 'crisis_hiper', 1)).toBe(1);
    expect(debtService(s)).toBe(0);
    expect(monthlyInflation(97)).toBeGreaterThan(75);
    expect(monthlyInflation(20)).toBe(1);
  });

  it('los niveles normales no tienen estado de crisis ni medidas extraordinarias', () => {
    const s = createCausalState({ scenarioId: 'viento_de_cola' });
    expect(s.crisis).toBeUndefined();
    expect(listExtraordinaryAvailability(s, [], 4)).toEqual([]);
    expect(getAvailability(s, 'turismo_y_patrimonio', [], 4).visible).toBe(true);
    expect(getAvailability(s, 'devaluacion', [], 4).visible).toBe(true);
  });
});

describe('Medidas extraordinarias: catálogo y disponibilidad', () => {
  it('cuestan cero, aparecen según el escenario y el régimen, y durante la emergencia son lo único que se juega', () => {
    const s = corralito();
    const visible = listPolicyAvailability(s, [], 4);
    expect(visible.every(a => a.action.extraordinary)).toBe(true);
    const ids = visible.map(a => a.action.id);
    for (const id of ['limitar_retiros', 'salir_convertibilidad', 'dolarizar', 'suspender_pagos', 'cuasimonedas', 'rescate_fmi', 'apertura_total']) expect(ids).toContain(id);
    for (const id of ['congelamiento_total', 'privatizar_todo', 'emitir_dinero', 'turismo_y_patrimonio', 'devaluacion']) expect(ids).not.toContain(id);
    // Sin corralito no hay corralón ni liberación; sin conflictividad muy alta no hay estado de sitio.
    expect(ids).not.toContain('reprogramar_depositos');
    expect(ids).not.toContain('liberar_depositos');
    expect(ids).not.toContain('estado_de_sitio');
    for (const a of visible) {
      expect(a.caja).toBe(0);
      expect(a.pa).toBe(0);
      expect(a.action.category).toBe('Emergencia');
    }
    expect(EXTRAORDINARY_IDS.length).toBeGreaterThanOrEqual(20);
    for (const id of EXTRAORDINARY_IDS) expect(CRISIS_META[id].solves.length).toBeGreaterThan(10);
  });

  it('la Hiper ofrece sus medidas propias y bloquea con motivo las que no tienen reservas', () => {
    const s = hiper();
    const av = Object.fromEntries(listPolicyAvailability(s, [], 4).map(a => [a.action.id, a]));
    for (const id of ['congelamiento_total', 'shock_fiscal', 'intervencion_total', 'devaluar_shock', 'emergencia_alimentaria', 'acuerdo_transicion', 'privatizar_todo', 'apertura_total', 'nueva_moneda', 'dolarizar', 'negociar_deuda']) expect(av[id]).toBeDefined();
    expect(av.limitar_retiros).toBeUndefined();
    expect(av.rescate_fmi).toBeUndefined(); // en default
    expect(av.estado_de_sitio).toBeUndefined(); // ya rige el del 29/5
    // La moneda nueva pide un mínimo de reservas (12): en junio de 1989 alcanza; dolarizar pide más (20) y queda bloqueada con motivo.
    expect(av.nueva_moneda.available).toBe(true);
    expect(av.dolarizar.available).toBe(false);
    expect(av.dolarizar.reasons[0]).toMatch(/reservas/);
    expect(av.negociar_deuda.available).toBe(false);
    expect(av.negociar_deuda.reasons.join(' ')).toMatch(/tiempo en default/);
  });

  it('una sola medida extraordinaria por subronda o turno', () => {
    const s = corralito();
    const second = getAvailability(s, 'suspender_pagos', [{ actionId: 'salir_convertibilidad' }], 4);
    expect(second.available).toBe(false);
    expect(second.reasons[0]).toMatch(/Una sola medida extraordinaria/);
    expect(getAvailability(s, 'salir_convertibilidad', [{ actionId: 'salir_convertibilidad' }], 4).available).toBe(true);
  });

  it('en los históricos se ocultan las políticas menores y las reemplazadas', () => {
    const s = corralito();
    s.crisis!.phase = 'gestion';
    const ids = listPolicyAvailability(s, [], 4).map(a => a.action.id);
    for (const id of HIDDEN_IN_CRISIS) expect(ids).not.toContain(id);
    for (const id of ['emitir_dinero', 'control_precios', 'reduccion_gasto', 'asistencia_alimentaria', 'pacto_social']) expect(ids).toContain(id);
    expect(ids).toContain('salir_convertibilidad');
  });
});

describe('Emergencia del Corralito', () => {
  it('sin medidas, la corrida vacía los bancos y el colapso llega en la tercera semana', () => {
    let s = corralito();
    const r1 = round(s); s = r1.state;
    expect(s.crisis!.round).toBe(2);
    expect(s.crisis!.liquidez).toBe(26);
    expect(r1.record.lines.join(' ')).toMatch(/corrida sigue/);
    expect(s.turn).toBe(1);
    s = round(s).state;
    expect(s.crisis!.liquidez).toBe(12);
    const r3 = round(s); s = r3.state;
    expect(s.crisis!.liquidez).toBe(0);
    expect(flagValue(s, 'crisis_bancaria', 1)).toBe(1);
    expect(r3.record.lines.join(' ')).toMatch(/Colapso bancario/);
    expect(s.crisis!.phase).toBe('gestion');
    expect(s.crisis!.log).toHaveLength(3);
  });

  it('limitar los retiros frena la corrida, paraliza la calle y queda como condición permanente', () => {
    const base = corralito();
    const r = round(base, 'limitar_retiros');
    const s = r.state;
    expect(r.record.measure).toBe('limitar_retiros');
    expect(s.crisis!.used).toContain('limitar_retiros');
    expect(s.flags.corralito).toMatchObject({ value: 1, end: null });
    // La corrida se frena: la liquidez no cae (impulso de la medida) frente a los 26 de la inacción.
    expect(s.crisis!.liquidez).toBeGreaterThanOrEqual(40);
    expect(effective(s, 'CONF', viewRef(s))).toBeGreaterThan(effective(base, 'CONF', viewRef(base)));
    expect(effective(s, 'EXTE', viewRef(s))).toBeGreaterThan(effective(round(base).state, 'EXTE', 0));
    // Ya no vuelve a aparecer; en cambio aparecen el corralón (cuando los bancos están al límite) y la liberación.
    expect(getAvailability(s, 'limitar_retiros', [], 4).visible).toBe(false);
    // Lo diferido queda en la agenda para los cierres trimestrales: costos por trimestre y la apuesta a +3.
    const agenda = s.agenda.filter(e => e.actionId === 'limitar_retiros');
    expect(agenda.some(e => e.target === 'ACTV' && e.applyCondition === 'FLAG(corralito)' && e.everyTurn)).toBe(true);
    expect(agenda.some(e => e.effectId.startsWith('limitar_retiros.bien.') && e.start === 4)).toBe(true);
    expect(agenda.some(e => e.effectId.startsWith('limitar_retiros.mal.') && e.start === 4)).toBe(true);
  });

  it('salir de la convertibilidad cambia el régimen para siempre y la apuesta se resuelve a los 3 trimestres', () => {
    let s = round(corralito(), 'salir_convertibilidad').state;
    expect(flagValue(s, 'convertibilidad', 1)).toBe(0);
    expect(flagValue(s, 'regimen_flotante', 1)).toBe(1);
    expect(infl(s)).toBeGreaterThanOrEqual(22);
    expect(getAvailability(s, 'salir_convertibilidad', [], 4).visible).toBe(false);
    expect(getAvailability(s, 'dolarizar', [], 4).visible).toBe(false);
    s = round(s).state; s = round(s).state;
    expect(s.crisis!.phase).toBe('gestion');
    // Trayectoria con precios contenidos al llegar la revisión (tasas, acuerdo): sale bien.
    let bien = s;
    for (let i = 0; i < 3; i++) bien = step(bien);
    bien.base.INFL = 40;
    bien = step(bien);
    expect(bien.crisis!.bets.salir_convertibilidad).toBe('bien');
    expect(bien.records[3].notes.join(' ')).toMatch(/salió bien/);
    // Trayectoria con precios disparados al llegar la revisión: explota.
    let mal = s;
    for (let i = 0; i < 3; i++) mal = step(mal);
    mal.base.INFL = 80;
    mal = step(mal);
    expect(mal.crisis!.bets.salir_convertibilidad).toBe('mal');
    expect(mal.records[3].notes.join(' ')).toMatch(/explotó/);
  });

  it('dolarizar bloquea la emisión y la caja en rojo se paga con atraso de sueldos', () => {
    const s = round(corralito(), 'dolarizar').state;
    expect(flagValue(s, 'dolarizada', 1)).toBe(1);
    s.crisis!.phase = 'gestion';
    const emitir = getAvailability(s, 'emitir_dinero', [], 4);
    expect(emitir.available).toBe(false);
    expect(emitir.reasons.join(' ')).toMatch(/dolarizada/);
    s.caja = -100;
    s.forcedEmission = true;
    const next = step(s);
    expect(next.records[0].notes.join(' ')).toMatch(/sin emisión posible/);
    expect(next.records[0].actions.some(a => a.actionId === 'emitir_dinero')).toBe(false);
  });

  it('el default no vence; renegociar es incierto y, si sale, aplica la quita y reduce los intereses', () => {
    let s = corralito();
    s = round(s, 'suspender_pagos').state;
    expect(s.flags.default_deuda).toMatchObject({ value: 1, end: null });
    expect(debtService(s)).toBe(0);
    s = round(s).state; s = round(s).state;
    for (let i = 0; i < 3; i++) s = step(s);
    expect(debtService(s)).toBe(0);
    expect(s.turn).toBe(4);
    s.base.SOLV = 25;
    const av = getAvailability(s, 'negociar_deuda', [], 4);
    expect(av.visible && av.available).toBe(true);
    const outcomes = new Set<string>();
    let exito: CausalState | null = null;
    for (let seed = 1; seed < 60 && outcomes.size < 2; seed++) {
      const trial = structuredClone(s);
      trial.rng = seed;
      const after = step(trial, 'negociar_deuda');
      const last = after.executions.filter(e => e.turn === 4).map(e => e.actionId);
      expect(last).toContain('negociar_deuda');
      const result = last.find(id => id === 'negociar_deuda_exito' || id === 'negociar_deuda_fracaso')!;
      outcomes.add(result);
      if (result === 'negociar_deuda_exito') exito = after;
    }
    expect([...outcomes].sort()).toEqual(['negociar_deuda_exito', 'negociar_deuda_fracaso']);
    expect(exito!.deuda).toBe(Math.round(6000 * 0.65));
    expect(flagValue(exito!, 'default_deuda', exito!.turn)).toBe(0);
    expect(debtService(exito!)).toBeCloseTo(0.05 * exito!.deuda * 0.6);
    expect(exito!.records[3].notes.join(' ')).toMatch(/quita del 35/);
  });

  it('el estado de sitio dura una subronda y se vuelve a verificar la disponibilidad al cerrar', () => {
    const s = corralito();
    s.base.CONF = 70;
    expect(getAvailability(s, 'estado_de_sitio', [], 4).visible).toBe(true);
    const r = round(s, 'estado_de_sitio');
    expect(r.record.measure).toBe('estado_de_sitio');
    expect(r.state.flags.estado_de_sitio).toBeUndefined();
    // Una medida que dejó de estar disponible no se ejecuta.
    const bogus = round(corralito(), 'reprogramar_depositos');
    expect(bogus.record.measure).toBeNull();
    expect(bogus.record.lines.join(' ')).toMatch(/ya no está disponible/);
  });
});

describe('Emergencia de la Hiper', () => {
  it('sin medidas, los precios aceleran y el gobierno cae en dos meses', () => {
    let s = hiper();
    const r1 = round(s); s = r1.state;
    expect(s.crisis!.aceleracion).toBeGreaterThan(0);
    expect(r1.defeat).toBeNull();
    expect(r1.record.lines.join(' ')).toMatch(/acelerando/);
    const r2 = round(s);
    expect(r2.defeat).not.toBeNull();
    expect(['hyperinflation', 'resignation']).toContain(r2.defeat);
  });

  it('el congelamiento total frena el dato de golpe y permite salir de la emergencia', () => {
    let s = hiper();
    const r1 = round(s, 'congelamiento_total'); s = r1.state;
    expect(infl(s)).toBeLessThan(80);
    expect(r1.defeat).toBeNull();
    const r2 = round(s, 'emergencia_alimentaria'); s = r2.state;
    expect(r2.defeat).toBeNull();
    const r3 = round(s, 'acuerdo_transicion'); s = r3.state;
    expect(r3.defeat).toBeNull();
    expect(s.crisis!.phase).toBe('gestion');
    expect(flagValue(s, 'transicion', 1)).toBe(1);
    expect(s.crisis!.used).toEqual(['congelamiento_total', 'emergencia_alimentaria', 'acuerdo_transicion']);
    // La apuesta del congelamiento se resuelve en los cierres trimestrales (cierre 3 = 1 + 2), según respaldo fiscal y divisas.
    for (let i = 0; i < 3; i++) s = step(s);
    expect(s.crisis!.bets.congelamiento_total).toBeDefined();
    const status = crisisStatus(s);
    expect(status.find(l => l.label === 'Transición')?.value).toMatch(/Acordada/);
  });

  it('privatizar todo entra como financiamiento, no como resultado fiscal', () => {
    let s = hiper();
    s.crisis!.phase = 'gestion';
    const cajaBefore = s.caja;
    s = step(s, 'privatizar_todo');
    expect(s.caja).toBeGreaterThan(cajaBefore + 1000);
    expect(s.records[0].fiscal.financiamiento).toBeGreaterThanOrEqual(1500);
    expect(flagValue(s, 'privatizacion_total', s.turn)).toBe(1);
    expect(getAvailability(s, 'privatizar_todo', [], 4).visible).toBe(false);
  });
});

describe('Nivel partida: subrondas, metas, guardado y compatibilidad', () => {
  it('cerrar el turno durante la emergencia cierra la subronda; el calendario recién avanza con el primer trimestre', () => {
    let g = createNewGame({ archetype: 'politico', governorName: 'Ana', seed: 1, scenarioId: 'corralito' });
    expect(g.objectives.map(o => o.id)).toContain('meta_corrida');
    for (let i = 1; i <= 3; i++) {
      const result = processEndTurn(g);
      g = result.state;
      expect(result.summary.crisisRound).toMatchObject({ round: i, last: i === 3 });
      expect(g.turn).toBe(1);
      expect(g.year).toBe(1);
      expect(g.causal.turn).toBe(1);
      expect(g.selectedActions).toEqual([]);
    }
    expect(g.causal.crisis!.phase).toBe('gestion');
    const result = processEndTurn(g);
    expect(result.summary.crisisRound).toBeUndefined();
    expect(result.state.causal.records).toHaveLength(1);
    expect(result.state.turn).toBe(2);
    const goals = updateObjectives(result.state).objectives;
    expect(goals.find(o => o.id === 'meta_deuda')?.completed).toBe(true); // sin default
    expect(goals.find(o => o.id === 'meta_corrida')?.completed).toBe(false);
  });

  it('una derrota en la emergencia termina la partida con su motivo', () => {
    let g = createNewGame({ archetype: 'politico', governorName: 'Ana', seed: 1, scenarioId: 'pais_en_llamas' });
    g = processEndTurn(g).state;
    expect(g.gameOver).toBe(false);
    g = processEndTurn(g).state;
    expect(g.gameOver).toBe(true);
    expect(['hyperinflation', 'resignation']).toContain(g.defeatReason);
  });

  it('el guardado conserva el estado de crisis y una partida anterior sin crisis sigue con sus reglas', () => {
    let g = createNewGame({ archetype: 'politico', governorName: 'Ana', seed: 1, scenarioId: 'corralito' });
    g = { ...g, selectedActions: ['limitar_retiros'] };
    g = processEndTurn(g).state;
    const parsed = parseSavedGame(encodeSavedGame(g));
    expect(parsed?.state).toEqual(g);
    expect(parsed?.state.causal.crisis?.used).toEqual(['limitar_retiros']);
    // Partida histórica anterior: sin crisis, con default a 8 turnos y rebote automático.
    const old = createNewGame({ archetype: 'politico', governorName: 'Vieja', seed: 1, scenarioId: 'corralito' });
    delete old.causal.crisis;
    old.causal.flags = { default_deuda: { value: 1, start: 1, end: 8, source: 'escenario:corralito' } };
    old.causal.agenda = [{ uid: 'escenario.corralito.0', effectId: 'escenario.corralito.0', actionId: 'escenario', originTurn: 0, target: 'ACTV', mode: 'DELTA', magnitude: 1.8, start: 1, end: 8, everyTurn: true, appliedTotal: 0, explanation: 'Rebote' }];
    const loaded = parseSavedGame(encodeSavedGame(old))!.state;
    expect(loaded.causal.crisis).toBeUndefined();
    expect(listExtraordinaryAvailability(loaded.causal, [], 4)).toEqual([]);
    expect(getAvailability(loaded.causal, 'turismo_y_patrimonio', [], 4).visible).toBe(true);
    const played = processEndTurn(loaded);
    expect(played.summary.crisisRound).toBeUndefined();
    expect(played.state.causal.records[0].applied.some(a => a.effectId === 'escenario.corralito.0')).toBe(true);
    expect(played.state.causal.records[0].fiscal.servicioDeuda).toBe(0);
  });

  it('cada medida tiene nombre, nota y riesgo para el jugador', () => {
    for (const id of EXTRAORDINARY_IDS) {
      const def = CAUSAL_ACTIONS_BY_ID[id];
      expect(def.extraordinary).toBe(true);
      expect(def.name.length).toBeGreaterThan(5);
      expect(def.strategic.length).toBeGreaterThan(20);
      expect(def.risksText).toBeTruthy();
    }
    expect(getScenario('corralito').crisis?.rounds).toHaveLength(3);
    expect(getScenario('pais_en_llamas').crisis?.rounds).toHaveLength(3);
  });
});
