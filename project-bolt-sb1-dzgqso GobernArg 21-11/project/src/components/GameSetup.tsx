import { useState } from 'react';
import { ArrowLeft, Play } from 'lucide-react';
import { IMAGES } from '../utils/imageAssets';
import { DEFAULT_SCENARIO_ID, DIFFICULTY_LEVELS, getScenario, type ScenarioDef } from '../data/causal';
import { SetupSteps } from './SetupSteps';
import type { CharacterDraft } from './CharacterCreation';

interface GameSetupProps {
  draft: CharacterDraft;
  onBack: () => void;
  onStart: (scenarioId: string) => void;
}

function scenarioImage(sc: ScenarioDef): string | undefined {
  return (IMAGES[sc.image.group] as Record<string, string>)[sc.image.key];
}

function selectableCls(selected: boolean): string {
  return selected
    ? 'bg-ink/15 border-accent shadow-lg'
    : 'bg-ink/5 border-ink/20 hover:bg-ink/10 hover:border-ink/40';
}

export function GameSetup({ draft, onBack, onStart }: GameSetupProps) {
  const [scenarioId, setScenarioId] = useState<string>(DEFAULT_SCENARIO_ID);
  const bg = scenarioImage(getScenario(scenarioId)) ?? IMAGES.backgrounds.presidentialOffice;

  const handleStart = () => onStart(scenarioId);

  return (
    <div className="relative min-h-screen text-ink overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-all duration-700"
        style={{ backgroundImage: `url(${bg})` }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-paper/25 via-paper/60 to-paper/95" />

      <div className="relative z-10 max-w-5xl mx-auto p-4 md:p-8">
        <div className="flex items-center justify-between gap-4 mb-6 flex-wrap">
          <img src={IMAGES.logo.primary} alt="Gobernarg" className="h-14 md:h-16 rounded-md shadow-sm" />
          <SetupSteps current={2} />
        </div>

        <div className="bg-surface/95 backdrop-blur rounded-xl p-6 md:p-10 shadow-[0_24px_60px_-20px_rgba(20,33,61,0.45)] border border-rule">
          <div className="flex items-center gap-3 mb-8">
            <img src={draft.avatar} alt="" className="w-12 h-12 rounded-full object-cover bg-ink/20 border border-ink/30" />
            <div>
              <h1 className="font-display text-3xl md:text-4xl font-semibold  ">Elegí la dificultad</h1>
              <p className="text-ink/80">{draft.governorName} está por asumir. ¿Con qué país arranca?</p>
            </div>
          </div>

          {/* Niveles: cada uno abre un escenario disponible desde el principio */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10" role="radiogroup" aria-label="Dificultad">
            {DIFFICULTY_LEVELS.map(level => {
              const sc = getScenario(level.scenarioId);
              const img = scenarioImage(sc);
              const selected = scenarioId === sc.id;
              return (
                <button
                  key={level.id}
                  role="radio"
                  aria-checked={selected}
                  onClick={() => setScenarioId(sc.id)}
                  className={`relative text-left rounded-xl border-2 overflow-hidden transition-all ${selectableCls(selected)}`}
                >
                  {img && <div className="h-28 bg-cover bg-center" style={{ backgroundImage: `url(${img})` }} />}
                  <div className="p-4">
                    <div className="font-display text-3xl font-semibold   leading-none">{level.label}</div>
                    <p className="text-sm italic text-ink/85 mt-2 leading-snug">{level.tagline}</p>
                    <div className="mt-4 pt-3 border-t border-ink/15">
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

          <div className="flex flex-col-reverse sm:flex-row gap-3">
            <button
              onClick={onBack}
              className="flex items-center justify-center gap-2 font-semibold py-3.5 px-6 rounded-md border border-rule hover:bg-sunken transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              Volver
            </button>
            <button
              onClick={handleStart}
              className="flex-1 flex items-center justify-center gap-2 font-semibold py-3.5 px-6 rounded-md bg-ink hover:bg-ink/90 text-paper transition-colors text-lg"
            >
              <Play className="w-5 h-5 text-gold" />
              Comenzar gestión
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
