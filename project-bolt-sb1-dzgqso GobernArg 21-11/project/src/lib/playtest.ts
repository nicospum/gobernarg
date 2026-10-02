import type { GameState } from '../types/game';
import { CAUSAL_ACTIONS_BY_ID, DIFFICULTY_LEVELS, getScenario } from '../data/causal';
import { fmtBudget, fmtPct } from './format';

/**
 * Playtest con personas (Fase 3): el formulario de opinión se envía a
 * Netlify Forms (form "playtest", declarado en index.html) junto con un
 * resumen de la partida. No se manda nada más: ni el guardado ni datos del
 * navegador.
 */
export const PLAYTEST_FORM = 'playtest';
export const GAME_VERSION = 'A Lite';
const START_KEY = 'gobernarg.lite.playtest.inicio';

/** Se marca al empezar cada partida para medir cuánto se jugó. */
export function markGameStart(): void {
  try { localStorage.setItem(START_KEY, String(Date.now())); } catch { /* sin almacenamiento, sin duración */ }
}

function minutesPlayed(): number | null {
  try {
    const t = Number(localStorage.getItem(START_KEY));
    return t ? Math.max(1, Math.round((Date.now() - t) / 60000)) : null;
  } catch {
    return null;
  }
}

const DEFEAT_LABEL: Record<string, string> = {
  election_loss: 'perdió la elección',
  hyperinflation: 'hiperinflación',
  impeachment: 'juicio político',
  institutional_coup: 'crisis institucional',
  low_popularity: 'aprobación en el piso',
  negative_budget: 'quiebra fiscal',
};

/** Resumen de la partida en una línea por dato, para leer en Netlify sin abrir el juego. */
export function gameSummary(state: GameState, isMobile: boolean): string {
  const c = state.causal;
  const scenario = getScenario(c?.scenarioId);
  const level = DIFFICULTY_LEVELS.find(l => l.scenarioId === c?.scenarioId);
  const absoluteTurn = (state.year - 1) * 4 + state.turn;
  const result = !state.gameOver
    ? 'en curso'
    : state.victorious
      ? 'ganó'
      : `perdió (${DEFEAT_LABEL[state.defeatReason ?? ''] ?? state.defeatReason ?? 'sin motivo'})`;
  const counts = new Map<string, number>();
  for (const r of c?.records ?? []) for (const a of r.actions) counts.set(a.actionId, (counts.get(a.actionId) ?? 0) + 1);
  const top = [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 6)
    .map(([id, n]) => `${CAUSAL_ACTIONS_BY_ID[id]?.name ?? id} (${n})`).join(', ');
  const minutes = minutesPlayed();
  return [
    `Versión: ${GAME_VERSION}`,
    `Dispositivo: ${isMobile ? 'celular o tablet' : 'computadora'}`,
    `Escenario: ${scenario ? scenario.name : '—'}${level ? ` (nivel ${level.label})` : ''}`,
    `Mandato ${state.term}, turno ${absoluteTurn} de 16`,
    `Resultado: ${result}`,
    state.electionResults ? `Votos en la última elección: ${fmtPct(state.electionResults.votesPercentage, 1)}` : null,
    c ? `Aprobación ${Math.round(c.political.apro)} · Gobernabilidad ${Math.round(c.political.gob)} · Intención de voto ${Math.round(c.political.iv)} %` : null,
    c ? `Caja ${fmtBudget(c.caja)} · Deuda ${fmtBudget(c.deuda)}` : null,
    `Acciones más usadas: ${top || 'ninguna'}`,
    minutes ? `Minutos desde que empezó la partida: ${minutes}` : null,
  ].filter(Boolean).join('\n');
}

/** Envía el formulario a Netlify Forms. Devuelve false si no se pudo (por ejemplo, jugando en local). */
export async function sendPlaytest(fields: Record<string, string>): Promise<boolean> {
  try {
    const body = new URLSearchParams({ 'form-name': PLAYTEST_FORM, ...fields }).toString();
    const res = await fetch('/', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body });
    return res.ok;
  } catch {
    return false;
  }
}
