import type { GameEvent } from '../../systems/events/types';

/**
 * Conexión de los eventos existentes con el motor causal.
 *
 * Los eventos del juego (textos, imágenes, opciones) se conservan tal cual.
 * Lo que cambia es:
 *  - cuándo ocurren: `when` es una condición del DSL del Excel sobre
 *    indicadores, actores y decisiones previas (reemplaza los umbrales de
 *    popularidad/estabilidad/presupuesto del motor viejo);
 *  - qué producen: efectos sobre el país (indicadores), la caja, la imagen
 *    del presidente o la relación con actores concretos.
 *
 * Targets: indicador ('CONF', 'INFL'…), 'CAJA', 'DEUDA', 'GASTO_CORR',
 * 'DESANCLAJE', 'imagen', 'LEG', 'REL:<actor>', 'FLAG:<nombre>'.
 * mode BONUS = temporal (duration turnos); por defecto DELTA permanente.
 * Lo que no esté acá se traduce con translateLegacyEffect (causalBridge).
 */
export interface CausalEventEffect {
  target: string;
  value: number;
  mode?: 'DELTA' | 'BONUS';
  duration?: number;
}

export interface EventCausalDef {
  when?: string;
  /** Efectos al dispararse (antes de elegir). */
  effects?: CausalEventEffect[];
  choices?: Record<string, CausalEventEffect[]>;
}

