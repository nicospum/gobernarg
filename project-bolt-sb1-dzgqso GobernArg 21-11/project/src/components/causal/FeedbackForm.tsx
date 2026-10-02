import { useState, type ReactNode } from 'react';
import { Check, Copy } from 'lucide-react';
import type { CausalState } from '../../causal/types';
import { TURNS_PER_TERM } from '../../causal/catalog';
import { DIFFICULTIES } from '../../causal/campaignCatalog';
import { getScenario } from '../../causal/scenarios';
import { policyName, totalDebt } from '../../causal/selectors';
import { fmtPct, fmtU } from '../../causal/format';
import { useIsMobile } from '../../lib/useMediaQuery';
import { Dialog } from './Dialog';

/**
 * Playtest con personas (Fase 3, traído de la versión A): preguntas cortas y
 * un resumen de la partida, enviados a Netlify Forms (form "playtest",
 * declarado en index.html). En local ofrece copiar las respuestas.
 */
const START_KEY = 'gobernarg.lite.playtest.inicio';

export function markGameStart(): void {
  try { localStorage.setItem(START_KEY, String(Date.now())); } catch { /* sin almacenamiento, sin duración */ }
}

function minutesPlayed(): number | null {
  try { const t = Number(localStorage.getItem(START_KEY)); return t ? Math.max(1, Math.round((Date.now() - t) / 60000)) : null; } catch { return null; }
}

export function gameSummary(state: CausalState, isMobile: boolean): string {
  const c = state.campaign;
  const inTerm = (state.turn - 1) % TURNS_PER_TERM + 1;
  const counts = new Map<string, number>();
  for (const r of state.reports) for (const e of r.executions) counts.set(e.actionId, (counts.get(e.actionId) ?? 0) + 1);
  const top = [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 6).map(([id, n]) => `${policyName(id)} (${n})`).join(', ');
  const result = state.phase === 'ended' ? (c?.outcome === 'victory' ? 'ganó' : c?.outcome === 'retired' ? 'se retiró' : `perdió${c?.outcomeReason ? ` (${c.outcomeReason})` : ''}`) : 'en curso';
  const minutes = minutesPlayed();
  return [
    'Versión: B Lite',
    `Dispositivo: ${isMobile ? 'celular o tablet' : 'computadora'}`,
    `Escenario: ${getScenario(state.scenarioId)?.name ?? '—'}${c ? ` · exigencia ${DIFFICULTIES[c.difficulty].name}` : ''}`,
    `Mandato ${state.term}, turno ${inTerm} de ${TURNS_PER_TERM}`,
    `Resultado: ${result}`,
    c ? `Proyección de voto ${fmtPct(c.votes)} · Aprobación ${fmtPct(c.approval)} · Estabilidad ${Math.round(c.stability)} · Legitimidad ${Math.round(c.legitimacy)}` : null,
    `Caja ${fmtU(state.cash, 0)} · Deuda ${fmtU(totalDebt(state), 0)}`,
    `Políticas más usadas: ${top || 'ninguna'}`,
    minutes ? `Minutos desde que empezó la partida: ${minutes}` : null,
  ].filter(Boolean).join('\n');
}

