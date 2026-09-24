/**
 * Estrategias de juego automatizadas para el playtest (Fase 7).
 * Cada bot decide como lo haría un jugador con esa estrategia, usando SOLO
 * la información que el juego le muestra (disponibilidad, pedidos revelados,
 * bandas de indicadores) y las mismas funciones que la UI.
 */
import type { GameState, MidtermStrategy } from '../types/game';
import type { GameEvent } from '../systems/events/types';
import {
  ACTOR_IDS,
  ACTORS,
  EFFECTS_BY_ACTION,
  INDICATORS,
  isIndicatorId,
  isOrganized,
  type ActorId,
  type IndicatorId,
} from '../data/causal';
import { canMeet, canNegotiate, canSignAgreement, effective, projectedCloseCaja, viewRef } from '../engine/causal';
import { getPolicyAvailability } from '../engine/actionEngine';
import { eventChoiceEffects } from '../engine/eventResolver';
import { toneOf } from '../lib/causalText';

export type Interaction = { actor: ActorId; kind: 'reunion' | 'negociar' | 'acuerdo' | 'encuesta' };

export interface Bot {
  id: string;
  name: string;
  description: string;
  archetype: 'politico' | 'empresario' | 'sindicalista' | 'comunicador';
  /** Interacciones con actores antes de elegir políticas (se ejecutan en orden). */
  interactions(state: GameState): Interaction[];
  /** Políticas deseadas en orden de prioridad (el runner agrega las que entren). */
  policies(state: GameState): string[];
  eventChoice(state: GameState, event: GameEvent): string;
  midterm(state: GameState, available: MidtermStrategy[]): MidtermStrategy;
  advisors?(state: GameState): string[];
  /** Respeta la proyección de caja al cierre (no elige lo que deja la caja en rojo). */
  fiscalGuard?: boolean;
  /** Evita acciones con aviso de uso reiterado. */
  avoidRepetition?: boolean;
}

const view = (s: GameState, id: IndicatorId) => effective(s.causal, id, viewRef(s.causal));

function firstChoice(_s: GameState, e: GameEvent): string {
  return e.choices?.[0]?.id ?? '';
}

/** Elige la opción con mejor balance de efectos (tono bueno − malo). */
function bestChoice(_s: GameState, e: GameEvent): string {
  let best = e.choices?.[0]?.id ?? '';
  let bestScore = -Infinity;
  for (const c of e.choices ?? []) {
    const effs = eventChoiceEffects(e, c.id);
    let score = 0;
    for (const f of effs) {
      const t = toneOf(f.target, f.value);
      const w = f.target === 'CAJA' ? Math.abs(f.value) / 150 : Math.abs(f.value) / 3;
      score += t === 'good' ? w : t === 'bad' ? -w : 0;
    }
    if (score > bestScore) { bestScore = score; best = c.id; }
  }
  return best;
}

function available(state: GameState): Set<string> {
  return new Set(getPolicyAvailability(state).filter(a => a.available).map(a => a.action.id));
}

// ─────────────────────────── A: pasivo ───────────────────────────
export const passiveBot: Bot = {
  id: 'A', name: 'Jugador pasivo', archetype: 'politico',
  description: 'Hace muy pocas políticas (una barata cada dos turnos) y casi no interactúa con actores.',
  interactions: () => [],
  policies: (s) => ((s.causal.turn % 2 === 0) ? ['mantenimiento_infraestructura', 'asistencia_alimentaria'] : []),
  eventChoice: firstChoice,
  midterm: (_s, av) => av[0],
};

// ─────────────────────────── B: emisor ───────────────────────────
export const printerBot: Bot = {
  id: 'B', name: 'Abusa de la emisión', archetype: 'politico',
  description: 'Emite dinero cada turno para financiar salarios, subsidios y programas sociales.',
  interactions: () => [],
  policies: () => ['emitir_dinero', 'aumento_salarial', 'cobertura_social', 'congelar_tarifas', 'bono_jubilados'],
  eventChoice: firstChoice,
  midterm: (_s, av) => av[0],
};

