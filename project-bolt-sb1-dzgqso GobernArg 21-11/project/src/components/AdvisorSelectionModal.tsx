import { useState } from 'react';
import { X, Star, TrendingUp, TrendingDown, Minus, DollarSign, Award } from 'lucide-react';
import { Advisor, AdvisorWithStatus, GameState } from '../types/game';
import { availableAdvisors } from '../data/advisors';
import { getAdvisorPortrait } from '../utils/imageAssets';
import { ADVISOR_ROLES } from '../data/advisors';
import { fmtBudget } from '@/lib/format';

interface AdvisorSelectionModalProps {
  onClose: () => void;
  onHire: (selectedAdvisors: AdvisorWithStatus[]) => void;
  maxSelections: number;
  gameState: GameState;
}

function getPopularityIndicator(popularityChange: number) {
  // FIX (Punto 15): antes siempre devolvía TrendingUp verde, aunque el efecto
  // del asesor fuera negativo o neutro. Ahora ícono y color reflejan el signo;
  // la cantidad de íconos (1-3 por magnitud) se mantiene.
  const count = popularityChange >= 20 ? 3 : popularityChange >= 15 ? 2 : 1;
  if (popularityChange < 0) {
    return Array(count).fill(<TrendingDown className="w-4 h-4 text-red-400" />);
  }
  if (popularityChange === 0) {
    return Array(count).fill(<Minus className="w-4 h-4 text-muted-foreground" />);
  }
  return Array(count).fill(<TrendingUp className="w-4 h-4 text-emerald-400" />);
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
  const canAfford = gameState.causal.caja >= totalCost;

  const isAdvisorAvailable = (advisor: Advisor) => {
    if (!advisor.unlockRequirement) return true;
    if (advisor.unlockRequirement.type === 'popularity') {
      // Se desbloquea con la aprobación de gestión (APRO).
      return gameState.causal.political.apro >= advisor.unlockRequirement.value;
    }
    return true;
  };

  const availableForHire = availableAdvisors.filter(isAdvisorAvailable);

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-card border border-border rounded-xl w-full max-w-4xl max-h-[85vh] overflow-hidden shadow-2xl">
        <div className="px-5 py-4 border-b border-border flex justify-between items-center">
          <h2 className="font-display text-xl font-bold uppercase tracking-wide text-foreground">Contratar Asesores</h2>
          <button onClick={onClose} aria-label="Cerrar" className="p-1 text-muted-foreground hover:text-foreground rounded transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 overflow-y-auto max-h-[60vh]">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {availableForHire.map((advisor) => {
              const isSelected = selectedAdvisors.some(a => a.id === advisor.id);
              const popularityIndicators = getPopularityIndicator((ADVISOR_ROLES[advisor.id]?.imagenOnHire ?? 0) * 5);
              const budgetIndicators = getBudgetIndicator(advisor.cost);
              
              return (
                <button
                  key={advisor.id}
                  onClick={() => handleAdvisorSelect(advisor)}
                  disabled={!isSelected && selectedAdvisors.length >= maxSelections}
                  className={`p-4 border rounded-lg text-left transition-all ${
                    isSelected
                      ? 'border-primary bg-primary/10'
                      : selectedAdvisors.length >= maxSelections
                      ? 'border-border bg-card opacity-50 cursor-not-allowed'
                      : 'border-border bg-card hover:border-primary/40 hover:bg-white/3'
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
                        <p className="text-sm text-foreground/70">{advisor.specialty}</p>
                        <p className="text-sm text-muted-foreground mt-1">{advisor.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 text-yellow-500 flex-shrink-0">
                      <Star className="w-4 h-4 fill-current" />
                      <span className="text-sm">{advisor.influence}</span>
                    </div>
                  </div>
                  
                  <div className="mt-2 space-y-2">
                    <div className="flex gap-4 text-sm">
                      <span className="text-muted-foreground">Sueldo {fmtBudget(ADVISOR_ROLES[advisor.id]?.salary ?? 0)}/turno</span>
                      {/* Punto 15: el color lo llevan los íconos (signo del
                          efecto), no el contenedor — antes todo se veía verde. */}
                      <div className="flex items-center gap-1">
                        <span>Imagen</span>
                        {popularityIndicators.map((indicator, index) => (
                          <span key={index}>{indicator}</span>
                        ))}
                      </div>
                      <div className="flex items-center gap-1 text-red-400">
                        <span>Costo</span>
                        {budgetIndicators.map((indicator, index) => (
                          <span key={index}>{indicator}</span>
                        ))}
                      </div>
                    </div>

                    <div className="text-sm">
                      <p className="font-medium">Qué aporta:</p>
                      <ul className="list-disc pl-5 space-y-1 text-[12px] text-foreground/80">
                        {(ADVISOR_ROLES[advisor.id]?.perks ?? []).map(perk => (
                          <li key={perk}>{perk}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <div className="px-5 py-4 border-t border-border">
          <div className="flex justify-between items-center">
            <div className="text-sm">
              <p className="text-foreground">Asesores seleccionados: {selectedAdvisors.length}/{maxSelections}</p>
              <div className={`flex items-center gap-1 ${canAfford ? 'text-muted-foreground' : 'text-red-400'}`}>
                <span>Costo total: ${totalCost}M</span>
                {!canAfford && (
                  <span className="text-xs">(Presupuesto insuficiente)</span>
                )}
              </div>
            </div>
            <button
              onClick={handleHire}
              disabled={selectedAdvisors.length === 0 || !canAfford}
              className="bg-primary hover:bg-primary/90 disabled:bg-white/5 disabled:text-muted-foreground disabled:cursor-not-allowed text-primary-foreground px-6 py-2 rounded font-display font-bold uppercase tracking-wide text-sm transition-colors"
            >
              Contratar Seleccionados
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}