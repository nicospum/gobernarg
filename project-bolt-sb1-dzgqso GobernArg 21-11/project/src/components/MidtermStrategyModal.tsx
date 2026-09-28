import { AlertTriangle, Zap, Handshake, Users, Flame } from 'lucide-react';
import { GameState, MidtermStrategy } from '../types/game';
import { MIDTERM_STRATEGY_EFFECTS, MIDTERM_CAUSAL } from '../data/midtermStrategies';
import { useDialog } from '@/lib/useDialog';
import { LEGISLATIVE_IMAGE } from '../engine/eventResolver';
import { fmtPct } from '@/lib/format';

interface MidtermStrategyModalProps {
  availableStrategies: MidtermStrategy[];
  gameState: GameState;
  onSelect: (strategy: MidtermStrategy) => void;
}

const STRATEGY_INFO: Record<
  MidtermStrategy,
  {
    name: string;
    icon: typeof Zap;
    accent: string;
    riskLabel: string;
    riskBadge: string;
  }
> = {
  acelerar: {
    name: 'Acelerar',
    icon: Zap,
    accent: 'border-amber-400/40 bg-amber-400/5 hover:bg-amber-400/10 hover:border-amber-400/60',
    riskLabel: 'Riesgo Alto',
    riskBadge: 'text-amber-300 bg-amber-400/15 border-amber-400/30',
  },
  negociar: {
    name: 'Negociar',
    icon: Handshake,
    accent: 'border-sky-400/40 bg-sky-400/5 hover:bg-sky-400/10 hover:border-sky-400/60',
    riskLabel: 'Riesgo Bajo',
    riskBadge: 'text-sky-300 bg-sky-400/15 border-sky-400/30',
  },
  abrirse: {
    name: 'Abrirse',
    icon: Users,
    accent: 'border-emerald-400/40 bg-emerald-400/5 hover:bg-emerald-400/10 hover:border-emerald-400/60',
    riskLabel: 'Riesgo Medio',
    riskBadge: 'text-emerald-300 bg-emerald-400/15 border-emerald-400/30',
  },
  jugada_audaz: {
    name: 'Jugada Audaz',
    icon: Flame,
    accent: 'border-red-400/40 bg-red-400/5 hover:bg-red-400/10 hover:border-red-400/60',
    riskLabel: 'Riesgo Extremo',
    riskBadge: 'text-red-300 bg-red-400/15 border-red-400/30',
  },
};

const STRATEGY_ICON_COLOR: Record<MidtermStrategy, string> = {
  acelerar: 'text-amber-400',
  negociar: 'text-sky-400',
  abrirse: 'text-emerald-400',
  jugada_audaz: 'text-red-400',
};

