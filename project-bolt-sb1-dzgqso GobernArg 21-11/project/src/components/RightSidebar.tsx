import { useState } from 'react';
import {
  ChevronDown,
  ChevronRight,
  Vote,
  Calendar,
  Newspaper,
  Bell,
} from 'lucide-react';
import type { GameState, Notification } from '../types/game';
import { POLITICAL_CALENDAR } from '../data/calendar';
import { ACTOR_IDS, ACTORS, PARAMS, type ActorId } from '@/data/causal';
import { getValueRisk, riskColor, riskLabel, type Risk } from '@/lib/risk';
import { satisfactionBand, toneClass } from '@/lib/causalText';
import type { ActorInteraction } from '../engine/gameEngine';
import { ActorsPanel } from './ActorsPanel';

interface RightSidebarProps {
  gameState: GameState;
  onInteract: (actor: ActorId, kind: ActorInteraction) => void;
  onSelectAction: (actionId: string) => void;
  interactionsDisabled: boolean;
}

/** Riesgo de derrota según la distancia al umbral de victoria (45%). */
function defeatRisk(voteIntent: number): Risk {
  const t = PARAMS.VOTOS_PARA_GANAR;
  if (voteIntent >= t + 3) return 'bajo';
  if (voteIntent >= t) return 'medio';
  if (voteIntent >= t - 5) return 'alto';
  return 'critico';
}

function turnsToNextElection(state: GameState): { label: string; turns: number } {
  const inMandate = (state.year - 1) * 4 + state.turn;
  if (inMandate <= 8) return { label: 'Legislativas', turns: 8 - inMandate };
  return { label: state.term >= 2 ? 'Sucesión presidencial' : 'Presidenciales', turns: 16 - inMandate };
}

// ─── Sección 1: Situación Electoral ──────────────────────────────────

