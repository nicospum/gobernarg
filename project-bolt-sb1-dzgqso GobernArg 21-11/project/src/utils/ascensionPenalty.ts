// MODO CAMPAÑA (RESERVADO POST-MVP): código de la carrera
// intendente→gobernador→presidente. Hoy inalcanzable (MVP presidente-only,
// STARTING_POSITION en careerRules.ts) pero se conserva para el modo campaña
// del roadmap.
import { Position } from '../types/game';

/**
 * Calcula la penalización de intención de voto por ascenso político.
 * La dificultad depende del cargo de origen, destino y mandatos completados.
 * Más reelecciones = más chapa/experiencia = menos penalización.
 */
export function calculatePromotionPenalty(
  from: Position,
  to: Position,
  termsCompleted: number
): number {
  const PENALTIES: Record<string, number[]> = {
    'intendente->gobernador': [0.25, 0.15, 0.08, 0.03],
    'intendente->presidente':  [0.30, 0.30, 0.20, 0.12],
    'gobernador->presidente':  [0.15, 0.12, 0.05],
  };

  const key = `${from}->${to}`;
  const table = PENALTIES[key];
  if (!table) return 0;

  const index = Math.min(termsCompleted, table.length - 1);
  return table[Math.max(0, index)];
}
