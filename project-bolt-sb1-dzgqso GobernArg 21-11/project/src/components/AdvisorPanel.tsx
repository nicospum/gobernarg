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
    <div className="bg-[#0f1e38] border border-white/8 rounded-xl p-4 shadow-xl space-y-4">
      <div className="flex justify-between items-center pb-3 border-b border-white/8">
        <div>
          <h2 className="font-['Barlow_Condensed'] font-bold text-lg text-white uppercase tracking-wider">
            GABINETE & ASESORES ({gameState.advisors.length}/2)
          </h2>
          <p className="text-[10px] text-white/50">Equipá tu gobierno con expertos en áreas clave</p>
        </div>
        <div className="flex gap-2">
          {!gameState.advisorActionUsed && gameState.advisors.length > 0 && (
            <button
              onClick={() => setShowDismissModal(true)}
              className="bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/30 px-3 py-1.5 rounded-lg text-[11px] font-bold flex items-center gap-1.5 transition-colors"
            >
              <UserMinus className="w-3.5 h-3.5" />
              <span>Despedir</span>
            </button>
          )}
          {!gameState.advisorActionUsed && gameState.advisors.length < 2 && (
            <button
              onClick={() => setShowHireModal(true)}
              className="bg-blue-600 hover:bg-blue-500 text-white shadow-md shadow-blue-600/20 px-3 py-1.5 rounded-lg text-[11px] font-bold flex items-center gap-1.5 transition-colors"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Contratar</span>
            </button>
          )}
        </div>
      </div>

      <div className="space-y-3">
        {gameState.advisors.length === 0 ? (
          <p className="text-white/40 text-center py-6 text-[12px] bg-[#070e17]/50 rounded-lg border border-white/6 p-4">
            Sin asesores activos. Podés contratar hasta 2 asesores para potenciar la gestión y ganar bonificaciones.
          </p>
        ) : (
          gameState.advisors.map((advisor) => {
            const popularityIndicators = getPopularityIndicator((ADVISOR_ROLES[advisor.id]?.imagenOnHire ?? 0) * 5);
            
            return (
              <div
                key={advisor.id}
                className="p-3.5 border border-white/8 rounded-xl bg-[#091422] space-y-2.5 shadow-md"
              >
                <div className="flex justify-between items-start gap-3">
                  <div className="flex gap-3">
                    <img
                      src={getAdvisorPortrait(advisor.specialty)}
                      alt={advisor.name}
                      className="w-12 h-12 rounded-lg object-cover bg-white/5 border border-white/12 flex-shrink-0"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-['Barlow_Condensed'] font-bold text-base text-white">{advisor.name}</h3>
                        <div className="flex items-center gap-1 text-amber-400 bg-amber-400/10 px-1.5 py-0.2 rounded border border-amber-400/20 text-[10px] font-bold">
                          <Award className="w-3 h-3" />
                          <span>Nivel {advisor.level}</span>
                        </div>
                      </div>
                      <p className="text-[11px] font-semibold text-blue-300">{advisor.specialty}</p>
                      <p className="text-[11px] text-white/60 mt-0.5 line-clamp-2">{advisor.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-amber-400 flex-shrink-0 bg-white/4 px-2 py-1 rounded border border-white/8 font-mono text-[11px]">
                    <Star className="w-3.5 h-3.5 fill-current" />
                    <span>{advisor.influence}</span>
                  </div>
                </div>
                <div className="pt-2 border-t border-white/6 text-[11px] space-y-1">
                  <div className="flex items-center gap-1 text-white/70">
                    <span>Impacto inicial:</span>
                    {popularityIndicators.map((indicator, index) => (
                      <span key={index}>{indicator}</span>
                    ))}
                  </div>
                  <div className="flex items-center justify-between text-[11px] font-mono">
                    <span className="text-white/40">Sueldo: {fmtBudget(ADVISOR_ROLES[advisor.id]?.salary ?? 0)}/t</span>
                    <span className="text-emerald-400 font-bold uppercase tracking-wider">Activo</span>
                  </div>
                  {ADVISOR_ROLES[advisor.id] && (
                    <div className="mt-2 bg-white/4 p-2 rounded border border-white/6">
                      <p className="font-bold text-white/90 text-[10px] uppercase tracking-wider mb-1">Aportes a la gestión:</p>
                      <ul className="space-y-0.5 text-[11px] text-white/70">
                        {ADVISOR_ROLES[advisor.id].perks.map(perk => (
                          <li key={perk} className="flex items-center gap-1.5">
                            <span className="w-1 h-1 rounded-full bg-blue-400 flex-shrink-0" />
                            {perk}
                          </li>
                        ))}
                      </ul>
                    </div>
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