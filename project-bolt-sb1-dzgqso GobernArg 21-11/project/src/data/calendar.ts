import type { CalendarEvent } from '../types/game';

export const POLITICAL_CALENDAR: CalendarEvent[] = [
  {
    id: 'apertura-sesiones-y1',
    year: 1,
    turn: 2,
    title: 'Apertura de sesiones ordinarias',
    description: 'El Congreso inicia un nuevo período legislativo. El gobierno presenta su agenda.',
    type: 'milestone'
  },
  {
    id: 'primer-informe-y1',
    year: 1,
    turn: 4,
    title: 'Primer informe de gestión',
    description: 'Fin del primer año de gobierno. Los primeros resultados empiezan a pesar en la opinión pública.',
    type: 'milestone'
  },
  {
    id: 'campaña-legislativa',
    year: 2,
    turn: 2,
    title: 'Inicio de la campaña legislativa',
    description: 'La campaña por las elecciones de medio término comienza a calentar el ambiente político.',
    type: 'milestone'
  },
  {
    id: 'elecciones-medio-termino',
    year: 2,
    turn: 4,
    title: 'Elecciones de medio término',
    description: 'Se renueva parte del Congreso. No se elige al ejecutivo, pero se mide la fuerza del oficialismo.',
    type: 'election'
  },
  {
    id: 'definicion-estrategia',
    year: 3,
    turn: 1,
    title: 'Definición de la estrategia post-legislativa',
    description: 'El resultado de las elecciones obliga al gobierno a decidir cómo enfrentar la segunda mitad del mandato.',
    type: 'milestone'
  },
  {
    id: 'apertura-sesiones-y3',
    year: 3,
    turn: 2,
    title: 'Apertura del último período legislativo',
    description: 'Última oportunidad para aprobar reformas antes de la campaña presidencial.',
    type: 'milestone'
  },
  {
    id: 'campaña-presidencial',
    year: 4,
    turn: 2,
    title: 'Inicio de la campaña presidencial',
    description: 'La atención se traslada a las elecciones generales. Cada decisión pesa el doble.',
    type: 'milestone'
  },
  {
    id: 'elecciones-generales',
    year: 4,
    turn: 4,
    title: 'Elecciones generales',
    description: 'El país define si ratifica al gobierno o apuesta por una alternativa.',
    type: 'election'
  }
];

export function getCalendarEventForTurn(year: number, turn: number): CalendarEvent | undefined {
  return POLITICAL_CALENDAR.find(event => event.year === year && event.turn === turn);
}
