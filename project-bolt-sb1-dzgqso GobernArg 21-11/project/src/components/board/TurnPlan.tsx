import { AlertTriangle, ChevronRight, Crosshair, X } from 'lucide-react';
import type { GameState } from '../../types/game';
import { getPolicyAvailability } from '../../engine/gameEngine';
import { projectedCloseCaja } from '@/engine/causal';
import { fmtBudget, fmtBudgetDelta } from '@/lib/format';

interface TurnPlanProps {
  gameState: GameState;
  onActionSelect: (actionId: string) => void;
  onEndTurn: () => void;
  canEndTurn: boolean;
  /** Número del rótulo (04 en el tablero). */
  index?: string;
}

/**
 * "Este turno": la agenda elegida, las acciones que quedan y la caja
 * proyectada al cierre, con el botón para cerrar el turno.
 */
export function TurnPlan({ gameState, onActionSelect, onEndTurn, canEndTurn, index }: TurnPlanProps) {
  const c = gameState.causal;
  const selected = getPolicyAvailability(gameState).filter(av => gameState.selectedActions.includes(av.action.id));
  const projection = projectedCloseCaja(c, gameState.selectedActions.map(actionId => ({ actionId })));
  const left = gameState.actions;

  return (
    <section className="sr-panel" aria-label="Este turno">
      <div className="sr-panel-head">
        <div>
          <span className="sr-label">{index ? `${index} / ` : ''}Plan de gobierno</span>
          <h2 className="sr-panel-title">Este turno</h2>
        </div>
        <span className="flex-shrink-0 whitespace-nowrap rounded px-2 py-1.5 text-[11px] font-bold bg-sala-lime/25 text-sala-lime-ink" title="Acciones que te quedan este turno">
          {left} <span className="font-normal">{left === 1 ? 'acción' : 'acciones'}</span>
        </span>
      </div>

      {selected.length === 0 ? (
        <div className="text-center px-6 py-6 border-b border-rule">
          <div className="mx-auto mb-2.5 w-10 h-10 rounded-full border border-sala-blue/40 bg-sunken grid place-items-center text-sala-blue">
            <Crosshair size={19} />
          </div>
          <b className="text-[14px] text-ink">Sin acciones en agenda este turno</b>
          <p className="text-[11px] text-sala-muted leading-snug mt-1.5">
            Elegí acciones en la mesa de decisiones para armar tu turno.
          </p>
        </div>
      ) : (
        <ul className="px-4 py-2 border-b border-rule">
          {selected.map(av => (
            <li key={av.action.id} className="flex items-center justify-between gap-2 py-2 border-b border-rule last:border-b-0 text-[12px]">
              <span className="min-w-0 truncate font-medium text-ink">{av.action.name}</span>
              <span className="flex items-center gap-2 flex-shrink-0">
                <span className={`font-mono ${av.caja > 0 ? 'text-sala-good' : av.caja < 0 ? 'text-sala-bad' : 'text-sala-muted'}`}>
                  {av.caja === 0 ? 'sin costo' : fmtBudgetDelta(av.caja)}
                </span>
                <button
                  onClick={() => onActionSelect(av.action.id)}
                  aria-label={`Quitar ${av.action.name} de la agenda`}
                  className="w-7 h-7 grid place-items-center rounded text-sala-muted hover:text-ink hover:bg-sunken"
                >
                  <X size={13} />
                </button>
              </span>
            </li>
          ))}
        </ul>
      )}

      <div
        className="grid grid-cols-2 gap-3 px-4 py-3.5"
        title="Estimación: caja actual + costo de lo elegido + recaudación − gasto corriente − intereses. No incluye efectos diferidos ni eventos."
      >
        <div className="flex flex-col gap-1.5">
          <span className="sr-eyebrow !text-sala-muted">Caja al cierre</span>
          <strong className={`text-[16px] font-mono ${projection.caja >= 0 ? 'text-ink' : 'text-sala-bad'}`}>{fmtBudget(projection.caja)}</strong>
        </div>
        <div className="flex flex-col gap-1.5">
          <span className="sr-eyebrow !text-sala-muted">Resultado fiscal</span>
          <strong className={`text-[16px] font-mono ${projection.structural >= 0 ? 'text-sala-good' : 'text-sala-bad'}`}>
            {fmtBudgetDelta(projection.structural)} <small className="text-[10px] font-normal text-sala-muted">/ turno</small>
          </strong>
        </div>
      </div>
      {projection.caja < 0 && (
        <p className="mx-4 mb-3 flex items-start gap-1.5 rounded-md bg-red-500/10 px-2.5 py-2 text-[11px] font-semibold text-sala-bad">
          <AlertTriangle size={13} className="mt-px flex-shrink-0" />
          Alerta fiscal: la caja caerá en déficit y el Tesoro emitirá moneda en el próximo turno.
        </p>
      )}
      <div className="px-4 pb-4">
        <button
          onClick={e => {
            e.currentTarget.blur();
            onEndTurn();
          }}
          disabled={!canEndTurn}
          data-no-restore-focus
          className="sr-btn-lime w-full justify-between px-4 h-12 text-[12px]"
        >
          Cerrar el trimestre
          <ChevronRight size={17} />
        </button>
      </div>
    </section>
  );
}
