import { useState } from 'react';
import {
  AlertTriangle,
  ArrowRight,
  Clock,
  Lock,
  Star,
  Flag,
  Check,
  Scale,
  Users,
} from 'lucide-react';
import { InfoTooltip } from './InfoTooltip';
import { Sheet } from './mobile/Sheet';
import { useIsTouch } from '@/lib/useMediaQuery';
import { Tooltip, TooltipContent } from './Tooltip';
import { fmtBudget } from '@/lib/format';
import { UI_CATEGORY_STYLES } from '@/data/categoryStyles';
import { ACTORS, SENSITIVITIES, type ActorId } from '@/data/causal';
import { ACTION_PLAYER_NOTES, ACTION_RISK_TEXT } from '@/data/causal/playerTexts';
import { COALITION_ACTIONS, type Availability } from '@/engine/causal';
import {
  actionContextNotes,
  actionTimeline,
  affectedActors,
  toneChipClass,
  toneClass,
  type EffectChip,
} from '@/lib/causalText';

interface ActionCardProps {
  availability: Availability;
  /** Actores que pidieron esta acción en una reunión (demanda revelada). */
  requestedBy: ActorId[];
  onSelect: () => void;
  isSelected: boolean;
  /** No se puede agregar más (sin PA, elección pendiente…) aunque la acción esté disponible. */
  disabled: boolean;
}

const TAG_LABEL: Record<string, string> = {
  FEDERAL: 'Federal',
  AMBIENTAL: 'Ambiental',
  RESTRICTIVA: 'Restrictiva',
};

type RiskLevel = 'bajo' | 'medio' | 'alto' | 'critico';

const RISK_LABEL: Record<RiskLevel, string> = { bajo: 'bajo', medio: 'medio', alto: 'alto', critico: 'crítico' };

const RISK_CLS: Record<RiskLevel, string> = {
  critico: 'text-red-400',
  alto: 'text-orange-400',
  medio: 'text-amber-400',
  bajo: 'text-ink/70',
};

/** Nivel de riesgo a partir del texto de riesgos de la acción (heurística de la B0). */
function riskLevelOf(risksText: string | null): RiskLevel {
  if (!risksText) return 'bajo';
  const t = risksText.toLowerCase();
  if (t.includes('alto') || t.includes('paro') || t.includes('crisis')) return 'alto';
  if (t.includes('crítico') || t.includes('default')) return 'critico';
  return 'medio';
}

function ChipInline({ chip }: { chip: EffectChip }) {
  return (
    <span className="whitespace-nowrap">
      {chip.label} <span className={`font-mono ${toneClass(chip.tone)}`}>{chip.text}</span>
    </span>
  );
}

