import { DefeatReason } from '../types/game';

export interface DefeatReasonConfig {
  title: string;
  description: string;
  icon: string;
  advice: string;
  severity: 'political' | 'economic' | 'institutional';
}

export const DEFEAT_REASON_CONFIG: Record<DefeatReason, DefeatReasonConfig> = {
  low_popularity: {
    title: 'Desgaste Popular',
    description: 'La ciudadanía retiró su apoyo. La falta de conexión con el pueblo llevó al colapso de tu gobierno.',
    icon: 'TrendingDown',
    advice: 'Priorizá acciones con impacto popular positivo. Mantené programas sociales activos y escuchá a los grupos de interés.',
    severity: 'political',
  },
  negative_budget: {
    title: 'Colapso Fiscal',
    description: 'El déficit se volvió insostenible. Sin presupuesto no se puede gobernar.',
    icon: 'Wallet',
    advice: 'Controlá el gasto público, buscá fuentes de ingreso alternativas y evitá las emisiones descontroladas.',
    severity: 'economic',
  },
  impeachment: {
    title: 'Juicio Político',
    description: 'El gobierno perdió la capacidad de gobernar: sin Congreso, sin cooperación de los actores y con la calle encendida, el Congreso avanzó con el juicio político.',
    icon: 'Gavel',
    // El impeachment se declara por popularidad < 10% + estabilidad < 20%
    // durante 2 turnos (victoryConditions.ts) — el apoyo legislativo es la
    // palanca del golpe institucional, no de esta derrota.
    advice: 'La gobernabilidad bajo 15 durante dos trimestres seguidos te destituye. Cuidá tus bancas, la relación con los actores organizados y la conflictividad social.',
    severity: 'institutional',
  },
  institutional_coup: {
    title: 'Golpe Institucional',
    description: 'Las instituciones colapsaron bajo la presión y fuiste removido del poder por un quiebre del orden constitucional.',
    icon: 'Swords',
    advice: 'Preservá la gobernabilidad. Un congreso hostil combinado con inestabilidad extrema es una bomba de tiempo.',
    severity: 'institutional',
  },
  hyperinflation: {
    title: 'Hiperinflación',
    description: 'La inflación superó el umbral de hiperinflación dos trimestres seguidos. El peso colapsó y con él tu gobierno.',
    icon: 'Flame',
    // La derrota es a las 7 emisiones (victoryConditions.ts), no a las 3.
    advice: 'Emitir varias veces en pocos turnos desancla las expectativas; y con la caja en rojo el Tesoro emite solo. Cuidá el resultado fiscal y las divisas antes de que la inflación se acelere.',
    severity: 'economic',
  },
  election_loss: {
    title: 'Derrota Electoral',
    description: 'El pueblo eligió un nuevo rumbo en las urnas. Tu proyecto político no logró convencer a la mayoría.',
    icon: 'Vote',
    advice: 'La intención de voto sale de cuán satisfechos están los actores con peso electoral (65%), tu aparato político (10%) y tu imagen (25%). Mejorá lo que les importa a la clase media y a los sectores populares.',
    severity: 'political',
  },
};
