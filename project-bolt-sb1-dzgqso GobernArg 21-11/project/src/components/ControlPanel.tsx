import { useMemo, useState } from 'react';
import { Eye, EyeOff, LockKeyhole, Sparkles, Users } from 'lucide-react';
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
} from '@/engine/causal';

interface ControlPanelProps {
  gameState: GameState;
  onActionSelect: (actionId: string) => void;
  canTakeAction: boolean;
  /** Número del rótulo (03 en el tablero). */
  index?: string;
  /** En la computadora la lista tiene su propio scroll. */
  scroll?: boolean;
}

type TabValue = 'todas' | UiCategory;

export function ControlPanel({ gameState, onActionSelect, canTakeAction, index, scroll = false }: ControlPanelProps) {
  const [selectedCategory, setSelectedCategory] = useState<TabValue>('todas');
  const [showBlocked, setShowBlocked] = useState(false);
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
    .filter(av => selectedCategory === 'todas' || av.action.category === selectedCategory);
  const blockedCount = inCategory.filter(av => av.blocked).length;
  const filtered = inCategory
    .filter(av => showBlocked || !av.blocked)
    .sort((x, y) => {
      const sx = gameState.selectedActions.includes(x.action.id) ? 0 : x.available ? 1 : 2;
      const sy = gameState.selectedActions.includes(y.action.id) ? 0 : y.available ? 1 : 2;
      return sx - sy;
    });

  const leg = Math.round(legForLaws(causal));
  const threshold = lawThreshold(causal);
  const honeymoon = causal.turn - causal.mandateStart + 1 <= PARAMS.LUNA_MIEL;
  const hasMajority = leg >= threshold;
  const interna = causal.political.interna;

  return (
    <section aria-label="Acciones políticas" className="flex flex-col">
      {/* Encabezado de la mesa de decisiones */}
      <div className="flex items-start justify-between gap-3 px-1 pb-3">
        <div>
          <span className="sr-label">{index ? `${index} / ` : ''}Mesa de decisiones</span>
          <h2 className="mt-1.5 text-[24px] leading-tight font-bold tracking-tight text-ink">
            Acciones políticas{' '}
            <sup className="text-[12px] text-sala-blue font-bold align-top">{inCategory.filter(a => a.available).length}</sup>
            <small className="text-[11px] text-sala-muted font-normal"> / {inCategory.length} en total</small>
          </h2>
          <p className="text-[12px] text-sala-muted mt-1.5 leading-snug">
            {hasMajority
              ? <>Congreso favorable: <b className="text-sala-blue">{leg}%</b> de apoyo parlamentario · las leyes requieren {threshold}%.</>
              : <>Congreso fragmentado: <b className="text-sala-coral">{leg}%</b> de apoyo · las leyes requieren {threshold}%. Las leyes complejas pueden salir por DNU, con mayor costo político.</>}
          </p>
        </div>
        {honeymoon && (
          <span className="flex-shrink-0 inline-flex items-center gap-1.5 rounded-md border border-sala-violet/30 bg-sala-violet/10 px-2 py-1.5 text-[10px] font-bold tracking-[0.08em] uppercase text-sala-violet">
            <Sparkles size={13} /> Luna de miel <b className="text-sala-good">activa</b>
          </span>
        )}
      </div>

      {/* Interna del oficialismo */}
      {interna >= 10 && (
        <div
          className={`mb-3 px-3.5 py-2 rounded-md text-[12px] flex items-start gap-2 ${interna >= 50 ? 'bg-red-500/10 text-sala-bad' : 'bg-amber-500/10 text-sala-warn'}`}
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

      {/* Pestañas de categoría */}
      <div className="relative">
        <div className="flex items-center gap-0.5 pb-2.5 border-b border-rule overflow-x-auto scrollbar-none pr-8" role="tablist" aria-label="Categorías">
          {(['todas', ...UI_CATEGORIES.filter(c => availability.some(av => av.action.category === c))] as TabValue[]).map(category => {
            const isActive = selectedCategory === category;
            return (
              <button
                key={category}
                role="tab"
                aria-selected={isActive}
                onClick={() => setSelectedCategory(category)}
                className={`px-2.5 py-1.5 rounded-md text-[12px] whitespace-nowrap transition-colors ${
                  isActive ? 'bg-sala-blue text-white font-bold' : 'text-sala-muted hover:text-ink hover:bg-sunken'
                }`}
              >
                {category === 'todas' ? 'Todas' : UI_CATEGORY_STYLES[category].label}
              </button>
            );
          })}
        </div>
        <div className="pointer-events-none absolute right-0 top-0 bottom-2.5 w-10 bg-gradient-to-l from-paper to-transparent" aria-hidden="true" />
      </div>

      {/* Bloqueadas: ocultas por defecto */}
      {blockedCount > 0 && (
        <div className="mt-2.5 flex items-center justify-between gap-2 text-[11px] text-sala-muted">
          <span className="inline-flex items-center gap-1.5">
            <LockKeyhole size={13} className="text-sala-blue" />
            {showBlocked
              ? `Mostrando ${blockedCount} bloqueada${blockedCount === 1 ? '' : 's'} (requisitos, espera o Congreso).`
              : `${blockedCount} bloqueada${blockedCount === 1 ? '' : 's'} oculta${blockedCount === 1 ? '' : 's'} (requisitos, espera o Congreso).`}
          </span>
          <button
            onClick={() => setShowBlocked(v => !v)}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border border-rule bg-surface hover:bg-sunken text-ink/80 transition-colors whitespace-nowrap"
          >
            {showBlocked ? <EyeOff size={11} /> : <Eye size={11} />}
            {showBlocked ? 'Ocultar bloqueadas' : 'Ver también las bloqueadas'}
          </button>
        </div>
      )}

      {/* Lista de acciones */}
      <div className={`mt-2.5 ${scroll ? 'lg:overflow-y-auto lg:max-h-[calc(100vh-150px)] lg:pr-1 -mr-1' : ''}`}>
        {filtered.length === 0 ? (
          <div className="sr-panel text-center py-12 text-[12px] text-sala-muted">
            {inCategory.length === 0 ? 'No hay acciones en esta categoría.' : 'Todas las acciones de esta categoría están bloqueadas por ahora.'}
          </div>
        ) : (
          <div className="flex flex-col gap-2.5">
            {filtered.map((av) => (
              <ActionCard
                key={av.action.id}
                availability={av}
                requestedBy={requestedBy[av.action.id] ?? []}
                onSelect={() => onActionSelect(av.action.id)}
                isSelected={gameState.selectedActions.includes(av.action.id)}
                disabled={!canTakeAction && !gameState.selectedActions.includes(av.action.id)}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
