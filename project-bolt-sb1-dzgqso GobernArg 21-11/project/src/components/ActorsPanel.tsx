import { useState } from 'react';
import {
  ChevronDown,
  ChevronRight,
  Users as UsersIcon,
  MessageSquare,
  Handshake,
  FileSignature,
  BarChart3,
  Eye,
  EyeOff,
  Plus,
  Check,
  Info,
} from 'lucide-react';
import type { GameState } from '../types/game';
import {
  ACTOR_FAMILIES,
  ACTORS,
  CAUSAL_ACTIONS_BY_ID,
  PARAMS,
  isOrganized,
  type ActorId,
} from '@/data/causal';
import {
  agreementOffer,
  canMeet,
  canNegotiate,
  canPoll,
  canSignAgreement,
  getAvailability,
  meetingCost,
  negotiationChance,
  POLL_COST,
} from '@/engine/causal';
import { moodFor } from '@/engine/causalBridge';
import type { ActorInteraction } from '@/engine/gameEngine';
import { concernSentence, relationBand, satisfactionBand, toneClass } from '@/lib/causalText';
import { getValueRisk, riskColor, riskLabel, type Risk } from '@/lib/risk';
import { getActorIcon } from '../utils/actorIcons';

interface ActorsPanelProps {
  gameState: GameState;
  onInteract: (actor: ActorId, kind: ActorInteraction) => void;
  onSelectAction: (actionId: string) => void;
  disabled: boolean;
}

const MOOD_RISK: Record<string, Risk> = {
  contento: 'bajo', neutral: 'bajo', disconforme: 'medio', enojado: 'alto', radicalizado: 'critico',
};

function barColor(v: number): string {
  if (v >= 60) return 'bg-emerald-400';
  if (v >= 42) return 'bg-amber-400';
  return 'bg-red-400';
}

function chanceLabel(p: number): string {
  if (p >= 0.7) return 'probable';
  if (p >= 0.45) return 'incierta';
  return 'difícil';
}

