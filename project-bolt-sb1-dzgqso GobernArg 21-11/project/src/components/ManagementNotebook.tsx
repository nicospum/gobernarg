import { useMemo } from 'react';
import {
  BookOpen,
  Clock,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Zap,
  Calendar,
  TrendingUp,
  DollarSign,
  Building2,
  ScrollText,
  ChevronRight,
  Activity,
} from 'lucide-react';
import type { GameState, GroupAgendaItem, PendingEffect } from '../types/game';
import { actionDefinitions } from '../data/actionRegistry';
import { FIXED_GROUPS, SUBGROUP_TO_GROUP } from '@/lib/groups-mapping';

interface ManagementNotebookProps {
  gameState: GameState;
  onClose: () => void;
}

// ─── Helpers ────────────────────────────────────────────────────────────

/** Resolve demand text: if it's an action ID, return the action title; otherwise return as-is */
function resolveDemandName(demand: string): string {
  const actionDef = actionDefinitions.find((a) => a.id === demand);
  return actionDef ? actionDef.title : demand;
}

/** Get group name for a subgroup ID */
function getGroupName(subgroupId: string): string {
  const allGroups = FIXED_GROUPS;
  for (const g of allGroups) {
    if (g.members.includes(subgroupId)) return g.name;
  }
  return subgroupId;
}

/** Compute penalty: proportional to subgroup influence */
function computePenalty(
  agenda: GroupAgendaItem,
  gameState: GameState,
): number {
  const subgroup = (gameState.interestGroups ?? [])
    .flatMap((g) => g.subgroups)
    .find((sg) => sg.id === agenda.groupId);
  return subgroup?.influence ?? 5;
}

type AgendaStatus = 'pendiente' | 'cumplida' | 'vencida';

function getAgendaStatus(agenda: GroupAgendaItem, currentTurn: number): AgendaStatus {
  if (agenda.satisfied) return 'cumplida';
  if (agenda.penaltyApplied || currentTurn > agenda.deadline) return 'vencida';
  return 'pendiente';
}

const STATUS_STYLES: Record<AgendaStatus, { label: string; cls: string; Icon: typeof CheckCircle }> = {
  pendiente: {
    label: 'Pendiente',
    cls: 'text-amber-400 border-amber-400/30 bg-amber-400/5',
    Icon: Clock,
  },
  cumplida: {
    label: 'Cumplida',
    cls: 'text-emerald-400 border-emerald-400/30 bg-emerald-400/5',
    Icon: CheckCircle,
  },
  vencida: {
    label: 'Vencida',
    cls: 'text-red-400 border-red-400/30 bg-red-400/5',
    Icon: XCircle,
  },
};

// ─── Section 1: Compromisos Asumidos ────────────────────────────────────

