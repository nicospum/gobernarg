import { useState } from 'react';
import { BookOpen, X } from 'lucide-react';
import { ACTIONS_PER_TURN } from '../../causal/catalog';
import { Dialog } from './Dialog';
import { LITE_FEATURES } from '../../lite/config';

const SEEN_KEY = 'gobernarg.lite.tutorial.v1';

function seen(): boolean {
  try { return localStorage.getItem(SEEN_KEY) === '1'; } catch { return false; }
}
function markSeen() {
  try { localStorage.setItem(SEEN_KEY, '1'); } catch { /* Sin almacenamiento vuelve a aparecer. */ }
}

/** Los pasos del primer turno (traídos de la versión A, adaptados a esta versión). */
const STEPS = [
  { title: 'Elegí qué hacer', text: `Cada turno tenés ${ACTIONS_PER_TURN} acciones de agenda. Las políticas públicas cuestan acciones y plata de la caja (en millones de pesos): tocá una para ver qué produce y ejecutarla.` },
  { title: 'Mirá el país', text: LITE_FEATURES.modoDetallado ? 'Los indicadores cambian recién al cerrar el trimestre. Tocá cualquiera para ver sus causas.' : 'El país cambia recién al cerrar el trimestre: la palabra dice cómo está y la flecha, hacia dónde va.' },
  { title: 'Cuidá a los actores', text: 'Cada sector reacciona según cómo le va. Reunite, negociá y firmá compromisos: si los cumplís, ganás legitimidad.' },
  { title: 'Cerrá el turno', text: '"Cerrar turno" hace pasar un trimestre. En el turno 8 hay legislativas y en el 16 elecciones: para ganar necesitás 45 % de proyección de voto.' },
];

const MORE = [
  { title: 'Aprobación, estabilidad y legitimidad', text: 'La aprobación mide cómo le va a la gente; la estabilidad, los conflictos y los atrasos fiscales; la legitimidad, las garantías y los compromisos cumplidos.' },
  { title: 'La caja', text: 'Entra la recaudación y salen el gasto recurrente, los intereses y tus políticas. Si falta plata podés financiarte, pero la deuda vence.' },
  { title: 'Eventos', text: 'Cada tanto pasa algo que no elegiste. Siempre hay más de una forma de responder, y al menos una no cuesta caja.' },
  { title: 'Guardado', text: 'La partida se guarda sola en este navegador. Si cerrás la pestaña, en la portada aparece "Continuar partida".' },
];

export function useTutorial() {
  const [dismissed, setDismissed] = useState(seen);
  return { dismissed, dismiss: () => { markSeen(); setDismissed(true); } };
}

/** Tarjeta del primer turno. */
export function TutorialCard({ onDismiss, onOpenGuide }: { onDismiss: () => void; onOpenGuide: () => void }) {
  return <section aria-label="Cómo se juega" className="rounded-xl border border-sky-300/40 bg-sky-400/10 p-4">
    <div className="flex items-start justify-between gap-3 mb-3">
      <h2 className="font-display text-lg font-bold flex items-center gap-2"><BookOpen size={17} className="text-sky-200" /> Tu primer turno</h2>
      <button type="button" onClick={onDismiss} aria-label="Cerrar la ayuda" className="-m-1 p-2 rounded text-muted-foreground hover:text-white hover:bg-white/10"><X size={18} /></button>
    </div>
    <ol className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
      {STEPS.map((s, i) => <li key={s.title} className="flex gap-2.5"><span className="shrink-0 w-6 h-6 rounded-full bg-sky-300 text-[#0a2340] text-xs font-bold flex items-center justify-center">{i + 1}</span><div><p className="text-sm font-semibold">{s.title}</p><p className="text-xs text-blue-100/90 leading-5 mt-0.5">{s.text}</p></div></li>)}
    </ol>
    <div className="flex flex-wrap gap-2 mt-4"><button type="button" className="causal-primary" onClick={onDismiss}>Entendido</button><button type="button" className="causal-secondary" onClick={onOpenGuide}>Ver la guía completa</button></div>
  </section>;
}

/** Guía "Cómo se juega", siempre disponible desde el menú. */
export function HowToPlay({ onClose }: { onClose: () => void }) {
  return <Dialog title="Cómo se juega" onClose={onClose}>
    <ol className="space-y-3">{STEPS.map((s, i) => <li key={s.title} className="flex gap-3"><span className="shrink-0 w-7 h-7 rounded-full bg-sky-300 text-[#0a2340] text-sm font-bold flex items-center justify-center">{i + 1}</span><div><p className="font-semibold">{s.title}</p><p className="text-sm text-muted-foreground leading-6">{s.text}</p></div></li>)}</ol>
    <div className="grid sm:grid-cols-2 gap-3">{MORE.map(m => <div key={m.title} className="rounded-lg bg-background/50 border border-border p-3"><p className="text-sm font-semibold">{m.title}</p><p className="text-xs text-muted-foreground leading-5 mt-1">{m.text}</p></div>)}</div>
    <button type="button" className="causal-primary w-full" onClick={onClose}>Volver al juego</button>
  </Dialog>;
}
