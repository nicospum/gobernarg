/**
 * Gastón Barenboim, consultor político: textos, honorarios, efectos sobre la
 * intención de voto y helpers de id. Los números viven solo acá y en el motor
 * (engine/consultant.ts): el juego nunca los explica.
 */
import type { ActorId } from './causal';
import type { ConsultantChoice, ConsultantElection, ConsultantTiming } from '../engine/causal/types';
import { fmtBudget } from '../lib/format';

export const CONSULTANT_NAME = 'Gastón Barenboim';
export const CONSULTANT_ROLE = 'Consultor político';
/** Archivo del retrato en src/assets/images/a-lite/personajes/. */
export const CONSULTANT_PORTRAIT = 'gaston-barenboim';

export const CONSULTANT_ELECTIONS: ConsultantElection[] = ['legislativas', 'presidenciales'];
export const CONSULTANT_TIMINGS: ConsultantTiming[] = ['anticipado', 'ultimo_momento'];
/** Orden en pantalla: encuestador, redes, instinto. */
export const CONSULTANT_CHOICE_IDS: ConsultantChoice[] = ['encuestador', 'redes', 'instinto'];

export function isConsultantChoice(x: string): x is ConsultantChoice {
  return (CONSULTANT_CHOICE_IDS as string[]).includes(x);
}

// ─────────────────────────────── Números ───────────────────────────────

/** Honorarios (unidades internas, millones) de "lo que diga el encuestador", legislativas. */
export const CONSULTANT_FEE: Record<ConsultantTiming, number> = { anticipado: 150, ultimo_momento: 350 };

/** Puntos de intención de voto por momento y opción, legislativas. */
export const CONSULTANT_IV_DELTA: Record<ConsultantTiming, Record<ConsultantChoice, number>> = {
  anticipado: { encuestador: 4, redes: -4, instinto: 0 },
  ultimo_momento: { encuestador: 2, redes: -2, instinto: 0 },
};

/** Presidenciales: honorarios y efectos ×1,5. */
export const PRESIDENTIAL_FACTOR = 1.5;

export function electionFactor(election: ConsultantElection): number {
  return election === 'presidenciales' ? PRESIDENTIAL_FACTOR : 1;
}

export function consultantFee(election: ConsultantElection, timing: ConsultantTiming): number {
  return CONSULTANT_FEE[timing] * electionFactor(election);
}

export function consultantIvDelta(election: ConsultantElection, timing: ConsultantTiming, choice: ConsultantChoice): number {
  return CONSULTANT_IV_DELTA[timing][choice] * electionFactor(election);
}

// ─────────────────────────────── Ids de evento ───────────────────────────────

export const CONSULTANT_EVENT_PREFIX = 'consultor_';

export function consultantEventId(election: ConsultantElection, timing: ConsultantTiming): string {
  return `${CONSULTANT_EVENT_PREFIX}${election}_${timing}`;
}

export function parseConsultantEventId(id: string): { election: ConsultantElection; timing: ConsultantTiming } | null {
  if (!id.startsWith(CONSULTANT_EVENT_PREFIX)) return null;
  const rest = id.slice(CONSULTANT_EVENT_PREFIX.length);
  for (const election of CONSULTANT_ELECTIONS) {
    for (const timing of CONSULTANT_TIMINGS) {
      if (rest === `${election}_${timing}`) return { election, timing };
    }
  }
  return null;
}

// ─────────────────────────────── Textos ───────────────────────────────

/** Discurso de cada visita: lejos de la elección y al arrancar el año electoral. */
export const CONSULTANT_SPEECH: Record<ConsultantElection, Record<ConsultantTiming, string>> = {
  legislativas: {
    anticipado:
      'Gastón Barenboim, consultor político, mucho gusto. En la Argentina siempre se vive en elecciones, así que este es el momento de empezar a pensar en las de medio término: se renueva el Congreso y ahí se mide cuánto te quieren. Yo ya tengo números.',
    ultimo_momento:
      'Arrancó el año del Mundial. El Mundial de la política: cada vez falta menos para las de medio término y las encuestas ya empiezan a llegar a mi escritorio. Se renueva el Congreso y todavía estás a tiempo de mover algún resultado.',
  },
  presidenciales: {
    anticipado:
      'Gastón Barenboim otra vez, el de siempre. Ya pasaron las de medio término, pero en la Argentina siempre se vive en elecciones y la que viene es la definitoria: se juega todo. Me adelanté y ya tengo los primeros números.',
    ultimo_momento:
      'Llegó el año del Mundial, el Mundial de la política, y esta vez es la definitoria: se juega todo. Cada vez falta menos y las encuestas ya están entrando. Todavía hay partido, pero se juega ahora.',
  },
};

