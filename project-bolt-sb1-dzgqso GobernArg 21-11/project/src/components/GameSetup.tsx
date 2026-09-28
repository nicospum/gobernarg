import { useEffect, useRef, useState } from 'react';
import { ArrowLeft, Lock, Play, Sparkles, Trophy } from 'lucide-react';
import { IMAGES } from '../utils/imageAssets';
import {
  DEFAULT_SCENARIO_ID,
  DIFFICULTY_LEVELS,
  HISTORIC_SCENARIOS,
  NO_PLATFORM_ID,
  OWN_PLATFORM_ID,
  PLATFORMS,
  getScenario,
  isScenarioUnlocked,
  type ScenarioDef,
  type ScenarioDifficulty,
} from '../causal/scenarios';
import { DIFFICULTIES } from '../causal/campaignCatalog';
import { indicatorName } from '../causal/selectors';
import { loadProgress, setUnlockAll } from '../causal/progress';
import type { Difficulty } from '../causal/campaignTypes';
import type { Archetype } from '../types/game';
import { SetupSteps } from './SetupSteps';
/** Lo que se definió en el paso 1 (Creá tu gobernante). */
export interface CharacterDraft {
  archetype: Archetype;
  governorName: string;
  avatar: string;
}

interface GameSetupProps {
  draft: CharacterDraft;
  onBack: () => void;
  onStart: (platformId: string, scenarioId: string, difficulty: Difficulty) => void;
}

/** Cada perfil sugiere una plataforma (se puede cambiar). */
const DEFAULT_PLATFORM_BY_ARCHETYPE: Record<string, string> = {
  politico: 'crecimiento_con_salarios',
  empresario: 'desarrollo_productivo',
  sindicalista: 'estado_presente',
  comunicador: 'orden_y_estabilidad',
};

const scenarioOf = (id: string): ScenarioDef => getScenario(id) ?? getScenario(DEFAULT_SCENARIO_ID)!;

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
    ? 'bg-white/15 border-accent shadow-lg'
    : 'bg-white/5 border-white/20 hover:bg-white/10 hover:border-white/40';
}

