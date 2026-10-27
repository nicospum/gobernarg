import { AlertTriangle, ArrowRight, Check, Clock, Flag, Info, Lock, Scale, Star } from 'lucide-react';
import { InfoTooltip } from './InfoTooltip';
import { fmtBudget } from '@/lib/format';
import { UI_CATEGORY_STYLES } from '@/data/categoryStyles';
import { ACTORS, type ActorId } from '@/data/causal';
import { ACTION_PLAYER_NOTES, ACTION_RISK_TEXT } from '@/data/causal/playerTexts';
import { COALITION_ACTIONS, type Availability } from '@/engine/causal';

interface ActionCardProps {
  availability: Availability;
  /** Sólo demandas ya reveladas en una reunión. */
  requestedBy: ActorId[];
  onSelect: () => void;
  isSelected: boolean;
  disabled: boolean;
  disabledReason?: string;
}

const TAG_LABEL: Record<string, string> = {
  FEDERAL: 'Federal', AMBIENTAL: 'Ambiental', RESTRICTIVA: 'Restrictiva',
};

/** La tarjeta explica el intercambio; el seguimiento usa efectos reales del turno. */
export function ActionCard({ availability, requestedBy, onSelect, isSelected, disabled, disabledReason = 'No te quedan acciones este turno.' }: ActionCardProps) {
  const { action, pa, caja, reasons, available, needsDnu, repetitionWarning } = availability;
  const style = UI_CATEGORY_STYLES[action.category];
  const blocked = !isSelected && (!available || disabled);
  const blockReasons = !available ? reasons : disabled ? [disabledReason] : [];
  const costLabel = caja < 0 ? `−${fmtBudget(Math.abs(caja))}` : caja > 0 ? `+${fmtBudget(caja)}` : 'Sin costo de caja';
  const playerNote = ACTION_PLAYER_NOTES[action.id];
  const riskText = ACTION_RISK_TEXT[action.id] ?? action.risksText;
  const opensInterna = !!COALITION_ACTIONS[action.id];
  const headingId = `action-${action.id}`;

  return (
    <article aria-labelledby={headingId} className={`flex flex-col gap-3 rounded-lg border p-4 transition-colors ${
      isSelected ? 'border-ink bg-gold/10 ring-1 ring-ink' : 'border-rule bg-surface'
    }`}>
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-1.5 flex-wrap text-[11px] font-semibold">
          <span className={`inline-flex items-center gap-1 uppercase tracking-wide ${style.color}`}>
            <img src={style.imageSrc} alt="" className="w-3.5 h-3.5 object-contain" />{style.label}
          </span>
          {action.ley && <span className="inline-flex items-center gap-1 text-info-ink"><Scale size={12} />{needsDnu ? 'Ley por DNU' : 'Ley'}</span>}
          {action.tags.map(tag => <span key={tag} className="text-ink/70">· {TAG_LABEL[tag] ?? tag}</span>)}
        </div>
        {requestedBy.length > 0 && <span className="inline-flex items-center gap-1 text-[11px] text-gold-ink font-semibold"><Star size={12} />Pedida</span>}
      </div>

      <div>
        <h3 id={headingId} className="font-display font-semibold text-[18px] text-ink leading-snug">{action.name}</h3>
        <p className="text-[13px] text-ink/75 leading-relaxed mt-1">{action.description}</p>
      </div>

      <div className="flex items-center gap-x-3 gap-y-1 flex-wrap text-[13px] font-mono">
        <span className={`font-semibold ${caja > 0 ? 'text-positive' : 'text-ink'}`}>{costLabel}</span>
        <span className="inline-flex items-center gap-1 text-ink/80"><Flag size={12} />{pa} {pa === 1 ? 'acción' : 'acciones'}</span>
        {action.cooldown > 1 && <span className="inline-flex items-center gap-1 text-ink/75"><Clock size={12} />Cada {action.cooldown} turnos</span>}
      </div>

      {playerNote && <p className="text-[13px] leading-relaxed text-ink/85 border-l-2 border-gold/40 pl-3">{playerNote}</p>}
      {opensInterna && <p className="text-[12px] leading-relaxed text-caution bg-amber-500/10 p-2 rounded">Abre una interna en tu partido: las políticas cuestan más y rinden menos mientras dure.</p>}
      {repetitionWarning && <p className="flex items-start gap-1.5 text-[12px] text-caution leading-relaxed"><AlertTriangle size={14} className="mt-0.5 shrink-0" />{repetitionWarning}</p>}
      {blocked && <div className="text-[13px] text-negative leading-relaxed" role="status">
        <p className="flex items-center gap-1 font-semibold"><Lock size={13} />No disponible</p>
        {blockReasons.map(reason => <p key={reason}>{reason}</p>)}
      </div>}

      <div className="flex items-center gap-2 pt-3 mt-auto border-t border-rule">
        <InfoTooltip title={action.name} clickToOpen content={
          <div className="space-y-2 text-[13px] leading-relaxed">
            {riskText && <p><strong>A tener en cuenta:</strong> {riskText}</p>}
            {needsDnu && <p>Necesita un decreto porque no alcanza el apoyo legislativo. El DNU debe estar en el mismo turno.</p>}
            {requestedBy.length > 0 && <p><strong>Pedido conocido:</strong> {requestedBy.map(actor => ACTORS[actor].shortName).join(', ')}.</p>}
            <p>Agregarla prepara el turno. Podés quitarla antes de finalizarlo. Después, consultá los cambios en el resumen y el seguimiento en País, Actores y el Cuaderno.</p>
          </div>
        }>
          <button type="button" aria-label={`Ayuda sobre ${action.name}`} className="min-h-11 min-w-11 px-3 inline-flex items-center justify-center gap-1.5 rounded-md border border-rule text-[12px] text-ink hover:bg-sunken"><Info size={16} />Ayuda</button>
        </InfoTooltip>
        <button type="button" onClick={onSelect} disabled={blocked} aria-pressed={isSelected} aria-label={`${isSelected ? 'Quitar del turno' : 'Agregar al turno'}: ${action.name}`} className={`flex-1 min-h-11 px-3 inline-flex items-center justify-center gap-1.5 rounded-md text-[13px] font-semibold transition-colors ${isSelected ? 'bg-ink text-paper' : 'bg-ink/5 text-ink hover:bg-ink/10'} disabled:opacity-50 disabled:cursor-not-allowed`}>
          {isSelected ? <><Check size={15} />Quitar del turno</> : <>Agregar al turno<ArrowRight size={15} /></>}
        </button>
      </div>
    </article>
  );
}
