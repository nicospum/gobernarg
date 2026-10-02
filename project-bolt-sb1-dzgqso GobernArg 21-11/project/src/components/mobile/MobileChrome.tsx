import { useState } from 'react';
import {
  BarChart3,
  ChevronRight,
  LayoutGrid,
  MoreHorizontal,
  Users,
} from 'lucide-react';
import type { GameState } from '../../types/game';
import { getScenario } from '@/data/causal';
import { fmtBudget } from '@/lib/format';
import { getValueRisk, riskColor } from '@/lib/risk';
import { InfoTooltip } from '../InfoTooltip';
import { BudgetDetails, TrendChip, indicatorCards } from '../IndicatorsPanel';
import { MAX_TURNS, MILESTONES, MandateTimeline } from '../GameHeader';
import { Sheet } from './Sheet';
import { detailed } from '@/lite/config';

export type MobileTab = 'acciones' | 'pais' | 'actores';

export const MOBILE_TABS: { id: MobileTab; label: string; icon: typeof LayoutGrid }[] = [
  { id: 'acciones', label: 'Acciones', icon: LayoutGrid },
  { id: 'pais', label: 'País', icon: BarChart3 },
  { id: 'actores', label: 'Actores', icon: Users },
];

const SHORT_LABEL: Record<string, string> = {
  aprobacion: 'Aprobación',
  gobernabilidad: 'Gobernab.',
  conflictividad: 'Conflictiv.',
  voto: 'Voto',
};

/** Encabezado del celular: banda marina con gobernante, turno y línea del mandato; menú. */
export function MobileHeader({ gameState, onOpenMenu }: {
  gameState: GameState;
  onOpenMenu: () => void;
}) {
  const absoluteTurn = (gameState.year - 1) * 4 + gameState.turn;
  const inMandate = ((absoluteTurn - 1) % MAX_TURNS) + 1;
  const nextMilestone = Object.keys(MILESTONES).map(Number).find(t => t >= inMandate);
  const scenario = getScenario(gameState.causal?.scenarioId);
  return (
    <header className="sticky top-0 z-40 sr-navy-bar shadow-[0_4px_18px_rgb(7_28_48/0.25)] pl-4 pr-1.5 pt-2.5 pb-3">
      <div className="flex items-center gap-2.5">
        {gameState.avatar ? (
          <img src={gameState.avatar} alt="" className="w-10 h-10 rounded-full object-cover ring-2 ring-sala-sky/70 flex-shrink-0" />
        ) : (
          <div className="w-10 h-10 rounded-full bg-white/15 flex items-center justify-center font-bold text-sm flex-shrink-0">
            {gameState.governorName ? gameState.governorName[0] : 'G'}
          </div>
        )}
        <div className="flex-1 min-w-0 leading-tight">
          <div className="text-[8px] font-bold tracking-[0.15em] text-sala-on-navy">PRESIDENCIA · MANDATO {gameState.term}</div>
          <div className="text-[17px] font-bold truncate">{gameState.governorName || '—'}</div>
          <div className="text-[11px] text-sala-on-navy truncate">
            Año {gameState.year} · Turno {inMandate} de {MAX_TURNS}
            {scenario && <> · {scenario.name}</>}
          </div>
        </div>
        <button
          onClick={onOpenMenu}
          aria-label="Menú"
          className="w-11 h-11 flex items-center justify-center rounded-md hover:bg-white/10"
        >
          <MoreHorizontal size={22} />
        </button>
      </div>
      <div className="mt-2.5 pr-2.5">
        <MandateTimeline turn={absoluteTurn} onNavy />
        <div className="flex justify-between mt-1.5 text-[11px] text-sala-on-navy">
          <span>Mandato</span>
          {nextMilestone && (
            <span className="text-[#ffd27a] font-semibold">
              {MILESTONES[nextMilestone]}
              {nextMilestone > inMandate ? ` en ${nextMilestone - inMandate} ${nextMilestone - inMandate === 1 ? 'turno' : 'turnos'}` : ' este turno'}
            </span>
          )}
          <span>Fin T{MAX_TURNS}</span>
        </div>
      </div>
    </header>
  );
}

