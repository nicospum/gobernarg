import {
  AlertTriangle, AlertCircle, CheckCircle,
  Landmark, DollarSign, Users, Globe, Leaf
} from 'lucide-react';
import { GameEvent } from '../systems/events/types';
import { getEventImage } from '../utils/imageAssets';
import { eventChoiceEffects } from '../engine/eventResolver';
import { effectChip, toneChipClass } from '@/lib/causalText';

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
/*  Component                                                          */
/* ------------------------------------------------------------------ */

const SEVERITY_LABELS: Record<GameEvent['severity'], string> = {
  low: 'baja', medium: 'media', high: 'alta', critical: 'crítica',
};

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
          <img src={eventImage} alt={event.title} loading="lazy" decoding="async" className="w-full h-full object-cover" />
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
          <span>severidad {SEVERITY_LABELS[event.severity]}</span>
        </div>

        {/* ---------- Choices ---------- */}
        {event.choices && (
          <div className="p-4 space-y-3">
            {event.choices.map((choice) => {
              const chips = eventChoiceEffects(event, choice.id)
                .filter(e => e.value !== 0)
                .map(e => effectChip(e.target, e.value));
              return (
                <button
                  key={choice.id}
                  onClick={() => onChoice(choice.id)}
                  className="w-full p-3 text-left rounded-lg border border-border bg-card hover:border-white/20 hover:bg-white/3 transition-colors"
                >
                  <p className="font-medium text-foreground text-[13px]">{choice.text}</p>
                  {chips.length > 0 ? (
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {chips.map((c, i) => (
                        <span key={i} className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md border text-[11px] font-semibold ${toneChipClass(c.tone)}`}>
                          <span className="opacity-90">{c.label}</span>
                          <span className="font-mono">{c.text}</span>
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-[11px] text-muted-foreground mt-1.5">Sin consecuencias inmediatas.</p>
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
