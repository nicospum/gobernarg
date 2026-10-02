import {
  Wallet,
  AlertTriangle,
  Newspaper,
  CalendarDays,
  Globe2,
  Users,
  Vote,
  ListChecks,
} from 'lucide-react';
import { GameState, TurnSummary } from '../types/game';
import { screenImage } from '@/lib/liteImages';
import { fmtBudgetDelta, fmtBudget } from '@/lib/format';
import { CAUSAL_ACTIONS_BY_ID, INDICATORS } from '@/data/causal';
import { actorReactions, indicatorChanges } from '@/lib/turnExplain';
import { arrows, toneOf, toneClass } from '@/lib/causalText';
import { getActorIcon } from '../utils/actorIcons';
import { ModalHeader } from './ModalHeader';
import { useDialog } from '@/lib/useDialog';
import { detailed } from '@/lite/config';
import { topChanges } from '@/lib/simpleView';
import { DefeatAlerts } from './board/StatusStrip';

interface TurnSummaryModalProps {
  summary: TurnSummary;
  gameState: GameState;
  onClose: () => void;
}

function Delta({ value, suffix = '' }: { value: number; suffix?: string }) {
  const r = Math.round(value * 10) / 10;
  return (
    <span className={`font-mono font-bold ${r > 0 ? 'text-emerald-400' : r < 0 ? 'text-red-400' : 'text-muted-foreground'}`}>
      {r > 0 ? '+' : ''}{r}{suffix}
    </span>
  );
}