function ActorCard({ state, actor, onInteract, onSelectAction, disabled }: {
  state: GameState;
  actor: ActorId;
  onInteract: ActorsPanelProps['onInteract'];
  onSelectAction: ActorsPanelProps['onSelectAction'];
  disabled: boolean;
}) {
  const c = state.causal;
  const st = c.actors[actor];
  const def = ACTORS[actor];
  const organized = isOrganized(actor);
  const fresh = st.revealedUntil >= c.turn || (!organized && c.perks.reveals.includes('encuestas'));
  const band = satisfactionBand(st.sat);
  const mood = moodFor(st.sat, st.rel);
  const last = c.records[c.records.length - 1];
  const satDelta = last ? st.sat - last.actorsBefore[actor].sat : 0;
  const icon = getActorIcon(actor);
  const agreement = c.agreements.find(a => a.actor === actor && a.status === 'active');
  const demand = st.demand;
  const demandRevealed = demand && demand.revealedTurn !== null && c.turn - demand.revealedTurn < PARAMS.VENTANA_DEMANDA;
  const demandDef = demand ? CAUSAL_ACTIONS_BY_ID[demand.actionId] : null;
  const demandSelected = demand ? state.selectedActions.includes(demand.actionId) : false;
  const demandAv = demand ? getAvailability(c, demand.actionId, state.selectedActions.map(actionId => ({ actionId })), state.actions) : null;

  const meetReason = organized ? canMeet(c, actor, state.actions) : null;
  const pollReason = !organized ? canPoll(c, actor) : null;
  const negReason = organized ? canNegotiate(c, actor, state.actions) : 'n/a';
  const signReason = organized ? canSignAgreement(c, actor) : 'n/a';
  const offerOpen = signReason === null;

  return (
    <div className="px-3 py-2.5 hover:bg-white/2 transition-colors">
      {/* Encabezado */}
      <div className="flex items-start gap-2 mb-1.5">
        {icon ? (
          <img src={icon} alt="" className="w-8 h-8 rounded object-contain flex-shrink-0 bg-white/5" />
        ) : (
          <div className="w-8 h-8 rounded bg-white/5 flex-shrink-0" />
        )}
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <div className="font-medium text-[12px] text-foreground leading-tight truncate" title={def.description}>
              {def.name}
            </div>
            <span className={`text-[9px] uppercase tracking-wide font-semibold ${riskColor(MOOD_RISK[mood])}`}>{mood}</span>
          </div>
          <div className="text-[9px] text-muted-foreground truncate" title={def.channelMain}>
            Poder: {def.channelMain}
          </div>
        </div>
      </div>

      {/* Satisfacción */}
      <div className="mb-1">
        <div className="flex items-center justify-between text-[10px]">
          <span className="text-muted-foreground inline-flex items-center gap-1" title="Cómo le va: depende de los indicadores que le importan">
            {fresh ? <Eye size={9} /> : <EyeOff size={9} />}
            {actor === 'oposicion' ? 'Disposición' : 'Satisfacción'}
          </span>
          {fresh ? (
            <span className={`font-mono font-bold ${toneClass(band.tone)}`}>
              {Math.round(st.sat)}
              {Math.abs(satDelta) >= 0.5 && (
                <span className={`ml-1 text-[9px] ${satDelta > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                  {satDelta > 0 ? '▲' : '▼'}{Math.abs(satDelta).toFixed(0)}
                </span>
              )}
            </span>
          ) : (
            <span className={`text-[10px] font-semibold ${toneClass(band.tone)}`}>{band.label}</span>
          )}
        </div>
        <div className="h-1 w-full overflow-hidden rounded-full bg-white/10 mt-0.5">
          <div
            className={`h-full rounded-full transition-all duration-500 ${fresh ? barColor(st.sat) : 'bg-white/25'}`}
            style={{ width: `${fresh ? st.sat : Math.round(st.sat / 12.5) * 12.5}%` }}
          />
        </div>
      </div>

      {/* Relación */}
      {organized && st.rel !== null && (
        <div className="mb-1.5">
          <div className="flex items-center justify-between text-[10px]">
            <span className="text-muted-foreground" title="Tu vínculo con ellos: reuniones, acuerdos cumplidos o incumplidos">Relación</span>
            <span className="font-mono text-foreground/80">
              {relationBand(st.rel)} <span className="text-muted-foreground">{Math.round(st.rel)}</span>
            </span>
          </div>
          <div className="h-1 w-full overflow-hidden rounded-full bg-white/10 mt-0.5">
            <div className="h-full rounded-full bg-sky-400/80 transition-all duration-500" style={{ width: `${st.rel}%` }} />
          </div>
        </div>
      )}

      {/* Información revelada */}
      {fresh ? (
        <p className="text-[10px] text-foreground/70 leading-snug mb-1.5">{concernSentence(c, actor)}</p>
      ) : (
        <p className="text-[10px] text-muted-foreground/70 leading-snug mb-1.5 italic">
          {organized ? 'Sin reunión reciente: no sabés qué les preocupa.' : 'Sin encuesta reciente: sólo una impresión general.'}
        </p>
      )}

      {/* Demanda */}
      {demandRevealed && demandDef && (
        <div className="mb-1.5 px-2 py-1.5 rounded border border-amber-400/25 bg-amber-400/5">
          <div className="text-[10px] text-amber-200/90 leading-snug">
            Piden: <span className="font-semibold">{demandDef.name}</span>
          </div>
          <button
            onClick={() => onSelectAction(demand!.actionId)}
            disabled={disabled || demandSelected || !demandAv?.available}
            className="mt-1 w-full inline-flex items-center justify-center gap-1 text-[10px] font-semibold text-amber-200 border border-amber-400/30 hover:bg-amber-400/10 rounded py-0.5 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            title={demandAv && !demandAv.available ? demandAv.reasons[0] : 'Agregar al turno: si la ejecutás, valoran que los escuchaste'}
          >
            {demandSelected ? <><Check size={10} /> En el turno</> : <><Plus size={10} /> Agregar al turno</>}
          </button>
        </div>
      )}

      {/* Acuerdo vigente */}
      {agreement && (
        <div className="mb-1.5 px-2 py-1.5 rounded border border-emerald-400/25 bg-emerald-400/5 text-[10px] text-emerald-200/90 leading-snug">
          Acuerdo vigente: te comprometiste a <span className="font-semibold">{CAUSAL_ACTIONS_BY_ID[agreement.commitmentActionId]?.name}</span>
          {' '}(vence en {Math.max(0, agreement.deadline - c.turn)} t). A cambio: {agreement.offer.toLowerCase()}.
        </div>
      )}

      {/* Oferta de acuerdo abierta */}
      {offerOpen && demandDef && (
        <div className="mb-1.5 px-2 py-1.5 rounded border border-primary/30 bg-primary/5 text-[10px] text-foreground/80 leading-snug">
          Aceptan acordar: vos te comprometés a <span className="font-semibold">{demandDef.name}</span> en {PARAMS.PLAZO_ACUERDO} turnos;
          ellos ofrecen: {agreementOffer(actor).toLowerCase()}. Incumplir rompe la relación.
        </div>
      )}

      {/* Botones */}
      <div className="flex gap-1.5 mt-1.5">
        {organized ? (
          <>
            <button
              onClick={() => onInteract(actor, 'reunion')}
              disabled={disabled || !!meetReason}
              title={meetReason ?? 'Reunión: revela qué les preocupa y qué piden; habilita negociar 3 turnos'}
              className="flex-1 inline-flex items-center justify-center gap-1 text-[9px] text-muted-foreground hover:text-foreground border border-border hover:border-white/20 px-1.5 py-1 rounded transition-all disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <MessageSquare size={9} />
              Reunirse {!meetReason && <span className="font-mono text-[8px] opacity-80">{meetingCost(c, actor) === 0 ? 'gratis' : '1PA'}</span>}
            </button>
            {offerOpen ? (
              <button
                onClick={() => onInteract(actor, 'acuerdo')}
                disabled={disabled}
                className="flex-1 inline-flex items-center justify-center gap-1 text-[9px] text-primary border border-primary/40 hover:bg-primary/10 px-1.5 py-1 rounded transition-all disabled:opacity-30"
              >
                <FileSignature size={9} />
                Firmar acuerdo
              </button>
            ) : (
              <button
                onClick={() => onInteract(actor, 'negociar')}
                disabled={disabled || !!negReason}
                title={negReason ?? `Negociar su demanda (1 PA). Chance ${chanceLabel(negotiationChance(c, actor))}.`}
                className="flex-1 inline-flex items-center justify-center gap-1 text-[9px] text-muted-foreground hover:text-foreground border border-border hover:border-white/20 px-1.5 py-1 rounded transition-all disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <Handshake size={9} />
                Negociar {!negReason && <span className="text-[8px] opacity-80">({chanceLabel(negotiationChance(c, actor))})</span>}
              </button>
            )}
          </>
        ) : (
          <button
            onClick={() => onInteract(actor, 'encuesta')}
            disabled={disabled || !!pollReason}
            title={pollReason ?? 'Encuesta: revela su satisfacción y los dos temas que más la mueven'}
            className="flex-1 inline-flex items-center justify-center gap-1 text-[9px] text-muted-foreground hover:text-foreground border border-border hover:border-white/20 px-1.5 py-1 rounded transition-all disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <BarChart3 size={9} />
            Encuesta <span className="font-mono text-[8px] opacity-80">{c.perks.freePolls ? 'gratis' : `$${POLL_COST}M`}</span>
          </button>
        )}
      </div>
    </div>
  );
}

export function ActorsPanel({ gameState, onInteract, onSelectAction, disabled }: ActorsPanelProps) {
  const [expanded, setExpanded] = useState<Set<string>>(new Set(['produccion']));
  const c = gameState.causal;

  return (
    <section className="p-4">
      <div className="flex items-center gap-2 mb-1">
        <UsersIcon size={13} className="text-muted-foreground" />
        <h3 className="font-display text-[11px] uppercase tracking-widest text-muted-foreground font-bold">
          Actores
        </h3>
      </div>
      <p className="text-[10px] text-muted-foreground/80 mb-2 flex items-start gap-1 leading-snug">
        <Info size={10} className="mt-0.5 flex-shrink-0" />
        Satisfacción = cómo les va con el país. Relación = tu vínculo con ellos. Reunite para saber qué les preocupa.
      </p>
      {gameState.lastInteractionMessage && (
        <div className="mb-2 px-2.5 py-1.5 rounded border border-primary/30 bg-primary/5 text-[10px] text-foreground/80 leading-snug">
          {gameState.lastInteractionMessage}
        </div>
      )}

      <div className="space-y-1.5">
        {ACTOR_FAMILIES.map((family) => {
          const isOpen = expanded.has(family.id);
          const worst = family.members.reduce<Risk>((max, a) => {
            const r = MOOD_RISK[moodFor(c.actors[a].sat, c.actors[a].rel)];
            const order: Record<Risk, number> = { bajo: 0, medio: 1, alto: 2, critico: 3 };
            return order[r] > order[max] ? r : max;
          }, 'bajo');
          const demands = family.members.filter(a => {
            const d = c.actors[a].demand;
            return d && d.revealedTurn !== null && c.turn - d.revealedTurn < PARAMS.VENTANA_DEMANDA;
          }).length;
          return (
            <div key={family.id} className="rounded-lg border border-border overflow-hidden bg-card">
              <button
                onClick={() =>
                  setExpanded(prev => {
                    const next = new Set(prev);
                    if (next.has(family.id)) next.delete(family.id);
                    else next.add(family.id);
                    return next;
                  })
                }
                className="w-full flex items-center justify-between gap-2 px-3 py-2.5 hover:bg-white/3 transition-colors text-left"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <div className="flex -space-x-1.5 flex-shrink-0">
                    {family.members.slice(0, 3).map(a => {
                      const src = getActorIcon(a);
                      return src ? <img key={a} src={src} alt="" className="w-5 h-5 rounded-full object-contain bg-card border border-border" /> : null;
                    })}
                  </div>
                  <div className="min-w-0">
                    <div className="font-display font-semibold text-[12px] text-foreground truncate">{family.name}</div>
                    <div className="flex items-center gap-2 text-[9px]">
                      <span className={riskColor(worst)}>tensión {riskLabel(worst).toLowerCase()}</span>
                      {demands > 0 && <span className="text-amber-300">{demands} pedido{demands > 1 ? 's' : ''}</span>}
                    </div>
                  </div>
                </div>
                {isOpen ? <ChevronDown size={12} className="text-muted-foreground" /> : <ChevronRight size={12} className="text-muted-foreground" />}
              </button>
              {isOpen && (
                <div className="border-t border-border divide-y divide-border">
                  {family.members.map(a => (
                    <ActorCard key={a} state={gameState} actor={a} onInteract={onInteract} onSelectAction={onSelectAction} disabled={disabled} />
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
      <p className="text-[9px] text-muted-foreground/60 mt-2">
        {c.perks.freeMeetingsPerTurn - c.freeMeetingsUsed > 0
          ? `Te queda${c.perks.freeMeetingsPerTurn - c.freeMeetingsUsed > 1 ? 'n' : ''} ${c.perks.freeMeetingsPerTurn - c.freeMeetingsUsed} reunión${c.perks.freeMeetingsPerTurn - c.freeMeetingsUsed > 1 ? 'es' : ''} gratis este turno.`
          : 'Las reuniones de este turno ya cuestan 1 PA.'}
      </p>
      {void getValueRisk}
    </section>
  );
}
