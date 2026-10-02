import { useRef, useState, type ReactNode } from 'react';
import { ArrowLeft, Camera, Check, Play } from 'lucide-react';
import type { Archetype } from '../types/game';
import { IMAGES } from '../utils/imageAssets';
import { THUMBNAIL_ARCHETYPES } from '../utils/iconThumbnails';
import { ARCHETYPE_CARDS } from '../data/archetypes';
import { DEFAULT_SCENARIO_ID, DIFFICULTY_LEVELS, getScenario, type ScenarioDef } from '../data/causal';
import { photoToDataUrl, validatePhotoFile } from '@/lib/avatarPhoto';

export interface NewGameChoice {
  governorName: string;
  avatar: string;
  archetype: Archetype;
  scenarioId: string;
}

interface NewGameScreenProps {
  onStart: (choice: NewGameChoice) => void;
  onBack?: () => void;
}

/** Fotos de la grilla. Sin nombres a la vista: el texto alternativo es genérico. */
const AVATARS: string[] = [
  IMAGES.characters.executive1,
  IMAGES.characters.executive2,
  IMAGES.characters.femaleExecutive1,
  IMAGES.characters.femaleExecutive2,
  IMAGES.characters.seniorLeader,
  IMAGES.characters.indigenousLeader,
  IMAGES.characters.youthActivist,
  IMAGES.characters.businessExecutive,
  IMAGES.characters.popularLeader,
  IMAGES.characters.spokesperson,
  IMAGES.characters.candidateHandshake,
  IMAGES.characters.conservative,
  IMAGES.characters.fighter,
  IMAGES.characters.youngOrator,
  IMAGES.characters.podiumOfficial,
];

function scenarioImage(sc: ScenarioDef): string | undefined {
  return (IMAGES[sc.image.group] as Record<string, string>)[sc.image.key];
}

function choiceCls(selected: boolean): string {
  return selected
    ? 'border-ink bg-ink/10 shadow-md'
    : 'border-ink/15 bg-surface hover:border-ink/40 hover:bg-ink/5';
}

function Section({ title, hint, children }: { title: string; hint?: string; children: ReactNode }) {
  return (
    <section className="mb-7">
      <h2 className="font-display text-lg md:text-xl font-semibold text-ink">{title}</h2>
      {hint && <p className="text-[13px] text-ink/70 mb-3">{hint}</p>}
      {!hint && <div className="mb-3" />}
      {children}
    </section>
  );
}

/**
 * Nueva partida en una sola pantalla (Lite): nombre, foto, perfil y nivel.
 */
