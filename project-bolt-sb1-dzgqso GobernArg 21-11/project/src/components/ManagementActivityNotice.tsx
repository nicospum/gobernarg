import { useId, useState } from 'react';
import { Info, AlertTriangle } from 'lucide-react';
import type { GameState } from '../types/game';
import type { TurnRecord } from '../engine/causal/types';
import { getScenario } from '../data/causal';
import { previewManagementActivity } from '../engine/causal/managementActivity';

const muted = 'text-ink/75';
const caution = 'text-caution';
const rules = 'Dejar una acción libre no penaliza. Dejar dos o tres repetidamente produce un desgaste menor. No usar ninguna acumula desgaste fuerte desde el cuarto cierre: baja la imagen y puede provocar una crisis de gobernabilidad. Usar tus acciones reduce el desgaste acumulado. Completar un mandato usando todas las acciones y sin medidas suspendidas aporta hasta 0,5 puntos de intención de voto en la elección final del mandato.';

/** Aviso contextual, sin interrumpir el cierre ni revelar resultados futuros. */
export function ManagementActivityNotice({ gameState }: { gameState: GameState }) {
  const [expanded, setExpanded] = useState(false);
  const id = useId();
  if (getScenario(gameState.causal.scenarioId).reelectionsToUnlock > 0 || gameState.gameOver || gameState.pendingElection) return null;
  const { record } = previewManagementActivity(gameState.causal, { available: gameState.baseActions, remaining: gameState.actions });
  if (record.unused <= 1 && record.pressureBefore === 0) return null;
  const strong = record.unused >= 2 && record.pressureAfter > 3;
  const message = record.unused <= 1
    ? 'La gestión activa reduce el desgaste acumulado por inacción.'
    : record.used === 0
      ? strong ? 'Otro turno sin usar acciones debilita fuerte la gobernabilidad.' : 'La inacción repetida desgasta al gobierno; el castigo fuerte llega desde el cuarto cierre sin actuar.'
      : strong ? `Dejar ${record.unused} acciones otra vez aumenta el desgaste acumulado.` : `Dejar ${record.unused} acciones sin usar repetidamente genera un desgaste menor.`;
  return <div data-management-activity className={`text-[12px] leading-snug ${strong ? caution : muted}`}>
    <div className="flex items-start gap-2">
      {strong && <AlertTriangle size={14} className="mt-1 shrink-0" aria-hidden="true" />}
      <p className="flex-1 py-1">{message}</p>
      <button type="button" aria-label="Cómo influye el uso de acciones" aria-expanded={expanded} aria-controls={id} onClick={() => setExpanded(value => !value)} className="inline-flex min-h-11 min-w-11 items-center justify-center rounded border border-rule hover:bg-sunken focus-visible:outline focus-visible:outline-2 focus-visible:outline-current"><Info size={15} /></button>
    </div>
    {expanded && <p id={id} className={`mt-1 pb-2 ${muted}`}>{rules}</p>}
  </div>;
}

/** Resultado del presupuesto del cierre real, también disponible al recargar. */
export function ManagementActivityOutcome({ record, simple = false }: { record: TurnRecord | null; simple?: boolean }) {
  const activity = record?.managementActivity;
  if (!activity) return null;
  const recovered = activity.pressureAfter < activity.pressureBefore;
  if (activity.unused <= 1 && !recovered && !activity.bonusAwarded) return null;
  const strong = activity.pressureAfter > 3 && activity.unused >= 2;
  return <div data-management-activity-outcome className={`text-[12px] leading-relaxed ${strong ? caution : muted}`}>
    {activity.bonusAwarded ? <p>Completaste el mandato usando todas tus acciones: hasta +0,5 puntos de intención de voto por constancia.</p>
      : recovered ? <p>Retomaste la gestión: bajó el desgaste acumulado por inacción.</p>
        : <p>Quedaron {activity.unused} de {activity.available} acciones sin usar. {strong ? 'La inacción acumulada debilitó la gobernabilidad.' : 'Si se repite, desgasta la imagen y el margen para gobernar.'}</p>}
    {!simple && activity.governabilityPenalty > 0 && <p>Gobernabilidad: −{activity.governabilityPenalty.toLocaleString('es-AR', { maximumFractionDigits: 2 })} por desgaste acumulado.</p>}
  </div>;
}
