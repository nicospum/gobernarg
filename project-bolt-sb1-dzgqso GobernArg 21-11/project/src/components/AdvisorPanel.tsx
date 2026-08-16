import { useState } from 'react';
import { UserPlus, UserMinus, Star, TrendingUp, Award } from 'lucide-react';
import { GameState, AdvisorWithStatus } from '../types/game';
import { AdvisorSelectionModal } from './AdvisorSelectionModal';
import { AdvisorDismissModal } from './AdvisorDismissModal';
import { getAdvisorPortrait } from '../utils/imageAssets';


interface AdvisorPanelProps {
  gameState: GameState;
  onHireAdvisor: (advisors: AdvisorWithStatus[]) => void;
  onDismissAdvisor: (advisor: AdvisorWithStatus) => void;
}

function getPopularityIndicator(popularityChange: number) {
  if (popularityChange >= 20) return Array(3).fill(<TrendingUp className="w-4 h-4" />);
  if (popularityChange >= 15) return Array(2).fill(<TrendingUp className="w-4 h-4" />);
  return [<TrendingUp className="w-4 h-4" />];
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
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
            >
              <UserMinus className="w-5 h-5" />
              <span>Despedir Asesor</span>
            </button>
          )}
          {!gameState.advisorActionUsed && gameState.advisors.length < 2 && (
            <button
              onClick={() => setShowHireModal(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
            >
              <UserPlus className="w-5 h-5" />
              <span>Contratar Asesor{maxAdvisorsToHire > 1 ? 'es' : ''}</span>
            </button>
          )}
        </div>
      </div>

      <div className="space-y-4">
        {gameState.advisors.length === 0 ? (
          <p className="text-gray-500 text-center py-8">
            No hay asesores contratados. ¡Contrata hasta 2 asesores para mejorar tu gobierno!
          </p>
        ) : (
          gameState.advisors.map((advisor) => {
            const popularityIndicators = getPopularityIndicator(advisor.popularityEffect);
            
            return (
              <div
                key={advisor.id}
                className={`p-4 border rounded-lg ${
                  advisor.isActive ? 'bg-blue-50' : 'bg-gray-50'
                }`}
              >
                <div className="flex justify-between items-start gap-3">
                  <div className="flex gap-3">
                    <img
                      src={getAdvisorPortrait(advisor.specialty)}
                      alt={advisor.name}
                      className="w-14 h-14 rounded-lg object-cover bg-white flex-shrink-0"
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
                <div className="mt-2 text-sm">
                  <div className="flex items-center gap-1 text-green-600">
                    <span>Popularidad</span>
                    {advisor.isActive && popularityIndicators.map((indicator, index) => (
                      <span key={index}>{indicator}</span>
                    ))}
                  </div>
                  <p>Acciones extra: {advisor.isActive ? `+${advisor.bonusActions}` : '0'}</p>
                  <p className={advisor.isActive ? 'text-green-600' : 'text-gray-600'}>
                    Estado: {advisor.isActive ? 'Activo' : `Inactivo por ${advisor.turnsInactive} turnos más`}
                  </p>
                  {advisor.isActive && (
                    <>
                      <p className="mt-2 font-medium">Bonificaciones:</p>
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