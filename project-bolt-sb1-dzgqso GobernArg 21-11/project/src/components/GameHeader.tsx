import {
  PlayCircle,
  Users,
  Wallet,
  Clock,
  RefreshCw,
  ArrowRight,
  Shield,
  Activity,
} from 'lucide-react';
import { GameState } from '../types/game';
import { IMAGES } from '../utils/imageAssets';
import { getValueRisk, riskColor } from '@/lib/risk';
import { fmtBudget } from '@/lib/format';

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

export function GameHeader({
  gameState,
  availableActions,
  onRestart,
  onEndTurn,
  canEndTurn,
}: GameHeaderProps) {
  const popularityRisk = getValueRisk(gameState.popularity, 100);
  const stabilityRisk = getValueRisk(gameState.stability, 100);
  const absoluteTurn = (gameState.year - 1) * 4 + gameState.turn;
  const positionLabel = POSITION_LABEL[gameState.position] ?? gameState.position;

  return (
    <header className="h-14 flex-none flex items-center px-4 gap-4 bg-card border-b border-border sticky top-0 z-50">
      {/* Logo */}
      <div className="flex items-center gap-2 flex-none">
        <img
          src={IMAGES.logo.primary}
          alt="GobernArg"
          className="h-8 w-auto"
        />
        <div className="font-display text-lg font-bold tracking-wider hidden sm:block">
          GOBERN<span className="text-accent">ARG</span>
        </div>
      </div>

      <Separator />

      {/* Cargo + jugador */}
      <div className="flex items-center gap-2 flex-none">
        {gameState.avatar && (
          <img
            src={gameState.avatar}
            alt={gameState.governorName}
            className="w-8 h-8 rounded-full object-cover border border-border"
          />
        )}
        <div className="leading-tight">
          <div className="text-[9px] text-muted-foreground uppercase tracking-widest">
            {positionLabel}
          </div>
          <div className="text-[12px] font-semibold text-foreground truncate max-w-[120px]">
            {gameState.governorName || '—'}
          </div>
        </div>
      </div>

      <Separator />

      {/* Turno + barra mini */}
      <div className="flex items-center gap-2 flex-none">
        <Clock size={13} className="text-muted-foreground" />
        <div className="leading-tight">
          <div className="text-[9px] text-muted-foreground uppercase tracking-widest">Turno</div>
          <div className="font-mono text-[12px] font-bold text-foreground">
            {absoluteTurn}
            <span className="text-muted-foreground">/{MAX_TURNS}</span>
          </div>
        </div>
        <div className="w-16 hidden md:block">
          <div className="h-1 w-full overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full rounded-full bg-primary transition-all duration-300"
              style={{ width: `${Math.min(100, (absoluteTurn / MAX_TURNS) * 100)}%` }}
            />
          </div>
          <div className="text-[9px] text-muted-foreground mt-0.5">
            Año {gameState.year} · T{gameState.turn}
          </div>
        </div>
      </div>

      <Separator />

      {/* Acciones */}
      <div className="flex items-center gap-2 flex-none">
        <PlayCircle size={13} className="text-muted-foreground" />
        <div className="leading-tight">
          <div className="text-[9px] text-muted-foreground uppercase tracking-widest">Acciones</div>
          <div className="font-mono text-[12px] font-bold text-foreground">{availableActions}</div>
        </div>
      </div>

      <Separator />

      {/* Presupuesto */}
      <div className="flex items-center gap-2 flex-none">
        <Wallet size={13} className="text-muted-foreground" />
        <div className="leading-tight">
          <div className="text-[9px] text-muted-foreground uppercase tracking-widest">Presup.</div>
          <div className="font-mono text-[12px] font-bold text-foreground">
            {fmtBudget(gameState.budget)}
          </div>
        </div>
      </div>

      <Separator className="hidden lg:block" />

      {/* Popularidad */}
      <div className="hidden lg:flex items-center gap-2 flex-none">
        <Activity size={13} className="text-muted-foreground" />
        <div className="leading-tight">
          <div className="text-[9px] text-muted-foreground uppercase tracking-widest">Popular.</div>
          <div className={`font-mono text-[12px] font-bold ${riskColor(popularityRisk)}`}>
            {Math.round(gameState.popularity)}%
          </div>
        </div>
      </div>

      <Separator className="hidden xl:block" />

      {/* Estabilidad */}
      <div className="hidden xl:flex items-center gap-2 flex-none">
        <Shield size={13} className="text-muted-foreground" />
        <div className="leading-tight">
          <div className="text-[9px] text-muted-foreground uppercase tracking-widest">Estabil.</div>
          <div className={`font-mono text-[12px] font-bold ${riskColor(stabilityRisk)}`}>
            {Math.round(gameState.stability)}
          </div>
        </div>
      </div>

      <div className="flex-1 min-w-0" />

      {/* Botones */}
      <button
        onClick={onRestart}
        title="Reiniciar juego"
        className="flex items-center gap-1.5 text-[11px] text-muted-foreground hover:text-foreground transition-colors px-2 py-1 rounded border border-transparent hover:border-border"
      >
        <RefreshCw size={12} />
        <span className="hidden md:inline">Reiniciar</span>
      </button>

      {onEndTurn && (
        <button
          onClick={onEndTurn}
          disabled={!canEndTurn}
          className={`flex items-center gap-2 px-4 py-2 rounded font-display text-[12px] font-bold uppercase tracking-wide transition-all ${
            canEndTurn
              ? 'bg-primary hover:bg-primary/90 text-primary-foreground shadow-md'
              : 'bg-white/5 text-muted-foreground cursor-not-allowed border border-border'
          }`}
        >
          Finalizar Turno
          <ArrowRight size={13} />
        </button>
      )}
    </header>
  );
}

function Separator({ className = '' }: { className?: string }) {
  return <div className={`w-px h-7 bg-border ${className}`} />;
}

// Re-export del icono Users por compat (no se usa en este componente pero alguien podría importarlo)
export { Users };
