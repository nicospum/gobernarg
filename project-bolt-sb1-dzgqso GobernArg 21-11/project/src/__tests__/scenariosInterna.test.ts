import { describe, it, expect } from 'vitest';
import { DIFFICULTY_LEVELS, EFFECTS_BY_ACTION, SCENARIOS, getScenario } from '../data/causal';
import {
  cajaCost,
  closeTurn,
  contributions,
  createCausalState,
  effective,
  internaCostMult,
  internaEfficacy,
  lawThreshold,
  type CausalState,
} from '../engine/causal';
import { CAUSAL_ACTIONS_BY_ID } from '../data/causal';

const step = (s: CausalState, ...actions: string[]) => closeTurn(s, actions.map(actionId => ({ actionId }))).state;

describe('Escenarios', () => {
  it('cada escenario arranca con su herencia', () => {
    for (const sc of SCENARIOS) {
      const s = createCausalState({ scenarioId: sc.id });
      expect(s.scenarioId).toBe(sc.id);
      for (const [id, v] of Object.entries(sc.indicators ?? {})) expect(s.base[id as keyof typeof s.base]).toBe(v);
      if (sc.deuda !== undefined) expect(s.deuda).toBe(sc.deuda);
      if (sc.caja !== undefined) expect(s.caja).toBe(sc.caja);
    }
  });

  it('el default de fábrica sigue siendo el escenario del Excel (herencia pesada)', () => {
    const s = createCausalState();
    expect(s.scenarioId).toBe('herencia_pesada');
    expect(s.base.INFL).toBe(58);
    expect(s.deuda).toBe(3000);
  });

  it('país en calma: sin deuda y con inflación baja', () => {
    const s = createCausalState({ scenarioId: 'pais_en_calma' });
    expect(s.deuda).toBe(0);
    expect(s.base.INFL).toBeLessThan(30);
  });

  it('dificultad: Fácil, Normal y Argentina abren un escenario cada una desde el inicio', () => {
    expect(DIFFICULTY_LEVELS.map(l => [l.label, l.scenarioId])).toEqual([
      ['Fácil', 'pais_en_calma'],
      ['Normal', 'viento_de_cola'],
      ['Argentina', 'herencia_pesada'],
    ]);
    // Lite: sólo los escenarios de los tres niveles, sin históricos desbloqueables.
    expect(SCENARIOS.map(s => s.id).sort()).toEqual(DIFFICULTY_LEVELS.map(l => l.scenarioId).sort());
    for (const l of DIFFICULTY_LEVELS) expect(getScenario(l.scenarioId).id).toBe(l.scenarioId);
  });

});

describe('Sin plataforma del partido', () => {
  it('el oficialismo sólo mira la aprobación', () => {
    const s = createCausalState();
    const cs = contributions(s, 'oficialismo', 0);
    expect(cs.map(c => c.indicator)).toEqual(['APRO']);
  });
});

describe('Interna del oficialismo', () => {
  it('R-26: transparencia ya no toca la relación con el oficialismo', () => {
    expect((EFFECTS_BY_ACTION.transparencia_anticorrupcion ?? []).some(r => r.target === 'REL:oficialismo')).toBe(false);
  });

  it('ampliar la coalición abre la interna: menos eficacia, más costo y leyes más caras', () => {
    const s0 = createCausalState();
    const threshold0 = lawThreshold(s0);
    const cost0 = cajaCost(s0, CAUSAL_ACTIONS_BY_ID.construccion_hospitales);
    const s = step(s0, 'ampliar_coalicion');
    expect(s.political.coalicion).toBe(1);
    expect(s.political.interna).toBeGreaterThanOrEqual(25);
    expect(internaEfficacy(s)).toBeLessThan(1);
    expect(internaCostMult(s)).toBeGreaterThan(1);
    expect(cajaCost(s, CAUSAL_ACTIONS_BY_ID.construccion_hospitales)).toBeLessThan(cost0);
    expect(lawThreshold(s)).toBeGreaterThan(threshold0);
  });

  it('la coalición sigue desgastando cada turno; la interna sube conflictividad y baja instituciones', () => {
    let a = step(createCausalState(), 'ampliar_coalicion');
    let b = step(createCausalState());
    for (let i = 0; i < 4; i++) { a = step(a); b = step(b); }
    expect(a.political.interna).toBeGreaterThan(25);
    expect(effective(a, 'CONF', a.turn - 1)).toBeGreaterThan(effective(b, 'CONF', b.turn - 1));
    expect(effective(a, 'INST', a.turn - 1)).toBeLessThan(effective(b, 'INST', b.turn - 1));
  });

  it('si sos popular el partido se ordena; si no, te pasa factura (después de la luna de miel)', () => {
    const popular = createCausalState();
    popular.political.interna = 40;
    popular.political.apro = 70;
    popular.turn = 6;
    const impopular = structuredClone(popular);
    impopular.political.apro = 20;
    const p2 = step(popular);
    const i2 = step(impopular);
    expect(p2.records[0].internaReasons).toContain('la popularidad los ordena');
    expect(i2.records[0].internaReasons).toContain('la baja aprobación los envalentona');
  });
});
