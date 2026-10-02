import { ArrowRight, Play, RotateCcw } from 'lucide-react';
import { IMAGES } from '../utils/imageAssets';
import { screenImage } from '../utils/liteImages';
import { PresidentialMark } from './causal/SituationRoom';

interface WelcomeScreenProps {
  onStart: (isAdmin: boolean) => void;
  savedLabel?: string | null;
  onContinue?: () => void;
}

export function WelcomeScreen({ onStart, savedLabel, onContinue }: WelcomeScreenProps) {
  return <div className="b-welcome">
    <header className="b-welcome-header"><PresidentialMark /><span className="b-classification">República Argentina / Presidencia</span></header>
    <main className="b-welcome-main">
      <div className="b-welcome-copy"><p className="b-eyebrow"><span className="b-live-dot" /> Simulación política argentina</p><h1>Sala de situación<br /><em>presidencial.</em></h1><p className="b-welcome-description">Cada decisión abre un frente.<br />Goberná, negociá y construí tu legado.</p><p className="b-welcome-detail">Administrá los recursos del país, acordá con sus actores y enfrentá las consecuencias de tu gobierno, trimestre a trimestre.</p>
        <div className="b-welcome-actions">{savedLabel && onContinue ? <><button onClick={onContinue} className="causal-primary b-welcome-start"><Play size={17} />Continuar partida<ArrowRight size={18} /></button><p className="b-saved-label">{savedLabel}</p><button onClick={() => onStart(false)} className="causal-secondary"><RotateCcw size={14} />Empezar una nueva</button></> : <button onClick={() => onStart(false)} className="causal-primary b-welcome-start"><Play size={17} />Empezar<ArrowRight size={18} /></button>}</div>
        <p className="b-welcome-tagline"><strong>Cuatro años para cambiar el país.</strong><span>Ocho, si la gente te vuelve a elegir.</span></p>
      </div>
      <div className="b-welcome-scene"><img src={screenImage('bienvenida-hero') ?? IMAGES.backgrounds.casaRosadaSunset} alt="Casa Rosada desde Plaza de Mayo" /><div className="b-scene-caption"><span className="b-eyebrow">Casa Rosada / Buenos Aires</span><strong>El país espera tus decisiones.</strong><span>Hasta dos mandatos de dieciséis trimestres.</span></div><span className="b-scene-stamp">GobernArg · B Lite</span></div>
    </main><footer className="b-welcome-footer"><span>Decisiones · Acuerdos · Consecuencias</span><span>Tu gestión se guarda automáticamente en este navegador.</span></footer>
  </div>;
}