export function GameSetup({ draft, onBack, onStart }: GameSetupProps) {
  const [progress, setProgress] = useState(loadProgress);
  const [scenarioId, setScenarioId] = useState<string>(DEFAULT_SCENARIO_ID);
  // Plataforma del partido: opcional y apagada por defecto. El juego no la necesita.
  const [platformOn, setPlatformOn] = useState(false);
  const [platformId, setPlatformId] = useState<string>(DEFAULT_PLATFORM_BY_ARCHETYPE[draft.archetype] ?? PLATFORMS[0].id);
  // Exigencia de la versión B: la sugiere el escenario; si el jugador la toca, se respeta.
  const [difficulty, setDifficulty] = useState<Difficulty>(scenarioOf(DEFAULT_SCENARIO_ID).suggestedDifficulty);
  const [difficultyTouched, setDifficultyTouched] = useState(false);
  const chooseScenario = (id: string) => {
    setScenarioId(id);
    if (!difficultyTouched) setDifficulty(scenarioOf(id).suggestedDifficulty);
  };
  // Intento de desbloquear todo sin haber ganado: la perilla se pone roja y avisa.
  const [denied, setDenied] = useState(false);
  const [shakeKey, setShakeKey] = useState(0);
  const deniedTimer = useRef<number | undefined>(undefined);

  useEffect(() => () => window.clearTimeout(deniedTimer.current), []);

  const reelections = progress.reelectionsWon;
  const bg = scenarioImage(scenarioOf(scenarioId)) ?? IMAGES.backgrounds.presidentialOffice;

  const handleUnlockAll = () => {
    if (progress.unlockAll) {
      setProgress(setUnlockAll(false));
      const current = scenarioOf(scenarioId);
      if (!isScenarioUnlocked(current, reelections, false)) chooseScenario(DEFAULT_SCENARIO_ID);
      return;
    }
    setDenied(true);
    setShakeKey(k => k + 1);
    window.clearTimeout(deniedTimer.current);
    deniedTimer.current = window.setTimeout(() => setDenied(false), 3000);
  };

  const handleStart = () => onStart(platformOn ? platformId : NO_PLATFORM_ID, scenarioId, difficulty);

  return (
    <div className="relative min-h-screen text-white overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-all duration-700"
        style={{ backgroundImage: `url(${bg})` }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-slate-900/85 via-blue-900/75 to-slate-900/90" />

      <div className="relative z-10 max-w-5xl mx-auto p-4 md:p-8">
        <div className="flex items-center justify-between gap-4 mb-6 flex-wrap">
          <img src={IMAGES.logo.primary} alt="Gobernarg" className="h-14 md:h-20 drop-shadow-lg" />
          <SetupSteps current={2} />
        </div>

        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 md:p-10 shadow-2xl border border-white/10">
          <div className="flex items-center gap-3 mb-8">
            <img src={draft.avatar} alt="" className="w-12 h-12 rounded-full object-cover bg-white/20 border border-white/30" />
            <div>
              <h1 className="font-display text-3xl md:text-4xl font-bold uppercase tracking-wide">Elegí la dificultad</h1>
              <p className="text-white/80">{draft.governorName} está por asumir. ¿Con qué país arranca?</p>
            </div>
          </div>

          {/* Niveles: cada uno abre un escenario disponible desde el principio */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10" role="radiogroup" aria-label="Dificultad">
            {DIFFICULTY_LEVELS.map(level => {
              const sc = scenarioOf(level.scenarioId);
              const img = scenarioImage(sc);
              const selected = scenarioId === sc.id;
              return (
                <button
                  key={level.id}
                  role="radio"
                  aria-checked={selected}
                  onClick={() => chooseScenario(sc.id)}
                  className={`relative text-left rounded-xl border-2 overflow-hidden transition-all ${selectableCls(selected)}`}
                >
                  {img && <div className="h-28 bg-cover bg-center" style={{ backgroundImage: `url(${img})` }} />}
                  <div className="p-4">
                    <div className="font-display text-3xl font-bold uppercase tracking-wide leading-none">{level.label}</div>
                    <p className="text-sm italic text-white/85 mt-2 leading-snug">{level.tagline}</p>
                    <div className="mt-4 pt-3 border-t border-white/15">
                      <h3 className="font-bold text-sm leading-tight">{sc.name}</h3>
                      <p className="text-[11px] opacity-70 mt-0.5">{sc.era}</p>
                      <p className="text-xs opacity-85 mt-2 leading-snug">{sc.description}</p>
                      <ul className="text-[11px] opacity-75 mt-2 space-y-0.5 list-disc list-inside">
                        {sc.highlights.map(h => <li key={h}>{h}</li>)}
                      </ul>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          <label className="block mb-10 text-sm">
            Exigencia de la gestión
            <select
              aria-label="Exigencia de la gestión"
              value={difficulty}
              onChange={event => { setDifficulty(event.target.value as Difficulty); setDifficultyTouched(true); }}
              className="causal-select mt-2 max-w-sm w-full block"
            >
              {(Object.keys(DIFFICULTIES) as Difficulty[]).map(id => <option key={id} value={id}>{DIFFICULTIES[id].name}</option>)}
            </select>
            <span className="block text-xs text-white/60 mt-1">Modifica recaudación, frecuencia de eventos y exigencia electoral. La sugiere el escenario; podés cambiarla.</span>
          </label>

          {/* Escenarios históricos: se ganan con reelecciones */}
          <div className="flex items-end justify-between gap-4 mb-1 flex-wrap">
            <h2 className="font-display text-xl font-semibold uppercase tracking-wide">Escenarios históricos</h2>
            <span className="inline-flex items-center gap-1.5 text-xs text-white/80">
              <Trophy size={14} className="text-accent" />
              {reelections === 1 ? '1 reelección ganada' : `${reelections} reelecciones ganadas`}
            </span>
          </div>
          <p className="text-white/70 text-sm mb-4">Momentos difíciles de la historia argentina. Se desbloquean ganando reelecciones.</p>
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
                  onClick={() => unlocked && chooseScenario(sc.id)}
                  className={`relative text-left rounded-xl border-2 overflow-hidden transition-all flex ${
                    unlocked ? selectableCls(scenarioId === sc.id) : 'bg-white/5 border-white/10 cursor-not-allowed'
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

          <div className="relative flex items-center gap-3 mb-10 w-fit">
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
                  denied ? 'bg-red-500/80 ring-2 ring-red-400/60' : progress.unlockAll ? 'bg-accent' : 'bg-white/25'
                }`}
              >
                <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all ${progress.unlockAll ? 'left-5' : 'left-0.5'}`} />
              </span>
              <span className={denied ? 'text-red-200' : 'text-white/80'}>Desbloquear todos los escenarios</span>
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

          {/* Plataforma del partido: opcional, apagada por defecto */}
          <div className="rounded-xl border border-white/15 bg-white/5 p-5 mb-10">
            <div className="flex items-center justify-between gap-4 mb-1 flex-wrap">
              <h2 className="font-display text-xl font-semibold uppercase tracking-wide">
                Plataforma de tu partido <span className="ml-1 align-middle text-[10px] font-sans normal-case tracking-normal px-1.5 py-0.5 rounded border border-white/25 text-white/70">Opcional</span>
              </h2>
              <button
                role="switch"
                aria-checked={platformOn}
                onClick={() => setPlatformOn(v => !v)}
                className="flex items-center gap-2 text-sm"
              >
                <span className={`relative inline-block w-10 h-5 rounded-full transition-colors ${platformOn ? 'bg-accent' : 'bg-white/25'}`}>
                  <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all ${platformOn ? 'left-5' : 'left-0.5'}`} />
                </span>
                {platformOn ? 'Activada' : 'Desactivada'}
              </button>
            </div>
            <p className="text-white/70 text-sm">
              {platformOn
                ? 'El oficialismo espera ver estos resultados en el país. Si gobernás en contra, se enfría la disciplina de tu bancada.'
                : 'No hace falta para jugar. Desactivada, tu partido mira lo de siempre: actividad, cuentas públicas, garantías y protección social.'}
            </p>
            <div className={`grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4 ${platformOn ? '' : 'hidden'}`}>
              {PLATFORMS.map(pl => (
                <button
                  key={pl.id}
                  onClick={() => setPlatformId(pl.id)}
                  className={`text-left p-4 rounded-xl border-2 transition-all ${selectableCls(platformId === pl.id)}`}
                >
                  <h3 className="font-bold text-sm">{pl.name}</h3>
                  <p className="text-xs opacity-80 mt-1 leading-snug">{pl.description}</p>
                  <p className="text-[10px] opacity-60 mt-2">
                    {pl.items.map(it => `${indicatorName(it.indicatorId)} ${it.weight > 0 ? '↑' : '↓'}`).join(' · ')}
                  </p>
                </button>
              ))}
              <button
                onClick={() => setPlatformId(OWN_PLATFORM_ID)}
                className={`text-left p-4 rounded-xl border-2 border-dashed transition-all ${selectableCls(platformId === OWN_PLATFORM_ID)}`}
              >
                <h3 className="font-bold text-sm flex items-center gap-1.5"><Sparkles size={14} className="text-accent" /> Tu propia plataforma</h3>
                <p className="text-xs opacity-80 mt-1 leading-snug">
                  No la definís ahora: la armás mientras gobernás. Tu partido adopta lo que más empujes con tus acciones y se actualiza turno a turno.
                </p>
              </button>
            </div>
          </div>

          <div className="flex flex-col-reverse sm:flex-row gap-3">
            <button
              onClick={onBack}
              className="flex items-center justify-center gap-2 font-display font-bold py-4 px-6 rounded-xl border border-white/30 bg-white/5 hover:bg-white/10 transition-colors uppercase tracking-wide"
            >
              <ArrowLeft className="w-5 h-5" />
              Volver
            </button>
            <button
              onClick={handleStart}
              className="flex-1 flex items-center justify-center gap-2 font-display font-bold py-4 px-6 rounded-xl bg-accent hover:bg-accent/90 text-accent-foreground shadow-lg transition-colors text-lg uppercase tracking-wide"
            >
              <Play className="w-5 h-5" />
              Comenzar gestión
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