function CompromisosSection({ gameState }: { gameState: GameState }) {
  const agendas = gameState.groupAgendas;
  const active = agendas.filter((a) => !a.satisfied);
  const completed = agendas.filter((a) => a.satisfied);

  return (
    <section>
      <div className="flex items-center gap-2 mb-3">
        <Activity size={14} className="text-muted-foreground" />
        <h3 className="font-display text-xs uppercase tracking-widest text-muted-foreground font-bold">
          Compromisos Asumidos
        </h3>
        <span className="text-[10px] font-mono text-muted-foreground ml-auto">
          {active.length} activos / {agendas.length} total
        </span>
      </div>

      {agendas.length === 0 ? (
        <p className="text-xs text-muted-foreground/60 py-2">
          No hay compromisos pendientes. Los grupos no han hecho demandas todavía.
        </p>
      ) : (
        <div className="space-y-2">
          {/* Active/pending first */}
          {[...active, ...completed].map((agenda) => {
            const status = getAgendaStatus(agenda, gameState.turn);
            const st = STATUS_STYLES[status];
            const turnsLeft = Math.max(0, agenda.deadline - gameState.turn);
            const penalty = computePenalty(agenda, gameState);

            return (
              <div
                key={agenda.id}
                className={`rounded-lg border p-3 ${st.cls}`}
              >
                <div className="flex items-start justify-between gap-2 mb-1">
                  <div className="min-w-0">
                    <div className="font-display font-semibold text-xs text-foreground leading-tight">
                      {resolveDemandName(agenda.demand)}
                    </div>
                    <div className="text-[10px] text-foreground/50 mt-0.5">
                      {getGroupName(agenda.groupId)}
                    </div>
                  </div>
                  <div className="flex-shrink-0 flex items-center gap-1.5">
                    <st.Icon size={11} className={st.cls.replace(/border-\S+|bg-\S+/g, '').trim()} />
                    <span className="text-[9px] font-semibold uppercase tracking-wide">
                      {st.label}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-2 mt-2 text-[10px]">
                  <div className="flex items-center gap-1.5">
                    <Clock size={9} className="text-muted-foreground" />
                    <span className="text-muted-foreground">
                      {status === 'pendiente'
                        ? `Vence en ${turnsLeft} turno${turnsLeft !== 1 ? 's' : ''}`
                        : status === 'cumplida'
                          ? 'Completado'
                          : 'Plazo vencido'}
                    </span>
                  </div>
                  {status === 'pendiente' && (
                    <span className="text-red-400/70 flex items-center gap-1">
                      <AlertTriangle size={9} />
                      Penaliza -{penalty} apoyo
                    </span>
                  )}
                  {status === 'vencida' && !agenda.satisfied && (
                    <span className="text-red-400/50 text-[9px]">
                      Penalización aplicada
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}

// ─── Section 2: Efectos Diferidos Activos ───────────────────────────────

function describeDeferredEffect(pe: PendingEffect, currentTurn: number): string {
  const parts: string[] = [];
  if (pe.incomeModifier) {
    parts.push(`+${Math.round(pe.incomeModifier * 100)}% ingresos`);
  }
  if (pe.costReductionCategory && pe.costReductionPercent) {
    const cat =
      pe.costReductionCategory === 'infraestructura'
        ? 'Infraestructura'
        : pe.costReductionCategory;
    parts.push(`-${Math.round(pe.costReductionPercent * 100)}% costo ${cat}`);
  }
  if (pe.stabilityChange) {
    parts.push(`${pe.stabilityChange > 0 ? '+' : ''}${pe.stabilityChange} estabilidad`);
  }
  if (pe.popularityChange) {
    parts.push(`${pe.popularityChange > 0 ? '+' : ''}${pe.popularityChange} popularidad`);
  }
  if (pe.budgetChange) {
    parts.push(`${pe.budgetChange > 0 ? '+' : ''}$${Math.abs(pe.budgetChange)}M`);
  }
  if (parts.length === 0 && pe.description) {
    parts.push(pe.description);
  }
  return parts.join(' · ') || 'Efecto en curso';
}

function EfectosDiferidosSection({ gameState }: { gameState: GameState }) {
  const effects = gameState.pendingEffects;

  // Separate: effects that haven't started yet (activationTurn > currentTurn)
  // and effects that are currently active and ending soon
  const pending = effects.filter((pe) => pe.activationTurn > gameState.turn);
  const active = effects.filter((pe) => pe.activationTurn <= gameState.turn);

  return (
    <section>
      <div className="flex items-center gap-2 mb-3">
        <Zap size={14} className="text-muted-foreground" />
        <h3 className="font-display text-xs uppercase tracking-widest text-muted-foreground font-bold">
          Efectos Diferidos
        </h3>
        <span className="text-[10px] font-mono text-muted-foreground ml-auto">
          {effects.length}
        </span>
      </div>

      {effects.length === 0 ? (
        <p className="text-xs text-muted-foreground/60 py-2">
          No hay efectos diferidos activos.
        </p>
      ) : (
        <div className="space-y-2">
          {pending.length > 0 && (
            <div className="space-y-1.5">
              <h4 className="text-[9px] uppercase tracking-widest text-amber-400/60 font-semibold px-0.5">
                Próximos a activarse
              </h4>
              {pending.map((pe) => {
                const turnsUntil = pe.activationTurn - gameState.turn;
                const positive =
                  (pe.incomeModifier ?? 0) > 0 ||
                  (pe.popularityChange ?? 0) > 0 ||
                  (pe.budgetChange ?? 0) > 0;
                const iconCls = positive ? 'text-emerald-400' : 'text-red-400';
                return (
                  <div
                    key={pe.id}
                    className="rounded-lg border border-border bg-card p-2.5"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <div className="font-display font-semibold text-[11px] text-foreground leading-tight">
                          {describeDeferredEffect(pe, gameState.turn)}
                        </div>
                        {pe.source && (
                          <div className="text-[9px] text-muted-foreground mt-0.5 truncate">
                            {pe.source}
                          </div>
                        )}
                      </div>
                      <span className="flex-shrink-0 text-[10px] font-mono text-amber-400">
                        en {turnsUntil}t
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {active.length > 0 && (
            <div className="space-y-1.5">
              {pending.length > 0 && (
                <h4 className="text-[9px] uppercase tracking-widest text-emerald-400/60 font-semibold px-0.5">
                  Activos ahora
                </h4>
              )}
              {active.map((pe) => {
                const positive =
                  (pe.incomeModifier ?? 0) > 0 ||
                  (pe.popularityChange ?? 0) > 0 ||
                  (pe.budgetChange ?? 0) > 0;
                const iconCls = positive ? 'text-emerald-400' : 'text-red-400';
                return (
                  <div
                    key={pe.id}
                    className="rounded-lg border border-emerald-400/15 bg-emerald-400/5 p-2.5"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <div className="font-display font-semibold text-[11px] text-foreground leading-tight">
                          {describeDeferredEffect(pe, gameState.turn)}
                        </div>
                        {pe.source && (
                          <div className="text-[9px] text-muted-foreground mt-0.5 truncate">
                            {pe.source}
                          </div>
                        )}
                      </div>
                      <span className="flex-shrink-0 text-[10px] font-mono text-emerald-400">
                        activo
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </section>
  );
}

// ─── Section 3: Próximos Eventos Programados ────────────────────────────

function ProximosEventosSection({ gameState }: { gameState: GameState }) {
  const events = gameState.scheduledEvents;

  return (
    <section>
      <div className="flex items-center gap-2 mb-3">
        <Calendar size={14} className="text-muted-foreground" />
        <h3 className="font-display text-xs uppercase tracking-widest text-muted-foreground font-bold">
          Próximos Eventos
        </h3>
        <span className="text-[10px] font-mono text-muted-foreground ml-auto">
          {events.length}
        </span>
      </div>

      {events.length === 0 ? (
        <p className="text-xs text-muted-foreground/60 py-2">
          No hay eventos programados.
        </p>
      ) : (
        <div className="space-y-2">
          {events
            .sort((a, b) => a.turn - b.turn)
            .map((se) => {
              const turnsUntil = Math.max(0, se.turn - gameState.turn);
              const isImminent = turnsUntil <= 2;
              const borderCls = isImminent
                ? 'border-red-400/25 bg-red-400/5'
                : 'border-border bg-card';

              return (
                <div key={se.event.id} className={`rounded-lg border p-2.5 ${borderCls}`}>
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="font-display font-semibold text-xs text-foreground leading-tight">
                        {se.event.title}
                      </div>
                      <p className="text-[10px] text-muted-foreground leading-snug mt-0.5 line-clamp-2">
                        {se.event.description}
                      </p>
                    </div>
                    <div className="flex-shrink-0 text-right">
                      <div
                        className={`font-mono text-[11px] font-bold ${isImminent ? 'text-red-400' : 'text-muted-foreground'}`}
                      >
                        T{se.turn}
                      </div>
                      {turnsUntil > 0 && (
                        <div className="text-[9px] text-muted-foreground">
                          en {turnsUntil}t
                        </div>
                      )}
                    </div>
                  </div>
                  {se.event.severity && (
                    <span
                      className={`inline-block text-[9px] uppercase tracking-wide mt-1.5 ${
                        se.event.severity === 'critical'
                          ? 'text-red-400'
                          : se.event.severity === 'high'
                            ? 'text-amber-400'
                            : 'text-muted-foreground'
                      }`}
                    >
                      {se.event.severity}
                    </span>
                  )}
                </div>
              );
            })}
        </div>
      )}
    </section>
  );
}

// ─── Section 4: Historial Reciente ──────────────────────────────────────

function HistorialRecienteSection({ gameState }: { gameState: GameState }) {
  const entries = useMemo(() => {
    return [...gameState.turnLog].reverse().slice(0, 5);
  }, [gameState.turnLog]);

  return (
    <section>
      <div className="flex items-center gap-2 mb-3">
        <ScrollText size={14} className="text-muted-foreground" />
        <h3 className="font-display text-xs uppercase tracking-widest text-muted-foreground font-bold">
          Historial Reciente
        </h3>
        <span className="text-[10px] font-mono text-muted-foreground ml-auto">
          últ. {entries.length}
        </span>
      </div>

      {entries.length === 0 ? (
        <p className="text-xs text-muted-foreground/60 py-2">
          No hay registros de turnos todavía.
        </p>
      ) : (
        <div className="space-y-0">
          {entries.map((entry, i) => (
            <div
              key={`${entry.year}-${entry.turn}`}
              className={`flex gap-3 py-2.5 ${
                i < entries.length - 1 ? 'border-b border-border/50' : ''
              }`}
            >
              <div className="flex-shrink-0 w-8">
                <div className="text-[10px] font-mono font-bold text-blue-400 bg-blue-400/10 px-1.5 py-0.5 rounded text-center">
                  T{entry.turn}
                </div>
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-[10px] text-muted-foreground mb-0.5">
                  Año {entry.year} · {entry.position}
                </div>

                {entry.actionsTaken.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-1">
                    {entry.actionsTaken.map((actionId, j) => {
                      const def = actionDefinitions.find((a) => a.id === actionId);
                      const name = def ? def.title : actionId;
                      return (
                        <span
                          key={j}
                          className="text-[9px] bg-white/5 border border-border/50 px-1.5 py-0.5 rounded text-foreground/70"
                        >
                          {name}
                        </span>
                      );
                    })}
                  </div>
                )}

                <div className="flex items-center gap-3 text-[10px]">
                  {entry.popularityChange !== 0 && (
                    <span
                      className={`flex items-center gap-0.5 ${entry.popularityChange > 0 ? 'text-emerald-400' : 'text-red-400'}`}
                    >
                      <TrendingUp size={9} />
                      {entry.popularityChange > 0 ? '+' : ''}
                      {entry.popularityChange.toFixed(1)}% pop
                    </span>
                  )}
                  {entry.budgetChange !== 0 && (
                    <span
                      className={`flex items-center gap-0.5 ${entry.budgetChange > 0 ? 'text-emerald-400' : 'text-red-400'}`}
                    >
                      <DollarSign size={9} />
                      {entry.budgetChange > 0 ? '+' : ''}$
                      {Math.abs(Math.round(entry.budgetChange))}M
                    </span>
                  )}
                </div>

                {entry.events && entry.events.length > 0 && (
                  <div className="mt-1 flex items-center gap-1 text-[10px] text-orange-400">
                    <AlertTriangle size={9} />
                    {entry.events.join(', ')}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

// ─── Main Panel ─────────────────────────────────────────────────────────

export function ManagementNotebook({ gameState, onClose }: ManagementNotebookProps) {
  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-card border border-border rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <div className="flex items-center gap-2.5">
            <BookOpen size={18} className="text-blue-400" />
            <div>
              <h2 className="font-display font-bold text-sm text-foreground uppercase tracking-wider">
                Cuaderno de Gestión
              </h2>
              <p className="text-[10px] text-muted-foreground">
                Memoria del gobierno · Turno {gameState.turn} · Año {gameState.year}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground transition-colors text-xl leading-none"
          >
            &times;
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6">
          <CompromisosSection gameState={gameState} />
          <EfectosDiferidosSection gameState={gameState} />
          <ProximosEventosSection gameState={gameState} />
          <HistorialRecienteSection gameState={gameState} />
        </div>
      </div>
    </div>
  );
}
