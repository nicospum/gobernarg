import type { ActorId } from '../../data/causal';
import { operativeSat } from './actors';
import { effective, flagValue, saturate } from './context';
import type { Rng } from './rng';
import type { CausalState, ChannelEffect, ChannelRecord } from './types';

/**
 * Canales de poder (pestaña 07_CANALES).
 * Se evalúan al cierre con la satisfacción nueva (T.8) y se AGENDAN para el
 * turno siguiente (rezago anti-espiral); en T.4 del cierre siguiente se aplican.
 * Ningún canal toca APRO ni IV (DC-3): sólo indicadores y variables políticas.
 */

export interface ChannelEventDef {
  id: string;
  actor: ActorId;
  title: string;
  description: string;
  cooldown: number;
  /** Imagen de evento existente (utils/imageAssets getEventImage). */
  imageKey: string;
}

export const CHANNEL_EVENTS: Record<string, ChannelEventDef> = {
  paro_agrario: { id: 'paro_agrario', actor: 'agro', title: 'Paro agrario', description: 'Cortes de ruta y lockout: el campo frena la comercialización.', cooldown: 4, imageKey: 'drought' },
  corrida: { id: 'corrida', actor: 'financiero', title: 'Corrida cambiaria', description: 'Los depósitos se dolarizan y las reservas caen en pocos días.', cooldown: 4, imageKey: 'debt_default' },
  paro_general: { id: 'paro_general', actor: 'sindicatos', title: 'Paro general', description: 'La CGT paraliza el país. El gobierno pierde un turno de gestión atendiendo la crisis.', cooldown: 3, imageKey: 'general_strike' },
  cacerolazo: { id: 'cacerolazo', actor: 'clase_media', title: 'Cacerolazo', description: 'La clase media sale a la calle con cacerolas contra el gobierno.', cooldown: 4, imageKey: 'social_protest' },
  estallido: { id: 'estallido', actor: 'sectores_populares', title: 'Estallido social', description: 'Saqueos y disturbios en los barrios más castigados.', cooldown: 4, imageKey: 'social_protest' },
  marcha_federal: { id: 'marcha_federal', actor: 'estudiantes', title: 'Marcha federal educativa', description: 'Una movilización masiva instala la educación en el centro de la agenda.', cooldown: 4, imageKey: 'social_protest' },
  paro_docente: { id: 'paro_docente', actor: 'docentes', title: 'Paro docente por tiempo indeterminado', description: 'Las escuelas cierran: los días de clase perdidos no se recuperan.', cooldown: 3, imageKey: 'general_strike' },
  plan_de_lucha: { id: 'plan_de_lucha', actor: 'org_sociales', title: 'Plan de lucha', description: 'Las organizaciones sociales cortan accesos a las principales ciudades.', cooldown: 3, imageKey: 'social_protest' },
  ruptura_oficialismo: { id: 'ruptura_oficialismo', actor: 'oficialismo', title: 'Ruptura del bloque oficialista', description: 'Un sector del propio partido arma bloque aparte en el Congreso.', cooldown: 99, imageKey: 'minister_resignation' },
  salida_coalicion: { id: 'salida_coalicion', actor: 'aliados', title: 'Los aliados abandonan la coalición', description: 'Los socios de la coalición dejan el gobierno y sus bancas.', cooldown: 99, imageKey: 'minister_resignation' },
};

let chId = 0;

function relFactor(state: CausalState, actor: ActorId, kind: 'pressure' | 'support'): number {
  const rel = state.actors[actor].rel ?? 50;
  return kind === 'pressure' ? 1 - rel / 200 : 0.5 + rel / 200;
}

function hasActiveAgreement(state: CausalState, actor: ActorId, turn: number): boolean {
  return state.agreements.some(a => a.actor === actor && a.status === 'active' && a.signedTurn <= turn && turn <= a.deadline);
}

/**
 * T.8 — Evalúa canales y agenda sus efectos para `close + 1`.
 * También actualiza estados de canal inmediatos (saliencia, disidencias).
 */
