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
import { riskColor, type Risk } from '@/lib/risk';
import { getActorIcon } from '../utils/actorIcons';
import { fmtBudget } from '@/lib/format';
import { ACTOR_POWER_TEXT } from '@/data/causal/playerTexts';

/** "tensión media", no "tensión medio" (concordancia, glosario). */
const TENSION_LABEL: Record<Risk, string> = { bajo: 'baja', medio: 'media', alto: 'alta', critico: 'crítica' };

interface ActorsPanelProps {
  gameState: GameState;
  onInteract: (actor: ActorId, kind: ActorInteraction) => void;
  onSelectAction: (actionId: string) => void;
  disabled: boolean;
  /** Número del rótulo (05 en el tablero). */
  index?: string;
}

const MOOD_RISK: Record<string, Risk> = {
  contento: 'bajo', neutral: 'bajo', disconforme: 'medio', enojado: 'alto', radicalizado: 'critico',
};

/** Satisfacción en coral (cómo les va); relación en cian (vínculo político). */
const SAT_BAR = 'bg-sala-coral';
const REL_BAR = 'bg-sala-cyan';

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
    <div className="px-4 py-3 hover:bg-sunken/50 transition-colors">
      {/* Encabezado */}
      <div className="flex items-start gap-2 mb-1.5">
        {icon ? (
          <img src={icon} alt="" loading="lazy" decoding="async" className="w-10 h-10 rounded-full object-cover flex-shrink-0 bg-sunken ring-1 ring-rule" />
        ) : (
          <div className="w-10 h-10 rounded-full bg-sunken flex-shrink-0" />
        )}
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <div className="font-bold text-[12px] text-ink leading-tight truncate" title={def.description}>
              {def.name}
            </div>
            <span className={`text-[9px] uppercase tracking-[0.1em] font-bold ${riskColor(MOOD_RISK[mood])}`}>{mood}</span>
          </div>
          <div className="text-[10px] text-sala-muted truncate" title={ACTOR_POWER_TEXT[actor] ?? def.channelMain}>
            Poder: {ACTOR_POWER_TEXT[actor] ?? def.channelMain}
          </div>
        </div>
      </div>

      {/* Satisfacción */}
      <div className="mb-1">
        <div className="flex items-center justify-between text-[10px]">
          <span className="text-sala-dim font-bold tracking-[0.1em] uppercase text-[9px] inline-flex items-center gap-1" title="Cómo le va: depende de los indicadores que le importan">
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
        <div className="h-1 w-full overflow-hidden rounded-full bg-sunken mt-1">
          <div
            className={`h-full rounded-full transition-all duration-500 ${fresh ? SAT_BAR : 'bg-sala-coral/40'}`}
            style={{ width: `${fresh ? st.sat : Math.round(st.sat / 12.5) * 12.5}%` }}
          />
        </div>
      </div>

      {/* Relación */}
      {organized && st.rel !== null && (
        <div className="mb-1.5">
          <div className="flex items-center justify-between text-[10px]">
            <span className="text-sala-dim font-bold tracking-[0.1em] uppercase text-[9px]" title="Tu vínculo con ellos: reuniones, acuerdos cumplidos o incumplidos">Relación</span>
            <span className="font-mono text-ink/80">
              {relationBand(st.rel)} <span className="text-sala-muted">{Math.round(st.rel)}</span>
            </span>
          </div>
          <div className="h-1 w-full overflow-hidden rounded-full bg-sunken mt-1">
            <div className={`h-full rounded-full ${REL_BAR} transition-all duration-500`} style={{ width: `${st.rel}%` }} />
          </div>
        </div>
      )}

      {/* Información revelada */}
      {fresh ? (
        <p className="text-[11px] text-sala-muted leading-snug mb-1.5">{concernSentence(c, actor)}</p>
      ) : (
        <p className="text-[11px] text-sala-dim leading-snug mb-1.5 italic">
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
          {demandAv && !demandAv.available && (
            <div className="mt-1 text-red-300">Ojo: hoy no podrías ejecutarla ({demandAv.reasons[0]})</div>
          )}
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
              className="sr-btn-ghost flex-1 gap-1 text-[10px] px-1.5 py-1.5"
            >
              <MessageSquare size={11} />
              Reunirse {!meetReason && <span className="font-mono text-[10px]">{meetingCost(c, actor) === 0 ? 'gratis' : '1 acción'}</span>}
            </button>
            {offerOpen ? (
              <button
                onClick={() => onInteract(actor, 'acuerdo')}
                disabled={disabled}
                className="sr-btn-navy flex-1 gap-1 text-[10px] px-1.5 py-1.5"
              >
                <FileSignature size={11} />
                Firmar acuerdo
              </button>
            ) : (
              <button
                onClick={() => onInteract(actor, 'negociar')}
                disabled={disabled || !!negReason}
                title={negReason ?? `Negociar su demanda (1 PA). Chance ${chanceLabel(negotiationChance(c, actor))}.`}
                className="sr-btn-ghost flex-1 gap-1 text-[10px] px-1.5 py-1.5"
              >
                <Handshake size={11} />
                Negociar {!negReason && <span className="text-[10px]">({chanceLabel(negotiationChance(c, actor))})</span>}
              </button>
            )}
          </>
        ) : (
          <button
            onClick={() => onInteract(actor, 'encuesta')}
            disabled={disabled || !!pollReason}
            title={pollReason ?? 'Encuesta: revela su satisfacción y los dos temas que más la mueven'}
            className="sr-btn-ghost flex-1 gap-1 text-[10px] px-1.5 py-1.5"
          >
            <BarChart3 size={11} />
            Encuesta <span className="font-mono text-[10px]">{c.perks.freePolls ? 'gratis' : fmtBudget(POLL_COST)}</span>
          </button>
        )}
      </div>
    </div>
  );
}

