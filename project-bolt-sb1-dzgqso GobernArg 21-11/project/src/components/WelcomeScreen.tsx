import { Play } from 'lucide-react';
import { IMAGES } from '../utils/imageAssets';

export function WelcomeScreen({ onStart }: { onStart: (isAdmin: boolean) => void }) {
  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen overflow-hidden">
      {/* Fondo institucional */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${IMAGES.backgrounds.congressSunrise})` }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-paper/25 via-paper/60 to-paper/95" />

      {/* Contenido */}
      <div className="relative z-10 max-w-xl w-full mx-6 px-8 py-10 md:px-12 md:py-12 text-center bg-surface/95 backdrop-blur rounded-xl shadow-[0_24px_60px_-20px_rgba(20,33,61,0.45)] border border-rule">
        <img
          src={IMAGES.logo.wide}
          alt="Gobernarg"
          className="w-full max-w-sm mx-auto mb-6 mix-blend-multiply"
        />

        <p className="text-lg text-ink/80 mb-8 leading-relaxed">
          Simulación política donde tomás decisiones estratégicas, gestionás recursos,
          negociás con grupos de interés y buscás la legitimidad para gobernar.
        </p>

        <button
          onClick={() => onStart(false)}
          className="inline-flex items-center gap-2 bg-ink hover:bg-ink/90 text-paper font-semibold px-10 py-3.5 rounded-md transition-colors text-lg"
        >
          <Play className="w-5 h-5 text-gold" />
          Empezar
        </button>
      </div>
    </div>
  );
}
