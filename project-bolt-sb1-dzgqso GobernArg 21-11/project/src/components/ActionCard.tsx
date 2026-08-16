import {
  AlertTriangle,
  ArrowRight,
  Clock,
  Zap,
  Lock,
  Star,
  Award,
  DollarSign,
  Flag,
  Check,
  ThumbsUp,
  ThumbsDown,
} from 'lucide-react';
import { GameAction, GameState } from '../types/game';
import { Tooltip, TooltipContent } from './Tooltip';
import { InfoTooltip } from './InfoTooltip';
import { getActionRisk, riskColor, riskLabel } from '@/lib/risk';
import {
  fmtBudget,
  formatImmediateEffect,
  formatFutureEffect,
  getBlockReason,
  getRecReason,
} from '@/lib/format';
import { CATEGORY_STYLES } from '@/data/categoryStyles';
import { actionDefinitions, type ActionDefinition } from '@/data/actionRegistry';

interface ActionCardProps {
  action: GameAction;
  gameState: GameState;
  onSelect: () => void;
  disabled: boolean;
  isSelected: boolean;
}

type ActionStatus = 'available' | 'blocked' | 'bonus' | 'recommended';

function getActionStatus(
  action: GameAction,
  state: GameState,
  disabled: boolean,
  blockReason: string | null,
): { status: ActionStatus; reason: string | null } {
  if (disabled || blockReason) {
    return { status: 'blocked', reason: blockReason ?? 'No disponible' };
  }
  const rec = getRecReason(action, state);
  if (rec) return { status: 'recommended', reason: rec };
  if (action.futureEffects && action.futureEffects.length > 0) {
    const positive = action.futureEffects.some((f) => (f.budgetChange ?? 0) > 0 || (f.popularityChange ?? 0) > 0);
    if (positive) return { status: 'bonus', reason: 'Efecto positivo diferido' };
  }
  return { status: 'available', reason: null };
}

function StatusBadge({ status, reason }: { status: ActionStatus; reason: string | null }) {
  if (status === 'recommended') {
    return (
      <Tooltip content={<TooltipContent label="Recomendada" detail={reason ?? undefined} />}>
        <span className="inline-flex items-center gap-1 text-[10px] text-amber-300 bg-amber-400/12 border border-amber-400/20 px-1.5 py-0.5 rounded font-semibold uppercase tracking-wide">
          <Star size={9} className="fill-amber-300" />
          REC
        </span>
      </Tooltip>
    );
  }
  if (status === 'blocked') {
    return (
      <Tooltip content={<TooltipContent label="Bloqueada" detail={reason ?? undefined} />}>
        <span className="inline-flex items-center gap-1 text-[10px] text-red-400 bg-red-400/10 border border-red-400/20 px-1.5 py-0.5 rounded font-semibold uppercase tracking-wide">
          <Lock size={9} />
          BLQ
        </span>
      </Tooltip>
    );
  }
  if (status === 'bonus') {
    return (
      <span className="inline-flex items-center gap-1 text-[10px] text-emerald-400 bg-emerald-400/10 border border-emerald-400/20 px-1.5 py-0.5 rounded font-semibold uppercase tracking-wide">
        <Award size={9} />
        BON
      </span>
    );
  }
  return null;
}