// ─────────────────────────── C: endeudador ───────────────────────────
export const debtBot: Bot = {
  id: 'C', name: 'Se endeuda', archetype: 'empresario',
  description: 'Toma deuda interna y externa cada vez que puede y la usa para gasto y obras.',
  interactions: () => [],
  policies: () => ['prestamo_internacional', 'prestamo_local', 'aumento_salarial', 'cobertura_social', 'plan_viviendas', 'salud_preventiva', 'inversion_educativa'],
  eventChoice: firstChoice,
  midterm: (_s, av) => av[0],
};

// ─────────────────────────── D: obra pública ───────────────────────────
export const infraBot: Bot = {
  id: 'D', fiscalGuard: true, avoidRepetition: true, name: 'Obra pública', archetype: 'politico',
  description: 'Invierte agresivamente en infraestructura: estudios, rutas, energía, agua, hospitales; cuida a los gobernadores.',
  interactions: (s) => {
    const c = s.causal;
    const out: Interaction[] = [];
    if (canSignAgreement(c, 'gobernadores') === null) out.push({ actor: 'gobernadores', kind: 'acuerdo' });
    if (canNegotiate(c, 'gobernadores', s.actions) === null) out.push({ actor: 'gobernadores', kind: 'negociar' });
    if (canMeet(c, 'gobernadores', s.actions) === null) out.push({ actor: 'gobernadores', kind: 'reunion' });
    return out;
  },
  policies: () => ['estudio_factibilidad', 'infraestructura_vial', 'infraestructura_energetica', 'obras_hidricas', 'energia_renovable', 'construccion_hospitales', 'mantenimiento_infraestructura', 'transferencias_provincias', 'plan_viviendas'],
  eventChoice: bestChoice,
  midterm: (_s, av) => (av.includes('acelerar') ? 'acelerar' : av[0]),
  advisors: () => ['advisor3'],
};

// ─────────────────────────── E: técnico sin reuniones ───────────────────────────
function technocraticPolicies(s: GameState): string[] {
  const infl = view(s, 'INFL');
  const out: string[] = [];
  if (infl >= 55) out.push('politica_monetaria_contractiva');
  if (s.causal.caja < 600) out.push('mejorar_recaudacion', 'reduccion_gasto');
  if (view(s, 'EXTE') < 40) out.push('incentivos_exportacion', 'bajar_retenciones');
  out.push('credito_pyme', 'inversion_educativa', 'financiamiento_ciencia', 'prevencion_comunitaria', 'salud_preventiva', 'estudio_factibilidad', 'infraestructura_vial', 'mantenimiento_infraestructura', 'transparencia_anticorrupcion', 'fortalecimiento_justicia');
  return out;
}

export const technocratBot: Bot = {
  id: 'E', fiscalGuard: true, avoidRepetition: true, name: 'Técnico que ignora a los grupos', archetype: 'empresario',
  description: 'Buenas decisiones técnicas (tasas con inflación alta, recaudación, crédito, educación, ciencia, prevención), sin reuniones ni negociaciones.',
  interactions: () => [],
  policies: technocraticPolicies,
  eventChoice: bestChoice,
  midterm: (_s, av) => av[0],
  advisors: () => ['advisor1'],
};

// ─────────────────────────── F: hipernegociador ───────────────────────────
function negotiatorInteractions(s: GameState): Interaction[] {
  const out: Interaction[] = [];
  const c = s.causal;
  const avail = available(s);
  const pending = c.agreements.filter(a => a.status === 'active').length;
  // Firma sólo lo que hoy podría cumplir, y reserva PA para cumplir lo firmado.
  for (const a of ACTOR_IDS) {
    if (!isOrganized(a)) continue;
    const d = c.actors[a].demand;
    if (canSignAgreement(c, a) === null && d && avail.has(d.actionId)) out.push({ actor: a, kind: 'acuerdo' });
  }
  let negotiations = 0;
  for (const a of ACTOR_IDS) {
    if (!isOrganized(a) || negotiations >= 1 || s.actions - pending <= 2) continue;
    if (canNegotiate(c, a, 99) === null) { out.push({ actor: a, kind: 'negociar' }); negotiations++; }
  }
  const byNeed = ACTOR_IDS.filter(isOrganized).sort((x, y) => (c.actors[x].rel ?? 0) - (c.actors[y].rel ?? 0));
  for (const a of byNeed) if (canMeet(c, a, 99) === null) out.push({ actor: a, kind: 'reunion' });
  out.push({ actor: 'clase_media', kind: 'encuesta' }, { actor: 'sectores_populares', kind: 'encuesta' });
  return out;
}

