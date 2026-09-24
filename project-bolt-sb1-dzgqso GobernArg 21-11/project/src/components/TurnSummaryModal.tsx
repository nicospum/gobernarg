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
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.2 }}
        className="bg-card border border-border rounded-xl w-full max-w-2xl max-h-[92vh] overflow-y-auto shadow-2xl"
      >
        {/* Header visual */}
        <div className="relative h-32 md:h-40">
          <img src={headerImage} alt="Resumen del trimestre" loading="lazy" decoding="async" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-card via-card/70 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-4 flex items-end justify-between gap-4">
            <div>
              <h2 className="font-display text-2xl font-bold uppercase tracking-wide">Resumen del Trimestre</h2>
              <p className="flex items-center gap-1.5 text-foreground/80 text-sm mt-0.5">
                <CalendarDays className="w-3.5 h-3.5" />
                Año {summary.year} · Trimestre {summary.quarter}
              </p>
            </div>
            <button onClick={onClose} aria-label="Cerrar resumen" className="p-1 text-muted-foreground hover:text-foreground rounded transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-5">
          {/* Decisiones */}
          {record && (
            <section>
              <h4 className="flex items-center gap-1.5 font-display font-bold text-[12px] uppercase tracking-widest text-muted-foreground mb-2">
                <ListChecks className="w-3.5 h-3.5" />
                Lo que decidiste
              </h4>
              {record.actions.length === 0 ? (
                <p className="text-[12px] text-muted-foreground">No ejecutaste políticas este trimestre.</p>
              ) : (
                <div className="flex flex-wrap gap-1.5">
                  {record.actions.map((a, i) => (
                    <span key={i} className={`text-[11px] px-2 py-0.5 rounded border ${a.suspended ? 'border-red-400/30 text-red-300 line-through' : a.forced ? 'border-amber-400/30 text-amber-300' : 'border-border text-foreground/80 bg-white/3'}`}>
                      {CAUSAL_ACTIONS_BY_ID[a.actionId]?.name ?? a.actionId}{a.forced ? ' (forzada)' : ''}
                    </span>
                  ))}
                </div>
              )}
            </section>
          )}

          {/* País */}
          {changes.length > 0 && (
            <section>
              <h4 className="flex items-center gap-1.5 font-display font-bold text-[12px] uppercase tracking-widest text-muted-foreground mb-2">
                <Globe2 className="w-3.5 h-3.5" />
                Cómo cambió el país
              </h4>
              <ul className="space-y-1.5">
                {changes.map(ch => {
                  const tone = toneOf(ch.id, ch.delta);
                  return (
                    <li key={ch.id} className="text-[12px] leading-snug">
                      <span className="text-foreground/90 font-medium">{INDICATORS[ch.id].name}</span>{' '}
                      <span className={`font-mono ${toneClass(tone)}`}>{arrows(ch.delta)}</span>
                      {ch.causes.length > 0 && (
                        <span className="text-muted-foreground"> — por {ch.causes.map(c => c.text).join(' y ')}</span>
                      )}
                    </li>
                  );
                })}
              </ul>
            </section>
          )}

          {/* Actores */}
          {reactions.length > 0 && (
            <section>
              <h4 className="flex items-center gap-1.5 font-display font-bold text-[12px] uppercase tracking-widest text-muted-foreground mb-2">
                <Users className="w-3.5 h-3.5" />
                Cómo reaccionaron
              </h4>
              <ul className="space-y-1.5">
                {reactions.map(r => {
                  const icon = getActorIcon(r.actor);
                  return (
                    <li key={r.actor} className="flex items-center gap-2 text-[12px]">
                      {icon && <img src={icon} alt="" className="w-5 h-5 rounded object-contain" />}
                      <span className="text-foreground/90 font-medium">{r.name}</span>
                      <span className={`font-mono ${r.delta > 0 ? 'text-emerald-400' : 'text-red-400'}`}>{arrows(r.delta)}</span>
                      {r.reason && <span className="text-muted-foreground">por {r.reason}</span>}
                    </li>
                  );
                })}
              </ul>
            </section>
          )}

          {/* Política y cuentas */}
          {record && (
            <section className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="rounded-lg border border-border bg-white/3 p-3">
                <p className="flex items-center gap-1.5 font-medium text-[11px] text-muted-foreground uppercase tracking-wide mb-1.5">
                  <Vote className="w-3.5 h-3.5" /> Política
                </p>
                <div className="text-[12px] space-y-0.5">
                  <div className="flex justify-between"><span>Aprobación</span><Delta value={record.politicalAfter.apro - record.politicalBefore.apro} /></div>
                  <div className="flex justify-between"><span>Intención de voto</span><Delta value={record.politicalAfter.iv - record.politicalBefore.iv} suffix="%" /></div>
                  <div className="flex justify-between"><span>Gobernabilidad</span><Delta value={record.politicalAfter.gob - record.politicalBefore.gob} /></div>
                </div>
              </div>
              <div className="rounded-lg border border-border bg-white/3 p-3">
                <p className="flex items-center gap-1.5 font-medium text-[11px] text-muted-foreground uppercase tracking-wide mb-1.5">
                  <Wallet className="w-3.5 h-3.5" /> Cuentas
                </p>
                <div className="text-[12px] space-y-0.5">
                  <div className="flex justify-between"><span>Resultado fiscal</span><span className={`font-mono font-bold ${record.fiscal.resultado >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>{fmtBudgetDelta(record.fiscal.resultado)}</span></div>
                  {record.fiscal.financiamiento !== 0 && (
                    <div className="flex justify-between"><span>Financiamiento</span><span className="font-mono text-amber-300">{fmtBudgetDelta(record.fiscal.financiamiento)}</span></div>
                  )}
                  <div className="flex justify-between"><span>Caja</span><span className="font-mono text-foreground">{fmtBudget(record.fiscal.cajaDespues)}</span></div>
                </div>
              </div>
            </section>
          )}

          {!record && (
            <section className="grid grid-cols-2 gap-3">
              <div className="flex items-center gap-3 rounded-lg border border-border bg-white/3 p-3">
                {summary.popularityChange >= 0 ? <TrendingUp className="w-5 h-5 text-emerald-400" /> : <TrendingDown className="w-5 h-5 text-red-400" />}
                <div><p className="text-[12px] text-muted-foreground">Aprobación</p><Delta value={summary.popularityChange} /></div>
              </div>
              <div className="flex items-center gap-3 rounded-lg border border-border bg-white/3 p-3">
                <Wallet className="w-5 h-5" />
                <div><p className="text-[12px] text-muted-foreground">Caja</p><span className="font-mono">{fmtBudgetDelta(summary.budgetChange)}</span></div>
              </div>
            </section>
          )}

          {/* Eventos y relaciones */}
          <section>
            <h4 className="flex items-center gap-1.5 font-display font-bold text-[12px] uppercase tracking-widest text-muted-foreground mb-2">
              <Newspaper className="w-3.5 h-3.5" />
              Noticias del trimestre
            </h4>
            {summary.events.length > 0 ? (
              <ul className="space-y-1.5">
                {summary.events.map((event, index) => (
                  <li key={index} className="flex items-start gap-2.5 text-[12px] text-foreground/80 leading-snug">
                    <span className="inline-block w-1.5 h-1.5 rounded-full bg-primary mt-1.5 flex-shrink-0" />
                    <span>{event}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-[12px] text-muted-foreground">Un trimestre sin sobresaltos.</p>
            )}
          </section>

          {summary.inflationEvent.triggered && (
            <div className="rounded-lg border border-red-400/30 bg-red-400/5 p-3">
              <div className="flex items-center gap-2 text-red-300">
                <AlertTriangle className="w-4 h-4" />
                <p className="font-display font-bold text-[12px] uppercase tracking-wide">¡Advertencia de Inflación!</p>
              </div>
              <p className="text-[12px] text-red-300/80 mt-1">
                Los precios están fuera de control: se comen los salarios, el crédito y la recaudación.
              </p>
            </div>
          )}

          <div className="text-center pt-1">
            <button onClick={onClose} className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-2.5 rounded font-display font-bold text-sm uppercase tracking-wide transition-colors">
              Continuar
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
