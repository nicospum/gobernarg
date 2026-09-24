/**
 * Datos normalizados del motor causal.
 *
 * Fuente: Excel `GobernArg_Motor_Causal_v1.xlsx` (transcripto en ./generated por
 * scripts/excel_to_causal.py) + las partes del Excel que son texto libre y se
 * pasan a mano acá con su referencia (prerequisitos 04/06, plataformas R-23).
 */
import { INDICATOR_ROWS } from './generated/indicators';
import { ACTOR_ROWS } from './generated/actors';
import { SENSITIVITY_ROWS } from './generated/matrix';
import { ACTION_ROWS } from './generated/actions';
import { EFFECT_ROWS } from './generated/effects';
import { MEETING_ROWS } from './generated/meetings';
import { EXCEL_PARAMS } from './generated/params';
import { AUDIT_ROWS } from './generated/audit';
import type { ActionRow, EffectRow, MeetingRow } from './types';

// ─────────────────────────────── Indicadores ───────────────────────────────

export const INDICATOR_IDS = [
  'INFL', 'ACTV', 'PODA', 'INVC', 'PRES', 'SOLV', 'EXTE',
  'INFR', 'EDUC', 'PSOC', 'SEGU', 'CIEN', 'INST', 'AMBI', 'CONF',
] as const;
export type IndicatorId = (typeof INDICATOR_IDS)[number];

export function isIndicatorId(x: string): x is IndicatorId {
  return (INDICATOR_IDS as readonly string[]).includes(x);
}

export type MacroCategory = 'Economía' | 'Estado y servicios' | 'Desarrollo' | 'Instituciones y sociedad';
/** public = dato oficial visible · partial = sólo tendencia/rango cualitativo · (DESANCLAJE es oculto y no es indicador) */
export type IndicatorVisibility = 'public' | 'partial';

export interface IndicatorDef {
  id: IndicatorId;
  name: string;
  macro: MacroCategory;
  definition: string;
  high: string;
  low: string;
  initial: number;
  visibility: IndicatorVisibility;
  /** +1: más es mejor para el país · −1: más es peor · 0: palanca (presión tributaria). Uso: eficacia y textos. */
  goodDirection: 1 | -1 | 0;
}

const GOOD_DIRECTION: Record<IndicatorId, 1 | -1 | 0> = {
  INFL: -1, ACTV: 1, PODA: 1, INVC: 1, PRES: 0, SOLV: 1, EXTE: 1,
  INFR: 1, EDUC: 1, PSOC: 1, SEGU: 1, CIEN: 1, INST: 1, AMBI: 1, CONF: -1,
};

export const INDICATORS: Record<IndicatorId, IndicatorDef> = Object.fromEntries(
  INDICATOR_ROWS.map(r => {
    const id = r.id as IndicatorId;
    const def: IndicatorDef = {
      id,
      name: r.name ?? id,
      macro: (r.macro ?? 'Economía') as MacroCategory,
      definition: r.definition ?? '',
      high: r.high ?? '',
      low: r.low ?? '',
      initial: r.initial ?? 50,
      visibility: (r.visibility ?? '').toLowerCase().startsWith('visible') ? 'public' : 'partial',
      goodDirection: GOOD_DIRECTION[id],
    };
    return [id, def];
  }),
) as Record<IndicatorId, IndicatorDef>;

// ─────────────────────────────── Actores ───────────────────────────────

export const ACTOR_IDS = [
  'industria', 'agro', 'financiero', 'sindicatos', 'pymes', 'clase_media', 'sectores_populares',
  'estudiantes', 'docentes', 'cientificos', 'org_sociales', 'derechos_cultura', 'ambiente',
  'oficialismo', 'aliados', 'oposicion', 'gobernadores',
] as const;
export type ActorId = (typeof ACTOR_IDS)[number];

export function isActorId(x: string): x is ActorId {
  return (ACTOR_IDS as readonly string[]).includes(x);
}

export type ElectoralMode = 'SATISFACCION' | 'ESTRUCTURA' | 'NINGUNO';

