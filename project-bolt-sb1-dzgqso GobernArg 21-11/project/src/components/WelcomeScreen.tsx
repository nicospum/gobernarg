import { Play, RotateCcw } from 'lucide-react';
import { IMAGES } from '../utils/imageAssets';
import { screenImage } from '@/lib/liteImages';
import type { GameState } from '../types/game';
import { getScenario } from '@/data/causal';

interface WelcomeScreenProps {
  onStart: () => void;
  /** Partida guardada en el navegador, si hay una para retomar. */
  saved?: GameState | null;
  onContinue?: () => void;
}

function savedLabel(state: GameState): string {
  const scenario = getScenario(state.causal?.scenarioId);
  const parts = [state.governorName || 'Tu gobernante', `Año ${state.year}, trimestre ${state.turn}`];
  if (scenario) parts.push(scenario.name);
  return parts.join(' · ');
}

export function WelcomeScreen({ onStart, saved, onContinue }: WelcomeScreenProps) {
  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen overflow-hidden">
      {/* Portada: Plaza de Mayo (aclarada para el tema claro) */}
      <img src={screenImage('bienvenida')} alt="" decoding="async" className="absolute inset-0 w-full h-full object-cover" />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgb(var(--paper)/0.05)_0%,rgb(var(--paper)/0.3)_55%,rgb(var(--paper)/0.85)_100%)]" />

      {/* Contenido */}
      <div className="relative z-10 max-w-xl w-[calc(100%-2rem)] px-6 py-10 md:px-12 md:py-12 text-center bg-surface/95 backdrop-blur sr-modal">
        <img
          src={IMAGES.logo.wide}
          alt="Gobernarg"
          className="w-full max-w-sm mx-auto mb-3 mix-blend-multiply"
        />
        <p className="mb-6">
          <span className="sr-label inline-flex items-center gap-2"><span className="sr-live-dot" /> Sala de situación · Versión Lite</span>
        </p>

        <p className="text-lg text-ink/80 mb-8 leading-relaxed">
          Simulación política donde tomás decisiones estratégicas, gestionás recursos,
          negociás con grupos de interés y buscás la legitimidad para gobernar.
        </p>

        {saved && onContinue ? (
          <div className="flex flex-col items-center gap-3">
            <button
              onClick={onContinue}
              className="sr-btn-lime px-10 h-[52px] text-[13px]"
            >
              <Play className="w-5 h-5" />
              Continuar partida
            </button>
            <p className="text-sm text-ink/70">{savedLabel(saved)}</p>
            <button
              onClick={onStart}
              className="inline-flex items-center gap-1.5 text-sm font-medium text-ink/75 hover:text-ink px-3 py-2 rounded-md hover:bg-sunken transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
              Empezar una nueva
            </button>
          </div>
        ) : (
          <button
            onClick={onStart}
            className="sr-btn-lime px-10 h-[52px] text-[13px]"
          >
            <Play className="w-5 h-5" />
            Empezar
          </button>
        )}
      </div>
    </div>
  );
}
