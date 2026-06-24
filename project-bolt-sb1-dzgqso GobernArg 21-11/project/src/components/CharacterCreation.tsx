import { useState } from 'react';
import { User, Briefcase, Users, Radio } from 'lucide-react';
import { Archetype, Position } from '../types/game';
import { IMAGES, getPositionBackground } from '../utils/imageAssets';
import { THUMBNAIL_ARCHETYPES } from '../utils/iconThumbnails';

interface CharacterCreationProps {
  onComplete: (position: Position, archetype: Archetype, governorName: string, isAdminMode: boolean, avatar: string) => void;
}

const AVATARS = [
  { id: 'executive-1', src: IMAGES.characters.executive1, label: 'Ejecutivo' },
  { id: 'executive-2', src: IMAGES.characters.executive2, label: 'Ejecutiva' },
  { id: 'popular-leader', src: IMAGES.characters.popularLeader, label: 'Líder popular' },
  { id: 'spokesperson', src: IMAGES.characters.spokesperson, label: 'Vocera' },
  { id: 'candidate-handshake', src: IMAGES.characters.candidateHandshake, label: 'Candidato' },
  { id: 'conservative', src: IMAGES.characters.conservative, label: 'Conservador' },
  { id: 'fighter', src: IMAGES.characters.fighter, label: 'Luchador social' },
  { id: 'young-orator', src: IMAGES.characters.youngOrator, label: 'Joven orador' },
  { id: 'podium-official', src: IMAGES.characters.podiumOfficial, label: 'Presidente' },
];

