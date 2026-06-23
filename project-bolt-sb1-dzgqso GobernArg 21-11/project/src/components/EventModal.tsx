import { AlertTriangle, AlertCircle, CheckCircle } from 'lucide-react';
import { GameEvent } from '../systems/events/types';
import { getEventImage } from '../utils/imageAssets';

interface EventModalProps {
  event: GameEvent;
  onChoice: (choiceId: string) => void;
  onClose: () => void;
}

export function EventModal({ event, onChoice, onClose }: EventModalProps) {
  const Icon = event.severity === 'critical' ? AlertTriangle :
              event.severity === 'high' ? AlertCircle :
              CheckCircle;

  const severityColors = {
    critical: 'bg-red-100 text-red-800 border-red-200',
    high: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    medium: 'bg-blue-100 text-blue-800 border-blue-200',
    low: 'bg-green-100 text-green-800 border-green-200'
  };

  const eventImage = getEventImage(event.category, event.severity);

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className={`w-full max-w-2xl rounded-xl shadow-2xl bg-white overflow-hidden`}>
        <div className="relative h-48 md:h-56">
          <img
            src={eventImage}
            alt={event.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
            <div className="flex items-start gap-3">
              <Icon className="w-7 h-7 flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-bold text-xl">{event.title}</h3>
                <p className="text-sm text-white/90">{event.description}</p>
              </div>
            </div>
          </div>
        </div>
        <div className={`p-3 ${severityColors[event.severity]} text-sm`}>
          <span className="font-semibold uppercase tracking-wide">
            Evento {event.category} — severidad {event.severity}
          </span>
        </div>

        {event.choices && (
          <div className="p-4 space-y-3">
            {event.choices.map(choice => (
              <button
                key={choice.id}
                onClick={() => onChoice(choice.id)}
                className="w-full p-3 text-left rounded-lg border hover:bg-gray-50 transition-colors"
              >
                <p className="font-medium">{choice.text}</p>
                {choice.effects.immediate && (
                  <div className="mt-2 text-sm text-gray-600">
                    <p>Efectos inmediatos:</p>
                    <ul className="list-disc pl-5">
                      {choice.effects.immediate.map((effect, index) => (
                        <li key={index}>
                          {effect.target}: {effect.value > 0 ? '+' : ''}{effect.value}
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
              className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Entendido
            </button>
          </div>
        )}
      </div>
    </div>
  );
}