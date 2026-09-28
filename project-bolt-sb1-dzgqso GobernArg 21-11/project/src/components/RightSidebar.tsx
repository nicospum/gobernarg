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
    <div title={hint} className="space-y-0.5">
      <div className="flex items-center justify-between text-[10px] text-ink/70">
        <span>{label} <span className="text-ink/70">({Math.round(weight * 100)}%)</span></span>
        <span className="font-mono text-ink font-bold">{Math.round(value)}</span>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-ink/8">
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
    <section className="p-4 border-b border-ink/8 space-y-3.5 bg-surface">
      <div className="flex items-center gap-2">
        <Vote size={14} className="text-blue-400" />
        <h3 className="font-display text-[16px]   text-ink font-semibold">
          Situación electoral
        </h3>
        <span className="ml-auto text-[11px] text-gold-ink font-medium">
          {next.label} en {next.turns}t
        </span>
      </div>

      <div className="flex items-end justify-between gap-3 bg-sunken/50 px-3 py-2.5 rounded-md">
        <div>
          <div className="text-[9px] text-ink/70 uppercase tracking-widest font-bold">Intención de voto</div>
          <div className={`font-mono text-3xl font-bold leading-none mt-1 ${riskColor(voteColor)}`}>
            {Math.round(p.iv)}%
          </div>
          <div className="text-[9px] text-ink/70 mt-1 font-mono">Meta victoria: {PARAMS.VOTOS_PARA_GANAR}%</div>
        </div>
        <div className="text-right">
          <div className="text-[9px] text-ink/70 uppercase tracking-widest font-bold">Riesgo derrota</div>
          <span className={`inline-block text-[11px] font-bold uppercase tracking-wider mt-1 ${riskColor(risk)}`}>
            {riskLabel(risk)}
          </span>
        </div>
      </div>

      <div className="space-y-2">
        <ComponentBar label="Humor social" value={p.apro} weight={PARAMS.PESO_APRO_EN_IV} hint="Aprobación: satisfacción de clase media, sectores populares y demás actores según su peso electoral" />
        <ComponentBar label="Aparato político" value={p.estr} weight={PARAMS.PESO_ESTRUCTURA_EN_IV} hint="Estructura: oficialismo, aliados y gobernadores" />
        <ComponentBar label="Imagen" value={p.otros} weight={PARAMS.PESO_OTROS_EN_IV} hint="Tu imagen y el desgaste de la gestión" />
      </div>

      <div className="grid grid-cols-2 gap-3 pt-1">
        <div className="bg-sunken/50 p-2.5 rounded-md">
          <div className="text-[9px] text-emerald-400 uppercase tracking-wider font-bold mb-1.5 border-b border-ink/6 pb-1">
            A favor
          </div>
          {favor.length === 0 ? (
            <div className="text-[10px] text-ink/70">—</div>
          ) : (
            favor.map(a => (
              <div key={a} className="flex items-center justify-between gap-1 mb-1">
                <span className="text-[10px] text-ink/80 truncate font-medium">{ACTORS[a].shortName}</span>
                <span className="font-mono text-[10px] font-bold text-emerald-400 flex-shrink-0">{known(a) ? Math.round(c.actors[a].sat) : '·'}</span>
              </div>
            ))
          )}
        </div>
        <div className="bg-sunken/50 p-2.5 rounded-md">
          <div className="text-[9px] text-red-400 uppercase tracking-wider font-bold mb-1.5 border-b border-ink/6 pb-1">
            En contra
          </div>
          {contra.length === 0 ? (
            <div className="text-[10px] text-ink/70">—</div>
          ) : (
            contra.map(a => {
              const band = satisfactionBand(c.actors[a].sat);
              return (
                <div key={a} className="flex items-center justify-between gap-1 mb-1">
                  <span className="text-[10px] text-ink/80 truncate font-medium">{ACTORS[a].shortName}</span>
                  <span className={`font-mono text-[10px] font-bold flex-shrink-0 ${toneClass(band.tone)}`}>{known(a) ? Math.round(c.actors[a].sat) : '·'}</span>
                </div>
              );
            })
          )}
        </div>
      </div>
    </section>
  );
}

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
    <section className="border-b border-ink/8">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-ink/4 transition-colors text-left"
      >
        <div className="flex items-center gap-2">
          <Calendar size={14} className="text-blue-400" />
          <h3 className="font-display text-[16px]   text-ink font-semibold">
            Calendario político
          </h3>
        </div>
        {open ? (
          <ChevronDown size={14} className="text-ink/70" />
        ) : (
          <ChevronRight size={14} className="text-ink/70" />
        )}
      </button>

      {open && (
        <div className="px-4 pb-4 space-y-2">
          {upcoming.length === 0 ? (
            <div className="text-[11px] text-ink/70 py-2">Sin eventos próximos en agenda.</div>
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
                  ? 'border-red-500/30 bg-red-500/10'
                  : sev === 'warning'
                    ? 'border-amber-500/30 bg-amber-500/10'
                    : 'border-blue-500/30 bg-blue-500/10';
              const turnCls =
                sev === 'critical'
                  ? 'text-red-400'
                  : sev === 'warning'
                    ? 'text-amber-400'
                    : 'text-blue-400';
              return (
                <div key={ev.id} className={`rounded-xl border p-3 shadow-md ${borderCls}`}>
                  <div className="flex items-start justify-between gap-2">
                    <div className="font-display font-semibold text-[16px] text-ink leading-tight">
                      {ev.title}
                    </div>
                    <div className="flex-shrink-0 text-right">
                      <div className={`font-mono text-[12px] font-bold ${turnCls}`}>T{abs}</div>
                      <div className="text-[9px] text-ink/70 font-mono">
                        en {diff}t
                      </div>
                    </div>
                  </div>
                  <p className="text-[11px] text-ink/70 leading-snug mt-1">
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
    return { border: 'border-red-500/30 bg-red-500/10', text: 'text-red-400' };
  }
  if (importance === 'success') {
    return { border: 'border-emerald-500/30 bg-emerald-500/10', text: 'text-emerald-400' };
  }
  if (importance === 'medium') {
    return { border: 'border-amber-500/30 bg-amber-500/10', text: 'text-amber-400' };
  }
  return { border: 'border-ink/8 bg-surface', text: 'text-ink/70' };
}

function NewsPanel({ state }: { state: GameState }) {
  const [open, setOpen] = useState(true);
  const news = (state.notifications ?? [])
    .filter((n) => !n.dismissed)
    .slice(0, 5);

  return (
    <section className="border-b border-ink/8">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-ink/4 transition-colors text-left"
      >
        <div className="flex items-center gap-2">
          <Newspaper size={14} className="text-blue-400" />
          <h3 className="font-display text-[16px]   text-ink font-semibold">
            Noticias y novedades
          </h3>
          {news.length > 0 && (
            <span className="text-[10px] font-mono font-bold text-blue-300 bg-blue-500/20 px-1.5 py-0.5 rounded border border-blue-500/30">{news.length}</span>
          )}
        </div>
        {open ? (
          <ChevronDown size={14} className="text-ink/70" />
        ) : (
          <ChevronRight size={14} className="text-ink/70" />
        )}
      </button>

      {open && (
        <div className="px-4 pb-4 space-y-2">
          {news.length === 0 ? (
            <div className="text-[11px] text-ink/70 py-2 flex items-center gap-2">
              <Bell size={12} />
              Sin noticias nuevas por el momento.
            </div>
          ) : (
            news.map((n) => {
              const sev = severityCls(n);
              return (
                <div key={n.id} className={`rounded-xl border p-3 shadow-md ${sev.border}`}>
                  <div className="font-bold text-[12px] text-ink leading-tight">
                    {n.title}
                  </div>
                  {n.message && (
                    <p className="text-[11px] text-ink/70 leading-snug mt-1">{n.message}</p>
                  )}
                  {n.category && (
                    <span className={`inline-block text-[9px] uppercase tracking-wider font-bold mt-1.5 ${sev.text}`}>
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

export function RightSidebar({ gameState, onInteract, onSelectAction, interactionsDisabled }: RightSidebarProps) {
  return (
    <aside className="w-full flex-none flex flex-col overflow-hidden rounded-lg border border-ink/8 bg-surface  max-h-[calc(100vh-5rem)]">
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
