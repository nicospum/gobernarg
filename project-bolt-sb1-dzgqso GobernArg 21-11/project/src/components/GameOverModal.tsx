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
    <div className="fixed inset-0 bg-black/85 backdrop-blur-md flex items-center justify-center z-50 p-4">
      <div className="relative w-full max-w-2xl rounded-2xl overflow-hidden shadow-2xl border border-white/12 bg-[#0f1e38]">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${backgroundImage})` }}
        />
        <div
          className={`absolute inset-0 ${
            isVictory
              ? 'bg-gradient-to-t from-[#0f1e38]/98 via-[#0f1e38]/85 to-[#070e17]/80'
              : 'bg-gradient-to-t from-[#0f1e38]/98 via-red-950/80 to-[#070e17]/85'
          }`}
        />

        <div className="relative z-10 p-8 md:p-10 text-white text-center">
          {isVictory ? (
            <>
              <Trophy className="w-16 h-16 text-amber-400 mx-auto mb-4 drop-shadow-lg" />
              <h2 className="font-['Barlow_Condensed'] text-4xl font-bold text-amber-400 mb-2 uppercase tracking-wider">
                ¡VICTORIA HISTÓRICA!
              </h2>
              <p className="text-base text-white/85 mb-8 leading-relaxed">
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
              <h2 className="font-['Barlow_Condensed'] text-4xl font-bold text-red-400 mb-2 uppercase tracking-wider">
                {defeatConfig?.title ?? 'FIN DEL GOBIERNO'}
              </h2>
              <p className="text-base text-white/85 mb-4 leading-relaxed">
                {defeatConfig?.description ??
                  'Tu gestión ha finalizado antes de concluir el mandato.'}
              </p>
              {defeatConfig?.advice && (
                <div className="bg-[#091422]/90 backdrop-blur rounded-xl p-4 mb-6 border border-white/8 inline-block text-left max-w-md shadow-md">
                  <p className="text-xs text-amber-200/90 leading-relaxed font-mono">
                    💡 Consejo político: {defeatConfig.advice}
                  </p>
                </div>
              )}
            </>
          )}

          <div className="bg-[#091422]/90 backdrop-blur rounded-xl p-6 mb-8 border border-white/8 shadow-md">
            <h3 className="font-['Barlow_Condensed'] text-xl font-bold uppercase tracking-wider text-white mb-4">
              BALANCE FINAL DE GESTIÓN
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/4 p-3 rounded-lg border border-white/6">
                <p className="text-white/40 text-[10px] uppercase tracking-widest font-bold">
                  Aprobación Final
                </p>
                <p className="font-mono text-3xl font-bold text-emerald-400 mt-1">
                  {Math.round(gameState.popularity)}%
                </p>
              </div>
              <div className="bg-white/4 p-3 rounded-lg border border-white/6">
                <p className="text-white/40 text-[10px] uppercase tracking-widest font-bold">
                  Caja del Tesoro
                </p>
                <p className="font-mono text-3xl font-bold text-white mt-1">{fmtBudget(gameState.budget)}</p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3">
            {onShowLegacy && (
              <button
                onClick={onShowLegacy}
                className="px-6 py-3 rounded-xl font-['Barlow_Condensed'] font-bold text-sm uppercase tracking-wider transition-colors border border-white/12 bg-white/6 hover:bg-white/12 text-white"
              >
                Ver tu legado
              </button>
            )}
            <button
              onClick={onRestart}
              className="px-8 py-3 rounded-xl font-['Barlow_Condensed'] font-bold text-base uppercase tracking-wider transition-all shadow-lg bg-blue-600 hover:bg-blue-500 text-white shadow-blue-600/20"
            >
              Comenzar Nueva Partida
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