export function evaluateChannels(state: CausalState, close: number, rng: Rng): { scheduled: ChannelRecord[]; events: string[] } {
  const next = close + 1;
  const scheduled: ChannelRecord[] = [];
  const events: string[] = [];
  const a = state.actors;
  const sat = (id: ActorId) => operativeSat(state, id, close);
  const rel = (id: ActorId) => a[id].rel ?? 50;
  const push = (actor: ActorId, label: string, target: string, value: number, mode: ChannelEffect['mode'] = 'DELTA', duration = 1, eventId?: string) => {
    if (Math.abs(value) < 1e-9) return;
    state.channelQueue.push({ id: `ch${++chId}`, actor, label, target, value, mode, duration, applyTurn: next, eventId });
    scheduled.push({ actor, label, target, value, eventId });
  };
  const fireEvent = (id: string): boolean => {
    const def = CHANNEL_EVENTS[id];
    const last = state.channelEventTurns[id];
    if (last !== undefined && close - last < def.cooldown) return false;
    state.channelEventTurns[id] = close;
    events.push(id);
    return true;
  };

  // Industria
  if (sat('industria') < 40) push('industria', 'Industria posterga inversiones', 'INVC', -2 * relFactor(state, 'industria', 'pressure'));
  if (sat('industria') < 25) push('industria', 'Giro de utilidades y dolarización de carteras', 'EXTE', -2);
  if (sat('industria') > 65) push('industria', 'Industria anuncia inversiones', 'INVC', 2 * relFactor(state, 'industria', 'support'));

  // Agro
  if (sat('agro') < 25 && rel('agro') < 40 && fireEvent('paro_agrario')) {
    push('agro', 'Paro agrario', 'CONF', 8, 'DELTA', 1, 'paro_agrario');
    push('agro', 'Paro agrario', 'ACTV', -2, 'BONUS', 2, 'paro_agrario');
    push('agro', 'Paro agrario', 'EXTE', -3, 'DELTA', 1, 'paro_agrario');
  } else if (sat('agro') < 35) {
    push('agro', 'Agro retiene la cosecha', 'EXTE', -3);
  }
  if (sat('agro') > 65) push('agro', 'Liquidación fluida de la cosecha', 'EXTE', 2);

  // Financiero
  if (sat('financiero') < 25 && fireEvent('corrida')) {
    push('financiero', 'Corrida cambiaria', 'EXTE', -6, 'DELTA', 1, 'corrida');
    push('financiero', 'Corrida cambiaria', 'INFL', 4, 'DELTA', 1, 'corrida');
  }
  if (sat('financiero') < 35) push('financiero', 'Sube el riesgo país', 'SOLV', -5, 'BONUS', 1);
  if (sat('financiero') > 65) push('financiero', 'Mercados abiertos: baja el riesgo país', 'SOLV', 4, 'BONUS', 1);

  // Sindicatos
  const tregua = hasActiveAgreement(state, 'sindicatos', close);
  if (sat('sindicatos') < 25 && rel('sindicatos') < 40 && !tregua && fireEvent('paro_general')) {
    push('sindicatos', 'Paro general', 'ACTV', -3, 'BONUS', 1, 'paro_general');
    push('sindicatos', 'Paro general', 'CONF', 10, 'DELTA', 1, 'paro_general');
    state.paPenaltyNextTurn += 1;
  } else if (sat('sindicatos') < 35 && !tregua) {
    push('sindicatos', 'Sindicatos: medidas de fuerza', 'CONF', 3 * relFactor(state, 'sindicatos', 'pressure'));
  }
  if (sat('sindicatos') > 65 && rel('sindicatos') >= 50) {
    push('sindicatos', 'Moderación salarial', 'INFL', -1);
    push('sindicatos', 'Paz social', 'CONF', -2);
  }

  // PyMEs
  if (sat('pymes') < 30) push('pymes', 'PyMEs: cierres y despidos', 'ACTV', -2);
  if (sat('pymes') > 65) push('pymes', 'PyMEs contratan', 'ACTV', 1);

  // Clase media (sin relación)
  if (sat('clase_media') < 25 && fireEvent('cacerolazo')) {
    push('clase_media', 'Cacerolazo', 'CONF', 6, 'DELTA', 1, 'cacerolazo');
    push('clase_media', 'Cacerolazo', 'GOB', -5, 'BONUS', 2, 'cacerolazo');
  }
  if (sat('clase_media') < 35 && effective(state, 'INFL', close) > 60) push('clase_media', 'Clase media dolariza sus ahorros', 'EXTE', -2);

  // Sectores populares (sin relación)
  if (sat('sectores_populares') < 25 && effective(state, 'PSOC', close) < 35 && rng.chance(0.15) && fireEvent('estallido')) {
    push('sectores_populares', 'Estallido social', 'CONF', 15, 'DELTA', 1, 'estallido');
    push('sectores_populares', 'Estallido social', 'SEGU', -4, 'DELTA', 1, 'estallido');
  }

  // Estudiantes
  const acuerdoEst = hasActiveAgreement(state, 'estudiantes', close);
  if (sat('estudiantes') < 35 && !acuerdoEst) push('estudiantes', 'Estudiantes: tomas y marchas', 'CONF', 2);
  if (sat('estudiantes') < 25 && fireEvent('marcha_federal')) {
    state.saliency.push({ actor: 'clase_media', indicator: 'EDUC', mult: 1.5, end: close + 3, source: 'marcha_federal' });
  }

  // Docentes
  const paritaria = hasActiveAgreement(state, 'docentes', close);
  if (paritaria) {
    // Paritaria cerrada: sin paros mientras dure el acuerdo.
  } else if (sat('docentes') < 25 && fireEvent('paro_docente')) {
    push('docentes', 'Paro docente por tiempo indeterminado', 'EDUC', -3, 'DELTA', 1, 'paro_docente');
    push('docentes', 'Paro docente por tiempo indeterminado', 'CONF', 4, 'DELTA', 1, 'paro_docente');
  } else if (sat('docentes') < 35) {
    push('docentes', 'Paro docente', 'EDUC', -1);
    push('docentes', 'Paro docente', 'CONF', 2);
  }

  // Científicos: fuga de cerebros con histéresis (empieza <35, sigue mientras <45).
  const fuga = flagValue(state, 'fuga_cerebros', close);
  if (sat('cientificos') < 35 || (fuga && sat('cientificos') < 45)) {
    state.flags.fuga_cerebros = { value: 1, start: 0, end: null, source: 'cientificos' };
    push('cientificos', 'Fuga de cerebros', 'CIEN', -1);
  } else if (fuga) {
    state.flags.fuga_cerebros = { value: 0, start: 0, end: null, source: 'cientificos' };
  }

  // Organizaciones sociales
  const gestionConjunta = hasActiveAgreement(state, 'org_sociales', close);
  if (gestionConjunta) {
    // Gestión conjunta de programas: sin plan de lucha mientras dure.
  } else if (sat('org_sociales') < 25 && fireEvent('plan_de_lucha')) {
    push('org_sociales', 'Plan de lucha', 'CONF', 8, 'DELTA', 1, 'plan_de_lucha');
    push('org_sociales', 'Plan de lucha', 'ACTV', -1, 'DELTA', 1, 'plan_de_lucha');
  } else if (sat('org_sociales') < 35) {
    push('org_sociales', 'Piquetes', 'CONF', 4 * relFactor(state, 'org_sociales', 'pressure'));
  }
  if (sat('org_sociales') > 60 && rel('org_sociales') > 50) push('org_sociales', 'Contención territorial', 'CONF', -2);

  // Derechos y cultura: denuncia pública (saliencia de INST para la clase media).
  if (sat('derechos_cultura') < 35) {
    state.saliency = state.saliency.filter(s => s.source !== 'denuncia_derechos');
    state.saliency.push({ actor: 'clase_media', indicator: 'INST', mult: 1.5, end: close + 3, source: 'denuncia_derechos' });
  }

  // Oficialismo: disidencias acumulativas (máx −6) que se recuperan; ruptura permanente.
  updateDissent(state, 'oficialismo', sat('oficialismo') < 40, sat('oficialismo') >= 50);
  if (sat('oficialismo') < 25 && !state.ruptures.includes('ruptura_oficialismo') && fireEvent('ruptura_oficialismo')) {
    state.ruptures.push('ruptura_oficialismo');
    state.political.legAdj -= 8;
  }
  // Aliados
  updateDissent(state, 'aliados', sat('aliados') < 35 || rel('aliados') < 30, sat('aliados') >= 45 && rel('aliados') >= 40);
  if (sat('aliados') < 25 && rel('aliados') < 30 && !state.ruptures.includes('salida_coalicion') && fireEvent('salida_coalicion')) {
    state.ruptures.push('salida_coalicion');
    state.political.legAdj -= 10;
  }
  // Oposición: interpelaciones cuando obstruye.
  if (sat('oposicion') < 30 || rel('oposicion') < 30) push('oposicion', 'Interpelaciones en el Congreso', 'GOB', -3, 'BONUS', 1);

  return { scheduled, events };
}