export interface ActorDef {
  id: ActorId;
  name: string;
  shortName: string;
  family: string;
  description: string;
  influence: number;
  electoralWeight: number;
  electoralMode: ElectoralMode;
  /** null = electorado no organizado (sin reuniones ni relación: se informa con encuestas). */
  interactionDifficulty: number | null;
  relInitial: number | null;
  channelMain: string;
  channelSecondary: string | null;
  highConsequence: string | null;
  lowConsequence: string | null;
  /** Clave del ícono en assets/images/icons (ver utils/actorIcons.ts). */
  iconKey: string;
}

const SHORT_NAMES: Record<ActorId, string> = {
  industria: 'Industria', agro: 'Agro', financiero: 'Financiero', sindicatos: 'Sindicatos',
  pymes: 'PyMEs', clase_media: 'Clase media', sectores_populares: 'Sectores populares',
  estudiantes: 'Estudiantes', docentes: 'Docentes', cientificos: 'Científicos',
  org_sociales: 'Org. sociales', derechos_cultura: 'Derechos y cultura', ambiente: 'Ambientalistas',
  oficialismo: 'Oficialismo', aliados: 'Aliados', oposicion: 'Oposición', gobernadores: 'Gobernadores',
};

/** Íconos existentes del juego reasignados a los actores nuevos (no se crearon assets). */
const ICON_KEYS: Record<ActorId, string> = {
  industria: 'groups/group-business',
  agro: 'groups/group-agriculture',
  financiero: 'groups/group-financial',
  sindicatos: 'groups/group-workers',
  pymes: 'archetypes/archetype-business',
  clase_media: 'groups/group-middle-class',
  sectores_populares: 'groups/group-low-income',
  estudiantes: 'groups/group-students',
  docentes: 'groups/group-academics',
  cientificos: 'categories/category-technology',
  org_sociales: 'groups/group-cooperatives',
  derechos_cultura: 'groups/group-ngo',
  ambiente: 'groups/group-environmentalists',
  oficialismo: 'archetypes/archetype-institutional',
  aliados: 'groups/group-allies',
  oposicion: 'groups/group-opposition',
  gobernadores: 'categories/category-tourism',
};

export const ACTORS: Record<ActorId, ActorDef> = Object.fromEntries(
  ACTOR_ROWS.map(r => {
    const id = r.id as ActorId;
    const def: ActorDef = {
      id,
      name: r.name ?? id,
      shortName: SHORT_NAMES[id],
      family: r.family ?? '',
      description: r.description ?? '',
      influence: r.influence ?? 5,
      electoralWeight: r.electoralWeight ?? 0,
      electoralMode: (r.electoralMode ?? 'NINGUNO') as ElectoralMode,
      interactionDifficulty: r.interactionDifficulty,
      relInitial: r.relInitial,
      channelMain: r.channelMain ?? '',
      channelSecondary: r.channelSecondary,
      highConsequence: r.highConsequence,
      lowConsequence: r.lowConsequence,
      iconKey: ICON_KEYS[id],
    };
    return [id, def];
  }),
) as Record<ActorId, ActorDef>;

/** Actores sin organización formal: no hay reuniones ni relación (D-03). */
export function isOrganized(actor: ActorId): boolean {
  return ACTORS[actor].interactionDifficulty !== null;
}

/** Familias para agrupar actores en la UI (orden de presentación). */
export const ACTOR_FAMILIES: { id: string; name: string; members: ActorId[] }[] = [
  { id: 'produccion', name: 'Producción y finanzas', members: ['industria', 'agro', 'pymes', 'financiero'] },
  { id: 'trabajo', name: 'Trabajo y organizaciones', members: ['sindicatos', 'org_sociales'] },
  { id: 'electorado', name: 'Electorado', members: ['clase_media', 'sectores_populares'] },
  { id: 'conocimiento', name: 'Educación y conocimiento', members: ['docentes', 'estudiantes', 'cientificos'] },
  { id: 'sociedad', name: 'Sociedad civil', members: ['derechos_cultura', 'ambiente'] },
  { id: 'politica', name: 'Sistema político', members: ['oficialismo', 'aliados', 'gobernadores', 'oposicion'] },
];

// ─────────────────────────────── Sensibilidades (03) ───────────────────────────────

/** Variables que miran los actores políticos además de indicadores. */
export type PoliticalTarget = 'APRO' | 'PLATAFORMA_1' | 'PLATAFORMA_2' | 'PLATAFORMA_3';
export type SensitivityTarget = IndicatorId | PoliticalTarget;

