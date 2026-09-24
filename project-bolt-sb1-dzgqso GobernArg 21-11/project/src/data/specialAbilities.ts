import type { Archetype } from '../types/game';
import type { ActorId } from './causal';

/**
 * Efecto de una habilidad sobre el motor causal. Targets:
 *   'imagen' (componente OTROS de la intención de voto), 'CAJA',
 *   indicadores del país ('CONF', 'INVC', 'EXTE', …), 'REL:<actor>'.
 * mode BONUS = temporal durante `duration` turnos; DELTA = permanente.
 */
export interface AbilityEffect {
  target: string;
  value: number;
  mode?: 'DELTA' | 'BONUS';
  duration?: number;
}

export interface SpecialAbility {
  id: string;
  name: string;
  description: string;
  cooldown: number;
  cost: {
    /** Caja ($M). */
    budget?: number;
    /** Imagen del presidente que se resigna. */
    imagen?: number;
    actions?: number;
  };
  effects: AbilityEffect[];
}

/**
 * Habilidades de arquetipo. Mismos nombres, descripciones y cooldowns que el
 * juego anterior; los efectos se tradujeron al motor causal: lo que antes era
 * "+popularidad" pasa a imagen del presidente, "estabilidad" a conflictividad,
 * "legitimidad" a instituciones y los "+apoyo de grupos" a relación, sólo con
 * los actores con los que la habilidad es un vínculo directo (DC-4).
 */
export const ARCHETYPE_ABILITIES: Record<Archetype, SpecialAbility[]> = {
  politico: [
    {
      id: 'discurso_patriotico',
      name: 'Discurso Patriótico',
      description: 'Un discurso que enciende el fervor popular y une a la nación.',
      cooldown: 4,
      cost: { budget: 30, actions: 1 },
      effects: [
        { target: 'imagen', value: 6 },
        { target: 'CONF', value: -3, mode: 'BONUS', duration: 2 },
        { target: 'REL:oficialismo', value: 4 },
        { target: 'REL:aliados', value: 4 },
      ],
    },
    {
      id: 'pacto_gobernabilidad',
      name: 'Pacto de Gobernabilidad',
      description: 'Unís aliados y opositores en un acuerdo que estabiliza el sistema político.',
      cooldown: 5,
      cost: { budget: 100, actions: 1 },
      effects: [
        { target: 'REL:aliados', value: 5 },
        { target: 'REL:oposicion', value: 6 },
        { target: 'CONF', value: -3, mode: 'BONUS', duration: 2 },
      ],
    },
  ],
  empresario: [
    {
      id: 'inversion_privada',
      name: 'Inversión Privada',
      description: 'Movilizás contactos del sector privado para inyectar capital.',
      cooldown: 5,
      cost: { imagen: 2, actions: 1 },
      effects: [
        { target: 'INVC', value: 4 },
        { target: 'CAJA', value: 200 },
        { target: 'REL:industria', value: 4 },
        { target: 'REL:financiero', value: 3 },
      ],
    },
    {
      id: 'llamado_inversores',
      name: 'Llamado a Inversores',
      description: 'Convocás a inversores nacionales e internacionales para inyectar capital fresco.',
      cooldown: 6,
      cost: { actions: 1 },
      effects: [
        { target: 'INVC', value: 3 },
        { target: 'EXTE', value: 3 },
        { target: 'REL:financiero', value: 4 },
      ],
    },
  ],
  sindicalista: [
    {
      id: 'movilizacion_social',
      name: 'Movilización Social',
      description: 'Convocás una gran movilización popular que demuestra tu base de apoyo.',
      cooldown: 4,
      cost: { budget: 50, actions: 1 },
      effects: [
        { target: 'imagen', value: 4 },
        { target: 'REL:sindicatos', value: 6 },
        { target: 'REL:org_sociales', value: 6 },
        { target: 'CONF', value: 3 },
      ],
    },
    {
      id: 'paro_controlado',
      name: 'Paro Controlado',
      description: 'Convocás un paro estratégico que presiona al establishment sin desbordar el orden.',
      cooldown: 5,
      cost: { actions: 1 },
      effects: [
        { target: 'REL:sindicatos', value: 8 },
        { target: 'REL:org_sociales', value: 5 },
        { target: 'REL:industria', value: -6 },
        { target: 'CONF', value: 5 },
        { target: 'ACTV', value: -2, mode: 'BONUS', duration: 1 },
      ],
    },
  ],
  comunicador: [
    {
      id: 'campania_mediatica',
      name: 'Campaña Mediática',
      description: 'Desplegás una campaña en medios que mejora la percepción pública.',
      cooldown: 3,
      cost: { budget: 80, actions: 1 },
      effects: [{ target: 'imagen', value: 5 }],
    },
    {
      id: 'gira_medios',
      name: 'Gira de Medios',
      description: 'Recorrés los principales medios del país con una ofensiva comunicacional.',
      cooldown: 6,
      cost: { budget: 50, actions: 1 },
      effects: [
        { target: 'imagen', value: 7 },
        { target: 'REL:aliados', value: 3 },
      ],
    },
  ],
};

