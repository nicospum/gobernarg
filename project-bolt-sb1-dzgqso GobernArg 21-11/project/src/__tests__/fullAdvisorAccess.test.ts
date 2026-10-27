import { describe, expect, it } from 'vitest';
import { availableAdvisors, ADVISOR_ROLES, LEGACY_ADVISOR_SALARIES } from '../data/advisors';
import { EFFECTS_BY_ACTION, INDICATORS, POLICY_ACTIONS, isIndicatorId } from '../data/causal';
import { createNewGame, hireAdvisors, dismissAdvisor } from '../engine/gameEngine';
import { computePerks } from '../engine/causalBridge';
import { createCausalState, poll } from '../engine/causal';
import { efficacyMultiplier } from '../engine/causal/effects';
import { rehydrate } from '../lib/savegame';
import { isNewScenarioAvailable } from '../lib/editionAccess';

describe('Asesores Full asequibles y con aportes reales', () => {
  it('todos ofrecen contratación50/100 y sueldo10/20, sin extras de acciones', () => {
    for (const advisor of availableAdvisors) {
      expect([50, 100]).toContain(advisor.cost);
      expect(ADVISOR_ROLES[advisor.id].salary).toBe(advisor.cost / 5);
      expect(advisor.bonusActions).toBe(0);
    }
  });
  it.each(availableAdvisors)('$name: cobra contratación una vez y agrega sólo su sueldo al gasto fijo', advisor => {
    const state = createNewGame('presidente', 'politico', 'QA', false, '', 'normal', undefined, 42, 'pais_en_calma');
    const hired = hireAdvisors(state, [advisor]);
    expect(hired.causal.caja).toBe(state.causal.caja - advisor.cost);
    expect(hired.causal.gastoCorr).toBe(state.causal.gastoCorr + ADVISOR_ROLES[advisor.id].salary);
    expect(hired.causal.actors).toEqual(state.causal.actors);
    const dismissed = dismissAdvisor({ ...hired, advisorActionUsed: false }, advisor.id);
    expect(dismissed.causal.gastoCorr).toBe(state.causal.gastoCorr);
    expect(dismissed.causal.perks).toEqual(state.causal.perks);
  });
  it('cada especialista mejora efectos beneficiosos reales de su área, no votos de grupos', () => {
    for (const advisor of availableAdvisors.filter(item => ADVISOR_ROLES[item.id].categories.length > 0)) {
      const role = ADVISOR_ROLES[advisor.id];
      const action = POLICY_ACTIONS.find(item => role.categories.includes(item.category) && (EFFECTS_BY_ACTION[item.id] ?? []).some(row => row.magnitude !== null && isIndicatorId(row.target) && INDICATORS[row.target].goodDirection * row.magnitude > 0));
      expect(action).toBeTruthy();
      if (!action) continue;
      const row = EFFECTS_BY_ACTION[action.id].find(item => item.magnitude !== null && isIndicatorId(item.target) && INDICATORS[item.target].goodDirection * item.magnitude > 0)!;
      const base = createCausalState({ perks: computePerks('politico', []) });
      const advised = createCausalState({ perks: computePerks('politico', [advisor.id]) });
      expect(efficacyMultiplier(advised, action, row, 1) / efficacyMultiplier(base, action, row, 1)).toBeCloseTo(role.efficacy);
    }
  });
  it('comunicación permite una encuesta gratis y revela al electorado', () => {
    const state = createCausalState({ perks: computePerks('politico', ['advisor2']) });
    const result = poll(state, 'clase_media');
    expect(result.ok).toBe(true);
    expect(result.state.caja).toBe(state.caja);
    expect(result.state.actors.clase_media.revealedUntil).toBeGreaterThanOrEqual(state.turn);
  });
  it('una partida vieja adapta nómina una sola vez y al despedir no deja gasto fantasma', () => {
    const advisor = availableAdvisors.find(item => item.id === 'advisor3')!;
    const base = createNewGame('presidente', 'politico', 'Anterior', false, '');
    const hired = hireAdvisors(base, [advisor]);
    const legacy = { ...hired, advisorSalaryVersion: undefined, causal: { ...hired.causal, gastoCorr: base.causal.gastoCorr + LEGACY_ADVISOR_SALARIES[advisor.id] } };
    const migrated = rehydrate(legacy);
    expect(migrated.causal.gastoCorr).toBe(base.causal.gastoCorr + ADVISOR_ROLES[advisor.id].salary);
    expect(rehydrate(migrated).causal.gastoCorr).toBe(migrated.causal.gastoCorr);
    expect(dismissAdvisor({ ...migrated, advisorActionUsed: false }, advisor.id).causal.gastoCorr).toBe(base.causal.gastoCorr);
  });
});

describe('Acceso de Full sin cambiar escenarios', () => {
  it('ofrece los tres inicios regulares y bloquea los dos históricos', () => {
    for (const id of ['pais_en_calma', 'viento_de_cola', 'herencia_pesada']) expect(isNewScenarioAvailable(id)).toBe(true);
    for (const id of ['corralito', 'pais_en_llamas']) expect(isNewScenarioAvailable(id)).toBe(false);
  });
});
