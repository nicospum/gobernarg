import { Trophy, AlertOctagon, TrendingDown, Wallet, Gavel, Swords, Flame, Vote } from 'lucide-react';
import { GameState, DefeatReason } from '../types/game';
import { IMAGES } from '../utils/imageAssets';
import { DEFEAT_REASON_CONFIG } from '../data/defeatReasons';
import { fmtBudget } from '@/lib/format';
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
    <div ref={dialogRef} className="outline-none fixed inset-0 bg-ink/85 backdrop-blur-md flex items-center justify-center z-50 p-4">
      <div className="relative w-full max-w-2xl rounded-2xl overflow-hidden shadow-2xl border border-ink/12 bg-surface">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${backgroundImage})` }}
        />
        <div
          className={`absolute inset-0 ${
            isVictory
              ? 'bg-gradient-to-t from-surface/98 via-surface/85 to-paper/80'
              : 'bg-gradient-to-t from-surface/98 via-red-950/80 to-paper/85'
          }`}
        />

        <div className="relative z-10 p-8 md:p-10 text-ink text-center">
          {isVictory ? (
            <>
              <Trophy className="w-16 h-16 text-amber-400 mx-auto mb-4 drop-shadow-lg" />
              <h2 className="font-display text-4xl font-semibold text-amber-400 mb-2  ">
                ¡VICTORIA HISTÓRICA!
              </h2>
              <p className="text-base text-ink/85 mb-8 leading-relaxed">
                Completaste tu mandato de gobierno dejando huella institucional y apoyo popular.
              </p>
            </>
          ) : (
            <>
              {DefeatIcon ? (
                <DefeatIcon className="w-16 h-16 text-red-400 mx-auto mb-4 drop-shadow-lg" />
              ) : (
                <AlertOctagon className="w-16 h-16 text-red-400 mx-auto mb-4 drop-shadow-lg" />
              )}
              <h2 className="font-display text-4xl font-semibold text-red-400 mb-2  ">
                {defeatConfig?.title ?? 'FIN DEL GOBIERNO'}
              </h2>
              <p className="text-base text-ink/85 mb-4 leading-relaxed">
                {defeatConfig?.description ??
                  'Tu gestión ha finalizado antes de concluir el mandato.'}
              </p>
              {defeatConfig?.advice && (
                <div className="bg-surface/90 backdrop-blur rounded-lg p-4 mb-6 border border-ink/8 inline-block text-left max-w-md ">
                  <p className="text-xs text-amber-200/90 leading-relaxed font-mono">
                    💡 Consejo político: {defeatConfig.advice}
                  </p>
                </div>
              )}
            </>
          )}

          <div className="bg-surface/90 backdrop-blur rounded-lg p-6 mb-8 border border-ink/8 ">
            <h3 className="font-display text-xl font-semibold   text-ink mb-4">
              Balance final de gestión
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-ink/4 p-3 rounded-lg border border-ink/6">
                <p className="text-ink/70 text-[10px] uppercase tracking-widest font-bold">
                  Aprobación Final
                </p>
                <p className="font-mono text-3xl font-bold text-emerald-400 mt-1">
                  {Math.round(gameState.popularity)}%
                </p>
              </div>
              <div className="bg-ink/4 p-3 rounded-lg border border-ink/6">
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
                className="px-6 py-3 rounded-xl font-display font-semibold text-[16px] transition-colors border border-ink/12 bg-ink/6 hover:bg-ink/12 text-ink"
              >
                Contanos cómo te fue
              </button>
            )}
            {onShowLegacy && (
              <button
                onClick={onShowLegacy}
                className="px-6 py-3 rounded-xl font-display font-semibold text-[16px]   transition-colors border border-ink/12 bg-ink/6 hover:bg-ink/12 text-ink"
              >
                Ver tu legado
              </button>
            )}
            <button
              onClick={onRestart}
              className="px-8 py-3 rounded-xl font-display font-semibold text-base   transition-all shadow-lg bg-blue-600 hover:bg-blue-500 text-white shadow-blue-600/20"
            >
              Comenzar Nueva Partida
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
