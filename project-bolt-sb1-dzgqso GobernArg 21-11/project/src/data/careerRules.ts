import { Position } from '../types/game';

export const MAX_TERMS: Record<Position, number> = {
  intendente: 4,
  gobernador: 2,
  presidente: 2
};

export type ElectionOption = 'reelection' | 'promote-governor' | 'promote-president';

export const PROMOTION_DIFFICULTY: Record<ElectionOption, number> = {
  reelection: 5,
  'promote-governor': -15,
  'promote-president': -40
};

export const PROMOTION_MIN_POPULARITY: Record<ElectionOption, number> = {
  reelection: 0,
  'promote-governor': 0,
  'promote-president': 75
};

export function getOptionLabel(option: ElectionOption): string {
  switch (option) {
    case 'reelection':
      return 'Buscar la reelección';
    case 'promote-governor':
      return 'Postularse para Gobernador';
    case 'promote-president':
      return 'Postularse para Presidente';
    default:
      return option;
  }
}

export function getOptionDescription(option: ElectionOption): string {
  switch (option) {
    case 'reelection':
      return 'Ventaja por incumbencia, pero no avanzás en la carrera nacional.';
    case 'promote-governor':
      return 'Difícil pero posible. Necesitás apoyo provincial.';
    case 'promote-president':
      return 'Casi imposible desde intendente; muy difícil desde gobernador.';
    default:
      return '';
  }
}

export function getNextPosition(option: ElectionOption, currentPosition?: Position): Position {
  switch (option) {
    case 'promote-governor':
      return 'gobernador';
    case 'promote-president':
      return 'presidente';
    case 'reelection':
    default:
      return currentPosition || 'intendente';
  }
}
