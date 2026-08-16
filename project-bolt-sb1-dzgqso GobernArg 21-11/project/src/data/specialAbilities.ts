import type { Archetype } from '../types/game';

export interface SpecialAbility {
  id: string;
  name: string;
  description: string;
  cooldown: number;
  cost: {
    budget?: number;
    popularity?: number;
    legitimacy?: number;
    actions?: number;
  };
  effects: {
    popularityChange?: number;
    budgetChange?: number;
    stabilityChange?: number;
    legitimacyChange?: number;
    groupEffects?: { groupId: string; supportChange: number }[];
  };
}

export const ARCHETYPE_ABILITIES: Record<Archetype, SpecialAbility[]> = {
  politico: [
    {
      id: 'discurso_patriotico',
      name: 'Discurso Patriótico',
      description: 'Un discurso que enciende el fervor popular y une a la nación.',
      cooldown: 4,
      cost: { budget: 30, actions: 1 },
      effects: {
        popularityChange: 12,
        stabilityChange: 5,
        legitimacyChange: 8,
        groupEffects: [
          { groupId: 'aliados', supportChange: 8 },
          { groupId: 'clase-media', supportChange: 5 }
        ]
      }
    },
    {
      id: 'pacto_gobernabilidad',
      name: 'Pacto de Gobernabilidad',
      description: 'Unís aliados y opositores en un acuerdo que estabiliza el sistema político.',
      cooldown: 5,
      cost: { budget: 100, actions: 1 },
      effects: {
        stabilityChange: 10,
        legitimacyChange: 5,
        groupEffects: [
          { groupId: 'aliados', supportChange: 5 },
          { groupId: 'opositores', supportChange: 5 }
        ]
      }
    }
  ],
  empresario: [
    {
      id: 'inversion_privada',
      name: 'Inversión Privada',
      description: 'Movilizás contactos del sector privado para inyectar capital.',
      cooldown: 5,
      cost: { popularity: -3, actions: 1 },
      effects: {
        budgetChange: 400,
        stabilityChange: -3,
        groupEffects: [
          { groupId: 'empresarios', supportChange: 10 },
          { groupId: 'sector-financiero', supportChange: 8 },
          { groupId: 'sindicatos', supportChange: -8 },
          { groupId: 'sectores-populares', supportChange: -4 }
        ]
      }
    },
    {
      id: 'llamado_inversores',
      name: 'Llamado a Inversores',
      description: 'Convocás a inversores nacionales e internacionales para inyectar capital fresco.',
      cooldown: 6,
      cost: { actions: 1 },
      effects: {
        budgetChange: 500,
        legitimacyChange: -5,
        groupEffects: [
          { groupId: 'empresarios', supportChange: 8 },
          { groupId: 'sector-financiero', supportChange: 5 }
        ]
      }
    }
  ],
  sindicalista: [
    {
      id: 'movilizacion_social',
      name: 'Movilización Social',
      description: 'Convocás una gran movilización popular que demuestra tu base de apoyo.',
      cooldown: 4,
      cost: { budget: 50, actions: 1 },
      effects: {
        popularityChange: 8,
        stabilityChange: -5,
        legitimacyChange: 5,
        groupEffects: [
          { groupId: 'sindicatos', supportChange: 12 },
          { groupId: 'sectores-populares', supportChange: 10 },
          { groupId: 'empresarios', supportChange: -6 },
          { groupId: 'clase-alta', supportChange: -5 }
        ]
      }
    },
    {
      id: 'paro_controlado',
      name: 'Paro Controlado',
      description: 'Convocás un paro estratégico que presiona al establishment sin desbordar el orden.',
      cooldown: 5,
      cost: { actions: 1 },
      effects: {
        popularityChange: 5,
        stabilityChange: -8,
        groupEffects: [
          { groupId: 'empresarios', supportChange: -10 },
          { groupId: 'sindicatos', supportChange: 15 },
          { groupId: 'sectores-populares', supportChange: 15 }
        ]
      }
    }
  ],
  comunicador: [
    {
      id: 'campania_mediatica',
      name: 'Campaña Mediática',
      description: 'Desplegás una campaña en medios que mejora la percepción pública.',
      cooldown: 3,
      cost: { budget: 80, actions: 1 },
      effects: {
        popularityChange: 10,
        groupEffects: [
          { groupId: 'clase-media', supportChange: 6 },
          { groupId: 'aliados', supportChange: 4 }
        ]
      }
    },
    {
      id: 'gira_medios',
      name: 'Gira de Medios',
      description: 'Recorrés los principales medios del país con una ofensiva comunicacional.',
      cooldown: 6,
      cost: { budget: 50, actions: 1 },
      effects: {
        popularityChange: 15,
        groupEffects: [
          { groupId: 'clase-media', supportChange: 4 },
          { groupId: 'aliados', supportChange: 3 }
        ]
      }
    }
  ]
};

