import { describe, it, expect } from 'vitest';
import { getInitialGameState, applyInteraction } from '../engine/gameEngine';
import { calculateSupportGain } from '../utils/interactionCosts';

describe('applyInteraction - reglas de concesiones', () => {
  function makeStateWithGroup() {
    const state = getInitialGameState();
    // Usar un grupo que exista en interestGroups
    const subgroup = (state.interestGroups ?? [])
      .flatMap(g => g.subgroups)
      .find(sg => sg.id === 'empresarios');
    return { state, subgroupId: subgroup?.id ?? 'empresarios' };
  }

  it('conceder sin trabajo previo NO se aplica (retorna mismo estado)', () => {
    const { state, subgroupId } = makeStateWithGroup();
    const result = applyInteraction(state, subgroupId, 'conceder');
    expect(result).toBe(state); // sin cambios: no hubo reunión ni negociación previa
  });

  it('conceder después de una reunión SÍ se aplica', () => {
    const { state, subgroupId } = makeStateWithGroup();
    // Primero reunirse (cuesta 10, da +2 apoyo)
    const afterMeeting = applyInteraction(state, subgroupId, 'reunion');
    expect(afterMeeting).not.toBe(state);
    expect(afterMeeting.interactionCountByGroup[subgroupId]?.reuniones).toBe(1);

    // Ahora conceder debería funcionar
    const afterConcede = applyInteraction(afterMeeting, subgroupId, 'conceder');
    expect(afterConcede).not.toBe(afterMeeting);
    expect(afterConcede.concessionsThisTerm).toBe(1);
  });

  it('conceder después de una negociación SÍ se aplica', () => {
    const { state, subgroupId } = makeStateWithGroup();
    const afterNegotiate = applyInteraction(state, subgroupId, 'negociar');
    expect(afterNegotiate.interactionCountByGroup[subgroupId]?.negociaciones).toBe(1);

    const afterConcede = applyInteraction(afterNegotiate, subgroupId, 'conceder');
    expect(afterConcede.concessionsThisTerm).toBe(1);
  });

  it('máximo 4 concesiones por mandato', () => {
    const { state, subgroupId } = makeStateWithGroup();
    // Dar presupuesto suficiente para 4 concesiones
    const richState = { ...state, budget: 5000 };

    // Preparar: reunirse primero para desbloquear concesión
    let current = applyInteraction(richState, subgroupId, 'reunion');
    expect(current.interactionCountByGroup[subgroupId]?.reuniones).toBe(1);

    // Hacer 4 concesiones (deberían funcionar)
    for (let i = 0; i < 4; i++) {
      current = applyInteraction(current, subgroupId, 'conceder');
      expect(current.concessionsThisTerm).toBe(i + 1);
    }

    // La 5ta concesión NO debería funcionar
    const beforeFifth = current;
    const afterFifth = applyInteraction(current, subgroupId, 'conceder');
    expect(afterFifth).toBe(beforeFifth);
    expect(afterFifth.concessionsThisTerm).toBe(4);
  });

  it('conceder genera costo cruzado: baja apoyo de otros grupos', () => {
    const { state, subgroupId } = makeStateWithGroup();
    const otherGroups = Object.keys(state.groupRelations).filter(id => id !== subgroupId);
    expect(otherGroups.length).toBeGreaterThan(0);

    // Desbloquear con reunión
    let current = applyInteraction(state, subgroupId, 'reunion');

    // Conceder
    const beforeRelations = { ...current.groupRelations };
    current = applyInteraction(current, subgroupId, 'conceder');

    // El grupo objetivo sube, los demás bajan
    expect(current.groupRelations[subgroupId]).toBeGreaterThan(beforeRelations[subgroupId]);

    for (const otherId of otherGroups) {
      expect(current.groupRelations[otherId]).toBeLessThan(beforeRelations[otherId]);
    }
  });
});

describe('calculateSupportGain - diferenciación de impactos', () => {
  it('reunión da +2 (bajo impacto)', () => {
    const state = getInitialGameState();
    const subgroup = (state.interestGroups ?? []).flatMap(g => g.subgroups)[0];
    expect(calculateSupportGain('reunion', subgroup, state)).toBe(2);
  });

  it('negociar da +4 (bajo impacto)', () => {
    const state = getInitialGameState();
    const subgroup = (state.interestGroups ?? []).flatMap(g => g.subgroups)[0];
    expect(calculateSupportGain('negociar', subgroup, state)).toBe(4);
  });

  it('conceder da +15 (alto impacto)', () => {
    const state = getInitialGameState();
    const subgroup = (state.interestGroups ?? []).flatMap(g => g.subgroups)[0];
    expect(calculateSupportGain('conceder', subgroup, state)).toBe(15);
  });
});

describe('actionRegistry - encadenamiento de acciones', () => {
  it('las acciones de alto impacto requieren estudio_factibilidad', async () => {
    const { actionDefinitions } = await import('../data/actionRegistry');
    const highImpactIds = ['energia_renovable', 'construccion_hospitales', 'infraestructura_vial'];
    for (const id of highImpactIds) {
      const action = actionDefinitions.find(a => a.id === id);
      expect(action, `acción ${id} debe existir`).toBeDefined();
      expect(action?.prerequisites?.requiredActions, `acción ${id} requiere estudio_factibilidad`).toContain('estudio_factibilidad');
    }
  });

  it('modernizacion_aeropuertos requiere estudio_factibilidad + infraestructura_vial', async () => {
    const { actionDefinitions } = await import('../data/actionRegistry');
    const action = actionDefinitions.find(a => a.id === 'modernizacion_aeropuertos');
    expect(action?.prerequisites?.requiredActions).toContain('estudio_factibilidad');
    expect(action?.prerequisites?.requiredActions).toContain('infraestructura_vial');
  });

  it('prestamo_internacional requiere mejorar_recaudacion', async () => {
    const { actionDefinitions } = await import('../data/actionRegistry');
    const action = actionDefinitions.find(a => a.id === 'prestamo_internacional');
    expect(action?.prerequisites?.requiredActions).toContain('mejorar_recaudacion');
  });

  it('lucha_narcotrafico requiere fortalecimiento_justicia', async () => {
    const { actionDefinitions } = await import('../data/actionRegistry');
    const action = actionDefinitions.find(a => a.id === 'lucha_narcotrafico');
    expect(action?.prerequisites?.requiredActions).toContain('fortalecimiento_justicia');
  });
});
