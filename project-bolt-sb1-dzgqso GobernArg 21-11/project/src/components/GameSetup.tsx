import { PresidentialMark } from './causal/SituationRoom';
import { useState } from 'react';
import { ArrowLeft, Play } from 'lucide-react';
import { IMAGES } from '../utils/imageAssets';
import {
  DEFAULT_SCENARIO_ID,
  DIFFICULTY_LEVELS,
  getScenario,
  type ScenarioDef,
} from '../causal/scenarios';
import { DIFFICULTIES } from '../causal/campaignCatalog';
import type { Difficulty, Profile } from '../causal/campaignTypes';
import { SetupSteps } from './SetupSteps';
/** Lo que se definió en el paso 1 (Creá tu gobernante). */
export interface CharacterDraft {
  archetype: Profile;
  governorName: string;
  avatar: string;
}

interface GameSetupProps {
  draft: CharacterDraft;
  onBack: () => void;
  onStart: (scenarioId: string, difficulty: Difficulty) => void;
}

const scenarioOf = (id: string): ScenarioDef => getScenario(id) ?? getScenario(DEFAULT_SCENARIO_ID)!;

function scenarioImage(sc: ScenarioDef): string | undefined {
  return (IMAGES[sc.image.group] as Record<string, string>)[sc.image.key];
}

function selectableCls(selected: boolean): string {
  return selected
    ? 'bg-white/15 border-accent shadow-lg'
    : 'bg-white/5 border-white/20 hover:bg-white/10 hover:border-white/40';
}

export function GameSetup({ draft, onBack, onStart }: GameSetupProps) {
  const [scenarioId, setScenarioId] = useState<string>(DEFAULT_SCENARIO_ID);
  // Exigencia de la versión B: la sugiere el escenario; si el jugador la toca, se respeta.
  const [difficulty, setDifficulty] = useState<Difficulty>(scenarioOf(DEFAULT_SCENARIO_ID).suggestedDifficulty);
  const [difficultyTouched, setDifficultyTouched] = useState(false);
  const chooseScenario = (id: string) => {
    setScenarioId(id);
    if (!difficultyTouched) setDifficulty(scenarioOf(id).suggestedDifficulty);
  };
  const bg = scenarioImage(scenarioOf(scenarioId)) ?? IMAGES.backgrounds.presidentialOffice;

  const handleStart = () => onStart(scenarioId, difficulty);

  return (
    <div className="relative min-h-screen text-white overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-all duration-700"
        style={{ backgroundImage: `url(${bg})` }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-slate-900/85 via-blue-900/75 to-slate-900/90" />

      <div className="relative z-10 max-w-5xl mx-auto p-4 md:p-8">
        <div className="flex items-center justify-between gap-4 mb-6 flex-wrap">
          <div className="b-onboarding-mark"><PresidentialMark /></div>
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
