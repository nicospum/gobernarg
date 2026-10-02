import { RotateCcw, Trophy, Skull, ScrollText, Award, Target } from 'lucide-react';
import { GameState } from '../types/game';
import { effective, viewRef } from '../engine/causal';
import {
  generateLegacyText,
  generateLegacyStats,
  getRecentCrises,
  getRecentProjects,
} from '../utils/careerLog';
import { IMAGES } from '../utils/imageAssets';
import { DEFEAT_REASON_CONFIG } from '../data/defeatReasons';
import { AxisBar } from './AxisBar';
import { getValueRisk, riskColor } from '@/lib/risk';
import { ModalHeader } from './ModalHeader';
import { useDialog } from '@/lib/useDialog';

interface LegacyScreenProps {
  gameState: GameState;
  onRestart: () => void;
  onClose?: () => void;
  /** Playtest: abre "Contanos cómo te fue". */
  onFeedback?: () => void;
}

interface PerformanceData {
  rating: number;
  targetAchievement: number;
  strengths: string[];
  weaknesses: string[];
}

function derivePerformance(state: GameState): PerformanceData {
  // Motor causal: el desempeño sale de la aprobación, la gobernabilidad, las
  // instituciones y las metas de gestión, más el estado final del país.
  const c = state.causal;
  const ref = viewRef(c);
  const v = (id: Parameters<typeof effective>[1]) => effective(c, id, ref);
  const popularity = c.political.apro;
  const stability = c.political.gob;
  const legitimacy = v('INST');
  const objectivesTotal = state.objectives?.length ?? 0;
  const objectivesDone = state.objectives?.filter(o => o.completed).length ?? 0;
  const objectivesPct = objectivesTotal > 0 ? (objectivesDone / objectivesTotal) * 100 : 0;

  // Rating sobre 10: aprobación, gobernabilidad, instituciones y metas.
  const rating = ((popularity + stability + legitimacy + objectivesPct) / 40);

  const strengths: string[] = [];
  const weaknesses: string[] = [];

  if (popularity >= 55) strengths.push('Alta Aprobación');
  else if (popularity < 35) weaknesses.push('Baja Aprobación');
  if (stability >= 60) strengths.push('Gobernabilidad Sólida');
  else if (stability < 35) weaknesses.push('Gobierno Débil');
  if (v('INFL') <= 40) strengths.push('Inflación Controlada');
  else if (v('INFL') >= 70) weaknesses.push('Inflación Descontrolada');
  if (v('ACTV') >= 55) strengths.push('Economía en Crecimiento');
  else if (v('ACTV') < 35) weaknesses.push('Recesión');
  if (v('SOLV') >= 55) strengths.push('Cuentas en Orden');
  else if (v('SOLV') < 30) weaknesses.push('Riesgo País Alto');
  if (v('CONF') <= 30) strengths.push('Paz Social');
  else if (v('CONF') >= 60) weaknesses.push('Calle Caliente');
  if (c.deuda >= 5000) weaknesses.push('Endeudamiento');
  const kept = c.agreements.filter(a => a.status === 'fulfilled').length;
  const broken = c.agreements.filter(a => a.status === 'broken').length;
  if (kept >= 3) strengths.push('Palabra Cumplida');
  if (broken >= 2) weaknesses.push('Acuerdos Incumplidos');

  return {
    rating: Math.min(10, Math.max(0, rating)),
    targetAchievement: Math.round(objectivesPct),
    strengths,
    weaknesses,
  };
}

