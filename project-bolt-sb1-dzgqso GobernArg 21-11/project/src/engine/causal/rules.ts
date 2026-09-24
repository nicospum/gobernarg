import { INDICATOR_IDS, PARAMS, type IndicatorId } from '../../data/causal';
import { clamp, effectiveAll, flagValue, result3, saturate } from './context';
import type { CausalState, RuleRecord } from './types';

/**
 * T.6 — Reglas estructurales entre indicadores (pestaña 01B_INTERACCIONES).
 * Se calculan sobre una FOTO del estado efectivo (sin orden de dependencia) y
 * se aplican juntas al valor base. Son la vía de los efectos de segundo orden.
 * R04 usa la inversión del turno anterior (rezago de 1 turno).
 */
export function applyStructuralRules(state: CausalState, close: number): RuleRecord[] {
  const v = effectiveAll(state, close);
  const prev = effectiveAll(state, close - 1);
  const d: RuleRecord[] = [];
  const add = (ruleId: string, target: IndicatorId, delta: number) => {
    if (Math.abs(delta) > 1e-9) d.push({ ruleId, target, delta });
  };

  // R01 — inflación converge a un ancla de fundamentos + expectativas.
  const ancla = 35 + 0.3 * (50 - v.SOLV) + 0.3 * (50 - v.EXTE) + state.desanclaje;
  add('R01', 'INFL', 0.2 * (ancla - v.INFL));
  // R02 — la inflación erosiona el poder adquisitivo.
  if (v.INFL > 45) add('R02', 'PODA', -0.1 * (v.INFL - 45));
  // R03 — empleo y paritarias recomponen salarios.
  add('R03', 'PODA', 0.05 * (v.ACTV - 50) + 0.05 * (50 - v.PODA));
  // R04 — la inversión de hoy es actividad de mañana.
  add('R04', 'ACTV', 0.08 * (prev.INVC - 50));
  // R05 — infraestructura abarata producir.
  add('R05', 'ACTV', 0.03 * (v.INFR - 50));
  // R06 — el conflicto frena la economía.
  if (v.CONF > 55) {
    add('R06', 'ACTV', -0.06 * (v.CONF - 55));
    add('R06', 'INVC', -0.04 * (v.CONF - 55));
  }
  // R07 — restricción externa.
  if (v.EXTE < 35) {
    add('R07', 'INFL', 0.1 * (35 - v.EXTE));
    add('R07', 'ACTV', -0.06 * (35 - v.EXTE));
  }
  // R08 — clima de inversión.
  add('R08', 'INVC',
    0.04 * (v.INST - 50) + 0.03 * (v.CIEN - 50)
    - 0.08 * Math.max(0, v.INFL - 60) - 0.05 * Math.max(0, v.PRES - 55)
    + 0.05 * (45 - v.INVC));
  // R09 — depreciación de infraestructura salvo mantenimiento.
  if (!flagValue(state, 'mant_activo', close)) add('R09', 'INFR', -0.8);
  // R10 — deterioro educativo sin inversión.
  add('R10', 'EDUC', -0.3);
  // R11 — educación alimenta ciencia; obsolescencia.
  add('R11', 'CIEN', 0.02 * (v.EDUC - 50) - 0.2);
  // R12 — economía del conocimiento exporta.
  add('R12', 'EXTE', 0.03 * (v.CIEN - 50));
  // R13 — el desempleo presiona la red de protección.
  add('R13', 'PSOC', 0.03 * (45 - v.PSOC) - 0.05 * Math.max(0, 45 - v.ACTV));
  // R14 — la exclusión alimenta el delito.
  add('R14', 'SEGU', 0.04 * ((v.PSOC + v.ACTV) / 2 - 50) + 0.03 * (45 - v.SEGU));
  // R15 — el conflicto se disipa, la exclusión lo realimenta.
  add('R15', 'CONF', 0.25 * (30 - v.CONF) + 0.1 * Math.max(0, 40 - v.PSOC) + 0.08 * Math.max(0, 40 - v.PODA));
  // R16 — actividad presiona recursos; recuperación natural.
  if (v.ACTV > 55) add('R16', 'AMBI', -0.02 * (v.ACTV - 55));
  add('R16', 'AMBI', 0.02 * (50 - v.AMBI));
  // R17 — dolarización con inflación alta; normalización.
  add('R17', 'EXTE', -0.1 * Math.max(0, v.INFL - 70) + 0.05 * (45 - v.EXTE));
  // R18 — las instituciones vuelven a su nivel normal.
  add('R18', 'INST', 0.03 * (50 - v.INST));
  // R19 — solvencia derivada del resultado fiscal y la deuda.
  const obj = 50 + (40 * result3(state)) / PARAMS.INGRESO_BASE - 30 * (state.deuda / (4 * PARAMS.INGRESO_BASE) - 0.75);
  add('R19', 'SOLV', 0.5 * (clamp(obj) - state.base.SOLV));

  for (const id of INDICATOR_IDS) {
    const total = d.filter(r => r.target === id).reduce((a, r) => a + r.delta, 0);
    // INFL (la hiperinflación es una derrota diseñada) y SOLV (derivado) no se saturan.
    const applied = id === 'INFL' || id === 'SOLV' ? total : saturate(state.base[id], total);
    if (total !== 0) state.base[id] = clamp(state.base[id] + applied);
  }
  // R20 — las expectativas se re-anclan lentamente.
  if (state.desanclaje > 0) {
    const before = state.desanclaje;
    state.desanclaje = Math.max(0, state.desanclaje - 1);
    d.push({ ruleId: 'R20', target: 'DESANCLAJE', delta: state.desanclaje - before });
  }
  return d;
}
