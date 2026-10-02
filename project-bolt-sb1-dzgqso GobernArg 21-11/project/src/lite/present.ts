import type { CausalState, IndicatorId } from '../causal/types';

/**
 * Presentación de la Lite (LITE_FEATURES.modoDetallado = false): el país en
 * palabras, colores y flechas, sin números. Solo lectura del estado.
 */

/** Los 7 indicadores que se ven, con su nombre corto. El resto sigue en el motor. */
export const VISIBLE_INDICATORS: { id: IndicatorId; label: string }[] = [
  { id: 'inflacion', label: 'Precios' },
  { id: 'actividad', label: 'Empleo' },
  { id: 'ingreso_real', label: 'Bolsillo' },
  { id: 'infraestructura', label: 'Obras' },
  { id: 'educacion', label: 'Educación' },
  { id: 'salud', label: 'Salud' },
  { id: 'seguridad', label: 'Seguridad' },
];

/** Nombre corto de cualquier indicador (también de los que no se muestran en el tablero). */
export const SHORT_NAMES: Record<IndicatorId, string> = {
  inflacion: 'Precios', actividad: 'Empleo', ingreso_real: 'Bolsillo', credito: 'Crédito', fiscal: 'Cuentas públicas',
  externo: 'Exportaciones', infraestructura: 'Obras', educacion: 'Educación', salud: 'Salud', proteccion: 'Protección',
  seguridad: 'Seguridad', ciencia: 'Innovación', derechos: 'Instituciones', ambiente: 'Ambiente',
};

export type Tone = 'critical' | 'bad' | 'neutral' | 'good' | 'great';
const TONES: Tone[] = ['critical', 'bad', 'neutral', 'good', 'great'];
const WORDS = ['Crítico', 'Bajo', 'Regular', 'Bueno', 'Muy bueno'];
const PRICE_WORDS = ['Descontrolados', 'Muy altos', 'Altos', 'Estables', 'Muy estables'];
/** Palabras para aprobación, estabilidad y legitimidad. */
const KPI_WORDS = ['Muy baja', 'Baja', 'Media', 'Alta', 'Muy alta'];

/** En Precios subir es malo: se mide "lo bien que está" (0–100). */
export const goodness = (id: IndicatorId, value: number) => id === 'inflacion' ? 100 - value : value;

function band(score: number): number {
  return score < 25 ? 0 : score < 40 ? 1 : score < 60 ? 2 : score < 75 ? 3 : 4;
}

/** Estado de un indicador en una palabra y un tono de color. */
export function describeIndicator(id: IndicatorId, value: number): { word: string; tone: Tone } {
  const level = band(goodness(id, value));
  return { word: (id === 'inflacion' ? PRICE_WORDS : WORDS)[level], tone: TONES[level] };
}

/** Aprobación, estabilidad o legitimidad en una palabra. */
export function describeKpi(value: number): { word: string; tone: Tone } {
  const level = band(value);
  return { word: KPI_WORDS[level], tone: TONES[level] };
}

/** Hacia dónde se movió un indicador: sube, baja o igual, y si eso es bueno. */
export function trend(id: IndicatorId, delta: number): { direction: 'up' | 'down' | 'flat'; good: boolean | null; label: string } {
  if (Math.abs(delta) < 0.5) return { direction: 'flat', good: null, label: 'sin cambios' };
  const up = delta > 0;
  return { direction: up ? 'up' : 'down', good: id === 'inflacion' ? !up : up, label: up ? 'sube' : 'baja' };
}

/** Intensidad de un efecto previsto como flechas: ▲ (1–2), ▲▲ (3–5), ▲▲▲ (6 o más). */
export function effectArrows(magnitude: number): string {
  const size = Math.abs(magnitude);
  if (size < 0.05) return '';
  const count = size >= 6 ? 3 : size >= 3 ? 2 : 1;
  return (magnitude > 0 ? '▲' : '▼').repeat(count);
}

/** Si el efecto previsto es bueno para el país (en Precios, bajar es bueno). */
export const effectIsGood = (id: IndicatorId, magnitude: number) => (id === 'inflacion' ? magnitude < 0 : magnitude > 0);

