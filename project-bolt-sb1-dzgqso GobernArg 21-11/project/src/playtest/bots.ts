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
  CAUSAL_ACTIONS_BY_ID,
  CRISIS_META,
  EFFECTS_BY_ACTION,
  INDICATORS,
  isIndicatorId,
  isOrganized,
  type ActorId,
  type IndicatorId,
} from '../data/causal';
import { canMeet, canNegotiate, canSignAgreement, decisionContext, effective, evalCondition, flagValue, projectedCloseCaja, viewRef, type Availability } from '../engine/causal';
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

// ─────────────────── G1c / G2c: programas bien jugados ───────────────────
/**
 * Interacciones de un programa "bien jugado": firma los acuerdos que puede con
 * su coalición, negocia con el socio de relación más baja y se reúne con el
 * que hace más tiempo que no ve (así mantiene a los tres "vistos" en los
 * últimos 4 turnos, que es lo que pide el pacto social).
 */
function coalitionInteractions(s: GameState, coalition: ActorId[]): Interaction[] {
  const c = s.causal;
  const out: Interaction[] = [];
  for (const a of coalition) if (canSignAgreement(c, a) === null) out.push({ actor: a, kind: 'acuerdo' });
  const lowest = [...coalition].sort((x, y) => (c.actors[x].rel ?? 50) - (c.actors[y].rel ?? 50))[0];
  if (canNegotiate(c, lowest, s.actions) === null && (c.actors[lowest].rel ?? 0) >= 40) out.push({ actor: lowest, kind: 'negociar' });
  const stalest = [...coalition].sort((x, y) => (c.actors[x].lastMeeting ?? -99) - (c.actors[y].lastMeeting ?? -99));
  for (const a of stalest.slice(0, 2)) if (canMeet(c, a, s.actions) === null) out.push({ actor: a, kind: 'reunion' });
  return out;
}

function committedActions(s: GameState): string[] {
  return s.causal.agreements.filter(a => a.status === 'active').map(a => a.commitmentActionId);
}

/**
 * Heterodoxo bien jugado: el mismo programa (salarios, crédito, industria,
 * protección), pero construye el pacto social con sindicatos, industria y
 * PyMEs, busca dólares con exportaciones y energía, y cuida la caja con
 * recaudación antes de gastar. Es la vara para medir la asimetría ideológica.
 */
export const heterodoxSkilledBot: Bot = {
  id: 'G1c', fiscalGuard: true, avoidRepetition: true, name: 'Heterodoxo bien jugado', archetype: 'sindicalista',
  description: 'Programa heterodoxo con acuerdos: pacto social, dólares por exportación y energía, recauda antes de gastar.',
  interactions: (s) => coalitionInteractions(s, ['sindicatos', 'industria', 'pymes']),
  policies: (s) => {
    const infl = view(s, 'INFL');
    const exte = view(s, 'EXTE');
    const structural = projectedCloseCaja(s.causal, []).structural;
    return [
      ...committedActions(s),
      'pacto_social',
      ...(exte < 45 ? ['incentivos_exportacion', 'desarrollo_energetico_minero'] : []),
      ...(exte < 32 ? ['control_cambios'] : []),
      ...(infl > 55 ? ['control_precios'] : []),
      ...(s.causal.caja < 500 || structural < 0 ? ['subir_retenciones', 'mejorar_recaudacion', 'reforma_tributaria'] : []),
      'credito_pyme', 'promocion_industrial',
      ...(infl < 60 ? ['suba_salario_minimo', 'cobertura_social'] : []),
      ...(infl < 50 ? ['aumento_salarial', 'plan_viviendas'] : []),
      'asistencia_alimentaria', 'inversion_educativa', 'salud_preventiva',
    ];
  },
  eventChoice: bestChoice,
  midterm: (s, av) => (av.includes('negociar') && s.causal.political.leg < 50 ? 'negociar' : av.includes('abrirse') ? 'abrirse' : av[0]),
};

/** Ortodoxo bien jugado: el espejo del anterior, con su coalición y sus herramientas. */
export const orthodoxSkilledBot: Bot = {
  id: 'G2c', fiscalGuard: true, avoidRepetition: true, name: 'Ortodoxo bien jugado', archetype: 'empresario',
  description: 'Programa ortodoxo con acuerdos: coalición con finanzas, industria y agro; dólares por apertura; ajusta antes de bajar impuestos.',
  interactions: (s) => coalitionInteractions(s, ['financiero', 'industria', 'agro']),
  policies: (s) => {
    const infl = view(s, 'INFL');
    const exte = view(s, 'EXTE');
    const structural = projectedCloseCaja(s.causal, []).structural;
    return [
      ...committedActions(s),
      ...(exte < 45 ? ['bajar_retenciones', 'prestamo_internacional'] : []),
      ...(exte < 32 ? ['devaluacion'] : []),
      ...(infl > 55 ? ['politica_monetaria_contractiva'] : []),
      ...(s.causal.caja < 500 || structural < 0 ? ['reduccion_gasto', 'actualizar_tarifas'] : []),
      'regimen_grandes_inversiones', 'transparencia_anticorrupcion', 'tratado_comercio',
      ...(structural > 50 ? ['reduccion_impuestos'] : []),
      'reforma_laboral', 'privatizacion', 'infraestructura_vial', 'economia_conocimiento',
    ];
  },
  eventChoice: bestChoice,
  midterm: (s, av) => (av.includes('negociar') && s.causal.political.leg < 50 ? 'negociar' : av.includes('abrirse') ? 'abrirse' : av[0]),
};

