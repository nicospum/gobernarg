import { useState } from 'react';
import { Info, UserPlus, UserMinus } from 'lucide-react';
import type { GameState, AdvisorWithStatus } from '../types/game';
import { AdvisorSelectionModal } from './AdvisorSelectionModal';
import { AdvisorDismissModal } from './AdvisorDismissModal';
import { InfoTooltip } from './InfoTooltip';
import { getAdvisorPortrait } from '../utils/imageAssets';
import { ADVISOR_ROLES } from '../data/advisors';
import { fmtBudget } from '@/lib/format';

export function AdvisorPanel({ gameState, onHireAdvisor, onDismissAdvisor }: { gameState: GameState; onHireAdvisor: (advisors: AdvisorWithStatus[]) => void; onDismissAdvisor: (advisor: AdvisorWithStatus) => void }) {
  const [hire, setHire] = useState(false);
  const [dismiss, setDismiss] = useState(false);
  return <section className="bg-surface border border-rule rounded-lg p-4 space-y-3">
    <div className="flex items-center justify-between gap-3 border-b border-rule pb-3">
      <div><h2 className="font-display font-semibold text-lg">Gabinete y asesores ({gameState.advisors.length}/2)</h2><p className="text-[12px] text-ink/70">Especialistas para tu estrategia</p></div>
      {!gameState.advisorActionUsed && <div className="flex gap-2">{gameState.advisors.length > 0 && <button type="button" onClick={() => setDismiss(true)} aria-label="Despedir asesor" className="min-h-11 min-w-11 border border-rule rounded text-negative"><UserMinus size={16} className="mx-auto" /></button>}{gameState.advisors.length < 2 && <button type="button" onClick={() => setHire(true)} className="min-h-11 px-3 rounded bg-ink text-paper inline-flex gap-1 items-center text-[13px]"><UserPlus size={15} />Contratar</button>}</div>}
    </div>
    {gameState.advisors.length === 0 ? <p className="text-[13px] text-ink/70">Podés contratar hasta dos asesores. Sus aportes y sueldos se ven antes de elegir.</p> : gameState.advisors.map(advisor => {
      const role = ADVISOR_ROLES[advisor.id];
      return <article key={advisor.id} className="rounded border border-rule p-3">
        <div className="flex gap-2 items-start"><img src={getAdvisorPortrait(advisor.specialty, advisor.id)} alt="" className="w-12 h-12 rounded object-cover" /><div className="flex-1"><h3 className="font-display font-semibold">{advisor.name}</h3><p className="text-[12px] text-ink/70">{advisor.specialty} · Sueldo {fmtBudget(role?.salary ?? 0)}/trimestre</p></div><InfoTooltip title={advisor.name} clickToOpen content={<ul className="list-disc pl-4 space-y-1 text-[13px]">{role?.perks.map(perk => <li key={perk}>{perk}</li>)}</ul>}><button type="button" aria-label={`Aportes de ${advisor.name}`} className="min-w-9 min-h-9 rounded hover:bg-sunken"><Info size={15} className="mx-auto" /></button></InfoTooltip></div>
        <p className="mt-2 text-[12px] text-ink/80 leading-relaxed">{role?.perks.slice(0, 2).join(' · ')}</p>
      </article>;
    })}
    {hire && <AdvisorSelectionModal gameState={gameState} maxSelections={2 - gameState.advisors.length} onClose={() => setHire(false)} onHire={advisors => { onHireAdvisor(advisors); setHire(false); }} />}
    {dismiss && <AdvisorDismissModal advisors={gameState.advisors} onClose={() => setDismiss(false)} onDismiss={advisor => { onDismissAdvisor(advisor); setDismiss(false); }} />}
  </section>;
}
