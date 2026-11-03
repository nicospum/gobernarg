/**
 * Medidas extraordinarias de los escenarios históricos (Corralito 2001 e
 * Hiper 1989). Extensión contextual del catálogo del Excel: no están en
 * `GobernArg_Motor_Causal_v1.xlsx` ni en `generated/` (una regeneración no las
 * borra). Usan el mismo formato de filas (ActionRow / EffectRow) y el mismo
 * motor de efectos; lo único distinto es que:
 *
 *  - cuestan 0 de caja y 0 acciones: se habilitan cuando la crisis las habilita;
 *  - solo se puede ejecutar UNA por turno (o por subronda de la emergencia);
 *  - casi todas son de una sola vez (los cambios de régimen son permanentes);
 *  - tienen impacto fuerte ya y una APUESTA que se resuelve 2 a 4 trimestres
 *    después: si se cumple la condición, premio grande; si no, explota.
 *    (Dos filas CONDITIONAL evaluadas al aplicar, una con la condición y otra
 *    con su negación.)
 *
 * Fuentes históricas: ver PLAN-HISTORICOS-Y-CONSULTOR.md y
 * ESCENARIOS-HISTORICOS-LIGHT.md en la raíz del repo.
 */
import type { ActionRow, EffectRow } from './types';

export type CrisisKind = 'corralito' | 'hiper';

/** Nombre del flag que marca cualquier escenario histórico con reglas nuevas. */
export const CRISIS_FLAG = 'escenario_crisis';
export const CRISIS_KIND_FLAG: Record<CrisisKind, string> = { corralito: 'crisis_corralito', hiper: 'crisis_hiper' };

export interface CrisisActionMeta {
  scenarios: CrisisKind[];
  /** Una sola vez por partida (no vuelve a aparecer después de ejecutarla). */
  once: boolean;
  /** Qué intenta resolver (una línea, lenguaje de jugador). */
  solves: string;
  /** Principal costo o riesgo. */
  risk: string;
  /** La apuesta, en palabras: cuándo sale bien y cuándo explota. */
  bet?: { bien: string; mal: string };
  /** Referencia histórica (hecho documentado, no simulado). */
  history?: string;
  /** Resultado incierto: el motor sortea éxito/fracaso y ejecuta el resultado correspondiente. */
  uncertain?: { success: string; failure: string };
}

interface Fx {
  /** Target: indicador, REL:actor, FLAG:nombre, CAJA, DEUDA, GASTO_CORR, DESANCLAJE, LEG, IMAGEN. */
  t: string;
  m: number;
  mode?: 'DELTA' | 'BONUS' | 'SET';
  /** Trimestres de demora (0 = este cierre). */
  off?: number;
  dur?: number | 'PERM';
  /** Condición evaluada al aplicar (apuestas) o al ejecutar. */
  cond?: string;
  apply?: boolean;
  floor?: number;
  x: string;
}

interface MeasureDef {
  id: string;
  name: string;
  description: string;
  /** Texto de ayuda largo (nota del jugador). */
  note: string;
  ley?: 'LEY' | 'LEY (no admite DNU)';
  cooldown?: number;
  meta: CrisisActionMeta;
  /** Condiciones para que aparezca (DSL). Se agrega sola la del escenario. */
  visibleWhen?: string;
  requirements?: { when: string; reason: string }[];
  effects: Fx[];
  /** Apuesta: [offset, condición, filas si sale bien, filas si explota]. */
  bet?: { off: number; cond: string; bien: Fx[]; mal: Fx[] };
}

const ROWS: ActionRow[] = [];
const EFFECTS: EffectRow[] = [];
export const CRISIS_META: Record<string, CrisisActionMeta> = {};
export const CRISIS_REQUIREMENTS: Record<string, { when: string; reason: string }[]> = {};
export const CRISIS_VISIBLE_WHEN: Record<string, string> = {};
/** Ids que el jugador puede elegir (no incluye los resultados de medidas inciertas). */
export const EXTRAORDINARY_IDS: string[] = [];
/** Resultados de medidas inciertas: pseudo-acciones que ejecuta el motor, nunca el jugador. */
export const CRISIS_OUTCOME_IDS: string[] = [];

function row(actionId: string, n: number, f: Fx, kindOverride?: string): EffectRow {
  const mode = f.mode ?? 'DELTA';
  const off = f.off ?? 0;
  const dur = f.dur ?? 1;
  const kind = kindOverride ?? (f.cond ? 'CONDITIONAL' : typeof dur === 'number' && dur > 1 && mode === 'DELTA' ? 'PERSISTENT' : off > 0 ? 'DELAYED' : 'IMMEDIATE');
  return {
    id: `${actionId}.${String(n).padStart(2, '0')}`,
    actionId,
    target: f.t,
    targetType: f.t.startsWith('FLAG:') ? 'FLAG' : f.t.startsWith('REL:') ? 'REL' : 'IND',
    mode,
    magnitude: f.m,
    timing: off === 0 ? 'T0' : `T+${off}`,
    offset: off,
    duration: dur,
    kind,
    condition: f.cond ?? null,
    evalAt: f.cond ? (f.apply === false ? 'EXEC' : 'APPLY') : null,
    repetition: null,
    window: null,
    cap: f.floor !== undefined ? { floor: f.floor } : null,
    explanation: f.x,
  };
}

function addEffects(actionId: string, effects: Fx[], bet?: MeasureDef['bet']): void {
  let n = 0;
  for (const f of effects) EFFECTS.push(row(actionId, ++n, f));
  if (bet) {
    for (const f of bet.bien) EFFECTS.push({ ...row(actionId, ++n, { ...f, off: bet.off, cond: bet.cond, apply: true }), id: `${actionId}.bien.${n}` });
    for (const f of bet.mal) EFFECTS.push({ ...row(actionId, ++n, { ...f, off: bet.off, cond: `not (${bet.cond})`, apply: true }), id: `${actionId}.mal.${n}` });
  }
}

function measure(d: MeasureDef): void {
  ROWS.push({
    id: d.id,
    name: d.name,
    description: d.description,
    uiCategory: 'Emergencia',
    status: 'crisis',
    origin: 'crisis',
    paCost: 0,
    paCostText: '0',
    caja: 0,
    cooldownText: d.cooldown ? `${d.cooldown} turnos` : null,
    cooldown: d.cooldown ?? 0,
    leyText: d.ley ?? 'NO',
    tags: [],
    strategic: d.note,
    prerequisitesText: null,
    unlocksText: null,
    risksText: d.meta.risk,
    directRelationText: null,
    notes: d.meta.history ?? null,
  });
  CRISIS_META[d.id] = d.meta;
  EXTRAORDINARY_IDS.push(d.id);
  const scenario = d.meta.scenarios.length === 2 ? `FLAG(${CRISIS_FLAG})` : `FLAG(${CRISIS_KIND_FLAG[d.meta.scenarios[0]]})`;
  CRISIS_VISIBLE_WHEN[d.id] = d.visibleWhen ? `${scenario} and (${d.visibleWhen})` : scenario;
  if (d.requirements) CRISIS_REQUIREMENTS[d.id] = d.requirements;
  addEffects(d.id, d.effects, d.bet);
}

/** Resultado de una medida incierta (éxito o fracaso): pseudo-acción con sus efectos. */
function outcome(id: string, name: string, effects: Fx[], bet?: MeasureDef['bet']): void {
  ROWS.push({
    id, name, description: name, uiCategory: 'Emergencia', status: 'crisis', origin: 'crisis', paCost: 0, paCostText: '0', caja: 0,
    cooldownText: null, cooldown: 0, leyText: 'NO', tags: [], strategic: '', prerequisitesText: null, unlocksText: null, risksText: null, directRelationText: null, notes: null,
  });
  CRISIS_OUTCOME_IDS.push(id);
  addEffects(id, effects, bet);
}

// ─────────────────────────────── Corralito 2001 ───────────────────────────────

