import {
  AlertTriangle,
  ArrowRight,
  Clock,
  Lock,
  Star,
  DollarSign,
  Flag,
  Check,
  Scale,
  Users,
} from 'lucide-react';
import { InfoTooltip } from './InfoTooltip';
import { Tooltip, TooltipContent } from './Tooltip';
import { fmtBudget } from '@/lib/format';
import { UI_CATEGORY_STYLES } from '@/data/categoryStyles';
import { ACTORS, SENSITIVITIES, type ActorId } from '@/data/causal';
import type { Availability } from '@/engine/causal';
import {
  actionContextNotes,
  actionTimeline,
  affectedActors,
  toneChipClass,
  toneClass,
  type EffectChip,
} from '@/lib/causalText';

interface ActionCardProps {
  availability: Availability;
  /** Actores que pidieron esta acción en una reunión (demanda revelada). */
  requestedBy: ActorId[];
  onSelect: () => void;
  isSelected: boolean;
  /** No se puede agregar más (sin PA, elección pendiente…) aunque la acción esté disponible. */
  disabled: boolean;
}

const TAG_LABEL: Record<string, string> = {
  FEDERAL: 'Federal',
  AMBIENTAL: 'Ambiental',
  RESTRICTIVA: 'Restrictiva',
};

function ChipInline({ chip }: { chip: EffectChip }) {
  return (
    <span className="whitespace-nowrap">
      {chip.label} <span className={`font-mono ${toneClass(chip.tone)}`}>{chip.text}</span>
    </span>
  );
}

