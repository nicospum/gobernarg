import { useState } from 'react';
import { Check, CheckCircle2, ChevronDown, ChevronRight, ChevronUp, Circle, Flame, Lock } from 'lucide-react';
import type { GameState } from '../../types/game';
import { getPolicyAvailability } from '../../engine/gameEngine';
import { crisisRoundLabel, crisisScenario, crisisStatus, inEmergency, type Availability } from '@/engine/causal';
import { CRISIS_META, getScenario } from '@/data/causal';
import { Sheet } from '../mobile/Sheet';
import { crisisUnit, emergencyStage, unitWords, type CrisisUnit } from '@/lib/crisisView';

const TONE_TEXT: Record<'good' | 'bad' | 'neutral', string> = { good: 'text-sala-good', bad: 'text-sala-bad', neutral: 'text-ink' };
/** Medidas que se ven de entrada; el resto queda plegado en "Ver n medidas más". */
const VISIBLE_MEASURES = 6;

interface EmergencyBlockProps {
  gameState: GameState;
  onActionSelect: (actionId: string) => void;
  onEndTurn?: () => void;
  canEndTurn?: boolean;
  /** Gestión: contexto plegado; estado, objetivos y las medidas que sigan habilitadas. */
  compact?: boolean;
  /** Número del rótulo en el tablero. */
  index?: string;
}

/** Qué intenta resolver, costo o riesgo, la apuesta y la referencia histórica de una medida. */
function MeasureLines({ actionId, unit }: { actionId: string; unit: CrisisUnit }) {
  const meta = CRISIS_META[actionId];
  if (!meta) return null;
  return (
    <div className="space-y-1 text-[12px] leading-snug">
      <p className="text-ink/85"><b className="text-ink">Qué intenta resolver:</b> {meta.solves}</p>
      <p className="text-sala-warn"><b className="text-ink">Costo o riesgo:</b> {meta.risk}</p>
      {meta.bet && (
        <>
          <p className="text-sala-good">{meta.bet.bien}</p>
          <p className="text-sala-bad">{meta.bet.mal}</p>
        </>
      )}
      <p className="text-[11px] text-sala-muted">Sin costo · una por {unit}</p>
      {meta.history && <p className="text-[10px] text-sala-dim">Referencia: {meta.history}</p>}
    </div>
  );
}

/** Tarjeta de una medida extraordinaria, con halo de luz; la ayuda abre una hoja con la nota larga. */
function MeasureCard({ availability, isSelected, locked, unit, onSelect }: {
  availability: Availability;
  isSelected: boolean;
  /** Partida terminada o elección pendiente: no se elige nada nuevo. */
  locked: boolean;
  unit: CrisisUnit;
  onSelect: () => void;
}) {
  const { action, available, reasons } = availability;
  const [showHelp, setShowHelp] = useState(false);
  const blocked = !isSelected && (!available || locked);
  const blockReason = !available ? reasons[0] ?? 'No está disponible ahora.' : locked ? 'Ahora no se puede elegir.' : null;
  return (
    <>
      <article
        data-glow={blocked ? 'dim' : isSelected ? 'selected' : 'on'}
        aria-label={action.name}
        className={`sr-glow relative rounded-[10px] border bg-surface px-4 py-3.5 transition-colors ${
          isSelected ? 'border-sala-blue/60 bg-[rgb(250_253_255)]' : blocked ? 'sr-glow-dim border-rule bg-sunken/40' : 'hover:bg-[rgb(255_253_246)]'
        }`}
      >
        <div className="flex items-start justify-between gap-2">
          <h4 className="min-w-0 text-[15px] font-bold leading-snug text-ink">{action.name}</h4>
          {isSelected ? (
            <span className="inline-flex flex-shrink-0 items-center gap-1 rounded bg-sala-navy px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
              <Check size={10} /> Elegida
            </span>
          ) : blocked ? (
            <span className="inline-flex flex-shrink-0 items-center gap-1 rounded bg-red-500/10 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-sala-bad">
              <Lock size={9} /> Bloqueada
            </span>
          ) : null}
        </div>
        <p className="mt-1 text-[12px] leading-snug text-sala-muted">{action.description}</p>
        <div className="mt-2.5"><MeasureLines actionId={action.id} unit={unit} /></div>
        <div className="mt-3 flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowHelp(true)}
            className="h-11 rounded-md border border-rule bg-surface px-3 text-[13px] font-medium text-ink"
          >
            Ayuda
          </button>
          {isSelected ? (
            <button
              type="button"
              aria-pressed="true"
              aria-label={`Quitar ${action.name} del turno`}
              onClick={onSelect}
              className="inline-flex h-11 flex-1 items-center justify-center gap-1 rounded-md bg-sala-navy text-[12px] font-bold text-white"
            >
              <Check size={14} /> Seleccionada · quitar
            </button>
          ) : !blocked ? (
            <button
              type="button"
              aria-pressed="false"
              aria-label={`Agregar ${action.name} al turno`}
              onClick={onSelect}
              className="inline-flex h-11 flex-1 items-center justify-center gap-1 rounded-md border border-[rgb(184_201_218)] bg-surface text-[12px] font-bold text-ink transition-colors hover:border-sala-navy hover:bg-sala-navy hover:text-white"
            >
              Agregar al turno <ChevronRight size={14} />
            </button>
          ) : (
            <span className="min-w-0 flex-1 text-[11px] font-semibold leading-snug text-sala-bad">{blockReason}</span>
          )}
        </div>
      </article>
      {showHelp && (
        <Sheet
          title={action.name}
          onClose={() => setShowHelp(false)}
          footer={
            <button
              type="button"
              disabled={blocked}
              onClick={() => { onSelect(); setShowHelp(false); }}
              className="sr-btn-navy h-12 w-full"
            >
              {isSelected ? 'Quitar del turno' : blocked ? blockReason : 'Agregar al turno'}
            </button>
          }
        >
          <p className="mb-3 text-[14px] text-ink/80">{action.description}</p>
          {action.strategic && <p className="mb-3 text-[14px] leading-relaxed text-ink">{action.strategic}</p>}
          <MeasureLines actionId={action.id} unit={unit} />
        </Sheet>
      )}
    </>
  );
}

