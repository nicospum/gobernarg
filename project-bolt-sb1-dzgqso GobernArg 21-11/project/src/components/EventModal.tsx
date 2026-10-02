import { AlertTriangle, AlertCircle, CheckCircle } from 'lucide-react';
import { GameEvent } from '../systems/events/types';
import { ModalHeader } from './ModalHeader';
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

  const categoryLabel = CATEGORY_LABELS[event.category] || event.category;

  const iconColor: Record<typeof event.severity, string> = {
    critical: 'text-[#ff8a6e]',
    high: 'text-sala-sun',
    medium: 'text-sala-sky',
    low: 'text-sala-lime',
  };

  const severityBar: Record<typeof event.severity, string> = {
    critical: 'bg-sala-bad',
    high: 'bg-sala-sun',
    medium: 'bg-sala-blue',
    low: 'bg-sala-good',
  };

  const eventImage = getEventImage(event.category, event.severity, event.id);

  return (
    <div ref={dialogRef} className="outline-none fixed inset-0 bg-sala-navy/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="w-full max-w-2xl sr-modal overflow-hidden max-h-[92vh] overflow-y-auto animate-in fade-in zoom-in-95">
        <ModalHeader
          label={`Evento ${categoryLabel.toLowerCase()} · severidad ${(SEVERITY_LABELS[event.severity] ?? event.severity).toLowerCase()}`}
          title={event.title}
          subtitle={event.description}
          image={eventImage}
          imageAlt={event.title}
          icon={<SeverityIcon className={`w-7 h-7 ${iconColor[event.severity]}`} />}
        />
        <div className={`h-1 ${severityBar[event.severity]}`} aria-hidden="true" />

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
