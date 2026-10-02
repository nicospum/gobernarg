import { describe, expect, it } from 'vitest';
import { ACTOR_IDS, ACTORS, CAUSAL_ACTIONS, INDICATOR_IDS } from '../data/causal';
import { ACTION_PLAYER_NOTES, ACTION_RISK_TEXT, ACTOR_POWER_TEXT } from '../data/causal/playerTexts';
import { actionContextNotes, actionTimeline } from '../lib/causalText';
import { fmtBudget, fmtBudgetDelta, fmtPct } from '../lib/format';

/** Siglas del motor (INFL, EXTE, GASTO_CORR, PA…) y jerga de diseño que el jugador no debe ver. */
const ENGINE_CODES = new RegExp(`\\b(${[...INDICATOR_IDS, 'PA', 'LEY', 'LEG', 'BONUS', 'GASTO_CORR', 'IV', 'APRO', 'GOB'].join('|')})\\b`);
const DESIGN_WORDS = /antagonismo|saliencia|\bbonus\b|\btrigger\b/i;

function visibleTexts(): [string, string][] {
  const out: [string, string][] = [];
  for (const a of CAUSAL_ACTIONS) {
    out.push([`${a.id}: nota`, ACTION_PLAYER_NOTES[a.id] ?? a.strategic ?? '']);
    out.push([`${a.id}: descripción`, a.description ?? '']);
    const risk = ACTION_RISK_TEXT[a.id] ?? a.risksText;
    if (risk) out.push([`${a.id}: riesgo`, risk]);
    const notes = actionContextNotes(a.id);
    for (const n of [...notes.conditional, ...notes.repetition]) out.push([`${a.id}: nota de contexto`, n]);
    for (const t of actionTimeline(a.id)) for (const c of t.chips) out.push([`${a.id}: efecto`, `${c.label} ${c.text}`]);
  }
  for (const id of ACTOR_IDS) out.push([`${id}: poder`, ACTOR_POWER_TEXT[id] ?? ACTORS[id].channelMain]);
  return out;
}

describe('Glosario: el jugador no ve siglas del motor', () => {
  it('hay texto para el jugador en cada acción y cada actor', () => {
    expect(CAUSAL_ACTIONS.filter(a => !ACTION_PLAYER_NOTES[a.id]).map(a => a.id)).toEqual([]);
    expect(ACTOR_IDS.filter(id => !ACTOR_POWER_TEXT[id])).toEqual([]);
  });

  it('ningún texto visible usa siglas ni jerga de diseño', () => {
    const bad = visibleTexts().filter(([, t]) => ENGINE_CODES.test(t) || DESIGN_WORDS.test(t));
    expect(bad).toEqual([]);
  });
});

describe('Glosario: montos y porcentajes en formato argentino', () => {
  it('millones con punto de miles y "M"', () => {
    expect(fmtBudget(2200)).toBe('$2.200 M');
    expect(fmtBudget(250)).toBe('$250 M');
    expect(fmtBudget(-50)).toBe('−$50 M');
    expect(fmtBudgetDelta(150)).toBe('+$150 M');
    expect(fmtBudgetDelta(0)).toBe('$0 M');
  });

  it('coma decimal', () => {
    expect(fmtPct(57.63, 1)).toBe('57,6 %');
  });
});
