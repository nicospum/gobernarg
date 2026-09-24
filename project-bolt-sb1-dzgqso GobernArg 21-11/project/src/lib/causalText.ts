/**
 * Traducción del motor causal a lenguaje de juego.
 *
 * El modelo interno puede ser complejo (sensibilidades, expectativas, bonus);
 * la interfaz muestra bandas cualitativas, flechas y frases. Todo texto que
 * describe el estado del país o de los actores sale de acá.
 */
import {
  ACTORS,
  EFFECTS_BY_ACTION,
  INDICATORS,
  isActorId,
  isIndicatorId,
  type ActorId,
  type IndicatorId,
} from '@/data/causal';
import type { EffectRow } from '@/data/causal/types';
import { concerns, type CausalState, type Contribution } from '@/engine/causal';
import { fmtBudget } from './format';

export type Tone = 'good' | 'bad' | 'neutral';

const FLAG_LABELS: Record<string, string> = {
  estudio_vigente: 'Estudio de factibilidad vigente',
  cepo: 'Cepo cambiario',
  pacto_social: 'Pacto social vigente',
  ley_ambiental: 'Ley ambiental',
  meta_fiscal: 'Meta fiscal comprometida',
  rigi: 'Régimen de grandes inversiones',
  mant_activo: 'Mantenimiento en curso',
  agenda_int: 'Agenda internacional activa',
  riesgo_judicial: 'Riesgo judicial por DNU',
  crisis_energetica: 'Emergencia energética',
};

export function targetLabel(target: string): string {
  if (isIndicatorId(target)) return INDICATORS[target].name;
  if (target.startsWith('REL:')) {
    const a = target.slice(4);
    return isActorId(a) ? `Relación con ${ACTORS[a].shortName}` : 'Relación';
  }
  if (target.startsWith('FLAG:')) {
    const f = target.slice(5).replace(/_\[actor\]$/, '');
    if (f.startsWith('reunido_')) return 'Canal de diálogo abierto';
    if (f.startsWith('acuerdo_')) return 'Acuerdo vigente';
    return FLAG_LABELS[f] ?? f.replace(/_/g, ' ');
  }
  if (target.startsWith('COSTO_MULT:')) return 'Costo de obras';
  switch (target) {
    case 'CAJA': return 'Caja';
    case 'DEUDA': return 'Deuda';
    case 'GASTO_CORR': return 'Gasto corriente';
    case 'DESANCLAJE': return 'Expectativas de inflación';
    case 'INGRESO_MULT': return 'Recaudación';
    case 'LEG': return 'Apoyo legislativo';
    case 'GOB': return 'Gobernabilidad';
    case 'imagen': return 'Imagen presidencial';
    default: return target;
  }
}

/** ¿El cambio es bueno o malo para el gobierno/país? */
export function toneOf(target: string, value: number): Tone {
  if (value === 0) return 'neutral';
  let dir: number;
  if (isIndicatorId(target)) dir = INDICATORS[target].goodDirection;
  else if (['DEUDA', 'GASTO_CORR', 'DESANCLAJE'].includes(target)) dir = -1;
  else if (target.startsWith('FLAG:') || target.startsWith('COSTO_MULT:')) dir = 0;
  else dir = 1;
  if (dir === 0) return 'neutral';
  return Math.sign(value) === dir ? 'good' : 'bad';
}

export function arrows(value: number): string {
  const a = Math.abs(value);
  const n = a >= 7 ? 3 : a >= 3.5 ? 2 : 1;
  return (value > 0 ? '↑' : '↓').repeat(n);
}

export interface EffectChip {
  label: string;
  text: string;
  tone: Tone;
}

/** Chip legible para un efecto: dinero en $, el resto con flechas. */
export function effectChip(target: string, value: number): EffectChip {
  const tone = toneOf(target, value);
  if (target === 'CAJA' || target === 'DEUDA' || target === 'GASTO_CORR') {
    const money = `${value > 0 ? '+' : '−'}${fmtBudget(Math.abs(value))}`;
    return { label: targetLabel(target), text: target === 'GASTO_CORR' ? `${money}/turno` : money, tone };
  }
  if (target === 'INGRESO_MULT') {
    return { label: 'Recaudación', text: `${value > 0 ? '+' : ''}${Math.round(value * 100)}%`, tone: value > 0 ? 'good' : 'bad' };
  }
  if (target.startsWith('FLAG:') || target.startsWith('COSTO_MULT:')) {
    return { label: targetLabel(target), text: value ? 'activa' : 'termina', tone: 'neutral' };
  }
  return { label: targetLabel(target), text: arrows(value), tone };
}

// ─────────────────────────────── Bandas cualitativas ───────────────────────────────

