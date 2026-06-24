import { AlertTriangle, AlertCircle, CheckCircle } from 'lucide-react';
import { GameEvent } from '../systems/events/types';
import { getEventImage } from '../utils/imageAssets';

interface EventModalProps {
  event: GameEvent;
  onChoice: (choiceId: string) => void;
  onClose: () => void;
}

export function EventModal({ event, onChoice, onClose }: EventModalProps) {
  const Icon =
    event.severity === 'critical'
      ? AlertTriangle
      : event.severity === 'high'
        ? AlertCircle
        : CheckCircle;

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

  const eventImage = getEventImage(event.category, event.severity);

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="w-full max-w-2xl rounded-xl shadow-2xl bg-card border border-border overflow-hidden">
        <div className="relative h-48 md:h-56">
          <img src={eventImage} alt={event.title} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-card via-card/60 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-4 text-foreground">
            <div className="flex items-start gap-3">
              <Icon className={`w-7 h-7 flex-shrink-0 mt-1 ${iconColor[event.severity]}`} />
              <div>
                <h3 className="font-display font-bold text-xl uppercase tracking-wide leading-tight">
                  {event.title}
                </h3>
                <p className="text-sm text-foreground/80 mt-1">{event.description}</p>
              </div>
            </div>
          </div>
        </div>

        <div
          className={`px-4 py-2 border-t border-b text-[11px] font-semibold uppercase tracking-wide ${severityClasses[event.severity]}`}
        >
          Evento {event.category} · severidad {event.severity}
        </div>

        {event.choices && (
          <div className="p-4 space-y-2.5">
            {event.choices.map((choice) => (
              <button
                key={choice.id}
                onClick={() => onChoice(choice.id)}
                className="w-full p-3 text-left rounded-lg border border-border bg-card hover:border-white/20 hover:bg-white/3 transition-colors"
              >
                <p className="font-medium text-foreground text-[13px]">{choice.text}</p>
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
            ))}
          </div>
        )}

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
