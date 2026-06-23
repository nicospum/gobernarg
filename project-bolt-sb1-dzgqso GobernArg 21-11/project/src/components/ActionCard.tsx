import { Check, TrendingUp, DollarSign, Zap } from 'lucide-react';
import { GameAction } from '../types/game';
import { Tooltip, TooltipContent } from './Tooltip';

interface ActionCardProps {
  action: GameAction;
  onSelect: () => void;
  disabled: boolean;
  isSelected: boolean;
}

function getPopularityIndicator(popularityChange: number) {
  if (popularityChange >= 20) return Array(3).fill(<TrendingUp className="w-3 h-3" />);
  if (popularityChange >= 15) return Array(2).fill(<TrendingUp className="w-3 h-3" />);
  return [<TrendingUp className="w-3 h-3" />];
}

function getBudgetIndicator(budgetChange: number) {
  const absoluteChange = Math.abs(budgetChange);
  const fullSymbols = Math.floor(absoluteChange / 100);
  const hasHalf = (absoluteChange % 100) > 0;
  
  const symbols = [];
  
  for (let i = 0; i < fullSymbols; i++) {
    symbols.push(<DollarSign key={`full-${i}`} className="w-3 h-3" />);
  }
  
  if (hasHalf) {
    symbols.push(
      <DollarSign key="half" className="w-3 h-3 opacity-50" />
    );
  }
  
  return symbols;
}

export function ActionCard({ action, onSelect, disabled, isSelected }: ActionCardProps) {
  const popularityIndicators = getPopularityIndicator(action.popularityChange);
  const budgetIndicators = getBudgetIndicator(action.budgetChange);

  return (
    <button
      onClick={onSelect}
      disabled={disabled}
      className={`w-full p-4 rounded-lg border text-left transition-all ${
        isSelected
          ? 'bg-blue-100 border-blue-500'
          : disabled
          ? 'bg-gray-100 cursor-not-allowed opacity-50'
          : 'hover:bg-blue-50 hover:border-blue-300 border-gray-200'
      }`}
    >
      <div className="flex items-start gap-3">
        <div className={`p-2 rounded-lg ${isSelected ? 'bg-blue-200' : 'bg-blue-100'}`}>
          {isSelected ? (
            <Check className="w-5 h-5 text-blue-700" />
          ) : (
            <action.icon className="w-5 h-5 text-blue-700" />
          )}
        </div>
        <div className="flex-1">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-semibold text-gray-900">{action.title}</h3>
            <div className="flex items-center gap-1 flex-shrink-0">
              {action.isReform && (
                <Tooltip content={<TooltipContent label="Reforma estructural. Requiere apoyo legislativo y puede tener costo extra en acciones." />}>
                  <span className="px-2 py-0.5 text-xs bg-purple-100 text-purple-700 rounded-full cursor-help">
                    Reforma
                  </span>
                </Tooltip>
              )}
              <Tooltip content={<TooltipContent label={`Cuesta ${action.actionCost ?? 1} acción(es) política(s)`} />}>
                <span className={`px-2 py-0.5 text-xs rounded-full flex items-center gap-1 cursor-help ${
                  (action.actionCost || 1) > 1
                    ? 'bg-orange-100 text-orange-700'
                    : 'bg-blue-100 text-blue-700'
                }`}>
                  <Zap className="w-3 h-3" />
                  {action.actionCost ?? 1}
                </span>
              </Tooltip>
            </div>
          </div>
          <p className="text-sm text-gray-600">{action.description}</p>

          <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
            <Tooltip content={<TooltipContent value={`${action.popularityChange > 0 ? '+' : ''}${action.popularityChange}%`} label="popularidad" detail="Sujeto a rendimiento decreciente (×0.80 por uso repetido)" />}>
              <div className="flex items-center gap-1 text-green-600 min-h-[1.25rem] cursor-help">
                <span>Popularidad</span>
                <div className="flex items-center">
                  {popularityIndicators.map((indicator, index) => (
                    <span key={index}>{indicator}</span>
                  ))}
                </div>
              </div>
            </Tooltip>
            <Tooltip content={<TooltipContent value={`${action.budgetChange > 0 ? '+' : ''}$${Math.abs(action.budgetChange)}M`} label="presupuesto" detail={Math.abs(action.budgetChange) >= 200 ? 'Acción grande: generará costo de mantenimiento del 15% en 2-4 turnos' : undefined} />}>
              <div className={`flex items-center gap-1 min-h-[1.25rem] cursor-help ${action.budgetChange > 0 ? 'text-green-600' : 'text-red-600'}`}>
                <span>Presupuesto</span>
                <div className="flex items-center">
                  {budgetIndicators.map((indicator, index) => (
                    <span key={index}>{indicator}</span>
                  ))}
                </div>
              </div>
            </Tooltip>
          </div>
        </div>
      </div>
    </button>
  );
}