export function ActionCard({ availability, requestedBy, onSelect, isSelected, disabled }: ActionCardProps) {
  const { action, pa, caja, reasons, available, needsDnu, repetitionWarning } = availability;
  const style = UI_CATEGORY_STYLES[action.category];
  const blocked = !isSelected && (!available || disabled);
  const blockReason = !available ? reasons[0] : disabled ? 'No te quedan acciones este turno.' : null;
  const timeline = actionTimeline(action.id);
  const notes = actionContextNotes(action.id);
  const { winners, losers } = affectedActors(action.id, SENSITIVITIES as Record<ActorId, { target: string; s: number }[]>);
  const costLabel = caja < 0 ? `−${fmtBudget(Math.abs(caja))}` : caja > 0 ? `+${fmtBudget(caja)}` : 'Sin costo';
  const requested = requestedBy.length > 0;
  const riskLevel = riskLevelOf(action.risksText);
  // Nota para el jugador (glosario): la nota de diseño usaba siglas del motor.
  const playerNote = ACTION_PLAYER_NOTES[action.id] ?? action.strategic;
  const riskText = ACTION_RISK_TEXT[action.id] ?? action.risksText;
  const touch = useIsTouch();
  const [showDetail, setShowDetail] = useState(false);

  const details = (
    <div className="flex flex-col gap-1.5 max-w-[280px]">
      {playerNote && <p className="text-[11px] text-ink/80 leading-snug">{playerNote}</p>}
      {timeline.length > 0 && (
        <div>
          <div className="font-semibold text-[11px] text-ink mb-0.5">Qué produce</div>
          {timeline.map(t => (
            <div key={t.when} className="text-[10px] text-ink/70 leading-snug">
              <span className="text-ink/70">{t.when}:</span>{' '}
              {t.chips.map((c, i) => (
                <span key={i}>{i > 0 && ' · '}<ChipInline chip={c} /></span>
              ))}
            </div>
          ))}
        </div>
      )}
      {notes.conditional.length > 0 && (
        <div>
          <div className="font-semibold text-[11px] text-ink mb-0.5">Según el contexto</div>
          {notes.conditional.slice(0, 3).map(n => <div key={n} className="text-[10px] text-ink/70">• {n}</div>)}
        </div>
      )}
      {notes.repetition.length > 0 && (
        <div>
          <div className="font-semibold text-[11px] text-ink mb-0.5">Si se repite</div>
          {notes.repetition.slice(0, 2).map(n => <div key={n} className="text-[10px] text-amber-300">• {n}</div>)}
        </div>
      )}
      {(winners.length > 0 || losers.length > 0) && (
        <div className="text-[10px] text-ink/70">
          {winners.length > 0 && <div><span className="text-emerald-400 font-semibold">Favorece:</span> {winners.map(a => ACTORS[a].shortName).join(', ')}</div>}
          {losers.length > 0 && <div><span className="text-red-400 font-semibold">Perjudica:</span> {losers.map(a => ACTORS[a].shortName).join(', ')}</div>}
        </div>
      )}
      {riskText && <div className="text-[10px] text-amber-300">Riesgo: {riskText}</div>}
      <div className="text-[10px] text-ink/70">
        {costLabel} · {pa} {pa === 1 ? 'acción' : 'acciones'}{action.cooldown > 1 ? ` · repetible cada ${action.cooldown} turnos` : ''}
      </div>
    </div>
  );

  const card = (
    <div
      role="button"
      tabIndex={blocked ? -1 : 0}
      aria-pressed={isSelected}
      aria-disabled={blocked}
      onClick={() => !blocked && onSelect()}
      onKeyDown={(e) => {
        if ((e.key === 'Enter' || e.key === ' ') && !blocked) {
          e.preventDefault();
          onSelect();
        }
      }}
      className={`group relative flex flex-col gap-2.5 rounded-lg border p-4 transition-all duration-150 ${
        isSelected
          ? 'border-ink bg-gold/10 ring-1 ring-ink'
          : blocked
            ? 'border-rule bg-sunken/40 opacity-60 cursor-not-allowed'
            : 'border-rule bg-surface hover:border-ink/35 hover:shadow-[0_2px_10px_-4px_rgba(20,33,61,0.25)] cursor-pointer'
      }`}
    >
      {/* Categoría, tipo de norma, etiquetas y estado */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className={`inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider ${style.color}`}>
            <img src={style.imageSrc} alt="" className="w-3.5 h-3.5 object-contain" />
            {style.label}
          </span>
          {action.ley && (
            <span className="inline-flex items-center gap-0.5 text-[10px] text-purple-300 font-semibold uppercase tracking-wider">
              <Scale size={10} />
              {needsDnu && available ? 'Ley por DNU' : 'Ley'}
            </span>
          )}
          {action.tags.map(t => (
            <span key={t} className="text-[10px] text-ink/70 uppercase tracking-wider">
              · {TAG_LABEL[t] ?? t}
            </span>
          ))}
        </div>
        <div className="flex gap-1 flex-shrink-0">
          {requested && !blocked && (
            <Tooltip content={<TooltipContent label="Lo piden" detail={requestedBy.map(a => ACTORS[a].shortName).join(', ')} />}>
              <span className="inline-flex items-center gap-1 text-[10px] text-gold-ink bg-gold/15 px-1.5 py-0.5 rounded font-semibold uppercase tracking-wide">
                <Star size={9} className="fill-gold" />
                Pedida
              </span>
            </Tooltip>
          )}
          {blocked && (
            <Tooltip content={<TooltipContent label="Bloqueada" detail={blockReason ?? undefined} />}>
              <span className="inline-flex items-center gap-1 text-[10px] text-red-400 bg-red-500/10 px-1.5 py-0.5 rounded font-semibold uppercase tracking-wide">
                <Lock size={9} />
                Bloqueada
              </span>
            </Tooltip>
          )}
        </div>
      </div>

      {/* Título y descripción */}
      <div>
        <h3 className="font-display font-semibold text-[17px] text-ink leading-snug">{action.name}</h3>
        <p className="text-[12px] text-ink/70 leading-snug mt-0.5">{action.description}</p>
      </div>

      {/* Costos */}
      <div className="flex items-center gap-3 text-[12px] font-mono">
        <span className={`font-semibold ${caja > 0 ? 'text-emerald-400' : caja === 0 ? 'text-ink/70' : blockReason === 'No alcanza la caja.' ? 'text-red-400' : 'text-ink'}`}>
          {costLabel}
        </span>
        <span className="inline-flex items-center gap-1 text-ink/80">
          <Flag size={11} className="text-ink/70" />
          {pa} {pa === 1 ? 'acción' : 'acciones'}
        </span>
        {action.cooldown > 1 && (
          <span className="inline-flex items-center gap-1 text-ink/70" title="Turnos entre usos">
            <Clock size={11} className="text-ink/70" />
            cada {action.cooldown}t
          </span>
        )}
      </div>

      {/* Efectos en el tiempo (hasta 2 momentos) */}
      {timeline.length > 0 && (
        <div className="space-y-1.5">
          {timeline.slice(0, 2).map(t => (
            <div key={t.when}>
              <div className="text-[10px] uppercase tracking-wider text-ink/70 mb-0.5">{t.when}</div>
              <div className="flex flex-wrap gap-1">
                {t.chips.slice(0, 3).map((c, i) => (
                  <span key={i} className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded border text-[11px] ${toneChipClass(c.tone)}`}>
                    {c.label} <span className="font-mono">{c.text}</span>
                  </span>
                ))}
              </div>
            </div>
          ))}
          {timeline.length > 2 && <div className="text-[11px] text-ink/70">+ efectos posteriores (ver detalle)</div>}
        </div>
      )}

      {COALITION_ACTIONS[action.id] && (
        <div className="text-[11px] text-amber-300 leading-snug bg-amber-500/10 px-2 py-1 rounded">
          Abre una interna en tu partido (+{COALITION_ACTIONS[action.id]}): tus políticas rinden menos y cuestan más.
        </div>
      )}

      {/* Quiénes lo sienten, o aviso por repetición */}
      {repetitionWarning ? (
        <div className="flex items-start gap-1.5 text-[11px] text-amber-300 leading-snug">
          <AlertTriangle size={11} className="mt-0.5 flex-shrink-0" />
          {repetitionWarning}
        </div>
      ) : winners.length + losers.length > 0 ? (
        <div className="flex items-start gap-1.5 text-[11px] text-ink/70 leading-snug">
          <Users size={11} className="mt-0.5 flex-shrink-0 text-ink/70" />
          <span>
            {winners.slice(0, 2).map(a => ACTORS[a].shortName).join(', ')}
            {winners.length > 0 && losers.length > 0 && ' · '}
            {losers.length > 0 && <span className="text-red-400">{losers.slice(0, 2).map(a => ACTORS[a].shortName).join(', ')} ↓</span>}
          </span>
        </div>
      ) : null}

      {/* Pie: riesgo y acción */}
      <div className="flex items-center justify-between gap-2 pt-2.5 mt-auto border-t border-rule">
        <span className={`inline-flex items-center gap-1 text-[11px] font-medium ${RISK_CLS[riskLevel]}`}>
          {riskLevel !== 'bajo' && <AlertTriangle size={11} />}
          Riesgo {RISK_LABEL[riskLevel]}
        </span>
        {touch && (
          <button
            type="button"
            onClick={e => { e.stopPropagation(); setShowDetail(true); }}
            onKeyDown={e => e.stopPropagation()}
            className="ml-auto h-10 px-3 rounded-md border border-rule text-[13px] font-medium text-ink bg-surface"
          >
            Ver detalle
          </button>
        )}
        {isSelected ? (
          <span className="inline-flex items-center gap-1 text-[12px] font-semibold text-ink">
            <Check size={13} />
            Seleccionada
          </span>
        ) : !blocked ? (
          <span className="inline-flex items-center gap-1 text-[12px] font-semibold text-ink group-hover:text-gold-ink transition-colors">
            Ejecutar
            <ArrowRight size={13} className="transition-transform group-hover:translate-x-0.5" />
          </span>
        ) : (
          <span className="text-[11px] text-red-400 max-w-[170px] text-right truncate" title={blockReason ?? ''}>
            {blockReason}
          </span>
        )}
      </div>
    </div>
  );

  // Sin mouse, el cartel de "pasar por encima" es una hoja que se abre con "Ver detalle".
  if (touch) {
    return (
      <>
        {card}
        {showDetail && (
          <Sheet
            tall
            title={action.name}
            onClose={() => setShowDetail(false)}
            footer={
              <button
                type="button"
                disabled={blocked}
                onClick={() => { onSelect(); setShowDetail(false); }}
                className="w-full h-12 rounded-lg bg-ink text-paper font-semibold disabled:bg-sunken disabled:text-ink/70"
              >
                {isSelected ? 'Quitar de la agenda' : blocked ? blockReason : 'Ejecutar'}
              </button>
            }
          >
            <p className="text-[14px] text-ink/80 mb-3">{action.description}</p>
            {details}
          </Sheet>
        )}
      </>
    );
  }

  return <InfoTooltip content={details}>{card}</InfoTooltip>;
}
