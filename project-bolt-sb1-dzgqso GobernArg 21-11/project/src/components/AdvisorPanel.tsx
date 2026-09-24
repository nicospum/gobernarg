import { useState } from 'react';
import { UserPlus, UserMinus, Star, TrendingUp, TrendingDown, Minus, Award } from 'lucide-react';
import { GameState, AdvisorWithStatus } from '../types/game';
import { AdvisorSelectionModal } from './AdvisorSelectionModal';
import { AdvisorDismissModal } from './AdvisorDismissModal';
import { getAdvisorPortrait } from '../utils/imageAssets';
import { ADVISOR_ROLES } from '../data/advisors';
import { fmtBudget } from '@/lib/format';


interface AdvisorPanelProps {
  gameState: GameState;
  onHireAdvisor: (advisors: AdvisorWithStatus[]) => void;
  onDismissAdvisor: (advisor: AdvisorWithStatus) => void;
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

export function AdvisorPanel({ gameState, onHireAdvisor, onDismissAdvisor }: AdvisorPanelProps) {
  const [showHireModal, setShowHireModal] = useState(false);
  const [showDismissModal, setShowDismissModal] = useState(false);

  const handleHire = (advisors: AdvisorWithStatus[]) => {
    onHireAdvisor(advisors);
    setShowHireModal(false);
  };

  const handleDismiss = (advisor: AdvisorWithStatus) => {
    onDismissAdvisor(advisor);
    setShowDismissModal(false);
  };

  const maxAdvisorsToHire = 2 - gameState.advisors.length;

  return (
    <div className="h-full">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Asesores ({gameState.advisors.length}/2)</h2>
        <div className="flex gap-2">
          {!gameState.advisorActionUsed && gameState.advisors.length > 0 && (
            <button
              onClick={() => setShowDismissModal(true)}
              className="bg-destructive hover:bg-destructive/90 text-destructive-foreground px-4 py-2 rounded-lg flex items-center gap-2"
            >
              <UserMinus className="w-5 h-5" />
              <span>Despedir Asesor</span>
            </button>
          )}
          {!gameState.advisorActionUsed && gameState.advisors.length < 2 && (
            <button
              onClick={() => setShowHireModal(true)}
              className="bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 rounded-lg flex items-center gap-2"
            >
              <UserPlus className="w-5 h-5" />
              <span>Contratar Asesor{maxAdvisorsToHire > 1 ? 'es' : ''}</span>
            </button>
          )}
        </div>
      </div>

      <div className="space-y-4">
        {gameState.advisors.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">
            No hay asesores contratados. ¡Contrata hasta 2 asesores para mejorar tu gobierno!
          </p>
        ) : (
          gameState.advisors.map((advisor) => {
            const popularityIndicators = getPopularityIndicator((ADVISOR_ROLES[advisor.id]?.imagenOnHire ?? 0) * 5);
            
            return (
              <div
                key={advisor.id}
                className={`p-4 border border-border rounded-lg ${
                  advisor.isActive ? 'bg-primary/10' : 'bg-muted'
                }`}
              >
                <div className="flex justify-between items-start gap-3">
                  <div className="flex gap-3">
                    <img
                      src={getAdvisorPortrait(advisor.specialty)}
                      alt={advisor.name}
                      className="w-14 h-14 rounded-lg object-cover bg-muted flex-shrink-0"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">{advisor.name}</h3>
                        <div className="flex items-center gap-1">
                          <Award className="w-4 h-4 text-yellow-500" />
                          <span className="text-sm font-medium">Nivel {advisor.level}</span>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground">{advisor.specialty}</p>
                      <p className="text-sm text-muted-foreground mt-1">{advisor.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-yellow-500 flex-shrink-0">
                    <Star className="w-4 h-4 fill-current" />
                    <span className="text-sm">{advisor.influence}</span>
                  </div>
                </div>
                <div className="mt-2 text-sm">
                  <div className="flex items-center gap-1">
                    <span>Imagen al asumir</span>
                    {popularityIndicators.map((indicator, index) => (
                      <span key={index}>{indicator}</span>
                    ))}
                  </div>
                  <p className="text-muted-foreground text-[12px]">
                    Sueldo: {fmtBudget(ADVISOR_ROLES[advisor.id]?.salary ?? 0)} por turno (gasto corriente)
                  </p>
                  <p className="text-emerald-400 text-[12px]">Estado: En funciones</p>
                  {ADVISOR_ROLES[advisor.id] && (
                    <>
                      <p className="mt-2 font-medium">Qué aporta:</p>
                      <ul className="list-disc pl-5 space-y-1 text-[12px] text-foreground/80">
                        {ADVISOR_ROLES[advisor.id].perks.map(perk => (
                          <li key={perk}>{perk}</li>
                        ))}
                      </ul>
                    </>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {showHireModal && (
        <AdvisorSelectionModal
          onClose={() => setShowHireModal(false)}
          onHire={handleHire}
          maxSelections={maxAdvisorsToHire}
          gameState={gameState}
        />
      )}

      {showDismissModal && (
        <AdvisorDismissModal
          onClose={() => setShowDismissModal(false)}
          onDismiss={(advisor) => handleDismiss(advisor)}
          advisors={gameState.advisors}
        />
      )}
    </div>
  );
}