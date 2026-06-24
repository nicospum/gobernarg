import { Activity, Clock } from 'lucide-react';
import type { PendingEffect } from '../types/game';
import {
  EFFECT_TYPE_PALETTE,
  isInformeEffect,
  pendingEffectToInforme,
  type Informe,
  type Milestone,
} from '@/lib/effect-helpers';

interface InformesPanelProps {
  effects: PendingEffect[];
  currentTurn: number;
}

function MilestoneRow({ milestones }: { milestones: Milestone[] }) {
  return (
    <div className="flex items-center gap-1.5 mt-1">
      {milestones.map((m, idx) => (
        <div key={idx} className="flex flex-col items-center gap-0.5 flex-1 min-w-0">
          <div
            className={`w-2.5 h-2.5 rounded-full border-2 transition-colors ${
              m.completed
                ? 'bg-emerald-400 border-emerald-400'
                : m.isCurrent
                  ? 'bg-primary border-primary animate-pulse'
                  : 'bg-transparent border-border'
            }`}
            title={m.title}
          />
          <span
            className={`text-[8px] font-mono ${
              m.completed
                ? 'text-emerald-400'
                : m.isCurrent
                  ? 'text-primary font-semibold'
                  : 'text-muted-foreground/60'
            }`}
          >
            T{m.turnNumber}
          </span>
        </div>
      ))}
    </div>
  );
}

function InformeCard({ informe }: { informe: Informe }) {
  const palette = EFFECT_TYPE_PALETTE[informe.type];
  const pct = Math.min(100, Math.round((informe.currentProgress / informe.totalTurns) * 100));
  const positive = informe.positive;

  return (
    <article
      className={`rounded-lg border p-3 space-y-2.5 ${
        positive ? 'border-emerald-400/15 bg-emerald-400/4' : 'border-border bg-card'
      }`}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <h3 className="font-display font-semibold text-[13px] text-foreground leading-tight truncate">
            {informe.title}
          </h3>
          {informe.source && informe.source !== informe.title && (
            <div className="text-[10px] text-muted-foreground mt-0.5 truncate">
              ↳ {informe.source}
            </div>
          )}
        </div>
        <span
          className={`inline-flex items-center text-[9px] px-1.5 py-0.5 rounded border font-semibold uppercase tracking-wide flex-shrink-0 ${palette.cls}`}
        >
          {palette.label}
        </span>
      </div>

      {/* Progress bar */}
      <div className="space-y-1">
        <div className="flex items-center justify-between text-[10px] text-muted-foreground">
          <span>
            Progreso {informe.currentProgress}/{informe.totalTurns} turnos
          </span>
          <span className="font-mono">{pct}%</span>
        </div>
        <div className="relative h-1.5 w-full overflow-hidden rounded-full bg-white/10">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              positive ? 'bg-emerald-400' : 'bg-primary'
            }`}
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      {/* Milestones */}
      <MilestoneRow milestones={informe.milestones} />

      {/* Footer: expected impact */}
      <div className="flex items-center gap-2 text-[11px] pt-2 border-t border-border">
        <Activity size={10} className="text-muted-foreground" />
        <span className="text-foreground/70 leading-snug">{informe.expectedImpact}</span>
      </div>
    </article>
  );
}

export function InformesPanel({ effects, currentTurn }: InformesPanelProps) {
  const informes = effects.filter(isInformeEffect).map((e) => pendingEffectToInforme(e, currentTurn));

  if (informes.length === 0) return null;

  return (
    <section className="rounded-lg border border-border bg-card overflow-hidden">
      <header className="flex items-center justify-between px-4 py-2.5 border-b border-border">
        <h2 className="font-display font-bold text-[13px] uppercase tracking-widest text-foreground flex items-center gap-2">
          <Clock size={12} className="text-muted-foreground" />
          Informes de Gestión
        </h2>
        <span className="text-[11px] text-muted-foreground font-mono">{informes.length}</span>
      </header>

      <div className="p-3 space-y-3 max-h-[480px] overflow-y-auto">
        {informes.map((informe) => (
          <InformeCard key={informe.id} informe={informe} />
        ))}
      </div>
    </section>
  );
}
