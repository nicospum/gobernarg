/**
 * Progreso del jugador entre partidas (escenarios ganados y reelecciones).
 * Vive en el navegador (localStorage): si no está disponible —modo privado,
 * datos borrados— el juego funciona igual, sólo que sin desbloqueos guardados.
 */
const KEY = 'gobernarg.progress.v1';

export interface Progress {
  /** Escenarios en los que ganaste la partida completa. */
  wonScenarios: string[];
  /** Reelecciones ganadas en total: desbloquean los escenarios históricos. */
  reelectionsWon: number;
  /**
   * Desbloquear todos los escenarios sin ganarlos. El jugador no puede
   * activarlo desde la pantalla (hay que ganar reelecciones); queda como
   * atajo de prueba editando el localStorage.
   */
  unlockAll: boolean;
}

const EMPTY: Progress = { wonScenarios: [], reelectionsWon: 0, unlockAll: false };

export function loadProgress(): Progress {
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return { ...EMPTY };
    const parsed = JSON.parse(raw) as Partial<Progress>;
    return {
      wonScenarios: Array.isArray(parsed.wonScenarios) ? parsed.wonScenarios.filter(x => typeof x === 'string') : [],
      reelectionsWon: typeof parsed.reelectionsWon === 'number' && parsed.reelectionsWon > 0 ? Math.floor(parsed.reelectionsWon) : 0,
      unlockAll: parsed.unlockAll === true,
    };
  } catch {
    return { ...EMPTY };
  }
}

function save(p: Progress): void {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(p));
  } catch {
    // Sin almacenamiento: el progreso dura sólo esta sesión.
  }
}

export function recordScenarioWin(scenarioId: string): Progress {
  const p = loadProgress();
  if (!p.wonScenarios.includes(scenarioId)) p.wonScenarios.push(scenarioId);
  save(p);
  return p;
}

export function recordReelectionWin(): Progress {
  const p = loadProgress();
  p.reelectionsWon += 1;
  save(p);
  return p;
}

export function setUnlockAll(unlockAll: boolean): Progress {
  const p = { ...loadProgress(), unlockAll };
  save(p);
  return p;
}
