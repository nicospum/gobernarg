/**
 * Vistas legibles de la agenda de efectos del motor causal: lo que viene
 * (efectos diferidos), lo que está corriendo (programas persistentes y
 * bonus temporales) y las condiciones vigentes (flags, estrategia).
 */
import { CAUSAL_ACTIONS_BY_ID, PARAMS } from '@/data/causal';
import { MIDTERM_CAUSAL } from '@/data/midtermStrategies';
import { FOREVER, viewRef, type CausalState } from '@/engine/causal';
import { effectChip, targetLabel, type EffectChip } from './causalText';

function sourceName(actionId: string): string {
  if (actionId === 'acuerdo') return 'Acuerdo con un actor';
  if (actionId.startsWith('evento:')) return 'Consecuencia de un evento';
  return CAUSAL_ACTIONS_BY_ID[actionId]?.name ?? actionId;
}

export interface UpcomingItem {
  key: string;
  title: string;
  origin: number;
  inTurns: number;
  chips: EffectChip[];
  positive: boolean;
}

/** Efectos que todavía no empezaron, agrupados por decisión y momento. */
export function upcomingEffects(c: CausalState): UpcomingItem[] {
  const groups = new Map<string, UpcomingItem>();
  for (const e of c.agenda) {
    if (e.start < c.turn) continue;
    if (e.mode === 'SET') continue;
    const key = `${e.actionId}.${e.originTurn}.${e.start}`;
    const chip = effectChip(e.target, e.magnitude);
    const g = groups.get(key) ?? { key, title: sourceName(e.actionId), origin: e.originTurn, inTurns: e.start - c.turn + 1, chips: [], positive: true };
    g.chips.push(e.everyTurn && e.end > e.start && e.end < FOREVER ? { ...chip, text: `${chip.text} ×${e.end - e.start + 1}t` } : chip);
    groups.set(key, g);
  }
  for (const g of groups.values()) g.positive = g.chips.filter(c2 => c2.tone === 'good').length >= g.chips.filter(c2 => c2.tone === 'bad').length;
  return [...groups.values()].sort((a, b) => a.inTurns - b.inTurns);
}

export interface RunningItem {
  key: string;
  title: string;
  detail: string;
  done: number;
  total: number;
  positive: boolean;
}

/** Programas persistentes en curso y bonus temporales vigentes. */
export function runningEffects(c: CausalState): RunningItem[] {
  const ref = viewRef(c);
  const out: RunningItem[] = [];
  const persistent = new Map<string, RunningItem>();
  for (const e of c.agenda) {
    if (!e.everyTurn || e.start >= c.turn) continue;
    const total = e.end >= FOREVER ? 0 : e.end - e.start + 1;
    const key = `${e.actionId}.${e.originTurn}`;
    const chip = effectChip(e.target, e.magnitude);
    const item = persistent.get(key) ?? {
      key, title: sourceName(e.actionId), detail: '', done: Math.max(0, c.turn - e.start), total, positive: chip.tone !== 'bad',
    };
    item.detail = item.detail ? `${item.detail} · ${chip.label} ${chip.text}` : `${chip.label} ${chip.text} cada turno`;
    persistent.set(key, item);
  }
  out.push(...persistent.values());
  for (const b of c.bonuses) {
    if (b.start > ref || b.end < ref) continue;
    const chip = effectChip(b.target, b.value);
    const remaining = b.end - ref;
    out.push({
      key: b.id,
      title: sourceName(b.source.replace(/^channel:/, '')),
      detail: `${chip.label} ${chip.text} (temporal${remaining > 0 ? `, ${remaining} turno${remaining > 1 ? 's' : ''} más` : ', último turno'})`,
      done: ref - b.start + 1,
      total: b.end - b.start + 1,
      positive: chip.tone !== 'bad',
    });
  }
  return out;
}

export interface ConditionItem {
  key: string;
  label: string;
  detail: string;
  turnsLeft: number | null;
}

const FLAG_DETAIL: Record<string, string> = {
  estudio_vigente: 'Habilita grandes obras y las abarata un 20%.',
  cepo: 'Frena la salida de dólares pero desalienta la inversión cada turno.',
  pacto_social: 'Modera precios y salarios. Emitir o devaluar lo rompe.',
  ley_ambiental: 'Mitiga el daño de proyectos extractivos.',
  meta_fiscal: 'El organismo revisa el resultado fiscal al vencer.',
  rigi: 'Potencia proyectos energéticos y mineros.',
  mant_activo: 'La infraestructura no se deprecia.',
  crisis_energetica: 'Permite obras energéticas de emergencia sin estudio previo.',
  fuga_cerebros: 'Los científicos se van: la ciencia pierde capacidad cada turno.',
};

/** Condiciones vigentes: flags, luna de miel y estrategia post-legislativa. */
export function activeConditions(c: CausalState): ConditionItem[] {
  const out: ConditionItem[] = [];
  const t = c.turn;
  for (const [name, f] of Object.entries(c.flags)) {
    if (!f.value || f.start > t || (f.end !== null && f.end < t)) continue;
    if (name.startsWith('reunido_') || name.startsWith('acuerdo_')) continue;
    out.push({ key: name, label: targetLabel(`FLAG:${name}`), detail: FLAG_DETAIL[name] ?? '', turnsLeft: f.end === null ? null : f.end - t + 1 });
  }
  const honeymoonLeft = PARAMS.LUNA_MIEL - (t - c.mandateStart);
  if (honeymoonLeft > 0) out.push({ key: 'luna_miel', label: 'Luna de miel', detail: 'El Congreso acompaña más las leyes.', turnsLeft: honeymoonLeft });
  for (const m of c.modifiers) {
    if (m.start > t || m.end < t) continue;
    const strategy = m.label.replace(' (rebote)', '') as keyof typeof MIDTERM_CAUSAL;
    const def = MIDTERM_CAUSAL[strategy];
    if (!def && !m.label) continue;
    out.push({
      key: m.id,
      label: m.label.includes('rebote') ? 'Rebote de la jugada audaz' : `Estrategia: ${m.label.replace('_', ' ')}`,
      detail: def ? def.bullets.join(' · ') : '',
      turnsLeft: m.end - t + 1,
    });
  }
  return out;
}