const KPI_ACCENT: Record<string, string> = {
  aprobacion: 'var(--sun)',
  gobernabilidad: 'var(--good)',
  conflictividad: 'var(--coral)',
  voto: 'var(--violet)',
};

/** Las 4 métricas políticas en tarjetas 2×2; tocarlas abre su explicación. */
export function MobileKpis({ gameState }: { gameState: GameState }) {
  const all = indicatorCards(gameState);
  // Modo simple: voto, aprobación y gobernabilidad (la caja está en la barra de abajo).
  const cards = detailed() ? all : (['voto', 'aprobacion', 'gobernabilidad'] as const).map(id => all.find(c => c.id === id)!);
  return (
    <section aria-label="Indicadores principales" className={`grid ${detailed() ? 'grid-cols-2' : 'grid-cols-3'} gap-px rounded-xl overflow-hidden border border-rule bg-rule`}>
      {cards.map(card => {
        const risk = getValueRisk(card.value, card.max, card.inverseRisk);
        const pct = Math.min(100, Math.max(0, (card.value / card.max) * 100));
        const targetPct = card.target > 0 ? Math.min(100, (card.target / card.max) * 100) : 0;
        const accent = KPI_ACCENT[card.id] ?? 'var(--blue)';
        return (
          <InfoTooltip
            key={card.id}
            title={card.label}
            content={
              <div className="flex flex-col gap-1.5">
                <div className="flex items-baseline gap-2">
                  <span className={`text-[30px] font-bold ${riskColor(risk)}`}>
                    {Math.round(card.value)}{card.unit}
                  </span>
                  <TrendChip value={card.trend} inverse={card.inverseRisk} />
                </div>
                {card.targetLabel && <div className="text-[11px] text-ink/70">{card.targetLabel}</div>}
                <div className="text-[11px] text-ink/80">{card.tooltipDetail}</div>
              </div>
            }
          >
            <button className="text-left bg-surface px-3.5 pt-2.5 pb-3 min-w-0 border-t-[3px]" style={{ borderTopColor: `rgb(${accent})` }}>
              <div className="flex items-center justify-between gap-1">
                <span className="sr-eyebrow truncate" style={{ color: `rgb(${accent})` }}>{SHORT_LABEL[card.id] ?? card.label}</span>
                {detailed() && <TrendChip value={card.trend} inverse={card.inverseRisk} />}
              </div>
              <div className="text-[24px] font-bold tracking-tight leading-none mt-1.5 text-ink font-mono">
                {Math.round(card.value)}
                {card.unit && <span className="text-[13px]">{card.unit}</span>}
              </div>
              <div className="relative h-[4px] mt-2 rounded-full bg-sunken">
                <div className="absolute inset-y-0 left-0 rounded-full" style={{ width: `${pct}%`, background: `rgb(${accent})` }} />
                {targetPct > 0 && <div className="absolute -top-[3px] w-0.5 h-[10px] bg-sala-navy" style={{ left: `${targetPct}%` }} />}
              </div>
            </button>
          </InfoTooltip>
        );
      })}
    </section>
  );
}

