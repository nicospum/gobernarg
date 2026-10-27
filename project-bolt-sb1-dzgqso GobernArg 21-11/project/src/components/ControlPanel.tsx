import { useMemo, useState } from 'react';
import { Eye, EyeOff, LayoutGrid, Scale, Users } from 'lucide-react';
import { GameState } from '../types/game';
import { ActionCard } from './ActionCard';
import { getPolicyAvailability } from '../engine/gameEngine';
import { UI_CATEGORY_STYLES } from '@/data/categoryStyles';
import { ACTOR_IDS, PARAMS, UI_CATEGORIES, type ActorId, type UiCategory } from '@/data/causal';
import {
  internaCostMult,
  internaEfficacy,
  internaLawPlus,
  internaLevel,
  legForLaws,
  lawThreshold,
  projectedCloseCaja,
} from '@/engine/causal';
import { fmtBudget, fmtBudgetDelta } from '@/lib/format';

interface ControlPanelProps {
  gameState: GameState;
  onActionSelect: (actionId: string) => void;
  canTakeAction: boolean;
  onOpenNotebook?: () => void;
}

type TabValue = 'todas' | UiCategory;

export function ControlPanel({ gameState, onActionSelect, canTakeAction, onOpenNotebook }: ControlPanelProps) {
  const [selectedCategory, setSelectedCategory] = useState<TabValue>('todas');
  const [showBlocked, setShowBlocked] = useState(false);
  const [preparations, setPreparations] = useState(false);
  const chooseCategory = (category: TabValue) => { setSelectedCategory(category); setPreparations(false); };
  const availability = getPolicyAvailability(gameState);
  const causal = gameState.causal;

  // Demandas reveladas en reuniones → la acción pedida se marca en la grilla.
  const requestedBy = useMemo(() => {
    const map: Record<string, ActorId[]> = {};
    for (const a of ACTOR_IDS) {
      const d = causal.actors[a].demand;
      if (d && d.revealedTurn !== null && causal.turn - d.revealedTurn < PARAMS.VENTANA_DEMANDA) {
        (map[d.actionId] ??= []).push(a);
      }
    }
    return map;
  }, [causal]);

  const inCategory = availability
    .filter(av => selectedCategory === 'todas' || av.action.category === selectedCategory)
    .filter(av => !preparations || ['estudio_factibilidad', 'agenda_internacional', 'mejorar_recaudacion', 'fortalecimiento_justicia'].includes(av.action.id));
  const blockedCount = inCategory.filter(av => av.blocked).length;
  const filtered = inCategory
    .filter(av => showBlocked || !av.blocked)
    .sort((x, y) => {
      const sx = gameState.selectedActions.includes(x.action.id) ? 0 : x.available ? 1 : 2;
      const sy = gameState.selectedActions.includes(y.action.id) ? 0 : y.available ? 1 : 2;
      return sx - sy;
    });

  const selectedCaja = availability
    .filter(av => gameState.selectedActions.includes(av.action.id))
    .reduce((acc, av) => acc + av.caja, 0);

  const projection = projectedCloseCaja(causal, gameState.selectedActions.map(actionId => ({ actionId })));
  const leg = Math.round(legForLaws(causal));
  const threshold = lawThreshold(causal);
  const honeymoon = causal.turn - causal.mandateStart + 1 <= PARAMS.LUNA_MIEL;
  const hasMajority = leg >= threshold;
  const interna = causal.political.interna;
  const due = causal.agreements.filter(agreement => agreement.status === 'active' && agreement.deadline <= causal.turn + 1);

  return (
    <div className="flex flex-col rounded-lg border border-rule bg-surface overflow-hidden">
      {/* Header */}
      <div className="flex items-baseline justify-between px-5 pt-4 pb-3">
        <h2 className="font-display font-semibold text-[22px] text-ink">
          Acciones políticas
        </h2>
        <span className="text-[12px] text-ink/70 font-mono">
          {inCategory.filter(a => a.available).length} disponibles · {inCategory.length} en total
        </span>
      </div>

      {/* Alerta de Congreso */}
      <div className={`mx-5 px-3.5 py-2 rounded-md text-[12px] flex items-start gap-2.5 ${hasMajority ? 'bg-emerald-500/10' : 'bg-amber-500/10'}`}>
        <Scale size={14} className={hasMajority ? 'text-positive flex-shrink-0 mt-0.5' : 'text-caution flex-shrink-0 mt-0.5'} />
        <p className={hasMajority ? 'text-positive leading-relaxed' : 'text-caution leading-relaxed'}>
          {hasMajority
            ? `Congreso favorable: mayorías para votar leyes (${leg}% de apoyo parlamentario; requiere ${threshold}%).`
            : `Congreso fragmentado (${leg}% de apoyo; requiere ${threshold}%). Las leyes complejas pueden enviarse por DNU con mayor costo político.`}
          {honeymoon && <span className="text-celeste-ink font-semibold"> (Luna de miel activa)</span>}
        </p>
      </div>

      {/* Interna del oficialismo */}
      {interna >= 10 && (
        <div
          className={`mx-5 mt-2 px-3.5 py-2 rounded-md text-[12px] flex items-start gap-2 ${interna >= 50 ? 'bg-red-500/10 text-negative' : 'bg-amber-500/10 text-caution'}`}
          title="Sube cuando ampliás la coalición y cuando tu aprobación es baja; baja cuando sos popular."
        >
          <Users size={13} className="mt-0.5 flex-shrink-0" />
          <p>
            <span className="font-semibold">{internaLevel(interna).label}</span> ({Math.round(interna)}/100):
            tus políticas rinden {Math.round((1 - internaEfficacy(causal)) * 100)}% menos, cuestan {Math.round((internaCostMult(causal) - 1) * 100)}% más
            {internaLawPlus(causal) > 0 ? ` y las leyes necesitan ${internaLawPlus(causal)} punto${internaLawPlus(causal) > 1 ? 's' : ''} más de apoyo` : ''}.
            {causal.political.coalicion > 0 ? ' Compartir poder con otros espacios alimenta la interna.' : ''}
          </p>
        </div>
      )}

      {/* Categorías Filter Tabs */}
      <div className="relative mx-5 mt-4 mb-3">
      <div className="flex items-center gap-1 pb-2 border-b border-rule overflow-x-auto scrollbar-none pr-8">
        <button
          onClick={() => chooseCategory('todas')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-semibold transition-all whitespace-nowrap ${
            selectedCategory === 'todas'
              ? 'bg-ink text-paper'
              : 'text-ink/70 hover:text-ink hover:bg-sunken'
          }`}
        >
          <LayoutGrid size={13} />
          Todas
        </button>
        {UI_CATEGORIES.filter(c => availability.some(av => av.action.category === c)).map((category) => {
          const style = UI_CATEGORY_STYLES[category];
          const isActive = selectedCategory === category;
          return (
            <button
              key={category}
              onClick={() => chooseCategory(category)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-semibold transition-all whitespace-nowrap ${
                isActive
                  ? 'bg-ink text-paper'
                  : 'text-ink/70 hover:text-ink hover:bg-sunken'
              }`}
            >
              <img src={style.imageSrc} alt={style.label} className="w-3.5 h-3.5 object-contain" />
              {style.label}
            </button>
          );
        })}
      </div>
      {/* Indica que hay más categorías si no entran en el ancho */}
      <div className="pointer-events-none absolute right-0 top-0 bottom-2 w-10 bg-gradient-to-l from-surface to-transparent" aria-hidden="true" />
      </div>

      {/* Bloqueadas: ocultas por defecto */}
      {blockedCount > 0 && (
        <div className="mx-5 mb-3 flex items-center justify-between gap-2 text-[12px] text-ink/70">
          <span>
            {showBlocked
              ? `Mostrando ${blockedCount} bloqueada${blockedCount === 1 ? '' : 's'} (requisitos, espera o Congreso).`
              : `${blockedCount} bloqueada${blockedCount === 1 ? '' : 's'} oculta${blockedCount === 1 ? '' : 's'} (requisitos, espera o Congreso).`}
          </span>
          <button
            onClick={() => setShowBlocked(v => !v)}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-rule hover:bg-sunken text-ink/80 transition-colors whitespace-nowrap"
          >
            {showBlocked ? <EyeOff size={11} /> : <Eye size={11} />}
            {showBlocked ? 'Ocultar bloqueadas' : 'Ver también las bloqueadas'}
          </button>
        </div>
      )}

      <div className="mx-5 mb-3 flex flex-wrap items-center gap-3 text-[12px] text-ink/75">
        <button type="button" aria-pressed={preparations} onClick={() => { setPreparations(value => !value); setSelectedCategory('todas'); setShowBlocked(true); }} className="min-h-9 border border-rule rounded px-3 hover:bg-sunken">{preparations ? 'Volver a todas' : 'Ver preparativos'}</button>
        {due.length > 0 && <button type="button" onClick={onOpenNotebook} className="min-h-9 text-caution underline underline-offset-2">{due.length} compromiso{due.length > 1 ? 's' : ''} vence{due.length > 1 ? 'n' : ''} entre este trimestre y el próximo · Ver cuaderno</button>}
      </div>
      {preparations && <p className="mx-5 mb-3 text-[12px] text-ink/70">Estas medidas habilitan herramientas existentes. Su efecto puede requerir cerrar el turno antes de usarlas.</p>}

      {/* Grid de tarjetas */}
      <div className="flex-1 overflow-y-auto px-5 pb-5 max-h-[min(760px,calc(100vh-190px))]">
        {filtered.length === 0 ? (
          <div className="text-center py-12 text-[12px] text-ink/70">
            {inCategory.length === 0 ? 'No hay acciones en esta categoría.' : 'Todas las acciones de esta categoría están bloqueadas por ahora.'}
          </div>
        ) : (
          <div className="columns-1 md:columns-2 2xl:columns-3 gap-3">
            {filtered.map((av) => (
              <div key={av.action.id} className="break-inside-avoid mb-3">
              <ActionCard
                key={av.action.id}
                availability={av}
                requestedBy={requestedBy[av.action.id] ?? []}
                onSelect={() => onActionSelect(av.action.id)}
                isSelected={gameState.selectedActions.includes(av.action.id)}
                disabled={!canTakeAction && !gameState.selectedActions.includes(av.action.id)}
                disabledReason={gameState.gameOver ? 'La partida terminó.' : gameState.pendingElection ? 'Primero resolvé la elección pendiente.' : undefined}
                loanDiscount={causal.perks.loanDiscount}
                showStrategicNote={causal.turn <= 3}
              />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer: proyección de caja */}
      <div className={`px-5 py-3 border-t border-rule text-[13px] flex items-center justify-between gap-3 flex-wrap ${projection.caja < 0 ? 'bg-red-500/10' : gameState.selectedActions.length > 0 ? 'bg-gold/10' : 'bg-sunken/50'}`}>
        <span className="font-semibold text-ink">
          {gameState.selectedActions.length === 0
            ? 'Sin acciones en agenda este turno'
            : `${gameState.selectedActions.length} ${gameState.selectedActions.length === 1 ? 'acción elegida' : 'acciones elegidas'} (${fmtBudgetDelta(selectedCaja)})`}
        </span>
        <span className="text-ink/70 font-mono text-[12px]" aria-label="Estimación fiscal de la selección">
          Caja estimada:{' '}
          <span className={`font-bold ${projection.caja >= 0 ? 'text-positive' : 'text-negative'}`}>{fmtBudget(projection.caja)}</span>
          {' · '}Resultado fiscal por turno:{' '}
          <span className={`font-bold ${projection.structural >= 0 ? 'text-positive' : 'text-negative'}`}>{fmtBudgetDelta(projection.structural)}</span>
        </span>
        <p className="w-full text-[12px] text-ink/75 leading-relaxed">Estimación con lo elegido, la recaudación, el gasto fijo y los intereses. No incluye todos los efectos diferidos ni los eventos.</p>
        {projection.caja >= 0 && (projection.structural < 0 || projection.caja < 100) && <p className="w-full text-[12px] text-caution">Margen fiscal ajustado: revisá gastos fijos y compromisos antes de sumar más.</p>}
        {projection.caja < 0 && (
          <span className="w-full text-[11px] text-negative font-semibold">
            ⚠ La estimación deja caja negativa. Si el turno cierra así, el Tesoro emitirá para cubrirla en el siguiente.
          </span>
        )}
      </div>
    </div>
  );
}