/** Disidencias: −1 banca por turno de malestar (tope −6), +1 por turno de recuperación. */
function updateDissent(state: CausalState, actor: ActorId, unhappy: boolean, recovered: boolean): void {
  const cur = state.dissent[actor] ?? 0;
  if (unhappy && cur < 6) state.dissent[actor] = cur + 1;
  else if (recovered && cur > 0) state.dissent[actor] = cur - 1;
}

/** T.4 — Aplica los efectos de canal agendados para este cierre. */
export function applyChannelQueue(state: CausalState, close: number): ChannelRecord[] {
  const applied: ChannelRecord[] = [];
  const keep: ChannelEffect[] = [];
  for (const ch of state.channelQueue) {
    if (ch.applyTurn > close) { keep.push(ch); continue; }
    if (ch.mode === 'BONUS') {
      state.bonuses.push({
        id: ch.id, target: ch.target, value: ch.value, start: close, end: close + ch.duration - 1,
        source: `channel:${ch.actor}`, label: ch.label,
      });
    } else if (ch.target in state.base) {
      const t = ch.target as keyof typeof state.base;
      state.base[t] = Math.min(100, Math.max(0, state.base[t] + saturate(state.base[t], ch.value)));
    }
    applied.push({ actor: ch.actor, label: ch.label, target: ch.target, value: ch.value, eventId: ch.eventId });
  }
  state.channelQueue = keep;
  return applied;
}

