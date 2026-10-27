import { useRef, useState, type ChangeEvent } from 'react';
import { createPortal } from 'react-dom';
import { Download, Upload, RotateCcw, Save } from 'lucide-react';
import type { GameState } from '../types/game';
import type { GameEvent } from '../systems/events/types';
import { encodeSavedGame, parseSavedGame, type SavedGame } from '../lib/savegame';
import { useDialog } from '../lib/useDialog';
import { calendarFor } from '../lib/calendar';

interface SaveControlsProps {
  state?: GameState;
  pendingEvents: GameEvent[];
  failed: boolean;
  onRetry: () => void;
  onRestore: (saved: SavedGame) => void;
  onImportOpenChange: (open: boolean) => void;
}

function downloadBackup(state: GameState, events: GameEvent[]) {
  const url = URL.createObjectURL(new Blob([encodeSavedGame(state, events)], { type: 'application/json' }));
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = `gobernarg-light-${new Date().toISOString().slice(0, 10)}.json`;
  anchor.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function RestoreConfirmation({ saved, hasCurrent, onCancel, onConfirm, onBackup }: {
  saved: SavedGame;
  hasCurrent: boolean;
  onCancel: () => void;
  onConfirm: () => void;
  onBackup: () => void;
}) {
  const ref = useDialog<HTMLDivElement>(onCancel);
  return createPortal(
    <div ref={ref} aria-labelledby="restore-light-title" className="fixed inset-0 z-[80] flex items-center justify-center bg-sala-navy/60 p-4 outline-none">
      <div className="w-full max-w-md rounded-xl border border-rule bg-surface p-5 shadow-xl text-ink">
        <h2 id="restore-light-title" className="text-lg font-bold">Cargar respaldo</h2>
        <p className="mt-3 text-sm leading-relaxed">Vas a continuar la partida de <strong>{saved.state.governorName}</strong>.</p>
        <p className="mt-2 text-xs text-sala-muted">Calendario: {calendarFor(saved.state).turnsPerMandate} {calendarFor(saved.state).periodLabelPlural} por mandato.</p>
        {hasCurrent && <p className="mt-2 text-sm leading-relaxed">Reemplazará la partida abierta. Podés descargarla antes de continuar.</p>}
        <div className="mt-5 flex flex-wrap gap-2">
          {hasCurrent && <button type="button" onClick={onBackup} className="sr-btn-ghost min-h-11 px-3 text-sm"><Download size={15} />Respaldar la actual</button>}
          <button type="button" onClick={onCancel} className="sr-btn-ghost min-h-11 px-3 text-sm">Cancelar</button>
          <button type="button" onClick={onConfirm} className="sr-btn-navy min-h-11 px-4 text-sm">Cargar partida</button>
        </div>
      </div>
    </div>, document.body,
  );
}

/** Herramientas discretas; un fallo nunca queda oculto ni reemplaza el progreso en memoria. */
export function SaveControls({ state, pendingEvents, failed, onRetry, onRestore, onImportOpenChange }: SaveControlsProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [candidate, setCandidate] = useState<SavedGame | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [reading, setReading] = useState(false);
  const close = () => { setCandidate(null); onImportOpenChange(false); };
  const readBackup = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    setError(null);
    if (file.size > 8_000_000) { setError('El respaldo es demasiado grande. Elegí un archivo de GobernArg Light de menos de 8 MB.'); return; }
    setReading(true);
    try {
      const saved = parseSavedGame(await file.text());
      if (!saved) { setError('Ese archivo no es un respaldo válido de GobernArg Light. Tu partida sigue igual.'); return; }
      setCandidate(saved);
      onImportOpenChange(true);
    } catch {
      setError('No pudimos leer el respaldo. Tu partida sigue igual.');
    } finally { setReading(false); }
  };
  return (
    <div className="px-3 py-2 text-xs text-sala-muted">
      {failed && <div role="alert" className="mb-2 rounded-lg border border-[rgb(180_130_45/0.35)] bg-[rgb(255_248_226)] p-3 text-[rgb(115_66_8)]">
        <p className="font-semibold">No se pudo guardar en este navegador.</p>
        <p className="mt-1">La partida sigue abierta. Descargá un respaldo antes de salir.</p>
        <div className="mt-2 flex flex-wrap gap-2">
          <button type="button" onClick={onRetry} className="sr-btn-ghost min-h-11 px-3"><RotateCcw size={14} />Reintentar</button>
          {state && <button type="button" onClick={() => downloadBackup(state, pendingEvents)} className="sr-btn-ghost min-h-11 px-3"><Download size={14} />Descargar respaldo</button>}
        </div>
      </div>}
      <details>
        <summary className="w-fit cursor-pointer rounded px-1 py-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-sala-blue">Partida y respaldos</summary>
        <div className="flex flex-wrap items-center gap-2 py-2">
          {state && <button type="button" onClick={() => downloadBackup(state, pendingEvents)} className="sr-btn-ghost min-h-11 px-3"><Download size={14} />Descargar respaldo</button>}
          <button type="button" onClick={() => inputRef.current?.click()} disabled={reading} className="sr-btn-ghost min-h-11 px-3"><Upload size={14} />{reading ? 'Leyendo…' : 'Cargar respaldo'}</button>
          <span className="inline-flex items-center gap-1"><Save size={12} />{failed ? 'Guardado pendiente' : 'Guardado automático en este navegador'}</span>
        </div>
        {state && calendarFor(state).id === 'legacy-16' && <p className="pb-2">Esta partida anterior conserva sus 16 trimestres por mandato y todos sus plazos.</p>}
      </details>
      <input ref={inputRef} type="file" accept="application/json,.json" aria-label="Archivo de respaldo de Light" className="hidden" onChange={readBackup} />
      {error && <p role="alert" className="mt-2 text-sala-bad">{error}</p>}
      {candidate && <RestoreConfirmation saved={candidate} hasCurrent={!!state} onCancel={close} onBackup={() => { if (state) downloadBackup(state, pendingEvents); }} onConfirm={() => { const saved = candidate; close(); onRestore(saved); }} />}
    </div>
  );
}
