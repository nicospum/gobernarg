import { Trophy, AlertOctagon, TrendingDown, Wallet, Gavel, Swords, Flame, Vote } from 'lucide-react';
import { GameState, DefeatReason } from '../types/game';
import { IMAGES } from '../utils/imageAssets';
import { DEFEAT_REASON_CONFIG } from '../data/defeatReasons';
import { fmtBudget } from '@/lib/format';
import { ModalHeader } from './ModalHeader';
import { useDialog } from '@/lib/useDialog';

interface GameOverModalProps {
  gameState: GameState;
  onRestart: () => void;
  onShowLegacy?: () => void;
  /** Playtest: abre "Contanos cómo te fue". */
  onFeedback?: () => void;
}

const DEFEAT_ICONS: Record<DefeatReason, typeof Trophy> = {
  low_popularity: TrendingDown,
  negative_budget: Wallet,
  impeachment: Gavel,
  institutional_coup: Swords,
  hyperinflation: Flame,
  election_loss: Vote,
};

export function GameOverModal({ gameState, onRestart, onShowLegacy, onFeedback }: GameOverModalProps) {
  const dialogRef = useDialog<HTMLDivElement>();
  const isVictory = gameState.victorious;
  const reason = gameState.defeatReason;
  const defeatConfig = !isVictory && reason ? DEFEAT_REASON_CONFIG[reason] : null;

  const backgroundImage = isVictory ? IMAGES.ui.shieldEmblemPremium : IMAGES.events.socialProtest;
  const DefeatIcon = !isVictory && reason ? DEFEAT_ICONS[reason] : null;

  return (
    <div ref={dialogRef} className="outline-none fixed inset-0 bg-sala-navy/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="relative w-full max-w-2xl overflow-hidden sr-modal max-h-[92vh] overflow-y-auto">
        <ModalHeader
          center
          label={isVictory ? 'Fin del mandato' : 'Fin de la partida'}
          title={isVictory ? '¡Victoria histórica!' : defeatConfig?.title ?? 'Fin del gobierno'}
          subtitle={isVictory
            ? 'Completaste tu mandato de gobierno dejando huella institucional y apoyo popular.'
            : defeatConfig?.description ?? 'Tu gestión ha finalizado antes de concluir el mandato.'}
          image={backgroundImage}
          icon={isVictory
            ? <Trophy className="w-12 h-12 text-sala-lime" />
            : DefeatIcon ? <DefeatIcon className="w-12 h-12 text-[#ff8a6e]" /> : <AlertOctagon className="w-12 h-12 text-[#ff8a6e]" />}
        />

        <div className="p-6 md:p-8 text-ink text-center">
          {!isVictory && defeatConfig?.advice && (
            <div className="rounded-lg p-4 mb-6 border border-sala-sun/40 bg-sala-sun/10 inline-block text-left max-w-md">
              <p className="text-[12px] text-gold-ink leading-relaxed">
                <b>Consejo político:</b> {defeatConfig.advice}
              </p>
            </div>
          )}

          <div className="sr-panel p-5 mb-7 text-left">
            <span className="sr-label">Balance final de gestión</span>
            <div className="grid grid-cols-2 gap-4 mt-3">
              <div className="bg-sunken p-3 rounded-lg">
                <p className="text-ink/70 text-[10px] uppercase tracking-widest font-bold">
                  Aprobación Final
                </p>
                <p className="font-mono text-3xl font-bold text-sala-good mt-1">
                  {Math.round(gameState.popularity)}%
                </p>
              </div>
              <div className="bg-sunken p-3 rounded-lg">
                <p className="text-ink/70 text-[10px] uppercase tracking-widest font-bold">
                  Caja del Tesoro
                </p>
                <p className="font-mono text-3xl font-bold text-ink mt-1">{fmtBudget(gameState.budget)}</p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3">
            {onFeedback && (
              <button
                onClick={onFeedback}
                className="sr-btn-ghost px-5 h-11 text-[14px]"
              >
                Contanos cómo te fue
              </button>
            )}
            {onShowLegacy && (
              <button
                onClick={onShowLegacy}
                className="sr-btn-ghost px-5 h-11 text-[14px]"
              >
                Ver tu legado
              </button>
            )}
            <button
              onClick={onRestart}
              className="sr-btn-lime px-6 h-11 text-[12px]"
            >
              Comenzar Nueva Partida
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
