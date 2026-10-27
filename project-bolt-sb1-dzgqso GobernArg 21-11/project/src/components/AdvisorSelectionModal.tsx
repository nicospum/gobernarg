import { useState } from 'react';
import { X, Check } from 'lucide-react';
import type { Advisor, AdvisorWithStatus, GameState } from '../types/game';
import { availableAdvisors, ADVISOR_ROLES } from '../data/advisors';
import { getAdvisorPortrait } from '../utils/imageAssets';
import { fmtBudget, fmtSigned } from '@/lib/format';
import { useDialog } from '@/lib/useDialog';

interface AdvisorSelectionModalProps { onClose: () => void; onHire: (advisors: AdvisorWithStatus[]) => void; maxSelections: number; gameState: GameState }

export function AdvisorSelectionModal({ onClose, onHire, maxSelections, gameState }: AdvisorSelectionModalProps) {
  const dialogRef = useDialog<HTMLDivElement>(onClose);
  const [selected, setSelected] = useState<Advisor[]>([]);
  const total = selected.reduce((sum, advisor) => sum + advisor.cost, 0);
  const payroll = selected.reduce((sum, advisor) => sum + (ADVISOR_ROLES[advisor.id]?.salary ?? 0), 0);
  const canAfford = gameState.causal.caja >= total;
  const offers = availableAdvisors.filter(advisor => !gameState.advisors.some(hired => hired.id === advisor.id)
    && (!advisor.unlockRequirement || advisor.unlockRequirement.type !== 'popularity' || gameState.causal.political.apro >= advisor.unlockRequirement.value));
  const toggle = (advisor: Advisor) => setSelected(current => current.some(item => item.id === advisor.id)
    ? current.filter(item => item.id !== advisor.id) : current.length < maxSelections ? [...current, advisor] : current);
  return <div ref={dialogRef} aria-labelledby="advisor-hire-title" className="outline-none fixed inset-0 bg-ink/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
    <div className="bg-surface border border-rule rounded-xl w-full max-w-4xl max-h-[90dvh] flex flex-col shadow-2xl">
      <header className="px-5 py-4 border-b border-rule flex items-center justify-between gap-3">
        <div><h2 id="advisor-hire-title" className="font-display text-xl font-semibold">Contratar asesores</h2><p className="text-[12px] text-ink/70">Elegí hasta {maxSelections}. Contratación por única vez; sueldo en cada trimestre.</p></div>
        <button type="button" onClick={onClose} aria-label="Cerrar" className="min-w-11 min-h-11 flex items-center justify-center rounded hover:bg-sunken"><X size={20} /></button>
      </header>
      <div className="p-4 overflow-y-auto grid grid-cols-1 md:grid-cols-2 items-start gap-3">
        {offers.map(advisor => {
          const role = ADVISOR_ROLES[advisor.id];
          const chosen = selected.some(item => item.id === advisor.id);
          return <button type="button" key={advisor.id} aria-pressed={chosen} onClick={() => toggle(advisor)} disabled={!chosen && selected.length >= maxSelections}
            className={`rounded-lg border p-3 text-left transition-colors disabled:opacity-50 ${chosen ? 'border-ink bg-gold/10' : 'border-rule bg-surface hover:bg-sunken/40'}`}>
            <span className="flex gap-3 items-start"><img src={getAdvisorPortrait(advisor.specialty, advisor.id)} alt="" className="w-14 h-14 rounded-lg object-cover shrink-0" /><span className="min-w-0"><span className="block font-display text-[17px] font-semibold">{advisor.name}{chosen && <Check size={14} className="inline ml-1" />}</span><span className="block text-[12px] text-ink/70">{advisor.specialty}</span></span></span>
            <span className="block mt-3 text-[13px] font-semibold text-ink">Contratación {fmtBudget(advisor.cost)} · Sueldo {fmtBudget(role?.salary ?? 0)}/trimestre</span>
            <span className="block mt-1 text-[12px] text-ink/70">Imagen al contratar: {fmtSigned(role?.imagenOnHire ?? 0)}</span>
            <span className="block mt-2 text-[12px] text-ink/85 leading-relaxed">{role?.perks.join(' · ')}</span>
          </button>;
        })}
      </div>
      <footer className="px-5 py-4 border-t border-rule flex flex-wrap justify-between items-center gap-3">
        <div className="text-[13px]"><p>{selected.length}/{maxSelections} elegidos · Contratación {fmtBudget(total)}</p><p className="text-ink/70">Sueldo adicional {fmtBudget(payroll)}/trimestre</p>{!canAfford && <p className="text-negative">No alcanza la caja para contratar.</p>}</div>
        <button type="button" disabled={!selected.length || !canAfford} onClick={() => onHire(selected.map(advisor => ({ ...advisor, isActive: true, turnsInactive: 0 })))} className="min-h-11 px-5 rounded bg-ink text-paper font-semibold text-[13px] disabled:opacity-40">Contratar seleccionados</button>
      </footer>
    </div>
  </div>;
}
