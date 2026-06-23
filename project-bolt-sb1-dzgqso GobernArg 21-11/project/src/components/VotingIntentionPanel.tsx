import { BarChart, TrendingUp, Users, Target, Shield } from 'lucide-react';
import { GameState } from '../types/game';
import { calculateVotingIntention } from '../utils/electionSystem';
import { Tooltip, TooltipContent } from './Tooltip';

interface VotingIntentionPanelProps {
  gameState: GameState;
}

export function VotingIntentionPanel({ gameState }: VotingIntentionPanelProps) {
  const votingIntention = calculateVotingIntention(gameState);
  const isLastYear = gameState.year === 4;

  return (
    <div className="bg-white rounded-lg shadow-lg p-4">
      <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
        <BarChart className="w-6 h-6 text-blue-600" />
        Intención de Voto
      </h2>

      <div className="space-y-4">
        <div className="relative pt-1">
          <div className="flex mb-2 items-center justify-between">
            <div>
              <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-blue-600 bg-blue-100">
                Apoyo Electoral
              </span>
            </div>
            <div className="text-right">
              <span className="text-xs font-semibold inline-block text-blue-600">
                {votingIntention.toFixed(2)}%
              </span>
            </div>
          </div>
          <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-gray-200">
            <div
              style={{ width: `${votingIntention}%` }}
              className={`shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center ${
                votingIntention >= 45 ? 'bg-green-500' : 'bg-red-500'
              }`}
            />
          </div>
        </div>

        {isLastYear && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-sm text-yellow-800">
              ¡Último año de mandato! Las elecciones se acercan. Necesitarás al menos 45% de intención de voto para ser reelecto.
            </p>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4 text-sm">
          <Tooltip content={<TooltipContent value="Peso: 35%" label="de la intención de voto" detail="Promedio de popularidad de los últimos 4 turnos. Es el factor más importante." />}>
            <div className="flex items-center gap-2 cursor-help">
              <TrendingUp className="w-4 h-4 text-blue-500" />
              <span>Popularidad: {gameState.popularity.toFixed(1)}%</span>
            </div>
          </Tooltip>
          <Tooltip content={<TooltipContent value="Peso: 25%" label="de la intención de voto" detail="Promedio del apoyo de todos los grupos de interés. Refleja tu relación con los sectores." />}>
            <div className="flex items-center gap-2 cursor-help">
              <Users className="w-4 h-4 text-green-500" />
              <span>Grupos: {gameState.popularidadGrupos.toFixed(1)}%</span>
            </div>
          </Tooltip>
          <Tooltip content={<TooltipContent value="Peso: 15%" label="de la intención de voto" detail="Proporción de objetivos del mandato ya completados." />}>
            <div className="flex items-center gap-2 cursor-help">
              <Target className="w-4 h-4 text-purple-500" />
              <span>Objetivos: {((gameState.completedObjectives.length / Math.max(1, gameState.objectives.length)) * 100).toFixed(0)}%</span>
            </div>
          </Tooltip>
          <Tooltip content={<TooltipContent value="Peso: 5%" label="de la intención de voto" detail="Bonus binario: 100% si no hay crisis de popularidad ni déficit. 0% si los hay." />}>
            <div className="flex items-center gap-2 cursor-help">
              <Shield className="w-4 h-4 text-yellow-500" />
              <span>Estabilidad: {gameState.consecutiveLowPopularity === 0 && gameState.consecutiveNegativeBudget === 0 ? '100%' : '0%'}</span>
            </div>
          </Tooltip>
        </div>
      </div>
    </div>
  );
}