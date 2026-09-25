const STEPS = ['Tu gobernante', 'Dificultad y partido'];

/** Indicador del inicio de partida: 1 = personaje, 2 = dificultad y plataforma. */
export function SetupSteps({ current }: { current: 1 | 2 }) {
  return (
    <ol className="flex items-center gap-2 text-xs md:text-sm" aria-label="Pasos para empezar">
      {STEPS.map((label, i) => {
        const n = i + 1;
        const state = n === current ? 'current' : n < current ? 'done' : 'todo';
        return (
          <li key={label} className="flex items-center gap-2" aria-current={state === 'current' ? 'step' : undefined}>
            {i > 0 && <span className="w-6 h-px bg-ink/30" aria-hidden="true" />}
            <span
              className={`inline-flex w-6 h-6 items-center justify-center rounded-full text-xs font-bold ${
                state === 'current' ? 'bg-accent text-accent-foreground' : state === 'done' ? 'bg-ink/80 text-slate-900' : 'bg-ink/15 text-ink/60'
              }`}
            >
              {n}
            </span>
            <span className={state === 'todo' ? 'text-ink/60' : 'text-ink font-semibold'}>{label}</span>
          </li>
        );
      })}
    </ol>
  );
}