export function LegacyScreen({ gameState, onRestart, onClose, onFeedback }: LegacyScreenProps) {
  const dialogRef = useDialog<HTMLDivElement>(onClose);
  const isVictory = gameState.victorious;
  const reason = gameState.defeatReason;
  const defeatConfig = !isVictory && reason ? DEFEAT_REASON_CONFIG[reason] : null;
  const legacyText = generateLegacyText(gameState);
  const stats = generateLegacyStats(gameState);
  const recentCrises = getRecentCrises(gameState);
  const recentProjects = getRecentProjects(gameState);
  const perf = derivePerformance(gameState);
  const ratingRisk = getValueRisk(perf.rating, 10, false);
  const targetRisk = getValueRisk(perf.targetAchievement, 100, false);

  return (
    <div ref={dialogRef} className="outline-none fixed inset-0 bg-sala-navy/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="relative w-full max-w-3xl overflow-hidden sr-modal my-8">
        <ModalHeader
          center
          label="Legado de tu gestión"
          title={isVictory ? 'Fin de tu gobierno' : 'Fin del gobierno'}
          subtitle={<>
            {isVictivityMessage(gameState)}
            {defeatConfig && (
              <span className="mt-3 flex w-fit mx-auto items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 text-xs text-white border border-white/25">
                <Skull className="w-3.5 h-3.5" />
                {defeatConfig.title}
              </span>
            )}
          </>}
          image={isVictory ? IMAGES.ui.shieldEmblemPremium : IMAGES.events.socialProtest}
          imageAlt={isVictory ? 'Victoria' : 'Derrota'}
          icon={isVictory ? <Trophy className="w-12 h-12 text-sala-lime" /> : <Skull className="w-12 h-12 text-[#ff8a6e]" />}
          onClose={onClose}
        />

        <div className="p-6 md:p-8 space-y-8">
          {/* Performance Summary — bloque nuevo Figma 2 */}
          <div>
            <h3 className="text-[18px] font-bold tracking-tight mb-3 flex items-center gap-2 text-ink">
              <Award className="w-5 h-5 text-accent" />
              Resumen de Desempeño
            </h3>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="rounded-lg border border-border bg-ink/3 p-4">
                <div className="text-[10px] text-muted-foreground uppercase tracking-widest mb-1">
                  Rating General
                </div>
                <div className={`font-mono text-3xl font-bold ${riskColor(ratingRisk)}`}>
                  {perf.rating.toFixed(1)}
                  <span className="text-base text-muted-foreground">/10</span>
                </div>
              </div>
              <div className="rounded-lg border border-border bg-ink/3 p-4">
                <div className="text-[10px] text-muted-foreground uppercase tracking-widest mb-1 flex items-center gap-1">
                  <Target className="w-3 h-3" />
                  Metas de Gestión
                </div>
                <div className={`font-mono text-3xl font-bold ${riskColor(targetRisk)}`}>
                  {perf.targetAchievement}%
                </div>
              </div>
            </div>

            {(perf.strengths.length > 0 || perf.weaknesses.length > 0) && (
              <div className="flex flex-wrap gap-1.5">
                {perf.strengths.map((s) => (
                  <span
                    key={s}
                    className="inline-flex items-center text-[11px] px-2 py-0.5 rounded border border-emerald-400/30 bg-emerald-400/10 text-emerald-300 font-semibold uppercase tracking-wide"
                  >
                    {s}
                  </span>
                ))}
                {perf.weaknesses.map((w) => (
                  <span
                    key={w}
                    className="inline-flex items-center text-[11px] px-2 py-0.5 rounded border border-red-400/30 bg-red-400/10 text-red-300 font-semibold uppercase tracking-wide"
                  >
                    {w}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Narrativa */}
          <div>
            <h3 className="text-[16px] font-bold tracking-tight mb-3 flex items-center gap-2 text-ink">
              <ScrollText className="w-5 h-5 text-primary" />
              Tu legado
            </h3>
            <div className="rounded-xl border border-border bg-ink/3 p-5 text-foreground/80 leading-relaxed whitespace-pre-line text-sm">
              {legacyText}
            </div>
          </div>

          {/* Estadísticas */}
          <div>
            <h3 className="text-[16px] font-bold tracking-tight mb-3 text-ink">
              Estadísticas
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {stats.map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-lg border border-border bg-ink/3 p-3 text-center"
                >
                  <p className="font-mono text-2xl font-bold text-foreground">{stat.value}</p>
                  <p className="text-[11px] text-muted-foreground uppercase tracking-wide mt-0.5">
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Perfil ideológico */}
          <div>
            <h3 className="text-[16px] font-bold tracking-tight mb-3 text-ink">
              Perfil Ideológico
            </h3>
            <div className="rounded-xl border border-border bg-ink/3 p-5 space-y-1.5">
              <AxisBar
                value={gameState.radicalConciliadorAxis}
                labelLo="Radical"
                labelHi="Conciliador"
                loColor="bg-red-500"
                hiColor="bg-blue-500"
              />
              <AxisBar
                value={gameState.populistaTecnicoAxis}
                labelLo="Populista"
                labelHi="Técnico"
                loColor="bg-purple-500"
                hiColor="bg-teal-500"
              />
              <AxisBar
                value={gameState.cerradoConvocanteAxis}
                labelLo="Cerrado"
                labelHi="Convocante"
                loColor="bg-orange-500"
                hiColor="bg-green-500"
              />
              <p className="text-[10px] text-muted-foreground mt-2 italic">
                Refleja la orientación acumulada de tus políticas a lo largo de tu gestión.
              </p>
            </div>
          </div>

          {/* Obras y crisis */}
          {(recentProjects.length > 0 || recentCrises.length > 0) && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {recentProjects.length > 0 && (
                <div>
                  <h4 className="sr-label !text-sala-good mb-2">
                    Obras destacadas
                  </h4>
                  <ul className="space-y-1.5">
                    {recentProjects.map((project, i) => (
                      <li
                        key={i}
                        className="flex items-start gap-2 text-[13px] text-foreground/80"
                      >
                        <span className="w-1 h-1 rounded-full bg-emerald-400 mt-2 flex-shrink-0" />
                        {project}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {recentCrises.length > 0 && (
                <div>
                  <h4 className="sr-label !text-sala-bad mb-2">
                    Crisis superadas
                  </h4>
                  <ul className="space-y-1.5">
                    {recentCrises.map((crisis, i) => (
                      <li
                        key={i}
                        className="flex items-start gap-2 text-[13px] text-foreground/80"
                      >
                        <span className="w-1 h-1 rounded-full bg-red-400 mt-2 flex-shrink-0" />
                        {crisis}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Botones */}
          <div className="flex flex-wrap items-center justify-center gap-3">
            {onFeedback && (
              <button
                onClick={onFeedback}
                className="sr-btn-ghost px-5 h-11 text-[14px]"
              >
                Contanos cómo te fue
              </button>
            )}
            {onClose && (
              <button
                onClick={onClose}
                className="sr-btn-ghost px-5 h-11 text-[14px]"
              >
                Volver
              </button>
            )}
            <button
              onClick={onRestart}
              className="sr-btn-lime px-6 h-11 text-[12px]"
            >
              <RotateCcw className="w-4 h-4" />
              Jugar de nuevo
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function isVictivityMessage(gameState: GameState): string {
  if (!gameState.victorious) {
    const reason = gameState.defeatReason;
    if (reason === 'low_popularity') return 'La popularidad se desplomó a niveles insostenibles.';
    if (reason === 'negative_budget') return 'El déficit fiscal colapsó las cuentas públicas.';
    if (reason === 'impeachment') return 'Una crisis de gobernabilidad terminó en juicio político.';
    if (reason === 'institutional_coup') return 'Las instituciones quebraron bajo tu mandato.';
    if (reason === 'hyperinflation') return 'La hiperinflación destruyó la economía y tu gobierno.';
    if (reason === 'election_loss') {
      return gameState.term >= 2
        ? 'Completaste dos mandatos, pero tu espacio perdió la sucesión presidencial.'
        : 'El pueblo eligió un nuevo rumbo en las urnas.';
    }
    return 'Tu gestión ha llegado a su fin.';
  }
  if (gameState.position === 'presidente' && gameState.term >= 2) {
    return 'Completaste dos mandatos presidenciales y tu espacio retiene el gobierno.';
  }
  return 'El pueblo te renovó la confianza para un segundo mandato.';
}
