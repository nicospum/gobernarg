import { useState } from 'react';
import { BookOpen, X } from 'lucide-react';
import { PARAMS } from '@/data/causal';
import { useDialog } from '@/lib/useDialog';
import { useIsTouch } from '@/lib/useMediaQuery';

const SEEN_KEY = 'gobernarg.tutorial.v1';

export function tutorialSeen(): boolean {
  try {
    return localStorage.getItem(SEEN_KEY) === '1';
  } catch {
    return false;
  }
}

function markSeen() {
  try {
    localStorage.setItem(SEEN_KEY, '1');
  } catch {
    // Sin almacenamiento, el tutorial vuelve a aparecer en la próxima partida.
  }
}

/** Los cuatro pasos del primer turno (los usan la tarjeta y la guía). */
function useSteps(actions: number) {
  const touch = useIsTouch();
  return [
    {
      title: 'Elegí qué hacer',
      text: `Tenés ${actions} acciones por turno. Cada política cuesta acciones y plata de la caja: sumalas a tu agenda desde Acciones políticas.`,
    },
    {
      title: 'Mirá antes de decidir',
      text: touch
        ? 'Tocá "Ver detalle" en cada acción, o tocá un indicador, para ver qué produce, cuándo llega el efecto y a quién favorece o perjudica.'
        : 'Pasá el mouse por cada acción o indicador para ver qué produce, cuándo llega el efecto y a quién favorece o perjudica.',
    },
    {
      title: 'Cuidá a los actores',
      text: 'Empresas, sindicatos, gobernadores y el resto reaccionan según cómo les va. Reunite con ellos para saber qué les preocupa.',
    },
    {
      title: 'Cerrá el turno',
      text: `"Finalizar turno" hace pasar un trimestre y muchos efectos tardan en llegar. En el turno 8 hay legislativas y en el 16 elecciones: para ganar necesitás ${PARAMS.VOTOS_PARA_GANAR}% de intención de voto.`,
    },
  ];
}

/** Tarjeta breve del primer turno. Se cierra una vez y no vuelve a aparecer. */
export function TutorialCard({ actions, onDismiss, onOpenGuide }: {
  actions: number;
  onDismiss: () => void;
  onOpenGuide: () => void;
}) {
  const steps = useSteps(actions);
  const dismiss = () => {
    markSeen();
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

/** Guía "Cómo se juega", disponible siempre desde el menú. */
export function HowToPlayModal({ actions, onClose }: { actions: number; onClose: () => void }) {
  const dialogRef = useDialog<HTMLDivElement>(onClose);
  const steps = useSteps(actions);
  const more = [
    {
      title: 'Los indicadores',
      text: 'Aprobación es cuán conforme está la gente; Gobernabilidad, tu capacidad de gobernar (si queda debajo del umbral de crisis dos trimestres, hay juicio político); Conflictividad, la calle; Intención de voto, lo que decide las elecciones.',
    },
    {
      title: 'La caja',
      text: 'Cada turno entra la recaudación y salen el gasto fijo, los intereses de la deuda y tus políticas. Si la caja queda en rojo hay que financiarse, y eso cuesta.',
    },
    {
      title: 'Los eventos',
      text: 'Cada tanto pasa algo que no elegiste: una inundación, un paro, una ruptura en el Congreso. Casi siempre hay más de una forma de responder.',
    },
    {
      title: 'Guardado',
      text: 'La partida se guarda sola en este navegador. Si cerrás la pestaña, en la portada aparece "Continuar partida".',
    },
  ];
  return (
    <div ref={dialogRef} aria-labelledby="howto-title" className="outline-none fixed inset-0 z-50 flex items-center justify-center bg-ink/70 p-4">
      <div className="w-full max-w-2xl max-h-[88vh] overflow-y-auto rounded-xl border border-rule bg-surface shadow-2xl">
        <div className="sticky top-0 bg-surface border-b border-rule px-5 py-4 flex items-center justify-between">
          <h2 id="howto-title" className="font-display text-2xl font-semibold text-ink">Cómo se juega</h2>
          <button onClick={onClose} aria-label="Cerrar" className="w-10 h-10 flex items-center justify-center rounded-md text-ink hover:bg-sunken">
            <X size={20} />
          </button>
        </div>
        <div className="px-5 py-5 space-y-5">
          <ol className="space-y-3">
            {steps.map((s, i) => (
              <li key={s.title} className="flex gap-3">
                <span className="flex-shrink-0 w-7 h-7 rounded-full bg-ink text-paper text-sm font-bold flex items-center justify-center">{i + 1}</span>
                <div>
                  <div className="text-[15px] font-semibold text-ink">{s.title}</div>
                  <p className="text-[14px] text-ink/80 leading-relaxed mt-0.5">{s.text}</p>
                </div>
              </li>
            ))}
          </ol>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {more.map(m => (
              <div key={m.title} className="rounded-lg bg-sunken/60 p-3.5">
                <div className="text-[14px] font-semibold text-ink">{m.title}</div>
                <p className="text-[13px] text-ink/80 leading-relaxed mt-1">{m.text}</p>
              </div>
            ))}
          </div>
          <button onClick={onClose} className="w-full h-11 rounded-md bg-ink text-paper font-semibold hover:bg-ink/90">
            Volver al juego
          </button>
        </div>
      </div>
    </div>
  );
}

/** Estado de la tarjeta del primer turno. */
export function useTutorial() {
  const [dismissed, setDismissed] = useState(() => tutorialSeen());
  return { dismissed, dismiss: () => setDismissed(true) };
}