function ComponentBar({ label, value, weight, hint }: { label: string; value: number; weight: number; hint: string }) {
  return (
    <div title={hint}>
      <div className="flex items-center justify-between text-[9px] text-muted-foreground">
        <span>{label} <span className="opacity-60">({Math.round(weight * 100)}%)</span></span>
        <span className="font-mono text-foreground/80">{Math.round(value)}</span>
      </div>
      <div className="h-1 w-full overflow-hidden rounded-full bg-white/10 mt-0.5">
        <div className={`h-full rounded-full ${riskColor(getValueRisk(value, 100), 'bg')}`} style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}

function SituacionElectoral({ state }: { state: GameState }) {
  const c = state.causal;
  const p = c.political;
  const risk = defeatRisk(p.iv);
  const voteColor = getValueRisk(p.iv, 100, false);
  const next = turnsToNextElection(state);
  const electorate = ACTOR_IDS.filter(a => ACTORS[a].electoralMode === 'SATISFACCION' && ACTORS[a].electoralWeight >= 5);
  const favor = electorate
    .filter(a => c.actors[a].sat >= 50)
    .sort((x, y) => c.actors[y].sat * ACTORS[y].electoralWeight - c.actors[x].sat * ACTORS[x].electoralWeight)
    .slice(0, 3);
  const contra = electorate
    .filter(a => c.actors[a].sat < 45)
    .sort((x, y) => (50 - c.actors[y].sat) * ACTORS[y].electoralWeight - (50 - c.actors[x].sat) * ACTORS[x].electoralWeight)
    .slice(0, 3);
  const known = (a: ActorId) => c.actors[a].revealedUntil >= c.turn || c.perks.reveals.includes('encuestas');

  return (
    <section className="p-4 border-b border-border space-y-3">
      <div className="flex items-center gap-2">
        <Vote size={13} className="text-muted-foreground" />
        <h3 className="font-display text-[11px] uppercase tracking-widest text-muted-foreground font-bold">
          Situación Electoral
        </h3>
        <span className="ml-auto text-[9px] text-muted-foreground">{next.label} en {next.turns}t</span>
      </div>

      <div className="flex items-end justify-between gap-3">
        <div>
          <div className="text-[10px] text-muted-foreground uppercase tracking-wide">Intención de voto</div>
          <div className={`font-mono text-2xl font-bold leading-none ${riskColor(voteColor)}`}>
            {Math.round(p.iv)}%
          </div>
          <div className="text-[9px] text-muted-foreground mt-0.5">Para ganar: {PARAMS.VOTOS_PARA_GANAR}%</div>
        </div>
        <div className="text-right">
          <div className="text-[10px] text-muted-foreground uppercase tracking-wide">Riesgo derrota</div>
          <span className={`inline-block text-[10px] font-bold uppercase tracking-wide ${riskColor(risk)}`}>
            {riskLabel(risk)}
          </span>
        </div>
      </div>

      <div className="space-y-1.5">
        <ComponentBar label="Humor social" value={p.apro} weight={PARAMS.PESO_APRO_EN_IV} hint="Aprobación: satisfacción de clase media, sectores populares y demás actores según su peso electoral" />
        <ComponentBar label="Aparato político" value={p.estr} weight={PARAMS.PESO_ESTRUCTURA_EN_IV} hint="Estructura: oficialismo, aliados y gobernadores (satisfacción y relación)" />
        <ComponentBar label="Imagen y campaña" value={p.otros} weight={PARAMS.PESO_OTROS_EN_IV} hint="Imagen presidencial: eventos, habilidades, estrategia y desgaste de gestión" />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <div className="text-[9px] text-emerald-400/70 uppercase tracking-wide font-semibold mb-1.5">A favor</div>
          {favor.length === 0 ? (
            <div className="text-[10px] text-muted-foreground/60">—</div>
          ) : (
            favor.map(a => (
              <div key={a} className="flex items-center justify-between gap-1 mb-0.5">
                <span className="text-[10px] text-foreground/70 truncate">{ACTORS[a].shortName}</span>
                <span className="font-mono text-[10px] text-emerald-400 flex-shrink-0">{known(a) ? Math.round(c.actors[a].sat) : '·'}</span>
              </div>
            ))
          )}
        </div>
        <div>
          <div className="text-[9px] text-red-400/70 uppercase tracking-wide font-semibold mb-1.5">En contra</div>
          {contra.length === 0 ? (
            <div className="text-[10px] text-muted-foreground/60">—</div>
          ) : (
            contra.map(a => {
              const band = satisfactionBand(c.actors[a].sat);
              return (
                <div key={a} className="flex items-center justify-between gap-1 mb-0.5">
                  <span className="text-[10px] text-foreground/70 truncate">{ACTORS[a].shortName}</span>
                  <span className={`font-mono text-[10px] flex-shrink-0 ${toneClass(band.tone)}`}>{known(a) ? Math.round(c.actors[a].sat) : '·'}</span>
                </div>
              );
            })
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

const CATEGORY_LABELS: Record<string, string> = {
  economy: 'Economía', social: 'Social', political: 'Política', infrastructure: 'Obras',
  security: 'Seguridad', culture: 'Cultura', system: 'Sistema',
};

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
                      {CATEGORY_LABELS[n.category] ?? n.category}
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

// ─── RightSidebar ────────────────────────────────────────────────────

export function RightSidebar({ gameState, onInteract, onSelectAction, interactionsDisabled }: RightSidebarProps) {
  return (
    <aside className="w-full flex-none flex flex-col overflow-hidden rounded-lg border border-border bg-card max-h-[calc(100vh-5rem)]">
      <div className="flex-1 overflow-y-auto">
        <SituacionElectoral state={gameState} />
        <ActorsPanel
          gameState={gameState}
          onInteract={onInteract}
          onSelectAction={onSelectAction}
          disabled={interactionsDisabled}
        />
        <CalendarPanel state={gameState} />
        <NewsPanel state={gameState} />
      </div>
    </aside>
  );
}