export interface Sensitivity {
  target: SensitivityTarget;
  s: number;
  explanation: string;
}

export const SENSITIVITIES: Record<ActorId, Sensitivity[]> = Object.fromEntries(
  ACTOR_IDS.map(a => [
    a,
    SENSITIVITY_ROWS.filter(r => r.actor === a).map(r => ({
      target: r.target as SensitivityTarget,
      s: r.s ?? 0,
      explanation: r.explanation ?? '',
    })),
  ]),
) as Record<ActorId, Sensitivity[]>;

// ─────────────────────────────── Plataforma del oficialismo (D-07 / R-23) ───────────────────────────────

export interface PlatformDef {
  id: string;
  name: string;
  description: string;
  /** Tres indicadores con signo: reemplazan a PLATAFORMA_1..3 en la matriz del oficialismo. */
  items: { indicator: IndicatorId; s: number }[];
}

/**
 * R-23 (decisión abierta del Excel): propuesta de 3 indicadores con signo elegidos al
 * inicio. Implementación provisional: 5 plataformas predefinidas; cada arquetipo
 * sugiere una. Las magnitudes respetan las de la matriz (5, 5, 4).
 */
export const PLATFORMS: PlatformDef[] = [
  {
    id: 'crecimiento_con_salarios',
    name: 'Crecimiento con salarios',
    description: 'El partido quiere ver actividad, poder adquisitivo y una inflación que no se escape.',
    items: [{ indicator: 'ACTV', s: 5 }, { indicator: 'PODA', s: 5 }, { indicator: 'INFL', s: -4 }],
  },
  {
    id: 'desarrollo_productivo',
    name: 'Desarrollo productivo',
    description: 'Inversión, actividad y menor presión tributaria sobre quien produce.',
    items: [{ indicator: 'INVC', s: 5 }, { indicator: 'ACTV', s: 5 }, { indicator: 'PRES', s: -4 }],
  },
  {
    id: 'estado_presente',
    name: 'Estado presente',
    description: 'Protección social, salario real y educación pública.',
    items: [{ indicator: 'PSOC', s: 5 }, { indicator: 'PODA', s: 5 }, { indicator: 'EDUC', s: 4 }],
  },
  {
    id: 'orden_y_estabilidad',
    name: 'Orden y estabilidad',
    description: 'Baja inflación, seguridad y cuentas públicas sólidas.',
    items: [{ indicator: 'INFL', s: -5 }, { indicator: 'SEGU', s: 5 }, { indicator: 'SOLV', s: 4 }],
  },
  {
    id: 'modernizacion',
    name: 'Modernización',
    description: 'Instituciones sólidas, ciencia e inserción en el mundo.',
    items: [{ indicator: 'INST', s: 5 }, { indicator: 'CIEN', s: 5 }, { indicator: 'EXTE', s: 4 }],
  },
];

export const DEFAULT_PLATFORM_BY_ARCHETYPE: Record<string, string> = {
  politico: 'crecimiento_con_salarios',
  empresario: 'desarrollo_productivo',
  sindicalista: 'estado_presente',
  comunicador: 'orden_y_estabilidad',
};

export function getPlatform(id: string | null | undefined): PlatformDef {
  return PLATFORMS.find(p => p.id === id) ?? PLATFORMS[0];
}

// ─────────────────────────────── Parámetros (00B) ───────────────────────────────