// Sprint 4: Habilidades pasivas por arquetipo
export interface ArchetypePassive {
  name: string;
  description: string;
  incomeBonus?: number;           // multiplicador de ingresos (ej: 0.20 = +20%)
  electionRetention?: number;     // bonus de retención de voto (ej: 0.10 = +10%)
  freeInteractionGroups?: string[]; // grupos con interacción gratis
  eventResilience?: number;       // reduce impacto de eventos negativos (ej: 0.30 = -30%)
  extraActions?: number;          // acciones base extra
  extraLoans?: number;            // préstamos extra permitidos
  // Sprint 5: Ajustes de ejes ideológicos por turno
  radicalConciliadorShift?: number;  // + hacia conciliador, − hacia radical
  populistaTecnicoShift?: number;    // + hacia técnico, − hacia populista
  cerradoConvocanteShift?: number;   // + hacia convocante, − hacia cerrado
}

export const ARCHETYPE_PASSIVES: Record<import('../types/game').Archetype, ArchetypePassive[]> = {
  politico: [
    { name: 'Oficialismo', description: '+10% retención de voto en reelección', electionRetention: 0.10 },
    { name: 'Constructor de alianzas', description: 'Reuniones con aliados no cuestan acción', freeInteractionGroups: ['aliados'] },
    { name: 'Consenso político', description: 'Eje conciliador +2 y convocante +1 por turno', radicalConciliadorShift: 2, cerradoConvocanteShift: 1 },
  ],
  empresario: [
    { name: 'Eficiencia económica', description: 'Acciones de economía generan +20% presupuesto', incomeBonus: 0.20 },
    { name: 'Red de contactos', description: 'Puede tomar 1 préstamo extra (máx 4)', extraLoans: 1 },
    { name: 'Ortodoxia económica', description: 'Eje técnico +2 y cerrado −1 por turno', populistaTecnicoShift: 2, cerradoConvocanteShift: -1 },
  ],
  sindicalista: [
    { name: 'Base movilizada', description: 'Reuniones con sindicatos y sectores populares no cuestan acción', freeInteractionGroups: ['sindicatos', 'sectores-populares'] },
    { name: 'Piso de contención', description: '+1 acción base por apoyo popular', extraActions: 1 },
    { name: 'Lucha obrera', description: 'Eje radical −2 y populista −2 por turno', radicalConciliadorShift: -2, populistaTecnicoShift: -2 },
  ],
  comunicador: [
    { name: 'Blindaje mediático', description: 'Eventos negativos tienen -30% impacto en popularidad', eventResilience: 0.30 },
    { name: 'Agenda setting', description: 'Todas las acciones rinden ×1.1 en popularidad (ya implementado en actionEffects)', incomeBonus: 0 },
    { name: 'Alfombra roja', description: 'Eje convocante +2 por turno', cerradoConvocanteShift: 2 },
  ],
};
