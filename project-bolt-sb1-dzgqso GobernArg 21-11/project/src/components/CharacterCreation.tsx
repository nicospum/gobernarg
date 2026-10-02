import { PresidentialMark } from './causal/SituationRoom';
import { useState } from 'react';
import { IMAGES } from '../utils/imageAssets';
import { THUMBNAIL_ARCHETYPES } from '../utils/iconThumbnails';
import { InfoTooltip } from './InfoTooltip';
import { PROFILES } from '../causal/campaignCatalog';
import type { Profile } from '../causal/campaignTypes';
import { SetupSteps } from './SetupSteps';
import type { CharacterDraft } from './GameSetup';

interface CharacterCreationProps {
  onComplete: (archetype: Profile, governorName: string, avatar: string) => void;
  /** Inicio en dos pasos: al volver desde el paso 2 (GameSetup) se conserva lo cargado. */
  initial?: CharacterDraft | null;
}

const AVATARS = [
  { id: 'executive-1', src: IMAGES.characters.executive1, label: 'Ejecutivo' },
  { id: 'executive-2', src: IMAGES.characters.executive2, label: 'Ejecutiva' },
  { id: 'female-executive-1', src: IMAGES.characters.femaleExecutive1, label: 'Ejecutiva 1' },
  { id: 'female-executive-2', src: IMAGES.characters.femaleExecutive2, label: 'Ejecutiva 2' },
  { id: 'senior-leader', src: IMAGES.characters.seniorLeader, label: 'Líder sénior' },
  { id: 'indigenous-leader', src: IMAGES.characters.indigenousLeader, label: 'Líder indígena' },
  { id: 'youth-activist', src: IMAGES.characters.youthActivist, label: 'Activista joven' },
  { id: 'business-executive', src: IMAGES.characters.businessExecutive, label: 'Empresaria' },
  { id: 'popular-leader', src: IMAGES.characters.popularLeader, label: 'Líder popular' },
  { id: 'spokesperson', src: IMAGES.characters.spokesperson, label: 'Vocera' },
  { id: 'candidate-handshake', src: IMAGES.characters.candidateHandshake, label: 'Candidato' },
  { id: 'conservative', src: IMAGES.characters.conservative, label: 'Conservador' },
  { id: 'fighter', src: IMAGES.characters.fighter, label: 'Luchador social' },
  { id: 'young-orator', src: IMAGES.characters.youngOrator, label: 'Joven orador' },
  { id: 'podium-official', src: IMAGES.characters.podiumOfficial, label: 'Presidente' },
];

export function CharacterCreation({ onComplete, initial = null }: CharacterCreationProps) {
  const [archetype, setArchetype] = useState<Profile>(initial?.archetype ?? 'politico');
  const [governorName, setGovernorName] = useState(initial?.governorName ?? '');
  const [avatar, setAvatar] = useState<string>(initial?.avatar ?? AVATARS[0].src);
  const [showNameError, setShowNameError] = useState(false);

  const handleSubmit = () => {
    if (!governorName.trim()) {
      setShowNameError(true);
      return;
    }
    onComplete(archetype, governorName, avatar);
  };

  const archetypes: { id: Profile; title: string; description: string }[] = [
    { id: 'politico', title: 'Político de Raza', description: 'Experto en acuerdos y manejo institucional.' },
    { id: 'sindicalista', title: 'Sindicalista', description: 'Fortaleza en movimientos sociales.' },
    { id: 'empresario', title: 'Empresario', description: 'Visión económica y relación con el sector privado.' },
    { id: 'comunicador', title: 'Comunicador', description: 'Domina la agenda pública y los medios.' },
  ];

  return (
    <div className="relative min-h-screen text-white overflow-hidden">
      {/* Fondo según cargo seleccionado */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-all duration-700"
        style={{ backgroundImage: `url(${IMAGES.backgrounds.congressSunrise})` }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-slate-900/80 via-blue-900/70 to-slate-900/90" />

      <div className="relative z-10 max-w-5xl mx-auto p-4 md:p-8">
        <div className="flex items-center justify-between gap-4 mb-6 flex-wrap">
          <div className="b-onboarding-mark"><PresidentialMark /></div>
          <SetupSteps current={1} />
        </div>

        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 md:p-10 shadow-2xl border border-white/10">
          <h1 className="font-display text-3xl md:text-4xl font-bold mb-2 uppercase tracking-wide">Creá tu gobernante</h1>
          <p className="text-white/80 mb-8">Definí quién va a ocupar el ejecutivo y con qué perfil.</p>

          <div className="mb-8">
            <h2 className="font-display text-xl font-semibold mb-3 uppercase tracking-wide">Nombre del gobernante</h2>
            <input
              type="text"
              value={governorName}
              maxLength={120}
              aria-label="Nombre del gobernante"
              onChange={(e) => {
                setGovernorName(e.target.value);
                setShowNameError(false);
              }}
              placeholder="Ingresá tu nombre"
              className="w-full px-4 py-3 rounded-lg bg-white/20 border border-white/30 focus:outline-none focus:ring-2 focus:ring-white/50 placeholder-white/50"
            />
            {showNameError && (
              <p className="text-red-300 mt-2">Escribí un nombre para comenzar</p>
            )}
          </div>

          <h2 className="font-display text-xl font-semibold mb-4 uppercase tracking-wide">Elegí tu Perfil</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
            {archetypes.map((arch) => {
              return (
                <InfoTooltip
                  key={arch.id}
                  side="bottom"
                  content={
                    <div className="flex flex-col gap-1.5">
                      <div className="font-semibold text-xs">{arch.title}</div>
                      <div className="text-[10px] text-muted-foreground">{arch.description}</div>
                    </div>
                  }
                >
                  <button
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
                    <h3 className="font-bold">{arch.title}</h3>
                    <p className="text-xs opacity-75 mt-1">{PROFILES[arch.id]?.description}</p>
                    <p className="text-xs opacity-90 mt-2">{arch.description}</p>
                  </button>
                </InfoTooltip>
              );
            })}
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
            Continuar
          </button>
        </div>
      </div>
    </div>
  );
}