measure({
  id: 'limitar_retiros',
  name: 'Limitar los retiros de efectivo (corralito)',
  description: 'Un tope semanal para sacar efectivo de los bancos. Transferencias, cheques y tarjetas siguen funcionando; la plata en mano, no.',
  note: 'Frena la salida de depósitos y cuida las reservas, a cambio de paralizar los pagos en efectivo: comercio parado, cacerolas y clase media furiosa. Es tiempo comprado: hay que usarlo para cambiar el régimen y liberar los depósitos.',
  meta: {
    scenarios: ['corralito'], once: true,
    solves: 'Frenar la corrida: los depósitos dejan de irse de los bancos.',
    risk: 'Paraliza los pagos en efectivo y enciende la calle.',
    bet: { bien: 'Sale bien si en tres trimestres hay nuevo régimen y liberás los depósitos.', mal: 'Explota si el corralito sigue vigente: un año sin plata en la calle.' },
    history: 'Decreto 1570 del 1/12/2001: 250 pesos o dólares por semana por titular y entidad.',
  },
  visibleWhen: 'not FLAG(corralito) and not FLAG(corralon) and FLAG(corrida)',
  effects: [
    { t: 'FLAG:corralito', m: 1, mode: 'SET', dur: 'PERM', x: 'Retiros de efectivo limitados hasta que los liberes.' },
    { t: 'EXTE', m: 8, x: 'Las reservas dejan de irse por la ventanilla.' },
    { t: 'SOLV', m: 4, mode: 'BONUS', dur: 2, x: 'Los bancos no quiebran: baja el pánico.' },
    { t: 'INVC', m: -1, x: 'Nadie presta con los depósitos encerrados.' },
    { t: 'ACTV', m: -2, x: 'Sin efectivo, el comercio se frena.' },
    { t: 'PODA', m: -2, x: 'La gente no puede usar su propia plata.' },
    { t: 'CONF', m: 5, x: 'Cacerolazos contra los bancos y el gobierno.' },
    { t: 'INST', m: -1, x: 'Restricción a la propiedad por decreto.' },
    { t: 'REL:financiero', m: 8, x: 'Los bancos se salvan de quebrar.' },
    { t: 'ACTV', m: -0.5, off: 1, dur: 99, cond: 'FLAG(corralito)', x: 'Cada trimestre con corralito frena la actividad.' },
    { t: 'INVC', m: -0.5, off: 1, dur: 99, cond: 'FLAG(corralito)', x: 'Cada trimestre con corralito seca el crédito.' },
    { t: 'CONF', m: 1, off: 1, dur: 99, cond: 'FLAG(corralito)', x: 'Cada trimestre con corralito calienta la calle.' },
  ],
  bet: {
    off: 3, cond: 'not FLAG(corralito) and not FLAG(corralon)',
    bien: [
      { t: 'INVC', m: 8, x: 'La salida ordenada del corralito devuelve la confianza.' },
      { t: 'CONF', m: -8, x: 'Con la plata de vuelta, la calle se calma.' },
      { t: 'INST', m: 4, x: 'El Estado cumplió: devolvió los depósitos.' },
      { t: 'EXTE', m: 4, x: 'Vuelven a entrar dólares al sistema.' },
      { t: 'ACTV', m: 4, x: 'La plata vuelve a circular.' },
    ],
    mal: [
      { t: 'CONF', m: 12, x: 'Un año sin plata en la calle: trueque, cacerolas y bancos vacíos.' },
      { t: 'ACTV', m: -5, x: 'La economía informal no alcanza: cierres y despidos.' },
      { t: 'INVC', m: -5, x: 'El crédito desapareció del todo.' },
      { t: 'PODA', m: -4, x: 'Los ahorros atrapados perdieron valor.' },
      { t: 'INST', m: -3, x: 'Amparos por todos lados: la justicia contra el gobierno.' },
    ],
  },
});

measure({
  id: 'reprogramar_depositos',
  name: 'Reprogramar TODOS los depósitos a plazo (corralón)',
  description: 'Los plazos fijos y las cuentas se devuelven en cuotas a lo largo de los años. Los bancos respiran; los ahorristas no.',
  note: 'Es la medida que salva al sistema bancario cuando la liquidez se acaba, a costa de romper el contrato con cada ahorrista. Solo tiene salida si después estabilizás los precios y las divisas.',
  meta: {
    scenarios: ['corralito'], once: true,
    solves: 'Que los bancos no quiebren cuando ya no les queda liquidez.',
    risk: 'Ahorristas furiosos, instituciones y crédito abajo.',
    bet: { bien: 'Sale bien si después estabilizás precios y divisas.', mal: 'Explota si no: amparos sin fin y más conflicto.' },
    history: 'Resolución 6/2002 del 9/1/2002 (reprogramación de depósitos).',
  },
  visibleWhen: 'FLAG(corralito) and not FLAG(corralon) and FLAG(bancos_al_limite)',
  effects: [
    { t: 'FLAG:corralon', m: 1, mode: 'SET', dur: 'PERM', x: 'Depósitos reprogramados hasta que los liberes.' },
    { t: 'SOLV', m: 6, mode: 'BONUS', dur: 3, x: 'El sistema financiero deja de ser una bomba.' },
    { t: 'INVC', m: -2, x: 'El sistema financiero queda congelado.' },
    { t: 'CONF', m: 6, x: 'Los ahorristas salen a la calle.' },
    { t: 'PODA', m: -2, x: 'Ahorros de toda una vida, atrapados.' },
    { t: 'INST', m: -2, x: 'Contratos rotos por decreto.' },
    { t: 'REL:financiero', m: 8, x: 'Los bancos se salvan.' },
    { t: 'CONF', m: 1, off: 1, dur: 99, cond: 'FLAG(corralon)', x: 'Cada trimestre con corralón suma protestas de ahorristas.' },
    { t: 'INVC', m: -1, off: 1, dur: 99, cond: 'FLAG(corralon)', x: 'Cada trimestre con corralón seca el crédito.' },
  ],
  bet: {
    off: 4, cond: 'INFL<60 and EXTE>=25',
    bien: [
      { t: 'INVC', m: 5, x: 'Con precios y divisas estables, los depósitos vuelven al sistema.' },
      { t: 'CONF', m: -5, x: 'Los ahorristas recuperan algo y aflojan.' },
      { t: 'INST', m: 2, x: 'El cronograma se cumplió.' },
    ],
    mal: [
      { t: 'CONF', m: 8, x: 'Los ahorristas no cobran: más cacerolas.' },
      { t: 'INST', m: -4, x: 'La justicia ordena devolver todo: el Estado no puede.' },
      { t: 'INVC', m: -4, x: 'Nadie vuelve a depositar un peso.' },
    ],
  },
});

measure({
  id: 'liberar_depositos',
  name: 'Liberar los depósitos',
  description: 'Se levantan las restricciones: cada uno puede disponer de su plata. Solo funciona si los bancos tienen con qué pagar.',
  note: 'La salida del corralito. Si los bancos recuperaron liquidez o hay divisas, el alivio es enorme; si no, la corrida vuelve al día siguiente.',
  meta: {
    scenarios: ['corralito'], once: true,
    solves: 'Terminar con el corralito y devolver la plata a la gente.',
    risk: 'Si los bancos no tienen con qué pagar, vuelve la corrida.',
    bet: { bien: 'Sale bien si hay divisas que respalden a los bancos.', mal: 'Explota si vuelve la corrida.' },
    history: 'Los depósitos se liberaron entre fines de 2002 y 2003.',
  },
  visibleWhen: '(FLAG(corralito) or FLAG(corralon)) and (FLAG(bancos_estables) or EXTE>=35)',
  effects: [
    { t: 'FLAG:corralito', m: 0, mode: 'SET', dur: 'PERM', x: 'Fin del corralito.' },
    { t: 'FLAG:corralon', m: 0, mode: 'SET', dur: 'PERM', x: 'Fin del corralón.' },
    { t: 'CONF', m: -10, x: 'La gente recupera su plata.' },
    { t: 'INVC', m: 6, x: 'Vuelve a haber crédito.' },
    { t: 'PODA', m: 3, x: 'Los ahorros vuelven a la economía.' },
    { t: 'ACTV', m: 2, x: 'La plata vuelve a la calle.' },
    { t: 'INST', m: 4, x: 'El Estado cumplió.' },
    { t: 'REL:financiero', m: -3, x: 'Los bancos pierden el colchón.' },
  ],
  bet: {
    off: 2, cond: 'EXTE>=25',
    bien: [
      { t: 'INVC', m: 6, x: 'Los depósitos se quedan en el sistema.' },
      { t: 'INST', m: 3, x: 'La confianza vuelve despacio.' },
      { t: 'ACTV', m: 4, x: 'Con crédito, la economía se mueve.' },
    ],
    mal: [
      { t: 'EXTE', m: -8, x: 'Liberaste sin respaldo: la plata se fue al dólar.' },
      { t: 'INVC', m: -4, x: 'Los bancos otra vez al borde.' },
      { t: 'CONF', m: 4, x: 'Rumores de un nuevo corralito.' },
    ],
  },
});