/** Clase de color de cada tono (paleta de la sala de situación). */
export const TONE_CLASS: Record<Tone, string> = {
  critical: 'b-tone-critical', bad: 'b-tone-bad', neutral: 'b-tone-neutral', good: 'b-tone-good', great: 'b-tone-great',
};

/** Ánimo de un actor según su satisfacción. */
export function actorMood(satisfaction: number): { word: string; face: 'happy' | 'neutral' | 'sad'; tone: Tone } {
  if (satisfaction >= 55) return { word: 'Conforme', face: 'happy', tone: 'good' };
  if (satisfaction >= 40) return { word: 'Expectante', face: 'neutral', tone: 'neutral' };
  if (satisfaction >= 25) return { word: 'Molesto', face: 'sad', tone: 'bad' };
  return { word: 'Enojado', face: 'sad', tone: 'critical' };
}

/** Relación política con un actor en tres niveles. */
export function relationWord(relationship: number): string {
  return relationship >= 60 ? 'Aliado' : relationship >= 35 ? 'Neutral' : 'Distante';
}

/** Cuántos turnos faltan, en palabras: "este turno", "en 1 turno", "en 3 turnos". */
export function inTurns(n: number): string {
  return n <= 0 ? 'este turno' : n === 1 ? 'en 1 turno' : `en ${n} turnos`;
}

/** Gobernabilidad en palabras: si alguna ley tiene hoy la mayoría (51 bancas) que necesita. */
export function governabilityWord(state: CausalState): { word: string; tone: string } {
  const best = Math.max(0, ...Object.values(state.legislativeSupport));
  if (best >= 51) return { word: 'Podés aprobar leyes', tone: TONE_CLASS.good };
  if (best >= 40) return { word: 'Te faltan pocos votos', tone: TONE_CLASS.bad };
  return { word: 'Congreso en contra', tone: TONE_CLASS.critical };
}

/**
 * Derrotas en camino, en palabras (modo simple): el motor lleva un contador por
 * cada causa de derrota (campaign.checkDefeat). Cerca del umbral o con la
 * cuenta en marcha avisa en suave; en rojo cuando el próximo cierre puede
 * terminar el gobierno.
 */
export interface DefeatWarning { id: string; critical: boolean; text: string }
export function defeatWarnings(state: CausalState): DefeatWarning[] {
  const c = state.campaign;
  if (!c || state.phase === 'ended') return [];
  const arrears = state.arrears.reduce((sum, item) => sum + item.amount, 0);
  const cases: [string, number, number, boolean, string][] = [
    // id, contador del motor, cierres que hacen perder, ¿cerca del umbral (un par de turnos antes)?, qué pasa
    ['approval', c.lowApprovalTurns, 2, c.approval < 30, 'La gente está muy enojada con tu gobierno'],
    ['insolvency', c.insolvencyTurns, 3, arrears > 300, 'No te alcanza la plata para pagar lo que debés'],
    ['impeachment', c.impeachmentTurns, 2, c.legitimacy < 30 && state.indicators.derechos < 35, 'Se derrumba la confianza en las instituciones y te amenaza un juicio político'],
    ['coup', c.coupTurns, 3, c.stability < 25 && state.actors.oficialismo.relationship < 35, 'Tu gobierno pierde el control: hay conflictos por todos lados y tu propio partido se aleja'],
    ['hyperinflation', c.hyperinflationTurns, 2, state.indicators.inflacion >= 85 && state.indicators.ingreso_real < 30, 'Los precios están fuera de control y la plata no alcanza para nada'],
  ];
  // Rojo cuando el próximo cierre puede terminar el gobierno; suave antes.
  return cases.filter(([, count, , near]) => count > 0 || near).map(([id, count, limit, , what]) => count > 0
    ? { id, critical: limit - count <= 1, text: `${what}: si sigue así, perdés ${inTurns(limit - count)}.` }
    : { id, critical: false, text: `${what}. Si empeora, podés perder la presidencia.` });
}
