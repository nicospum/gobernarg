import { GameAction, GameState } from '../types/game';

interface AxisShift {
  radicalConciliador: number;
  populistaTecnico: number;
  cerradoConvocante: number;
}

const CATEGORY_AXIS_SHIFTS: Record<string, AxisShift> = {
  economia:    { radicalConciliador: 0,   populistaTecnico: +2,  cerradoConvocante: -1 },
  social:      { radicalConciliador: +1,  populistaTecnico: -2,  cerradoConvocante: 0  },
  seguridad:   { radicalConciliador: -3,  populistaTecnico: 0,   cerradoConvocante: -2 },
  diplomacia:  { radicalConciliador: +2,  populistaTecnico: 0,   cerradoConvocante: +3 },
  cultura:     { radicalConciliador: +2,  populistaTecnico: -1,  cerradoConvocante: +2 },
  infraestructura: { radicalConciliador: 0, populistaTecnico: +1, cerradoConvocante: 0 },
  educacion:   { radicalConciliador: +1,  populistaTecnico: 0,   cerradoConvocante: +1 },
  turismo:     { radicalConciliador: 0,   populistaTecnico: -1,  cerradoConvocante: +1 },
  tecnologia:  { radicalConciliador: 0,   populistaTecnico: +1,  cerradoConvocante: 0 },
};

function clampAxis(value: number): number {
  return Math.min(100, Math.max(-100, value));
}

export function applyAxisShift(action: GameAction, state: GameState): GameState {
  const shift = CATEGORY_AXIS_SHIFTS[action.category] ?? { radicalConciliador: 0, populistaTecnico: 0, cerradoConvocante: 0 };
  return {
    ...state,
    radicalConciliadorAxis: clampAxis(state.radicalConciliadorAxis + shift.radicalConciliador),
    populistaTecnicoAxis: clampAxis(state.populistaTecnicoAxis + shift.populistaTecnico),
    cerradoConvocanteAxis: clampAxis(state.cerradoConvocanteAxis + shift.cerradoConvocante),
  };
}

// Sprint 4: Efectos mecánicos de ejes extremos
export interface AxisModifiers {
  actionCostModifier?: Partial<Record<string, number>>;  // categoría → costo extra
  effectivenessMultiplier?: Partial<Record<string, number>>; // categoría → multiplicador
  stabilityModifier?: number;
  groupRelationsModifier?: number;
}

export function getAxisModifiers(state: { radicalConciliadorAxis: number; populistaTecnicoAxis: number; cerradoConvocanteAxis: number }): AxisModifiers {
  const mods: AxisModifiers = {};

  if (state.radicalConciliadorAxis <= -80) {
    mods.effectivenessMultiplier = { ...mods.effectivenessMultiplier, seguridad: 1.10 };
    mods.effectivenessMultiplier = { ...mods.effectivenessMultiplier, diplomacia: 0.85 };
  } else if (state.radicalConciliadorAxis >= 80) {
    mods.actionCostModifier = { ...mods.actionCostModifier, cultura: -1, diplomacia: -1 };
    mods.actionCostModifier = { ...mods.actionCostModifier, seguridad: 1 };
  }

  if (state.populistaTecnicoAxis <= -80) {
    mods.actionCostModifier = { ...mods.actionCostModifier, social: -1 };
    mods.effectivenessMultiplier = { ...mods.effectivenessMultiplier, social: 1.20 };
  } else if (state.populistaTecnicoAxis >= 80) {
    mods.effectivenessMultiplier = { ...mods.effectivenessMultiplier, economia: 1.20 };
    mods.effectivenessMultiplier = { ...mods.effectivenessMultiplier, social: 0.90 };
  }

  if (state.cerradoConvocanteAxis <= -80) {
    mods.stabilityModifier = 5;
    mods.groupRelationsModifier = -10;
  } else if (state.cerradoConvocanteAxis >= 80) {
    mods.groupRelationsModifier = 10;
    mods.stabilityModifier = -5;
  }

  return mods;
}
