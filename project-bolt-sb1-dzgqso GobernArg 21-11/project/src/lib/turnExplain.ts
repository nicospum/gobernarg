/**
 * Explicación del turno a partir del TurnRecord del motor causal:
 * qué cambió en el país y por qué (acciones, reglas, canales), cómo
 * reaccionaron los actores y por qué. Sin números internos.
 */
import {
  ACTOR_IDS,
  ACTORS,
  CAUSAL_ACTIONS_BY_ID,
  INDICATOR_IDS,
  INDICATORS,
  SENSITIVITIES,
  getPlatform,
  isIndicatorId,
  type ActorId,
  type IndicatorId,
} from '@/data/causal';
import type { TurnRecord } from '@/engine/causal';

const RULE_TEXT: Record<string, string> = {
  R01: 'expectativas y fundamentos de la inflación',
  R02: 'la inflación se comió los salarios',
  R03: 'el empleo recompuso salarios',
  R04: 'la inversión se volvió actividad',
  R05: 'la infraestructura ayudó a producir',
  R06: 'el conflicto frenó la economía',
  R07: 'la falta de dólares',
  R08: 'el clima de inversión',
  R09: 'desgaste sin mantenimiento',
  R10: 'deterioro sin inversión educativa',
  R11: 'la educación alimenta la ciencia',
  R12: 'exportaciones de conocimiento',
  R13: 'el desempleo presiona la red social',
  R14: 'exclusión y empleo',
  R15: 'la calle se calma sola o la exclusión la enciende',
  R16: 'presión sobre los recursos',
  R17: 'dolarización',
  R18: 'las instituciones vuelven a su cauce',
  R19: 'las cuentas públicas',
};

export interface Cause {
  text: string;
  delta: number;
}

export interface IndicatorChange {
  id: IndicatorId;
  name: string;
  delta: number;
  causes: Cause[];
}

/** Indicadores que más cambiaron y sus causas principales. */
export function indicatorChanges(record: TurnRecord, max = 5): IndicatorChange[] {
  const out: IndicatorChange[] = [];
  for (const id of INDICATOR_IDS) {
    const delta = record.indicatorsAfter[id] - record.indicatorsBefore[id];
    if (Math.abs(delta) < 0.5) continue;
    const bySource = new Map<string, number>();
    for (const a of record.applied) {
      if (a.target !== id) continue;
      const name = a.actionId && CAUSAL_ACTIONS_BY_ID[a.actionId] ? CAUSAL_ACTIONS_BY_ID[a.actionId].name : a.explanation || 'efectos en curso';
      const label = a.originTurn !== undefined && a.originTurn < record.turn ? `${name} (decisión anterior)` : name;
      bySource.set(label, (bySource.get(label) ?? 0) + a.delta);
    }
    for (const r of record.rules) {
      if (r.target !== id) continue;
      const label = RULE_TEXT[r.ruleId] ?? r.ruleId;
      bySource.set(label, (bySource.get(label) ?? 0) + r.delta);
    }
    for (const ch of record.channelsApplied) {
      if (ch.target !== id) continue;
      bySource.set(ch.label, (bySource.get(ch.label) ?? 0) + ch.value);
    }
    const causes = [...bySource.entries()]
      .map(([text, d]) => ({ text, delta: d }))
      .filter(c => Math.sign(c.delta) === Math.sign(delta) && Math.abs(c.delta) >= 0.3)
      .sort((a, b) => Math.abs(b.delta) - Math.abs(a.delta))
      .slice(0, 2);
    out.push({ id, name: INDICATORS[id].name, delta, causes });
  }
  return out.sort((a, b) => Math.abs(b.delta) - Math.abs(a.delta)).slice(0, max);
}

export interface ActorReaction {
  actor: ActorId;
  name: string;
  delta: number;
  reason: string | null;
}

const REASON: Record<string, [string, string]> = {
  // [si mejora para el actor, si empeora]
  INFL: ['la baja de la inflación', 'la inflación'],
  ACTV: ['la actividad', 'la caída de la actividad'],
  PODA: ['la mejora del salario real', 'la pérdida de poder adquisitivo'],
  INVC: ['el crédito y la inversión', 'la falta de crédito e inversión'],
  PRES: ['el alivio impositivo', 'la presión impositiva'],
  SOLV: ['el orden fiscal', 'el desorden fiscal'],
  EXTE: ['las divisas', 'la escasez de dólares'],
  INFR: ['las obras', 'el deterioro de la infraestructura'],
  EDUC: ['la educación', 'el deterioro educativo'],
  PSOC: ['la protección social', 'la falta de contención social'],
  SEGU: ['la seguridad', 'la inseguridad'],
  CIEN: ['la ciencia', 'el desfinanciamiento científico'],
  INST: ['las instituciones', 'el deterioro institucional'],
  AMBI: ['el ambiente', 'el daño ambiental'],
  CONF: ['la paz social', 'la conflictividad'],
  APRO: ['el apoyo al gobierno', 'la caída del gobierno en las encuestas'],
};

/** Actores cuya satisfacción más cambió y el indicador que más lo explica. */
export function actorReactions(record: TurnRecord, platformId: string, max = 4): ActorReaction[] {
  const out: ActorReaction[] = [];
  for (const a of ACTOR_IDS) {
    const delta = record.actorsAfter[a].sat - record.actorsBefore[a].sat;
    if (Math.abs(delta) < 0.6) continue;
    let best: { ind: string; score: number } | null = null;
    const sens = SENSITIVITIES[a].map(s => {
      if (s.target.startsWith('PLATAFORMA_')) {
        const it = getPlatform(platformId).items[Number(s.target.slice(-1)) - 1];
        return it ? { target: it.indicator as string, s: it.s } : { target: 'APRO', s: 0 };
      }
      return { target: s.target as string, s: s.s };
    });
    for (const s of sens) {
      let d = 0;
      if (isIndicatorId(s.target)) d = record.indicatorsAfter[s.target] - record.indicatorsBefore[s.target];
      else if (s.target === 'APRO') d = record.politicalAfter.apro - record.politicalBefore.apro;
      const score = s.s * d;
      if (Math.sign(score) !== Math.sign(delta)) continue;
      if (!best || Math.abs(score) > Math.abs(best.score)) best = { ind: s.target, score };
    }
    const reason = best ? REASON[best.ind]?.[delta > 0 ? 0 : 1] ?? null : null;
    out.push({ actor: a, name: ACTORS[a].shortName, delta, reason });
  }
  return out.sort((x, y) => Math.abs(y.delta) - Math.abs(x.delta)).slice(0, max);
}