export const ALL_BOTS: Bot[] = [passiveBot, printerBot, debtBot, infraBot, technocratBot, negotiatorBot, rigidHeterodoxBot, rigidHeterodoxModerateBot, heterodoxSkilledBot, rigidOrthodoxBot, rigidOrthodoxModerateBot, orthodoxSkilledBot, adaptiveBot];

// ─────────────────────────── Bots de crisis (escenarios históricos) ───────────────────────────
/**
 * Corralito 2001 e Hiper 1989 con reglas nuevas: una emergencia de tres
 * subrondas con una medida extraordinaria por subronda y, después, la gestión
 * por trimestres con una extraordinaria por turno mientras sigan habilitadas.
 * Estos bots eligen la medida extraordinaria con una prioridad por escenario
 * (ortodoxo / heterodoxo) o por puntaje (adaptable) y, en la gestión, juegan
 * su programa regular. Durante la emergencia no interactúan con actores (el
 * bloque de emergencia no lo ofrece); en la gestión usan las interacciones de
 * los bots base. Fuera de los escenarios históricos juegan su programa regular.
 */
type CrisisKind = 'corralito' | 'hiper';

/** Entrada de una lista de prioridad: un id, o un id con una condición extra para elegirlo. */
type CrisisPick = string | { id: string; when: (s: GameState) => boolean };

const crisisKind = (s: GameState): CrisisKind | null => s.causal.crisis?.kind ?? null;
const inEmergency = (s: GameState): boolean => s.causal.crisis?.phase === 'emergencia';
const isExtraordinaryId = (id: string): boolean => !!CAUSAL_ACTIONS_BY_ID[id]?.extraordinary;

/** Medidas extraordinarias que se pueden tomar ahora (las del bloque de emergencia sin motivo de bloqueo). */
function extraordinaryAvailable(s: GameState): Availability[] {
  return getPolicyAvailability(s).filter(a => a.action.extraordinary && a.available);
}

/** Primera medida de la prioridad que está disponible y cumple su condición. */
function firstAvailable(s: GameState, priority: CrisisPick[]): string | null {
  const avail = new Set(extraordinaryAvailable(s).map(a => a.action.id));
  for (const p of priority) {
    const id = typeof p === 'string' ? p : p.id;
    if (!avail.has(id)) continue;
    if (typeof p !== 'string' && !p.when(s)) continue;
    return id;
  }
  return null;
}

/** Estado de sitio solo con la calle incendiada. */
const sitioIfStreetBurns: CrisisPick = { id: 'estado_de_sitio', when: s => view(s, 'CONF') >= 75 };

/** Ortodoxo bien jugado: contiene el hambre antes de reprimir, abre la economía solo con actividad y divisas, y libera los depósitos. */
const hungerFirst: CrisisPick = { id: 'emergencia_alimentaria', when: s => view(s, 'PSOC') < 38 || view(s, 'CONF') >= 75 };
const openIfStrong: CrisisPick = { id: 'apertura_total', when: s => view(s, 'ACTV') >= 38 && view(s, 'EXTE') >= 25 };
const ORTHODOX_EMERGENCY: Record<CrisisKind, CrisisPick[]> = {
  corralito: [
    'dolarizar', 'rescate_fmi', 'ley_emergencia', hungerFirst,
    // El corralito, solo cuando a los bancos ya les queda poca liquidez; liberar apenas se pueda.
    { id: 'limitar_retiros', when: s => (s.causal.crisis?.liquidez ?? 100) <= 30 },
    'liberar_depositos', 'negociar_deuda', openIfStrong, sitioIfStreetBurns,
  ],
  hiper: ['shock_fiscal', 'nueva_moneda', 'privatizar_todo', hungerFirst, 'negociar_deuda', 'rescate_fmi', { id: 'intervencion_total', when: s => view(s, 'EXTE') >= 25 }, openIfStrong, sitioIfStreetBurns],
};
/** Programa regular ortodoxo: no apila medidas recesivas con la actividad por el piso ni deja la olla vacía. */
function orthodoxRegular(s: GameState): string[] {
  const actv = view(s, 'ACTV');
  const out: string[] = [];
  if (view(s, 'PSOC') < 35) out.push('asistencia_alimentaria');
  if (view(s, 'INFL') >= 55 && !flagValue(s.causal, 'dolarizada', s.causal.turn)) out.push('politica_monetaria_contractiva');
  if (actv >= 30 || s.causal.caja < 300) out.push('reduccion_gasto', 'actualizar_tarifas');
  out.push('mejorar_recaudacion');
  if (actv < 35) out.push('credito_pyme');
  if (view(s, 'CONF') >= 70) out.push('seguridad_ciudadana');
  out.push('reforma_laboral', 'incentivos_exportacion');
  return out;
}

