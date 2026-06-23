import { useState } from 'react';
import { X, Star, TrendingUp, DollarSign, Award } from 'lucide-react';
import { Advisor, AdvisorWithStatus, GameState } from '../types/game';
import { availableAdvisors } from '../data/advisors';
import { getAdvisorPortrait } from '../utils/imageAssets';

interface AdvisorSelectionModalProps {
  onClose: () => void;
  onHire: (selectedAdvisors: AdvisorWithStatus[]) => void;
  maxSelections: number;
  gameState: GameState;
}

function getPopularityIndicator(popularityChange: number) {
  if (popularityChange >= 20) return Array(3).fill(<TrendingUp className="w-4 h-4" />);
  if (popularityChange >= 15) return Array(2).fill(<TrendingUp className="w-4 h-4" />);
  return [<TrendingUp className="w-4 h-4" />];
}

function getBudgetIndicator(cost: number) {
  const fullSymbols = Math.floor(cost / 100);
  const hasHalf = (cost % 100) > 0;
  
  const symbols = [];
  
  for (let i = 0; i < fullSymbols; i++) {
    symbols.push(<DollarSign key={`full-${i}`} className="w-4 h-4" />);
  }
  
  if (hasHalf) {
    symbols.push(
      <DollarSign key="half" className="w-4 h-4 opacity-50" />
    );
  }
  
  return symbols;
}

export function AdvisorSelectionModal({ onClose, onHire, maxSelections, gameState }: AdvisorSelectionModalProps) {
  const [selectedAdvisors, setSelectedAdvisors] = useState<Advisor[]>([]);

  const handleAdvisorSelect = (advisor: Advisor) => {
    if (selectedAdvisors.find(a => a.id === advisor.id)) {
      setSelectedAdvisors(prev => prev.filter(a => a.id !== advisor.id));
    } else if (selectedAdvisors.length < maxSelections) {
      setSelectedAdvisors(prev => [...prev, advisor]);
    }
  };

  const handleHire = () => {
    if (selectedAdvisors.length === 0) return;

    const advisorsWithStatus: AdvisorWithStatus[] = selectedAdvisors.map(advisor => ({
      ...advisor,
      isActive: true,
      turnsInactive: 0
    }));

    onHire(advisorsWithStatus);
  };

  const totalCost = selectedAdvisors.reduce((sum, advisor) => sum + advisor.cost, 0);
  const canAfford = gameState.budget >= totalCost;

  const isAdvisorAvailable = (advisor: Advisor) => {
    if (!advisor.unlockRequirement) return true;
    if (advisor.unlockRequirement.type === 'popularity') {
      return gameState.popularity >= advisor.unlockRequirement.value;
    }
    return true;
  };

  const availableForHire = availableAdvisors.filter(isAdvisorAvailable);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-4xl max-h-[80vh] overflow-hidden">
        <div className="p-4 bg-blue-900 text-white flex justify-between items-center">
          <h2 className="text-xl font-bold">Contratar Asesores</h2>
          <button onClick={onClose} className="p-1 hover:bg-blue-800 rounded">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-4 overflow-y-auto max-h-[60vh]">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {availableForHire.map((advisor) => {
              const isSelected = selectedAdvisors.some(a => a.id === advisor.id);
              const popularityIndicators = getPopularityIndicator(advisor.popularityEffect);
              const budgetIndicators = getBudgetIndicator(advisor.cost);
              
              return (
                <button
                  key={advisor.id}
                  onClick={() => handleAdvisorSelect(advisor)}
                  disabled={!isSelected && selectedAdvisors.length >= maxSelections}
                  className={`p-4 border rounded-lg text-left transition-all ${
                    isSelected
                      ? 'border-blue-500 bg-blue-50'
                      : selectedAdvisors.length >= maxSelections
                      ? 'border-gray-200 bg-gray-50 opacity-50 cursor-not-allowed'
                      : 'border-gray-200 hover:border-blue-300'
                  }`}
                >
                  <div className="flex justify-between items-start gap-3">
                    <div className="flex gap-3">
                      <img
                        src={getAdvisorPortrait(advisor.specialty)}
                        alt={advisor.name}
                        className="w-16 h-16 rounded-lg object-cover bg-gray-100 flex-shrink-0"
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold">{advisor.name}</h3>
                          <div className="flex items-center gap-1">
                            <Award className="w-4 h-4 text-yellow-500" />
                            <span className="text-sm font-medium">Nivel {advisor.level}</span>
                          </div>
                        </div>
                        <p className="text-sm text-gray-600">{advisor.specialty}</p>
                        <p className="text-sm text-gray-500 mt-1">{advisor.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 text-yellow-500 flex-shrink-0">
                      <Star className="w-4 h-4 fill-current" />
                      <span className="text-sm">{advisor.influence}</span>
                    </div>
                  </div>
                  
                  <div className="mt-2 space-y-2">
                    <div className="flex gap-4 text-sm">
                      <span className="text-blue-600">+{advisor.bonusActions} acciones</span>
                      <div className="flex items-center gap-1 text-green-600">
                        <span>Popularidad</span>
                        {popularityIndicators.map((indicator, index) => (
                          <span key={index}>{indicator}</span>
                        ))}
                      </div>
                      <div className="flex items-center gap-1 text-red-600">
                        <span>Costo</span>
                        {budgetIndicators.map((indicator, index) => (
                          <span key={index}>{indicator}</span>
                        ))}
                      </div>
                    </div>

                    <div className="text-sm">
                      <p className="font-medium">Bonificaciones:</p>
                      <ul className="list-disc pl-5 space-y-1">
                        {Object.entries(advisor.policyModifiers).map(([category, modifier]) => (
                          <li key={category}>
                            +{Math.round((modifier - 1) * 100)}% efectividad en {category}
                          </li>
                        ))}
                        {Object.entries(advisor.groupBonuses).map(([groupId, bonus]) => (
                          <li key={groupId}>
                            +{bonus}% relación con {groupId}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <div className="p-4 border-t bg-gray-50">
          <div className="flex justify-between items-center">
            <div className="text-sm">
              <p>Asesores seleccionados: {selectedAdvisors.length}/{maxSelections}</p>
              <div className="flex items-center gap-1 text-red-600">
                <span>Costo total: ${totalCost}M</span>
                {!canAfford && (
                  <span className="text-xs">(Presupuesto insuficiente)</span>
                )}
              </div>
            </div>
            <button
              onClick={handleHire}
              disabled={selectedAdvisors.length === 0 || !canAfford}
              className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-6 py-2 rounded-lg transition-colors"
            >
              Contratar Seleccionados
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}