import { actionDefinitions } from './actionRegistry';
import type { ActionCategoryData } from '../types/game';

// DERIVADO DEL REGISTRY (única fuente de verdad).
// Antes este archivo era un segundo catálogo de acciones que divergía del
// vivo (actionRegistry.ts): distinto cooldown de emitir_dinero, distinto
// minBudget de 3 acciones y 8 explicitGroupEffects que solo existían acá.
// Ahora se construye agrupando actionDefinitions por categoría, así no puede
// volver a divergir. Los nombres de categoría se preservan como estaban.
const CATEGORY_NAMES: Record<string, string> = {
  economia: 'Economía',
  social: 'Social',
  infraestructura: 'Infraestructura',
  diplomacia: 'Diplomacia',
  seguridad: 'Seguridad',
  cultura: 'Cultura',
  educacion: 'Educación',
  turismo: 'Turismo',
  tecnologia: 'Tecnología'
};

function buildActionCategories(): ActionCategoryData[] {
  const categories: ActionCategoryData[] = [];
  const byId = new Map<string, ActionCategoryData>();

  for (const action of actionDefinitions) {
    let category = byId.get(action.category);
    if (!category) {
      category = {
        id: action.category,
        name: CATEGORY_NAMES[action.category] ?? action.category,
        actions: []
      };
      byId.set(action.category, category);
      categories.push(category);
    }
    category.actions.push(action);
  }

  return categories;
}

export const actionCategories: ActionCategoryData[] = buildActionCategories();
