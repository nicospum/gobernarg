import { useMemo } from 'react';
import {
  BookOpen,
  Clock,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Zap,
  TrendingUp,
  DollarSign,
  ScrollText,
  Activity,
} from 'lucide-react';
import type { GameState } from '../types/game';
import { actionDefinitions } from '../data/actionRegistry';
import { ACTOR_IDS, ACTORS, CAUSAL_ACTIONS_BY_ID, PARAMS } from '@/data/causal';
import { runningEffects, upcomingEffects } from '@/lib/agendaView';

interface ManagementNotebookProps {
  gameState: GameState;
  onClose: () => void;
}

// ─── Section 1: Acuerdos y pedidos (motor causal) ─────────────────────

type AgreementStyle = { label: string; cls: string; Icon: typeof CheckCircle };

const AGREEMENT_STYLES: Record<'active' | 'fulfilled' | 'broken', AgreementStyle> = {
  active: { label: 'Vigente', cls: 'text-amber-400 border-amber-400/30 bg-amber-400/5', Icon: Clock },
  fulfilled: { label: 'Cumplido', cls: 'text-emerald-400 border-emerald-400/30 bg-emerald-400/5', Icon: CheckCircle },
  broken: { label: 'Incumplido', cls: 'text-red-400 border-red-400/30 bg-red-400/5', Icon: XCircle },
};

function CompromisosSection({ gameState }: { gameState: GameState }) {
  const c = gameState.causal;
  const agreements = [...c.agreements].sort((a, b) => (a.status === 'active' ? -1 : 1) - (b.status === 'active' ? -1 : 1));
  const requests = ACTOR_IDS
    .map(a => ({ actor: a, demand: c.actors[a].demand }))
    .filter(x => x.demand && x.demand.revealedTurn !== null && c.turn - x.demand.revealedTurn < PARAMS.VENTANA_DEMANDA);

  return (
    <section>
      <div className="flex items-center gap-2 mb-3">
        <Activity size={14} className="text-muted-foreground" />
        <h3 className="font-display text-xs uppercase tracking-widest text-muted-foreground font-bold">
          Acuerdos y Pedidos
        </h3>
        <span className="text-[10px] font-mono text-muted-foreground ml-auto">
          {agreements.filter(a => a.status === 'active').length} vigentes / {agreements.length} firmados
        </span>
      </div>

      {agreements.length === 0 && requests.length === 0 ? (
        <p className="text-xs text-muted-foreground/60 py-2">
          Todavía no hay acuerdos ni pedidos conocidos. Reunite con los actores para saber qué piden.
        </p>
      ) : (
        <div className="space-y-2">
          {agreements.map(ag => {
            const st = AGREEMENT_STYLES[ag.status];
            const turnsLeft = Math.max(0, ag.deadline - c.turn);
            return (
              <div key={ag.id} className={`rounded-lg border p-3 ${st.cls}`}>
                <div className="flex items-start justify-between gap-2 mb-1">
                  <div className="min-w-0">
                    <div className="font-display font-semibold text-xs text-foreground leading-tight">
                      {CAUSAL_ACTIONS_BY_ID[ag.commitmentActionId]?.name ?? ag.commitmentActionId}
                    </div>
                    <div className="text-[10px] text-foreground/50 mt-0.5">
                      Acuerdo con {ACTORS[ag.actor].shortName} · a cambio: {ag.offer.toLowerCase()}
                    </div>
                  </div>
                  <div className="flex-shrink-0 flex items-center gap-1.5">
                    <st.Icon size={11} />
                    <span className="text-[9px] font-semibold uppercase tracking-wide">{st.label}</span>
                  </div>
                </div>
                {ag.status === 'active' && (
                  <div className="flex items-center justify-between gap-2 mt-2 text-[10px]">
                    <span className="text-muted-foreground flex items-center gap-1.5">
                      <Clock size={9} />
                      Vence en {turnsLeft} turno{turnsLeft !== 1 ? 's' : ''}
                    </span>
                    <span className="text-red-400/70 flex items-center gap-1">
                      <AlertTriangle size={9} />
                      Incumplir rompe la relación
                    </span>
                  </div>
                )}
              </div>
            );
          })}
          {requests.map(({ actor, demand }) => (
            <div key={actor} className="rounded-lg border border-border bg-card p-2.5">
              <div className="font-display font-semibold text-[11px] text-foreground leading-tight">
                {CAUSAL_ACTIONS_BY_ID[demand!.actionId]?.name ?? demand!.actionId}
              </div>
              <div className="text-[9px] text-muted-foreground mt-0.5">
                Lo pide {ACTORS[actor].shortName} (revelado en la reunión del turno {demand!.revealedTurn})
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

// ─── Section 2: Efectos en camino y en curso (agenda del motor) ───────

function EfectosDiferidosSection({ gameState }: { gameState: GameState }) {
  const upcoming = upcomingEffects(gameState.causal);
  const running = runningEffects(gameState.causal);

  return (
    <section>
      <div className="flex items-center gap-2 mb-3">
        <Zap size={14} className="text-muted-foreground" />
        <h3 className="font-display text-xs uppercase tracking-widest text-muted-foreground font-bold">
          Efectos Diferidos
        </h3>
        <span className="text-[10px] font-mono text-muted-foreground ml-auto">
          {upcoming.length + running.length}
        </span>
      </div>

      {upcoming.length + running.length === 0 ? (
        <p className="text-xs text-muted-foreground/60 py-2">
          No hay efectos diferidos activos.
        </p>
      ) : (
        <div className="space-y-2">
          {upcoming.length > 0 && (
            <div className="space-y-1.5">
              <h4 className="text-[9px] uppercase tracking-widest text-amber-400/60 font-semibold px-0.5">
                Próximos a llegar
              </h4>
              {upcoming.map(item => (
                <div key={item.key} className="rounded-lg border border-border bg-card p-2.5">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="font-display font-semibold text-[11px] text-foreground leading-tight">{item.title}</div>
                      <div className="text-[9px] text-muted-foreground mt-0.5">
                        {item.chips.map(ch => `${ch.label} ${ch.text}`).join(' · ')}
                      </div>
                    </div>
                    <span className="flex-shrink-0 text-[10px] font-mono text-amber-400">en {item.inTurns}t</span>
                  </div>
                </div>
              ))}
            </div>
          )}
          {running.length > 0 && (
            <div className="space-y-1.5">
              <h4 className="text-[9px] uppercase tracking-widest text-emerald-400/60 font-semibold px-0.5">
                En curso
              </h4>
              {running.map(item => (
                <div key={item.key} className="rounded-lg border border-emerald-400/15 bg-emerald-400/5 p-2.5">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="font-display font-semibold text-[11px] text-foreground leading-tight">{item.title}</div>
                      <div className="text-[9px] text-muted-foreground mt-0.5">{item.detail}</div>
                    </div>
                    <span className="flex-shrink-0 text-[10px] font-mono text-emerald-400">activo</span>
                  </div>
                </div>
              ))}
            </div>
          )}
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
                      {entry.popularityChange.toFixed(1)} aprob.
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
            aria-label="Cerrar"
            className="text-muted-foreground hover:text-foreground transition-colors text-xl leading-none"
          >
            &times;
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6">
          <CompromisosSection gameState={gameState} />
          <EfectosDiferidosSection gameState={gameState} />
          <HistorialRecienteSection gameState={gameState} />
        </div>
      </div>
    </div>
  );
}
