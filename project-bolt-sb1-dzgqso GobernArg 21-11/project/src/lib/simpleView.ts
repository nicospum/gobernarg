/**
 * Modo simple de la Lite (LITE_FEATURES.modoDetallado = false): qué se
 * muestra y cómo, en palabras y flechas. Solo lectura del estado: el motor
 * sigue calculando los 15 indicadores y los 17 actores.
 */
import type { GameState } from '../types/game';
import type { TurnRecord } from '@/engine/causal';
import { EFFECTS_BY_ACTION, INDICATORS, PARAMS, isIndicatorId, type IndicatorId } from '@/data/causal';
import { crisisScenario, effective, inEmergency, viewRef } from '@/engine/causal';
import { toneOf, type Tone } from './causalText';

/**
 * Ocho indicadores efectivos en dos grupos. Actividad incluye empleo; Divisas
 * representa el frente externo. Los demás indicadores siguen en el motor.
 */
export const SIMPLE_GROUPS = ['Economía', 'Vida cotidiana'] as const;
export type SimpleGroup = typeof SIMPLE_GROUPS[number];

export const SIMPLE_INDICATORS: { key: string; group: SimpleGroup; label: string; ids: IndicatorId[] }[] = [
  { key: 'INFL', group: 'Economía', label: 'Precios', ids: ['INFL'] },
  { key: 'ACTV', group: 'Economía', label: 'Actividad', ids: ['ACTV'] },
  { key: 'PODA', group: 'Economía', label: 'Bolsillo', ids: ['PODA'] },
  { key: 'EXTE', group: 'Economía', label: 'Divisas', ids: ['EXTE'] },
  { key: 'INFR', group: 'Vida cotidiana', label: 'Obras', ids: ['INFR'] },
  { key: 'EDUC', group: 'Vida cotidiana', label: 'Educación', ids: ['EDUC'] },
  { key: 'PSOC', group: 'Vida cotidiana', label: 'Salud', ids: ['PSOC'] },
  { key: 'SEGU', group: 'Vida cotidiana', label: 'Seguridad', ids: ['SEGU'] },
];

/** Palabras de estado de la B Lite (src/lite/present.ts de la B). */
const WORDS = ['Crítico', 'Bajo', 'Regular', 'Bueno', 'Muy bueno'];
const PRICE_WORDS = ['Descontrolados', 'Muy altos', 'Altos', 'Estables', 'Muy estables'];
const BAND_TONE: Tone[] = ['bad', 'bad', 'neutral', 'good', 'good'];

/** Estado en una palabra, con las bandas de la B (en Precios, subir es malo). */
export function describeIndicator(id: IndicatorId, value: number): { word: string; tone: Tone } {
  const score = id === 'INFL' ? 100 - value : value;
  const level = score < 25 ? 0 : score < 40 ? 1 : score < 60 ? 2 : score < 75 ? 3 : 4;
  return { word: (id === 'INFL' ? PRICE_WORDS : WORDS)[level], tone: BAND_TONE[level] };
}

const KEY_OF: Partial<Record<IndicatorId, { key: string; label: string }>> = {};
for (const s of SIMPLE_INDICATORS) for (const id of s.ids) KEY_OF[id] = { key: s.key, label: s.label };

const avg = (xs: number[]) => xs.reduce((a, b) => a + b, 0) / xs.length;

export interface SimpleIndicator {
  group: SimpleGroup;
  key: string;
  label: string;
  word: string;
  tone: Tone;
  /** Cambio del último cierre; null en el primer turno. */
  delta: number | null;
  /** ¿Que suba es bueno? (para colorear la flecha). */
  goodWhenUp: boolean;
}