measure({
  id: 'salir_convertibilidad',
  name: 'Salir de la convertibilidad: devaluar',
  description: 'Se termina el 1 a 1. El peso flota y vale lo que el mercado diga; las deudas y los precios en dólares se vuelven impagables en pesos.',
  note: 'Devuelve competitividad y divisas, pero el salto del dólar se traslada a los precios y a los salarios. Es un cambio de régimen permanente: después hay que decidir qué pasa con las deudas en dólares (pesificar o no).',
  meta: {
    scenarios: ['corralito'], once: true,
    solves: 'Recuperar divisas y competitividad; dejar de quemar reservas.',
    risk: 'Los precios saltan y el salario real cae de golpe.',
    bet: { bien: 'Sale bien si contenés el traslado a precios (tasas o acuerdo).', mal: 'Explota si los precios se disparan.' },
    history: 'Ley 25.561 del 6/1/2002: fin del régimen de convertibilidad.',
  },
  visibleWhen: 'FLAG(convertibilidad) and not FLAG(dolarizada)',
  effects: [
    { t: 'FLAG:convertibilidad', m: 0, mode: 'SET', dur: 'PERM', x: 'Fin del 1 a 1.' },
    { t: 'FLAG:regimen_flotante', m: 1, mode: 'SET', dur: 'PERM', x: 'El peso flota.' },
    { t: 'EXTE', m: 14, x: 'Con el dólar más caro, vuelven las divisas.' },
    { t: 'INFL', m: 10, x: 'Traslado a precios de la devaluación.' },
    { t: 'INFL', m: 3, off: 1, x: 'Segunda ronda de traslado a precios.' },
    { t: 'PODA', m: -6, x: 'El salario real cae de golpe.' },
    { t: 'ACTV', m: -3, mode: 'BONUS', dur: 1, x: 'Shock recesivo de corto plazo.' },
    { t: 'ACTV', m: 3, off: 1, x: 'Rebote exportador: la industria vuelve a competir.' },
    { t: 'DESANCLAJE', m: 6, x: 'Las expectativas se desanclan.' },
    { t: 'INST', m: -1, x: 'Se rompe una regla de diez años.' },
    { t: 'CONF', m: 3, x: 'Bronca por los precios.' },
    { t: 'REL:financiero', m: -6, x: 'Bancos con deudas en dólares.' },
    { t: 'REL:industria', m: 8, x: 'La industria vuelve a competir.' },
    { t: 'REL:agro', m: 10, x: 'El campo cobra en dólares.' },
    { t: 'REL:pymes', m: 4, x: 'Las PyMEs vuelven a vender.' },
  ],
  bet: {
    off: 3, cond: 'INFL<55',
    bien: [
      { t: 'ACTV', m: 8, x: 'La devaluación contenida reactiva la economía.' },
      { t: 'EXTE', m: 8, x: 'Exportaciones récord.' },
      { t: 'INVC', m: 6, x: 'Vuelve la inversión con un dólar competitivo.' },
      { t: 'PODA', m: 4, x: 'Los salarios recuperan terreno.' },
    ],
    mal: [
      { t: 'INFL', m: 10, x: 'La devaluación se fue entera a precios.' },
      { t: 'PODA', m: -6, x: 'Los salarios corren de atrás.' },
      { t: 'CONF', m: 8, x: 'Bronca generalizada por el costo de vida.' },
    ],
  },
});

measure({
  id: 'dolarizar',
  name: 'Dolarizar TODA la economía',
  description: 'Se canjean todos los pesos por dólares y el peso desaparece. Nunca más emisión, nunca más devaluación: tampoco cuando haga falta.',
  note: 'Ancla los precios para siempre y seduce a las finanzas, a cambio de regalar la política monetaria: sin emisión, cualquier déficit se paga con recesión y atraso de sueldos. Solo cierra si ordenás las cuentas.',
  meta: {
    scenarios: ['corralito', 'hiper'], once: true,
    solves: 'Terminar con la inflación y la desconfianza en la moneda de una vez.',
    risk: 'Sin emisión ni devaluación, cualquier déficit se paga con recesión.',
    bet: { bien: 'Sale bien si las cuentas quedan casi en orden: baja el riesgo país y vuelve la inversión.', mal: 'Explota si el déficit sigue grande: el ajuste cae sobre la actividad y los salarios.' },
    history: 'Propuesta discutida en 1999 y en diciembre de 2001; nunca se aplicó en la Argentina.',
  },
  visibleWhen: 'not FLAG(dolarizada) and not FLAG(regimen_flotante)',
  requirements: [{ when: 'EXTE>=20', reason: 'No hay reservas para canjear los pesos por dólares.' }],
  effects: [
    { t: 'FLAG:dolarizada', m: 1, mode: 'SET', dur: 'PERM', x: 'Economía dolarizada: sin emisión ni devaluación.' },
    { t: 'FLAG:convertibilidad', m: 0, mode: 'SET', dur: 'PERM', x: 'El peso deja de existir.' },
    { t: 'INFL', m: -8, x: 'Precios anclados al dólar.' },
    { t: 'DESANCLAJE', m: -30, floor: 0, x: 'Las expectativas se anclan de golpe.' },
    { t: 'EXTE', m: -6, x: 'Las reservas se usan para canjear los pesos.' },
    { t: 'INVC', m: 8, x: 'Crédito en dólares sin riesgo cambiario.' },
    { t: 'INST', m: -2, x: 'Se cede la moneda propia.' },
    { t: 'SOLV', m: 6, mode: 'BONUS', dur: 4, x: 'Las finanzas aplauden.' },
    { t: 'ACTV', m: -2, mode: 'BONUS', dur: 2, x: 'Deflación: menos plata circulando.' },
    { t: 'CONF', m: 2, x: 'Protestas por la soberanía.' },
    { t: 'REL:financiero', m: 12, x: 'Sueño cumplido de los bancos.' },
    { t: 'REL:industria', m: -6, x: 'Sin devaluación posible, la industria pierde competitividad.' },
    { t: 'REL:agro', m: -4, x: 'El campo cobra en dólares caros.' },
  ],
  bet: {
    off: 4, cond: 'RESULT3>=-120',
    bien: [
      { t: 'SOLV', m: 10, x: 'Con cuentas ordenadas, el riesgo país se desploma.' },
      { t: 'INVC', m: 8, x: 'Llueven inversiones en una economía previsible.' },
      { t: 'EXTE', m: 8, x: 'Vuelven los dólares.' },
      { t: 'ACTV', m: 4, x: 'Crédito barato: la economía arranca.' },
      { t: 'INST', m: 2, x: 'La regla se respetó.' },
    ],
    mal: [
      { t: 'ACTV', m: -8, x: 'Sin emisión, el déficit se paga con recesión.' },
      { t: 'PODA', m: -5, x: 'Sueldos atrasados y en baja.' },
      { t: 'CONF', m: 10, x: 'La calle explota contra el ajuste.' },
      { t: 'PSOC', m: -3, x: 'El Estado no llega a pagar las prestaciones.' },
    ],
  },
});

measure({
  id: 'pesificar',
  name: 'Pesificar TODO: deudas y depósitos',
  description: 'Las deudas en dólares pasan a pesos uno a uno; los depósitos, a un valor mayor. El Estado compensa a los bancos con bonos.',
  note: 'Redistribuye la pérdida: alivia a los deudores, rompe a los bancos y deja a los ahorristas con menos de lo que tenían. El Estado absorbe la diferencia con más deuda. Solo cierra si el crédito vuelve y los precios no se disparan.',
  meta: {
    scenarios: ['corralito'], once: true,
    solves: 'Que las deudas en dólares no quiebren a familias y empresas.',
    risk: 'Bancos rotos, ahorristas en la calle y más deuda pública.',
    bet: { bien: 'Sale bien si vuelve el crédito y los precios no se disparan.', mal: 'Explota en amparos interminables y más conflicto.' },
    history: 'Decreto 214 del 3/2/2002: deudas a 1 peso por dólar, depósitos a 1,40.',
  },
  visibleWhen: 'FLAG(regimen_flotante) and (FLAG(corralito) or FLAG(corralon)) and not FLAG(pesificacion)',
  effects: [
    { t: 'FLAG:pesificacion', m: 1, mode: 'SET', dur: 'PERM', x: 'Contratos pesificados.' },
    { t: 'PODA', m: 6, x: 'Deudores aliviados.' },
    { t: 'ACTV', m: 5, x: 'Empresas sin la soga al cuello.' },
    { t: 'INVC', m: -4, x: 'Bancos quebrados de hecho.' },
    { t: 'CONF', m: 5, x: 'Los ahorristas se sienten estafados.' },
    { t: 'INST', m: -4, x: 'Contratos rotos por decreto.' },
    { t: 'DEUDA', m: 500, x: 'Bonos compensatorios a los bancos.' },
    { t: 'SOLV', m: -3, mode: 'BONUS', dur: 2, x: 'Más deuda pública.' },
    { t: 'REL:financiero', m: -10, x: 'Los bancos cargan con la pérdida.' },
    { t: 'REL:industria', m: 8, x: 'Deudas licuadas.' },
    { t: 'REL:pymes', m: 10, x: 'Las PyMEs vuelven a respirar.' },
    { t: 'REL:sindicatos', m: 4, x: 'Las empresas no cierran: se cuidan los puestos.' },
  ],
  bet: {
    off: 4, cond: 'INVC>=15 and INFL<60',
    bien: [
      { t: 'ACTV', m: 6, x: 'Con las deudas licuadas, la economía arranca.' },
      { t: 'INVC', m: 8, x: 'El crédito vuelve de a poco.' },
      { t: 'CONF', m: -6, x: 'La calle se calma con la recuperación.' },
    ],
    mal: [
      { t: 'INST', m: -5, x: 'Amparos interminables: la justicia contra la pesificación.' },
      { t: 'CONF', m: 8, x: 'Ahorristas en la calle todos los días.' },
      { t: 'INVC', m: -4, x: 'Nadie confía en un contrato.' },
    ],
  },
});

