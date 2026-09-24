import {
  X,
  TrendingUp,
  TrendingDown,
  Wallet,
  AlertTriangle,
  Newspaper,
  CalendarDays,
  Globe2,
  Users,
  Vote,
  ListChecks,
} from 'lucide-react';
import { motion } from 'motion/react';
import { GameState, TurnSummary } from '../types/game';
import { IMAGES } from '../utils/imageAssets';
import { fmtBudgetDelta, fmtBudget } from '@/lib/format';
import { CAUSAL_ACTIONS_BY_ID, INDICATORS } from '@/data/causal';
import { actorReactions, indicatorChanges } from '@/lib/turnExplain';
import { arrows, toneOf, toneClass } from '@/lib/causalText';
import { getActorIcon } from '../utils/actorIcons';

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
  const record = gameState.causal.records.find(r => r.turn === summary.causalTurn) ?? null;
  const headerImage = summary.inflationEvent.triggered
    ? IMAGES.events.economicCrisis
    : record && record.events.length > 0
      ? IMAGES.events.socialProtest
      : IMAGES.ui.shieldEmblem;
  const changes = record ? indicatorChanges(record) : [];
  const reactions = record ? actorReactions(record, gameState.causal.platformId) : [];

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.2 }}
        className="bg-[#0f1e38] border border-white/12 rounded-2xl w-full max-w-2xl max-h-[92vh] overflow-y-auto shadow-2xl"
      >
        {/* Header visual */}
        <div className="relative h-36 md:h-44">
          <img src={headerImage} alt="Resumen del trimestre" loading="lazy" decoding="async" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0f1e38] via-[#0f1e38]/70 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-5 flex items-end justify-between gap-4">
            <div>
              <h2 className="font-['Barlow_Condensed'] text-2xl font-bold uppercase tracking-wider text-white">RESUMEN DEL TRIMESTRE</h2>
              <p className="flex items-center gap-1.5 text-white/80 text-xs font-mono mt-0.5">
                <CalendarDays className="w-3.5 h-3.5 text-blue-400" />
                Año {summary.year} · Trimestre {summary.quarter}
              </p>
            </div>
            <button onClick={onClose} aria-label="Cerrar resumen" className="p-1.5 text-white/50 hover:text-white rounded-lg transition-colors bg-white/5 border border-white/8">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-5">
          {/* Decisiones */}
          {record && (
            <section className="bg-[#091422] p-4 rounded-xl border border-white/8">
              <h4 className="flex items-center gap-2 font-['Barlow_Condensed'] font-bold text-xs uppercase tracking-wider text-blue-300 mb-2">
                <ListChecks className="w-4 h-4" />
                POLÍTICAS EJECUTADAS ESTE TRIMESTRE
              </h4>
              {record.actions.length === 0 ? (
                <p className="text-[12px] text-white/40 font-mono">Sin acciones en la agenda este trimestre.</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {record.actions.map((a, i) => (
                    <span key={i} className={`text-[11px] px-2.5 py-1 rounded-md border font-semibold ${a.suspended ? 'border-red-500/30 text-red-300 line-through bg-red-500/10' : a.forced ? 'border-amber-500/30 text-amber-300 bg-amber-500/10' : 'border-blue-500/30 text-white bg-blue-500/10'}`}>
                      {CAUSAL_ACTIONS_BY_ID[a.actionId]?.name ?? a.actionId}{a.forced ? ' (forzada)' : ''}
                    </span>
                  ))}
                </div>
              )}
            </section>
          )}

          {/* País */}
          {changes.length > 0 && (
            <section className="bg-[#091422] p-4 rounded-xl border border-white/8">
              <h4 className="flex items-center gap-2 font-['Barlow_Condensed'] font-bold text-xs uppercase tracking-wider text-blue-300 mb-2">
                <Globe2 className="w-4 h-4" />
                EVOLUCIÓN DEL PAÍS
              </h4>
              <ul className="space-y-1.5">
                {changes.map(ch => {
                  const tone = toneOf(ch.id, ch.delta);
                  return (
                    <li key={ch.id} className="text-[12px] leading-relaxed flex items-center justify-between">
                      <span className="text-white/90 font-medium">{INDICATORS[ch.id].name}</span>
                      <span className="flex items-center gap-2">
                        <span className={`font-mono font-bold ${toneClass(tone)}`}>{arrows(ch.delta)}</span>
                        {ch.causes.length > 0 && (
                          <span className="text-white/40 text-[10px]"> ({ch.causes.map(c => c.text).join(', ')})</span>
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
            <section className="bg-[#091422] p-4 rounded-xl border border-white/8">
              <h4 className="flex items-center gap-2 font-['Barlow_Condensed'] font-bold text-xs uppercase tracking-wider text-blue-300 mb-2">
                <Users className="w-4 h-4" />
                REACCIÓN DE LOS ACTORES
              </h4>
              <ul className="space-y-2">
                {reactions.map(r => {
                  const icon = getActorIcon(r.actor);
                  return (
                    <li key={r.actor} className="flex items-center justify-between text-[12px] bg-white/3 p-2 rounded-lg border border-white/6">
                      <div className="flex items-center gap-2">
                        {icon && <img src={icon} alt="" className="w-5 h-5 rounded object-contain" />}
                        <span className="text-white font-medium">{r.name}</span>
                        {r.reason && <span className="text-white/50 text-[10px]">— {r.reason}</span>}
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
              <div className="rounded-xl border border-white/8 bg-[#091422] p-3.5">
                <p className="flex items-center gap-1.5 font-bold text-[10px] text-white/40 uppercase tracking-widest mb-2">
                  <Vote className="w-3.5 h-3.5 text-blue-400" /> INDICADORES POLÍTICOS
                </p>
                <div className="text-[12px] space-y-1.5 font-medium">
                  <div className="flex justify-between text-white/80"><span>Aprobación</span><Delta value={record.politicalAfter.apro - record.politicalBefore.apro} /></div>
                  <div className="flex justify-between text-white/80"><span>Intención de voto</span><Delta value={record.politicalAfter.iv - record.politicalBefore.iv} suffix="%" /></div>
                  <div className="flex justify-between text-white/80"><span>Gobernabilidad</span><Delta value={record.politicalAfter.gob - record.politicalBefore.gob} /></div>
                </div>
              </div>
              <div className="rounded-xl border border-white/8 bg-[#091422] p-3.5">
                <p className="flex items-center gap-1.5 font-bold text-[10px] text-white/40 uppercase tracking-widest mb-2">
                  <Wallet className="w-3.5 h-3.5 text-emerald-400" /> RESULTADO DE CUENTAS
                </p>
                <div className="text-[12px] space-y-1.5 font-medium">
                  <div className="flex justify-between text-white/80"><span>Resultado fiscal</span><span className={`font-mono font-bold ${record.fiscal.resultado >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>{fmtBudgetDelta(record.fiscal.resultado)}</span></div>
                  {record.fiscal.financiamiento !== 0 && (
                    <div className="flex justify-between text-white/80"><span>Financiamiento</span><span className="font-mono text-amber-300 font-bold">{fmtBudgetDelta(record.fiscal.financiamiento)}</span></div>
                  )}
                  <div className="flex justify-between text-white/80"><span>Caja final</span><span className="font-mono font-bold text-white">{fmtBudget(record.fiscal.cajaDespues)}</span></div>
                </div>
              </div>
            </section>
          )}

          {/* Eventos y relaciones */}
          <section className="bg-[#091422] p-4 rounded-xl border border-white/8">
            <h4 className="flex items-center gap-2 font-['Barlow_Condensed'] font-bold text-xs uppercase tracking-wider text-blue-300 mb-2">
              <Newspaper className="w-4 h-4" />
              NOVEDADES Y NOTICIAS
            </h4>
            {summary.events.length > 0 ? (
              <ul className="space-y-1.5">
                {summary.events.map((event, index) => (
                  <li key={index} className="flex items-start gap-2.5 text-[12px] text-white/80 leading-snug">
                    <span className="inline-block w-1.5 h-1.5 rounded-full bg-blue-400 mt-1.5 flex-shrink-0" />
                    <span>{event}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-[12px] text-white/40 font-mono">Trimestre finalizado sin contingencias graves.</p>
            )}
          </section>

          {summary.inflationEvent.triggered && (
            <div className="rounded-xl border border-red-500/40 bg-red-500/15 p-4 shadow-lg">
              <div className="flex items-center gap-2 text-red-300">
                <AlertTriangle className="w-5 h-5" />
                <p className="font-['Barlow_Condensed'] font-bold text-base uppercase tracking-wider">¡ALERTA DE INFLACIÓN ACRECENTADA!</p>
              </div>
              <p className="text-[12px] text-red-200/80 mt-1 leading-relaxed">
                La espiral de precios reduce el poder adquisitivo de los sectores populares y tensiona la recaudación del Tesoro.
              </p>
            </div>
          )}

          <div className="text-center pt-2">
            <button onClick={onClose} className="w-full bg-blue-600 hover:bg-blue-500 text-white py-3 rounded-xl font-['Barlow_Condensed'] font-bold text-base uppercase tracking-wider transition-colors shadow-lg shadow-blue-600/20">
              Continuar al Siguiente Trimestre →
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
