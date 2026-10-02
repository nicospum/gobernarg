import { useState } from 'react';
import {
  AlertTriangle,
  ChevronRight,
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
import { actionImage } from '@/lib/liteImages';
import { detailed } from '@/lite/config';
import { simpleEffects } from '@/lib/simpleView';
import { ACTORS, SENSITIVITIES, type ActorId } from '@/data/causal';
import { ACTION_PLAYER_NOTES, ACTION_RISK_TEXT } from '@/data/causal/playerTexts';
import { COALITION_ACTIONS, type Availability } from '@/engine/causal';
import {
  actionContextNotes,
  actionTimeline,
  affectedActors,
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
  critico: 'text-sala-bad',
  alto: 'text-sala-coral',
  medio: 'text-sala-warn',
  bajo: 'text-sala-muted',
};

const TONE_TEXT: Record<string, string> = { good: 'text-sala-good', bad: 'text-sala-bad', neutral: 'text-sala-blue' };

/** Color de acento de cada categoría (variables de :root). */
const CATEGORY_ACCENT: Record<string, string> = {
  'Economía y moneda': 'var(--sun)',
  'Impuestos': 'var(--lime-ink)',
  'Producción y trabajo': 'var(--warn)',
  'Social y salud': 'var(--coral)',
  'Educación, ciencia y cultura': 'var(--cyan)',
  'Infraestructura': 'var(--blue)',
  'Seguridad y justicia': 'var(--navy-2)',
  'Instituciones y ambiente': 'var(--good)',
  'Exterior': 'var(--sky)',
  'Política y relaciones': 'var(--violet)',
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

/**
 * Modo simple en pantallas anchas: la columna de acciones mide lo mismo que
 * la de actores, así que la tarjeta pasa a dos columnas: arriba la imagen y
 * el texto; abajo "Qué mueve" a la izquierda y costo y botón a la derecha.
 */
const SIMPLE_XL = {
  card: 'xl:grid-cols-[minmax(0,1fr)_128px] xl:items-start',
  info: 'xl:col-span-2',
  effects: 'xl:row-span-2 xl:border-l-0 xl:border-t xl:pt-3 xl:pl-0',
  impact: 'xl:pt-3',
  action: 'xl:col-start-2',
};

/** Modo simple: hasta 3 efectos con flecha y "ahora / más adelante", sin números. */
function SimpleEffectList({ actionId }: { actionId: string }) {
  const list = simpleEffects(actionId);
  if (list.length === 0) return <span className="text-[11px] text-sala-muted">Sin efectos directos en el país</span>;
  return (
    <ul>
      {list.map(e => (
        <li key={e.label} className="flex items-center justify-between gap-2 py-[3px] text-[12px]">
          <span className="flex items-center gap-1.5 min-w-0">
            <b className={`flex-shrink-0 ${TONE_TEXT[e.tone === 'neutral' ? 'neutral' : e.tone]}`} aria-label={e.up ? 'sube' : 'baja'}>{e.up ? '↑' : '↓'}</b>
            <span className="text-ink/85 truncate">{e.label}</span>
          </span>
          <span className="text-[10px] text-sala-dim flex-shrink-0">{e.when}</span>
        </li>
      ))}
    </ul>
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
  // Ilustración de la política (src/lite/imageMap.ts); no todas tienen.
  const illustration = actionImage(action.id);
  // Modo simple (LITE_FEATURES.modoDetallado = false): sin números ni plazos.
  const simple = !detailed();
  const favorLine = (winners.length > 0 || losers.length > 0) && (
    <p className="mt-2.5 text-[11px] text-sala-muted leading-snug">
      {winners.length > 0 && <><b className="text-sala-good">Favorece:</b> {winners.slice(0, 2).map(a => ACTORS[a].shortName).join(', ')}</>}
      {winners.length > 0 && losers.length > 0 && ' · '}
      {losers.length > 0 && <><b className="text-sala-bad">Perjudica:</b> {losers.slice(0, 2).map(a => ACTORS[a].shortName).join(', ')}</>}
    </p>
  );
  const illustrationImg = (cls: string) =>
    illustration ? <img src={illustration} alt="" loading="lazy" decoding="async" className={`object-cover bg-sunken ${cls}`} /> : null;

  const details = (
    <div className="flex flex-col gap-1.5 max-w-[280px]">
      {!touch && illustrationImg('w-full aspect-[2/1] rounded-md mb-1')}
      {playerNote && <p className="text-[11px] text-ink/80 leading-snug">{playerNote}</p>}
      {!simple && timeline.length > 0 && (
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
      {!simple && notes.conditional.length > 0 && (
        <div>
          <div className="font-semibold text-[11px] text-ink mb-0.5">Según el contexto</div>
          {notes.conditional.slice(0, 3).map(n => <div key={n} className="text-[10px] text-ink/70">• {n}</div>)}
        </div>
      )}
      {!simple && notes.repetition.length > 0 && (
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
        {costLabel} · {pa} {pa === 1 ? 'acción' : 'acciones'}{!simple && action.cooldown > 1 ? ` · repetible cada ${action.cooldown} turnos` : ''}
      </div>
    </div>
  );

  const accent = CATEGORY_ACCENT[action.category] ?? 'var(--blue)';
  const effects = timeline.slice(0, 2).flatMap(t => t.chips.slice(0, 3).map(c => ({ ...c, when: t.when }))).slice(0, 4);

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
      className={`group relative grid grid-cols-1 md:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)_96px] ${simple ? SIMPLE_XL.card : 'xl:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)_96px_104px]'} gap-3 md:gap-3.5 md:items-center rounded-[10px] border bg-surface pl-5 pr-3.5 py-4 transition-all duration-150 ${
        isSelected
          ? 'border-sala-blue/60 bg-[rgb(250_253_255)] shadow-[0_7px_22px_rgb(36_107_206/0.1)] outline outline-2 outline-sala-cyan/30'
          : blocked
            ? 'border-rule bg-sunken/40 opacity-65 cursor-not-allowed'
            : 'border-rule shadow-[0_5px_18px_rgb(49_90_123/0.04)] hover:border-sala-blue/40 hover:bg-[rgb(250_253_255)] cursor-pointer'
      }`}
    >
      <span className="absolute left-0 top-3 bottom-3 w-1 rounded-r" style={{ background: `rgb(${accent})` }} aria-hidden="true" />

      {/* Información (con la ilustración: banda arriba en el celular, miniatura al lado en pantallas anchas) */}
      <div className={`min-w-0 ${simple ? SIMPLE_XL.info : ''}`}>
        <div className={illustration ? 'md:flex md:items-start md:gap-3.5' : ''}>
        {illustrationImg('block w-full h-[84px] rounded-md mb-3 md:mb-0 md:w-[96px] md:h-[72px] md:flex-none')}
        <div className="min-w-0 md:flex-1">
        <div className="flex items-center gap-x-2 gap-y-1 flex-wrap">
          <span className={`inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-[0.11em] ${style.color}`}>
            <img src={style.imageSrc} alt="" className="w-3.5 h-3.5 object-contain" />
            {style.label}
          </span>
          {!simple && action.ley && (
            <span className="inline-flex items-center gap-0.5 text-[10px] text-sala-violet font-bold uppercase tracking-wider">
              <Scale size={10} />
              {needsDnu && available ? 'Ley por DNU' : 'Ley'}
            </span>
          )}
          {!simple && action.tags.map(t => (
            <span key={t} className="text-[10px] text-sala-muted uppercase tracking-wider">· {TAG_LABEL[t] ?? t}</span>
          ))}
          {!simple && action.cooldown > 1 && (
            <span className="inline-flex items-center gap-1 text-[10px] text-sala-muted" title="Turnos entre usos">
              <Clock size={11} /> cada {action.cooldown} turnos
            </span>
          )}
          {requested && !blocked && (
            <Tooltip content={<TooltipContent label="Lo piden" detail={requestedBy.map(a => ACTORS[a].shortName).join(', ')} />}>
              <span className="inline-flex items-center gap-1 text-[10px] text-gold-ink bg-gold/20 px-1.5 py-0.5 rounded font-bold uppercase tracking-wide">
                <Star size={9} className="fill-gold" /> Pedida
              </span>
            </Tooltip>
          )}
          {blocked && (
            <Tooltip content={<TooltipContent label="Bloqueada" detail={blockReason ?? undefined} />}>
              <span className="inline-flex items-center gap-1 text-[10px] text-sala-bad bg-red-500/10 px-1.5 py-0.5 rounded font-bold uppercase tracking-wide">
                <Lock size={9} /> Bloqueada
              </span>
            </Tooltip>
          )}
        </div>
        <h3 className="text-[16px] font-bold text-ink leading-snug mt-2">{action.name}</h3>
        <p className="text-[12px] text-sala-muted leading-snug mt-1">{action.description}</p>
        </div>
        </div>
        {COALITION_ACTIONS[action.id] && (
          <p className="mt-2 text-[11px] text-sala-warn leading-snug bg-amber-500/10 px-2 py-1 rounded">
            Abre una interna en tu partido (+{COALITION_ACTIONS[action.id]}): tus políticas rinden menos y cuestan más.
          </p>
        )}
        {simple ? favorLine : repetitionWarning ? (
          <p className="mt-2 flex items-start gap-1.5 text-[11px] text-sala-warn leading-snug">
            <AlertTriangle size={11} className="mt-0.5 flex-shrink-0" /> {repetitionWarning}
          </p>
        ) : winners.length + losers.length > 0 ? (
          <div className="flex flex-wrap gap-1.5 mt-3">
            {winners.slice(0, 2).map(a => (
              <span key={a} className="inline-flex items-center gap-1 rounded bg-sunken px-1.5 py-1 text-[10px] text-sala-muted">
                <Users size={10} /> {ACTORS[a].shortName}
              </span>
            ))}
            {losers.slice(0, 2).map(a => (
              <span key={a} className="inline-flex items-center gap-1 rounded bg-red-500/10 px-1.5 py-1 text-[10px] text-sala-bad">
                <Users size={10} /> {ACTORS[a].shortName} ↓
              </span>
            ))}
          </div>
        ) : null}
      </div>

      {/* Efectos previstos */}
      <div className={`md:border-l border-t md:border-t-0 border-rule pt-3 md:pt-0 md:pl-3.5 min-w-0 ${simple ? SIMPLE_XL.effects : ''}`}>
        <span className="sr-eyebrow block mb-1.5">{simple ? 'Qué mueve' : 'Efectos previstos'}</span>
        {simple ? (
          <SimpleEffectList actionId={action.id} />
        ) : effects.length === 0 ? (
          <span className="text-[11px] text-sala-muted">Sin efectos directos en indicadores</span>
        ) : (
          effects.map((e, i) => (
            <div key={i} className="flex items-center justify-between gap-2 py-[3px] text-[11px]">
              <span className="text-sala-muted truncate">
                {e.label}
                {i > 0 && effects[i - 1].when === e.when ? '' : <span className="text-sala-dim text-[9px] uppercase tracking-wider"> · {e.when}</span>}
              </span>
              <b className={`font-mono flex-shrink-0 ${TONE_TEXT[e.tone]}`}>{e.text}</b>
            </div>
          ))
        )}
        {!simple && timeline.length > 2 && <div className="text-[10px] text-sala-dim mt-0.5">+ efectos posteriores (ver detalle)</div>}
      </div>

      {/* Impacto fiscal */}
      <div className={`flex flex-wrap md:flex-nowrap md:flex-col items-center md:items-start gap-x-3 gap-y-1.5 ${simple ? SIMPLE_XL.impact : ''}`}>
        <span className="sr-eyebrow">{simple ? 'Costo' : 'Impacto fiscal'}</span>
        <strong className={`text-[15px] font-mono ${caja > 0 ? 'text-sala-good' : caja === 0 ? 'text-sala-muted' : blockReason === 'No alcanza la caja.' ? 'text-sala-bad' : 'text-ink'}`}>
          {costLabel}
        </strong>
        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-sala-blue">
          <Flag size={11} /> {pa} {pa === 1 ? 'acción' : 'acciones'}
        </span>
        <span className={`inline-flex items-center gap-1 text-[10px] font-semibold ${RISK_CLS[riskLevel]}`}>
          {riskLevel !== 'bajo' && <AlertTriangle size={10} />}
          Riesgo {RISK_LABEL[riskLevel]}
        </span>
      </div>

      {/* Acción */}
      <div className={`flex md:col-span-3 xl:col-span-1 items-center gap-2 xl:flex-col xl:items-stretch ${simple ? SIMPLE_XL.action : ''}`}>
        {touch && (
          <button
            type="button"
            onClick={e => { e.stopPropagation(); setShowDetail(true); }}
            onKeyDown={e => e.stopPropagation()}
            className="h-10 px-3 rounded-md border border-rule text-[13px] font-medium text-ink bg-surface"
          >
            Ver detalle
          </button>
        )}
        {isSelected ? (
          <span className="flex-1 inline-flex items-center justify-center gap-1 h-10 rounded-md bg-sala-navy text-white text-[12px] font-bold">
            <Check size={14} /> Seleccionada
          </span>
        ) : !blocked ? (
          <span className="flex-1 inline-flex items-center justify-center gap-1 h-10 rounded-md border border-[rgb(184_201_218)] bg-surface text-[12px] font-bold text-ink transition-colors group-hover:bg-sala-navy group-hover:text-white group-hover:border-sala-navy">
            Ejecutar <ChevronRight size={14} />
          </span>
        ) : (
          <span className="flex-1 text-[11px] text-sala-bad leading-snug xl:text-center" title={blockReason ?? ''}>
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
                className="sr-btn-navy w-full h-12"
              >
                {isSelected ? 'Quitar de la agenda' : blocked ? blockReason : 'Ejecutar'}
              </button>
            }
          >
            {illustrationImg('w-full aspect-[2/1] rounded-lg mb-3')}
            <p className="text-[14px] text-ink/80 mb-3">{action.description}</p>
            {details}
          </Sheet>
        )}
      </>
    );
  }

  return <InfoTooltip content={details}>{card}</InfoTooltip>;
}