measure({
  id: 'suspender_pagos',
  name: 'Suspender TODOS los pagos de la deuda (default)',
  description: 'El Estado deja de pagar intereses y capital de la deuda. No hay más crédito externo hasta renegociar.',
  note: 'Libera caja de inmediato (no se pagan intereses) y cierra el acceso al crédito. La deuda no desaparece: hay que renegociarla, y mientras tanto el país queda aislado.',
  meta: {
    scenarios: ['corralito', 'hiper'], once: true,
    solves: 'Dejar de pagar intereses que la caja no puede pagar.',
    risk: 'Sin crédito ni confianza hasta renegociar; la deuda sigue ahí.',
    bet: { bien: 'Sale bien si renegociás la deuda dentro de seis trimestres.', mal: 'Explota si seguís aislado: riesgo país y divisas peor.' },
    history: 'Anuncio del default parcial de la deuda externa el 23/12/2001.',
  },
  visibleWhen: 'not FLAG(default_deuda) and not FLAG(deuda_renegociada)',
  effects: [
    { t: 'FLAG:default_deuda', m: 1, mode: 'SET', dur: 'PERM', x: 'En default hasta renegociar.' },
    { t: 'SOLV', m: -8, x: 'Riesgo país por las nubes.' },
    { t: 'EXTE', m: 5, x: 'No salen dólares para pagar deuda.' },
    { t: 'INVC', m: -4, x: 'Sin crédito externo ni interno.' },
    { t: 'INST', m: -2, x: 'El Estado no cumple sus contratos.' },
    { t: 'CONF', m: -4, x: 'Aplausos en el Congreso.' },
    { t: 'REL:financiero', m: -12, x: 'Finanzas afuera.' },
    { t: 'REL:oficialismo', m: 5, x: 'Al partido le gusta.' },
    { t: 'REL:sindicatos', m: 3, x: 'Primero la gente, después los acreedores.' },
  ],
  bet: {
    off: 6, cond: 'FLAG(deuda_renegociada)',
    bien: [
      { t: 'SOLV', m: 10, x: 'Con la deuda renegociada, vuelve la confianza.' },
      { t: 'INVC', m: 6, x: 'Reabre el crédito.' },
      { t: 'EXTE', m: 4, x: 'Vuelve el financiamiento.' },
    ],
    mal: [
      { t: 'SOLV', m: -6, x: 'Seis trimestres en default sin acuerdo: paria.' },
      { t: 'EXTE', m: -4, x: 'Sin financiamiento externo.' },
      { t: 'INVC', m: -4, x: 'Nadie invierte en un país aislado.' },
    ],
  },
});

measure({
  id: 'negociar_deuda',
  name: 'Renegociar la deuda con quita',
  description: 'Se sienta con los acreedores a canjear la deuda por bonos nuevos con quita. Puede salir o no.',
  note: 'El resultado depende de la solvencia, de la relación con las finanzas y de que las cuentas cierren. Si sale, la quita es del 35 % y los intereses bajan; si no, se pierde tiempo e imagen.',
  cooldown: 2,
  meta: {
    scenarios: ['corralito', 'hiper'], once: false,
    solves: 'Salir del default con una quita y volver al crédito.',
    risk: 'Puede fracasar: tiempo, imagen y riesgo país perdidos.',
    history: 'La renegociación real de la deuda en default llevó años (canje de 2005).',
    uncertain: { success: 'negociar_deuda_exito', failure: 'negociar_deuda_fracaso' },
  },
  visibleWhen: 'FLAG(default_deuda)',
  requirements: [
    { when: 'TURN>=4 or FLAG(crisis_hiper)', reason: 'Los acreedores recién se sientan después de un tiempo en default.' },
    { when: 'SOLV>=18 or DONE(agenda_internacional,8)', reason: 'Sin un mínimo de solvencia o de gestión diplomática, nadie negocia.' },
  ],
  effects: [],
});
outcome('negociar_deuda_exito', 'Renegociación exitosa', [
  { t: 'FLAG:default_deuda', m: 0, mode: 'SET', dur: 'PERM', x: 'Fin del default.' },
  { t: 'FLAG:deuda_renegociada', m: 0.6, mode: 'SET', dur: 8, x: 'Intereses reducidos durante 8 trimestres.' },
  { t: 'SOLV', m: 10, x: 'Baja el riesgo país.' },
  { t: 'EXTE', m: 5, x: 'Vuelven los dólares.' },
  { t: 'INVC', m: 6, x: 'Reabre el crédito.' },
  { t: 'ACTV', m: 2, x: 'Con crédito, algo se mueve.' },
  { t: 'INST', m: 2, x: 'El país vuelve a cumplir.' },
  { t: 'REL:financiero', m: 10, x: 'Las finanzas vuelven a la mesa.' },
]);
outcome('negociar_deuda_fracaso', 'Renegociación fracasada', [
  { t: 'SOLV', m: -4, mode: 'BONUS', dur: 2, x: 'Los acreedores se levantaron de la mesa.' },
  { t: 'INST', m: -1, x: 'Un papelón diplomático.' },
  { t: 'REL:financiero', m: -4, x: 'Desconfianza.' },
  { t: 'IMAGEN', m: -3, x: 'La oposición se ríe.' },
]);

measure({
  id: 'cuasimonedas',
  name: 'Pagar con cuasimonedas (patacones y lecop)',
  description: 'Sueldos y proveedores se pagan con bonos provinciales y nacionales que circulan como plata, sin respaldo.',
  note: 'Plata inmediata para pagar sueldos cuando la caja está vacía, con un costo: los bonos valen menos que un peso, suben los precios y degradan las instituciones. Hay que rescatarlos después.',
  meta: {
    scenarios: ['corralito'], once: true,
    solves: 'Pagar sueldos y proveedores con la caja vacía.',
    risk: 'Suben los precios y los bonos se desvalorizan si no los rescatás.',
    bet: { bien: 'Sale bien si rescatás las cuasimonedas con precios controlados y algo de solvencia.', mal: 'Explota si se desvalorizan: más inflación y menos salario.' },
    history: 'Patacones (Buenos Aires, 2001) y Lecop (Nación, 2001-2003); rescatados en 2003.',
  },
  visibleWhen: 'not FLAG(cuasimonedas) and not FLAG(dolarizada)',
  requirements: [{ when: 'CAJA<600', reason: 'Solo se justifica con la caja floja.' }],
  effects: [
    { t: 'FLAG:cuasimonedas', m: 1, mode: 'SET', dur: 6, x: 'Cuasimonedas en circulación.' },
    { t: 'CAJA', m: 500, x: 'Bonos para pagar sueldos y proveedores.' },
    { t: 'INFL', m: 3, x: 'Los bonos valen menos: suben los precios.' },
    { t: 'PODA', m: -2, x: 'Cobrar en patacones.' },
    { t: 'INVC', m: -2, x: 'Nadie presta en bonos.' },
    { t: 'INST', m: -3, x: 'Dinero sin respaldo por decreto.' },
    { t: 'CONF', m: -6, x: 'Al menos la gente cobra algo.' },
    { t: 'REL:gobernadores', m: 10, x: 'Las provincias financian sus déficits.' },
    { t: 'REL:financiero', m: -3, x: 'Tres monedas en circulación.' },
  ],
  bet: {
    off: 4, cond: 'INFL<55 and RESULT3>=-150',
    bien: [
      { t: 'INST', m: 3, x: 'Rescate ordenado de las cuasimonedas.' },
      { t: 'CAJA', m: -200, x: 'Costo del rescate.' },
      { t: 'CONF', m: -3, x: 'Vuelve la moneda única.' },
      { t: 'PODA', m: 2, x: 'Los sueldos vuelven a cobrarse en moneda de verdad.' },
    ],
    mal: [
      { t: 'INFL', m: 8, x: 'Las cuasimonedas se desvalorizan y arrastran los precios.' },
      { t: 'PODA', m: -4, x: 'Cobrar en papeles que nadie acepta.' },
      { t: 'INST', m: -4, x: 'Un sistema monetario en ruinas.' },
      { t: 'CAJA', m: -100, x: 'Rescate forzado y caro.' },
    ],
  },
});

