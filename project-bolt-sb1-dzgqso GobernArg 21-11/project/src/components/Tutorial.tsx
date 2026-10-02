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
    <section aria-label="Cómo se juega" className="rounded-lg border border-celeste/40 bg-celeste/10 px-4 py-4 md:px-5">
      <div className="flex items-start justify-between gap-3 mb-3">
        <h2 className="font-display text-[18px] font-semibold text-ink flex items-center gap-2">
          <BookOpen size={17} className="text-celeste-ink" />
          Tu primer turno
        </h2>
        <button onClick={dismiss} aria-label="Cerrar la ayuda" className="w-9 h-9 -mt-1 -mr-1 flex items-center justify-center rounded-md text-ink/70 hover:text-ink hover:bg-ink/5">
          <X size={18} />
        </button>
      </div>
      <ol className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
        {steps.map((s, i) => (
          <li key={s.title} className="flex gap-2.5">
            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-ink text-paper text-xs font-bold flex items-center justify-center">{i + 1}</span>
            <div>
              <div className="text-[14px] font-semibold text-ink">{s.title}</div>
              <p className="text-[13px] text-ink/80 leading-snug mt-0.5">{s.text}</p>
            </div>
          </li>
        ))}
      </ol>
      <div className="flex flex-wrap items-center gap-2 mt-4">
        <button onClick={dismiss} className="h-10 px-4 rounded-md bg-ink text-paper text-sm font-semibold hover:bg-ink/90">
          Entendido
        </button>
        <button onClick={onOpenGuide} className="h-10 px-3 rounded-md text-sm font-medium text-celeste-ink hover:bg-celeste/10">
          Ver la guía completa
        </button>
      </div>
    </section>
  );
}