export function ActionCard({ action, gameState, onSelect, disabled, isSelected }: ActionCardProps) {
  const blockReason = getBlockReason(action, gameState);
  const { status, reason } = getActionStatus(action, gameState, disabled, blockReason);
  const isBlocked = status === 'blocked';
  const risk = getActionRisk(action, gameState);
  const immediate = formatImmediateEffect(action);
  const future = formatFutureEffect(action);
  const categoryStyle = CATEGORY_STYLES[action.category];
  const actionCost = action.actionCost ?? 1;
  const costLabel =
    action.budgetChange < 0
      ? `−${fmtBudget(Math.abs(action.budgetChange))}`
      : action.budgetChange > 0
        ? `+${fmtBudget(action.budgetChange)}`
        : 'Gratis';

  // Look up registry definition for affected groups
  const definition: ActionDefinition | undefined = actionDefinitions.find((d) => d.id === action.id);

  return (
    <InfoTooltip
      content={
        <div className="flex flex-col gap-1.5 max-w-[240px]">
          {/* Grupos afectados */}
          {definition?.affectedGroups && (
            <div>
              <div className="font-semibold text-[11px] mb-0.5">Grupos afectados</div>
              {definition.affectedGroups.supports.length > 0 && (
                <div className="flex items-start gap-1 text-[10px]">
                  <ThumbsUp size={10} className="text-emerald-400 mt-0.5 shrink-0" />
                  <span className="text-emerald-300">
                    Apoyan: {definition.affectedGroups.supports.join(', ')}
                  </span>
                </div>
              )}
              {definition.affectedGroups.opposes.length > 0 && (
                <div className="flex items-start gap-1 text-[10px]">
                  <ThumbsDown size={10} className="text-red-400 mt-0.5 shrink-0" />
                  <span className="text-red-300">
                    Se oponen: {definition.affectedGroups.opposes.join(', ')}
                  </span>
                </div>
              )}
            </div>
          )}
          {/* Efectos diferidos */}
          {action.futureEffects && action.futureEffects.length > 0 && (
            <div>
              <div className="font-semibold text-[11px] mb-0.5">Efectos diferidos</div>
              {action.futureEffects.map((f, i) => (
                <div key={i} className="text-[10px] text-muted-foreground">
                  Turno +{f.delay}:{' '}
                  {f.budgetChange ? `${f.budgetChange > 0 ? '+' : '−'}${fmtBudget(Math.abs(f.budgetChange))} ` : ''}
                  {f.popularityChange ? `${f.popularityChange > 0 ? '+' : ''}${f.popularityChange}% pop.` : ''}
                  {!f.budgetChange && !f.popularityChange ? 'Efecto diferido' : ''}
                </div>
              ))}
            </div>
          )}
          {/* Costo real */}
          <div>
            <div className="font-semibold text-[11px] mb-0.5">Costo real</div>
            <div className="text-[10px] text-muted-foreground">
              {action.budgetChange !== 0
                ? `${action.budgetChange > 0 ? '+' : '−'}${fmtBudget(Math.abs(action.budgetChange))}`
                : 'Sin costo'}
              {actionCost > 0 ? ` • ${actionCost} acc.` : ''}
              {action.cooldown ? ` • CD ${action.cooldown}t` : ''}
            </div>
          </div>
        </div>
      }
    >
    <div
      role="button"
      tabIndex={isBlocked ? -1 : 0}
      onClick={() => !isBlocked && onSelect()}
      onKeyDown={(e) => {
        if ((e.key === 'Enter' || e.key === ' ') && !isBlocked) {
          e.preventDefault();
          onSelect();
        }
      }}
      className={`relative flex flex-col gap-2 rounded-lg border border-l-4 p-3.5 transition-all duration-150 ${
        isBlocked ? 'opacity-60 cursor-not-allowed' : ''
      } ${
        isSelected
          ? 'border-primary bg-primary/10 ring-1 ring-primary/40'
          : isBlocked
            ? `${categoryStyle.borderColor} border border-border bg-card`
            : `${categoryStyle.borderColor} border border-border bg-card hover:border-white/20 hover:bg-white/3 cursor-pointer`
      }`}
    >
      {/* Status badge */}
      {status !== 'available' && (
        <div className="absolute top-2.5 right-2.5">
          <StatusBadge status={status} reason={reason} />
        </div>
      )}

      {/* Header: category + title */}
      <div className="pr-14">
        <div className="flex items-center gap-1.5 mb-0.5">
          <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-semibold uppercase tracking-widest border ${categoryStyle.color} ${categoryStyle.bgColor} ${categoryStyle.borderColor}`}>
            <img src={categoryStyle.imageSrc} alt={categoryStyle.label} className="w-3 h-3 object-contain" />
            {categoryStyle.label}
          </span>
          {action.isReform && (
            <span className="text-[8px] text-purple-300 bg-purple-400/10 border border-purple-400/20 px-1 py-0 rounded uppercase tracking-wide font-semibold">
              Reforma
            </span>
          )}
        </div>
        <h3 className="font-display font-bold text-base text-foreground leading-tight">
          {action.title}
        </h3>
      </div>

      {/* Costs */}
      <div className="flex items-center gap-2.5 flex-wrap">
        <span className="inline-flex items-center gap-1.5 rounded-md border border-border bg-white/5 px-2 py-1">
          <DollarSign size={12} className="text-muted-foreground" />
          <span
            className={`font-mono font-bold text-[13px] ${
              action.budgetChange > 0
                ? 'text-emerald-400'
                : action.budgetChange === 0
                  ? 'text-muted-foreground'
                  : isBlocked && blockReason?.startsWith('Presupuesto')
                    ? 'text-red-400'
                    : 'text-foreground/80'
            }`}
          >
            {costLabel}
          </span>
        </span>
        {actionCost > 0 && (
          <span className="inline-flex items-center gap-1.5 rounded-md border border-primary/30 bg-primary/15 px-2 py-1 text-primary">
            <Flag size={12} />
            <span className="font-mono font-bold text-[13px]">
              {actionCost} acc.
            </span>
          </span>
        )}
        {action.cooldown && action.cooldown > 0 && (
          <span className="inline-flex items-center gap-1.5 rounded-md border border-border bg-white/5 px-2 py-1 text-muted-foreground">
            <Clock size={11} />
            <span className="font-mono text-[11px]">{action.cooldown}t cd</span>
          </span>
        )}
      </div>

      {/* Effects */}
      <div className="space-y-1">
        <div className="flex gap-1.5 items-start">
          <Zap size={10} className="text-muted-foreground mt-0.5 flex-shrink-0" />
          <span className="text-[11px] text-foreground/70 leading-snug">{immediate}</span>
        </div>
        {future && (
          <div className="flex gap-1.5 items-start">
            <Clock size={9} className="text-muted-foreground/60 mt-0.5 flex-shrink-0" />
            <span className="text-[10px] text-muted-foreground leading-snug">{future}</span>
          </div>
        )}
      </div>

      {/* Footer: risk + CTA */}
      <div className="flex items-center justify-between gap-2 pt-1 border-t border-border mt-auto">
        <div className="inline-flex items-center gap-1.5">
          <AlertTriangle size={10} className={riskColor(risk)} />
          <span className={`text-[10px] ${riskColor(risk)}`}>Riesgo {riskLabel(risk).toLowerCase()}</span>
        </div>
        {isSelected ? (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-primary font-display uppercase tracking-wide">
            <Check size={11} />
            Seleccionada
          </span>
        ) : !isBlocked ? (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-primary font-display uppercase tracking-wide">
            Ejecutar
            <ArrowRight size={11} />
          </span>
        ) : (
          <span className="text-[10px] text-red-400/70 max-w-[140px] text-right truncate">
            {reason}
          </span>
        )}
      </div>
    </div>
    </InfoTooltip>
  );
}