const HETERODOX_EMERGENCY: Record<CrisisKind, CrisisPick[]> = {
  // Liberar los depósitos va primero: se toma apenas aparece.
  corralito: ['liberar_depositos', 'limitar_retiros', 'salir_convertibilidad', 'pesificar', 'suspender_pagos', 'emergencia_alimentaria', 'cuasimonedas', 'ley_emergencia', 'negociar_deuda'],
  hiper: ['congelamiento_total', 'emergencia_alimentaria', 'acuerdo_transicion', 'intervencion_total', 'nueva_moneda', 'negociar_deuda', 'ley_emergencia'],
};
const HETERODOX_REGULAR: Record<CrisisKind, string[]> = {
  corralito: ['control_cambios', 'asistencia_alimentaria', 'pacto_social', 'suba_salario_minimo', 'subir_retenciones', 'control_precios', 'credito_pyme'],
  hiper: ['pacto_social', 'control_precios', 'asistencia_alimentaria', 'politica_monetaria_contractiva', 'mejorar_recaudacion', 'subir_retenciones'],
};

/**
 * Políticas del turno de un bot de crisis: la medida extraordinaria elegida va
 * primero (cuesta 0 PA, así no se queda sin acciones) y después el programa
 * regular. En la emergencia, solo la medida.
 */
function crisisPolicies(
  s: GameState,
  choose: (s: GameState, kind: CrisisKind) => string | null,
  regular: (s: GameState, kind: CrisisKind) => string[],
): string[] {
  const kind = crisisKind(s);
  if (!kind) return regular(s, 'corralito');
  const measure = choose(s, kind);
  if (inEmergency(s)) return measure ? [measure] : [];
  return [...(measure ? [measure] : []), ...regular(s, kind)];
}

/**
 * Con la deuda en default, renegociar exige un mínimo de solvencia (que el
 * default mismo hunde) o gestión diplomática reciente: los dos programas
 * hacen agenda internacional cada seis turnos mientras dure el default.
 */
function diplomacyIfDefault(s: GameState): string[] {
  return evalCondition('FLAG(default_deuda) and not DONE(agenda_internacional,6)', decisionContext(s.causal)) ? ['agenda_internacional'] : [];
}

/** Inacción: no toma ninguna medida extraordinaria; en la gestión juega como el pasivo. */
export const crisisInactionBot: Bot = {
  ...passiveBot, id: 'XI', name: 'Inacción',
  description: 'No toma ninguna medida extraordinaria, ni en la emergencia ni después; en la gestión juega como el pasivo (una política barata cada dos turnos).',
  policies: (s) => (inEmergency(s) ? [] : passiveBot.policies(s).filter(id => !isExtraordinaryId(id))),
};

export const crisisOrthodoxBot: Bot = {
  id: 'XO', fiscalGuard: true, avoidRepetition: true, name: 'Ortodoxo de crisis', archetype: 'empresario',
  description: 'Corralito: dolariza, pide el rescate al FMI, ley de emergencia y apertura; el corralito solo con los bancos sin liquidez. Hiper: shock fiscal, moneda nueva, privatiza todo y abre. En la gestión ajusta el gasto, actualiza tarifas, sube tasas, recauda y reforma, con la coalición de finanzas, industria y agro.',
  interactions: (s) => (inEmergency(s) ? [] : coalitionInteractions(s, ['financiero', 'industria', 'agro'])),
  policies: (s) => crisisPolicies(s, (st, kind) => firstAvailable(st, ORTHODOX_EMERGENCY[kind]), (st) => [...committedActions(st), ...diplomacyIfDefault(st), ...orthodoxRegular(st)]),
  eventChoice: bestChoice,
  midterm: orthodoxSkilledBot.midterm,
};

