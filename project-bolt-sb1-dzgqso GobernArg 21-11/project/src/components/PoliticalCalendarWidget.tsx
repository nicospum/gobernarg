import { Calendar, Flag } from 'lucide-react';
import { GameState } from '../types/game';
import { POLITICAL_CALENDAR } from '../data/calendar';
import { IMAGES } from '../utils/imageAssets';
import { Tooltip, TooltipContent } from './Tooltip';

interface PoliticalCalendarWidgetProps {
  gameState: GameState;
}

export function PoliticalCalendarWidget({ gameState }: PoliticalCalendarWidgetProps) {
  const currentTotalTurn = (gameState.year - 1) * 4 + gameState.turn;

  const upcomingEvents = POLITICAL_CALENDAR
    .filter(event => {
      const eventTotalTurn = (event.year - 1) * 4 + event.turn;
      return eventTotalTurn >= currentTotalTurn;
    })
    .slice(0, 4);

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      {/* Header visual */}
      <div className="relative h-24">
        <img
          src={IMAGES.backgrounds.congressSunset}
          alt="Calendario político"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-blue-900/90 to-blue-700/70" />
        <div className="absolute inset-0 p-4 flex items-center gap-3 text-white">
          <Calendar className="w-7 h-7" />
          <h2 className="text-xl font-bold">Calendario político</h2>
        </div>
      </div>

      <div className="p-4">
        {gameState.legislativeSupport !== null && (
          <div className="mb-4 p-3 bg-slate-50 rounded-lg border border-slate-200">
            <Tooltip content={<TooltipContent label={`Apoyo legislativo: ${gameState.legislativeSupport.toFixed(1)}%`} detail="≥ 45% mayoría aplastante (reformas -1 acción) | ≥ 38% quorum propio | ≥ 35% paridad | < 35% hostil (+2 acciones). Se define en elecciones de medio término (Año 2)." />}>
              <div className="cursor-help">
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-600">Apoyo legislativo actual</span>
              <span className="font-bold text-slate-800">{gameState.legislativeSupport.toFixed(1)}%</span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-2 mt-2">
              <div
                className={`h-2 rounded-full ${getSupportColor(gameState.legislativeSupport)}`}
                style={{ width: `${Math.min(100, Math.max(0, gameState.legislativeSupport))}%` }}
              />
            </div>
              </div>
            </Tooltip>
          </div>
        )}

        <div className="space-y-3">
          {upcomingEvents.map(event => {
            const eventTotalTurn = (event.year - 1) * 4 + event.turn;
            const turnsAway = eventTotalTurn - currentTotalTurn;
            const isCurrent = turnsAway === 0;

            return (
              <div
                key={event.id}
                className={`p-3 rounded-lg border ${
                  isCurrent
                    ? 'bg-blue-50 border-blue-300'
                    : 'bg-gray-50 border-gray-200'
                }`}
              >
                <div className="flex items-start gap-3">
                  <Flag className={`w-5 h-5 mt-0.5 ${isCurrent ? 'text-blue-600' : 'text-gray-400'}`} />
                  <div className="flex-1">
                    <p className={`font-semibold ${isCurrent ? 'text-blue-900' : 'text-gray-800'}`}>
                      {event.title}
                    </p>
                    <p className="text-sm text-gray-600 mt-1">{event.description}</p>
                    <p className="text-xs text-gray-500 mt-2">
                      Año {event.year} · Trimestre {event.turn}
                      {turnsAway > 0 && ` · en ${turnsAway} turnos`}
                      {isCurrent && ' · ahora'}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function getSupportColor(support: number): string {
  if (support >= 45) return 'bg-green-500';
  if (support >= 38) return 'bg-blue-500';
  if (support >= 35) return 'bg-yellow-500';
  return 'bg-red-500';
}
