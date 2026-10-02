/**
 * Modo simple de la Lite (LITE_FEATURES.modoDetallado = false): qué se
 * muestra y cómo, en palabras y flechas. Solo lectura del estado: el motor
 * sigue calculando los 15 indicadores y los 17 actores.
 */
import type { GameState } from '../types/game';
import type { TurnRecord } from '@/engine/causal';
import { EFFECTS_BY_ACTION, INDICATORS, isIndicatorId, type IndicatorId } from '@/data/causal';
import { effective, viewRef } from '@/engine/causal';
import { indicatorBand, toneOf, type Tone } from './causalText';

export type SimpleWord = 'Bien' | 'Normal' | 'Alerta';

/** Los indicadores que se ven: 6 sueltos y "Servicios del Estado" (promedio de 4). */
export const SIMPLE_INDICATORS: { key: string; label: string; ids: IndicatorId[] }[] = [
  { key: 'INFL', label: 'Inflación', ids: ['INFL'] },
  { key: 'ACTV', label: 'Empleo y actividad', ids: ['ACTV'] },
  { key: 'PODA', label: 'Salario', ids: ['PODA'] },
  // Solvencia fiscal: que suba es bueno ("riesgo país" se leería al revés).
  { key: 'SOLV', label: 'Cuentas públicas', ids: ['SOLV'] },
  { key: 'EXTE', label: 'Dólar y reservas', ids: ['EXTE'] },
  { key: 'CONF', label: 'Conflictividad', ids: ['CONF'] },
  { key: 'SERV', label: 'Servicios del Estado', ids: ['INFR', 'EDUC', 'PSOC', 'SEGU'] },
];

const KEY_OF: Partial<Record<IndicatorId, { key: string; label: string }>> = {};
for (const s of SIMPLE_INDICATORS) for (const id of s.ids) KEY_OF[id] = { key: s.key, label: s.label };

const WORD: Record<Tone, SimpleWord> = { good: 'Bien', neutral: 'Normal', bad: 'Alerta' };

const avg = (xs: number[]) => xs.reduce((a, b) => a + b, 0) / xs.length;

export interface SimpleIndicator {
  key: string;
  label: string;
  word: SimpleWord;
  tone: Tone;
  /** Cambio del último cierre; null en el primer turno. */
  delta: number | null;
  /** ¿Que suba es bueno? (para colorear la flecha). */
  goodWhenUp: boolean;
}

/** Estado de los indicadores visibles en palabras (Bien / Normal / Alerta). */
export function simpleIndicators(state: GameState): SimpleIndicator[] {
  const c = state.causal;
  const ref = viewRef(c);
  const last = c.records[c.records.length - 1];
  return SIMPLE_INDICATORS.map(({ key, label, ids }) => {
    const v = avg(ids.map(id => effective(c, id, ref)));
    // El compuesto usa las bandas genéricas (Débil / Normal / Bueno).
    const band = indicatorBand(ids.length === 1 ? ids[0] : 'INFR', v);
    const delta = last ? avg(ids.map(id => last.indicatorsAfter[id] - last.indicatorsBefore[id])) : null;
    return { key, label, word: WORD[band.tone], tone: band.tone, delta, goodWhenUp: INDICATORS[ids[0]].goodDirection >= 0 };
  });
}

export interface SimpleEffect {
  label: string;
  up: boolean;
  tone: Tone;
  when: 'ahora' | 'más adelante';
}

/**
 * Hasta `max` efectos de una acción, sin números, sobre los indicadores que se
 * ven en el tablero (los de servicios se agrupan). Solo si la acción no toca
 * ninguno se nombran los otros (p. ej. ciencia), para que no quede vacía.
 */
export function simpleEffects(actionId: string, max = 3): SimpleEffect[] {
  const rows = (EFFECTS_BY_ACTION[actionId] ?? []).filter(
    r => r.kind !== 'CONDITIONAL' && r.kind !== 'REPETITION' && r.magnitude !== null && r.magnitude !== 0 && isIndicatorId(r.target),
  );
  const visible: SimpleEffect[] = [];
  const hidden: SimpleEffect[] = [];
  const seen = new Set<string>();
  for (const r of rows) {
    const id = r.target as IndicatorId;
    const simple = KEY_OF[id];
    const label = simple?.label ?? INDICATORS[id].name;
    if (seen.has(label)) continue;
    seen.add(label);
    const effect: SimpleEffect = {
      label,
      up: (r.magnitude as number) > 0,
      tone: toneOf(id, r.magnitude as number),
      when: (r.offset ?? 0) === 0 ? 'ahora' : 'más adelante',
    };
    (simple ? visible : hidden).push(effect);
  }
  return (visible.length > 0 ? visible : hidden).slice(0, max);
}

export interface SimpleChange {
  label: string;
  delta: number;
  tone: Tone;
}

/** Las cosas que más se movieron en un cierre (indicadores visibles y votos). */
export function topChanges(record: TurnRecord, political: { apro: number; iv: number; gob: number }, max = 3): SimpleChange[] {
  const out: SimpleChange[] = SIMPLE_INDICATORS.map(({ label, ids }) => {
    const delta = avg(ids.map(id => record.indicatorsAfter[id] - record.indicatorsBefore[id]));
    return { label, delta, tone: toneOf(ids[0], delta) };
  });
  const pol: [string, keyof typeof political][] = [['Aprobación', 'apro'], ['Intención de voto', 'iv'], ['Gobernabilidad', 'gob']];
  for (const [label, k] of pol) {
    const delta = political[k] - record.politicalBefore[k];
    out.push({ label, delta, tone: delta > 0 ? 'good' : delta < 0 ? 'bad' : 'neutral' });
  }
  return out
    .filter(ch => Math.abs(ch.delta) >= 0.5)
    .sort((a, b) => Math.abs(b.delta) - Math.abs(a.delta))
    .slice(0, max);
}

/** Tendencia en una palabra. */
export function trendWord(delta: number | null): string {
  if (delta === null) return 'Primer turno';
  if (Math.abs(delta) < 0.5) return 'Estable';
  return delta > 0 ? 'Subió' : 'Bajó';
}
