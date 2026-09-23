import { describe, it, expect } from 'vitest';
import { actionDefinitions } from '../data/actionRegistry';
import { actionCategories } from '../data/actionCategories';
import { interestGroups } from '../data/interestGroups';

describe('actionRegistry (fuente de verdad de las acciones)', () => {
  it('cada acción tiene id única', () => {
    const ids = actionDefinitions.map(a => a.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('actionCategories derivado contiene exactamente las mismas ids que el registry', () => {
    const registryIds = actionDefinitions.map(a => a.id).sort();
    const categoriesIds = actionCategories.flatMap(c => c.actions.map(a => a.id)).sort();

    expect(categoriesIds).toEqual(registryIds);
    // Ni más ni menos: 61 acciones
    expect(categoriesIds).toHaveLength(actionDefinitions.length);
  });

  it('emitir_dinero tiene cooldown 3 (la hiperinflación debe ser alcanzable)', () => {
    const emitir = actionDefinitions.find(a => a.id === 'emitir_dinero');
    expect(emitir?.cooldown).toBe(3);
  });

  it('las 8 acciones portadas tienen explicitGroupEffects con grupos que existen', () => {
    const existingGroupIds = new Set(
      interestGroups.flatMap(g => g.subgroups.map(sg => sg.id))
    );
    const portedIds = [
      'subsidios_industriales',
      'fomento_emprendimiento',
      'plan_viviendas',
      'cobertura_social',
      'tercera_edad',
      'viviendas_rurales',
      'seguridad_ciudadana',
      'sistema_vigilancia'
    ];

    for (const id of portedIds) {
      const action = actionDefinitions.find(a => a.id === id);
      expect(action, `acción ${id} existe`).toBeDefined();
      expect(action!.explicitGroupEffects, `${id} tiene explicitGroupEffects`).toBeDefined();
      expect(action!.explicitGroupEffects!.length).toBeGreaterThan(0);
      for (const effect of action!.explicitGroupEffects!) {
        expect(
          existingGroupIds.has(effect.groupId),
          `${id} referencia al grupo existente ${effect.groupId}`
        ).toBe(true);
      }
    }
  });
});