function Choice({ label, value, options, onChange }: { label: string; value: string; options: [string, string][]; onChange: (v: string) => void }) {
  return <div role="radiogroup" aria-label={label} className="flex flex-wrap gap-2">{options.map(([v, text]) =>
    <button key={v} type="button" role="radio" aria-checked={value === v} onClick={() => onChange(value === v ? '' : v)}
      className={`min-h-10 px-3 rounded-lg border text-sm ${value === v ? 'bg-primary border-primary text-white' : 'border-border bg-white/5 hover:bg-white/10'}`}>{text}</button>)}</div>;
}
function Question({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
  return <div className="space-y-2"><div><p className="font-semibold">{label}</p>{hint && <p className="text-xs text-muted-foreground">{hint}</p>}</div>{children}</div>;
}
const SCALE: [string, string][] = [['1', '1'], ['2', '2'], ['3', '3'], ['4', '4'], ['5', '5']];

export function FeedbackForm({ state, onClose }: { state: CausalState; onClose: () => void }) {
  const isMobile = useIsMobile();
  const [f, setF] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'failed'>('idle');
  const [copied, setCopied] = useState(false);
  const set = (k: string) => (v: string) => setF(prev => ({ ...prev, [k]: v }));
  const summary = gameSummary(state, isMobile);
  const fields = () => ({ ...f, resumen: summary, version: 'B Lite' });
  const submit = async () => {
    setStatus('sending');
    try {
      const body = new URLSearchParams({ 'form-name': 'playtest', ...fields() }).toString();
      const res = await fetch('/', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body });
      setStatus(res.ok ? 'sent' : 'failed');
    } catch { setStatus('failed'); }
  };
  const copy = async () => {
    try { await navigator.clipboard.writeText(Object.entries(fields()).filter(([, v]) => v).map(([k, v]) => `${k}: ${v}`).join('\n')); setCopied(true); } catch { setCopied(false); }
  };
  const input = 'w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-primary placeholder:text-muted-foreground';

  if (status === 'sent') return <Dialog title="¡Gracias!" onClose={onClose}><p className="text-sm">Tus respuestas llegaron. Nos ayudan a que el juego se entienda mejor y sea justo con todas las ideas.</p><button type="button" className="causal-primary" onClick={onClose}>Volver al juego</button></Dialog>;
  return <Dialog title="Contanos cómo te fue" onClose={onClose}>
    <p className="text-sm text-muted-foreground">Son 2 minutos y todas las preguntas son opcionales. Se envía también un resumen de tu partida (escenario, turno, resultado y políticas más usadas), nada más.</p>
    <Question label="¿Cómo te llamamos?" hint="Un nombre o apodo. Podés dejarlo vacío."><input className={input} value={f.alias ?? ''} maxLength={60} onChange={e => set('alias')(e.target.value)} placeholder="Tu nombre o apodo" /></Question>
    <Question label="¿Jugás juegos de estrategia?"><Choice label="Experiencia" value={f.experiencia ?? ''} onChange={set('experiencia')} options={[['nada', 'Nunca'], ['poca', 'A veces'], ['mucha', 'Seguido']]} /></Question>
    <Question label="¿Qué programa intentaste llevar adelante?"><Choice label="Programa" value={f.programa ?? ''} onChange={set('programa')} options={[['heterodoxo', 'Más Estado: salarios, industria, protección'], ['ortodoxo', 'Más mercado: ordenar cuentas, abrir, invertir'], ['mezcla', 'Una mezcla según el momento'], ['ninguno', 'No lo pensé así']]} /></Question>
    <Question label="¿Sentiste que el juego te empujaba hacia una ideología?"><Choice label="El juego opinaba" value={f.opinaba ?? ''} onChange={set('opinaba')} options={[['no', 'No'], ['un-poco', 'Un poco'], ['si', 'Sí, bastante']]} /><textarea className={input} rows={2} value={f.opinaba_por_que ?? ''} onChange={e => set('opinaba_por_que')(e.target.value)} placeholder="¿Por qué? ¿En qué momento lo sentiste?" /></Question>
    <Question label="¿Qué fue lo que menos entendiste?"><textarea className={input} rows={2} value={f.no_entendi ?? ''} onChange={e => set('no_entendi')(e.target.value)} placeholder="Una palabra, un número, una pantalla…" /></Question>
    <Question label="¿Qué tan divertido fue?" hint="1 = nada, 5 = mucho"><Choice label="Diversión" value={f.diversion ?? ''} onChange={set('diversion')} options={SCALE} /></Question>
    <Question label="¿Qué tan claro fue qué pasaba y por qué?" hint="1 = nada claro, 5 = muy claro"><Choice label="Claridad" value={f.claridad ?? ''} onChange={set('claridad')} options={SCALE} /></Question>
    <Question label="La dificultad te pareció…"><Choice label="Dificultad" value={f.dificultad ?? ''} onChange={set('dificultad')} options={[['muy-facil', 'Muy fácil'], ['facil', 'Fácil'], ['justa', 'Justa'], ['dificil', 'Difícil'], ['muy-dificil', 'Muy difícil']]} /></Question>
    <Question label="¿Volverías a jugar?"><Choice label="Volvería" value={f.volveria ?? ''} onChange={set('volveria')} options={[['si', 'Sí'], ['tal-vez', 'Tal vez'], ['no', 'No']]} /></Question>
    <Question label="¿Algo más que quieras contarnos?"><textarea className={input} rows={3} value={f.comentarios ?? ''} onChange={e => set('comentarios')(e.target.value)} placeholder="Lo que te gustó, lo que te frustró, ideas…" /></Question>
    <details className="text-xs text-muted-foreground"><summary className="cursor-pointer">Ver el resumen de la partida que se envía</summary><pre className="whitespace-pre-wrap font-sans mt-2">{summary}</pre></details>
    {status === 'failed' && <div role="alert" className="rounded-lg border border-amber-300/40 bg-amber-300/10 p-3 text-sm space-y-2"><p>No se pudo enviar desde acá (pasa cuando el juego corre en tu computadora y no en la web). Copiá tus respuestas y mandáselas a quien te invitó a probarlo.</p><button type="button" className="causal-secondary inline-flex items-center gap-1.5" onClick={copy}>{copied ? <Check size={15} /> : <Copy size={15} />} {copied ? 'Copiado' : 'Copiar respuestas'}</button></div>}
    <button type="button" className="causal-primary w-full h-12" disabled={status === 'sending'} onClick={submit}>{status === 'sending' ? 'Enviando…' : 'Enviar'}</button>
  </Dialog>;
}
