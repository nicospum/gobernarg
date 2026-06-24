import { useState } from 'react';
import { Shield, Wrench, Play } from 'lucide-react';
import { IMAGES } from '../utils/imageAssets';

export function WelcomeScreen({ onStart }: { onStart: (isAdmin: boolean) => void }) {
  const [selectedMode, setSelectedMode] = useState<string | null>(null);

  const handleStart = () => {
    if (selectedMode) {
      onStart(selectedMode === 'admin');
    }
  };

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

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
          <button
            onClick={() => setSelectedMode('normal')}
            className={`flex flex-col items-center gap-3 p-6 rounded-xl border-2 transition-all ${
              selectedMode === 'normal'
                ? 'bg-white/20 border-white shadow-xl scale-[1.02]'
                : 'bg-white/10 border-white/30 hover:bg-white/15 hover:border-white/50'
            }`}
          >
            <Shield className="w-8 h-8 text-white" />
            <div>
              <h3 className="font-display font-bold text-white text-lg uppercase tracking-wide">Modo Normal</h3>
              <p className="text-sm text-white/80">Gestioná con las reglas del juego.</p>
            </div>
          </button>

          <button
            onClick={() => setSelectedMode('admin')}
            className={`flex flex-col items-center gap-3 p-6 rounded-xl border-2 transition-all ${
              selectedMode === 'admin'
                ? 'bg-white/20 border-white shadow-xl scale-[1.02]'
                : 'bg-white/10 border-white/30 hover:bg-white/15 hover:border-white/50'
            }`}
          >
            <Wrench className="w-8 h-8 text-white" />
            <div>
              <h3 className="font-display font-bold text-white text-lg uppercase tracking-wide">Modo Admin</h3>
              <p className="text-sm text-white/80">Panel de debug y pruebas internas.</p>
            </div>
          </button>
        </div>

        <button
          onClick={handleStart}
          disabled={!selectedMode}
          className="inline-flex items-center gap-2 bg-accent hover:bg-accent/90 disabled:bg-white/20 disabled:text-white/40 disabled:cursor-not-allowed text-accent-foreground font-display font-bold px-10 py-4 rounded-xl transition-colors shadow-lg text-lg uppercase tracking-wide"
        >
          <Play className="w-5 h-5" />
          Empezar
        </button>
      </div>
    </div>
  );
}