measure({
  id: 'ley_emergencia',
  name: 'Ley de emergencia económica',
  description: 'El Congreso delega facultades extraordinarias al Ejecutivo por un tiempo. Margen para gobernar la crisis, a costa de las instituciones.',
  note: 'Da seis trimestres de gobernabilidad y de margen legislativo. Hay que conseguir la mayoría o un acuerdo con la oposición: no sale por decreto. Cuando vence, el margen se va.',
  requirements: [{ when: 'LEG>=35 or REL(oposicion)>=40 or FLAG(acuerdo_oposicion)', reason: 'Hace falta mayoría propia o un acuerdo con la oposición.' }],
  meta: {
    scenarios: ['corralito', 'hiper'], once: true,
    solves: 'Conseguir margen político para gobernar la crisis.',
    risk: 'Instituciones más débiles; hay que conseguir la mayoría.',
    history: 'Ley 25.561 (enero de 2002) y Ley 23.697 (septiembre de 1989).',
  },
  visibleWhen: 'not FLAG(ley_emergencia)',
  effects: [
    { t: 'FLAG:ley_emergencia', m: 1, mode: 'SET', dur: 6, x: 'Emergencia económica vigente.' },
    { t: 'GOB', m: 15, mode: 'BONUS', dur: 6, x: 'Facultades delegadas: margen para gobernar.' },
    { t: 'LEG', m: 8, mode: 'BONUS', dur: 6, x: 'El Congreso acompaña la emergencia.' },
    { t: 'INST', m: -2, x: 'Delegación de facultades.' },
    { t: 'REL:oposicion', m: -4, x: 'La oposición cede poder a regañadientes.' },
  ],
});

measure({
  id: 'estado_de_sitio',
  name: 'Estado de sitio',
  description: 'Se suspenden garantías constitucionales y las fuerzas de seguridad despejan la calle. La protesta se apaga un tiempo, o se multiplica.',
  note: 'Vacía la calle por un turno a un costo institucional enorme. Solo funciona si la gente tiene algo que comer: declararlo sobre el hambre enciende todo.',
  cooldown: 4,
  meta: {
    scenarios: ['corralito', 'hiper'], once: false,
    solves: 'Vaciar la calle de inmediato.',
    risk: 'Instituciones, imagen y derechos humanos muy abajo.',
    bet: { bien: 'Sale bien si estabas atendiendo el hambre (protección social).', mal: 'Explota si no: la represión enciende la calle.' },
    history: 'Declarado el 29/5/1989 y el 19/12/2001.',
  },
  visibleWhen: 'CONF>=65 and not FLAG(estado_de_sitio)',
  effects: [
    { t: 'FLAG:estado_de_sitio', m: 1, mode: 'SET', dur: 1, x: 'Garantías suspendidas.' },
    { t: 'CONF', m: -12, mode: 'BONUS', dur: 1, x: 'La calle se vacía por la fuerza.' },
    { t: 'SEGU', m: 3, x: 'Despliegue de fuerzas.' },
    { t: 'INST', m: -6, x: 'Garantías constitucionales suspendidas.' },
    { t: 'IMAGEN', m: -4, x: 'Un presidente que reprime.' },
    { t: 'GOB', m: -3, mode: 'BONUS', dur: 1, x: 'El Congreso y los actores se alejan.' },
    { t: 'REL:derechos_cultura', m: -12, x: 'Organismos de derechos humanos en contra.' },
    { t: 'REL:oposicion', m: -6, x: 'La oposición denuncia.' },
  ],
  bet: {
    off: 1, cond: 'PSOC>=35 or DONE(asistencia_alimentaria,2) or DONE(emergencia_alimentaria,2)',
    bien: [
      { t: 'CONF', m: -4, x: 'Con la olla llena, la calle se calmó.' },
      { t: 'SEGU', m: 2, x: 'Orden recuperado.' },
    ],
    mal: [
      { t: 'CONF', m: 15, x: 'La represión sobre el hambre encendió la calle.' },
      { t: 'INST', m: -5, x: 'Muertos en las protestas.' },
      { t: 'GOB', m: -10, mode: 'BONUS', dur: 2, x: 'Nadie quiere estar cerca del gobierno.' },
      { t: 'IMAGEN', m: -8, x: 'El helicóptero en la tapa de los diarios.' },
    ],
  },
});

measure({
  id: 'rescate_fmi',
  name: 'Pedir un rescate al FMI',
  description: 'Un programa de emergencia con el Fondo: dólares frescos a cambio de metas fiscales. Pueden decir que no.',
  note: 'Si lo dan, entran dólares y confianza, y a los cuatro trimestres revisan la meta fiscal: con un déficit grande se cae el desembolso. Si lo niegan, el costo es de imagen y de riesgo país.',
  cooldown: 6,
  meta: {
    scenarios: ['corralito', 'hiper'], once: false,
    solves: 'Conseguir dólares y respaldo externo de urgencia.',
    risk: 'Pueden negarlo; si lo dan, revisan el déficit a los cuatro trimestres.',
    bet: { bien: 'Sale bien si el déficit es chico cuando revisan la meta.', mal: 'Explota si el déficit sigue grande: se cae el desembolso.' },
    history: 'En diciembre de 2001 el FMI suspendió los desembolsos a la Argentina.',
    uncertain: { success: 'rescate_fmi_exito', failure: 'rescate_fmi_fracaso' },
  },
  visibleWhen: 'not FLAG(default_deuda)',
  effects: [],
});
outcome('rescate_fmi_exito', 'Rescate del FMI aprobado', [
  { t: 'CAJA', m: 800, x: 'Desembolso de emergencia.' },
  { t: 'DEUDA', m: 900, x: 'Más deuda con el Fondo.' },
  { t: 'EXTE', m: 10, x: 'Reservas.' },
  { t: 'SOLV', m: 10, mode: 'BONUS', dur: 4, x: 'Respaldo externo.' },
  { t: 'INVC', m: 4, x: 'Con respaldo, algo de crédito.' },
  { t: 'DESANCLAJE', m: -6, floor: 0, x: 'Ancla externa.' },
  { t: 'FLAG:meta_fiscal', m: 1, mode: 'SET', dur: 4, x: 'Meta fiscal comprometida.' },
], {
  off: 4, cond: 'RESULT3>=-100',
  bien: [{ t: 'SOLV', m: 6, x: 'Metas cumplidas: más confianza.' }, { t: 'INVC', m: 4, x: 'Vuelve el crédito.' }],
  mal: [{ t: 'CAJA', m: -300, x: 'Desembolso perdido por el déficit.' }, { t: 'SOLV', m: -8, mode: 'BONUS', dur: 4, x: 'Programa caído.' }],
});
outcome('rescate_fmi_fracaso', 'El FMI dijo que no', [
  { t: 'IMAGEN', m: -3, x: 'Un no en la tapa de los diarios.' },
  { t: 'SOLV', m: -2, mode: 'BONUS', dur: 2, x: 'Riesgo país peor.' },
  { t: 'EXTE', m: -1, x: 'Se van más dólares.' },
]);

measure({
  id: 'apertura_total',
  name: 'Apertura TOTAL de importaciones',
  description: 'Cero aranceles y sin trabas: entra todo. Precios más bajos y bolsillo más lleno; la industria local, a competir o cerrar.',
  note: 'Baja los precios y mejora el bolsillo ya, pero la industria y las PyMEs quedan expuestas y se van divisas. Solo cierra si hay dólares e inversión para modernizar.',
  meta: {
    scenarios: ['corralito', 'hiper'], once: true,
    solves: 'Bajar los precios con competencia importada.',
    risk: 'Industria y PyMEs expuestas; se van divisas.',
    bet: { bien: 'Sale bien si hay divisas e inversión: la economía se moderniza.', mal: 'Explota en desindustrialización y desempleo.' },
    history: 'La apertura comercial argentina se profundizó entre 1989 y 1991.',
  },
  visibleWhen: 'not FLAG(apertura_total)',
  effects: [
    { t: 'FLAG:apertura_total', m: 1, mode: 'SET', dur: 'PERM', x: 'Economía abierta.' },
    { t: 'INFL', m: -6, x: 'Importados baratos disciplinan los precios.' },
    { t: 'PODA', m: 4, x: 'El bolsillo rinde más.' },
    { t: 'ACTV', m: -4, x: 'Fábricas que cierran.' },
    { t: 'INVC', m: -2, x: 'Nadie invierte en lo que se importa.' },
    { t: 'EXTE', m: -5, x: 'Se van dólares en importaciones.' },
    { t: 'CONF', m: 4, x: 'Despidos en la industria.' },
    { t: 'REL:industria', m: -12, x: 'La industria se siente abandonada.' },
    { t: 'REL:pymes', m: -10, x: 'Las PyMEs no pueden competir.' },
    { t: 'REL:agro', m: 8, x: 'Insumos más baratos.' },
    { t: 'REL:financiero', m: 4, x: 'Menos presión de precios.' },
  ],
  bet: {
    off: 4, cond: 'EXTE>=25 and INVC>=15',
    bien: [
      { t: 'ACTV', m: 8, x: 'La competencia modernizó lo que quedó en pie.' },
      { t: 'INVC', m: 8, x: 'Inversión en sectores competitivos.' },
      { t: 'INFL', m: -3, x: 'Precios disciplinados.' },
    ],
    mal: [
      { t: 'ACTV', m: -8, x: 'Desindustrialización: cierres masivos.' },
      { t: 'PSOC', m: -3, x: 'Desempleo estructural.' },
      { t: 'CONF', m: 10, x: 'Marchas de trabajadores despedidos.' },
    ],
  },
});

