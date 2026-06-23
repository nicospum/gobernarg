import { Zap, Clock, Coins, TrendingUp, Users, AlertTriangle } from 'lucide-react';
import { GameState, Archetype } from '../types/game';
import { ARCHETYPE_ABILITIES } from '../data/specialAbilities';

interface SpecialAbilitiesPanelProps {
  gameState: GameState;
  onUseAbility: () => void;
  disabled: boolean;
}

const ARCHETYPE_LABELS: Record<Archetype, string> = {
  politico: 'Político de Raza',
  empresario: 'Empresario',
  sindicalista: 'Sindicalista',
  comunicador: 'Comunicador',
};

const ARCHETYPE_COLORS: Record<Archetype, { border: string; bg: string; text: string; accent: string }> = {
  politico: { border: 'border-blue-300', bg: 'bg-blue-50', text: 'text-blue-800', accent: 'bg-blue-600' },
  empresario: { border: 'border-amber-300', bg: 'bg-amber-50', text: 'text-amber-800', accent: 'bg-amber-600' },
  sindicalista: { border: 'border-red-300', bg: 'bg-red-50', text: 'text-red-800', accent: 'bg-red-600' },
  comunicador: { border: 'border-purple-300', bg: 'bg-purple-50', text: 'text-purple-800', accent: 'bg-purple-600' },
};

export function SpecialAbilitiesPanel({ gameState, onUseAbility, disabled }: SpecialAbilitiesPanelProps) {
  const ability = ARCHETYPE_ABILITIES[gameState.archetype];
  if (!ability) return null;

  const cooldownLeft = gameState.abilityCooldowns[ability.id] ?? 0;
  const isOnCooldown = cooldownLeft > 0;
  const costActions = ability.cost.actions ?? 0;
  const costBudget = ability.cost.budget ?? 0;
  const costPopularity = ability.cost.popularity ?? 0;
  const costLegitimacy = ability.cost.legitimacy ?? 0;

  const cantAffordActions = gameState.actions < costActions;
  const cantAffordBudget = costBudget > 0 && gameState.budget < costBudget;

  const canUse = !disabled && !isOnCooldown && !cantAffordActions && !cantAffordBudget;

  const colors = ARCHETYPE_COLORS[gameState.archetype];

  const effectsList: string[] = [];
  if (ability.effects.popularityChange) {
    effectsList.push(`${ability.effects.popularityChange > 0 ? '+' : ''}${ability.effects.popularityChange}% popularidad`);
  }
  if (ability.effects.budgetChange) {
    effectsList.push(`${ability.effects.budgetChange > 0 ? '+' : ''}$${ability.effects.budgetChange}M presupuesto`);
  }
  if (ability.effects.stabilityChange) {
    effectsList.push(`${ability.effects.stabilityChange > 0 ? '+' : ''}${ability.effects.stabilityChange} estabilidad`);
  }
  if (ability.effects.legitimacyChange) {
    effectsList.push(`${ability.effects.legitimacyChange > 0 ? '+' : ''}${ability.effects.legitimacyChange} legitimidad`);
  }
  if (ability.effects.groupEffects) {
    ability.effects.groupEffects.forEach(ge => {
      const label = ge.supportChange > 0 ? 'apoyo' : 'apoyo';
      effectsList.push(`${ge.supportChange > 0 ? '+' : ''}${ge.supportChange} ${label} ${ge.groupId.replace(/-/g, ' ')}`);
    });
  }

  return (
    <div className={`${colors.bg} ${colors.border} border rounded-xl p-4 mb-4`}>
      <div className="flex items-center gap-2 mb-3">
        <div className={`${colors.accent} text-white p-1.5 rounded-lg`}>
          <Zap className="w-5 h-5" />
        </div>
        <div>
          <h3 className={`font-bold text-sm ${colors.text}`}>
            {ability.name}
          </h3>
          <p className="text-xs text-gray-500">
            Habilidad de {ARCHETYPE_LABELS[gameState.archetype]}
          </p>
        </div>
      </div>

      <p className="text-sm text-gray-700 mb-3 leading-relaxed">
        {ability.description}
      </p>

      {/* Costos */}
      <div className="flex flex-wrap gap-2 mb-3">
        {costActions > 0 && (
          <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium ${
            cantAffordActions ? 'bg-red-100 text-red-700' : 'bg-white/70 text-gray-700'
          }`}>
            <Zap className="w-3 h-3" />
            {costActions} acción{costActions > 1 ? 'es' : ''}
          </span>
        )}
        {costBudget > 0 && (
          <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium ${
            cantAffordBudget ? 'bg-red-100 text-red-700' : 'bg-white/70 text-gray-700'
          }`}>
            <Coins className="w-3 h-3" />
            ${costBudget}M
          </span>
        )}
        {costPopularity !== 0 && (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium bg-white/70 text-gray-700">
            <TrendingUp className="w-3 h-3" />
            {costPopularity > 0 ? '-' : '+'}{Math.abs(costPopularity)}% pop.
          </span>
        )}
        {costLegitimacy !== 0 && (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium bg-white/70 text-gray-700">
            <AlertTriangle className="w-3 h-3" />
            {costLegitimacy > 0 ? '-' : '+'}{Math.abs(costLegitimacy)} legit.
          </span>
        )}
      </div>

      {/* Efectos */}
      {effectsList.length > 0 && (
        <div className="mb-3">
          <p className="text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wide">Efectos</p>
          <ul className="space-y-0.5">
            {effectsList.map((effect, i) => (
              <li key={i} className="text-xs text-gray-600 flex items-center gap-1">
                <span className="w-1 h-1 rounded-full bg-green-500 inline-block"></span>
                {effect}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Cooldown bar */}
      {isOnCooldown && (
        <div className="mb-3">
          <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              En enfriamiento
            </span>
            <span>{cooldownLeft} turno{cooldownLeft > 1 ? 's' : ''} restante{cooldownLeft > 1 ? 's' : ''}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all duration-300 ${colors.accent}`}
              style={{ width: `${((ability.cooldown - cooldownLeft) / ability.cooldown) * 100}%` }}
            />
          </div>
        </div>
      )}

      {/* Botón */}
      <button
        onClick={onUseAbility}
        disabled={!canUse}
        className={`w-full py-2.5 rounded-lg font-semibold text-sm transition-all flex items-center justify-center gap-2 ${
          canUse
            ? `${colors.accent} text-white hover:opacity-90 active:scale-[0.98] shadow-md`
            : 'bg-gray-200 text-gray-400 cursor-not-allowed'
        }`}
        title={
          isOnCooldown
            ? `Disponible en ${cooldownLeft} turno${cooldownLeft > 1 ? 's' : ''}`
            : cantAffordActions
            ? 'No tenés suficientes acciones'
            : cantAffordBudget
            ? 'Presupuesto insuficiente'
            : disabled
            ? 'No disponible en este momento'
            : `Usar ${ability.name}`
        }
      >
        <Zap className="w-4 h-4" />
        {isOnCooldown
          ? `Disponible en ${cooldownLeft} turno${cooldownLeft > 1 ? 's' : ''}`
          : `Usar ${ability.name}`}
      </button>
    </div>
  );
}
