import { useState } from 'react';
import { ArrowRight, Info } from 'lucide-react';
import { Archetype, Position } from '../types/game';
import { IMAGES, getPositionBackground } from '../utils/imageAssets';
import { THUMBNAIL_ARCHETYPES } from '../utils/iconThumbnails';
import { ARCHETYPE_PASSIVES } from '../data/archetypes';
import { STARTING_POSITION } from '../data/careerRules';
import { InfoTooltip } from './InfoTooltip';
import { SetupSteps } from './SetupSteps';

/** Lo que se define en el paso 1; la dificultad y el partido van en el paso 2 (GameSetup). */
export interface CharacterDraft {
  position: Position;
  archetype: Archetype;
  governorName: string;
  avatar: string;
}

interface CharacterCreationProps {
  initial?: CharacterDraft | null;
  onContinue: (draft: CharacterDraft) => void;
}

export const AVATARS = [
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

export function CharacterCreation({ initial, onContinue }: CharacterCreationProps) {
  // MVP presidente-only: el cargo inicial vive en careerRules (STARTING_POSITION)
  // para que el futuro modo campaña tenga un único punto de cambio.
  const position: Position = STARTING_POSITION;
  const [archetype, setArchetype] = useState<Archetype>(initial?.archetype ?? 'politico');
  const [governorName, setGovernorName] = useState(initial?.governorName ?? '');
  const [avatar, setAvatar] = useState<string>(initial?.avatar ?? AVATARS[0].src);
  const [showNameError, setShowNameError] = useState(false);

  const handleSubmit = () => {
    if (!governorName.trim()) {
      setShowNameError(true);
      return;
    }
    onContinue({ position, archetype, governorName: governorName.trim(), avatar });
  };

  const archetypes: { id: Archetype; title: string; bonus: string; description: string }[] = [
    { id: 'politico', title: 'Político de Raza', bonus: 'Aparato propio y puentes con aliados y oposición', description: 'Experto en acuerdos y manejo institucional.' },
    { id: 'sindicalista', title: 'Sindicalista', bonus: 'Buena relación con sindicatos y organizaciones', description: 'Fortaleza en movimientos sociales.' },
    { id: 'empresario', title: 'Empresario', bonus: 'Credibilidad de mercado y mejor recaudación', description: 'Visión económica y relación con el sector privado.' },
    { id: 'comunicador', title: 'Comunicador', bonus: 'Alta imagen inicial y encuestas gratis', description: 'Domina la agenda pública y los medios.' },
  ];

  return (
    <div className="relative min-h-screen text-ink overflow-hidden">
      {/* Fondo según cargo seleccionado */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-all duration-700"
        style={{ backgroundImage: `url(${getPositionBackground(position)})` }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-paper/25 via-paper/60 to-paper/95" />

      <div className="relative z-10 max-w-5xl mx-auto p-4 md:p-8">
        <div className="flex items-center justify-between gap-4 mb-6 flex-wrap">
          <img src={IMAGES.logo.primary} alt="Gobernarg" className="h-14 md:h-16 rounded-md shadow-sm" />
          <SetupSteps current={1} />
        </div>

        <div className="bg-surface/95 backdrop-blur rounded-xl p-6 md:p-10 shadow-[0_24px_60px_-20px_rgba(20,33,61,0.45)] border border-rule">
          <h1 className="font-display text-3xl md:text-4xl font-semibold mb-2  ">Creá tu gobernante</h1>
          <p className="text-ink/80 mb-8">Definí quién va a ocupar el ejecutivo y con qué perfil.</p>

          <div className="mb-8">
            <h2 className="font-display text-xl font-semibold mb-3  ">Nombre del gobernante</h2>
            <input
              type="text"
              value={governorName}
              onChange={(e) => {
                setGovernorName(e.target.value);
                setShowNameError(false);
              }}
              placeholder="Ingresá tu nombre"
              className="w-full px-4 py-3 rounded-lg bg-ink/20 border border-ink/30 focus:outline-none focus:ring-2 focus:ring-ink/50 placeholder-ink/50"
            />
            {showNameError && (
              <p className="text-red-300 mt-2">Escribí un nombre para seguir</p>
            )}
          </div>

          <h2 className="font-display text-xl font-semibold mb-4  ">Elegí tu Perfil</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
            {archetypes.map((arch) => {
              const passives = ARCHETYPE_PASSIVES[arch.id] ?? [];
              return (
                <InfoTooltip
                  key={arch.id}
                  side="bottom"
                  content={
                    <div className="flex flex-col gap-1.5">
                      <div className="font-semibold text-xs">{arch.title}</div>
                      <div className="text-[10px] text-muted-foreground">{arch.description}</div>
                      {passives.length > 0 && (
                        <div>
                          <div className="font-semibold text-[11px] mt-0.5 mb-0.5">Pasivas activas</div>
                          {passives.map((p, i) => (
                            <div key={i} className="flex items-start gap-1 text-[10px]">
                              <Info size={10} className="text-blue-400 mt-0.5 shrink-0" />
                              <span>
                                <span className="text-ink">{p.name}</span>
                                <span className="text-muted-foreground"> — {p.description}</span>
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  }
                >
                  <button
                    onClick={() => setArchetype(arch.id)}
                    className={`flex flex-col items-center text-center p-5 rounded-xl border-2 transition-all ${
                      archetype === arch.id
                        ? 'bg-ink/15 border-accent shadow-lg scale-[1.02]'
                        : 'bg-ink/5 border-ink/20 hover:bg-ink/10 hover:border-ink/40'
                    }`}
                  >
                    <img
                      src={THUMBNAIL_ARCHETYPES[arch.id] || THUMBNAIL_ARCHETYPES.politico}
                      alt={arch.title}
                      className="w-16 h-16 rounded-full object-cover bg-ink/20 p-1 mb-3"
                    />
                    <h3 className="font-bold">{arch.title}</h3>
                    <p className="text-xs opacity-75 mt-1">{arch.bonus}</p>
                    <p className="text-xs opacity-90 mt-2">{arch.description}</p>
                  </button>
                </InfoTooltip>
              );
            })}
          </div>

          <h2 className="font-display text-xl font-semibold mb-4  ">Elegí tu Avatar</h2>
          <div className="grid grid-cols-3 sm:grid-cols-5 lg:grid-cols-9 gap-3 mb-10">
            {AVATARS.map((av) => (
              <button
                key={av.id}
                onClick={() => setAvatar(av.src)}
                className={`flex flex-col items-center p-2 rounded-xl border-2 transition-all ${
                  avatar === av.src
                    ? 'bg-ink/15 border-accent shadow-lg scale-[1.05]'
                    : 'bg-ink/5 border-ink/20 hover:bg-ink/10 hover:border-ink/40'
                }`}
              >
                <img
                  src={av.src}
                  alt={av.label}
                  className="w-16 h-16 rounded-full object-cover bg-ink/20"
                />
                <span className="text-xs mt-2 text-center opacity-90">{av.label}</span>
              </button>
            ))}
          </div>

          <button
            onClick={handleSubmit}
            className={`w-full flex items-center justify-center gap-2 font-semibold py-3.5 px-6 rounded-md transition-colors text-lg ${
              !governorName.trim()
                ? 'bg-sunken text-ink/70 cursor-not-allowed'
                : 'bg-ink hover:bg-ink/90 text-paper'
            }`}
            disabled={!governorName.trim()}
          >
            Continuar
            <ArrowRight className={`w-5 h-5 ${governorName.trim() ? 'text-gold' : ''}`} />
          </button>
        </div>
      </div>
    </div>
  );
}
