import { RotateCcw, Trophy, Skull, ScrollText } from 'lucide-react';
import { GameState } from '../types/game';
import { generateLegacyText, generateLegacyStats, getRecentCrises, getRecentProjects } from '../utils/careerLog';
import { IMAGES } from '../utils/imageAssets';

interface LegacyScreenProps {
  gameState: GameState;
  onRestart: () => void;
}

export function LegacyScreen({ gameState, onRestart }: LegacyScreenProps) {
  const isVictory = gameState.victorious;
  const legacyText = generateLegacyText(gameState);
  const stats = generateLegacyStats(gameState);
  const recentCrises = getRecentCrises(gameState);
  const recentProjects = getRecentProjects(gameState);

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="relative w-full max-w-3xl rounded-2xl overflow-hidden shadow-2xl bg-white my-8">
        {/* Header visual */}
        <div className="relative h-48 md:h-56">
          <img
            src={isVictory ? IMAGES.ui.shieldEmblemPremium : IMAGES.events.socialProtest}
            alt={isVictory ? 'Victoria' : 'Derrota'}
            className="w-full h-full object-cover"
          />
          <div className={`absolute inset-0 ${
            isVictory
              ? 'bg-gradient-to-t from-yellow-900/90 via-slate-900/50 to-transparent'
              : 'bg-gradient-to-t from-red-900/90 via-slate-900/50 to-transparent'
          }`} />
          <div className="absolute inset-0 flex flex-col items-center justify-center text-white text-center p-4">
            {isVictory ? (
              <Trophy className="w-14 h-14 text-yellow-400 mb-2" />
            ) : (
              <Skull className="w-14 h-14 text-red-400 mb-2" />
            )}
            <h2 className="text-4xl font-bold">
              {isVictory ? 'Fin de la carrera política' : 'Fin del gobierno'}
            </h2>
            <p className="text-white/90 mt-1">
              {isVictivityMessage(gameState)}
            </p>
          </div>
        </div>

        <div className="p-6 md:p-8">
          {/* Narrativa */}
          <div className="mb-8">
            <h3 className="text-xl font-bold mb-3 flex items-center gap-2 text-gray-900">
              <ScrollText className="w-6 h-6 text-blue-600" />
              Tu legado
            </h3>
            <div className="bg-slate-50 rounded-xl p-5 border border-slate-200 text-gray-800 leading-relaxed whitespace-pre-line">
              {legacyText}
            </div>
          </div>

          {/* Estadísticas */}
          <div className="mb-8">
            <h3 className="text-xl font-bold mb-3 text-gray-900">Estadísticas de gestión</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {stats.map((stat) => (
                <div key={stat.label} className="bg-blue-50 rounded-xl p-4 text-center">
                  <p className="text-2xl font-bold text-blue-900">{stat.value}</p>
                  <p className="text-sm text-blue-700">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Obras y crisis */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {recentProjects.length > 0 && (
              <div>
                <h4 className="font-bold text-gray-900 mb-2">Obras destacadas</h4>
                <ul className="list-disc pl-5 space-y-1 text-gray-700">
                  {recentProjects.map((project, i) => (
                    <li key={i}>{project}</li>
                  ))}
                </ul>
              </div>
            )}
            {recentCrises.length > 0 && (
              <div>
                <h4 className="font-bold text-gray-900 mb-2">Crisis superadas</h4>
                <ul className="list-disc pl-5 space-y-1 text-gray-700">
                  {recentCrises.map((crisis, i) => (
                    <li key={i}>{crisis}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Botón */}
          <div className="text-center">
            <button
              onClick={onRestart}
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl font-bold transition-colors"
            >
              <RotateCcw className="w-5 h-5" />
              Jugar de nuevo
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function isVictivityMessage(gameState: GameState): string {
  if (!gameState.victorious) return 'El pueblo eligió un nuevo rumbo.';
  if (gameState.position === 'presidente' && gameState.term >= 2) {
    return 'Completaste dos mandatos presidenciales y cerraste una carrera histórica.';
  }
  return 'Ganaste las elecciones y tu carrera política sigue en pie.';
}
