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
import { fmtBudget } from '@/lib/format';
import { UI_CATEGORY_STYLES } from '@/data/categoryStyles';
import { ACTORS, SENSITIVITIES, type ActorId } from '@/data/causal';
import { COALITION_ACTIONS, type Availability } from '@/engine/causal';
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
  const costLabel = caja < 0 ? `−${fmtBudget(Math.abs(caja))}` : caja > 0 ? `+${fmtBudget(caja)}` : '$0';
  const requested = requestedBy.length > 0;

  // Determinar nivel de riesgo visual para B0 badge
  const riskLevel = action.risksText
    ? action.risksText.toLowerCase().includes('alto') || action.risksText.toLowerCase().includes('paro') || action.risksText.toLowerCase().includes('crisis')
      ? 'alto'
      : action.risksText.toLowerCase().includes('crítico') || action.risksText.toLowerCase().includes('default')
      ? 'critico'
      : 'medio'
    : 'bajo';

  return (
    <InfoTooltip
      content={
        <div className="flex flex-col gap-1.5 max-w-[280px]">
          {action.strategic && <p className="text-[11px] text-white/80 leading-snug">{action.strategic}</p>}
          {timeline.length > 0 && (
            <div>
              <div className="font-semibold text-[11px] text-white mb-0.5">Efectos previstos</div>
              {timeline.map(t => (
                <div key={t.when} className="text-[10px] text-white/70 leading-snug">
                  <span className="text-white/50">{t.when}:</span>{' '}
                  {t.chips.map((c, i) => (
                    <span key={i}>{i > 0 && ' · '}<ChipInline chip={c} /></span>
                  ))}
                </div>
              ))}
            </div>
          )}
          {(winners.length > 0 || losers.length > 0) && (
            <div className="text-[10px] text-white/60">
              {winners.length > 0 && <div><span className="text-emerald-400 font-semibold">Favorece:</span> {winners.map(a => ACTORS[a].shortName).join(', ')}</div>}
              {losers.length > 0 && <div><span className="text-red-400 font-semibold">Perjudica:</span> {losers.map(a => ACTORS[a].shortName).join(', ')}</div>}
            </div>
          )}
          {action.risksText && <div className="text-[10px] text-amber-300">Riesgo: {action.risksText}</div>}
          {COALITION_ACTIONS[action.id] && (
            <div className="text-[10px] text-amber-300 font-medium">
              Abre una interna en tu partido (+{COALITION_ACTIONS[action.id]}): tus políticas rinden menos y cuestan más.
            </div>
          )}
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
        className={`relative flex flex-col justify-between gap-3 rounded-xl border p-4 transition-all duration-200 min-h-[160px] ${
          blocked ? 'opacity-50 cursor-not-allowed bg-[#0b1626] border-white/6' : ''
        } ${
          isSelected
            ? 'border-blue-500 bg-blue-500/10 ring-2 ring-blue-500/40 shadow-lg shadow-blue-500/10'
            : blocked
              ? 'border-white/6 bg-[#0c182b]'
              : 'border-white/10 bg-[#0f1e38] hover:border-white/20 hover:bg-[#132545] cursor-pointer shadow-md'
        }`}
      >
        {/* Cabecera: Badges de Categoría y Estado */}
        <div>
          <div className="flex items-center justify-between gap-2 mb-2">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider border ${style.color} ${style.bgColor} ${style.borderColor}`}>
                {style.label}
              </span>
              {action.isReform && (
                <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider text-purple-300 bg-purple-500/20 border border-purple-500/30">
                  REFORMA
                </span>
              )}
              {action.ley && !action.isReform && (
                <span className="inline-flex items-center gap-0.5 text-[8px] text-cyan-300 bg-cyan-500/10 border border-cyan-500/20 px-1 py-0.5 rounded uppercase font-semibold">
                  <Scale size={8} />
                  {needsDnu && available ? 'DNU' : 'LEY'}
                </span>
              )}
            </div>

            <div className="flex items-center gap-1">
              {requested && !blocked && (
                <span className="inline-flex items-center gap-1 text-[9px] text-amber-300 bg-amber-400/15 border border-amber-400/30 px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">
                  <Star size={9} className="fill-amber-300" />
                  PEDIDA
                </span>
              )}
              {blocked && (
                <span className="inline-flex items-center gap-1 text-[9px] text-red-400 bg-red-400/15 border border-red-400/30 px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">
                  <Lock size={9} />
                  BLOQUEADA
                </span>
              )}
            </div>
          </div>

          {/* Título y descripción */}
          <h3 className="font-['Barlow_Condensed'] font-bold text-lg text-white leading-snug">{action.name}</h3>
          <p className="text-[11px] text-white/60 leading-snug mt-1 line-clamp-2">{action.description}</p>
        </div>

        {/* Costos e impactos resumidos */}
        <div className="space-y-2">
          <div className="flex items-center gap-3 font-mono text-[12px]">
            <span className={`font-bold ${caja > 0 ? 'text-emerald-400' : caja === 0 ? 'text-white/40' : blockReason === 'No alcanza la caja.' ? 'text-red-400' : 'text-white/90'}`}>
              $ {costLabel}
            </span>
            <span className="text-white/30">•</span>
            <span className="text-blue-300 font-bold flex items-center gap-1">
              <Flag size={10} />
              {pa} acc.
            </span>
          </div>

          {COALITION_ACTIONS[action.id] && (
            <div className="text-[10px] text-amber-300 leading-snug bg-amber-500/10 border border-amber-500/20 px-2 py-1 rounded">
              ⚠️ Abre interna en tu partido (+{COALITION_ACTIONS[action.id]})
            </div>
          )}

          {/* Lista rápida de chips de efectos */}
          {timeline.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {timeline[0].chips.slice(0, 2).map((c, i) => (
                <span key={i} className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] border font-mono ${toneChipClass(c.tone)}`}>
                  ⚡ {c.label} {c.text}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Pie: Riesgo y CTA de Ejecutar */}
        <div className="flex items-center justify-between gap-2 pt-2 border-t border-white/8 mt-1">
          <div className="flex items-center gap-1 text-[10px]">
            {action.risksText ? (
              <span className={`flex items-center gap-1 font-semibold ${
                riskLevel === 'critico' ? 'text-red-400' : riskLevel === 'alto' ? 'text-orange-400' : 'text-amber-400'
              }`}>
                <AlertTriangle size={10} />
                Riesgo {riskLevel}
              </span>
            ) : (
              <span className="text-white/40 font-mono text-[9px]">Riesgo bajo</span>
            )}
          </div>

          {isSelected ? (
            <span className="inline-flex items-center gap-1 text-[12px] font-bold text-emerald-400 font-['Barlow_Condensed'] uppercase tracking-wider">
              <Check size={13} />
              SELECCIONADA
            </span>
          ) : !blocked ? (
            <span className="inline-flex items-center gap-1 text-[12px] font-bold text-blue-400 font-['Barlow_Condensed'] uppercase tracking-wider hover:translate-x-0.5 transition-transform">
              EJECUTAR →
            </span>
          ) : (
            <span className="text-[10px] text-red-400/80 truncate max-w-[140px]" title={blockReason ?? ''}>
              {blockReason}
            </span>
          )}
        </div>
      </div>
    </InfoTooltip>
  );
}
