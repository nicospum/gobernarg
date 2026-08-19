import {
  AlertTriangle, AlertCircle, CheckCircle,
  Landmark, DollarSign, Users, Globe, Leaf
} from 'lucide-react';
import { GameEvent } from '../systems/events/types';
import { getEventImage } from '../utils/imageAssets';
import { Progress } from './ui/progress';

interface EventModalProps {
  event: GameEvent;
  onChoice: (choiceId: string) => void;
  onClose: () => void;
}

/* ------------------------------------------------------------------ */
/*  Category helpers                                                   */
/* ------------------------------------------------------------------ */

const CATEGORY_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  political: Landmark,
  economic: DollarSign,
  social: Users,
  international: Globe,
  natural: Leaf,
};

const CATEGORY_LABELS: Record<string, string> = {
  political: 'Político',
  economic: 'Económico',
  social: 'Social',
  international: 'Internacional',
  natural: 'Natural',
};

/* ------------------------------------------------------------------ */
/*  Effect classification helpers                                      */
/* ------------------------------------------------------------------ */

function isBudgetEffect(e: { target?: string }) {
  return e.target === 'budget';
}
function isPopularityEffect(e: { target?: string }) {
  return e.target === 'popularity';
}
function isStabilityEffect(e: { target?: string }) {
  return e.target === 'stability';
}
function isGroupEffect(e: { target?: string }) {
  return (
    e.target !== undefined &&
    !isBudgetEffect(e) &&
    !isPopularityEffect(e) &&
    !isStabilityEffect(e)
  );
}

/* ------------------------------------------------------------------ */
/*  Badge component (inline for simplicity)                            */
/* ------------------------------------------------------------------ */