export const PARAMS = {
  ACCIONES_POR_TURNO: EXCEL_PARAMS.ACCIONES_POR_TURNO ?? 4,
  TURNOS_MANDATO: EXCEL_PARAMS.TURNOS_MANDATO ?? 16,
  REUNIONES_GRATIS: EXCEL_PARAMS.REUNIONES_GRATIS ?? 1,
  INGRESO_BASE: EXCEL_PARAMS.INGRESO_BASE ?? 1000,
  GASTO_CORR_INICIAL: EXCEL_PARAMS.GASTO_CORR_INICIAL ?? 900,
  DEUDA_INICIAL: EXCEL_PARAMS.DEUDA_INICIAL ?? 3000,
  TASA_DEUDA: EXCEL_PARAMS.TASA_DEUDA ?? 0.05,
  CAJA_INICIAL: EXCEL_PARAMS.CAJA_INICIAL ?? 1500,
  ALFA_SAT: EXCEL_PARAMS.ALFA_SAT ?? 0.4,
  BETA_EXPECT: EXCEL_PARAMS.BETA_EXPECT ?? 0.1,
  K_REL: EXCEL_PARAMS.K_REL ?? 20,
  UMBRAL_LEY: EXCEL_PARAMS.UMBRAL_LEY ?? 50,
  LUNA_MIEL: EXCEL_PARAMS.LUNA_MIEL ?? 3,
  PESO_APRO_EN_IV: EXCEL_PARAMS.PESO_APRO_EN_IV ?? 0.65,
  PESO_ESTRUCTURA_EN_IV: EXCEL_PARAMS.PESO_ESTRUCTURA_EN_IV ?? 0.1,
  PESO_OTROS_EN_IV: EXCEL_PARAMS.PESO_OTROS_EN_IV ?? 0.25,
  // Valores del texto del Excel (no están en la tabla de parámetros).
  DESANCLAJE_INICIAL: 12,           // 01_INDICADORES: "12 (herencia)"
  LEG_OFICIALISMO_BASE: 38,         // 00B: LEG = 38 + 9 si REL(aliados)≥40
  LEG_ALIADOS: 9,
  LUNA_MIEL_LEG: 8,                 // 06_ARBOL: LEG +8 para acciones LEY si TURN ≤ 3
  UMBRAL_CANAL: 50,                 // 00B: D = max(0, UMBRAL − SAT)/UMBRAL
  VENTANA_DEMANDA: 6,               // 08: demanda atendida dentro de 6 turnos
  FRESCURA_INFO: 4,                 // 08: la información revelada queda fresca 4 turnos
  VOTOS_PARA_GANAR: 45,             // Umbral de victoria electoral (se conserva del juego)
  HIPER_UMBRAL: 90,                 // R-24 (aceptado por el usuario): INFL ≥ 90 dos turnos
  GOB_CRISIS_UMBRAL: 15,            // R-24 (aceptado): GOB < 15 dos turnos
  PLAZO_ACUERDO: 4,                 // Plazo de un compromiso (turnos). Provisional.
} as const;

// ─────────────────────────────── Acciones (04) ───────────────────────────────

export type UiCategory =
  | 'Economía y moneda' | 'Impuestos' | 'Producción y trabajo' | 'Social y salud'
  | 'Educación, ciencia y cultura' | 'Infraestructura' | 'Seguridad y justicia'
  | 'Instituciones y ambiente' | 'Exterior' | 'Política y relaciones';

export const UI_CATEGORIES: UiCategory[] = [
  'Economía y moneda', 'Impuestos', 'Producción y trabajo', 'Social y salud',
  'Educación, ciencia y cultura', 'Infraestructura', 'Seguridad y justicia',
  'Instituciones y ambiente', 'Exterior', 'Política y relaciones',
];

export type ActionTag = 'RESTRICTIVA' | 'FEDERAL' | 'AMBIENTAL';

/** Acciones de sistema: se ejecutan desde el panel de actores, no desde la grilla de políticas. */
export const SYSTEM_ACTION_IDS = ['reunion', 'negociacion', 'acuerdo', 'encuesta'] as const;
/** Acciones que financian (no son ingreso fiscal: 00B "emisión y préstamos NO son ingreso"). */
export const FINANCING_ACTION_IDS = ['emitir_dinero', 'prestamo_internacional', 'prestamo_local', 'privatizacion'];

export interface Requirement {
  /** Condición en el DSL del Excel. */
  when: string;
  /** Explicación para el jugador cuando no se cumple. */
  reason: string;
}

export interface CausalActionDef {
  id: string;
  name: string;
  description: string;
  strategic: string;
  category: UiCategory;
  paCost: number;
  caja: number;
  cooldown: number;
  ley: boolean;
  /** La acción LEY no admite ser habilitada por DNU. */
  leyNoDnu: boolean;
  tags: ActionTag[];
  requirements: Requirement[];
  /** Si se define y no se cumple, la acción ni aparece (ej. liberar un cepo que no existe). */
  visibleWhen?: string;
  unlocksText: string | null;
  risksText: string | null;
  directRelationText: string | null;
  isSystem: boolean;
  isFinancing: boolean;
  /** Ids del juego anterior que esta acción reemplaza o fusiona (09_AUDITORIA). */
  legacyIds: string[];
}

