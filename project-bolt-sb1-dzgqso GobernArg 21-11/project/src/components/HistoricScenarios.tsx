import { useState } from 'react';
import { LITE_FEATURES } from '@/lite/config';
import { Lock, Trophy } from 'lucide-react';
import { IMAGES } from '../utils/imageAssets';
import { HISTORIC_SCENARIOS, isScenarioUnlocked } from '../data/causal';
import { loadProgress } from '@/lib/progress';

/** Desafíos existentes: opcionales, plegados y con el progreso propio de Light. */
export function HistoricScenarios({ scenarioId, onSelect }: { scenarioId: string; onSelect: (id: string) => void }) {
  const [progress] = useState(loadProgress);
  const current = HISTORIC_SCENARIOS.find(sc => sc.id === scenarioId);
  if (!LITE_FEATURES.escenariosHistoricos) return null;
  return (
    <details className="mb-7 rounded-xl border border-rule bg-surface">
      <summary className="cursor-pointer px-4 py-3 text-[14px] font-bold text-ink min-h-11">
        <span>Escenarios históricos</span>
        <span className="ml-2 text-[12px] font-normal text-sala-muted">{current ? `Elegido: ${current.name}` : 'Desafíos opcionales'}</span>
      </summary>
      <div className="px-4 pb-4">
        <p className="flex items-center gap-1.5 text-[12px] text-sala-muted mb-3">
          <Trophy size={14} className="text-gold-ink" />
          {progress.reelectionsWon} {progress.reelectionsWon === 1 ? 'reelección ganada' : 'reelecciones ganadas'}. Cada desafío conserva sus requisitos.
        </p>
        <div role="radiogroup" aria-label="Escenario histórico" className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {HISTORIC_SCENARIOS.map(sc => {
            const unlocked = isScenarioUnlocked(sc, progress.reelectionsWon, progress.unlockAll);
            const img = (IMAGES[sc.image.group] as Record<string, string>)[sc.image.key];
            const selected = scenarioId === sc.id;
            return (
              <button key={sc.id} role="radio" aria-checked={selected} aria-disabled={!unlocked}
                onClick={() => unlocked && onSelect(sc.id)}
                className={`relative text-left rounded-lg border-2 overflow-hidden flex transition-colors ${selected ? 'border-sala-blue bg-sala-blue/5' : 'border-rule bg-sunken/40'} ${unlocked ? 'hover:border-sala-blue/50' : 'cursor-not-allowed'}`}>
                {img && <img src={img} alt="" loading="lazy" className={`w-20 object-cover shrink-0 ${unlocked ? '' : 'grayscale opacity-60'}`} />}
                <span className="p-3 min-w-0">
                  <span className="block font-bold text-[14px] text-ink">{sc.name}</span>
                  <span className="block text-[11px] text-sala-muted mt-1">{sc.era} · {sc.difficulty}</span>
                  {unlocked ? <span className="block text-[12px] text-ink/85 mt-2 leading-snug">{sc.description}</span> : (
                    <span className="flex items-start gap-1 text-[12px] text-sala-muted mt-2 leading-snug">
                      <Lock size={12} className="shrink-0 mt-0.5" />
                      Ganá {sc.reelectionsToUnlock === 1 ? 'tu primera reelección' : `${sc.reelectionsToUnlock} reelecciones`} para desbloquearlo.
                    </span>
                  )}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </details>
  );
}