export function MidtermStrategyModal({
  availableStrategies,
  gameState,
  onSelect,
}: MidtermStrategyModalProps) {
  const dialogRef = useDialog<HTMLDivElement>();
  const results = gameState.legislativeResults;
  const outcome = results?.outcome ?? 'tie';
  const imageChange = LEGISLATIVE_IMAGE[outcome];

  const outcomeTitles: Record<string, string> = {
    landslide: 'Ganaste por paliza',
    clear: 'Ganaste las legislativas',
    tie: 'Empate técnico',
    minority: 'Quedaste en minoría',
    defeat: 'Perdiste las legislativas',
  };

  const outcomeLabels: Record<string, string> = {
    landslide: 'Ganaste por paliza. Tenés capital político de sobra.',
    clear: 'Ganaste claramente. Tenés margen para maniobrar.',
    tie: 'Empate técnico. La paridad te obliga a ser cuidadoso.',
    minority: 'Minoría legislativa. Tu margen es estrecho.',
    defeat: 'Derrota legislativa. Necesitás reconstruir desde la negociación.',
  };

  return (
    <div ref={dialogRef} className="outline-none fixed inset-0 bg-ink/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-card border border-border rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 md:p-8">
          <div className="text-center mb-6">
            <div className="text-[11px] uppercase tracking-widest text-gold-ink font-semibold mb-1">
              Elecciones legislativas de medio término
            </div>
            <h2 className="font-display text-2xl md:text-3xl font-semibold text-foreground mb-3">
              {outcomeTitles[outcome] ?? 'Resultado de las legislativas'}
            </h2>
            {results && (
              <div className="grid grid-cols-3 gap-2 max-w-md mx-auto mb-3">
                <div className="rounded-lg bg-sunken px-2 py-2.5">
                  <div className="font-display text-2xl font-semibold text-ink">{fmtPct(results.officialismVotes, 1)}</div>
                  <div className="text-[11px] text-ink/70">de los votos</div>
                </div>
                <div className="rounded-lg bg-sunken px-2 py-2.5">
                  <div className="font-display text-2xl font-semibold text-ink">{fmtPct(results.legislativeSupport)}</div>
                  <div className="text-[11px] text-ink/70">de las bancas, con aliados</div>
                </div>
                <div className="rounded-lg bg-sunken px-2 py-2.5">
                  <div className={`font-display text-2xl font-semibold ${imageChange > 0 ? 'text-emerald-400' : imageChange < 0 ? 'text-red-400' : 'text-ink'}`}>
                    {imageChange > 0 ? '+' : ''}{imageChange}
                  </div>
                  <div className="text-[11px] text-ink/70">tu imagen</div>
                </div>
              </div>
            )}
            <p className="text-foreground/80 text-sm max-w-lg mx-auto">
              {outcomeLabels[outcome] ?? 'Los resultados electorales redefinen tu margen de acción.'}
            </p>
          </div>

          <h3 className="font-display text-lg font-semibold text-ink mb-3">
            ¿Cómo encarás la segunda mitad del mandato?
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-5">
            {(Object.keys(STRATEGY_INFO) as MidtermStrategy[]).map((strategy) => {
              const info = STRATEGY_INFO[strategy];
              const effect = MIDTERM_STRATEGY_EFFECTS[strategy];
              const isAvailable = availableStrategies.includes(strategy);
              const Icon = info.icon;

              return (
                <button
                  key={strategy}
                  onClick={() => isAvailable && onSelect(strategy)}
                  disabled={!isAvailable}
                  className={`border rounded-xl p-4 text-left transition-all ${
                    isAvailable
                      ? `${info.accent} cursor-pointer active:scale-[0.98]`
                      : 'border-border bg-ink/3 cursor-not-allowed opacity-50'
                  }`}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 rounded-lg bg-ink/5 border border-border">
                      <Icon className={`w-5 h-5 ${STRATEGY_ICON_COLOR[strategy]}`} />
                    </div>
                    <div>
                      <h3 className="font-display font-semibold text-lg text-foreground   leading-none">
                        {info.name}
                      </h3>
                      <span
                        className={`inline-block px-2 py-0.5 mt-1 rounded text-[9px] font-semibold border uppercase tracking-wide ${info.riskBadge}`}
                      >
                        {info.riskLabel}
                      </span>
                    </div>
                  </div>

                  <p className="text-[12px] text-foreground/70 mb-3 leading-relaxed">
                    {effect.description}
                  </p>

                  <ul className="space-y-1 text-[11px]">
                    {MIDTERM_CAUSAL[strategy].bullets.map(b => (
                      <li key={b} className="flex items-start gap-1.5 text-foreground/80">
                        <span className="w-1 h-1 rounded-full bg-primary mt-1.5 flex-shrink-0" />
                        {b}
                      </li>
                    ))}
                  </ul>
                  {!isAvailable && (
                    <div className="mt-3 flex items-center gap-1 text-[10px] text-muted-foreground">
                      <AlertTriangle className="w-3 h-3" />
                      No disponible en este contexto
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          <p className="text-[11px] text-muted-foreground text-center italic">
            Esta decisión definirá tu margen de maniobra para el resto del mandato.
            {availableStrategies.length === 1 &&
              ' Solo tenés una opción viable en este contexto político.'}
          </p>
        </div>
      </div>
    </div>
  );
}
