import { ABILITIES, CABINET, PROFILES } from '../../causal/campaignCatalog';
import { campaignActionReason } from '../../causal/campaign';
import type { CausalState, GameCommand } from '../../causal/types';
import { IMAGES, getAdvisorPortrait } from '../../utils/imageAssets';
import { THUMBNAIL_ARCHETYPES } from '../../utils/iconThumbnails';

export type CampaignDispatch = (type: GameCommand['type'], targetId?: string, choiceId?: string) => boolean;
export interface CampaignProps { state: CausalState; onCommand: CampaignDispatch }
function DecisionButton({ state, onCommand, type, targetId, label }: CampaignProps & { type: GameCommand['type']; targetId: string; label: string }) {
  const reason = campaignActionReason(state, type, targetId);
  return <div><button type="button" className="causal-secondary" disabled={!!reason} title={reason ?? label} onClick={() => onCommand(type, targetId)}>{label}</button>{reason && <p className="text-[10px] text-muted-foreground mt-1">{reason}</p>}</div>;
}
export function GovernmentPanel({ state, onCommand }: CampaignProps) {
  const c = state.campaign;
  if (!c) return null;
  return <section className="bg-card border border-border rounded-xl overflow-hidden">
    <div className="relative h-36"><img src={IMAGES.backgrounds.cabinetRoom} alt="Sala del gabinete presidencial" className="absolute inset-0 w-full h-full object-cover" /><div className="absolute inset-0 bg-gradient-to-t from-[#102841] via-[#102841]/35 to-transparent" /><div className="absolute bottom-4 left-5"><p className="text-[10px] uppercase tracking-[.2em] text-blue-200">Equipo de gobierno</p><h2 className="font-display text-xl font-bold">Gabinete presidencial · {c.advisors.length}/2</h2></div></div>
    <div className="p-4 space-y-4"><p className="text-xs text-muted-foreground">Una operación de gabinete por turno · 1 PA. Sueldo: 10 U por nivel y trimestre, incluso durante capacitación. Los puntos adicionales comienzan al activarse el asesor.</p>
      <div className="grid sm:grid-cols-2 gap-3">{CABINET.map(advisor => {
        const member = c.advisors.find(a => a.id === advisor.id);
        const level = member?.level ?? advisor.level;
        return <article key={advisor.id} className={`border rounded-xl p-3 ${member ? 'border-sky-300/50 bg-sky-400/10' : 'border-border bg-background/30'}`}>
          <div className="flex gap-3"><img src={advisor.id === 'advisor2' ? IMAGES.advisors.communicationFemale : advisor.id === 'advisor4' ? IMAGES.advisors.socialFemale : advisor.id === 'advisor6' ? IMAGES.advisors.securityFemale : getAdvisorPortrait(advisor.specialty)} alt={advisor.name} className="w-16 h-20 rounded-lg object-cover" /><div><h3 className="text-sm font-semibold">{advisor.name}</h3><p className="text-xs text-blue-200 mt-1">{advisor.specialty}</p><p className="text-xs text-amber-200 mt-1">{'★'.repeat(level)} · Nivel {level}</p></div></div>
          <p className="text-xs text-muted-foreground mt-3">{advisor.description}</p><p className="text-xs mt-2">+{advisor.bonusActions} PA por turno activo · +{level * 2}% de eficacia en {advisor.categories.join(' / ')}.</p>
          <p className="text-xs text-muted-foreground mt-1">Sueldo {level * 10} U/turno · Bonificación conjunta de asesores limitada a 15%.</p>
          {member && <p className="text-xs text-emerald-300 mt-2">{member.activeFrom <= state.turn ? 'En funciones' : `En preparación · activo desde T${member.activeFrom}`}</p>}
          <div className="flex flex-wrap gap-2 mt-3">{member ? <><DecisionButton state={state} onCommand={onCommand} type="dismiss_advisor" targetId={advisor.id} label="Despedir" />{level < 5 && <DecisionButton state={state} onCommand={onCommand} type="train_advisor" targetId={advisor.id} label={`Capacitar · ${(level + 1) * 50} U`} />}</> : <DecisionButton state={state} onCommand={onCommand} type="hire_advisor" targetId={advisor.id} label={`Contratar · ${advisor.cost} U`} />}</div>
        </article>;
      })}</div>
    </div>
    <div className="p-4 border-t border-border"><div className="flex gap-3 items-center"><img src={THUMBNAIL_ARCHETYPES[state.profile]} alt="" className="w-14 h-14 rounded-lg" /><div><h2 className="font-display text-lg font-bold">Habilidades · {PROFILES[state.profile]?.name ?? state.profile}</h2><p className="text-xs text-muted-foreground mt-1">{PROFILES[state.profile]?.description}</p></div></div>
      <div className="grid sm:grid-cols-2 gap-3 mt-4">{ABILITIES.filter(a => a.profile === state.profile).map(ability => <article key={ability.id} className="rounded-lg border border-amber-300/25 bg-amber-300/5 p-3"><h3 className="text-sm font-semibold text-amber-100">{ability.name}</h3><p className="text-xs text-muted-foreground leading-5 my-2">{ability.description}</p><p className="text-xs mb-3">1 PA · {ability.cost} U · Intervalo {ability.cooldown} turnos</p><DecisionButton state={state} onCommand={onCommand} type="use_ability" targetId={ability.id} label={`Usar ${ability.name}`} /></article>)}</div>
    </div>
  </section>;
}