export const negotiatorBot: Bot = {
  id: 'F', fiscalGuard: true, avoidRepetition: true, name: 'Hipernegociador', archetype: 'politico',
  description: 'Se reúne con todos, negocia y firma acuerdos con todos; ejecuta lo que le piden.',
  interactions: negotiatorInteractions,
  policies: (s) => {
    const c = s.causal;
    const committed = c.agreements.filter(a => a.status === 'active').map(a => a.commitmentActionId);
    const demanded = ACTOR_IDS.map(a => c.actors[a].demand).filter(d => d && d.revealedTurn !== null).map(d => d!.actionId);
    return [...committed, ...demanded];
  },
  eventChoice: bestChoice,
  midterm: (_s, av) => (av.includes('negociar') ? 'negociar' : av[0]),
  advisors: () => ['advisor4', 'advisor2'],
};

// ─────────────────────────── G: rígido ───────────────────────────
export const rigidHeterodoxBot: Bot = {
  id: 'G1', name: 'Rígido heterodoxo', archetype: 'sindicalista',
  description: 'Todo el mandato las mismas recetas: salarios, subsidios, controles y transferencias, pase lo que pase.',
  interactions: (s) => (canMeet(s.causal, 'sindicatos', 1) === null ? [{ actor: 'sindicatos', kind: 'reunion' }] : []),
  policies: () => ['suba_salario_minimo', 'cobertura_social', 'congelar_tarifas', 'control_precios', 'aumento_salarial', 'subir_retenciones'],
  eventChoice: firstChoice,
  midterm: (_s, av) => (av.includes('acelerar') ? 'acelerar' : av[0]),
};

export const rigidOrthodoxBot: Bot = {
  id: 'G2', name: 'Rígido ortodoxo', archetype: 'empresario',
  description: 'Todo el mandato las mismas recetas: ajuste, tarifas, tasas, baja de impuestos, reformas pro-mercado.',
  interactions: (s) => (canMeet(s.causal, 'financiero', 1) === null ? [{ actor: 'financiero', kind: 'reunion' }] : []),
  policies: () => ['reduccion_gasto', 'actualizar_tarifas', 'politica_monetaria_contractiva', 'reduccion_impuestos', 'reforma_laboral', 'privatizacion', 'bajar_retenciones', 'dnu'],
  eventChoice: firstChoice,
  midterm: (_s, av) => (av.includes('acelerar') ? 'acelerar' : av[0]),
};

// ─────────────────────────── H: adaptable ───────────────────────────
/** Urgencia de un indicador según su banda (peor = más urgente). */
function urgency(s: GameState, id: IndicatorId): number {
  const v = view(s, id);
  const dir = INDICATORS[id].goodDirection;
  if (dir === 0) return 0.3;
  const badness = dir > 0 ? (55 - v) / 25 : (v - 40) / 25;
  return Math.max(0.2, 1 + badness);
}

function adaptiveScore(s: GameState, actionId: string, requested: Set<string>): number {
  let score = 0;
  for (const r of EFFECTS_BY_ACTION[actionId] ?? []) {
    if (r.magnitude === null || r.kind === 'CONDITIONAL' || r.kind === 'REPETITION') continue;
    if (!isIndicatorId(r.target)) continue;
    const dir = INDICATORS[r.target].goodDirection;
    const dur = r.kind === 'PERSISTENT' && typeof r.duration === 'number' ? Math.min(4, r.duration) : r.mode === 'BONUS' ? 0.5 : 1;
    score += dir * r.magnitude * dur * urgency(s, r.target);
    if (r.target === 'INFL' && r.magnitude > 0) score -= r.magnitude * 1.5 * (view(s, 'INFL') > 60 ? 2 : 1);
  }
  if (requested.has(actionId)) score += 4;
  return score;
}

