import { Trophy, BarChart, TrendingUp, Users, Target, Shield } from 'lucide-react';
import { ElectionResults } from '../types/game';
import { IMAGES } from '../utils/imageAssets';
import { Tooltip, TooltipContent } from './Tooltip';
import { ModalHeader } from './ModalHeader';
import { useDialog } from '@/lib/useDialog';
import { fmtPct } from '@/lib/format';

interface ElectionResultsModalProps {
  result: ElectionResults;
  onClose: () => void;
}

function CausalBreakdown({ result }: { result: ElectionResults }) {
  const b = result.causal!;
  const tiles = [
    { label: 'Humor social', value: b.apro, weight: '65%', detail: 'Satisfacción de los actores con peso electoral (clase media, sectores populares, trabajadores, PyMEs…).', Icon: Users, color: 'text-sky-400' },
    { label: 'Aparato político', value: b.estructura, weight: '10%', detail: 'Oficialismo, aliados y gobernadores: su satisfacción y tu relación con ellos.', Icon: Shield, color: 'text-emerald-400' },
    { label: 'Imagen', value: b.otros, weight: '25%', detail: 'Tu imagen: eventos, estrategia y desgaste de gestión.', Icon: TrendingUp, color: 'text-purple-400' },
  ];
  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
        {tiles.map(t => (
          <Tooltip key={t.label} content={<TooltipContent value={`Peso: ${t.weight}`} label={t.label} detail={t.detail} />}>
            <div className="flex items-center gap-3 cursor-help rounded-lg border border-border bg-ink/3 p-3">
              <t.Icon className={`w-5 h-5 flex-shrink-0 ${t.color}`} />
              <div>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wide">{t.label}</p>
                <p className="font-mono font-bold text-lg text-foreground">{t.value.toFixed(0)}</p>
              </div>
            </div>
          </Tooltip>
        ))}
      </div>
      {b.incumbencia !== 0 && (
        <p className="text-[11px] text-muted-foreground mb-3">
          <Target className="w-3.5 h-3.5 inline mr-1" />
          {b.incumbencia > 0 ? `Ventaja de ser gobierno: +${b.incumbencia} puntos.` : `Desventaja de la opción: ${b.incumbencia} puntos.`}
        </p>
      )}
      <div className="grid grid-cols-2 gap-3 mb-6 text-[12px]">
        <div>
          <p className="text-[10px] uppercase tracking-wide text-emerald-400/80 font-semibold mb-1">Te votaron</p>
          {b.aFavor.length === 0 ? <p className="text-muted-foreground">—</p> : b.aFavor.map(a => <p key={a.actor} className="text-foreground/80">{a.actor}</p>)}
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-wide text-red-400/80 font-semibold mb-1">Te castigaron</p>
          {b.enContra.length === 0 ? <p className="text-muted-foreground">—</p> : b.enContra.map(a => <p key={a.actor} className="text-foreground/80">{a.actor}</p>)}
        </div>
      </div>
    </>
  );
}

export function ElectionResultsModal({ result, onClose }: ElectionResultsModalProps) {
  const dialogRef = useDialog<HTMLDivElement>(onClose);
  const { votesPercentage, victory, details } = result;
  const succession = result.kind === 'succession';

  return (
    <div ref={dialogRef} className="outline-none fixed inset-0 bg-sala-navy/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="relative w-full max-w-2xl overflow-hidden sr-modal max-h-[92vh] overflow-y-auto">
        <ModalHeader
          center
          label={succession ? 'Elección de sucesión' : result.kind === 'reelection' ? 'Elecciones presidenciales' : 'Resultado electoral'}
          title={succession
            ? victory ? 'Tu espacio retiene el gobierno' : 'Tu espacio pierde la sucesión'
            : victory ? '¡Victoria electoral!' : 'Derrota electoral'}
          subtitle={<><span className="block font-mono text-[28px] font-bold text-white mt-1">{fmtPct(votesPercentage, 1)}</span><span className="uppercase tracking-[0.15em] text-[10px]">de los votos</span></>}
          image={IMAGES.events.electionDay}
          imageAlt="Elecciones"
          icon={<Trophy className={`w-11 h-11 ${victory ? 'text-sala-lime' : 'text-white/60'}`} />}
        />

        <div className="p-6">
          <h3 className="font-display text-lg font-semibold mb-4 flex items-center gap-2 text-foreground  ">
            <BarChart className="w-5 h-5 text-primary" />
            Desglose del resultado
          </h3>

          {result.causal ? <CausalBreakdown result={result} /> : (
          <div className="grid grid-cols-2 gap-4 mb-6">
            <Tooltip
              content={
                <TooltipContent
                  value="Peso: 35%"
                  label="Aprobación"
                  detail="Promedio de los últimos 4 turnos. El factor más determinante."
                />
              }
            >
              <div className="flex items-center gap-3 cursor-help rounded-lg border border-border bg-ink/3 p-3">
                <TrendingUp className="w-5 h-5 text-sky-400 flex-shrink-0" />
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wide">
                    Aprobación
                  </p>
                  <p className="font-mono font-bold text-lg text-foreground">
                    {fmtPct(details.popularityImpact, 1)}
                  </p>
                </div>
              </div>
            </Tooltip>

            <Tooltip
              content={
                <TooltipContent
                  value="Peso: 25%"
                  label="Apoyo de grupos"
                  detail="Promedio del apoyo de todos los sectores y grupos de interés."
                />
              }
            >
              <div className="flex items-center gap-3 cursor-help rounded-lg border border-border bg-ink/3 p-3">
                <Users className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wide">
                    Apoyo de Grupos
                  </p>
                  <p className="font-mono font-bold text-lg text-foreground">
                    {fmtPct(details.groupsSupport, 1)}
                  </p>
                </div>
              </div>
            </Tooltip>

            <Tooltip
              content={
                <TooltipContent
                  value="Peso: 15%"
                  label="Objetivos"
                  detail="Proporción de objetivos del mandato ya completados."
                />
              }
            >
              <div className="flex items-center gap-3 cursor-help rounded-lg border border-border bg-ink/3 p-3">
                <Target className="w-5 h-5 text-purple-400 flex-shrink-0" />
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wide">
                    Objetivos
                  </p>
                  <p className="font-mono font-bold text-lg text-foreground">
                    {fmtPct(details.completedObjectivesImpact, 1)}
                  </p>
                </div>
              </div>
            </Tooltip>

            <Tooltip
              content={
                <TooltipContent
                  value="Peso: 5%"
                  label="Gobernabilidad"
                  detail="100% si no tuviste crisis de popularidad ni déficit consecutivos."
                />
              }
            >
              <div className="flex items-center gap-3 cursor-help rounded-lg border border-border bg-ink/3 p-3">
                <Shield className="w-5 h-5 text-amber-400 flex-shrink-0" />
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wide">
                    Gobernabilidad
                  </p>
                  <p className="font-mono font-bold text-lg text-foreground">
                    {fmtPct(details.stabilityBonus, 1)}
                  </p>
                </div>
              </div>
            </Tooltip>
          </div>
          )}

          <div className="text-center">
            <button
              onClick={onClose}
              className={`px-8 py-3 rounded font-display font-semibold   text-sm transition-colors ${
                victory
                  ? 'bg-accent hover:bg-accent/90 text-accent-foreground'
                  : 'bg-primary hover:bg-primary/90 text-primary-foreground'
              }`}
            >
              Continuar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
