import { AlertTriangle, Clock, Zap } from 'lucide-react';
import type { PendingEffect } from '../types/game';
import {
  EFFECT_TYPE_PALETTE,
  describeEffectImpact,
  inferEffectType,
  isInformeEffect,
  isPositiveEffect,
  isUrgentEffect,
} from '@/lib/effect-helpers';

interface PendingEffectsPanelProps {
  effects: PendingEffect[];
  currentTurn: number;
}

function EffectCard({
  effect,
  currentTurn,
}: {
  effect: PendingEffect;
  currentTurn: number;
}) {
  const turnsLeft = Math.max(0, effect.activationTurn - currentTurn);
  const urgent = isUrgentEffect(effect, currentTurn);
  const positive = isPositiveEffect(effect);
  const type = inferEffectType(effect);
  const palette = EFFECT_TYPE_PALETTE[type];
  const containerCls = urgent
    ? 'border-red-400/25 bg-red-400/5'
    : positive
      ? 'border-emerald-400/15 bg-emerald-400/4'
      : 'border-border bg-card';

  return (
    <div className={`rounded-lg border p-3 ${containerCls}`}>
      <div className="flex items-start justify-between gap-2 mb-1.5">
        <div className="font-display font-semibold text-[13px] text-foreground leading-tight">
          {effect.description ?? 'Efecto en curso'}
        </div>
        {urgent && <AlertTriangle size={12} className="text-red-400 flex-shrink-0 mt-0.5" />}
      </div>

      {effect.source && (
        <div className="text-[10px] text-muted-foreground mb-1.5 truncate">↳ {effect.source}</div>
      )}

      <div className="flex items-center justify-between gap-2 mb-1.5 flex-wrap">
        <span
          className={`inline-flex items-center text-[9px] px-1.5 py-0.5 rounded border font-semibold uppercase tracking-wide ${palette.cls}`}
        >
          {palette.label}
        </span>
        <div className="flex items-center gap-1.5">
          <Clock size={9} className={turnsLeft <= 1 ? 'text-red-400' : 'text-muted-foreground'} />
          <span
            className={`text-[10px] font-mono ${
              turnsLeft <= 1 ? 'text-red-400' : 'text-muted-foreground'
            }`}
          >
            {turnsLeft}t restante{turnsLeft !== 1 ? 's' : ''}
          </span>
        </div>
      </div>

      <div className="flex gap-1.5 items-start text-[11px] text-foreground/70">
        <Zap size={9} className="text-muted-foreground/60 mt-0.5 flex-shrink-0" />
        <span className="leading-snug">{describeEffectImpact(effect)}</span>
      </div>
    </div>
  );
}

export function PendingEffectsPanel({ effects, currentTurn }: PendingEffectsPanelProps) {
  // Solo efectos cortos (duración < 4). Los largos van a InformesPanel.
  const shortEffects = effects.filter((e) => !isInformeEffect(e));

  if (shortEffects.length === 0) return null;

  const urgent = shortEffects.filter((e) => isUrgentEffect(e, currentTurn));
  const active = shortEffects.filter((e) => !isUrgentEffect(e, currentTurn));

  return (
    <section className="rounded-lg border border-border bg-card overflow-hidden">
      <header className="flex items-center justify-between px-4 py-2.5 border-b border-border">
        <h2 className="font-display font-bold text-[13px] uppercase tracking-widest text-foreground">
          Efectos Activos
        </h2>
        <span className="text-[11px] text-muted-foreground font-mono">{shortEffects.length}</span>
      </header>

      <div className="p-3 space-y-3 max-h-[420px] overflow-y-auto">
        {urgent.length > 0 && (
          <div className="space-y-2">
            <h3 className="text-[9px] uppercase tracking-widest text-red-400/70 font-semibold px-0.5">
              Urgentes
            </h3>
            {urgent.map((effect) => (
              <EffectCard key={effect.id} effect={effect} currentTurn={currentTurn} />
            ))}
          </div>
        )}

        {active.length > 0 && (
          <div className="space-y-2">
            {urgent.length > 0 && (
              <h3 className="text-[9px] uppercase tracking-widest text-muted-foreground font-semibold px-0.5">
                En curso
              </h3>
            )}
            {active.map((effect) => (
              <EffectCard key={effect.id} effect={effect} currentTurn={currentTurn} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
