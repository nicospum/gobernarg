/**
 * Matriz de antagonismos entre grupos de interés.
 * Cuando un grupo gana apoyo positivo, sus antagonistas pierden
 * un porcentaje proporcional de esa ganancia.
 *
 * Formato: { [grupoGanador]: { [grupoPerdedor]: ratioDePerdida } }
 * ratioDePerdida = qué proporción de la ganancia pierde el antagonista.
 * Ej: si empresarios gana +10, sindicatos pierde 10 * 0.5 = 5.
 */
export const GROUP_ANTAGONISTS: Record<string, Record<string, number>> = {
  empresarios: {
    sindicatos: 0.5,
    'sectores-populares': 0.3,
  },
  'sector-financiero': {
    sindicatos: 0.5,
    'sectores-populares': 0.3,
    ambientalistas: 0.15,
  },
  sindicatos: {
    empresarios: 0.5,
    'clase-alta': 0.4,
  },
  'sectores-populares': {
    empresarios: 0.5,
    'clase-alta': 0.4,
  },
  'clase-alta': {
    sindicatos: 0.3,
    'sectores-populares': 0.3,
  },
  ambientalistas: {
    'sector-agricola': 0.4,
    'sector-financiero': 0.2,
  },
  feministas: {
    'clase-alta': 0.2,
    opositores: 0.2,
  },
  aliados: {
    opositores: 0.6,
  },
};

export function getAntagonistsForGroup(groupId: string): Record<string, number> {
  return GROUP_ANTAGONISTS[groupId] || {};
}