export function ActionCard({ availability, requestedBy, onSelect, isSelected, disabled }: ActionCardProps) {
  const { action, pa, caja, reasons, available, needsDnu, repetitionWarning } = availability;
  const style = UI_CATEGORY_STYLES[action.category];
  const blocked = !isSelected && (!available || disabled);
  const blockReason = !available ? reasons[0] : disabled ? 'No quedan puntos de acción.' : null;
  const timeline = actionTimeline(action.id);
  const notes = actionContextNotes(action.id);
  const { winners, losers } = affectedActors(action.id, SENSITIVITIES as Record<ActorId, { target: string; s: number }[]>);
  const costLabel = caja < 0 ? `−${fmtBudget(Math.abs(caja))}` : caja > 0 ? `+${fmtBudget(caja)}` : 'Sin costo';
  const requested = requestedBy.length > 0;

  return (
    <InfoTooltip
      content={
        <div className="flex flex-col gap-1.5 max-w-[280px]">
          {action.strategic && <p className="text-[11px] text-foreground/80 leading-snug">{action.strategic}</p>}
          {timeline.length > 0 && (
            <div>
              <div className="font-semibold text-[11px] mb-0.5">Qué produce</div>
              {timeline.map(t => (
                <div key={t.when} className="text-[10px] text-muted-foreground leading-snug">
                  <span className="text-foreground/70">{t.when}:</span>{' '}
                  {t.chips.map((c, i) => (
                    <span key={i}>{i > 0 && ' · '}<ChipInline chip={c} /></span>
                  ))}
                </div>
              ))}
            </div>
          )}
          {notes.conditional.length > 0 && (
            <div>
              <div className="font-semibold text-[11px] mb-0.5">Según el contexto</div>
              {notes.conditional.slice(0, 3).map(n => <div key={n} className="text-[10px] text-muted-foreground">• {n}</div>)}
            </div>
          )}
          {notes.repetition.length > 0 && (
            <div>
              <div className="font-semibold text-[11px] mb-0.5">Si se repite</div>
              {notes.repetition.slice(0, 2).map(n => <div key={n} className="text-[10px] text-amber-300/80">• {n}</div>)}
            </div>
          )}
          {(winners.length > 0 || losers.length > 0) && (
            <div className="text-[10px] text-muted-foreground">
              {winners.length > 0 && <div><span className="text-emerald-300">Lo valorarían:</span> {winners.map(a => ACTORS[a].shortName).join(', ')}</div>}
              {losers.length > 0 && <div><span className="text-red-300">Lo sufrirían:</span> {losers.map(a => ACTORS[a].shortName).join(', ')}</div>}
            </div>
          )}
          {action.risksText && <div className="text-[10px] text-orange-300/80">Riesgo: {action.risksText}</div>}
          <div className="text-[10px] text-muted-foreground">
            {costLabel} · {pa} PA{action.cooldown > 1 ? ` · repetible cada ${action.cooldown} turnos` : ''}
          </div>
        </div>
      }
    >
      <div
        role="button"
        tabIndex={blocked ? -1 : 0}
        onClick={() => !blocked && onSelect()}
        onKeyDown={(e) => {
          if ((e.key === 'Enter' || e.key === ' ') && !blocked) {
            e.preventDefault();
            onSelect();
          }
        }}
        className={`relative flex flex-col gap-2 rounded-lg border-l-4 border-y border-r p-3.5 transition-all duration-150 ${
          blocked ? 'opacity-55 cursor-not-allowed' : ''
        } ${
          isSelected
            ? 'border-primary bg-primary/10 ring-1 ring-primary/40'
            : blocked
              ? `${style.borderColor} border-y-border border-r-border bg-card`
              : `${style.borderColor} border-y-border border-r-border bg-card hover:border-white/20 hover:bg-white/3 cursor-pointer`
        }`}
      >
        {/* Badge de estado */}
        <div className="absolute top-2.5 right-2.5 flex gap-1">
          {requested && !blocked && (
            <Tooltip content={<TooltipContent label="Lo piden" detail={requestedBy.map(a => ACTORS[a].shortName).join(', ')} />}>
              <span className="inline-flex items-center gap-1 text-[10px] text-amber-300 bg-amber-400/12 border border-amber-400/20 px-1.5 py-0.5 rounded font-semibold uppercase tracking-wide">
                <Star size={9} className="fill-amber-300" />
                Pedida
              </span>
            </Tooltip>
          )}
          {blocked && (
            <Tooltip content={<TooltipContent label="Bloqueada" detail={blockReason ?? undefined} />}>
              <span className="inline-flex items-center gap-1 text-[10px] text-red-400 bg-red-400/10 border border-red-400/20 px-1.5 py-0.5 rounded font-semibold uppercase tracking-wide">
                <Lock size={9} />
                BLQ
              </span>
            </Tooltip>
          )}
        </div>

        {/* Categoría + título */}
        <div className="pr-16">
          <div className="flex items-center gap-1.5 mb-0.5 flex-wrap">
            <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-semibold uppercase tracking-widest border ${style.color} ${style.bgColor} ${style.borderColor}`}>
              <img src={style.imageSrc} alt={style.label} className="w-3 h-3 object-contain" />
              {style.label}
            </span>
            {action.ley && (
              <span className="inline-flex items-center gap-0.5 text-[8px] text-purple-300 bg-purple-400/10 border border-purple-400/20 px-1 py-0 rounded uppercase tracking-wide font-semibold">
                <Scale size={8} />
                {needsDnu && available ? 'Ley por DNU' : 'Ley'}
              </span>
            )}
            {action.tags.map(t => (
              <span key={t} className="text-[8px] text-muted-foreground bg-white/5 border border-border px-1 py-0 rounded uppercase tracking-wide">
                {TAG_LABEL[t] ?? t}
              </span>
            ))}
          </div>
          <h3 className="font-display font-bold text-base text-foreground leading-tight">{action.name}</h3>
          <p className="text-[11px] text-muted-foreground leading-snug mt-0.5">{action.description}</p>
        </div>

        {/* Costos */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <span className="inline-flex items-center gap-1.5 rounded-md border border-border bg-white/5 px-2 py-1">
            <DollarSign size={12} className="text-muted-foreground" />
            <span className={`font-mono font-bold text-[13px] ${caja > 0 ? 'text-emerald-400' : caja === 0 ? 'text-muted-foreground' : blockReason === 'No alcanza la caja.' ? 'text-red-400' : 'text-foreground/80'}`}>
              {costLabel}
            </span>
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-md border border-primary/30 bg-primary/15 px-2 py-1 text-primary">
            <Flag size={12} />
            <span className="font-mono font-bold text-[13px]">{pa} PA</span>
          </span>
          {action.cooldown > 1 && (
            <span className="inline-flex items-center gap-1.5 rounded-md border border-border bg-white/5 px-2 py-1 text-muted-foreground" title="Turnos entre usos">
              <Clock size={11} />
              <span className="font-mono text-[11px]">cada {action.cooldown}t</span>
            </span>
          )}
        </div>

        {/* Efectos en el tiempo (hasta 2 momentos) */}
        <div className="space-y-1">
          {timeline.slice(0, 2).map(t => (
            <div key={t.when} className="flex gap-1.5 items-start text-[11px] leading-snug">
              <span className="text-muted-foreground flex-shrink-0 w-[4.5rem] truncate">{t.when}</span>
              <span className="flex flex-wrap gap-1">
                {t.chips.slice(0, 3).map((c, i) => (
                  <span key={i} className={`inline-flex items-center gap-1 px-1.5 py-0 rounded border text-[10px] ${toneChipClass(c.tone)}`}>
                    {c.label} <span className="font-mono">{c.text}</span>
                  </span>
                ))}
              </span>
            </div>
          ))}
          {timeline.length > 2 && <div className="text-[10px] text-muted-foreground/70 pl-[4.5rem]">+ efectos posteriores</div>}
        </div>

        {/* Pie: aviso o actores afectados + CTA */}
        <div className="flex items-center justify-between gap-2 pt-1 border-t border-border mt-auto">
          <div className="inline-flex items-center gap-1.5 min-w-0">
            {repetitionWarning ? (
              <>
                <AlertTriangle size={10} className="text-amber-400 flex-shrink-0" />
                <span className="text-[10px] text-amber-300 truncate">{repetitionWarning}</span>
              </>
            ) : winners.length + losers.length > 0 ? (
              <>
                <Users size={10} className="text-muted-foreground flex-shrink-0" />
                <span className="text-[10px] text-muted-foreground truncate">
                  {winners.slice(0, 2).map(a => ACTORS[a].shortName).join(', ')}
                  {winners.length > 0 && losers.length > 0 && ' · '}
                  {losers.length > 0 && <span className="text-red-300/80">{losers.slice(0, 2).map(a => ACTORS[a].shortName).join(', ')} ↓</span>}
                </span>
              </>
            ) : null}
          </div>
          {isSelected ? (
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-primary font-display uppercase tracking-wide flex-shrink-0">
              <Check size={11} />
              Seleccionada
            </span>
          ) : !blocked ? (
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-primary font-display uppercase tracking-wide flex-shrink-0">
              Ejecutar
              <ArrowRight size={11} />
            </span>
          ) : (
            <span className="text-[10px] text-red-400/70 max-w-[170px] text-right truncate" title={blockReason ?? ''}>
              {blockReason}
            </span>
          )}
        </div>
      </div>
    </InfoTooltip>
  );
}
