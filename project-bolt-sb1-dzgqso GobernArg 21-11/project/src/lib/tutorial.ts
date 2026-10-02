import { useState } from 'react';
import { PARAMS } from '@/data/causal';
import { useIsTouch } from '@/lib/useMediaQuery';

const SEEN_KEY = 'gobernarg.lite.tutorial.v1';

function tutorialSeen(): boolean {
  try {
    return localStorage.getItem(SEEN_KEY) === '1';
  } catch {
    return false;
  }
}

export function markTutorialSeen() {
  try {
    localStorage.setItem(SEEN_KEY, '1');
  } catch {
    // Sin almacenamiento, el tutorial vuelve a aparecer en la próxima partida.
  }
}

/** Los cuatro pasos del primer turno (los usan la tarjeta y la guía). */
export function useTutorialSteps(actions: number) {
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

/** Estado de la tarjeta del primer turno. */
export function useTutorial() {
  const [dismissed, setDismissed] = useState(() => tutorialSeen());
  return { dismissed, dismiss: () => setDismissed(true) };
}
