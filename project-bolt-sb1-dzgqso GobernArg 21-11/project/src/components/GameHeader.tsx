import {
  CalendarDays,
  ChevronRight,
  Flag,
  RefreshCw,
  MoreHorizontal,
  BookOpen,
  MessageSquareHeart,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { ConfirmDialog } from './ConfirmDialog';
import { GameState } from '../types/game';
import { fmtBudget, fmtBudgetDelta } from '@/lib/format';
import { detailed } from '@/lite/config';
import { kpiWord } from '@/lib/simpleView';
import { getScenario } from '@/data/causal';

interface GameHeaderProps {
  gameState: GameState;
  availableActions: number;
  onRestart: () => void;
  onEndTurn?: () => void;
  canEndTurn?: boolean;
  onOpenHelp?: () => void;
  onOpenFeedback?: () => void;
  /** Campana: lleva al panel de notificaciones. */
}

const POSITION_LABEL: Record<string, string> = {
  presidente: 'Presidente',
};

export const MAX_TURNS = 16;
/** Hitos del mandato marcados en la línea de tiempo (turno dentro del mandato). */
export const MILESTONES: Record<number, string> = { 8: 'Legislativas', 16: 'Fin del mandato' };

/** Línea de tiempo del mandato: un tramo por turno, con los hitos en oro. */
export function MandateTimeline({ turn, onNavy = false }: { turn: number; onNavy?: boolean }) {
  const current = ((turn - 1) % MAX_TURNS) + 1;
  return (
    <div className="flex items-center gap-[3px]" role="img" aria-label={`Turno ${current} de ${MAX_TURNS} del mandato`}>
      {Array.from({ length: MAX_TURNS }, (_, i) => {
        const n = i + 1;
        const milestone = MILESTONES[n];
        const done = n < current;
        const now = n === current;
        return (
          <span
            key={n}
            title={milestone ? `Turno ${n}: ${milestone}` : `Turno ${n}`}
            className={`h-1.5 flex-1 min-w-[6px] rounded-[1px] ${
              onNavy
                ? now ? 'bg-sala-lime' : done ? 'bg-white/60' : milestone ? 'bg-sala-sun' : 'bg-white/20'
                : now ? 'bg-sala-navy' : done ? 'bg-sala-blue/50' : milestone ? 'bg-sala-sun' : 'bg-rule'
            } ${now ? 'h-2' : ''}`}
          />
        );
      })}
    </div>
  );
}

/**
 * Menú de la partida. "Reiniciar" vive acá, lejos de "Finalizar turno", y
 * siempre pide confirmación: antes borraba el mandato con un solo clic.
 */
function GameMenu({ governorName, turnLabel, onRestart, onOpenHelp, onOpenFeedback }: {
  governorName: string;
  turnLabel: string;
  onRestart: () => void;
  onOpenHelp?: () => void;
  onOpenFeedback?: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const boxRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const onPointer = (e: PointerEvent) => {
      if (!boxRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false);
        buttonRef.current?.focus();
      }
    };
    document.addEventListener('pointerdown', onPointer);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('pointerdown', onPointer);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const item = 'w-full flex items-center gap-2.5 px-3 h-11 text-left text-sm rounded-md transition-colors';
  const run = (fn?: () => void) => () => {
    setOpen(false);
    fn?.();
  };

  return (
    <div ref={boxRef} className="relative">
      <button
        ref={buttonRef}
        onClick={() => setOpen(o => !o)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Menú"
        className="flex items-center gap-1.5 text-[12px] text-sala-on-navy hover:text-white transition-colors px-2.5 h-10 rounded-md hover:bg-white/10"
      >
        <MoreHorizontal size={16} />
        <span className="hidden xl:inline">Menú</span>
      </button>
      {open && (
        <div role="menu" className="absolute right-0 top-full mt-1.5 w-60 rounded-lg border border-rule bg-surface text-ink shadow-xl p-1.5 z-50">
          {onOpenHelp && (
            <button role="menuitem" onClick={run(onOpenHelp)} className={`${item} text-ink hover:bg-sunken`}>
              <BookOpen size={15} className="text-ink/70" /> Cómo se juega
            </button>
          )}
          {onOpenFeedback && (
            <button role="menuitem" onClick={run(onOpenFeedback)} className={`${item} text-ink hover:bg-sunken`}>
              <MessageSquareHeart size={15} className="text-ink/70" /> Contanos cómo te fue
            </button>
          )}
          <div className="my-1.5 h-px bg-rule" />
          <button role="menuitem" onClick={run(() => setConfirming(true))} className={`${item} text-red-400 hover:bg-red-950`}>
            <RefreshCw size={15} /> Reiniciar partida…
          </button>
        </div>
      )}
      {confirming && (
        <ConfirmDialog
          danger
          title="¿Reiniciar la partida?"
          message={`Perdés el mandato de ${governorName || 'tu gobernante'} (${turnLabel}). No se puede deshacer.`}
          confirmLabel="Sí, reiniciar"
          onCancel={() => setConfirming(false)}
          onConfirm={() => {
            setConfirming(false);
            onRestart();
          }}
        />
      )}
    </div>
  );
}

export function GameHeader({
  gameState,
  availableActions,
  onRestart,
  onEndTurn,
  canEndTurn,
  onOpenHelp,
  onOpenFeedback,
}: GameHeaderProps) {
  const c = gameState.causal;
  const absoluteTurn = (gameState.year - 1) * 4 + gameState.turn;
  const positionLabel = POSITION_LABEL[gameState.position] ?? gameState.position;
  const scenarioDef = getScenario(c?.scenarioId);
  const inMandate = ((absoluteTurn - 1) % MAX_TURNS) + 1;
  const apro = Math.round(c.political.apro);
  const last = c.records[c.records.length - 1];
  const divider = 'pl-4 border-l border-white/15';

  return (
    <header className="sticky top-0 z-50 sr-navy-bar shadow-[0_4px_18px_rgb(7_28_48/0.25)]">
      <div className="max-w-[1540px] mx-auto flex items-center gap-4 xl:gap-5 px-4 lg:px-7 min-h-[72px] py-2.5">
        {/* Marca */}
        <div className="flex items-center gap-2.5 flex-none">
          <div className="w-[38px] h-[38px] grid place-items-center rounded-xl border border-sala-sky/70 bg-[linear-gradient(135deg,rgb(11_142_174),rgb(23_100_179))]">
            <Flag size={19} />
          </div>
          <div className="hidden 2xl:block">
            <div className="text-[18px] font-extrabold tracking-[0.1em] leading-none">GOBERN<span className="text-[#79e1e7]">ARG</span></div>
            <div className="text-[8px] font-bold tracking-[0.15em] text-sala-on-navy mt-1">SALA DE SITUACIÓN · LITE</div>
          </div>
        </div>

        {/* Gobernante */}
        {/* Entre 1024 y 1279 px el nombre y el escenario se acortan para que entre todo. */}
        <div className={`flex items-center gap-2.5 flex-initial min-w-0 ${divider}`}>
          {gameState.avatar ? (
            <img src={gameState.avatar} alt={gameState.governorName} className="w-9 h-9 rounded-full object-cover ring-2 ring-sala-sky/60" />
          ) : (
            <div className="w-9 h-9 rounded-full bg-white/15 flex items-center justify-center font-bold text-sm">
              {gameState.governorName ? gameState.governorName[0] : 'G'}
            </div>
          )}
          <div className="leading-tight min-w-0">
            <div className="text-[8px] font-bold tracking-[0.15em] text-sala-on-navy">PRESIDENCIA</div>
            <div className="text-[15px] font-bold truncate max-w-[170px]">{gameState.governorName || '—'}</div>
            <div className="text-[10px] text-sala-on-navy truncate max-w-[200px]">
              {positionLabel} · Mandato {gameState.term}
              {scenarioDef && <span title={`Escenario: ${scenarioDef.name}`}> · {scenarioDef.name}</span>}
            </div>
          </div>
        </div>

        {/* Calendario del mandato */}
        <div className={`hidden md:flex flex-col gap-1.5 flex-1 min-w-[136px] max-w-[260px] ${divider}`}>
          <div className="flex items-center gap-2 text-[11px] tracking-[0.08em] uppercase">
            <CalendarDays size={14} />
            <span>Año {gameState.year} / Trimestre {gameState.turn}</span>
          </div>
          <span className="text-[10px] text-sala-on-navy">Turno <strong className="text-white">{inMandate}</strong> de {MAX_TURNS}</span>
          <MandateTimeline turn={absoluteTurn} onNavy />
        </div>

        <div className="flex-1" />

        {/* Recursos del turno */}
        <div className={`flex flex-col gap-0.5 flex-none ${divider}`} title="Acciones disponibles este turno">
          <span className="text-[8px] font-bold tracking-[0.14em] text-sala-on-navy">ACCIONES</span>
          <strong className="text-[19px] leading-none text-sala-lime font-mono">{availableActions}</strong>
          <small className="text-[9px] text-sala-on-navy">disponibles</small>
        </div>
        <div className={`flex flex-col gap-0.5 flex-none ${divider}`} title="Caja del Tesoro">
          <span className="text-[8px] font-bold tracking-[0.14em] text-sala-on-navy">CAJA</span>
          <strong className="text-[19px] leading-none font-mono">{fmtBudget(c.caja)}</strong>
          {!detailed() ? (
            <small className={`text-[9px] ${c.caja >= 0 ? 'text-sala-on-navy' : 'text-[#ffa594]'}`}>{c.caja >= 0 ? 'con fondos' : 'en rojo'}</small>
          ) : last ? (
            <small className={`text-[9px] ${last.fiscal.resultado >= 0 ? 'text-[#7fe0c7]' : 'text-[#ffa594]'}`}>
              {fmtBudgetDelta(last.fiscal.resultado)} / turno
            </small>
          ) : (
            <small className="text-[9px] text-sala-on-navy">al asumir</small>
          )}
        </div>
        {/* Modo simple: la aprobación no se muestra (sigue en el motor). */}
        <div className={`hidden ${detailed() ? 'lg:flex' : ''} flex-col gap-1 flex-none min-w-[96px] ${divider}`} title="Aprobación de gestión">
          <span className="text-[8px] font-bold tracking-[0.14em] text-sala-on-navy">APROBACIÓN</span>
          {detailed() ? (
            <strong className="text-[19px] leading-none font-mono">{apro}%</strong>
          ) : (
            <strong className="text-[17px] leading-none">{kpiWord(apro).word}</strong>
          )}
          <div className="h-1 rounded-full bg-white/15 overflow-hidden">
            <i className="block h-full bg-sala-lime" style={{ width: `${apro}%` }} />
          </div>
        </div>

        {/* Controles */}
        <div className={`flex items-center gap-1.5 flex-none ${divider}`}>
          <GameMenu
            governorName={gameState.governorName}
            turnLabel={`turno ${inMandate} de ${MAX_TURNS}`}
            onRestart={onRestart}
            onOpenHelp={onOpenHelp}
            onOpenFeedback={onOpenFeedback}
          />

          {onEndTurn && (
            <button
              onClick={e => {
                // Sin foco en el botón, un Enter posterior no cierra otro turno.
                e.currentTarget.blur();
                onEndTurn();
              }}
              disabled={!canEndTurn}
              data-no-restore-focus
              className="sr-btn-lime h-11 px-4 text-[11px] ml-1"
            >
              Finalizar turno
              <ChevronRight size={17} />
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