function CostBadge({
  label,
  value,
  icon: Icon,
  variant = 'default',
}: {
  label?: string;
  value: number;
  icon?: React.ComponentType<{ className?: string }>;
  variant?: 'default' | 'group';
}) {
  const positive = value >= 0;
  const colorClass = positive ? 'text-emerald-400 border-emerald-400/25 bg-emerald-400/8' : 'text-red-400 border-red-400/25 bg-red-400/8';
  const groupColor = variant === 'group'
    ? 'text-sky-300 border-sky-400/25 bg-sky-400/8'
    : colorClass;

  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md border text-[11px] font-semibold ${variant === 'group' ? groupColor : colorClass}`}
    >
      {Icon && <Icon className="w-3 h-3 flex-shrink-0" />}
      {label && <span className="opacity-90">{label}</span>}
      <span className="font-mono">
        {positive && variant !== 'group' ? '+' : ''}
        {value}
      </span>
    </span>
  );
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function EventModal({ event, onChoice, onClose }: EventModalProps) {
  const SeverityIcon =
    event.severity === 'critical'
      ? AlertTriangle
      : event.severity === 'high'
        ? AlertCircle
        : CheckCircle;

  const CategoryIcon = CATEGORY_ICONS[event.category] || Landmark;
  const categoryLabel = CATEGORY_LABELS[event.category] || event.category;

  const severityClasses: Record<typeof event.severity, string> = {
    critical: 'border-red-400/30 bg-red-400/8 text-red-300',
    high: 'border-amber-400/25 bg-amber-400/8 text-amber-300',
    medium: 'border-sky-400/25 bg-sky-400/8 text-sky-300',
    low: 'border-emerald-400/25 bg-emerald-400/8 text-emerald-300',
  };

  const iconColor: Record<typeof event.severity, string> = {
    critical: 'text-red-400',
    high: 'text-amber-400',
    medium: 'text-sky-400',
    low: 'text-emerald-400',
  };

  const eventImage = getEventImage(event.category, event.severity, event.id);

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="w-full max-w-2xl rounded-xl shadow-2xl bg-card border border-border overflow-hidden">
        {/* ---------- Header image ---------- */}
        <div className="relative h-48 md:h-56">
          <img src={eventImage} alt={event.title} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-card via-card/60 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-4 text-foreground">
            <div className="flex items-start gap-3">
              <SeverityIcon className={`w-7 h-7 flex-shrink-0 mt-1 ${iconColor[event.severity]}`} />
              <div>
                <h3 className="font-display font-bold text-xl uppercase tracking-wide leading-tight">
                  {event.title}
                </h3>
                <p className="text-sm text-foreground/80 mt-1">{event.description}</p>
              </div>
            </div>
          </div>
        </div>

        {/* ---------- Category + severity bar ---------- */}
        <div
          className={`px-4 py-2 border-t border-b text-[11px] font-semibold uppercase tracking-wide flex items-center gap-2 ${severityClasses[event.severity]}`}
        >
          <CategoryIcon className="w-3.5 h-3.5 flex-shrink-0" />
          <span>{categoryLabel}</span>
          <span className="opacity-50">·</span>
          <span>severidad {event.severity}</span>
        </div>

        {/* ---------- Choices ---------- */}
        {event.choices && (
          <div className="p-4 space-y-3">
            {event.choices.map((choice) => {
              const budgetEffect = choice.effects.immediate.find(isBudgetEffect);
              const popularityEffect = choice.effects.immediate.find(isPopularityEffect);
              const stabilityEffect = choice.effects.immediate.find(isStabilityEffect);
              const groupEffects = choice.effects.immediate.filter(isGroupEffect);
              const showProbability =
                choice.probability !== undefined && choice.probability < 1;

              return (
                <button
                  key={choice.id}
                  onClick={() => onChoice(choice.id)}
                  className="w-full p-3 text-left rounded-lg border border-border bg-card hover:border-white/20 hover:bg-white/3 transition-colors"
                >
                  {/* Choice text */}
                  <p className="font-medium text-foreground text-[13px]">{choice.text}</p>

                  {/* Cost preview badges */}
                  {(budgetEffect || popularityEffect || stabilityEffect || groupEffects.length > 0) && (
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {budgetEffect && (
                        <CostBadge
                          label="Presupuesto"
                          value={budgetEffect.value}
                          icon={DollarSign}
                        />
                      )}
                      {popularityEffect && (
                        <CostBadge
                          label="Popularidad"
                          value={popularityEffect.value}
                          icon={Users}
                        />
                      )}
                      {stabilityEffect && (
                        <CostBadge
                          label="Estabilidad"
                          value={stabilityEffect.value}
                        />
                      )}
                      {groupEffects.map((eff) => (
                        <CostBadge
                          key={eff.target}
                          label={eff.target}
                          value={eff.value}
                          variant="group"
                        />
                      ))}
                    </div>
                  )}

                  {/* Probability bar */}
                  {showProbability && (
                    <div className="mt-2">
                      <div className="flex items-center justify-between text-[10px] text-muted-foreground mb-1">
                        <span>Probabilidad de éxito</span>
                        <span className="font-mono">{Math.round(choice.probability! * 100)}%</span>
                      </div>
                      <Progress
                        value={choice.probability! * 100}
                        className="h-1.5"
                        indicatorClassName={
                          (choice.probability! >= 0.7)
                            ? 'bg-emerald-400'
                            : (choice.probability! >= 0.4)
                              ? 'bg-amber-400'
                              : 'bg-red-400'
                        }
                      />
                    </div>
                  )}

                  {/* Existing immediate effects list (detailed view) */}
                  {choice.effects.immediate && choice.effects.immediate.length > 0 && (
                    <div className="mt-2 text-[11px] text-muted-foreground">
                      <p className="font-semibold uppercase tracking-wide text-[10px] mb-1">
                        Efectos inmediatos
                      </p>
                      <ul className="space-y-0.5">
                        {choice.effects.immediate.map((effect, index) => (
                          <li key={index} className="flex items-center gap-1.5">
                            <span className="inline-block w-1 h-1 rounded-full bg-muted-foreground/60" />
                            <span>
                              {effect.target}:{' '}
                              <span
                                className={`font-mono ${effect.value >= 0 ? 'text-emerald-400' : 'text-red-400'}`}
                              >
                                {effect.value > 0 ? '+' : ''}
                                {effect.value}
                              </span>
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        )}

        {/* ---------- No choices fallback ---------- */}
        {!event.choices && (
          <div className="p-4">
            <button
              onClick={onClose}
              className="w-full py-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded font-display font-bold text-sm uppercase tracking-wide transition-colors"
            >
              Entendido
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