measure({
  id: 'reforma_constitucion',
  name: 'Reformar la Constitución',
  description: 'Una reforma con poderes de emergencia para el Ejecutivo. Necesita a la oposición: sin ella no hay dos tercios.',
  note: 'Da bancas y gobernabilidad por mucho tiempo a cambio de instituciones más débiles y de la bronca de la oposición. Solo se sostiene si la gente te apoya; si no, es hegemonía sin votos.',
  ley: 'LEY (no admite DNU)',
  meta: {
    scenarios: ['corralito', 'hiper'], once: true,
    solves: 'Más poder y bancas para gobernar la crisis.',
    risk: 'Instituciones y oposición abajo; hace falta la oposición.',
    bet: { bien: 'Sale bien si tenés aprobación: legitimidad plebiscitaria.', mal: 'Explota si gobernás sin apoyo: hegemonía sin votos y partido dividido.' },
    history: 'La reforma de 1994 salió con un pacto entre oficialismo y oposición.',
  },
  visibleWhen: 'not FLAG(reforma_constitucional)',
  requirements: [{ when: 'FLAG(acuerdo_oposicion) or REL(oposicion)>=55', reason: 'Sin la oposición no hay dos tercios.' }],
  effects: [
    { t: 'FLAG:reforma_constitucional', m: 1, mode: 'SET', dur: 'PERM', x: 'Constitución reformada.' },
    { t: 'GOB', m: 12, mode: 'BONUS', dur: 8, x: 'Poderes de emergencia.' },
    { t: 'LEG', m: 10, x: 'Más bancas propias.' },
    { t: 'INST', m: -5, x: 'Concentración de poder.' },
    { t: 'REL:oposicion', m: -8, x: 'La oposición se arrepiente.' },
    { t: 'IMAGEN', m: 4, x: 'Un presidente fuerte.' },
    { t: 'CONF', m: 3, x: 'Marchas por la República.' },
  ],
  bet: {
    off: 4, cond: 'APRO>=30',
    bien: [
      { t: 'INST', m: 4, x: 'El apoyo popular legitimó la reforma.' },
      { t: 'GOB', m: 6, mode: 'BONUS', dur: 4, x: 'Mandato claro.' },
    ],
    mal: [
      { t: 'INST', m: -8, x: 'Hegemonía sin votos.' },
      { t: 'CONF', m: 10, x: 'La calle contra el poder concentrado.' },
      { t: 'REL:oficialismo', m: -10, x: 'Tu propio partido se divide.' },
    ],
  },
});

// ─────────────────────────────── Hiper 1989 ───────────────────────────────

measure({
  id: 'congelamiento_total',
  name: 'Congelamiento TOTAL de precios y salarios',
  description: 'Todos los precios y todos los salarios quedan congelados por decreto. La inflación se frena en seco mientras dure.',
  note: 'Frena el dato de inflación de golpe y calma las expectativas por dos trimestres. Si mientras tanto conseguís respaldo fiscal y de divisas, los precios bajan en serio; si no, el congelamiento estalla en desabastecimiento y rebote.',
  meta: {
    scenarios: ['hiper'], once: true,
    solves: 'Frenar la inflación en seco y ganar tiempo.',
    risk: 'Si no hay respaldo, estalla en desabastecimiento y rebote.',
    bet: { bien: 'Sale bien si mientras dura ordenás las cuentas (sin déficit grande): los precios bajan en serio.', mal: 'Explota si seguís con déficit: desabastecimiento, mercado negro y rebote de precios.' },
    history: 'Plan Austral (junio de 1985): congelamiento de precios y salarios.',
  },
  visibleWhen: 'not FLAG(congelamiento)',
  effects: [
    { t: 'FLAG:congelamiento', m: 1, mode: 'SET', dur: 2, x: 'Precios y salarios congelados.' },
    { t: 'INFL', m: -30, mode: 'BONUS', dur: 2, x: 'Precios congelados por decreto.' },
    { t: 'PODA', m: 6, mode: 'BONUS', dur: 2, x: 'El salario deja de perder.' },
    { t: 'INVC', m: -2, x: 'Empresas postergan todo.' },
    { t: 'ACTV', m: -1, x: 'Menos producción a precios congelados.' },
    { t: 'CONF', m: -8, x: 'Alivio en la calle.' },
    { t: 'DESANCLAJE', m: -10, floor: 0, x: 'Las expectativas se calman.' },
  ],
  bet: {
    off: 2, cond: 'RESULT3>=-200',
    bien: [
      { t: 'INFL', m: -15, x: 'Con respaldo, el congelamiento se convirtió en estabilización.' },
      { t: 'DESANCLAJE', m: -12, floor: 0, x: 'Expectativas ancladas.' },
      { t: 'INVC', m: 6, x: 'Vuelve algo de crédito.' },
      { t: 'ACTV', m: 3, x: 'Con precios quietos, la economía respira.' },
      { t: 'IMAGEN', m: 6, x: 'El plan funcionó.' },
    ],
    mal: [
      { t: 'INFL', m: 12, x: 'El congelamiento estalló: rebote de precios.' },
      { t: 'CONF', m: 10, x: 'Desabastecimiento y mercado negro.' },
      { t: 'PODA', m: -6, x: 'Los salarios congelados quedaron atrás.' },
      { t: 'ACTV', m: -3, x: 'Góndolas vacías.' },
    ],
  },
});

measure({
  id: 'nueva_moneda',
  name: 'Nueva moneda con respaldo',
  description: 'Se cambia el signo monetario por una moneda nueva respaldada con reservas. Si la gente le cree, la inflación se desploma.',
  note: 'Baja la inflación y las expectativas de golpe y mejora la imagen. Se sostiene solo con superávit y reservas; si no, la moneda nueva se derrite como la anterior.',
  meta: {
    scenarios: ['hiper'], once: true,
    solves: 'Recuperar una moneda en la que la gente confíe.',
    risk: 'Si no hay superávit y reservas, la moneda nueva se derrite.',
    bet: { bien: 'Sale bien si las cuentas están casi en orden y hay un mínimo de reservas: la moneda se sostiene.', mal: 'Explota si no: la moneda nueva se derrite y las expectativas vuelan.' },
    history: 'El austral reemplazó al peso argentino en 1985; el peso convertible, al austral en 1992.',
  },
  visibleWhen: 'not FLAG(nueva_moneda)',
  requirements: [{ when: 'EXTE>=12', reason: 'Sin un mínimo de reservas nadie cree en una moneda nueva.' }],
  effects: [
    { t: 'FLAG:nueva_moneda', m: 1, mode: 'SET', dur: 'PERM', x: 'Moneda nueva en circulación.' },
    { t: 'INFL', m: -20, x: 'Los precios se reacomodan a la moneda nueva.' },
    { t: 'DESANCLAJE', m: -18, floor: 0, x: 'Borrón y cuenta nueva.' },
    { t: 'INST', m: 3, x: 'Un plan serio.' },
    { t: 'IMAGEN', m: 6, x: 'El presidente del nuevo plan.' },
    { t: 'INVC', m: 4, x: 'Algo de crédito en la moneda nueva.' },
    { t: 'EXTE', m: 2, x: 'Vuelven algunos dólares del colchón.' },
  ],
  bet: {
    off: 3, cond: 'RESULT3>=-150 and EXTE>=18',
    bien: [
      { t: 'INFL', m: -15, x: 'La moneda nueva se sostiene: estabilidad.' },
      { t: 'INVC', m: 10, x: 'Vuelve el crédito a largo plazo.' },
      { t: 'SOLV', m: 8, x: 'Riesgo país en baja.' },
      { t: 'EXTE', m: 6, x: 'Entran dólares.' },
      { t: 'ACTV', m: 4, x: 'Con moneda, vuelve el trabajo.' },
    ],
    mal: [
      { t: 'INFL', m: 25, x: 'La moneda nueva se derritió como la anterior.' },
      { t: 'DESANCLAJE', m: 20, x: 'Nadie cree más en ningún plan.' },
      { t: 'CONF', m: 10, x: 'Bronca por el engaño.' },
      { t: 'IMAGEN', m: -8, x: 'El plan fracasó en público.' },
    ],
  },
});

