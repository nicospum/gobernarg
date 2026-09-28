import { useState } from 'react';
import {
  ArrowRight,
  Bell,
  BarChart3,
  Briefcase,
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

export type MobileTab = 'acciones' | 'pais' | 'actores' | 'gabinete';

export const MOBILE_TABS: { id: MobileTab; label: string; icon: typeof LayoutGrid }[] = [
  { id: 'acciones', label: 'Acciones', icon: LayoutGrid },
  { id: 'pais', label: 'País', icon: BarChart3 },
  { id: 'actores', label: 'Actores', icon: Users },
  { id: 'gabinete', label: 'Gabinete', icon: Briefcase },
];

const SHORT_LABEL: Record<string, string> = {
  aprobacion: 'Aprobación',
  gobernabilidad: 'Gobernab.',
  conflictividad: 'Conflictiv.',
  voto: 'Voto',
};

export function unreadNotifications(state: GameState): number {
  return state.notifications.slice(0, 10).filter(n => !n.read).length;
}

/** Encabezado del celular: gobernante, turno y línea del mandato; campana y menú. */
export function MobileHeader({ gameState, onOpenNotifications, onOpenMenu }: {
  gameState: GameState;
  onOpenNotifications: () => void;
  onOpenMenu: () => void;
}) {
  const absoluteTurn = (gameState.year - 1) * 4 + gameState.turn;
  const inMandate = ((absoluteTurn - 1) % MAX_TURNS) + 1;
  const nextMilestone = Object.keys(MILESTONES).map(Number).find(t => t >= inMandate);
  const scenario = getScenario(gameState.causal?.scenarioId);
  const unread = unreadNotifications(gameState);

  return (
    <header className="sticky top-0 z-40 bg-surface/95 backdrop-blur border-b border-rule pl-4 pr-1.5 pt-2 pb-2.5">
      <div className="flex items-center gap-2.5">
        {gameState.avatar ? (
          <img src={gameState.avatar} alt="" className="w-9 h-9 rounded-full object-cover ring-2 ring-gold/60 flex-shrink-0" />
        ) : (
          <div className="w-9 h-9 rounded-full bg-ink text-paper flex items-center justify-center font-display font-semibold text-sm flex-shrink-0">
            {gameState.governorName ? gameState.governorName[0] : 'G'}
          </div>
        )}
        <div className="flex-1 min-w-0 leading-tight">
          <div className="font-display text-[17px] font-semibold text-ink truncate">{gameState.governorName || '—'}</div>
          <div className="text-[12px] text-ink/70 truncate">
            Año {gameState.year} · Turno {inMandate} de {MAX_TURNS}
            {scenario && <> · {scenario.name}</>}
          </div>
        </div>
        <button
          onClick={onOpenNotifications}
          aria-label={unread > 0 ? `Notificaciones (${unread} sin leer)` : 'Notificaciones'}
          className="relative w-11 h-11 flex items-center justify-center rounded-md text-ink hover:bg-sunken"
        >
          <Bell size={21} />
          {unread > 0 && (
            <span className="absolute top-1.5 right-1.5 min-w-[16px] h-4 px-1 rounded-full bg-red-600 text-white text-[10px] font-bold flex items-center justify-center">
              {unread}
            </span>
          )}
        </button>
        <button
          onClick={onOpenMenu}
          aria-label="Menú"
          className="w-11 h-11 flex items-center justify-center rounded-md text-ink hover:bg-sunken"
        >
          <MoreHorizontal size={22} />
        </button>
      </div>
      <div className="mt-2 pr-2.5">
        <MandateTimeline turn={absoluteTurn} />
        <div className="flex justify-between mt-1 text-[11px] text-ink/70">
          <span>Mandato</span>
          {nextMilestone && (
            <span className="text-gold-ink font-semibold">
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

/** Los 4 indicadores políticos en una fila; tocarlos abre su explicación. */
export function MobileKpis({ gameState }: { gameState: GameState }) {
  const cards = indicatorCards(gameState);
  return (
    <section className="grid grid-cols-4 rounded-lg border border-rule bg-surface divide-x divide-rule">
      {cards.map(card => {
        const risk = getValueRisk(card.value, card.max, card.inverseRisk);
        const pct = Math.min(100, Math.max(0, (card.value / card.max) * 100));
        const targetPct = card.target > 0 ? Math.min(100, (card.target / card.max) * 100) : 0;
        return (
          <InfoTooltip
            key={card.id}
            title={card.label}
            content={
              <div className="flex flex-col gap-1.5">
                <div className="flex items-baseline gap-2">
                  <span className={`font-display text-[30px] font-semibold ${riskColor(risk)}`}>
                    {Math.round(card.value)}{card.unit}
                  </span>
                  <TrendChip value={card.trend} inverse={card.inverseRisk} />
                </div>
                {card.targetLabel && <div className="text-[11px] text-ink/70">{card.targetLabel}</div>}
                <div className="text-[11px] text-ink/80">{card.tooltipDetail}</div>
              </div>
            }
          >
            <button className="text-left px-2.5 py-2.5 min-w-0 hover:bg-sunken/60 transition-colors">
              <div className="text-[11px] text-ink/70 truncate">{SHORT_LABEL[card.id] ?? card.label}</div>
              <div className={`font-display text-[22px] font-semibold leading-none mt-1 ${riskColor(risk)}`}>
                {Math.round(card.value)}
                {card.unit && <span className="text-[12px]">{card.unit}</span>}
              </div>
              <div className="relative h-[3px] mt-2 rounded-full bg-sunken">
                <div className={`absolute inset-y-0 left-0 rounded-full ${riskColor(risk, 'bg')}`} style={{ width: `${pct}%` }} />
                {targetPct > 0 && <div className="absolute -top-[3px] w-0.5 h-[9px] bg-ink" style={{ left: `${targetPct}%` }} />}
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
    <div className="fixed inset-x-0 bottom-0 z-40 bg-surface border-t border-rule shadow-[0_-6px_16px_rgba(20,33,61,0.06)] pb-[env(safe-area-inset-bottom)]">
      <div className="flex items-center gap-4 h-[68px] pl-4 pr-3">
        <div className="leading-tight">
          <div className="text-[11px] text-ink/70">Acciones</div>
          <div className="text-[17px] font-bold text-ink font-mono">{gameState.actions}</div>
        </div>
        <button onClick={() => setShowBudget(true)} className="text-left leading-tight -mx-1 px-1 rounded hover:bg-sunken">
          <div className="text-[11px] text-ink/70">Caja</div>
          <div className={`text-[17px] font-bold font-mono ${caja >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>{fmtBudget(caja)}</div>
        </button>
        <button
          onClick={e => {
            e.currentTarget.blur();
            onEndTurn();
          }}
          disabled={!canEndTurn}
          data-no-restore-focus
          className="ml-auto h-12 px-5 rounded-xl bg-ink text-paper text-[15px] font-semibold flex items-center gap-2 disabled:bg-sunken disabled:text-ink/70 active:translate-y-px"
        >
          Finalizar turno
          <ArrowRight size={18} className={canEndTurn ? 'text-gold' : ''} />
        </button>
      </div>
      <nav aria-label="Secciones" className="grid grid-cols-4 h-16 border-t border-rule">
        {MOBILE_TABS.map(({ id, label, icon: Icon }) => {
          const active = id === tab;
          return (
            <button
              key={id}
              onClick={() => onTab(id)}
              aria-current={active ? 'page' : undefined}
              className={`-mt-px flex flex-col items-center justify-center gap-0.5 text-[12px] border-t-[3px] transition-colors ${
                active ? 'border-gold text-ink font-semibold' : 'border-transparent text-ink/70'
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

/** Menú del celular: historial, cuaderno, notificaciones y Reiniciar con confirmación. */
export function MobileMenu({ gameState, onClose, onOpenLog, onOpenNotebook, onOpenNotifications, onOpenHelp, onRestart }: {
  gameState: GameState;
  onClose: () => void;
  onOpenLog: () => void;
  onOpenNotebook: () => void;
  onOpenNotifications: () => void;
  onOpenHelp: () => void;
  onRestart: () => void;
}) {
  const [confirming, setConfirming] = useState(false);
  const unread = unreadNotifications(gameState);
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
        <button className={item} onClick={go(onOpenLog)}>Historial de gestión <ChevronRight size={18} className="text-ink/70" /></button>
        <button className={item} onClick={go(onOpenNotebook)}>Cuaderno político <ChevronRight size={18} className="text-ink/70" /></button>
        <button className={item} onClick={go(onOpenNotifications)}>
          Notificaciones
          <span className="flex items-center gap-1 text-[13px] text-ink/70">
            {unread > 0 && `${unread} sin leer`}
            <ChevronRight size={18} />
          </span>
        </button>
        <button className={item} onClick={go(onOpenHelp)}>Cómo se juega <ChevronRight size={18} className="text-ink/70" /></button>
        <div className="h-px bg-rule my-2" />
        {confirming ? (
          <div className="rounded-xl border border-red-800 bg-red-950 p-4 flex flex-col gap-3">
            <div>
              <div className="text-[15px] font-semibold text-red-400">¿Reiniciar la partida?</div>
              <div className="text-[14px] text-ink/80 mt-0.5">
                Perdés el mandato de {gameState.governorName || 'tu gobernante'} (turno {inMandate} de {MAX_TURNS}). No se puede deshacer.
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2.5">
              <button onClick={() => setConfirming(false)} className="h-12 rounded-lg border border-rule bg-surface text-[15px] font-medium text-ink">
                Cancelar
              </button>
              <button onClick={go(onRestart)} className="h-12 rounded-lg bg-red-600 text-white text-[15px] font-semibold">
                Sí, reiniciar
              </button>
            </div>
          </div>
        ) : (
          <button className={`${item} text-red-400 font-medium`} onClick={() => setConfirming(true)}>
            Reiniciar partida…
          </button>
        )}
      </div>
    </Sheet>
  );
}
