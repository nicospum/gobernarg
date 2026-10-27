/** Calendario persistido: una partida antigua nunca cambia de unidad al cargarse. */
export type CalendarId = 'light-12' | 'legacy-16';
export const NEW_CALENDAR_ID: CalendarId = 'light-12';
export const LEGACY_CALENDAR_ID: CalendarId = 'legacy-16';
export type CalendarSource = CalendarId | { calendar?: CalendarId; causal?: { calendar?: CalendarId }; year?: number; turn?: number; mandateStart?: number };

export function calendarFor(source?: CalendarSource) {
  const id = typeof source === 'string' ? source : source?.causal?.calendar ?? source?.calendar ?? LEGACY_CALENDAR_ID;
  const light = id === NEW_CALENDAR_ID;
  return {
    id, periodsPerYear: light ? 3 : 4, turnsPerMandate: light ? 12 : 16,
    midtermTurn: light ? 6 : 8, totalTurns: light ? 24 : 32,
    periodLabel: light ? 'cuatrimestre' : 'trimestre', periodLabelPlural: light ? 'cuatrimestres' : 'trimestres',
  } as const;
}

/** Convierte lapsos del catálogo trimestral; no cambia conteos mínimos ni magnitudes. */
export function equivalentTurns(quarters: number, source?: CalendarSource): number {
  if (quarters === 0) return 0;
  if (quarters >= 9999 || quarters === 99) return quarters;
  return calendarFor(source).id === NEW_CALENDAR_ID ? Math.max(1, Math.round(quarters * 3 / 4)) : quarters;
}

/** Índice de decisión dentro del mandato; las pantallas usan el calendario civil guardado. */
export function mandateTurn(source: CalendarSource): number {
  const c = calendarFor(source);
  if (typeof source === 'string') return 1;
  if (typeof source.year === 'number' && source.causal) return (source.year - 1) * c.periodsPerYear + (source.turn ?? 1);
  return Math.max(1, Math.min(c.turnsPerMandate, (source.turn ?? 1) - (source.mandateStart ?? 1) + 1));
}

export function periodCaption(source: CalendarSource, year?: number, period?: number): string {
  const c = calendarFor(source);
  const y = year ?? (typeof source === 'string' ? 1 : source.year ?? 1);
  const p = period ?? (typeof source === 'string' ? 1 : source.turn ?? 1);
  return `Año ${y} · ${c.periodLabel[0].toUpperCase() + c.periodLabel.slice(1)} ${p}`;
}

/** Sólo textos estáticos del catálogo. Los mensajes dinámicos del motor ya usan lapsos reales. */
export function calendarText(text: string, source?: CalendarSource): string {
  if (calendarFor(source).id !== NEW_CALENDAR_ID) return text;
  return text.replace(/\b(\d+)\s+(turnos?|trimestres?)\b/gi, (_match, number: string, unit: string) => {
    const value = equivalentTurns(Number(number), source);
    const quarter = unit.toLowerCase().startsWith('trimestre');
    const label = quarter ? (value === 1 ? 'cuatrimestre' : 'cuatrimestres') : (value === 1 ? 'turno' : 'turnos');
    return `${value} ${unit[0] === unit[0].toUpperCase() ? label[0].toUpperCase() + label.slice(1) : label}`;
  }).replace(/\btrimestre/gi, word => word[0] === 'T' ? 'Cuatrimestre' : 'cuatrimestre');
}
