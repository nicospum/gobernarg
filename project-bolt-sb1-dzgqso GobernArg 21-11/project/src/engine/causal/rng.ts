/**
 * Generador pseudoaleatorio con estado (mulberry32). El estado vive en
 * CausalState.rng para que las partidas simuladas (playtests) sean
 * reproducibles con la misma semilla.
 */
export function nextRandom(seed: number): [number, number] {
  let t = (seed + 0x6d2b79f5) >>> 0;
  const next = t;
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  const value = ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  return [value, next];
}

/** Envoltorio mutable para usar dentro de un cierre de turno. */
export class Rng {
  constructor(public seed: number) {}
  next(): number {
    const [v, s] = nextRandom(this.seed);
    this.seed = s;
    return v;
  }
  chance(p: number): boolean {
    return this.next() < p;
  }
}
