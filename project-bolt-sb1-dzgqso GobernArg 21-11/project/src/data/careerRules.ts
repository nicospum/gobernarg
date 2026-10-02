import type { Position } from '../types/game';

// El juego arranca directo como presidente: cargo único.
export const STARTING_POSITION: Position = 'presidente';

/** Mandatos presidenciales posibles (el segundo, si se gana la reelección). */
export const MAX_TERMS = 2;