measure({
  id: 'shock_fiscal',
  name: 'Shock fiscal: tarifazo, recorte TOTAL de subsidios y tasas por las nubes',
  description: 'Se cortan todos los subsidios, las tarifas saltan y las tasas se van al cielo. Las cuentas cierran a los golpes.',
  note: 'Baja el gasto fijo para siempre y manda una señal de orden, a costa de precios más altos ahora, crédito caro, actividad y bolsillo golpeados y la calle encendida. Solo cierra si la inflación baja de verdad.',
  meta: {
    scenarios: ['hiper'], once: true,
    solves: 'Cerrar las cuentas y cortar la emisión de raíz.',
    risk: 'Precios arriba ahora, crédito caro, calle encendida.',
    bet: { bien: 'Sale bien si la inflación baja: vuelve el crédito y la solvencia.', mal: 'Explota si no: ajuste sin resultados y calle encendida.' },
    history: 'Plan BB (julio de 1989): tarifazo, devaluación y ajuste.',
  },
  visibleWhen: 'not DONE(shock_fiscal,99)',
  effects: [
    { t: 'GASTO_CORR', m: -200, x: 'Subsidios cortados para siempre.' },
    { t: 'INFL', m: 4, x: 'Tarifazo: suben los precios regulados.' },
    { t: 'INFL', m: -10, mode: 'BONUS', dur: 2, x: 'Ancla fiscal: la carrera de precios afloja.' },
    { t: 'INFL', m: -8, off: 1, x: 'Menos emisión, menos inflación.' },
    { t: 'INFL', m: -8, off: 2, x: 'El ajuste empieza a rendir.' },
    { t: 'INVC', m: -4, mode: 'BONUS', dur: 2, x: 'Tasas por las nubes.' },
    { t: 'ACTV', m: -4, mode: 'BONUS', dur: 2, x: 'Recesión por el ajuste.' },
    { t: 'PODA', m: -5, x: 'Tarifas y recortes golpean el bolsillo.' },
    { t: 'CONF', m: 8, x: 'Paros y marchas contra el ajuste.' },
    { t: 'PSOC', m: -3, x: 'Menos prestaciones.' },
    { t: 'DESANCLAJE', m: -12, floor: 0, x: 'Señal de orden fiscal.' },
    { t: 'SOLV', m: 8, mode: 'BONUS', dur: 4, x: 'Las cuentas cierran.' },
    { t: 'REL:sindicatos', m: -10, x: 'Paro general en puerta.' },
    { t: 'REL:financiero', m: 10, x: 'Las finanzas aplauden.' },
  ],
  bet: {
    off: 3, cond: 'INFL<80',
    bien: [
      { t: 'SOLV', m: 8, x: 'El ajuste rindió: solvencia.' },
      { t: 'INVC', m: 8, x: 'Vuelve el crédito.' },
      { t: 'EXTE', m: 6, x: 'Entran dólares.' },
      { t: 'ACTV', m: 4, x: 'La economía arranca con cuentas sanas.' },
    ],
    mal: [
      { t: 'CONF', m: 12, x: 'Ajuste sin resultados: la calle estalla.' },
      { t: 'ACTV', m: -6, x: 'Recesión sin estabilización.' },
      { t: 'GOB', m: -8, mode: 'BONUS', dur: 2, x: 'Nadie defiende un ajuste que no sirvió.' },
    ],
  },
});

measure({
  id: 'intervencion_total',
  name: 'Vender TODAS las reservas para frenar el dólar',
  description: 'El Banco Central pone todas las reservas en la mesa para contener el dólar. Si el mercado le cree, alcanza; si no, se queman.',
  note: 'Contiene el dólar y la inflación un par de turnos a cambio de reservas. Si las expectativas se calman y las cuentas no están rotas, la calma se consolida; si no, las reservas se quemaron y el dólar sigue.',
  meta: {
    scenarios: ['hiper'], once: true,
    solves: 'Frenar el dólar ya mismo.',
    risk: 'Si el mercado no cree, las reservas se queman sin frenar nada.',
    bet: { bien: 'Sale bien si las expectativas se calman y las cuentas no están rotas.', mal: 'Explota si no: reservas quemadas y dólar disparado.' },
    history: 'El BCRA dejó de intervenir a comienzos de febrero de 1989 por falta de reservas.',
  },
  visibleWhen: 'not DONE(intervencion_total,99)',
  requirements: [{ when: 'EXTE>=10', reason: 'No quedan reservas para vender.' }],
  effects: [
    { t: 'INFL', m: -8, mode: 'BONUS', dur: 2, x: 'Dólar contenido.' },
    { t: 'EXTE', m: -8, x: 'Reservas vendidas.' },
    { t: 'INVC', m: 3, x: 'Un respiro para el crédito.' },
    { t: 'DESANCLAJE', m: -4, floor: 0, x: 'Señal de que el Central pelea.' },
  ],
  bet: {
    off: 2, cond: 'DESANCLAJE<25 and RESULT3>=-250',
    bien: [
      { t: 'INFL', m: -8, x: 'El mercado se calmó: la intervención alcanzó.' },
      { t: 'EXTE', m: 8, x: 'Vuelven las reservas.' },
    ],
    mal: [
      { t: 'EXTE', m: -6, x: 'Se quemaron las reservas y el dólar siguió subiendo.' },
      { t: 'INFL', m: 10, x: 'Dólar disparado: precios disparados.' },
      { t: 'DESANCLAJE', m: 8, x: 'El Central quedó sin municiones.' },
    ],
  },
});

measure({
  id: 'devaluar_shock',
  name: 'Devaluación de shock',
  description: 'Un salto grande del dólar oficial de una sola vez, para que las exportaciones rindan y dejen de irse divisas.',
  note: 'Trae divisas y contenta al campo, pero el traslado a precios en plena hiper es brutal y el salario cae. Solo cierra si hay divisas y los precios se contienen.',
  meta: {
    scenarios: ['hiper'], once: true,
    solves: 'Conseguir divisas y que las exportaciones rindan.',
    risk: 'Traslado brutal a precios y salarios en caída.',
    bet: { bien: 'Sale bien si hay divisas y los precios se contienen: vuelven las exportaciones.', mal: 'Explota en más inflación y más caída del salario.' },
    history: 'Devaluaciones de febrero y julio de 1989.',
  },
  visibleWhen: 'not DONE(devaluar_shock,99) and not FLAG(dolarizada)',
  effects: [
    { t: 'EXTE', m: 14, x: 'Las exportaciones liquidan.' },
    { t: 'INFL', m: 10, x: 'Traslado a precios del salto cambiario.' },
    { t: 'PODA', m: -6, x: 'El salario real se derrumba.' },
    { t: 'ACTV', m: -2, mode: 'BONUS', dur: 1, x: 'Shock recesivo.' },
    { t: 'ACTV', m: 3, off: 1, x: 'Las exportaciones reactivan.' },
    { t: 'DESANCLAJE', m: 4, x: 'Más incertidumbre.' },
    { t: 'REL:agro', m: 12, x: 'El campo cobra en dólares.' },
    { t: 'REL:industria', m: 6, x: 'Competitividad.' },
    { t: 'REL:sindicatos', m: -5, x: 'Salarios licuados.' },
  ],
  bet: {
    off: 3, cond: 'EXTE>=25 and INFL<85',
    bien: [
      { t: 'ACTV', m: 8, x: 'Con divisas, la economía arranca.' },
      { t: 'EXTE', m: 8, x: 'Exportaciones en alza.' },
      { t: 'INVC', m: 6, x: 'Inversión exportadora.' },
    ],
    mal: [
      { t: 'INFL', m: 12, x: 'La devaluación alimentó la hiper.' },
      { t: 'PODA', m: -6, x: 'Salarios pulverizados.' },
      { t: 'CONF', m: 8, x: 'Saqueos y protestas.' },
    ],
  },
});

measure({
  id: 'emergencia_alimentaria',
  name: 'Emergencia alimentaria TOTAL: cajas PAN y bonos para todos',
  description: 'Reparto masivo de alimentos y un bono de emergencia para los que no llegan. Se paga en los próximos dos trimestres.',
  note: 'Sostiene las necesidades básicas y apaga la calle ya; el costo de caja llega en los dos trimestres siguientes. Si los precios se comen la plata antes de que llegue, alimenta la inflación.',
  cooldown: 4,
  meta: {
    scenarios: ['corralito', 'hiper'], once: false,
    solves: 'Que la gente coma y la calle se calme.',
    risk: 'Costo de caja diferido; con hiper, la plata se licúa.',
    bet: { bien: 'Sale bien si los precios no se comen la plata: el programa se consolida.', mal: 'Explota si sí: más inflación y la calle otra vez.' },
    history: 'Programa Alimentario Nacional (cajas PAN, 1984-1989).',
  },
  effects: [
    { t: 'PSOC', m: 10, mode: 'BONUS', dur: 3, x: 'Alimentos en los barrios.' },
    { t: 'PODA', m: 5, mode: 'BONUS', dur: 3, x: 'Bono de emergencia.' },
    { t: 'CONF', m: -14, mode: 'BONUS', dur: 2, x: 'La calle se calma.' },
    { t: 'CONF', m: -5, x: 'Contención inmediata.' },
    { t: 'REL:org_sociales', m: 12, x: 'Las organizaciones reparten.' },
    { t: 'REL:sindicatos', m: 5, x: 'Alivio para los trabajadores.' },
    { t: 'CAJA', m: -200, off: 1, x: 'Primer pago del programa.' },
    { t: 'CAJA', m: -200, off: 2, x: 'Segundo pago del programa.' },
  ],
  bet: {
    off: 3, cond: 'INFL<85',
    bien: [
      { t: 'PSOC', m: 5, x: 'El programa se consolidó.' },
      { t: 'CONF', m: -5, x: 'Paz social.' },
    ],
    mal: [
      { t: 'INFL', m: 6, x: 'La plata se licuó antes de llegar.' },
      { t: 'CONF', m: 6, x: 'La calle otra vez.' },
    ],
  },
});

