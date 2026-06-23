import { Position } from '../types/game';
import { IMAGES, getPositionBackground } from '../utils/imageAssets';

interface WelcomeModalProps {
  governorName: string;
  position: Position;
  onStart: () => void;
}

export function WelcomeModal({ governorName, position, onStart }: WelcomeModalProps) {
  const getTerritory = (pos: Position) => {
    switch (pos) {
      case 'intendente':
        return 'municipio';
      case 'gobernador':
        return 'provincia';
      case 'presidente':
        return 'país';
    }
  };

  const getPositionTitle = (pos: Position) => {
    switch (pos) {
      case 'intendente':
        return 'Intendente';
      case 'gobernador':
        return 'Gobernador';
      case 'presidente':
        return 'Presidente';
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="relative w-full max-w-3xl rounded-2xl overflow-hidden shadow-2xl">
        {/* Imagen de fondo según cargo */}
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${getPositionBackground(position)})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/95 via-slate-900/70 to-slate-900/40" />

        <div className="relative z-10 p-8 md:p-12 text-white text-center">
          <img
            src={IMAGES.logo.primary}
            alt="Gobernarg"
            className="h-16 md:h-20 mx-auto mb-6 bg-white/90 rounded-xl px-4 py-2"
          />

          <h2 className="text-3xl md:text-4xl font-bold mb-4 drop-shadow-lg">
            ¡Felicitaciones, {governorName}!
          </h2>

          <p className="text-lg md:text-xl text-white/90 mb-6 leading-relaxed">
            Has sido elegido como <strong>{getPositionTitle(position)}</strong>. Es hora de asumir
            el liderazgo y guiar a tu {getTerritory(position)} hacia un futuro próspero.
          </p>

          <p className="text-base md:text-lg text-white/80 mb-8 leading-relaxed">
            Como {getPositionTitle(position)}, deberás tomar decisiones clave, gestionar recursos y
            equilibrar las necesidades de diversos grupos de interés. Mantén la estabilidad política,
            económica y social mientras enfrentás desafíos y aprovechás oportunidades.
          </p>

          <p className="text-2xl font-bold mb-8 drop-shadow-md">
            ¡Tu mandato comienza ahora!
          </p>

          <button
            onClick={onStart}
            className="bg-green-500 hover:bg-green-400 text-slate-900 px-10 py-3 rounded-xl text-lg font-bold transition-colors shadow-lg"
          >
            Entendido
          </button>
        </div>
      </div>
    </div>
  );
}