export function NewGameScreen({ onStart, onBack }: NewGameScreenProps) {
  const [governorName, setGovernorName] = useState('');
  const [avatar, setAvatar] = useState<string>(AVATARS[0]);
  const [uploaded, setUploaded] = useState<string | null>(null);
  const [photoError, setPhotoError] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [archetype, setArchetype] = useState<Archetype>('politico');
  const [scenarioId, setScenarioId] = useState<string>(DEFAULT_SCENARIO_ID);
  const fileRef = useRef<HTMLInputElement>(null);

  const name = governorName.trim();
  const bg = scenarioImage(getScenario(scenarioId)) ?? IMAGES.backgrounds.presidentialOffice;

  const handleFile = async (file: File | undefined) => {
    if (!file) return;
    const error = validatePhotoFile(file);
    if (error) {
      setPhotoError(error);
      return;
    }
    setProcessing(true);
    setPhotoError(null);
    try {
      const dataUrl = await photoToDataUrl(file);
      setUploaded(dataUrl);
      setAvatar(dataUrl);
    } catch {
      setPhotoError('No pudimos leer esa foto. Probá con otra.');
    } finally {
      setProcessing(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  const handleStart = () => {
    if (!name) return;
    onStart({ governorName: name, avatar, archetype, scenarioId });
  };

  return (
    <div className="relative min-h-screen text-ink overflow-x-hidden">
      <div
        className="fixed inset-0 bg-cover bg-center bg-no-repeat transition-all duration-700"
        style={{ backgroundImage: `url(${bg})` }}
      />
      <div className="fixed inset-0 bg-gradient-to-b from-paper/25 via-paper/60 to-paper/95" />

      <div className="relative z-10 max-w-3xl mx-auto px-4 py-5 md:p-8">
        <div className="flex items-center justify-between gap-3 mb-4">
          <img src={IMAGES.logo.primary} alt="Gobernarg" className="h-12 md:h-14 rounded-md shadow-sm" />
          {onBack && (
            <button
              onClick={onBack}
              className="flex items-center gap-1.5 h-10 px-3 rounded-md text-sm font-medium text-ink/80 hover:text-ink hover:bg-sunken/80"
            >
              <ArrowLeft size={16} /> Volver
            </button>
          )}
        </div>

        <div className="bg-surface/95 backdrop-blur rounded-xl px-4 py-6 md:p-8 shadow-[0_24px_60px_-20px_rgba(20,33,61,0.45)] border border-rule">
          <h1 className="font-display text-3xl md:text-4xl font-semibold mb-6">Nueva partida</h1>

          <Section title="Tu nombre">
            <input
              type="text"
              value={governorName}
              onChange={e => setGovernorName(e.target.value)}
              placeholder="Ingresá tu nombre"
              aria-label="Tu nombre"
              maxLength={40}
              className="w-full h-12 px-4 rounded-lg bg-paper border border-ink/25 text-[16px] focus:outline-none focus:ring-2 focus:ring-ink/50 placeholder-ink/50"
            />
          </Section>

          <Section title="Tu foto" hint="Elegí una de la grilla o subí la tuya.">
            <div role="radiogroup" aria-label="Foto" className="grid grid-cols-4 sm:grid-cols-8 gap-2.5">
              {uploaded && (
                <button
                  role="radio"
                  aria-checked={avatar === uploaded}
                  aria-label="Tu foto"
                  onClick={() => setAvatar(uploaded)}
                  className={`relative aspect-square rounded-full border-2 p-0.5 transition-all ${choiceCls(avatar === uploaded)}`}
                >
                  <img src={uploaded} alt="Tu foto" className="w-full h-full rounded-full object-cover" />
                  {avatar === uploaded && <SelectedMark />}
                </button>
              )}
              {AVATARS.map((src, i) => (
                <button
                  key={src}
                  role="radio"
                  aria-checked={avatar === src}
                  aria-label={`Avatar ${i + 1}`}
                  onClick={() => setAvatar(src)}
                  className={`relative aspect-square rounded-full border-2 p-0.5 transition-all ${choiceCls(avatar === src)}`}
                >
                  <img src={src} alt={`Avatar ${i + 1}`} className="w-full h-full rounded-full object-cover bg-ink/10" />
                  {avatar === src && <SelectedMark />}
                </button>
              ))}
            </div>
            <div className="flex flex-wrap items-center gap-3 mt-3">
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                className="sr-only"
                id="avatar-upload"
                onChange={e => handleFile(e.target.files?.[0])}
              />
              <label
                htmlFor="avatar-upload"
                className={`inline-flex items-center gap-2 h-11 px-4 rounded-md border border-ink/25 text-sm font-semibold cursor-pointer hover:bg-sunken ${processing ? 'opacity-60 pointer-events-none' : ''}`}
              >
                <Camera size={16} />
                {processing ? 'Procesando…' : uploaded ? 'Cambiar mi foto' : 'Subir mi foto'}
              </label>
              {photoError && <p role="alert" className="text-sm text-red-400">{photoError}</p>}
            </div>
          </Section>

          <Section title="Tu perfil" hint="Cada perfil trae ventajas fijas para toda la partida.">
            <div role="radiogroup" aria-label="Perfil" className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {ARCHETYPE_CARDS.map(card => {
                const selected = archetype === card.id;
                return (
                  <button
                    key={card.id}
                    role="radio"
                    aria-checked={selected}
                    onClick={() => setArchetype(card.id)}
                    className={`flex items-start gap-3 text-left p-3.5 rounded-xl border-2 transition-all ${choiceCls(selected)}`}
                  >
                    <img src={THUMBNAIL_ARCHETYPES[card.id]} alt="" className="w-12 h-12 flex-shrink-0 rounded-full object-cover bg-ink/10 p-0.5" />
                    <span className="min-w-0">
                      <span className="block font-bold text-[15px]">{card.title}</span>
                      <span className="block text-[13px] text-ink/80 leading-snug mt-0.5">{card.advantages}</span>
                    </span>
                  </button>
                );
              })}
            </div>
          </Section>

          <Section title="Nivel">
            <div role="radiogroup" aria-label="Nivel" className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {DIFFICULTY_LEVELS.map(level => {
                const sc = getScenario(level.scenarioId);
                const selected = scenarioId === sc.id;
                return (
                  <button
                    key={level.id}
                    role="radio"
                    aria-checked={selected}
                    onClick={() => setScenarioId(sc.id)}
                    className={`text-left p-3.5 rounded-xl border-2 transition-all ${choiceCls(selected)}`}
                  >
                    <span className="block font-display text-2xl font-semibold leading-none">{level.label}</span>
                    <span className="block text-[13px] italic text-ink/80 mt-1.5 leading-snug">{level.tagline}</span>
                    <span className="block text-[12px] text-ink/70 mt-2">{sc.name}</span>
                  </button>
                );
              })}
            </div>
          </Section>

          <button
            onClick={handleStart}
            disabled={!name}
            className={`w-full flex items-center justify-center gap-2 font-semibold h-14 px-6 rounded-md transition-colors text-lg ${
              name ? 'bg-ink hover:bg-ink/90 text-paper' : 'bg-sunken text-ink/70 cursor-not-allowed'
            }`}
          >
            <Play className={`w-5 h-5 ${name ? 'text-gold' : ''}`} />
            Empezar
          </button>
          {!name && <p className="text-center text-[13px] text-ink/70 mt-2">Escribí tu nombre para empezar.</p>}
        </div>
      </div>
    </div>
  );
}

function SelectedMark() {
  return (
    <span className="absolute -bottom-0.5 -right-0.5 w-5 h-5 rounded-full bg-ink text-paper flex items-center justify-center">
      <Check size={12} />
    </span>
  );
}
