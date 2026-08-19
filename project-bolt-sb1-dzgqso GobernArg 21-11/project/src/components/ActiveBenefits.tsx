import { TrendingUp, Building2, Shield, Clock } from 'lucide-react';
import { GameState } from '../types/game';
import { getGlobalTurn } from '../engine/engineShared';

interface ActiveBenefitsProps {
  gameState: GameState;
}

const BENEFIT_ICONS: Record<string, typeof TrendingUp> = {
  incomeModifier: TrendingUp,
  costReduction: Building2,
  stabilityChange: Shield,
  default: Clock,
};

export function ActiveBenefits({ gameState }: ActiveBenefitsProps) {
  const currentGlobalTurn = getGlobalTurn(gameState);
  const activeBenefits = gameState.pendingEffects.filter(
    pe => pe.activationTurn >= currentGlobalTurn &&
      (pe.incomeModifier || pe.costReductionCategory || (pe.stabilityChange && pe.activationTurn > currentGlobalTurn))
  );

  if (activeBenefits.length === 0) return null;

  return (
    <div className="bg-emerald-400/10 border border-emerald-400/20 rounded-lg p-3 mb-4">
      <h3 className="text-sm font-semibold text-emerald-300 mb-2 flex items-center gap-1">
        <TrendingUp className="w-4 h-4" />
        Beneficios activos
      </h3>
      <div className="space-y-1.5">
        {activeBenefits.map(benefit => {
          const turnsLeft = benefit.activationTurn - currentGlobalTurn;
          const Icon = benefit.incomeModifier ? BENEFIT_ICONS.incomeModifier :
                       benefit.costReductionCategory ? BENEFIT_ICONS.costReduction :
                       BENEFIT_ICONS.default;

          let label = '';
          if (benefit.incomeModifier) {
            label = `+${Math.round(benefit.incomeModifier * 100)}% ingresos`;
          } else if (benefit.costReductionCategory) {
            const catName = benefit.costReductionCategory === 'infraestructura' ? 'Infraestructura' :
                           benefit.costReductionCategory;
            label = `-${Math.round((benefit.costReductionPercent ?? 0) * 100)}% costo ${catName}`;
          } else if (benefit.description) {
            label = benefit.description;
          }

          return (
            <div key={benefit.id} className="flex items-center justify-between text-xs text-emerald-300">
              <span className="flex items-center gap-1">
                <Icon className="w-3 h-3" />
                {label}
              </span>
              <span className="text-emerald-400 font-medium">{turnsLeft}t</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