export const crisisHeterodoxBot: Bot = {
  id: 'XH', fiscalGuard: true, avoidRepetition: true, name: 'Heterodoxo de crisis', archetype: 'sindicalista',
  description: 'Corralito: corralito, salida de la convertibilidad, pesificación, default, emergencia alimentaria y cuasimonedas; libera los depósitos apenas puede. Hiper: congelamiento total, emergencia alimentaria, acuerdo de transición, intervención y moneda nueva. En la gestión controles, pacto social, salario mínimo, retenciones y crédito PyME, con la coalición de sindicatos, industria y PyMEs.',
  interactions: (s) => (inEmergency(s) ? [] : coalitionInteractions(s, ['sindicatos', 'industria', 'pymes'])),
  policies: (s) => crisisPolicies(s, (st, kind) => firstAvailable(st, HETERODOX_EMERGENCY[kind]), (st, kind) => [...committedActions(st), ...diplomacyIfDefault(st), ...HETERODOX_REGULAR[kind]]),
  eventChoice: bestChoice,
  midterm: heterodoxSkilledBot.midterm,
};

/**
 * Puntaje de una medida extraordinaria por sus efectos no condicionales (como
 * adaptiveScore, sumando además caja, deuda, gasto fijo, expectativas,
 * gobernabilidad, Congreso e imagen). Las apuestas (filas condicionales) no
 * cuentan acá: ver betBonus.
 */
function extraordinaryRowsScore(s: GameState, id: string): number {
  let score = 0;
  for (const r of EFFECTS_BY_ACTION[id] ?? []) {
    if (r.magnitude === null || r.kind === 'CONDITIONAL' || r.kind === 'REPETITION') continue;
    const dur = r.kind === 'PERSISTENT' && typeof r.duration === 'number' ? Math.min(4, r.duration) : r.mode === 'BONUS' ? 0.5 : 1;
    const m = r.magnitude * dur;
    if (isIndicatorId(r.target)) {
      score += INDICATORS[r.target].goodDirection * m * urgency(s, r.target);
      if (r.target === 'INFL' && r.magnitude > 0) score -= r.magnitude * 1.5 * (view(s, 'INFL') > 60 ? 2 : 1);
    } else if (r.target === 'GOB') score += m * (s.causal.political.gob < 30 ? 1 : 0.5);
    else if (r.target === 'LEG' || r.target === 'IMAGEN') score += m * 0.3;
    else if (r.target === 'CAJA') score += m / 150;
    else if (r.target === 'DEUDA') score -= m / 400;
    else if (r.target === 'GASTO_CORR') score -= m / 50;
    else if (r.target === 'DESANCLAJE') score -= m * 0.3 * (s.causal.desanclaje > 15 ? 1.5 : 1);
  }
  return score;
}

/** +6 si la condición de la apuesta ("sale bien si…") ya se cumple hoy; 0 si no, o si la medida no apuesta. */
function betBonus(s: GameState, id: string): number {
  const row = (EFFECTS_BY_ACTION[id] ?? []).find(r => r.id.startsWith(`${id}.bien.`));
  if (!row?.condition) return 0;
  return evalCondition(row.condition, decisionContext(s.causal)) ? 6 : 0;
}

/**
 * Puntaje total de una medida extraordinaria para el adaptable de crisis. Las
 * medidas inciertas (renegociar la deuda, rescate del FMI) no tienen efectos
 * propios: se puntúan como el promedio de sus dos resultados posibles.
 */
export function extraordinaryScore(s: GameState, id: string): number {
  const uncertain = CRISIS_META[id]?.uncertain;
  if (uncertain) return 0.5 * (extraordinaryRowsScore(s, uncertain.success) + extraordinaryRowsScore(s, uncertain.failure));
  return extraordinaryRowsScore(s, id) + betBonus(s, id);
}

/** La medida extraordinaria disponible de mejor puntaje, si supera el umbral. */
function bestExtraordinary(s: GameState, threshold: number): string | null {
  let best: string | null = null;
  let bestScore = threshold;
  for (const a of extraordinaryAvailable(s)) {
    const score = extraordinaryScore(s, a.action.id);
    if (score > bestScore) { best = a.action.id; bestScore = score; }
  }
  return best;
}

export const crisisAdaptiveBot: Bot = {
  ...adaptiveBot, id: 'XA', name: 'Adaptable de crisis',
  description: 'Lee el contexto como el adaptable y elige la medida extraordinaria de mejor puntaje por sus efectos, con un bono si la apuesta ya parece alcanzable; en la emergencia toma cualquiera que sume, en la gestión solo las que suman claramente.',
  interactions: (s) => (inEmergency(s) ? [] : adaptiveBot.interactions(s)),
  policies: (s) => crisisPolicies(
    s,
    (st) => bestExtraordinary(st, inEmergency(st) ? 0 : 4),
    (st) => adaptiveBot.policies(st).filter(id => !isExtraordinaryId(id)),
  ),
};

export const CRISIS_BOTS: Bot[] = [crisisInactionBot, crisisOrthodoxBot, crisisHeterodoxBot, crisisAdaptiveBot];