export const EVENT_CAUSAL: Record<string, EventCausalDef> = {
  // ── Económicos ──
  inflation_crisis: {
    when: 'INFL>=75',
    effects: [{ target: 'CONF', value: 6 }, { target: 'imagen', value: -6 }],
    choices: {
      austerity: [{ target: 'GASTO_CORR', value: -60 }, { target: 'PSOC', value: -2 }, { target: 'CONF', value: 3 }, { target: 'DESANCLAJE', value: -3 }],
      price_controls: [{ target: 'INFL', value: -4, mode: 'BONUS', duration: 2 }, { target: 'INVC', value: -2 }, { target: 'REL:industria', value: -4 }],
    },
  },
  foreign_investment: {
    when: 'INST>=48 and SOLV>=45',
    effects: [],
    choices: {
      welcome_investment: [{ target: 'INVC', value: 4 }, { target: 'EXTE', value: 2 }, { target: 'AMBI', value: -1 }],
      restrict_investment: [{ target: 'INVC', value: 1 }, { target: 'REL:sindicatos', value: 3 }],
    },
  },
  // ── Sociales ──
  student_protests: {
    when: 'SAT(estudiantes)<40',
    effects: [{ target: 'CONF', value: 4 }],
    choices: {
      increase_funding: [{ target: 'CAJA', value: -300 }, { target: 'EDUC', value: 2 }, { target: 'REL:estudiantes', value: 6 }],
      minimal_changes: [{ target: 'CAJA', value: -100 }, { target: 'REL:estudiantes', value: -4 }],
    },
  },
  healthcare_crisis: {
    when: 'PSOC<40',
    effects: [{ target: 'PSOC', value: -2 }, { target: 'CONF', value: 3 }],
    choices: {
      emergency_funding: [{ target: 'CAJA', value: -400 }, { target: 'PSOC', value: 4 }],
      private_partnership: [{ target: 'CAJA', value: -200 }, { target: 'PSOC', value: 2 }, { target: 'REL:sindicatos', value: -4 }],
    },
  },
  // ── Políticos ──
  coalition_opportunity: {
    when: 'REL(aliados)>=45 and IV>=35',
    effects: [],
    choices: {
      accept_coalition: [{ target: 'LEG', value: 4 }, { target: 'REL:aliados', value: 6 }, { target: 'REL:oficialismo', value: -2 }],
      reject_coalition: [{ target: 'REL:aliados', value: -4 }],
    },
  },
  legislative_block: {
    when: 'LEG<48 and (SAT(oposicion)<40 or REL(oposicion)<35)',
    effects: [{ target: 'imagen', value: -3 }],
    choices: {
      negotiate: [{ target: 'CAJA', value: -200 }, { target: 'REL:oposicion', value: 8 }, { target: 'REL:aliados', value: 3 }],
      force_agenda: [{ target: 'REL:oposicion', value: -8 }, { target: 'INST', value: -2 }, { target: 'imagen', value: -2 }],
    },
  },
  // ── Registro de eventos pendientes (pendingEvents.ts) ──
  police_violence_scandal: {
    when: 'INST<50',
    effects: [{ target: 'INST', value: -2 }, { target: 'CONF', value: 3 }, { target: 'imagen', value: -4 }],
    choices: {
      investigate: [{ target: 'CAJA', value: -150 }, { target: 'INST', value: 2 }, { target: 'REL:derechos_cultura', value: 5 }],
      defend_police: [{ target: 'INST', value: -2 }, { target: 'REL:derechos_cultura', value: -6 }, { target: 'SEGU', value: 1 }],
    },
  },
  minister_resignation: {
    when: 'GOB<35',
    effects: [{ target: 'imagen', value: -3 }],
    choices: {
      accept: [{ target: 'REL:oficialismo', value: 2 }],
      convince: [{ target: 'REL:oficialismo', value: 4 }, { target: 'imagen', value: 1 }],
    },
  },
  debt_default: {
    when: 'SOLV<25 and DEUDA>=3800',
    effects: [{ target: 'SOLV', value: -8, mode: 'BONUS', duration: 3 }, { target: 'EXTE', value: -4 }, { target: 'imagen', value: -4 }],
    choices: {
      renegotiate: [{ target: 'CAJA', value: -300 }, { target: 'SOLV', value: 5, mode: 'BONUS', duration: 3 }, { target: 'REL:financiero', value: 5 }],
      default: [{ target: 'CAJA', value: 200 }, { target: 'DEUDA', value: -800 }, { target: 'SOLV', value: -10 }, { target: 'INST', value: -3 }, { target: 'REL:financiero', value: -15 }],
    },
  },
  energy_crisis: {
    when: 'INFR<40 or COUNT(congelar_tarifas,8)>=2',
    // 06_ARBOL: "evento crisis_energetica → infraestructura energética sin estudio previo, −30% costo".
    effects: [{ target: 'ACTV', value: -2, mode: 'BONUS', duration: 2 }, { target: 'CONF', value: 3 }, { target: 'FLAG:crisis_energetica', value: 1, duration: 6 }],
    choices: {
      invest: [{ target: 'CAJA', value: -400 }, { target: 'INFR', value: 3 }],
      rate_hike: [{ target: 'PODA', value: -2 }, { target: 'INFL', value: 2 }, { target: 'CAJA', value: 200 }, { target: 'INFR', value: 1 }],
    },
  },
  general_strike: {
    // Lo dispara el canal de sindicatos (paro general), no el sorteo aleatorio.
    effects: [],
    choices: {
      negotiate: [{ target: 'CAJA', value: -150 }, { target: 'REL:sindicatos', value: 6 }, { target: 'PODA', value: 1 }],
      deduct_pay: [{ target: 'CAJA', value: 50 }, { target: 'REL:sindicatos', value: -8 }, { target: 'CONF', value: 2 }],
    },
  },
  heat_wave: {
    when: 'INFR<48',
    effects: [{ target: 'PSOC', value: -1 }, { target: 'imagen', value: -2 }],
    choices: {
      emergency: [{ target: 'CAJA', value: -150 }, { target: 'PSOC', value: 2 }, { target: 'imagen', value: 2 }],
    },
  },
  diplomatic_conflict: {
    effects: [{ target: 'EXTE', value: -2 }, { target: 'imagen', value: -2 }],
    choices: {
      escalate: [{ target: 'imagen', value: 3 }, { target: 'EXTE', value: -2 }],
      mediate: [{ target: 'CAJA', value: -100 }, { target: 'EXTE', value: 1 }],
    },
  },
  external_sanctions: {
    when: 'INST<42',
    effects: [{ target: 'EXTE', value: -4 }, { target: 'INVC', value: -2 }],
    choices: {
      accept: [{ target: 'CAJA', value: -200 }, { target: 'INST', value: 2 }, { target: 'EXTE', value: 2 }],
    },
  },
  flood: {
    effects: [{ target: 'INFR', value: -3 }, { target: 'PSOC', value: -2 }, { target: 'CAJA', value: -150 }],
    choices: {
      help: [{ target: 'CAJA', value: -200 }, { target: 'PSOC', value: 3 }, { target: 'imagen', value: 3 }, { target: 'REL:gobernadores', value: 4 }],
    },
  },
  drought: {
    effects: [{ target: 'EXTE', value: -4 }, { target: 'ACTV', value: -1 }],
    choices: {
      subsidies: [{ target: 'CAJA', value: -300 }, { target: 'EXTE', value: 2 }, { target: 'REL:agro', value: 6 }],
    },
  },
  prison_riot: {
    when: 'SEGU<40',
    effects: [{ target: 'SEGU', value: -2 }, { target: 'imagen', value: -3 }],
    choices: {
      negotiate: [{ target: 'CAJA', value: -100 }, { target: 'SEGU', value: 1 }, { target: 'INST', value: 1 }],
    },
  },
  drug_wave: {
    when: 'SEGU<40',
    effects: [{ target: 'SEGU', value: -3 }, { target: 'imagen', value: -3 }],
    choices: {
      security_op: [{ target: 'CAJA', value: -300 }, { target: 'SEGU', value: 3 }, { target: 'INST', value: -1 }],
    },
  },
};

