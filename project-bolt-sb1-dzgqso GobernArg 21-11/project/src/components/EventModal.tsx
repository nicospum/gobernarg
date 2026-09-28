import {
  AlertTriangle, AlertCircle, CheckCircle,
  Landmark, DollarSign, Users, Globe, Leaf
} from 'lucide-react';
import { GameEvent } from '../systems/events/types';
import { getEventImage } from '../utils/imageAssets';
import { eventChoiceEffects } from '../engine/eventResolver';
import { effectChip, toneChipClass } from '@/lib/causalText';
import { useDialog } from '@/lib/useDialog';

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
  const dialogRef = useDialog<HTMLDivElement>();
  const SeverityIcon =
    event.severity === 'critical'
      ? AlertTriangle
      : event.severity === 'high'
        ? AlertCircle
        : CheckCircle;

  const CategoryIcon = CATEGORY_ICONS[event.category] || Landmark;
  const categoryLabel = CATEGORY_LABELS[event.category] || event.category;

  const severityClasses: Record<typeof event.severity, string> = {
    critical: 'border-red-500/40 bg-red-500/15 text-red-300',
    high: 'border-amber-500/40 bg-amber-500/15 text-amber-300',
    medium: 'border-blue-500/40 bg-blue-500/15 text-blue-300',
    low: 'border-emerald-500/40 bg-emerald-500/15 text-emerald-300',
  };

  const iconColor: Record<typeof event.severity, string> = {
    critical: 'text-red-400',
    high: 'text-amber-400',
    medium: 'text-blue-400',
    low: 'text-emerald-400',
  };

  const eventImage = getEventImage(event.category, event.severity, event.id);

  return (
    <div ref={dialogRef} className="outline-none fixed inset-0 bg-ink/80 backdrop-blur-md flex items-center justify-center z-50 p-4">
      <div className="w-full max-w-2xl rounded-2xl shadow-2xl bg-surface border border-ink/12 overflow-hidden animate-in fade-in zoom-in-95">
        {/* ---------- Header image ---------- */}
        <div className="relative h-48 md:h-60">
          <img src={eventImage} alt={event.title} loading="lazy" decoding="async" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-surface via-surface/70 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-5 text-ink">
            <div className="flex items-start gap-3">
              <SeverityIcon className={`w-8 h-8 flex-shrink-0 mt-0.5 ${iconColor[event.severity]}`} />
              <div>
                <h3 className="font-display font-semibold text-2xl   leading-tight text-ink">
                  {event.title}
                </h3>
                <p className="text-xs text-ink/80 mt-1 leading-relaxed">{event.description}</p>
              </div>
            </div>
          </div>
        </div>

        {/* ---------- Category + severity bar ---------- */}
        <div
          className={`px-5 py-2 border-t border-b text-[10px] font-bold uppercase tracking-wider flex items-center gap-2 ${severityClasses[event.severity]}`}
        >
          <CategoryIcon className="w-3.5 h-3.5 flex-shrink-0" />
          <span>EVENTO {categoryLabel.toUpperCase()}</span>
          <span className="text-ink/70">·</span>
          <span>SEVERIDAD {(SEVERITY_LABELS[event.severity] ?? event.severity).toUpperCase()}</span>
        </div>

        {/* ---------- Choices ---------- */}
        {event.choices && (
          <div className="p-5 space-y-3">
            {event.choices.map((choice) => {
              const chips = eventChoiceEffects(event, choice.id)
                .filter(e => e.value !== 0)
                .map(e => effectChip(e.target, e.value));
              return (
                <button
                  key={choice.id}
                  onClick={() => onChoice(choice.id)}
                  className="w-full p-4 text-left rounded-lg border border-ink/10 bg-surface hover:border-blue-500/50 hover:bg-sunken transition-all group "
                >
                  <p className="font-bold text-ink text-[13px] group-hover:text-blue-300 transition-colors">{choice.text}</p>
                  {chips.length > 0 ? (
                    <div className="flex flex-wrap gap-1.5 mt-2.5">
                      {chips.map((c, i) => (
                        <span key={i} className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md border text-[11px] font-mono font-bold ${toneChipClass(c.tone)}`}>
                          <span>{c.label}</span>
                          <span>{c.text}</span>
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-[11px] text-ink/70 mt-1.5 font-mono">Sin efectos inmediatos sobre indicadores.</p>
                  )}
                </button>
              );
            })}
          </div>
        )}

        {/* ---------- No choices fallback ---------- */}
        {!event.choices && (
          <div className="p-5">
            <button
              onClick={onClose}
              className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-display font-semibold text-base   transition-colors shadow-lg shadow-blue-600/20"
            >
              Entendido
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
