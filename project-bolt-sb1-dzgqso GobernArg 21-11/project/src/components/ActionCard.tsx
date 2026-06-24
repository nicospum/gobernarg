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
} from 'lucide-react';
import { GameAction, GameState } from '../types/game';
import { Tooltip, TooltipContent } from './Tooltip';
import { getActionRisk, riskColor, riskLabel } from '@/lib/risk';
import {
  fmtBudget,
  formatImmediateEffect,
  formatFutureEffect,
  getBlockReason,
  getRecReason,
} from '@/lib/format';
import { CATEGORY_ICONS, CATEGORY_LABELS } from '@/lib/icons';

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
  const CategoryIcon = CATEGORY_ICONS[action.category];
  const categoryLabel = CATEGORY_LABELS[action.category];
  const actionCost = action.actionCost ?? 1;
  const costLabel =
    action.budgetChange < 0
      ? `−${fmtBudget(Math.abs(action.budgetChange))}`
      : action.budgetChange > 0
        ? `+${fmtBudget(action.budgetChange)}`
        : 'Gratis';

  return (
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
      className={`relative flex flex-col gap-2 rounded-lg border p-3.5 transition-all duration-150 ${
        isSelected
          ? 'border-primary bg-primary/10 ring-1 ring-primary/40'
          : isBlocked
            ? 'border-border bg-card opacity-60 cursor-not-allowed'
            : 'border-border bg-card hover:border-white/20 hover:bg-white/3 cursor-pointer'
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
          <CategoryIcon size={12} className="text-muted-foreground" />
          <span className="text-[9px] text-muted-foreground uppercase tracking-widest">
            {categoryLabel}
          </span>
          {action.isReform && (
            <span className="text-[8px] text-purple-300 bg-purple-400/10 border border-purple-400/20 px-1 py-0 rounded uppercase tracking-wide font-semibold">
              Reforma
            </span>
          )}
        </div>
        <h3 className="font-display font-semibold text-[14px] text-foreground leading-tight">
          {action.title}
        </h3>
      </div>

      {/* Costs */}
      <div className="flex items-center gap-3 text-[11px] flex-wrap">
        <span className="inline-flex items-center gap-1">
          <DollarSign size={10} className="text-muted-foreground" />
          <span
            className={`font-mono font-semibold ${
              action.budgetChange > 0
                ? 'text-emerald-400'
                : action.budgetChange === 0
                  ? 'text-muted-foreground'
                  : isBlocked && blockReason?.startsWith('Presupuesto')
                    ? 'text-red-400'
                    : 'text-foreground/70'
            }`}
          >
            {costLabel}
          </span>
        </span>
        {actionCost > 0 && (
          <span className="inline-flex items-center gap-1 text-muted-foreground">
            <Flag size={9} />
            <span className="font-mono">
              {actionCost} acc.
            </span>
          </span>
        )}
        {action.cooldown && action.cooldown > 0 && (
          <span className="inline-flex items-center gap-1 text-muted-foreground">
            <Clock size={9} />
            <span className="font-mono text-[10px]">{action.cooldown}t cd</span>
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
  );
}