/**
 * Prerequisitos obligatorios (04 "Prerequisitos" + 06 "Obligatoria"). Las
 * bonificaciones se implementan como efectos condicionales en 05 o en el motor.
 * LEY (LEG ≥ umbral) se agrega automáticamente desde la columna LEY.
 */
const REQUIREMENTS: Record<string, Requirement[]> = {
  control_cambios: [{ when: 'not FLAG(cepo)', reason: 'Ya hay un control de cambios vigente.' }],
  liberar_cambios: [
    { when: 'FLAG(cepo)', reason: 'Sólo se puede liberar un cepo vigente.' },
    { when: 'EXTE>=45', reason: 'Primero hay que reconstruir reservas (sector externo más sólido).' },
  ],
  prestamo_local: [
    { when: 'SOLV>=25', reason: 'Con este riesgo país el mercado local está cerrado.' },
    { when: 'SAT(financiero)>=35', reason: 'El sector financiero cerró el grifo.' },
  ],
  reforma_tributaria: [{ when: 'DONE(mejorar_recaudacion,99)', reason: 'Primero hay que fortalecer la administración tributaria.' }],
  desarrollo_energetico_minero: [{ when: 'FLAG(estudio_vigente)', reason: 'Requiere un estudio de factibilidad vigente.' }],
  tratado_comercio: [{ when: 'DONE(agenda_internacional,6)', reason: 'Requiere gestión diplomática previa (agenda internacional en los últimos 6 turnos).' }],
  pacto_social: [
    { when: 'REL(sindicatos)>=50', reason: 'La relación con los sindicatos no alcanza.' },
    { when: 'REL(industria)>=50', reason: 'La relación con la industria no alcanza.' },
    { when: 'REL(pymes)>=45', reason: 'La relación con las PyMEs no alcanza.' },
    { when: 'DONE(reunion_sindicatos,4) and DONE(reunion_industria,4) and DONE(reunion_pymes,4)', reason: 'Hay que haberse reunido con sindicatos, industria y PyMEs en los últimos 4 turnos.' },
  ],
  plan_viviendas: [{ when: 'CAJA>=400', reason: 'Hace falta caja para lanzar el plan.' }],
  construccion_hospitales: [{ when: 'FLAG(estudio_vigente)', reason: 'Requiere un estudio de factibilidad vigente.' }],
  infraestructura_vial: [{ when: 'FLAG(estudio_vigente)', reason: 'Requiere un estudio de factibilidad vigente.' }],
  infraestructura_energetica: [{ when: 'FLAG(estudio_vigente) or FLAG(crisis_energetica)', reason: 'Requiere un estudio de factibilidad vigente (o una emergencia energética).' }],
  energia_renovable: [{ when: 'FLAG(estudio_vigente)', reason: 'Requiere un estudio de factibilidad vigente.' }],
  obras_hidricas: [{ when: 'FLAG(estudio_vigente)', reason: 'Requiere un estudio de factibilidad vigente.' }],
  lucha_narcotrafico: [{ when: 'DONE(fortalecimiento_justicia,99)', reason: 'Sin fiscales y jueces los operativos no condenan: primero fortalecer la justicia.' }],
  ampliar_coalicion: [{ when: 'FLAG(reunido_aliados) or FLAG(reunido_oposicion)', reason: 'Hay que reunirse antes con aliados u oposición.' }],
};

const VISIBLE_WHEN: Record<string, string> = {
  liberar_cambios: 'FLAG(cepo)',
};

function parseTags(tags: string[]): ActionTag[] {
  return tags.map(t => t.toUpperCase()).filter((t): t is ActionTag => ['RESTRICTIVA', 'FEDERAL', 'AMBIENTAL'].includes(t));
}

const LEGACY_IDS: Record<string, string[]> = (() => {
  const map: Record<string, string[]> = {};
  for (const row of AUDIT_ROWS) {
    for (const newId of row.newIds) {
      (map[newId] ??= []).push(row.oldId);
    }
  }
  return map;
})();

