import { TrendingUp, TrendingDown, AlertTriangle, BarChart } from 'lucide-react';
import { GameState } from '../types/game';

interface IndicatorsPanelProps {
  gameState: GameState;
}

export function IndicatorsPanel({ gameState }: IndicatorsPanelProps) {
  const popularityStatus = getIndicatorStatus(gameState.popularity);
  const stabilityStatus = getIndicatorStatus(gameState.stability);
  const budgetStatus = getBudgetStatus(gameState.budget);

  return (
    <div className="bg-white rounded-lg shadow-lg p-4">
      <div className="flex items-center gap-3 mb-4">
        {gameState.avatar && (
          <img
            src={gameState.avatar}
            alt={gameState.governorName}
            className="w-12 h-12 rounded-full object-cover border-2 border-blue-100"
          />
        )}
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2">
            <BarChart className="w-6 h-6 text-blue-600" />
            Indicadores de Gestión
          </h2>
          {gameState.governorName && (
            <p className="text-sm text-gray-600">
              {gameState.governorName} · <span className="capitalize">{gameState.position}</span>
            </p>
          )}
        </div>
      </div>

      <div className="space-y-4">
        {/* Popularidad */}
        <div className="relative">
          <div className="flex justify-between mb-1">
            <span className="text-sm font-medium text-gray-700">Popularidad</span>
            <span className="text-sm font-medium text-gray-700">{Math.round(gameState.popularity)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div
              className={`h-2.5 rounded-full ${getStatusColor(popularityStatus)}`}
              style={{ width: `${Math.min(100, Math.max(0, gameState.popularity))}%` }}
            />
          </div>
          {popularityStatus === 'critical' && (
            <div className="absolute right-0 -top-6">
              <AlertTriangle className="w-4 h-4 text-red-500" />
            </div>
          )}
        </div>

        {/* Estabilidad */}
        <div className="relative">
          <div className="flex justify-between mb-1">
            <span className="text-sm font-medium text-gray-700">Estabilidad</span>
            <span className="text-sm font-medium text-gray-700">{Math.round(gameState.stability)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div
              className={`h-2.5 rounded-full ${getStatusColor(stabilityStatus)}`}
              style={{ width: `${Math.min(100, Math.max(0, gameState.stability))}%` }}
            />
          </div>
          {stabilityStatus === 'critical' && (
            <div className="absolute right-0 -top-6">
              <AlertTriangle className="w-4 h-4 text-red-500" />
            </div>
          )}
        </div>

        {/* Presupuesto */}
        <div className="relative">
          <div className="flex justify-between mb-1">
            <span className="text-sm font-medium text-gray-700">Presupuesto</span>
            <span className="text-sm font-medium text-gray-700">${gameState.budget.toLocaleString()}M</span>
          </div>
          <div className="flex items-center gap-2">
            {gameState.budget >= 0 ? (
              <TrendingUp className="w-4 h-4 text-green-500" />
            ) : (
              <TrendingDown className="w-4 h-4 text-red-500" />
            )}
            <div className="flex-1 bg-gray-200 rounded-full h-2.5">
              <div
                className={`h-2.5 rounded-full ${getStatusColor(budgetStatus)}`}
                style={{ width: `${getBudgetPercentage(gameState.budget)}%` }}
              />
            </div>
          </div>
          {budgetStatus === 'critical' && (
            <div className="absolute right-0 -top-6">
              <AlertTriangle className="w-4 h-4 text-red-500" />
            </div>
          )}
        </div>

        {/* Histórico */}
        <div className="mt-6">
          <h3 className="text-sm font-medium text-gray-700 mb-2">Tendencias</h3>
          <div className="h-24 bg-gray-50 rounded-lg p-2 flex items-end gap-1">
            {gameState.historicalPopularity.slice(-12).map((value, index) => (
              <div
                key={index}
                className="flex-1 bg-blue-400 rounded-t"
                style={{ height: `${Math.min(100, Math.max(5, value))}%` }}
                title={`Turno ${index + 1}: ${Math.round(value)}%`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function getIndicatorStatus(value: number): string {
  if (value < 20) return 'critical';
  if (value < 40) return 'low';
  if (value < 70) return 'medium';
  if (value < 90) return 'high';
  return 'excellent';
}

function getBudgetStatus(budget: number): string {
  if (budget < 0) return 'critical';
  if (budget < 500) return 'low';
  if (budget < 1500) return 'medium';
  if (budget < 3000) return 'high';
  return 'excellent';
}

function getStatusColor(status: string): string {
  switch (status) {
    case 'critical':
      return 'bg-red-500';
    case 'low':
      return 'bg-yellow-500';
    case 'medium':
      return 'bg-blue-500';
    case 'high':
      return 'bg-green-500';
    case 'excellent':
      return 'bg-emerald-500';
    default:
      return 'bg-gray-500';
  }
}

function getBudgetPercentage(budget: number): number {
  const maxBudget = 5000;
  const percentage = ((budget + maxBudget) / (maxBudget * 2)) * 100;
  return Math.min(100, Math.max(0, percentage));
}
