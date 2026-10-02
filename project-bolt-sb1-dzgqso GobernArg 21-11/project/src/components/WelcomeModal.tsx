import { Position } from '../types/game';
import { IMAGES, getPositionBackground } from '../utils/imageAssets';
import { useDialog } from '@/lib/useDialog';

interface WelcomeModalProps {
  governorName: string;
  position: Position;
  onStart: () => void;
}

export function WelcomeModal({ governorName, position, onStart }: WelcomeModalProps) {
  const dialogRef = useDialog<HTMLDivElement>();
  const getTerritory = (_pos: Position) => 'país';
  const getPositionTitle = (_pos: Position) => 'Presidente';

  return (
    <div ref={dialogRef} className="outline-none fixed inset-0 z-50 flex items-center justify-center p-4 bg-paper">
      {/* Imagen de fondo según cargo, velada en papel */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${getPositionBackground(position)})` }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-paper/25 via-paper/60 to-paper/95" />
      <div className="relative w-full max-w-2xl rounded-xl overflow-hidden bg-surface border border-rule shadow-[0_24px_60px_-20px_rgba(20,33,61,0.45)]">
        {/* Franja de imagen tipo portada */}
        <div
          className="h-36 bg-cover bg-center"
          style={{ backgroundImage: `url(${getPositionBackground(position)})` }}
        />
        <div className="h-1 bg-gold" />

        <div className="relative z-10 px-8 pb-10 pt-6 md:px-12 text-ink text-center">
          <img
            src={IMAGES.logo.primary}
            alt="Gobernarg"
            className="h-14 mx-auto mb-4 mix-blend-multiply"
          />

          <h2 className="font-display text-3xl md:text-4xl font-semibold mb-4">
            ¡Felicitaciones, {governorName}!
          </h2>

          <p className="text-lg text-ink/85 mb-5 leading-relaxed">
            Ganaste la elección y asumís la <strong>{getPositionTitle(position)}</strong>. Es hora de
            liderar y guiar a tu {getTerritory(position)} hacia un futuro próspero.
          </p>

          <p className="text-base text-ink/70 mb-7 leading-relaxed">
            Desde la {getPositionTitle(position)} vas a tomar decisiones clave, gestionar recursos y
            equilibrar las necesidades de diversos grupos de interés. Mantené la estabilidad política,
            económica y social mientras enfrentás desafíos y aprovechás oportunidades.
          </p>

          <p className="font-display text-2xl font-semibold text-gold-ink mb-8">
            ¡Tu mandato comienza ahora!
          </p>

          <button
            onClick={onStart}
            className="bg-ink hover:bg-ink/90 text-paper px-10 py-3 rounded-md text-lg font-semibold transition-colors"
          >
            Entendido
          </button>
        </div>
      </div>
    </div>
  );
}
