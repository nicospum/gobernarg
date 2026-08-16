import {
  X,
  TrendingUp,
  TrendingDown,
  Wallet,
  AlertTriangle,
  Zap,
  Newspaper,
  CalendarDays,
} from 'lucide-react';
import { TurnSummary } from '../types/game';
import { IMAGES } from '../utils/imageAssets';
import { fmtBudgetDelta } from '@/lib/format';

interface TurnSummaryModalProps {
  summary: TurnSummary;
  onClose: () => void;
}

export function TurnSummaryModal({ summary, onClose }: TurnSummaryModalProps) {
  const headerImage = summary.inflationEvent.triggered
    ? IMAGES.events.economicCrisis
    : IMAGES.ui.shieldEmblem;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-card border border-border rounded-xl w-full max-w-2xl overflow-hidden shadow-2xl">
        {/* Header visual */}
        <div className="relative h-36 md:h-44">
          <img
            src={headerImage}
            alt="Resumen del trimestre"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-card via-card/70 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-4 flex items-end justify-between gap-4">
            <div>
              <h2 className="font-display text-2xl font-bold uppercase tracking-wide">
                Resumen del Trimestre
              </h2>
              <p className="flex items-center gap-1.5 text-foreground/80 text-sm mt-0.5">
                <CalendarDays className="w-3.5 h-3.5" />
                Año {summary.year} · Trimestre {summary.quarter}
              </p>
            </div>
            <button
              onClick={onClose}
              aria-label="Cerrar resumen"
              className="p-1 text-muted-foreground hover:text-foreground rounded transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-6">
          {/* Efectos Inmediatos */}
          <section>
            <h4 className="flex items-center gap-1.5 font-display font-bold text-[12px] uppercase tracking-widest text-muted-foreground mb-3">
              <Zap className="w-3.5 h-3.5" />
              Efectos Inmediatos
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div
                className={`flex items-center gap-3 rounded-lg border border-border bg-white/3 p-3 ${
                  summary.popularityChange >= 0 ? 'text-emerald-400' : 'text-red-400'
                }`}
              >
                {summary.popularityChange >= 0 ? (
                  <TrendingUp className="w-5 h-5" />
                ) : (
                  <TrendingDown className="w-5 h-5" />
                )}
                <div>
                  <p className="font-medium text-[12px] text-muted-foreground">Popularidad</p>
                  <p className="font-mono text-lg font-bold text-foreground">
                    {summary.popularityChange >= 0 ? '+' : ''}
                    {summary.popularityChange}%
                  </p>
                </div>
              </div>

              <div
                className={`flex items-center gap-3 rounded-lg border border-border bg-white/3 p-3 ${
                  summary.budgetChange >= 0 ? 'text-emerald-400' : 'text-red-400'
                }`}
              >
                <Wallet className="w-5 h-5" />
                <div>
                  <p className="font-medium text-[12px] text-muted-foreground">Presupuesto</p>
                  <p className="font-mono text-lg font-bold text-foreground">
                    {fmtBudgetDelta(summary.budgetChange)}
                  </p>
                </div>
              </div>
            </div>
          </section>

          <DiarySeparator />

          {/* Eventos */}
          <section>
            <h4 className="flex items-center gap-1.5 font-display font-bold text-[12px] uppercase tracking-widest text-muted-foreground mb-2.5">
              <Newspaper className="w-3.5 h-3.5" />
              Eventos del Turno
            </h4>
            {summary.events.length > 0 ? (
              <ul className="space-y-2">
                {summary.events.map((event, index) => (
                  <li
                    key={index}
                    className="flex items-start gap-2.5 text-[13px] text-foreground/80 leading-snug"
                  >
                    <span className="inline-block w-1.5 h-1.5 rounded-full bg-primary mt-1.5 flex-shrink-0" />
                    <span>{event}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-[12px] text-muted-foreground">Sin eventos destacados.</p>
            )}
          </section>

          {/* Alerta de Inflación */}
          {summary.inflationEvent.triggered && (
            <>
              <DiarySeparator />
              <div className="rounded-lg border border-red-400/30 bg-red-400/5 p-3">
                <div className="flex items-center gap-2 text-red-300">
                  <AlertTriangle className="w-4 h-4" />
                  <p className="font-display font-bold text-[12px] uppercase tracking-wide">
                    ¡Advertencia de Inflación!
                  </p>
                </div>
                <p className="text-[12px] text-red-300/80 mt-1">
                  La emisión monetaria excesiva está generando presiones inflacionarias.
                </p>
              </div>
            </>
          )}

          <DiarySeparator />

          <div className="text-center">
            <button
              onClick={onClose}
              className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-2.5 rounded font-display font-bold text-sm uppercase tracking-wide transition-colors"
            >
              Continuar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function DiarySeparator() {
  return <hr className="border-border my-5" />;
}