/**
 * Bloque "Emergencia" de los escenarios históricos (Corralito 2001 e Hiper
 * 1989): la etapa, qué está pasando (hechos documentados aparte de lo
 * simulado), el estado de la crisis en palabras, los objetivos del escenario
 * y las medidas extraordinarias con halo. Durante la emergencia reemplaza a la
 * grilla y cierra la semana o el mes; en la gestión queda arriba de la grilla.
 */
export function EmergencyBlock({ gameState, onActionSelect, onEndTurn, canEndTurn = true, compact = false, index }: EmergencyBlockProps) {
  const [showAll, setShowAll] = useState(false);
  const c = gameState.causal;
  const def = crisisScenario(c);
  if (!def || !c.crisis) return null;
  const scenario = getScenario(c.scenarioId);
  const emergency = inEmergency(c);
  const unit = crisisUnit(c);
  const words = unitWords(unit);
  const locked = gameState.gameOver || !!gameState.pendingElection;
  const selected = gameState.selectedActions;
  // Primero la elegida, después las disponibles y al final las bloqueadas con su motivo.
  const rank = (a: Availability) => (selected.includes(a.action.id) ? 0 : a.available ? 1 : 2);
  const measures = getPolicyAvailability(gameState)
    .filter(a => a.action.extraordinary)
    .sort((x, y) => rank(x) - rank(y));
  const shown = showAll ? measures : measures.slice(0, VISIBLE_MEASURES);
  const hiddenCount = measures.length - shown.length;
  const chosen = measures.find(a => selected.includes(a.action.id));
  const status = crisisStatus(c);
  const contextOpen = emergency && !compact && c.crisis.round === 1;
  const foldButton = 'mt-2.5 inline-flex min-h-11 items-center gap-1.5 rounded-md border border-rule bg-surface px-3 text-[12px] font-medium text-ink hover:bg-sunken';

  return (
    <section className="sr-panel" aria-label="Emergencia">
      <div className="sr-panel-head">
        <div className="min-w-0">
          <span className="sr-label">{index ? `${index} / ` : ''}Emergencia</span>
          <h2 className="sr-panel-title">{scenario.name}</h2>
          <p className="mt-1 text-[12px] text-sala-muted" data-stage>
            {emergency ? `${crisisRoundLabel(c)} · ${emergencyStage(c)}` : 'Medidas extraordinarias'}
          </p>
        </div>
        <span className="inline-flex flex-shrink-0 items-center gap-1.5 whitespace-nowrap rounded bg-amber-500/10 px-2 py-1.5 text-[11px] font-bold text-gold-ink">
          <Flame size={13} /> {emergency ? 'En emergencia' : 'En gestión'}
        </span>
      </div>

      {/* Qué está pasando: los hechos documentados, separados de lo simulado. */}
      <details open={contextOpen} className="group border-b border-rule">
        <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-2 px-4 py-3 text-[13px] font-bold text-ink [&::-webkit-details-marker]:hidden">
          Qué está pasando
          <ChevronDown size={16} className="flex-shrink-0 text-sala-muted transition-transform group-open:rotate-180" aria-hidden="true" />
        </summary>
        <div className="space-y-3 px-4 pb-4">
          <div className="rounded-lg bg-sunken/60 px-3.5 py-3">
            <span className="sr-eyebrow mb-1.5 block">Hechos documentados</span>
            <ol className="list-decimal space-y-1.5 pl-4 text-[12px] leading-snug text-ink/85">
              {def.context.map(line => <li key={line}>{line}</li>)}
            </ol>
          </div>
          <div className="border-l-2 border-sala-cyan pl-3">
            <span className="sr-eyebrow mb-1 block !text-sala-blue">Historia alternativa</span>
            <p className="text-[12px] italic leading-snug text-ink/80">{def.alternateHistory}</p>
          </div>
        </div>
      </details>

      <div className="border-b border-rule px-4 py-3">
        <span className="sr-eyebrow mb-1.5 block">Estado de la crisis</span>
        <dl className="grid grid-cols-1 gap-x-4 gap-y-1 text-[12px] sm:grid-cols-2">
          {status.map(line => (
            <div key={line.label} className="flex min-w-0 gap-1.5">
              <dt className="flex-shrink-0 text-sala-muted">{line.label}:</dt>
              <dd className={`min-w-0 font-semibold ${TONE_TEXT[line.tone]}`}>{line.value}</dd>
            </div>
          ))}
        </dl>
      </div>

      <div className="border-b border-rule px-4 py-3">
        <span className="sr-eyebrow mb-1.5 block">Objetivos del escenario</span>
        <ul className="grid grid-cols-1 gap-x-4 gap-y-1 text-[12px] sm:grid-cols-2" aria-label="Objetivos del escenario">
          {gameState.objectives.map(o => (
            <li key={o.id} className="flex min-w-0 items-center gap-1.5" title={o.description}>
              {o.completed
                ? <CheckCircle2 size={14} className="flex-shrink-0 text-sala-good" aria-label="cumplido" />
                : <Circle size={14} className="flex-shrink-0 text-sala-dim" aria-label="pendiente" />}
              <span className={`truncate ${o.completed ? 'font-semibold text-ink' : 'text-ink/80'}`}>{o.title}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="px-4 py-3">
        <div className="mb-2 flex flex-wrap items-baseline justify-between gap-x-2 gap-y-1">
          <h3 className="text-[13px] font-bold text-ink">Medidas extraordinarias</h3>
          <span className="text-[11px] text-sala-muted">Sin costo · una por {unit}</span>
        </div>
        {measures.length === 0 ? (
          <p className="text-[12px] text-sala-muted">No queda ninguna medida extraordinaria habilitada por ahora.</p>
        ) : (
          <ul className="space-y-2.5" aria-label="Medidas extraordinarias">
            {shown.map(av => (
              <li key={av.action.id}>
                <MeasureCard
                  availability={av}
                  isSelected={selected.includes(av.action.id)}
                  locked={locked}
                  unit={unit}
                  onSelect={() => onActionSelect(av.action.id)}
                />
              </li>
            ))}
          </ul>
        )}
        {hiddenCount > 0 && (
          <button type="button" onClick={() => setShowAll(true)} className={foldButton}>
            <ChevronDown size={14} /> Ver {hiddenCount} {hiddenCount === 1 ? 'medida más' : 'medidas más'}
          </button>
        )}
        {showAll && measures.length > VISIBLE_MEASURES && (
          <button type="button" onClick={() => setShowAll(false)} className={foldButton}>
            <ChevronUp size={14} /> Ver menos
          </button>
        )}
      </div>

      {emergency && (
        <div className="border-t border-rule px-4 pb-4 pt-3">
          <p className="mb-2.5 text-[12px] text-sala-muted">
            {chosen ? <>Elegiste: <b className="text-ink">{chosen.action.name}</b></> : `Sin medida extraordinaria ${words.thisLower}`}
          </p>
          <button
            onClick={e => {
              e.currentTarget.blur();
              onEndTurn?.();
            }}
            disabled={!canEndTurn}
            data-no-restore-focus
            className="sr-btn-lime h-12 w-full justify-between px-4 text-[12px]"
          >
            {words.close}
            <ChevronRight size={17} />
          </button>
        </div>
      )}
    </section>
  );
}
