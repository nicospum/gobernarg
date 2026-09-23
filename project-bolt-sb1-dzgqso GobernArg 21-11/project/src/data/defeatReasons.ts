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
    description: 'El Congreso te destituyó mediante un juicio político. La combinación de baja popularidad e inestabilidad resultó letal.',
    icon: 'Gavel',
    // El impeachment se declara por popularidad < 10% + estabilidad < 20%
    // durante 2 turnos (victoryConditions.ts) — el apoyo legislativo es la
    // palanca del golpe institucional, no de esta derrota.
    advice: 'Cuidado con la combinación letal: popularidad bajo 10% y estabilidad bajo 20% durante 2 turnos te destituyen. Recuperá ambas antes de que avance el juicio.',
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
    description: 'La emisión monetaria descontrolada destruyó la economía. El peso argentino colapsó y con él tu gobierno.',
    icon: 'Flame',
    // La derrota es a las 7 emisiones (victoryConditions.ts), no a las 3.
    advice: 'No emitas dinero más de 6 veces: la séptima emisión desata la hiperinflación. Buscá financiamiento alternativo y mantené el equilibrio fiscal.',
    severity: 'economic',
  },
  election_loss: {
    title: 'Derrota Electoral',
    description: 'El pueblo eligió un nuevo rumbo en las urnas. Tu proyecto político no logró convencer a la mayoría.',
    icon: 'Vote',
    advice: 'Trabajá en tu popularidad y cumplí tus objetivos de gestión. La intención de voto refleja tu desempeño.',
    severity: 'political',
  },
};