/** Estado de los indicadores visibles en palabras (Bueno / Regular / Altos…). */
export function simpleIndicators(state: GameState): SimpleIndicator[] {
  const c = state.causal;
  const ref = viewRef(c);
  // Durante la emergencia de un escenario histórico todavía no hay cierres
  // trimestrales: la flecha sale del cierre de la última subronda.
  const last: Pick<TurnRecord, 'indicatorsBefore' | 'indicatorsAfter'> | undefined =
    c.records[c.records.length - 1] ?? c.crisis?.log[c.crisis.log.length - 1];
  return SIMPLE_INDICATORS.map(({ key, group, label, ids }) => {
    const v = avg(ids.map(id => effective(c, id, ref)));
    const band = describeIndicator(ids[0], v);
    const delta = last ? avg(ids.map(id => last.indicatorsAfter[id] - last.indicatorsBefore[id])) : null;
    return { key, group, label, word: band.word, tone: band.tone, delta, goodWhenUp: INDICATORS[ids[0]].goodDirection >= 0 };
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
 * ven en el tablero. Conserva primero un beneficio y una contrapartida reales,
 * aunque su indicador no esté en la franja simple; después prioriza los visibles.
 * Un mismo indicador puede empeorar ahora y recuperarse más adelante.
 */
export function simpleEffects(actionId: string, max = 3): SimpleEffect[] {
  const rows = (EFFECTS_BY_ACTION[actionId] ?? []).filter(
    r => r.kind !== 'CONDITIONAL' && r.kind !== 'REPETITION' && r.magnitude !== null && r.magnitude !== 0 && isIndicatorId(r.target),
  );
  const visible: SimpleEffect[] = [];
  const hidden: SimpleEffect[] = [];
  const candidates: SimpleEffect[] = [];
  const seen = new Set<string>();
  for (const r of rows) {
    const id = r.target as IndicatorId;
    const simple = KEY_OF[id];
    const label = simple?.label ?? INDICATORS[id].name;
    const when = (r.offset ?? 0) === 0 ? 'ahora' : 'más adelante';
    const identity = `${label}.${Math.sign(r.magnitude as number)}.${when}`;
    if (seen.has(identity)) continue;
    seen.add(identity);
    const effect: SimpleEffect = {
      label,
      up: (r.magnitude as number) > 0,
      tone: toneOf(id, r.magnitude as number),
      when,
    };
    candidates.push(effect);
    (simple ? visible : hidden).push(effect);
  }
  const good = candidates.find(e => e.tone === 'good');
  const bad = candidates.find(e => e.tone === 'bad');
  const priority = [good, bad, ...visible, ...hidden].filter((e): e is SimpleEffect => !!e);
  return [...new Set(priority)].slice(0, max);
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

/** Aprobación, gobernabilidad (y los componentes del voto) en una palabra, como en la B. */
export function kpiWord(value: number): { word: string; tone: Tone } {
  if (value < 25) return { word: 'Muy baja', tone: 'bad' };
  if (value < 40) return { word: 'Baja', tone: 'bad' };
  if (value < 60) return { word: 'Media', tone: 'neutral' };
  if (value < 75) return { word: 'Alta', tone: 'good' };
  return { word: 'Muy alta', tone: 'good' };
}

/** Tendencia en una palabra. */
export function trendWord(delta: number | null): string {
  if (delta === null) return 'Primer turno';
  if (Math.abs(delta) < 0.5) return 'Estable';
  return delta > 0 ? 'Subió' : 'Bajó';
}

export interface DefeatWarning {
  id: 'hyperinflation' | 'impeachment' | 'resignation';
  /** Rojo: el próximo cierre puede terminar el gobierno. */
  critical: boolean;
  text: string;
}

/**
 * Derrotas en camino, en palabras (modo simple, como en la B). El motor cuenta
 * los cierres seguidos con la inflación en hiper o la gobernabilidad en
 * crisis (dos seguidos hacen perder). Con la cuenta en marcha el aviso es
 * rojo; cerca del umbral, antes de que empiece, es suave. Solo lee el estado.
 */
export function defeatWarnings(state: GameState): DefeatWarning[] {
  const c = state.causal;
  if (state.gameOver) return [];
  const infl = effective(c, 'INFL', viewRef(c));
  const gob = c.political.gob;
  const out: DefeatWarning[] = [];
  // Emergencia de un escenario histórico: reglas propias por subronda (engine/causal/crisis.ts).
  // Dos subrondas seguidas sin gobernabilidad (o, en la Hiper, con los precios en el techo y
  // acelerando) terminan el gobierno; la regla general de hiper recién vuelve en la gestión.
  const crisis = c.crisis;
  const crisisDef = crisisScenario(c);
  if (crisis && crisisDef && inEmergency(c)) {
    const another = crisisDef.roundUnit === 'semana' ? 'otra semana' : 'otro mes';
    // La cuenta en marcha (crisisStreak ≥ 1) siempre es roja: el próximo cierre
    // de subronda puede terminar el gobierno, aunque los números de hoy se
    // hayan movido un poco. hyperStreak/govCrisisStreak no cuentan acá.
    if (crisis.crisisStreak >= 1) {
      const pricesOut = crisis.kind === 'hiper' && ((infl >= 95 && crisis.aceleracion > 0) || gob >= 15);
      out.push(pricesOut
        ? { id: 'hyperinflation', critical: true, text: `Los precios están en el techo y acelerando: ${another} así y el gobierno cae.` }
        : { id: 'resignation', critical: true, text: `Sin gobernabilidad: ${another} así y el presidente renuncia.` });
      return out;
    }
    if (crisis.kind === 'hiper' && infl >= 90) {
      out.push({ id: 'hyperinflation', critical: false, text: 'Los precios están en el techo. Si siguen acelerando, el gobierno cae.' });
    }
    if (gob < 25) {
      out.push({ id: 'resignation', critical: false, text: 'Casi sin gobernabilidad. Si se hunde, el presidente renuncia.' });
    }
    return out;
  }
  if (c.hyperStreak >= 1) {
    out.push({ id: 'hyperinflation', critical: true, text: 'Los precios están fuera de control: si sigue así, el gobierno cae en el próximo cierre.' });
  } else if (infl >= PARAMS.HIPER_UMBRAL - 12) {
    out.push({ id: 'hyperinflation', critical: false, text: 'Los precios se están desbocando. Si empeora, podés perder la presidencia.' });
  }
  if (c.govCrisisStreak >= 1) {
    out.push({ id: 'impeachment', critical: true, text: 'Tu gobierno perdió el control: si no lo recuperás, en el próximo cierre avanza el juicio político.' });
  } else if (gob < PARAMS.GOB_CRISIS_UMBRAL + 10) {
    out.push({ id: 'impeachment', critical: false, text: 'Cada vez te cuesta más gobernar: Congreso, actores y calle te dan poco margen. Si empeora, podés perder la presidencia.' });
  }
  return out;
}
