import { MidtermStrategy, MidtermStrategyEffect } from '../types/game';
import type { ActorId } from './causal';

/**
 * Estrategias post-legislativas (se eligen en el año 3 de cada mandato).
 * Se conservan las cuatro del juego; en el motor causal cada una es un
 * modificador global temporal (ver MIDTERM_CAUSAL). `actionMultiplier` es la
 * eficacia de los efectos beneficiosos de las políticas.
 */
export const MIDTERM_STRATEGY_EFFECTS: Record<MidtermStrategy, MidtermStrategyEffect> = {
  acelerar: {
    actionMultiplier: 1.25,
    actionCostModifier: 0,
    stabilityPerTurn: -3,
    popularityPerTurn: -2,
    riskLevel: 'high',
    description: 'Acelerás las reformas: tus políticas rinden +25%, pero la calle se calienta y tu imagen se desgasta turno a turno.',
  },
  negociar: {
    actionMultiplier: 0.9,
    actionCostModifier: 0,
    stabilityPerTurn: +3,
    popularityPerTurn: 0,
    riskLevel: 'low',
    description: 'Aflojás el ritmo para recomponer consensos: menos eficacia, pero la oposición y los aliados se acercan y legislar es más fácil.',
  },
  abrirse: {
    actionMultiplier: 1.1,
    actionCostModifier: 0,
    stabilityPerTurn: +5,
    popularityPerTurn: +1,
    riskLevel: 'medium',
    description: 'Ampliás la coalición: sumás bancas y los aliados se acercan, a costa de malestar en tu propio partido.',
  },
  jugada_audaz: {
    actionMultiplier: 1.5,
    actionCostModifier: 0,
    stabilityPerTurn: -5,
    popularityPerTurn: -3,
    riskLevel: 'extreme',
    description: 'Movida de alto impacto: dos turnos con políticas ×1.5 y un golpe de imagen a favor; después, rebote de conflicto y desgaste.',
  },
};

export interface MidtermCausal {
  efficacy: number;
  confPerTurn?: number;
  imagenPerTurn?: number;
  relPerTurn?: Partial<Record<ActorId, number>>;
  umbralLey?: number;
  /** Bancas que se suman una vez (coalición). */
  legOnce?: number;
  imagenOnce?: number;
  /** Turnos de vigencia; null = resto del mandato. */
  duration: number | null;
  /** Rebote al terminar. */
  after?: { duration: number; confPerTurn?: number; imagenPerTurn?: number };
  bullets: string[];
}

export const MIDTERM_CAUSAL: Record<MidtermStrategy, MidtermCausal> = {
  acelerar: {
    efficacy: 1.25,
    confPerTurn: 1.5,
    imagenPerTurn: -0.5,
    duration: null,
    bullets: ['Políticas +25% de eficacia', 'Conflictividad en aumento cada turno', 'Desgaste de imagen'],
  },
  negociar: {
    efficacy: 0.9,
    relPerTurn: { oposicion: 2, aliados: 1 },
    umbralLey: -3,
    duration: null,
    bullets: ['Políticas −10% de eficacia', 'Mejora la relación con oposición y aliados', 'Leyes más fáciles de aprobar'],
  },
  abrirse: {
    efficacy: 1.1,
    legOnce: 4,
    relPerTurn: { aliados: 1, oficialismo: -2 },
    duration: null,
    bullets: ['Políticas +10% de eficacia', '+4 bancas por la coalición ampliada', 'Tu propio partido pierde cohesión'],
  },
  jugada_audaz: {
    efficacy: 1.5,
    imagenOnce: 4,
    duration: 2,
    after: { duration: 2, confPerTurn: 2, imagenPerTurn: -3 },
    bullets: ['Políticas ×1.5 durante 2 turnos', 'Golpe de imagen a favor', 'Después: conflicto y desgaste'],
  },
};