export function CharacterCreation({ onComplete }: CharacterCreationProps) {
  const [position, setPosition] = useState<Position>('intendente');
  const [archetype, setArchetype] = useState<Archetype>('politico');
  const [governorName, setGovernorName] = useState('');
  const [avatar, setAvatar] = useState<string>(AVATARS[0].src);
  const [showNameError, setShowNameError] = useState(false);
  const [isAdminMode, setIsAdminMode] = useState(false);

  const handleSubmit = () => {
    if (!governorName.trim()) {
      setShowNameError(true);
      return;
    }
    onComplete(position, archetype, governorName, isAdminMode, avatar);
  };

  const getInitialBudget = (pos: Position) => {
    switch (pos) {
      case 'intendente':
        return '250M';
      case 'gobernador':
        return '500M';
      case 'presidente':
        return '1,000M';
    }
  };

  const positions: { id: Position; title: string; difficulty: string; description: string }[] = [
    { id: 'intendente', title: 'Intendente', difficulty: 'Fácil', description: 'Gestión municipal cercana a la gente.' },
    { id: 'gobernador', title: 'Gobernador', difficulty: 'Medio', description: 'Equilibrar provincia y Nación.' },
    { id: 'presidente', title: 'Presidente', difficulty: 'Difícil', description: 'Liderar el país entre crisis y coaliciones.' },
  ];

  const archetypes: { id: Archetype; icon: typeof User; title: string; bonus: string; description: string }[] = [
    { id: 'politico', icon: User, title: 'Político de Raza', bonus: '+2 acciones por turno', description: 'Experto en acuerdos y manejo institucional.' },
    { id: 'sindicalista', icon: Users, title: 'Sindicalista', bonus: '+1 acción, apoyo sindical', description: 'Fortaleza en movimientos sociales.' },
    { id: 'empresario', icon: Briefcase, title: 'Empresario', bonus: '+1 acción, capital inicial', description: 'Visión económica y relación con el sector privado.' },
    { id: 'comunicador', icon: Radio, title: 'Comunicador', bonus: 'Alta popularidad inicial', description: 'Domina la agenda pública y los medios.' },
  ];

  return (
    <div className="relative min-h-screen text-white overflow-hidden">
      {/* Fondo según cargo seleccionado */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-all duration-700"
        style={{ backgroundImage: `url(${getPositionBackground(position)})` }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-slate-900/80 via-blue-900/70 to-slate-900/90" />

      <div className="relative z-10 max-w-5xl mx-auto p-4 md:p-8">
        <div className="flex justify-between items-center mb-6">
          <img src={IMAGES.logo.primary} alt="Gobernarg" className="h-14 md:h-20 drop-shadow-lg" />
          <label className="flex items-center gap-2 cursor-pointer bg-white/10 px-3 py-2 rounded-lg backdrop-blur">
            <input
              type="checkbox"
              checked={isAdminMode}
              onChange={(e) => setIsAdminMode(e.target.checked)}
              className="w-4 h-4 rounded border-white/30 bg-white/20 checked:bg-blue-500"
            />
            <span className="text-sm opacity-90">Modo Admin</span>
          </label>
        </div>

        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 md:p-10 shadow-2xl border border-white/10">
          <h1 className="font-display text-3xl md:text-4xl font-bold mb-2 uppercase tracking-wide">Creá tu gobernante</h1>
          <p className="text-white/80 mb-8">Definí quién va a ocupar el ejecutivo y con qué perfil.</p>

          <div className="mb-8">
            <h2 className="font-display text-xl font-semibold mb-3 uppercase tracking-wide">Nombre del gobernante</h2>
            <input
              type="text"
              value={governorName}
              onChange={(e) => {
                setGovernorName(e.target.value);
                setShowNameError(false);
              }}
              placeholder="Ingresá tu nombre"
              className="w-full px-4 py-3 rounded-lg bg-white/20 border border-white/30 focus:outline-none focus:ring-2 focus:ring-white/50 placeholder-white/50"
            />
            {showNameError && (
              <p className="text-red-300 mt-2">Debes ingresar un nombre para comenzar</p>
            )}
          </div>

          <h2 className="font-display text-xl font-semibold mb-4 uppercase tracking-wide">Elegí el Cargo</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
            {positions.map((pos) => (
              <button
                key={pos.id}
                onClick={() => setPosition(pos.id)}
                className={`text-left p-5 rounded-xl border-2 transition-all ${
                  position === pos.id
                    ? 'bg-white/15 border-accent shadow-lg'
                    : 'bg-white/5 border-white/20 hover:bg-white/10 hover:border-white/40'
                }`}
              >
                <h3 className="font-bold text-lg">{pos.title}</h3>
                <p className="text-sm opacity-75 mb-2">Dificultad: {pos.difficulty}</p>
                <p className="text-sm opacity-90">{pos.description}</p>
                <p className="text-sm mt-3 font-medium">Presupuesto inicial: ${getInitialBudget(pos.id)}</p>
              </button>
            ))}
          </div>

          <h2 className="font-display text-xl font-semibold mb-4 uppercase tracking-wide">Elegí tu Perfil</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
            {archetypes.map((arch) => (
              <button
                key={arch.id}
                onClick={() => setArchetype(arch.id)}
                className={`flex flex-col items-center text-center p-5 rounded-xl border-2 transition-all ${
                  archetype === arch.id
                    ? 'bg-white/15 border-accent shadow-lg scale-[1.02]'
                    : 'bg-white/5 border-white/20 hover:bg-white/10 hover:border-white/40'
                }`}
              >
                <img
                  src={THUMBNAIL_ARCHETYPES[arch.id] || THUMBNAIL_ARCHETYPES.politico}
                  alt={arch.title}
                  className="w-16 h-16 rounded-full object-cover bg-white/20 p-1 mb-3"
                />
                <arch.icon className="w-5 h-5 mb-1 opacity-80" />
                <h3 className="font-bold">{arch.title}</h3>
                <p className="text-xs opacity-75 mt-1">{arch.bonus}</p>
                <p className="text-xs opacity-90 mt-2">{arch.description}</p>
              </button>
            ))}
          </div>

          <h2 className="font-display text-xl font-semibold mb-4 uppercase tracking-wide">Elegí tu Avatar</h2>
          <div className="grid grid-cols-3 sm:grid-cols-5 lg:grid-cols-9 gap-3 mb-10">
            {AVATARS.map((av) => (
              <button
                key={av.id}
                onClick={() => setAvatar(av.src)}
                className={`flex flex-col items-center p-2 rounded-xl border-2 transition-all ${
                  avatar === av.src
                    ? 'bg-white/15 border-accent shadow-lg scale-[1.05]'
                    : 'bg-white/5 border-white/20 hover:bg-white/10 hover:border-white/40'
                }`}
              >
                <img
                  src={av.src}
                  alt={av.label}
                  className="w-16 h-16 rounded-full object-cover bg-white/20"
                />
                <span className="text-xs mt-2 text-center opacity-90">{av.label}</span>
              </button>
            ))}
          </div>

          <button
            onClick={handleSubmit}
            className={`w-full font-display font-bold py-4 px-6 rounded-xl transition-colors text-lg uppercase tracking-wide ${
              !governorName.trim()
                ? 'bg-white/15 text-white/50 cursor-not-allowed'
                : 'bg-accent hover:bg-accent/90 text-accent-foreground shadow-lg'
            }`}
            disabled={!governorName.trim()}
          >
            Comenzar Gestión
          </button>
        </div>
      </div>
    </div>
  );
}
