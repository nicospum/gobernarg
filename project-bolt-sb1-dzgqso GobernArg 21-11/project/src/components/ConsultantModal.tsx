import type { GameEvent } from '../systems/events/types';
import type { GameState } from '../types/game';
import type { ConsultantChoice } from '../engine/causal/types';
import { ModalHeader } from './ModalHeader';
import { CAUSAL_ACTIONS_BY_ID } from '@/data/causal';
import {
  CONSULTANT_CHOICE_IDS,
  CONSULTANT_ELECTION_LABEL,
  CONSULTANT_NAME,
  CONSULTANT_OPTION_LABEL,
  CONSULTANT_PORTRAIT,
  CONSULTANT_ROLE,
  consultantOptionSubtitle,
  parseConsultantEventId,
  pollSentence,
} from '@/data/consultor';
import { activeConsultantVisit } from '@/engine/consultant';
import { personImage } from '@/lib/liteImages';
import { useDialog } from '@/lib/useDialog';

interface ConsultantModalProps {
  /** Evento del consultor (id `consultor_<elección>_<momento>`). */
  event: GameEvent;
  gameState: GameState;
  onChoice: (choiceId: ConsultantChoice) => void;
}

/**
 * Visita de Gastón Barenboim: retrato de cuerpo entero, discurso, el dato de
 * las encuestas (recalculado desde la visita pendiente en causal.consultant,
 * no desde el evento guardado) y las tres respuestas. No se puede cerrar sin
 * responder: es una decisión obligatoria.
 */
export function ConsultantModal({ event, gameState, onChoice }: ConsultantModalProps) {
  const dialogRef = useDialog<HTMLDivElement>();
  const visit = activeConsultantVisit(gameState.causal, event);
  const election = visit?.election ?? parseConsultantEventId(event.id)?.election ?? 'legislativas';
  const policyName = visit?.policy ? CAUSAL_ACTIONS_BY_ID[visit.policy]?.name ?? visit.policy : null;
  const poll = pollSentence(visit?.actor ?? null, policyName);
  const fee = visit?.fee ?? 0;
  const portrait = personImage(CONSULTANT_PORTRAIT);

  return (
    <div
      ref={dialogRef}
      aria-labelledby="consultor-titulo"
      className="outline-none fixed inset-0 bg-sala-navy/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
    >
      <div className="w-full max-w-3xl sr-modal overflow-hidden max-h-[92vh] overflow-y-auto animate-in fade-in zoom-in-95">
        <ModalHeader id="consultor-titulo" label={CONSULTANT_ROLE} title={CONSULTANT_NAME} subtitle={CONSULTANT_ELECTION_LABEL[election]} />
        <div className="grid grid-cols-1 md:grid-cols-[160px_minmax(0,1fr)]">
          {/* Retrato entero: columna propia en escritorio, arriba y más chico en celular. Nunca de fondo recortado. */}
          <div className="bg-sunken border-b md:border-b-0 md:border-r border-rule flex items-end justify-center px-3 pt-3 md:pt-5">
            {portrait && (
              <img
                src={portrait}
                alt={CONSULTANT_NAME}
                decoding="async"
                className="h-40 w-auto md:h-auto md:w-full md:max-h-[480px] object-contain object-bottom"
              />
            )}
          </div>

          <div className="p-5 md:p-6 flex flex-col gap-4 min-w-0">
            <p className="text-[14px] md:text-[15px] text-ink leading-relaxed">{event.description}</p>

            <div className="rounded-lg border border-rule border-l-4 border-l-sala-blue bg-sunken px-4 py-3">
              <span className="sr-eyebrow block mb-1.5">Dato de las encuestas</span>
              <p className="text-[13px] md:text-[14px] text-ink font-semibold leading-snug">{poll.verdict}</p>
              {poll.lever && <p className="text-[13px] md:text-[14px] text-ink leading-snug mt-1">{poll.lever}</p>}
            </div>

            <div className="flex flex-col gap-2" role="group" aria-label="Qué le respondés">
              {CONSULTANT_CHOICE_IDS.map(id => (
                <button
                  key={id}
                  type="button"
                  onClick={() => onChoice(id)}
                  className="w-full min-h-[44px] text-left rounded-lg border border-rule bg-surface px-4 py-3 hover:border-sala-blue/50 hover:bg-sunken transition-colors"
                >
                  <span className="block text-[14px] font-bold text-ink leading-snug">{CONSULTANT_OPTION_LABEL[id]}</span>
                  <span className="block text-[12px] text-sala-muted mt-0.5 leading-snug">{consultantOptionSubtitle(id, fee, policyName)}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
