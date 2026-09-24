import { useCallback, useEffect, useState } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import {
  Zap,
  Clock,
  Coins,
  TrendingUp,
  ChevronLeft,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import { GameState, Archetype } from '../types/game';
import type { SpecialAbility } from '../data/specialAbilities';
import { ARCHETYPE_ABILITIES } from '../data/specialAbilities';
import { fmtBudget } from '@/lib/format';
import { effectChip, toneClass, type EffectChip } from '@/lib/causalText';

interface SpecialAbilitiesPanelProps {
  gameState: GameState;
  onUseAbility: (abilityId: string) => void;
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
 * Hay 2 por arquetipo: se muestran en un carrusel Embla.
 */
function getAbilitiesFor(archetype: Archetype): SpecialAbility[] {
  return ARCHETYPE_ABILITIES[archetype] ?? [];
}

function buildEffectsList(ability: SpecialAbility): EffectChip[] {
  return ability.effects.map(e => {
    const chip = effectChip(e.target, e.value);
    return e.mode === 'BONUS' ? { ...chip, text: `${chip.text} (${e.duration ?? 1}t)` } : chip;
  });
}

interface AbilityCardProps {
  ability: SpecialAbility;
  archetype: Archetype;
  gameState: GameState;
  onUseAbility: (abilityId: string) => void;
  disabled: boolean;
}

function AbilityCard({ ability, archetype, gameState, onUseAbility, disabled }: AbilityCardProps) {
  const cooldownLeft = gameState.abilityCooldowns[ability.id] ?? 0;
  const isOnCooldown = cooldownLeft > 0;
  const costActions = ability.cost.actions ?? 0;
  const costBudget = ability.cost.budget ?? 0;
  const costImagen = ability.cost.imagen ?? 0;

  const cantAffordActions = gameState.actions < costActions;
  const cantAffordBudget = costBudget > 0 && gameState.causal.caja < costBudget;
  const canUse = !disabled && !isOnCooldown && !cantAffordActions && !cantAffordBudget;

  const effects = buildEffectsList(ability);
  const accent = ARCHETYPE_ACCENT[archetype];
  const cooldownProgress =
    ability.cooldown > 0 ? ((ability.cooldown - cooldownLeft) / ability.cooldown) * 100 : 0;

  return (
    <div className="rounded-xl border border-white/8 bg-[#0f1e38] p-4 space-y-3.5 shadow-lg">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-blue-500/15 border border-blue-500/25 flex items-center justify-center flex-shrink-0">
          <Sparkles size={18} className="text-blue-400" />
        </div>
        <div className="min-w-0">
          <h3 className="font-['Barlow_Condensed'] font-bold text-lg text-white leading-tight uppercase tracking-wider">
            {ability.name}
          </h3>
          <p className={`text-[10px] uppercase tracking-widest font-bold ${accent}`}>
            HABILIDAD DE {ARCHETYPE_LABELS[archetype].toUpperCase()}
          </p>
        </div>
      </div>

      <p className="text-[12px] text-white/70 leading-relaxed">{ability.description}</p>

      <div className="flex flex-wrap gap-2">
        {costActions > 0 && (
          <span
            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-mono font-bold border ${
              cantAffordActions
                ? 'border-red-400/30 bg-red-400/10 text-red-300'
                : 'border-blue-500/20 bg-blue-500/10 text-blue-300'
            }`}
          >
            <Zap size={11} />
            {costActions} acc.
          </span>
        )}
        {costBudget > 0 && (
          <span
            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-mono font-bold border ${
              cantAffordBudget
                ? 'border-red-400/30 bg-red-400/10 text-red-300'
                : 'border-emerald-500/20 bg-emerald-500/10 text-emerald-300'
            }`}
          >
            <Coins size={11} />
            {fmtBudget(costBudget)}
          </span>
        )}
        {costImagen !== 0 && (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-mono font-bold border border-white/8 bg-white/4 text-white/70">
            <TrendingUp size={11} />
            Costo imagen
          </span>
        )}
      </div>

      {effects.length > 0 && (
        <div className="bg-[#091422] p-3 rounded-lg border border-white/6">
          <div className="text-[9px] text-white/40 uppercase tracking-widest font-bold mb-1.5">
            EFECTOS
          </div>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1">
            {effects.map((effect, i) => (
              <li key={i} className="text-[11px] text-white/80 flex items-center gap-1.5 font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block flex-shrink-0" />
                {effect.label} <span className={`font-mono font-bold ${toneClass(effect.tone)}`}>{effect.text}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {isOnCooldown && (
        <div>
          <div className="flex items-center justify-between text-[10px] text-white/50 mb-1 font-mono">
            <span className="inline-flex items-center gap-1">
              <Clock size={10} />
              Enfriamiento activo
            </span>
            <span>
              {cooldownLeft} turno{cooldownLeft > 1 ? 's' : ''}
            </span>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/8">
            <div
              className="h-full rounded-full bg-blue-500 transition-all duration-500"
              style={{ width: `${cooldownProgress}%` }}
            />
          </div>
        </div>
      )}

      <button
        onClick={() => onUseAbility(ability.id)}
        disabled={!canUse}
        className={`w-full inline-flex items-center justify-center gap-2 py-2.5 rounded-lg font-['Barlow_Condensed'] text-[14px] font-bold uppercase tracking-wider transition-all shadow-md ${
          canUse
            ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-600/20 active:translate-y-0.5'
            : 'bg-white/5 text-white/30 cursor-not-allowed border border-white/8'
        }`}
      >
        <Zap size={14} />
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

  return (
    <div className="space-y-2.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles size={14} className="text-blue-400" />
          <h2 className="font-['Barlow_Condensed'] text-sm uppercase tracking-wider text-white font-bold">
            HABILIDADES DE {ARCHETYPE_LABELS[gameState.archetype].toUpperCase()}
          </h2>
        </div>
        {multiple && (
          <span className="text-[10px] text-white/50 font-mono">
            {selectedIndex + 1} / {abilities.length}
          </span>
        )}
      </div>

      {!multiple ? (
        <AbilityCard
          ability={abilities[0]}
          archetype={gameState.archetype}
          gameState={gameState}
          onUseAbility={onUseAbility}
          disabled={disabled}
        />
      ) : (
        <div className="relative">
          <div className="overflow-hidden rounded-xl" ref={emblaRef}>
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
            className="absolute left-2 top-1/2 -translate-y-1/2 inline-flex items-center justify-center w-8 h-8 rounded-full bg-[#070e17]/80 border border-white/12 text-white/80 hover:text-white hover:bg-[#070e17] transition-colors backdrop-blur-sm"
          >
            <ChevronLeft size={16} />
          </button>
          <button
            onClick={scrollNext}
            aria-label="Habilidad siguiente"
            className="absolute right-2 top-1/2 -translate-y-1/2 inline-flex items-center justify-center w-8 h-8 rounded-full bg-[#070e17]/80 border border-white/12 text-white/80 hover:text-white hover:bg-[#070e17] transition-colors backdrop-blur-sm"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      )}
    </div>
  );
}
