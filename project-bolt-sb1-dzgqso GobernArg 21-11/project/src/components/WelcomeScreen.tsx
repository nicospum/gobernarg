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
      <div className="absolute inset-0 bg-gradient-to-b from-blue-900/80 via-blue-800/60 to-slate-900/80" />

      {/* Contenido */}
      <div className="relative z-10 max-w-2xl w-full px-6 text-center">
        <img
          src={IMAGES.logo.wide}
          alt="Gobernarg"
          className="w-full max-w-md mx-auto mb-6 drop-shadow-2xl"
        />

        <p className="text-lg md:text-xl text-white/90 mb-10 leading-relaxed drop-shadow">
          Simulación política donde tomás decisiones estratégicas, gestionás recursos,
          negociás con grupos de interés y buscás la legitimidad para gobernar.
        </p>

        <button
          onClick={() => onStart(false)}
          className="inline-flex items-center gap-2 bg-accent hover:bg-accent/90 text-accent-foreground font-display font-bold px-10 py-4 rounded-xl transition-colors shadow-lg text-lg uppercase tracking-wide"
        >
          <Play className="w-5 h-5" />
          Empezar
        </button>
      </div>
    </div>
  );
}
