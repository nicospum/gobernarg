import { useState } from 'react';
import {
  ChevronDown,
  ChevronRight,
  AlertTriangle,
  Vote,
  Calendar,
  Newspaper,
  Users as UsersIcon,
  MessageSquare,
  Handshake,
  Gift,
  Check,
  Bell,
} from 'lucide-react';
import type { GameState, InteractionType, Subgroup, Notification } from '../types/game';
import { POLITICAL_CALENDAR } from '../data/calendar';
import { FIXED_GROUPS, SUBGROUP_TO_GROUP } from '@/lib/groups-mapping';
import { getValueRisk, riskColor, riskLabel, type Risk } from '@/lib/risk';
import { getGlobalTurn } from '../engine/engineShared';

interface RightSidebarProps {
  gameState: GameState;
  onInteraction: (subgroupId: string, type: InteractionType) => void;
  onSatisfyDemand: (agendaId: string) => void;
}

interface SubgroupWithRelation {
  subgroup: Subgroup;
  relation: number;
  groupName: string;
  groupId: string;
}

function flattenSubgroups(state: GameState): SubgroupWithRelation[] {
  const all: SubgroupWithRelation[] = [];
  const list = state.interestGroups ?? [];
  for (const group of list) {
    for (const sg of group.subgroups) {
      // Los partidos políticos (aliados/opositores) no forman parte de los
      // grupos de interés del acordeón; se muestran en Situación Electoral.
      const groupId = SUBGROUP_TO_GROUP[sg.id];
      if (!groupId) continue;
      const relation = state.groupRelations[sg.id] ?? sg.baseSupport;
      all.push({ subgroup: sg, relation, groupName: group.name, groupId });
    }
  }
  return all;
}

function relationColor(value: number): string {
  if (value >= 60) return 'text-emerald-400';
  if (value >= 40) return 'text-amber-400';
  return 'text-red-400';
}

function relationBarBg(value: number): string {
  if (value >= 60) return 'bg-emerald-400';
  if (value >= 40) return 'bg-amber-400';
  return 'bg-red-400';
}

function defeatRisk(voteIntent: number): Risk {
  if (voteIntent >= 50) return 'bajo';
  if (voteIntent >= 40) return 'medio';
  if (voteIntent >= 30) return 'alto';
  return 'critico';
}

// ─── Sección 1: Situación Electoral ──────────────────────────────────

