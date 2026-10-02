import { useEffect, useRef, useState } from 'react';
import { Lock, Trophy } from 'lucide-react';
import { IMAGES } from '../utils/imageAssets';
import {
  HISTORIC_SCENARIOS,
  getScenario,
  isScenarioUnlocked,
  type ScenarioDef,
  type ScenarioDifficulty,
} from '../data/causal';
import { loadProgress, setUnlockAll } from '@/lib/progress';
import { DEFAULT_LEVEL_SCENARIO_ID } from '@/lite/config';

/**
 * Escenarios históricos (Corralito y País en llamas), que se desbloquean
 * ganando reelecciones. En Lite sólo se muestran con
 * LITE_FEATURES.escenariosHistoricos (src/lite/config.ts).
 * Recuperado de GameSetup (versión A).
 */
const DIFFICULTY_CLS: Record<ScenarioDifficulty, string> = {
  'Exploración': 'bg-emerald-400/20 text-emerald-200 border-emerald-300/40',
  'Normal': 'bg-sky-400/20 text-sky-200 border-sky-300/40',
  'Difícil': 'bg-amber-400/20 text-amber-200 border-amber-300/40',
  'Muy difícil': 'bg-red-400/20 text-red-200 border-red-300/40',
};

const DENIED_MESSAGE = 'Para desbloquear los escenarios tenés que ganar una reelección.';

function scenarioImage(sc: ScenarioDef): string | undefined {
  return (IMAGES[sc.image.group] as Record<string, string>)[sc.image.key];
}

function unlockHint(sc: ScenarioDef): string {
  return sc.reelectionsToUnlock === 1
    ? 'Ganá tu primera reelección para desbloquearlo.'
    : `Ganá ${sc.reelectionsToUnlock} reelecciones para desbloquearlo.`;
}

function selectableCls(selected: boolean): string {
  return selected
    ? 'bg-ink/15 border-accent shadow-lg'
    : 'bg-ink/5 border-ink/20 hover:bg-ink/10 hover:border-ink/40';
}

export function HistoricScenarios({ scenarioId, onSelect }: { scenarioId: string; onSelect: (id: string) => void }) {
  const [progress, setProgress] = useState(loadProgress);
  // Intento de desbloquear todo sin haber ganado: la perilla se pone roja y avisa.
  const [denied, setDenied] = useState(false);
  const [shakeKey, setShakeKey] = useState(0);
  const deniedTimer = useRef<number | undefined>(undefined);

  useEffect(() => () => window.clearTimeout(deniedTimer.current), []);

  const reelections = progress.reelectionsWon;

  const handleUnlockAll = () => {
    if (progress.unlockAll) {
      setProgress(setUnlockAll(false));
      const current = getScenario(scenarioId);
      if (!isScenarioUnlocked(current, reelections, false)) onSelect(DEFAULT_LEVEL_SCENARIO_ID);
      return;
    }
    setDenied(true);
    setShakeKey(k => k + 1);
    window.clearTimeout(deniedTimer.current);
    deniedTimer.current = window.setTimeout(() => setDenied(false), 3000);
  };

  return (
    <section className="mb-7">
      {/* Escenarios históricos: se ganan con reelecciones */}
      <div className="flex items-end justify-between gap-4 mb-1 flex-wrap">
        <h2 className="font-display text-xl font-semibold  ">Escenarios históricos</h2>
        <span className="inline-flex items-center gap-1.5 text-xs text-ink/80">
          <Trophy size={14} className="text-accent" />
          {reelections === 1 ? '1 reelección ganada' : `${reelections} reelecciones ganadas`}
        </span>
      </div>
      <p className="text-ink/70 text-sm mb-4">Momentos difíciles de la historia argentina. Se desbloquean ganando reelecciones.</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
        {HISTORIC_SCENARIOS.map(sc => {
          const unlocked = isScenarioUnlocked(sc, reelections, progress.unlockAll);
          const img = scenarioImage(sc);
          return (
            <button
              key={sc.id}
              role="radio"
              aria-checked={scenarioId === sc.id}
              aria-disabled={!unlocked}
              onClick={() => unlocked && onSelect(sc.id)}
              className={`relative text-left rounded-xl border-2 overflow-hidden transition-all flex ${
                unlocked ? selectableCls(scenarioId === sc.id) : 'bg-ink/5 border-ink/10 cursor-not-allowed'
              }`}
            >
              {img && (
                <div
                  className="w-28 shrink-0 bg-cover bg-center"
                  style={{ backgroundImage: `url(${img})`, filter: unlocked ? undefined : 'grayscale(1) brightness(0.7)' }}
                />
              )}
              <div className={`p-3 ${unlocked ? '' : 'opacity-70'}`}>
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-bold text-sm leading-tight">{sc.name}</h3>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded border whitespace-nowrap ${DIFFICULTY_CLS[sc.difficulty]}`}>
                    {sc.difficulty}
                  </span>
                </div>
                <p className="text-[11px] opacity-70 mt-0.5">{sc.era}</p>
                {unlocked ? (
                  <p className="text-xs opacity-85 mt-2 leading-snug">{sc.description}</p>
                ) : (
                  <p className="text-xs mt-2 flex items-center gap-1.5">
                    <Lock size={12} className="shrink-0" /> {unlockHint(sc)}
                  </p>
                )}
              </div>
            </button>
          );
        })}
      </div>

      <div className="relative flex items-center gap-3 mb-7 w-fit">
        <button
          key={shakeKey}
          role="switch"
          aria-checked={progress.unlockAll}
          aria-describedby={denied ? 'unlock-denied' : undefined}
          onClick={handleUnlockAll}
          className={`flex items-center gap-2 text-sm ${denied ? 'animate-denied' : ''}`}
        >
          <span
            className={`relative inline-block w-10 h-5 rounded-full transition-colors ${
              denied ? 'bg-red-500/80 ring-2 ring-red-400/60' : progress.unlockAll ? 'bg-accent' : 'bg-ink/25'
            }`}
          >
            <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-surface transition-all ${progress.unlockAll ? 'left-5' : 'left-0.5'}`} />
          </span>
          <span className={denied ? 'text-red-200' : 'text-ink/80'}>Desbloquear todos los escenarios</span>
        </button>
        {denied && (
          <div
            id="unlock-denied"
            role="status"
            className="absolute left-0 top-full mt-2 z-20 flex items-center gap-1.5 whitespace-nowrap rounded-md border border-red-400/40 bg-red-950/90 px-2.5 py-1.5 text-xs text-red-100 shadow-lg"
          >
            <Lock size={12} className="shrink-0" /> {DENIED_MESSAGE}
          </div>
        )}
      </div>
    </section>
  );
}
