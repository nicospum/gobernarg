import { ModalHeader } from './ModalHeader';
import { useDialog } from '@/lib/useDialog';
import { useTutorialSteps } from '@/lib/tutorial';

/** Guía "Cómo se juega", disponible siempre desde el menú. */
export function HowToPlayModal({ actions, onClose }: { actions: number; onClose: () => void }) {
  const dialogRef = useDialog<HTMLDivElement>(onClose);
  const steps = useTutorialSteps(actions);
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
    <div ref={dialogRef} aria-labelledby="howto-title" className="outline-none fixed inset-0 z-50 flex items-center justify-center bg-sala-navy/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-2xl max-h-[88vh] overflow-y-auto sr-modal">
        <div className="sticky top-0 z-10">
          <ModalHeader id="howto-title" label="Guía rápida" title="Cómo se juega" onClose={onClose} />
        </div>
        <div className="px-5 py-5 space-y-5">
          <ol className="space-y-3">
            {steps.map((s, i) => (
              <li key={s.title} className="flex gap-3">
                <span className="flex-shrink-0 w-7 h-7 rounded-full bg-sala-blue text-white text-sm font-bold flex items-center justify-center">{i + 1}</span>
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
          <button onClick={onClose} className="sr-btn-navy w-full h-11">
            Volver al juego
          </button>
        </div>
      </div>
    </div>
  );
}