export function indicatorBand(id: IndicatorId, v: number): { label: string; tone: Tone } {
  switch (id) {
    case 'INFL':
      if (v < 30) return { label: 'Baja', tone: 'good' };
      if (v < 45) return { label: 'Moderada', tone: 'good' };
      if (v < 60) return { label: 'Alta', tone: 'neutral' };
      if (v < 78) return { label: 'Muy alta', tone: 'bad' };
      return { label: 'Descontrolada', tone: 'bad' };
    case 'CONF':
      if (v < 25) return { label: 'Paz social', tone: 'good' };
      if (v < 40) return { label: 'Tensión baja', tone: 'good' };
      if (v < 55) return { label: 'Tensión', tone: 'neutral' };
      if (v < 70) return { label: 'Conflicto alto', tone: 'bad' };
      return { label: 'Estallido', tone: 'bad' };
    case 'PRES':
      if (v < 40) return { label: 'Baja', tone: 'neutral' };
      if (v < 55) return { label: 'Media', tone: 'neutral' };
      if (v < 68) return { label: 'Alta', tone: 'neutral' };
      return { label: 'Muy alta', tone: 'bad' };
    case 'SOLV':
      if (v < 25) return { label: 'Riesgo país extremo', tone: 'bad' };
      if (v < 40) return { label: 'Riesgo país alto', tone: 'bad' };
      if (v < 55) return { label: 'Riesgo país medio', tone: 'neutral' };
      return { label: 'Riesgo país bajo', tone: 'good' };
    default:
      if (v < 30) return { label: 'Crítico', tone: 'bad' };
      if (v < 42) return { label: 'Débil', tone: 'bad' };
      if (v < 55) return { label: 'Normal', tone: 'neutral' };
      if (v < 68) return { label: 'Bueno', tone: 'good' };
      return { label: 'Muy bueno', tone: 'good' };
  }
}

/** Índice de inflación → % mensual orientativo (01_INDICADORES: 20≈1%, 40≈3%, 60≈6%, 80≈12%, 95≈50%). */
export function inflationMonthly(v: number): string {
  const pts: [number, number][] = [[0, 0.2], [20, 1], [40, 3], [60, 6], [80, 12], [95, 50], [100, 80]];
  for (let i = 1; i < pts.length; i++) {
    const [x0, y0] = pts[i - 1];
    const [x1, y1] = pts[i];
    if (v <= x1) {
      const y = y0 + ((v - x0) / (x1 - x0)) * (y1 - y0);
      return `~${y < 10 ? y.toFixed(1) : Math.round(y)}% mensual`;
    }
  }
  return '>50% mensual';
}

export function satisfactionBand(sat: number): { label: string; tone: Tone } {
  if (sat < 30) return { label: 'Muy descontentos', tone: 'bad' };
  if (sat < 42) return { label: 'Descontentos', tone: 'bad' };
  if (sat < 55) return { label: 'Divididos', tone: 'neutral' };
  if (sat < 67) return { label: 'Conformes', tone: 'good' };
  return { label: 'Muy conformes', tone: 'good' };
}

export function relationBand(rel: number): string {
  if (rel < 25) return 'Rota';
  if (rel < 40) return 'Tensa';
  if (rel < 55) return 'Correcta';
  if (rel < 70) return 'Buena';
  return 'Estrecha';
}

export function toneClass(tone: Tone): string {
  return tone === 'good' ? 'text-emerald-400' : tone === 'bad' ? 'text-red-400' : 'text-amber-300';
}

export function toneChipClass(tone: Tone): string {
  return tone === 'good'
    ? 'text-emerald-300 border-emerald-400/25 bg-emerald-400/8'
    : tone === 'bad'
      ? 'text-red-300 border-red-400/25 bg-red-400/8'
      : 'text-sky-300 border-sky-400/25 bg-sky-400/8';
}

// ─────────────────────────────── Preocupaciones de actores ───────────────────────────────

const WORRY: Record<string, string> = {
  INFL: 'la inflación', ACTV: 'la caída de la actividad y el empleo', PODA: 'la pérdida de poder adquisitivo',
  INVC: 'la falta de inversión y crédito', PRES: 'la presión impositiva', SOLV: 'el desorden fiscal',
  EXTE: 'la escasez de dólares', INFR: 'el deterioro de la infraestructura', EDUC: 'el deterioro educativo',
  PSOC: 'la falta de contención social', SEGU: 'la inseguridad', CIEN: 'el desfinanciamiento de la ciencia',
  INST: 'el deterioro institucional', AMBI: 'el daño ambiental', CONF: 'la conflictividad en la calle',
  APRO: 'la baja aprobación del gobierno',
};

const PRAISE: Record<string, string> = {
  INFL: 'la desaceleración de la inflación', ACTV: 'la recuperación de la actividad', PODA: 'la mejora del salario real',
  INVC: 'el acceso al crédito', PRES: 'el alivio impositivo', SOLV: 'el orden fiscal',
  EXTE: 'la disponibilidad de divisas', INFR: 'las obras de infraestructura', EDUC: 'el funcionamiento educativo',
  PSOC: 'la red de protección social', SEGU: 'las mejoras en seguridad', CIEN: 'el impulso a la ciencia',
  INST: 'el respeto a las instituciones', AMBI: 'el cuidado ambiental', CONF: 'la paz social',
  APRO: 'el apoyo popular al gobierno',
};