measure({
  id: 'acuerdo_transicion',
  name: 'Acuerdo de transición con la oposición',
  description: 'Un programa conjunto con la fuerza que viene: medidas compartidas, Congreso que acompaña y credibilidad para el plan. Tu partido lo vive como una entrega.',
  note: 'Mejora la gobernabilidad, el Congreso y las expectativas, y le da credibilidad a cualquier programa. Cuesta imagen y la relación con tu propio partido. Si el programa conjunto baja la inflación, se consolida; si no, la oposición rompe y te deja solo.',
  meta: {
    scenarios: ['hiper'], once: true,
    solves: 'Gobernar la emergencia con la fuerza que ganó la elección.',
    risk: 'Imagen y partido propio abajo; si fracasa, te dejan solo.',
    bet: { bien: 'Sale bien si el programa conjunto baja la inflación.', mal: 'Explota si la oposición rompe: Congreso y gobernabilidad abajo.' },
    history: 'Entre mayo y julio de 1989 el gobierno saliente y el entrante negociaron la transición; la entrega fue el 8/7/1989. Desde acá la historia es alternativa.',
  },
  visibleWhen: 'not FLAG(transicion)',
  requirements: [{ when: 'REL(oposicion)>=20', reason: 'La oposición no atiende el teléfono.' }],
  effects: [
    { t: 'FLAG:transicion', m: 1, mode: 'SET', dur: 'PERM', x: 'Transición acordada.' },
    { t: 'GOB', m: 15, mode: 'BONUS', dur: 6, x: 'Gobierno de transición con respaldo.' },
    { t: 'LEG', m: 10, mode: 'BONUS', dur: 6, x: 'La oposición acompaña en el Congreso.' },
    { t: 'INST', m: 5, x: 'Las instituciones funcionan.' },
    { t: 'DESANCLAJE', m: -8, floor: 0, x: 'Credibilidad para el programa.' },
    { t: 'CONF', m: -8, x: 'Señal de orden.' },
    { t: 'IMAGEN', m: -3, x: 'Un presidente que cede.' },
    { t: 'REL:oficialismo', m: -6, x: 'Tu partido lo vive como una entrega.' },
    { t: 'REL:oposicion', m: 12, x: 'La oposición se siente parte.' },
  ],
  bet: {
    off: 4, cond: 'INFL<80',
    bien: [
      { t: 'INST', m: 4, x: 'La transición ordenada fortaleció las instituciones.' },
      { t: 'GOB', m: 6, mode: 'BONUS', dur: 4, x: 'Consenso que dura.' },
      { t: 'REL:oposicion', m: 5, x: 'Socios confiables.' },
    ],
    mal: [
      { t: 'REL:oposicion', m: -15, x: 'La oposición rompió el acuerdo.' },
      { t: 'LEG', m: -8, x: 'Te dejan solo en el Congreso.' },
      { t: 'GOB', m: -8, mode: 'BONUS', dur: 2, x: 'Gobierno aislado.' },
    ],
  },
});

measure({
  id: 'privatizar_todo',
  name: 'Privatizar TODAS las empresas del Estado. Todas.',
  description: 'Teléfonos, aerolínea, petróleo, gas, luz, trenes, agua: todo a la venta de una vez. Caja enorme hoy, y nada para vender mañana.',
  note: 'Una montaña de caja de una sola vez y menos gasto fijo para siempre, a cambio de despidos, sindicatos en pie de guerra y servicios en manos de quien pueda pagarlos. Solo cierra si hay crédito e instituciones para que llegue la inversión.',
  meta: {
    scenarios: ['hiper'], once: true,
    solves: 'Caja inmediata y menos gasto fijo.',
    risk: 'Despidos, conflicto y servicios más caros; no hay segunda vez.',
    bet: { bien: 'Sale bien si hay crédito e instituciones: llega la inversión y mejoran los servicios.', mal: 'Explota en tarifazos, obras abandonadas y corrupción.' },
    history: 'Ley de Reforma del Estado (agosto de 1989): ENTel, Aerolíneas, YPF, Gas del Estado, SEGBA, ferrocarriles.',
  },
  visibleWhen: 'not FLAG(privatizacion_total)',
  effects: [
    { t: 'FLAG:privatizacion_total', m: 1, mode: 'SET', dur: 'PERM', x: 'No queda nada por vender.' },
    { t: 'CAJA', m: 1500, x: 'Ingreso extraordinario por las ventas.' },
    { t: 'GASTO_CORR', m: -150, x: 'Menos empresas deficitarias.' },
    { t: 'INVC', m: 4, x: 'Capitales que entran a comprar.' },
    { t: 'DESANCLAJE', m: -6, floor: 0, x: 'Señal de que el Estado no va a emitir para financiarse.' },
    { t: 'CONF', m: 8, x: 'Despidos masivos y paros.' },
    { t: 'ACTV', m: -2, x: 'Reestructuraciones.' },
    { t: 'INFR', m: -1, x: 'Obras frenadas mientras cambian de manos.' },
    { t: 'INST', m: -3, x: 'Ventas apuradas y poco transparentes.' },
    { t: 'REL:sindicatos', m: -12, x: 'Pie de guerra.' },
    { t: 'REL:org_sociales', m: -8, x: 'Servicios más caros para los barrios.' },
    { t: 'REL:financiero', m: 12, x: 'Negocio del siglo.' },
    { t: 'REL:industria', m: 6, x: 'Nuevos proveedores.' },
  ],
  bet: {
    off: 4, cond: 'INVC>=20 and INST>=40',
    bien: [
      { t: 'INFR', m: 8, x: 'Inversión privada en servicios.' },
      { t: 'INVC', m: 8, x: 'Llegan capitales.' },
      { t: 'EXTE', m: 6, x: 'Inversión extranjera.' },
      { t: 'ACTV', m: 4, x: 'Servicios que funcionan: la economía se mueve.' },
    ],
    mal: [
      { t: 'INFR', m: -6, x: 'Obras abandonadas por los nuevos dueños.' },
      { t: 'PODA', m: -4, x: 'Tarifazos.' },
      { t: 'CONF', m: 8, x: 'Despedidos en la calle.' },
      { t: 'INST', m: -4, x: 'Escándalos de corrupción en las ventas.' },
    ],
  },
});

export const CRISIS_ACTION_ROWS: ActionRow[] = ROWS;
export const CRISIS_EFFECT_ROWS: EffectRow[] = EFFECTS;

/** Medidas extraordinarias que entran a la caja como financiamiento, no como resultado fiscal. */
export const CRISIS_FINANCING_IDS = ['cuasimonedas', 'privatizar_todo', 'rescate_fmi_exito'];

/**
 * Políticas regulares que no aparecen en los escenarios históricos: en una
 * crisis son menores y no hacen diferencia, o las reemplaza una medida
 * extraordinaria (devaluación, privatización, préstamo internacional).
 */
export const HIDDEN_IN_CRISIS: string[] = [
  'devaluacion', 'privatizacion', 'prestamo_internacional',
  'reforma_tributaria', 'reduccion_impuestos', 'regimen_grandes_inversiones', 'desarrollo_energetico_minero', 'tratado_comercio',
  'plan_viviendas', 'salud_preventiva', 'construccion_hospitales', 'genero_y_cuidados',
  'inversion_educativa', 'reforma_educativa', 'economia_conocimiento', 'fomento_cultural', 'turismo_y_patrimonio',
  'estudio_factibilidad', 'infraestructura_vial', 'infraestructura_energetica', 'energia_renovable', 'obras_hidricas', 'plan_conectividad', 'mantenimiento_infraestructura',
  'prevencion_comunitaria', 'lucha_narcotrafico',
  // Quedan visibles empleo_joven, financiamiento_ciencia, fortalecimiento_justicia,
  // transparencia_anticorrupcion y proteccion_ambiental: cada actor tiene algo para pedir.
];

export function isExtraordinary(actionId: string): boolean {
  return actionId in CRISIS_META;
}

/** Resumen de la apuesta ("Sale bien si… / Explota si…") o null si la medida no apuesta. */
export function betSummary(actionId: string): { bien: string; mal: string } | null {
  return CRISIS_META[actionId]?.bet ?? null;
}
