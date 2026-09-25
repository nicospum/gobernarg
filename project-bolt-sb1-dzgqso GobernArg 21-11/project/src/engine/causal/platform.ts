import {
  CUSTOM_PLATFORM_WEIGHTS,
  EFFECTS_BY_ACTION,
  INDICATORS,
  NO_PLATFORM_ID,
  encodeCustomPlatform,
  isIndicatorId,
  type CustomPlatformItem,
  type IndicatorId,
} from '../../data/causal';
import type { TurnActionRecord } from './types';

/** Turnos que mira el partido para armar la plataforma propia. */
export const OWN_PLATFORM_WINDOW = 4;

/**
 * Plataforma propia: los (hasta) tres resultados que más empujaste en la
 * dirección buena para el país con las acciones de los últimos turnos.
 * Cuenta los efectos directos, diferidos y persistentes de cada acción; los
 * condicionales y las repeticiones dependen del contexto y no son "lo que
 * elegiste empujar". Presión tributaria no tiene dirección buena: cuenta hacia
 * donde la moviste. Sin acciones, el partido sólo mira tu aprobación.
 */
export function deriveOwnPlatform(recentTurns: TurnActionRecord[][]): string {
  const push = new Map<IndicatorId, number>();
  for (const turn of recentTurns) {
    for (const a of turn) {
      if (a.suspended) continue;
      for (const e of EFFECTS_BY_ACTION[a.actionId] ?? []) {
        if (!isIndicatorId(e.target) || !e.magnitude) continue;
        if (e.kind === 'CONDITIONAL' || e.kind === 'REPETITION') continue;
        push.set(e.target, (push.get(e.target) ?? 0) + e.magnitude);
      }
    }
  }

  const ranked: (CustomPlatformItem & { score: number })[] = [];
  for (const [indicator, total] of push) {
    const good = INDICATORS[indicator].goodDirection;
    const score = good === 0 ? Math.abs(total) : total * good;
    if (score <= 0) continue;
    ranked.push({ indicator, dir: (good === 0 ? Math.sign(total) : good) as 1 | -1, score });
  }
  ranked.sort((x, y) => y.score - x.score);

  const top = ranked.slice(0, CUSTOM_PLATFORM_WEIGHTS.length).map(({ indicator, dir }) => ({ indicator, dir }));
  return top.length > 0 ? encodeCustomPlatform(top) : NO_PLATFORM_ID;
}
