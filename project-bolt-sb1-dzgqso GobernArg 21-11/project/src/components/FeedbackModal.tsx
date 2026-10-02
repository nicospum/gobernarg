import { useState, type ReactNode } from 'react';
import { Check, Copy, MessageSquareHeart } from 'lucide-react';
import type { GameState } from '../types/game';
import { ModalHeader } from './ModalHeader';
import { useDialog } from '@/lib/useDialog';
import { useIsMobile } from '@/lib/useMediaQuery';
import { gameSummary, sendPlaytest } from '@/lib/playtest';

/** Opciones de una pregunta de elección única, como botones grandes (sirven con el dedo). */
function Choice({ name, value, options, onChange }: {
  name: string;
  value: string;
  options: [string, string][];
  onChange: (v: string) => void;
}) {
  return (
    <div role="radiogroup" aria-label={name} className="flex flex-wrap gap-2">
      {options.map(([v, label]) => (
        <button
          key={v}
          type="button"
          role="radio"
          aria-checked={value === v}
          onClick={() => onChange(value === v ? '' : v)}
          className={`min-h-10 px-3 rounded-md border text-sm ${
            value === v ? 'bg-sala-blue text-white border-sala-blue' : 'bg-surface text-ink border-rule hover:bg-sunken'
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  );
}

function Question({ label, children, hint }: { label: string; children: ReactNode; hint?: string }) {
  return (
    <div className="space-y-2">
      <div>
        <p className="text-[15px] font-semibold text-ink">{label}</p>
        {hint && <p className="text-[13px] text-ink/70">{hint}</p>}
      </div>
      {children}
    </div>
  );
}

const SCALE: [string, string][] = [['1', '1'], ['2', '2'], ['3', '3'], ['4', '4'], ['5', '5']];

/**
 * "Contanos cómo te fue": preguntas del playtest (Fase 3) más un resumen
 * automático de la partida. Se envía a Netlify Forms; si no se puede (por
 * ejemplo, jugando en local), ofrece copiar las respuestas para mandarlas.
 */
export function FeedbackModal({ gameState, onClose }: { gameState: GameState; onClose: () => void }) {
  const dialogRef = useDialog<HTMLDivElement>(onClose);
  const isMobile = useIsMobile();
  const [f, setF] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'failed'>('idle');
  const [copied, setCopied] = useState(false);
  const set = (k: string) => (v: string) => setF(prev => ({ ...prev, [k]: v }));
  const summary = gameSummary(gameState, isMobile);
  const fields = () => ({ ...f, resumen: summary, version: 'A' });

  const submit = async () => {
    setStatus('sending');
    setStatus((await sendPlaytest(fields())) ? 'sent' : 'failed');
  };
  const asText = () =>
    Object.entries(fields())
      .filter(([, v]) => v)
      .map(([k, v]) => `${k}: ${v}`)
      .join('\n');
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(asText());
      setCopied(true);
    } catch {
      setCopied(false);
    }
  };

  const input = 'w-full rounded-md border border-rule bg-surface px-3 py-2.5 text-[15px] text-ink placeholder:text-ink/50 focus:outline-none focus:ring-2 focus:ring-celeste-ink/40';

  return (
    <div ref={dialogRef} aria-labelledby="feedback-title" className="outline-none fixed inset-0 z-[60] flex items-center justify-center bg-sala-navy/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-xl max-h-[90vh] overflow-y-auto sr-modal">
        <div className="sticky top-0 z-10">
          <ModalHeader id="feedback-title" label="Playtest" title="Contanos cómo te fue" icon={<MessageSquareHeart size={22} className="text-sala-sky" />} onClose={onClose} />
        </div>

        {status === 'sent' ? (
          <div className="px-5 py-8 text-center space-y-3">
            <Check size={36} className="mx-auto text-emerald-400" />
            <p className="font-display text-xl font-semibold text-ink">¡Gracias! Tus respuestas llegaron.</p>
            <p className="text-sm text-ink/80">Nos ayudan a que el juego se entienda mejor y sea justo con todas las ideas.</p>
            <button onClick={onClose} className="sr-btn-navy h-11 px-6">Volver al juego</button>
          </div>
        ) : (
          <div className="px-5 py-5 space-y-6">
            <p className="text-sm text-ink/80">Son 2 minutos y todas las preguntas son opcionales. Se envía también un resumen de tu partida (escenario, turno, resultado y acciones más usadas), nada más.</p>

            <Question label="¿Cómo te llamamos?" hint="Un nombre o apodo, para saber de quién es cada respuesta. Podés dejarlo vacío.">
              <input className={input} value={f.alias ?? ''} onChange={e => set('alias')(e.target.value)} placeholder="Tu nombre o apodo" maxLength={60} />
            </Question>

            <Question label="¿Jugás juegos de estrategia?">
              <Choice name="Experiencia" value={f.experiencia ?? ''} onChange={set('experiencia')} options={[['nada', 'Nunca'], ['poca', 'A veces'], ['mucha', 'Seguido']]} />
            </Question>

            <Question label="¿Qué programa intentaste llevar adelante?">
              <Choice name="Programa" value={f.programa ?? ''} onChange={set('programa')} options={[
                ['heterodoxo', 'Más Estado: salarios, industria, protección'],
                ['ortodoxo', 'Más mercado: ordenar cuentas, abrir, invertir'],
                ['mezcla', 'Una mezcla según el momento'],
                ['ninguno', 'No lo pensé así'],
              ]} />
            </Question>

            <Question label="¿Sentiste que el juego te empujaba hacia una ideología?">
              <Choice name="El juego opinaba" value={f.opinaba ?? ''} onChange={set('opinaba')} options={[['no', 'No'], ['un-poco', 'Un poco'], ['si', 'Sí, bastante']]} />
              <textarea className={input} rows={2} value={f.opinaba_por_que ?? ''} onChange={e => set('opinaba_por_que')(e.target.value)} placeholder="¿Por qué? ¿En qué momento lo sentiste?" />
            </Question>

            <Question label="¿Qué fue lo que menos entendiste?">
              <textarea className={input} rows={2} value={f.no_entendi ?? ''} onChange={e => set('no_entendi')(e.target.value)} placeholder="Una palabra, un número, una pantalla…" />
            </Question>

            <Question label="¿Qué tan divertido fue?" hint="1 = nada, 5 = mucho">
              <Choice name="Diversión" value={f.diversion ?? ''} onChange={set('diversion')} options={SCALE} />
            </Question>

            <Question label="¿Qué tan claro fue qué pasaba y por qué?" hint="1 = nada claro, 5 = muy claro">
              <Choice name="Claridad" value={f.claridad ?? ''} onChange={set('claridad')} options={SCALE} />
            </Question>

            <Question label="La dificultad te pareció…">
              <Choice name="Dificultad" value={f.dificultad ?? ''} onChange={set('dificultad')} options={[
                ['muy-facil', 'Muy fácil'], ['facil', 'Fácil'], ['justa', 'Justa'], ['dificil', 'Difícil'], ['muy-dificil', 'Muy difícil'],
              ]} />
            </Question>

            <Question label="¿Volverías a jugar?">
              <Choice name="Volvería" value={f.volveria ?? ''} onChange={set('volveria')} options={[['si', 'Sí'], ['tal-vez', 'Tal vez'], ['no', 'No']]} />
            </Question>

            <Question label="¿Algo más que quieras contarnos?">
              <textarea className={input} rows={3} value={f.comentarios ?? ''} onChange={e => set('comentarios')(e.target.value)} placeholder="Lo que te gustó, lo que te frustró, ideas…" />
            </Question>

            <details className="rounded-md bg-sunken/60 px-3 py-2 text-[13px] text-ink/80">
              <summary className="cursor-pointer font-medium text-ink">Ver el resumen de la partida que se envía</summary>
              <pre className="whitespace-pre-wrap font-sans mt-2">{summary}</pre>
            </details>

            {status === 'failed' && (
              <div role="alert" className="rounded-md border border-amber-800 bg-amber-950 p-3 text-sm text-ink space-y-2">
                <p>No se pudo enviar desde acá (pasa cuando el juego corre en tu computadora y no en la web). Copiá tus respuestas y mandáselas a quien te invitó a probarlo.</p>
                <button onClick={copy} className="inline-flex items-center gap-1.5 h-10 px-3 rounded-md border border-rule bg-surface font-medium">
                  {copied ? <Check size={16} /> : <Copy size={16} />} {copied ? 'Copiado' : 'Copiar respuestas'}
                </button>
              </div>
            )}

            <button
              onClick={submit}
              disabled={status === 'sending'}
              className="sr-btn-lime w-full h-12 text-[13px] disabled:opacity-60"
            >
              {status === 'sending' ? 'Enviando…' : 'Enviar'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
