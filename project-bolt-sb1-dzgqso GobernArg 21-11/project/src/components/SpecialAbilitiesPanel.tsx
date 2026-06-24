import { useCallback, useEffect, useState } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import {
  Zap,
  Clock,
  Coins,
  TrendingUp,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import { GameState, Archetype } from '../types/game';
import type { SpecialAbility } from '../data/specialAbilities';
import { ARCHETYPE_ABILITIES } from '../data/specialAbilities';
import { fmtBudget } from '@/lib/format';

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

const ARCHETYPE_ACCENT: Record<Archetype, string> = {
  politico: 'text-sky-300',
  empresario: 'text-amber-300',
  sindicalista: 'text-red-300',
  comunicador: 'text-purple-300',
};

/**
 * Devuelve todas las habilidades del arquetipo actual.
 * Hoy hay 1 por arquetipo. El componente está preparado para múltiples (carrusel Embla).
 */
function getAbilitiesFor(archetype: Archetype): SpecialAbility[] {
  const ability = ARCHETYPE_ABILITIES[archetype];
  return ability ? [ability] : [];
}

function buildEffectsList(ability: SpecialAbility): string[] {
  const effects: string[] = [];
  const e = ability.effects;
  if (e.popularityChange) {
    effects.push(`${e.popularityChange > 0 ? '+' : ''}${e.popularityChange}% popular.`);
  }
  if (e.budgetChange) {
    const sign = e.budgetChange > 0 ? '+' : '−';
    effects.push(`${sign}${fmtBudget(Math.abs(e.budgetChange))} presup.`);
  }
  if (e.stabilityChange) {
    effects.push(`${e.stabilityChange > 0 ? '+' : ''}${e.stabilityChange} estab.`);
  }
  if (e.legitimacyChange) {
    effects.push(`${e.legitimacyChange > 0 ? '+' : ''}${e.legitimacyChange} legitim.`);
  }
  e.groupEffects?.forEach((ge) => {
    effects.push(
      `${ge.supportChange > 0 ? '+' : ''}${ge.supportChange} ${ge.groupId.replace(/-/g, ' ')}`,
    );
  });
  return effects;
}

interface AbilityCardProps {
  ability: SpecialAbility;
  archetype: Archetype;
  gameState: GameState;
  onUseAbility: () => void;
  disabled: boolean;
}

function AbilityCard({ ability, archetype, gameState, onUseAbility, disabled }: AbilityCardProps) {
  const cooldownLeft = gameState.abilityCooldowns[ability.id] ?? 0;
  const isOnCooldown = cooldownLeft > 0;
  const costActions = ability.cost.actions ?? 0;
  const costBudget = ability.cost.budget ?? 0;
  const costPopularity = ability.cost.popularity ?? 0;
  const costLegitimacy = ability.cost.legitimacy ?? 0;

  const cantAffordActions = gameState.actions < costActions;
  const cantAffordBudget = costBudget > 0 && gameState.budget < costBudget;
  const canUse = !disabled && !isOnCooldown && !cantAffordActions && !cantAffordBudget;

  const effects = buildEffectsList(ability);
  const accent = ARCHETYPE_ACCENT[archetype];
  const cooldownProgress =
    ability.cooldown > 0 ? ((ability.cooldown - cooldownLeft) / ability.cooldown) * 100 : 0;

  return (
    <div className="rounded-lg border border-border bg-card p-4 space-y-3">
      <div className="flex items-center gap-2.5">
        <div className="w-9 h-9 rounded-md bg-primary/15 border border-primary/25 flex items-center justify-center flex-shrink-0">
          <Sparkles size={16} className="text-primary" />
        </div>
        <div className="min-w-0">
          <h3 className="font-display font-bold text-[14px] text-foreground leading-tight uppercase tracking-wide">
            {ability.name}
          </h3>
          <p className={`text-[10px] uppercase tracking-widest font-semibold ${accent}`}>
            Habilidad · {ARCHETYPE_LABELS[archetype]}
          </p>
        </div>
      </div>

      <p className="text-[12px] text-foreground/70 leading-relaxed">{ability.description}</p>

      <div className="flex flex-wrap gap-1.5">
        {costActions > 0 && (
          <span
            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] border ${
              cantAffordActions
                ? 'border-red-400/30 bg-red-400/10 text-red-300'
                : 'border-border bg-white/3 text-muted-foreground'
            }`}
          >
            <Zap size={9} />
            {costActions} acc.
          </span>
        )}
        {costBudget > 0 && (
          <span
            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] border ${
              cantAffordBudget
                ? 'border-red-400/30 bg-red-400/10 text-red-300'
                : 'border-border bg-white/3 text-muted-foreground'
            }`}
          >
            <Coins size={9} />
            {fmtBudget(costBudget)}
          </span>
        )}
        {costPopularity !== 0 && (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] border border-border bg-white/3 text-muted-foreground">
            <TrendingUp size={9} />
            {costPopularity > 0 ? '−' : '+'}
            {Math.abs(costPopularity)}% pop.
          </span>
        )}
        {costLegitimacy !== 0 && (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] border border-border bg-white/3 text-muted-foreground">
            <AlertTriangle size={9} />
            {costLegitimacy > 0 ? '−' : '+'}
            {Math.abs(costLegitimacy)} legitim.
          </span>
        )}
      </div>

      {effects.length > 0 && (
        <div>
          <div className="text-[9px] text-muted-foreground uppercase tracking-widest font-semibold mb-1">
            Efectos
          </div>
          <ul className="grid grid-cols-2 gap-0.5">
            {effects.map((effect, i) => (
              <li key={i} className="text-[11px] text-foreground/70 flex items-center gap-1.5">
                <span className="w-1 h-1 rounded-full bg-emerald-400 inline-block flex-shrink-0" />
                {effect}
              </li>
            ))}
          </ul>
        </div>
      )}

      {isOnCooldown && (
        <div>
          <div className="flex items-center justify-between text-[10px] text-muted-foreground mb-1">
            <span className="inline-flex items-center gap-1">
              <Clock size={9} />
              En enfriamiento
            </span>
            <span className="font-mono">
              {cooldownLeft} turno{cooldownLeft > 1 ? 's' : ''}
            </span>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full rounded-full bg-primary transition-all duration-500"
              style={{ width: `${cooldownProgress}%` }}
            />
          </div>
        </div>
      )}

      <button
        onClick={onUseAbility}
        disabled={!canUse}
        className={`w-full inline-flex items-center justify-center gap-2 py-2 rounded font-display text-[12px] font-bold uppercase tracking-wide transition-all ${
          canUse
            ? 'bg-primary hover:bg-primary/90 text-primary-foreground shadow'
            : 'bg-white/5 text-muted-foreground cursor-not-allowed border border-border'
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
        <Zap size={12} />
        {isOnCooldown ? `Disponible en ${cooldownLeft}t` : `Usar ${ability.name}`}
      </button>
    </div>
  );
}

export function SpecialAbilitiesPanel({
  gameState,
  onUseAbility,
  disabled,
}: SpecialAbilitiesPanelProps) {
  const abilities = getAbilitiesFor(gameState.archetype);
  const multiple = abilities.length > 1;

  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: false, align: 'start' });
  const [selectedIndex, setSelectedIndex] = useState(0);

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    const onSelect = () => setSelectedIndex(emblaApi.selectedScrollSnap());
    emblaApi.on('select', onSelect);
    onSelect();
    return () => {
      emblaApi.off('select', onSelect);
    };
  }, [emblaApi]);

  if (abilities.length === 0) return null;

  // Caso 1: una sola habilidad → card directa sin carrusel
  if (!multiple) {
    return (
      <AbilityCard
        ability={abilities[0]}
        archetype={gameState.archetype}
        gameState={gameState}
        onUseAbility={onUseAbility}
        disabled={disabled}
      />
    );
  }

  // Caso 2: 2+ habilidades → carrusel Embla
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles size={13} className="text-primary" />
          <h2 className="font-display text-[13px] uppercase tracking-widest text-foreground font-bold">
            Habilidades de {ARCHETYPE_LABELS[gameState.archetype]}
          </h2>
        </div>
        <span className="text-[10px] text-muted-foreground font-mono">
          {selectedIndex + 1} / {abilities.length}
        </span>
      </div>

      <div className="relative">
        <div className="overflow-hidden" ref={emblaRef}>
          <div className="flex gap-3">
            {abilities.map((ability) => (
              <div key={ability.id} className="flex-[0_0_100%] min-w-0">
                <AbilityCard
                  ability={ability}
                  archetype={gameState.archetype}
                  gameState={gameState}
                  onUseAbility={onUseAbility}
                  disabled={disabled}
                />
              </div>
            ))}
          </div>
        </div>

        <button
          onClick={scrollPrev}
          aria-label="Habilidad anterior"
          className="absolute left-2 top-1/2 -translate-y-1/2 inline-flex items-center justify-center w-8 h-8 rounded-full bg-background/80 border border-border text-foreground/80 hover:text-foreground hover:bg-background transition-colors backdrop-blur-sm"
        >
          <ChevronLeft size={16} />
        </button>
        <button
          onClick={scrollNext}
          aria-label="Habilidad siguiente"
          className="absolute right-2 top-1/2 -translate-y-1/2 inline-flex items-center justify-center w-8 h-8 rounded-full bg-background/80 border border-border text-foreground/80 hover:text-foreground hover:bg-background transition-colors backdrop-blur-sm"
        >
          <ChevronRight size={16} />
        </button>
      </div>

      <div className="flex justify-center gap-1.5">
        {abilities.map((_, idx) => (
          <button
            key={idx}
            onClick={() => emblaApi?.scrollTo(idx)}
            aria-label={`Ir a habilidad ${idx + 1}`}
            className={`h-1.5 rounded-full transition-all ${
              idx === selectedIndex ? 'w-6 bg-primary' : 'w-1.5 bg-white/20 hover:bg-white/40'
            }`}
          />
        ))}
      </div>
    </div>
  );
}
