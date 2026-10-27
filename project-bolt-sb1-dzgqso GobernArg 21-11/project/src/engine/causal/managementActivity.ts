import { getScenario } from '../../data/causal';
import type { CausalState, ManagementActivity, ManagementActivityRecord } from './types';

/** PA disponibles y restantes antes de reiniciar los recursos del próximo turno. */
export interface ManagementActivityBudget {
  available: number;
  remaining: number;
  /** Las suspensiones judiciales cuentan como esfuerzo, pero impiden el premio. */
  allSelectionsExecuted?: boolean;
}

export interface ManagementActivityPreview {
  activity: ManagementActivity;
  record: ManagementActivityRecord;
}

/** Desgaste persistente: los primeros tres puntos de presión tienen impacto leve. */
export function managementGovernabilityPenalty(pressure: number): number {
  const p = Math.max(0, pressure);
  return Math.min(100, 0.25 * Math.min(p, 3) + 16 * Math.max(0, p - 3));
}

/** Migra sólo la presión persistente demostrable; no reescribe resultados pasados. */
export function migrateManagementActivity(causal: CausalState): CausalState {
  const previous = causal.managementActivity;
  if (!previous || previous.version === 2 || getScenario(causal.scenarioId).reelectionsToUnlock > 0) return causal;
  let expectedTurn = causal.turn;
  let oldPressure = previous.pressure;
  const suffix: ManagementActivityRecord[] = [];
  // Los últimos 40 registros cubren las carreras de 24/32 cierres. Si falta
  // historial, el prefijo desconocido se conserva: jamás se infieren PA gratis.
  for (let i = causal.records.length - 1; i >= 0; i--) {
    const record = causal.records[i];
    const activity = record.managementActivity;
    if (record.turn !== expectedTurn - 1 || !activity
      || Math.abs(activity.pressureAfter - oldPressure) > 1e-8) break;
    const oldWeight = activity.available === 0 ? 0 : activity.used === 0 ? 1
      : activity.unused >= 3 ? 0.25 : activity.unused === 2 ? 0.1 : 0;
    const expectedPressure = Math.round(Math.max(0, oldWeight === 0
      ? activity.pressureBefore - 1 : activity.pressureBefore + oldWeight) * 1e9) / 1e9;
    if (Math.abs(expectedPressure - activity.pressureAfter) > 1e-8) break;
    suffix.unshift(activity);
    oldPressure = activity.pressureBefore;
    expectedTurn = record.turn;
  }
  let pressure = oldPressure;
  for (const activity of suffix) {
    const weight = activity.available === 0 ? 0 : activity.used === 0 ? 1
      : activity.unused >= 3 ? 0.05 : activity.unused === 2 ? 0.025 : 0;
    pressure = Math.round(Math.max(0, weight === 0 ? pressure - 1 : pressure + weight) * 1e9) / 1e9;
  }
  return { ...causal, managementActivity: { ...previous, version: 2, pressure } };
}

/**
 * Previsión pura de un cierre. No infiere acciones desde políticas seleccionadas:
 * usa el consumo real de PA, incluidas habilidades e interacciones pagas.
 * Sin historial observado completo no se concede el premio de fin de mandato.
 */
export function previewManagementActivity(
  causal: Pick<CausalState, 'turn' | 'mandateStart' | 'managementActivity'>,
  budget: ManagementActivityBudget,
  mandateTurns = 16,
): ManagementActivityPreview {
  const available = Math.max(0, Math.floor(budget.available));
  const unused = Math.max(0, Math.min(available, Math.floor(budget.remaining)));
  const used = available - unused;
  const previous = causal.managementActivity;
  const current = previous?.mandateStart === causal.mandateStart ? previous : undefined;
  const observedBefore = current?.observedTurns ?? 0;
  const pressureBefore = previous?.pressure ?? 0;
  const weight = available === 0 ? 0 : used === 0 ? 1 : unused >= 3 ? 0.05 : unused === 2 ? 0.025 : 0;
  // Evita que sumas decimales repetidas cambien el umbral por ruido numérico.
  const pressureAfter = Math.round(Math.max(0, weight === 0 ? pressureBefore - 1 : pressureBefore + weight) * 1e9) / 1e9;
  const contiguous = observedBefore === causal.turn - causal.mandateStart;
  const perfectUse = (current ? current.perfectUse : causal.turn === causal.mandateStart)
    && contiguous && available > 0 && unused === 0 && budget.allSelectionsExecuted !== false;
  const observedTurns = Math.min(mandateTurns, observedBefore + 1);
  const alreadyGranted = current?.bonusGranted ?? false;
  const bonusAwarded = !alreadyGranted && perfectUse && observedTurns === mandateTurns
    && causal.turn === causal.mandateStart + mandateTurns - 1;
  return {
    activity: {
      version: 2,
      pressure: pressureAfter,
      mandateStart: causal.mandateStart,
      observedTurns,
      perfectUse,
      bonusGranted: alreadyGranted || bonusAwarded,
    },
    record: {
      available,
      used,
      unused,
      pressureBefore,
      pressureAfter,
      governabilityPenalty: managementGovernabilityPenalty(pressureAfter),
      imagenDelta: -0.5 * weight + (bonusAwarded ? 2 : 0),
      bonusAwarded,
    },
  };
}