/** Ajustes de estado político derivados de canales (sin acumulación): LEG y umbral de LEY. */
export function channelStatus(state: CausalState, close: number): { legStatus: number; umbralLey: number; structureBonus: number } {
  const a = state.actors;
  const sat = (id: ActorId) => operativeSat(state, id, close);
  const rel = (id: ActorId) => a[id].rel ?? 50;
  let legStatus = -(state.dissent.oficialismo ?? 0) - (state.dissent.aliados ?? 0);
  let structureBonus = 0;
  if (sat('oficialismo') > 65) { legStatus += 2; structureBonus += (sat('oficialismo') - 50) / 10; }
  if (sat('aliados') > 60 && rel('aliados') > 60) legStatus += 2;
  if (sat('gobernadores') < 35 || rel('gobernadores') < 35) { legStatus -= 3; structureBonus -= 3; }
  else if (sat('gobernadores') > 65 && rel('gobernadores') > 65) { legStatus += 3; structureBonus += 3; }
  let umbralLey = 50;
  if (sat('oposicion') < 30 || rel('oposicion') < 30) umbralLey = 55;
  else if (rel('oposicion') > 60) umbralLey = 45;
  for (const m of state.modifiers) {
    if (m.umbralLey && m.start <= close + 1 && close + 1 <= m.end) umbralLey += m.umbralLey;
  }
  return { legStatus, umbralLey, structureBonus };
}