function joinAnd(items: string[]): string {
  if (items.length <= 1) return items[0] ?? '';
  return `${items.slice(0, -1).join(', ')} y ${items[items.length - 1]}`;
}

/** "Preocupados principalmente por la inflación y la pérdida de poder adquisitivo." */
export function concernSentence(state: CausalState, actor: ActorId): string {
  const { worst, best } = concerns(state, actor, state.turn - 1);
  const w = worst.map((c: Contribution) => WORRY[c.indicator] ?? c.indicator);
  const parts: string[] = [];
  if (w.length > 0) parts.push(`Preocupados principalmente por ${joinAnd(w)}.`);
  if (best) parts.push(`Valoran ${PRAISE[best.indicator] ?? best.indicator}.`);
  if (parts.length === 0) parts.push('Sin reclamos urgentes por ahora.');
  return parts.join(' ');
}

// ─────────────────────────────── Resumen de efectos de una acción ───────────────────────────────

export interface TimedEffect {
  when: string;
  chips: EffectChip[];
}

function timingLabel(row: EffectRow): string {
  const d = typeof row.duration === 'number' ? row.duration : 0;
  const everyTurn = row.kind === 'PERSISTENT' || (row.mode === 'DELTA' && d > 1 && d < 99);
  if (row.duration === 'PERM' || (row.target === 'GASTO_CORR')) return row.offset === 0 ? 'Permanente' : `Permanente desde ${row.offset} t`;
  if (row.duration === 99) return 'Mientras dure';
  if (row.mode === 'BONUS') return row.offset === 0 ? `Temporal (${d} t)` : `En ${row.offset} t, temporal`;
  if (everyTurn) return row.offset === 0 ? `Durante ${d} t` : `En ${row.offset} t, durante ${d} t`;
  return row.offset === 0 ? 'Ahora' : `En ${row.offset} t`;
}

/**
 * Efectos principales de una acción agrupados por momento (sin condicionales
 * ni penalidades por repetición, que se describen aparte).
 */
export function actionTimeline(actionId: string): TimedEffect[] {
  const rows = (EFFECTS_BY_ACTION[actionId] ?? []).filter(r => r.kind !== 'CONDITIONAL' && r.kind !== 'REPETITION' && r.magnitude !== null);
  const groups = new Map<string, EffectChip[]>();
  const order: string[] = [];
  for (const r of rows) {
    if (r.target.startsWith('FLAG:reunido') || r.target.startsWith('REL:[actor]')) continue;
    const when = timingLabel(r);
    if (!groups.has(when)) { groups.set(when, []); order.push(when); }
    groups.get(when)!.push(effectChip(r.target, r.magnitude!));
  }
  const rank = (w: string) => (w === 'Ahora' ? 0 : w.startsWith('Temporal') ? 1 : w.startsWith('Durante') ? 2 : w.startsWith('En') ? 3 : w === 'Mientras dure' ? 4 : 5);
  return order.sort((a, b) => rank(a) - rank(b)).map(when => ({ when, chips: groups.get(when)! }));
}

/** Frases de contexto: qué cambia según la situación o si se repite. */
export function actionContextNotes(actionId: string): { conditional: string[]; repetition: string[] } {
  const rows = EFFECTS_BY_ACTION[actionId] ?? [];
  const uniq = (xs: (string | null)[]) => Array.from(new Set(xs.filter((x): x is string => !!x)));
  return {
    conditional: uniq(rows.filter(r => r.kind === 'CONDITIONAL').map(r => r.explanation)),
    repetition: uniq(rows.filter(r => r.kind === 'REPETITION').map(r => r.explanation)),
  };
}

/** Actores que más sentirían la acción (vía los indicadores que mueve y lo que mira cada uno). */
export function affectedActors(actionId: string, sensitivities: Record<ActorId, { target: string; s: number }[]>): { winners: ActorId[]; losers: ActorId[] } {
  const rows = (EFFECTS_BY_ACTION[actionId] ?? []).filter(r => r.kind !== 'CONDITIONAL' && r.kind !== 'REPETITION' && isIndicatorId(r.target) && r.magnitude !== null);
  const score = {} as Record<ActorId, number>;
  for (const [actor, sens] of Object.entries(sensitivities) as [ActorId, { target: string; s: number }[]][]) {
    let sc = 0;
    for (const r of rows) {
      const s = sens.find(x => x.target === r.target);
      if (!s) continue;
      const dur = r.kind === 'PERSISTENT' && typeof r.duration === 'number' ? Math.min(4, r.duration) : 1;
      sc += s.s * (r.magnitude as number) * dur;
    }
    score[actor] = sc;
  }
  const sorted = (Object.entries(score) as [ActorId, number][]).filter(([, v]) => Math.abs(v) >= 8);
  return {
    winners: sorted.filter(([, v]) => v > 0).sort((a, b) => b[1] - a[1]).slice(0, 3).map(([a]) => a),
    losers: sorted.filter(([, v]) => v < 0).sort((a, b) => a[1] - b[1]).slice(0, 3).map(([a]) => a),
  };
}
