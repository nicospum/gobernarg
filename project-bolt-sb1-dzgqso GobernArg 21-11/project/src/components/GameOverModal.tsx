import { Trophy, AlertOctagon, TrendingDown, Wallet, Gavel, Swords, Flame, Vote } from 'lucide-react';
import { GameState, DefeatReason } from '../types/game';
import { IMAGES } from '../utils/imageAssets';
import { DEFEAT_REASON_CONFIG } from '../data/defeatReasons';
import { fmtBudget } from '@/lib/format';

interface GameOverModalProps {
  gameState: GameState;
  onRestart: () => void;
  onShowLegacy?: () => void;
}

const DEFEAT_ICONS: Record<DefeatReason, typeof Trophy> = {
  low_popularity: TrendingDown,
  negative_budget: Wallet,
  impeachment: Gavel,
  institutional_coup: Swords,
  hyperinflation: Flame,
  election_loss: Vote,
};

export function GameOverModal({ gameState, onRestart, onShowLegacy }: GameOverModalProps) {
  const isVictory = gameState.victorious;
  const reason = gameState.defeatReason;
  const defeatConfig = !isVictory && reason ? DEFEAT_REASON_CONFIG[reason] : null;

  const backgroundImage = isVictory ? IMAGES.ui.shieldEmblemPremium : IMAGES.events.socialProtest;
  const DefeatIcon = !isVictory && reason ? DEFEAT_ICONS[reason] : null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="relative w-full max-w-2xl rounded-xl overflow-hidden shadow-2xl border border-border">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${backgroundImage})` }}
        />
        <div
          className={`absolute inset-0 ${
            isVictory
              ? 'bg-gradient-to-t from-[#0B1829]/98 via-[#0B1829]/80 to-[#0B1829]/60'
              : 'bg-gradient-to-t from-[#0B1829]/98 via-red-950/70 to-[#0B1829]/60'
          }`}
        />

        <div className="relative z-10 p-8 md:p-10 text-foreground text-center">
          {isVictory ? (
            <>
              <Trophy className="w-16 h-16 text-accent mx-auto mb-4" />
              <h2 className="font-display text-4xl font-bold text-accent mb-2 uppercase tracking-wide">
                ¡Victoria!
              </h2>
              <p className="text-lg text-foreground/85 mb-8">
                Has completado tu gestión con éxito. ¡El pueblo te aclama!
              </p>
            </>
          ) : (
            <>
              {DefeatIcon ? (
                <DefeatIcon className="w-16 h-16 text-red-400 mx-auto mb-4" />
              ) : (
                <AlertOctagon className="w-16 h-16 text-red-400 mx-auto mb-4" />
              )}
              <h2 className="font-display text-4xl font-bold text-red-400 mb-2 uppercase tracking-wide">
                {defeatConfig?.title ?? 'Fin del Juego'}
              </h2>
              <p className="text-lg text-foreground/85 mb-4">
                {defeatConfig?.description ??
                  'Tu gestión ha llegado a su fin. El pueblo demanda un cambio.'}
              </p>
              {defeatConfig?.advice && (
                <div className="bg-white/8 backdrop-blur rounded-xl p-4 mb-6 border border-border inline-block text-left max-w-md">
                  <p className="text-sm text-foreground/80 italic">
                    Consejo: {defeatConfig.advice}
                  </p>
                </div>
              )}
            </>
          )}

          <div className="bg-white/8 backdrop-blur rounded-xl p-6 mb-8 border border-border">
            <h3 className="font-display text-xl font-bold uppercase tracking-wide mb-4">
              Resumen Final
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-foreground/70 text-[12px] uppercase tracking-wide">
                  Popularidad Final
                </p>
                <p className="font-mono text-3xl font-bold">
                  {Math.round(gameState.popularity)}%
                </p>
              </div>
              <div>
                <p className="text-foreground/70 text-[12px] uppercase tracking-wide">
                  Presupuesto Final
                </p>
                <p className="font-mono text-3xl font-bold">{fmtBudget(gameState.budget)}</p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3">
            {onShowLegacy && (
              <button
                onClick={onShowLegacy}
                className="px-8 py-3 rounded font-display font-bold uppercase tracking-wide transition-colors border border-border bg-white/10 hover:bg-white/15 text-foreground"
              >
                Ver tu legado
              </button>
            )}
            <button
              onClick={onRestart}
              className={`px-8 py-3 rounded font-display font-bold uppercase tracking-wide transition-colors shadow-lg ${
                isVictory
                  ? 'bg-accent hover:bg-accent/90 text-accent-foreground'
                  : 'bg-primary hover:bg-primary/90 text-primary-foreground'
              }`}
            >
              Comenzar Nueva Partida
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