export function TurnSummaryModal({ summary, gameState, onClose }: TurnSummaryModalProps) {
  const dialogRef = useDialog<HTMLDivElement>(onClose);
  const record = gameState.causal.records.find(r => r.turn === summary.causalTurn) ?? null;
  const headerImage = screenImage('cierreTurno');
  const changes = record ? indicatorChanges(record) : [];
  const reactions = record ? actorReactions(record) : [];
  // El registro del motor se cierra antes de los eventos, las legislativas y
  // las decisiones que llegan después del turno. Mientras el resumen es el del
  // último turno, los números se toman del estado actual para que cierren con
  // lo que se ve en el tablero, y lo que no vino de la gestión se muestra aparte.
  const isLatest = !!record && record === gameState.causal.records[gameState.causal.records.length - 1];
  const political = isLatest ? gameState.causal.political : record?.politicalAfter;
  const cajaFinal = isLatest ? gameState.causal.caja : record?.fiscal.cajaDespues ?? 0;
  const otherCash = record ? Math.round(cajaFinal - record.fiscal.cajaDespues) : 0;

  return (
    <div ref={dialogRef} className="outline-none fixed inset-0 bg-sala-navy/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div
        className="animate-in fade-in-0 zoom-in-95 duration-200 sr-modal w-full max-w-2xl max-h-[92vh] overflow-y-auto overflow-x-hidden"
      >
        <ModalHeader
          label="Cierre del trimestre"
          title="Resumen del trimestre"
          subtitle={<span className="inline-flex items-center gap-1.5"><CalendarDays className="w-3.5 h-3.5" /> Año {summary.year} · Trimestre {summary.quarter}</span>}
          image={headerImage}
          veil="light"
          imageAlt=""
          onClose={onClose}
          closeLabel="Cerrar resumen"
        />

        {!detailed() ? (
          <div className="p-6 space-y-4">
            <p className="text-[14px] text-ink leading-snug">
              <b>Hiciste:</b>{' '}
              {record && record.actions.length > 0
                ? record.actions.map(a => `${CAUSAL_ACTIONS_BY_ID[a.actionId]?.name ?? a.actionId}${a.forced ? ' (forzada)' : a.suspended ? ' (suspendida)' : ''}`).join(', ')
                : 'nada nuevo este trimestre.'}
            </p>
            {record && political && (() => {
              const top = topChanges(record, political);
              return (
                <section aria-label="Lo que más se movió">
                  <span className="sr-eyebrow block mb-2 !text-sala-muted">Lo que más se movió</span>
                  {top.length === 0 ? (
                    <p className="text-[13px] text-sala-muted">Un trimestre tranquilo: nada se movió mucho.</p>
                  ) : (
                    <ul className="divide-y divide-rule rounded-lg border border-rule">
                      {top.map(ch => (
                        <li key={ch.label} className="flex items-center justify-between gap-3 px-4 py-3">
                          <span className="text-[14px] text-ink">{ch.label}</span>
                          <span className={`flex items-center gap-2 font-bold ${toneClass(ch.tone)}`}>
                            <span className="text-[16px] font-mono">{arrows(ch.delta)}</span>
                            <span className="text-[12px]">{ch.delta > 0 ? 'sube' : 'baja'}</span>
                          </span>
                        </li>
                      ))}
                    </ul>
                  )}
                </section>
              );
            })()}
            <DefeatAlerts gameState={gameState} />
            {record && (
              <p className="text-[14px] text-ink">
                <b>Caja:</b> {fmtBudget(cajaFinal)}
                <span className={cajaFinal - record.fiscal.cajaAntes >= 0 ? 'text-sala-good' : 'text-sala-bad'}>
                  {' '}({cajaFinal - record.fiscal.cajaAntes >= 0 ? 'subió' : 'bajó'} {fmtBudget(Math.abs(cajaFinal - record.fiscal.cajaAntes))})
                </span>
              </p>
            )}
            {summary.events.length > 0 && (
              <p className="text-[12px] text-sala-muted leading-snug">
                <b className="text-ink">También pasó:</b> {summary.events.slice(0, 2).join(' · ')}
              </p>
            )}
            <button onClick={onClose} className="sr-btn-navy w-full h-12 text-[14px]">
              Seguir gobernando →
            </button>
          </div>
        ) : (
        <div className="p-6 space-y-5">
          {/* Decisiones */}
          {record && (
            <section className="bg-surface p-4 rounded-lg border border-ink/8">
              <h4 className="flex items-center gap-2 font-display font-semibold text-xs   text-blue-300 mb-2">
                <ListChecks className="w-4 h-4" />
                POLÍTICAS EJECUTADAS ESTE TRIMESTRE
              </h4>
              {record.actions.length === 0 ? (
                <p className="text-[12px] text-ink/70 font-mono">Sin acciones en la agenda este trimestre.</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {record.actions.map((a, i) => (
                    <span key={i} className={`text-[11px] px-2.5 py-1 rounded-md border font-semibold ${a.suspended ? 'border-red-500/30 text-red-300 line-through bg-red-500/10' : a.forced ? 'border-amber-500/30 text-amber-300 bg-amber-500/10' : 'border-blue-500/30 text-ink bg-blue-500/10'}`}>
                      {CAUSAL_ACTIONS_BY_ID[a.actionId]?.name ?? a.actionId}{a.forced ? ' (forzada)' : ''}
                    </span>
                  ))}
                </div>
              )}
            </section>
          )}

          {/* País */}
          {changes.length > 0 && (
            <section className="bg-surface p-4 rounded-lg border border-ink/8">
              <h4 className="flex items-center gap-2 font-display font-semibold text-xs   text-blue-300 mb-2">
                <Globe2 className="w-4 h-4" />
                EVOLUCIÓN DEL PAÍS
              </h4>
              <ul className="space-y-1.5">
                {changes.map(ch => {
                  const tone = toneOf(ch.id, ch.delta);
                  return (
                    <li key={ch.id} className="text-[12px] leading-relaxed flex items-center justify-between">
                      <span className="text-ink/90 font-medium">{INDICATORS[ch.id].name}</span>
                      <span className="flex items-center gap-2">
                        <span className={`font-mono font-bold ${toneClass(tone)}`}>{arrows(ch.delta)}</span>
                        {ch.causes.length > 0 && (
                          <span className="text-ink/70 text-[10px]"> ({ch.causes.map(c => c.text).join(', ')})</span>
                        )}
                      </span>
                    </li>
                  );
                })}
              </ul>
            </section>
          )}

          {/* Actores */}
          {reactions.length > 0 && (
            <section className="bg-surface p-4 rounded-lg border border-ink/8">
              <h4 className="flex items-center gap-2 font-display font-semibold text-xs   text-blue-300 mb-2">
                <Users className="w-4 h-4" />
                REACCIÓN DE LOS ACTORES
              </h4>
              <ul className="space-y-2">
                {reactions.map(r => {
                  const icon = getActorIcon(r.actor);
                  return (
                    <li key={r.actor} className="flex items-center justify-between text-[12px] bg-ink/3 p-2 rounded-lg border border-ink/6">
                      <div className="flex items-center gap-2">
                        {icon && <img src={icon} alt="" loading="lazy" decoding="async" className="w-6 h-6 rounded-full object-cover" />}
                        <span className="text-ink font-medium">{r.name}</span>
                        {r.reason && <span className="text-ink/70 text-[10px]">— {r.reason}</span>}
                      </div>
                      <span className={`font-mono font-bold ${r.delta > 0 ? 'text-emerald-400' : 'text-red-400'}`}>{arrows(r.delta)}</span>
                    </li>
                  );
                })}
              </ul>
            </section>
          )}

          {/* Política y cuentas */}
          {record && (
            <section className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="rounded-lg border border-ink/8 bg-surface p-3.5">
                <p className="flex items-center gap-1.5 font-bold text-[10px] text-ink/70 uppercase tracking-widest mb-2">
                  <Vote className="w-3.5 h-3.5 text-blue-400" /> INDICADORES POLÍTICOS
                </p>
                <div className="text-[12px] space-y-1.5 font-medium">
                  <div className="flex justify-between text-ink/80"><span>Aprobación</span><Delta value={political!.apro - record.politicalBefore.apro} /></div>
                  <div className="flex justify-between text-ink/80"><span>Intención de voto</span><Delta value={political!.iv - record.politicalBefore.iv} suffix="%" /></div>
                  <div className="flex justify-between text-ink/80"><span>Gobernabilidad</span><Delta value={political!.gob - record.politicalBefore.gob} /></div>
                </div>
              </div>
              <div className="rounded-lg border border-ink/8 bg-surface p-3.5">
                <p className="flex items-center gap-1.5 font-bold text-[10px] text-ink/70 uppercase tracking-widest mb-2">
                  <Wallet className="w-3.5 h-3.5 text-emerald-400" /> RESULTADO DE CUENTAS
                </p>
                <div className="text-[12px] space-y-1.5 font-medium">
                  <div className="flex justify-between text-ink/80"><span>Resultado fiscal</span><span className={`font-mono font-bold ${record.fiscal.resultado >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>{fmtBudgetDelta(record.fiscal.resultado)}</span></div>
                  {record.fiscal.financiamiento !== 0 && (
                    <div className="flex justify-between text-ink/80"><span>Financiamiento</span><span className="font-mono text-amber-300 font-bold">{fmtBudgetDelta(record.fiscal.financiamiento)}</span></div>
                  )}
                  {otherCash !== 0 && (
                    <div className="flex justify-between text-ink/80"><span>Eventos y otras decisiones</span><span className={`font-mono font-bold ${otherCash >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>{fmtBudgetDelta(otherCash)}</span></div>
                  )}
                  <div className="flex justify-between text-ink/80"><span>Caja final</span><span className="font-mono font-bold text-ink">{fmtBudget(cajaFinal)}</span></div>
                </div>
              </div>
            </section>
          )}

          {/* Eventos y relaciones */}
          <section className="bg-surface p-4 rounded-lg border border-ink/8">
            <h4 className="flex items-center gap-2 font-display font-semibold text-xs   text-blue-300 mb-2">
              <Newspaper className="w-4 h-4" />
              NOVEDADES Y NOTICIAS
            </h4>
            {summary.events.length > 0 ? (
              <ul className="space-y-1.5">
                {summary.events.map((event, index) => (
                  <li key={index} className="flex items-start gap-2.5 text-[12px] text-ink/80 leading-snug">
                    <span className="inline-block w-1.5 h-1.5 rounded-full bg-blue-400 mt-1.5 flex-shrink-0" />
                    <span>{event}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-[12px] text-ink/70 font-mono">Trimestre finalizado sin contingencias graves.</p>
            )}
          </section>

          {summary.inflationEvent.triggered && (
            <div className="rounded-xl border border-red-500/40 bg-red-500/15 p-4 shadow-lg">
              <div className="flex items-center gap-2 text-red-300">
                <AlertTriangle className="w-5 h-5" />
                <p className="font-display font-semibold text-base  ">La inflación se está acelerando</p>
              </div>
              <p className="text-[12px] text-red-200/80 mt-1 leading-relaxed">
                La espiral de precios reduce el poder adquisitivo de los sectores populares y tensiona la recaudación del Tesoro.
              </p>
            </div>
          )}

          <div className="text-center pt-2">
            <button onClick={onClose} className="w-full bg-blue-600 hover:bg-blue-500 text-white py-3 rounded-xl font-display font-semibold text-base   transition-colors shadow-lg shadow-blue-600/20">
              Continuar al Siguiente Trimestre →
            </button>
          </div>
        </div>
        )}
      </div>
    </div>
  );
}