function toActionDef(r: ActionRow): CausalActionDef {
  const leyText = (r.leyText ?? '').toUpperCase();
  const isSystem = (SYSTEM_ACTION_IDS as readonly string[]).includes(r.id);
  return {
    id: r.id,
    name: r.name ?? r.id,
    description: r.description ?? '',
    strategic: r.strategic ?? '',
    category: (r.uiCategory ?? 'Política y relaciones') as UiCategory,
    paCost: isSystem && r.id === 'reunion' ? 1 : r.paCost ?? 1,
    caja: r.caja,
    cooldown: r.cooldown,
    ley: leyText.startsWith('LEY'),
    leyNoDnu: leyText.includes('NO ADMITE DNU'),
    tags: parseTags(r.tags),
    requirements: REQUIREMENTS[r.id] ?? [],
    visibleWhen: VISIBLE_WHEN[r.id],
    unlocksText: r.unlocksText,
    risksText: r.risksText,
    directRelationText: r.directRelationText,
    isSystem,
    isFinancing: FINANCING_ACTION_IDS.includes(r.id),
    legacyIds: LEGACY_IDS[r.id] ?? [],
  };
}

export const CAUSAL_ACTIONS: CausalActionDef[] = ACTION_ROWS.map(toActionDef);
export const CAUSAL_ACTIONS_BY_ID: Record<string, CausalActionDef> = Object.fromEntries(CAUSAL_ACTIONS.map(a => [a.id, a]));
export const POLICY_ACTIONS: CausalActionDef[] = CAUSAL_ACTIONS.filter(a => !a.isSystem);

/** Obras con descuento por estudio de factibilidad (06: "Habilita + costo −20%"). */
export const INFRA_DISCOUNT_ACTIONS = ['infraestructura_vial', 'infraestructura_energetica', 'energia_renovable', 'obras_hidricas', 'construccion_hospitales'];

// ─────────────────────────────── Efectos (05) ───────────────────────────────

export const EFFECTS: EffectRow[] = EFFECT_ROWS;
export const EFFECTS_BY_ACTION: Record<string, EffectRow[]> = EFFECT_ROWS.reduce((acc, e) => {
  (acc[e.actionId] ??= []).push(e);
  return acc;
}, {} as Record<string, EffectRow[]>);

// ─────────────────────────────── Reuniones (08) ───────────────────────────────

export const MEETINGS: Record<ActorId, MeetingRow> = Object.fromEntries(
  MEETING_ROWS.map(m => [m.actor, m]),
) as Record<ActorId, MeetingRow>;

// ─────────────────────────────── Compatibilidad con el juego anterior ───────────────────────────────

/**
 * Subgrupos del juego anterior → actor nuevo (D-02). Se usa para traducir
 * efectos de eventos (`group_<id>`) y referencias de asesores/habilidades.
 * Deportistas y minorías étnicas no tienen actor propio en el MVP: se asignan
 * al actor que representa su canal (sectores populares).
 */
export const LEGACY_GROUP_TO_ACTOR: Record<string, ActorId> = {
  empresarios: 'industria',
  'sector-agricola': 'agro',
  'sector-financiero': 'financiero',
  sindicatos: 'sindicatos',
  'clase-media': 'clase_media',
  'sectores-populares': 'sectores_populares',
  'clase-alta': 'financiero',
  'minorias-etnicas': 'sectores_populares',
  ongs: 'derechos_cultura',
  ambientalistas: 'ambiente',
  feministas: 'derechos_cultura',
  estudiantiles: 'estudiantes',
  cooperativas: 'org_sociales',
  aliados: 'aliados',
  opositores: 'oposicion',
  artistas: 'derechos_cultura',
  deportistas: 'sectores_populares',
  academicos: 'cientificos',
};

/** id viejo de acción → id nuevo (09_AUDITORIA). */
export const LEGACY_ACTION_TO_NEW: Record<string, string> = Object.fromEntries(
  AUDIT_ROWS.flatMap(r => {
    const known = r.newIds.filter(id => CAUSAL_ACTIONS_BY_ID[id]);
    const policy = known.find(id => !CAUSAL_ACTIONS_BY_ID[id].isSystem) ?? known[0];
    return policy ? [[r.oldId, policy]] : [];
  }),
);
