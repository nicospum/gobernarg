import { TrendingUp, Users, Wallet, PlayCircle, RotateCcw, ArrowRight } from 'lucide-react';
import { GameState } from '../types/game';
import { IMAGES } from '../utils/imageAssets';

interface GameHeaderProps {
  gameState: GameState;
  availableActions: number;
  onRestart: () => void;
  onEndTurn?: () => void;
  canEndTurn?: boolean;
}

export function GameHeader({ gameState, availableActions, onRestart, onEndTurn, canEndTurn }: GameHeaderProps) {
  return (
    <header className="bg-blue-900 text-white p-4 shadow-lg sticky top-0 z-50">
      <div className="container mx-auto">
        <div className="flex items-center">
          <div className="flex items-center space-x-3 mr-auto">
            <img
              src={IMAGES.logo.primary}
              alt="Gobernarg"
              className="h-10 w-auto bg-white/90 rounded-lg px-2 py-1"
            />
            <h1 className="text-2xl font-bold hidden sm:block">GobernArg</h1>
          </div>
          
          <div className="flex items-center space-x-4 md:space-x-6">
            {gameState.avatar && (
              <img
                src={gameState.avatar}
                alt={gameState.governorName}
                className="w-10 h-10 rounded-full object-cover border-2 border-white/50"
                title={gameState.governorName}
              />
            )}
            <div className="flex items-center space-x-2">
              <PlayCircle className="w-5 h-5" />
              <span className="hidden sm:inline">Acciones: {availableActions}</span>
              <span className="sm:hidden">{availableActions}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Users className="w-5 h-5" />
              <span>Popularidad: {Math.round(gameState.popularity)}%</span>
            </div>
            <div className="flex items-center space-x-2">
              <Wallet className="w-5 h-5" />
              <span>Presupuesto: ${gameState.budget.toLocaleString()}M</span>
            </div>
            <div className="flex items-center space-x-2">
              <TrendingUp className="w-5 h-5" />
              <span>Año {gameState.year} - Turno {gameState.turn}/4</span>
            </div>
            <button
              onClick={onRestart}
              className="bg-red-600 hover:bg-red-700 rounded-full w-9 h-9 flex items-center justify-center transition-colors"
              title="Reiniciar juego"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
            {onEndTurn && (
              <button
                onClick={onEndTurn}
                disabled={!canEndTurn}
                className={`rounded-full px-5 py-2 text-sm font-semibold transition-all ${
                  canEndTurn
                    ? 'bg-amber-600 hover:bg-amber-500 text-white shadow-md'
                    : 'bg-white/10 text-white/40 cursor-not-allowed'
                }`}
              >
                Finalizar Turno
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
