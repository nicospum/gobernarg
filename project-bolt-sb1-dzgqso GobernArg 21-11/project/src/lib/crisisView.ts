/**
 * Escenarios históricos (Corralito 2001 e Hiper 1989): palabras de la
 * emergencia para la interfaz. Solo lectura del estado; las reglas viven en
 * engine/causal/crisis.ts.
 */
import { crisisRoundLabel, crisisScenario, inEmergency, type CausalState, type CrisisRoundRecord } from '@/engine/causal';
import { SIMPLE_INDICATORS } from './simpleView';
import { toneOf, type Tone } from './causalText';

export type CrisisUnit = 'semana' | 'mes' | 'turno';

export interface UnitWords {
  unit: CrisisUnit;
  /** "la semana", "el mes", "el turno". */
  withArticle: string;
  /** "esta semana", "este mes", "este turno". */
  thisLower: string;
  /** "Esta semana", "Este mes", "Este turno". */
  thisCap: string;
  /** "otra semana", "otro mes", "otro turno". */
  another: string;
  /** "Cerrar la semana", "Cerrar el mes", "Cerrar el turno". */
  close: string;
  /** "Semana", "Mes", "Turno". */
  cap: string;
}

export function unitWords(unit: CrisisUnit): UnitWords {
  const feminine = unit === 'semana';
  const article = feminine ? 'la' : 'el';
  const thisLower = `${feminine ? 'esta' : 'este'} ${unit}`;
  return {
    unit,
    withArticle: `${article} ${unit}`,
    thisLower,
    thisCap: thisLower[0].toUpperCase() + thisLower.slice(1),
    another: `${feminine ? 'otra' : 'otro'} ${unit}`,
    close: `Cerrar ${article} ${unit}`,
    cap: unit[0].toUpperCase() + unit.slice(1),
  };
}

/** Unidad de lo que se cierra ahora: la subronda durante la emergencia, el turno después. */
export function crisisUnit(state: CausalState): CrisisUnit {
  const def = crisisScenario(state);
  return def && inEmergency(state) ? def.roundUnit : 'turno';
}

/** "Semana 1 de 3" durante la emergencia; vacío fuera de ella. */
export function emergencyStage(state: CausalState): string {
  const def = crisisScenario(state);
  const c = state.crisis;
  if (!def || !c || !inEmergency(state)) return '';
  return `${unitWords(def.roundUnit).cap} ${c.round} de ${c.rounds}`;
}

/** "Primera semana de diciembre · Semana 1 de 3"; vacío fuera de la emergencia. */
export function emergencyCaption(state: CausalState): string {
  return [crisisRoundLabel(state), emergencyStage(state)].filter(Boolean).join(' · ');
}

/** Aviso corto al cerrar una subronda: "Semana cerrada: Primera semana de diciembre". */
export function closedRoundText(state: CausalState, label: string): string {
  const unit = crisisScenario(state)?.roundUnit ?? 'turno';
  const words = unitWords(unit);
  return `${words.cap} ${unit === 'semana' ? 'cerrada' : 'cerrado'}: ${label}`;
}

export interface RoundChange {
  label: string;
  delta: number;
  tone: Tone;
}

/** Lo que más se movió en una subronda: los indicadores visibles y la gobernabilidad, sin números. */
export function roundChanges(record: CrisisRoundRecord, max = 3): RoundChange[] {
  const out: RoundChange[] = SIMPLE_INDICATORS.map(({ label, ids }) => {
    const delta = ids.reduce((acc, id) => acc + (record.indicatorsAfter[id] - record.indicatorsBefore[id]), 0) / ids.length;
    return { label, delta, tone: toneOf(ids[0], delta) };
  });
  const gob = record.gobAfter - record.gobBefore;
  out.push({ label: 'Gobernabilidad', delta: gob, tone: gob > 0 ? 'good' : gob < 0 ? 'bad' : 'neutral' });
  return out
    .filter(ch => Math.abs(ch.delta) >= 0.5)
    .sort((a, b) => Math.abs(b.delta) - Math.abs(a.delta))
    .slice(0, max);
}
