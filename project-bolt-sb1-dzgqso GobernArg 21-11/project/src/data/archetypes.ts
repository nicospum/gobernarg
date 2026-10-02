import type { Archetype } from '../types/game';
import type { ActorId } from './causal';

/**
 * Ventajas fijas (pasivas) de cada perfil. Las que mueven el motor causal se
 * aplican en causalBridge (newCausalForGame y computePerks).
 */
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