export const adaptiveBot: Bot = {
  id: 'H', fiscalGuard: true, avoidRepetition: true, name: 'Adaptable', archetype: 'politico',
  description: 'Lee el contexto: se reúne con los actores más tensos, atiende sus pedidos si convienen, ataca los indicadores peor ubicados y cuida la caja.',
  interactions: (s) => {
    const c = s.causal;
    const out: Interaction[] = [];
    for (const a of ACTOR_IDS) if (isOrganized(a) && canSignAgreement(c, a) === null) out.push({ actor: a, kind: 'acuerdo' });
    const tense = ACTOR_IDS.filter(isOrganized)
      .sort((x, y) => (c.actors[x].sat + (c.actors[x].rel ?? 50)) * ACTORS[y].influence - (c.actors[y].sat + (c.actors[y].rel ?? 50)) * ACTORS[x].influence);
    const top = tense[0];
    if (canNegotiate(c, top, s.actions) === null && (c.actors[top].rel ?? 0) >= 45) out.push({ actor: top, kind: 'negociar' });
    if (canMeet(c, top, s.actions) === null) out.push({ actor: top, kind: 'reunion' });
    if (c.turn % 4 === 1) out.push({ actor: 'clase_media', kind: 'encuesta' });
    return out;
  },
  policies: (s) => {
    const c = s.causal;
    const avail = available(s);
    const requested = new Set(ACTOR_IDS.map(a => c.actors[a].demand).filter(d => d && d.revealedTurn !== null).map(d => d!.actionId));
    const committed = c.agreements.filter(a => a.status === 'active').map(a => a.commitmentActionId);
    const av = getPolicyAvailability(s).filter(a => avail.has(a.action.id) && !a.repetitionWarning);
    const lowCash = c.caja < 500;
    const scored = av
      .map(a => ({ id: a.action.id, score: adaptiveScore(s, a.action.id, requested) - (lowCash && a.caja < 0 ? Math.abs(a.caja) / 60 : 0) - (a.action.id === 'emitir_dinero' ? 6 : 0) - (a.action.id === 'dnu' ? 8 : 0) }))
      .filter(x => x.score > 1)
      .sort((x, y) => y.score - x.score)
      .map(x => x.id);
    const out = [...committed, ...scored];
    // Déficit estructural a la vista: primero medidas de ingresos/gasto.
    const structural = projectedCloseCaja(c, []).structural;
    if (lowCash || structural < 0) {
      out.unshift('mejorar_recaudacion', 'subir_retenciones', 'actualizar_tarifas', 'reduccion_gasto');
    }
    return structural < 50 ? out.filter(id => !['reduccion_impuestos', 'bajar_retenciones', 'emitir_dinero'].includes(id)) : out;
  },
  eventChoice: bestChoice,
  midterm: (s, av) => {
    if (av.includes('negociar') && s.causal.political.leg < 50) return 'negociar';
    if (av.includes('abrirse')) return 'abrirse';
    return av[0];
  },
  advisors: () => ['advisor1', 'advisor4'],
};

/** Rígidos "moderados": la misma ideología, sin repetir hasta el castigo ni dejar la caja en rojo. */
export const rigidHeterodoxModerateBot: Bot = {
  ...rigidHeterodoxBot, id: 'G1b', name: 'Heterodoxo coherente', fiscalGuard: true, avoidRepetition: true,
  description: 'Mismo programa heterodoxo todo el mandato, pero sin abusar de cada herramienta ni dejar la caja en rojo.',
  policies: (s) => [...(view(s, 'EXTE') < 38 ? ['control_cambios', 'incentivos_exportacion'] : []), ...(s.causal.caja < 400 ? ['subir_retenciones', 'mejorar_recaudacion'] : []), 'suba_salario_minimo', 'cobertura_social', 'credito_pyme', 'congelar_tarifas', 'control_precios', 'aumento_salarial', 'promocion_industrial', 'asistencia_alimentaria', 'plan_viviendas'],
};

export const rigidOrthodoxModerateBot: Bot = {
  ...rigidOrthodoxBot, id: 'G2b', name: 'Ortodoxo coherente', fiscalGuard: true, avoidRepetition: true,
  description: 'Mismo programa ortodoxo todo el mandato, pero sin abusar de cada herramienta.',
  policies: () => ['reduccion_gasto', 'actualizar_tarifas', 'politica_monetaria_contractiva', 'reduccion_impuestos', 'reforma_laboral', 'privatizacion', 'bajar_retenciones', 'regimen_grandes_inversiones', 'transparencia_anticorrupcion'],
};

export const ALL_BOTS: Bot[] = [passiveBot, printerBot, debtBot, infraBot, technocratBot, negotiatorBot, rigidHeterodoxBot, rigidHeterodoxModerateBot, rigidOrthodoxBot, rigidOrthodoxModerateBot, adaptiveBot];

