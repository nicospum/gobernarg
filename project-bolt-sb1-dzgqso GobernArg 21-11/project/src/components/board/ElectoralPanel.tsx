import type { GameState } from '../../types/game';
import { ACTOR_IDS, ACTORS, PARAMS, type ActorId } from '@/data/causal';
import { riskLabel, type Risk } from '@/lib/risk';
import { defeatRisk, nextElection } from '@/lib/boardView';

const RISK_PILL: Record<Risk, string> = {
  bajo: 'text-sala-good',
  medio: 'text-sala-warn',
  alto: 'text-sala-bad',
  critico: 'text-sala-bad',
};

function Component({ label, value, weight, hint, color }: { label: string; value: number; weight: number; hint: string; color: string }) {
  return (
    <div title={hint} className="grid grid-cols-[1fr_auto] gap-1.5">
      <span className="text-[11px] text-sala-muted">{label} <span className="text-sala-dim">({Math.round(weight * 100)}%)</span></span>
      <b className="text-[12px] font-mono text-ink">{Math.round(value)}</b>
      <div className="sr-track col-span-2 !h-[5px]">
        <i style={{ width: `${Math.max(0, Math.min(100, value))}%`, background: `rgb(var(${color}))` }} />
      </div>
    </div>
  );
}

/** Situación electoral: próxima elección, intención de voto y sus componentes. */
export function ElectoralPanel({ gameState, index }: { gameState: GameState; index?: string }) {
  const c = gameState.causal;
  const p = c.political;
  const risk = defeatRisk(p.iv);
  const next = nextElection(gameState);
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
  const who = (list: ActorId[]) =>
    list.length === 0 ? <span className="text-sala-dim">ninguno definido</span> : list.map(a => `${ACTORS[a].shortName}${known(a) ? ` (${Math.round(c.actors[a].sat)})` : ''}`).join(' · ');
  const target = PARAMS.VOTOS_PARA_GANAR;

  return (
    <section id="panel-electoral" className="sr-panel scroll-mt-24" aria-label="Situación electoral">
      <div className="sr-panel-head">
        <div>
          <span className="sr-label">{index ? `${index} / ` : ''}Terreno político</span>
          <h2 className="sr-panel-title">Situación electoral</h2>
        </div>
        <span className={`sr-pill ${RISK_PILL[risk]}`}>Riesgo {riskLabel(risk).toLowerCase()}</span>
      </div>

      <div className="flex items-center justify-between px-4 py-3.5 border-b border-rule">
        <div>
          <span className="text-[11px] text-sala-muted">Próxima elección</span>
          <strong className="block text-[16px] text-ink mt-1">{next.label}</strong>
        </div>
        <div className="text-right">
          <strong className="text-[26px] leading-none font-bold text-sala-coral font-mono">{next.turns}</strong>
          <span className="block text-[11px] text-sala-muted">{next.turns === 1 ? 'turno' : 'turnos'}</span>
        </div>
      </div>

      <div className="px-4 py-3.5 border-b border-rule">
        <div className="flex items-center justify-between">
          <b className="text-[11px] text-sala-muted font-medium">Intención de voto</b>
          <strong className="text-[19px] font-mono text-ink">{Math.round(p.iv)}%</strong>
        </div>
        <div className="relative h-[7px] my-2.5 rounded-full bg-sunken">
          <i className="block h-full rounded-full bg-[linear-gradient(90deg,rgb(var(--coral)),rgb(242_161_87))]" style={{ width: `${Math.min(100, p.iv)}%` }} />
          <span className="absolute -top-1 w-0.5 h-[15px] bg-sala-navy" style={{ left: `${target}%` }} aria-hidden="true" />
        </div>
        <div className="flex justify-between text-[10px] text-sala-muted">
          <span>0%</span>
          <span>Para ganar <b className="text-sala-coral">{target}%</b></span>
          <span>100%</span>
        </div>
      </div>

      <div className="grid gap-2.5 px-4 py-3.5 border-b border-rule">
        <Component label="Humor social" value={p.apro} weight={PARAMS.PESO_APRO_EN_IV} color="--coral" hint="Aprobación: satisfacción de clase media, sectores populares y demás actores según su peso electoral" />
        <Component label="Aparato político" value={p.estr} weight={PARAMS.PESO_ESTRUCTURA_EN_IV} color="--lime" hint="Estructura: oficialismo, aliados y gobernadores" />
        <Component label="Imagen" value={p.otros} weight={PARAMS.PESO_OTROS_EN_IV} color="--violet" hint="Tu imagen y el desgaste de la gestión" />
      </div>

      <div className="px-4 py-3.5 text-[11px] text-sala-muted space-y-1.5">
        <span className="sr-eyebrow block mb-1">Sectores</span>
        <p><b className="text-sala-good">A favor</b> · {who(favor)}</p>
        <p><b className="text-sala-bad">En contra</b> · {who(contra)}</p>
      </div>
    </section>
  );
}