/** Eventos del pool viejo que ahora dispara un canal de poder (no el sorteo). */
export const CHANNEL_DRIVEN_EVENT_IDS = ['general_strike'];

/**
 * Eventos de canal (07_CANALES) presentados al jugador con opciones de
 * respuesta. Los efectos del canal ya se aplicaron; las opciones son la
 * reacción del gobierno. `paro_general` reutiliza el evento `general_strike`.
 */
export const CHANNEL_GAME_EVENTS: Record<string, GameEvent & { causal: EventCausalDef }> = {
  paro_agrario: {
    id: 'paro_agrario', type: 'triggered', category: 'economic', severity: 'high',
    title: 'Paro agrario',
    description: 'Cortes de ruta y lockout: el campo frena la comercialización de granos.',
    conditions: {}, probability: 1,
    effects: { immediate: [] },
    choices: [
      { id: 'dialogar', text: 'Abrir una mesa de diálogo con las entidades', effects: { immediate: [] } },
      { id: 'endurecer', text: 'Liberar las rutas con fuerzas federales', effects: { immediate: [] } },
    ],
    causal: { choices: {
      dialogar: [{ target: 'REL:agro', value: 5 }],
      endurecer: [{ target: 'CONF', value: -3 }, { target: 'INST', value: -1 }, { target: 'REL:agro', value: -6 }],
    } },
  },
  corrida: {
    id: 'corrida', type: 'triggered', category: 'economic', severity: 'critical',
    title: 'Corrida cambiaria',
    description: 'Los ahorristas se refugian en el dólar y las reservas caen en pocos días.',
    conditions: {}, probability: 1,
    effects: { immediate: [] },
    choices: [
      { id: 'tasas', text: 'Suba de tasas de emergencia', effects: { immediate: [] } },
      { id: 'controles', text: 'Endurecer los controles cambiarios', effects: { immediate: [] } },
      { id: 'resistir', text: 'Dejar que el mercado se acomode', effects: { immediate: [] } },
    ],
    causal: { choices: {
      tasas: [{ target: 'EXTE', value: 4 }, { target: 'INVC', value: -3 }, { target: 'ACTV', value: -1 }],
      controles: [{ target: 'EXTE', value: 3 }, { target: 'INST', value: -2 }, { target: 'INVC', value: -1 }],
      resistir: [{ target: 'INFL', value: 2 }, { target: 'DESANCLAJE', value: 2 }],
    } },
  },
  cacerolazo: {
    id: 'cacerolazo', type: 'triggered', category: 'social', severity: 'high',
    title: 'Cacerolazo',
    description: 'Miles de personas de clase media salen a la calle con cacerolas contra el gobierno.',
    conditions: {}, probability: 1,
    effects: { immediate: [] },
    choices: [
      { id: 'cadena', text: 'Cadena nacional para dar explicaciones', effects: { immediate: [] } },
      { id: 'ignorar', text: 'Minimizar la protesta', effects: { immediate: [] } },
    ],
    causal: { choices: {
      cadena: [{ target: 'imagen', value: 2 }, { target: 'CONF', value: -1 }],
      ignorar: [{ target: 'imagen', value: -3 }],
    } },
  },
  estallido: {
    id: 'estallido', type: 'triggered', category: 'social', severity: 'critical',
    title: 'Estallido social',
    description: 'Saqueos y disturbios en los barrios más castigados por la crisis.',
    conditions: {}, probability: 1,
    effects: { immediate: [] },
    choices: [
      { id: 'asistencia', text: 'Asistencia alimentaria de emergencia', effects: { immediate: [] } },
      { id: 'despliegue', text: 'Desplegar fuerzas de seguridad', effects: { immediate: [] } },
    ],
    causal: { choices: {
      asistencia: [{ target: 'CAJA', value: -150 }, { target: 'PSOC', value: 3 }, { target: 'CONF', value: -5 }],
      despliegue: [{ target: 'CONF', value: -6 }, { target: 'INST', value: -3 }, { target: 'SEGU', value: 2 }],
    } },
  },
  marcha_federal: {
    id: 'marcha_federal', type: 'triggered', category: 'social', severity: 'medium',
    title: 'Marcha federal educativa',
    description: 'Una movilización masiva instala la educación en el centro de la agenda pública.',
    conditions: {}, probability: 1,
    effects: { immediate: [] },
    choices: [
      { id: 'recibir', text: 'Recibir a rectores y centros de estudiantes', effects: { immediate: [] } },
      { id: 'minimizar', text: 'Decir que la marcha es política', effects: { immediate: [] } },
    ],
    causal: { choices: {
      recibir: [{ target: 'REL:estudiantes', value: 5 }, { target: 'REL:docentes', value: 2 }],
      minimizar: [{ target: 'imagen', value: -2 }, { target: 'REL:estudiantes', value: -4 }],
    } },
  },
  paro_docente: {
    id: 'paro_docente', type: 'triggered', category: 'social', severity: 'high',
    title: 'Paro docente por tiempo indeterminado',
    description: 'Las escuelas cierran: los días de clase perdidos no se recuperan.',
    conditions: {}, probability: 1,
    effects: { immediate: [] },
    choices: [
      { id: 'paritaria', text: 'Reabrir la paritaria docente', effects: { immediate: [] } },
      { id: 'descontar', text: 'Descontar los días de paro', effects: { immediate: [] } },
    ],
    causal: { choices: {
      paritaria: [{ target: 'CAJA', value: -100 }, { target: 'EDUC', value: 1 }, { target: 'REL:docentes', value: 6 }],
      descontar: [{ target: 'CAJA', value: 50 }, { target: 'REL:docentes', value: -8 }],
    } },
  },
  plan_de_lucha: {
    id: 'plan_de_lucha', type: 'triggered', category: 'social', severity: 'high',
    title: 'Plan de lucha de las organizaciones sociales',
    description: 'Cortes en los accesos a las principales ciudades y acampes frente a los ministerios.',
    conditions: {}, probability: 1,
    effects: { immediate: [] },
    choices: [
      { id: 'mesa', text: 'Convocar una mesa con las organizaciones', effects: { immediate: [] } },
      { id: 'protocolo', text: 'Aplicar el protocolo antipiquetes', effects: { immediate: [] } },
    ],
    causal: { choices: {
      mesa: [{ target: 'REL:org_sociales', value: 5 }],
      protocolo: [{ target: 'CONF', value: -4 }, { target: 'INST', value: -2 }, { target: 'REL:org_sociales', value: -6 }],
    } },
  },
  ruptura_oficialismo: {
    id: 'ruptura_oficialismo', type: 'triggered', category: 'political', severity: 'critical',
    title: 'Ruptura del bloque oficialista',
    description: 'Un sector de tu propio partido arma bloque aparte en el Congreso. Perdés bancas para siempre.',
    conditions: {}, probability: 1,
    effects: { immediate: [] },
    choices: [{ id: 'asumir', text: 'Reorganizar el bloque que queda', effects: { immediate: [] } }],
    causal: { choices: { asumir: [{ target: 'REL:oficialismo', value: 3 }] } },
  },
  salida_coalicion: {
    id: 'salida_coalicion', type: 'triggered', category: 'political', severity: 'critical',
    title: 'Los aliados abandonan la coalición',
    description: 'Los socios dejan el gobierno y se llevan sus bancas.',
    conditions: {}, probability: 1,
    effects: { immediate: [] },
    choices: [{ id: 'asumir', text: 'Gobernar en minoría', effects: { immediate: [] } }],
    causal: { choices: { asumir: [] } },
  },
};

/** Evento del canal → evento a mostrar (reutiliza eventos existentes cuando los hay). */
export const CHANNEL_TO_EVENT: Record<string, string> = {
  paro_general: 'general_strike',
};
