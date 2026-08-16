import { describe, it, expect } from 'vitest';
import {
  MAX_TERMS,
  PROMOTION_DIFFICULTY,
  PROMOTION_MIN_POPULARITY,
} from '../data/careerRules';

describe('MAX_TERMS', () => {
  it('define los términos máximos por cargo', () => {
    expect(MAX_TERMS).toEqual({
      intendente: 4,
      gobernador: 2,
      presidente: 2,
    });
  });

  it('el intendente tiene más términos que el gobernador', () => {
    expect(MAX_TERMS.intendente).toBeGreaterThan(MAX_TERMS.gobernador);
  });

  it('gobernador y presidente comparten el máximo de términos', () => {
    expect(MAX_TERMS.gobernador).toBe(MAX_TERMS.presidente);
  });
});

describe('PROMOTION_DIFFICULTY', () => {
  it('define los modificadores de dificultad por opción electoral', () => {
    expect(PROMOTION_DIFFICULTY).toEqual({
      reelection: 5,
      'promote-governor': -15,
      'promote-president': -40,
    });
  });

  it('la reelección es más fácil que ascender a gobernador o presidente', () => {
    expect(PROMOTION_DIFFICULTY.reelection).toBeGreaterThan(
      PROMOTION_DIFFICULTY['promote-governor']
    );
    expect(PROMOTION_DIFFICULTY['promote-governor']).toBeGreaterThan(
      PROMOTION_DIFFICULTY['promote-president']
    );
  });
});

describe('PROMOTION_MIN_POPULARITY', () => {
  it('la reelección no exige popularidad mínima', () => {
    expect(PROMOTION_MIN_POPULARITY.reelection).toBe(0);
  });

  it('postularse a gobernador exige 45 de popularidad', () => {
    expect(PROMOTION_MIN_POPULARITY['promote-governor']).toBe(45);
  });

  it('postularse a presidente exige 75 de popularidad', () => {
    expect(PROMOTION_MIN_POPULARITY['promote-president']).toBe(75);
  });
});
