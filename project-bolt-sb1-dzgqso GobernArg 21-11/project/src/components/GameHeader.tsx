import {
  PlayCircle,
  Users,
  Wallet,
  Clock,
  RefreshCw,
  ArrowRight,
  Shield,
  Activity,
  TrendingUp,
  TrendingDown,
  Minus,
} from 'lucide-react';
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
}

const POSITION_LABEL: Record<string, string> = {
  intendente: 'Intendente',
  gobernador: 'Gobernador',
  presidente: 'Presidente',
};

const MAX_TURNS = 16;

/** Tendencia de popularidad: compara el último valor histórico con el anterior. */
function popularityTrend(state: GameState): number | null {
  const hist = state.historicalPopularity;
  if (!hist || hist.length < 2) return null;
  return Math.round(hist[hist.length - 1] - hist[hist.length - 2]);
}

export function GameHeader({
  gameState,
  availableActions,
  onRestart,
  onEndTurn,
  canEndTurn,
}: GameHeaderProps) {
  const popularityRisk = getValueRisk(gameState.popularity, 80);
  const stabilityRisk = getValueRisk(gameState.stability, 100);
  const absoluteTurn = (gameState.year - 1) * 4 + gameState.turn;
  const positionLabel = POSITION_LABEL[gameState.position] ?? gameState.position;
  const popTrend = popularityTrend(gameState);

  return (
    <header className="h-14 flex-none flex items-center px-4 md:px-6 gap-4 bg-[#091422] border-b border-white/8 sticky top-0 z-50">
      {/* Logo */}
      <div className="flex items-center gap-2.5 flex-none">
        <img
          src={IMAGES.logo.primary}
          alt="GobernArg"
          className="h-8 w-auto object-contain"
        />
        <div className="font-['Barlow_Condensed'] text-xl font-bold tracking-wider text-white hidden sm:block">
          GOBERN<span className="text-blue-400">ARG</span>
        </div>
      </div>

      <Separator />

      {/* Gobernante + Cargo */}
      <div className="flex items-center gap-2.5 flex-none">
        {gameState.avatar ? (
          <img
            src={gameState.avatar}
            alt={gameState.governorName}
            className="w-8 h-8 rounded-full object-cover border border-white/12 shadow-sm"
          />
        ) : (
          <div className="w-8 h-8 rounded-full bg-blue-500/20 border border-blue-400/30 flex items-center justify-center font-bold text-blue-400 text-xs">
            {gameState.governorName ? gameState.governorName[0] : 'G'}
          </div>
        )}
        <div className="leading-tight">
          <div className="text-[9px] text-white/40 uppercase tracking-widest font-semibold">
            {positionLabel}
          </div>
          <div className="text-[12px] font-bold text-white truncate max-w-[120px]">
            {gameState.governorName || '—'}
          </div>
        </div>
      </div>

      <Separator />

      {/* Turno / Año / Trimestre */}
      <div className="flex items-center gap-2 flex-none">
        <Clock size={13} className="text-white/40" />
        <div className="leading-tight">
          <div className="text-[9px] text-white/40 uppercase tracking-widest font-semibold">Turno</div>
          <div className="font-mono text-[13px] font-bold text-white">
            {absoluteTurn}<span className="text-white/40 font-normal">/{MAX_TURNS}</span>
          </div>
        </div>
<<<<<<< HEAD
        <div className="hidden lg:block text-[10px] font-mono text-white/50 bg-white/4 px-2 py-0.5 rounded border border-white/6 ml-1">
          Año {gameState.year} · T{gameState.turn}
=======
        <div className="w-px h-6 bg-border" />
        <div className="leading-tight">
          <div className="text-[9px] text-muted-foreground uppercase tracking-widest">Trimestre</div>
          <div className="font-mono text-[14px] font-bold text-accent leading-none">
            {gameState.turn}
          </div>
        </div>
        <div className="w-16 hidden md:block">
          <div className="h-1 w-full overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full rounded-full bg-primary transition-all duration-300"
              style={{ width: `${Math.min(100, (absoluteTurn / MAX_TURNS) * 100)}%` }}
            />
          </div>
          <div className="text-[9px] text-muted-foreground mt-0.5" title={`Escenario: ${getScenario(gameState.causal?.scenarioId).name}`}>
            Mandato {gameState.term} · Turno {absoluteTurn}/{MAX_TURNS}
          </div>
>>>>>>> origin/motor-causal
        </div>
      </div>

      <Separator />

      {/* Acciones Disponibles */}
      <div className="flex items-center gap-2 flex-none bg-blue-500/10 border border-blue-500/20 px-2.5 py-1 rounded-md">
        <PlayCircle size={13} className="text-blue-400" />
        <div className="leading-tight">
          <div className="text-[8px] text-blue-300/70 uppercase tracking-widest font-bold">Acciones</div>
          <div className="font-mono text-[13px] font-bold text-blue-300 leading-none">{availableActions}</div>
        </div>
      </div>

      <Separator />

      {/* Presupuesto */}
      <div className="flex items-center gap-2 flex-none bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-md">
        <Wallet size={13} className="text-emerald-400" />
        <div className="leading-tight">
          <div className="text-[8px] text-emerald-300/70 uppercase tracking-widest font-bold">Presup.</div>
          <div className="font-mono text-[13px] font-bold text-emerald-300 leading-none">
            {fmtBudget(gameState.budget)}
          </div>
        </div>
      </div>

      <Separator className="hidden lg:block" />

      {/* Popularidad rápida */}
      <div className="hidden lg:flex items-center gap-2 flex-none">
        <Activity size={13} className="text-white/40" />
        <div className="leading-tight">
          <div className="text-[9px] text-white/40 uppercase tracking-widest font-semibold">Popular.</div>
          <div className={`font-mono text-[12px] font-bold ${riskColor(popularityRisk)}`}>
            {Math.round(gameState.causal?.political.apro ?? gameState.popularity)}%
          </div>
        </div>
        {popTrend !== null && (
          <span
            className={`inline-flex items-center gap-0.5 font-mono text-[10px] ${
              popTrend > 0 ? 'text-emerald-400' : popTrend < 0 ? 'text-red-400' : 'text-white/40'
            }`}
          >
            {popTrend > 0 ? <TrendingUp size={10} /> : popTrend < 0 ? <TrendingDown size={10} /> : <Minus size={10} />}
            {popTrend !== 0 ? `${popTrend > 0 ? '+' : ''}${popTrend}` : '0'}
          </span>
        )}
      </div>

      <Separator className="hidden xl:block" />

      {/* Estabilidad rápida */}
      <div className="hidden xl:flex items-center gap-2 flex-none">
        <Shield size={13} className="text-white/40" />
        <div className="leading-tight">
          <div className="text-[9px] text-white/40 uppercase tracking-widest font-semibold">Estabil.</div>
          <div className={`font-mono text-[12px] font-bold ${riskColor(stabilityRisk)}`}>
            {Math.round(gameState.causal?.political.gob ?? gameState.stability)}
          </div>
        </div>
      </div>

      <div className="flex-1 min-w-0" />

      {/* Botones de acción Header */}
      <button
        onClick={onRestart}
        title="Reiniciar juego"
        className="flex items-center gap-1.5 text-[11px] text-white/50 hover:text-white transition-colors px-2.5 py-1.5 rounded border border-white/8 hover:bg-white/5"
      >
        <RefreshCw size={12} />
        <span className="hidden md:inline">Reiniciar</span>
      </button>

      {onEndTurn && (
        <button
          onClick={onEndTurn}
          disabled={!canEndTurn}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-['Barlow_Condensed'] text-[13px] font-bold uppercase tracking-wider transition-all shadow-lg ${
            canEndTurn
              ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-600/20 active:translate-y-0.5'
              : 'bg-white/5 text-white/30 cursor-not-allowed border border-white/8'
          }`}
        >
          Finalizar Turno
          <ArrowRight size={14} />
        </button>
      )}
    </header>
  );
}

function Separator({ className = '' }: { className?: string }) {
  return <div className={`w-px h-6 bg-white/8 ${className}`} />;
}

// Re-export del icono Users por compat (no se usa en este componente pero alguien podría importarlo)
export { Users };