// Sprint 4: Habilidades pasivas por arquetipo
export interface ArchetypePassive {
  name: string;
  description: string;
  incomeBonus?: number;           // eficiencia recaudatoria (motor: INGRESO_MULT + incomeBonus × 0.15)
  electionRetention?: number;     // aparato propio (motor: ESTRUCTURA × (1 + 2·retención))
  freeInteractionGroups?: string[]; // reuniones sin costo de PA con estos grupos
  eventResilience?: number;       // amortigua golpes de eventos sobre la imagen
  extraActions?: number;          // motor: reuniones gratis extra por turno
  extraLoans?: number;            // motor: préstamos en mejores condiciones (−10% de deuda por unidad)
  // Ejes ideológicos: ya no mueven mecánicas (D-07). Se conservan como perfil
  // narrativo de gestión en la pantalla de legado.
  radicalConciliadorShift?: number;
  populistaTecnicoShift?: number;
  cerradoConvocanteShift?: number;
  /** Bonificaciones iniciales en el motor causal. */
  start?: {
    relBonus?: Partial<Record<ActorId, number>>;
    imagen?: number;
    desanclaje?: number;
    freePolls?: boolean;
  };
}

export const ARCHETYPE_PASSIVES: Record<Archetype, ArchetypePassive[]> = {
  politico: [
    { name: 'Oficialismo', description: 'El aparato propio pesa más en la elección (estructura +20%)', electionRetention: 0.10 },
    { name: 'Constructor de alianzas', description: 'Reuniones con los aliados sin costo de acción', freeInteractionGroups: ['aliados'] },
    { name: 'Consenso político', description: 'La oposición arranca con mejor relación (+10)', radicalConciliadorShift: 2, cerradoConvocanteShift: 1, start: { relBonus: { oposicion: 10 } } },
  ],
  empresario: [
    { name: 'Eficiencia económica', description: 'Administración más eficiente: recaudación +3%', incomeBonus: 0.20 },
    { name: 'Red de contactos', description: 'Préstamos en mejores condiciones (−10% de deuda) y +10 de relación con el sector financiero', extraLoans: 1, start: { relBonus: { financiero: 10 } } },
    { name: 'Ortodoxia económica', description: 'Credibilidad de mercado: expectativas de inflación más ancladas al asumir', populistaTecnicoShift: 2, cerradoConvocanteShift: -1, start: { desanclaje: 8, relBonus: { industria: 5 } } },
  ],
  sindicalista: [
    { name: 'Base movilizada', description: 'Reuniones con sindicatos y organizaciones sociales sin costo de acción', freeInteractionGroups: ['sindicatos', 'sectores-populares'] },
    { name: 'Piso de contención', description: 'Una reunión gratis extra por turno', extraActions: 1 },
    { name: 'Lucha obrera', description: 'Sindicatos y organizaciones sociales arrancan con +15 de relación', radicalConciliadorShift: -2, populistaTecnicoShift: -2, start: { relBonus: { sindicatos: 15, org_sociales: 15 } } },
  ],
  comunicador: [
    { name: 'Blindaje mediático', description: 'Los escándalos golpean 30% menos tu imagen', eventResilience: 0.30 },
    { name: 'Agenda setting', description: 'Arrancás con mejor imagen pública (+10)', incomeBonus: 0, start: { imagen: 10 } },
    { name: 'Alfombra roja', description: 'Encuestas gratis durante todo el mandato', cerradoConvocanteShift: 2, start: { freePolls: true } },
  ],
};
