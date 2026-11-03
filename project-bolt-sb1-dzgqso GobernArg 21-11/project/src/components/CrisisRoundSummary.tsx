import { Flag } from 'lucide-react';
import type { GameState, TurnSummary } from '../types/game';
import { CAUSAL_ACTIONS_BY_ID } from '@/data/causal';
import { crisisScenario } from '@/engine/causal';
import { fmtBudget } from '@/lib/format';
import { kpiWord } from '@/lib/simpleView';
import { arrows, toneClass } from '@/lib/causalText';
import { roundChanges, unitWords } from '@/lib/crisisView';
import { DefeatAlerts } from './board/StatusStrip';

const TONE: Record<'good' | 'bad' | 'neutral', string> = { good: 'text-sala-good', bad: 'text-sala-bad', neutral: 'text-sala-warn' };

interface CrisisRoundSummaryProps {
  summary: TurnSummary;
  gameState: GameState;
  onClose: () => void;
}

/**
 * Cuerpo del resumen de una subronda de la emergencia (escenarios
 * históricos): qué hiciste, qué pasó y lo que más se movió, en palabras. No
 * hay registro trimestral de estas subrondas: todo sale de causal.crisis.log.
 */
export function CrisisRoundSummary({ summary, gameState, onClose }: CrisisRoundSummaryProps) {
  const c = gameState.causal;
  const round = summary.crisisRound;
  if (!round) return null;
  const words = unitWords(crisisScenario(c)?.roundUnit ?? 'turno');
  const log = c.crisis?.log ?? [];
  const record = log.find(r => r.round === round.round) ?? log[log.length - 1] ?? null;
  const measure = record?.measure ? CAUSAL_ACTIONS_BY_ID[record.measure]?.name ?? record.measure : null;
  // El fin de la emergencia va en su propio aviso, no repetido entre las líneas.
  const lines = summary.events.filter(line => !(round.last && line.startsWith('Termina la emergencia')));
  const changes = record ? roundChanges(record) : [];
  const gobBefore = record ? kpiWord(record.gobBefore) : null;
  const gobAfter = record ? kpiWord(record.gobAfter) : null;
  const cajaDelta = record ? Math.round(record.cajaAfter - record.cajaBefore) : 0;

  return (
    <div className="space-y-4 p-6">
      <p className="text-[14px] leading-snug text-ink">
        <b>Hiciste:</b> {measure ?? `nada extraordinario ${words.thisLower}.`}
      </p>

      {lines.length > 0 && (
        <section aria-label="Qué pasó">
          <span className="sr-eyebrow mb-2 block !text-sala-muted">Qué pasó</span>
          <ul className="space-y-1.5">
            {lines.map((line, i) => (
              <li key={`${i}.${line}`} className="flex items-start gap-2.5 text-[13px] leading-snug text-ink/85">
                <span className="mt-[7px] h-1.5 w-1.5 flex-shrink-0 rounded-full bg-sala-blue" aria-hidden="true" />
                <span>{line}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section aria-label="Lo que más se movió">
        <span className="sr-eyebrow mb-2 block !text-sala-muted">Lo que más se movió</span>
        {changes.length === 0 ? (
          <p className="text-[13px] text-sala-muted">{words.thisCap} {words.unit === 'semana' ? 'tranquila' : 'tranquilo'}: nada se movió mucho.</p>
        ) : (
          <ul className="divide-y divide-rule rounded-lg border border-rule">
            {changes.map(ch => (
              <li key={ch.label} className="flex items-center justify-between gap-3 px-4 py-3">
                <span className="text-[14px] text-ink">{ch.label}</span>
                <span className={`flex items-center gap-2 font-bold ${toneClass(ch.tone)}`}>
                  <span className="font-mono text-[16px]">{arrows(ch.delta)}</span>
                  <span className="text-[12px]">{ch.delta > 0 ? 'sube' : 'baja'}</span>
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      {record && gobBefore && gobAfter && (
        <div className="grid grid-cols-1 gap-2 text-[14px] text-ink sm:grid-cols-2">
          <p>
            <b>Gobernabilidad:</b>{' '}
            {gobBefore.word === gobAfter.word ? (
              <span className={TONE[gobAfter.tone]}>sigue {gobAfter.word.toLowerCase()}</span>
            ) : (
              <>
                {gobBefore.word.toLowerCase()} → <span className={TONE[gobAfter.tone]}>{gobAfter.word.toLowerCase()}</span>
              </>
            )}
          </p>
          <p>
            <b>Caja:</b> {fmtBudget(record.cajaAfter)}{' '}
            <span className={cajaDelta > 0 ? 'text-sala-good' : cajaDelta < 0 ? 'text-sala-bad' : 'text-sala-muted'}>
              ({cajaDelta === 0 ? 'sin cambios' : `${cajaDelta > 0 ? 'subió' : 'bajó'} ${fmtBudget(Math.abs(cajaDelta))}`})
            </span>
          </p>
        </div>
      )}

      <DefeatAlerts gameState={gameState} />

      {round.last && (
        <p className="flex items-start gap-2 rounded-lg border border-sala-blue/30 bg-sala-blue/5 px-3.5 py-2.5 text-[13px] font-semibold leading-snug text-ink">
          <Flag size={16} className="mt-px flex-shrink-0 text-sala-blue" />
          Termina la emergencia: empieza la gestión por trimestres.
        </p>
      )}

      <button onClick={onClose} className="sr-btn-navy h-12 w-full text-[14px]">
        {round.last ? 'Empezar la gestión →' : 'Seguir gobernando →'}
      </button>
    </div>
  );
}
