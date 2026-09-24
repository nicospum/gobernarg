/**
 * Progreso del jugador entre partidas (escenarios ganados). Vive en el
 * navegador (localStorage): si no está disponible —modo privado, datos
 * borrados— el juego funciona igual, sólo que sin desbloqueos guardados.
 */
const KEY = 'gobernarg.progress.v1';

export interface Progress {
  /** Escenarios en los que ganaste la partida completa. */
  wonScenarios: string[];
  /** Desbloquear todos los escenarios sin ganarlos. */
  unlockAll: boolean;
}

const EMPTY: Progress = { wonScenarios: [], unlockAll: false };

export function loadProgress(): Progress {
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return { ...EMPTY };
    const parsed = JSON.parse(raw) as Partial<Progress>;
    return {
      wonScenarios: Array.isArray(parsed.wonScenarios) ? parsed.wonScenarios.filter(x => typeof x === 'string') : [],
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

export function setUnlockAll(unlockAll: boolean): Progress {
  const p = { ...loadProgress(), unlockAll };
  save(p);
  return p;
}
