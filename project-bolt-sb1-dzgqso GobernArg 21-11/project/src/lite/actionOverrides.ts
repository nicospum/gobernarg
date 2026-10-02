/**
 * Textos de la Lite para algunas acciones: solo cambia lo que se ve (nombre y,
 * si hace falta, la descripción corta). El id, los efectos, los costos y el
 * motor siguen iguales, así que los guardados viejos cargan sin problema.
 *
 * Se aplica una sola vez, donde se arma la lista de acciones
 * (src/data/causal/index.ts), para que el nombre nuevo aparezca igual en la
 * tarjeta, el detalle, "Este turno", el resumen del trimestre y los avisos.
 */
export const ACTION_TEXT_OVERRIDES: Record<string, { name?: string; description?: string }> = {
  reforma_laboral: { name: 'Desregulación del mercado laboral' },
  reduccion_gasto: {
    name: 'Reforma previsional',
    description: 'Recorte del gasto previsional: cambia la fórmula y la edad de retiro.',
  },
  reduccion_impuestos: {
    name: 'Reforma tributaria integral',
    description: 'Simplificar el sistema y bajar impuestos.',
  },
  desarrollo_energetico_minero: { name: 'Desarrollo de Vaca Muerta' },
  incentivos_exportacion: { name: 'Promoción de exportaciones' },
};