function SituacionElectoral({ state, subgroups }: { state: GameState; subgroups: SubgroupWithRelation[] }) {
  const aFavor = [...subgroups]
    .filter((s) => s.relation >= 55 && !['aliados', 'opositores'].includes(s.subgroup.id))
    .sort((a, b) => b.relation - a.relation)
    .slice(0, 3);
  const enContra = [...subgroups]
    .filter((s) => s.relation < 45 && !['aliados', 'opositores'].includes(s.subgroup.id))
    .sort((a, b) => a.relation - b.relation)
    .slice(0, 3);
  const risk = defeatRisk(state.votingIntention);
  const voteColor = getValueRisk(state.votingIntention, 100, false);

  return (
    <section className="p-4 border-b border-border space-y-3">
      <div className="flex items-center gap-2">
        <Vote size={13} className="text-muted-foreground" />
        <h3 className="font-display text-[11px] uppercase tracking-widest text-muted-foreground font-bold">
          Situación Electoral
        </h3>
      </div>

      <div className="flex items-end justify-between gap-3">
        <div>
          <div className="text-[10px] text-muted-foreground uppercase tracking-wide">Intención de voto</div>
          <div className={`font-mono text-2xl font-bold leading-none ${riskColor(voteColor)}`}>
            {Math.round(state.votingIntention)}%
          </div>
        </div>
        <div className="text-right">
          <div className="text-[10px] text-muted-foreground uppercase tracking-wide">Riesgo derrota</div>
          <span className={`inline-block text-[10px] font-bold uppercase tracking-wide ${riskColor(risk)}`}>
            {riskLabel(risk)}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <div className="text-[9px] text-emerald-400/70 uppercase tracking-wide font-semibold mb-1.5">
            A favor
          </div>
          {aFavor.length === 0 ? (
            <div className="text-[10px] text-muted-foreground/60">—</div>
          ) : (
            aFavor.map((s) => (
              <div key={s.subgroup.id} className="flex items-center justify-between gap-1 mb-0.5">
                <span className="text-[10px] text-foreground/70 truncate">{s.subgroup.name}</span>
                <span className="font-mono text-[10px] text-emerald-400 flex-shrink-0">
                  {Math.round(s.relation)}
                </span>
              </div>
            ))
          )}
        </div>
        <div>
          <div className="text-[9px] text-red-400/70 uppercase tracking-wide font-semibold mb-1.5">
            En contra
          </div>
          {enContra.length === 0 ? (
            <div className="text-[10px] text-muted-foreground/60">—</div>
          ) : (
            enContra.map((s) => (
              <div key={s.subgroup.id} className="flex items-center justify-between gap-1 mb-0.5">
                <span className="text-[10px] text-foreground/70 truncate">{s.subgroup.name}</span>
                <span className="font-mono text-[10px] text-red-400 flex-shrink-0">
                  {Math.round(s.relation)}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </section>
  );
}

// ─── Sección 2: Calendario Político ──────────────────────────────────

function CalendarPanel({ state }: { state: GameState }) {
  const [open, setOpen] = useState(true);
  const current = (state.year - 1) * 4 + state.turn;
  const upcoming = POLITICAL_CALENDAR.map((ev) => ({
    ev,
    abs: (ev.year - 1) * 4 + ev.turn,
  }))
    .filter((x) => x.abs > current)
    .sort((a, b) => a.abs - b.abs)
    .slice(0, 4);

  return (
    <section className="border-b border-border">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-4 py-2.5 hover:bg-white/3 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Calendar size={13} className="text-muted-foreground" />
          <h3 className="font-display text-[11px] uppercase tracking-widest text-muted-foreground font-bold">
            Calendario Político
          </h3>
        </div>
        {open ? (
          <ChevronDown size={13} className="text-muted-foreground" />
        ) : (
          <ChevronRight size={13} className="text-muted-foreground" />
        )}
      </button>

      {open && (
        <div className="px-4 pb-4 space-y-2">
          {upcoming.length === 0 ? (
            <div className="text-[11px] text-muted-foreground py-2">Sin eventos próximos.</div>
          ) : (
            upcoming.map(({ ev, abs }) => {
              const diff = abs - current;
              const sev =
                ev.type === 'election' || ev.type === 'crisis'
                  ? 'critical'
                  : ev.type === 'opportunity'
                    ? 'info'
                    : 'warning';
              const borderCls =
                sev === 'critical'
                  ? 'border-red-400/30 bg-red-400/5'
                  : sev === 'warning'
                    ? 'border-amber-400/25 bg-amber-400/5'
                    : 'border-sky-400/25 bg-sky-400/5';
              const turnCls =
                sev === 'critical'
                  ? 'text-red-400'
                  : sev === 'warning'
                    ? 'text-amber-400'
                    : 'text-sky-400';
              return (
                <div key={ev.id} className={`rounded-lg border p-2.5 ${borderCls}`}>
                  <div className="flex items-start justify-between gap-2">
                    <div className="font-display font-semibold text-[12px] text-foreground leading-tight">
                      {ev.title}
                    </div>
                    <div className="flex-shrink-0 text-right">
                      <div className={`font-mono text-[11px] font-bold ${turnCls}`}>T{abs}</div>
                      <div className="text-[9px] text-muted-foreground">
                        en {diff}t
                      </div>
                    </div>
                  </div>
                  <p className="text-[10px] text-muted-foreground leading-snug mt-1">
                    {ev.description}
                  </p>
                </div>
              );
            })
          )}
        </div>
      )}
    </section>
  );
}

// ─── Sección 3: Noticias ──────────────────────────────────────────────

function severityCls(notif: Notification): { border: string; text: string } {
  const importance = notif.importance;
  if (importance === 'critical' || importance === 'high') {
    return { border: 'border-red-400/25 bg-red-400/5', text: 'text-red-400' };
  }
  if (importance === 'success') {
    return { border: 'border-emerald-400/20 bg-emerald-400/5', text: 'text-emerald-400' };
  }
  if (importance === 'medium') {
    return { border: 'border-amber-400/25 bg-amber-400/5', text: 'text-amber-400' };
  }
  return { border: 'border-border bg-card', text: 'text-muted-foreground' };
}

function NewsPanel({ state }: { state: GameState }) {
  const [open, setOpen] = useState(true);
  const news = (state.notifications ?? [])
    .filter((n) => !n.dismissed)
    .slice(0, 5);

  return (
    <section className="border-b border-border">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-4 py-2.5 hover:bg-white/3 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Newspaper size={13} className="text-muted-foreground" />
          <h3 className="font-display text-[11px] uppercase tracking-widest text-muted-foreground font-bold">
            Noticias
          </h3>
          {news.length > 0 && (
            <span className="text-[9px] font-mono text-muted-foreground">{news.length}</span>
          )}
        </div>
        {open ? (
          <ChevronDown size={13} className="text-muted-foreground" />
        ) : (
          <ChevronRight size={13} className="text-muted-foreground" />
        )}
      </button>

      {open && (
        <div className="px-4 pb-4 space-y-2">
          {news.length === 0 ? (
            <div className="text-[11px] text-muted-foreground py-2 flex items-center gap-2">
              <Bell size={11} />
              Sin noticias por ahora.
            </div>
          ) : (
            news.map((n) => {
              const sev = severityCls(n);
              return (
                <div key={n.id} className={`rounded-lg border p-2.5 ${sev.border}`}>
                  <div className="font-semibold text-[12px] text-foreground leading-tight">
                    {n.title}
                  </div>
                  {n.message && (
                    <p className="text-[10px] text-foreground/60 leading-snug mt-1">{n.message}</p>
                  )}
                  {n.category && (
                    <span className={`inline-block text-[9px] uppercase tracking-wide mt-1 ${sev.text}`}>
                      {n.category}
                    </span>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}
    </section>
  );
}

// ─── Sección 4: Grupos de Interés ────────────────────────────────────

function tensionFromMood(mood: string | undefined, relation: number): Risk {
  if (mood === 'radicalizado') return 'critico';
  if (mood === 'enojado' || relation < 30) return 'alto';
  if (mood === 'disconforme' || relation < 50) return 'medio';
  return 'bajo';
}

function GroupsAccordion({
  state,
  subgroups,
  onInteraction,
  onSatisfyDemand,
}: {
  state: GameState;
  subgroups: SubgroupWithRelation[];
  onInteraction: (id: string, type: InteractionType) => void;
  onSatisfyDemand: (agendaId: string) => void;
}) {
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  return (
    <section className="p-4">
      <div className="flex items-center gap-2 mb-3">
        <UsersIcon size={13} className="text-muted-foreground" />
        <h3 className="font-display text-[11px] uppercase tracking-widest text-muted-foreground font-bold">
          Grupos de Interés
        </h3>
      </div>

      <div className="space-y-1.5">
        {FIXED_GROUPS.map((group) => {
          const members = subgroups.filter((s) => s.groupId === group.id);
          if (members.length === 0) return null;

          const avg =
            members.reduce((acc, m) => acc + m.relation, 0) / members.length;
          const worstTension: Risk = members.reduce<Risk>((max, m) => {
            const mood = state.groupMoods?.find((gm) => gm.groupId === m.subgroup.id)?.mood;
            const t = tensionFromMood(mood, m.relation);
            const order: Record<Risk, number> = { bajo: 0, medio: 1, alto: 2, critico: 3 };
            return order[t] > order[max] ? t : max;
          }, 'bajo');
          const demandsCount = members.filter((m) =>
            state.groupAgendas?.some((a) => a.groupId === m.subgroup.id && !a.satisfied),
          ).length;
          const isOpen = expanded.has(group.id);
          const Icon = group.icon;

          return (
            <div key={group.id} className="rounded-lg border border-border overflow-hidden bg-card">
              <button
                onClick={() =>
                  setExpanded((prev) => {
                    const next = new Set(prev);
                    if (next.has(group.id)) next.delete(group.id);
                    else next.add(group.id);
                    return next;
                  })
                }
                className="w-full flex items-center justify-between gap-2 px-3 py-2.5 hover:bg-white/3 transition-colors text-left"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <Icon size={14} className="text-muted-foreground flex-shrink-0" />
                  <div className="min-w-0">
                    <div className="font-display font-semibold text-[12px] text-foreground truncate">
                      {group.name}
                    </div>
                    <div className="flex items-center gap-2 text-[9px]">
                      <span className={riskColor(worstTension)}>
                        tensión {riskLabel(worstTension).toLowerCase()}
                      </span>
                      {demandsCount > 0 && (
                        <span className="text-orange-400">
                          {demandsCount} demanda{demandsCount > 1 ? 's' : ''}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className={`font-mono text-sm font-bold ${relationColor(avg)}`}>
                    {Math.round(avg)}
                  </span>
                  {isOpen ? (
                    <ChevronDown size={12} className="text-muted-foreground" />
                  ) : (
                    <ChevronRight size={12} className="text-muted-foreground" />
                  )}
                </div>
              </button>

              {isOpen && (
                <div className="border-t border-border divide-y divide-border">
                  {members.map(({ subgroup, relation }) => {
                    const mood = state.groupMoods?.find((gm) => gm.groupId === subgroup.id)?.mood;
                    const agenda = state.groupAgendas?.find(
                      (a) => a.groupId === subgroup.id && !a.satisfied,
                    );
                    const agendaTurnsLeft = agenda
                      ? agenda.deadline - getGlobalTurn(state)
                      : 0;
                    const interactionLock = state.interactionHistory?.[subgroup.id];
                    const locked = interactionLock && interactionLock.turnsLeft > 0;

                    return (
                      <div key={subgroup.id} className="px-3 py-2.5 hover:bg-white/2 transition-colors">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <div className="font-medium text-[12px] text-foreground leading-tight">
                            {subgroup.name}
                          </div>
                          <span className={`font-mono text-[12px] font-bold ${relationColor(relation)}`}>
                            {Math.round(relation)}
                          </span>
                        </div>

                        <div className="h-1 w-full overflow-hidden rounded-full bg-white/10 mb-1.5">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${relationBarBg(relation)}`}
                            style={{ width: `${Math.max(0, Math.min(100, relation))}%` }}
                          />
                        </div>

                        {mood && (
                          <div className="text-[10px] text-muted-foreground mb-1">
                            Ánimo: <span className="font-semibold">{mood}</span>
                          </div>
                        )}

                        {agenda && (
                          <div className="mt-1.5 mb-1.5 px-2 py-1.5 rounded border border-orange-400/20 bg-orange-400/5">
                            <div className="flex items-start gap-1.5">
                              <AlertTriangle size={9} className="text-orange-400 flex-shrink-0 mt-0.5" />
                              <div className="min-w-0">
                                <div className="text-[10px] text-orange-300/90 leading-snug">
                                  {agenda.demand}
                                </div>
                                <div className="text-[9px] text-orange-400/60 mt-0.5">
                                  {agendaTurnsLeft >= 0
                                    ? `Vence en ${agendaTurnsLeft} turno${agendaTurnsLeft !== 1 ? 's' : ''}`
                                    : 'Vencida'}
                                </div>
                              </div>
                            </div>
                            <button
                              onClick={() => onSatisfyDemand(agenda.id)}
                              className="mt-1.5 w-full inline-flex items-center justify-center gap-1 text-[10px] font-semibold text-orange-300 border border-orange-400/30 hover:bg-orange-400/10 rounded py-1 transition-colors"
                            >
                              <Check size={10} />
                              Satisfacer demanda
                            </button>
                          </div>
                        )}

                        <div className="flex gap-1.5 mt-2">
                          {(
                            [
                              { type: 'reunion', icon: <MessageSquare size={9} />, label: 'Reunirse' },
                              { type: 'negociar', icon: <Handshake size={9} />, label: 'Negociar' },
                              { type: 'conceder', icon: <Gift size={9} />, label: 'Conceder' },
                            ] as { type: InteractionType; icon: JSX.Element; label: string }[]
                          ).map((btn) => (
                            <button
                              key={btn.type}
                              onClick={() => !locked && onInteraction(subgroup.id, btn.type)}
                              disabled={!!locked}
                              title={
                                locked
                                  ? `Bloqueado ${interactionLock?.turnsLeft}t`
                                  : `Interacción: ${btn.label}`
                              }
                              className="flex-1 inline-flex items-center justify-center gap-1 text-[9px] text-muted-foreground hover:text-foreground border border-border hover:border-white/20 px-2 py-1 rounded transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                            >
                              {btn.icon}
                              {btn.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}

// ─── RightSidebar ────────────────────────────────────────────────────

export function RightSidebar({ gameState, onInteraction, onSatisfyDemand }: RightSidebarProps) {
  const subgroups = flattenSubgroups(gameState);

  return (
    <aside className="w-full lg:w-80 flex-none flex flex-col overflow-hidden rounded-lg border border-border bg-card max-h-[calc(100vh-5rem)]">
      <div className="flex-1 overflow-y-auto">
        <SituacionElectoral state={gameState} subgroups={subgroups} />
        <CalendarPanel state={gameState} />
        <NewsPanel state={gameState} />
        <GroupsAccordion
          state={gameState}
          subgroups={subgroups}
          onInteraction={onInteraction}
          onSatisfyDemand={onSatisfyDemand}
        />
      </div>
    </aside>
  );
}
