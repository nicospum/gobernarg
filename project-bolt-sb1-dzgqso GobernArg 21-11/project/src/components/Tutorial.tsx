import { BookOpen, X } from 'lucide-react';
import { markTutorialSeen, useTutorialSteps } from '@/lib/tutorial';

/** Tarjeta breve del primer turno. Se cierra una vez y no vuelve a aparecer. */
export function TutorialCard({ actions, onDismiss, onOpenGuide }: {
  actions: number;
  onDismiss: () => void;
  onOpenGuide: () => void;
}) {
  const steps = useTutorialSteps(actions);
  const dismiss = () => {
    markTutorialSeen();
    onDismiss();
  };
  return (
    <section aria-label="Cómo se juega" className="sr-panel relative px-4 py-4 md:px-5 border-l-4 !border-l-sala-cyan">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div>
          <span className="sr-label inline-flex items-center gap-1.5"><BookOpen size={13} /> Briefing inicial</span>
          <h2 className="mt-1 text-[18px] font-bold tracking-tight text-ink">Tu primer turno</h2>
        </div>
        <button onClick={dismiss} aria-label="Cerrar la ayuda" className="w-11 h-11 -mt-2 -mr-2 flex items-center justify-center rounded-md text-ink/70 hover:text-ink hover:bg-ink/5">
          <X size={18} />
        </button>
      </div>
      <ol className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
        {steps.map((s, i) => (
          <li key={s.title} className="flex gap-2.5">
            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-sala-blue text-white text-xs font-bold flex items-center justify-center">{i + 1}</span>
            <div>
              <div className="text-[14px] font-semibold text-ink">{s.title}</div>
              <p className="text-[13px] text-sala-muted leading-snug mt-0.5">{s.text}</p>
            </div>
          </li>
        ))}
      </ol>
      <div className="flex flex-wrap items-center gap-2 mt-4">
        <button onClick={dismiss} className="sr-btn-navy h-11 px-4 text-sm">
          Entendido
        </button>
        <button onClick={onOpenGuide} className="h-11 px-3 rounded-md text-sm font-semibold text-sala-blue hover:bg-sunken">
          Ver la guía completa
        </button>
      </div>
    </section>
  );
}