export function ActorsPanel({ gameState, onInteract, onSelectAction, disabled, index }: ActorsPanelProps) {
  const [expanded, setExpanded] = useState<Set<string>>(new Set(['produccion']));
  const c = gameState.causal;
  const freeLeft = c.perks.freeMeetingsPerTurn - c.freeMeetingsUsed;

  return (
    <section id="panel-actores" className="sr-panel scroll-mt-24" aria-label="Actores">
      <div className="sr-panel-head !pb-2.5">
        <div>
          <span className="sr-label">{index ? `${index} / ` : ''}Mapa de poder</span>
          <h2 className="sr-panel-title">Actores</h2>
        </div>
        <UsersIcon size={17} className="text-sala-dim" />
      </div>
      <p className="px-4 pt-2.5 text-[11px] text-sala-muted flex items-start gap-1.5 leading-snug">
        <Info size={12} className="mt-0.5 flex-shrink-0 text-sala-blue" />
        Satisfacción y relación son variables distintas: la satisfacción es cómo les va; la relación, tu vínculo político. Las reuniones revelan demandas y preocupaciones.
      </p>
      <div className="flex gap-4 px-4 pt-2 text-[10px] text-sala-muted">
        <span className="inline-flex items-center gap-1.5"><i className="w-2 h-2 rounded-full bg-sala-coral" /> Satisfacción</span>
        <span className="inline-flex items-center gap-1.5"><i className="w-2 h-2 rounded-full bg-sala-cyan" /> Relación</span>
      </div>
      {gameState.lastInteractionMessage && (
        <div className="mx-4 mt-3 px-3 py-2 rounded-lg border border-sala-blue/30 bg-sala-blue/10 text-[11px] text-sala-navy font-medium leading-snug">
          {gameState.lastInteractionMessage}
        </div>
      )}

      <div className="p-3 space-y-2">
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
            <div key={family.id} className="rounded-[10px] border border-rule overflow-hidden bg-surface">
              <button
                onClick={() =>
                  setExpanded(prev => {
                    const next = new Set(prev);
                    if (next.has(family.id)) next.delete(family.id);
                    else next.add(family.id);
                    return next;
                  })
                }
                aria-expanded={isOpen}
                className="w-full flex items-center justify-between gap-2 px-3.5 py-2.5 hover:bg-sunken/70 transition-colors text-left"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="flex -space-x-2 flex-shrink-0">
                    {family.members.slice(0, 3).map(a => {
                      const src = getActorIcon(a);
                      return src ? <img key={a} src={src} alt="" loading="lazy" decoding="async" className="w-7 h-7 rounded-full object-cover bg-sunken border-2 border-surface" /> : null;
                    })}
                  </div>
                  <div className="min-w-0">
                    <div className="font-bold text-[13px] text-ink truncate">{family.name}</div>
                    <div className="flex items-center gap-2 text-[9px] font-mono">
                      <span className={riskColor(worst)}>tensión {TENSION_LABEL[worst]}</span>
                      {demands > 0 && <span className="text-amber-300 font-bold">{demands} demanda{demands > 1 ? 's' : ''}</span>}
                    </div>
                  </div>
                </div>
                {isOpen ? <ChevronDown size={14} className="text-ink/70" /> : <ChevronRight size={14} className="text-ink/70" />}
              </button>
              {isOpen && (
                <div className="border-t border-rule divide-y divide-rule">
                  {family.members.map(a => (
                    <ActorCard key={a} state={gameState} actor={a} onInteract={onInteract} onSelectAction={onSelectAction} disabled={disabled} />
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
      <p className="text-[10px] text-sala-muted px-4 pb-4">
        {freeLeft > 0
          ? (freeLeft > 1 ? `Te quedan ${freeLeft} reuniones gratis este turno.` : 'Te queda 1 reunión gratis este turno.')
          : 'Las reuniones de este turno ya cuestan 1 PA.'}
      </p>
    </section>
  );
}
