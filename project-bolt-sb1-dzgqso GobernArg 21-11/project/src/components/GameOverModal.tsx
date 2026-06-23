import { Trophy, AlertOctagon, TrendingDown, Wallet, Gavel, Swords, Flame, Vote } from 'lucide-react';
import { GameState, DefeatReason } from '../types/game';
import { IMAGES } from '../utils/imageAssets';
import { DEFEAT_REASON_CONFIG } from '../data/defeatReasons';

interface GameOverModalProps {
  gameState: GameState;
  onRestart: () => void;
}

const DEFEAT_ICONS: Record<DefeatReason, typeof Trophy> = {
  low_popularity: TrendingDown,
  negative_budget: Wallet,
  impeachment: Gavel,
  institutional_coup: Swords,
  hyperinflation: Flame,
  election_loss: Vote,
};

export function GameOverModal({ gameState, onRestart }: GameOverModalProps) {
  const isVictory = gameState.victorious;
  const reason = gameState.defeatReason;
  const defeatConfig = !isVictory && reason ? DEFEAT_REASON_CONFIG[reason] : null;

  const backgroundImage = isVictory
    ? IMAGES.ui.shieldEmblemPremium
    : IMAGES.events.socialProtest;

  const DefeatIcon = !isVictory && reason ? DEFEAT_ICONS[reason] : null;

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="relative w-full max-w-2xl rounded-2xl overflow-hidden shadow-2xl">
        {/* Fondo temático */}
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${backgroundImage})` }}
        />
        <div className={`absolute inset-0 ${
          isVictory
            ? 'bg-gradient-to-t from-yellow-900/95 via-slate-900/70 to-slate-900/40'
            : 'bg-gradient-to-t from-red-900/95 via-slate-900/70 to-slate-900/40'
        }`} />

        <div className="relative z-10 p-8 md:p-10 text-white text-center">
          {isVictory ? (
            <>
              <Trophy className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
              <h2 className="text-4xl font-bold text-yellow-400 mb-2">¡Victoria!</h2>
              <p className="text-lg text-white/90 mb-8">
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
              <h2 className="text-4xl font-bold text-red-400 mb-2">
                {defeatConfig?.title ?? 'Fin del Juego'}
              </h2>
              <p className="text-lg text-white/90 mb-4">
                {defeatConfig?.description ?? 'Tu gestión ha llegado a su fin. El pueblo demanda un cambio.'}
              </p>
              {defeatConfig?.advice && (
                <div className="bg-white/10 backdrop-blur rounded-xl p-4 mb-6 border border-white/20 inline-block text-left max-w-md">
                  <p className="text-sm text-white/80 italic">💡 Consejo: {defeatConfig.advice}</p>
                </div>
              )}
            </>
          )}

          <div className="bg-white/10 backdrop-blur rounded-xl p-6 mb-8 border border-white/20">
            <h3 className="text-xl font-bold mb-4">Resumen Final</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-white/80">Popularidad Final</p>
                <p className="text-3xl font-bold">{Math.round(gameState.popularity)}%</p>
              </div>
              <div>
                <p className="text-white/80">Presupuesto Final</p>
                <p className="text-3xl font-bold">${Math.round(gameState.budget)}M</p>
              </div>
            </div>
          </div>

          <button
            onClick={onRestart}
            className={`px-8 py-3 rounded-xl text-white font-bold transition-colors shadow-lg ${
              isVictory
                ? 'bg-yellow-500 hover:bg-yellow-400 text-slate-900'
                : 'bg-blue-600 hover:bg-blue-500'
            }`}
          >
            Comenzar Nueva Partida
          </button>
        </div>
      </div>
    </div>
  );
}
