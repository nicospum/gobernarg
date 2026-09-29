import {
  PlayCircle,
  Users,
  Wallet,
  RefreshCw,
  ArrowRight,
  Shield,
  Activity,
  TrendingUp,
  TrendingDown,
  Minus,
  MoreHorizontal,
  ScrollText,
  NotebookPen,
  BookOpen,
  MessageSquareHeart,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { ConfirmDialog } from './ConfirmDialog';
import { GameState } from '../types/game';
import { IMAGES } from '../utils/imageAssets';
import { getValueRisk, riskColor } from '@/lib/risk';
import { fmtBudget } from '@/lib/format';
import { getScenario } from '@/data/causal';

interface GameHeaderProps {
  gameState: GameState;
  availableActions: number;
  onRestart: () => void;
  onEndTurn?: () => void;
  canEndTurn?: boolean;
  onOpenLog?: () => void;
  onOpenNotebook?: () => void;
  onOpenHelp?: () => void;
  onOpenFeedback?: () => void;
}

const POSITION_LABEL: Record<string, string> = {
  intendente: 'Intendente',
  gobernador: 'Gobernador',
  presidente: 'Presidente',
};

export const MAX_TURNS = 16;
/** Hitos del mandato marcados en la línea de tiempo (turno dentro del mandato). */
export const MILESTONES: Record<number, string> = { 8: 'Legislativas', 16: 'Fin del mandato' };

/** Tendencia de popularidad: compara el último valor histórico con el anterior. */
function popularityTrend(state: GameState): number | null {
  const hist = state.historicalPopularity;
  if (!hist || hist.length < 2) return null;
  return Math.round(hist[hist.length - 1] - hist[hist.length - 2]);
}

/** Línea de tiempo del mandato: un tramo por turno, con los hitos en oro. */
export function MandateTimeline({ turn }: { turn: number }) {
  const current = ((turn - 1) % MAX_TURNS) + 1;
  return (
    <div className="flex items-center gap-[3px]" role="img" aria-label={`Turno ${current} de ${MAX_TURNS} del mandato`}>
      {Array.from({ length: MAX_TURNS }, (_, i) => {
        const n = i + 1;
        const milestone = MILESTONES[n];
        const done = n < current;
        const now = n === current;
        return (
          <span
            key={n}
            title={milestone ? `Turno ${n}: ${milestone}` : `Turno ${n}`}
            className={`h-1.5 flex-1 min-w-[6px] rounded-[1px] ${
              now ? 'bg-ink' : done ? 'bg-ink/45' : milestone ? 'bg-gold' : 'bg-rule'
            } ${now ? 'h-2' : ''}`}
          />
        );
      })}
    </div>
  );
}

function Stat({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="leading-tight">
      <div className="text-[10px] text-ink/70 font-medium">{label}</div>
      <div className="font-mono text-[15px] font-semibold text-ink">{children}</div>
    </div>
  );
}

/**
 * Menú de la partida. "Reiniciar" vive acá, lejos de "Finalizar turno", y
 * siempre pide confirmación: antes borraba el mandato con un solo clic.
 */
function GameMenu({ governorName, turnLabel, onRestart, onOpenLog, onOpenNotebook, onOpenHelp, onOpenFeedback }: {
  governorName: string;
  turnLabel: string;
  onRestart: () => void;
  onOpenLog?: () => void;
  onOpenNotebook?: () => void;
  onOpenHelp?: () => void;
  onOpenFeedback?: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const boxRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const onPointer = (e: PointerEvent) => {
      if (!boxRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false);
        buttonRef.current?.focus();
      }
    };
    document.addEventListener('pointerdown', onPointer);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('pointerdown', onPointer);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const item = 'w-full flex items-center gap-2.5 px-3 h-11 text-left text-sm rounded-md transition-colors';
  const run = (fn?: () => void) => () => {
    setOpen(false);
    fn?.();
  };

  return (
    <div ref={boxRef} className="relative">
      <button
        ref={buttonRef}
        onClick={() => setOpen(o => !o)}
        aria-haspopup="menu"
        aria-expanded={open}
        className="flex items-center gap-1.5 text-[12px] text-ink/70 hover:text-ink transition-colors px-2.5 h-10 rounded-md hover:bg-sunken"
      >
        <MoreHorizontal size={16} />
        <span className="hidden md:inline">Menú</span>
      </button>
      {open && (
        <div role="menu" className="absolute right-0 top-full mt-1.5 w-60 rounded-lg border border-rule bg-surface shadow-xl p-1.5 z-50">
          {onOpenLog && (
            <button role="menuitem" onClick={run(onOpenLog)} className={`${item} text-ink hover:bg-sunken`}>
              <ScrollText size={15} className="text-ink/70" /> Historial de gestión
            </button>
          )}
          {onOpenNotebook && (
            <button role="menuitem" onClick={run(onOpenNotebook)} className={`${item} text-ink hover:bg-sunken`}>
              <NotebookPen size={15} className="text-ink/70" /> Cuaderno político
            </button>
          )}
          {onOpenHelp && (
            <button role="menuitem" onClick={run(onOpenHelp)} className={`${item} text-ink hover:bg-sunken`}>
              <BookOpen size={15} className="text-ink/70" /> Cómo se juega
            </button>
          )}
          {onOpenFeedback && (
            <button role="menuitem" onClick={run(onOpenFeedback)} className={`${item} text-ink hover:bg-sunken`}>
              <MessageSquareHeart size={15} className="text-ink/70" /> Contanos cómo te fue
            </button>
          )}
          <div className="my-1.5 h-px bg-rule" />
          <button role="menuitem" onClick={run(() => setConfirming(true))} className={`${item} text-red-400 hover:bg-red-950`}>
            <RefreshCw size={15} /> Reiniciar partida…
          </button>
        </div>
      )}
      {confirming && (
        <ConfirmDialog
          danger
          title="¿Reiniciar la partida?"
          message={`Perdés el mandato de ${governorName || 'tu gobernante'} (${turnLabel}). No se puede deshacer.`}
          confirmLabel="Sí, reiniciar"
          onCancel={() => setConfirming(false)}
          onConfirm={() => {
            setConfirming(false);
            onRestart();
          }}
        />
      )}
    </div>
  );
}

export function GameHeader({
  gameState,
  availableActions,
  onRestart,
  onEndTurn,
  canEndTurn,
  onOpenLog,
  onOpenNotebook,
  onOpenHelp,
  onOpenFeedback,
}: GameHeaderProps) {
  const popularityRisk = getValueRisk(gameState.popularity, 80);
  const stabilityRisk = getValueRisk(gameState.stability, 100);
  const absoluteTurn = (gameState.year - 1) * 4 + gameState.turn;
  const positionLabel = POSITION_LABEL[gameState.position] ?? gameState.position;
  const popTrend = popularityTrend(gameState);
  const scenarioDef = getScenario(gameState.causal?.scenarioId);
  const inMandate = ((absoluteTurn - 1) % MAX_TURNS) + 1;
  const nextMilestone = Object.keys(MILESTONES).map(Number).find(t => t >= inMandate);

  return (
    <header className="sticky top-0 z-50 bg-surface/95 backdrop-blur border-b border-rule">
      <div className="max-w-[1680px] mx-auto flex items-center gap-5 px-4 md:px-6 h-16">
        {/* Logo y marca */}
        <div className="flex items-center gap-2.5 flex-none">
          <img src={IMAGES.logo.primary} alt="GobernArg" className="h-9 w-auto object-contain mix-blend-multiply" />
          <div className="font-display text-xl font-semibold text-ink hidden sm:block">
            Gobern<span className="text-gold-ink">arg</span>
          </div>
        </div>

        {/* Gobernante y cargo */}
        <div className="flex items-center gap-2.5 flex-none pl-5 border-l border-rule">
          {gameState.avatar ? (
            <img
              src={gameState.avatar}
              alt={gameState.governorName}
              className="w-9 h-9 rounded-full object-cover ring-2 ring-gold/60"
            />
          ) : (
            <div className="w-9 h-9 rounded-full bg-ink text-paper flex items-center justify-center font-display font-semibold text-sm">
              {gameState.governorName ? gameState.governorName[0] : 'G'}
            </div>
          )}
          <div className="leading-tight">
            <div className="font-display text-[15px] font-semibold text-ink truncate max-w-[160px]">
              {gameState.governorName || '—'}
            </div>
            <div className="text-[11px] text-ink/70">
              {positionLabel}
              {scenarioDef && <span title={`Escenario: ${scenarioDef.name}`}> · {scenarioDef.name}</span>}
            </div>
          </div>
        </div>

        {/* Mandato: turno y línea de tiempo */}
        <div className="hidden md:block flex-1 min-w-[180px] max-w-[420px] pl-5 border-l border-rule">
          <div className="flex items-baseline justify-between gap-3 mb-1.5 text-[11px]">
            <span className="text-ink/70">
              <span className="font-semibold text-ink">Turno <span className="font-mono">{absoluteTurn}</span></span>
              <span className="text-ink/70">/{MAX_TURNS}</span> · Año {gameState.year} · T{gameState.turn}
            </span>
            {nextMilestone && (
              <span className="text-gold-ink font-medium whitespace-nowrap">
                {MILESTONES[nextMilestone]}{nextMilestone > inMandate ? ` en ${nextMilestone - inMandate}t` : ' este turno'}
              </span>
            )}
          </div>
          <MandateTimeline turn={absoluteTurn} />
        </div>

        <div className="flex-1 md:hidden" />

        {/* Recursos del turno e indicadores rápidos */}
        <div className="flex items-center gap-5 flex-none">
          <div className="flex items-center gap-2" title="Acciones disponibles este turno">
            <PlayCircle size={15} className="text-ink/70" />
            <Stat label="Acciones">{availableActions}</Stat>
          </div>
          <div className="flex items-center gap-2" title="Caja del Tesoro">
            <Wallet size={15} className="text-ink/70" />
            <Stat label="Caja">{fmtBudget(gameState.budget)}</Stat>
          </div>
          <div className="hidden lg:flex items-center gap-2">
            <Activity size={15} className="text-ink/70" />
            <div className="leading-tight">
              <div className="text-[10px] text-ink/70 font-medium">Aprobación</div>
              <div className="flex items-baseline gap-1.5">
                <span className={`font-mono text-[15px] font-semibold ${riskColor(popularityRisk)}`}>
                  {Math.round(gameState.causal?.political.apro ?? gameState.popularity)}%
                </span>
                {popTrend !== null && (
                  <span
                    className={`inline-flex items-center gap-0.5 font-mono text-[11px] ${
                      popTrend > 0 ? 'text-emerald-400' : popTrend < 0 ? 'text-red-400' : 'text-ink/70'
                    }`}
                  >
                    {popTrend > 0 ? <TrendingUp size={11} /> : popTrend < 0 ? <TrendingDown size={11} /> : <Minus size={11} />}
                    {popTrend !== 0 ? `${popTrend > 0 ? '+' : ''}${popTrend}` : '0'}
                  </span>
                )}
              </div>
            </div>
          </div>
          <div className="hidden xl:flex items-center gap-2">
            <Shield size={15} className="text-ink/70" />
            <div className="leading-tight">
              <div className="text-[10px] text-ink/70 font-medium">Gobernabilidad</div>
              <div className={`font-mono text-[15px] font-semibold ${riskColor(stabilityRisk)}`}>
                {Math.round(gameState.causal?.political.gob ?? gameState.stability)}
              </div>
            </div>
          </div>
        </div>

        {/* Controles */}
        <div className="flex items-center gap-2 flex-none pl-5 border-l border-rule">
          <GameMenu
            governorName={gameState.governorName}
            turnLabel={`turno ${inMandate} de ${MAX_TURNS}`}
            onRestart={onRestart}
            onOpenLog={onOpenLog}
            onOpenNotebook={onOpenNotebook}
            onOpenHelp={onOpenHelp}
            onOpenFeedback={onOpenFeedback}
          />

          {onEndTurn && (
            <button
              onClick={e => {
                // Sin foco en el botón, un Enter posterior no cierra otro turno.
                e.currentTarget.blur();
                onEndTurn();
              }}
              disabled={!canEndTurn}
              data-no-restore-focus
              className={`flex items-center gap-2 px-4 py-2.5 rounded-md text-[13px] font-semibold transition-all ${
                canEndTurn
                  ? 'bg-ink hover:bg-ink/90 text-paper shadow-sm active:translate-y-px'
                  : 'bg-sunken text-ink/70 cursor-not-allowed'
              }`}
            >
              Finalizar turno
              <ArrowRight size={14} className={canEndTurn ? 'text-gold' : ''} />
            </button>
          )}
        </div>
      </div>
    </header>
  );
}

// Re-export del icono Users por compat
export { Users };