/** Barra fija de abajo: acciones, caja y "Finalizar turno", y las pestañas del tablero. */
export function MobileBottomBar({ gameState, tab, onTab, onEndTurn, canEndTurn }: {
  gameState: GameState;
  tab: MobileTab;
  onTab: (tab: MobileTab) => void;
  onEndTurn: () => void;
  canEndTurn: boolean;
}) {
  const [showBudget, setShowBudget] = useState(false);
  const caja = gameState.causal.caja;
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 bg-surface border-t border-rule shadow-[0_-6px_18px_rgb(9_44_85/0.08)] pb-[env(safe-area-inset-bottom)]">
      <div className="flex items-center gap-3.5 h-[68px] pl-4 pr-3">
        <div className="leading-tight">
          <div className="sr-eyebrow">Acciones</div>
          <div className="text-[18px] font-bold text-sala-lime-ink font-mono mt-0.5">{gameState.actions}</div>
        </div>
        <button onClick={() => setShowBudget(true)} className="text-left leading-tight -mx-1 px-1 rounded hover:bg-sunken">
          <div className="sr-eyebrow">Caja</div>
          <div className={`text-[17px] font-bold font-mono mt-0.5 whitespace-nowrap ${caja >= 0 ? 'text-ink' : 'text-sala-bad'}`}>{fmtBudget(caja)}</div>
        </button>
        <button
          onClick={e => {
            e.currentTarget.blur();
            onEndTurn();
          }}
          disabled={!canEndTurn}
          data-no-restore-focus
          className="sr-btn-lime ml-auto h-12 px-3.5 gap-1.5 text-[11px]"
        >
          Finalizar turno
          <ChevronRight size={18} />
        </button>
      </div>
      <nav aria-label="Secciones" className="grid grid-cols-3 h-16 border-t border-rule">
        {MOBILE_TABS.map(({ id, label, icon: Icon }) => {
          const active = id === tab;
          return (
            <button
              key={id}
              onClick={() => onTab(id)}
              aria-current={active ? 'page' : undefined}
              className={`-mt-px flex flex-col items-center justify-center gap-0.5 text-[12px] border-t-[3px] transition-colors ${
                active ? 'border-sala-blue text-sala-blue font-bold' : 'border-transparent text-sala-muted'
              }`}
            >
              <Icon size={22} strokeWidth={1.8} />
              {label}
            </button>
          );
        })}
      </nav>
      {showBudget && (
        <Sheet title="Caja del Tesoro" onClose={() => setShowBudget(false)}>
          <BudgetDetails gameState={gameState} />
        </Sheet>
      )}
    </div>
  );
}

/** Menú del celular: ayuda, opinión y Reiniciar con confirmación. */
export function MobileMenu({ gameState, onClose, onOpenHelp, onOpenFeedback, onRestart }: {
  gameState: GameState;
  onClose: () => void;
  onOpenHelp: () => void;
  onOpenFeedback: () => void;
  onRestart: () => void;
}) {
  const [confirming, setConfirming] = useState(false);
  const absoluteTurn = (gameState.year - 1) * 4 + gameState.turn;
  const inMandate = ((absoluteTurn - 1) % MAX_TURNS) + 1;
  const item = 'w-full min-h-[52px] flex items-center justify-between px-1 text-[15px] text-ink rounded-md hover:bg-sunken';
  const go = (fn: () => void) => () => {
    onClose();
    fn();
  };

  return (
    <Sheet title="Menú" onClose={onClose}>
      <div className="flex flex-col">
        <span className="sr-label mb-1">Partida</span>
        <button className={item} onClick={go(onOpenHelp)}>Cómo se juega <ChevronRight size={18} className="text-sala-dim" /></button>
        <button className={item} onClick={go(onOpenFeedback)}>Contanos cómo te fue <ChevronRight size={18} className="text-sala-dim" /></button>
        <div className="h-px bg-rule my-2" />
        {confirming ? (
          <div className="rounded-xl border border-sala-bad/30 bg-red-500/10 p-4 flex flex-col gap-3">
            <div>
              <div className="text-[15px] font-bold text-sala-bad">¿Reiniciar la partida?</div>
              <div className="text-[14px] text-ink/80 mt-0.5">
                Perdés el mandato de {gameState.governorName || 'tu gobernante'} (turno {inMandate} de {MAX_TURNS}). No se puede deshacer.
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2.5">
              <button onClick={() => setConfirming(false)} className="h-12 rounded-lg border border-rule bg-surface text-[15px] font-medium text-ink">
                Cancelar
              </button>
              <button onClick={go(onRestart)} className="h-12 rounded-lg bg-sala-bad text-white text-[15px] font-semibold">
                Sí, reiniciar
              </button>
            </div>
          </div>
        ) : (
          <button className={`${item} text-sala-bad font-medium`} onClick={() => setConfirming(true)}>
            Reiniciar partida…
          </button>
        )}
      </div>
    </Sheet>
  );
}