/** En el segundo mandato ya se conocen: la primera visita no se presenta de nuevo. */
export const CONSULTANT_SPEECH_RETURNING =
  'Gastón Barenboim, el de siempre. Mandato nuevo, reglas viejas: en la Argentina siempre se vive en elecciones y las de medio término ya asoman, con el Congreso otra vez en juego. Yo ya tengo números.';

export function consultantSpeech(election: ConsultantElection, timing: ConsultantTiming, mandateStart = 1): string {
  if (election === 'legislativas' && timing === 'anticipado' && mandateStart > 1) return CONSULTANT_SPEECH_RETURNING;
  return CONSULTANT_SPEECH[election][timing];
}

/** Qué elección viene, para el subtítulo de la visita. */
export const CONSULTANT_ELECTION_LABEL: Record<ConsultantElection, string> = {
  legislativas: 'Elecciones de medio término',
  presidenciales: 'Elección presidencial',
};

/** Aviso en el centro de notificaciones cuando aparece. */
export const CONSULTANT_NOTICE = 'Trae el dato de las encuestas y tres maneras de tomarlo. Hay que responderle antes de seguir.';

/** Cómo nombrar a cada sector en una frase ("los sindicatos te están soltando la mano"). */
export const SECTOR_PHRASE: Record<ActorId, { phrase: string; plural: boolean }> = {
  industria: { phrase: 'la industria', plural: false },
  agro: { phrase: 'el agro', plural: false },
  financiero: { phrase: 'el sector financiero', plural: false },
  sindicatos: { phrase: 'los sindicatos', plural: true },
  pymes: { phrase: 'las PyMEs', plural: true },
  clase_media: { phrase: 'la clase media', plural: false },
  sectores_populares: { phrase: 'los sectores populares', plural: true },
  estudiantes: { phrase: 'los estudiantes', plural: true },
  docentes: { phrase: 'los docentes', plural: true },
  cientificos: { phrase: 'los científicos', plural: true },
  org_sociales: { phrase: 'las organizaciones sociales', plural: true },
  derechos_cultura: { phrase: 'los colectivos de derechos y cultura', plural: true },
  ambiente: { phrase: 'los ambientalistas', plural: true },
  oficialismo: { phrase: 'el oficialismo', plural: false },
  aliados: { phrase: 'los aliados', plural: true },
  oposicion: { phrase: 'la oposición', plural: false },
  gobernadores: { phrase: 'los gobernadores', plural: true },
};

export interface PollSentence {
  /** "Las encuestas dicen que los sindicatos te están soltando la mano, y pesan en la urna." */
  verdict: string;
  /** "Lo que mueve a ese sector: Aumento salarial." (null si no hay medida). */
  lever: string | null;
}

/** El dato de las encuestas con el sector y, si la hay, la medida que lo mueve. */
export function pollSentence(actor: ActorId | null, policyName: string | null): PollSentence {
  if (!actor) {
    return { verdict: 'Las encuestas todavía no marcan a nadie soltándote la mano. Disfrutalo: no dura.', lever: null };
  }
  const { phrase, plural } = SECTOR_PHRASE[actor];
  const verdict = `Las encuestas dicen que ${phrase} te ${plural ? 'están' : 'está'} soltando la mano, y ${plural ? 'pesan' : 'pesa'} en la urna.`;
  return { verdict, lever: policyName ? `Lo que mueve a ese sector: ${policyName}.` : null };
}

/** Las tres respuestas, en el orden en que se muestran. */
export const CONSULTANT_OPTION_LABEL: Record<ConsultantChoice, string> = {
  encuestador: 'Lo que diga el encuestador, se hace',
  redes: 'No le doy vuelo. Me fijo qué dicen en las redes',
  instinto: 'Gracias, Gastón. Sigo mi instinto',
};

/** Subtítulo de cada opción: solo el honorario y qué pasa con la agenda, nunca el efecto en votos. */
export function consultantOptionSubtitle(choice: ConsultantChoice, fee: number, policyName: string | null): string {
  switch (choice) {
    case 'encuestador':
      return policyName ? `Honorarios: ${fmtBudget(fee)} · ${policyName} queda en la agenda de este turno` : `Honorarios: ${fmtBudget(fee)}`;
    case 'redes':
      return 'Sin costo';
    case 'instinto':
      return 'Nada cambia';
  }
}

/** Lo que contesta Gastón al elegir. */
export const CONSULTANT_REPLY: Record<ConsultantChoice, string> = {
  encuestador: 'Buena decisión. Vos gobernás, que de los números me encargo yo.',
  redes: 'Vos sabrás. Las redes hacen mucho ruido, pero no votan. Igual, vos sabrás.',
  instinto: 'Instinto tenés, no lo discuto. Veremos si alcanza.',
};

export function consultantReply(choice: ConsultantChoice): string {
  return CONSULTANT_REPLY[choice];
}
